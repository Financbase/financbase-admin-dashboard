/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Plus,
	Building2,
	Users,
	Settings,
	Copy,
	Trash2,
	Edit,
	Share,
	Shield,
	Activity,
	ExternalLink,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface InvestorPortal {
	id: string;
	name: string;
	description: string;
	logo?: string;
	primaryColor: string;
	allowedMetrics: string[];
	allowedReports: string[];
	accessToken: string;
	expiresAt?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	accessCount?: number;
	lastAccessed?: string;
}

interface CreatePortalData {
	name: string;
	description: string;
	logo?: string;
	primaryColor: string;
	allowedMetrics: string[];
	allowedReports: string[];
	expiresAt?: string;
}

export function InvestorPortalManager() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingPortal, setEditingPortal] = useState<InvestorPortal | null>(null);
	const [createData, setCreateData] = useState<CreatePortalData>({
		name: "",
		description: "",
		primaryColor: "#3b82f6",
		allowedMetrics: ["revenue", "profit", "customers"],
		allowedReports: [],
	});

	const queryClient = useQueryClient();

	// Fetch investor portals
	const { data: portals, isLoading } = useQuery({
		queryKey: ["investor-portals"],
		queryFn: async () => {
			const response = await fetch("/api/investor-portal");
			if (!response.ok) throw new Error("Failed to fetch portals");
			return response.json();
		},
	});

	// Create portal mutation
	const createPortalMutation = useMutation({
		mutationFn: async (data: CreatePortalData) => {
			const response = await fetch("/api/investor-portal", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Failed to create portal");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["investor-portals"] });
			setIsCreateDialogOpen(false);
			setCreateData({
				name: "",
				description: "",
				primaryColor: "#3b82f6",
				allowedMetrics: ["revenue", "profit", "customers"],
				allowedReports: [],
			});
		},
	});

	// Update portal mutation
	const updatePortalMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<InvestorPortal> }) => {
			const response = await fetch(`/api/investor-portal/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Failed to update portal");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["investor-portals"] });
			setEditingPortal(null);
		},
	});

	// Delete portal mutation
	const deletePortalMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/investor-portal/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete portal");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["investor-portals"] });
		},
	});

	const handleCreatePortal = () => {
		createPortalMutation.mutate(createData);
	};

	const handleUpdatePortal = (data: Partial<InvestorPortal>) => {
		if (editingPortal) {
			updatePortalMutation.mutate({ id: editingPortal.id, data });
		}
	};

	const handleDeletePortal = (id: string) => {
		if (confirm("Are you sure you want to delete this investor portal?")) {
			deletePortalMutation.mutate(id);
		}
	};

	const copyAccessUrl = (portal: InvestorPortal) => {
		const url = `${window.location.origin}/investor/${portal.id}?token=${portal.accessToken}`;
		navigator.clipboard.writeText(url);
		// TODO: Show toast notification
	};

	const getStatusBadge = (portal: InvestorPortal) => {
		if (!portal.isActive) {
			return <Badge variant="secondary">Inactive</Badge>;
		}

		if (portal.expiresAt && new Date() > new Date(portal.expiresAt)) {
			return <Badge variant="destructive">Expired</Badge>;
		}

		return <Badge variant="default">Active</Badge>;
	};

	const availableMetrics = [
		{ value: "revenue", label: "Revenue Metrics" },
		{ value: "profit", label: "Profit & Loss" },
		{ value: "customers", label: "Customer Metrics" },
		{ value: "growth", label: "Growth Metrics" },
		{ value: "valuation", label: "Company Valuation" },
		{ value: "financials", label: "Financial Statements" },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Users className="h-6 w-6" />
						Investor Portal Management
					</h2>
					<p className="text-muted-foreground">
						Create and manage investor portals for sharing financial data and reports
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Create Portal
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Create Investor Portal</DialogTitle>
							<DialogDescription>
								Set up a secure portal for investors to access your financial data
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="portal-name">Portal Name</Label>
									<Input
										id="portal-name"
										value={createData.name}
										onChange={(e) =>
											setCreateData((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										placeholder="Q4 2024 Investor Update"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="portal-color">Brand Color</Label>
									<div className="flex items-center gap-2">
										<Input
											id="portal-color"
											type="color"
											value={createData.primaryColor}
											onChange={(e) =>
												setCreateData((prev) => ({
													...prev,
													primaryColor: e.target.value,
												}))
											}
											className="w-16 h-10 p-1"
										/>
										<Input
											value={createData.primaryColor}
											onChange={(e) =>
												setCreateData((prev) => ({
													...prev,
													primaryColor: e.target.value,
												}))
											}
											placeholder="#3b82f6"
											className="flex-1"
										/>
									</div>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="portal-description">Description</Label>
								<Textarea
									id="portal-description"
									value={createData.description}
									onChange={(e) =>
										setCreateData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder="Brief description of what investors will see"
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label>Allowed Metrics</Label>
								<div className="grid grid-cols-2 gap-2">
									{availableMetrics.map((metric) => (
										<div key={metric.value} className="flex items-center space-x-2">
											<Switch
												id={`metric-${metric.value}`}
												checked={createData.allowedMetrics.includes(metric.value)}
												onCheckedChange={(checked) => {
													setCreateData((prev) => ({
														...prev,
														allowedMetrics: checked
															? [...prev.allowedMetrics, metric.value]
															: prev.allowedMetrics.filter((m) => m !== metric.value),
													}));
												}}
											/>
											<Label htmlFor={`metric-${metric.value}`} className="text-sm">
												{metric.label}
											</Label>
										</div>
									))}
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id="portal-expires"
									checked={!!createData.expiresAt}
									onCheckedChange={(checked) => {
										setCreateData((prev) => ({
											...prev,
											expiresAt: checked ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
										}));
									}}
								/>
								<Label htmlFor="portal-expires">Set expiration date (30 days)</Label>
							</div>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
									Cancel
								</Button>
								<Button
									onClick={handleCreatePortal}
									disabled={createPortalMutation.isPending || !createData.name}
								>
									{createPortalMutation.isPending ? "Creating..." : "Create Portal"}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Portals List */}
			<Card>
				<CardHeader>
					<CardTitle>Active Portals</CardTitle>
					<CardDescription>
						Manage your investor portals and monitor access
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center h-32">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : portals?.length === 0 ? (
						<div className="text-center py-8">
							<Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-semibold mb-2">No Investor Portals</h3>
							<p className="text-muted-foreground mb-4">
								Create your first investor portal to start sharing financial data
							</p>
							<Button onClick={() => setIsCreateDialogOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Create Portal
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Portal</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Access</TableHead>
									<TableHead>Last Used</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{portals?.map((portal: InvestorPortal) => (
									<TableRow key={portal.id}>
										<TableCell>
											<div>
												<div className="font-medium">{portal.name}</div>
												<div className="text-sm text-muted-foreground">
													{portal.description}
												</div>
											</div>
										</TableCell>
										<TableCell>{getStatusBadge(portal)}</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="text-sm">
													{portal.accessCount || 0} views
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => copyAccessUrl(portal)}
													className="h-6 text-xs"
												>
													<Copy className="h-3 w-3 mr-1" />
													Copy URL
												</Button>
											</div>
										</TableCell>
										<TableCell>
											{portal.lastAccessed
												? new Date(portal.lastAccessed).toLocaleDateString()
												: "Never"}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setEditingPortal(portal)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => copyAccessUrl(portal)}
												>
													<Share className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeletePortal(portal.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Edit Portal Dialog */}
			{editingPortal && (
				<Dialog open={!!editingPortal} onOpenChange={() => setEditingPortal(null)}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Edit Investor Portal</DialogTitle>
							<DialogDescription>
								Modify portal settings and permissions
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-portal-name">Portal Name</Label>
									<Input
										id="edit-portal-name"
										value={editingPortal.name}
										onChange={(e) =>
											setEditingPortal((prev) =>
												prev ? { ...prev, name: e.target.value } : null
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-portal-status">Status</Label>
									<div className="flex items-center space-x-2">
										<Switch
											id="edit-portal-status"
											checked={editingPortal.isActive}
											onCheckedChange={(checked) =>
												setEditingPortal((prev) =>
													prev ? { ...prev, isActive: checked } : null
												)
											}
										/>
										<Label htmlFor="edit-portal-status">
											{editingPortal.isActive ? "Active" : "Inactive"}
										</Label>
									</div>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-portal-description">Description</Label>
								<Textarea
									id="edit-portal-description"
									value={editingPortal.description}
									onChange={(e) =>
										setEditingPortal((prev) =>
											prev ? { ...prev, description: e.target.value } : null
										)
									}
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label>Allowed Metrics</Label>
								<div className="grid grid-cols-2 gap-2">
									{availableMetrics.map((metric) => (
										<div key={metric.value} className="flex items-center space-x-2">
											<Switch
												id={`edit-metric-${metric.value}`}
												checked={editingPortal.allowedMetrics.includes(metric.value)}
												onCheckedChange={(checked) => {
													setEditingPortal((prev) =>
														prev
															? {
																	...prev,
																	allowedMetrics: checked
																		? [...prev.allowedMetrics, metric.value]
																		: prev.allowedMetrics.filter((m) => m !== metric.value),
															  }
															: null
													);
												}}
											/>
											<Label htmlFor={`edit-metric-${metric.value}`} className="text-sm">
												{metric.label}
											</Label>
										</div>
									))}
								</div>
							</div>
							<div className="flex justify-between items-center p-4 bg-muted rounded-lg">
								<div>
									<div className="text-sm font-medium">Access URL</div>
									<div className="text-xs text-muted-foreground">
										Share this link with investors
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => copyAccessUrl(editingPortal)}
								>
									<Copy className="h-4 w-4 mr-2" />
									Copy
								</Button>
							</div>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setEditingPortal(null)}>
									Cancel
								</Button>
								<Button
									onClick={() =>
										handleUpdatePortal({
											name: editingPortal.name,
											description: editingPortal.description,
											isActive: editingPortal.isActive,
											allowedMetrics: editingPortal.allowedMetrics,
										})
									}
									disabled={updatePortalMutation.isPending}
								>
									{updatePortalMutation.isPending ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
