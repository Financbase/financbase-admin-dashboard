"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  MoreHorizontal,
  Calendar,
  Clock,
  Star,
  Target,
  Zap,
  Brain,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  BarChart3 as BarChart3Icon,
  Wallet,
  Receipt,
  FileText,
  PieChart as PieChartIcon,
  LineChart,
  BarChart,
  TrendingUp as TrendingUpChart,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  ShoppingCart as ShoppingCartIcon,
  CreditCard as CreditCardIcon,
  Activity as ActivityIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Star as StarIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  Brain as BrainIcon,
  Lightbulb as LightbulbIcon,
  Eye as EyeIcon,
  Plus as PlusIcon,
  MoreHorizontal as MoreHorizontalIcon,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon
} from "lucide-react";
import OverviewStats from "./overview-stats";
import { SalesChart, RevenueChart } from "./sales-chart";
import RecentOrders from "./recent-orders";
import TopProducts from "./top-products";
import CustomerAnalytics from "./customer-analytics";
import { SupportWidget } from "./support-widget";
import ActivityFeed from "./activity-feed";
import FinancialWidgets from "./financial-widgets";
import { DashboardSearch } from "./dashboard-search";
import { useCounter, useLocalStorage } from "@/hooks";

export default function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dashboardPreferences, setDashboardPreferences] = useLocalStorage('dashboard-preferences', {
    showQuickActions: true,
    showAIInsights: true,
    showSupportTickets: true
  })
  const { count: refreshCount, increment: refreshDashboard } = useCounter(0)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Here you would typically filter your dashboard data based on the search query
    console.log('Searching for:', query)
  }

	return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights and comprehensive financial overview
          </p>
				</div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
          <Button variant="outline">
            <EyeIcon className="mr-2 h-4 w-4" />
            View Reports
          </Button>
				</div>
			</div>

      {/* Search Bar */}
      <div className="max-w-md">
        <DashboardSearch 
          onSearch={handleSearch}
          placeholder="Search transactions, clients, or reports..."
        />
      </div>

      {/* Bento Grid Layout */}
      <BentoGrid className="max-w-7xl mx-auto">
        {/* Financial Overview - Large */}
        <BentoGridItem
          title="Financial Overview"
          description="Your business performance at a glance"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSignIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Portfolio Value</span>
              </div>
              <Badge variant="secondary" className="text-green-600">
                +8.5%
              </Badge>
            </div>
          }
          className="md:col-span-2 md:row-span-2"
        >
          <OverviewStats />
        </BentoGridItem>

        {/* Quick Actions */}
        {dashboardPreferences.showQuickActions && (
          <BentoGridItem
            title="Quick Actions"
            description="Common tasks and shortcuts"
            header={
              <div className="flex items-center space-x-2">
                <ZapIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Actions</span>
              </div>
            }
            className="md:col-span-1"
          >
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline" size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm">
                <UsersIcon className="mr-2 h-4 w-4" />
                Add Client
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm">
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </BentoGridItem>
        )}

        {/* AI Insights */}
        <BentoGridItem
          title="AI Insights"
          description="Smart recommendations and trends"
          header={
            <div className="flex items-center space-x-2">
              <BrainIcon className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">AI Analysis</span>
            </div>
          }
          className="md:col-span-1"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <LightbulbIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Revenue up 12% this month</span>
            </div>
            <div className="flex items-center space-x-2">
              <TargetIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm">On track for Q4 goals</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Customer satisfaction: 94%</span>
            </div>
          </div>
        </BentoGridItem>

        {/* Sales Performance */}
        <BentoGridItem
          title="Sales Performance"
          description="Monthly sales trends and analysis"
          header={
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Sales Chart</span>
            </div>
          }
          className="md:col-span-2"
        >
          <SalesChart />
        </BentoGridItem>

        {/* Top Products */}
        <BentoGridItem
          title="Top Products"
          description="Best performing products and services"
          header={
            <div className="flex items-center space-x-2">
              <StarIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Top Performers</span>
            </div>
          }
          className="md:col-span-1"
        >
					<TopProducts />
        </BentoGridItem>

        {/* Revenue Analysis */}
        <BentoGridItem
          title="Revenue Analysis"
          description="Revenue breakdown by category"
          header={
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Revenue Chart</span>
				</div>
          }
          className="md:col-span-2"
        >
          <RevenueChart />
        </BentoGridItem>

        {/* Customer Analytics */}
        <BentoGridItem
          title="Customer Analytics"
          description="Customer insights and demographics"
          header={
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium">Customer Data</span>
            </div>
          }
          className="md:col-span-1"
        >
					<CustomerAnalytics />
        </BentoGridItem>

        {/* Recent Activity */}
        <BentoGridItem
          title="Recent Activity"
          description="Latest updates and notifications"
          header={
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Activity Feed</span>
            </div>
          }
          className="md:col-span-1"
        >
					<ActivityFeed />
        </BentoGridItem>

        {/* Support Tickets */}
        <BentoGridItem
          title="Support Tickets"
          description="Customer support and help desk"
          header={
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Support</span>
            </div>
          }
          className="md:col-span-1"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Open Tickets</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resolved Today</span>
              <Badge variant="secondary">7</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Response Time</span>
              <Badge variant="outline">2.4h</Badge>
				</div>
			</div>
        </BentoGridItem>

        {/* Recent Orders - Full Width */}
        <BentoGridItem
          title="Recent Orders"
          description="Latest customer orders and transactions"
          header={
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Order History</span>
            </div>
          }
          className="md:col-span-3"
        >
          <RecentOrders />
        </BentoGridItem>

        {/* Financial Widgets - Full Width */}
        <BentoGridItem
          title="Financial Widgets"
          description="Additional financial metrics and tools"
          header={
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Financial Tools</span>
            </div>
          }
          className="md:col-span-3"
        >
				<FinancialWidgets />
        </BentoGridItem>
      </BentoGrid>
		</div>
	);
}