/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	Search,
	Filter,
	Download,
	Mail,
	Phone,
	Calendar,
	User,
	Building,
	DollarSign,
	Clock,
	CheckCircle,
	AlertCircle,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	MapPin,
	Star,
	TrendingUp,
	Loader2,
} from "lucide-react";
import {
	useContractors,
	useDeleteContractor,
	type Contractor,
} from "@/hooks/hr/use-contractors";
import { ContractorForm } from "@/components/hr/contractor-form";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function HRContractorsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [contractorTypeFilter, setContractorTypeFilter] = useState<string>("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedContractor, setSelectedContractor] = useState<Contractor | undefined>();
	const queryClient = useQueryClient();
	const deleteMutation = useDeleteContractor();
	const { data: currentUser } = useCurrentUser();

	const organizationId = currentUser?.organizationId || undefined;

	const { data: contractors = [], isLoading, error } = useContractors({
		search: searchQuery || undefined,
		status: statusFilter || undefined,
		contractorType: contractorTypeFilter || undefined,
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "inactive":
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
			case "terminated":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	const contractorStats = {
		total: contractors.length,
		active: contractors.filter((c) => c.status === "active").length,
		pending: contractors.filter((c) => c.status === "pending").length,
		inactive: contractors.filter((c) => c.status === "inactive").length,
		terminated: contractors.filter((c) => c.status === "terminated").length,
	};

	const handleEdit = (contractor: Contractor) => {
		setSelectedContractor(contractor);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this contractor?")) {
			await deleteMutation.mutateAsync(id);
		}
	};

	const handleAdd = () => {
		setSelectedContractor(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["contractors"] });
	};

	if (error) {
		return (
			<div className="p-8">
				<div className="text-center text-red-600">
					Error loading contractors: {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contractors</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-2">
						Manage external contractors and freelancers
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export Data
					</Button>
					<Button className="flex items-center gap-2" onClick={handleAdd}>
						<Plus className="h-4 w-4" />
						Add Contractor
					</Button>
				</div>
			</div>

			{/* Contractor Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								contractorStats.total
							)}
						</div>
						<p className="text-xs text-green-600 flex items-center">
							<TrendingUp className="h-3 w-3 mr-1" />
							+3 from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								contractorStats.active
							)}
						</div>
						<p className="text-xs text-green-600">
							{contractorStats.total > 0
								? ((contractorStats.active / contractorStats.total) * 100).toFixed(1)
								: 0}
							% of total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								contractorStats.pending
							)}
						</div>
						<p className="text-xs text-yellow-600">Requires attention</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Spend</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								"$0"
							)}
						</div>
						<p className="text-xs text-green-600">This month</p>
					</CardContent>
				</Card>
			</div>

			{/* Contractor Management */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Contractor Management</CardTitle>
							<CardDescription>View and manage all contractors and freelancers</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									placeholder="Search contractors..."
									className="pl-10 w-64"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="All Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="terminated">Terminated</SelectItem>
								</SelectContent>
							</Select>
							<Select value={contractorTypeFilter} onValueChange={setContractorTypeFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="All Types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Types</SelectItem>
									<SelectItem value="1099">1099</SelectItem>
									<SelectItem value="w2">W-2</SelectItem>
									<SelectItem value="c2c">C2C</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" size="sm">
								<Filter className="h-4 w-4 mr-2" />
								More Filters
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : contractors.length === 0 ? (
						<div className="text-center py-12">
							<User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
								No contractors found
							</h3>
							<p className="text-slate-600 dark:text-slate-300 mb-4">
								{searchQuery || statusFilter || contractorTypeFilter
									? "Try adjusting your filters"
									: "Get started by adding your first contractor"}
							</p>
							{!searchQuery && !statusFilter && !contractorTypeFilter && (
								<Button onClick={handleAdd}>
									<Plus className="h-4 w-4 mr-2" />
									Add Contractor
								</Button>
							)}
						</div>
					) : (
						<Tabs defaultValue="all" className="w-full">
							<TabsList className="grid w-full grid-cols-5">
								<TabsTrigger value="all">All ({contractorStats.total})</TabsTrigger>
								<TabsTrigger value="active">Active ({contractorStats.active})</TabsTrigger>
								<TabsTrigger value="pending">Pending ({contractorStats.pending})</TabsTrigger>
								<TabsTrigger value="inactive">Inactive ({contractorStats.inactive})</TabsTrigger>
								<TabsTrigger value="terminated">Terminated ({contractorStats.terminated})</TabsTrigger>
							</TabsList>

							<TabsContent value="all" className="mt-6">
								<div className="space-y-4">
									{contractors.map((contractor) => (
										<div
											key={contractor.id}
											className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
										>
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
														<User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
													</div>
													<div>
														<h3 className="font-semibold text-lg">
															{contractor.firstName} {contractor.lastName}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															{contractor.companyName || "Independent Contractor"}
														</p>
													</div>
													<Badge className={getStatusColor(contractor.status)}>
														{contractor.status}
													</Badge>
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEdit(contractor)}>
															<Edit className="h-4 w-4 mr-2" />
															Edit Contractor
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleDelete(contractor.id)}
															className="text-red-600"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Remove Contractor
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
												<div className="flex items-center gap-2">
													<Mail className="h-4 w-4 text-gray-400" />
													<span className="text-sm">{contractor.email}</span>
												</div>
												{contractor.phone && (
													<div className="flex items-center gap-2">
														<Phone className="h-4 w-4 text-gray-400" />
														<span className="text-sm">{contractor.phone}</span>
													</div>
												)}
												{contractor.location && (
													<div className="flex items-center gap-2">
														<MapPin className="h-4 w-4 text-gray-400" />
														<span className="text-sm">{contractor.location}</span>
													</div>
												)}
												<div className="flex items-center gap-2">
													<Building className="h-4 w-4 text-gray-400" />
													<span className="text-sm capitalize">{contractor.contractorType}</span>
												</div>
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
												{contractor.hourlyRate && (
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Hourly Rate</p>
														<p className="font-semibold">
															${contractor.hourlyRate}/{contractor.currency || "USD"}
														</p>
													</div>
												)}
												{contractor.monthlyRate && (
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Monthly Rate</p>
														<p className="font-semibold">
															${contractor.monthlyRate}/{contractor.currency || "USD"}
														</p>
													</div>
												)}
												{contractor.annualRate && (
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Annual Rate</p>
														<p className="font-semibold">
															${contractor.annualRate}/{contractor.currency || "USD"}
														</p>
													</div>
												)}
											</div>

											<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
												<div className="flex items-center gap-4">
													<span className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														Contract: {new Date(contractor.contractStartDate).toLocaleDateString()}
														{contractor.contractEndDate &&
															` - ${new Date(contractor.contractEndDate).toLocaleDateString()}`}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</TabsContent>

							<TabsContent value="active" className="mt-6">
								<div className="space-y-4">
									{contractors
										.filter((c) => c.status === "active")
										.map((contractor) => (
											<div
												key={contractor.id}
												className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
															<User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
														</div>
														<div>
															<h3 className="font-semibold text-lg">
																{contractor.firstName} {contractor.lastName}
															</h3>
															<p className="text-sm text-gray-600 dark:text-gray-300">
																{contractor.email}
															</p>
														</div>
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => handleEdit(contractor)}>
																<Edit className="h-4 w-4 mr-2" />
																Edit Contractor
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleDelete(contractor.id)}
																className="text-red-600"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Remove Contractor
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										))}
								</div>
							</TabsContent>

							<TabsContent value="pending" className="mt-6">
								<div className="space-y-4">
									{contractors
										.filter((c) => c.status === "pending")
										.map((contractor) => (
											<div
												key={contractor.id}
												className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
															<User className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
														</div>
														<div>
															<h3 className="font-semibold text-lg">
																{contractor.firstName} {contractor.lastName}
															</h3>
															<p className="text-sm text-gray-600 dark:text-gray-300">
																{contractor.email}
															</p>
														</div>
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => handleEdit(contractor)}>
																<Edit className="h-4 w-4 mr-2" />
																Edit Contractor
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleDelete(contractor.id)}
																className="text-red-600"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Remove Contractor
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										))}
								</div>
							</TabsContent>
						</Tabs>
					)}
				</CardContent>
			</Card>

			<ContractorForm
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				contractor={selectedContractor}
				organizationId={organizationId || "00000000-0000-0000-0000-000000000000"}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}
