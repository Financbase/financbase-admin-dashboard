/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverBody,
	PopoverContent,
	PopoverDescription,
	PopoverFooter,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useShare } from "@/hooks/use-share";
import {
	AlertCircle,
	BarChart3,
	CheckCircle,
	Copy,
	FileText,
	Key,
	Mail,
	MessageCircle,
	MessageSquare,
	Share2,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface SharePopoverDemoProps {
	// Example item data - in real usage, this would come from props or context
	itemData?: {
		id: string;
		title: string;
		description?: string;
		type: string;
	};
	trigger?: React.ReactNode; // Custom trigger element
}

/**
 * SharePopoverDemo - A popover component for sharing content
 *
 * @param itemData - The item data to share
 * @param trigger - Custom trigger element (optional, defaults to Share button)
 */
export default function SharePopoverDemo({
	itemData,
	trigger,
}: SharePopoverDemoProps = {}) {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

	// Use the share hook for functionality
	const { share, isLoading, error, reset } = useShare();

	// Default demo data if no item data provided
	const defaultItemData = itemData || {
		id: "demo-item-1",
		title: "Sample Dashboard Report",
		description:
			"A comprehensive analytics report showing key metrics and trends.",
		type: "report",
	};

	const handleCopyLink = async () => {
		try {
			// Create a shared item
			await share({
				itemType: defaultItemData.type,
				itemId: defaultItemData.id,
				title: defaultItemData.title,
				description: defaultItemData.description || "",
				url: `${window.location.origin}/demo/popover`,
				isPublic: true,
			});

			// Copy the link to the actual shared item page
			const url = `${window.location.origin}/shared/demo-${defaultItemData.id}`;
			const success = await navigator.clipboard.writeText(url);

			if (success !== undefined) {
				toast.success("Link copied to clipboard!");
			} else {
				toast.error("Failed to copy link");
			}
		} catch (err) {
			toast.error("Failed to share item");
			logger.error("Share error:", err);
		}
	};

	const handleEmailShare = async () => {
		if (!email.trim()) {
			toast.error("Please enter an email address");
			return;
		}

		try {
			// Create shared item
			await share({
				itemType: defaultItemData.type,
				itemId: defaultItemData.id,
				title: defaultItemData.title,
				description: defaultItemData.description || "",
				url: `${window.location.origin}/demo/popover`,
				isPublic: true,
			});

			// For demo purposes, just show success
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success("Email sent successfully!");
			setEmail("");
			setMessage("");
			setIsEmailDialogOpen(false);
		} catch (err) {
			toast.error("Failed to send email");
			logger.error("Email share error:", err);
		}
	};

	const handleMessageShare = async () => {
		try {
			// Create shared item
			await share({
				itemType: defaultItemData.type,
				itemId: defaultItemData.id,
				title: defaultItemData.title,
				description: defaultItemData.description || "",
				url: `${window.location.origin}/demo/popover`,
				isPublic: true,
			});

			// For demo purposes, just show success
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success("Message sent successfully!");
		} catch (err) {
			toast.error("Failed to send message");
			logger.error("Message share error:", err);
		}
	};

	const shareOptions = [
		{
			name: "Copy Link",
			icon: Copy,
			action: handleCopyLink,
			description: "Copy a shareable link to clipboard",
		},
		{
			name: "Email",
			icon: Mail,
			action: () => setIsEmailDialogOpen(true),
			description: "Send via email",
		},
		{
			name: "Message",
			icon: MessageSquare,
			action: handleMessageShare,
			description: "Share via messaging apps",
		},
	];

	// Default trigger if none provided
	const defaultTrigger = (
		<Button variant="outline" size="sm" disabled={isLoading}>
			<Share2 className="mr-2 h-4 w-4" />
			Share
			{isLoading && <span className="ml-2">...</span>}
		</Button>
	);

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
				<PopoverContent className="w-80">
					<PopoverHeader>
						<PopoverTitle>Share this item</PopoverTitle>
						<PopoverDescription>
							Choose how you want to share: {defaultItemData.title}
						</PopoverDescription>
					</PopoverHeader>
					<PopoverBody className="space-y-2 px-2 py-1">
						{shareOptions.map((option) => (
							<Button
								key={option.name}
								variant="ghost"
								className="w-full justify-start h-auto p-3"
								size="sm"
								onClick={option.action}
								disabled={isLoading}
							>
								<div className="flex items-start space-x-3 w-full">
									<option.icon className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
									<div className="text-left">
										<div className="font-medium">{option.name}</div>
										<div className="text-xs text-muted-foreground">
											{option.description}
										</div>
									</div>
								</div>
							</Button>
						))}
					</PopoverBody>
					<PopoverFooter className="py-3">
						<div className="flex items-center space-x-2 text-xs text-muted-foreground">
							{error ? (
								<>
									<AlertCircle className="h-3 w-3 text-destructive" />
									<span className="text-destructive">{error.message || String(error)}</span>
								</>
							) : (
								<>
									<CheckCircle className="h-3 w-3 text-green-500" />
									<span>Ready to share</span>
								</>
							)}
						</div>
					</PopoverFooter>
				</PopoverContent>
			</Popover>

			{/* Email Share Dialog */}
			{isEmailDialogOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<div className="bg-background rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-semibold mb-4">Share via Email</h3>
						<div className="space-y-4">
							<div>
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="recipient@example.com"
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="message">Message (Optional)</Label>
								<Input
									id="message"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Add a personal message..."
									className="mt-1"
								/>
							</div>
						</div>
						<div className="flex justify-end space-x-2 mt-6">
							<Button
								variant="outline"
								onClick={() => {
									setIsEmailDialogOpen(false);
									setEmail("");
									setMessage("");
									reset();
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={handleEmailShare}
								disabled={!email.trim() || isLoading}
							>
								{isLoading ? "Sending..." : "Send Email"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
