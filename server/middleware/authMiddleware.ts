import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import TokenBlacklist from '../models/TokenBlacklist.js';

import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth, User } from '../models/User.js';

const findUserById = async (id: string) => {
  let user = await AdminAuth.findById(id);
  if (user) return user;
  user = await HRAuth.findById(id);
  if (user) return user;
  user = await ManagerAuth.findById(id);
  if (user) return user;
  user = await EmployeeAuth.findById(id);
  if (user) return user;
  return null;
};

export const authenticateJWT = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    
    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Not authorized, token revoked' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    req.user = decoded; // { id, role }
    
    // Also set employee/company info for controllers
    const userDoc = await findUserById(decoded.id) as any;
    if (!userDoc) {
      return res.status(401).json({ success: false, message: 'User no longer exists. Please log in again.' });
    }
    
    let employeeDoc: any = null;
      
      // Try matching by employeeId, userId (_id), or email
      employeeDoc = await Employee.findOne({
        $or: [
          { employeeId: userDoc.employeeId },
          { userId: userDoc._id },
          { email: userDoc.email }
        ]
      } as any);

      if (!employeeDoc && userDoc.email) {
        employeeDoc = await Employee.findOne({ email: userDoc.email } as any);
      }
      if (!employeeDoc && mongoose.Types.ObjectId.isValid(decoded.id)) {
        employeeDoc = await Employee.findById(decoded.id as any);
      }
      
      // If no employee record is found, we fall through. 
      // The else block below will assign a safe dummy ID.
      if (employeeDoc) {
        req.employee = {
          _id: employeeDoc._id,
          locationId: employeeDoc.locationId,
          departmentId: employeeDoc.departmentId,
          teamId: employeeDoc.teamId,
          workMode: employeeDoc.workMode,
        };
      } else {
        req.employee = { _id: new mongoose.Types.ObjectId("000000000000000000000000") };
      }
      req.companyId = employeeDoc ? employeeDoc.companyId : userDoc.companyId;
      req.role = userDoc.role;
      req.userEmail = userDoc.email;

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token verification failed:', error);
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
    // Managers are scoped to their own department.
    filter.departmentId = employee?.departmentId;
  } else if (role === 'Employee') {
    // Standard employees can only see their own record.
    filter._id = employee?._id;
  }
  // Admin / HR: company-wide (just companyId).

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
