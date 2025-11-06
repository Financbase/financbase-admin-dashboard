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
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	MoreHorizontal,
	Edit,
	Trash2,
	Download,
	Filter,
	Search,
	Loader2,
	Calendar,
	User,
	MapPin,
	TrendingUp,
	Timer,
} from "lucide-react";
import {
	useAttendanceRecords,
	useTimeCards,
	useAttendanceStats,
	useRunningAttendanceRecord,
	useUpdateTimeCardStatus,
	type AttendanceRecord,
	type TimeCard,
} from "@/hooks/hr/use-attendance";
import { AttendanceClockDialog } from "@/components/hr/attendance-clock-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentEmployee } from "@/hooks/hr/use-current-employee";

export default function AttendancePage() {
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isClockDialogOpen, setIsClockDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: currentUser } = useCurrentUser();
	const { data: currentEmployee } = useCurrentEmployee();
	const updateStatusMutation = useUpdateTimeCardStatus();

	const organizationId = currentUser?.organizationId || undefined;
	const employeeId = currentEmployee?.id || undefined;

	const { data: attendanceRecords = [], isLoading, error } = useAttendanceRecords({
		status: statusFilter || undefined,
		employeeId,
		organizationId,
	});

	const { data: timeCards = [] } = useTimeCards({
		employeeId,
		status: statusFilter || undefined,
	});

	const { data: stats } = useAttendanceStats({
		employeeId,
		startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
		endDate: new Date(),
	});

	const { data: runningRecord } = useRunningAttendanceRecord(employeeId);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "present":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "absent":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "late":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "on_leave":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "holiday":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
			case "sick":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	const getTimeCardStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "submitted":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "rejected":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "paid":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	const handleApproveTimeCard = async (id: string) => {
		await updateStatusMutation.mutateAsync({ id, status: "approved" });
	};

	const handleRejectTimeCard = async (id: string, reason: string) => {
		await updateStatusMutation.mutateAsync({ id, status: "rejected", rejectionReason: reason });
	};

	const handleClockInOut = () => {
		setIsClockDialogOpen(true);
	};

	const handleFormSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
		queryClient.invalidateQueries({ queryKey: ["running-attendance"] });
		queryClient.invalidateQueries({ queryKey: ["time-cards"] });
		queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
	};

	if (error) {
		return (
			<div className="p-8">
				<div className="text-center text-red-600">
					Error loading attendance data: {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Tracking</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-2">
						Track attendance, manage time cards, and monitor work hours
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Button className="flex items-center gap-2" onClick={handleClockInOut}>
						<Clock className="h-4 w-4" />
						{runningRecord ? "Clock Out" : "Clock In"}
					</Button>
				</div>
			</div>

			{/* Attendance Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Hours</CardTitle>
						<Timer className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								`${parseFloat(stats?.totalHours || "0").toFixed(1)}h`
							)}
						</div>
						<p className="text-xs text-green-600 flex items-center">
							<TrendingUp className="h-3 w-3 mr-1" />
							This month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Regular Hours</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								`${parseFloat(stats?.regularHours || "0").toFixed(1)}h`
							)}
						</div>
						<p className="text-xs text-green-600">Regular work hours</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								`${parseFloat(stats?.overtimeHours || "0").toFixed(1)}h`
							)}
						</div>
						<p className="text-xs text-yellow-600">Overtime this period</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : stats?.attendanceRate ? (
								`${(stats.attendanceRate * 100).toFixed(1)}%`
							) : (
								"N/A"
							)}
						</div>
						<p className="text-xs text-green-600">This month</p>
					</CardContent>
				</Card>
			</div>

			{/* Current Status */}
			{runningRecord && (
				<Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
									<Clock className="h-6 w-6 text-green-600 dark:text-green-300" />
								</div>
								<div>
									<h3 className="font-semibold text-lg">Currently Clocked In</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										Clocked in at: {new Date(runningRecord.clockInTime).toLocaleString()}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										Duration:{" "}
										{Math.floor(
											(new Date().getTime() - new Date(runningRecord.clockInTime).getTime()) /
												(1000 * 60 * 60)
										)}
										h{" "}
										{Math.floor(
											((new Date().getTime() - new Date(runningRecord.clockInTime).getTime()) %
												(1000 * 60 * 60)) /
												60000
										)}
										m
									</p>
								</div>
							</div>
							<Button onClick={handleClockInOut}>
								<Clock className="h-4 w-4 mr-2" />
								Clock Out
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Attendance Management */}
			<Tabs defaultValue="records" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="records">
						Attendance Records ({attendanceRecords.length})
					</TabsTrigger>
					<TabsTrigger value="timecards">
						Time Cards ({timeCards.length})
					</TabsTrigger>
					<TabsTrigger value="stats">Statistics</TabsTrigger>
				</TabsList>

				{/* Attendance Records Tab */}
				<TabsContent value="records" className="mt-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Attendance Records</CardTitle>
									<CardDescription>View and manage all attendance records</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search records..."
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
											<SelectItem value="present">Present</SelectItem>
											<SelectItem value="absent">Absent</SelectItem>
											<SelectItem value="late">Late</SelectItem>
											<SelectItem value="on_leave">On Leave</SelectItem>
											<SelectItem value="sick">Sick</SelectItem>
											<SelectItem value="holiday">Holiday</SelectItem>
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
							) : attendanceRecords.length === 0 ? (
								<div className="text-center py-12">
									<Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
										No attendance records found
									</h3>
									<p className="text-slate-600 dark:text-slate-300 mb-4">
										Get started by clocking in
									</p>
									<Button onClick={handleClockInOut}>
										<Clock className="h-4 w-4 mr-2" />
										Clock In
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{attendanceRecords.map((record) => (
										<div
											key={record.id}
											className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
										>
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
														<Clock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
													</div>
													<div>
														<h3 className="font-semibold text-lg">
															{new Date(record.clockInTime).toLocaleDateString()}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															{record.clockInTime &&
																new Date(record.clockInTime).toLocaleTimeString()}
															{record.clockOutTime &&
																` - ${new Date(record.clockOutTime).toLocaleTimeString()}`}
														</p>
													</div>
													<Badge className={getStatusColor(record.status)}>
														{record.status}
													</Badge>
												</div>
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Clock In</p>
													<p className="font-semibold">
														{new Date(record.clockInTime).toLocaleTimeString()}
													</p>
												</div>
												{record.clockOutTime && (
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-300">Clock Out</p>
														<p className="font-semibold">
															{new Date(record.clockOutTime).toLocaleTimeString()}
														</p>
													</div>
												)}
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
													<p className="font-semibold">
														{record.duration ? `${parseFloat(record.duration).toFixed(1)}h` : "N/A"}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Method</p>
													<p className="font-semibold capitalize">
														{record.clockInMethod || "N/A"}
													</p>
												</div>
											</div>

											{record.clockInLocation && (
												<div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
													<MapPin className="h-4 w-4" />
													{record.clockInLocation.address || "Location recorded"}
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Time Cards Tab */}
				<TabsContent value="timecards" className="mt-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Time Cards</CardTitle>
									<CardDescription>View and approve time cards</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{timeCards.length === 0 ? (
								<div className="text-center py-12">
									<Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
									<p className="text-slate-600 dark:text-slate-300">No time cards found</p>
								</div>
							) : (
								<div className="space-y-4">
									{timeCards.map((timeCard) => (
										<div
											key={timeCard.id}
											className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
										>
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
														<Calendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
													</div>
													<div>
														<h3 className="font-semibold text-lg">
															{new Date(timeCard.payPeriodStart).toLocaleDateString()} -{" "}
															{new Date(timeCard.payPeriodEnd).toLocaleDateString()}
														</h3>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															{timeCard.payFrequency} • {timeCard.status}
														</p>
													</div>
													<Badge className={getTimeCardStatusColor(timeCard.status)}>
														{timeCard.status}
													</Badge>
												</div>
												{timeCard.status === "submitted" && (
													<div className="flex items-center gap-2">
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleApproveTimeCard(timeCard.id)}
															disabled={updateStatusMutation.isPending}
														>
															<CheckCircle className="h-4 w-4 mr-1" />
															Approve
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleRejectTimeCard(timeCard.id, "Rejected")}
															disabled={updateStatusMutation.isPending}
														>
															<XCircle className="h-4 w-4 mr-1" />
															Reject
														</Button>
													</div>
												)}
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Total Hours</p>
													<p className="font-semibold">
														{parseFloat(timeCard.totalHours || "0").toFixed(1)}h
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Regular Hours</p>
													<p className="font-semibold">
														{parseFloat(timeCard.regularHours || "0").toFixed(1)}h
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Overtime Hours</p>
													<p className="font-semibold">
														{parseFloat(timeCard.overtimeHours || "0").toFixed(1)}h
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Days Present</p>
													<p className="font-semibold">{timeCard.daysPresent || 0} days</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value="stats" className="mt-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Attendance Summary</CardTitle>
								<CardDescription>Monthly attendance statistics</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Total Hours</span>
										<Badge variant="secondary">
											{parseFloat(stats?.totalHours || "0").toFixed(1)}h
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Regular Hours</span>
										<Badge variant="secondary">
											{parseFloat(stats?.regularHours || "0").toFixed(1)}h
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Overtime Hours</span>
										<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
											{parseFloat(stats?.overtimeHours || "0").toFixed(1)}h
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Attendance Rate</span>
										<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
											{stats?.attendanceRate
												? `${(stats.attendanceRate * 100).toFixed(1)}%`
												: "N/A"}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Latest attendance records</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{attendanceRecords.slice(0, 5).map((record) => (
										<div key={record.id} className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
													<Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
												</div>
												<div>
													<p className="font-medium">
														{new Date(record.clockInTime).toLocaleDateString()}
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-300">
														{new Date(record.clockInTime).toLocaleTimeString()}
														{record.clockOutTime &&
															` - ${new Date(record.clockOutTime).toLocaleTimeString()}`}
													</p>
												</div>
											</div>
											<Badge className={getStatusColor(record.status)}>{record.status}</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			<AttendanceClockDialog
				open={isClockDialogOpen}
				onOpenChange={setIsClockDialogOpen}
				employeeId={employeeId}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}

