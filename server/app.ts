import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173',
  credentials: true,
}));

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Parsers & Logging
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);

import { errorHandler } from './middleware/errorHandler.js';

// Centralized Error Handler
app.use(errorHandler);

export default app;
