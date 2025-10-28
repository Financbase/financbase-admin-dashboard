import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	message: text('message').notNull(),
	type: text('type').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});