"use client";

import { AudioPlayback } from "@/components/ui/audio-playback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	CheckCircle2,
	Clock,
	CreditCard,
	Key,
	Mic,
	Play,
	X,
} from "lucide-react";
import React, { useState } from "react";

interface TimeEntry {
	date: string;
	duration: string;
	description?: string;
	audioRecording?: {
		audioUrl: string;
		duration: number;
		transcript?: string;
	};
}

interface FinancialDetail {
	label: string;
	value: number;
	isCommission?: boolean;
}

interface TimesheetConfirmationProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit?: () => void;
	clientName: string;
	taskName: string;
	timeEntries: TimeEntry[];
	financials: FinancialDetail[];
	totalHours: string;
	takeHomeAmount: number;
	isSubmitting?: boolean;
	className?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export function TimesheetConfirmation({
	isOpen,
	onClose,
	onSubmit,
	clientName,
	taskName,
	timeEntries = [],
	financials = [],
	totalHours,
	takeHomeAmount,
	isSubmitting = false,
	className,
}: TimesheetConfirmationProps) {
	const [expandedAudio, setExpandedAudio] = useState<string | null>(null);

	const handleSubmit = () => {
		if (onSubmit) {
			onSubmit();
		} else {
			onClose();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
					onClick={onClose}
				>
					<motion.div
						initial={{ scale: 0.95, y: 20, opacity: 0 }}
						animate={{ scale: 1, y: 0, opacity: 1 }}
						exit={{ scale: 0.95, y: 20, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className={cn(
							"relative m-4 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg",
							className,
						)}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="grid grid-cols-1 lg:grid-cols-2 h-full">
							{/* Left Panel: Confirmation */}
							<div className="flex flex-col items-center justify-center gap-6 p-8 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
								<motion.div
									initial={{ scale: 0 }}
									animate={{
										scale: 1,
										transition: {
											delay: 0.2,
											type: "spring",
											stiffness: 200,
											damping: 15,
										},
									}}
								>
									<CheckCircle2 className="h-20 w-20 text-green-600" />
								</motion.div>
								<div className="space-y-4">
									<h2 className="text-3xl font-bold text-green-800 dark:text-green-200">
										Timesheet Submitted!
									</h2>
									<p className="text-green-700 dark:text-green-300 max-w-md">
										Your timesheet has been submitted successfully. We'll notify
										you once it's approved and payment is processed.
									</p>

									{/* Quick Stats */}
									<div className="grid grid-cols-2 gap-4 mt-6">
										<div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
											<div className="text-2xl font-bold text-green-800">
												{totalHours}
											</div>
											<div className="text-sm text-green-600">Total Hours</div>
										</div>
										<div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
											<div className="text-2xl font-bold text-green-800">
												{currencyFormatter.format(takeHomeAmount)}
											</div>
											<div className="text-sm text-green-600">Take Home</div>
										</div>
									</div>
								</div>

								<div className="flex flex-col w-full max-w-xs gap-3">
									<Button
										onClick={handleSubmit}
										disabled={isSubmitting}
										className="bg-green-600 hover:bg-green-700"
									>
										{isSubmitting ? "Submitting..." : "Confirm Submission"}
									</Button>
									<Button onClick={onClose} variant="outline">
										Review Details
									</Button>
								</div>
							</div>

							{/* Right Panel: Detailed Summary */}
							<div className="relative p-6 overflow-y-auto bg-white dark:bg-gray-950">
								<Button
									variant="ghost"
									size="icon"
									className="absolute top-4 right-4"
									onClick={onClose}
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Close</span>
								</Button>

								<h3 className="text-2xl font-semibold mb-6">
									Timesheet Summary
								</h3>

								{/* Client & Task Details */}
								<div className="space-y-4 mb-6">
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Client</span>
										<span className="font-medium">{clientName}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Task</span>
										<span className="font-medium">{taskName}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Total Time</span>
										<span className="font-mono font-medium">{totalHours}</span>
									</div>
								</div>

								<Separator className="my-6" />

								{/* Time Entries with Audio */}
								<div className="space-y-4">
									<h4 className="font-semibold">Time Entries</h4>
									{timeEntries.map((entry, index) => (
										<motion.div
											key={index}
											className="border rounded-lg p-4 space-y-3"
											initial={{ opacity: 0, x: -10 }}
											animate={{
												opacity: 1,
												x: 0,
												transition: { delay: 0.3 + index * 0.1 },
											}}
										>
											{/* Entry Header */}
											<div className="flex justify-between items-start">
												<div className="flex items-center space-x-2">
													<Clock className="h-4 w-4 text-gray-500" />
													<span className="font-medium">{entry.date}</span>
													<Badge variant="outline" className="text-xs">
														{entry.duration}
													</Badge>
												</div>
												{entry.audioRecording && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															setExpandedAudio(
																expandedAudio === `entry-${index}`
																	? null
																	: `entry-${index}`,
															)
														}
													>
														<Mic className="h-4 w-4" />
													</Button>
												)}
											</div>

											{/* Entry Description */}
											{entry.description && (
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{entry.description}
												</p>
											)}

											{/* Audio Recording */}
											{entry.audioRecording && (
												<AnimatePresence>
													{expandedAudio === `entry-${index}` && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: "auto", opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															className="overflow-hidden"
														>
															<AudioPlayback
																audioUrl={entry.audioRecording.audioUrl}
																duration={entry.audioRecording.duration}
																transcript={entry.audioRecording.transcript}
																showTranscript={true}
																showControls={true}
																showProgress={true}
																showVolume={true}
																className="mt-3"
															/>
														</motion.div>
													)}
												</AnimatePresence>
											)}
										</motion.div>
									))}
								</div>

								<Separator className="my-6" />

								{/* Financial Summary */}
								<div className="space-y-4">
									<h4 className="font-semibold">Financial Summary</h4>
									{financials.map((item, index) => (
										<motion.div
											key={index}
											className={`flex justify-between items-center p-3 rounded-lg ${
												item.isCommission
													? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
													: "bg-gray-50 dark:bg-gray-900"
											}`}
											initial={{ opacity: 0, x: -10 }}
											animate={{
												opacity: 1,
												x: 0,
												transition: { delay: 0.5 + index * 0.1 },
											}}
										>
											<span className="font-medium">{item.label}</span>
											<span className="font-mono">
												{item.isCommission ? "-" : ""}
												{currencyFormatter.format(item.value)}
											</span>
										</motion.div>
									))}
								</div>

								<Separator className="my-6" />

								{/* Final Amount */}
								<motion.div
									className="flex justify-between items-center text-xl font-bold"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: { delay: 0.8 } }}
								>
									<span>Take Home Amount</span>
									<span className="text-green-600">
										{currencyFormatter.format(takeHomeAmount)}
									</span>
								</motion.div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
