/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState, useEffect, useCallback } from "react";
import type { GradientAlertProps } from "@/components/ui/alert";

export interface Alert extends Omit<GradientAlertProps, "onClose"> {
	id: string;
}

export interface UseAlertsOptions {
	limit?: number;
	isDismissed?: boolean;
}

export interface UseAlertsReturn {
	alerts: Alert[];
	loading: boolean;
	error: string | null;
	createAlert: (alert: Omit<Alert, "id">) => Promise<void>;
	markAsRead: (id: string) => Promise<void>;
	dismissAlert: (id: string) => Promise<void>;
}

export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createAlert = useCallback(async (alert: Omit<Alert, "id">) => {
		const newAlert: Alert = {
			...alert,
			id: `_${Math.random().toString(36).substr(2, 9)}`,
		};
		setAlerts((prev) => [...prev, newAlert]);
	}, []);

	const markAsRead = useCallback(async (id: string) => {
		setAlerts((prev) =>
			prev.map((alert) =>
				alert.id === id ? { ...alert } : alert
			)
		);
	}, []);

	const dismissAlert = useCallback(async (id: string) => {
		setAlerts((prev) => prev.filter((alert) => alert.id !== id));
	}, []);

	useEffect(() => {
		// Stub implementation - in a real app, this would fetch from API
		setLoading(false);
	}, []);

	return {
		alerts,
		loading,
		error,
		createAlert,
		markAsRead,
		dismissAlert,
	};
}

