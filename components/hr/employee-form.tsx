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
	FormDescription,
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
import { useCreateEmployee, useUpdateEmployee, type Employee } from "@/hooks/hr/use-employees";
import { useUser } from "@clerk/nextjs";

const employeeFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Valid email is required"),
	phone: z.string().optional(),
	position: z.string().min(1, "Position is required"),
	department: z.string().min(1, "Department is required"),
	managerId: z.string().uuid().optional(),
	employeeNumber: z.string().optional(),
	salary: z.string().optional(),
	currency: z.string().default("USD"),
	payFrequency: z.enum(["hourly", "weekly", "biweekly", "monthly", "annual"]).optional(),
	startDate: z.string().datetime("Valid start date is required"),
	endDate: z.string().datetime().optional(),
	status: z.enum(["active", "inactive", "terminated", "on_leave"]).default("active"),
	location: z.string().optional(),
	timezone: z.string().default("UTC"),
	notes: z.string().optional(),
	isPayrollEnabled: z.boolean().default(true),
	isAttendanceTracked: z.boolean().default(true),
	attendanceMethod: z.enum(["clock", "manual", "hybrid"]).default("clock"),
	defaultWorkHours: z.string().default("8"),
	overtimeThreshold: z.string().default("40"),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee?: Employee;
	organizationId?: string;
	onSuccess?: () => void;
}

export function EmployeeForm({
	open,
	onOpenChange,
	employee,
	organizationId,
	onSuccess,
}: EmployeeFormProps) {
	const { user } = useUser();
	const createMutation = useCreateEmployee();
	const updateMutation = useUpdateEmployee();

	const form = useForm<EmployeeFormValues>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues: {
			firstName: employee?.firstName || "",
			lastName: employee?.lastName || "",
			email: employee?.email || "",
			phone: employee?.phone || "",
			position: employee?.position || "",
			department: employee?.department || "",
			managerId: employee?.managerId || undefined,
			employeeNumber: employee?.employeeNumber || "",
			salary: employee?.salary || "",
			currency: employee?.currency || "USD",
			payFrequency: employee?.payFrequency || "monthly",
			startDate: employee?.startDate ? new Date(employee.startDate).toISOString() : new Date().toISOString(),
			endDate: employee?.endDate ? new Date(employee.endDate).toISOString() : undefined,
			status: employee?.status || "active",
			location: employee?.location || "",
			timezone: employee?.timezone || "UTC",
			notes: employee?.notes || "",
			isPayrollEnabled: employee?.isPayrollEnabled ?? true,
			isAttendanceTracked: employee?.isAttendanceTracked ?? true,
			attendanceMethod: employee?.attendanceMethod || "clock",
			defaultWorkHours: employee?.defaultWorkHours || "8",
			overtimeThreshold: employee?.overtimeThreshold || "40",
		},
	});

	const onSubmit = async (data: EmployeeFormValues) => {
		if (employee) {
			await updateMutation.mutateAsync({
				id: employee.id,
				...data,
			});
		} else {
			await createMutation.mutateAsync({
				...data,
				userId: user?.id || "",
				organizationId: organizationId || "",
			});
		}
		onOpenChange(false);
		form.reset();
		onSuccess?.();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
					<DialogDescription>
						{employee ? "Update employee information" : "Add a new employee to the system"}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name *</FormLabel>
										<FormControl>
											<Input placeholder="John" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name *</FormLabel>
										<FormControl>
											<Input placeholder="Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email *</FormLabel>
										<FormControl>
											<Input type="email" placeholder="john.doe@company.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="position"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Position *</FormLabel>
										<FormControl>
											<Input placeholder="Software Engineer" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="department"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Department *</FormLabel>
										<FormControl>
											<Input placeholder="Engineering" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="salary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Salary</FormLabel>
										<FormControl>
											<Input type="number" placeholder="75000" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="payFrequency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pay Frequency</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select frequency" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="hourly">Hourly</SelectItem>
												<SelectItem value="weekly">Weekly</SelectItem>
												<SelectItem value="biweekly">Biweekly</SelectItem>
												<SelectItem value="monthly">Monthly</SelectItem>
												<SelectItem value="annual">Annual</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Currency</FormLabel>
										<FormControl>
											<Input placeholder="USD" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

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
												onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="active">Active</SelectItem>
												<SelectItem value="inactive">Inactive</SelectItem>
												<SelectItem value="terminated">Terminated</SelectItem>
												<SelectItem value="on_leave">On Leave</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="isAttendanceTracked"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel>Track Attendance</FormLabel>
											<FormDescription>Enable attendance tracking for this employee</FormDescription>
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
								name="attendanceMethod"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Attendance Method</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select method" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="clock">Clock In/Out</SelectItem>
												<SelectItem value="manual">Manual Entry</SelectItem>
												<SelectItem value="hybrid">Hybrid</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="defaultWorkHours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Default Work Hours/Day</FormLabel>
										<FormControl>
											<Input type="number" step="0.5" placeholder="8" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

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
									: employee
										? "Update Employee"
										: "Create Employee"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

