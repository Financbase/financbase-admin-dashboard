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
import { useCreatePayrollRun, type PayrollRun } from "@/hooks/hr/use-payroll";
import { createPayrollRunSchema } from "@/lib/validation-schemas";

type PayrollRunFormValues = z.infer<typeof createPayrollRunSchema>;

interface PayrollRunFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	onSuccess?: () => void;
}

export function PayrollRunForm({
	open,
	onOpenChange,
	organizationId,
	onSuccess,
}: PayrollRunFormProps) {
	const createMutation = useCreatePayrollRun();

	const form = useForm<PayrollRunFormValues>({
		resolver: zodResolver(createPayrollRunSchema),
		defaultValues: {
			organizationId: organizationId,
			payPeriodStart: new Date().toISOString(),
			payPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Default to 2 weeks
			payDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
			payFrequency: "biweekly",
			notes: "",
		},
	});

	const onSubmit = async (data: PayrollRunFormValues) => {
		await createMutation.mutateAsync(data);
		onOpenChange(false);
		form.reset();
		onSuccess?.();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Create Payroll Run</DialogTitle>
					<DialogDescription>Create a new payroll run for processing</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="payFrequency"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Pay Frequency *</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select frequency" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="weekly">Weekly</SelectItem>
											<SelectItem value="biweekly">Biweekly</SelectItem>
											<SelectItem value="semimonthly">Semi-Monthly</SelectItem>
											<SelectItem value="monthly">Monthly</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="payPeriodStart"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pay Period Start *</FormLabel>
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
								name="payPeriodEnd"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pay Period End *</FormLabel>
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
						</div>

						<FormField
							control={form.control}
							name="payDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Pay Date *</FormLabel>
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
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea placeholder="Additional notes for this payroll run..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Creating..." : "Create Payroll Run"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

