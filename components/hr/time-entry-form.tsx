/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/core/ui/forms/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTimeEntry, useUpdateTimeEntry, type TimeEntry } from "@/hooks/hr/use-time-tracking";
import { useUser } from "@clerk/nextjs";

const timeEntryFormSchema = z.object({
	projectId: z.string().min(1, "Project ID is required"),
	description: z.string().min(1, "Description is required"),
	startTime: z.string().datetime("Valid start time is required"),
	endTime: z.string().datetime().optional(),
	duration: z.number().min(0).optional(),
	employeeId: z.string().uuid().optional(),
	contractorId: z.string().uuid().optional(),
	taskId: z.string().uuid().optional(),
	taskName: z.string().optional(),
	isBillable: z.boolean().optional(),
	hourlyRate: z.number().min(0).optional(),
	notes: z.string().optional(),
});

type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

interface TimeEntryFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	timeEntry?: TimeEntry;
	onSuccess?: () => void;
}

export function TimeEntryForm({ open, onOpenChange, timeEntry, onSuccess }: TimeEntryFormProps) {
	const { user } = useUser();
	const createMutation = useCreateTimeEntry();
	const updateMutation = useUpdateTimeEntry();

	const form = useForm<TimeEntryFormValues>({
		resolver: zodResolver(timeEntryFormSchema),
		defaultValues: {
			projectId: timeEntry?.projectId || "",
			description: timeEntry?.description || "",
			startTime: timeEntry?.startTime
				? new Date(timeEntry.startTime).toISOString().slice(0, 16)
				: new Date().toISOString().slice(0, 16),
			endTime: timeEntry?.endTime
				? new Date(timeEntry.endTime).toISOString().slice(0, 16)
				: undefined,
			duration: timeEntry?.duration ? parseFloat(timeEntry.duration) : undefined,
			employeeId: timeEntry?.employeeId || undefined,
			contractorId: timeEntry?.contractorId || undefined,
			taskId: timeEntry?.taskId || undefined,
			taskName: timeEntry?.taskName || "",
			isBillable: timeEntry?.isBillable ?? true,
			hourlyRate: timeEntry?.hourlyRate ? parseFloat(timeEntry.hourlyRate) : undefined,
			notes: timeEntry?.notes || "",
		},
	});

	const onSubmit = async (data: TimeEntryFormValues) => {
		const basePayload: Partial<TimeEntry> = {
			userId: user?.id || "",
			projectId: data.projectId,
			description: data.description,
			startTime: new Date(data.startTime).toISOString(),
			endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
			employeeId: data.employeeId,
			contractorId: data.contractorId,
			taskId: data.taskId,
			taskName: data.taskName,
			isBillable: data.isBillable,
			hourlyRate: data.hourlyRate !== undefined ? String(data.hourlyRate) : undefined,
			notes: data.notes,
		};

		if (timeEntry) {
			await updateMutation.mutateAsync({
				id: timeEntry.id,
				...basePayload,
			} as Partial<TimeEntry> & { id: string });
		} else {
			await createMutation.mutateAsync(basePayload);
		}
		onOpenChange(false);
		form.reset();
		onSuccess?.();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{timeEntry ? "Edit Time Entry" : "Log Time Entry"}</DialogTitle>
					<DialogDescription>
						{timeEntry ? "Update time entry details" : "Log a new time entry"}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="projectId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Project ID *</FormLabel>
									<FormControl>
										<Input placeholder="Project UUID" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description *</FormLabel>
									<FormControl>
										<Textarea placeholder="What did you work on?" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time *</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												value={field.value}
												onChange={(e) => field.onChange(e.target.value)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												value={field.value || ""}
												onChange={(e) => field.onChange(e.target.value || undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="taskName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Task Name</FormLabel>
										<FormControl>
											<Input placeholder="Task name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="hourlyRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hourly Rate</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												placeholder="75.00"
												{...field}
												value={field.value || ""}
												onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="isBillable"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel>Billable</FormLabel>
									</div>
									<FormControl>
										<input
											type="checkbox"
											checked={field.value}
											onChange={field.onChange}
											className="h-4 w-4"
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea placeholder="Additional notes..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
								{createMutation.isPending || updateMutation.isPending
									? "Saving..."
									: timeEntry
										? "Update Entry"
										: "Log Time"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

