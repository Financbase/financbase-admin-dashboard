import { pgTable, text, timestamp, integer, jsonb, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const aiConversations = pgTable('ai_conversations', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id').notNull(),
	title: text('title').notNull().default('New Conversation'),
	lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
	messageCount: integer('message_count').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const aiMessages = pgTable('ai_messages', {
	id: uuid('id').primaryKey().defaultRandom(),
	conversationId: uuid('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull(),
	role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
	content: text('content').notNull(),
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const aiConversationsRelations = relations(aiConversations, ({ many }) => ({
	messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
	conversation: one(aiConversations, {
		fields: [aiMessages.conversationId],
		references: [aiConversations.id],
	}),
}));

// Types
export type AIConversation = typeof aiConversations.$inferSelect;
export type NewAIConversation = typeof aiConversations.$inferInsert;
export type AIMessage = typeof aiMessages.$inferSelect;
export type NewAIMessage = typeof aiMessages.$inferInsert;
