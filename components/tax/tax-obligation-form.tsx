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
import {
	useCreateTaxObligation,
	useUpdateTaxObligation,
	type TaxObligation,
} from "@/hooks/use-tax";
import { useUser } from "@clerk/nextjs";
import {
	createTaxObligationSchema,
	updateTaxObligationSchema,
	type CreateTaxObligationInput,
	type UpdateTaxObligationInput,
} from "@/lib/validation-schemas";
import { Loader2 } from "lucide-react";

const taxObligationTypes = [
	{ value: "federal_income", label: "Federal Income Tax" },
	{ value: "state_income", label: "State Income Tax" },
	{ value: "local_income", label: "Local Income Tax" },
	{ value: "self_employment", label: "Self-Employment Tax" },
	{ value: "sales_tax", label: "Sales Tax" },
	{ value: "property_tax", label: "Property Tax" },
	{ value: "payroll_tax", label: "Payroll Tax" },
	{ value: "other", label: "Other" },
];

const taxObligationStatuses = [
	{ value: "pending", label: "Pending" },
	{ value: "paid", label: "Paid" },
	{ value: "overdue", label: "Overdue" },
	{ value: "cancelled", label: "Cancelled" },
];

interface TaxObligationFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	obligation?: TaxObligation;
	onSuccess?: () => void;
}

export function TaxObligationForm({
	open,
	onOpenChange,
	obligation,
	onSuccess,
}: TaxObligationFormProps) {
	const { user } = useUser();
	const createMutation = useCreateTaxObligation();
	const updateMutation = useUpdateTaxObligation();

	const isEditing = !!obligation;
	const currentYear = new Date().getFullYear();

	const form = useForm<CreateTaxObligationInput>({
		resolver: zodResolver(
			isEditing ? updateTaxObligationSchema : createTaxObligationSchema
		),
		defaultValues: {
			userId: user?.id || "",
			name: obligation?.name || "",
			type: (obligation?.type as any) || "federal_income",
			amount: obligation?.amount ? parseFloat(obligation.amount) : 0,
			dueDate: obligation?.dueDate
				? new Date(obligation.dueDate).toISOString()
				: new Date().toISOString(),
			status: (obligation?.status as any) || "pending",
			quarter: obligation?.quarter || "",
			year: obligation?.year || currentYear,
			notes: obligation?.notes || "",
		},
	});

	const isLoading = createMutation.isPending || updateMutation.isPending;

	const onSubmit = async (data: CreateTaxObligationInput) => {
		try {
			if (isEditing && obligation) {
				await updateMutation.mutateAsync({
					id: obligation.id,
					...data,
				} as UpdateTaxObligationInput);
			} else {
				await createMutation.mutateAsync(data);
			}
			onOpenChange(false);
			form.reset();
			onSuccess?.();
		} catch (error) {
			// Error handling is done in the mutation hooks
			console.error("Failed to save tax obligation:", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Tax Obligation" : "Add Tax Obligation"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Update your tax obligation details"
							: "Create a new tax obligation to track"}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name *</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Federal Income Tax"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{taxObligationTypes.map((type) => (
													<SelectItem key={type.value} value={type.value}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Amount *</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												{...field}
												onChange={(e) =>
													field.onChange(parseFloat(e.target.value) || 0)
												}
												value={field.value || ""}
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
										<FormLabel>Status *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{taxObligationStatuses.map((status) => (
													<SelectItem key={status.value} value={status.value}>
														{status.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="dueDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Due Date *</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												value={
													field.value
														? new Date(field.value)
																.toISOString()
																.slice(0, 16)
														: ""
												}
												onChange={(e) =>
													field.onChange(new Date(e.target.value).toISOString())
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="year"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Year *</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="2000"
												max="2100"
												placeholder={currentYear.toString()}
												{...field}
												onChange={(e) =>
													field.onChange(parseInt(e.target.value) || currentYear)
												}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="quarter"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Quarter</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Q1 2025"
											{...field}
											value={field.value || ""}
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
										<Textarea
											placeholder="Additional notes about this tax obligation"
											{...field}
											value={field.value || ""}
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isEditing ? "Update" : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

