/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

/**
 * Client Form Component
 * Create and edit clients
 */

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
	Save, 
	X,
	User
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useFormSubmission } from '@/hooks/use-form-submission';

interface ClientFormData {
	name: string;
	email: string;
	phone?: string;
	company?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country: string;
	taxId?: string;
	currency: string;
	paymentTerms?: string;
	status: 'active' | 'inactive' | 'suspended';
	notes?: string;
}

interface ClientFormProps {
	initialData?: Partial<ClientFormData>;
	clientId?: number;
	onCancel?: () => void;
}

const countries = [
	'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'GR', 'LU', 'MT', 'CY', 'EE', 'LV', 'LT', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'Other'
];

const currencies = [
	'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'Other'
];

const paymentTermsOptions = [
	'Net 15',
	'Net 30',
	'Net 45',
	'Net 60',
	'Due on Receipt',
	'Custom'
];

export function ClientForm({ initialData, clientId, onCancel }: ClientFormProps) {
	const router = useRouter();
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const companyId = useId();
	const addressId = useId();
	const cityId = useId();
	const stateId = useId();
	const zipCodeId = useId();
	const taxIdId = useId();
	const notesId = useId();

	const [formData, setFormData] = useState<ClientFormData>({
		name: initialData?.name || '',
		email: initialData?.email || '',
		phone: initialData?.phone || '',
		company: initialData?.company || '',
		address: initialData?.address || '',
		city: initialData?.city || '',
		state: initialData?.state || '',
		zipCode: initialData?.zipCode || '',
		country: initialData?.country || 'US',
		taxId: initialData?.taxId || '',
		currency: initialData?.currency || 'USD',
		paymentTerms: initialData?.paymentTerms || 'Net 30',
		status: initialData?.status || 'active',
		notes: initialData?.notes || '',
	});

	// Form submission hook
	const { submit, isLoading, error } = useFormSubmission(
		async (data: ClientFormData) => {
			const url = clientId ? `/api/clients/${clientId}` : '/api/clients';
			const method = clientId ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `Failed to save client: ${response.status} ${response.statusText}`);
			}

			return response.json();
		},
		{
			onSuccess: () => {
				router.push('/clients');
			},
			successMessage: clientId ? 'Client updated successfully' : 'Client created successfully',
			errorMessage: 'Failed to save client',
		}
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.name || !formData.email) {
			toast.error('Validation Error', 'Name and email are required');
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			toast.error('Validation Error', 'Please enter a valid email address');
			return;
		}

		try {
			await submit(formData);
		} catch {
			// Error handling is done in the hook
		}
	};

	return (
		<div className="space-y-6">
			{error && (
				<Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
					<CardContent className="pt-6">
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					</CardContent>
				</Card>
			)}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Client Information
						</CardTitle>
						<CardDescription>Enter the client's basic information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor={nameId}>Name *</Label>
								<Input
									id={nameId}
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="Client's full name"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={emailId}>Email *</Label>
								<Input
									id={emailId}
									type="email"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									placeholder="client@example.com"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={phoneId}>Phone</Label>
								<Input
									id={phoneId}
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									placeholder="+1 (555) 123-4567"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={companyId}>Company</Label>
								<Input
									id={companyId}
									value={formData.company}
									onChange={(e) => setFormData({ ...formData, company: e.target.value })}
									placeholder="Company name"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Address Information */}
				<Card>
					<CardHeader>
						<CardTitle>Address Information</CardTitle>
						<CardDescription>Client's billing address</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={addressId}>Address</Label>
							<Input
								id={addressId}
								value={formData.address}
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								placeholder="Street address"
							/>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor={cityId}>City</Label>
								<Input
									id={cityId}
									value={formData.city}
									onChange={(e) => setFormData({ ...formData, city: e.target.value })}
									placeholder="City"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={stateId}>State/Province</Label>
								<Input
									id={stateId}
									value={formData.state}
									onChange={(e) => setFormData({ ...formData, state: e.target.value })}
									placeholder="State or Province"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={zipCodeId}>ZIP/Postal Code</Label>
								<Input
									id={zipCodeId}
									value={formData.zipCode}
									onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
									placeholder="ZIP or Postal Code"
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="country">Country</Label>
								<Select
									value={formData.country}
									onValueChange={(value) => setFormData({ ...formData, country: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select country" />
									</SelectTrigger>
									<SelectContent>
										{countries.map((country) => (
											<SelectItem key={country} value={country}>
												{country}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="currency">Currency</Label>
								<Select
									value={formData.currency}
									onValueChange={(value) => setFormData({ ...formData, currency: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
									<SelectContent>
										{currencies.map((currency) => (
											<SelectItem key={currency} value={currency}>
												{currency}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Business Information */}
				<Card>
					<CardHeader>
						<CardTitle>Business Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor={taxIdId}>Tax ID</Label>
								<Input
									id={taxIdId}
									value={formData.taxId}
									onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
									placeholder="Tax identification number"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="paymentTerms">Payment Terms</Label>
								<Select
									value={formData.paymentTerms}
									onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select payment terms" />
									</SelectTrigger>
									<SelectContent>
										{paymentTermsOptions.map((terms) => (
											<SelectItem key={terms} value={terms}>
												{terms}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({ ...formData, status: value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="suspended">Suspended</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Additional Information */}
				<Card>
					<CardHeader>
						<CardTitle>Additional Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={notesId}>Notes</Label>
							<Textarea
								id={notesId}
								value={formData.notes}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								placeholder="Any additional notes about this client"
								rows={3}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Actions */}
				<Card>
					<CardFooter className="flex justify-between gap-4 pt-6">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel || (() => router.back())}
						>
							<X className="h-4 w-4 mr-2" />
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
						>
							<Save className="h-4 w-4 mr-2" />
							{isLoading ? 'Saving...' : 'Save Client'}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}
