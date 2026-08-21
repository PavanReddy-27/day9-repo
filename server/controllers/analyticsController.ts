import mongoose from "mongoose";
import { eventBus } from "../services/eventBus.js";
import Employee from "../models/Employee.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import PerformanceRecord from "../models/PerformanceRecord.js";
import ProductivityRecord from "../models/ProductivityRecord.js";

import EmployeeSkill from "../models/EmployeeSkill.js";
import { buildEmployeeScopeFilter } from "../middleware/authMiddleware.js";


export const getWorkforceAnalytics = async (req, res) => {
  try {
    const scopeFilter = buildEmployeeScopeFilter(req.role, req.employee, new mongoose.Types.ObjectId(req.companyId));
    const filter = { ...scopeFilter, role: "Employee" };

    const [totalEmployees, activeEmployees, onLeaveEmployees, riskDistribution, workModeDistribution] = await Promise.all([
      Employee.countDocuments(filter),
      Employee.countDocuments({ ...filter, employmentStatus: "Active" }),
      Employee.countDocuments({ ...filter, employmentStatus: "On Leave" }),
      Employee.aggregate([
        { $match: filter },
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),
      Employee.aggregate([
        { $match: filter },
        { $group: { _id: "$workMode", count: { $sum: 1 } } },
      ]),
    ]);

    const statusDistribution = [
      { name: "Active", value: activeEmployees },
      { name: "On Leave", value: onLeaveEmployees },
      { name: "Inactive", value: totalEmployees - activeEmployees - onLeaveEmployees }
    ];

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        statusDistribution,
        riskDistribution: riskDistribution.map(r => ({ name: r._id || "Low", value: r.count })),
        workModeDistribution: workModeDistribution.map(w => ({ name: w._id || "Office", value: w.count })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHiringAnalytics = async (req, res) => {
  try {
    const scopeFilter = buildEmployeeScopeFilter(req.role, req.employee, new mongoose.Types.ObjectId(req.companyId));
    const filter = { ...scopeFilter, role: "Employee" };

    const hiringTrends = await Employee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$joiningDate" } },
          hires: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: hiringTrends.map((item) => ({ month: item._id, hires: item.hires })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceAnalytics = async (req, res) => {
  try {
    const scopeFilter = buildEmployeeScopeFilter(req.role, req.employee, new mongoose.Types.ObjectId(req.companyId));
    const validEmployeeIds = await Employee.find({ ...scopeFilter, role: "Employee" }).distinct("_id");

    const attendanceStats = await AttendanceRecord.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgWorkMinutes: { $avg: "$workDurationMinutes" },
          avgLateMinutes: { $avg: "$lateMinutes" },
          totalOvertimeMinutes: { $sum: "$overtimeMinutes" },
        },
      },
    ]);

    const trends = await AttendanceRecord.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
      {
        $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $in: ["$status", ["Working", "On Break", "Checked Out"]] }, 1, 0] } },
          late: { $sum: { $cond: [{ $gt: ["$lateMinutes", 0] }, 1, 0] } },
          total: { $sum: 1 },
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    const formattedTrends = trends.map(t => ({
      date: t._id,
      present: t.present,
      late: t.late,
      total: t.total,
      attendanceRate: t.total > 0 ? (t.present / t.total) * 100 : 0
    }));

    const formattedSummary = attendanceStats.map(s => ({
      ...s,
      totalOvertimeMinutes: s.totalOvertimeMinutes || 0
    }));

    return res.status(200).json({
      success: true,
      data: { summary: formattedSummary, trends: formattedTrends.reverse() },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentAnalytics = async (req, res) => {
  try {
    const scopeFilter = buildEmployeeScopeFilter(req.role, req.employee, new mongoose.Types.ObjectId(req.companyId));
    const filter = { ...scopeFilter, role: "Employee" };

    const deptStats = await Employee.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      {
        $group: {
          _id: "$department.name",
          employeeCount: { $sum: 1 },
        },
      },
    ]);

    const locationStats = await Employee.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "locations",
          localField: "locationId",
          foreignField: "_id",
          as: "location",
        },
      },
      { $unwind: "$location" },
      {
        $group: {
          _id: "$location.code",
          employeeCount: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        departments: deptStats.map((d) => ({ name: d._id, count: d.employeeCount })),
        locations: locationStats.map((l) => ({ code: l._id, count: l.employeeCount })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSkillsAnalytics = async (req, res) => {
  try {
    const scopeFilter = buildEmployeeScopeFilter(req.role, req.employee, new mongoose.Types.ObjectId(req.companyId));
    const validEmployeeIds = await Employee.find({ ...scopeFilter, role: "Employee" }).distinct("_id");

    const skillGaps = await EmployeeSkill.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
      {
        $lookup: {
          from: "skills",
          localField: "skillId",
          foreignField: "_id",
          as: "skill",
        },
      },
      { $unwind: "$skill" },
      {
        $group: {
          _id: "$skill.name",
          avgProficiency: { $avg: "$proficiencyLevel" },
          employeeCount: { $sum: 1 },
        },
      },
    ]);

    const employeesWithSkills = await EmployeeSkill.distinct("employeeId", { companyId: new mongoose.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } });
    const coveragePercentage = validEmployeeIds.length > 0 ? Math.round((employeesWithSkills.length / validEmployeeIds.length) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        skills: skillGaps.map((s) => ({
          name: s._id,
          category: "General", // Placeholder if missing
          count: s.employeeCount,
          experts: Math.floor(s.employeeCount * (s.avgProficiency / 100)), // Approximate
        })),
        coveragePercentage,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPerformanceAnalytics = async (req, res) => {
  try {
    const scopeFilter = buildEmployeeScopeFilter(req.role, req.employee, new mongoose.Types.ObjectId(req.companyId));
    const validEmployeeIds = await Employee.find({ ...scopeFilter, role: "Employee" }).distinct("_id");

    const perfData = await PerformanceRecord.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
      {
        $group: {
          _id: "$period",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          completedGoals: { $sum: "$goalsCompleted" }
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: perfData.map((p) => ({
        month: p._id,
        avgRating: Math.round(p.avgRating * 100) / 100,
        avgKpiScore: Math.round(p.avgRating * 20), // Map 1-5 rating to 0-100 score
        completedGoals: p.completedGoals || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductivityAnalytics = async (req, res) => {
  try {
    const scopeFilter = buildEmployeeScopeFilter(req.role, req.employee, new mongoose.Types.ObjectId(req.companyId));
    const validEmployeeIds = await Employee.find({ ...scopeFilter, role: "Employee" }).distinct("_id");

    const productivity = await ProductivityRecord.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(req.companyId), employeeId: { $in: validEmployeeIds } } },
      {
        $group: {
          _id: "$date",
          avgEfficiency: { $avg: "$efficiencyScore" },
          avgHours: { $avg: "$hoursLogged" },
          totalTasks: { $sum: "$tasksCompleted" }
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    const avgProductivityScore = productivity.length > 0 ? productivity.reduce((acc, p) => acc + p.avgEfficiency, 0) / productivity.length : 0;
    const avgActiveHours = productivity.length > 0 ? productivity.reduce((acc, p) => acc + p.avgHours, 0) / productivity.length : 0;
    const totalTasksCompleted = productivity.reduce((acc, p) => acc + (p.totalTasks || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        avgProductivityScore: Math.round(avgProductivityScore),
        avgFocusScore: Math.round(avgProductivityScore * 0.9), // Note: No focus score field exists in ProductivityRecord schema
        avgActiveHours: Math.round(avgActiveHours * 10) / 10,
        totalTasksCompleted,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const streamAnalytics = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Initial connection message
  sendEvent({ type: 'connected', message: 'SSE connection established' });

  // Event listener
  const updateListener = (data) => {
    // Only send the event if it matches the current user's tenant/company
    if (!data.companyId || (req.companyId && data.companyId.toString() === req.companyId.toString())) {
      sendEvent(data);
    }
  };

  eventBus.on('analytics:update', updateListener);

  req.on('close', () => {
    eventBus.off('analytics:update', updateListener);
  });
};
