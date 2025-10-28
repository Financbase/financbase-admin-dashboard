import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const campaignId = searchParams.get('campaignId');
    const platform = searchParams.get('platform');

    // Mock analytics data - in production, this would come from your analytics service
    const analyticsData = {
      overview: {
        totalImpressions: 1250000,
        totalClicks: 25000,
        totalConversions: 1250,
        totalSpend: 45000,
        averageCTR: 2.0,
        averageCPC: 1.8,
        averageCPM: 36.0,
        conversionRate: 5.0,
        roas: 3.2
      },
      performanceMetrics: {
        impressions: {
          current: 1250000,
          previous: 1100000,
          change: 13.6
        },
        clicks: {
          current: 25000,
          previous: 22000,
          change: 13.6
        },
        conversions: {
          current: 1250,
          previous: 1100,
          change: 13.6
        },
        spend: {
          current: 45000,
          previous: 40000,
          change: 12.5
        }
      },
      campaignPerformance: [
        {
          id: 'CAMP-001',
          name: 'Q4 Product Launch',
          platform: 'Facebook',
          impressions: 450000,
          clicks: 9000,
          conversions: 450,
          spend: 18000,
          roas: 3.5,
          ctr: 2.0,
          cpc: 2.0,
          cpm: 40.0
        },
        {
          id: 'CAMP-002',
          name: 'Holiday Sale Campaign',
          platform: 'Google Ads',
          impressions: 380000,
          clicks: 7600,
          conversions: 380,
          spend: 15200,
          roas: 3.0,
          ctr: 2.0,
          cpc: 2.0,
          cpm: 40.0
        },
        {
          id: 'CAMP-003',
          name: 'Brand Awareness',
          platform: 'Instagram',
          impressions: 250000,
          clicks: 5000,
          conversions: 250,
          spend: 10000,
          roas: 2.8,
          ctr: 2.0,
          cpc: 2.0,
          cpm: 40.0
        },
        {
          id: 'CAMP-004',
          name: 'Retargeting Campaign',
          platform: 'Facebook',
          impressions: 170000,
          clicks: 3400,
          conversions: 170,
          spend: 6800,
          roas: 3.8,
          ctr: 2.0,
          cpc: 2.0,
          cpm: 40.0
        }
      ],
      platformBreakdown: [
        {
          platform: 'Facebook',
          impressions: 620000,
          clicks: 12400,
          conversions: 620,
          spend: 24800,
          roas: 3.65,
          share: 49.6
        },
        {
          platform: 'Google Ads',
          impressions: 380000,
          clicks: 7600,
          conversions: 380,
          spend: 15200,
          roas: 3.0,
          share: 30.4
        },
        {
          platform: 'Instagram',
          impressions: 250000,
          clicks: 5000,
          conversions: 250,
          spend: 10000,
          roas: 2.8,
          share: 20.0
        }
      ],
      dailyMetrics: [
        { date: '2024-01-01', impressions: 45000, clicks: 900, conversions: 45, spend: 1800 },
        { date: '2024-01-02', impressions: 42000, clicks: 840, conversions: 42, spend: 1680 },
        { date: '2024-01-03', impressions: 48000, clicks: 960, conversions: 48, spend: 1920 },
        { date: '2024-01-04', impressions: 51000, clicks: 1020, conversions: 51, spend: 2040 },
        { date: '2024-01-05', impressions: 39000, clicks: 780, conversions: 39, spend: 1560 },
        { date: '2024-01-06', impressions: 36000, clicks: 720, conversions: 36, spend: 1440 },
        { date: '2024-01-07', impressions: 44000, clicks: 880, conversions: 44, spend: 1760 },
        { date: '2024-01-08', impressions: 47000, clicks: 940, conversions: 47, spend: 1880 },
        { date: '2024-01-09', impressions: 43000, clicks: 860, conversions: 43, spend: 1720 },
        { date: '2024-01-10', impressions: 46000, clicks: 920, conversions: 46, spend: 1840 },
        { date: '2024-01-11', impressions: 49000, clicks: 980, conversions: 49, spend: 1960 },
        { date: '2024-01-12', impressions: 52000, clicks: 1040, conversions: 52, spend: 2080 },
        { date: '2024-01-13', impressions: 45000, clicks: 900, conversions: 45, spend: 1800 },
        { date: '2024-01-14', impressions: 48000, clicks: 960, conversions: 48, spend: 1920 },
        { date: '2024-01-15', impressions: 51000, clicks: 1020, conversions: 51, spend: 2040 }
      ],
      conversionFunnel: [
        { stage: 'Impressions', count: 1250000, percentage: 100 },
        { stage: 'Clicks', count: 25000, percentage: 2.0 },
        { stage: 'Landing Page Views', count: 20000, percentage: 1.6 },
        { stage: 'Add to Cart', count: 5000, percentage: 0.4 },
        { stage: 'Checkout Started', count: 2500, percentage: 0.2 },
        { stage: 'Conversions', count: 1250, percentage: 0.1 }
      ],
      audienceInsights: {
        demographics: {
          ageGroups: [
            { age: '18-24', percentage: 15, impressions: 187500 },
            { age: '25-34', percentage: 35, impressions: 437500 },
            { age: '35-44', percentage: 25, impressions: 312500 },
            { age: '45-54', percentage: 15, impressions: 187500 },
            { age: '55+', percentage: 10, impressions: 125000 }
          ],
          genders: [
            { gender: 'Male', percentage: 55, impressions: 687500 },
            { gender: 'Female', percentage: 45, impressions: 562500 }
          ]
        },
        interests: [
          { interest: 'Technology', percentage: 30, impressions: 375000 },
          { interest: 'Business', percentage: 25, impressions: 312500 },
          { interest: 'Finance', percentage: 20, impressions: 250000 },
          { interest: 'Marketing', percentage: 15, impressions: 187500 },
          { interest: 'E-commerce', percentage: 10, impressions: 125000 }
        ]
      },
      topPerformingAds: [
        {
          id: 'AD-001',
          name: 'Product Demo Video',
          campaign: 'Q4 Product Launch',
          impressions: 150000,
          clicks: 3000,
          conversions: 150,
          spend: 6000,
          roas: 3.5,
          ctr: 2.0
        },
        {
          id: 'AD-002',
          name: 'Holiday Sale Banner',
          campaign: 'Holiday Sale Campaign',
          impressions: 120000,
          clicks: 2400,
          conversions: 120,
          spend: 4800,
          roas: 3.0,
          ctr: 2.0
        },
        {
          id: 'AD-003',
          name: 'Brand Story Carousel',
          campaign: 'Brand Awareness',
          impressions: 100000,
          clicks: 2000,
          conversions: 100,
          spend: 4000,
          roas: 2.8,
          ctr: 2.0
        }
      ],
      attributionData: {
        firstClick: {
          'Organic Search': 25,
          'Direct': 20,
          'Social Media': 15,
          'Email': 10,
          'Paid Search': 15,
          'Display': 10,
          'Referral': 5
        },
        lastClick: {
          'Paid Search': 30,
          'Direct': 25,
          'Social Media': 20,
          'Email': 10,
          'Organic Search': 10,
          'Display': 3,
          'Referral': 2
        }
      }
    };

    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing analytics' },
      { status: 500 }
    );
  }
}
