/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const videoConferencingIntegrations = pgTable('video_conferencing_integrations', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	organizationId: text('organization_id').notNull(),

	// Integration details
	provider: text('provider').notNull(), // zoom, google_meet, teams, etc.
	name: text('name').notNull(),
	description: text('description'),

	// OAuth credentials (encrypted)
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	tokenExpiresAt: timestamp('token_expires_at'),

	// Provider-specific settings
	providerAccountId: text('provider_account_id'),
	providerUserId: text('provider_user_id'),
	providerSettings: jsonb('provider_settings'),

	// Integration configuration
	isActive: boolean('is_active').default(true),
	isDefault: boolean('is_default').default(false),
	autoCreateMeetings: boolean('auto_create_meetings').default(false),

	// Meeting defaults
	defaultDuration: serial('default_duration').default(60), // minutes
	defaultSettings: jsonb('default_settings'),
	notificationSettings: jsonb('notification_settings'),

	// Webhook configuration
	webhookUrl: text('webhook_url'),
	webhookSecret: text('webhook_secret'),
	webhookEvents: jsonb('webhook_events').$defaultFn(() => []),

	// Status and monitoring
	lastSyncAt: timestamp('last_sync_at'),
	lastError: text('last_error'),
	syncStatus: text('sync_status').default('idle'), // idle, syncing, error

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoConferencingMeetings = pgTable('video_conferencing_meetings', {
	id: serial('id').primaryKey(),
	meetingId: text('meeting_id').unique().notNull(), // External provider meeting ID
	userId: text('user_id').notNull(),
	organizationId: text('organization_id').notNull(),

	// Meeting details
	title: text('title').notNull(),
	description: text('description'),
	agenda: text('agenda'),

	// Provider information
	provider: text('provider').notNull(), // zoom, google_meet, teams
	providerMeetingId: text('provider_meeting_id'),
	providerData: jsonb('provider_data'), // Full provider response

	// Scheduling
	scheduledFor: timestamp('scheduled_for').notNull(),
	duration: serial('duration').default(60), // minutes
	timezone: text('timezone').default('UTC'),

	// Participants
	createdBy: text('created_by').notNull(),
	participants: jsonb('participants').$defaultFn(() => []), // Array of user/attendee objects
	invitedParticipants: jsonb('invited_participants').$defaultFn(() => []),

	// Meeting access
	joinUrl: text('join_url'),
	meetingPassword: text('meeting_password'),
	dialInNumbers: jsonb('dial_in_numbers'),

	// Recording and notes
	recordingUrls: jsonb('recording_urls').$defaultFn(() => []),
	notes: text('notes'),
	summary: text('summary'),
	actionItems: jsonb('action_items').$defaultFn(() => []),

	// Meeting status
	status: text('status').default('scheduled'), // scheduled, active, ended, cancelled
	startedAt: timestamp('started_at'),
	endedAt: timestamp('ended_at'),

	// Integration settings
	integrationId: serial('integration_id'),
	autoRecording: boolean('auto_recording').default(false),
	waitingRoom: boolean('waiting_room').default(true),
	muteOnEntry: boolean('mute_on_entry').default(true),

	// Financbase integration
	financbaseChannelId: text('financbase_channel_id'), // Link to collaboration channel
	relatedInvoices: jsonb('related_invoices').$defaultFn(() => []),
	relatedExpenses: jsonb('related_expenses').$defaultFn(() => []),
	relatedProjects: jsonb('related_projects').$defaultFn(() => []),

	// Statistics
	attendeeCount: serial('attendee_count').default(0),
	actualDuration: serial('actual_duration'), // minutes

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoConferencingRecordings = pgTable('video_conferencing_recordings', {
	id: serial('id').primaryKey(),
	recordingId: text('recording_id').unique().notNull(), // Provider recording ID
	meetingId: serial('meeting_id').notNull(),

	// Recording details
	provider: text('provider').notNull(),
	title: text('title').notNull(),
	description: text('description'),

	// File information
	fileUrl: text('file_url'),
	fileSize: serial('file_size'), // bytes
	duration: serial('duration'), // seconds
	quality: text('quality'), // HD, SD, etc.

	// Access control
	isPublic: boolean('is_public').default(false),
	shareToken: text('share_token'),
	downloadUrl: text('download_url'),

	// Processing
	processingStatus: text('processing_status').default('pending'), // pending, processing, completed, failed
	thumbnailUrl: text('thumbnail_url'),
	previewUrl: text('preview_url'),

	// Transcription
	hasTranscription: boolean('has_transcription').default(false),
	transcriptionUrl: text('transcription_url'),
	transcriptionText: text('transcription_text'),

	// Storage
	storageProvider: text('storage_provider').default('provider'), // provider, local, s3
	localPath: text('local_path'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoConferencingSettings = pgTable('video_conferencing_settings', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	organizationId: text('organization_id').notNull(),

	// Default provider
	defaultProvider: text('default_provider').default('zoom'), // zoom, google_meet, teams

	// Global settings
	autoCreateMeetings: boolean('auto_create_meetings').default(false),
	defaultDuration: serial('default_duration').default(60),
	defaultTimezone: text('default_timezone').default('UTC'),

	// Meeting defaults
	defaultSettings: jsonb('default_settings').$defaultFn(() => ({
		waitingRoom: true,
		muteOnEntry: true,
		autoRecording: false,
		allowScreenShare: true,
	})),

	// Notification preferences
	emailReminders: boolean('email_reminders').default(true),
	reminderMinutes: jsonb('reminder_minutes').$defaultFn(() => [15, 5]), // minutes before meeting

	// Calendar integration
	syncWithCalendar: boolean('sync_with_calendar').default(true),
	calendarId: text('calendar_id'),

	// Security settings
	requirePassword: boolean('require_password').default(false),
	allowExternalParticipants: boolean('allow_external_participants').default(true),
	watermarkRecordings: boolean('watermark_recordings').default(false),

	// Advanced features
	aiTranscription: boolean('ai_transcription').default(false),
	autoSummary: boolean('auto_summary').default(true),
	meetingAnalytics: boolean('meeting_analytics').default(true),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoConferencingWebhooks = pgTable('video_conferencing_webhooks', {
	id: serial('id').primaryKey(),
	integrationId: serial('integration_id').notNull(),

	// Webhook details
	provider: text('provider').notNull(),
	eventType: text('event_type').notNull(),
	payload: jsonb('payload').notNull(),

	// Processing status
	status: text('status').default('received'), // received, processed, failed
	processedAt: timestamp('processed_at'),
	errorMessage: text('error_message'),

	// Signature verification
	signature: text('signature'),
	verified: boolean('verified').default(false),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

// Type exports
export type VideoConferencingIntegration = typeof videoConferencingIntegrations.$inferSelect;
export type NewVideoConferencingIntegration = typeof videoConferencingIntegrations.$inferInsert;

export type VideoConferencingMeeting = typeof videoConferencingMeetings.$inferSelect;
export type NewVideoConferencingMeeting = typeof videoConferencingMeetings.$inferInsert;

export type VideoConferencingRecording = typeof videoConferencingRecordings.$inferSelect;
export type NewVideoConferencingRecording = typeof videoConferencingRecordings.$inferInsert;

export type VideoConferencingSettings = typeof videoConferencingSettings.$inferSelect;
export type NewVideoConferencingSettings = typeof videoConferencingSettings.$inferInsert;

export type VideoConferencingWebhook = typeof videoConferencingWebhooks.$inferSelect;
export type NewVideoConferencingWebhook = typeof videoConferencingWebhooks.$inferInsert;
