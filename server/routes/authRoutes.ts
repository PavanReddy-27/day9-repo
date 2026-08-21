import express from 'express';
import { login, refresh, logout, verifyLoginMfa, generateMfaSetup, enableMfa, disableMfa } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/login/mfa', verifyLoginMfa);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/mfa/generate', authenticateJWT, generateMfaSetup);
router.post('/mfa/enable', authenticateJWT, enableMfa);
router.post('/mfa/disable', authenticateJWT, disableMfa);

export default router;
