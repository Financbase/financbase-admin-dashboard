"use client";

import { useAccountBalances } from "@/hooks/use-dashboard-data-optimized";
import { formatRelativeTime } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import {
	ArrowDownLeft,
	ArrowRight,
	ArrowUpRight,
	Clock,
	CreditCard,
	DollarSign,
	Key,
	LayoutDashboard,
	type LucideIcon,
	ShoppingCart,
	Wallet,
	XCircle,
} from "lucide-react";
import EmptyState, { EmptyStates } from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";

interface Transaction {
	id: string;
	title: string;
	amount: number;
	type: "incoming" | "outgoing";
	category: string;
	icon: LucideIcon;
	timestamp: string;
	status: "completed" | "pending" | "failed";
}

interface List02Props {
	className?: string;
}

const getTransactionIcon = (category: string): LucideIcon => {
	switch (category.toLowerCase()) {
		case "shopping":
		case "retail":
			return ShoppingCart;
		case "salary":
		case "income":
		case "deposit":
			return Wallet;
		case "subscription":
		case "entertainment":
		case "bills":
			return CreditCard;
		default:
			return Wallet;
	}
};

export default function List02({ className }: List02Props) {
	const { data: financialData, loading, error } = useAccountBalances();

	if (loading) {
		return (
			<div
				className={cn(
					"w-full max-w-full mx-auto",
					"bg-white dark:bg-zinc-900/70",
					"border border-zinc-100 dark:border-zinc-800",
					"rounded-lg sm:rounded-xl shadow-sm backdrop-blur-xl",
					className,
				)}
			>
				<div className="animate-pulse">
					<div className="p-3 sm:p-4">
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
						<div className="space-y-2">
							{[...new Array(5)].map((_, i) => (
								<div key={i} className="flex items-center space-x-3">
									<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
									<div className="flex-1 space-y-1">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<DashboardErrorBoundary>
				<div
					className={cn(
						"w-full max-w-full mx-auto",
						"bg-white dark:bg-zinc-900/70",
						"border border-zinc-100 dark:border-zinc-800",
						"rounded-lg sm:rounded-xl shadow-sm backdrop-blur-xl",
						className,
					)}
				>
					<EmptyState
						title="Failed to load transactions"
						description="Unable to fetch recent transactions. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!financialData?.transactions || financialData.transactions.length === 0) {
		return (
			<div
				className={cn(
					"w-full max-w-full mx-auto",
					"bg-white dark:bg-zinc-900/70",
					"border border-zinc-100 dark:border-zinc-800",
					"rounded-lg sm:rounded-xl shadow-sm backdrop-blur-xl",
					className,
				)}
			>
				<EmptyState {...EmptyStates.transactions} />
			</div>
		);
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(Math.abs(amount));
	};

	const transactions: Transaction[] = financialData.transactions.map(
		(transaction) => ({
			id: transaction.id,
			title: transaction.description,
			amount: transaction.amount,
			type: transaction.amount > 0 ? "incoming" : "outgoing",
			category: transaction.category,
			icon: getTransactionIcon(transaction.category),
			timestamp: formatRelativeTime(new Date(transaction.createdAt)),
			status: transaction.status as "completed" | "pending" | "failed",
		}),
	);
	return (
		<DashboardErrorBoundary>
			<div
				className={cn(
					"w-full max-w-full mx-auto",
					"bg-white dark:bg-zinc-900/70",
					"border border-zinc-100 dark:border-zinc-800",
					"rounded-lg sm:rounded-xl shadow-sm backdrop-blur-xl",
					className,
				)}
			>
				<div className="p-3 sm:p-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
						<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
							Recent Activity
							<span className="text-xs font-normal text-zinc-600 dark:text-zinc-400 ml-1">
								({transactions.length})
							</span>
						</h2>
						<span className="text-xs text-zinc-600 dark:text-zinc-400">
							This Month
						</span>
					</div>

					<div className="space-y-1">
						{transactions.map((transaction) => (
							<div
								key={transaction.id}
								className={cn(
									"group flex items-center gap-3",
									"p-2 rounded-lg",
									"hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
									"transition-all duration-200",
								)}
							>
								<div
									className={cn(
										"p-2 rounded-lg flex-shrink-0",
										"bg-zinc-100 dark:bg-zinc-800",
										"border border-zinc-200 dark:border-zinc-700",
									)}
								>
									<transaction.icon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
								</div>

								<div className="flex-1 flex items-center justify-between min-w-0">
									<div className="space-y-0.5 min-w-0 flex-1">
										<h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
											{transaction.title}
										</h3>
										<p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
											{transaction.timestamp}
										</p>
									</div>

									<div className="flex items-center gap-1.5 pl-3 flex-shrink-0">
										<span
											className={cn(
												"text-xs font-medium",
												transaction.type === "incoming"
													? "text-emerald-600 dark:text-emerald-400"
													: "text-red-600 dark:text-red-400",
											)}
										>
											{transaction.type === "incoming" ? "+" : "-"}
											{formatCurrency(transaction.amount)}
										</span>
										{transaction.type === "incoming" ? (
											<ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
										) : (
											<ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
					<button
						type="button"
						onClick={() => (window.location.href = "/transactions")}
						className={cn(
							"w-full flex items-center justify-center gap-2",
							"py-2 px-3 rounded-lg",
							"text-xs font-medium",
							"bg-gradient-to-r from-zinc-900 to-zinc-800",
							"dark:from-zinc-50 dark:to-zinc-200",
							"text-zinc-50 dark:text-zinc-900",
							"hover:from-zinc-800 hover:to-zinc-700",
							"dark:hover:from-zinc-200 dark:hover:to-zinc-300",
							"shadow-sm hover:shadow",
							"transform transition-all duration-200",
							"hover:-translate-y-0.5",
							"active:translate-y-0",
							"focus:outline-none focus:ring-2",
							"focus:ring-zinc-500 dark:focus:ring-zinc-400",
							"focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
						)}
					>
						<span>View All Transactions</span>
						<ArrowRight className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</DashboardErrorBoundary>
	);
}
