/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	AlertTriangle,
	CheckCircle2,
	FileText,
	Info,
	X,
	XCircle,
} from "lucide-react";
import { useEffect } from "react";

export type ModalType = "info" | "success" | "warning" | "error" | "confirm";

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	type?: ModalType;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	children?: React.ReactNode;
	showCloseButton?: boolean;
	closeOnOverlayClick?: boolean;
	closeOnEscape?: boolean;
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
		loading?: boolean;
	}[];
}

export function Modal({
	isOpen,
	onClose,
	title,
	description,
	type = "info",
	size = "md",
	children,
	showCloseButton = true,
	closeOnOverlayClick = true,
	closeOnEscape = true,
	actions = [],
}: ModalProps) {
	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && closeOnEscape) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose, closeOnEscape]);

	if (!isOpen) return null;

	const getIcon = () => {
		switch (type) {
			case "success":
				return <CheckCircle2 className="h-6 w-6 text-green-600" />;
			case "warning":
				return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
			case "error":
				return <AlertTriangle className="h-6 w-6 text-red-600" />;
			case "confirm":
				return <AlertTriangle className="h-6 w-6 text-blue-600" />;
			default:
				return <Info className="h-6 w-6 text-blue-600" />;
		}
	};

	const getSizeClass = () => {
		switch (size) {
			case "sm":
				return "max-w-md";
			case "md":
				return "max-w-lg";
			case "lg":
				return "max-w-2xl";
			case "xl":
				return "max-w-4xl";
			case "full":
				return "max-w-full mx-4";
			default:
				return "max-w-lg";
		}
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && closeOnOverlayClick) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div
				className={`w-full ${getSizeClass()} max-h-[90vh] overflow-y-auto`}
				onClick={handleOverlayClick}
			>
				<Card className="relative">
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-3">
								{getIcon()}
								<div>
									{title && <CardTitle className="text-lg">{title}</CardTitle>}
									{description && (
										<CardDescription className="mt-1">
											{description}
										</CardDescription>
									)}
								</div>
							</div>
							{showCloseButton && (
								<Button
									variant="ghost"
									size="sm"
									onClick={onClose}
									className="h-8 w-8 p-0"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</CardHeader>
					{children && <CardContent>{children}</CardContent>}
					{actions.length > 0 && (
						<div className="flex items-center justify-end gap-2 p-6 pt-0">
							{actions.map((action, index) => (
								<Button
									key={index}
									variant={action.variant || "outline"}
									onClick={action.onClick}
									disabled={action.loading}
								>
									{action.loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
											Loading...
										</>
									) : (
										action.label
									)}
								</Button>
							))}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}

// Convenience components for common modal types
export function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title = "Confirm Action",
	description = "Are you sure you want to proceed?",
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	loading = false,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
}) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			description={description}
			type="confirm"
			size="sm"
			actions={[
				{
					label: cancelLabel,
					onClick: onClose,
					variant: "outline",
				},
				{
					label: confirmLabel,
					onClick: onConfirm,
					variant: "destructive",
					loading,
				},
			]}
		/>
	);
}

export function AlertModal({
	isOpen,
	onClose,
	title,
	description,
	type = "info",
	buttonLabel = "OK",
}: {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	type?: ModalType;
	buttonLabel?: string;
}) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			description={description}
			type={type}
			size="sm"
			actions={[
				{
					label: buttonLabel,
					onClick: onClose,
					variant: "default",
				},
			]}
		/>
	);
}
