import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardToolbar,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	BanknoteArrowUp,
	CheckCircle,
	Eye,
	EyeOff,
	Key,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CurrencyData {
	code: string;
	percent: number;
	color: string;
	amount?: number;
}

interface BalanceData {
	balance: number;
	delta: number;
	previousBalance?: number;
	currencies: CurrencyData[];
}

interface StatisticsCardProps {
	data?: BalanceData;
	showDetails?: boolean;
	animated?: boolean;
	className?: string;
}

const defaultBalanceData: BalanceData = {
	balance: 10976.95,
	delta: 5.7,
	previousBalance: 10385.2,
	currencies: [
		{
			code: "USD",
			percent: 30,
			color: "bg-gradient-to-r from-white to-gray-200",
			amount: 3293.09,
		},
		{
			code: "GBP",
			percent: 20,
			color: "bg-gradient-to-r from-indigo-400 to-indigo-500",
			amount: 2195.39,
		},
		{
			code: "EUR",
			percent: 15,
			color: "bg-gradient-to-r from-blue-500 to-blue-600",
			amount: 1646.54,
		},
		{
			code: "JPY",
			percent: 20,
			color: "bg-gradient-to-r from-violet-600 to-violet-700",
			amount: 2195.39,
		},
		{
			code: "CNY",
			percent: 15,
			color: "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700",
			amount: 1646.54,
		},
	],
};

export default function StatisticsCard5({
	data = defaultBalanceData,
	showDetails = true,
	animated = true,
	className,
}: StatisticsCardProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
	const [showBalance, setShowBalance] = useState(true);

	useEffect(() => {
		if (animated) {
			const timer = setTimeout(() => setIsVisible(true), 100);
			return () => clearTimeout(timer);
		}
		setIsVisible(true);
	}, [animated]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const isPositive = data.delta >= 0;
	const TrendIcon = isPositive ? TrendingUp : TrendingDown;

	return (
		<div className={cn("w-full max-w-xl", className)}>
			<Card
				className={cn(
					"rounded-2xl shadow-xl border-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white relative overflow-hidden",
					"transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-900/50",
					isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
				)}
			>
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-5">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_theme(colors.zinc.700),transparent_50%)] opacity-20" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_theme(colors.zinc.600),transparent_50%)] opacity-20" />
				</div>

				<CardHeader className="border-0 pb-2 pt-6 relative z-10">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg font-semibold text-zinc-400 flex items-center gap-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
							Balance Overview
						</CardTitle>
						<CardToolbar>
							<Button
								variant="ghost"
								size="icon"
								className="bg-zinc-800/50 text-zinc-100 border-zinc-700/50 hover:bg-zinc-700 hover:text-zinc-100 h-8 w-8"
								onClick={() => setShowBalance(!showBalance)}
							>
								{showBalance ? (
									<Eye className="h-4 w-4" />
								) : (
									<EyeOff className="h-4 w-4" />
								)}
							</Button>
							<Button className="bg-zinc-800 text-zinc-100 border-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 shadow-lg">
								<BanknoteArrowUp className="w-4 h-4 mr-2" />
								Top Up
							</Button>
						</CardToolbar>
					</div>
				</CardHeader>

				<CardContent className="relative z-10">
					{/* Main Balance Display */}
					<div
						className={cn(
							"flex items-end gap-3 mb-6 transition-all duration-500",
							isVisible
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-4",
						)}
					>
						<div className="flex items-baseline gap-1">
							<span className="text-sm text-zinc-500">$</span>
							<span
								className={cn(
									"text-4xl font-bold tracking-tight transition-all duration-300",
									showBalance ? "blur-none" : "blur-sm select-none",
								)}
							>
								{showBalance
									? formatCurrency(data.balance).replace("$", "")
									: "••••••"}
							</span>
						</div>

						{/* Delta Badge */}
						<Badge
							variant={isPositive ? "success" : "destructive"}
							className={cn(
								"px-2 py-1 text-sm font-medium transition-all duration-300 hover:scale-105",
								isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90",
							)}
						>
							<TrendIcon className="w-3 h-3 mr-1" />
							{isPositive ? "+" : ""}
							{data.delta}%
						</Badge>
					</div>

					{/* Segmented Progress Bar */}
					<div
						className={cn(
							"mb-6 transition-all duration-700 delay-200",
							isVisible
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-4",
						)}
					>
						<div className="flex items-center gap-2 w-full mb-3">
							{data.currencies.map((currency, index) => (
								<div
									key={currency.code}
									className="flex-1 group cursor-pointer"
									style={{ width: `${currency.percent}%` }}
									onMouseEnter={() => setHoveredSegment(currency.code)}
									onMouseLeave={() => setHoveredSegment(null)}
								>
									<div className="relative">
										<div
											className={cn(
												currency.color,
												"h-3 w-full rounded-full transition-all duration-300 relative overflow-hidden",
												hoveredSegment === currency.code
													? "h-4 shadow-lg scale-105"
													: "h-3",
												"before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
												"before:translate-x-[-100%] hover:before:animate-[shimmer_1.5s_ease-in-out_infinite]",
												"after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:to-white/10 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300",
											)}
											style={{
												animationDelay: `${index * 0.1}s`,
											}}
										/>

										{/* Hover Tooltip */}
										{hoveredSegment === currency.code && showDetails && (
											<div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded-md shadow-lg border border-zinc-700 animate-in fade-in-0 zoom-in-50 duration-200">
												<div className="font-medium">{currency.code}</div>
												<div className="text-zinc-300">
													{formatCurrency(currency.amount || 0)}
												</div>
												<div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-800" />
											</div>
										)}
									</div>
								</div>
							))}
						</div>

						{/* Currency Labels */}
						<div
							className={cn(
								"flex justify-between text-xs text-zinc-400 transition-all duration-500 delay-300",
								isVisible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-2",
							)}
						>
							{data.currencies.map((currency, index) => (
								<div
									key={currency.code}
									className={cn(
										"flex flex-col items-center gap-1 transition-all duration-300",
										hoveredSegment === currency.code
											? "text-zinc-200 scale-110"
											: "",
									)}
									style={{
										width: `${currency.percent}%`,
										animationDelay: `${index * 0.1 + 0.3}s`,
									}}
								>
									<span className="font-medium">{currency.code}</span>
									<span className="text-zinc-500">{currency.percent}%</span>
								</div>
							))}
						</div>
					</div>

					{/* Summary Stats */}
					{showDetails && (
						<div
							className={cn(
								"grid grid-cols-3 gap-4 pt-4 border-t border-zinc-700/50 transition-all duration-500 delay-500",
								isVisible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-4",
							)}
						>
							<div className="text-center">
								<div className="text-lg font-semibold text-white">
									{formatCurrency(data.balance * 0.7)}
								</div>
								<div className="text-xs text-zinc-400">Available</div>
							</div>
							<div className="text-center">
								<div className="text-lg font-semibold text-zinc-300">
									{data.currencies.length}
								</div>
								<div className="text-xs text-zinc-400">Currencies</div>
							</div>
							<div className="text-center">
								<div className="text-lg font-semibold text-green-400">
									+{formatCurrency(data.balance * (data.delta / 100))}
								</div>
								<div className="text-xs text-zinc-400">This Month</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
