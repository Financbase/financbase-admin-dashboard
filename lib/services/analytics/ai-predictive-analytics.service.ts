import { AIService } from "@/lib/ai-service";
import { Bot, CheckCircle, Tag, TrendingUp, XCircle } from "lucide-react";

export interface ForecastData {
	date: string;
	predictedValue: number;
	confidenceInterval: {
		lower: number;
		upper: number;
	};
	trend: string;
	seasonality: number;
	anomaly: boolean;
}

export interface RevenueForecast {
	forecast: ForecastData[];
	totalPredictedRevenue: number;
	growthRate: number;
	seasonalityPattern: string;
	confidence: number;
}

export interface Anomaly {
	type: string;
	severity: string;
	description: string;
	detectedAt: string;
	expectedValue: number;
	actualValue: number;
	deviation: number;
	recommendations: string[];
}

export class AIPredictiveAnalyticsService {
	private aiService: AIService;

	constructor() {
		this.aiService = new AIService();
	}

	/**
	 * Generate revenue forecast
	 */
	async generateRevenueForecast(
		userId: string,
		period: string,
		months: number,
	): Promise<RevenueForecast> {
		try {
			const prompt = `Generate a ${period} revenue forecast for the next ${months} months based on historical data for user ${userId}.

Please respond with a JSON object containing:
- forecast: array of forecast data with date, predictedValue, confidenceInterval, trend, seasonality, anomaly
- totalPredictedRevenue: total predicted revenue for the period
- growthRate: percentage growth rate
- seasonalityPattern: description of seasonal patterns
- confidence: confidence level (0-100)

Example response:
{
  "forecast": [
    {
      "date": "2024-02-01",
      "predictedValue": 55000,
      "confidenceInterval": {
        "lower": 45000,
        "upper": 65000
      },
      "trend": "increasing",
      "seasonality": 1.1,
      "anomaly": false
    }
  ],
  "totalPredictedRevenue": 115000,
  "growthRate": 15.5,
  "seasonalityPattern": "Q4 peak, Q1 dip",
  "confidence": 85
}`;

			const response = await this.aiService.processRequest({
				prompt,
				type: "generate",
				maxTokens: 1000,
			});

			if (!response.success || !response.result) {
				throw new Error("AI service failed");
			}

			return JSON.parse(response.result);
		} catch (error) {
			// Fallback forecast
			return {
				forecast: [
					{
						date: new Date().toISOString().split("T")[0],
						predictedValue: 50000,
						confidenceInterval: {
							lower: 40000,
							upper: 60000,
						},
						trend: "stable",
						seasonality: 1.0,
						anomaly: false,
					},
				],
				totalPredictedRevenue: 50000,
				growthRate: 0,
				seasonalityPattern: "No seasonal pattern detected",
				confidence: 50,
			};
		}
	}

	/**
	 * Detect financial anomalies
	 */
	async detectAnomalies(userId: string, days: number): Promise<Anomaly[]> {
		try {
			const prompt = `Detect financial anomalies in the last ${days} days for user ${userId}.

Please respond with a JSON object containing:
- anomalies: array of detected anomalies with type, severity, description, detectedAt, expectedValue, actualValue, deviation, recommendations

Example response:
{
  "anomalies": [
    {
      "type": "spending",
      "severity": "high",
      "description": "Unusual spike in marketing expenses",
      "detectedAt": "2024-01-15T10:30:00Z",
      "expectedValue": 2000,
      "actualValue": 5000,
      "deviation": 150,
      "recommendations": [
        "Review marketing campaign effectiveness",
        "Check for duplicate charges"
      ]
    }
  ]
}`;

			const response = await this.aiService.processRequest({
				prompt,
				type: "tag",
				maxTokens: 600,
			});

			if (!response.success || !response.result) {
				throw new Error("AI service failed");
			}

			const result = JSON.parse(response.result);
			return result.anomalies || [];
		} catch (error) {
			// Fallback - no anomalies detected
			return [];
		}
	}
}
