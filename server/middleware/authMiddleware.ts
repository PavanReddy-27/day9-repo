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
    
    // Also set employee/company info for controllers
    const userDoc = await mongoose.model('User').findById(decoded.id);
    if (userDoc) {
      req.employee = { _id: userDoc.employeeId };
      req.companyId = userDoc.companyId;
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
  if (req.role === 'Employee') {
    req.scopeFilter = { employeeId: req.employee._id };
  } else {
    req.scopeFilter = {};
  }
  next();
};

export const validateObjectId = (param) => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    next();
  };
};
