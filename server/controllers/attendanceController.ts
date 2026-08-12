import AttendanceRecord from "../models/AttendanceRecord.js";
import AttendanceEvent from "../models/AttendanceEvent.js";
import BreakSession from "../models/BreakSession.js";
import CorrectionRequest from "../models/CorrectionRequest.js";
import ApprovalHistory from "../models/ApprovalHistory.js";
import Location from "../models/Location.js";

import IdempotencyRecord from "../models/IdempotencyRecord.js";

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
async function checkIdempotency(req, res, idempotencyKey) {
  if (!idempotencyKey) return null;
  const existing = await IdempotencyRecord.findOne({ companyId: req.companyId, idempotencyKey });
  if (existing) {
    return res.status(existing.responseStatus).json(existing.responseBody);
  }
  return null;
}

async function saveIdempotency(req, idempotencyKey, status, body) {
  if (!idempotencyKey) return;
  try {
    await IdempotencyRecord.create({
      companyId: req.companyId,
      idempotencyKey,
      requestPath: req.originalUrl,
      responseStatus: status,
      responseBody: body,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
  } catch {
    // Ignore duplicate key collision
  }
}

export const getAttendanceStatus = async (req, res) => {
  try {
    const today = getTodayDateStr();
    let record = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    });

    if (!record) {
      record = {
        status: "Not Checked In",
        date: today,
        workDurationMinutes: 0,
        breakDurationMinutes: 0,
      };
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { coordinates, gpsAccuracy, idempotencyKey } = req.body;

    const handled = await checkIdempotency(req, res, idempotencyKey);
    if (handled) return;

    const today = getTodayDateStr();
    let record = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    });

    if (record && record.status !== "Not Checked In") {
      const resp = { success: false, message: `Cannot check in: Current state is '${record.status}'.` };
      return res.status(400).json(resp);
    }

    // Geofence check
    const location = await Location.findById(req.employee.locationId);
    let distanceMeters = 0;
    const isGeofenced = true;

    if (location && coordinates && location.coordinates?.lat) {
      distanceMeters = calculateHaversineDistance(
        coordinates.lat,
        coordinates.lng,
        location.coordinates.lat,
        location.coordinates.lng
      );

      if (req.employee.workMode === "Office" && distanceMeters > location.radiusMeters) {
        const resp = {
          success: false,
          message: `Check-in rejected: Outside office geofence (${Math.round(distanceMeters)}m from office, max allowed ${location.radiusMeters}m).`,
        };
        return res.status(403).json(resp);
      }
    }

    const now = new Date();

    if (!record) {
      record = new AttendanceRecord({
        companyId: req.companyId,
        employeeId: req.employee._id,
        locationId: req.employee.locationId,
        date: today,
        checkInTime: now,
        status: "Working",
        shiftKind: "Regular",
      });
    } else {
      record.checkInTime = now;
      record.status = "Working";
    }

    await record.save();

    await AttendanceEvent.create({
      companyId: req.companyId,
      attendanceRecordId: record._id,
      employeeId: req.employee._id,
      eventType: "CHECK_IN",
      timestamp: now,
      locationCoordinates: coordinates,
      gpsAccuracy: gpsAccuracy || 0,
      isGeofenced,
      distanceMeters,
      idempotencyKey,
    });

    const responseBody = { success: true, message: "Check-in successful.", data: record };
    await saveIdempotency(req, idempotencyKey, 200, responseBody);
    return res.status(200).json(responseBody);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const startBreak = async (req, res) => {
  try {
    const { idempotencyKey } = req.body;
    const handled = await checkIdempotency(req, res, idempotencyKey);
    if (handled) return;

    const today = getTodayDateStr();
    const record = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    });

    if (!record || record.status === "Not Checked In") {
      return res.status(400).json({ success: false, message: "Cannot start break: Employee has not checked in yet." });
    }

    if (record.status === "On Break") {
      return res.status(400).json({ success: false, message: "Already on break." });
    }

    if (record.status === "Checked Out") {
      return res.status(400).json({ success: false, message: "Cannot start break: Shift has already ended." });
    }

    const now = new Date();
    record.status = "On Break";
    record.breakStartTime = now;
    await record.save();

    await BreakSession.create({
      companyId: req.companyId,
      attendanceRecordId: record._id,
      employeeId: req.employee._id,
      startTime: now,
    });

    const responseBody = { success: true, message: "Break started.", data: record };
    await saveIdempotency(req, idempotencyKey, 200, responseBody);
    return res.status(200).json(responseBody);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resumeWork = async (req, res) => {
  try {
    const { idempotencyKey } = req.body;
    const handled = await checkIdempotency(req, res, idempotencyKey);
    if (handled) return;

    const today = getTodayDateStr();
    const record = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    });

    if (!record || record.status !== "On Break") {
      return res.status(400).json({ success: false, message: "Must be in 'On Break' state to resume work." });
    }

    const now = new Date();
    const activeBreak = await BreakSession.findOne({
      companyId: req.companyId,
      attendanceRecordId: record._id,
      endTime: null,
    });

    if (activeBreak) {
      activeBreak.endTime = now;
      activeBreak.durationMinutes = Math.round((now - activeBreak.startTime) / (1000 * 60));
      await activeBreak.save();

      record.breakDurationMinutes = (record.breakDurationMinutes || 0) + activeBreak.durationMinutes;
    }

    record.status = "Working";
    record.breakStartTime = null;
    await record.save();

    const responseBody = { success: true, message: "Resumed work.", data: record };
    await saveIdempotency(req, idempotencyKey, 200, responseBody);
    return res.status(200).json(responseBody);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { idempotencyKey } = req.body;
    const handled = await checkIdempotency(req, res, idempotencyKey);
    if (handled) return;

    const today = getTodayDateStr();
    const record = await AttendanceRecord.findOne({
      companyId: req.companyId,
      employeeId: req.employee._id,
      date: today,
    });

    if (!record || record.status === "Not Checked In") {
      return res.status(400).json({ success: false, message: "Cannot check out: Employee has not checked in yet." });
    }

    if (record.status === "Checked Out") {
      return res.status(400).json({ success: false, message: "Cannot check out: Employee has already checked out." });
    }

    const now = new Date();

    // If checked out while on break, finalize break session
    if (record.status === "On Break") {
      const activeBreak = await BreakSession.findOne({
        companyId: req.companyId,
        attendanceRecordId: record._id,
        endTime: null,
      });
      if (activeBreak) {
        activeBreak.endTime = now;
        activeBreak.durationMinutes = Math.round((now - activeBreak.startTime) / (1000 * 60));
        await activeBreak.save();
        record.breakDurationMinutes = (record.breakDurationMinutes || 0) + activeBreak.durationMinutes;
      }
    }

    record.checkOutTime = now;
    record.status = "Checked Out";
    record.breakStartTime = null;

    const totalElapsedMinutes = Math.round((now - record.checkInTime) / (1000 * 60));
    const netWorkMinutes = Math.max(0, totalElapsedMinutes - (record.breakDurationMinutes || 0));
    record.workDurationMinutes = netWorkMinutes;
    record.workingHours = Number((netWorkMinutes / 60).toFixed(2));

    await record.save();

    await AttendanceEvent.create({
      companyId: req.companyId,
      attendanceRecordId: record._id,
      employeeId: req.employee._id,
      eventType: "CHECK_OUT",
      timestamp: now,
      idempotencyKey,
    });

    const responseBody = {
      success: true,
      message: `Check-out successful. Total worked hours: ${record.workingHours} hrs.`,
      data: record,
    };
    await saveIdempotency(req, idempotencyKey, 200, responseBody);
    return res.status(200).json(responseBody);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const filter = { companyId: req.companyId, ...req.scopeFilter };
    if (req.query.startDate && req.query.endDate) {
      filter.date = { $gte: req.query.startDate, $lte: req.query.endDate };
    }

    const records = await AttendanceRecord.find(filter)
      .populate("employeeId locationId")
      .sort({ date: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCorrection = async (req, res) => {
  try {
    const { attendanceRecordId, date, requestedCheckIn, requestedCheckOut, reason } = req.body;

    const correction = await CorrectionRequest.create({
      companyId: req.companyId,
      employeeId: req.employee._id,
      attendanceRecordId,
      date,
      requestedCheckIn,
      requestedCheckOut,
      reason,
      status: "Pending",
    });

    await ApprovalHistory.create({
      companyId: req.companyId,
      correctionRequestId: correction._id,
      action: "Submitted",
      performedBy: req.employee._id,
      previousStatus: "None",
      newStatus: "Pending",
      comments: reason,
    });

    return res.status(201).json({ success: true, data: correction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCorrections = async (req, res) => {
  try {
    const filter = { companyId: req.companyId };
    if (req.role === "Employee") {
      filter.employeeId = req.employee._id;
    }

    const corrections = await CorrectionRequest.find(filter)
      .populate("employeeId reviewedBy")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: corrections });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const correction = await CorrectionRequest.findOne({ _id: id, companyId: req.companyId });

    if (!correction || correction.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Correction request not found or already processed." });
    }

    correction.status = "Approved";
    correction.reviewedBy = req.employee._id;
    correction.reviewedAt = new Date();
    await correction.save();

    // Update original attendance record
    const record = await AttendanceRecord.findById(correction.attendanceRecordId);
    if (record) {
      record.checkInTime = correction.requestedCheckIn;
      record.checkOutTime = correction.requestedCheckOut;
      record.status = "Checked Out";
      await record.save();
    }

    await ApprovalHistory.create({
      companyId: req.companyId,
      correctionRequestId: correction._id,
      action: "Approved",
      performedBy: req.employee._id,
      previousStatus: "Pending",
      newStatus: "Approved",
      comments: req.body.comments || "Approved by Manager/HR",
    });

    return res.status(200).json({ success: true, data: correction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const correction = await CorrectionRequest.findOne({ _id: id, companyId: req.companyId });

    if (!correction || correction.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Correction request not found or already processed." });
    }

    correction.status = "Rejected";
    correction.reviewedBy = req.employee._id;
    correction.reviewedAt = new Date();
    await correction.save();

    await ApprovalHistory.create({
      companyId: req.companyId,
      correctionRequestId: correction._id,
      action: "Rejected",
      performedBy: req.employee._id,
      previousStatus: "Pending",
      newStatus: "Rejected",
      comments: req.body.comments || "Rejected",
    });

    return res.status(200).json({ success: true, data: correction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
