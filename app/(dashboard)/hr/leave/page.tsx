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
import { toast } from "sonner";
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
	Calendar,
	CheckCircle,
	XCircle,
	Clock,
	User,
	AlertCircle,
	MoreHorizontal,
	Edit,
	Trash2,
	Download,
	Filter,
	Search,
	Loader2,
	CalendarDays,
} from "lucide-react";
import {
	useLeaveRequests,
	useLeaveBalances,
	useLeaveTypes,
	useApproveLeave,
	useCancelLeaveRequest,
	type LeaveRequest,
	type LeaveBalance,
} from "@/hooks/hr/use-leave";
import { LeaveRequestForm } from "@/components/hr/leave-request-form";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentEmployee } from "@/hooks/hr/use-current-employee";

export default function LeaveManagementPage() {
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | undefined>();
	const queryClient = useQueryClient();
	const { data: currentUser } = useCurrentUser();
	const { data: currentEmployee } = useCurrentEmployee();
	const approveMutation = useApproveLeave();
	const cancelMutation = useCancelLeaveRequest();

	const organizationId = currentUser?.organizationId || undefined;
	const employeeId = currentEmployee?.id || undefined;

	const { data: leaveRequests = [], isLoading, error } = useLeaveRequests({
		status: statusFilter || undefined,
		employeeId,
		organizationId,
	});

	const { data: leaveBalances = [] } = useLeaveBalances(employeeId);
	const { data: leaveTypes = [] } = useLeaveTypes();

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "rejected":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "cancelled":
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
			case "taken":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	const handleApprove = async (requestId: string, approved: boolean, rejectionReason?: string) => {
		await approveMutation.mutateAsync({ requestId, approved, rejectionReason });
	};

	const handleCancel = async (requestId: string) => {
		if (confirm("Are you sure you want to cancel this leave request?")) {
			await cancelMutation.mutateAsync(requestId);
		}
	};

	const handleAdd = () => {
		setSelectedRequest(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
		queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
	};

	if (error) {
		return (
			<div className="p-8">
				<div className="text-center text-red-600">
					Error loading leave data: {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-2">
						Manage leave requests, balances, and approvals
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Button className="flex items-center gap-2" onClick={handleAdd}>
						<Plus className="h-4 w-4" />
						Request Leave
					</Button>
				</div>
			</div>

			{/* Leave Balance Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{leaveBalances.map((balance) => {
					const leaveType = leaveTypes.find((lt) => lt.id === balance.leaveTypeId);
					return (
						<Card key={balance.id}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{leaveType?.name || "Leave Balance"}
								</CardTitle>
								<CalendarDays className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{isLoading ? (
										<Loader2 className="h-6 w-6 animate-spin" />
									) : (
										`${parseFloat(balance.currentBalance || "0").toFixed(1)} ${balance.leaveTypeId === balance.leaveTypeId ? (leaveType?.category === "vacation" ? "days" : "hours") : "hours"}`
									)}
								</div>
								<p className="text-xs text-green-600">
									Available • Accrued: {parseFloat(balance.accruedAmount || "0").toFixed(1)}
								</p>
							</CardContent>
						</Card>
					);
				})}
				{leaveBalances.length === 0 && (
					<Card className="col-span-full">
						<CardContent className="p-6 text-center">
							<p className="text-sm text-muted-foreground">No leave balances found</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Leave Management */}
			<Tabs defaultValue="requests" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="requests">
						Leave Requests ({leaveRequests.length})
					</TabsTrigger>
					<TabsTrigger value="balances">Balances</TabsTrigger>
					<TabsTrigger value="calendar">Calendar</TabsTrigger>
				</TabsList>

				{/* Leave Requests Tab */}
				<TabsContent value="requests" className="mt-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Leave Requests</CardTitle>
									<CardDescription>View and manage all leave requests</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search requests..."
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
											<SelectItem value="pending">Pending</SelectItem>
											<SelectItem value="approved">Approved</SelectItem>
											<SelectItem value="rejected">Rejected</SelectItem>
											<SelectItem value="cancelled">Cancelled</SelectItem>
											<SelectItem value="taken">Taken</SelectItem>
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
							) : leaveRequests.length === 0 ? (
								<div className="text-center py-12">
									<Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
										No leave requests found
									</h3>
									<p className="text-slate-600 dark:text-slate-300 mb-4">
										Get started by submitting a leave request
									</p>
									<Button onClick={handleAdd}>
										<Plus className="h-4 w-4 mr-2" />
										Request Leave
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{leaveRequests
										.filter((req) =>
											searchQuery
												? req.reason?.toLowerCase().includes(searchQuery.toLowerCase())
												: true
										)
										.map((request) => {
											const leaveType = leaveTypes.find((lt) => lt.id === request.leaveTypeId);
											return (
												<div
													key={request.id}
													className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
												>
													<div className="flex items-center justify-between mb-4">
														<div className="flex items-center gap-4">
															<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
																<Calendar className="h-6 w-6 text-blue-600 dark:text-blue-300" />
															</div>
															<div>
																<h3 className="font-semibold text-lg">
																	{leaveType?.name || "Leave Request"}
																</h3>
																<p className="text-sm text-gray-600 dark:text-gray-300">
																	{new Date(request.startDate).toLocaleDateString()} -{" "}
																	{new Date(request.endDate).toLocaleDateString()}
																</p>
															</div>
															<Badge className={getStatusColor(request.status)}>
																{request.status}
															</Badge>
														</div>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="sm">
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																{request.status === "pending" && (
																	<>
																		<DropdownMenuItem
																			onClick={() => handleApprove(request.id, true)}
																		>
																			<CheckCircle className="h-4 w-4 mr-2" />
																			Approve
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			onClick={() => handleApprove(request.id, false, "Rejected")}
																		>
																			<XCircle className="h-4 w-4 mr-2" />
																			Reject
																		</DropdownMenuItem>
																	</>
																)}
																{request.status === "pending" && (
																	<DropdownMenuItem onClick={() => handleCancel(request.id)}>
																		<Trash2 className="h-4 w-4 mr-2" />
																		Cancel Request
																	</DropdownMenuItem>
																)}
															</DropdownMenuContent>
														</DropdownMenu>
													</div>

													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
														<div>
															<p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
															<p className="font-semibold">
																{parseFloat(request.duration || "0").toFixed(1)} {request.durationUnit}
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-600 dark:text-gray-300">Requested By</p>
															<p className="font-semibold">{request.requestedBy}</p>
														</div>
														<div>
															<p className="text-sm text-gray-600 dark:text-gray-300">Requested On</p>
															<p className="font-semibold">
																{new Date(request.requestedAt).toLocaleDateString()}
															</p>
														</div>
														{request.approvedBy && (
															<div>
																<p className="text-sm text-gray-600 dark:text-gray-300">Approved By</p>
																<p className="font-semibold">{request.approvedBy}</p>
															</div>
														)}
													</div>

													{request.reason && (
														<div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
															<p className="text-sm font-medium mb-1">Reason</p>
															<p className="text-sm text-gray-600 dark:text-gray-300">{request.reason}</p>
														</div>
													)}
													{request.rejectionReason && (
														<div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
															<p className="text-sm font-medium mb-1 text-red-600">Rejection Reason</p>
															<p className="text-sm text-red-600 dark:text-red-400">
																{request.rejectionReason}
															</p>
														</div>
													)}
												</div>
											);
										})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Balances Tab */}
				<TabsContent value="balances" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Leave Balances</CardTitle>
							<CardDescription>Current leave balances by type</CardDescription>
						</CardHeader>
						<CardContent>
							{leaveBalances.length === 0 ? (
								<div className="text-center py-12">
									<Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
									<p className="text-slate-600 dark:text-slate-300">No leave balances found</p>
								</div>
							) : (
								<div className="space-y-4">
									{leaveBalances.map((balance) => {
										const leaveType = leaveTypes.find((lt) => lt.id === balance.leaveTypeId);
										return (
											<div
												key={balance.id}
												className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
											>
												<div className="flex items-center justify-between mb-4">
													<div className="flex items-center gap-4">
														<div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
															<CalendarDays className="h-6 w-6 text-purple-600 dark:text-purple-300" />
														</div>
														<div>
															<h3 className="font-semibold text-lg">
																{leaveType?.name || "Leave Type"}
															</h3>
															<p className="text-sm text-gray-600 dark:text-gray-300">
																{leaveType?.category || "N/A"}
															</p>
														</div>
													</div>
												</div>

												<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Current Balance</p>
														<p className="font-semibold text-lg">
															{parseFloat(balance.currentBalance || "0").toFixed(1)}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Accrued</p>
														<p className="font-semibold">
															{parseFloat(balance.accruedAmount || "0").toFixed(1)}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Taken</p>
														<p className="font-semibold">
															{parseFloat(balance.takenAmount || "0").toFixed(1)}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Scheduled</p>
														<p className="font-semibold">
															{parseFloat(balance.scheduledAmount || "0").toFixed(1)}
														</p>
													</div>
												</div>

												{balance.lastAccrualDate && (
													<div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
														Last accrual: {new Date(balance.lastAccrualDate).toLocaleDateString()}
														{balance.nextAccrualDate &&
															` • Next accrual: ${new Date(balance.nextAccrualDate).toLocaleDateString()}`}
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Calendar Tab */}
				<TabsContent value="calendar" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Leave Calendar</CardTitle>
							<CardDescription>Visual calendar view of leave requests</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between mb-4">
									<p className="text-sm text-muted-foreground">
										Showing {leaveRequests.length} leave requests
									</p>
									<Button 
										size="sm" 
										variant="outline" 
										disabled
										title="Calendar view feature coming soon"
									>
										<Calendar className="h-4 w-4 mr-2" />
										View Calendar
										<Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
									</Button>
								</div>
								<div className="grid grid-cols-7 gap-2 mb-4">
									{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
										<div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
											{day}
										</div>
									))}
								</div>
								<div className="grid grid-cols-7 gap-2">
									{Array.from({ length: 35 }).map((_, i) => {
										const date = i + 1;
										const hasLeave = leaveRequests.some((req) => {
											const reqDate = new Date(req.startDate).getDate();
											return reqDate === date;
										});
										return (
											<div
												key={i}
												className={`aspect-square border rounded-lg p-2 text-center text-sm ${
													hasLeave ? 'bg-blue-100 border-blue-300' : 'bg-muted/50'
												}`}
											>
												{date <= 31 && date}
											</div>
										);
									})}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<LeaveRequestForm
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				employeeId={employeeId || "00000000-0000-0000-0000-000000000000"}
				organizationId={organizationId || "00000000-0000-0000-0000-000000000000"}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}

