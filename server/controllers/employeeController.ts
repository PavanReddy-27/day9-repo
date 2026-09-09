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
import { logComplianceViolation } from "../utils/compliance.js";
import { isTeamInManagerDepartment } from "../middleware/dataScopeMiddleware.js";

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
    if (req.query.companyId && String(req.query.companyId) !== String(req.companyId)) {
      await logComplianceViolation("CROSS_COMPANY_ACCESS", "Cross-company locations access attempt", "Critical", { requestedCompanyId: req.query.companyId, callerCompanyId: req.companyId }, req);
      return res.status(403).json({ success: false, message: "Forbidden: Cross-organization access denied" });
    }
    const locations = await Location.find({ companyId: req.companyId, isActive: true } as any).lean();
    return res.status(200).json({ success: true, data: locations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    if (req.query.companyId && String(req.query.companyId) !== String(req.companyId)) {
      await logComplianceViolation("CROSS_COMPANY_ACCESS", "Cross-company departments access attempt", "Critical", { requestedCompanyId: req.query.companyId, callerCompanyId: req.companyId }, req);
      return res.status(403).json({ success: false, message: "Forbidden: Cross-organization access denied" });
    }

    if (req.query.departmentId && ["Manager", "Team Lead", "Employee"].includes(req.role)) {
      const myDeptId = (req.employee?.departmentId?._id || req.employee?.departmentId)?.toString();
      if (myDeptId && String(req.query.departmentId) !== myDeptId) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access department outside your assigned department" });
      }
    }

    const filter: any = { companyId: req.companyId };
    if (req.query.locationId) filter.locationId = req.query.locationId;

    // Manager / Team Lead / Employee scoping
    if (["Manager", "Team Lead", "Employee"].includes(req.role)) {
      const myDeptId = req.employee?.departmentId?._id || req.employee?.departmentId;
      if (myDeptId) {
        filter._id = myDeptId;
      }
    }

    const departments = await Department.find(filter as any).populate("locationId").lean();
    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    if (req.query.companyId && String(req.query.companyId) !== String(req.companyId)) {
      await logComplianceViolation("CROSS_COMPANY_ACCESS", "Cross-company teams access attempt", "Critical", { requestedCompanyId: req.query.companyId, callerCompanyId: req.companyId }, req);
      return res.status(403).json({ success: false, message: "Forbidden: Cross-organization access denied" });
    }

    const filter: any = { companyId: req.companyId };

    if (req.role === "Manager") {
      const myDeptId = (req.employee?.departmentId?._id || req.employee?.departmentId)?.toString();
      if (req.query.departmentId && String(req.query.departmentId) !== myDeptId) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access department outside your assigned department" });
      }
      if (req.query.teamId) {
        const valid = await isTeamInManagerDepartment(req.query.teamId, myDeptId, req.companyId);
        if (!valid) {
          return res.status(403).json({ success: false, message: "Forbidden: Cannot access unrelated team" });
        }
        filter._id = req.query.teamId;
      }
      if (myDeptId) {
        filter.departmentId = myDeptId;
      }
    } else if (["Team Lead", "Employee"].includes(req.role)) {
      const myTeamId = (req.employee?.teamId?._id || req.employee?.teamId)?.toString();
      if (req.query.teamId && String(req.query.teamId) !== myTeamId) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access team outside your assigned team" });
      }
      if (myTeamId) {
        filter._id = myTeamId;
      }
    } else {
      if (req.query.departmentId) filter.departmentId = req.query.departmentId;
    }

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

    if (req.query.companyId && String(req.query.companyId) !== String(req.companyId)) {
      await logComplianceViolation("CROSS_COMPANY_ACCESS", "Cross-company employees access attempt", "Critical", { requestedCompanyId: req.query.companyId, callerCompanyId: req.companyId }, req);
      return res.status(403).json({ success: false, message: "Forbidden: Cross-organization access denied" });
    }

    // Role-based tampering checks
    if (req.role === "Manager") {
      const myDeptId = (req.employee?.departmentId?._id || req.employee?.departmentId)?.toString();
      if (departmentId && String(departmentId) !== myDeptId) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access department outside your assigned department" });
      }
      if (teamId) {
        const valid = await isTeamInManagerDepartment(teamId, myDeptId, req.companyId);
        if (!valid) {
          return res.status(403).json({ success: false, message: "Forbidden: Cannot access unrelated team" });
        }
      }
    } else if (req.role === "Team Lead") {
      const myTeamId = (req.employee?.teamId?._id || req.employee?.teamId)?.toString();
      if (teamId && String(teamId) !== myTeamId) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access team outside your assigned team" });
      }
    } else if (req.role === "Employee") {
      const myId = String(req.employee?._id);
      const myCode = req.employee?.employeeId ? String(req.employee.employeeId) : "";
      if (req.query.employeeId && String(req.query.employeeId) !== myId && String(req.query.employeeId) !== myCode) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access another employee's record." });
      }
      if (departmentId && String(departmentId) !== (req.employee?.departmentId?._id || req.employee?.departmentId)?.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access department outside your assigned department" });
      }
      if (teamId && String(teamId) !== (req.employee?.teamId?._id || req.employee?.teamId)?.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot access team outside your assigned team" });
      }
    }

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
      const crossCompanyLeak = await Employee.findById(id).lean();
      if (crossCompanyLeak) {
        await logComplianceViolation('CROSS_COMPANY_ACCESS', `Attempted cross-company employee access: ${id}`, 'Critical', { id }, req);
        return res.status(403).json({ success: false, message: "Forbidden: Cross-organization access denied" });
      }
      return res.status(404).json({ success: false, message: "Employee record not found." });
    }

    // Role scope check
    const empDeptId = (employee.departmentId?._id || employee.departmentId)?.toString();
    const myDeptId = (req.employee?.departmentId?._id || req.employee?.departmentId)?.toString();
    const empTeamId = (employee.teamId?._id || employee.teamId)?.toString();
    const myTeamId = (req.employee?.teamId?._id || req.employee?.teamId)?.toString();
    const isDirectReport = employee.managerId && String(employee.managerId) === String(req.employee?._id);

    if (req.role === "Manager" && !isDirectReport && empDeptId && myDeptId && empDeptId !== myDeptId) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access employee outside your department." });
    }

    if (req.role === "Team Lead" && empTeamId && myTeamId && empTeamId !== myTeamId && employee._id.toString() !== req.employee?._id?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access employee outside your assigned team." });
    }

    if (req.role === "Employee" && employee._id.toString() !== req.employee?._id?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access another employee's record." });
    }

    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
