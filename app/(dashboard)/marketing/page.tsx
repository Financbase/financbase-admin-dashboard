/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Megaphone, 
  Target,
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  MousePointer,
  DollarSign,
  Calendar
} from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing Hub - Financbase",
  description: "Complete marketing automation and campaign management",
};

const marketingStats = [
  {
    name: "Active Campaigns",
    value: "12",
    change: "+3",
    changeType: "positive",
    icon: Megaphone,
  },
  {
    name: "Total Leads",
    value: "1,247",
    change: "+156",
    changeType: "positive",
    icon: Users,
  },
  {
    name: "Conversion Rate",
    value: "8.4%",
    change: "+1.2%",
    changeType: "positive",
    icon: Target,
  },
  {
    name: "ROI",
    value: "340%",
    change: "+45%",
    changeType: "positive",
    icon: TrendingUp,
  },
];

const campaigns = [
  {
    id: "CAMP-001",
    name: "Q4 Product Launch",
    platform: "Facebook",
    status: "active",
    budget: "$5,000",
    spent: "$3,200",
    impressions: "125K",
    clicks: "2,400",
    conversions: "89",
    roas: "2.8x",
    startDate: "2024-10-01",
    endDate: "2024-12-31"
  },
  {
    id: "CAMP-002",
    name: "Holiday Sale Campaign",
    platform: "Google Ads",
    status: "active",
    budget: "$8,000",
    spent: "$4,500",
    impressions: "98K",
    clicks: "1,800",
    conversions: "156",
    roas: "3.2x",
    startDate: "2024-11-15",
    endDate: "2024-12-25"
  },
  {
    id: "CAMP-003",
    name: "Brand Awareness",
    platform: "Instagram",
    status: "paused",
    budget: "$3,000",
    spent: "$1,800",
    impressions: "67K",
    clicks: "890",
    conversions: "23",
    roas: "1.9x",
    startDate: "2024-09-01",
    endDate: "2024-11-30"
  },
  {
    id: "CAMP-004",
    name: "Retargeting Campaign",
    platform: "Facebook",
    status: "completed",
    budget: "$2,500",
    spent: "$2,500",
    impressions: "45K",
    clicks: "1,200",
    conversions: "67",
    roas: "2.1x",
    startDate: "2024-08-01",
    endDate: "2024-09-30"
  }
];

const quickActions = [
  {
    title: "Create Campaign",
    description: "Launch a new marketing campaign",
    icon: Plus,
    href: "/marketing/campaigns/new",
    color: "bg-blue-500",
  },
  {
    title: "View Analytics",
    description: "Analyze campaign performance",
    icon: BarChart3,
    href: "/marketing/analytics",
    color: "bg-green-500",
  },
  {
    title: "Lead Management",
    description: "Manage and qualify leads",
    icon: Users,
    href: "/marketing/leads",
    color: "bg-purple-500",
  },
  {
    title: "Automation",
    description: "Set up marketing automation",
    icon: Zap,
    href: "/marketing/automation",
    color: "bg-orange-500",
  },
];

export default function MarketingHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Marketing Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Complete marketing automation and campaign management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketingStats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <stat.icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common marketing tasks and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Campaigns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Active Campaigns
                    </CardTitle>
                    <CardDescription>
                      Current marketing campaigns and performance
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{campaign.name}</h4>
                            <Badge
                              variant={campaign.status === "active" ? "default" : campaign.status === "paused" ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {campaign.platform} • {campaign.startDate} - {campaign.endDate}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Budget</p>
                          <p className="font-medium">{campaign.budget}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Spent</p>
                          <p className="font-medium">{campaign.spent}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Impressions</p>
                          <p className="font-medium">{campaign.impressions}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">ROAS</p>
                          <p className="font-medium text-green-600 dark:text-green-400">{campaign.roas}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Marketing Modules Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Modules</CardTitle>
              <CardDescription>
                Access all marketing features and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Target className="h-6 w-6" />
                  <span>Campaigns</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Lead Management</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Zap className="h-6 w-6" />
                  <span>Automation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
