"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	CheckCircle,
	ChevronDown,
	Code,
	Filter,
	Info,
	Loader2,
	MessageCircle,
	Minus,
	Trash2,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RuixenMenuOptionsProps {
	entityType: string;
	entityId: string;
	entityName?: string;
	onActionComplete?: () => void;
}

export default function RuixenMenuOptions({
	entityType,
	entityId,
	entityName = "Item",
	onActionComplete,
}: RuixenMenuOptionsProps) {
	const [loading, setLoading] = useState<string | null>(null);
	const [isPinned, setIsPinned] = useState(false);

	// Check if item is pinned on mount
	useEffect(() => {
		checkIfPinned();
	}, [entityType, entityId]);

	const checkIfPinned = async () => {
		try {
			const response = await fetch(
				`/api/items/${entityType}/${entityId}/is-pinned`,
			);
			if (response.ok) {
				const data = (await response.json()) as { pinned: boolean };
				setIsPinned(data.pinned);
			}
		} catch (error) {
			// Silently fail if API is not available yet - this is expected during development
			console.log("API not available yet, defaulting to unpinned state");
		}
	};

	const handleAction = async (action: string, params?: Record<string, any>) => {
		setLoading(action);

		try {
			const response = await fetch(
				`/api/items/${entityType}/${entityId}/${action}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(params || {}),
				},
			);

			// If API is not available yet, show a development message
			if (!response.ok && response.status === 404) {
				toast.info(
					`API endpoint not available yet. ${action} action would be performed here.`,
				);
				setLoading(null);
				return;
			}

			const data = (await response.json()) as {
				error?: string;
				message?: string;
			};

			if (!response.ok) {
				throw new Error(data.error || `Failed to ${action} ${entityName}`);
			}

			// Show success message
			toast.success(data.message || `${entityName} ${action}ed successfully`);

			// Update local state for pin/unpin
			if (action === "pin") {
				setIsPinned(true);
			} else if (action === "unpin") {
				setIsPinned(false);
			}

			// Call completion callback
			onActionComplete?.();
		} catch (error) {
			console.error(`Error ${action}ing ${entityName}:`, error);

			// For development, show a helpful message instead of error
			if (error instanceof Error && error.message.includes("fetch")) {
				toast.info(
					`API not available yet. ${action} functionality will work once backend is deployed.`,
				);
			} else {
				toast.error(
					error instanceof Error
						? error.message
						: `Failed to ${action} ${entityName}`,
				);
			}
		} finally {
			setLoading(null);
		}
	};

	const handleRename = async () => {
		const newName = prompt(`Enter new name for ${entityName}:`);
		if (newName?.trim()) {
			await handleAction("rename", { newName: newName.trim() });
		}
	};

	const handleClone = async () => {
		const newName = prompt(`Enter name for cloned ${entityName}:`);
		if (newName?.trim()) {
			await handleAction("clone", { newName: newName.trim() });
		}
	};

	const handleShare = async () => {
		const shareWith = prompt(
			"Enter email addresses to share with (comma-separated):",
		);
		if (shareWith?.trim()) {
			const emails = shareWith
				.split(",")
				.map((email) => email.trim())
				.filter((email) => email);
			if (emails.length > 0) {
				await handleAction("share", { sharedWith: emails });
			}
		}
	};

	const handlePinToggle = async () => {
		if (isPinned) {
			await handleAction("unpin");
		} else {
			await handleAction("pin");
		}
	};

	const handleViewLogs = async () => {
		try {
			setLoading("view_logs");
			const response = await fetch(`/api/items/${entityType}/${entityId}/logs`);

			if (!response.ok) {
				const errorData = (await response.json()) as { error?: string };
				throw new Error(errorData.error || "Failed to fetch logs");
			}

			const logs = (await response.json()) as Array<{
				id: string;
				action: string;
				details: Record<string, any>;
				createdAt: string;
				user?: {
					id: string;
					name: string;
					email: string;
				};
			}>;

			// Show logs in a simple alert for now (could be enhanced with a modal)
			const logsText = logs
				.map(
					(log) =>
						`[${log.createdAt}] ${log.user?.name || "Unknown"}: ${log.action}`,
				)
				.join("\n");

			alert(`Recent activity for ${entityName}:\n\n${logsText}`);
		} catch (error) {
			console.error("Error fetching logs:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to fetch logs",
			);
		} finally {
			setLoading(null);
		}
	};

	const handleDelete = async () => {
		const confirmed = confirm(
			`Are you sure you want to delete "${entityName}"? This action cannot be undone.`,
		);
		if (confirmed) {
			await handleAction("delete");
		}
	};

	const isLoading = (action: string) => loading === action;

	return (
		<div className="flex justify-center items-center">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="secondary" className="flex items-center gap-2">
						⚙️ Actions Panel
						<ChevronDown className="opacity-60" size={16} strokeWidth={2} />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-56 rounded-xl shadow-lg">
					{/* Quick Edits */}
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={handleRename}
							disabled={isLoading("rename")}
							title="Make changes to the current item"
						>
							{isLoading("rename") ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<span className="mr-2">✏️</span>
							)}
							Rename
							<DropdownMenuShortcut>⌘ R</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleClone}
							disabled={isLoading("clone")}
							title="Create a copy"
						>
							{isLoading("clone") ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<span className="mr-2">🧬</span>
							)}
							Clone
							<DropdownMenuShortcut>⌘ C</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Organize */}
					<DropdownMenuGroup>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>🗂 Move</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem>📁 To Folder</DropdownMenuItem>
								<DropdownMenuItem>📌 To Project</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuItem
							onClick={handlePinToggle}
							disabled={isLoading("pin") || isLoading("unpin")}
							title={
								isPinned
									? "Remove from favorites"
									: "Add to your favorites list"
							}
						>
							{isLoading("pin") || isLoading("unpin") ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<span className="mr-2">{isPinned ? "⭐" : "☆"}</span>
							)}
							{isPinned ? "Unpin Item" : "Pin Item"}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleShare}
							disabled={isLoading("share")}
							title="Collaborate with others"
						>
							{isLoading("share") ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<span className="mr-2">🤝</span>
							)}
							Share
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Settings */}
					<DropdownMenuGroup>
						<DropdownMenuItem>🔧 Settings</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleViewLogs}
							disabled={isLoading("view_logs")}
							title="View activity logs"
						>
							{isLoading("view_logs") ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<span className="mr-2">📜</span>
							)}
							View Logs
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Destructive */}
					<DropdownMenuItem
						className="text-red-600 focus:text-red-700"
						onClick={handleDelete}
						disabled={isLoading("delete")}
						title="Permanently remove this item"
					>
						{isLoading("delete") ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<span className="mr-2">🗑</span>
						)}
						Delete Forever
						<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
