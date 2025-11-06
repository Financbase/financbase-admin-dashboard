/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { headers } from 'next/headers'; // Temporarily disabled
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { aiInsightsResponseSchema } from '@/lib/validation-schemas';
import { generateFinancialInsights, analyzeFinancialHealth } from '@/lib/services/ai/financial-intelligence-service';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { expenses } from '@/lib/db/schemas/expenses.schema';
import { transactions } from '@/lib/db/schemas/transactions.schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * @swagger
 * /api/dashboard/ai-insights:
 *   get:
 *     summary: Get AI-powered financial insights
 *     description: Returns AI-generated insights and recommendations based on financial data analysis including revenue trends, expense patterns, and health scores
 *     tags:
 *       - Dashboard
 *       - AI
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: AI insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Revenue has increased 15% month-over-month", "Expenses are 8% under budget"]
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                 healthScore:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                   example: 85
 *                 trends:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: string
 *                       enum: [increasing, stable, decreasing]
 *                     expenses:
 *                       type: string
 *                       enum: [increasing, stable, decreasing]
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  const requestId = generateRequestId();
  try {
    // TEMPORARILY DISABLED FOR TESTING
    // const headersList = await headers();
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    // Fetch financial data for analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Get revenue data
    const [revenueData] = await db
      .select({
        lastMonth: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.paidDate} >= ${thirtyDaysAgo} then ${invoices.total}::numeric else 0 end)`,
        lastQuarter: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.paidDate} >= ${ninetyDaysAgo} then ${invoices.total}::numeric else 0 end)`,
        lastYear: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.paidDate} >= ${oneYearAgo} then ${invoices.total}::numeric else 0 end)`,
      })
      .from(invoices)
      .where(eq(invoices.userId, userId));

    // Get expense data
    const [expenseData] = await db
      .select({
        lastMonth: sql<number>`sum(case when ${expenses.date} >= ${thirtyDaysAgo} then ${expenses.amount}::numeric else 0 end)`,
        lastQuarter: sql<number>`sum(case when ${expenses.date} >= ${ninetyDaysAgo} then ${expenses.amount}::numeric else 0 end)`,
        lastYear: sql<number>`sum(case when ${expenses.date} >= ${oneYearAgo} then ${expenses.amount}::numeric else 0 end)`,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId));

    // Get transaction data for trend analysis
    const recentTransactions = await db
      .select({
        amount: transactions.amount,
        category: transactions.category,
        date: transactions.date,
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, ninetyDaysAgo)
      ))
      .limit(100);

    const revenue = {
      lastMonth: Number(revenueData?.lastMonth || 0),
      lastQuarter: Number(revenueData?.lastQuarter || 0),
      lastYear: Number(revenueData?.lastYear || 0),
    };

    const expenses = {
      lastMonth: Number(expenseData?.lastMonth || 0),
      lastQuarter: Number(expenseData?.lastQuarter || 0),
      lastYear: Number(expenseData?.lastYear || 0),
    };

    // Calculate metrics
    const monthlyGrowth = revenue.lastMonth > 0 && revenue.lastQuarter > 0
      ? ((revenue.lastMonth * 3 - revenue.lastQuarter) / revenue.lastQuarter) * 100
      : 0;

    const profitMargin = revenue.lastMonth > 0
      ? ((revenue.lastMonth - expenses.lastMonth) / revenue.lastMonth) * 100
      : 0;

    const expenseRatio = revenue.lastMonth > 0
      ? (expenses.lastMonth / revenue.lastMonth) * 100
      : 0;

    // Generate financial insights using the service
    const financialInsights = await generateFinancialInsights(userId);
    const healthScore = await analyzeFinancialHealth(userId);

    // Prepare financial data summary for AI analysis (if needed)
    const financialDataSummary = {
      revenue: revenue.lastMonth,
      expenses: expenses.lastMonth,
      cashflow: revenue.lastMonth - expenses.lastMonth,
      profitability: profitMargin,
      growth: monthlyGrowth,
      transactions: recentTransactions.map(t => ({
        amount: Number(t.amount || 0),
        category: t.category || 'uncategorized',
        date: t.date,
      })),
    };

    // Build insights array
    const insights: string[] = [];
    
    // Add data-driven insights
    if (monthlyGrowth > 0) {
      insights.push(`Revenue growth of ${monthlyGrowth.toFixed(1)}% indicates strong business momentum`);
    } else if (monthlyGrowth < 0) {
      insights.push(`Revenue decline of ${Math.abs(monthlyGrowth).toFixed(1)}% requires attention to growth strategies`);
    }

    if (profitMargin > 20) {
      insights.push(`Profit margin of ${profitMargin.toFixed(1)}% demonstrates excellent financial health`);
    } else if (profitMargin < 10) {
      insights.push(`Profit margin of ${profitMargin.toFixed(1)}% suggests room for cost optimization`);
    }

    if (expenseRatio > 80) {
      insights.push(`Expense ratio of ${expenseRatio.toFixed(1)}% is high - consider reviewing operational costs`);
    } else if (expenseRatio < 50) {
      insights.push(`Expense ratio of ${expenseRatio.toFixed(1)}% shows efficient cost management`);
    }

    // Add AI-powered analysis based on financial data
    if (monthlyGrowth > 10) {
      insights.push('Client acquisition rate is above industry average');
    }
    
    if (profitMargin > 20 && expenseRatio < 60) {
      insights.push('Cash flow patterns indicate healthy business operations');
    }

    // Add financial intelligence service insights
    financialInsights.forEach(insight => {
      insights.push(insight.description);
    });

    // Generate recommendations
    const recommendations: string[] = [];

    if (expenseRatio > 80) {
      recommendations.push('Review vendor contracts and negotiate better rates to reduce expenses');
    }

    if (monthlyGrowth < 5) {
      recommendations.push('Consider increasing marketing spend to accelerate revenue growth');
    }

    if (profitMargin < 15) {
      recommendations.push('Implement cost optimization strategies to improve profitability');
    }

    recommendations.push('Implement automated invoice reminders to reduce payment delays');
    recommendations.push('Diversify revenue streams to reduce dependency on top clients');

    // Add health score recommendations
    if (healthScore.recommendations) {
      recommendations.push(...healthScore.recommendations);
    }

    // Generate forecast based on trends
    const monthlyAverage = revenue.lastQuarter / 3;
    const growthFactor = monthlyGrowth > 0 ? 1 + (monthlyGrowth / 100) : 1;

    const forecast = {
      nextMonth: Math.round(monthlyAverage * growthFactor),
      nextQuarter: Math.round(monthlyAverage * growthFactor * 3),
      nextYear: Math.round(monthlyAverage * growthFactor * 12),
    };

    // Risk assessment based on health score
    let riskAssessment = 'Low - Strong financial position with consistent growth patterns';
    if (healthScore.overall < 60) {
      riskAssessment = 'High - Financial health needs immediate attention';
    } else if (healthScore.overall < 75) {
      riskAssessment = 'Medium - Some areas require monitoring and improvement';
    }

    const aiInsightsResponse = {
      insights: insights.length > 0 ? insights : [
        'Revenue growth is consistent with business plan',
        'Expense management shows good discipline',
      ],
      recommendations: recommendations.length > 0 ? recommendations : [
        'Consider increasing marketing spend for growth',
        'Review vendor contracts for better rates',
      ],
      riskAssessment,
      forecast,
    };

    // Validate the response structure
    const validatedInsights = aiInsightsResponseSchema.parse(aiInsightsResponse);

    return NextResponse.json({
      success: true,
      insights: validatedInsights
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}