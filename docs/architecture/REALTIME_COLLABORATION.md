# Real-time Collaboration Architecture

## Overview

The Financbase Admin Dashboard implements real-time collaboration features using **Partykit** WebSocket server, enabling live updates, team chat, document collaboration, and meeting management.

## Technology Stack

- **WebSocket Server**: Partykit
- **Client Library**: Native WebSocket API with React Context
- **Message Protocol**: JSON-based messaging
- **State Management**: Room-based state synchronization

## Partykit Server

### Server Implementation

```83:141:partykit/server.ts
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
```

## Room-Based Architecture

### Room Types

1. **Collaboration Rooms**: `financbase-{workspaceId}`
   - Team chat
   - Document collaboration
   - Real-time updates

2. **Notification Rooms**: `notifications-{userId}`
   - User-specific notifications
   - Real-time alerts

3. **General Rooms**: Custom room IDs
   - Financial updates
   - Activity broadcasts

### Room State Management

```70:81:partykit/server.ts
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
```

## Message Types

### Collaboration Messages

```171:212:partykit/server.ts
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
```

### Message Structure

```23:43:partykit/server.ts
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
```

## Client Integration

### Collaboration Context

```1:100:contexts/collaboration-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface CollaborationState {
  // Connection state
  isConnected: boolean;
  connectionId: string | null;

  // Current user
  currentUser: User | null;

  // Channels and messages
  channels: Channel[];
  messages: Record<string, Message[]>;
  activeChannelId: string | null;

  // Meetings
  meetings: Meeting[];
  activeMeetingId: string | null;

  // Real-time state
  onlineUsers: User[];
  typingUsers: TypingUser[];
  activities: UserActivity[];

  // Loading states
  isLoadingChannels: boolean;
  isLoadingMessages: boolean;
  isLoadingMeetings: boolean;
}
```

### WebSocket Connection

```typescript
// Establish WebSocket connection
const ws = new WebSocket(`wss://${roomId}.partykit.dev`);

// Handle incoming messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};

// Send message
ws.send(JSON.stringify({
  type: 'send_message',
  channelId: 'channel-1',
  content: 'Hello, team!',
  userName: user.firstName,
}));
```

## Features

### Team Chat

- Real-time messaging
- Channel-based organization
- Message history (last 1000 messages per channel)
- Typing indicators
- Message reactions
- Edit/delete functionality

### Document Collaboration

- Real-time document updates
- Presence indicators
- Collaborative editing
- Change synchronization

### Meeting Management

- Schedule meetings
- Join/leave meetings
- Meeting status updates (scheduled, active, paused, ended)
- Participant management

### User Presence

- Online status tracking
- User activity broadcasting
- Away/busy status
- Connection/disconnection events

## State Synchronization

### Room Storage

```typescript
// Store messages in room storage
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
```

### Broadcast Pattern

```262:265:partykit/server.ts
    // Broadcast message to all connections in the room
    this.room.broadcast(JSON.stringify({
      ...message,
    }));
```

## Error Handling

### Connection Errors

```428:441:partykit/server.ts
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
```

### Client Error Recovery

```typescript
// Auto-reconnect on connection loss
ws.onclose = () => {
  // Exponential backoff reconnection
  setTimeout(() => {
    reconnect();
  }, 1000 * Math.pow(2, retryCount));
};
```

## Performance Optimization

### Message Batching

- Batch small updates into single messages
- Debounce typing indicators
- Limit message history size (1000 messages)

### Connection Management

- Single WebSocket connection per room
- Connection pooling for multiple rooms
- Automatic reconnection with backoff

## Security

### Authentication

- WebSocket connections authenticated via Clerk
- Room access control based on user permissions
- Channel-level permissions (public/private/dm)

### Data Validation

- Validate all incoming messages
- Sanitize message content
- Rate limit message sending

## Best Practices

### Message Design

1. **Keep messages small** - Minimize payload size
2. **Use message types** - Structured message format
3. **Include timestamps** - For ordering and display
4. **Idempotent operations** - Handle duplicate messages

### State Management

1. **Sync server state** - Always trust server state
2. **Optimistic updates** - Update UI immediately, sync later
3. **Handle conflicts** - Server state wins on conflict
4. **Queue offline messages** - Send when connection restored

## Related Documentation

- [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)
- [Security Architecture](./SECURITY_ARCHITECTURE.md)
- [Collaboration Integration Guide](../integrations/COLLABORATION_README.md)

