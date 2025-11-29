/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { EmailClientCard } from "@/components/core/ui/layout/email-client-card";
import { Heart, ThumbsUp, Zap, Flame, Star, Send, Trash } from "lucide-react";
import React from "react";
import { logger } from '@/lib/logger';

const EmailClientCardDemo = () => {
	// Sample data to populate the component
	const emailData = {
		avatarSrc:
			"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
		avatarFallback: "SL",
		senderName: "Samantha Lusan",
		senderEmail: "samantha@icloud.com",
		timestamp: "Yesterday, 10:12 am",
		message:
			"Yes, they've introduced new APIs for smoother and more dynamic animations. The enhancements to the core animation framework will make it easier to create more engaging user experiences.",
		reactions: [
			<Star className="h-4 w-4" key="star" />,
			<Heart className="h-4 w-4" key="heart" />,
			<Flame className="h-4 w-4" key="flame" />,
			<Zap className="h-4 w-4" key="zap" />,
			<ThumbsUp className="h-4 w-4" key="thumbsup" />,
		],
	};

	const handleReaction = (reaction: React.ReactNode, index: number) => {
		logger.info(`Reacted with reaction at index: ${index}`);
		// Add logic to handle the reaction
	};

	const handleAction = (index: number) => {
		const action = ["Send", "Delete"][index];
		logger.info(`Action clicked: ${action}`);
		// Add logic for actions
	};

	return (
		<div className="flex items-center justify-center h-full w-full p-4 bg-background">
			<EmailClientCard
				avatarSrc={emailData.avatarSrc}
				avatarFallback={emailData.avatarFallback}
				senderName={emailData.senderName}
				senderEmail={emailData.senderEmail}
				timestamp={emailData.timestamp}
				message={emailData.message}
				reactions={emailData.reactions}
				onReactionClick={handleReaction}
				onActionClick={handleAction}
				actions={[
					<Send key="send" className="w-4 h-4" />,
					<Trash key="trash" className="w-4 h-4" />,
				]}
			/>
		</div>
	);
};

export default EmailClientCardDemo;
