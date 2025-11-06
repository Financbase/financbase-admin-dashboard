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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRequestLeave, useLeaveTypes, useLeaveBalances } from "@/hooks/hr/use-leave";
import { requestLeaveSchema } from "@/lib/validation-schemas";
import { useEffect } from "react";

type LeaveRequestFormValues = z.infer<typeof requestLeaveSchema>;

interface LeaveRequestFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employeeId: string;
	organizationId: string;
	onSuccess?: () => void;
}

export function LeaveRequestForm({
	open,
	onOpenChange,
	employeeId,
	organizationId,
	onSuccess,
}: LeaveRequestFormProps) {
	const requestMutation = useRequestLeave();
	const { data: leaveTypes = [] } = useLeaveTypes();
	const { data: balances = [] } = useLeaveBalances(employeeId);

	const form = useForm<LeaveRequestFormValues>({
		resolver: zodResolver(requestLeaveSchema),
		defaultValues: {
			employeeId: employeeId,
			organizationId: organizationId,
			leaveTypeId: "",
			startDate: new Date().toISOString(),
			endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
			duration: "8",
			durationUnit: "hours",
			reason: "",
			notes: "",
		},
	});

	const selectedLeaveType = form.watch("leaveTypeId");
	const selectedBalance = balances.find((b) => b.leaveTypeId === selectedLeaveType);

	useEffect(() => {
		if (selectedLeaveType && selectedBalance) {
			form.setValue("duration", selectedBalance.currentBalance);
		}
	}, [selectedLeaveType, selectedBalance, form]);

	const calculateDuration = () => {
		const startDate = form.watch("startDate");
		const endDate = form.watch("endDate");
		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			const diffTime = Math.abs(end.getTime() - start.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			const hours = diffDays * 8; // Assuming 8 hours per day
			form.setValue("duration", hours.toString());
		}
	};

	useEffect(() => {
		calculateDuration();
	}, [form.watch("startDate"), form.watch("endDate")]);

	const onSubmit = async (data: LeaveRequestFormValues) => {
		await requestMutation.mutateAsync(data);
		onOpenChange(false);
		form.reset();
		onSuccess?.();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Request Leave</DialogTitle>
					<DialogDescription>Submit a new leave request</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="leaveTypeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Leave Type *</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select leave type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{leaveTypes.map((type) => {
												const balance = balances.find((b) => b.leaveTypeId === type.id);
												return (
													<SelectItem key={type.id} value={type.id}>
														{type.name}
														{balance && ` (${balance.currentBalance} ${form.watch("durationUnit")} available)`}
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Date *</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
												onChange={(e) => {
													field.onChange(new Date(e.target.value).toISOString());
													calculateDuration();
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Date *</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
												onChange={(e) => {
													field.onChange(new Date(e.target.value).toISOString());
													calculateDuration();
												}}
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
								name="duration"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Duration *</FormLabel>
										<FormControl>
											<Input type="number" step="0.5" placeholder="8" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="durationUnit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Unit *</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select unit" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="hours">Hours</SelectItem>
												<SelectItem value="days">Days</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Reason</FormLabel>
									<FormControl>
										<Textarea placeholder="Reason for leave request..." {...field} />
									</FormControl>
									<FormMessage />
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

						{selectedBalance && (
							<div className="p-4 bg-muted rounded-lg">
								<p className="text-sm">
									Available balance: <strong>{selectedBalance.currentBalance}</strong>{" "}
									{form.watch("durationUnit")}
								</p>
							</div>
						)}

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={requestMutation.isPending}>
								{requestMutation.isPending ? "Submitting..." : "Submit Request"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

