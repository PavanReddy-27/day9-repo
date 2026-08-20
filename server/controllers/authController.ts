import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth, User } from '../models/User.js';
import Employee from '../models/Employee.js';
import jwt from 'jsonwebtoken';
import { writeAuditLog } from '../utils/audit.js';
import TokenBlacklist from '../models/TokenBlacklist.js';

// Helper to generate tokens
export const generateTokens = (id: any, role: any) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const findUserByEmail = async (email: string) => {
  let user: any = await AdminAuth.findOne({ email } as any).select('+password');
  if (user) return user;
  user = await HRAuth.findOne({ email } as any).select('+password');
  if (user) return user;
  user = await ManagerAuth.findOne({ email } as any).select('+password');
  if (user) return user;

  user = await EmployeeAuth.findOne({ email } as any).select('+password');
  if (user) return user;
  // Legacy fallback for tests that insert directly into users collection
  user = await User.findOne({ email } as any).select('+password');
  return user;
};

const findUserById = async (id: string) => {
  let user: any = await AdminAuth.findById(id as any);
  if (user) return user;
  user = await HRAuth.findById(id as any);
  if (user) return user;
  user = await ManagerAuth.findById(id as any);
  if (user) return user;

  user = await EmployeeAuth.findById(id as any);
  if (user) return user;
  user = await User.findById(id as any);
  return user;
};

export const login = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user: any = await findUserByEmail(email);
    
    if (!user || !(await (user as any).matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const employee: any = await Employee.findOne({ email } as any);
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Sensitive-action audit trail (fire-and-forget).
    void writeAuditLog(
      { companyId: employee?.companyId ?? (user as any).companyId, role: user.role, userEmail: user.email, ip: (req as any).ip, headers: (req as any).headers },
      "LOGIN",
      `${user.role} ${user.email} signed in`,
      "Auth",
      String(user._id)
    );

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        id: user._id.toString(),
        employeeId: user.employeeId,
        email: user.email,
        username: user.email,
        role: user.role,
        firstName: employee?.firstName || 'System',
        lastName: employee?.lastName || 'User',
        fullName: employee?.fullName || 'System User',
        department: employee?.departmentName || employee?.department || 'General',
        departmentId: employee?.departmentId,
        designation: employee?.designation || user.role,
        location: employee?.locationCode || employee?.location || 'HQ',
        avatar: employee?.avatar || '',
        isActive: user.isActive,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as any;
    const user = await findUserById(decoded.id);

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const tokens = generateTokens(user._id, user.role);
    res.status(200).json({ success: true, data: tokens });
  } catch {
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const logout = async (req: any, res: any, next: any) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      // Add the token to the blacklist
      await TokenBlacklist.create({ token });
    }
    
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

