#!/usr/bin/env ts-node

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Environment Variable Verification Script
 * 
 * Verifies that all required environment variables are set and valid
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

interface EnvVar {
  name: string
  required: boolean
  description: string
  validate?: (value: string) => { valid: boolean; error?: string }
}

const REQUIRED_VARS: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
    validate: (value) => {
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        return { valid: false, error: 'Must start with postgresql:// or postgres://' }
      }
      return { valid: true }
    },
  },
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    description: 'Clerk publishable key for authentication',
    validate: (value) => {
      if (!value.startsWith('pk_')) {
        return { valid: false, error: 'Must start with pk_' }
      }
      return { valid: true }
    },
  },
  {
    name: 'CLERK_SECRET_KEY',
    required: true,
    description: 'Clerk secret key for authentication',
    validate: (value) => {
      if (!value.startsWith('sk_')) {
        return { valid: false, error: 'Must start with sk_' }
      }
      return { valid: true }
    },
  },
  {
    name: 'ARCJET_KEY',
    required: true,
    description: 'Arcjet API key for rate limiting',
    validate: (value) => {
      if (!value.startsWith('arc_') && !value.startsWith('arcj_')) {
        return { valid: false, error: 'Must start with arc_ or arcj_' }
      }
      return { valid: true }
    },
  },
  {
    name: 'RESEND_API_KEY',
    required: true,
    description: 'Resend API key for email delivery',
    validate: (value) => {
      if (!value.startsWith('re_')) {
        return { valid: false, error: 'Must start with re_' }
      }
      return { valid: true }
    },
  },
  {
    name: 'RESEND_FROM_EMAIL',
    required: true,
    description: 'Email address for sending emails',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Must be a valid email address' }
      }
      return { valid: true }
    },
  },
  {
    name: 'CONTACT_NOTIFICATION_EMAIL',
    required: true,
    description: 'Email address for contact form notifications',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Must be a valid email address' }
      }
      return { valid: true }
    },
  },
  {
    name: 'SUPPORT_EMAIL',
    required: true,
    description: 'Email address for support form notifications',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Must be a valid email address' }
      }
      return { valid: true }
    },
  },
  {
    name: 'PUBLIC_SUPPORT_USER_ID',
    required: true,
    description: 'User ID for public support tickets',
  },
]

const OPTIONAL_VARS: EnvVar[] = [
  { name: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for AI features' },
  { name: 'ANTHROPIC_API_KEY', required: false, description: 'Anthropic API key for AI features' },
  { name: 'SENTRY_DSN', required: false, description: 'Sentry DSN for error tracking' },
  { name: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key for payments' },
  { name: 'UPSTASH_REDIS_REST_URL', required: false, description: 'Upstash Redis URL for caching' },
]

interface VerificationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  missing: string[]
  invalid: Array<{ name: string; error: string }>
}

function loadEnvFile(): Record<string, string> {
  const envLocal = join(process.cwd(), '.env.local')
  const envExample = join(process.cwd(), '.env.example')

  if (existsSync(envLocal)) {
    return dotenv.parse(readFileSync(envLocal, 'utf-8'))
  }

  if (existsSync(envExample)) {
    console.warn('⚠️  .env.local not found, using .env.example as reference')
    return {}
  }

  return {}
}

function verifyEnvironmentVariables(): VerificationResult {
  const result: VerificationResult = {
    passed: true,
    errors: [],
    warnings: [],
    missing: [],
    invalid: [],
  }

  // Load environment variables from .env.local or process.env
  const envFile = loadEnvFile()
  const env = { ...process.env, ...envFile }

  console.log('\n🔍 Verifying Environment Variables\n')
  console.log('='.repeat(60))

  // Check required variables
  console.log('\n📋 Required Variables:')
  REQUIRED_VARS.forEach(({ name, required, description, validate }) => {
    const value = env[name]

    if (!value || value.trim() === '') {
      result.missing.push(name)
      result.errors.push(`Missing required variable: ${name} - ${description}`)
      result.passed = false
      console.log(`  ❌ ${name}: MISSING - ${description}`)
    } else if (validate) {
      const validation = validate(value)
      if (!validation.valid) {
        result.invalid.push({ name, error: validation.error || 'Invalid format' })
        result.errors.push(`Invalid ${name}: ${validation.error}`)
        result.passed = false
        console.log(`  ❌ ${name}: INVALID - ${validation.error}`)
      } else {
        console.log(`  ✅ ${name}: Set`)
      }
    } else {
      console.log(`  ✅ ${name}: Set`)
    }
  })

  // Check optional variables
  console.log('\n📋 Optional Variables:')
  OPTIONAL_VARS.forEach(({ name, description }) => {
    const value = env[name]
    if (value && value.trim() !== '') {
      console.log(`  ✅ ${name}: Set`)
    } else {
      console.log(`  ⚪ ${name}: Not set (optional) - ${description}`)
    }
  })

  // Check for .env.example file
  const envExamplePath = join(process.cwd(), '.env.example')
  if (!existsSync(envExamplePath)) {
    result.warnings.push('.env.example file not found')
    console.log('\n⚠️  Warning: .env.example file not found')
  } else {
    console.log('\n✅ .env.example file exists')
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Verification Summary\n')
  console.log(`  Required variables set: ${REQUIRED_VARS.length - result.missing.length}/${REQUIRED_VARS.length}`)
  console.log(`  Missing variables: ${result.missing.length}`)
  console.log(`  Invalid variables: ${result.invalid.length}`)
  console.log(`  Warnings: ${result.warnings.length}`)

  if (result.missing.length > 0) {
    console.log('\n❌ Missing Required Variables:')
    result.missing.forEach(name => {
      console.log(`  - ${name}`)
    })
  }

  if (result.invalid.length > 0) {
    console.log('\n❌ Invalid Variables:')
    result.invalid.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`)
    })
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    result.warnings.forEach(warning => {
      console.log(`  - ${warning}`)
    })
  }

  return result
}

async function main(): Promise<void> {
  const result = verifyEnvironmentVariables()

  console.log('\n' + '='.repeat(60))

  if (result.passed) {
    console.log('\n✅ All required environment variables are set and valid!')
    console.log('💡 Review optional variables above for additional features')
    process.exit(0)
  } else {
    console.log('\n❌ Environment variable verification failed!')
    console.log('💡 Fix the errors above before proceeding')
    console.log('💡 Copy .env.example to .env.local and fill in your values')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Verification script failed:', error)
  process.exit(1)
})

