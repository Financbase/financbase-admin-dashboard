/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import {
	type StockCategory,
	StockCategoryList,
} from "@/components/ui/stock-category-list";
import {
	CheckCircle,
	Code,
	Cpu,
	Filter,
	Flame,
	HeartPulse,
	Landmark,
	ShoppingBasket,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

// Demo data for 5 stock categories
const demoStockData: StockCategory[] = [
	{
		title: "Technology",
		icon: Cpu,
		stocks: [
			{ name: "Apple Inc.", ticker: "AAPL", price: 172.25, change: 1.12 },
			{ name: "Microsoft Corp.", ticker: "MSFT", price: 340.54, change: -0.45 },
			{ name: "NVIDIA Corp.", ticker: "NVDA", price: 470.61, change: 2.33 },
		],
	},
	{
		title: "Healthcare",
		icon: HeartPulse,
		stocks: [
			{
				name: "Johnson & Johnson",
				ticker: "JNJ",
				price: 165.78,
				change: -0.89,
			},
			{ name: "Pfizer Inc.", ticker: "PFE", price: 35.12, change: 0.21 },
		],
	},
	{
		title: "Financials",
		icon: Landmark,
		stocks: [
			{
				name: "JPMorgan Chase & Co.",
				ticker: "JPM",
				price: 150.44,
				change: 0.55,
			},
			{ name: "Bank of America", ticker: "BAC", price: 29.88, change: -1.02 },
			{ name: "Visa Inc.", ticker: "V", price: 245.91, change: 0.15 },
		],
	},
	{
		title: "Consumer Staples",
		icon: ShoppingBasket,
		stocks: [
			{ name: "Procter & Gamble", ticker: "PG", price: 155.6, change: 0.05 },
			{ name: "Coca-Cola Co.", ticker: "KO", price: 60.1, change: -0.3 },
		],
	},
	{
		title: "Energy",
		icon: Flame,
		stocks: [
			{ name: "Exxon Mobil Corp.", ticker: "XOM", price: 112.76, change: 1.78 },
			{ name: "Chevron Corp.", ticker: "CVX", price: 164.21, change: 1.51 },
		],
	},
];

// The demo component that renders the StockCategoryList
const StockCategoryListDemo = () => {
	const [stockData, setStockData] = useState<StockCategory[]>(demoStockData);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Function to fetch stock data from API
	const fetchStockData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Try to fetch categories first
			const categoriesResponse = await fetch("/api/stock-categories");
			if (!categoriesResponse.ok) {
				throw new Error("Failed to fetch stock categories");
			}

			const categoriesData = await categoriesResponse.json();

			if (categoriesData.success && categoriesData.data.length > 0) {
				// Fetch stocks for each category
				const categoriesWithStocks = await Promise.all(
					categoriesData.data.slice(0, 5).map(async (category: any) => {
						try {
							const stocksResponse = await fetch(
								`/api/stocks?sector=${category.category}&limit=3`,
							);
							if (stocksResponse.ok) {
								const stocksData = await stocksResponse.json();
								return {
									title: category.name,
									icon: getIconForCategory(category.category),
									stocks: stocksData.data.map((stock: any) => ({
										name: stock.name,
										ticker: stock.ticker,
										price: Number.parseFloat(
											stock.currentPrice || stock.price || "0",
										),
										change: Number.parseFloat(
											stock.changePercent || stock.change || "0",
										),
									})),
								};
							}
						} catch (error) {
							logger.error(
								`Error fetching stocks for category ${category.name}:`,
								error,
							);
						}

						// Fallback to demo data if API fails
						return (
							demoStockData.find((cat) => cat.title === category.name) || {
								title: category.name,
								icon: getIconForCategory(category.category),
								stocks: [],
							}
						);
					}),
				);

				setStockData(categoriesWithStocks.filter(Boolean));
			} else {
				// Use demo data if no categories from API
				setStockData(demoStockData);
			}
		} catch (error) {
			logger.error("Error fetching stock data:", error);
			setError("Failed to load stock data. Using demo data instead.");
			setStockData(demoStockData);
			toast.error("Failed to load real stock data. Showing demo data.");
		} finally {
			setLoading(false);
		}
	};

	// Helper function to get icon for category
	const getIconForCategory = (category: string) => {
		const iconMap: Record<string, any> = {
			technology: Cpu,
			healthcare: HeartPulse,
			financials: Landmark,
			consumer_staples: ShoppingBasket,
			energy: Flame,
		};
		return iconMap[category] || Cpu;
	};

	// Load data on component mount
	useEffect(() => {
		fetchStockData();
	}, []);

	if (loading) {
		return (
			<div className="p-4 md:p-8 bg-background">
				<div className="w-full max-w-2xl mx-auto">
					<div className="animate-pulse space-y-4">
						<div className="h-12 bg-muted rounded" />
						<div className="h-12 bg-muted rounded" />
						<div className="h-12 bg-muted rounded" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-8 bg-background">
			<div className="w-full max-w-2xl mx-auto">
				{error && (
					<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
						<p className="text-yellow-800 text-sm">{error}</p>
					</div>
				)}
				<StockCategoryList categories={stockData} />
				<div className="mt-4 text-center">
					<button
						onClick={fetchStockData}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
					>
						Refresh Data
					</button>
				</div>
			</div>
		</div>
	);
};

export default StockCategoryListDemo;
