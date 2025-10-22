"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: string;
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

interface TypingUser {
  userId: string;
  userName: string;
  channelId: string;
  timestamp: string;
}

interface UserActivity {
  userId: string;
  activity: string;
  timestamp: string;
  details?: Record<string, any>;
}

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

interface CollaborationActions {
  // Connection management
  connect: (roomId?: string) => void;
  disconnect: () => void;

  // Channel management
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  createChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'lastMessage'>) => void;

  // Messaging
  sendMessage: (content: string, channelId?: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;

  // Typing indicators
  startTyping: (channelId?: string) => void;
  stopTyping: (channelId?: string) => void;

  // Activity tracking
  trackActivity: (activity: string, details?: Record<string, any>) => void;

  // Meeting management
  createMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'participants' | 'status'>) => void;
  joinMeeting: (meetingId: string) => void;
  leaveMeeting: (meetingId: string) => void;
  startMeeting: (meetingId: string) => void;
  endMeeting: (meetingId: string) => void;

  // Utility functions
  markChannelAsRead: (channelId: string) => void;
  getChannelMessages: (channelId: string) => Message[];
  getUnreadCount: (channelId: string) => number;
}

type CollaborationContextType = CollaborationState & CollaborationActions;

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}

interface CollaborationProviderProps {
  children: ReactNode;
  roomId?: string;
}

export function CollaborationProvider({ children, roomId = 'financbase-main' }: CollaborationProviderProps) {
  const { user } = useUser();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    connectionId: null,
    currentUser: null,
    channels: [],
    messages: {},
    activeChannelId: null,
    meetings: [],
    activeMeetingId: null,
    onlineUsers: [],
    typingUsers: [],
    activities: [],
    isLoadingChannels: false,
    isLoadingMessages: false,
    isLoadingMeetings: false,
  });

  // Initialize current user
  useEffect(() => {
    if (user) {
      setState(prev => ({
        ...prev,
        currentUser: {
          id: user.id,
          name: user.fullName || user.username || 'Anonymous',
          avatar: (user as any).imageUrl,
          email: user.primaryEmailAddress?.emailAddress || '',
          role: (user as any).publicMetadata?.role || 'user',
        },
      }));
    }
  }, [user]);

  // WebSocket connection management
  const connect = useCallback((roomIdToConnect?: string) => {
    if (ws?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const connectionRoomId = roomIdToConnect || roomId;

    const websocketUrl = `${protocol}//${host}/partykit/financbase-partykit/${connectionRoomId}`;

    console.log('Connecting to:', websocketUrl);

    const websocket = new WebSocket(websocketUrl);

    websocket.onopen = () => {
      console.log('Connected to collaboration server');
      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionId: `user_${Date.now()}`,
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from collaboration server');
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionId: null,
      }));

      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (state.currentUser) {
          connect(connectionRoomId);
        }
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);
  }, [roomId, state.currentUser]);

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  }, [ws]);

  // Handle incoming WebSocket messages
  const handleIncomingMessage = useCallback((data: any) => {
    setState(prev => {
      switch (data.type) {
        case 'room_state':
          return {
            ...prev,
            onlineUsers: data.users.map((u: any) => ({
              id: u.id,
              name: 'User',
              email: '',
              role: 'user',
            })),
          };

        case 'user_joined':
          return {
            ...prev,
            onlineUsers: [...prev.onlineUsers, {
              id: data.userId,
              name: 'New User',
              email: '',
              role: 'user',
            }],
          };

        case 'user_left':
          return {
            ...prev,
            onlineUsers: prev.onlineUsers.filter(u => u.id !== data.userId),
          };

        case 'message':
          const newMessages = { ...prev.messages };
          if (!newMessages[data.channelId]) {
            newMessages[data.channelId] = [];
          }
          newMessages[data.channelId].push(data);

          // Update channel's last message
          const updatedChannels = prev.channels.map(channel =>
            channel.id === data.channelId
              ? { ...channel, lastMessage: data }
              : channel
          );

          return {
            ...prev,
            messages: newMessages,
            channels: updatedChannels,
          };

        case 'typing_start':
          const newTypingUsers = [...prev.typingUsers];
          const existingTypingIndex = newTypingUsers.findIndex(
            t => t.userId === data.userId && t.channelId === data.channelId
          );

          if (existingTypingIndex === -1) {
            newTypingUsers.push(data);
          }

          return {
            ...prev,
            typingUsers: newTypingUsers,
          };

        case 'typing_stop':
          return {
            ...prev,
            typingUsers: prev.typingUsers.filter(
              t => !(t.userId === data.userId && t.channelId === data.channelId)
            ),
          };

        case 'meeting_created':
        case 'meeting_updated':
          const updatedMeetings = data.type === 'meeting_created'
            ? [...prev.meetings, data.meeting]
            : prev.meetings.map(m => m.id === data.meeting.id ? data.meeting : m);

          return {
            ...prev,
            meetings: updatedMeetings,
          };

        case 'channel_history':
          return {
            ...prev,
            messages: {
              ...prev.messages,
              [data.channelId]: data.messages,
            },
          };

        default:
          return prev;
      }
    });
  }, []);

  // Send WebSocket message
  const sendMessage = useCallback((data: any) => {
    if (ws?.readyState === WebSocket.OPEN && state.currentUser) {
      ws.send(JSON.stringify({
        ...data,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userAvatar: state.currentUser.avatar,
      }));
    }
  }, [ws, state.currentUser]);

  // Action implementations
  const joinChannel = useCallback((channelId: string) => {
    sendMessage({ type: 'join_channel', channelId });
    setState(prev => ({ ...prev, activeChannelId: channelId }));
  }, [sendMessage]);

  const leaveChannel = useCallback((channelId: string) => {
    sendMessage({ type: 'leave_channel', channelId });
  }, [sendMessage]);

  const sendMessageToChannel = useCallback((content: string, channelId?: string) => {
    const targetChannelId = channelId || state.activeChannelId;
    if (targetChannelId) {
      sendMessage({ type: 'send_message', content, channelId: targetChannelId });
    }
  }, [state.activeChannelId, sendMessage]);

  const startTyping = useCallback((channelId?: string) => {
    const targetChannelId = channelId || state.activeChannelId;
    if (targetChannelId) {
      sendMessage({ type: 'typing_start', channelId: targetChannelId });
    }
  }, [state.activeChannelId, sendMessage]);

  const stopTyping = useCallback((channelId?: string) => {
    const targetChannelId = channelId || state.activeChannelId;
    if (targetChannelId) {
      sendMessage({ type: 'typing_stop', channelId: targetChannelId });
    }
  }, [state.activeChannelId, sendMessage]);

  const trackActivity = useCallback((activity: string, details?: Record<string, any>) => {
    sendMessage({
      type: 'user_activity',
      activity,
      details,
      broadcast: true,
    });
  }, [sendMessage]);

  const createMeeting = useCallback((meetingData: Omit<Meeting, 'id' | 'createdAt' | 'participants' | 'status'>) => {
    sendMessage({
      type: 'create_meeting',
      ...meetingData,
      participants: [state.currentUser?.id].filter(Boolean),
      status: 'scheduled',
    });
  }, [state.currentUser, sendMessage]);

  const joinMeeting = useCallback((meetingId: string) => {
    sendMessage({ type: 'join_meeting', meetingId });
  }, [sendMessage]);

  const startMeetingAction = useCallback((meetingId: string, action: string) => {
    sendMessage({ type: 'meeting_action', meetingId, action });
  }, [sendMessage]);

  // Auto-connect when user is available
  useEffect(() => {
    if (state.currentUser && !state.isConnected) {
      connect();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [state.currentUser, state.isConnected, connect]);

  const contextValue: CollaborationContextType = {
    ...state,

    // Connection management
    connect,
    disconnect,

    // Channel management
    joinChannel,
    leaveChannel,
    createChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'lastMessage'>) => {
      // Implementation would create channel via API
      console.log('Creating channel:', channel);
    },

    // Messaging
    sendMessage: sendMessageToChannel,
    editMessage: (messageId: string, newContent: string) => {
      // Implementation would edit message via API
      console.log('Editing message:', messageId, newContent);
    },
    deleteMessage: (messageId: string) => {
      // Implementation would delete message via API
      console.log('Deleting message:', messageId);
    },
    addReaction: (messageId: string, emoji: string) => {
      // Implementation would add reaction via API
      console.log('Adding reaction:', messageId, emoji);
    },
    removeReaction: (messageId: string, emoji: string) => {
      // Implementation would remove reaction via API
      console.log('Removing reaction:', messageId, emoji);
    },

    // Typing indicators
    startTyping,
    stopTyping,

    // Activity tracking
    trackActivity,

    // Meeting management
    createMeeting,
    joinMeeting,
    leaveMeeting: (meetingId: string) => {
      // Implementation would leave meeting via API
      console.log('Leaving meeting:', meetingId);
    },
    startMeeting: (meetingId: string) => startMeetingAction(meetingId, 'start'),
    endMeeting: (meetingId: string) => startMeetingAction(meetingId, 'end'),

    // Utility functions
    markChannelAsRead: (channelId: string) => {
      // Implementation would mark channel as read via API
      console.log('Marking channel as read:', channelId);
    },
    getChannelMessages: (channelId: string) => state.messages[channelId] || [],
    getUnreadCount: (channelId: string) => {
      // Implementation would calculate unread count
      return 0;
    },
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}
