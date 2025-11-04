/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, jsonb, boolean, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const collaborationChannels = pgTable('collaboration_channels', {
	id: serial('id').primaryKey(),
	channelId: text('channel_id').unique().notNull(), // UUID for external reference
	organizationId: text('organization_id').notNull(),

	// Channel details
	name: text('name').notNull(),
	description: text('description'),
	type: text('type').default('public'), // public, private, dm
	visibility: text('visibility').default('organization'), // organization, team, private

	// Membership
	createdBy: text('created_by').notNull(),
	members: jsonb('members').$defaultFn(() => []), // Array of user IDs
	invitedMembers: jsonb('invited_members').$defaultFn(() => []),

	// Settings
	isArchived: boolean('is_archived').default(false),
	isReadOnly: boolean('is_read_only').default(false),
	allowFileUploads: boolean('allow_file_uploads').default(true),
	maxFileSize: serial('max_file_size').default(10485760), // 10MB in bytes

	// Statistics
	messageCount: serial('message_count').default(0),
	memberCount: serial('member_count').default(0),
	lastMessageAt: timestamp('last_message_at'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const collaborationMessages = pgTable('collaboration_messages', {
	id: serial('id').primaryKey(),
	messageId: text('message_id').unique().notNull(), // UUID for external reference
	channelId: text('channel_id').notNull(),

	// Message content
	content: text('content').notNull(),
	type: text('type').default('text'), // text, file, image, system
	formattedContent: text('formatted_content'), // Rich text formatting

	// Author information
	userId: text('user_id').notNull(),
	userName: text('user_name').notNull(),
	userAvatar: text('user_avatar'),

	// Message metadata
	replyTo: text('reply_to'), // ID of message being replied to
	threadId: text('thread_id'), // For threaded conversations

	// Attachments
	attachments: jsonb('attachments').$defaultFn(() => []), // Array of file attachments

	// Reactions and engagement
	reactions: jsonb('reactions').$defaultFn(() => ({})),
	edited: boolean('edited').default(false),
	editedAt: timestamp('edited_at'),

	// Status
	isDeleted: boolean('is_deleted').default(false),
	deletedAt: timestamp('deleted_at'),
	deletedBy: text('deleted_by'),

	// Moderation
	isPinned: boolean('is_pinned').default(false),
	isSystemMessage: boolean('is_system_message').default(false),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const collaborationMeetings = pgTable('collaboration_meetings', {
	id: serial('id').primaryKey(),
	meetingId: text('meeting_id').unique().notNull(), // UUID for external reference
	organizationId: text('organization_id').notNull(),

	// Meeting details
	title: text('title').notNull(),
	description: text('description'),
	agenda: text('agenda'),

	// Scheduling
	scheduledFor: timestamp('scheduled_for').notNull(),
	duration: serial('duration'), // minutes
	timezone: text('timezone').default('UTC'),

	// Participants
	createdBy: text('created_by').notNull(),
	participants: jsonb('participants').$defaultFn(() => []), // Array of user IDs
	invitedParticipants: jsonb('invited_participants').$defaultFn(() => []),

	// Meeting state
	status: text('status').default('scheduled'), // scheduled, active, paused, ended, cancelled
	meetingUrl: text('meeting_url'), // For video conferencing
	meetingRoom: text('meeting_room'), // Physical room if applicable

	// Recording and notes
	recordingUrl: text('recording_url'),
	notes: text('notes'),
	summary: text('summary'),
	actionItems: jsonb('action_items').$defaultFn(() => []),

	// Settings
	isRecurring: boolean('is_recurring').default(false),
	recurringPattern: text('recurring_pattern'), // daily, weekly, monthly
	isPublic: boolean('is_public').default(false),
	requiresApproval: boolean('requires_approval').default(false),

	// Statistics
	attendeeCount: serial('attendee_count').default(0),
	actualDuration: serial('actual_duration'), // minutes

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const collaborationActivities = pgTable('collaboration_activities', {
	id: serial('id').primaryKey(),
	activityId: text('activity_id').unique().notNull(), // UUID for external reference
	organizationId: text('organization_id').notNull(),

	// Activity details
	type: text('type').notNull(), // message_sent, meeting_created, file_uploaded, user_joined, etc.
	title: text('title').notNull(),
	description: text('description'),

	// Context
	entityType: text('entity_type'), // channel, meeting, user, file
	entityId: text('entity_id'),
	entityName: text('entity_name'),

	// User information
	userId: text('user_id').notNull(),
	userName: text('user_name').notNull(),
	userAvatar: text('user_avatar'),

	// Activity metadata
	metadata: jsonb('metadata'), // Additional context-specific data
	visibility: text('visibility').default('organization'), // organization, team, private

	// Status
	isRead: boolean('is_read').default(false),
	readBy: jsonb('read_by').$defaultFn(() => []),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
});

export const collaborationFiles = pgTable('collaboration_files', {
	id: serial('id').primaryKey(),
	fileId: text('file_id').unique().notNull(), // UUID for external reference

	// File information
	name: text('name').notNull(),
	originalName: text('original_name').notNull(),
	size: serial('size').notNull(), // bytes
	mimeType: text('mime_type').notNull(),
	extension: text('extension'),

	// Storage
	storageProvider: text('storage_provider').default('local'), // local, s3, gcs, etc.
	storagePath: text('storage_path').notNull(),
	publicUrl: text('public_url'),

	// Context
	channelId: text('channel_id'),
	messageId: text('message_id'),
	meetingId: text('meeting_id'),

	// Upload information
	uploadedBy: text('uploaded_by').notNull(),
	uploadedAt: timestamp('uploaded_at').defaultNow(),

	// Access control
	visibility: text('visibility').default('channel'), // public, channel, private
	permissions: jsonb('permissions').$defaultFn(() => []),

	// Processing
	isProcessed: boolean('is_processed').default(false),
	thumbnailUrl: text('thumbnail_url'),
	previewUrl: text('preview_url'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const collaborationNotifications = pgTable('collaboration_notifications', {
	id: serial('id').primaryKey(),
	notificationId: text('notification_id').unique().notNull(), // UUID for external reference
	userId: text('user_id').notNull(),

	// Notification content
	type: text('type').notNull(), // message, mention, meeting, file, system
	title: text('title').notNull(),
	message: text('message').notNull(),

	// Context
	entityType: text('entity_type'), // channel, message, meeting, file
	entityId: text('entity_id'),
	entityName: text('entity_name'),

	// Sender information
	fromUserId: text('from_user_id'),
	fromUserName: text('from_user_name'),
	fromUserAvatar: text('from_user_avatar'),

	// Notification state
	isRead: boolean('is_read').default(false),
	readAt: timestamp('read_at'),

	// Actions
	actionUrl: text('action_url'), // URL to navigate to
	actionLabel: text('action_label'), // Label for action button

	// Priority and grouping
	priority: text('priority').default('normal'), // low, normal, high, urgent
	groupId: text('group_id'), // For grouping related notifications

	// Settings
	emailNotification: boolean('email_notification').default(true),
	pushNotification: boolean('push_notification').default(true),
	inAppNotification: boolean('in_app_notification').default(true),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	expiresAt: timestamp('expires_at'),
});

export const collaborationUserPresence = pgTable('collaboration_user_presence', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	organizationId: text('organization_id').notNull(),

	// Presence information
	status: text('status').default('online'), // online, away, busy, offline
	customStatus: text('custom_status'),
	statusEmoji: text('status_emoji'),

	// Location and context
	currentChannelId: text('current_channel_id'),
	currentMeetingId: text('current_meeting_id'),
	lastActivityAt: timestamp('last_activity_at').defaultNow(),

	// Device information
	deviceType: text('device_type'), // desktop, mobile, tablet
	browser: text('browser'),
	os: text('os'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const collaborationTeams = pgTable('collaboration_teams', {
	id: serial('id').primaryKey(),
	teamId: text('team_id').unique().notNull(), // UUID for external reference
	organizationId: text('organization_id').notNull(),

	// Team details
	name: text('name').notNull(),
	description: text('description'),
	color: text('color').default('#3B82F6'), // Hex color code
	icon: text('icon'),

	// Membership
	createdBy: text('created_by').notNull(),
	members: jsonb('members').$defaultFn(() => []), // Array of user objects with roles
	invitedMembers: jsonb('invited_members').$defaultFn(() => []),

	// Settings
	visibility: text('visibility').default('organization'), // organization, private
	isDefault: boolean('is_default').default(false),

	// Statistics
	memberCount: serial('member_count').default(0),
	channelCount: serial('channel_count').default(0),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

// Type exports for use in application
export type CollaborationChannel = typeof collaborationChannels.$inferSelect;
export type NewCollaborationChannel = typeof collaborationChannels.$inferInsert;

export type CollaborationMessage = typeof collaborationMessages.$inferSelect;
export type NewCollaborationMessage = typeof collaborationMessages.$inferInsert;

export type CollaborationMeeting = typeof collaborationMeetings.$inferSelect;
export type NewCollaborationMeeting = typeof collaborationMeetings.$inferInsert;

export type CollaborationActivity = typeof collaborationActivities.$inferSelect;
export type NewCollaborationActivity = typeof collaborationActivities.$inferInsert;

export type CollaborationFile = typeof collaborationFiles.$inferSelect;
export type NewCollaborationFile = typeof collaborationFiles.$inferInsert;

export type CollaborationNotification = typeof collaborationNotifications.$inferSelect;
export type NewCollaborationNotification = typeof collaborationNotifications.$inferInsert;

export type CollaborationUserPresence = typeof collaborationUserPresence.$inferSelect;
export type NewCollaborationUserPresence = typeof collaborationUserPresence.$inferInsert;

export type CollaborationTeam = typeof collaborationTeams.$inferSelect;
export type NewCollaborationTeam = typeof collaborationTeams.$inferInsert;
