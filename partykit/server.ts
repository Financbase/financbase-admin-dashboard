import type { PartyKitServer } from "partykit/server";

export default {
	async onConnect(connection, room) {
		// Handle new connections
		console.log(`New connection to room: ${room.id}`);

		// Send welcome message
		connection.send({
			type: 'welcome',
			message: `Connected to ${room.id}`,
			timestamp: new Date().toISOString(),
		});
	},

	async onMessage(message, connection, room) {
		// Handle incoming messages
		const data = JSON.parse(message);

		switch (data.type) {
			case 'financial_update':
				// Broadcast financial updates to all connections
				room.broadcast({
					type: 'financial_update',
					data: data.payload,
					timestamp: new Date().toISOString(),
				}, [connection.id]); // Send to all except sender
				break;

			case 'user_activity':
				// Broadcast user activity updates
				room.broadcast({
					type: 'user_activity',
					data: data.payload,
					timestamp: new Date().toISOString(),
				}, [connection.id]);
				break;

			default:
				// Echo back unknown messages
				connection.send({
					type: 'echo',
					data: data,
					timestamp: new Date().toISOString(),
				});
		}
	},

	async onClose(connection, room) {
		console.log(`Connection closed for room: ${room.id}`);
	},

	async onError(connection, error, room) {
		console.error(`Error in room ${room.id}:`, error);
	},
} satisfies PartyKitServer;
