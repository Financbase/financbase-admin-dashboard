/**
 * Row Level Security (RLS) Context Utility
 * 
 * Sets user context for RLS policies to work correctly.
 * This must be called before any database queries that rely on RLS.
 */

import { sql, getRawSqlConnection } from '@/lib/db';

export interface UserContext {
  clerkId: string;
  userId?: string; // financbase.users.id (UUID)
  organizationId?: string; // financbase.users.organization_id (UUID)
  contractorId?: string; // If available from other tables
}

export interface DatabaseUser {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  organization_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Fetch user data from financbase.users table using Clerk ID
 */
export async function getUserFromDatabase(clerkId: string): Promise<DatabaseUser | null> {
  try {
    const result = await sql`
      SELECT 
        id, 
        clerk_id, 
        email, 
        first_name, 
        last_name, 
        role, 
        is_active, 
        organization_id, 
        created_at, 
        updated_at
      FROM financbase.users 
      WHERE clerk_id = ${clerkId} 
      AND is_active = true
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    return result[0] as DatabaseUser;
  } catch (error) {
    console.error('[RLS] Error fetching user from database:', error);
    return null;
  }
}

/**
 * Set RLS context for the current database session
 * This function sets PostgreSQL session variables that RLS policies use
 * Uses raw SQL connection to ensure session variables persist across queries
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
    // This ensures the app continues to work during migrations
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

/**
 * Clear RLS context (useful for testing or admin operations)
 */
export async function clearRLSContext(): Promise<void> {
  try {
    // Use raw SQL connection for session variables
    const rawSql = getRawSqlConnection();
    
    await rawSql`SELECT set_config('app.current_clerk_id', '', true)`;
    await rawSql`SELECT set_config('app.current_user_id', '', true)`;
    await rawSql`SELECT set_config('app.current_org_id', '', true)`;
    await rawSql`SELECT set_config('app.current_contractor_id', '', true)`;
  } catch (error) {
    console.error('[RLS] Error clearing RLS context:', error);
  }
}

