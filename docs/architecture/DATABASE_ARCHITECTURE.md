# Database Architecture

## Overview

The Financbase Admin Dashboard uses **PostgreSQL** (Neon Serverless) as the primary database, managed through **Drizzle ORM 0.36.4** for type-safe database operations. The system implements comprehensive **Row Level Security (RLS)** with 221 secured tables, ensuring user data isolation and multi-tenant security.

## Database Technology Stack

### Core Components

- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM 0.36.4
- **Migration Tool**: Drizzle Kit 0.31.5
- **Driver**: `@neondatabase/serverless` 0.10.4
- **Connection**: HTTP-based serverless connection

### Connection Configuration

```1:125:lib/db/index.ts
import 'server-only';

// Database connection utilities with dual driver support
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import * as schema from './schemas/index';

// Raw SQL connection for session variables and raw queries
let rawSql: ReturnType<typeof neon> | null = null;

/**
 * Get raw Neon SQL connection for executing session variables and raw SQL
 */
export function getRawSqlConnection(): ReturnType<typeof neon> {
 if (!rawSql) {
  if (!process.env.DATABASE_URL) {
   throw new Error('DATABASE_URL is required for raw SQL connection');
  }
  rawSql = neon(process.env.DATABASE_URL);
 }
 return rawSql;
}

// Environment-based driver selection
const getDatabaseDriver = () => {
 if (process.env.NODE_ENV === 'production') {
  return process.env.DATABASE_DRIVER || 'neon-http';
 }
 return process.env.DATABASE_DRIVER || 'neon-serverless';
};

// Create database connection based on environment
const createDatabaseConnection = () => {
 const driver = getDatabaseDriver();
 
 if (!process.env.DATABASE_URL) {
  throw new Error(
   'DATABASE_URL is required but not set. Please ensure your .env.local file contains DATABASE_URL.'
  );
 }
 
 switch (driver) {
  case 'neon-http': {
   const sql = neon(process.env.DATABASE_URL);
   return drizzle(sql, { schema });
  }
   
  case 'neon-serverless': {
   const neonSql = neon(process.env.DATABASE_URL);
   return drizzleNode(neonSql, { schema });
  }
   
  case 'postgres': {
   // Fallback to neon-http for postgres driver to avoid pg module issues
   console.warn('Postgres driver not available in browser, falling back to neon-http');
   const sql = neon(process.env.DATABASE_URL);
   return drizzle(sql, { schema });
  }
   
  default:
   throw new Error(`Unsupported database driver: ${driver}`);
 }
};

// Lazy-loaded database connection to ensure env vars are loaded
type DatabaseInstance = ReturnType<typeof createDatabaseConnection>;
let dbInstance: DatabaseInstance | null = null;

// Lazy getter for database instance
const getDb = (): DatabaseInstance => {
 if (!dbInstance) {
  dbInstance = createDatabaseConnection();
 }
 return dbInstance;
};

// Export database instance with lazy initialization
export const db = new Proxy({} as DatabaseInstance, {
 get(_target, prop) {
  return getDb()[prop as keyof DatabaseInstance];
 }
});
```

### Drizzle Configuration

```1:14:drizzle.config.ts
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

export default defineConfig({
 schema: "./lib/db/schemas/index.ts",
 out: "./drizzle/migrations", // Use the migrations folder that matches the database
 dialect: "postgresql",
 dbCredentials: {
  url: process.env.DATABASE_URL!,
 },
});
```

## Schema Organization

### Schema Structure

```
lib/db/schemas/
├── index.ts                  # Main schema export
├── users.schema.ts          # User management
├── organizations.schema.ts  # Organization/tenant data
├── transactions.schema.ts   # Financial transactions
├── invoices.schema.ts       # Invoice management
├── expenses.schema.ts      # Expense tracking
├── accounts.schema.ts       # Bank accounts
├── clients.schema.ts       # Client management
├── projects.schema.ts      # Project management
├── workflows.schema.ts     # Workflow automation
├── plugins.schema.ts       # Marketplace plugins
└── ... (40+ schema files)
```

### Schema Example: Users

```1:24:lib/db/schemas/users.schema.ts
import {
 pgTable,
 text,
 timestamp,
 uuid,
 boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("financbase.users", {
 id: uuid("id").primaryKey().defaultRandom(),
 clerkId: text("clerk_id").notNull().unique(),
 email: text("email").notNull().unique(),
 firstName: text("first_name"),
 lastName: text("last_name"),
 role: text("role", { enum: ["admin", "user", "viewer"] }).notNull().default("user"),
 isActive: boolean("is_active").notNull().default(true),
 organizationId: uuid("organization_id").notNull(),
 createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Schema Example: Transactions

```1:35:lib/db/schemas/transactions.schema.ts
import {
 pgTable,
 text,
 timestamp,
 uuid,
 numeric,
 jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const transactions = pgTable("transactions", {
 id: uuid("id").primaryKey().defaultRandom(),
 userId: uuid("user_id").notNull().references(() => users.id),
 transactionNumber: text("transaction_number").notNull().unique(),
 type: text("type").notNull(), // 'income', 'expense', 'transfer', 'payment'
 amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
 currency: text("currency").default("USD"),
 description: text("description"),
 category: text("category"),
 status: text("status").default("pending"), // 'pending', 'completed', 'failed', 'cancelled'
 paymentMethod: text("payment_method"),
 referenceId: text("reference_id"), // Links to invoice, expense, or other entity
 referenceType: text("reference_type"), // 'invoice', 'expense', 'transfer', etc.
 accountId: uuid("account_id"), // Bank account or payment method
 transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull().defaultNow(),
 processedAt: timestamp("processed_at", { withTimezone: true }),
 notes: text("notes"),
 metadata: jsonb("metadata"), // JSON object for additional data
 createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
 updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
```

### Schema Exports

```1:100:lib/db/schemas/index.ts
// Core database schemas for Financbase Admin Dashboard

// User management
export * from "./users.schema";

// User Preferences System
export * from "./preferences.schema";

// Organization management
export * from "./organizations.schema";

// Financial entities
export * from "./invoices.schema";
export * from "./expenses.schema";
export * from "./clients.schema";
export * from "./transactions.schema";
export * from "./accounts.schema";
export * from "./payment-methods.schema";
export * from "./payments.schema";

// Freelance Hub
export * from "./projects.schema";
export * from "./time-entries.schema";
export * from "./tasks.schema";
export * from "./freelancers.schema";

// Adboard
export * from "./campaigns.schema";
export * from "./ad-groups.schema";
export * from "./ads.schema";

// Marketing Analytics
export * from "./marketing-analytics.schema";

// Lead Management
export * from "./leads.schema";
export * from "./lead-activities.schema";
export * from "./lead-tasks.schema";

// Analytics and reporting
export * from "./analytics.schema";
export * from "./reports.schema";

// Real Estate
export * from "./real-estate.schema";
```

## Row Level Security (RLS)

### RLS Overview

**221 tables** have Row Level Security enabled, ensuring:

- User data isolation
- Multi-tenant data separation
- Organization-level access control
- Automatic filtering based on user context

### RLS Context Management

```10:124:lib/db/rls-context.ts
export interface UserContext {
  clerkId: string;
  userId?: string; // financbase.users.id (UUID)
  organizationId?: string; // financbase.users.organization_id (UUID)
  contractorId?: string; // If available from other tables
}

/**
 * Set RLS context for the current database session
 * This function sets PostgreSQL session variables that RLS policies use
 */
export async function setRLSContext(context: UserContext): Promise<void> {
  try {
    // Use raw SQL connection for session variables to ensure they persist
    const rawSql = getRawSqlConnection();

    // Set clerk_id (always available from Clerk auth)
    await rawSql`SELECT set_config('app.current_clerk_id', ${context.clerkId}, false)`;

    // Set user_id if available (financbase.users.id)
    if (context.userId) {
      await rawSql`SELECT set_config('app.current_user_id', ${context.userId}, false)`;
    }

    // Set organization_id if available
    if (context.organizationId) {
      await rawSql`SELECT set_config('app.current_org_id', ${context.organizationId}, false)`;
    }

    // Set contractor_id if available
    if (context.contractorId) {
      await rawSql`SELECT set_config('app.current_contractor_id', ${context.contractorId}, false)`;
    }
  } catch (error) {
    console.error('[RLS] Error setting RLS context:', error);
    // Don't throw - allow queries to proceed without RLS if context setting fails
  }
}

/**
 * Convenience function: Set RLS context from Clerk user ID
 * Fetches user from database and sets all available context
 */
export async function setRLSContextFromClerkId(clerkId: string): Promise<boolean> {
  try {
    const user = await getUserFromDatabase(clerkId);
    
    if (!user) {
      console.warn(`[RLS] User not found in database for Clerk ID: ${clerkId}`);
      // Still set clerk_id so partial RLS can work
      await setRLSContext({ clerkId });
      return false;
    }

    await setRLSContext({
      clerkId: user.clerk_id,
      userId: user.id,
      organizationId: user.organization_id || undefined,
    });

    return true;
  } catch (error) {
    console.error('[RLS] Error setting context from Clerk ID:', error);
    return false;
  }
}
```

### RLS Policy Pattern

RLS policies use PostgreSQL session variables set by `setRLSContext()`:

```sql
-- Example RLS Policy Structure
CREATE POLICY table_select_policy ON schema.table 
  FOR SELECT USING (
    user_id = current_setting('app.current_user_id', true)::uuid
    OR 
    organization_id = current_setting('app.current_org_id', true)::uuid
  );

CREATE POLICY table_insert_policy ON schema.table 
  FOR INSERT WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
  );

CREATE POLICY table_update_policy ON schema.table 
  FOR UPDATE USING (
    user_id = current_setting('app.current_user_id', true)::uuid
  );

CREATE POLICY table_delete_policy ON schema.table 
  FOR DELETE USING (
    user_id = current_setting('app.current_user_id', true)::uuid
  );
```

### RLS Security Status

According to documentation:

- ✅ **221 tables** have RLS enabled
- ✅ **0 vulnerable tables** remaining
- ✅ All critical financial data is protected
- ✅ User-based access control implemented
- ✅ Organization isolation enforced

## Database Queries

### Query Patterns with Drizzle

#### Basic Select Query

```typescript
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

// Simple select
const user = await db
  .select()
  .from(users)
  .where(eq(users.clerkId, clerkUserId))
  .limit(1);
```

#### Complex Query with Joins

```typescript
import { db } from '@/lib/db';
import { transactions, accounts, users } from '@/lib/db/schemas';
import { eq, and, gte, desc } from 'drizzle-orm';

const recentTransactions = await db
  .select({
    transaction: transactions,
    account: accounts,
    user: users,
  })
  .from(transactions)
  .innerJoin(accounts, eq(transactions.accountId, accounts.id))
  .innerJoin(users, eq(transactions.userId, users.id))
  .where(
    and(
      eq(transactions.userId, userId),
      gte(transactions.transactionDate, startDate)
    )
  )
  .orderBy(desc(transactions.transactionDate))
  .limit(50);
```

#### Raw SQL Queries

For complex queries or session variables:

```typescript
import { sql } from 'drizzle-orm';

const result = await sql`
  SELECT 
    COUNT(*) as total,
    SUM(amount) as total_amount
  FROM transactions
  WHERE user_id = current_setting('app.current_user_id', true)::uuid
  AND transaction_date >= NOW() - INTERVAL '30 days'
`;
```

## Migrations

### Migration Management

Migrations are managed through Drizzle Kit:

**Generate Migration:**

```bash
pnpm db:generate
```

**Apply Migration:**

```bash
pnpm db:push  # Push schema changes directly
# OR
pnpm db:migrate  # Run migration files
```

**Migration Files Location:**

```
drizzle/migrations/
├── 0000_daily_siren.sql
├── 0001_thankful_cloak.sql
├── meta/
│   └── _journal.json
└── ...
```

### Migration Pattern

Drizzle generates SQL migration files automatically:

```sql
-- drizzle/migrations/0001_example.sql
CREATE TABLE IF NOT EXISTS "financbase"."users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "clerk_id" text NOT NULL UNIQUE,
  "email" text NOT NULL UNIQUE,
  "first_name" text,
  "last_name" text,
  "role" text NOT NULL DEFAULT 'user',
  "is_active" boolean NOT NULL DEFAULT true,
  "organization_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE "financbase"."users" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_select_policy" ON "financbase"."users"
  FOR SELECT USING (
    id = current_setting('app.current_user_id', true)::uuid
    OR organization_id = current_setting('app.current_org_id', true)::uuid
  );
```

### Migration Scripts

Package.json includes migration commands:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Connection Pooling

### Serverless Connection Strategy

Neon Serverless uses HTTP-based connections:

- **No persistent connections** - each request is independent
- **Connection pooling handled by Neon** - automatic scaling
- **HTTP protocol** - works in serverless environments
- **Low latency** - optimized for cold starts

### Connection Health Check

```98:109:lib/db/index.ts
// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
 try {
  const database = getDb();
  // Simple health check query using raw SQL
  const result = await database.execute(sql`SELECT 1 as health_check`);
  return result.rows.length > 0;
 } catch (error) {
  console.error('Database health check failed:', error);
  return false;
 }
}
```

## Multi-Tenancy

### Organization-Based Isolation

Users belong to organizations, and data is isolated at the organization level:

```typescript
// Users belong to organizations
users.organizationId → organizations.id

// Transactions are user-scoped, but can be filtered by organization
transactions.userId → users.id → users.organizationId
```

### Tenant Data Access Pattern

```typescript
// RLS automatically filters by organization
const transactions = await db
  .select()
  .from(transactions)
  .where(eq(transactions.userId, userId));
// RLS policies ensure only organization's data is returned
```

## Indexes

### Index Strategy

Indexes are created for:

- Primary keys (automatic)
- Foreign keys
- Frequently queried columns (user_id, organization_id)
- Search columns (email, transaction_number)
- Date ranges (transaction_date, created_at)

### Index Example

```sql
-- Index for user-based queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Index for date range queries
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

-- Composite index for common query patterns
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
```

## Query Optimization

### Best Practices

1. **Use RLS context** - Always set RLS before queries
2. **Select only needed columns** - Avoid `SELECT *`
3. **Use indexes** - Query on indexed columns
4. **Limit results** - Use `.limit()` for pagination
5. **Use joins efficiently** - Prefer inner joins when possible
6. **Avoid N+1 queries** - Batch related queries

### Query Performance Monitoring

```typescript
const startTime = Date.now();
const results = await db.select().from(transactions);
const duration = Date.now() - startTime;

if (duration > 1000) {
  console.warn(`Slow query detected: ${duration}ms`);
}
```

## Backup and Recovery

### Neon Serverless Backups

Neon provides:

- **Point-in-time recovery** - Automatic backups every minute
- **Branch-based backups** - Database branches for testing
- **Manual snapshots** - On-demand backups

### Backup Strategy

1. **Automatic Backups**: Neon handles continuous backups
2. **Point-in-Time Recovery**: Restore to any point in the last 7 days
3. **Manual Snapshots**: Create before major migrations
4. **Branch Testing**: Use database branches for safe testing

## Best Practices

### Schema Design

1. **Use UUIDs** for primary keys (better for distributed systems)
2. **Include timestamps** (`created_at`, `updated_at`)
3. **Use enums** for fixed value sets
4. **Add indexes** on foreign keys and frequently queried columns
5. **Enable RLS** on all user-data tables

### Migration Best Practices

1. **Test migrations** in development first
2. **Create backups** before production migrations
3. **Use transactions** for multi-step migrations
4. **Review generated SQL** before applying
5. **Document schema changes** in migration comments

### RLS Best Practices

1. **Always set RLS context** before queries
2. **Use `withRLS()` helper** in API routes
3. **Test RLS policies** with different user contexts
4. **Monitor RLS performance** - policies shouldn't slow queries significantly
5. **Document RLS policies** in schema comments

## Related Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Security Architecture](./SECURITY_ARCHITECTURE.md)
- [Database Security Guidelines](../database/security-guidelines.md)
- [RLS Integration Guide](../rls-integration-guide.md)
- [Database Quick Reference](../database/quick-reference.md)
