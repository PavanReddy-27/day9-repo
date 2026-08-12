import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';

export const authenticateJWT = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    req.role = decoded.role;

    // Fetch the employee to attach companyId and employee record for data scoping
    const employee = await Employee.findOne({ user: decoded.id }).lean();
    if (employee) {
      req.employee = employee;
      req.companyId = employee.company;
    }

    next();
  } catch (error) {
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
  if (!req.employee) {
    return res.status(403).json({ success: false, message: 'Forbidden: Employee record missing' });
  }

  req.scopeFilter = { companyId: req.companyId };

  // Admin and HR can see everything within the company
  if (['Admin', 'HR'].includes(req.role)) {
    return next();
  }

  // Manager can see only their department
  if (req.role === 'Manager') {
    req.scopeFilter.departmentId = req.employee.department;
    return next();
  }

  // Team Lead can see only their team
  if (req.role === 'Team Lead') {
    req.scopeFilter.teamId = req.employee.team;
    return next();
  }

  // Employee can see only themselves
  if (req.role === 'Employee') {
    req.scopeFilter._id = req.employee._id;
    return next();
  }

  next();
};

export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return res.status(400).json({ success: false, message: `Invalid ${paramName} format` });
    }
    next();
  };
};
