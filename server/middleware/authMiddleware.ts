import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';

import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth } from '../models/User.js';

const findUserById = async (id: string) => {
  let user = await AdminAuth.findById(id);
  if (user) return user;
  user = await HRAuth.findById(id);
  if (user) return user;
  user = await ManagerAuth.findById(id);
  if (user) return user;
  user = await EmployeeAuth.findById(id);
  return user;
};

export const authenticateJWT = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    req.user = decoded; // { id, role }
    
    // Also set employee/company info for controllers
    const userDoc = await findUserById(decoded.id) as any;
    if (userDoc) {
      let employeeDoc = await Employee.findOne({ employeeId: userDoc.employeeId });
      
      // Fallback for DEV accounts that don't have a matching Employee record
      if (!employeeDoc && userDoc.employeeId.startsWith('DEV_')) {
        employeeDoc = await Employee.findOne({});
      }

      if (employeeDoc) {
        req.employee = {
          _id: employeeDoc._id,
          locationId: employeeDoc.locationId,
          departmentId: employeeDoc.departmentId,
          teamId: employeeDoc.teamId,
          workMode: employeeDoc.workMode,
        };
      } else {
        // Just use a deterministic ObjectId so it doesn't crash on CastError
        req.employee = { _id: new mongoose.Types.ObjectId("000000000000000000000000") };
      }
      req.companyId = employeeDoc ? employeeDoc.companyId : userDoc.companyId;
      req.role = userDoc.role;
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

export const applyRoleDataScope = (req, res, next) => {
  // Used by attendance history, where the self-scope field is `employeeId`
  // (which stores the Employee ObjectId on attendancerecords).
  if (req.role === 'Employee') {
    req.scopeFilter = { employeeId: req.employee._id };
  } else {
    req.scopeFilter = {};
  }
  next();
};

/**
 * Builds the authoritative Mongo filter that scopes a query against the
 * `employees` collection to what the authenticated principal may see.
 * Always company-isolated; Managers are pinned to their department,
 * and Employees to their own record. Admin/HR see the whole
 * (authorized) company. This is a pure function so it can be unit-tested
 * against the real production logic.
 */
export const buildEmployeeScopeFilter = (
  role: string,
  employee: { _id?: unknown; departmentId?: unknown; teamId?: unknown },
  companyId: unknown
): Record<string, unknown> => {
  const filter: Record<string, unknown> = { companyId };
  if (role === 'Manager') {
    filter.departmentId = employee.departmentId;
  } else if (role === 'Employee') {
    filter._id = employee._id;
  }
  // Admin / HR: company-wide, no further narrowing.
  return filter;
};

export const validateObjectId = (param) => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    next();
  };
};
