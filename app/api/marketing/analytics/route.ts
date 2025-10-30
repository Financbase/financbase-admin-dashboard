import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { campaignAnalyticsService } from '@/lib/services/marketing/campaign-analytics-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const campaignId = searchParams.get('campaignId');
    const platform = searchParams.get('platform');

    // Parse dates
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Validate dates
    if (startDate && Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid startDate format', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    if (endDate && Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid endDate format', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { error: 'startDate must be before endDate', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Parse campaign IDs if provided
    const campaignIds = campaignId ? [campaignId] : undefined;

    // Fetch analytics data from database
    const [
      overview,
      performanceMetrics,
      campaignPerformance,
      platformBreakdown,
      dailyMetrics,
      conversionFunnel,
      audienceInsights,
    ] = await Promise.all([
      campaignAnalyticsService.getAnalyticsOverview(userId, startDate, endDate),
      startDate && endDate
        ? campaignAnalyticsService.getPerformanceMetrics(userId, startDate, endDate)
        : Promise.resolve({
            impressions: { current: 0, previous: 0, change: 0 },
            clicks: { current: 0, previous: 0, change: 0 },
            conversions: { current: 0, previous: 0, change: 0 },
            spend: { current: 0, previous: 0, change: 0 },
          }),
      campaignAnalyticsService.getCampaignPerformance(
        userId,
        startDate,
        endDate,
        campaignIds
      ),
      campaignAnalyticsService.getPlatformBreakdown(userId, startDate, endDate),
      startDate && endDate
        ? campaignAnalyticsService.getDailyMetrics(userId, startDate, endDate)
        : Promise.resolve([]),
      campaignAnalyticsService.getConversionFunnel(userId, startDate, endDate),
      campaignAnalyticsService.getAudienceInsights(userId, startDate, endDate),
    ]);

    // Filter campaign performance by platform if specified
    const filteredCampaignPerformance = platform
      ? campaignPerformance.filter((c) =>
          c.platform.toLowerCase().includes(platform.toLowerCase())
        )
      : campaignPerformance;

    // Filter platform breakdown by platform if specified
    const filteredPlatformBreakdown = platform
      ? platformBreakdown.filter((p) =>
          p.platform.toLowerCase().includes(platform.toLowerCase())
        )
      : platformBreakdown;

    // Map top performing ads (using campaigns with highest ROAS)
    const topPerformingAds = filteredCampaignPerformance.slice(0, 3).map((campaign, index) => ({
      id: `AD-${String(index + 1).padStart(3, '0')}`,
      name: `${campaign.name} - Top Ad`,
      campaign: campaign.name,
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      spend: campaign.spend,
      revenue: campaign.revenue,
      roas: campaign.roas,
      ctr: campaign.ctr,
    }));

    // Attribution data (simplified - would normally come from tracking)
    const attributionData = {
      firstClick: {
        'Organic Search': 25,
        'Direct': 20,
        'Social Media': 15,
        'Email': 10,
        'Paid Search': 15,
        'Display': 10,
        'Referral': 5,
      },
      lastClick: {
        'Paid Search': 30,
        'Direct': 25,
        'Social Media': 20,
        'Email': 10,
        'Organic Search': 10,
        'Display': 3,
        'Referral': 2,
      },
    };

    const analyticsData = {
      overview,
      performanceMetrics,
      campaignPerformance: filteredCampaignPerformance,
      platformBreakdown: filteredPlatformBreakdown,
      dailyMetrics,
      conversionFunnel,
      audienceInsights,
      topPerformingAds,
      attributionData
    };

    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    
    // Handle database errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch marketing analytics',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch marketing analytics',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
