/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { chatChannels, chatMessages } from "@/lib/db/schemas";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface CreateChannelInput {
	name: string;
	description?: string;
	type: "public" | "private" | "direct";
	members?: string[];
	settings?: Record<string, any>;
}

export interface CreateMessageInput {
	channelId: string;
	message: string;
	type?: "message" | "file" | "system" | "reply";
	replyTo?: string;
	mentions?: string[];
	attachments?: Array<{ url: string; name: string; type: string; size: number }>;
}

export interface UpdateMessageInput {
	id: string;
	message?: string;
}

/**
 * Chat Service - Handles all chat-related operations
 */
export class ChatService {
	/**
	 * Get all channels for user
	 */
	async getChannels(organizationId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(chatChannels)
			.where(eq(chatChannels.organizationId, organizationId))
			.orderBy(desc(chatChannels.lastMessageAt));

		// Filter to only show channels user is a member of (for private/direct)
		const userChannels = results.filter((channel) => {
			if (channel.type === "public") return true;
			const members = (channel.members as any) || [];
			return members.some((m: any) => m.userId === userId);
		});

		return userChannels;
	}

	/**
	 * Get channel by ID
	 */
	async getChannelById(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(chatChannels)
			.where(eq(chatChannels.id, id))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Channel not found");
		}

		const channel = result[0];
		// Check if user has access
		if (channel.type !== "public") {
			const members = (channel.members as any) || [];
			if (!members.some((m: any) => m.userId === userId)) {
				throw new Error("Unauthorized to access this channel");
			}
		}

		return channel;
	}

	/**
	 * Create a new channel
	 */
	async createChannel(organizationId: string, input: CreateChannelInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const members = input.members || [];
		if (input.type !== "public" && !members.includes(userId)) {
			members.push(userId);
		}

		const channelMembers = members.map((memberId) => ({
			userId: memberId,
			joinedAt: new Date().toISOString(),
			role: memberId === userId ? "admin" : "member",
		}));

		const newChannel = {
			organizationId,
			name: input.name,
			description: input.description,
			type: input.type,
			members: JSON.stringify(channelMembers),
			createdBy: userId,
			settings: input.settings ? JSON.stringify(input.settings) : null,
		};

		const result = await db.insert(chatChannels).values(newChannel).returning();
		return result[0];
	}

	/**
	 * Update channel
	 */
	async updateChannel(id: string, updates: Partial<CreateChannelInput>) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const channel = await this.getChannelById(id);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.description !== undefined) updateData.description = updates.description;
		if (updates.settings !== undefined)
			updateData.settings = JSON.stringify(updates.settings);

		const result = await db
			.update(chatChannels)
			.set(updateData)
			.where(eq(chatChannels.id, id))
			.returning();

		return result[0];
	}

	/**
	 * Delete channel
	 */
	async deleteChannel(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const channel = await this.getChannelById(id);
		if (channel.createdBy !== userId) {
			throw new Error("Only channel creator can delete channel");
		}

		await db.delete(chatChannels).where(eq(chatChannels.id, id));
		return { success: true };
	}

	/**
	 * Get messages for a channel
	 */
	async getChannelMessages(channelId: string, limit: number = 50, offset: number = 0) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify channel access
		await this.getChannelById(channelId);

		const results = await db
			.select()
			.from(chatMessages)
			.where(and(eq(chatMessages.channelId, channelId), eq(chatMessages.deletedAt, null)))
			.orderBy(desc(chatMessages.createdAt))
			.limit(limit)
			.offset(offset);

		return results.reverse(); // Return oldest first
	}

	/**
	 * Send a message
	 */
	async sendMessage(organizationId: string, input: CreateMessageInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify channel access
		await this.getChannelById(input.channelId);

		const newMessage = {
			channelId: input.channelId,
			userId,
			organizationId,
			message: input.message,
			type: input.type || "message",
			replyTo: input.replyTo,
			mentions: input.mentions ? JSON.stringify(input.mentions) : null,
			attachments: input.attachments ? JSON.stringify(input.attachments) : null,
			readBy: JSON.stringify([{ userId, readAt: new Date().toISOString() }]),
		};

		const result = await db.insert(chatMessages).values(newMessage).returning();

		// Update channel's lastMessageAt
		await db
			.update(chatChannels)
			.set({ lastMessageAt: new Date(), updatedAt: new Date() })
			.where(eq(chatChannels.id, input.channelId));

		return result[0];
	}

	/**
	 * Update a message
	 */
	async updateMessage(input: UpdateMessageInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const message = await db
			.select()
			.from(chatMessages)
			.where(and(eq(chatMessages.id, input.id), eq(chatMessages.userId, userId)))
			.limit(1);

		if (message.length === 0) {
			throw new Error("Message not found");
		}

		const result = await db
			.update(chatMessages)
			.set({
				message: input.message,
				updatedAt: new Date(),
			})
			.where(eq(chatMessages.id, input.id))
			.returning();

		return result[0];
	}

	/**
	 * Delete a message (soft delete)
	 */
	async deleteMessage(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const message = await db
			.select()
			.from(chatMessages)
			.where(and(eq(chatMessages.id, id), eq(chatMessages.userId, userId)))
			.limit(1);

		if (message.length === 0) {
			throw new Error("Message not found");
		}

		const result = await db
			.update(chatMessages)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(eq(chatMessages.id, id))
			.returning();

		return result[0];
	}

	/**
	 * Mark message as read
	 */
	async markAsRead(messageId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const message = await db
			.select()
			.from(chatMessages)
			.where(eq(chatMessages.id, messageId))
			.limit(1);

		if (message.length === 0) {
			throw new Error("Message not found");
		}

		const readBy = (message[0].readBy as any) || [];
		if (!readBy.some((r: any) => r.userId === userId)) {
			readBy.push({ userId, readAt: new Date().toISOString() });
		}

		const result = await db
			.update(chatMessages)
			.set({ readBy: JSON.stringify(readBy), updatedAt: new Date() })
			.where(eq(chatMessages.id, messageId))
			.returning();

		return result[0];
	}

	/**
	 * Add reaction to message
	 */
	async addReaction(messageId: string, emoji: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const message = await db
			.select()
			.from(chatMessages)
			.where(eq(chatMessages.id, messageId))
			.limit(1);

		if (message.length === 0) {
			throw new Error("Message not found");
		}

		const reactions = (message[0].reactions as any) || {};
		if (!reactions[emoji]) {
			reactions[emoji] = [];
		}
		if (!reactions[emoji].includes(userId)) {
			reactions[emoji].push(userId);
		}

		const result = await db
			.update(chatMessages)
			.set({ reactions: JSON.stringify(reactions), updatedAt: new Date() })
			.where(eq(chatMessages.id, messageId))
			.returning();

		return result[0];
	}
}

