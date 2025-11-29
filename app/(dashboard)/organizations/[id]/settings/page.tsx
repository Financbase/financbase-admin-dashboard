/**
 * Organization Settings Page
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationMembers } from '@/components/organizations/organization-members';
import { useToast } from '@/hooks/use-toast';
import { Settings, Users, CreditCard, Building2 } from 'lucide-react';

export default function OrganizationSettingsPage() {
	const params = useParams();
	const organizationId = params.id as string;
	const { toast } = useToast();

	const [organization, setOrganization] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		billingEmail: '',
		taxId: '',
		address: '',
		phone: '',
	});

	useEffect(() => {
		fetchOrganization();
	}, [organizationId]);

	const fetchOrganization = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/organizations/${organizationId}`);
			if (!response.ok) throw new Error('Failed to fetch organization');
			const data = await response.json();
			if (data.success && data.data) {
				const org = data.data;
				setOrganization(org);
				setFormData({
					name: org.name || '',
					description: org.description || '',
					billingEmail: org.billingEmail || '',
					taxId: org.taxId || '',
					address: org.address || '',
					phone: org.phone || '',
				});
			}
		} catch (error) {
			console.error('Error fetching organization:', error);
			toast({
				title: 'Error',
				description: 'Failed to load organization',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			const response = await fetch(`/api/organizations/${organizationId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update organization');
			}

			toast({
				title: 'Success',
				description: 'Organization updated successfully',
			});

			fetchOrganization();
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to update organization',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto py-6">
				<div className="text-center py-12">Loading...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Organization Settings</h1>
				<p className="text-muted-foreground mt-1">
					Manage your organization details, members, and billing
				</p>
			</div>

			<Tabs defaultValue="general" className="space-y-4">
				<TabsList>
					<TabsTrigger value="general">
						<Settings className="mr-2 h-4 w-4" />
						General
					</TabsTrigger>
					<TabsTrigger value="members">
						<Users className="mr-2 h-4 w-4" />
						Members
					</TabsTrigger>
					<TabsTrigger value="billing">
						<CreditCard className="mr-2 h-4 w-4" />
						Billing
					</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Organization Details</CardTitle>
							<CardDescription>
								Update your organization information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="name">Organization Name</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									rows={3}
								/>
							</div>
							<div>
								<Label htmlFor="billingEmail">Billing Email</Label>
								<Input
									id="billingEmail"
									type="email"
									value={formData.billingEmail}
									onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor="taxId">Tax ID</Label>
								<Input
									id="taxId"
									value={formData.taxId}
									onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
								/>
							</div>
							<div>
								<Label htmlFor="address">Address</Label>
								<Textarea
									id="address"
									value={formData.address}
									onChange={(e) => setFormData({ ...formData, address: e.target.value })}
									rows={2}
								/>
							</div>
							<div>
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								/>
							</div>
							<Button onClick={handleSave} disabled={saving}>
								{saving ? 'Saving...' : 'Save Changes'}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="members">
					<OrganizationMembers
						organizationId={organizationId}
						currentUserRole={organization?.role}
					/>
				</TabsContent>

				<TabsContent value="billing">
					<Card>
						<CardHeader>
							<CardTitle>Billing & Subscription</CardTitle>
							<CardDescription>
								Manage your organization's subscription and billing
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-muted-foreground">
								Billing management coming soon
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

