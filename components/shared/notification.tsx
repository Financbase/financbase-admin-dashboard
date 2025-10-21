"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	AlertTriangle,
	Bell,
	CheckCircle2,
	Filter,
	Info,
	Key,
	MessageCircle,
	X,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	duration?: number;
	actions?: {
		label: string;
		onClick: () => void;
		variant?:
			| "default"
			| "destructive"
			| "outline"
			| "secondary"
			| "ghost"
			| "link";
	}[];
}

export interface NotificationProps {
	notification: Notification;
	onRemove: (id: string) => void;
}

export function NotificationComponent({
	notification,
	onRemove,
}: NotificationProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);

	useEffect(() => {
		// Animate in
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (notification.duration && notification.duration > 0) {
			const timer = setTimeout(() => {
				handleRemove();
			}, notification.duration);
			return () => clearTimeout(timer);
		}
	}, [notification.duration]);

	const handleRemove = () => {
		setIsRemoving(true);
		setTimeout(() => {
			onRemove(notification.id);
		}, 300);
	};

	const getIcon = () => {
		switch (notification.type) {
			case "success":
				return <CheckCircle2 className="h-5 w-5 text-green-600" />;
			case "warning":
				return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
			case "error":
				return <AlertTriangle className="h-5 w-5 text-red-600" />;
			default:
				return <Info className="h-5 w-5 text-blue-600" />;
		}
	};

	const getBorderColor = () => {
		switch (notification.type) {
			case "success":
				return "border-l-green-500";
			case "warning":
				return "border-l-yellow-500";
			case "error":
				return "border-l-red-500";
			default:
				return "border-l-blue-500";
		}
	};

	return (
		<Card
			className={`w-full max-w-sm border-l-4 ${getBorderColor()} transition-all duration-300 ${
				isVisible && !isRemoving
					? "translate-x-0 opacity-100"
					: "translate-x-full opacity-0"
			}`}
		>
			<CardContent className="p-4">
				<div className="flex items-start gap-3">
					{getIcon()}
					<div className="flex-1 min-w-0">
						<h4 className="font-medium text-sm">{notification.title}</h4>
						{notification.message && (
							<p className="text-sm text-muted-foreground mt-1">
								{notification.message}
							</p>
						)}
						{notification.actions && notification.actions.length > 0 && (
							<div className="flex items-center gap-2 mt-3">
								{notification.actions.map((action, index) => (
									<Button
										key={index}
										variant={action.variant || "outline"}
										size="sm"
										onClick={action.onClick}
									>
										{action.label}
									</Button>
								))}
							</div>
						)}
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRemove}
						className="h-6 w-6 p-0 flex-shrink-0"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// Notification Container
export function NotificationContainer({
	notifications,
	onRemove,
}: {
	notifications: Notification[];
	onRemove: (id: string) => void;
}) {
	return (
		<div className="fixed top-4 right-4 z-50 space-y-2">
			{notifications.map((notification) => (
				<NotificationComponent
					key={notification.id}
					notification={notification}
					onRemove={onRemove}
				/>
			))}
		</div>
	);
}

// Notification Hook
export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const addNotification = (notification: Omit<Notification, "id">) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newNotification: Notification = {
			id,
			duration: 5000, // Default 5 seconds
			...notification,
		};

		setNotifications((prev) => [...prev, newNotification]);
		return id;
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const clearAll = () => {
		setNotifications([]);
	};

	// Convenience methods
	const notify = {
		info: (title: string, message?: string, options?: Partial<Notification>) =>
			addNotification({ type: "info", title, message, ...options }),
		success: (
			title: string,
			message?: string,
			options?: Partial<Notification>,
		) => addNotification({ type: "success", title, message, ...options }),
		warning: (
			title: string,
			message?: string,
			options?: Partial<Notification>,
		) => addNotification({ type: "warning", title, message, ...options }),
		error: (title: string, message?: string, options?: Partial<Notification>) =>
			addNotification({ type: "error", title, message, ...options }),
	};

	return {
		notifications,
		addNotification,
		removeNotification,
		clearAll,
		notify,
	};
}
