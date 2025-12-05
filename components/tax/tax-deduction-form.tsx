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
	useCreateTaxDeduction,
	useUpdateTaxDeduction,
	type TaxDeduction,
} from "@/hooks/use-tax";
import { useUser } from "@clerk/nextjs";
import {
	createTaxDeductionSchema,
	updateTaxDeductionSchema,
	type CreateTaxDeductionInput,
	type UpdateTaxDeductionInput,
} from "@/lib/validation-schemas";
import { Loader2 } from "lucide-react";
import { logger } from '@/lib/logger';

const commonCategories = [
	"Business Expenses",
	"Home Office",
	"Equipment & Software",
	"Travel & Meals",
	"Professional Services",
	"Vehicle Expenses",
	"Insurance",
	"Utilities",
	"Rent",
	"Other",
];

interface TaxDeductionFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deduction?: TaxDeduction;
	onSuccess?: () => void;
}

export function TaxDeductionForm({
	open,
	onOpenChange,
	deduction,
	onSuccess,
}: TaxDeductionFormProps) {
	const { user } = useUser();
	const createMutation = useCreateTaxDeduction();
	const updateMutation = useUpdateTaxDeduction();

	const isEditing = !!deduction;
	const currentYear = new Date().getFullYear();

	const form = useForm<CreateTaxDeductionInput>({
		resolver: zodResolver(createTaxDeductionSchema),
		defaultValues: {
			userId: user?.id || "",
			category: deduction?.category || "",
			amount: deduction?.amount ? parseFloat(deduction.amount) : 0,
			year: deduction?.year || currentYear,
			transactionCount: deduction?.transactionCount || 0,
			description: deduction?.description || "",
		},
	});

	const isLoading = createMutation.isPending || updateMutation.isPending;

	const onSubmit = async (data: CreateTaxDeductionInput) => {
		try {
			if (isEditing && deduction) {
				await updateMutation.mutateAsync({
					id: deduction.id,
					...data,
				} as UpdateTaxDeductionInput);
			} else {
				await createMutation.mutateAsync(data);
			}
			onOpenChange(false);
			form.reset();
			onSuccess?.();
		} catch (error) {
			// Error handling is done in the mutation hooks
			logger.error("Failed to save tax deduction:", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Tax Deduction" : "Add Tax Deduction"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Update your tax deduction details"
							: "Create a new tax deduction to track"}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category *</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Business Expenses"
											list="categories"
											{...field}
										/>
									</FormControl>
									<datalist id="categories">
										{commonCategories.map((cat) => (
											<option key={cat} value={cat} />
										))}
									</datalist>
									<FormMessage />
								</FormItem>
							)}
						/>

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
							name="transactionCount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Transaction Count</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											placeholder="0"
											{...field}
											onChange={(e) =>
												field.onChange(parseInt(e.target.value) || 0)
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
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Additional details about this deduction"
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

