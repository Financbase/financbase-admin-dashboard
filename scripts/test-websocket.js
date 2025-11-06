#!/usr/bin/env node
/**
 * WebSocket Connection Test Script
 * Tests the Cloudflare Worker WebSocket endpoint
 * 
 * Usage:
 *   node scripts/test-websocket.js [environment] [ticketId] [token]
 * 
 * Example:
 *   node scripts/test-websocket.js dev test-ticket-123 test-token
 */

const WebSocket = require('ws');

const ENVIRONMENTS = {
  dev: 'wss://financbase-websocket-dev.tight-queen-09af.workers.dev',
  staging: 'wss://financbase-websocket-staging.tight-queen-09af.workers.dev',
  production: 'wss://financbase-websocket.tight-queen-09af.workers.dev',
};

const environment = process.argv[2] || 'dev';
const ticketId = process.argv[3] || `test-ticket-${Date.now()}`;
const token = process.argv[4] || 'test-token';

const baseUrl = ENVIRONMENTS[environment];
if (!baseUrl) {
  console.error(`Invalid environment: ${environment}`);
  console.error(`Valid environments: ${Object.keys(ENVIRONMENTS).join(', ')}`);
  process.exit(1);
}

const wsUrl = `${baseUrl}/ws?ticketId=${encodeURIComponent(ticketId)}&token=${encodeURIComponent(token)}`;

console.log('='.repeat(60));
console.log('WebSocket Connection Test');
console.log('='.repeat(60));
console.log(`Environment: ${environment}`);
console.log(`URL: ${wsUrl}`);
console.log(`Ticket ID: ${ticketId}`);
console.log(`Token: ${token.substring(0, 20)}...`);
console.log('='.repeat(60));
console.log('');

const ws = new WebSocket(wsUrl);

let messageCount = 0;
let pongCount = 0;

ws.on('open', () => {
  console.log('✅ WebSocket connection opened');
  console.log('');

  // Send a ping message
  setTimeout(() => {
    console.log('📤 Sending ping...');
    ws.send(JSON.stringify({ type: 'ping' }));
  }, 1000);

  // Send a test message
  setTimeout(() => {
    console.log('📤 Sending test message...');
    ws.send(JSON.stringify({
      type: 'message',
      content: 'Hello from WebSocket test!',
    }));
  }, 2000);

  // Send typing indicator
  setTimeout(() => {
    console.log('📤 Sending typing indicator...');
    ws.send(JSON.stringify({
      type: 'typing',
      isTyping: true,
    }));
  }, 3000);

  // Stop typing
  setTimeout(() => {
    console.log('📤 Stopping typing indicator...');
    ws.send(JSON.stringify({
      type: 'typing',
      isTyping: false,
    }));
  }, 4000);

  // Test rate limiting (send many messages quickly)
  setTimeout(() => {
    console.log('📤 Testing rate limiting (sending 5 messages quickly)...');
    for (let i = 0; i < 5; i++) {
      ws.send(JSON.stringify({
        type: 'message',
        content: `Rate limit test message ${i + 1}`,
      }));
    }
  }, 5000);

  // Close connection after test
  setTimeout(() => {
    console.log('');
    console.log('📤 Closing connection...');
    ws.close();
  }, 8000);
});

ws.on('message', (data) => {
  messageCount++;
  try {
    const message = JSON.parse(data.toString());
    console.log(`📥 Received message #${messageCount}:`, JSON.stringify(message, null, 2));
    
    if (message.type === 'pong') {
      pongCount++;
      console.log('   ✅ Pong received');
    } else if (message.type === 'connected') {
      console.log('   ✅ Connection confirmed');
      console.log(`   Connection ID: ${message.connectionId}`);
    } else if (message.type === 'error') {
      console.log('   ⚠️  Error:', message.message);
      if (message.code === 'RATE_LIMIT_EXCEEDED') {
        console.log(`   Rate limit reset at: ${message.resetAt}`);
      }
    }
    console.log('');
  } catch (error) {
    console.log(`📥 Received raw message #${messageCount}:`, data.toString());
    console.log('');
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  if (error.message.includes('401')) {
    console.error('   Authentication failed. Check your token.');
  } else if (error.message.includes('429')) {
    console.error('   Rate limit or connection limit exceeded.');
  }
});

ws.on('close', (code, reason) => {
  console.log('='.repeat(60));
  console.log('Connection Summary');
  console.log('='.repeat(60));
  console.log(`Close code: ${code}`);
  console.log(`Close reason: ${reason.toString()}`);
  console.log(`Total messages received: ${messageCount}`);
  console.log(`Pong responses: ${pongCount}`);
  console.log('='.repeat(60));
  process.exit(0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test interrupted by user');
  ws.close();
  process.exit(0);
});

