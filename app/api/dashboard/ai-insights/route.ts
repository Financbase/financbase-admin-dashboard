import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { aiInsightsResponseSchema } from '@/lib/validation-schemas';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Mock AI insights data for now
    // In a real implementation, this would call an AI service or analyze financial data
    const mockInsights = {
      insights: [
        'Revenue growth is consistent with business plan',
        'Expense management shows good discipline',
        'Client acquisition rate is above industry average',
        'Cash flow patterns indicate healthy business operations'
      ],
      recommendations: [
        'Consider increasing marketing spend for growth',
        'Review vendor contracts for better rates',
        'Implement automated invoice reminders to reduce payment delays',
        'Diversify revenue streams to reduce dependency on top clients'
      ],
      riskAssessment: 'Low - Strong financial position with consistent growth patterns',
      forecast: {
        nextMonth: 22000,
        nextQuarter: 66000,
        nextYear: 264000
      }
    };

    // Validate the response structure
    const validatedInsights = aiInsightsResponseSchema.parse(mockInsights);

    return NextResponse.json({
      success: true,
      insights: validatedInsights
    });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}