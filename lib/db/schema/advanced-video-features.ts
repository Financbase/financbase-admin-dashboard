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

export const videoScreenShares = pgTable('video_screen_shares', {
	id: serial('id').primaryKey(),
	sessionId: text('session_id').unique().notNull(), // Provider session ID
	meetingId: serial('meeting_id').notNull(),

	// Session details
	userId: text('user_id').notNull(),
	userName: text('user_name').notNull(),
	userAvatar: text('user_avatar'),

	// Screen share settings
	screenType: text('screen_type').default('screen'), // screen, window, browser
	title: text('title'),
	description: text('description'),

	// Session status
	isActive: boolean('is_active').default(true),
	startedAt: timestamp('started_at').defaultNow(),
	endedAt: timestamp('ended_at'),

	// Quality metrics
	quality: text('quality').default('hd'), // hd, fhd, uhd
	frameRate: serial('frame_rate').default(30),
	resolution: text('resolution'), // 1920x1080, etc.

	// Provider data
	providerData: jsonb('provider_data'),

	// Audit
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoBreakoutRooms = pgTable('video_breakout_rooms', {
	id: serial('id').primaryKey(),
	roomId: text('room_id').unique().notNull(), // Provider room ID
	meetingId: serial('meeting_id').notNull(),

	// Room details
	name: text('name').notNull(),
	description: text('description'),

	// Participants
	participants: jsonb('participants').$defaultFn(() => []), // Array of participant objects
	maxParticipants: serial('max_participants'),
	hostId: text('host_id'), // User ID of breakout room host

	// Room settings
	duration: serial('duration'), // minutes
	autoClose: boolean('auto_close').default(true),
	allowReassignment: boolean('allow_reassignment').default(true),

	// Room status
	isActive: boolean('is_active').default(false),
	startedAt: timestamp('started_at'),
	endedAt: timestamp('ended_at'),

	// Provider integration
	providerRoomId: text('provider_room_id'),
	joinUrl: text('join_url'),
	roomSettings: jsonb('room_settings'),

	// Communication
	chatEnabled: boolean('chat_enabled').default(true),
	fileSharing: boolean('file_sharing').default(true),

	// Audit
	createdBy: text('created_by').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoPolls = pgTable('video_polls', {
	id: serial('id').primaryKey(),
	pollId: text('poll_id').unique().notNull(), // Provider poll ID
	meetingId: serial('meeting_id').notNull(),

	// Poll details
	question: text('question').notNull(),
	options: jsonb('options').notNull(), // Array of option objects with votes

	// Poll settings
	isAnonymous: boolean('is_anonymous').default(false),
	allowMultiple: boolean('allow_multiple').default(false),
	showResults: boolean('show_results').default(true),

	// Poll status
	isActive: boolean('is_active').default(true),
	startedAt: timestamp('started_at').defaultNow(),
	endedAt: timestamp('ended_at'),

	// Results
	results: jsonb('results').$defaultFn(() => []), // Array of user votes
	totalVotes: serial('total_votes').default(0),

	// Provider integration
	providerPollId: text('provider_poll_id'),
	pollData: jsonb('poll_data'),

	// Audit
	createdBy: text('created_by').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoWhiteboards = pgTable('video_whiteboards', {
	id: serial('id').primaryKey(),
	whiteboardId: text('whiteboard_id').unique().notNull(), // Provider whiteboard ID
	meetingId: serial('meeting_id').notNull(),

	// Whiteboard details
	name: text('name').notNull(),
	description: text('description'),

	// Content and collaboration
	content: jsonb('content'), // Whiteboard data (strokes, shapes, text)
	participants: jsonb('participants').$defaultFn(() => []), // Array of user IDs

	// Whiteboard settings
	isPublic: boolean('is_public').default(false),
	allowEditing: boolean('allow_editing').default(true),
	snapToGrid: boolean('snap_to_grid').default(false),

	// Status
	isActive: boolean('is_active').default(true),
	lastUpdated: timestamp('last_updated').defaultNow(),

	// Provider integration
	providerWhiteboardId: text('provider_whiteboard_id'),
	whiteboardUrl: text('whiteboard_url'),
	providerData: jsonb('provider_data'),

	// Audit
	createdBy: text('created_by').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoMeetingAnalytics = pgTable('video_meeting_analytics', {
	id: serial('id').primaryKey(),
	meetingId: serial('meeting_id').notNull(),

	// Meeting overview
	totalDuration: serial('total_duration').default(0), // minutes
	participantCount: serial('participant_count').default(0),
	avgEngagementScore: serial('avg_engagement_score').default(0), // 1-100

	// Interaction metrics
	chatMessageCount: serial('chat_message_count').default(0),
	screenShareDuration: serial('screen_share_duration').default(0), // minutes
	pollCount: serial('poll_count').default(0),
	pollResponseRate: serial('poll_response_rate').default(0), // percentage

	// Technical metrics
	avgConnectionQuality: serial('avg_connection_quality').default(0), // 1-5 scale
	technicalIssues: jsonb('technical_issues').$defaultFn(() => []), // Array of issues
	networkLatency: serial('network_latency').default(0), // ms

	// Quality indicators
	overallQuality: text('overall_quality').default('good'), // excellent, good, fair, poor
	recommendations: jsonb('recommendations').$defaultFn(() => []),

	// Breakout rooms
	breakoutRoomCount: serial('breakout_room_count').default(0),
	breakoutRoomUsage: serial('breakout_room_usage').default(0), // minutes

	// Recording and content
	recordingDuration: serial('recording_duration').default(0), // minutes
	whiteboardUsage: boolean('whiteboard_usage').default(false),

	// Participant engagement
	handRaises: serial('hand_raises').default(0),
	questionsAsked: serial('questions_asked').default(0),
	feedbackScore: serial('feedback_score').default(0), // 1-5 scale

	// Audit
	recordedAt: timestamp('recorded_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export const videoMeetingQuality = pgTable('video_meeting_quality', {
	id: serial('id').primaryKey(),
	meetingId: serial('meeting_id').notNull(),
	userId: text('user_id').notNull(),

	// Quality metrics
	audioQuality: serial('audio_quality').default(5), // 1-5 scale
	videoQuality: serial('video_quality').default(5), // 1-5 scale
	connectionStability: serial('connection_stability').default(5), // 1-5 scale
	overallExperience: serial('overall_experience').default(5), // 1-5 scale

	// Technical details
	networkLatency: serial('network_latency').default(0), // ms
	packetLoss: serial('packet_loss').default(0), // percentage
	jitter: serial('jitter').default(0), // ms

	// User feedback
	issues: jsonb('issues').$defaultFn(() => []), // Array of reported issues
	comments: text('comments'),

	// Session info
	sessionStart: timestamp('session_start').defaultNow(),
	sessionEnd: timestamp('session_end'),

	// Device info
	deviceType: text('device_type'), // desktop, mobile, tablet
	browser: text('browser'),
	os: text('os'),

	// Audit
	recordedAt: timestamp('recorded_at').defaultNow(),
});

// Type exports
export type VideoScreenShare = typeof videoScreenShares.$inferSelect;
export type NewVideoScreenShare = typeof videoScreenShares.$inferInsert;

export type VideoBreakoutRoom = typeof videoBreakoutRooms.$inferSelect;
export type NewVideoBreakoutRoom = typeof videoBreakoutRooms.$inferInsert;

export type VideoPoll = typeof videoPolls.$inferSelect;
export type NewVideoPoll = typeof videoPolls.$inferInsert;

export type VideoWhiteboard = typeof videoWhiteboards.$inferSelect;
export type NewVideoWhiteboard = typeof videoWhiteboards.$inferInsert;

export type VideoMeetingAnalytics = typeof videoMeetingAnalytics.$inferSelect;
export type NewVideoMeetingAnalytics = typeof videoMeetingAnalytics.$inferInsert;

export type VideoMeetingQuality = typeof videoMeetingQuality.$inferSelect;
export type NewVideoMeetingQuality = typeof videoMeetingQuality.$inferInsert;
