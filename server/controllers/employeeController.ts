import Location from "../models/Location.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import Employee from "../models/Employee.js";
import { buildEmployeeScopeFilter } from "../middleware/authMiddleware.js";

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ companyId: req.companyId, isActive: true }).lean();
    return res.status(200).json({ success: true, data: locations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const filter = { companyId: req.companyId };
    if (req.query.locationId) filter.locationId = req.query.locationId;
    const departments = await Department.find(filter).populate("locationId").lean();
    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const filter = { companyId: req.companyId };
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;
    const teams = await Team.find(filter).populate("departmentId").lean();
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
      const searchRegex = new RegExp(search.trim(), "i");
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
    // Team Lead->team, Employee->self even if the client passes conflicting
    // locationId/departmentId/teamId query params.
    Object.assign(query, buildEmployeeScopeFilter(req.role, req.employee, req.companyId));

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate("locationId departmentId teamId managerId shiftId")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Employee.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ _id: id, companyId: req.companyId })
      .populate("locationId departmentId teamId managerId shiftId")
      .lean();

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee record not found." });
    }

    // Role scope check
    if (req.role === "Manager" && employee.departmentId._id.toString() !== req.employee.departmentId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access employee outside your department." });
    }
    if (req.role === "Team Lead" && employee.teamId._id.toString() !== req.employee.teamId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access employee outside your team." });
    }
    if (req.role === "Employee" && employee._id.toString() !== req.employee._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot access another employee's record." });
    }

    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
