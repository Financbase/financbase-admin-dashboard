import { actions } from "@/drizzle/schema/actions";
import {
	type Action,
	type ActionSearchFilters,
	type NewAction,
	insertActionSchema,
	selectActionSchema,
} from "@/drizzle/schema/actions";
import { db } from "@/lib/db";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { Bot, Edit, Tag, Trash2, XCircle } from "lucide-react";

export class ActionsService {
	/**
	 * Search actions with filters
	 */
	static async search(
		filters: ActionSearchFilters,
		userId?: string,
	): Promise<{
		actions: Action[];
		total: number;
	}> {
		// Build where conditions
		const whereConditions = [];

		// Show public actions to all users, or user's own actions if authenticated
		if (userId) {
			whereConditions.push(
				or(eq(actions.isPublic, true), eq(actions.createdBy, userId)),
			);
		} else {
			whereConditions.push(eq(actions.isPublic, true));
		}

		// Filter by active status if specified
		if (filters.isActive !== undefined) {
			whereConditions.push(eq(actions.isActive, filters.isActive));
		}

		// Filter by category
		if (filters.category) {
			whereConditions.push(eq(actions.category, filters.category));
		}

		// Filter by action type
		if (filters.actionType) {
			whereConditions.push(eq(actions.actionType, filters.actionType));
		}

		// Search in label and description
		if (filters.query) {
			whereConditions.push(
				or(
					ilike(actions.label, `%${filters.query}%`),
					ilike(actions.description, `%${filters.query}%`),
				),
			);
		}

		const whereClause =
			whereConditions.length > 0 ? and(...whereConditions) : undefined;

		// Build order by clause
		const orderByClause =
			filters.sortBy === "label"
				? filters.sortOrder === "asc"
					? asc(actions.label)
					: desc(actions.label)
				: filters.sortOrder === "asc"
					? asc(actions.createdAt)
					: desc(actions.createdAt);

		// Execute query
		const actionsList = await db
			.select()
			.from(actions)
			.where(whereClause)
			.orderBy(orderByClause)
			.limit(filters.limit || 50)
			.offset(filters.offset || 0);

		// Filter by tags if needed (client-side filtering for simplicity)
		let filteredActions = actionsList;
		if (filters.tags && filters.tags.length > 0) {
			filteredActions = actionsList.filter(
				(action) =>
					action.tags &&
					filters.tags?.some((tag) => action.tags?.includes(tag)),
			);
		}

		// Get total count for pagination
		const totalCount = await db
			.select({ count: actions.id })
			.from(actions)
			.where(whereClause);

		return {
			actions: filteredActions,
			total: totalCount[0]?.count || 0,
		};
	}

	/**
	 * Create a new action
	 */
	static async create(actionData: NewAction, userId: string): Promise<Action> {
		const validatedData = insertActionSchema.parse({
			...actionData,
			createdBy: userId,
		});

		const newAction = await db
			.insert(actions)
			.values(validatedData)
			.returning();

		return newAction[0];
	}

	/**
	 * Get a specific action by ID
	 */
	static async getById(
		actionId: string,
		userId?: string,
	): Promise<Action | null> {
		const whereConditions = [eq(actions.id, actionId)];

		// Show public actions to all users, or user's own actions if authenticated
		if (userId) {
			whereConditions.push(
				or(eq(actions.isPublic, true), eq(actions.createdBy, userId)),
			);
		} else {
			whereConditions.push(eq(actions.isPublic, true));
		}

		const action = await db
			.select()
			.from(actions)
			.where(and(...whereConditions))
			.limit(1);

		return action[0] || null;
	}

	/**
	 * Update an action
	 */
	static async update(
		actionId: string,
		updateData: Partial<NewAction>,
		userId: string,
	): Promise<Action> {
		// First check if the action exists and user has permission to edit it
		const existingAction = await ActionsService.getById(actionId, userId);

		if (!existingAction) {
			throw new Error("Action not found or access denied");
		}

		// Only allow editing if user created it (not public actions)
		if (existingAction.createdBy !== userId) {
			throw new Error("Access denied. You can only edit actions you created.");
		}

		const validatedData = insertActionSchema.parse(updateData);

		const updatedAction = await db
			.update(actions)
			.set({
				...validatedData,
				updatedAt: new Date(),
			})
			.where(eq(actions.id, actionId))
			.returning();

		return updatedAction[0];
	}

	/**
	 * Delete an action
	 */
	static async delete(actionId: string, userId: string): Promise<void> {
		// First check if the action exists and user has permission to delete it
		const existingAction = await ActionsService.getById(actionId, userId);

		if (!existingAction) {
			throw new Error("Action not found or access denied");
		}

		// Only allow deletion if user created it (not public actions)
		if (existingAction.createdBy !== userId) {
			throw new Error(
				"Access denied. You can only delete actions you created.",
			);
		}

		await db.delete(actions).where(eq(actions.id, actionId));
	}

	/**
	 * Get default actions for initial setup
	 */
	static getDefaultActions(): Omit<NewAction, "createdBy">[] {
		return [
			{
				label: "Book tickets",
				description: "Operator",
				icon: "PlaneTakeoff",
				shortcut: "⌘K",
				endLabel: "Agent",
				actionType: "command",
				category: "travel",
				isPublic: true,
				isActive: true,
			},
			{
				label: "Summarize",
				description: "gpt-4o",
				icon: "BarChart2",
				shortcut: "⌘cmd+p",
				endLabel: "Command",
				actionType: "command",
				category: "ai",
				isPublic: true,
				isActive: true,
			},
			{
				label: "Screen Studio",
				description: "gpt-4o",
				icon: "Video",
				endLabel: "Application",
				actionType: "command",
				category: "productivity",
				isPublic: true,
				isActive: true,
			},
			{
				label: "Talk to Jarvis",
				description: "gpt-4o voice",
				icon: "AudioLines",
				endLabel: "Active",
				actionType: "command",
				category: "ai",
				isPublic: true,
				isActive: true,
			},
			{
				label: "Translate",
				description: "gpt-4o",
				icon: "Globe",
				endLabel: "Command",
				actionType: "command",
				category: "ai",
				isPublic: true,
				isActive: true,
			},
		];
	}

	/**
	 * Initialize default actions for a user
	 */
	static async initializeDefaultActions(userId: string): Promise<void> {
		const defaultActions = ActionsService.getDefaultActions();

		for (const actionData of defaultActions) {
			try {
				await ActionsService.create(actionData, userId);
			} catch (error) {
				// Ignore duplicate errors (action might already exist)
				console.warn(
					"Failed to create default action:",
					actionData.label,
					error,
				);
			}
		}
	}
}
