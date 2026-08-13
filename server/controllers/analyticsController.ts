import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import PerformanceRecord from "../models/PerformanceRecord.js";
import ProductivityRecord from "../models/ProductivityRecord.js";

import EmployeeSkill from "../models/EmployeeSkill.js";



export const getWorkforceAnalytics = async (req, res) => {
  try {
    const filter = { companyId: new mongoose.Types.ObjectId(req.companyId) };

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

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        attritionRate: 4.2, // Percentage
        retentionRate: 95.8,
        riskDistribution: Object.fromEntries(riskDistribution.map((r) => [r._id || "Low", r.count])),
        workModeDistribution: Object.fromEntries(workModeDistribution.map((w) => [w._id || "Office", w.count])),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHiringAnalytics = async (req, res) => {
  try {
    const filter = { companyId: new mongoose.Types.ObjectId(req.companyId) };

    const hiringTrends = await Employee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$joinDate" } },
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
    const filter = { companyId: new mongoose.Types.ObjectId(req.companyId) };

    const attendanceStats = await AttendanceRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgWorkMinutes: { $avg: "$workDurationMinutes" },
          avgLateMinutes: { $avg: "$lateMinutes" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: attendanceStats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentAnalytics = async (req, res) => {
  try {
    const filter = { companyId: new mongoose.Types.ObjectId(req.companyId) };

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

    return res.status(200).json({
      success: true,
      data: deptStats.map((d) => ({ name: d._id, count: d.employeeCount })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSkillsAnalytics = async (req, res) => {
  try {
    const filter = { companyId: new mongoose.Types.ObjectId(req.companyId) };

    const skillGaps = await EmployeeSkill.aggregate([
      { $match: filter },
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

    return res.status(200).json({
      success: true,
      data: skillGaps.map((s) => ({ skill: s._id, avgProficiency: Math.round(s.avgProficiency * 10) / 10, totalEmployees: s.employeeCount })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPerformanceAnalytics = async (req, res) => {
  try {
    const filter = { companyId: new mongoose.Types.ObjectId(req.companyId) };

    const perfData = await PerformanceRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$period",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: perfData.map((p) => ({ period: p._id, avgRating: Math.round(p.avgRating * 100) / 100, totalReviews: p.totalReviews })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductivityAnalytics = async (req, res) => {
  try {
    const filter = { companyId: new mongoose.Types.ObjectId(req.companyId) };

    const productivity = await ProductivityRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$date",
          avgEfficiency: { $avg: "$efficiencyScore" },
          avgHours: { $avg: "$hoursLogged" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    return res.status(200).json({
      success: true,
      data: productivity.reverse().map((p) => ({ date: p._id, efficiency: Math.round(p.avgEfficiency), hoursLogged: Math.round(p.avgHours * 10) / 10 })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
