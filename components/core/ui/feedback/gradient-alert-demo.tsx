/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { GradientAlert, type GradientAlertProps } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/hooks/use-alerts";
import { AnimatePresence } from "framer-motion";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	File,
	Key,
	Loader2,
	Plus,
	XCircle,
} from "lucide-react";
import * as React from "react";

// A simple unique ID generator
const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

type AlertItem = { id: string } & Omit<GradientAlertProps, "onClose">;

export default function GradientAlertDemo() {
	const { alerts, loading, error, createAlert, markAsRead, dismissAlert } =
		useAlerts({
			limit: 20,
			isDismissed: false,
		});

	// Function to add a new alert to the list
	const addAlert = async (variant: GradientAlertProps["variant"]) => {
		try {
			await createAlert({
				title: variant?.charAt(0).toUpperCase() + variant?.slice(1)!,
				description: "Anyone with a link can now view this file.",
				variant: variant!,
			});
		} catch (err) {
			console.error("Failed to create alert:", err);
		}
	};

	if (loading && alerts.length === 0) {
		return (
			<div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">
				<div className="flex items-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading alerts...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">
				<div className="flex items-center gap-2 text-destructive">
					<AlertCircle className="h-4 w-4" />
					<span>Error: {error}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">
			{/* Controls to trigger alerts */}
			<div className="flex flex-wrap gap-2 justify-center">
				<Button variant="outline" onClick={() => addAlert("information")}>
					Info
				</Button>
				<Button variant="outline" onClick={() => addAlert("success")}>
					Success
				</Button>
				<Button variant="outline" onClick={() => addAlert("warning")}>
					Warning
				</Button>
				<Button variant="outline" onClick={() => addAlert("error")}>
					Error
				</Button>
			</div>

			{/* Container for the alerts */}
			<div className="w-full flex flex-col space-y-2">
				<AnimatePresence>
					{alerts.map((alert) => (
						<GradientAlert
							key={alert.id}
							title={alert.title}
							description={alert.description}
							variant={alert.variant}
							onClose={() => dismissAlert(alert.id)}
						/>
					))}
				</AnimatePresence>

				{alerts.length === 0 && !loading && (
					<div className="text-center text-muted-foreground py-8">
						No alerts yet. Click the buttons above to create some!
					</div>
				)}
			</div>
		</div>
	);
}
