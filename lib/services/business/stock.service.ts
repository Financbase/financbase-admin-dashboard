/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	stockCategories,
	stockNews,
	stockPortfolios,
} from "@/drizzle/schema/stocks";
import { db } from "@/lib/db/connection";
import {
	stockPriceHistory,
	stockWatchlist,
	stocks,
} from "@/lib/db/schemas/stocks.schema";
import type {
	NewStock,
	NewStockPriceHistory,
	NewStockWatchlist,
	Stock,
	StockPriceHistory,
} from "@/lib/db/schemas/stocks.schema";
import { AIError } from "@/lib/utils";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Database, Minus, Plus, Search, Trash2, XCircle } from "lucide-react";

/**
 * Stock Service - Handles all stock-related database operations
 */
export class StockService {
	/**
	 * Get all active stocks with optional filtering
	 */
	static async getStocks(
		options: {
			limit?: number;
			offset?: number;
			sector?: string;
			search?: string;
		} = {},
	): Promise<Stock[]> {
		try {
			const { limit = 20, offset = 0, sector, search } = options;

			let query = db.select().from(stocks).where(eq(stocks.isActive, true));

			if (sector) {
				query = query.where(eq(stocks.sector, sector));
			}

			if (search) {
				query = query.where(
					sql`${stocks.ticker} ILIKE ${`%${search}%`} OR ${stocks.name} ILIKE ${`%${search}%`}`,
				);
			}

			const result = await query
				.orderBy(desc(stocks.lastUpdated))
				.limit(limit)
				.offset(offset);

			return result;
		} catch (error) {
			console.error("Error fetching stocks:", error);
			throw new AIError(
				"Failed to fetch stocks from database",
				"STOCK_FETCH_ERROR",
				500,
			);
		}
	}

	/**
	 * Get a specific stock by ticker
	 */
	static async getStockByTicker(ticker: string): Promise<Stock | null> {
		try {
			const result = await db
				.select()
				.from(stocks)
				.where(and(eq(stocks.ticker, ticker), eq(stocks.isActive, true)))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error(`Error fetching stock ${ticker}:`, error);
			throw new AIError(
				`Failed to fetch stock ${ticker}`,
				"STOCK_FETCH_ERROR",
				500,
			);
		}
	}

	/**
	 * Get a specific stock by ID
	 */
	static async getStockById(id: string): Promise<Stock | null> {
		try {
			const result = await db
				.select()
				.from(stocks)
				.where(and(eq(stocks.id, id), eq(stocks.isActive, true)))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error(`Error fetching stock ${id}:`, error);
			throw new AIError(
				`Failed to fetch stock ${id}`,
				"STOCK_FETCH_ERROR",
				500,
			);
		}
	}

	/**
	 * Create a new stock
	 */
	static async createStock(stockData: NewStock): Promise<Stock> {
		try {
			const result = await db
				.insert(stocks)
				.values({
					...stockData,
					lastUpdated: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (!result[0]) {
				throw new Error("Failed to create stock");
			}

			return result[0];
		} catch (error) {
			console.error("Error creating stock:", error);
			throw new AIError(
				"Failed to create stock in database",
				"STOCK_CREATE_ERROR",
				500,
			);
		}
	}

	/**
	 * Update an existing stock
	 */
	static async updateStock(
		id: string,
		updates: Partial<NewStock>,
	): Promise<Stock> {
		try {
			const result = await db
				.update(stocks)
				.set({
					...updates,
					lastUpdated: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(stocks.id, id))
				.returning();

			if (!result[0]) {
				throw new Error("Stock not found or update failed");
			}

			return result[0];
		} catch (error) {
			console.error(`Error updating stock ${id}:`, error);
			throw new AIError(
				`Failed to update stock ${id}`,
				"STOCK_UPDATE_ERROR",
				500,
			);
		}
	}

	/**
	 * Delete (deactivate) a stock
	 */
	static async deleteStock(id: string): Promise<boolean> {
		try {
			const result = await db
				.update(stocks)
				.set({
					isActive: false,
					lastUpdated: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(stocks.id, id))
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error(`Error deleting stock ${id}:`, error);
			throw new AIError(
				`Failed to delete stock ${id}`,
				"STOCK_DELETE_ERROR",
				500,
			);
		}
	}

	/**
	 * Get trending stocks (most actively traded or highest volume)
	 */
	static async getTrendingStocks(limit = 10): Promise<Stock[]> {
		try {
			const result = await db
				.select()
				.from(stocks)
				.where(eq(stocks.isActive, true))
				.orderBy(desc(stocks.volume), desc(stocks.changePercent))
				.limit(limit);

			return result;
		} catch (error) {
			console.error("Error fetching trending stocks:", error);
			throw new AIError(
				"Failed to fetch trending stocks",
				"TRENDING_STOCKS_ERROR",
				500,
			);
		}
	}

	/**
	 * Get top gainers
	 */
	static async getTopGainers(limit = 10): Promise<Stock[]> {
		try {
			const result = await db
				.select()
				.from(stocks)
				.where(and(eq(stocks.isActive, true), gte(stocks.changePercent, 0)))
				.orderBy(desc(stocks.changePercent))
				.limit(limit);

			return result;
		} catch (error) {
			console.error("Error fetching top gainers:", error);
			throw new AIError(
				"Failed to fetch top gainers",
				"TOP_GAINERS_ERROR",
				500,
			);
		}
	}

	/**
	 * Get top losers
	 */
	static async getTopLosers(limit = 10): Promise<Stock[]> {
		try {
			const result = await db
				.select()
				.from(stocks)
				.where(and(eq(stocks.isActive, true), lte(stocks.changePercent, 0)))
				.orderBy(stocks.changePercent)
				.limit(limit);

			return result;
		} catch (error) {
			console.error("Error fetching top losers:", error);
			throw new AIError("Failed to fetch top losers", "TOP_LOSERS_ERROR", 500);
		}
	}

	/**
	 * Record stock price history
	 */
	static async recordPriceHistory(
		stockId: string,
		historyData: NewStockPriceHistory,
	): Promise<StockPriceHistory> {
		try {
			const result = await db
				.insert(stockPriceHistory)
				.values(historyData)
				.returning();

			if (!result[0]) {
				throw new Error("Failed to record price history");
			}

			return result[0];
		} catch (error) {
			console.error(
				`Error recording price history for stock ${stockId}:`,
				error,
			);
			throw new AIError(
				`Failed to record price history for stock ${stockId}`,
				"PRICE_HISTORY_ERROR",
				500,
			);
		}
	}

	/**
	 * Get price history for a stock
	 */
	static async getPriceHistory(
		stockId: string,
		options: {
			period?: string;
			limit?: number;
			from?: Date;
			to?: Date;
		} = {},
	): Promise<StockPriceHistory[]> {
		try {
			const { period, limit = 30, from, to } = options;

			let query = db
				.select()
				.from(stockPriceHistory)
				.where(eq(stockPriceHistory.stockId, stockId));

			if (period) {
				query = query.where(eq(stockPriceHistory.period, period));
			}

			if (from) {
				query = query.where(gte(stockPriceHistory.timestamp, from));
			}

			if (to) {
				query = query.where(lte(stockPriceHistory.timestamp, to));
			}

			const result = await query
				.orderBy(desc(stockPriceHistory.timestamp))
				.limit(limit);

			return result;
		} catch (error) {
			console.error(
				`Error fetching price history for stock ${stockId}:`,
				error,
			);
			throw new AIError(
				`Failed to fetch price history for stock ${stockId}`,
				"PRICE_HISTORY_FETCH_ERROR",
				500,
			);
		}
	}

	/**
	 * Add stock to user's watchlist
	 */
	static async addToWatchlist(
		userId: string,
		stockId: string,
		watchlistData: Partial<NewStockWatchlist> = {},
	): Promise<void> {
		try {
			await db
				.insert(stockWatchlist)
				.values({
					userId,
					stockId,
					...watchlistData,
				})
				.onConflictDoNothing();
		} catch (error) {
			console.error(
				`Error adding stock ${stockId} to watchlist for user ${userId}:`,
				error,
			);
			throw new AIError(
				"Failed to add stock to watchlist",
				"WATCHLIST_ADD_ERROR",
				500,
			);
		}
	}

	/**
	 * Remove stock from user's watchlist
	 */
	static async removeFromWatchlist(
		userId: string,
		stockId: string,
	): Promise<boolean> {
		try {
			const result = await db
				.delete(stockWatchlist)
				.where(
					and(
						eq(stockWatchlist.userId, userId),
						eq(stockWatchlist.stockId, stockId),
					),
				)
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error(
				`Error removing stock ${stockId} from watchlist for user ${userId}:`,
				error,
			);
			throw new AIError(
				"Failed to remove stock from watchlist",
				"WATCHLIST_REMOVE_ERROR",
				500,
			);
		}
	}

	/**
	 * Get user's watchlist
	 */
	static async getUserWatchlist(userId: string): Promise<Stock[]> {
		try {
			const result = await db
				.select({
					id: stocks.id,
					ticker: stocks.ticker,
					name: stocks.name,
					description: stocks.description,
					sector: stocks.sector,
					industry: stocks.industry,
					logoUrl: stocks.logoUrl,
					website: stocks.website,
					currentPrice: stocks.currentPrice,
					previousClosePrice: stocks.previousClosePrice,
					changeAmount: stocks.changeAmount,
					changePercent: stocks.changePercent,
					volume: stocks.volume,
					averageVolume: stocks.averageVolume,
					marketCap: stocks.marketCap,
					dayHigh: stocks.dayHigh,
					dayLow: stocks.dayLow,
					yearHigh: stocks.yearHigh,
					yearLow: stocks.yearLow,
					currency: stocks.currency,
					exchange: stocks.exchange,
					isActive: stocks.isActive,
					lastUpdated: stocks.lastUpdated,
					createdAt: stocks.createdAt,
					updatedAt: stocks.updatedAt,
				})
				.from(stockWatchlist)
				.innerJoin(stocks, eq(stockWatchlist.stockId, stocks.id))
				.where(
					and(
						eq(stockWatchlist.userId, userId),
						eq(stockWatchlist.isActive, true),
						eq(stocks.isActive, true),
					),
				)
				.orderBy(desc(stocks.lastUpdated));

			return result;
		} catch (error) {
			console.error(`Error fetching watchlist for user ${userId}:`, error);
			throw new AIError(
				"Failed to fetch user watchlist",
				"WATCHLIST_FETCH_ERROR",
				500,
			);
		}
	}

	/**
	 * Update stock prices (bulk operation for market data updates)
	 */
	static async updateStockPrices(
		updates: Array<{
			ticker: string;
			currentPrice: number;
			previousClosePrice?: number;
			changeAmount?: number;
			changePercent?: number;
			volume?: number;
			dayHigh?: number;
			dayLow?: number;
		}>,
	): Promise<void> {
		try {
			const updatePromises = updates.map(async (update) => {
				const stock = await StockService.getStockByTicker(update.ticker);
				if (!stock) {
					throw new Error(`Stock ${update.ticker} not found`);
				}

				// Record price history before updating
				await StockService.recordPriceHistory(stock.id, {
					stockId: stock.id,
					price: update.currentPrice.toString(),
					changeAmount: update.changeAmount?.toString(),
					changePercent: update.changePercent?.toString(),
					volume: update.volume?.toString(),
					timestamp: new Date(),
					period: "1d",
				});

				// Update current stock data
				return StockService.updateStock(stock.id, {
					currentPrice: update.currentPrice.toString(),
					previousClosePrice: update.previousClosePrice?.toString(),
					changeAmount: update.changeAmount?.toString(),
					changePercent: update.changePercent?.toString(),
					volume: update.volume?.toString(),
					dayHigh: update.dayHigh?.toString(),
					dayLow: update.dayLow?.toString(),
					lastUpdated: new Date(),
				});
			});

			await Promise.all(updatePromises);
		} catch (error) {
			console.error("Error updating stock prices:", error);
			throw new AIError(
				"Failed to update stock prices",
				"STOCK_PRICE_UPDATE_ERROR",
				500,
			);
		}
	}

	/**
	 * Get stock categories
	 */
	static async getStockCategories(): Promise<
		Array<{
			id: string;
			name: string;
			slug: string;
			category: string;
			description?: string;
			icon?: string;
		}>
	> {
		try {
			const result = await db
				.select({
					id: stockCategories.id,
					name: stockCategories.name,
					slug: stockCategories.slug,
					category: stockCategories.category,
					description: stockCategories.description,
					icon: stockCategories.icon,
				})
				.from(stockCategories)
				.orderBy(stockCategories.name);

			return result;
		} catch (error) {
			console.error("Error fetching stock categories:", error);
			throw new AIError(
				"Failed to fetch stock categories",
				"STOCK_CATEGORIES_ERROR",
				500,
			);
		}
	}

	/**
	 * Get stocks by category
	 */
	static async getStocksByCategory(categorySlug: string): Promise<Stock[]> {
		try {
			// First get the category ID
			const category = await db
				.select()
				.from(stockCategories)
				.where(eq(stockCategories.slug, categorySlug))
				.limit(1);

			if (!category[0]) {
				return [];
			}

			// Get stocks in this category
			const result = await db
				.select()
				.from(stocks)
				.where(
					and(
						eq(stocks.sector, category[0].category),
						eq(stocks.isActive, true),
					),
				)
				.orderBy(desc(stocks.lastUpdated));

			return result;
		} catch (error) {
			console.error(
				`Error fetching stocks for category ${categorySlug}:`,
				error,
			);
			throw new AIError(
				`Failed to fetch stocks for category ${categorySlug}`,
				"STOCK_CATEGORY_ERROR",
				500,
			);
		}
	}

	/**
	 * Add stock to user's portfolio
	 */
	static async addToPortfolio(
		userId: string,
		stockId: string,
		portfolioData: {
			shares: number;
			avgCost: number;
		},
	): Promise<void> {
		try {
			// Calculate totals
			const totalInvested = portfolioData.shares * portfolioData.avgCost;

			await db
				.insert(stockPortfolios)
				.values({
					userId,
					stockId,
					shares: portfolioData.shares.toString(),
					avgCost: portfolioData.avgCost.toString(),
					totalInvested: totalInvested.toString(),
					currentValue: "0", // Will be updated when stock price changes
					unrealizedGain: "0",
					unrealizedGainPercent: "0",
				})
				.onConflictDoNothing();
		} catch (error) {
			console.error(
				`Error adding stock ${stockId} to portfolio for user ${userId}:`,
				error,
			);
			throw new AIError(
				"Failed to add stock to portfolio",
				"PORTFOLIO_ADD_ERROR",
				500,
			);
		}
	}

	/**
	 * Get user's portfolio
	 */
	static async getUserPortfolio(userId: string): Promise<
		Array<{
			id: string;
			stockId: string;
			shares: string;
			avgCost: string;
			totalInvested: string;
			currentValue: string;
			unrealizedGain: string;
			unrealizedGainPercent: string;
			stock: Stock;
		}>
	> {
		try {
			const result = await db
				.select({
					id: stockPortfolios.id,
					stockId: stockPortfolios.stockId,
					shares: stockPortfolios.shares,
					avgCost: stockPortfolios.avgCost,
					totalInvested: stockPortfolios.totalInvested,
					currentValue: stockPortfolios.currentValue,
					unrealizedGain: stockPortfolios.unrealizedGain,
					unrealizedGainPercent: stockPortfolios.unrealizedGainPercent,
					stock: stocks,
				})
				.from(stockPortfolios)
				.innerJoin(stocks, eq(stockPortfolios.stockId, stocks.id))
				.where(
					and(eq(stockPortfolios.userId, userId), eq(stocks.isActive, true)),
				)
				.orderBy(desc(stocks.lastUpdated));

			return result;
		} catch (error) {
			console.error(`Error fetching portfolio for user ${userId}:`, error);
			throw new AIError(
				"Failed to fetch user portfolio",
				"PORTFOLIO_FETCH_ERROR",
				500,
			);
		}
	}

	/**
	 * Get stock news
	 */
	static async getStockNews(
		stockId?: string,
		categoryId?: string,
		limit = 20,
	): Promise<
		Array<{
			id: string;
			stockId?: string;
			categoryId?: string;
			title: string;
			summary?: string;
			content?: string;
			url?: string;
			publishedAt: Date;
			source?: string;
			sentiment?: string;
			relevance?: string;
		}>
	> {
		try {
			let query = db
				.select({
					id: stockNews.id,
					stockId: stockNews.stockId,
					categoryId: stockNews.categoryId,
					title: stockNews.title,
					summary: stockNews.summary,
					content: stockNews.content,
					url: stockNews.url,
					publishedAt: stockNews.publishedAt,
					source: stockNews.source,
					sentiment: stockNews.sentiment,
					relevance: stockNews.relevance,
				})
				.from(stockNews);

			if (stockId) {
				query = query.where(eq(stockNews.stockId, stockId));
			}

			if (categoryId) {
				query = query.where(eq(stockNews.categoryId, categoryId));
			}

			const result = await query
				.orderBy(desc(stockNews.publishedAt))
				.limit(limit);

			return result;
		} catch (error) {
			console.error("Error fetching stock news:", error);
			throw new AIError("Failed to fetch stock news", "STOCK_NEWS_ERROR", 500);
		}
	}
}
