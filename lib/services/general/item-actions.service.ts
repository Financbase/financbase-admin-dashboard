import { and, desc, eq, sql } from "drizzle-orm";
import { CheckCircle, MessageCircle, Trash2, XCircle } from "lucide-react";
import { getDbOrThrow } from "../db";
import { itemActions, itemLogs, itemShares, posts, users } from "../db/schemas";

export interface ItemActionParams {
	entityType: string;
	entityId: string;
	actionType:
		| "pin"
		| "favorite"
		| "clone"
		| "move"
		| "share"
		| "delete"
		| "rename"
		| "view_logs";
	metadata?: Record<string, any>;
}

export interface ItemShareParams {
	entityType: string;
	entityId: string;
	sharedWith: string[];
	permissions?: {
		canView?: boolean;
		canEdit?: boolean;
		canDelete?: boolean;
		canShare?: boolean;
	};
	expiresAt?: Date;
}

export class ItemActionsService {
	private db = getDbOrThrow();

	/**
	 * Create a new item action
	 */
	async createAction(userId: string, params: ItemActionParams) {
		try {
			const action = await this.db
				.insert(itemActions)
				.values({
					userId,
					entityType: params.entityType,
					entityId: params.entityId,
					actionType: params.actionType,
					metadata: params.metadata || {},
					isCompleted: false,
				})
				.returning();

			// Log the action
			await this.logAction(
				params.entityType,
				params.entityId,
				userId,
				`initiated_${params.actionType}`,
				{
					actionId: action[0].id,
					...params.metadata,
				},
			);

			return action[0];
		} catch (error) {
			console.error("Error creating item action:", error);
			throw new Error("Failed to create item action");
		}
	}

	/**
	 * Complete an item action
	 */
	async completeAction(actionId: string) {
		try {
			return await this.db
				.update(itemActions)
				.set({
					isCompleted: true,
					updatedAt: new Date(),
				})
				.where(eq(itemActions.id, actionId))
				.returning();
		} catch (error) {
			console.error("Error completing item action:", error);
			throw new Error("Failed to complete item action");
		}
	}

	/**
	 * Pin an item
	 */
	async pinItem(userId: string, entityType: string, entityId: string) {
		try {
			// Check if already pinned
			const existingPin = await this.db
				.select()
				.from(itemActions)
				.where(
					and(
						eq(itemActions.userId, userId),
						eq(itemActions.entityType, entityType),
						eq(itemActions.entityId, entityId),
						eq(itemActions.actionType, "pin"),
						eq(itemActions.isCompleted, false),
					),
				)
				.limit(1);

			if (existingPin.length > 0) {
				// Already pinned, just return success
				return { success: true, message: "Item already pinned" };
			}

			await this.createAction(userId, {
				entityType,
				entityId,
				actionType: "pin",
			});

			return { success: true, message: "Item pinned successfully" };
		} catch (error) {
			console.error("Error pinning item:", error);
			throw new Error("Failed to pin item");
		}
	}

	/**
	 * Unpin an item
	 */
	async unpinItem(userId: string, entityType: string, entityId: string) {
		try {
			const result = await this.db
				.update(itemActions)
				.set({
					isCompleted: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(itemActions.userId, userId),
						eq(itemActions.entityType, entityType),
						eq(itemActions.entityId, entityId),
						eq(itemActions.actionType, "pin"),
						eq(itemActions.isCompleted, false),
					),
				)
				.returning();

			return { success: true, message: "Item unpinned successfully" };
		} catch (error) {
			console.error("Error unpinning item:", error);
			throw new Error("Failed to unpin item");
		}
	}

	/**
	 * Check if an item is pinned
	 */
	async isItemPinned(userId: string, entityType: string, entityId: string) {
		try {
			const pin = await this.db
				.select()
				.from(itemActions)
				.where(
					and(
						eq(itemActions.userId, userId),
						eq(itemActions.entityType, entityType),
						eq(itemActions.entityId, entityId),
						eq(itemActions.actionType, "pin"),
						eq(itemActions.isCompleted, false),
					),
				)
				.limit(1);

			return pin.length > 0;
		} catch (error) {
			console.error("Error checking if item is pinned:", error);
			return false;
		}
	}

	/**
	 * Clone an item
	 */
	async cloneItem(
		userId: string,
		entityType: string,
		entityId: string,
		newName?: string,
	) {
		try {
			// Get the original item data (this is a simplified example)
			// In a real implementation, you'd fetch the actual item data
			const action = await this.createAction(userId, {
				entityType,
				entityId,
				actionType: "clone",
				metadata: { newName },
			});

			// Complete the action immediately for clone
			await this.completeAction(action.id);

			// Log the completion
			await this.logAction(entityType, entityId, userId, "cloned", {
				newName,
				cloneActionId: action.id,
			});

			return {
				success: true,
				message: "Item cloned successfully",
				cloneId: action.id,
			};
		} catch (error) {
			console.error("Error cloning item:", error);
			throw new Error("Failed to clone item");
		}
	}

	/**
	 * Rename an item
	 */
	async renameItem(
		userId: string,
		entityType: string,
		entityId: string,
		newName: string,
	) {
		try {
			// This would update the actual entity (post, project, etc.)
			// For now, we'll just log the action
			const action = await this.createAction(userId, {
				entityType,
				entityId,
				actionType: "rename",
				metadata: { newName, oldName: "current_name" }, // You'd get the old name from the entity
			});

			// Complete the action
			await this.completeAction(action.id);

			// Log the completion
			await this.logAction(entityType, entityId, userId, "renamed", {
				newName,
				renameActionId: action.id,
			});

			return { success: true, message: "Item renamed successfully" };
		} catch (error) {
			console.error("Error renaming item:", error);
			throw new Error("Failed to rename item");
		}
	}

	/**
	 * Share an item
	 */
	async shareItem(userId: string, params: ItemShareParams) {
		try {
			const share = await this.db
				.insert(itemShares)
				.values({
					entityType: params.entityType,
					entityId: params.entityId,
					sharedBy: userId,
					sharedWith: params.sharedWith,
					permissions: params.permissions || { canView: true },
					expiresAt: params.expiresAt,
				})
				.returning();

			// Log the share action
			await this.logAction(
				params.entityType,
				params.entityId,
				userId,
				"shared",
				{
					sharedWith: params.sharedWith,
					permissions: params.permissions,
				},
			);

			return {
				success: true,
				message: "Item shared successfully",
				shareId: share[0].id,
			};
		} catch (error) {
			console.error("Error sharing item:", error);
			throw new Error("Failed to share item");
		}
	}

	/**
	 * Delete an item
	 */
	async deleteItem(userId: string, entityType: string, entityId: string) {
		try {
			// This would delete the actual entity
			// For now, we'll just log the action
			const action = await this.createAction(userId, {
				entityType,
				entityId,
				actionType: "delete",
			});

			// Complete the action
			await this.completeAction(action.id);

			// Log the completion
			await this.logAction(entityType, entityId, userId, "deleted", {
				deleteActionId: action.id,
			});

			return { success: true, message: "Item deleted successfully" };
		} catch (error) {
			console.error("Error deleting item:", error);
			throw new Error("Failed to delete item");
		}
	}

	/**
	 * Get item logs
	 */
	async getItemLogs(entityType: string, entityId: string, limit = 50) {
		try {
			return await this.db
				.select({
					id: itemLogs.id,
					action: itemLogs.action,
					details: itemLogs.details,
					createdAt: itemLogs.createdAt,
					user: {
						id: users.id,
						name: users.name,
						email: users.email,
					},
				})
				.from(itemLogs)
				.leftJoin(users, eq(itemLogs.userId, users.id))
				.where(
					and(
						eq(itemLogs.entityType, entityType),
						eq(itemLogs.entityId, entityId),
					),
				)
				.orderBy(desc(itemLogs.createdAt))
				.limit(limit);
		} catch (error) {
			console.error("Error getting item logs:", error);
			throw new Error("Failed to get item logs");
		}
	}

	/**
	 * Get user's pinned items
	 */
	async getPinnedItems(userId: string, entityType?: string) {
		try {
			const query = this.db
				.select({
					id: itemActions.id,
					entityType: itemActions.entityType,
					entityId: itemActions.entityId,
					actionType: itemActions.actionType,
					createdAt: itemActions.createdAt,
					metadata: itemActions.metadata,
				})
				.from(itemActions)
				.where(
					and(
						eq(itemActions.userId, userId),
						eq(itemActions.actionType, "pin"),
						eq(itemActions.isCompleted, false),
					),
				)
				.orderBy(desc(itemActions.createdAt));

			if (entityType) {
				query.where(
					and(
						eq(itemActions.entityType, entityType),
						eq(itemActions.userId, userId),
						eq(itemActions.actionType, "pin"),
						eq(itemActions.isCompleted, false),
					),
				);
			}

			return await query;
		} catch (error) {
			console.error("Error getting pinned items:", error);
			throw new Error("Failed to get pinned items");
		}
	}

	/**
	 * Log an action for an entity
	 */
	private async logAction(
		entityType: string,
		entityId: string,
		userId: string,
		action: string,
		details?: Record<string, any>,
	) {
		try {
			await this.db.insert(itemLogs).values({
				entityType,
				entityId,
				userId,
				action,
				details: details || {},
			});
		} catch (error) {
			console.error("Error logging action:", error);
			// Don't throw here as logging failures shouldn't break the main action
		}
	}
}
