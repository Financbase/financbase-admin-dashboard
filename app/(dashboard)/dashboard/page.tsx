"use client";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";

/**
 * FINANCBASE DASHBOARD PAGE
 * 
 * This is the main dashboard for the Financbase financial management system.
 * Features:
 * - AI-powered financial insights
 * - Real-time analytics
 * - Expense and income tracking
 * - Invoice management
 * - Client management
 */
export default function DashboardPage() {
	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">
					Financial Dashboard
				</h2>
				<div className="text-sm text-muted-foreground">
					AI-powered financial insights and analytics
				</div>
			</div>

			{/* Welcome Section */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-green-500"></div>
						<div className="text-sm font-medium">Total Revenue</div>
					</div>
					<div className="text-2xl font-bold">$45,231.89</div>
					<p className="text-xs text-muted-foreground">
						+20.1% from last month
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-blue-500"></div>
						<div className="text-sm font-medium">Active Clients</div>
					</div>
					<div className="text-2xl font-bold">12</div>
					<p className="text-xs text-muted-foreground">
						+2 new this month
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-orange-500"></div>
						<div className="text-sm font-medium">Pending Invoices</div>
					</div>
					<div className="text-2xl font-bold">8</div>
					<p className="text-xs text-muted-foreground">
						$12,450.00 total
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-purple-500"></div>
						<div className="text-sm font-medium">Expenses</div>
					</div>
					<div className="text-2xl font-bold">$2,350.00</div>
					<p className="text-xs text-muted-foreground">
						-5.2% from last month
					</p>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
					<div className="space-y-2">
						<button className="w-full text-left p-3 rounded-lg border hover:bg-muted">
							Create New Invoice
						</button>
						<button className="w-full text-left p-3 rounded-lg border hover:bg-muted">
							Add Expense
						</button>
						<button className="w-full text-left p-3 rounded-lg border hover:bg-muted">
							Add Client
						</button>
					</div>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Invoice #INV-001</span>
							<span className="text-green-600">Paid</span>
						</div>
						<div className="flex justify-between">
							<span>Expense: Office Supplies</span>
							<span className="text-muted-foreground">$45.00</span>
						</div>
						<div className="flex justify-between">
							<span>New Client: Acme Corp</span>
							<span className="text-blue-600">Added</span>
						</div>
					</div>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">AI Insights</h3>
					<div className="space-y-2 text-sm">
						<div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
							💡 Consider increasing your rates by 15%
						</div>
						<div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
							✅ Your cash flow is healthy this month
						</div>
						<div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
							⚠️ Track your business expenses more closely
						</div>
					</div>
				</div>
			</div>

			{/* Migration Status */}
			<div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
				<h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
					✅ Migration Status: Core Infrastructure Complete
				</h3>
				<ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
					<li>✅ Next.js 14.2.18 running without webpack errors</li>
					<li>✅ Authentication (Clerk) middleware configured</li>
					<li>✅ Database (Neon/Drizzle) schemas migrated</li>
					<li>✅ UI foundation with theme variables working</li>
					<li>🔄 Dashboard layout and components in progress</li>
				</ul>
			</div>
		</div>
	);
}