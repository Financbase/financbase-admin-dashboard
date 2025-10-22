/**
 * Zoom Integration Service
 * Handles Zoom API integration for meeting scheduling and management
 */

interface ZoomMeeting {
	id: string;
	uuid: string;
	topic: string;
	start_time: string;
	duration: number;
	timezone: string;
	agenda?: string;
	host_id: string;
	participants: Array<{
		name: string;
		email: string;
	}>;
	settings: {
		host_video: boolean;
		participant_video: boolean;
		join_before_host: boolean;
		mute_upon_entry: boolean;
		watermark: boolean;
		use_pmi: boolean;
		approval_type: number;
		audio: string;
		auto_recording: string;
	};
	join_url: string;
	password: string;
}

interface ZoomUser {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	type: number;
	pmi: number;
	timezone: string;
	verified: number;
	created_at: string;
	last_login_time: string;
	language: string;
	status: string;
}

export class ZoomService {
	private static baseUrl = 'https://api.zoom.us/v2';
	private static accessToken: string | null = null;

	/**
	 * Set Zoom access token
	 */
	static setAccessToken(token: string) {
		this.accessToken = token;
	}

	/**
	 * Get Zoom access token
	 */
	static getAccessToken(): string | null {
		return this.accessToken;
	}

	/**
	 * Authenticate with Zoom OAuth
	 */
	static async authenticate(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<any> {
		try {
			const response = await fetch('https://zoom.us/oauth/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					code,
					redirect_uri: redirectUri,
				}),
			});

			if (!response.ok) {
				throw new Error(`Zoom OAuth failed: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			this.setAccessToken(data.access_token);

			return data;
		} catch (error) {
			console.error('Zoom authentication error:', error);
			throw error;
		}
	}

	/**
	 * Get current user information
	 */
	static async getCurrentUser(): Promise<ZoomUser> {
		return this.makeRequest('/users/me');
	}

	/**
	 * List user's meetings
	 */
	static async listMeetings(userId: string = 'me', startTime?: string, endTime?: string): Promise<any> {
		const params = new URLSearchParams();
		if (startTime) params.append('from', startTime);
		if (endTime) params.append('to', endTime);

		const query = params.toString() ? `?${params.toString()}` : '';
		return this.makeRequest(`/users/${userId}/meetings${query}`);
	}

	/**
	 * Create a new meeting
	 */
	static async createMeeting(meetingData: {
		topic: string;
		start_time: string;
		duration: number;
		timezone?: string;
		agenda?: string;
		settings?: Partial<ZoomMeeting['settings']>;
	}): Promise<ZoomMeeting> {
		return this.makeRequest('/users/me/meetings', {
			method: 'POST',
			body: JSON.stringify({
				topic: meetingData.topic,
				type: 2, // Scheduled meeting
				start_time: meetingData.start_time,
				duration: meetingData.duration,
				timezone: meetingData.timezone || 'UTC',
				agenda: meetingData.agenda,
				settings: {
					host_video: true,
					participant_video: true,
					join_before_host: false,
					mute_upon_entry: true,
					watermark: false,
					use_pmi: false,
					approval_type: 2,
					audio: 'both',
					auto_recording: 'none',
					...meetingData.settings,
				},
			}),
		});
	}

	/**
	 * Get meeting details
	 */
	static async getMeeting(meetingId: string): Promise<ZoomMeeting> {
		return this.makeRequest(`/meetings/${meetingId}`);
	}

	/**
	 * Update meeting
	 */
	static async updateMeeting(meetingId: string, updates: Partial<ZoomMeeting>): Promise<ZoomMeeting> {
		return this.makeRequest(`/meetings/${meetingId}`, {
			method: 'PATCH',
			body: JSON.stringify(updates),
		});
	}

	/**
	 * Delete meeting
	 */
	static async deleteMeeting(meetingId: string): Promise<void> {
		await this.makeRequest(`/meetings/${meetingId}`, {
			method: 'DELETE',
		});
	}

	/**
	 * Get meeting participants
	 */
	static async getMeetingParticipants(meetingId: string): Promise<any> {
		return this.makeRequest(`/report/meetings/${meetingId}/participants`);
	}

	/**
	 * Get meeting recordings
	 */
	static async getMeetingRecordings(meetingId: string): Promise<any> {
		return this.makeRequest(`/meetings/${meetingId}/recordings`);
	}

	/**
	 * Add meeting registrant
	 */
	static async addRegistrant(meetingId: string, registrant: {
		email: string;
		first_name: string;
		last_name: string;
	}): Promise<any> {
		return this.makeRequest(`/meetings/${meetingId}/registrants`, {
			method: 'POST',
			body: JSON.stringify({
				email: registrant.email,
				first_name: registrant.first_name,
				last_name: registrant.last_name,
			}),
		});
	}

	/**
	 * Update meeting status
	 */
	static async updateMeetingStatus(meetingId: string, action: 'end' | 'recover'): Promise<any> {
		return this.makeRequest(`/meetings/${meetingId}/status`, {
			method: 'PUT',
			body: JSON.stringify({ action }),
		});
	}

	/**
	 * Get user's webinars
	 */
	static async listWebinars(userId: string = 'me'): Promise<any> {
		return this.makeRequest(`/users/${userId}/webinars`);
	}

	/**
	 * Create webinar
	 */
	static async createWebinar(webinarData: {
		topic: string;
		start_time: string;
		duration: number;
		timezone?: string;
		agenda?: string;
	}): Promise<any> {
		return this.makeRequest('/users/me/webinars', {
			method: 'POST',
			body: JSON.stringify({
				topic: webinarData.topic,
				type: 5, // Webinar
				start_time: webinarData.start_time,
				duration: webinarData.duration,
				timezone: webinarData.timezone || 'UTC',
				agenda: webinarData.agenda,
			}),
		});
	}

	/**
	 * Generate meeting signature for SDK
	 */
	static generateMeetingSignature(meetingNumber: string, role: number = 0): string {
		// This would use your Zoom SDK secret
		// Implementation depends on your Zoom SDK setup
		return '';
	}

	/**
	 * Check if user has Zoom integration
	 */
	static hasIntegration(): boolean {
		return this.accessToken !== null;
	}

	/**
	 * Revoke Zoom access
	 */
	static revokeAccess(): void {
		this.accessToken = null;
	}

	/**
	 * Make authenticated request to Zoom API
	 */
	private static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
		if (!this.accessToken) {
			throw new Error('Zoom access token not set. Please authenticate first.');
		}

		const url = `${this.baseUrl}${endpoint}`;

		const response = await fetch(url, {
			...options,
			headers: {
				'Authorization': `Bearer ${this.accessToken}`,
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Zoom API error: ${response.status} ${response.statusText} - ${errorText}`);
		}

		return response.json();
	}

	/**
	 * Handle Zoom webhook events
	 */
	static async handleWebhookEvent(event: string, payload: any): Promise<void> {
		switch (event) {
			case 'meeting.started':
				await this.handleMeetingStarted(payload);
				break;
			case 'meeting.ended':
				await this.handleMeetingEnded(payload);
				break;
			case 'participant.joined':
				await this.handleParticipantJoined(payload);
				break;
			case 'participant.left':
				await this.handleParticipantLeft(payload);
				break;
			case 'recording.completed':
				await this.handleRecordingCompleted(payload);
				break;
			default:
				console.log('Unhandled Zoom webhook event:', event);
		}
	}

	private static async handleMeetingStarted(payload: any): Promise<void> {
		console.log('Zoom meeting started:', payload);
		// Update meeting status in database
		// Send notifications to participants
	}

	private static async handleMeetingEnded(payload: any): Promise<void> {
		console.log('Zoom meeting ended:', payload);
		// Update meeting status in database
		// Process recordings if available
		// Send follow-up notifications
	}

	private static async handleParticipantJoined(payload: any): Promise<void> {
		console.log('Participant joined Zoom meeting:', payload);
		// Update participant count
		// Send welcome message if needed
	}

	private static async handleParticipantLeft(payload: any): Promise<void> {
		console.log('Participant left Zoom meeting:', payload);
		// Update participant count
		// Log attendance
	}

	private static async handleRecordingCompleted(payload: any): Promise<void> {
		console.log('Zoom recording completed:', payload);
		// Save recording links
		// Send notifications with recording access
	}
}
