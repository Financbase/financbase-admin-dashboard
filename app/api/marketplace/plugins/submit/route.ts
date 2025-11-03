import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { marketplacePlugins } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';

/**
 * Generate a unique slug from plugin name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * POST /api/marketplace/plugins/submit
 * Submit a new plugin to the marketplace
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      version = '1.0.0',
      author,
      authorEmail,
      authorWebsite,
      category,
      tags = [],
      icon,
      screenshots = [],
      features = [],
      requirements = {},
      compatibility = {},
      isFree = true,
      price,
      currency = 'USD',
      license = 'Proprietary',
      pluginFile, // URL from UploadThing
      manifest = {},
      permissions = [],
      entryPoint, // Required: main plugin file path
      dependencies = [],
      minPlatformVersion,
    } = body;

    // Validate required fields
    if (!name || !description || !author || !category || !pluginFile || !entryPoint) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['name', 'description', 'author', 'category', 'pluginFile', 'entryPoint']
        },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists
    const existingSlug = await db
      .select()
      .from(marketplacePlugins)
      .where(eq(marketplacePlugins.slug, slug))
      .limit(1);

    // Make slug unique if needed
    while (existingSlug.length > 0) {
      slug = `${baseSlug}-${counter}`;
      const checkSlug = await db
        .select()
        .from(marketplacePlugins)
        .where(eq(marketplacePlugins.slug, slug))
        .limit(1);
      if (checkSlug.length === 0) break;
      counter++;
    }

    // Build manifest object
    const pluginManifest = {
      name,
      version,
      entryPoint: entryPoint || 'index.js',
      dependencies: Array.isArray(dependencies) ? dependencies : [],
      permissions: Array.isArray(permissions) ? permissions : [],
      minPlatformVersion: minPlatformVersion || null,
      createdBy: userId, // Store creator ID in manifest for tracking
      ...manifest,
    };

    // Create plugin record with pending status
    // Note: Since schema uses isApproved, we set it to false for pending
    const newPlugin = await db
      .insert(marketplacePlugins)
      .values({
        name,
        slug,
        description,
        shortDescription: shortDescription || description.substring(0, 150),
        version,
        author,
        authorEmail: authorEmail || null,
        authorWebsite: authorWebsite || null,
        category: category.toLowerCase(),
        tags: Array.isArray(tags) ? tags : [],
        icon: icon || null,
        screenshots: Array.isArray(screenshots) ? screenshots : [],
        features: Array.isArray(features) ? features : [],
        requirements: typeof requirements === 'object' ? requirements : {},
        compatibility: typeof compatibility === 'object' ? compatibility : {},
        isFree,
        price: isFree ? null : (price ? Math.round(price * 100) : null), // Convert to cents
        currency,
        license,
        pluginFile,
        manifest: pluginManifest,
        permissions: Array.isArray(permissions) ? permissions : [],
        isApproved: false, // Pending approval
        isActive: true,
        isOfficial: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      plugin: newPlugin[0],
      message: 'Plugin submitted successfully. It will be reviewed by an administrator.',
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting plugin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle unique constraint violations
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'A plugin with this name already exists. Please choose a different name.',
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit plugin',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
