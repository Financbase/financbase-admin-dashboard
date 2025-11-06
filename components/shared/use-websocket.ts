/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	Clock,
	Headphones,
	Key,
	MessageCircle,
	Server,
	Trash2,
	X,
	XCircle,
} from "lucide-react";

"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

export interface WebSocketMessage {
	type:
		| "connected"
		| "ticket_update"
		| "comment_added"
		| "typing"
		| "status_change"
		| "user_joined"
		| "user_left"
		| "error";
	ticketId?: string;
	userId?: string;
	userName?: string;
	timestamp?: number;
	data?: unknown;
	message?: string;
	updates?: unknown;
	comment?: unknown;
	oldStatus?: string;
	newStatus?: string;
	isTyping?: boolean;
	[key: string]: unknown;
}

export interface UseWebSocketOptions {
	enabled?: boolean;
	autoConnect?: boolean;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
	isConnected: boolean;
	isConnecting: boolean;
	messages: WebSocketMessage[];
	error: Error | null;
	sendMessage: (message: Omit<WebSocketMessage, "timestamp">) => void;
	clearMessages: () => void;
	reconnect: () => void;
	disconnect: () => void;
	activeUsers: Set<string>;
	typingUsers: Set<string>;
}

/**
 * React hook for WebSocket connection to Cloudflare Workers
 * Manages real-time updates for support tickets
 *
 * @param ticketId - The ticket ID to connect to
 * @param options - Configuration options
 * @returns WebSocket connection state and methods
 */
export function useWebSocket(
	ticketId: string | null,
	options: UseWebSocketOptions = {},
): UseWebSocketReturn {
	const {
		enabled = true,
		autoConnect = true,
		reconnectInterval = 3000,
		maxReconnectAttempts = 5,
	} = options;

	const { getToken, userId } = useAuth();
	const [isConnected, setIsConnected] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [messages, setMessages] = useState<WebSocketMessage[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
	const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

	const ws = useRef<WebSocket | null>(null);
	const reconnectAttempts = useRef(0);
	const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
	const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

	/**
	 * Get WebSocket URL based on environment
	 */
	const getWebSocketUrl = useCallback(
		(ticketId: string, token: string): string => {
			const isDev = process.env.NODE_ENV === "development";
			const baseUrl = isDev
				? process.env.NEXT_PUBLIC_WEBSOCKET_URL_DEV || "ws://localhost:8787"
				: process.env.NEXT_PUBLIC_CLOUDFLARE_WEBSOCKET_URL ||
					"wss://financbase-websocket.tight-queen-09af.workers.dev";

			return `${baseUrl}/ws?ticketId=${ticketId}&token=${token}`;
		},
		[],
	);

	/**
	 * Connect to WebSocket server
	 */
	const connect = useCallback(async () => {
		if (!(ticketId && enabled && autoConnect)) {
			return;
		}
		if (
			ws.current?.readyState === WebSocket.OPEN ||
			ws.current?.readyState === WebSocket.CONNECTING
		) {
			return;
		}

		setIsConnecting(true);
		setError(null);

		try {
			// Get Clerk authentication token
			const token = await getToken();
			if (!token) {
				throw new Error("No authentication token available");
			}

			const url = getWebSocketUrl(ticketId, token);

			const socket = new WebSocket(url);

			// Store reference
			ws.current = socket;

			// Handle connection open
			socket.onopen = () => {
				setIsConnected(true);
				setIsConnecting(false);
				setError(null);
				reconnectAttempts.current = 0;

				// Send authentication (note: browser WebSocket doesn't support headers)
				// We'll need to send auth in the URL or first message
				socket.send(
					JSON.stringify({
						type: "auth",
						token,
						userId,
						timestamp: Date.now(),
					}),
				);
			};

			// Handle incoming messages
			socket.onmessage = (event: MessageEvent) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);

					setMessages((prev) => [...prev, message]);

					// Handle specific message types
					switch (message.type) {
						case "connected":
							break;

						case "user_joined":
							if (message.userId) {
								setActiveUsers(
									(prev) => new Set(Array.from(prev).concat(message.userId as string)),
								);
							}
							break;

						case "user_left":
							if (message.userId) {
								const userIdToRemove = message.userId;
								setActiveUsers((prev) => {
									const next = new Set(prev);
									next.delete(userIdToRemove);
									return next;
								});
								// Clear typing indicator if user left
								setTypingUsers((prev) => {
									const next = new Set(prev);
									next.delete(userIdToRemove);
									return next;
								});
							}
							break;

						case "typing":
							if (message.userId && message.userId !== userId) {
								const typingUserId = message.userId;
								// Clear existing timeout for this user
								const existingTimeout = typingTimeouts.current.get(
									typingUserId,
								);
								if (existingTimeout) {
									clearTimeout(existingTimeout);
								}

								if (message.isTyping) {
									// Add to typing users
									setTypingUsers(
										(prev) => new Set(Array.from(prev).concat(typingUserId)),
									);

									// Auto-clear after 3 seconds
									const timeout = setTimeout(() => {
										setTypingUsers((prev) => {
											const next = new Set(prev);
											next.delete(typingUserId);
											return next;
										});
										typingTimeouts.current.delete(typingUserId);
									}, 3000);

									typingTimeouts.current.set(typingUserId, timeout);
								} else {
									// Remove from typing users
									setTypingUsers((prev) => {
										const next = new Set(prev);
										next.delete(typingUserId);
										return next;
									});
									typingTimeouts.current.delete(typingUserId);
								}
							}
							break;

						case "error": {
							setError(new Error(message.message || "WebSocket error"));
							break;
						}
					}
				} catch (error) {
					// Handle message parsing errors
					console.error('Error parsing WebSocket message:', error);
					setError(new Error('Failed to parse message from server'));
					
					// Send error acknowledgment to server if connection is still open
					if (ws.current?.readyState === WebSocket.OPEN) {
						try {
							ws.current.send(JSON.stringify({
								type: 'error',
								message: 'Failed to parse message',
								timestamp: Date.now(),
							}));
						} catch (sendError) {
							console.error('Error sending error acknowledgment:', sendError);
						}
					}
				}
			};

			// Handle connection close
			socket.onclose = (event: CloseEvent) => {
				setIsConnected(false);
				setIsConnecting(false);
				ws.current = null;

				// Attempt reconnection if not manually closed
				if (
					event.code !== 1000 &&
					reconnectAttempts.current < maxReconnectAttempts
				) {
					reconnectAttempts.current += 1;

					reconnectTimer.current = setTimeout(() => {
						connect();
					}, reconnectInterval);
				} else if (reconnectAttempts.current >= maxReconnectAttempts) {
					setError(new Error("Max reconnection attempts reached"));
				}
			};

			// Handle errors
			socket.onerror = (_event: Event) => {
				setError(new Error("WebSocket connection error"));
				setIsConnecting(false);
			};
		} catch (error) {
			setError(error as Error);
			setIsConnecting(false);
		}
	}, [
		ticketId,
		enabled,
		autoConnect,
		userId,
		getToken,
		getWebSocketUrl,
		reconnectInterval,
		maxReconnectAttempts,
	]);

	/**
	 * Disconnect from WebSocket server
	 */
	const disconnect = useCallback(() => {
		if (reconnectTimer.current) {
			clearTimeout(reconnectTimer.current);
			reconnectTimer.current = null;
		}

		if (ws.current) {
			ws.current.close(1000, "Client disconnect");
			ws.current = null;
		}

		setIsConnected(false);
		setIsConnecting(false);
		reconnectAttempts.current = 0;
	}, []);

	/**
	 * Manually reconnect
	 */
	const reconnect = useCallback(() => {
		disconnect();
		reconnectAttempts.current = 0;
		connect();
	}, [disconnect, connect]);

	/**
	 * Send message to WebSocket server
	 */
	const sendMessage = useCallback(
		(message: Omit<WebSocketMessage, "timestamp">) => {
			if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
				return;
			}

			const fullMessage = {
				...message,
				timestamp: Date.now(),
			};

			try {
				ws.current.send(JSON.stringify(fullMessage));
			} catch (error) {
				// Handle send errors (e.g., connection closed, message too large)
				console.error('Error sending WebSocket message:', error);
				setError(new Error('Failed to send message. Connection may be closed.'));
				
				// If send fails, the connection is likely closed
				// Attempt to reconnect if auto-reconnect is enabled
				if (ws.current) {
					setIsConnected(false);
					ws.current = null;
				}
			}
		},
		[],
	);

	/**
	 * Clear message history
	 */
	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	// Connect on mount and when dependencies change
	useEffect(() => {
		if (enabled && autoConnect) {
			connect();
		}

		// Cleanup on unmount
		return () => {
			disconnect();
			// Clear all typing timeouts
			for (const timeout of typingTimeouts.current.values()) {
				clearTimeout(timeout);
			}
			typingTimeouts.current.clear();
		};
	}, [enabled, autoConnect, connect, disconnect]);

	return {
		isConnected,
		isConnecting,
		messages,
		error,
		sendMessage,
		clearMessages,
		reconnect,
		disconnect,
		activeUsers,
		typingUsers,
	};
}
