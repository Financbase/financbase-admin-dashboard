import type { PartyKitServer } from "partykit/server";

export default {
  async onConnect(connection, room) {
    // Handle user connection to collaboration room
    console.log(`User ${connection.id} connected to room ${room.id}`);

    // Broadcast user presence to other users in the room
    room.broadcast({
      type: "user_joined",
      userId: connection.id,
      timestamp: new Date().toISOString(),
    });

    // Send current room state to new user
    const currentUsers = Array.from(room.getConnections()).map(conn => ({
      id: conn.id,
      connectedAt: new Date().toISOString(),
    }));

    connection.send({
      type: "room_state",
      users: currentUsers,
      roomId: room.id,
    });
  },

  async onMessage(message, connection, room) {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "send_message":
          await this.handleSendMessage(data, connection, room);
          break;

        case "typing_start":
          await this.handleTypingStart(data, connection, room);
          break;

        case "typing_stop":
          await this.handleTypingStop(data, connection, room);
          break;

        case "user_activity":
          await this.handleUserActivity(data, connection, room);
          break;

        case "join_channel":
          await this.handleJoinChannel(data, connection, room);
          break;

        case "leave_channel":
          await this.handleLeaveChannel(data, connection, room);
          break;

        case "create_meeting":
          await this.handleCreateMeeting(data, connection, room);
          break;

        case "join_meeting":
          await this.handleJoinMeeting(data, connection, room);
          break;

        case "meeting_action":
          await this.handleMeetingAction(data, connection, room);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  },

  async onClose(connection, room) {
    console.log(`User ${connection.id} disconnected from room ${room.id}`);

    // Broadcast user leaving
    room.broadcast({
      type: "user_left",
      userId: connection.id,
      timestamp: new Date().toISOString(),
    });

    // Clean up user data
    await this.cleanupUserData(connection.id, room);
  },

  async onError(connection, error) {
    console.error(`Connection error for ${connection.id}:`, error);
  },

  // Message handlers
  async handleSendMessage(data: any, connection: any, room: any) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "message",
      content: data.content,
      userId: connection.id,
      userName: data.userName || "Anonymous",
      userAvatar: data.userAvatar,
      timestamp: new Date().toISOString(),
      channelId: data.channelId || "general",
      replyTo: data.replyTo,
      attachments: data.attachments || [],
      reactions: {},
    };

    // Store message in room state
    const roomMessages = room.storage.get("messages") || [];
    roomMessages.push(message);

    // Keep only last 1000 messages per channel
    const channelMessages = roomMessages.filter((msg: any) => msg.channelId === message.channelId);
    if (channelMessages.length > 1000) {
      const overflow = channelMessages.length - 1000;
      roomMessages.splice(0, overflow);
    }

    await room.storage.put("messages", roomMessages);

    // Broadcast message to all users in room
    room.broadcast(message);
  },

  async handleTypingStart(data: any, connection: any, room: any) {
    room.broadcast({
      type: "typing_start",
      userId: connection.id,
      userName: data.userName || "Anonymous",
      channelId: data.channelId || "general",
    }, [connection.id]); // Send to all except sender
  },

  async handleTypingStop(data: any, connection: any, room: any) {
    room.broadcast({
      type: "typing_stop",
      userId: connection.id,
      channelId: data.channelId || "general",
    }, [connection.id]); // Send to all except sender
  },

  async handleUserActivity(data: any, connection: any, room: any) {
    // Update user activity status
    const userActivity = {
      userId: connection.id,
      activity: data.activity,
      timestamp: new Date().toISOString(),
      details: data.details,
    };

    // Store in room state
    const activities = room.storage.get("activities") || [];
    activities.push(userActivity);

    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }

    await room.storage.put("activities", activities);

    // Broadcast activity (optional, for live activity feeds)
    if (data.broadcast) {
      room.broadcast({
        type: "user_activity",
        ...userActivity,
      });
    }
  },

  async handleJoinChannel(data: any, connection: any, room: any) {
    // Track user channel membership
    const userChannels = room.storage.get(`user_channels_${connection.id}`) || [];
    if (!userChannels.includes(data.channelId)) {
      userChannels.push(data.channelId);
      await room.storage.put(`user_channels_${connection.id}`, userChannels);
    }

    // Send channel history to user
    const messages = room.storage.get("messages") || [];
    const channelMessages = messages.filter((msg: any) => msg.channelId === data.channelId);

    connection.send({
      type: "channel_history",
      channelId: data.channelId,
      messages: channelMessages.slice(-50), // Last 50 messages
    });
  },

  async handleLeaveChannel(data: any, connection: any, room: any) {
    // Remove user from channel
    const userChannels = room.storage.get(`user_channels_${connection.id}`) || [];
    const filteredChannels = userChannels.filter((channelId: string) => channelId !== data.channelId);
    await room.storage.put(`user_channels_${connection.id}`, filteredChannels);
  },

  async handleCreateMeeting(data: any, connection: any, room: any) {
    const meeting = {
      id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      scheduledFor: data.scheduledFor,
      createdBy: connection.id,
      participants: [connection.id],
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    // Store meeting
    const meetings = room.storage.get("meetings") || [];
    meetings.push(meeting);
    await room.storage.put("meetings", meetings);

    // Broadcast meeting creation
    room.broadcast({
      type: "meeting_created",
      meeting,
    });
  },

  async handleJoinMeeting(data: any, connection: any, room: any) {
    const meetings = room.storage.get("meetings") || [];
    const meeting = meetings.find((m: any) => m.id === data.meetingId);

    if (meeting && !meeting.participants.includes(connection.id)) {
      meeting.participants.push(connection.id);
      await room.storage.put("meetings", meetings);

      room.broadcast({
        type: "meeting_updated",
        meeting,
      });
    }
  },

  async handleMeetingAction(data: any, connection: any, room: any) {
    const meetings = room.storage.get("meetings") || [];
    const meetingIndex = meetings.findIndex((m: any) => m.id === data.meetingId);

    if (meetingIndex !== -1) {
      const meeting = meetings[meetingIndex];

      // Handle different meeting actions
      switch (data.action) {
        case "start":
          meeting.status = "active";
          meeting.startedAt = new Date().toISOString();
          break;
        case "end":
          meeting.status = "ended";
          meeting.endedAt = new Date().toISOString();
          break;
        case "pause":
          meeting.status = "paused";
          break;
        case "resume":
          meeting.status = "active";
          break;
      }

      meetings[meetingIndex] = meeting;
      await room.storage.put("meetings", meetings);

      room.broadcast({
        type: "meeting_updated",
        meeting,
      });
    }
  },

  async cleanupUserData(userId: string, room: any) {
    // Clean up user-specific data when they disconnect
    await room.storage.delete(`user_channels_${userId}`);
    await room.storage.delete(`user_typing_${userId}`);
  },
} satisfies PartyKitServer;
