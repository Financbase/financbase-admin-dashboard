/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from "react";
import OverviewStats from "@/components/core/overview-stats";
import { SalesChart, RevenueChart } from "@/components/core/sales-chart";
import RecentOrders from "@/components/core/recent-orders";
import TopProducts from "@/components/core/top-products";
import CustomerAnalytics from "@/components/core/customer-analytics";
import { SupportWidget } from "@/components/shared/support-widget";
import ActivityFeed from "@/components/core/activity-feed";
import FinancialWidgets from "@/components/core/financial-widgets";

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  defaultOrder: number;
  defaultColSpan: 1 | 2 | 3;
  defaultRowSpan?: number;
  canHide: boolean;
  isPermanent?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  header?: React.ReactNode;
}

export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  "financial-overview": {
    id: "financial-overview",
    title: "Financial Overview",
    description: "Your business performance at a glance",
    component: OverviewStats,
    defaultOrder: 0,
    defaultColSpan: 2,
    defaultRowSpan: 2,
    canHide: false,
    isPermanent: true,
  },
  "quick-actions": {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Common tasks and shortcuts",
    component: () => (
      <div className="space-y-2">
        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="text-sm">+ Add Expense</span>
        </button>
        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="text-sm">+ Add Client</span>
        </button>
        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="text-sm">+ Create Invoice</span>
        </button>
      </div>
    ),
    defaultOrder: 1,
    defaultColSpan: 1,
    canHide: true,
  },
  "ai-insights": {
    id: "ai-insights",
    title: "AI Insights",
    description: "Smart recommendations and trends",
    component: () => (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-sm">Revenue up 12% this month</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm">On track for Q4 goals</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm">Customer satisfaction: 94%</span>
        </div>
      </div>
    ),
    defaultOrder: 2,
    defaultColSpan: 1,
    canHide: true,
  },
  "sales-performance": {
    id: "sales-performance",
    title: "Sales Performance",
    description: "Monthly sales trends and analysis",
    component: SalesChart,
    defaultOrder: 3,
    defaultColSpan: 2,
    canHide: true,
  },
  "top-products": {
    id: "top-products",
    title: "Top Products",
    description: "Best performing products and services",
    component: TopProducts,
    defaultOrder: 4,
    defaultColSpan: 2,
    canHide: true,
  },
  "revenue-analysis": {
    id: "revenue-analysis",
    title: "Revenue Analysis",
    description: "Revenue breakdown by category",
    component: RevenueChart,
    defaultOrder: 5,
    defaultColSpan: 2,
    canHide: true,
  },
  "customer-analytics": {
    id: "customer-analytics",
    title: "Customer Analytics",
    description: "Customer insights and demographics",
    component: CustomerAnalytics,
    defaultOrder: 6,
    defaultColSpan: 1,
    canHide: true,
  },
  "recent-activity": {
    id: "recent-activity",
    title: "Recent Activity",
    description: "Latest updates and notifications",
    component: ActivityFeed,
    defaultOrder: 7,
    defaultColSpan: 1,
    canHide: true,
  },
  "support-tickets": {
    id: "support-tickets",
    title: "Support Tickets",
    description: "Customer support and help desk",
    component: () => <SupportWidget component="dashboard" maxDisplay={5} />,
    defaultOrder: 8,
    defaultColSpan: 1,
    canHide: true,
  },
  "recent-orders": {
    id: "recent-orders",
    title: "Recent Orders",
    description: "Latest customer orders and transactions",
    component: RecentOrders,
    defaultOrder: 9,
    defaultColSpan: 3,
    canHide: true,
  },
  "financial-widgets": {
    id: "financial-widgets",
    title: "Financial Widgets",
    description: "Additional financial metrics and tools",
    component: FinancialWidgets,
    defaultOrder: 10,
    defaultColSpan: 3,
    canHide: true,
  },
};

export const DEFAULT_WIDGET_ORDER = Object.values(WIDGET_REGISTRY)
  .sort((a, b) => a.defaultOrder - b.defaultOrder)
  .map((widget) => widget.id);

export function getWidgetConfig(id: string): WidgetConfig | undefined {
  return WIDGET_REGISTRY[id];
}

export function getAllWidgets(): WidgetConfig[] {
  return Object.values(WIDGET_REGISTRY);
}
