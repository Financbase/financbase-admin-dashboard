/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { AudioRecorder } from "@/components/ui/audio-recorder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface TimeEntry {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	duration: number; // in minutes
	description: string;
	taskName: string;
	isBreak?: boolean;
	audioRecording?: {
		audioUrl: string;
		duration: number;
		transcript?: string;
	};
}

interface TimesheetEntryFormProps {
	projectId: string;
	clientName: string;
	onSubmit: (entries: TimeEntry[]) => void;
	onCancel?: () => void;
	initialEntries?: TimeEntry[];
	className?: string;
}

export const TimesheetEntryForm: React.FC<TimesheetEntryFormProps> = ({
	projectId,
	clientName,
	onSubmit,
	onCancel,
	initialEntries = [],
	className,
}) => {
	const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Add a new time entry
	const addEntry = () => {
		const newEntry: TimeEntry = {
			id: `entry-${Date.now()}`,
			date: new Date().toISOString().split("T")[0],
			startTime: "",
			endTime: "",
			duration: 0,
			description: "",
			taskName: "",
			isBreak: false,
		};
		setEntries([...entries, newEntry]);
	};

	// Remove a time entry
	const removeEntry = (id: string) => {
		setEntries(entries.filter((entry) => entry.id !== id));
	};

	// Update a time entry
	const updateEntry = (id: string, updates: Partial<TimeEntry>) => {
		setEntries(
			entries.map((entry) =>
				entry.id === id ? { ...entry, ...updates } : entry,
			),
		);
	};

	// Calculate duration from start and end times
	const calculateDuration = (startTime: string, endTime: string): number => {
		if (!startTime || !endTime) return 0;

		const start = new Date(`2000-01-01T${startTime}`);
		const end = new Date(`2000-01-01T${endTime}`);

		if (end < start) {
			// Handle overnight entries
			end.setDate(end.getDate() + 1);
		}

		const diffMs = end.getTime() - start.getTime();
		return Math.round(diffMs / (1000 * 60)); // Convert to minutes
	};

	// Handle time input changes
	const handleTimeChange = (
		id: string,
		field: "startTime" | "endTime",
		value: string,
	) => {
		updateEntry(id, { [field]: value });

		// Recalculate duration if both times are set
		const entry = entries.find((e) => e.id === id);
		if (entry) {
			const startTime = field === "startTime" ? value : entry.startTime;
			const endTime = field === "endTime" ? value : entry.endTime;

			if (startTime && endTime) {
				const duration = calculateDuration(startTime, endTime);
				updateEntry(id, { duration });
			}
		}
	};

	// Handle audio recording completion
	const handleRecordingComplete = (entryId: string, audioData: any) => {
		updateEntry(entryId, {
			audioRecording: audioData,
		});
	};

	// Validate form
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		entries.forEach((entry) => {
			if (!entry.taskName.trim()) {
				newErrors[`${entry.id}-taskName`] = "Task name is required";
			}
			if (!entry.startTime) {
				newErrors[`${entry.id}-startTime`] = "Start time is required";
			}
			if (!entry.endTime) {
				newErrors[`${entry.id}-endTime`] = "End time is required";
			}
			if (
				entry.startTime &&
				entry.endTime &&
				entry.startTime >= entry.endTime
			) {
				newErrors[`${entry.id}-endTime`] = "End time must be after start time";
			}
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Submit form
	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsSubmitting(true);
		try {
			await onSubmit(entries);
		} catch (error) {
			console.error("Error submitting timesheet:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Calculate total hours
	const totalMinutes = entries.reduce(
		(total, entry) => total + entry.duration,
		0,
	);
	const totalHours = Math.floor(totalMinutes / 60);
	const totalMinutesRemainder = totalMinutes % 60;

	return (
		<Card className={cn("w-full max-w-4xl", className)}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Time Entry - {clientName}</span>
					<Badge variant="outline">
						<Clock className="mr-1 h-3 w-3" />
						{totalHours}h {totalMinutesRemainder}m
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Time Entries */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Time Entries</h3>
						<Button onClick={addEntry} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Entry
						</Button>
					</div>

					{entries.map((entry, index) => (
						<Card key={entry.id} className="relative">
							<CardContent className="p-4 space-y-4">
								{/* Entry Header */}
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<span className="text-sm font-medium">
											Entry {index + 1}
										</span>
										{entry.isBreak && (
											<Badge variant="outline" className="text-xs">
												Break
											</Badge>
										)}
									</div>
									<Button
										onClick={() => removeEntry(entry.id)}
										variant="ghost"
										size="sm"
										className="text-red-500 hover:text-red-700"
									>
										<Minus className="h-4 w-4" />
									</Button>
								</div>

								{/* Task and Description */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor={`task-${entry.id}`}>Task Name *</Label>
										<Input
											id={`task-${entry.id}`}
											value={entry.taskName}
											onChange={(e) =>
												updateEntry(entry.id, { taskName: e.target.value })
											}
											placeholder="Enter task name"
											className={
												errors[`${entry.id}-taskName`] ? "border-red-500" : ""
											}
										/>
										{errors[`${entry.id}-taskName`] && (
											<p className="text-sm text-red-500">
												{errors[`${entry.id}-taskName`]}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor={`date-${entry.id}`}>Date *</Label>
										<Input
											id={`date-${entry.id}`}
											type="date"
											value={entry.date}
											onChange={(e) =>
												updateEntry(entry.id, { date: e.target.value })
											}
										/>
									</div>
								</div>

								{/* Time Inputs */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor={`start-${entry.id}`}>Start Time *</Label>
										<Input
											id={`start-${entry.id}`}
											type="time"
											value={entry.startTime}
											onChange={(e) =>
												handleTimeChange(entry.id, "startTime", e.target.value)
											}
											className={
												errors[`${entry.id}-startTime`] ? "border-red-500" : ""
											}
										/>
										{errors[`${entry.id}-startTime`] && (
											<p className="text-sm text-red-500">
												{errors[`${entry.id}-startTime`]}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor={`end-${entry.id}`}>End Time *</Label>
										<Input
											id={`end-${entry.id}`}
											type="time"
											value={entry.endTime}
											onChange={(e) =>
												handleTimeChange(entry.id, "endTime", e.target.value)
											}
											className={
												errors[`${entry.id}-endTime`] ? "border-red-500" : ""
											}
										/>
										{errors[`${entry.id}-endTime`] && (
											<p className="text-sm text-red-500">
												{errors[`${entry.id}-endTime`]}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label>Duration</Label>
										<div className="flex items-center space-x-2">
											<Input
												value={`${Math.floor(entry.duration / 60)}:${(
													entry.duration % 60
												)
													.toString()
													.padStart(2, "0")}`}
												readOnly
												className="bg-gray-50"
											/>
											<span className="text-sm text-gray-500">hours</span>
										</div>
									</div>
								</div>

								{/* Description */}
								<div className="space-y-2">
									<Label htmlFor={`description-${entry.id}`}>Description</Label>
									<Textarea
										id={`description-${entry.id}`}
										value={entry.description}
										onChange={(e) =>
											updateEntry(entry.id, { description: e.target.value })
										}
										placeholder="Describe what you worked on..."
										rows={3}
									/>
								</div>

								{/* Audio Recording */}
								<div className="space-y-2">
									<Label>Voice Notes (Optional)</Label>
									<AudioRecorder
										timesheetEntryId={entry.id}
										onRecordingComplete={(audioData) =>
											handleRecordingComplete(entry.id, audioData)
										}
										maxDuration={300} // 5 minutes
									/>
								</div>

								{/* Audio Recording Display */}
								{entry.audioRecording && (
									<div className="p-3 bg-green-50 rounded-md border border-green-200">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<Mic className="h-4 w-4 text-green-600" />
												<span className="text-sm text-green-800">
													Voice note recorded (
													{Math.floor(entry.audioRecording.duration / 60)}:
													{(entry.audioRecording.duration % 60)
														.toString()
														.padStart(2, "0")}
													)
												</span>
											</div>
											<Button size="sm" variant="outline">
												<Play className="mr-1 h-3 w-3" />
												Play
											</Button>
										</div>
										{entry.audioRecording.transcript && (
											<p className="text-xs text-green-700 mt-2">
												Transcript: {entry.audioRecording.transcript}
											</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>

				{/* Form Actions */}
				<div className="flex justify-end space-x-2 pt-4 border-t">
					{onCancel && (
						<Button onClick={onCancel} variant="outline">
							Cancel
						</Button>
					)}
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || entries.length === 0}
					>
						<Save className="mr-2 h-4 w-4" />
						{isSubmitting ? "Saving..." : "Save Timesheet"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
