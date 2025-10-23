import Server from "partykit/server";
import type { Connection, Context, Party } from "partykit/server";

interface Message {
  id: string;
  type: 'message' | 'system' | 'file' | 'image';
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  channelId: string;
  replyTo?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  reactions?: Record<string, string[]>;
  edited?: boolean;
  editedAt?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm';
  members: string[];
  createdBy: string;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledFor: string;
  createdBy: string;
  participants: string[];
  status: 'scheduled' | 'active' | 'paused' | 'ended';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export default class FinancbaseServer implements Server {
  private rooms: Map<string, any> = new Map();

  constructor(readonly party: Party) {}

  async onConnect(conn: Connection, ctx: Context) {
    console.log(`New connection to room: ${this.party.id}`);

    // Handle collaboration rooms
    if (this.party.id.startsWith('financbase-')) {
      await this.handleCollaborationConnect(conn, ctx);
      return;
    }

    // Handle notification rooms
    if (this.party.id.startsWith('notifications-')) {
      conn.send(JSON.stringify({
        type: 'connected',
        room: this.party.id,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Default welcome message
    conn.send(JSON.stringify({
      type: 'welcome',
      message: `Connected to ${this.party.id}`,
      timestamp: new Date().toISOString(),
    }));
  }

  private async handleCollaborationConnect(conn: Connection, ctx: Context) {
    // Get current room state
    const roomState = this.getRoomState();

    // Send current room state to new connection
    conn.send(JSON.stringify({
      type: 'room_state',
      users: roomState.users,
      channels: roomState.channels,
      meetings: roomState.meetings,
      timestamp: new Date().toISOString(),
    }));

    // Notify other users that someone joined
    this.party.broadcast(JSON.stringify({
      type: 'user_joined',
      userId: conn.id,
      timestamp: new Date().toISOString(),
    }), [conn.id]);
  }

  async onMessage(message: string, sender: Connection) {
    try {
      const data = JSON.parse(message);

      // Handle collaboration messages
      if (this.party.id.startsWith('financbase-')) {
        await this.handleCollaborationMessage(data, sender);
        return;
      }

      // Handle notification messages
      if (this.party.id.startsWith('notifications-')) {
        await this.handleNotificationMessage(data, sender);
        return;
      }

      // Handle general messages
      await this.handleGeneralMessage(data, sender);
    } catch (error) {
      console.error('Error handling message:', error);
      sender.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString(),
      }));
    }
  }

  private async handleCollaborationMessage(data: Record<string, unknown>, sender: Connection) {
    switch (data.type) {
      case 'join_channel':
        await this.handleJoinChannel(data, sender);
        break;

      case 'leave_channel':
        await this.handleLeaveChannel(data, sender);
        break;

      case 'send_message':
        await this.handleSendMessage(data, sender);
        break;

      case 'typing_start':
        await this.handleTypingStart(data, sender);
        break;

      case 'typing_stop':
        await this.handleTypingStop(data, sender);
        break;

      case 'create_meeting':
        await this.handleCreateMeeting(data, sender);
        break;

      case 'join_meeting':
        await this.handleJoinMeeting(data, sender);
        break;

      case 'meeting_action':
        await this.handleMeetingAction(data, sender);
        break;

      case 'user_activity':
        await this.handleUserActivity(data, sender);
        break;

      default:
        console.log('Unknown collaboration message type:', data.type);
    }
  }

  private async handleJoinChannel(data: Record<string, unknown>, sender: Connection) {
    const { channelId } = data as { channelId: string };

    // Send channel history to the user
    const channelHistory = this.getChannelHistory(channelId);
    sender.send(JSON.stringify({
      type: 'channel_history',
      channelId,
      messages: channelHistory,
      timestamp: new Date().toISOString(),
    }));

    // Notify others that user joined channel
    this.party.broadcast(JSON.stringify({
      type: 'channel_joined',
      channelId,
      userId: sender.id,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleLeaveChannel(data: Record<string, unknown>, sender: Connection) {
    const { channelId } = data as { channelId: string };

    // Notify others that user left channel
    this.party.broadcast(JSON.stringify({
      type: 'channel_left',
      channelId,
      userId: sender.id,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleSendMessage(data: Record<string, unknown>, sender: Connection) {
    const message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'message' as const,
      content: data.content as string,
      userId: sender.id,
      userName: data.userName as string || 'Anonymous',
      userAvatar: data.userAvatar as string,
      timestamp: new Date().toISOString(),
      channelId: data.channelId as string,
    };

    // Store message in room state
    this.addMessageToChannel(data.channelId as string, message);

    // Broadcast message to all connections in the room
    this.party.broadcast(JSON.stringify({
      ...message,
    }));

    // Update channel's last message
    this.updateChannelLastMessage(data.channelId as string, message);
  }

  private async handleTypingStart(data: Record<string, unknown>, sender: Connection) {
    this.party.broadcast(JSON.stringify({
      type: 'typing_start',
      userId: sender.id,
      userName: data.userName || 'Anonymous',
      channelId: data.channelId,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleTypingStop(data: Record<string, unknown>, sender: Connection) {
    this.party.broadcast(JSON.stringify({
      type: 'typing_stop',
      userId: sender.id,
      channelId: data.channelId,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleCreateMeeting(data: Record<string, unknown>, sender: Connection) {
    const meeting = {
      id: `meeting_${Date.now()}_${Math.random()}`,
      title: data.title as string,
      description: data.description as string,
      scheduledFor: data.scheduledFor as string,
      createdBy: sender.id,
      participants: data.participants as string[] || [],
      status: 'scheduled' as const,
      createdAt: new Date().toISOString(),
    };

    // Store meeting in room state
    this.addMeetingToRoom(meeting);

    // Broadcast meeting creation
    this.party.broadcast(JSON.stringify({
      type: 'meeting_created',
      meeting,
      timestamp: new Date().toISOString(),
    }));
  }

  private async handleJoinMeeting(data: Record<string, unknown>, sender: Connection) {
    const { meetingId } = data as { meetingId: string };

    // Update meeting participants
    const updatedMeeting = this.updateMeetingParticipants(meetingId, sender.id, 'join');

    if (updatedMeeting) {
      this.party.broadcast(JSON.stringify({
        type: 'meeting_updated',
        meeting: updatedMeeting,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  private async handleMeetingAction(data: Record<string, unknown>, sender: Connection) {
    const { meetingId, action } = data as { meetingId: string; action: string };

    let updatedMeeting;
    switch (action) {
      case 'start':
        updatedMeeting = this.updateMeetingStatus(meetingId, 'active', { startedAt: new Date().toISOString() });
        break;
      case 'end':
        updatedMeeting = this.updateMeetingStatus(meetingId, 'ended', { endedAt: new Date().toISOString() });
        break;
      case 'pause':
        updatedMeeting = this.updateMeetingStatus(meetingId, 'paused');
        break;
      default:
        return;
    }

    if (updatedMeeting) {
      this.party.broadcast(JSON.stringify({
        type: 'meeting_updated',
        meeting: updatedMeeting,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  private async handleUserActivity(data: Record<string, unknown>, sender: Connection) {
    // Broadcast user activity if specified
    if (data.broadcast) {
      this.party.broadcast(JSON.stringify({
        type: 'user_activity',
        userId: sender.id,
        activity: data.activity,
        details: data.details,
        timestamp: new Date().toISOString(),
      }), [sender.id]);
    }
  }

  private async handleNotificationMessage(data: Record<string, unknown>, sender: Connection) {
    switch (data.type) {
      case 'notification':
        this.party.broadcast(JSON.stringify({
          type: 'notification',
          data: data.data,
          timestamp: new Date().toISOString(),
        }), [sender.id]);
        break;

      case 'ping':
        sender.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
        }));
        break;

      default:
        sender.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString(),
        }));
    }
  }

  private async handleGeneralMessage(data: Record<string, unknown>, sender: Connection) {
    switch (data.type) {
      case 'financial_update':
        this.party.broadcast(JSON.stringify({
          type: 'financial_update',
          data: data.payload,
          timestamp: new Date().toISOString(),
        }), [sender.id]);
        break;

      case 'user_activity':
        this.party.broadcast(JSON.stringify({
          type: 'user_activity',
          data: data.payload,
          timestamp: new Date().toISOString(),
        }), [sender.id]);
        break;

      case 'ping':
        sender.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
        }));
        break;

      default:
        sender.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString(),
        }));
    }
  }

  // Helper methods for room state management
  private getRoomState() {
    if (!this.rooms.has(this.party.id)) {
      this.rooms.set(this.party.id, {
        users: [],
        channels: [],
        meetings: [],
        messages: new Map(),
      });
    }
    return this.rooms.get(this.party.id);
  }

  private getChannelHistory(channelId: string): Message[] {
    const roomState = this.getRoomState();
    return roomState.messages.get(channelId) || [];
  }

  private addMessageToChannel(channelId: string, message: Message) {
    const roomState = this.getRoomState();
    if (!roomState.messages.has(channelId)) {
      roomState.messages.set(channelId, []);
    }
    roomState.messages.get(channelId).push(message);
  }

  private updateChannelLastMessage(channelId: string, message: Message) {
    const roomState = this.getRoomState();
    const channel = roomState.channels.find((c: Channel) => c.id === channelId);
    if (channel) {
      channel.lastMessage = message;
    }
  }

  private addMeetingToRoom(meeting: Meeting) {
    const roomState = this.getRoomState();
    roomState.meetings.push(meeting);
  }

  private updateMeetingParticipants(meetingId: string, userId: string, action: 'join' | 'leave'): Meeting | null {
    const roomState = this.getRoomState();
    const meeting = roomState.meetings.find((m: Meeting) => m.id === meetingId);
    if (!meeting) return null;

    if (action === 'join' && !meeting.participants.includes(userId)) {
      meeting.participants.push(userId);
    } else if (action === 'leave') {
      meeting.participants = meeting.participants.filter((p: string) => p !== userId);
    }

    return meeting;
  }

  private updateMeetingStatus(meetingId: string, status: Meeting['status'], extraFields?: Partial<Meeting>): Meeting | null {
    const roomState = this.getRoomState();
    const meeting = roomState.meetings.find((m: Meeting) => m.id === meetingId);
    if (!meeting) return null;

    meeting.status = status;
    if (extraFields) {
      Object.assign(meeting, extraFields);
    }

    return meeting;
  }

  async onClose(_conn: Connection) {
    console.log(`Connection closed for room: ${this.party.id}`);

    // Notify others that user left
    this.party.broadcast(JSON.stringify({
      type: 'user_left',
      userId: _conn.id,
      timestamp: new Date().toISOString(),
    }));
  }

  async onError(_conn: Connection, error: Error) {
    console.error(`Error in room ${this.party.id}:`, error);
  }
}
