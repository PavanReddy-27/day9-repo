import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Liveness endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

// Readiness endpoint — checks DB connection state
router.get('/readiness', (req, res) => {
  const dbState = mongoose.connection.readyState;

  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (dbState === 1) {
    res.status(200).json({
      success: true,
      status: 'UP',
      database: 'Connected',
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'DOWN',
      database: 'Disconnected or Connecting',
    });
  }
});

export default router;
