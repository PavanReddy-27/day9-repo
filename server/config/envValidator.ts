/**
 * Environment Variables Validator (Task 16 - Anvesh & Ravi Prasad)
 * Validates required configuration parameters during server startup.
 */
import { logger } from '../utils/logger.js';

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProd = process.env.NODE_ENV === 'production';

  // Mandatory variables
  if (!process.env.MONGODB_URI) {
    if (isProd) {
      errors.push('MONGODB_URI is required in production environment.');
    } else {
      warnings.push('MONGODB_URI not specified. Falling back to local/in-memory MongoDB.');
    }
  }

  if (!process.env.JWT_SECRET) {
    if (isProd) {
      errors.push('JWT_SECRET is mandatory in production and must not be empty.');
    } else {
      warnings.push('JWT_SECRET not set. Using default development secret.');
    }
  } else if (isProd && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long in production.');
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT configuration: "${process.env.PORT}". Must be between 1 and 65535.`);
  }

  const valid = errors.length === 0;

  if (!valid) {
    logger.error('CRITICAL: Environment validation failed with fatal errors:', { errors });
    if (isProd) {
      throw new Error(`Fatal Environment Configuration Error: ${errors.join('; ')}`);
    }
  } else if (warnings.length > 0) {
    logger.warn('Environment validation succeeded with warnings:', { warnings });
  } else {
    logger.info('Environment validation PASSED. All required configurations verified.');
  }

  return { valid, errors, warnings };
}

export default validateEnvironment;

