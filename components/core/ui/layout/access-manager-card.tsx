/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/core/ui/layout/tooltip";
import { useAccessManagement } from "@/hooks/use-access-management";
import { AccessMember, AccessInvitation } from "@/lib/types/access-management";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	FolderIcon,
	Key,
	Loader2,
	Users,
	XCircle,
} from "lucide-react";
import * as React from "react";

export interface AccessManagerCardProps {
	folderId?: number;
	title?: string;
	description?: string;
	folderIcon?: React.ReactNode;
	folderName: string;
	itemCount?: number;
	invitePlaceholder?: string;
	showInviteSection?: boolean;
	showHeaderIcon?: boolean;
	className?: string;
}

export const AccessManagerCard = ({
	folderId,
	title = "Access Manager",
	description = "Manage who can view or edit this folder.",
	folderIcon = <FolderIcon className="h-5 w-5 text-primary" />,
	folderName,
	itemCount,
	invitePlaceholder = "Add an email to invite",
	showInviteSection = true,
	showHeaderIcon = true,
	className,
}: AccessManagerCardProps) => {
	const [email, setEmail] = React.useState("");
	const [role, setRole] = React.useState<"Editor" | "Viewer">("Viewer");
	const handleInviteRoleChange = (value: string) => {
		setRole(value as "Editor" | "Viewer");
	};

	const {
		members,
		invitations,
		userPermissions,
		isLoading,
		isInviting,
		error,
		inviteMember,
		updateMemberRole,
		removeMember,
		clearError,
	} = useAccessManagement({ folderId });

	const handleInvite = async () => {
		if (!email || !userPermissions.canInvite) return;

		try {
			await inviteMember({ email, role });
			setEmail("");
		} catch (err) {
			// Error is handled by the hook
		}
	};

	const handleRoleChange = async (
		memberId: string,
		newRole: "Editor" | "Viewer",
	) => {
		if (!userPermissions.canChangeRoles) return;

		try {
			await updateMemberRole(memberId, newRole);
		} catch (err) {
			// Error is handled by the hook
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!userPermissions.canRemove) return;

		try {
			await removeMember(memberId);
		} catch (err) {
			// Error is handled by the hook
		}
	};

	const listVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.06 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		visible: { opacity: 1, y: 0 },
	};

	if (isLoading) {
		return (
			<div
				className={cn(
					"w-full max-w-lg rounded-2xl border bg-card p-6 shadow-sm text-card-foreground",
					className,
				)}
			>
				<div className="flex items-center justify-center h-32">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div
				className={cn(
					"w-full max-w-lg rounded-2xl border bg-card p-6 shadow-sm text-card-foreground space-y-6",
					className,
				)}
			>
				{/* Error Alert */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="flex items-center justify-between">
							{error}
							<Button
								variant="ghost"
								size="sm"
								onClick={clearError}
								className="h-auto p-1"
							>
								×
							</Button>
						</AlertDescription>
					</Alert>
				)}

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{showHeaderIcon && <div>{folderIcon}</div>}
						<div>
							<h2 className="text-lg font-semibold">{title}</h2>
							<p className="text-sm text-muted-foreground">{description}</p>
						</div>
					</div>
					<div className="flex items-center gap-1 text-muted-foreground">
						<Users className="h-4 w-4" />
						<span className="text-xs">{members.length} members</span>
					</div>
				</div>

				{/* Folder Info */}
				<div className="flex items-center gap-3">
					<img
						src={`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=320&h=320&fit=crop&crop=entropy&cs=tinysrgb`}
						alt="Folder Thumbnail"
						className="h-12 w-12 rounded-lg object-cover"
					/>
					<div>
						<p className="font-medium">{folderName}</p>
						{itemCount !== undefined && (
							<p className="text-sm text-muted-foreground">{itemCount} items</p>
						)}
					</div>
				</div>

				{/* Invite Section */}
				{showInviteSection && userPermissions.canInvite && (
					<div className="space-y-2">
						<p className="text-sm font-medium">Invite People</p>
						<div className="flex flex-col sm:flex-row gap-2">
							<Input
								type="email"
								placeholder={invitePlaceholder}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="flex-grow"
								disabled={isInviting}
							/>
							<Select
								value={role}
								onValueChange={handleInviteRoleChange}
								disabled={isInviting}
							>
								<SelectTrigger className="sm:w-[120px] whitespace-nowrap truncate">
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Viewer">Can view</SelectItem>
									<SelectItem value="Editor">Can edit</SelectItem>
								</SelectContent>
							</Select>
							<Button onClick={handleInvite} disabled={isInviting || !email}>
								{isInviting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Inviting...
									</>
								) : (
									"Invite"
								)}
							</Button>
						</div>
					</div>
				)}

				{/* Members List */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Members</h3>
					<motion.ul
						className="space-y-3"
						variants={listVariants}
						initial="hidden"
						animate="visible"
					>
						<AnimatePresence>
							{members.map((user) => (
								<motion.li
									key={user.id}
									variants={itemVariants}
									layout
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9">
											<AvatarImage src={user.avatar} alt={user.name} />
											<AvatarFallback>
										{user.name
											.split(" ")
											.map((n: string) => n[0])
											.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="text-sm font-medium">{user.name}</p>
											<p className="text-xs text-muted-foreground">
												{user.email}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Tooltip>
											<TooltipTrigger asChild>
												{user.role === "Owner" ? (
													<span className="text-xs text-muted-foreground whitespace-nowrap">
														Owner
													</span>
												) : (
													<Select
														value={user.role}
														onValueChange={(val: "Editor" | "Viewer") =>
															updateMemberRole(user.id, val)
														}
														disabled={!userPermissions.canChangeRoles}
													>
														<SelectTrigger className="w-[120px] text-xs whitespace-nowrap truncate">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem
																value="Viewer"
																className="whitespace-nowrap"
															>
																Can view
															</SelectItem>
															<SelectItem
																value="Editor"
																className="whitespace-nowrap"
															>
																Can edit
															</SelectItem>
														</SelectContent>
													</Select>
												)}
											</TooltipTrigger>
											<TooltipContent>
												Change or view this user's access level
											</TooltipContent>
										</Tooltip>

										{user.role !== "Owner" && userPermissions.canRemove && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveMember(user.id)}
												className="text-destructive hover:text-destructive"
											>
												Remove
											</Button>
										)}
									</div>
								</motion.li>
							))}
						</AnimatePresence>
					</motion.ul>
				</div>

				{/* Pending Invitations */}
				{invitations.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-sm font-medium">Pending Invitations</h3>
						<div className="space-y-2">
							{invitations.map((invitation: AccessInvitation) => (
								<div
									key={invitation.id}
									className="flex items-center justify-between p-2 bg-muted rounded-lg"
								>
									<div>
										<p className="text-sm font-medium">{invitation.email}</p>
										<p className="text-xs text-muted-foreground capitalize">
											{invitation.role}
											{invitation.expiresAt && (
												<> • Expires {new Date(invitation.expiresAt).toLocaleDateString()}</>
											)}
										</p>
									</div>
									<span className="text-xs text-muted-foreground">Pending</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
};
