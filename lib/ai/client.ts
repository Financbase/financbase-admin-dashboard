/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState } from 'react';
import { toast } from 'sonner';

interface AIAnalysisResult {
  tags: string[];
  category?: string;
  description?: string;
  confidence: number;
}

export async function analyzeImageWithAI(imageUrl: string, filename?: string): Promise<AIAnalysisResult | null> {
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        filename,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.analysis) {
      return data.analysis;
    } else {
      console.warn('AI analysis returned no results:', data);
      return null;
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

export async function analyzeImagesBatch(imageUrls: { url: string; filename?: string }[]): Promise<AIAnalysisResult[]> {
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: imageUrls,
      }),
    });

    if (!response.ok) {
      throw new Error(`Batch AI analysis failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.results) {
      return data.results.map((result: any) =>
        result.analysis || {
          tags: [],
          category: 'General',
          description: 'Analysis unavailable',
          confidence: 0.1,
        }
      );
    } else {
      return imageUrls.map(() => ({
        tags: [],
        category: 'General',
        description: 'Analysis unavailable',
        confidence: 0.1,
      }));
    }
  } catch (error) {
    console.error('Batch AI analysis error:', error);
    return imageUrls.map(() => ({
      tags: [],
      category: 'General',
      description: 'Analysis unavailable',
      confidence: 0.1,
    }));
  }
}
