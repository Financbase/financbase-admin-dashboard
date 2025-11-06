/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils"; // Assuming you have a `cn` utility
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	BarChart3,
	CheckCircle,
	Key,
	Loader2,
	MessageCircle,
	ThumbsDown,
	ThumbsUp,
	X,
	XCircle,
} from "lucide-react";
// components/ui/feedback-widget.tsx
import * as React from "react";
import { useState } from "react";

// Props interface for component reusability
export interface FeedbackWidgetProps {
	/** The title displayed at the top of the widget. */
	title?: string;
	/** Placeholder text for the comment textarea. */
	placeholder?: string;
	/** Function to handle the submission of feedback data. */
	onSubmit?: (feedback: {
		rating: "helpful" | "not-helpful";
		comment: string;
	}) => Promise<void>;
	/** Function to handle closing the widget. Required for widget variant, optional for inline. */
	onClose?: () => void;
	/** Text for the submit button. */
	submitText?: string;
	/** Text for the cancel button. */
	cancelText?: string;
	/** Optional category for the feedback */
	category?: string;
	/** Whether to show as a standalone widget or inline component */
	variant?: "widget" | "inline";
	/** Custom CSS classes */
	className?: string;
}

export const FeedbackWidget = ({
	title = "Help us improve",
	placeholder = "Your feedback...",
	submitText = "Submit",
	cancelText = "Cancel",
	onSubmit,
	onClose,
	category,
	variant = "widget",
	className,
}: FeedbackWidgetProps) => {
	const [rating, setRating] = useState<"helpful" | "not-helpful" | null>(null);
	const [comment, setComment] = useState("");
	const { submitFeedback, isSubmitting, error } = useFeedback();

	// Handle rating selection
	const handleRatingClick = (selectedRating: "helpful" | "not-helpful") => {
		setRating((currentRating) =>
			currentRating === selectedRating ? null : selectedRating,
		);
	};

	// Handle form submission
	const handleSubmit = async () => {
		if (!rating) return;

		const feedbackData: any = {
			rating,
			comment: comment.trim(),
		};

		if (category) {
			feedbackData.category = category;
		}

		const success = await submitFeedback(feedbackData);

		if (success) {
			// Reset form
			setRating(null);
			setComment("");

			// Call custom onSubmit if provided (for backward compatibility)
			if (onSubmit) {
				try {
					await onSubmit({ rating, comment: comment.trim() });
				} catch (err) {
					console.error("Custom onSubmit error:", err);
				}
			}

			// Close widget after successful submission (only for widget variant)
			if (variant === "widget" && onClose) {
				onClose();
			}
		}
	};

	const cardVariants = {
		hidden: { opacity: 0, y: 50, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: "spring", duration: 0.6, bounce: 0.4 },
		},
		exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
	};

	const textAreaVariants = {
		hidden: { opacity: 0, height: 0, marginTop: 0 },
		visible: {
			opacity: 1,
			height: "auto",
			marginTop: "1rem",
			transition: { duration: 0.3 },
		},
		exit: {
			opacity: 0,
			height: 0,
			marginTop: 0,
			transition: { duration: 0.3 },
		},
	};

	const widgetContent = (
		<>
			<CardHeader className="flex flex-row items-center justify-between p-4">
				<CardTitle className="text-lg font-semibold">{title}</CardTitle>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					aria-label="Close feedback widget"
				>
					<X className="h-4 w-4" />
				</Button>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				{/* Error message */}
				{error && (
					<div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						<AlertCircle className="h-4 w-4 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				<div className="grid grid-cols-2 gap-2">
					<Button
						variant={rating === "helpful" ? "default" : "outline"}
						onClick={() => handleRatingClick("helpful")}
						disabled={isSubmitting}
						aria-pressed={rating === "helpful"}
					>
						<ThumbsUp className="mr-2 h-4 w-4" />
						Helpful
					</Button>
					<Button
						variant={rating === "not-helpful" ? "default" : "outline"}
						onClick={() => handleRatingClick("not-helpful")}
						disabled={isSubmitting}
						aria-pressed={rating === "not-helpful"}
					>
						<ThumbsDown className="mr-2 h-4 w-4" />
						Not helpful
					</Button>
				</div>

				<AnimatePresence>
					{rating && (
						<motion.div
							key="textarea"
							variants={textAreaVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="overflow-hidden"
						>
							<Textarea
								placeholder={placeholder}
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								disabled={isSubmitting}
								className="mt-4"
								rows={3}
								aria-label="Feedback comment"
								maxLength={1000}
							/>
							<div className="mt-1 text-xs text-muted-foreground text-right">
								{comment.length}/1000
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="mt-4 flex justify-end gap-2">
					<Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
						{cancelText}
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!rating || isSubmitting || comment.length > 1000}
						className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500/90 dark:bg-yellow-500 dark:text-yellow-950 dark:hover:bg-yellow-500/90"
					>
						{isSubmitting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : null}
						{submitText}
					</Button>
				</div>
			</CardContent>
		</>
	);

	if (variant === "inline") {
		return (
			<div className={cn("w-full max-w-md", className)}>
				<Card className="shadow-lg">{widgetContent}</Card>
			</div>
		);
	}

	return (
		<motion.div
			variants={cardVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className={cn(
				"fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm",
				className,
			)}
			aria-live="polite"
		>
			<Card className="shadow-2xl">{widgetContent}</Card>
		</motion.div>
	);
};
