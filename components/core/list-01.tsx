"use client";

import { useAccountBalances } from "@/hooks/use-dashboard-data-optimized";
import { cn } from "@/lib/utils";
import {
	ArrowDownLeft,
	ArrowRight,
	ArrowUpRight,
	CreditCard,
	Key,
	LayoutDashboard,
	Plus,
	QrCode,
	SendHorizontal,
	Wallet,
	XCircle,
} from "lucide-react";
import EmptyState, { EmptyStates } from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";

interface AccountItem {
	id: string;
	title: string;
	description?: string;
	balance: number;
	type: "savings" | "checking" | "investment" | "debt";
}

interface List01Props {
	className?: string;
}

export default function List01({ className }: List01Props) {
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
					<div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800">
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
					</div>
					<div className="p-2 sm:p-3">
						<div className="space-y-2">
							{[...new Array(4)].map((_, i) => (
								<div key={i} className="flex items-center space-x-2">
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
						title="Failed to load accounts"
						description="Unable to fetch account balances. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!financialData?.accounts || financialData.accounts.length === 0) {
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
				<EmptyState {...EmptyStates.accounts} />
			</div>
		);
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	const totalBalance = financialData.accounts.reduce(
		(sum, account) => sum + account.balance,
		0,
	);
	const accounts: AccountItem[] = financialData.accounts.map((account) => ({
		id: account.id,
		title: account.name,
		description:
			account.type === "savings"
				? "Personal savings"
				: account.type === "checking"
					? "Daily expenses"
					: account.type === "investment"
						? "Stock & ETFs"
						: "Pending charges",
		balance: account.balance,
		type: account.type as "savings" | "checking" | "investment" | "debt",
	}));
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
				{/* Total Balance Section */}
				<div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800">
					<p className="text-xs text-zinc-600 dark:text-zinc-400">
						Total Balance
					</p>
					<h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
						{formatCurrency(totalBalance)}
					</h1>
				</div>

				{/* Accounts List */}
				<div className="p-2 sm:p-3">
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
							Your Accounts
						</h2>
					</div>

					<div className="space-y-1">
						{accounts.map((account) => (
							<div
								key={account.id}
								className={cn(
									"group flex items-center justify-between",
									"p-2 rounded-lg",
									"hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
									"transition-all duration-200",
								)}
							>
								<div className="flex items-center gap-2 min-w-0 flex-1">
									<div
										className={cn("p-1.5 rounded-lg flex-shrink-0", {
											"bg-emerald-100 dark:bg-emerald-900/30":
												account.type === "savings",
											"bg-blue-100 dark:bg-blue-900/30":
												account.type === "checking",
											"bg-purple-100 dark:bg-purple-900/30":
												account.type === "investment",
											"bg-red-100 dark:bg-red-900/30": account.type === "debt",
										})}
									>
										{account.type === "savings" && (
											<Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
										)}
										{account.type === "checking" && (
											<QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
										)}
										{account.type === "investment" && (
											<ArrowUpRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
										)}
										{account.type === "debt" && (
											<CreditCard className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
											{account.title}
										</h3>
										{account.description && (
											<p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
												{account.description}
											</p>
										)}
									</div>
								</div>

								<div className="text-right flex-shrink-0">
									<span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
										{formatCurrency(account.balance)}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Action buttons footer */}
				<div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
					<div className="grid grid-cols-4 gap-1 sm:gap-2">
						<button
							type="button"
							onClick={() => (window.location.href = "/accounts/add")}
							className={cn(
								"flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2",
								"py-2 px-2 sm:px-3 rounded-lg",
								"text-xs font-medium",
								"bg-zinc-900 dark:bg-zinc-50",
								"text-zinc-50 dark:text-zinc-900",
								"hover:bg-zinc-800 dark:hover:bg-zinc-200",
								"shadow-sm hover:shadow",
								"transition-all duration-200",
							)}
						>
							<Plus className="w-3.5 h-3.5 flex-shrink-0" />
							<span className="hidden sm:inline">Add</span>
						</button>
						<button
							type="button"
							onClick={() => (window.location.href = "/transfer")}
							className={cn(
								"flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2",
								"py-2 px-2 sm:px-3 rounded-lg",
								"text-xs font-medium",
								"bg-zinc-900 dark:bg-zinc-50",
								"text-zinc-50 dark:text-zinc-900",
								"hover:bg-zinc-800 dark:hover:bg-zinc-200",
								"shadow-sm hover:shadow",
								"transition-all duration-200",
							)}
						>
							<SendHorizontal className="w-3.5 h-3.5 flex-shrink-0" />
							<span className="hidden sm:inline">Send</span>
						</button>
						<button
							type="button"
							onClick={() => (window.location.href = "/deposit")}
							className={cn(
								"flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2",
								"py-2 px-2 sm:px-3 rounded-lg",
								"text-xs font-medium",
								"bg-zinc-900 dark:bg-zinc-50",
								"text-zinc-50 dark:text-zinc-900",
								"hover:bg-zinc-800 dark:hover:bg-zinc-200",
								"shadow-sm hover:shadow",
								"transition-all duration-200",
							)}
						>
							<ArrowDownLeft className="w-3.5 h-3.5 flex-shrink-0" />
							<span className="hidden sm:inline">Top-up</span>
						</button>
						<button
							type="button"
							onClick={() => (window.location.href = "/accounts")}
							className={cn(
								"flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2",
								"py-2 px-2 sm:px-3 rounded-lg",
								"text-xs font-medium",
								"bg-zinc-900 dark:bg-zinc-50",
								"text-zinc-50 dark:text-zinc-900",
								"hover:bg-zinc-800 dark:hover:bg-zinc-200",
								"shadow-sm hover:shadow",
								"transition-all duration-200",
							)}
						>
							<ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
							<span className="hidden sm:inline">More</span>
						</button>
					</div>
				</div>
			</div>
		</DashboardErrorBoundary>
	);
}
