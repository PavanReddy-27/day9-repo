import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth, User } from '../models/User';
import Employee from '../models/Employee';
import jwt from 'jsonwebtoken';

// Helper to generate tokens
const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const findUserByEmail = async (email: string) => {
  let user = await AdminAuth.findOne({ email }).select('+password');
  if (user) return user;
  user = await HRAuth.findOne({ email }).select('+password');
  if (user) return user;
  user = await ManagerAuth.findOne({ email }).select('+password');
  if (user) return user;

  user = await EmployeeAuth.findOne({ email }).select('+password');
  if (user) return user;
  // Legacy fallback for tests that insert directly into users collection
  user = await User.findOne({ email }).select('+password');
  return user;
};

const findUserById = async (id: string) => {
  let user = await AdminAuth.findById(id);
  if (user) return user;
  user = await HRAuth.findById(id);
  if (user) return user;
  user = await ManagerAuth.findById(id);
  if (user) return user;

  user = await EmployeeAuth.findById(id);
  if (user) return user;
  user = await User.findById(id);
  return user;
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await findUserByEmail(email);
    
    if (!user || !(await (user as any).matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const employee = await Employee.findOne({ email });
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

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
        department: employee?.department || 'IT',
        designation: employee?.designation || user.role,
        location: employee?.location || 'HQ',
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

export const logout = (req, res) => {
  // Client should discard tokens. If storing refresh tokens in DB, remove it here.
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

