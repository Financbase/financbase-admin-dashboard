/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Centralized Environment Variable Validation
 * 
 * Validates all required environment variables on module import using Zod schemas.
 * Provides type-safe access to environment variables throughout the application.
 */

import { z } from 'zod';
import { logger } from './logger';

// Zod schema for required environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      'DATABASE_URL must start with postgresql:// or postgres://'
    ),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required')
    .startsWith('pk_', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_'),
  
  CLERK_SECRET_KEY: z
    .string()
    .min(1, 'CLERK_SECRET_KEY is required')
    .startsWith('sk_', 'CLERK_SECRET_KEY must start with sk_'),

  // Arcjet Rate Limiting
  ARCJET_KEY: z
    .string()
    .min(1, 'ARCJET_KEY is required')
    .refine(
      (val) => val.startsWith('arc_') || val.startsWith('arcj_'),
      'ARCJET_KEY must start with arc_ or arcj_'
    ),

  // Resend Email Service
  RESEND_API_KEY: z
    .string()
    .min(1, 'RESEND_API_KEY is required')
    .startsWith('re_', 'RESEND_API_KEY must start with re_'),
  
  RESEND_FROM_EMAIL: z
    .string()
    .min(1, 'RESEND_FROM_EMAIL is required')
    .email('RESEND_FROM_EMAIL must be a valid email address'),

  // Contact & Support
  CONTACT_NOTIFICATION_EMAIL: z
    .string()
    .min(1, 'CONTACT_NOTIFICATION_EMAIL is required')
    .email('CONTACT_NOTIFICATION_EMAIL must be a valid email address'),
  
  SUPPORT_EMAIL: z
    .string()
    .min(1, 'SUPPORT_EMAIL is required')
    .email('SUPPORT_EMAIL must be a valid email address'),
  
  PUBLIC_SUPPORT_USER_ID: z
    .string()
    .min(1, 'PUBLIC_SUPPORT_USER_ID is required'),

  // Optional variables with defaults
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional(),
});

// Schema for optional environment variables
const optionalEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  NEXT_PUBLIC_PARTYKIT_HOST: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  ENABLE_TRACING: z.string().optional(),
  NEXT_RUNTIME: z.string().optional(),
}).passthrough(); // Allow other env vars to pass through

// Combined schema
const fullEnvSchema = envSchema.merge(optionalEnvSchema);

// Type inference for validated environment variables
export type Env = z.infer<typeof fullEnvSchema>;

// Validate and parse environment variables
function validateEnv(): Env {
  // Get all environment variables
  const rawEnv = {
    ...process.env,
    // Ensure NODE_ENV has a default
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  try {
    // Parse and validate
    const parsed = fullEnvSchema.parse(rawEnv);

    logger.info('Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      const errorMessage = `Environment variable validation failed:\n${errors.join('\n')}`;
      logger.error(errorMessage, { errors: error.errors });
      
      // In production, throw to prevent app from starting with invalid config
      if (rawEnv.NODE_ENV === 'production') {
        throw new Error(errorMessage);
      }
      
      // In development, log warning but allow app to continue
      logger.warn('Continuing with invalid environment variables (development mode)');
      
      // Return partial env if validation fails in development
      // This is unsafe but allows development to continue
      return rawEnv as unknown as Env;
    } else {
      logger.error('Unexpected error during environment validation', { error });
      throw error;
    }
  }
}

// Validate on module import
const env = validateEnv();

// Export validated environment variables with type safety
export const getEnv = (): Env => env;

// Export individual required variables for convenience (type-safe)
export const DATABASE_URL = env.DATABASE_URL;
export const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;
export const ARCJET_KEY = env.ARCJET_KEY;
export const RESEND_API_KEY = env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;
export const CONTACT_NOTIFICATION_EMAIL = env.CONTACT_NOTIFICATION_EMAIL;
export const SUPPORT_EMAIL = env.SUPPORT_EMAIL;
export const PUBLIC_SUPPORT_USER_ID = env.PUBLIC_SUPPORT_USER_ID;
export const NODE_ENV = env.NODE_ENV;
export const NEXT_PUBLIC_APP_URL = env.NEXT_PUBLIC_APP_URL;

// Export optional variables (may be undefined)
export const OPENAI_API_KEY = env.OPENAI_API_KEY;
export const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
export const SENTRY_DSN = env.SENTRY_DSN;
export const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
export const UPSTASH_REDIS_REST_URL = env.UPSTASH_REDIS_REST_URL;
export const NEXT_PUBLIC_PARTYKIT_HOST = env.NEXT_PUBLIC_PARTYKIT_HOST;
export const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
export const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
export const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET = env.R2_BUCKET;
export const ENABLE_TRACING = env.ENABLE_TRACING;
export const NEXT_RUNTIME = env.NEXT_RUNTIME;

// Re-export for backward compatibility
export default env;
