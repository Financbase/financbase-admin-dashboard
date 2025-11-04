/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Target,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  overview: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    averageCTR: number;
    averageCPC: number;
    averageCPM: number;
    conversionRate: number;
    roas: number;
  };
  performanceMetrics: {
    impressions: { current: number; previous: number; change: number };
    clicks: { current: number; previous: number; change: number };
    conversions: { current: number; previous: number; change: number };
    spend: { current: number; previous: number; change: number };
  };
  campaignPerformance: Array<{
    id: string;
    name: string;
    platform: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    roas: number;
    ctr: number;
    cpc: number;
    cpm: number;
  }>;
  platformBreakdown: Array<{
    platform: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    roas: number;
    share: number;
  }>;
  dailyMetrics: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  topPerformingAds: Array<{
    id: string;
    name: string;
    campaign: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    roas: number;
    ctr: number;
  }>;
}

export default function MarketingAnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("impressions");

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['marketing-analytics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/marketing/analytics?dateRange=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      return response.json();
    },
  });

  const analytics: AnalyticsData = analyticsData?.analytics || {
    overview: {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalSpend: 0,
      averageCTR: 0,
      averageCPC: 0,
      averageCPM: 0,
      conversionRate: 0,
      roas: 0
    },
    performanceMetrics: {
      impressions: { current: 0, previous: 0, change: 0 },
      clicks: { current: 0, previous: 0, change: 0 },
      conversions: { current: 0, previous: 0, change: 0 },
      spend: { current: 0, previous: 0, change: 0 }
    },
    campaignPerformance: [],
    platformBreakdown: [],
    dailyMetrics: [],
    conversionFunnel: [],
    topPerformingAds: []
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading analytics: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Marketing Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Analyze campaign performance and marketing metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Impressions
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.overview.totalImpressions.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getChangeIcon(analytics.performanceMetrics.impressions.change)}
                    <span className={`text-sm ${getChangeColor(analytics.performanceMetrics.impressions.change)}`}>
                      {Math.abs(analytics.performanceMetrics.impressions.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Clicks
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.overview.totalClicks.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getChangeIcon(analytics.performanceMetrics.clicks.change)}
                    <span className={`text-sm ${getChangeColor(analytics.performanceMetrics.clicks.change)}`}>
                      {Math.abs(analytics.performanceMetrics.clicks.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <MousePointer className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Conversions
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.overview.totalConversions.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getChangeIcon(analytics.performanceMetrics.conversions.change)}
                    <span className={`text-sm ${getChangeColor(analytics.performanceMetrics.conversions.change)}`}>
                      {Math.abs(analytics.performanceMetrics.conversions.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    ROAS
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.overview.roas.toFixed(1)}x
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ${analytics.overview.totalSpend.toLocaleString()} spent
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  CTR (Click-Through Rate)
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics.overview.averageCTR.toFixed(2)}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Industry avg: 2.0%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  CPC (Cost Per Click)
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${analytics.overview.averageCPC.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Industry avg: $2.50
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  CPM (Cost Per Mille)
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${analytics.overview.averageCPM.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Industry avg: $40.00
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Conversion Rate
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {analytics.overview.conversionRate.toFixed(2)}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Industry avg: 3.0%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Top performing campaigns by ROAS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.campaignPerformance.map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{campaign.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{campaign.roas.toFixed(1)}x ROAS</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ${campaign.spend.toLocaleString()} spent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Breakdown</CardTitle>
              <CardDescription>
                Performance by advertising platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.platformBreakdown.map((platform) => (
                  <div key={platform.platform} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{platform.platform}</h4>
                      <Badge variant="outline">{platform.share.toFixed(1)}%</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Impressions</p>
                        <p className="font-medium">{platform.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">ROAS</p>
                        <p className="font-medium text-green-600">{platform.roas.toFixed(1)}x</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Clicks</p>
                        <p className="font-medium">{platform.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Spend</p>
                        <p className="font-medium">${platform.spend.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              User journey from impression to conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{stage.stage}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {stage.count.toLocaleString()}
                      </span>
                      <span className="text-sm font-medium">{stage.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Ads */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Ads</CardTitle>
            <CardDescription>
              Best performing individual advertisements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Ad Name</th>
                    <th className="text-left p-4 font-medium text-sm">Campaign</th>
                    <th className="text-left p-4 font-medium text-sm">Impressions</th>
                    <th className="text-left p-4 font-medium text-sm">Clicks</th>
                    <th className="text-left p-4 font-medium text-sm">Conversions</th>
                    <th className="text-right p-4 font-medium text-sm">ROAS</th>
                    <th className="text-right p-4 font-medium text-sm">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPerformingAds.map((ad) => (
                    <tr key={ad.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{ad.name}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{ad.campaign}</td>
                      <td className="p-4 text-sm">{ad.impressions.toLocaleString()}</td>
                      <td className="p-4 text-sm">{ad.clicks.toLocaleString()}</td>
                      <td className="p-4 text-sm">{ad.conversions.toLocaleString()}</td>
                      <td className="p-4 text-sm text-right font-medium text-green-600">
                        {ad.roas.toFixed(1)}x
                      </td>
                      <td className="p-4 text-sm text-right">{ad.ctr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}