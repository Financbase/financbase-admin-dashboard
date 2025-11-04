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
import { Input } from "@/components/ui/input";
import { 
  Target,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Play,
  Pause,
  Square,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'search' | 'display' | 'social' | 'video' | 'email' | 'retargeting' | 'affiliate';
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  dailyBudget?: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageROAS: number;
  campaignsByStatus: Array<{
    status: string;
    count: number;
    spend: number;
  }>;
  campaignsByPlatform: Array<{
    platform: string;
    count: number;
    spend: number;
    roas: number;
  }>;
}

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");

  // Fetch campaigns data
  const { data: campaignsData, isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['campaigns', searchQuery, statusFilter, typeFilter, platformFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (platformFilter) params.append('platform', platformFilter);

      const response = await fetch(`/api/campaigns?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
  });

  // Fetch campaign stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns/stats');
      if (!response.ok) throw new Error('Failed to fetch campaign stats');
      return response.json();
    },
  });

  const campaigns: Campaign[] = campaignsData?.campaigns || [];
  const stats: CampaignStats = statsData?.stats || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    averageROAS: 0,
    campaignsByStatus: [],
    campaignsByPlatform: [],
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'display':
        return <BarChart3 className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'email':
        return <Target className="h-4 w-4" />;
      case 'retargeting':
        return <TrendingUp className="h-4 w-4" />;
      case 'affiliate':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'completed':
        return <Square className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  if (campaignsLoading || statsLoading) {
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

  if (campaignsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading campaigns: {campaignsError.message}
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
              Campaigns
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your marketing campaigns and track performance
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Campaigns
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalCampaigns}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {stats.activeCampaigns} active
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${stats.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Impressions
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalImpressions.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Across all campaigns
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Average ROAS
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.averageROAS.toFixed(1)}x
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +12% vs last month
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
              <select 
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="search">Search</option>
                <option value="display">Display</option>
                <option value="social">Social</option>
                <option value="video">Video</option>
                <option value="email">Email</option>
                <option value="retargeting">Retargeting</option>
                <option value="affiliate">Affiliate</option>
              </select>
              <select 
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">All Platforms</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter">Twitter</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaigns
                </CardTitle>
                <CardDescription>
                  Manage and monitor your marketing campaigns
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No campaigns found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create your first campaign to get started with marketing automation.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-6 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          {getTypeIcon(campaign.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-lg">{campaign.name}</h3>
                            <Badge
                              variant={getStatusBadgeVariant(campaign.status)}
                              className="text-xs"
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(campaign.status)}
                                {campaign.status}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {campaign.platform} • {campaign.type} • {campaign.startDate} - {campaign.endDate || 'Ongoing'}
                          </p>
                          {campaign.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Budget</p>
                        <p className="font-medium">${campaign.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Spent</p>
                        <p className="font-medium">${campaign.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Impressions</p>
                        <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Clicks</p>
                        <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Conversions</p>
                        <p className="font-medium">{campaign.conversions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">ROAS</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {campaign.roas.toFixed(1)}x
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        {stats.campaignsByPlatform.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>
                  Campaign performance breakdown by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.campaignsByPlatform.map((platform) => (
                    <div key={platform.platform} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{platform.platform}</h4>
                        <Badge variant="outline">{platform.count} campaigns</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Spend:</span>
                          <span className="font-medium">${platform.spend.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">ROAS:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {platform.roas.toFixed(1)}x
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}