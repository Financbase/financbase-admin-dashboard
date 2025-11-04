/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AITaggingService } from '@/lib/ai/image-analysis';
import { auth } from '@clerk/nextjs/server';

// Initialize AI service with environment configuration
const getAIService = () => {
  const provider = (process.env.AI_PROVIDER as any) || 'openai';
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];

  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}`);
  }

  return new AITaggingService({
    provider,
    apiKey,
    model: process.env.AI_MODEL,
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
    timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
  });
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, filename } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Fetch image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Analyze image with AI
    const aiService = getAIService();
    const analysis = await aiService.analyzeImage(imageBuffer, filename);

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        provider: process.env.AI_PROVIDER || 'openai',
        model: process.env.AI_MODEL || 'default',
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('AI analysis failed:', error);

    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        tags: [],
        category: 'General',
        description: 'Analysis unavailable',
        confidence: 0.1
      }
    }, { status: 500 });
  }
}

// Batch analysis endpoint
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { images } = body; // Array of { imageUrl, filename }

    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Images array is required' }, { status: 400 });
    }

    const aiService = getAIService();
    const results = [];

    for (const image of images) {
      try {
        const imageResponse = await fetch(image.imageUrl);
        if (!imageResponse.ok) continue;

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const analysis = await aiService.analyzeImage(imageBuffer, image.filename);

        results.push({
          imageUrl: image.imageUrl,
          filename: image.filename,
          analysis,
        });

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Individual image analysis failed:', image.filename, error);
        results.push({
          imageUrl: image.imageUrl,
          filename: image.filename,
          error: error instanceof Error ? error.message : 'Analysis failed',
          analysis: null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      processed: results.length,
      metadata: {
        provider: process.env.AI_PROVIDER || 'openai',
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Batch AI analysis failed:', error);
    return NextResponse.json({
      error: 'Batch analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
