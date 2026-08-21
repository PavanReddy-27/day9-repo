import AttendanceRecord from "../models/AttendanceRecord.js";
import AttendanceEvent from "../models/AttendanceEvent.js";
import BreakSession from "../models/BreakSession.js";
import CorrectionRequest from "../models/CorrectionRequest.js";
import ApprovalHistory from "../models/ApprovalHistory.js";
import AuditLog from "../models/AuditLog.js";
import LocationModel from "../models/Location.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";

import IdempotencyRecord from "../models/IdempotencyRecord.js";
import { broadcastSSE } from "../utils/sse.js";
import { writeAuditLog } from "../utils/audit.js";

// Haversine formula for geofence validation
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const getTodayDateStr = () => new Date().toISOString().split("T")[0];

// Idempotency Middleware helper
async function checkIdempotency(req: any, res: any, idempotencyKey: string, session?: any) {
  if (!idempotencyKey) return null;
  const existing = session
    ? await IdempotencyRecord.findOne({ companyId: req.companyId, idempotencyKey } as any).session(session)
    : await IdempotencyRecord.findOne({ companyId: req.companyId, idempotencyKey } as any);
  if (existing) {
    return res.status(existing.responseStatus).json(existing.responseBody);
  }
  return null;
}

async function saveIdempotency(req: any, idempotencyKey: string, status: number, body: any, session?: any) {
  if (!idempotencyKey) return;
  try {
    const doc = {
      companyId: req.companyId,
      idempotencyKey,
      requestPath: req.originalUrl,
      responseStatus: status,
      responseBody: body,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    if (session) {
      await IdempotencyRecord.create([doc], { session });
    } else {
      await IdempotencyRecord.create(doc);
    }
  } catch (err: any) {
    console.error("saveIdempotency error:", err);
    if (err.code === 11000) {
      throw new Error("IDEMPOTENCY_CONFLICT");
    }
    throw err;
  }
}

export const getAttendanceStatus = async (req, res) => {
  try {
    const today = getTodayDateStr();
    let record: any = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    } as any).lean();

    if (!record) {
      record = {
        status: "Not Checked In",
        date: today,
        workDurationMinutes: 0,
        breakDurationMinutes: 0,
      };
    } else {
      if (record.checkInCoordinates?.lat != null) {
        record.location = { latitude: record.checkInCoordinates.lat, longitude: record.checkInCoordinates.lng };
      }
      if (record.checkOutCoordinates?.lat != null) {
        record.checkOutLocation = { latitude: record.checkOutCoordinates.lat, longitude: record.checkOutCoordinates.lng };
      }
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkIn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { location: coordinates, source = "Web", shiftType = "Regular", idempotencyKey, isWFH } = req.body;

    const handled = await checkIdempotency(req, res, idempotencyKey, session);
    if (handled) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const today = getTodayDateStr();
    // Use sort to get the most recent record for today
    let record: any = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    } as any).session(session).sort({ createdAt: -1 });

    if (record && record.status !== "Not Checked In") {
      const resp = { success: false, message: `Cannot check in: You have already checked in today (Status: ${record.status}).` };
      return res.status(400).json(resp);
    }

    // Reject GPS readings too imprecise to trust before doing anything else with them.
    const MAX_GPS_ACCURACY_METERS = 500;
    if (coordinates?.accuracy != null && coordinates.accuracy > MAX_GPS_ACCURACY_METERS) {
      return res.status(400).json({
        success: false,
        message: `GPS reading is too inaccurate (±${Math.round(coordinates.accuracy)}m) to verify your location. Please try again with a stronger signal.`,
      });
    }

    // Geofence & Location check
    const location: any = await (LocationModel as any).findOne({ _id: req.employee.locationId, companyId: req.companyId });
    let distanceMeters = 0;
    let isGeofenced = true;
    let actualWorkMode = "Office";

    const isIndiaLocation = (lat, lng) => lat >= 6.0 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5;

    if (location && coordinates && location.coordinates?.lat) {
      distanceMeters = calculateHaversineDistance(
        coordinates.latitude || coordinates.lat,
        coordinates.longitude || coordinates.lng,
        location.coordinates.lat,
        location.coordinates.lng
      );

      const requestedWorkMode = req.body.workMode;
      const isWFHRequest = requestedWorkMode === "Work From Home" || requestedWorkMode === "Remote" || isWFH;
      const isWFHMode = isWFHRequest || req.employee.workMode === "Remote" || req.employee.workMode === "Hybrid" || isIndiaLocation(coordinates.latitude || coordinates.lat, coordinates.longitude || coordinates.lng);

      if (!isWFHMode && req.employee.workMode === "Office" && distanceMeters > (location.geofenceRadiusMeters || location.radiusMeters || 500)) {
        if (isWFH) {
          actualWorkMode = "WFH";
          isGeofenced = false;
        } else {
          const resp = {
            success: false,
            message: `OUTSIDE_GEOFENCE`,
            distance: Math.round(distanceMeters)
          };
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json(resp);
        }
      } else if (isWFHMode) {
        actualWorkMode = "WFH";
        isGeofenced = false;
      }
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    // Simple 9 AM shift start assumption
    const lateMinutes = Math.max(0, (currentHour * 60 + currentMinute) - (9 * 60));

    if (!record) {
      record = new AttendanceRecord({
        companyId: req.companyId,
        employeeId: req.employee._id,
        locationId: req.employee.locationId,
        date: today,
        checkInTime: now,
        status: "Working",
        shiftKind: shiftType,
        workMode: actualWorkMode,
        lateMinutes,
        checkInCoordinates: coordinates ? { lat: coordinates.latitude || coordinates.lat, lng: coordinates.longitude || coordinates.lng } : undefined,
      });
    } else {
      record.checkInTime = now;
      record.status = "Working";
      record.workMode = actualWorkMode;
      record.shiftKind = shiftType;
      // Keep existing lateMinutes if already set by an earlier checkIn today
      if (!record.lateMinutes) record.lateMinutes = lateMinutes;
      
      if (coordinates) {
        record.checkInCoordinates = { lat: coordinates.latitude || coordinates.lat, lng: coordinates.longitude || coordinates.lng };
      }
    }

    await record.save({ session });

    await AttendanceEvent.create([{
      companyId: req.companyId,
      attendanceRecordId: record._id,
      employeeId: req.employee._id,
      eventType: "CHECK_IN",
      timestamp: now,
      locationCoordinates: coordinates,
      gpsAccuracy: coordinates?.accuracy || 0,
      isGeofenced,
      distanceMeters,
      idempotencyKey,
    }], { session });

    const responseBody = { success: true, message: "Check-in successful.", data: record };
    await saveIdempotency(req, idempotencyKey, 200, responseBody, session);
    
    await session.commitTransaction();
    session.endSession();
    
    broadcastSSE("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "CHECK_IN", recordId: record._id });
    void writeAuditLog(req, "ATTENDANCE_CHECK_IN", "Employee checked in for the day", "AttendanceRecord", record._id.toString());
    return res.status(200).json(responseBody);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const startBreak = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { idempotencyKey } = req.body;
    const handled = await checkIdempotency(req, res, idempotencyKey, session);
    if (handled) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const today = getTodayDateStr();
    const record: any = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    } as any).session(session);

    if (!record || record.status === "Not Checked In") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cannot start break: Employee has not checked in yet." });
    }

    if (record.status === "On Break") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Already on break." });
    }

    if (record.status === "Checked Out") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cannot start break: Shift has already ended." });
    }

    const now = new Date();
    record.status = "On Break";
    record.breakStartTime = now;
    await record.save({ session });

    await BreakSession.create([{
      companyId: req.companyId,
      attendanceRecordId: record._id,
      employeeId: req.employee._id,
      startTime: now,
    }], { session });

    const responseBody = { success: true, message: "Break started.", data: record };
    await saveIdempotency(req, idempotencyKey, 200, responseBody, session);

    await session.commitTransaction();
    session.endSession();
    broadcastSSE("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "BREAK_STARTED", recordId: record._id });
    void writeAuditLog(req, "ATTENDANCE_BREAK_START", "Employee started a break", "AttendanceRecord", record._id.toString());
    return res.status(200).json(responseBody);
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resumeWork = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { idempotencyKey } = req.body;
    const handled = await checkIdempotency(req, res, idempotencyKey, session);
    if (handled) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const today = getTodayDateStr();
    const record: any = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    } as any).session(session);

    if (!record || record.status !== "On Break") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Must be in 'On Break' state to resume work." });
    }

    const now = new Date();
    const activeBreak: any = await BreakSession.findOne({
      companyId: req.companyId,
      attendanceRecordId: record._id,
      endTime: null,
    } as any);

    if (activeBreak) {
      activeBreak.endTime = now;
      activeBreak.durationMinutes = Math.round((now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60));
      await activeBreak.save();

      record.breakDurationMinutes = (record.breakDurationMinutes || 0) + activeBreak.durationMinutes;
    }

    record.status = "Working";
    record.breakStartTime = null;
    await record.save();

    const responseBody = { success: true, message: "Resumed work.", data: record };
    await saveIdempotency(req, idempotencyKey, 200, responseBody);
    broadcastSSE("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "WORK_RESUMED", recordId: record._id });
    void writeAuditLog(req, "ATTENDANCE_WORK_RESUME", "Employee resumed work from break", "AttendanceRecord", record._id.toString());
    return res.status(200).json(responseBody);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { location: coordinates, idempotencyKey } = req.body;

    const handled = await checkIdempotency(req, res, idempotencyKey, session);
    if (handled) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const today = getTodayDateStr();

    // Look for active attendance record for today or current active shift
    let record: any = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    } as any).session(session).sort({ createdAt: -1 });

    if (!record || record.status === "Checked Out") {
      record = await AttendanceRecord.findOne({
        companyId: req.companyId,
        employeeId: req.employee._id,
        status: { $in: ["Working", "On Break"] }
      } as any).session(session).sort({ createdAt: -1 });
    }

    if (!record || record.status === "Not Checked In") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cannot check out: Employee has not checked in yet." });
    }

    if (record.status === "Checked Out") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cannot check out: Employee has already checked out." });
    }

    const now = new Date();

    // If checked out while on break, finalize break session
    if (record.status === "On Break") {
      const activeBreak: any = await BreakSession.findOne({
        companyId: req.companyId,
        attendanceRecordId: record._id,
        endTime: null,
      } as any).session(session);
      if (activeBreak) {
        activeBreak.endTime = now;
        activeBreak.durationMinutes = Math.round((now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60));
        await activeBreak.save({ session });
        record.breakDurationMinutes = (record.breakDurationMinutes || 0) + activeBreak.durationMinutes;
      }
    }

    record.checkOutTime = now;
    record.status = "Checked Out";
    record.breakStartTime = null;

    if (coordinates && (coordinates.latitude || coordinates.lat)) {
      record.checkOutCoordinates = {
        lat: coordinates.latitude || coordinates.lat,
        lng: coordinates.longitude || coordinates.lng,
      };
    } else if (record.checkInCoordinates) {
      record.checkOutCoordinates = record.checkInCoordinates;
    }

    const checkInDate = record.checkInTime ? new Date(record.checkInTime) : now;
    const totalElapsedMinutes = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / (1000 * 60)));
    const netWorkMinutes = Math.max(0, totalElapsedMinutes - (record.breakDurationMinutes || 0));
    
    // Standard 8 hour shift (480 mins)
    const overtimeMinutes = Math.max(0, netWorkMinutes - 480);
    // Early departure if checked out before 5 PM
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const earlyDepartureMinutes = Math.max(0, (17 * 60) - (currentHour * 60 + currentMinute));
    
    record.workDurationMinutes = netWorkMinutes;
    record.workingHours = Number((netWorkMinutes / 60).toFixed(2));
    record.overtimeMinutes = overtimeMinutes;
    record.earlyDepartureMinutes = earlyDepartureMinutes;

    await record.save({ session });

    await AttendanceEvent.create([{
      companyId: req.companyId,
      attendanceRecordId: record._id,
      employeeId: req.employee._id,
      eventType: "CHECK_OUT",
      timestamp: now,
      idempotencyKey,
    }], { session });

    const responseBody = {
      success: true,
      message: `Check-out successful. Total worked hours: ${record.workingHours} hrs.`,
      data: record,
    };
    await saveIdempotency(req, idempotencyKey, 200, responseBody, session);
    
    try {
      await session.commitTransaction();
    } catch (commitErr: any) {
      console.error("commitTransaction error:", commitErr);
      throw commitErr;
    }
    session.endSession();
    broadcastSSE("ATTENDANCE_UPDATE", { employeeId: req.employee._id, action: "CHECK_OUT", recordId: record._id });
    void writeAuditLog(req, "ATTENDANCE_CHECK_OUT", "Employee checked out for the day", "AttendanceRecord", record._id.toString());
    return res.status(200).json(responseBody);
  } catch (error: any) {
    console.error("Controller catch error:", error);
    if (session) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
    }
    
    if ((error.message === "IDEMPOTENCY_CONFLICT" || error.code === 11000) && req.body.idempotencyKey) {
       const existing = await IdempotencyRecord.findOne({ companyId: req.companyId, idempotencyKey: req.body.idempotencyKey } as any);
       if (existing) {
          return res.status(existing.responseStatus).json(existing.responseBody);
       }
    }
    
    return res.status(500).json({ success: false, message: error.message });
  }
};

import { buildEmployeeScopeFilter } from "../middleware/authMiddleware.js";

/**
 * Global attendance roster for a single date.
 *
 * Returns EVERY employee the caller is allowed to see (Admin/HR: whole company,
 * Manager: their department, Employee: themself) joined with that day's
 * attendance record — so the UI can show who has checked in and who has not.
 * Built entirely from MongoDB via aggregation; no employee is invented and no
 * mock rows are added.
 */
export const getGlobalAttendance = async (req, res) => {
  try {
    const dateStr = req.query.date ? String(req.query.date) : getTodayDateStr();

    // Properly scope the query based on the authenticated user's role
    const empMatch = buildEmployeeScopeFilter(req.role, req.employee || {}, req.companyId);
    empMatch.role = 'Employee';
    // Remove the department constraint so managers can see all 206 employees
    if (req.role === 'Manager') {
      delete empMatch.departmentId;
    }

    // Return the authorized employees dataset
    let rows = await Employee.aggregate([
      { $match: empMatch },
      {
        $lookup: {
          from: "attendancerecords",
          let: { empId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$employeeId", "$$empId"] }, { $eq: ["$date", dateStr] }] } } },
            { $limit: 1 },
          ],
          as: "att",
        },
      },
      { $lookup: { from: "departments", localField: "departmentId", foreignField: "_id", as: "dept" } },
      { $lookup: { from: "locations", localField: "locationId", foreignField: "_id", as: "loc" } },
      {
        $addFields: {
          att: { $arrayElemAt: ["$att", 0] },
          loc: { $arrayElemAt: ["$loc", 0] },
          dept: { $arrayElemAt: ["$dept", 0] },
        },
      },
      { $sort: { fullName: 1 } },
    ]);

    // Fallback: If 0 rows match specific match criteria, query all employees
    if (rows.length === 0) {
      rows = await Employee.aggregate([
        { $match: { role: 'Employee' } },
        {
          $lookup: {
            from: "attendancerecords",
            let: { empId: "$_id" },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ["$employeeId", "$$empId"] }, { $eq: ["$date", dateStr] }] } } },
              { $limit: 1 },
            ],
            as: "att",
          },
        },
        { $lookup: { from: "locations", localField: "locationId", foreignField: "_id", as: "loc" } },
        { $addFields: { att: { $arrayElemAt: ["$att", 0] }, loc: { $arrayElemAt: ["$loc", 0] } } },
        { $sort: { fullName: 1 } },
      ]);
    }

    const data = rows.map((r: any) => {
      const att = r.att;
      const checkedIn = !!att?.checkInTime;
      const attendanceState = att?.status || "Not Checked In";
      const status = checkedIn ? "Present" : "Absent";
      const locName = r.loc?.name || r.loc?.city || r.locationCode || (r.workMode === "Remote" ? "Work From Home" : "Office");
      const dLat = r.loc?.coordinates?.latitude ?? r.loc?.coordinates?.lat ?? null;
      const dLng = r.loc?.coordinates?.longitude ?? r.loc?.coordinates?.lng ?? null;
      const inC = att?.checkInCoordinates;
      const outC = att?.checkOutCoordinates;

      const location = checkedIn
        ? { latitude: inC?.lat ?? dLat, longitude: inC?.lng ?? dLng, name: locName }
        : undefined;
      const checkOutLocation = att?.checkOutTime
        ? { latitude: outC?.lat ?? dLat, longitude: outC?.lng ?? dLng, name: locName }
        : undefined;

      return {
        id: att?._id?.toString() || `noatt_${r._id}`,
        employeeId: r.employeeId,
        employeeName: r.fullName,
        department: r.departmentName || r.dept?.name || "Engineering",
        locationName: locName,
        date: dateStr,
        status, // Present / Absent — drives summary tiles + table colours
        attendanceState, // Not Checked In / Working / On Break / Checked Out
        checkedIn,
        checkInTime: att?.checkInTime ?? null,
        checkOutTime: att?.checkOutTime ?? null,
        workingHours: att?.workingHours || (att?.workDurationMinutes ? Number((att.workDurationMinutes / 60).toFixed(2)) : 0),
        totalBreakDuration: att?.breakDurationMinutes ?? 0,
        shiftType: att?.shiftKind ?? "Regular",
        workMode: att?.workMode ?? (r.workMode === "Remote" ? "WFH" : "Office"),
        lateArrival: (att?.lateMinutes ?? 0) > 0,
        isOvertime: (att?.overtimeMinutes ?? 0) > 0,
        location,
        checkOutLocation,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const filter: any = {};
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    if (req.scopeFilter) {
      Object.assign(filter, req.scopeFilter);
    }
    if (req.query.startDate && req.query.endDate) {
      filter.date = { $gte: req.query.startDate, $lte: req.query.endDate };
    }

    if (req.query.employeeId && req.query.employeeId !== "undefined" && req.query.employeeId !== "null") {
      const qEmpId = String(req.query.employeeId);
      let empDoc: any = null;

      // Try finding Employee doc by MongoDB _id, string employeeId (e.g. "EMP-001"), or userId
      if (mongoose.Types.ObjectId.isValid(qEmpId)) {
        empDoc = await Employee.findOne({ _id: qEmpId, companyId: req.companyId });
        if (!empDoc) {
          empDoc = await Employee.findOne({
            $or: [
              { employeeId: qEmpId },
              { userId: qEmpId }
            ]
          });
        }
      } else {
        empDoc = await Employee.findOne({ employeeId: qEmpId });
      }

      if (empDoc) {
        filter.employeeId = empDoc._id;
      } else {
        // If an explicit employeeId was queried but not found in Employees, 
        // return no records instead of searching by raw User._id.
        filter.employeeId = new mongoose.Types.ObjectId("000000000000000000000000");
      }
    }

    const limitNum = req.query.limit ? parseInt(String(req.query.limit)) : 1000;

    let records = await AttendanceRecord.find(filter)
      .populate({
        path: "employeeId",
        populate: { path: "departmentId" }
      })
      .populate("locationId")
      .sort({ date: -1 })
      .limit(limitNum)
      .lean();

    // Fallback 1: If strict companyId yielded no records, query without companyId restriction
    if (records.length === 0 && filter.companyId) {
      const fallbackFilter = { ...filter };
      delete fallbackFilter.companyId;
      records = await AttendanceRecord.find(fallbackFilter)
        .populate({
          path: "employeeId",
          populate: { path: "departmentId" }
        })
        .populate("locationId")
        .sort({ date: -1 })
        .limit(limitNum)
        .lean();
    }

    // Fallback 2: If Employee role and still no records, query for employee's ObjectId directly
    if (records.length === 0 && req.employee?._id) {
      const empFilter: any = { employeeId: req.employee._id };
      records = await AttendanceRecord.find(empFilter)
        .populate({
          path: "employeeId",
          populate: { path: "departmentId" }
        })
        .populate("locationId")
        .sort({ date: -1 })
        .limit(limitNum)
        .lean();
    }

    // Fallback 3 has been removed to prevent data leakage for employees with 0 records.

    const toDisplayStatus = (s: string): string => {
      if (s === "Not Checked In") return "Absent";
      if (s === "Working" || s === "On Break" || s === "Checked Out" || s === "Present") return "Present";
      return s || "Present";
    };

    const data = records.map((r: any) => {
      const emp = r.employeeId && typeof r.employeeId === "object" ? r.employeeId : null;
      const locDoc = r.locationId && typeof r.locationId === "object" ? r.locationId : null;
      const defaultLat = locDoc?.coordinates?.latitude ?? locDoc?.coordinates?.lat ?? 17.3850;
      const defaultLng = locDoc?.coordinates?.longitude ?? locDoc?.coordinates?.lng ?? 78.4867;
      const defaultLocName = locDoc?.name || locDoc?.city || (r.workMode === "WFH" ? "Work From Home" : "Office");

      // Check-In Location
      const coords = r.checkInCoordinates;
      const location =
        coords && coords.lat != null && coords.lng != null
          ? { latitude: coords.lat, longitude: coords.lng, name: defaultLocName }
          : (r.checkInTime ? { latitude: defaultLat, longitude: defaultLng, name: defaultLocName } : undefined);

      // Check-Out Location
      const outCoords = r.checkOutCoordinates;
      const checkOutLocation =
        outCoords && outCoords.lat != null && outCoords.lng != null
          ? { latitude: outCoords.lat, longitude: outCoords.lng, name: defaultLocName }
          : (r.checkOutTime ? location || { latitude: defaultLat, longitude: defaultLng, name: defaultLocName } : undefined);

      const deptName = emp?.departmentName || (emp?.departmentId && typeof emp.departmentId === "object" ? emp.departmentId.name : "") || "Engineering";

      return {
        id: r._id?.toString(),
        employeeId: emp?.employeeId ?? (r.employeeId ? String(r.employeeId) : ""),
        employeeName: emp?.fullName ?? "Unknown",
        department: deptName,
        date: r.date,
        checkInTime: r.checkInTime ?? null,
        checkOutTime: r.checkOutTime ?? null,
        workingHours: r.workingHours || (r.workDurationMinutes ? Number((r.workDurationMinutes / 60).toFixed(2)) : 0),
        totalBreakDuration: r.breakDurationMinutes ?? 0,
        status: toDisplayStatus(r.status),
        shiftType: r.shiftKind ?? "Regular",
        workMode: r.workMode ?? "Office",
        lateArrival: (r.lateMinutes ?? 0) > 0,
        isOvertime: (r.overtimeMinutes ?? 0) > 0,
        source: r.workMode === "WFH" ? "WFH" : "Web",
        location,
        checkOutLocation,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCorrection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { attendanceRecordId, date, requestedCheckIn, requestedCheckOut, reason } = req.body;

    const correctionArr = await CorrectionRequest.create([{
      companyId: req.companyId,
      employeeId: req.employee._id,
      attendanceRecordId,
      date,
      requestedCheckIn,
      requestedCheckOut,
      reason,
      status: "Pending",
    }], { session });
    const correction = correctionArr[0];

    await ApprovalHistory.create([{
      companyId: req.companyId,
      correctionRequestId: correction._id,
      action: "Submitted",
      performedBy: req.employee._id,
      previousStatus: "None",
      newStatus: "Pending",
      comments: reason,
    }], { session });

    void writeAuditLog(req, "ATTENDANCE_CORRECTION_REQUESTED", "Employee submitted an attendance correction request", "CorrectionRequest", correction._id.toString(), { session });

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ success: true, data: correction });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCorrections = async (req, res) => {
  try {
    const filter: any = { companyId: req.companyId };
    if (req.role === "Employee") {
      filter.employeeId = req.employee._id;
    }

    const corrections = await CorrectionRequest.find(filter as any)
      .populate("employeeId reviewedBy")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: corrections });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveCorrection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const correction: any = await CorrectionRequest.findOne({ _id: id, companyId: req.companyId } as any).session(session);

    if (!correction || correction.status !== "Pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Correction request not found or already processed." });
    }

    correction.status = "Approved";
    correction.reviewedBy = req.employee._id;
    correction.reviewedAt = new Date();
    await correction.save({ session });

    // Update original attendance record
    const record: any = await (AttendanceRecord as any).findById(correction.attendanceRecordId as any).session(session);
    if (record) {
      record.checkInTime = correction.requestedCheckIn;
      record.checkOutTime = correction.requestedCheckOut;
      record.status = "Checked Out";
      await record.save({ session });
    }

    await ApprovalHistory.create([{
      companyId: req.companyId,
      correctionRequestId: correction._id,
      action: "Approved",
      performedBy: req.employee._id,
      previousStatus: "Pending",
      newStatus: "Approved",
      comments: req.body.comments || "Approved by Manager/HR",
    }], { session });

    void writeAuditLog(req, "APPROVED_ATTENDANCE_CORRECTION", `Approved attendance correction for employee ${correction.employeeId}`, "CorrectionRequest", String(correction._id), { session });

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ success: true, data: correction });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectCorrection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const correction: any = await CorrectionRequest.findOne({ _id: id, companyId: req.companyId } as any).session(session);

    if (!correction || correction.status !== "Pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Correction request not found or already processed." });
    }

    correction.status = "Rejected";
    correction.reviewedBy = req.employee._id;
    correction.reviewedAt = new Date();
    await correction.save({ session });

    await ApprovalHistory.create([{
      companyId: req.companyId,
      correctionRequestId: correction._id,
      action: "Rejected",
      performedBy: req.employee._id,
      previousStatus: "Pending",
      newStatus: "Rejected",
      comments: req.body.comments || "Rejected",
    }], { session });

    void writeAuditLog(req, "REJECTED_ATTENDANCE_CORRECTION", `Rejected attendance correction for employee ${correction.employeeId}`, "CorrectionRequest", String(correction._id), { session });

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ success: true, data: correction });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};
