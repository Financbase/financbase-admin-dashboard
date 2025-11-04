/**
 * Google Meet Integration Service
 * Handles Google Workspace API integration for meetings and calendar
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { logger } from '@/lib/logger';

interface GoogleMeetEvent {
	id: string;
	summary: string;
	description?: string;
	start: {
		dateTime: string;
		timeZone: string;
	};
	end: {
		dateTime: string;
		timeZone: string;
	};
	attendees?: Array<{
		email: string;
		displayName?: string;
		responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
	}>;
	conferenceData?: {
		entryPoints: Array<{
			entryPointType: 'video' | 'phone' | 'more';
			uri: string;
			label?: string;
		}>;
		conferenceSolution: {
			key: {
				type: 'hangoutsMeet';
			};
			name: string;
			iconUri: string;
		};
	};
	location?: string;
	organizer: {
		email: string;
		displayName?: string;
	};
	created: string;
	updated: string;
	status?: 'confirmed' | 'tentative' | 'cancelled';
}

interface GoogleCalendar {
	id: string;
	summary: string;
	description?: string;
	timeZone: string;
	accessRole: string;
	backgroundColor?: string;
	foregroundColor?: string;
	hidden: boolean;
	selected: boolean;
	primary?: boolean;
}

interface GoogleOAuthTokenResponse {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	scope: string;
	token_type: string;
}

interface GoogleUserInfo {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
}

interface GoogleCalendarListResponse {
	kind: string;
	etag: string;
	nextSyncToken?: string;
	items: GoogleCalendar[];
}

interface GoogleEventsListResponse {
	kind: string;
	etag: string;
	nextSyncToken?: string;
	items: GoogleMeetEvent[];
	nextPageToken?: string;
}

interface GoogleFreeBusyRequest {
	timeMin: string;
	timeMax: string;
	timeZone: string;
	items: Array<{ id: string }>;
	conferenceDataVersion?: number;
}

interface GoogleFreeBusyResponse {
	kind: string;
	timeMin: string;
	timeMax: string;
	calendars: Record<string, {
		busy: Array<{
			start: string;
			end: string;
		}>;
	}>;
}

export class GoogleMeetService {
	private static accessToken: string | null = null;
	private static refreshToken: string | null = null;

	/**
	 * Set Google access tokens
	 */
	static setTokens(accessToken: string, refreshToken?: string) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken || null;
	}

	/**
	 * Get Google access token
	 */
	static getAccessToken(): string | null {
		return this.accessToken;
	}

	/**
	 * Authenticate with Google OAuth
	 */
	static async authenticate(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<GoogleOAuthTokenResponse> {
		try {
			const response = await fetch('https://oauth2.googleapis.com/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: redirectUri,
				}),
			});

			if (!response.ok) {
				throw new Error(`Google OAuth failed: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			this.setTokens(data.access_token, data.refresh_token);

			return data;
		} catch (error) {
			logger.error('Google authentication error', error);
			throw error;
		}
	}

	/**
	 * Refresh access token
	 */
	static async refreshAccessToken(clientId: string, clientSecret: string): Promise<GoogleOAuthTokenResponse> {
		if (!this.refreshToken) {
			throw new Error('No refresh token available');
		}

		try {
			const response = await fetch('https://oauth2.googleapis.com/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					refresh_token: this.refreshToken,
					grant_type: 'refresh_token',
				}),
			});

			if (!response.ok) {
				throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			this.setTokens(data.access_token, this.refreshToken);

			return data;
		} catch (error) {
			logger.error('Google token refresh error', error);
			throw error;
		}
	}

	/**
	 * Get current user information
	 */
	static async getCurrentUser(): Promise<GoogleUserInfo> {
		return this.makeRequest('https://www.googleapis.com/oauth2/v2/userinfo');
	}

	/**
	 * List user's calendars
	 */
	static async listCalendars(): Promise<GoogleCalendar[]> {
		return this.makeRequest('https://www.googleapis.com/calendar/v3/users/me/calendarList');
	}

	/**
	 * Get primary calendar
	 */
	static async getPrimaryCalendar(): Promise<GoogleCalendar> {
		const calendars = await this.listCalendars();
		const primary = calendars.find(cal => cal.id === 'primary');
		if (!primary) {
			throw new Error('Primary calendar not found');
		}
		return primary;
	}

	/**
	 * List calendar events
	 */
	static async listEvents(
		calendarId: string = 'primary',
		startTime?: string,
		endTime?: string,
		maxResults: number = 250
	): Promise<GoogleEventsListResponse> {
		const params = new URLSearchParams({
			maxResults: maxResults.toString(),
			singleEvents: 'true',
			orderBy: 'startTime',
		});

		if (startTime) params.append('timeMin', startTime);
		if (endTime) params.append('timeMax', endTime);

		return this.makeRequest(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`);
	}

	/**
	 * Create a new meeting event
	 */
	static async createMeeting(eventData: {
		summary: string;
		description?: string;
		startTime: string;
		endTime: string;
		timezone?: string;
		attendees?: Array<{ email: string; displayName?: string }>;
		location?: string;
		reminders?: {
			useDefault: boolean;
			overrides?: Array<{ method: string; minutes: number }>;
		};
	}): Promise<GoogleMeetEvent> {
		const requestBody = {
			summary: eventData.summary,
			description: eventData.description,
			start: {
				dateTime: eventData.startTime,
				timeZone: eventData.timezone || 'UTC',
			},
			end: {
				dateTime: eventData.endTime,
				timeZone: eventData.timezone || 'UTC',
			},
			attendees: eventData.attendees?.map(attendee => ({
				email: attendee.email,
				displayName: attendee.displayName,
			})),
			location: eventData.location,
			conferenceData: {
				createRequest: {
					conferenceSolutionKey: {
						type: 'hangoutsMeet',
					},
					requestId: `financbase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				},
			},
			reminders: eventData.reminders || {
				useDefault: false,
				overrides: [
					{ method: 'email', minutes: 24 * 60 }, // 24 hours
					{ method: 'popup', minutes: 10 }, // 10 minutes
				],
			},
		};

		return this.makeRequest('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
			method: 'POST',
			body: JSON.stringify(requestBody),
		});
	}

	/**
	 * Get event details
	 */
	static async getEvent(calendarId: string = 'primary', eventId: string): Promise<GoogleMeetEvent> {
		return this.makeRequest(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`);
	}

	/**
	 * Update event
	 */
	static async updateEvent(
		calendarId: string = 'primary',
		eventId: string,
		updates: Partial<GoogleMeetEvent>
	): Promise<GoogleMeetEvent> {
		return this.makeRequest(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
			method: 'PUT',
			body: JSON.stringify(updates),
		});
	}

	/**
	 * Delete event
	 */
	static async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<void> {
		await this.makeRequest(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
			method: 'DELETE',
		});
	}

	/**
	 * Quick create meeting (with Google Meet link)
	 */
	static async quickCreateMeeting(
		summary: string,
		startTime: string,
		durationMinutes: number = 60,
		attendees?: string[]
	): Promise<GoogleMeetEvent> {
		const startDateTime = new Date(startTime);
		const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

		return this.createMeeting({
			summary,
			startTime: startDateTime.toISOString(),
			endTime: endDateTime.toISOString(),
			attendees: attendees?.map(email => ({ email })),
		});
	}

	/**
	 * Check meeting room availability
	 */
	static async checkAvailability(
		startTime: string,
		endTime: string,
		attendees?: string[]
	): Promise<GoogleFreeBusyResponse> {
		const requestBody = {
			timeMin: startTime,
			timeMax: endTime,
			timeZone: 'UTC',
			items: [{ id: 'primary' }],
			conferenceDataVersion: 0,
		};

		if (attendees && attendees.length > 0) {
			requestBody.items.push(...attendees.map(email => ({ id: email })));
		}

		return this.makeRequest('https://www.googleapis.com/calendar/v3/freeBusy', {
			method: 'POST',
			body: JSON.stringify(requestBody),
		});
	}

	/**
	 * Get meeting recordings (if Google Workspace Business/Enterprise)
	 */
	static async getMeetingRecordings(calendarId: string = 'primary', eventId: string): Promise<{ recordings: Array<{ id: string; title: string; url: string; duration: number }> }> {
		// This requires Google Workspace Business or Enterprise
		return this.makeRequest(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}/recordings`);
	}

	/**
	 * Send meeting invites
	 */
	static async sendInvites(calendarId: string = 'primary', eventId: string): Promise<void> {
		await this.makeRequest(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}/sendUpdates`, {
			method: 'POST',
			body: JSON.stringify({
				sendUpdates: 'all',
			}),
		});
	}

	/**
	 * Cancel meeting
	 */
	static async cancelMeeting(
		calendarId: string = 'primary',
		eventId: string,
		reason?: string
	): Promise<GoogleMeetEvent> {
		return this.updateEvent(calendarId, eventId, {
			status: 'cancelled',
			description: reason ? `Cancelled: ${reason}` : 'Meeting cancelled',
		});
	}

	/**
	 * Check if user has Google integration
	 */
	static hasIntegration(): boolean {
		return this.accessToken !== null;
	}

	/**
	 * Revoke Google access
	 */
	static revokeAccess(): void {
		this.accessToken = null;
		this.refreshToken = null;
	}

	private static async makeRequest<T = Record<string, unknown>>(url: string, options: RequestInit = {}): Promise<T> {
		if (!this.accessToken) {
			throw new Error('Google access token not set. Please authenticate first.');
		}

		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorText}`);
		}

		return response.json();
	}

	/**
	 * Handle Google Calendar webhook events
	 */
	static async handleWebhookEvent(event: string, payload: GoogleWebhookPayload): Promise<void> {
		switch (event) {
			case 'calendar.events.created':
				await this.handleEventCreated(payload);
				break;
			case 'calendar.events.updated':
				await this.handleEventUpdated(payload);
				break;
			case 'calendar.events.deleted':
				await this.handleEventDeleted(payload);
				break;
			default:
				logger.info('Unhandled Google Calendar webhook event', { event });
		}
	}

	private static async handleEventCreated(payload: GoogleWebhookPayload): Promise<void> {
		logger.info('Google Calendar event created', payload);
		// Create meeting in Financbase
		// Send notifications
	}

	private static async handleEventUpdated(payload: GoogleWebhookPayload): Promise<void> {
		logger.info('Google Calendar event updated', payload);
		// Update meeting in Financbase
		// Resend notifications if needed
	}

	private static async handleEventDeleted(payload: GoogleWebhookPayload): Promise<void> {
		logger.info('Google Calendar event deleted', payload);
		// Remove meeting from Financbase
		// Send cancellation notifications
	}
}
