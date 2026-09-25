import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS — allow frontend origin
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:3000',
    credentials: true,
  }));

  // Body and cookie parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Compression
  app.use(compression());

  // Global Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
  });
  
  // Stricter Rate Limiting for Authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs for auth
    message: { error: 'Too many authentication attempts, please try again later.' }
  });

  app.use('/api', limiter);
  app.use('/api/auth', authLimiter);

  // Request logging
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // API routes
  app.use('/api', apiRouter);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;
