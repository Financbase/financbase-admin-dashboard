import type * as Party from "partykit/server";

export default class FinancbaseServer implements Party.Server {
  constructor(readonly party: Party.Party) {}

  async onConnect(conn: Party.Connection, ctx: Party.Context) {
    // Handle new connections
    console.log(`New connection to room: ${this.party.id}`);

    // Route notification rooms to notification-specific handling
    if (this.party.id.startsWith('notifications-')) {
      // Send connection confirmation for notification rooms
      conn.send(JSON.stringify({
        type: 'connected',
        room: this.party.id,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Send welcome message for other rooms
    conn.send(JSON.stringify({
      type: 'welcome',
      message: `Connected to ${this.party.id}`,
      timestamp: new Date().toISOString(),
    }));
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);

      // Route notification messages to notification-specific handling
      if (this.party.id.startsWith('notifications-')) {
        await this.handleNotificationMessage(data, sender);
        return;
      }

      // Handle general room messages
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

  private async handleNotificationMessage(data: any, sender: Party.Connection) {
    switch (data.type) {
      case 'notification':
        // Broadcast notification to all connections in the room
        this.party.broadcast(JSON.stringify({
          type: 'notification',
          data: data.data,
          timestamp: new Date().toISOString(),
        }), [sender.id]); // Send to all except sender
        break;

      case 'ping':
        // Respond to ping
        sender.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
        }));
        break;

      default:
        // Echo back unknown messages
        sender.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString(),
        }));
    }
  }

  private async handleGeneralMessage(data: any, sender: Party.Connection) {
    switch (data.type) {
      case 'financial_update':
        // Broadcast financial updates to all connections
        this.party.broadcast(JSON.stringify({
          type: 'financial_update',
          data: data.payload,
          timestamp: new Date().toISOString(),
        }), [sender.id]); // Send to all except sender
        break;

      case 'user_activity':
        // Broadcast user activity updates
        this.party.broadcast(JSON.stringify({
          type: 'user_activity',
          data: data.payload,
          timestamp: new Date().toISOString(),
        }), [sender.id]);
        break;

      case 'ping':
        // Respond to ping
        sender.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
        }));
        break;

      default:
        // Echo back unknown messages
        sender.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString(),
        }));
    }
  }

  async onClose(conn: Party.Connection) {
    console.log(`Connection closed for room: ${this.party.id}`);
  }

  async onError(conn: Party.Connection, error: Error) {
    console.error(`Error in room ${this.party.id}:`, error);
  }
} satisfies PartyKitServer;
