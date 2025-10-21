"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { memo } from "react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "default" | "destructive" | "warning" | "info";
	isLoading?: boolean;
}

const variantConfig = {
	default: {
		icon: CheckCircle,
		iconColor: "text-green-600",
		confirmVariant: "default" as const,
	},
	destructive: {
		icon: XCircle,
		iconColor: "text-red-600",
		confirmVariant: "destructive" as const,
	},
	warning: {
		icon: AlertTriangle,
		iconColor: "text-yellow-600",
		confirmVariant: "default" as const,
	},
	info: {
		icon: Info,
		iconColor: "text-blue-600",
		confirmVariant: "default" as const,
	},
};

export const ConfirmDialog = memo(function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "default",
	isLoading = false,
}: ConfirmDialogProps) {
	const config = variantConfig[variant];
	const Icon = config.icon;

	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			<div className="space-y-4">
				<div className="flex items-start gap-3">
					<Icon className={`h-5 w-5 mt-0.5 ${config.iconColor}`} />
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						{cancelText}
					</Button>
					<Button
						variant={config.confirmVariant}
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
});
