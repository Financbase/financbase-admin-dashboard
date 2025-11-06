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
import { useCreateContractor, useUpdateContractor, type Contractor } from "@/hooks/hr/use-contractors";
import { useUser } from "@clerk/nextjs";
import { createContractorSchema } from "@/lib/validation-schemas";

type ContractorFormValues = z.infer<typeof createContractorSchema>;

interface ContractorFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contractor?: Contractor;
	organizationId: string;
	onSuccess?: () => void;
}

export function ContractorForm({
	open,
	onOpenChange,
	contractor,
	organizationId,
	onSuccess,
}: ContractorFormProps) {
	const { user } = useUser();
	const createMutation = useCreateContractor();
	const updateMutation = useUpdateContractor();

	const form = useForm<ContractorFormValues>({
		resolver: zodResolver(createContractorSchema),
		defaultValues: {
			userId: user?.id || "",
			organizationId: organizationId,
			firstName: contractor?.firstName || "",
			lastName: contractor?.lastName || "",
			email: contractor?.email || "",
			phone: contractor?.phone || "",
			contractorType: contractor?.contractorType || "1099",
			companyName: contractor?.companyName || "",
			hourlyRate: contractor?.hourlyRate || "",
			monthlyRate: contractor?.monthlyRate || "",
			annualRate: contractor?.annualRate || "",
			currency: contractor?.currency || "USD",
			paymentTerms: contractor?.paymentTerms || "net_30",
			customPaymentTerms: contractor?.customPaymentTerms || "",
			contractStartDate: contractor?.contractStartDate
				? new Date(contractor.contractStartDate).toISOString()
				: new Date().toISOString(),
			contractEndDate: contractor?.contractEndDate
				? new Date(contractor.contractEndDate).toISOString()
				: undefined,
			status: contractor?.status || "active",
			location: contractor?.location || "",
			timezone: contractor?.timezone || "UTC",
			notes: contractor?.notes || "",
			tags: contractor?.tags ? (Array.isArray(contractor.tags) ? contractor.tags : []) : [],
		},
	});

	const onSubmit = async (data: ContractorFormValues) => {
		if (contractor) {
			await updateMutation.mutateAsync({
				id: contractor.id,
				...data,
			});
		} else {
			await createMutation.mutateAsync(data);
		}
		onOpenChange(false);
		form.reset();
		onSuccess?.();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{contractor ? "Edit Contractor" : "Add Contractor"}</DialogTitle>
					<DialogDescription>
						{contractor ? "Update contractor information" : "Add a new contractor to the system"}
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
											<Input placeholder="Jane" {...field} />
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
											<Input placeholder="Smith" {...field} />
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
											<Input type="email" placeholder="jane.smith@example.com" {...field} />
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
								name="contractorType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contractor Type *</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="1099">1099</SelectItem>
												<SelectItem value="w2">W-2</SelectItem>
												<SelectItem value="c2c">C2C</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="companyName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name</FormLabel>
										<FormControl>
											<Input placeholder="Company Name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="hourlyRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hourly Rate</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" placeholder="75.00" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="monthlyRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Monthly Rate</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" placeholder="5000.00" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="annualRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Annual Rate</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" placeholder="60000.00" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="paymentTerms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Payment Terms *</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select terms" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="net_15">Net 15</SelectItem>
												<SelectItem value="net_30">Net 30</SelectItem>
												<SelectItem value="net_45">Net 45</SelectItem>
												<SelectItem value="net_60">Net 60</SelectItem>
												<SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
												<SelectItem value="custom">Custom</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							{form.watch("paymentTerms") === "custom" && (
								<FormField
									control={form.control}
									name="customPaymentTerms"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Custom Payment Terms</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Net 45, 2% discount if paid within 10 days" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="contractStartDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contract Start Date *</FormLabel>
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
								name="contractEndDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contract End Date</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
												onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
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
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status *</FormLabel>
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
												<SelectItem value="pending">Pending</SelectItem>
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
									: contractor
										? "Update Contractor"
										: "Create Contractor"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

