/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * Cloudflare Worker for WebSocket connections
 * Handles real-time WebSocket connections for support tickets and notifications
 */

// Cloudflare Workers type definitions
declare global {
  class WebSocketPair {
    constructor();
    0: WebSocket; // client
    1: CloudflareWebSocket; // server
  }

  interface ResponseInit {
    webSocket?: WebSocket;
  }

  interface CloudflareWebSocket extends WebSocket {
    accept(): void;
  }
}

interface Env {
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  CLERK_VALIDATION_URL?: string; // URL to token validation endpoint
  // Add other bindings as needed (R2, KV, Durable Objects, etc.)
}

interface WebSocketConnection {
  id: string;
  ticketId: string;
  userId: string;
  socket: CloudflareWebSocket;
  connectedAt: number;
  lastMessageTime: number;
  messageCount: number;
}

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

// Store active connections in memory (for single-instance worker)
// For production, consider using Durable Objects or KV for state management
const connections = new Map<string, WebSocketConnection>();

// Rate limiting: Track message rates per user
const userMessageRates = new Map<string, RateLimitTracker>();

// Connection limits configuration
const MAX_CONNECTIONS_PER_USER = 5; // Maximum connections per user
const MAX_CONNECTIONS_PER_TICKET = 20; // Maximum connections per ticket
const MAX_MESSAGES_PER_MINUTE = 60; // Maximum messages per minute per connection
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

/**
 * Generate a unique connection ID
 */
function generateConnectionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Check if user has exceeded connection limit
 */
function checkUserConnectionLimit(userId: string): boolean {
  let userConnections = 0;
  for (const connection of connections.values()) {
    if (connection.userId === userId) {
      userConnections++;
    }
  }
  return userConnections >= MAX_CONNECTIONS_PER_USER;
}

/**
 * Check if ticket has exceeded connection limit
 */
function checkTicketConnectionLimit(ticketId: string): boolean {
  let ticketConnections = 0;
  for (const connection of connections.values()) {
    if (connection.ticketId === ticketId) {
      ticketConnections++;
    }
  }
  return ticketConnections >= MAX_CONNECTIONS_PER_TICKET;
}

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const tracker = userMessageRates.get(userId);

  if (!tracker || now > tracker.resetTime) {
    // Reset or create new tracker
    userMessageRates.set(userId, {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: MAX_MESSAGES_PER_MINUTE,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  if (tracker.count >= MAX_MESSAGES_PER_MINUTE) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: tracker.resetTime,
    };
  }

  tracker.count++;
  return {
    allowed: true,
    remaining: MAX_MESSAGES_PER_MINUTE - tracker.count,
    resetAt: tracker.resetTime,
  };
}

/**
 * Validate authentication token
 * Validates Clerk JWT tokens by calling the token validation API endpoint
 */
async function validateToken(token: string, env: Env): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!token) {
    return { valid: false, error: 'Token is required' };
  }

  // Get validation URL from environment or use default
  const validationUrl = env.CLERK_VALIDATION_URL || 
    (env.ENVIRONMENT === 'production' 
      ? 'https://financbase.com/api/auth/validate-token'
      : env.ENVIRONMENT === 'staging'
      ? 'https://staging.financbase.com/api/auth/validate-token'
      : 'http://localhost:3000/api/auth/validate-token');

  try {
    // Call the token validation endpoint
    const response = await fetch(validationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (env.LOG_LEVEL === 'debug') {
        console.error('Token validation failed:', response.status, errorData);
      }
      return { 
        valid: false, 
        error: errorData.error || 'Token validation failed' 
      };
    }

    const data = await response.json();
    
    if (data.valid && data.userId) {
      if (env.LOG_LEVEL === 'debug') {
        console.log(`Token validated successfully for user: ${data.userId}`);
      }
      return { 
        valid: true, 
        userId: data.userId 
      };
    }

    return { 
      valid: false, 
      error: data.error || 'Invalid token' 
    };
  } catch (error) {
    console.error('Error validating token:', error);
    // In production, fail secure - reject invalid tokens
    // In development, we might want to allow for testing
    if (env.ENVIRONMENT === 'development' && env.LOG_LEVEL === 'debug') {
      console.warn('Token validation service unavailable, rejecting connection');
    }
    return { 
      valid: false, 
      error: 'Token validation service unavailable' 
    };
  }
}

/**
 * Handle WebSocket upgrade request
 */
async function handleWebSocketRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const ticketId = url.searchParams.get('ticketId');
  const token = url.searchParams.get('token');

  if (!ticketId || !token) {
    return new Response('Missing ticketId or token', { status: 400 });
  }

  // Validate token
  const validation = await validateToken(token, env);
  if (!validation.valid) {
    return new Response(`Invalid token: ${validation.error || 'Authentication failed'}`, { status: 401 });
  }

  const userId = validation.userId || 'unknown';

  // Check connection limits
  if (checkUserConnectionLimit(userId)) {
    if (env.LOG_LEVEL === 'debug') {
      console.warn(`User ${userId} exceeded connection limit (${MAX_CONNECTIONS_PER_USER})`);
    }
    return new Response(`Connection limit exceeded: Maximum ${MAX_CONNECTIONS_PER_USER} connections per user`, { status: 429 });
  }

  if (checkTicketConnectionLimit(ticketId)) {
    if (env.LOG_LEVEL === 'debug') {
      console.warn(`Ticket ${ticketId} exceeded connection limit (${MAX_CONNECTIONS_PER_TICKET})`);
    }
    return new Response(`Connection limit exceeded: Maximum ${MAX_CONNECTIONS_PER_TICKET} connections per ticket`, { status: 429 });
  }

  // Upgrade to WebSocket
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  // Create WebSocket pair
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  // Accept the WebSocket connection
  server.accept();

  // Create connection record
  const connectionId = generateConnectionId();
  const now = Date.now();
  const connection: WebSocketConnection = {
    id: connectionId,
    ticketId,
    userId,
    socket: server,
    connectedAt: now,
    lastMessageTime: now,
    messageCount: 0,
  };

  // Store connection
  const connectionKey = `${ticketId}:${connectionId}`;
  connections.set(connectionKey, connection);

  // Send welcome message
  server.send(JSON.stringify({
    type: 'connected',
    connectionId,
    ticketId,
    timestamp: new Date().toISOString(),
  }));

  // Handle messages
  server.addEventListener('message', (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data as string);
      handleMessage(server, connection, message, env);
    } catch (error: unknown) {
      console.error('Error parsing message:', error);
      server.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
    }
  });

  // Handle close
  server.addEventListener('close', () => {
    connections.delete(connectionKey);
    // Clean up rate limit tracker if user has no more connections
    let hasOtherConnections = false;
    for (const conn of connections.values()) {
      if (conn.userId === connection.userId) {
        hasOtherConnections = true;
        break;
      }
    }
    if (!hasOtherConnections) {
      userMessageRates.delete(connection.userId);
    }
    
    broadcastToTicket(ticketId, connectionId, {
      type: 'user_disconnected',
      userId: connection.userId,
      timestamp: new Date().toISOString(),
    }, env);
  });

  // Handle errors
  server.addEventListener('error', (error: Event) => {
    console.error('WebSocket error:', error);
    connections.delete(connectionKey);
  });

  // Broadcast user joined
  broadcastToTicket(ticketId, connectionId, {
    type: 'user_joined',
    userId: connection.userId,
    timestamp: new Date().toISOString(),
  }, env);

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(
  socket: CloudflareWebSocket,
  connection: WebSocketConnection,
  message: Record<string, unknown>,
  env: Env
): void {
  const now = Date.now();

  // Check rate limit (skip for ping messages)
  if (message.type !== 'ping') {
    const rateLimit = checkRateLimit(connection.userId);
    if (!rateLimit.allowed) {
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Rate limit exceeded. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED',
        resetAt: new Date(rateLimit.resetAt).toISOString(),
      }));
      return;
    }

    // Update connection message tracking
    connection.lastMessageTime = now;
    connection.messageCount++;

    // Send rate limit info in debug mode
    if (env.LOG_LEVEL === 'debug') {
      console.log(`Rate limit check for ${connection.userId}: ${rateLimit.remaining} remaining, resets at ${new Date(rateLimit.resetAt).toISOString()}`);
    }
  }

  switch (message.type) {
    case 'ping':
      socket.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString(),
      }));
      break;

    case 'message':
      // Validate message content
      if (!message.content || typeof message.content !== 'string') {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message content',
        }));
        return;
      }

      // Check message length (max 10KB)
      if (message.content.length > 10000) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Message too long. Maximum 10KB allowed.',
        }));
        return;
      }

      // Broadcast message to all connections in the ticket room
      broadcastToTicket(connection.ticketId, connection.id, {
        type: 'message',
        userId: connection.userId,
        content: message.content,
        timestamp: new Date().toISOString(),
      }, env);
      break;

    case 'typing':
      // Broadcast typing indicator
      broadcastToTicket(connection.ticketId, connection.id, {
        type: 'typing',
        userId: connection.userId,
        isTyping: message.isTyping,
        timestamp: new Date().toISOString(),
      }, env);
      break;

    default:
      socket.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${message.type}`,
      }));
  }
}

/**
 * Broadcast message to all connections in a ticket room
 */
function broadcastToTicket(
  ticketId: string,
  excludeConnectionId: string,
  message: any,
  env: Env
): void {
  let broadcastCount = 0;
  
  for (const [key, connection] of connections.entries()) {
    if (connection.ticketId === ticketId && connection.id !== excludeConnectionId) {
      try {
        if (connection.socket.readyState === WebSocket.OPEN) {
          connection.socket.send(JSON.stringify(message));
          broadcastCount++;
        }
      } catch (error) {
        console.error('Error broadcasting to connection:', error);
        connections.delete(key);
      }
    }
  }

  if (env.LOG_LEVEL === 'debug') {
    console.log(`Broadcasted to ${broadcastCount} connections for ticket ${ticketId}`);
  }
}

/**
 * Main worker entry point
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      // Count connections by user and ticket
      const connectionsByUser = new Map<string, number>();
      const connectionsByTicket = new Map<string, number>();
      
      for (const connection of connections.values()) {
        connectionsByUser.set(
          connection.userId,
          (connectionsByUser.get(connection.userId) || 0) + 1
        );
        connectionsByTicket.set(
          connection.ticketId,
          (connectionsByTicket.get(connection.ticketId) || 0) + 1
        );
      }

      return new Response(JSON.stringify({
        status: 'ok',
        environment: env.ENVIRONMENT,
        connections: connections.size,
        uniqueUsers: connectionsByUser.size,
        uniqueTickets: connectionsByTicket.size,
        limits: {
          maxConnectionsPerUser: MAX_CONNECTIONS_PER_USER,
          maxConnectionsPerTicket: MAX_CONNECTIONS_PER_TICKET,
          maxMessagesPerMinute: MAX_MESSAGES_PER_MINUTE,
        },
        timestamp: new Date().toISOString(),
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // WebSocket endpoint
    if (url.pathname === '/ws') {
      return handleWebSocketRequest(request, env);
    }

    // 404 for unknown paths
    return new Response('Not Found', { status: 404 });
  },
};

