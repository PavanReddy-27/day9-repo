import Location from "../models/Location.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import Employee from "../models/Employee.js";
// Registering the Shift model is required so `.populate("shiftId")` in
// getEmployees/getEmployeeById can resolve it. Without this import Mongoose
// throws "Schema hasn't been registered for model 'Shift'" -> 500 on every
// employee list/detail request.
import "../models/Shift.js";
import PerformanceRecord from "../models/PerformanceRecord.js";
import ProductivityRecord from "../models/ProductivityRecord.js";
import { buildEmployeeScopeFilter } from "../middleware/authMiddleware.js";

// Attaches REAL performance (avg rating/KPI) and productivity (avg efficiency)
// to a list of lean employee docs, aggregated from their records. Returns the
// same array mutated in place. Keeps the list endpoint's response truthful
// instead of the UI showing hardcoded "Good"/85 placeholders.
const enrichWithScores = async (employees: any[]) => {
  if (!employees.length) return employees;
  const ids = employees.map((e) => e._id);
  const [perf, prod] = await Promise.all([
    PerformanceRecord.aggregate([
      { $match: { employeeId: { $in: ids } } },
      { $group: { _id: "$employeeId", avgRating: { $avg: "$rating" }, avgKpi: { $avg: "$kpiScore" } } },
    ]),
    ProductivityRecord.aggregate([
      { $match: { employeeId: { $in: ids } } },
      { $group: { _id: "$employeeId", avgEff: { $avg: { $ifNull: ["$productivityScore", "$efficiencyScore"] } } } },
    ]),
  ]);
  const perfMap = new Map(perf.map((p: any) => [String(p._id), p]));
  const prodMap = new Map(prod.map((p: any) => [String(p._id), p]));
  const label = (score: number) => (score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Average");
  for (const e of employees) {
    const p = perfMap.get(String(e._id));
    const pr = prodMap.get(String(e._id));
    // Prefer KPI score (0-100); fall back to rating (1-5) scaled to 100.
    const perfScore = p ? Math.round(p.avgKpi || (p.avgRating || 0) * 20) : 0;
    e.performanceScore = perfScore;
    e.performance = perfScore ? label(perfScore) : "Average";
    e.productivity = pr ? Math.round(pr.avgEff || 0) : 0;
  }
  return employees;
};

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ companyId: req.companyId, isActive: true } as any).lean();
    return res.status(200).json({ success: true, data: locations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const filter: any = { companyId: req.companyId };
    if (req.query.locationId) filter.locationId = req.query.locationId;
    const departments = await Department.find(filter as any).populate("locationId").lean();
    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const filter: any = { companyId: req.companyId };
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;
    const teams = await Team.find(filter as any).populate("departmentId").lean();
    return res.status(200).json({ success: true, data: teams });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const {
      search,
      locationId,
      departmentId,
      teamId,
      role,
      employmentStatus,
      riskLevel,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query: Record<string, any> = {};

    if (search) {
      // Escape regex special characters to prevent ReDoS attacks
      const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
      ];
    }

    // User-supplied narrowing filters first...
    if (locationId) query.locationId = locationId;
    if (departmentId) query.departmentId = departmentId;
    if (teamId) query.teamId = teamId;
    if (role) query.role = role;
    if (employmentStatus) query.employmentStatus = employmentStatus;
    if (riskLevel) query.riskLevel = riskLevel;

    // ...then the authoritative RBAC scope is applied LAST so it always wins.
    // This enforces company isolation and pins Manager->department,
    // Employee->self even if the client passes conflicting
    // locationId/departmentId query params.
    Object.assign(query, buildEmployeeScopeFilter(req.role, req.employee, req.companyId));

    const skip = (Math.max(1, parseInt(String(page))) - 1) * parseInt(String(limit));
    const sortOptions: any = { [String(sortBy)]: sortOrder === "asc" ? 1 : -1 };

    const [employees, total] = await Promise.all([
      Employee.find(query as any)
        .populate("locationId departmentId teamId managerId shiftId")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(String(limit)))
        .lean(),
      Employee.countDocuments(query as any),
    ]);

    await enrichWithScores(employees);

    return res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        totalPages: Math.ceil(total / parseInt(String(limit))),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee: any = await Employee.findOne({ _id: id, companyId: req.companyId } as any)
      .populate("locationId departmentId teamId managerId shiftId")
      .lean();

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee record not found." });
    }

    // Role scope check
    if (req.role === "Manager" && employee.departmentId._id.toString() !== req.employee.departmentId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access employee outside your department." });
    }

    if (req.role === "Employee" && employee._id.toString() !== req.employee._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access another employee's record." });
    }

    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
