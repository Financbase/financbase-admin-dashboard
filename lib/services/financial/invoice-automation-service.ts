import { db } from "@/lib/db";
import { agencyClients, agencyProjects } from "@/lib/db/schemas/agency.schema";
import { and, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import {
	CheckCircle,
	CreditCard,
	Database,
	Key,
	MessageCircle,
	Trash2,
	Workflow,
	XCircle,
} from "lucide-react";

export interface AutomationRule {
	id: string;
	name: string;
	description: string;
	trigger: "project_completion" | "milestone_reached" | "time_based" | "manual";
	conditions: {
		projectStatus?: string;
		milestoneType?: string;
		daysAfter?: number;
		amountThreshold?: number;
	};
	actions: {
		generateInvoice: boolean;
		sendEmail: boolean;
		createReminder: boolean;
		customMessage?: string;
	};
	isActive: boolean;
	createdAt: Date;
	lastTriggered?: Date;
	triggerCount: number;
}

export interface AutomationTemplate {
	id: string;
	name: string;
	description: string;
	category: "freelance" | "agency" | "retainer" | "hourly";
	rules: Omit<
		AutomationRule,
		"id" | "createdAt" | "lastTriggered" | "triggerCount"
	>;
}

export interface AutomationStats {
	totalRules: number;
	activeRules: number;
	totalTriggers: number;
	successRate: number;
	timeSaved: number; // hours
	revenueGenerated: number;
}

export interface AutomationData {
	rules: AutomationRule[];
	templates: AutomationTemplate[];
	stats: AutomationStats;
}

export class InvoiceAutomationService {
	/**
	 * Get automation data for a user
	 */
	async getAutomationData(userId: string): Promise<AutomationData> {
		try {
			// Get automation rules
			const rules = await this.getAutomationRules(userId);

			// Get templates
			const templates = this.getAutomationTemplates();

			// Get stats
			const stats = await this.getAutomationStats(userId);

			return {
				rules,
				templates,
				stats,
			};
		} catch (error) {
			console.error("Error fetching automation data:", error);
			throw new Error(
				`Failed to fetch automation data: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get automation rules for a user
	 */
	async getAutomationRules(userId: string): Promise<AutomationRule[]> {
		try {
			// In a real implementation, you'd query the database
			return [
				{
					id: "rule-1",
					name: "Project Completion Invoice",
					description:
						"Automatically generate invoice when project is marked as completed",
					trigger: "project_completion",
					conditions: {
						projectStatus: "completed",
					},
					actions: {
						generateInvoice: true,
						sendEmail: true,
						createReminder: false,
						customMessage:
							"Your project has been completed. Invoice will be sent shortly.",
					},
					isActive: true,
					createdAt: new Date(),
					lastTriggered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
					triggerCount: 15,
				},
				{
					id: "rule-2",
					name: "Monthly Retainer Invoice",
					description:
						"Generate monthly retainer invoices on the 1st of each month",
					trigger: "time_based",
					conditions: {
						daysAfter: 30,
					},
					actions: {
						generateInvoice: true,
						sendEmail: true,
						createReminder: false,
					},
					isActive: true,
					createdAt: new Date(),
					lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
					triggerCount: 8,
				},
				{
					id: "rule-3",
					name: "Milestone Payment Request",
					description: "Send payment request when milestone is reached",
					trigger: "milestone_reached",
					conditions: {
						milestoneType: "payment",
					},
					actions: {
						generateInvoice: false,
						sendEmail: true,
						createReminder: true,
						customMessage: "Milestone reached. Payment request sent.",
					},
					isActive: false,
					createdAt: new Date(),
					triggerCount: 3,
				},
			];
		} catch (error) {
			console.error("Error fetching automation rules:", error);
			throw new Error(
				`Failed to fetch automation rules: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get automation templates
	 */
	getAutomationTemplates(): AutomationTemplate[] {
		return [
			{
				id: "template-1",
				name: "Freelance Project Completion",
				description:
					"Automatically invoice when freelance project is completed",
				category: "freelance",
				rules: {
					name: "Freelance Project Completion",
					description:
						"Automatically invoice when freelance project is completed",
					trigger: "project_completion",
					conditions: {
						projectStatus: "completed",
					},
					actions: {
						generateInvoice: true,
						sendEmail: true,
						createReminder: false,
					},
					isActive: true,
				},
			},
			{
				id: "template-2",
				name: "Agency Retainer Invoice",
				description: "Monthly retainer invoice for agency clients",
				category: "agency",
				rules: {
					name: "Agency Retainer Invoice",
					description: "Monthly retainer invoice for agency clients",
					trigger: "time_based",
					conditions: {
						daysAfter: 30,
					},
					actions: {
						generateInvoice: true,
						sendEmail: true,
						createReminder: false,
					},
					isActive: true,
				},
			},
			{
				id: "template-3",
				name: "Hourly Project Invoice",
				description: "Weekly invoice for hourly projects",
				category: "hourly",
				rules: {
					name: "Hourly Project Invoice",
					description: "Weekly invoice for hourly projects",
					trigger: "time_based",
					conditions: {
						daysAfter: 7,
					},
					actions: {
						generateInvoice: true,
						sendEmail: true,
						createReminder: false,
					},
					isActive: true,
				},
			},
			{
				id: "template-4",
				name: "Milestone Payment Request",
				description: "Send payment request when milestone is reached",
				category: "retainer",
				rules: {
					name: "Milestone Payment Request",
					description: "Send payment request when milestone is reached",
					trigger: "milestone_reached",
					conditions: {
						milestoneType: "payment",
					},
					actions: {
						generateInvoice: false,
						sendEmail: true,
						createReminder: true,
					},
					isActive: true,
				},
			},
		];
	}

	/**
	 * Get automation stats
	 */
	async getAutomationStats(userId: string): Promise<AutomationStats> {
		try {
			// In a real implementation, you'd calculate from actual data
			return {
				totalRules: 3,
				activeRules: 2,
				totalTriggers: 26,
				successRate: 92.3,
				timeSaved: 45, // hours
				revenueGenerated: 125000,
			};
		} catch (error) {
			console.error("Error fetching automation stats:", error);
			throw new Error(
				`Failed to fetch automation stats: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Create automation rule
	 */
	async createAutomationRule(
		userId: string,
		ruleData: Omit<
			AutomationRule,
			"id" | "createdAt" | "lastTriggered" | "triggerCount"
		>,
	): Promise<AutomationRule> {
		try {
			const rule: AutomationRule = {
				id: crypto.randomUUID(),
				...ruleData,
				createdAt: new Date(),
				triggerCount: 0,
			};

			// In a real implementation, you'd save to database
			return rule;
		} catch (error) {
			console.error("Error creating automation rule:", error);
			throw new Error(
				`Failed to create automation rule: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Update automation rule
	 */
	async updateAutomationRule(
		userId: string,
		ruleId: string,
		updates: Partial<AutomationRule>,
	): Promise<AutomationRule> {
		try {
			// In a real implementation, you'd update in database
			const rule: AutomationRule = {
				id: ruleId,
				name: "Updated Rule",
				description: "Updated description",
				trigger: "project_completion",
				conditions: {},
				actions: {
					generateInvoice: true,
					sendEmail: true,
					createReminder: false,
				},
				isActive: true,
				createdAt: new Date(),
				triggerCount: 0,
				...updates,
			};

			return rule;
		} catch (error) {
			console.error("Error updating automation rule:", error);
			throw new Error(
				`Failed to update automation rule: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Delete automation rule
	 */
	async deleteAutomationRule(userId: string, ruleId: string): Promise<void> {
		try {
			// In a real implementation, you'd delete from database
			console.log(`Deleting automation rule ${ruleId} for user ${userId}`);
		} catch (error) {
			console.error("Error deleting automation rule:", error);
			throw new Error(
				`Failed to delete automation rule: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Trigger automation rule
	 */
	async triggerAutomationRule(
		userId: string,
		ruleId: string,
		context: {
			projectId?: string;
			clientId?: string;
			amount?: number;
			[key: string]: unknown;
		},
	): Promise<{
		success: boolean;
		actions: string[];
		error?: string;
	}> {
		try {
			// In a real implementation, you'd:
			// 1. Get the rule
			// 2. Check conditions
			// 3. Execute actions
			// 4. Log the trigger

			const actions = ["Invoice generated", "Email sent"];

			return {
				success: true,
				actions,
			};
		} catch (error) {
			console.error("Error triggering automation rule:", error);
			return {
				success: false,
				actions: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get automation rule execution history
	 */
	async getAutomationHistory(
		userId: string,
		ruleId?: string,
		limit = 50,
	): Promise<
		{
			id: string;
			ruleId: string;
			ruleName: string;
			triggeredAt: Date;
			context: Record<string, unknown>;
			success: boolean;
			actions: string[];
			error?: string;
		}[]
	> {
		try {
			// In a real implementation, you'd query the database
			return [
				{
					id: "exec-1",
					ruleId: "rule-1",
					ruleName: "Project Completion Invoice",
					triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
					context: {
						projectId: "project-1",
						clientId: "client-1",
						amount: 5000,
					},
					success: true,
					actions: ["Invoice generated", "Email sent"],
				},
				{
					id: "exec-2",
					ruleId: "rule-2",
					ruleName: "Monthly Retainer Invoice",
					triggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
					context: {
						clientId: "client-2",
						amount: 2500,
					},
					success: true,
					actions: ["Invoice generated", "Email sent"],
				},
			];
		} catch (error) {
			console.error("Error fetching automation history:", error);
			throw new Error(
				`Failed to fetch automation history: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
