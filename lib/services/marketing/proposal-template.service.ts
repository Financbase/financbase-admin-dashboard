import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
	ArrowUp,
	ArrowUpDown,
	Clock,
	CreditCard,
	Filter,
	Trash2,
} from "lucide-react";
import { db } from "../db/connection";
import {
	type NewProposalTemplate,
	type ProposalTemplate,
	proposalTemplates,
} from "../db/schema-proposals";

export interface CreateTemplateData {
	name: string;
	description?: string;
	category: string;
	projectType: "fixed" | "hourly";
	priority: "low" | "medium" | "high";
	templateData: Record<string, any>;
	defaultSteps?: Array<{
		title: string;
		description: string;
		order: number;
	}>;
	isPublic?: boolean;
}

export class ProposalTemplateService {
	/**
	 * Create a new proposal template
	 */
	async createTemplate(
		data: CreateTemplateData,
		userId: string,
	): Promise<ProposalTemplate> {
		const templateData: NewProposalTemplate = {
			userId,
			name: data.name,
			description: data.description,
			category: data.category,
			projectType: data.projectType,
			priority: data.priority,
			templateData: data.templateData,
			defaultSteps: data.defaultSteps || null,
			isPublic: data.isPublic || false,
		};

		const [newTemplate] = await db
			.insert(proposalTemplates)
			.values(templateData)
			.returning();

		return newTemplate;
	}

	/**
	 * Get all templates for a user
	 */
	async getTemplates(
		userId: string,
		includePublic = true,
	): Promise<ProposalTemplate[]> {
		let query = db
			.select()
			.from(proposalTemplates)
			.where(eq(proposalTemplates.userId, userId));

		if (includePublic) {
			query = query.or(eq(proposalTemplates.isPublic, true));
		}

		return await query.orderBy(
			desc(proposalTemplates.usageCount),
			desc(proposalTemplates.createdAt),
		);
	}

	/**
	 * Get templates by category
	 */
	async getTemplatesByCategory(
		userId: string,
		category: string,
		includePublic = true,
	): Promise<ProposalTemplate[]> {
		let query = db
			.select()
			.from(proposalTemplates)
			.where(
				and(
					eq(proposalTemplates.userId, userId),
					eq(proposalTemplates.category, category),
				),
			);

		if (includePublic) {
			query = query.or(
				and(
					eq(proposalTemplates.isPublic, true),
					eq(proposalTemplates.category, category),
				),
			);
		}

		return await query.orderBy(
			desc(proposalTemplates.usageCount),
			desc(proposalTemplates.createdAt),
		);
	}

	/**
	 * Get a specific template by ID
	 */
	async getTemplateById(
		templateId: string,
		userId: string,
	): Promise<ProposalTemplate | null> {
		const [template] = await db
			.select()
			.from(proposalTemplates)
			.where(
				and(
					eq(proposalTemplates.id, templateId),
					eq(proposalTemplates.userId, userId),
				),
			)
			.limit(1);

		return template || null;
	}

	/**
	 * Update a template
	 */
	async updateTemplate(
		templateId: string,
		userId: string,
		updates: Partial<NewProposalTemplate>,
	): Promise<ProposalTemplate | null> {
		const [updatedTemplate] = await db
			.update(proposalTemplates)
			.set({ ...updates, updatedAt: new Date() })
			.where(
				and(
					eq(proposalTemplates.id, templateId),
					eq(proposalTemplates.userId, userId),
				),
			)
			.returning();

		return updatedTemplate || null;
	}

	/**
	 * Delete a template
	 */
	async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
		const result = await db
			.delete(proposalTemplates)
			.where(
				and(
					eq(proposalTemplates.id, templateId),
					eq(proposalTemplates.userId, userId),
				),
			);

		return result.rowCount > 0;
	}

	/**
	 * Create a proposal from a template
	 */
	async createProposalFromTemplate(
		templateId: string,
		userId: string,
		overrides: Record<string, any> = {},
	): Promise<ProposalTemplate> {
		const template = await this.getTemplateById(templateId, userId);
		if (!template) {
			throw new Error("Template not found or access denied");
		}

		// Merge template data with overrides
		const proposalData = {
			...template.templateData,
			...overrides,
			userId,
			// Don't copy template metadata to proposal
			templateId: undefined,
		};

		// Increment template usage count
		await this.incrementUsageCount(templateId, userId);

		return template;
	}

	/**
	 * Get popular templates (by usage count)
	 */
	async getPopularTemplates(
		userId: string,
		limit = 10,
	): Promise<ProposalTemplate[]> {
		return await db
			.select()
			.from(proposalTemplates)
			.where(eq(proposalTemplates.userId, userId))
			.orderBy(desc(proposalTemplates.usageCount))
			.limit(limit);
	}

	/**
	 * Get template categories
	 */
	async getTemplateCategories(userId: string): Promise<string[]> {
		const categories = await db
			.select({ category: proposalTemplates.category })
			.from(proposalTemplates)
			.where(eq(proposalTemplates.userId, userId))
			.groupBy(proposalTemplates.category);

		return categories.map((c) => c.category).sort();
	}

	/**
	 * Increment template usage count
	 */
	private async incrementUsageCount(
		templateId: string,
		userId: string,
	): Promise<void> {
		await db
			.update(proposalTemplates)
			.set({
				usageCount: sql`${proposalTemplates.usageCount} + 1`,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(proposalTemplates.id, templateId),
					eq(proposalTemplates.userId, userId),
				),
			);
	}

	/**
	 * Get template statistics
	 */
	async getTemplateStats(userId: string): Promise<{
		totalTemplates: number;
		publicTemplates: number;
		totalUsage: number;
		categories: string[];
	}> {
		const templates = await this.getTemplates(userId, false); // Only user's templates

		const totalTemplates = templates.length;
		const publicTemplates = templates.filter((t) => t.isPublic).length;
		const totalUsage = templates.reduce(
			(sum, t) => sum + Number.parseInt(t.usageCount?.toString() || "0"),
			0,
		);
		const categories = await this.getTemplateCategories(userId);

		return {
			totalTemplates,
			publicTemplates,
			totalUsage,
			categories,
		};
	}

	/**
	 * Duplicate a template
	 */
	async duplicateTemplate(
		templateId: string,
		userId: string,
		newName: string,
	): Promise<ProposalTemplate> {
		const originalTemplate = await this.getTemplateById(templateId, userId);
		if (!originalTemplate) {
			throw new Error("Template not found or access denied");
		}

		const duplicatedData: NewProposalTemplate = {
			userId,
			name: newName,
			description: `Copy of ${originalTemplate.name}`,
			category: originalTemplate.category,
			projectType: originalTemplate.projectType,
			priority: originalTemplate.priority,
			templateData: originalTemplate.templateData,
			defaultSteps: originalTemplate.defaultSteps,
			isPublic: false, // Duplicates are private by default
		};

		const [newTemplate] = await db
			.insert(proposalTemplates)
			.values(duplicatedData)
			.returning();

		return newTemplate;
	}

	/**
	 * Get predefined template categories
	 */
	static getDefaultCategories(): string[] {
		return [
			"web-development",
			"mobile-development",
			"design",
			"consulting",
			"marketing",
			"content-creation",
			"seo",
			"social-media",
			"e-commerce",
			"maintenance",
			"training",
			"other",
		];
	}

	/**
	 * Get predefined step templates for different project types
	 */
	static getDefaultStepTemplates(projectType: "fixed" | "hourly"): Array<{
		title: string;
		description: string;
		order: number;
	}> {
		const commonSteps = [
			{
				title: "Project Kickoff",
				description: "Initial meeting and requirements gathering",
				order: 1,
			},
			{
				title: "Design & Planning",
				description: "Create project plan and design specifications",
				order: 2,
			},
			{
				title: "Development",
				description: "Build and implement the solution",
				order: 3,
			},
			{
				title: "Testing & QA",
				description: "Quality assurance and testing phase",
				order: 4,
			},
			{
				title: "Deployment",
				description: "Deploy to production environment",
				order: 5,
			},
		];

		if (projectType === "hourly") {
			return [
				...commonSteps.slice(0, 2), // Kickoff and Planning
				{
					title: "Rate Agreement",
					description: "Agree on hourly rate and payment terms",
					order: 3,
				},
				...commonSteps.slice(2), // Development onwards
				{
					title: "Time Tracking",
					description: "Set up time tracking and reporting",
					order: 6,
				},
			];
		}

		return commonSteps;
	}
}
