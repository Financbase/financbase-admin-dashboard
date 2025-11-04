/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { LeadManagementService } from '@/lib/services/lead-management-service';
import { db } from '@/lib/db';
import { users, organizations } from '@/lib/db/schemas';
import { eq, sql } from 'drizzle-orm';

// Clerk webhook secret - should be set in environment variables
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || '';

/**
 * Verify the actual database schema for organizations.id
 * Returns the actual type found in the database
 */
async function verifyOrganizationIdType(): Promise<'uuid' | 'integer' | 'unknown'> {
  try {
    // Query the information_schema to check the actual column type
    const result = await db.execute(sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'organizations' 
        AND column_name = 'id'
      LIMIT 1
    `);

    if (result.rows && result.rows.length > 0) {
      const dataType = (result.rows[0] as any)?.data_type;
      if (dataType === 'uuid') return 'uuid';
      if (dataType === 'integer' || dataType === 'bigint') return 'integer';
      return 'unknown';
    }
    return 'unknown';
  } catch (error) {
    console.error('Error verifying organization ID type:', error);
    return 'unknown';
  }
}

/**
 * Validate that organizationId is a valid UUID format
 */
function isValidUUID(value: any): boolean {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Get or create a default organization for new users
 * If no default organization exists, creates one
 * Includes type validation and error handling for schema mismatches
 */
async function getOrCreateDefaultOrganization(): Promise<string> {
  try {
    // Verify the actual database schema type
    const actualType = await verifyOrganizationIdType();
    
    // First, try to find an existing default organization
    // Check by name since slug might not exist in database
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, 'Default Organization'))
      .limit(1);

    if (existingOrg.length > 0) {
      const orgId = existingOrg[0].id;
      
      // Validate type based on actual database schema
      if (actualType === 'uuid' && !isValidUUID(orgId)) {
        console.error('Schema mismatch: Expected UUID but got:', typeof orgId, orgId);
        throw new Error(`Schema type mismatch: organizations.id should be UUID but value is ${typeof orgId}`);
      }
      
      if (actualType === 'integer' && typeof orgId !== 'number') {
        console.error('Schema mismatch: Expected integer but got:', typeof orgId, orgId);
        throw new Error(`Schema type mismatch: organizations.id should be integer but value is ${typeof orgId}`);
      }
      
      // Return the organization's ID as string (for UUID) or convert to UUID format
      return String(orgId);
    }

    // If no default organization exists, create one
    // Note: Schema definition says serial/integer, but migrations show UUID
    // This function handles both cases based on actual database type
    let newOrg;
    try {
      newOrg = await db
        .insert(organizations)
        .values({
          name: 'Default Organization',
          description: 'Default organization for new users',
          // Note: slug is optional and may not exist in database schema
        } as any)
        .returning();
    } catch (insertError: any) {
      // Check for type-related errors
      if (insertError.message?.includes('type') || insertError.message?.includes('invalid input')) {
        console.error('Type mismatch error when creating organization:', {
          error: insertError.message,
          actualDatabaseType: actualType,
          schemaDefinition: 'serial (integer)',
          expectedType: actualType === 'uuid' ? 'UUID string' : 'integer',
        });
        throw new Error(`Organization creation failed due to type mismatch. Database type: ${actualType}, Schema definition: serial. Please fix schema definition.`);
      }
      throw insertError;
    }

    if (newOrg.length === 0) {
      throw new Error('Failed to create default organization');
    }

    const orgId = newOrg[0].id;
    
    // Log type information for debugging
    console.log('Created organization with ID:', {
      id: orgId,
      type: typeof orgId,
      actualDatabaseType: actualType,
      isValidUUID: isValidUUID(String(orgId)),
    });

    // Return the organization ID as string
    return String(orgId);
  } catch (error: any) {
    console.error('Error getting/creating default organization:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: error.constructor.name,
    });
    throw new Error(`Failed to get or create default organization: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const svix_id = request.headers.get('svix-id');
    const svix_timestamp = request.headers.get('svix-timestamp');
    const svix_signature = request.headers.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Get the body
    const payload = await request.text();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
      };
    };

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // Handle the webhook
    const { type, data } = evt;

    if (type === 'user.created') {
      try {
        // Extract user information from Clerk webhook
        const user = data;
        const email = user.email_addresses?.[0]?.email_address;
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const clerkUserId = user.id;

        if (!email) {
          console.error('No email found in user.created webhook');
          return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        // Check if user already exists in database
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUserId))
          .limit(1);

        let dbUser;
        if (existingUser.length === 0) {
          // User doesn't exist, create a new user record
          try {
            // Get or create default organization
            // Note: This is a temporary solution - in production, you should handle
            // the organization assignment more carefully (maybe during onboarding)
            const defaultOrgId = await getOrCreateDefaultOrganization();

            // Validate organizationId format before inserting
            if (!isValidUUID(defaultOrgId)) {
              console.error('Invalid organizationId format:', {
                orgId: defaultOrgId,
                type: typeof defaultOrgId,
                isValid: isValidUUID(defaultOrgId),
              });
              throw new Error(`Invalid organizationId format: expected UUID, got ${typeof defaultOrgId}`);
            }

            // Create user in database
            let newUsers;
            try {
              newUsers = await db
                .insert(users)
                .values({
                  clerkId: clerkUserId,
                  email: email,
                  firstName: firstName || null,
                  lastName: lastName || null,
                  role: 'user',
                  isActive: true,
                  organizationId: defaultOrgId,
                })
                .returning();
            } catch (insertError: any) {
              // Enhanced error handling for type mismatches
              if (insertError.message?.includes('type') || 
                  insertError.message?.includes('invalid input') ||
                  insertError.message?.includes('uuid') ||
                  insertError.code === '22P02') { // PostgreSQL invalid input syntax error
                console.error('Type mismatch error when creating user:', {
                  error: insertError.message,
                  errorCode: insertError.code,
                  organizationId: defaultOrgId,
                  organizationIdType: typeof defaultOrgId,
                  organizationIdValidUUID: isValidUUID(defaultOrgId),
                  userSchema: {
                    organizationId: 'uuid (required)',
                  },
                });
                throw new Error(`User creation failed due to type mismatch. OrganizationId: ${defaultOrgId} (${typeof defaultOrgId}). Error: ${insertError.message}`);
              }
              throw insertError;
            }

            if (newUsers.length === 0) {
              throw new Error('Failed to create user in database - no user returned');
            }

            dbUser = newUsers[0];
            console.log('User created in database:', {
              userId: dbUser.id,
              clerkId: dbUser.clerkId,
              email: dbUser.email,
              organizationId: dbUser.organizationId,
            });
          } catch (userError: any) {
            console.error('Error creating user in database:', {
              error: userError.message,
              errorCode: userError.code,
              clerkUserId,
              email,
              isTypeMismatch: userError.message?.includes('type') || userError.message?.includes('mismatch'),
              stack: process.env.NODE_ENV === 'development' ? userError.stack : undefined,
            });
            
            // Check if this is a duplicate/unique constraint error (user might have been created in parallel)
            if (userError.message?.includes('duplicate') || 
                userError.message?.includes('unique') ||
                userError.code === '23505') { // PostgreSQL unique violation
              // Try to fetch the existing user
              try {
                const existingUserRetry = await db
                  .select()
                  .from(users)
                  .where(eq(users.clerkId, clerkUserId))
                  .limit(1);
                
                if (existingUserRetry.length > 0) {
                  dbUser = existingUserRetry[0];
                  console.log('User already exists (race condition handled):', dbUser.id);
                }
              } catch (retryError) {
                console.error('Error retrying user fetch:', retryError);
              }
            }
            
            // Continue with lead creation even if user creation fails
            // The user can be created manually or via a migration later
            if (!userError.message?.includes('duplicate') && 
                !userError.message?.includes('unique') &&
                userError.code !== '23505') {
              console.warn('User creation failed, but continuing with lead creation. User may need manual creation.');
            }
          }
        } else {
          dbUser = existingUser[0];
          console.log('User already exists in database:', {
            userId: dbUser.id,
            clerkId: dbUser.clerkId,
            email: dbUser.email,
          });
        }

        // Create a lead from the signup
        try {
          const lead = await LeadManagementService.createLead({
            userId: dbUser?.id || clerkUserId, // Use database user ID if available, fallback to Clerk ID
            firstName,
            lastName,
            email,
            source: 'signup',
            priority: 'high', // New signups are high priority
            notes: 'Lead created from user signup',
            metadata: {
              clerkUserId: clerkUserId,
              signupMethod: 'email',
              createdAt: new Date().toISOString(),
              webhookEvent: 'user.created',
            },
          });

          console.log('Lead created from signup:', lead.id);
        } catch (leadError) {
          console.error('Error creating lead from signup:', leadError);
          // Don't fail the webhook if lead creation fails
        }

        return NextResponse.json({ 
          success: true, 
          message: 'User registration processed',
          userId: dbUser?.id,
          clerkUserId: clerkUserId
        });

      } catch (error: any) {
        console.error('Error processing user.created webhook:', error);
        // Don't fail the webhook - log the error but return success
        // This prevents webhook retries for non-critical errors
        return NextResponse.json({ 
          success: false, 
          error: error.message || 'Failed to process user creation',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
      }
    }

    // Handle other webhook events if needed
    console.log(`Received webhook event: ${type}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
