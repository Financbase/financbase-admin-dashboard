"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketMessage {
	type: string;
	data: any;
	timestamp: string;
}

interface WebSocketContextType {
	isConnected: boolean;
	messages: WebSocketMessage[];
	sendMessage: (type: string, data: any) => void;
	lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
	const context = useContext(WebSocketContext);
	if (context === undefined) {
		throw new Error('useWebSocket must be used within a WebSocketProvider');
	}
	return context;
}

interface WebSocketProviderProps {
	children: React.ReactNode;
	roomId?: string;
}

export function WebSocketProvider({ children, roomId = 'main' }: WebSocketProviderProps) {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<WebSocketMessage[]>([]);
	const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

	useEffect(() => {
		// Get PartyKit host from environment or use default
		const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';
		const protocol = host.includes('localhost') ? 'ws' : 'wss';
		const socketUrl = `${protocol}://${host}/parties/main/${roomId}`;

		console.log('Connecting to WebSocket:', socketUrl);

		const ws = new WebSocket(socketUrl);

		ws.onopen = () => {
			console.log('WebSocket connected');
			setIsConnected(true);
		};

		ws.onmessage = (event) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data);
				console.log('Received message:', message);

				setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
				setLastMessage(message);
			} catch (error) {
				console.error('Failed to parse WebSocket message:', error);
			}
		};

		ws.onclose = () => {
			console.log('WebSocket disconnected');
			setIsConnected(false);
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
			setIsConnected(false);
		};

		setSocket(ws);

		return () => {
			ws.close();
		};
	}, [roomId]);

	const sendMessage = (type: string, data: any) => {
		if (socket && isConnected) {
			const message = {
				type,
				data,
				timestamp: new Date().toISOString(),
			};

			socket.send(JSON.stringify(message));
		} else {
			console.warn('WebSocket not connected, cannot send message');
		}
	};

	const value: WebSocketContextType = {
		isConnected,
		messages,
		sendMessage,
		lastMessage,
	};

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
}
