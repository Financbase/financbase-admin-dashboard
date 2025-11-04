/**
 * Feature Flags Admin Table Component
 * Displays and manages feature flags
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FeatureFlag {
	id: number;
	key: string;
	name: string;
	description?: string;
	enabled: boolean;
	rolloutPercentage: number;
	targetOrganizations?: string[];
	targetUsers?: string[];
	conditions?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export function FeatureFlagsTable() {
	const [flags, setFlags] = useState<FeatureFlag[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		key: '',
		name: '',
		description: '',
		enabled: false,
		rolloutPercentage: [0] as number[],
	});

	useEffect(() => {
		fetchFlags();
	}, []);

	const fetchFlags = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/admin/feature-flags');
			if (response.ok) {
				const data = await response.json();
				setFlags(data.flags || []);
			} else {
				toast.error('Failed to fetch feature flags');
			}
		} catch (error) {
			toast.error('Error fetching feature flags');
		} finally {
			setLoading(false);
		}
	};

	const handleToggle = async (key: string, enabled: boolean) => {
		try {
			const response = await fetch(`/api/admin/feature-flags/${key}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ enabled: !enabled }),
			});

			if (response.ok) {
				toast.success(`Feature flag ${!enabled ? 'enabled' : 'disabled'}`);
				fetchFlags();
			} else {
				toast.error('Failed to update feature flag');
			}
		} catch (error) {
			toast.error('Error updating feature flag');
		}
	};

	const handleEdit = (flag: FeatureFlag) => {
		setEditingFlag(flag);
		setFormData({
			key: flag.key,
			name: flag.name,
			description: flag.description || '',
			enabled: flag.enabled,
			rolloutPercentage: [flag.rolloutPercentage],
		});
		setIsDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const url = editingFlag
				? `/api/admin/feature-flags/${editingFlag.key}`
				: '/api/admin/feature-flags';
			const method = editingFlag ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...(editingFlag ? {} : { key: formData.key }),
					name: formData.name,
					description: formData.description,
					enabled: formData.enabled,
					rolloutPercentage: formData.rolloutPercentage[0],
				}),
			});

			if (response.ok) {
				toast.success(`Feature flag ${editingFlag ? 'updated' : 'created'} successfully`);
				setIsDialogOpen(false);
				setEditingFlag(null);
				setFormData({
					key: '',
					name: '',
					description: '',
					enabled: false,
					rolloutPercentage: [0],
				});
				fetchFlags();
			} else {
				const error = await response.json();
				toast.error(error.error?.message || 'Failed to save feature flag');
			}
		} catch (error) {
			toast.error('Error saving feature flag');
		}
	};

	const handleDelete = async (key: string) => {
		if (!confirm(`Are you sure you want to delete feature flag "${key}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/feature-flags/${key}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Feature flag deleted');
				fetchFlags();
			} else {
				toast.error('Failed to delete feature flag');
			}
		} catch (error) {
			toast.error('Error deleting feature flag');
		}
	};

	if (loading) {
		return <div className="p-4">Loading feature flags...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Feature Flags</h2>
				<div className="flex gap-2">
					<Button onClick={fetchFlags} variant="outline" size="sm">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={() => { setEditingFlag(null); setFormData({ key: '', name: '', description: '', enabled: false, rolloutPercentage: [0] }); }}>
								<Plus className="h-4 w-4 mr-2" />
								New Flag
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</DialogTitle>
								<DialogDescription>
									{editingFlag ? 'Update feature flag settings' : 'Create a new feature flag to control feature availability'}
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								{!editingFlag && (
									<div>
										<Label htmlFor="key">Key *</Label>
										<Input
											id="key"
											value={formData.key}
											onChange={(e) => setFormData({ ...formData, key: e.target.value })}
											placeholder="new_dashboard_feature"
											required
											pattern="[a-z0-9_]+"
										/>
										<p className="text-sm text-muted-foreground mt-1">
											Lowercase alphanumeric with underscores only
										</p>
									</div>
								)}
								<div>
									<Label htmlFor="name">Name *</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										placeholder="New Dashboard Feature"
										required
									/>
								</div>
								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										placeholder="Enable the new dashboard interface"
									/>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id="enabled"
										checked={formData.enabled}
										onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
									/>
									<Label htmlFor="enabled">Enabled</Label>
								</div>
								<div>
									<Label htmlFor="rollout">Rollout Percentage: {formData.rolloutPercentage[0]}%</Label>
									<Slider
										id="rollout"
										value={formData.rolloutPercentage}
										onValueChange={(value) => setFormData({ ...formData, rolloutPercentage: value })}
										max={100}
										step={1}
										className="mt-2"
									/>
									<p className="text-sm text-muted-foreground mt-1">
										Percentage of users/organizations to enable this flag for
									</p>
								</div>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
										Cancel
									</Button>
									<Button type="submit">Save</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Key</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Rollout</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{flags.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center text-muted-foreground">
									No feature flags found
								</TableCell>
							</TableRow>
						) : (
							flags.map((flag) => (
								<TableRow key={flag.key}>
									<TableCell className="font-mono text-sm">{flag.key}</TableCell>
									<TableCell>
										<div>
											<div className="font-medium">{flag.name}</div>
											{flag.description && (
												<div className="text-sm text-muted-foreground">{flag.description}</div>
											)}
										</div>
									</TableCell>
									<TableCell>
										<Switch
											checked={flag.enabled}
											onCheckedChange={() => handleToggle(flag.key, flag.enabled)}
										/>
									</TableCell>
									<TableCell>
										<Badge variant={flag.rolloutPercentage > 0 ? 'secondary' : 'outline'}>
											{flag.rolloutPercentage}%
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEdit(flag)}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(flag.key)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

