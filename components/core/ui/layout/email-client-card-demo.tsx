import { EmailClientCard } from "@/components/ui/email-client-card";
import { Key, MessageCircle, Plus, Send, Trash } from "lucide-react";

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
		reactions: ["😍", "❤️", "🔥", "⚡️", "👍"],
	};

	const handleReaction = (reaction: string) => {
		console.log(`Reacted with: ${reaction}`);
		// Add logic to handle the reaction
	};

	const handleAction = (index: number) => {
		const action = ["Send", "Delete"][index];
		console.log(`Action clicked: ${action}`);
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
