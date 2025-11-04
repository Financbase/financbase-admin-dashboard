/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	type Currency,
	type CurrencyConversion,
	type CurrencyPreference,
	type ExchangeRate,
	currencies,
	currencyConversions,
	currencyPreferences,
	exchangeRates,
} from "@/drizzle/schema/currencies";
import { db } from "@/lib/db";
import { EncryptionService } from "@/lib/services/encryption.service";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

export interface CurrencyConversionResult {
	fromAmount: number;
	toAmount: number;
	exchangeRate: number;
	fromCurrency: Currency;
	toCurrency: Currency;
	conversionDate: Date;
}

export interface ExchangeRateData {
	fromCurrency: string;
	toCurrency: string;
	rate: number;
	source: string;
	effectiveDate: Date;
	expiryDate?: Date;
}

/**
 * Currency Service
 *
 * Handles multi-currency support, exchange rate management,
 * and currency conversions for financial operations.
 */
export class CurrencyService {
	private encryptionKey: string;
	private exchangeRateApiKey?: string;
	private exchangeRateApiUrl?: string;

	constructor() {
		this.encryptionKey = process.env.CURRENCY_ENCRYPTION_KEY || "";
		this.exchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY;
		this.exchangeRateApiUrl =
			process.env.EXCHANGE_RATE_API_URL ||
			"https://api.exchangerate-api.com/v4";

		if (!this.encryptionKey) {
			throw new Error(
				"CURRENCY_ENCRYPTION_KEY environment variable is required",
			);
		}
	}

	/**
	 * Initialize common currencies
	 */
	async initializeCurrencies(): Promise<void> {
		const commonCurrencies = [
			{
				code: "USD",
				name: "US Dollar",
				symbol: "$",
				country: "United States",
				isBaseCurrency: true,
			},
			{ code: "EUR", name: "Euro", symbol: "€", country: "European Union" },
			{
				code: "GBP",
				name: "British Pound",
				symbol: "£",
				country: "United Kingdom",
			},
			{
				code: "JPY",
				name: "Japanese Yen",
				symbol: "¥",
				country: "Japan",
				decimalPlaces: "0",
			},
			{ code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "Canada" },
			{
				code: "AUD",
				name: "Australian Dollar",
				symbol: "A$",
				country: "Australia",
			},
			{
				code: "CHF",
				name: "Swiss Franc",
				symbol: "CHF",
				country: "Switzerland",
			},
			{ code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "China" },
			{ code: "INR", name: "Indian Rupee", symbol: "₹", country: "India" },
			{ code: "BRL", name: "Brazilian Real", symbol: "R$", country: "Brazil" },
		];

		for (const currency of commonCurrencies) {
			await db
				.insert(currencies)
				.values({
					code: currency.code,
					name: currency.name,
					symbol: currency.symbol,
					decimalPlaces: currency.decimalPlaces || "2",
					country: currency.country,
					isBaseCurrency: currency.isBaseCurrency || false,
					status: "active",
				})
				.onConflictDoNothing();
		}
	}

	/**
	 * Fetch current exchange rates from external API
	 */
	async fetchExchangeRates(baseCurrency = "USD"): Promise<ExchangeRateData[]> {
		if (!this.exchangeRateApiKey) {
			console.warn(
				"Exchange rate API key not configured, using fallback rates",
			);
			return this.getFallbackRates(baseCurrency);
		}

		try {
			const response = await fetch(
				`${this.exchangeRateApiUrl}/latest/${baseCurrency}?access_key=${this.exchangeRateApiKey}`,
			);

			if (!response.ok) {
				throw new Error(`Exchange rate API error: ${response.status}`);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(`Exchange rate API error: ${data.error}`);
			}

			const rates: ExchangeRateData[] = [];

			// Get base currency ID
			const baseCurrencyRecord = await this.getCurrencyByCode(baseCurrency);
			if (!baseCurrencyRecord) {
				throw new Error(`Base currency ${baseCurrency} not found`);
			}

			// Process rates for each currency
			for (const [currencyCode, rate] of Object.entries(data.rates)) {
				if (currencyCode === baseCurrency) continue;

				const targetCurrency = await this.getCurrencyByCode(currencyCode);
				if (!targetCurrency) continue;

				rates.push({
					fromCurrency: baseCurrency,
					toCurrency: currencyCode,
					rate: rate as number,
					source: "exchangerate-api",
					effectiveDate: new Date(),
					expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
				});
			}

			return rates;
		} catch (error) {
			console.error("Failed to fetch exchange rates:", error);
			return this.getFallbackRates(baseCurrency);
		}
	}

	/**
	 * Fallback rates when API is unavailable
	 */
	private getFallbackRates(baseCurrency: string): ExchangeRateData[] {
		// Static fallback rates (should be updated regularly)
		const fallbackRates: Record<string, Record<string, number>> = {
			USD: {
				EUR: 0.85,
				GBP: 0.73,
				JPY: 110.0,
				CAD: 1.25,
				AUD: 1.35,
				CHF: 0.92,
				CNY: 6.45,
			},
			EUR: {
				USD: 1.18,
				GBP: 0.86,
				JPY: 129.0,
			},
		};

		const rates = fallbackRates[baseCurrency] || {};
		return Object.entries(rates).map(([toCurrency, rate]) => ({
			fromCurrency: baseCurrency,
			toCurrency,
			rate,
			source: "fallback",
			effectiveDate: new Date(),
			expiryDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
		}));
	}

	/**
	 * Update exchange rates in database
	 */
	async updateExchangeRates(rates: ExchangeRateData[]): Promise<void> {
		for (const rateData of rates) {
			const fromCurrency = await this.getCurrencyByCode(rateData.fromCurrency);
			const toCurrency = await this.getCurrencyByCode(rateData.toCurrency);

			if (!fromCurrency || !toCurrency) continue;

			await db
				.insert(exchangeRates)
				.values({
					fromCurrencyId: fromCurrency.id,
					toCurrencyId: toCurrency.id,
					rate: rateData.rate.toString(),
					inverseRate: (1 / rateData.rate).toString(),
					source: rateData.source,
					sourceUrl: this.exchangeRateApiUrl,
					effectiveDate: rateData.effectiveDate,
					expiryDate: rateData.expiryDate,
					isActive: true,
				})
				.onConflictDoUpdate({
					target: [exchangeRates.fromCurrencyId, exchangeRates.toCurrencyId],
					set: {
						rate: rateData.rate.toString(),
						inverseRate: (1 / rateData.rate).toString(),
						effectiveDate: rateData.effectiveDate,
						expiryDate: rateData.expiryDate,
						isActive: true,
						updatedAt: new Date(),
					},
				});
		}
	}

	/**
	 * Convert currency amount
	 */
	async convertCurrency(
		fromAmount: number,
		fromCurrencyCode: string,
		toCurrencyCode: string,
		conversionDate?: Date,
	): Promise<CurrencyConversionResult> {
		const fromCurrency = await this.getCurrencyByCode(fromCurrencyCode);
		const toCurrency = await this.getCurrencyByCode(toCurrencyCode);

		if (!fromCurrency || !toCurrency) {
			throw new Error(
				`Currency not found: ${fromCurrencyCode} or ${toCurrencyCode}`,
			);
		}

		// Get exchange rate
		const exchangeRate = await this.getExchangeRate(
			fromCurrency.id,
			toCurrency.id,
			conversionDate,
		);

		if (!exchangeRate) {
			throw new Error(
				`No exchange rate found for ${fromCurrencyCode} to ${toCurrencyCode}`,
			);
		}

		const rate = Number.parseFloat(exchangeRate.rate);
		const toAmount = fromAmount * rate;

		// Record conversion for audit
		await db.insert(currencyConversions).values({
			entityType: "manual_conversion",
			entityId: crypto.randomUUID(), // Temporary ID for manual conversions
			fromCurrencyId: fromCurrency.id,
			toCurrencyId: toCurrency.id,
			fromAmount: fromAmount.toString(),
			toAmount: toAmount.toString(),
			exchangeRateId: exchangeRate.id,
			conversionDate: conversionDate || new Date(),
			purpose: "Manual currency conversion",
		});

		return {
			fromAmount,
			toAmount,
			exchangeRate: rate,
			fromCurrency,
			toCurrency,
			conversionDate: conversionDate || new Date(),
		};
	}

	/**
	 * Get exchange rate between two currencies
	 */
	async getExchangeRate(
		fromCurrencyId: string,
		toCurrencyId: string,
		asOfDate?: Date,
	): Promise<ExchangeRate | null> {
		let query = db
			.select()
			.from(exchangeRates)
			.where(
				and(
					eq(exchangeRates.fromCurrencyId, fromCurrencyId),
					eq(exchangeRates.toCurrencyId, toCurrencyId),
					eq(exchangeRates.isActive, true),
				),
			);

		if (asOfDate) {
			query = query.where(
				and(
					lte(exchangeRates.effectiveDate, asOfDate),
					gte(exchangeRates.expiryDate || new Date(), asOfDate),
				),
			);
		}

		const rates = await query
			.orderBy(desc(exchangeRates.effectiveDate))
			.limit(1);
		return rates[0] || null;
	}

	/**
	 * Get currency by code
	 */
	async getCurrencyByCode(code: string): Promise<Currency | null> {
		const result = await db
			.select()
			.from(currencies)
			.where(and(eq(currencies.code, code), eq(currencies.status, "active")))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Get all active currencies
	 */
	async getActiveCurrencies(): Promise<Currency[]> {
		return await db
			.select()
			.from(currencies)
			.where(eq(currencies.status, "active"))
			.orderBy(currencies.name);
	}

	/**
	 * Set user currency preferences
	 */
	async setCurrencyPreferences(
		userId: string | null,
		organizationId: string | null,
		preferences: {
			baseCurrencyCode: string;
			displayCurrencyCode: string;
			autoConvert?: boolean;
			showOriginalAmount?: boolean;
			roundingMode?: string;
			roundingPrecision?: number;
		},
	): Promise<void> {
		const baseCurrency = await this.getCurrencyByCode(
			preferences.baseCurrencyCode,
		);
		const displayCurrency = await this.getCurrencyByCode(
			preferences.displayCurrencyCode,
		);

		if (!baseCurrency || !displayCurrency) {
			throw new Error("Invalid currency codes");
		}

		await db
			.insert(currencyPreferences)
			.values({
				userId,
				organizationId,
				baseCurrencyId: baseCurrency.id,
				displayCurrencyId: displayCurrency.id,
				autoConvert: preferences.autoConvert ?? true,
				showOriginalAmount: preferences.showOriginalAmount ?? true,
				roundingMode: preferences.roundingMode || "nearest",
				roundingPrecision: preferences.roundingPrecision?.toString() || "2",
			})
			.onConflictDoUpdate({
				target: userId
					? [currencyPreferences.userId]
					: [currencyPreferences.organizationId],
				set: {
					baseCurrencyId: baseCurrency.id,
					displayCurrencyId: displayCurrency.id,
					autoConvert: preferences.autoConvert ?? true,
					showOriginalAmount: preferences.showOriginalAmount ?? true,
					roundingMode: preferences.roundingMode || "nearest",
					roundingPrecision: preferences.roundingPrecision?.toString() || "2",
					updatedAt: new Date(),
				},
			});
	}

	/**
	 * Get user currency preferences
	 */
	async getCurrencyPreferences(
		userId: string | null,
		organizationId: string | null,
	): Promise<CurrencyPreference | null> {
		const result = await db
			.select()
			.from(currencyPreferences)
			.where(
				userId
					? eq(currencyPreferences.userId, userId)
					: eq(currencyPreferences.organizationId, organizationId!),
			)
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Convert amount with user preferences
	 */
	async convertWithPreferences(
		amount: number,
		originalCurrencyCode: string,
		userId?: string,
		organizationId?: string,
	): Promise<{
		convertedAmount: number;
		displayCurrency: Currency;
		originalAmount: number;
		originalCurrency: Currency;
	}> {
		const preferences = await this.getCurrencyPreferences(
			userId,
			organizationId,
		);

		if (!preferences) {
			// Use base currency (USD) as default
			const usd = await this.getCurrencyByCode("USD");
			if (!usd) throw new Error("USD currency not found");

			return {
				convertedAmount: amount,
				displayCurrency: usd,
				originalAmount: amount,
				originalCurrency: usd,
			};
		}

		const originalCurrency = await this.getCurrencyByCode(originalCurrencyCode);
		if (!originalCurrency) {
			throw new Error(`Currency ${originalCurrencyCode} not found`);
		}

		// Get display currency info
		const displayCurrency = await db
			.select()
			.from(currencies)
			.where(eq(currencies.id, preferences.displayCurrencyId))
			.limit(1)
			.then((result) => result[0]);

		if (!displayCurrency) {
			throw new Error("Display currency not found");
		}

		// If original and display currencies are the same, no conversion needed
		if (originalCurrency.id === displayCurrency.id) {
			return {
				convertedAmount: amount,
				displayCurrency,
				originalAmount: amount,
				originalCurrency,
			};
		}

		// Convert to display currency
		const conversion = await this.convertCurrency(
			amount,
			originalCurrencyCode,
			displayCurrency.code,
		);

		return {
			convertedAmount: conversion.toAmount,
			displayCurrency,
			originalAmount: amount,
			originalCurrency,
		};
	}

	/**
	 * Schedule daily exchange rate updates
	 */
	async scheduleRateUpdates(): Promise<void> {
		// This would typically be handled by a cron job or scheduled task
		// For now, we'll just update rates for major currencies
		const baseCurrencies = ["USD", "EUR", "GBP"];
		const allRates: ExchangeRateData[] = [];

		for (const base of baseCurrencies) {
			const rates = await this.fetchExchangeRates(base);
			allRates.push(...rates);
		}

		await this.updateExchangeRates(allRates);
	}

	/**
	 * Get historical exchange rates for a currency pair
	 */
	async getHistoricalRates(
		fromCurrencyCode: string,
		toCurrencyCode: string,
		startDate: Date,
		endDate: Date,
	): Promise<ExchangeRate[]> {
		const fromCurrency = await this.getCurrencyByCode(fromCurrencyCode);
		const toCurrency = await this.getCurrencyByCode(toCurrencyCode);

		if (!fromCurrency || !toCurrency) {
			throw new Error("Currency not found");
		}

		return await db
			.select()
			.from(exchangeRates)
			.where(
				and(
					eq(exchangeRates.fromCurrencyId, fromCurrency.id),
					eq(exchangeRates.toCurrencyId, toCurrency.id),
					eq(exchangeRates.isActive, true),
					gte(exchangeRates.effectiveDate, startDate),
					lte(exchangeRates.effectiveDate, endDate),
				),
			)
			.orderBy(exchangeRates.effectiveDate);
	}
}
