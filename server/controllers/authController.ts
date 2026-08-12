import User from '../models/User';
import jwt from 'jsonwebtoken';

// Helper to generate tokens
const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // In a real app, you might save the refresh token to the DB or send it in an HttpOnly cookie
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const tokens = generateTokens(user._id, user.role);
    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const logout = (req, res) => {
  // Client should discard tokens. If storing refresh tokens in DB, remove it here.
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
