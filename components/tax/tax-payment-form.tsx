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
import { useRecordTaxPayment, type TaxObligation } from "@/hooks/use-tax";
import { recordTaxPaymentSchema, type RecordTaxPaymentInput } from "@/lib/validation-schemas";
import { Loader2 } from "lucide-react";
import { logger } from '@/lib/logger';

const paymentMethods = [
	{ value: "bank_transfer", label: "Bank Transfer" },
	{ value: "check", label: "Check" },
	{ value: "credit_card", label: "Credit Card" },
	{ value: "debit_card", label: "Debit Card" },
	{ value: "wire_transfer", label: "Wire Transfer" },
	{ value: "other", label: "Other" },
];

interface TaxPaymentFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	obligation: TaxObligation;
	onSuccess?: () => void;
}

export function TaxPaymentForm({
	open,
	onOpenChange,
	obligation,
	onSuccess,
}: TaxPaymentFormProps) {
	const recordPaymentMutation = useRecordTaxPayment();

	const totalAmount = parseFloat(obligation.amount || "0");
	const paidAmount = parseFloat(obligation.paid || "0");
	const remainingAmount = totalAmount - paidAmount;

	const form = useForm<RecordTaxPaymentInput>({
		resolver: zodResolver(recordTaxPaymentSchema),
		defaultValues: {
			obligationId: obligation.id,
			amount: remainingAmount,
			paymentDate: new Date().toISOString(),
			paymentMethod: "bank_transfer",
			notes: "",
		},
	});

	const isLoading = recordPaymentMutation.isPending;

	const onSubmit = async (data: RecordTaxPaymentInput) => {
		try {
			await recordPaymentMutation.mutateAsync(data);
			onOpenChange(false);
			form.reset();
			onSuccess?.();
		} catch (error) {
			// Error handling is done in the mutation hook
			logger.error("Failed to record payment:", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Record Tax Payment</DialogTitle>
					<DialogDescription>
						Record a payment for {obligation.name}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{/* Obligation Summary */}
					<div className="rounded-lg border p-4 bg-muted/50">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Total Amount</p>
								<p className="font-semibold">${totalAmount.toLocaleString()}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Amount Paid</p>
								<p className="font-semibold text-green-600">
									${paidAmount.toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Remaining Balance</p>
								<p
									className={`font-semibold ${
										remainingAmount > 0 ? "text-red-600" : "text-green-600"
									}`}
								>
									${remainingAmount.toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Due Date</p>
								<p className="font-semibold">
									{new Date(obligation.dueDate).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Payment Amount *</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min="0"
													max={remainingAmount}
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
									name="paymentDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Payment Date *</FormLabel>
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
														field.onChange(
															new Date(e.target.value).toISOString()
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="paymentMethod"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Payment Method</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select payment method" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{paymentMethods.map((method) => (
													<SelectItem key={method.value} value={method.value}>
														{method.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
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
												placeholder="Additional notes about this payment"
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
								<Button type="submit" disabled={isLoading || remainingAmount <= 0}>
									{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Record Payment
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}

