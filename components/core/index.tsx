"use client";

// Removed unused imports

import { SupportWidget } from "@/components/shared/support-widget";
import { memo } from "react";
import ActivityFeed from "./activity-feed";
import CustomerAnalytics from "./customer-analytics";
import FinancialWidgets from "./financial-widgets";
import OverviewStats from "./overview-stats";
import RecentOrders from "./recent-orders";
import { RevenueChart, SalesChart } from "./sales-chart";
import TopProducts from "./top-products";
import QuickActions from "./quick-actions";
import AIInsights from "./ai-insights";

const DashboardContent = memo(function DashboardContent() {
	return (
		<div className="space-y-4 sm:space-y-6 w-full min-w-0" data-testid="dashboard-content">
			{/* Dashboard Header */}
			<div className="mb-6 sm:mb-8" data-testid="dashboard-header">
				<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Financial Dashboard
				</h2>
				<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
					AI-powered financial insights and analytics
				</p>
			</div>

			{/* Quick Actions */}
			<div data-testid="quick-actions">
				<QuickActions />
			</div>

			{/* Overview Stats */}
			<div data-testid="overview-stats">
				<OverviewStats />
			</div>

			{/* Charts Row - Stack on mobile, side by side on desktop */}
			<div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2" data-testid="charts-section">
				<div className="w-full min-w-0" data-testid="sales-chart">
					<SalesChart />
				</div>
				<div className="w-full min-w-0" data-testid="revenue-chart">
					<RevenueChart />
				</div>
			</div>

			{/* Main Content Grid - Stack on mobile, responsive grid on larger screens */}
			<div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3" data-testid="main-content-grid">
				{/* Left Column - Full width on mobile, 2/3 width on desktop */}
				<div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full min-w-0" data-testid="left-column">
					<div data-testid="recent-orders">
						<RecentOrders />
					</div>
					<div data-testid="top-products">
						<TopProducts />
					</div>
				</div>

				{/* Right Column - Full width on mobile, 1/3 width on desktop */}
				<div className="space-y-4 sm:space-y-6 w-full min-w-0" data-testid="right-column">
					<div data-testid="ai-insights">
						<AIInsights />
					</div>
					<div data-testid="customer-analytics">
						<CustomerAnalytics />
					</div>
					<div data-testid="support-widget">
						<SupportWidget component="dashboard" maxDisplay={3} />
					</div>
					<div data-testid="activity-feed">
						<ActivityFeed />
					</div>
				</div>
			</div>

			{/* Financial Overview Section */}
			<div className="mt-6 sm:mt-8" data-testid="financial-overview">
				<h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-1">
					Financial Overview
				</h2>
				<div data-testid="financial-widgets">
					<FinancialWidgets />
				</div>
			</div>
		</div>
	);
});

export default DashboardContent;
