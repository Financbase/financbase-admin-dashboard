// Define PartyKit types since they're not available for import
interface Connection extends WebSocket {
  id: string;
  state: any;
  setState(state: any): void;
}

interface Room {
  id: string;
  storage: {
    get(key: string): any;
    put(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
  };
  broadcast(msg: any, without?: string[]): void;
  getConnections(): Iterable<Connection>;
}

interface ConnectionContext {
  request: Request;
}

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

interface RoomState {
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'away' | 'busy';
    connectedAt: string;
  }>;
  channels: Channel[];
  meetings: Meeting[];
  messages: Map<string, Message[]>;
}

export default class FinancbaseServer {
  constructor(public room: Room) {}

  async onConnect(connection: Connection, ctx: ConnectionContext): Promise<void> {
    console.log(`New connection to room: ${this.room.id}`);

    // Handle collaboration rooms
    if (this.room.id.startsWith('financbase-')) {
      await this.handleCollaborationConnect(connection, ctx);
      return;
    }

    // Handle notification rooms
    if (this.room.id.startsWith('notifications-')) {
      connection.send(JSON.stringify({
        type: 'connected',
        room: this.room.id,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Default welcome message
    connection.send(JSON.stringify({
      type: 'welcome',
      message: `Connected to ${this.room.id}`,
      timestamp: new Date().toISOString(),
    }));
  }

  private async handleCollaborationConnect(connection: Connection, ctx: ConnectionContext): Promise<void> {
    try {
      // Get current room state
      const roomState = this.getRoomState();

      // Send current room state to new connection
      connection.send(JSON.stringify({
        type: 'room_state',
        users: roomState.users || [],
        channels: roomState.channels || [],
        meetings: roomState.meetings || [],
        timestamp: new Date().toISOString(),
      }));

      // Notify other users that someone joined
      this.room.broadcast(JSON.stringify({
        type: 'user_joined',
        userId: connection.id,
        timestamp: new Date().toISOString(),
      }), [connection.id]);
    } catch (error) {
      console.error('Error in collaboration connect:', error);
      connection.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize collaboration session',
        timestamp: new Date().toISOString(),
      }));
    }
  }

  async onMessage(message: string | ArrayBuffer | ArrayBufferView, sender: Connection): Promise<void> {
    try {
      const data = JSON.parse(message as string);

      // Handle collaboration messages
      if (this.room.id.startsWith('financbase-')) {
        await this.handleCollaborationMessage(data, sender);
        return;
      }

      // Handle notification messages
      if (this.room.id.startsWith('notifications-')) {
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

  private async handleCollaborationMessage(data: Record<string, unknown>, sender: Connection): Promise<void> {
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

  private async handleJoinChannel(data: Record<string, unknown>, sender: Connection): Promise<void> {
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
    this.room.broadcast(JSON.stringify({
      type: 'channel_joined',
      channelId,
      userId: sender.id,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleLeaveChannel(data: Record<string, unknown>, sender: Connection): Promise<void> {
    const { channelId } = data as { channelId: string };

    // Notify others that user left channel
    this.room.broadcast(JSON.stringify({
      type: 'channel_left',
      channelId,
      userId: sender.id,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleSendMessage(data: Record<string, unknown>, sender: Connection): Promise<void> {
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
    this.room.broadcast(JSON.stringify({
      ...message,
    }));

    // Update channel's last message
    this.updateChannelLastMessage(data.channelId as string, message);
  }

  private async handleTypingStart(data: Record<string, unknown>, sender: Connection): Promise<void> {
    this.room.broadcast(JSON.stringify({
      type: 'typing_start',
      userId: sender.id,
      userName: data.userName || 'Anonymous',
      channelId: data.channelId,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleTypingStop(data: Record<string, unknown>, sender: Connection): Promise<void> {
    this.room.broadcast(JSON.stringify({
      type: 'typing_stop',
      userId: sender.id,
      channelId: data.channelId,
      timestamp: new Date().toISOString(),
    }), [sender.id]);
  }

  private async handleCreateMeeting(data: Record<string, unknown>, sender: Connection): Promise<void> {
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
    this.room.broadcast(JSON.stringify({
      type: 'meeting_created',
      meeting,
      timestamp: new Date().toISOString(),
    }));
  }

  private async handleJoinMeeting(data: Record<string, unknown>, sender: Connection): Promise<void> {
    const { meetingId } = data as { meetingId: string };

    // Update meeting participants
    const updatedMeeting = this.updateMeetingParticipants(meetingId, sender.id, 'join');

    if (updatedMeeting) {
      this.room.broadcast(JSON.stringify({
        type: 'meeting_updated',
        meeting: updatedMeeting,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  private async handleMeetingAction(data: Record<string, unknown>, sender: Connection): Promise<void> {
    const { meetingId, action } = data as { meetingId: string; action: string };

    let updatedMeeting: Meeting | null;
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
      this.room.broadcast(JSON.stringify({
        type: 'meeting_updated',
        meeting: updatedMeeting,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  private async handleUserActivity(data: Record<string, unknown>, sender: Connection): Promise<void> {
    // Broadcast user activity if specified
    if (data.broadcast) {
      this.room.broadcast(JSON.stringify({
        type: 'user_activity',
        userId: sender.id,
        activity: data.activity,
        details: data.details,
        timestamp: new Date().toISOString(),
      }), [sender.id]);
    }
  }

  private async handleNotificationMessage(data: Record<string, unknown>, sender: Connection): Promise<void> {
    switch (data.type) {
      case 'notification':
        this.room.broadcast(JSON.stringify({
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

  private async handleGeneralMessage(data: Record<string, unknown>, sender: Connection): Promise<void> {
    switch (data.type) {
      case 'financial_update':
        this.room.broadcast(JSON.stringify({
          type: 'financial_update',
          data: data.payload,
          timestamp: new Date().toISOString(),
        }), [sender.id]);
        break;

      case 'user_activity':
        this.room.broadcast(JSON.stringify({
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

  async onClose(connection: Connection): Promise<void> {
    console.log(`Connection closed for room: ${this.room.id}`);

    // Notify others that user left
    this.room.broadcast(JSON.stringify({
      type: 'user_left',
      userId: connection.id,
      timestamp: new Date().toISOString(),
    }));
  }

  async onError(connection: Connection, error: Error): Promise<void> {
    console.error(`Error in room ${this.room.id}:`, error);
  }

  // Helper methods for room state management
  private getRoomState(): RoomState {
    const users = this.room.storage.get("users") || [];
    const channels = this.room.storage.get("channels") || [];
    const meetings = this.room.storage.get("meetings") || [];
    const messages = this.room.storage.get("messages") || new Map();

    return {
      users,
      channels,
      meetings,
      messages,
    };
  }

  private getChannelHistory(channelId: string): Message[] {
    const messages = this.room.storage.get("messages") || new Map();
    return messages.get(channelId) || [];
  }

  private addMessageToChannel(channelId: string, message: Message): void {
    const messages = this.room.storage.get("messages") || new Map();
    if (!messages.has(channelId)) {
      messages.set(channelId, []);
    }
    messages.get(channelId).push(message);

    // Keep only last 1000 messages per channel
    const channelMessages = messages.get(channelId);
    if (channelMessages.length > 1000) {
      messages.set(channelId, channelMessages.slice(-1000));
    }

    this.room.storage.put("messages", messages);
  }

  private updateChannelLastMessage(channelId: string, message: Message): void {
    const channels = this.room.storage.get("channels") || [];
    const channelIndex = channels.findIndex((c: Channel) => c.id === channelId);
    if (channelIndex !== -1) {
      channels[channelIndex].lastMessage = message;
      this.room.storage.put("channels", channels);
    }
  }

  private addMeetingToRoom(meeting: Meeting): void {
    const meetings = this.room.storage.get("meetings") || [];
    meetings.push(meeting);
    this.room.storage.put("meetings", meetings);
  }

  private updateMeetingParticipants(meetingId: string, userId: string, action: 'join' | 'leave'): Meeting | null {
    const meetings = this.room.storage.get("meetings") || [];
    const meetingIndex = meetings.findIndex((m: Meeting) => m.id === meetingId);
    if (meetingIndex === -1) return null;

    const meeting = meetings[meetingIndex];
    if (action === 'join' && !meeting.participants.includes(userId)) {
      meeting.participants.push(userId);
    } else if (action === 'leave') {
      meeting.participants = meeting.participants.filter((p: string) => p !== userId);
    }

    meetings[meetingIndex] = meeting;
    this.room.storage.put("meetings", meetings);
    return meeting;
  }

  private updateMeetingStatus(meetingId: string, status: Meeting['status'], extraFields?: Partial<Meeting>): Meeting | null {
    const meetings = this.room.storage.get("meetings") || [];
    const meetingIndex = meetings.findIndex((m: Meeting) => m.id === meetingId);
    if (meetingIndex === -1) return null;

    const meeting = meetings[meetingIndex];
    meeting.status = status;
    if (extraFields) {
      Object.assign(meeting, extraFields);
    }

    meetings[meetingIndex] = meeting;
    this.room.storage.put("meetings", meetings);
    return meeting;
  }
}
