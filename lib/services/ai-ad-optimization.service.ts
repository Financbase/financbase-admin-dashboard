/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AIService } from "@/lib/ai-service";
import { db } from "@/lib/db/connection";
import { adBudgets, adCampaigns, adPerformance } from "@/lib/db/schema-adboard";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { Bot, PiggyBank, XCircle } from "lucide-react";
import { AdCampaignService } from "./ad-campaign.service";

export interface OptimizationRecommendation {
	type: "budget" | "targeting" | "creative" | "bidding" | "scheduling";
	priority: "high" | "medium" | "low";
	title: string;
	description: string;
	expectedImpact: string;
	confidence: number; // 0-100
	actionRequired: boolean;
	estimatedImprovement: number; // percentage
}

export interface BudgetAllocation {
	campaignId: string;
	currentBudget: number;
	recommendedBudget: number;
	reason: string;
	expectedRoas: number;
	confidence: number;
}

export interface PerformancePrediction {
	campaignId: string;
	predictedImpressions: number;
	predictedClicks: number;
	predictedConversions: number;
	predictedSpend: number;
	predictedCtr: number;
	predictedCpc: number;
	predictedCpa: number;
	predictedRoas: number;
	confidence: number;
	timeframe: "daily" | "weekly" | "monthly";
}

export interface AITargetingSuggestion {
	demographics: {
		ageGroups: string[];
		genders: string[];
		locations: string[];
		languages: string[];
	};
	interests: string[];
	behaviors: string[];
	lookalikeAudiences: string[];
	customAudiences: string[];
	reason: string;
	expectedReach: number;
	expectedCtr: number;
}

export class AIAdOptimizationService {
	private aiService: AIService;
	private campaignService: AdCampaignService;

	constructor() {
		this.aiService = new AIService();
		this.campaignService = new AdCampaignService();
	}

	// Analyze campaign performance and generate optimization recommendations
	async analyzeCampaignPerformance(
		campaignId: string,
		userId: string,
	): Promise<OptimizationRecommendation[]> {
		try {
			// Get campaign data
			const campaign = await this.campaignService.getCampaignById(
				campaignId,
				userId,
			);
			if (!campaign) {
				throw new Error("Campaign not found");
			}

			// Get performance data for the last 30 days
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const performanceData = await db
				.select()
				.from(adPerformance)
				.where(
					and(
						eq(adPerformance.campaignId, campaignId),
						gte(adPerformance.date, thirtyDaysAgo),
					),
				)
				.orderBy(desc(adPerformance.date));

			// Get budget data
			const budget = await this.campaignService.getCampaignBudget(
				campaignId,
				userId,
			);

			// Prepare data for AI analysis
			const analysisData = {
				campaign: {
					name: campaign.name,
					platform: campaign.platform,
					objective: campaign.objective,
					status: campaign.status,
					budgetType: campaign.budgetType,
					dailyBudget: campaign.dailyBudget,
					totalSpend: campaign.totalSpend,
					totalImpressions: campaign.totalImpressions,
					totalClicks: campaign.totalClicks,
					totalConversions: campaign.totalConversions,
					ctr: campaign.ctr,
					cpc: campaign.cpc,
					cpm: campaign.cpm,
					cpa: campaign.cpa,
					roas: campaign.roas,
				},
				performance: performanceData.map((p) => ({
					date: p.date,
					impressions: p.impressions,
					clicks: p.clicks,
					conversions: p.conversions,
					spend: p.spend,
					ctr: p.ctr,
					cpc: p.cpc,
					cpm: p.cpm,
					cpa: p.cpa,
					roas: p.roas,
				})),
				budget: budget
					? {
							totalBudget: budget.totalBudget,
							allocatedBudget: budget.allocatedBudget,
							remainingBudget: budget.remainingBudget,
							targetRoas: budget.targetRoas,
							targetCpa: budget.targetCpa,
						}
					: null,
			};

			// Generate AI analysis prompt
			const prompt = `
        Analyze this advertising campaign performance data and provide optimization recommendations.
        
        Campaign Details:
        - Platform: ${analysisData.campaign.platform}
        - Objective: ${analysisData.campaign.objective}
        - Status: ${analysisData.campaign.status}
        - Budget Type: ${analysisData.campaign.budgetType}
        - Daily Budget: $${analysisData.campaign.dailyBudget}
        - Total Spend: $${analysisData.campaign.totalSpend}
        - Impressions: ${analysisData.campaign.totalImpressions}
        - Clicks: ${analysisData.campaign.totalClicks}
        - Conversions: ${analysisData.campaign.totalConversions}
        - CTR: ${analysisData.campaign.ctr}%
        - CPC: $${analysisData.campaign.cpc}
        - CPM: $${analysisData.campaign.cpm}
        - CPA: $${analysisData.campaign.cpa}
        - ROAS: ${analysisData.campaign.roas}

        Performance Data (last 30 days):
        ${JSON.stringify(analysisData.performance, null, 2)}

        Please provide specific, actionable optimization recommendations in the following format:
        {
          "recommendations": [
            {
              "type": "budget|targeting|creative|bidding|scheduling",
              "priority": "high|medium|low",
              "title": "Recommendation title",
              "description": "Detailed description of the recommendation",
              "expectedImpact": "Expected impact on performance",
              "confidence": 85,
              "actionRequired": true,
              "estimatedImprovement": 15
            }
          ]
        }

        Focus on:
        1. Budget optimization and allocation
        2. Targeting improvements
        3. Creative performance optimization
        4. Bidding strategy adjustments
        5. Scheduling optimizations
        6. Platform-specific best practices

        Provide 3-5 high-impact recommendations with specific actions the user can take.
      `;

			const response = await this.aiService.generateResponse(prompt);

			// Parse AI response
			const recommendations = this.parseOptimizationRecommendations(response);

			return recommendations;
		} catch (error) {
			console.error("Error analyzing campaign performance:", error);
			throw new Error("Failed to analyze campaign performance");
		}
	}

	// Generate budget allocation recommendations
	async generateBudgetAllocation(
		userId: string,
		totalBudget: number,
	): Promise<BudgetAllocation[]> {
		try {
			// Get all active campaigns for the user
			const campaigns = await this.campaignService.getActiveCampaigns(userId);

			if (campaigns.length === 0) {
				return [];
			}

			// Get performance data for each campaign
			const campaignPerformance = await Promise.all(
				campaigns.map(async (campaign) => {
					const metrics = await this.campaignService.getCampaignMetrics(
						campaign.id,
						userId,
					);
					return {
						campaignId: campaign.id,
						name: campaign.name,
						platform: campaign.platform,
						currentBudget: Number.parseFloat(campaign.dailyBudget || "0"),
						performance: metrics,
					};
				}),
			);

			// Prepare data for AI analysis
			const analysisData = {
				totalBudget,
				campaigns: campaignPerformance,
			};

			const prompt = `
        Analyze these advertising campaigns and recommend optimal budget allocation.
        
        Total Available Budget: $${totalBudget}
        
        Campaign Performance Data:
        ${JSON.stringify(campaignPerformance, null, 2)}

        For each campaign, provide budget allocation recommendations in this format:
        {
          "allocations": [
            {
              "campaignId": "campaign-id",
              "currentBudget": 100,
              "recommendedBudget": 150,
              "reason": "High ROAS and conversion rate",
              "expectedRoas": 4.5,
              "confidence": 85
            }
          ]
        }

        Consider:
        1. Historical performance (ROAS, CPA, CTR)
        2. Platform-specific optimization opportunities
        3. Campaign objectives and goals
        4. Budget efficiency and scaling potential
        5. Risk vs. reward analysis

        Allocate the full $${totalBudget} budget across campaigns for maximum ROI.
      `;

			const response = await this.aiService.generateResponse(prompt);
			return this.parseBudgetAllocations(response);
		} catch (error) {
			console.error("Error generating budget allocation:", error);
			throw new Error("Failed to generate budget allocation");
		}
	}

	// Predict campaign performance
	async predictCampaignPerformance(
		campaignId: string,
		userId: string,
		timeframe: "daily" | "weekly" | "monthly" = "weekly",
	): Promise<PerformancePrediction> {
		try {
			const campaign = await this.campaignService.getCampaignById(
				campaignId,
				userId,
			);
			if (!campaign) {
				throw new Error("Campaign not found");
			}

			// Get historical performance data
			const performanceData = await this.campaignService.getCampaignPerformance(
				campaignId,
				userId,
			);

			const prompt = `
        Predict the performance of this advertising campaign for the next ${timeframe}.
        
        Campaign Details:
        - Platform: ${campaign.platform}
        - Objective: ${campaign.objective}
        - Daily Budget: $${campaign.dailyBudget}
        - Current Performance:
          * CTR: ${campaign.ctr}%
          * CPC: $${campaign.cpc}
          * CPM: $${campaign.cpm}
          * CPA: $${campaign.cpa}
          * ROAS: ${campaign.roas}

        Historical Performance:
        ${JSON.stringify(performanceData.slice(0, 14), null, 2)}

        Provide performance prediction in this format:
        {
          "predictedImpressions": 50000,
          "predictedClicks": 1500,
          "predictedConversions": 75,
          "predictedSpend": 3000,
          "predictedCtr": 3.0,
          "predictedCpc": 2.0,
          "predictedCpa": 40,
          "predictedRoas": 4.2,
          "confidence": 78
        }

        Base predictions on:
        1. Historical performance trends
        2. Platform-specific benchmarks
        3. Seasonal factors
        4. Budget constraints
        5. Campaign optimization potential
      `;

			const response = await this.aiService.generateResponse(prompt);
			const prediction = this.parsePerformancePrediction(response);

			return {
				campaignId,
				...prediction,
				timeframe,
			};
		} catch (error) {
			console.error("Error predicting campaign performance:", error);
			throw new Error("Failed to predict campaign performance");
		}
	}

	// Generate targeting suggestions
	async generateTargetingSuggestions(
		campaignId: string,
		userId: string,
		platform: string,
	): Promise<AITargetingSuggestion> {
		try {
			const campaign = await this.campaignService.getCampaignById(
				campaignId,
				userId,
			);
			if (!campaign) {
				throw new Error("Campaign not found");
			}

			const prompt = `
        Generate targeting suggestions for this ${platform} advertising campaign.
        
        Campaign Details:
        - Objective: ${campaign.objective}
        - Current Targeting: ${JSON.stringify(campaign.targetAudience)}
        - Demographics: ${JSON.stringify(campaign.demographics)}
        - Interests: ${JSON.stringify(campaign.interests)}
        - Behaviors: ${JSON.stringify(campaign.behaviors)}
        - Locations: ${JSON.stringify(campaign.locations)}

        Current Performance:
        - CTR: ${campaign.ctr}%
        - CPC: $${campaign.cpc}
        - CPA: $${campaign.cpa}
        - ROAS: ${campaign.roas}

        Provide targeting optimization suggestions in this format:
        {
          "demographics": {
            "ageGroups": ["25-34", "35-44"],
            "genders": ["male", "female"],
            "locations": ["United States", "Canada"],
            "languages": ["English"]
          },
          "interests": ["Technology", "Business", "Finance"],
          "behaviors": ["Online Shoppers", "Mobile Users"],
          "lookalikeAudiences": ["High-Value Customers"],
          "customAudiences": ["Website Visitors", "Email Subscribers"],
          "reason": "Based on high-performing segments",
          "expectedReach": 100000,
          "expectedCtr": 3.5
        }

        Consider:
        1. Platform-specific targeting options
        2. Campaign objective alignment
        3. Historical performance data
        4. Audience overlap and reach
        5. Cost efficiency and scalability
      `;

			const response = await this.aiService.generateResponse(prompt);
			return this.parseTargetingSuggestion(response);
		} catch (error) {
			console.error("Error generating targeting suggestions:", error);
			throw new Error("Failed to generate targeting suggestions");
		}
	}

	// Parse AI response for optimization recommendations
	private parseOptimizationRecommendations(
		response: string,
	): OptimizationRecommendation[] {
		try {
			const parsed = JSON.parse(response);
			return parsed.recommendations || [];
		} catch (error) {
			console.error("Error parsing optimization recommendations:", error);
			return [];
		}
	}

	// Parse AI response for budget allocations
	private parseBudgetAllocations(response: string): BudgetAllocation[] {
		try {
			const parsed = JSON.parse(response);
			return parsed.allocations || [];
		} catch (error) {
			console.error("Error parsing budget allocations:", error);
			return [];
		}
	}

	// Parse AI response for performance prediction
	private parsePerformancePrediction(
		response: string,
	): Omit<PerformancePrediction, "campaignId" | "timeframe"> {
		try {
			const parsed = JSON.parse(response);
			return {
				predictedImpressions: parsed.predictedImpressions || 0,
				predictedClicks: parsed.predictedClicks || 0,
				predictedConversions: parsed.predictedConversions || 0,
				predictedSpend: parsed.predictedSpend || 0,
				predictedCtr: parsed.predictedCtr || 0,
				predictedCpc: parsed.predictedCpc || 0,
				predictedCpa: parsed.predictedCpa || 0,
				predictedRoas: parsed.predictedRoas || 0,
				confidence: parsed.confidence || 0,
			};
		} catch (error) {
			console.error("Error parsing performance prediction:", error);
			return {
				predictedImpressions: 0,
				predictedClicks: 0,
				predictedConversions: 0,
				predictedSpend: 0,
				predictedCtr: 0,
				predictedCpc: 0,
				predictedCpa: 0,
				predictedRoas: 0,
				confidence: 0,
			};
		}
	}

	// Parse AI response for targeting suggestion
	private parseTargetingSuggestion(response: string): AITargetingSuggestion {
		try {
			const parsed = JSON.parse(response);
			return {
				demographics: parsed.demographics || {
					ageGroups: [],
					genders: [],
					locations: [],
					languages: [],
				},
				interests: parsed.interests || [],
				behaviors: parsed.behaviors || [],
				lookalikeAudiences: parsed.lookalikeAudiences || [],
				customAudiences: parsed.customAudiences || [],
				reason: parsed.reason || "",
				expectedReach: parsed.expectedReach || 0,
				expectedCtr: parsed.expectedCtr || 0,
			};
		} catch (error) {
			console.error("Error parsing targeting suggestion:", error);
			return {
				demographics: {
					ageGroups: [],
					genders: [],
					locations: [],
					languages: [],
				},
				interests: [],
				behaviors: [],
				lookalikeAudiences: [],
				customAudiences: [],
				reason: "",
				expectedReach: 0,
				expectedCtr: 0,
			};
		}
	}
}
