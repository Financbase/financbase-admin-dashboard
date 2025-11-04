/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, MoreHorizontal, Plus, TrendingUp } from "lucide-react";
// components/ui/crypto-card.tsx
import type * as React from "react";

// Define the props for the component
interface CryptoCardProps {
	icon: React.ReactNode;
	name: string;
	ticker: string;
	percentageChange: number;
	currentPrice: number;
	portfolioValue: number;
	portfolioChange: number;
	leverage: number;
	gradientFrom: string; // e.g., 'from-red-500'
	className?: string;
}

// Helper for formatting currency
const formatCurrency = (value: number, currency = "USD") => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
};

const formatCompact = (value: number) => {
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		compactDisplay: "short",
	}).format(value);
};

export const CryptoCard = ({
	icon,
	name,
	ticker,
	percentageChange,
	currentPrice,
	portfolioValue,
	portfolioChange,
	leverage,
	gradientFrom,
	className,
}: CryptoCardProps) => {
	const isPositive = percentageChange >= 0;

	return (
		<motion.div
			whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
			className={cn(
				"flex w-full max-w-sm rounded-2xl overflow-hidden bg-card border shadow-lg",
				className,
			)}
		>
			{/* Left Panel - Gradient */}
			<div
				className={cn(
					"w-2/5 p-4 flex flex-col justify-between text-white bg-gradient-to-br",
					gradientFrom,
					isPositive ? "to-green-800" : "to-red-800",
				)}
			>
				<div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
					{icon}
				</div>
				<div>
					<p className="text-3xl font-bold">{percentageChange.toFixed(2)}%</p>
					<p className="text-sm opacity-80">
						{formatCurrency(currentPrice, "USD").replace("$", "$ ")}
					</p>
				</div>
			</div>

			{/* Right Panel - Data */}
			<div className="w-3/5 p-4 flex flex-col justify-between bg-card text-card-foreground">
				<div>
					<div className="flex justify-between items-center">
						<p className="text-xl font-bold tracking-tight">
							{formatCurrency(portfolioValue)}
						</p>
						<div className="flex items-center gap-2">
							<span
								className={cn(
									"text-xs font-semibold px-1.5 py-0.5 rounded-full",
									isPositive
										? "bg-green-500/20 text-green-400"
										: "bg-red-500/20 text-red-400",
								)}
							>
								{isPositive ? "+" : ""}
								{formatCompact(portfolioChange)}
							</span>
							<span className="text-xs font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
								{leverage}X
							</span>
						</div>
					</div>
					<p className="text-sm text-muted-foreground">
						{name} / {ticker}
					</p>
				</div>

				<div className="flex justify-between items-center mt-4">
					<div className="flex gap-2 text-muted-foreground">
						<button
							className="hover:text-primary transition-colors"
							aria-label="Add"
						>
							<Plus className="w-4 h-4" />
						</button>
						<button
							className="hover:text-primary transition-colors"
							aria-label="More options"
						>
							<MoreHorizontal className="w-4 h-4" />
						</button>
					</div>
					<button
						className="text-muted-foreground hover:text-primary transition-colors"
						aria-label="View chart"
					>
						<TrendingUp className="w-4 h-4" />
					</button>
				</div>
			</div>
		</motion.div>
	);
};
