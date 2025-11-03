"use client";

import { useTopProducts } from "@/hooks/use-dashboard-data-optimized";
import {
	Key,
	LayoutDashboard,
	TrendingDown,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import EmptyState, { EmptyStates } from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";

interface Product {
	id: string;
	name: string;
	category: string;
	sales: number;
	revenue: number;
	growth: number;
	revenue_formatted: string;
	growth_formatted: string;
}

export default function TopProducts() {
	const [sortBy, setSortBy] = useState<"sales" | "revenue" | "growth">("sales");
	const { data: products, loading, error } = useTopProducts(sortBy, 5);

	if (loading) {
		return (
			<div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
					<div className="space-y-4">
						{[...new Array(5)].map((_, i) => (
							<div key={i} className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<DashboardErrorBoundary>
				<div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
					<EmptyState
						title="Failed to load products"
						description="Unable to fetch top products. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!products || products.length === 0) {
		return (
			<div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-border">
				<EmptyState {...EmptyStates.products} />
			</div>
		);
	}

	return (
		<DashboardErrorBoundary>
			<div className="w-full">
				<div className="flex items-center justify-between mb-6">
					<div className="flex gap-2">
						<select
							value={sortBy}
							onChange={(e) =>
								setSortBy(e.target.value as "sales" | "revenue" | "growth")
							}
							className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						>
							<option value="sales">By Sales</option>
							<option value="revenue">By Revenue</option>
							<option value="growth">By Growth</option>
						</select>
						<button
							type="button"
							onClick={() => (window.location.href = "/products")}
							className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
						>
							View all
						</button>
					</div>
				</div>
				<div className="space-y-4 w-full">
					{products.map((product, index) => (
						<div
							key={product.id}
							className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors w-full"
						>
							<div className="flex items-start space-x-3 min-w-0 flex-1">
								<div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5">
									{index + 1}
								</div>
								<div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400">
										{product.name.charAt(0).toUpperCase()}
									</span>
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-gray-900 dark:text-white break-words leading-tight">
										{product.name}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 break-words mt-0.5">
										{product.category}
									</p>
								</div>
							</div>
							<div className="text-right flex-shrink-0 ml-2">
								<p className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
									{product.revenue_formatted}
								</p>
								<div className="flex items-center justify-end gap-2 mt-0.5">
									<span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
										{product.sales} sold
									</span>
									<div className="flex items-center gap-0.5">
										{product.growth > 0 ? (
											<TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
										) : (
											<TrendingDown className="h-3 w-3 text-red-500 flex-shrink-0" />
										)}
										<span
											className={`text-xs whitespace-nowrap ${
												product.growth > 0
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{product.growth_formatted}
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</DashboardErrorBoundary>
	);
}
