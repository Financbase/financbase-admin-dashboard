/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useClockIn,
	useClockOut,
	useRunningAttendanceRecord,
} from "@/hooks/hr/use-attendance";
import { Clock, MapPin, Loader2 } from "lucide-react";

interface AttendanceClockDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employeeId?: string;
	contractorId?: string;
	onSuccess?: () => void;
}

export function AttendanceClockDialog({
	open,
	onOpenChange,
	employeeId,
	contractorId,
	onSuccess,
}: AttendanceClockDialogProps) {
	const clockInMutation = useClockIn();
	const clockOutMutation = useClockOut();
	const { data: runningRecord } = useRunningAttendanceRecord(employeeId, contractorId);

	const [location, setLocation] = useState<{ latitude?: number; longitude?: number; address?: string } | null>(null);
	const [method, setMethod] = useState<"web" | "mobile" | "kiosk" | "biometric" | "api" | "manual">("web");
	const [notes, setNotes] = useState("");

	useEffect(() => {
		if (navigator.geolocation && open) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLocation({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				},
				() => {
					// Location permission denied or error
					setLocation(null);
				}
			);
		}
	}, [open]);

	const handleClockIn = async () => {
		await clockInMutation.mutateAsync({
			employeeId,
			contractorId,
			location: location || undefined,
			method,
			notes: notes || undefined,
		});
		onOpenChange(false);
		setNotes("");
		onSuccess?.();
	};

	const handleClockOut = async () => {
		if (runningRecord) {
			await clockOutMutation.mutateAsync({
				attendanceRecordId: runningRecord.id,
				location: location || undefined,
				method,
				notes: notes || undefined,
			});
			onOpenChange(false);
			setNotes("");
			onSuccess?.();
		}
	};

	const isRunning = !!runningRecord;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						{isRunning ? "Clock Out" : "Clock In"}
					</DialogTitle>
					<DialogDescription>
						{isRunning
							? "You are currently clocked in. Click to clock out."
							: "Record your attendance for today"}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{isRunning && (
						<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
							<p className="text-sm font-medium">Clocked in:</p>
							<p className="text-sm text-muted-foreground">
								{new Date(runningRecord.clockInTime).toLocaleString()}
							</p>
						</div>
					)}

					<div className="space-y-2">
						<Label>Method</Label>
						<Select value={method} onValueChange={(value: any) => setMethod(value)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="web">Web</SelectItem>
								<SelectItem value="mobile">Mobile</SelectItem>
								<SelectItem value="kiosk">Kiosk</SelectItem>
								<SelectItem value="biometric">Biometric</SelectItem>
								<SelectItem value="api">API</SelectItem>
								<SelectItem value="manual">Manual</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{location && (
						<div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
							<MapPin className="h-4 w-4" />
							<div className="text-sm">
								<p className="font-medium">Location captured</p>
								<p className="text-muted-foreground text-xs">
									{location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
								</p>
							</div>
						</div>
					)}

					<div className="space-y-2">
						<Label>Notes (optional)</Label>
						<Textarea
							placeholder="Add any notes..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={isRunning ? handleClockOut : handleClockIn}
						disabled={clockInMutation.isPending || clockOutMutation.isPending}
					>
						{clockInMutation.isPending || clockOutMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : isRunning ? (
							"Clock Out"
						) : (
							"Clock In"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

