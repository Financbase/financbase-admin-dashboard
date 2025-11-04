/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { VoiceChat } from "@/components/ui/chat-bubble";
import { MessageCircle } from "lucide-react";

// Mock user data for the demo with working Unsplash stock images
const mockUsers = [
	{
		id: "user-1",
		name: "Oguz",
		avatarUrl:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
		isSpeaking: true,
	},
	{
		id: "user-2",
		name: "Ashish",
		avatarUrl:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "user-3",
		name: "Mariana",
		avatarUrl:
			"https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "user-4",
		name: "MDS",
		avatarUrl:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "user-5",
		name: "Ana",
		avatarUrl:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "user-6",
		name: "Natko",
		avatarUrl:
			"https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
		isSpeaking: true,
	},
	{
		id: "user-7",
		name: "Afshin",
		avatarUrl:
			"https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "user-8",
		name: "Jane",
		avatarUrl:
			"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
	},
];

/**
 * A demo component to showcase the VoiceChat functionality.
 */
const VoiceChatDemo = () => {
	// Handler for the join action
	const handleJoinChat = () => {
		// In a real app, this would contain logic to join the voice channel
		console.log("Attempting to join the voice chat...");
		alert("Joining voice chat!");
	};

	return (
		<div className="flex h-[200px] items-start justify-center rounded-lg bg-background p-8">
			<VoiceChat users={mockUsers} onJoin={handleJoinChat} />
		</div>
	);
};

export default VoiceChatDemo;
