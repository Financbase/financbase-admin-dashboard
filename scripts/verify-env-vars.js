#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * Verifies that all required environment variables are set correctly
 * for production deployment.
 */

const requiredVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL database connection string',
    validate: (value) => {
      if (!value) return { valid: false, error: 'DATABASE_URL is required' };
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        return { valid: false, error: 'DATABASE_URL must be a PostgreSQL connection string' };
      }
      return { valid: true };
    }
  },

  // Authentication (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
    required: true,
    description: 'Clerk publishable key for authentication',
    validate: (value, isProduction = false) => {
      if (!value) return { valid: false, error: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required' };
      if (isProduction && value.startsWith('pk_test_')) {
        return { valid: false, error: 'Test key detected! Use production key (pk_live_...) for production' };
      }
      if (!value.startsWith('pk_live_') && !value.startsWith('pk_test_')) {
        return { valid: false, error: 'Invalid Clerk publishable key format (should start with pk_live_ or pk_test_)' };
      }
      return { valid: true };
    }
  },

  CLERK_SECRET_KEY: {
    required: true,
    description: 'Clerk secret key for authentication',
    validate: (value, isProduction = false) => {
      if (!value) return { valid: false, error: 'CLERK_SECRET_KEY is required' };
      if (isProduction && value.startsWith('sk_test_')) {
        return { valid: false, error: 'Test key detected! Use production key (sk_live_...) for production' };
      }
      if (!value.startsWith('sk_live_') && !value.startsWith('sk_test_')) {
        return { valid: false, error: 'Invalid Clerk secret key format (should start with sk_live_ or sk_test_)' };
      }
      return { valid: true };
    }
  },

  // Email Service (Resend)
  RESEND_API_KEY: {
    required: true,
    description: 'Resend API key for email delivery',
    validate: (value) => {
      if (!value) return { valid: false, error: 'RESEND_API_KEY is required' };
      if (!value.startsWith('re_')) {
        return { valid: false, error: 'Invalid Resend API key format (should start with re_)' };
      }
      return { valid: true };
    }
  },

  RESEND_FROM_EMAIL: {
    required: true,
    description: 'Default from email address for Resend',
    validate: (value) => {
      if (!value) return { valid: false, error: 'RESEND_FROM_EMAIL is required' };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
      return { valid: true };
    }
  },

  // Rate Limiting (Arcjet)
  ARCJET_KEY: {
    required: true,
    description: 'Arcjet key for rate limiting',
    validate: (value) => {
      if (!value) return { valid: false, error: 'ARCJET_KEY is required' };
      if (!value.startsWith('arc_') && !value.startsWith('arcj_')) {
        return { valid: false, error: 'Invalid Arcjet key format (should start with arc_ or arcj_)' };
      }
      return { valid: true };
    }
  },

  // Error Tracking (Sentry)
  SENTRY_DSN: {
    required: false,
    description: 'Sentry DSN for error tracking (recommended)',
    validate: (value) => {
      if (!value) {
        return { valid: true, warning: 'SENTRY_DSN not set - error tracking will not work' };
      }
      if (!value.startsWith('https://')) {
        return { valid: false, error: 'Invalid Sentry DSN format' };
      }
      return { valid: true };
    }
  },

  // Support
  PUBLIC_SUPPORT_USER_ID: {
    required: true,
    description: 'System user ID for public support tickets',
    validate: (value) => {
      if (!value) return { valid: false, error: 'PUBLIC_SUPPORT_USER_ID is required' };
      // Should be a valid user ID format (CUID or UUID)
      if (value.length < 10) {
        return { valid: false, error: 'PUBLIC_SUPPORT_USER_ID appears to be invalid' };
      }
      return { valid: true };
    }
  },

  CONTACT_NOTIFICATION_EMAIL: {
    required: true,
    description: 'Email address for contact form notifications',
    validate: (value) => {
      if (!value) return { valid: false, error: 'CONTACT_NOTIFICATION_EMAIL is required' };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
      return { valid: true };
    }
  },

  SUPPORT_EMAIL: {
    required: true,
    description: 'Email address for support tickets',
    validate: (value) => {
      if (!value) return { valid: false, error: 'SUPPORT_EMAIL is required' };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
      return { valid: true };
    }
  }
};

const optionalVars = {
  // AI Services
  OPENAI_API_KEY: {
    description: 'OpenAI API key for AI features (optional)',
    validate: (value) => {
      if (value && !value.startsWith('sk-')) {
        return { valid: false, error: 'Invalid OpenAI API key format' };
      }
      return { valid: true };
    }
  },

  ANTHROPIC_API_KEY: {
    description: 'Anthropic API key for Claude AI (optional)',
    validate: (value) => {
      if (value && !value.startsWith('sk-ant-')) {
        return { valid: false, error: 'Invalid Anthropic API key format' };
      }
      return { valid: true };
    }
  },

  // Caching
  REDIS_URL: {
    description: 'Redis connection URL for caching (optional)',
    validate: (value) => {
      if (value && !value.startsWith('redis://') && !value.startsWith('rediss://')) {
        return { valid: false, error: 'Invalid Redis URL format' };
      }
      return { valid: true };
    }
  },

  UPSTASH_REDIS_REST_URL: {
    description: 'Upstash Redis REST URL (optional)',
    validate: (value) => {
      if (value && !value.startsWith('https://')) {
        return { valid: false, error: 'Invalid Upstash Redis URL format' };
      }
      return { valid: true };
    }
  }
};

function verifyEnvironment(env = process.env, isProduction = false) {
  const errors = [];
  const warnings = [];
  const verified = [];

  // Check required variables
  for (const [varName, config] of Object.entries(requiredVars)) {
    const value = env[varName];
    
    if (!value && config.required) {
      errors.push({
        variable: varName,
        error: `${varName} is required but not set`,
        description: config.description
      });
      continue;
    }

    if (value) {
      const validation = config.validate(value, isProduction);
      if (!validation.valid) {
        errors.push({
          variable: varName,
          error: validation.error,
          description: config.description
        });
      } else if (validation.warning) {
        warnings.push({
          variable: varName,
          warning: validation.warning,
          description: config.description
        });
        verified.push({ variable: varName, status: 'warning' });
      } else {
        verified.push({ variable: varName, status: 'ok' });
      }
    }
  }

  // Check optional variables if they're set
  for (const [varName, config] of Object.entries(optionalVars)) {
    const value = env[varName];
    if (value) {
      const validation = config.validate(value);
      if (!validation.valid) {
        errors.push({
          variable: varName,
          error: validation.error,
          description: config.description
        });
      } else {
        verified.push({ variable: varName, status: 'ok' });
      }
    }
  }

  return { errors, warnings, verified };
}

function printResults({ errors, warnings, verified }, isProduction = false) {
  console.log('\n🔍 Environment Variables Verification\n');
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT/STAGING'}\n`);

  if (verified.length > 0) {
    console.log('✅ Verified Variables:');
    verified.forEach(({ variable, status }) => {
      const icon = status === 'ok' ? '✅' : '⚠️';
      console.log(`  ${icon} ${variable}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(({ variable, warning, description }) => {
      console.log(`  ⚠️  ${variable}: ${warning}`);
      console.log(`     ${description}\n`);
    });
  }

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(({ variable, error, description }) => {
      console.log(`  ❌ ${variable}: ${error}`);
      console.log(`     ${description}\n`);
    });
    console.log('\n❌ Verification FAILED\n');
    return false;
  }

  if (warnings.length === 0) {
    console.log('✅ All required environment variables are properly configured!\n');
  } else {
    console.log('⚠️  Verification completed with warnings\n');
  }

  return errors.length === 0;
}

// Main execution
if (require.main === module) {
  const isProduction = process.argv.includes('--production') || 
                       process.env.NODE_ENV === 'production';
  
  const results = verifyEnvironment(process.env, isProduction);
  const success = printResults(results, isProduction);
  
  process.exit(success ? 0 : 1);
}

module.exports = { verifyEnvironment, requiredVars, optionalVars };

