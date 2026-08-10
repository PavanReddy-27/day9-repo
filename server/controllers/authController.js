import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import AuditLog from "../models/AuditLog.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_access_key_change_in_production_32char";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "supersecret_jwt_refresh_key_change_in_production_32char";

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export const login = async (req, res) => {
  try {
    const { username, email, password, rememberMe } = req.body;
    const loginIdentifier = (username || email || "").trim().toLowerCase();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: "Username/email and password are required." });
    }

    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { employeeId: loginIdentifier }],
    }).select("+passwordHash");

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials or inactive account." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const employee = await Employee.findOne({ userId: user._id }).populate("locationId departmentId teamId");

    const accessToken = jwt.sign(
      { userId: user._id, companyId: user.companyId, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, companyId: user.companyId },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    // Hash refresh token before saving to database
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.lastLoginAt = new Date();
    await user.save();

    await AuditLog.create({
      companyId: user.companyId,
      performedBy: user.email,
      userRole: user.role,
      action: "USER_LOGIN",
      details: `User ${user.email} logged in successfully.`,
      ipAddress: req.ip || "127.0.0.1",
    });

    const userPayload = {
      id: user._id,
      employeeId: user.employeeId,
      username: user.email.split("@")[0],
      email: user.email,
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      fullName: employee?.fullName || "",
      role: user.role,
      department: employee?.departmentId?.name || "General",
      designation: employee?.designation || user.role,
      location: employee?.locationId?.name || "Hyderabad",
      workMode: employee?.workMode || "Office",
      isActive: user.isActive,
    };

    return res.status(200).json({
      success: true,
      user: userPayload,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  } catch (error) {
    console.error("[Auth API Error]", error.message);
    return res.status(500).json({ success: false, message: "Internal server authentication error." });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Refresh token is required." });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select("+refreshTokenHash");

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ success: false, message: "Revoked refresh token." });
    }

    const isMatch = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid refresh token." });
    }

    // Refresh token rotation
    const newAccessToken = jwt.sign(
      { userId: user._id, companyId: user.companyId, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRY }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id, companyId: user.companyId },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }

      await AuditLog.create({
        companyId: req.companyId,
        performedBy: req.user.email,
        userRole: req.user.role,
        action: "USER_LOGOUT",
        details: `User ${req.user.email} logged out.`,
      });
    }

    return res.status(200).json({ success: true, message: "Logout successful." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error during logout." });
  }
};
