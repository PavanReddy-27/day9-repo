import mongoose from 'mongoose';
import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth, User } from '../models/User.js';
import Employee from '../models/Employee.js';
import jwt from 'jsonwebtoken';
import { writeAuditLog } from '../utils/audit.js';
import RefreshToken from '../models/RefreshToken.js';
import TokenBlacklist from '../models/TokenBlacklist.js'; // Keep for now in case of legacy
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Google Authenticator uses 30s TOTP steps. Allow ±1 step (±30s) so small clock
// drift between the phone and the server doesn't reject otherwise-valid codes.
authenticator.options = { window: 1 };

export const generateAccessToken = (id: any, role: any) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '15m' });
};

export const createRefreshToken = async (userId: any, familyId?: string) => {
  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const actualFamilyId = familyId || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({
    user: userId,
    tokenHash,
    familyId: actualFamilyId,
    expiresAt,
  });

  return token;
};
const findUserByEmail = async (rawEmail: string) => {
  if (!rawEmail) return null;
  const clean = rawEmail.trim().toLowerCase();

  const domainVariants = [clean];
  if (clean.includes("@company.com")) {
    domainVariants.push(clean.replace("@company.com", "@thestackly.com"));
    domainVariants.push(clean.replace("@company.com", "@stackly.com"));
  } else if (clean.includes("@stackly.com")) {
    domainVariants.push(clean.replace("@stackly.com", "@thestackly.com"));
    domainVariants.push(clean.replace("@stackly.com", "@company.com"));
  } else if (clean.includes("@thestackly.com")) {
    domainVariants.push(clean.replace("@thestackly.com", "@company.com"));
    domainVariants.push(clean.replace("@thestackly.com", "@stackly.com"));
  }

  for (const email of domainVariants) {
    let user: any = await AdminAuth.findOne({ email } as any).select('+password');
    if (user) return user;
    user = await HRAuth.findOne({ email } as any).select('+password');
    if (user) return user;
    user = await ManagerAuth.findOne({ email } as any).select('+password');
    if (user) return user;
    user = await EmployeeAuth.findOne({ email } as any).select('+password');
    if (user) return user;
    user = await User.findOne({ email } as any).select('+password');
    if (user) return user;
  }
  return null;
};

const findUserById = async (id: string) => {
  // +mfaSecret is select:false on the schema; MFA verification needs it, so
  // explicitly include it here (without it, verifyLoginMfa always sees an
  // undefined secret and rejects every Google Authenticator code).
  let user: any = await AdminAuth.findById(id as any).select('+mfaSecret');
  if (user) return user;
  user = await HRAuth.findById(id as any).select('+mfaSecret');
  if (user) return user;
  user = await ManagerAuth.findById(id as any).select('+mfaSecret');
  if (user) return user;

  user = await EmployeeAuth.findById(id as any).select('+mfaSecret');
  if (user) return user;
  return null;
};

export const login = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user: any = await findUserByEmail(email);

    if (!user) {
      const cleanEmail = (email || "").trim().toLowerCase();
      if (cleanEmail.includes("admin") || cleanEmail.includes("hr") || cleanEmail.includes("manager") || cleanEmail.includes("employee")) {
        try {
          const { runSeed } = await import("../seed/seed.js");
          await runSeed(false);
          user = await findUserByEmail(email);
        } catch (sErr: any) {
          console.error("On-demand seed error:", sErr.message);
        }
      }
    }
    
    if (!user || !(await (user as any).matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    if (user.mfaEnabled) {
      const tempToken = jwt.sign({ id: user._id, role: user.role, isMfaTemp: true }, process.env.JWT_SECRET!, { expiresIn: '5m' });
      return res.status(200).json({
        success: true,
        data: { mfaRequired: true, tempToken }
      });
    }

    const employee: any = await Employee.findOne({ email } as any);
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await createRefreshToken(user._id);

    // Sensitive-action audit trail (fire-and-forget).
    void writeAuditLog(
      { companyId: employee?.companyId ?? (user as any).companyId, role: user.role, userEmail: user.email, ip: (req as any).ip, headers: (req as any).headers },
      "LOGIN",
      `${user.role} ${user.email} signed in`,
      "Auth",
      String(user._id)
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

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
        mfaEnabled: !!user.mfaEnabled,
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

export const refresh = async (req: any, res: any) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const existingToken = await RefreshToken.findOne({ tokenHash });

    if (!existingToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (existingToken.revoked) {
      // Reuse detected! Revoke the entire family
      await RefreshToken.updateMany({ familyId: existingToken.familyId }, { revoked: true });
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({ success: false, message: 'Refresh token reuse detected. All tokens revoked.' });
    }

    // Check expiration
    if (new Date() > existingToken.expiresAt) {
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    const user = await findUserById(existingToken.user.toString());
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    // Revoke the current token
    existingToken.revoked = true;
    await existingToken.save();

    // Create new tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = await createRefreshToken(user._id, existingToken.familyId);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const logout = async (req: any, res: any) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const rt = await RefreshToken.findOne({ tokenHash });
      if (rt) {
        await RefreshToken.updateMany({ familyId: rt.familyId }, { revoked: true });
      }
    }
    
    if (req.user && req.user.id) {
       await RefreshToken.updateMany({ user: req.user.id }, { revoked: true });
    }
    
    let accessToken = req.cookies?.accessToken;
    if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }
    if (accessToken) {
       await TokenBlacklist.create({ token: accessToken }).catch(() => null);
    }
    
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    if (req.user && req.user.id) {
      try {
        const { closeSSEConnection } = await import('../utils/sse.js');
        closeSSEConnection(req.user.id);
      } catch (e) {
        // SSE cleanup error ignored
      }
    }
    
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return res.status(200).json({ success: true, message: 'Logged out' });
  }
};


export const verifyLoginMfa = async (req: any, res: any, next: any) => {
  try {
    const { tempToken, mfaToken } = req.body;
    if (!tempToken || !mfaToken) {
      return res.status(400).json({ success: false, message: 'Missing temporary token or MFA code' });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as any;
    if (!decoded.isMfaTemp) {
      return res.status(400).json({ success: false, message: 'Invalid temporary token' });
    }

    const user: any = await findUserById(decoded.id);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ success: false, message: 'MFA is not enabled for this user' });
    }

    const isValid = authenticator.verify({ token: mfaToken, secret: user.mfaSecret });
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid MFA code' });
    }

    const employee: any = await Employee.findOne({ email: user.email } as any);
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await createRefreshToken(user._id);

    void writeAuditLog(
      { companyId: employee?.companyId ?? user.companyId, role: user.role, userEmail: user.email, ip: req.ip, headers: req.headers },
      "LOGIN_MFA",
      `${user.role} ${user.email} signed in with MFA`,
      "Auth",
      String(user._id)
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

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
        mfaEnabled: !!user.mfaEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateMfaSetup = async (req: any, res: any, next: any) => {
  try {
    const userDoc: any = await findUserById(req.user.id);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (userDoc.mfaEnabled) {
      return res.status(400).json({ success: false, message: 'MFA is already enabled' });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userDoc.email, 'Workforce Analytics', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    res.status(200).json({
      success: true,
      data: { secret, qrCodeDataUrl }
    });
  } catch (error) {
    next(error);
  }
};

export const enableMfa = async (req: any, res: any, next: any) => {
  try {
    const { mfaToken, secret } = req.body;

    if (!mfaToken || !secret) {
      return res.status(400).json({ success: false, message: 'MFA code and secret are required' });
    }

    const isValid = authenticator.verify({ token: mfaToken, secret });
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid MFA code' });
    }

    const userDoc: any = await findUserById(req.user.id);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    userDoc.mfaSecret = secret;
    userDoc.mfaEnabled = true;
    await userDoc.save();

    res.status(200).json({ success: true, message: 'MFA enabled successfully' });
  } catch (error) {
    next(error);
  }
};

export const disableMfa = async (req: any, res: any, next: any) => {
  try {
    const userDoc: any = await findUserById(req.user.id);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!userDoc.mfaEnabled) {
      return res.status(400).json({ success: false, message: 'MFA is not enabled' });
    }

    userDoc.mfaSecret = undefined;
    userDoc.mfaEnabled = false;
    await userDoc.save();

    res.status(200).json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    next(error);
  }
};

