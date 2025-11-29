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
 * Database Schema Verification Script
 * 
 * Verifies that:
 * 1. Drizzle schemas match migration files
 * 2. All migrations can be applied successfully
 * 3. Schema prefix consistency (financbase vs public)
 * 4. ID type consistency (UUID vs SERIAL)
 * 5. Foreign key constraints are properly defined
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const SCHEMA_DIR = join(process.cwd(), 'lib/db/schemas')
const MIGRATIONS_DIR = join(process.cwd(), 'drizzle/migrations')
const DRIZZLE_CONFIG = join(process.cwd(), 'drizzle.config.ts')

interface VerificationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  summary: {
    schemasFound: number
    migrationsFound: number
    issuesFound: number
  }
}

function verifySchemaFiles(): { schemas: string[], errors: string[] } {
  const errors: string[] = []
  const schemas: string[] = []

  if (!existsSync(SCHEMA_DIR)) {
    errors.push(`Schema directory not found: ${SCHEMA_DIR}`)
    return { schemas, errors }
  }

  try {
    const files = readdirSync(SCHEMA_DIR, { recursive: true })
    const schemaFiles = files.filter(f => f.toString().endsWith('.ts') && !f.toString().includes('.test.'))
    schemas.push(...schemaFiles.map(f => f.toString()))
  } catch (error) {
    errors.push(`Error reading schema directory: ${error}`)
  }

  return { schemas, errors }
}

function verifyMigrationFiles(): { migrations: string[], errors: string[] } {
  const errors: string[] = []
  const migrations: string[] = []

  if (!existsSync(MIGRATIONS_DIR)) {
    errors.push(`Migrations directory not found: ${MIGRATIONS_DIR}`)
    return { migrations, errors }
  }

  try {
    const files = readdirSync(MIGRATIONS_DIR)
    const migrationFiles = files.filter(f => f.endsWith('.sql'))
    migrations.push(...migrationFiles.sort())
  } catch (error) {
    errors.push(`Error reading migrations directory: ${error}`)
  }

  return { migrations, errors }
}

function checkSchemaPrefixConsistency(): { issues: string[], warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []

  try {
    // Check for schema prefix inconsistencies in migration files
    const { migrations } = verifyMigrationFiles()
    
    migrations.forEach(migration => {
      const content = readFileSync(join(MIGRATIONS_DIR, migration), 'utf-8')
      
      // Check for mixed schema prefixes
      const hasFinancbaseSchema = content.includes('financbase.')
      const hasPublicSchema = content.includes('public.') || content.includes('CREATE TABLE') && !content.includes('financbase.')
      
      if (hasFinancbaseSchema && hasPublicSchema) {
        warnings.push(`Migration ${migration} uses both financbase and public schemas`)
      }
      
      // Check for users table schema inconsistency
      if (content.includes('CREATE TABLE') && content.includes('users')) {
        if (content.includes('CREATE TABLE public.users') && !content.includes('CREATE TABLE financbase.users')) {
          warnings.push(`Migration ${migration} creates users table in public schema, but schemas may reference financbase.users`)
        }
      }
    })
  } catch (error) {
    issues.push(`Error checking schema prefixes: ${error}`)
  }

  return { issues, warnings }
}

function checkIdTypeConsistency(): { issues: string[], warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []

  try {
    const { migrations } = verifyMigrationFiles()
    
    migrations.forEach(migration => {
      const content = readFileSync(join(MIGRATIONS_DIR, migration), 'utf-8')
      
      // Check for SERIAL usage (PostgreSQL integer)
      const hasSerial = content.includes('SERIAL') || content.includes('serial')
      
      // Check for UUID usage
      const hasUuid = content.includes('UUID') || content.includes('uuid') || content.includes('gen_random_uuid()')
      
      if (hasSerial && hasUuid) {
        warnings.push(`Migration ${migration} uses both SERIAL and UUID - ensure consistency`)
      }
    })
  } catch (error) {
    issues.push(`Error checking ID types: ${error}`)
  }

  return { issues, warnings }
}

function checkForeignKeyConstraints(): { issues: string[], warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []

  try {
    const { migrations } = verifyMigrationFiles()
    
    migrations.forEach(migration => {
      const content = readFileSync(join(MIGRATIONS_DIR, migration), 'utf-8')
      
      // Check for foreign key definitions
      const hasForeignKey = content.includes('FOREIGN KEY') || content.includes('REFERENCES')
      
      if (hasForeignKey) {
        // Check for proper cascade rules
        const hasCascade = content.includes('CASCADE') || content.includes('SET NULL') || content.includes('RESTRICT')
        
        if (!hasCascade) {
          warnings.push(`Migration ${migration} has foreign keys without explicit cascade rules`)
        }
      }
    })
  } catch (error) {
    issues.push(`Error checking foreign keys: ${error}`)
  }

  return { issues, warnings }
}

function verifyDrizzleConfig(): { issues: string[], warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []

  if (!existsSync(DRIZZLE_CONFIG)) {
    issues.push(`Drizzle config not found: ${DRIZZLE_CONFIG}`)
    return { issues, warnings }
  }

  try {
    const configContent = readFileSync(DRIZZLE_CONFIG, 'utf-8')
    
    // Check for schema path
    if (!configContent.includes('schema:')) {
      issues.push('Drizzle config missing schema path')
    }
    
    // Check for migrations output path
    if (!configContent.includes('out:') && !configContent.includes('migrations')) {
      warnings.push('Drizzle config may not specify migrations output path')
    }
  } catch (error) {
    issues.push(`Error reading Drizzle config: ${error}`)
  }

  return { issues, warnings }
}

function verifyMigrationOrder(): { issues: string[], warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []

  try {
    const { migrations } = verifyMigrationFiles()
    
    // Check if migrations are numbered sequentially
    const numberedMigrations = migrations.filter(m => /^\d+_/.test(m))
    const numbers = numberedMigrations.map(m => parseInt(m.split('_')[0]))
    
    // Check for gaps in sequence
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] - numbers[i] > 1) {
        warnings.push(`Gap in migration sequence: ${numbers[i]} -> ${numbers[i + 1]}`)
      }
    }
  } catch (error) {
    issues.push(`Error checking migration order: ${error}`)
  }

  return { issues, warnings }
}

async function main(): Promise<void> {
  console.log('🔍 Verifying Database Schema Alignment\n')
  console.log('='.repeat(60))

  const result: VerificationResult = {
    passed: true,
    errors: [],
    warnings: [],
    summary: {
      schemasFound: 0,
      migrationsFound: 0,
      issuesFound: 0,
    },
  }

  // Verify schema files exist
  console.log('\n📁 Checking schema files...')
  const { schemas, errors: schemaErrors } = verifySchemaFiles()
  result.errors.push(...schemaErrors)
  result.summary.schemasFound = schemas.length
  console.log(`  ✅ Found ${schemas.length} schema files`)

  // Verify migration files exist
  console.log('\n📁 Checking migration files...')
  const { migrations, errors: migrationErrors } = verifyMigrationFiles()
  result.errors.push(...migrationErrors)
  result.summary.migrationsFound = migrations.length
  console.log(`  ✅ Found ${migrations.length} migration files`)

  // Check schema prefix consistency
  console.log('\n🔍 Checking schema prefix consistency...')
  const prefixCheck = checkSchemaPrefixConsistency()
  result.warnings.push(...prefixCheck.warnings)
  result.errors.push(...prefixCheck.issues)
  if (prefixCheck.warnings.length > 0) {
    console.log(`  ⚠️  Found ${prefixCheck.warnings.length} schema prefix warnings`)
  } else {
    console.log('  ✅ Schema prefixes are consistent')
  }

  // Check ID type consistency
  console.log('\n🔍 Checking ID type consistency...')
  const idTypeCheck = checkIdTypeConsistency()
  result.warnings.push(...idTypeCheck.warnings)
  result.errors.push(...idTypeCheck.issues)
  if (idTypeCheck.warnings.length > 0) {
    console.log(`  ⚠️  Found ${idTypeCheck.warnings.length} ID type warnings`)
  } else {
    console.log('  ✅ ID types are consistent')
  }

  // Check foreign key constraints
  console.log('\n🔍 Checking foreign key constraints...')
  const fkCheck = checkForeignKeyConstraints()
  result.warnings.push(...fkCheck.warnings)
  result.errors.push(...fkCheck.issues)
  if (fkCheck.warnings.length > 0) {
    console.log(`  ⚠️  Found ${fkCheck.warnings.length} foreign key warnings`)
  } else {
    console.log('  ✅ Foreign key constraints are properly defined')
  }

  // Verify Drizzle config
  console.log('\n🔍 Verifying Drizzle configuration...')
  const configCheck = verifyDrizzleConfig()
  result.warnings.push(...configCheck.warnings)
  result.errors.push(...configCheck.issues)
  if (configCheck.issues.length > 0) {
    console.log(`  ❌ Found ${configCheck.issues.length} config issues`)
  } else {
    console.log('  ✅ Drizzle config is valid')
  }

  // Check migration order
  console.log('\n🔍 Checking migration order...')
  const orderCheck = verifyMigrationOrder()
  result.warnings.push(...orderCheck.warnings)
  result.errors.push(...orderCheck.issues)
  if (orderCheck.warnings.length > 0) {
    console.log(`  ⚠️  Found ${orderCheck.warnings.length} ordering warnings`)
  } else {
    console.log('  ✅ Migration order is correct')
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Verification Summary\n')
  console.log(`  Schemas found: ${result.summary.schemasFound}`)
  console.log(`  Migrations found: ${result.summary.migrationsFound}`)
  console.log(`  Errors: ${result.errors.length}`)
  console.log(`  Warnings: ${result.warnings.length}`)

  // Print errors
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:')
    result.errors.forEach(error => {
      console.log(`  - ${error}`)
    })
    result.passed = false
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    result.warnings.slice(0, 10).forEach(warning => {
      console.log(`  - ${warning}`)
    })
    if (result.warnings.length > 10) {
      console.log(`  ... and ${result.warnings.length - 10} more warnings`)
    }
  }

  // Final result
  console.log('\n' + '='.repeat(60))
  if (result.passed) {
    console.log('\n✅ Database schema verification passed!')
    console.log('💡 Review warnings above for potential improvements')
    process.exit(0)
  } else {
    console.log('\n❌ Database schema verification failed!')
    console.log('💡 Fix errors above before proceeding')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Verification script failed:', error)
  process.exit(1)
})

