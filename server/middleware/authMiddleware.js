import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_access_key_change_in_production_32char";

export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.query[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: `Invalid MongoDB ObjectId format: ${id}` });
    }
    next();
  };
};

export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication token missing or invalid." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash -refreshTokenHash");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User account inactive or session revoked." });
    }

    const employee = await Employee.findOne({ userId: user._id });
    if (!employee) {
      return res.status(401).json({ success: false, message: "Employee profile associated with user not found." });
    }

    req.user = user;
    req.employee = employee;
    req.companyId = user.companyId;
    req.role = user.role;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Access token expired.", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, message: "Invalid or tampered authentication token." });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role}' lacks permission for this action.`,
      });
    }
    next();
  };
};

export const applyRoleDataScope = (req, res, next) => {
  if (!req.employee) return next();

  const { role, departmentId, teamId, _id: employeeId } = req.employee;

  // Global company filter for multi-tenant isolation
  req.scopeFilter = { companyId: req.companyId };

  if (role === "Admin" || role === "HR") {
    // Unrestricted across company
  } else if (role === "Manager") {
    req.scopeFilter.departmentId = departmentId;
  } else if (role === "Team Lead") {
    req.scopeFilter.teamId = teamId;
  } else if (role === "Employee") {
    req.scopeFilter._id = employeeId;
  }

  next();
};
