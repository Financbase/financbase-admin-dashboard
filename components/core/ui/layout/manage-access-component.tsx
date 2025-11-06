/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	Check,
	Copy,
	Link,
	Loader2,
	Trash2,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert-simple";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { type AccessMember, useManageAccess } from "@/hooks/use-manage-access";
import { cn } from "@/lib/utils";

// Define types for component props
type Role = "owner" | "editor" | "viewer";
type AccessLevel = "private" | "link";

export interface User {
	id: string;
	name: string;
	email: string;
	avatarUrl: string;
	role: Role;
}

interface ManageAccessProps {
	folderId: number;
	fileUrl?: string;
	className?: string;
}

// Main component
export const ManageAccess = ({
	folderId,
	fileUrl = "https://brainwave.co/file/k373nH",
	className,
}: ManageAccessProps) => {
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<Role>("viewer");
	const [accessLevel, setAccessLevel] = useState<AccessLevel>("private");
	const [removingUserId, setRemovingUserId] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [isInviting, setIsInviting] = useState(false);

	const {
		data,
		isLoading,
		error,
		inviteMember,
		updateMemberRole,
		removeMember,
		updateAccessLevel: updateAccessLevelApi,
	} = useManageAccess({ folderId });

	// Transform API data to component format
	const users: User[] =
		data?.members.map((member: AccessMember) => ({
			id: member.id,
			name: member.name,
			email: member.email,
			avatarUrl:
				member.avatarUrl ||
				`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=150&h=150&fit=crop&crop=face`,
			role: member.role.toLowerCase() as Role,
		})) || [];

	const handleInvite = async () => {
		if (!inviteEmail || isInviting) return;

		setIsInviting(true);
		try {
			await inviteMember(
				inviteEmail,
				inviteRole === "viewer" ? "Viewer" : "Editor",
			);
			setInviteEmail("");
			setInviteRole("viewer");
		} catch (error) {
			// Error is already handled by the hook with toast
		} finally {
			setIsInviting(false);
		}
	};

	const handleRoleChange = async (userId: string, newRole: Role) => {
		try {
			await updateMemberRole(
				userId,
				newRole === "viewer" ? "Viewer" : "Editor",
			);
		} catch (error) {
			// Error is already handled by the hook with toast
		}
	};

	const handleRemoveUser = async (userId: string) => {
		try {
			await removeMember(userId);
			setRemovingUserId(null);
		} catch (error) {
			// Error is already handled by the hook with toast
		}
	};

	const handleAccessChange = async (level: AccessLevel) => {
		setAccessLevel(level);
		try {
			await updateAccessLevelApi(level);
		} catch (error) {
			// Error is already handled by the hook with toast
			// Revert the state change on error
			setAccessLevel(accessLevel);
		}
	};

	const handleCopyLink = () => {
		navigator.clipboard.writeText(fileUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (isLoading) {
		return (
			<Card className={cn("w-full max-w-2xl mx-auto", className)}>
				<CardContent className="flex items-center justify-center p-8">
					<Loader2 className="h-8 w-8 animate-spin" />
					<span className="ml-2">Loading access information...</span>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={cn("w-full max-w-2xl mx-auto", className)}>
				<CardContent className="p-6">
					<Alert variant="destructive">
						<AlertDescription>{error?.message || String(error)}</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return (
			<Card className={cn("w-full max-w-2xl mx-auto", className)}>
				<CardContent className="p-6">
					<Alert>
						<AlertDescription>No access data available</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	const owner = users.find((user) => user.role === "owner");

	return (
		<Card className={cn("w-full max-w-2xl mx-auto", className)}>
			<CardHeader>
				<CardTitle>Share & Access</CardTitle>
				<CardDescription>
					Invite others or share a link to collaborate.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Invite Section */}
				<div className="flex items-center space-x-2">
					<Input
						type="email"
						placeholder="Email, name..."
						className="flex-1"
						value={inviteEmail}
						onChange={(e) => setInviteEmail(e.target.value)}
						disabled={isInviting}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="w-[120px] justify-between"
								disabled={isInviting}
							>
								{inviteRole === "viewer" && "Can view"}
								{inviteRole === "editor" && "Can edit"}
								<ChevronDown className="h-4 w-4 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={() => setInviteRole("viewer")}>
								Can view
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setInviteRole("editor")}>
								Can edit
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button onClick={handleInvite} disabled={!inviteEmail || isInviting}>
						{isInviting ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<UserPlus className="h-4 w-4 mr-2" />
						)}
						Invite
					</Button>
				</div>
				<Separator />
				{/* General Access Section */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium text-foreground">
						General access
					</h3>
					<div
						className={cn(
							"flex items-center p-3 rounded-md border cursor-pointer transition-colors",
							accessLevel === "private" && "bg-muted border-primary",
						)}
						onClick={() => handleAccessChange("private")}
					>
						<Users className="h-8 w-8 mr-4 text-muted-foreground" />
						<div>
							<p className="font-semibold">Only those invited</p>
							<p className="text-sm text-muted-foreground">
								{users.length} people
							</p>
						</div>
					</div>
					<div
						className={cn(
							"flex items-center p-3 rounded-md border cursor-pointer transition-colors",
							accessLevel === "link" && "bg-muted border-primary",
						)}
						onClick={() => handleAccessChange("link")}
					>
						<Link className="h-8 w-8 mr-4 text-muted-foreground" />
						<div>
							<p className="font-semibold">Link access</p>
							<p className="text-sm text-muted-foreground">
								Anyone with the link can view
							</p>
						</div>
					</div>
				</div>
				<Separator />
				{/* People with Access Section */}
				<div className="space-y-2">
					<h3 className="text-sm font-medium text-foreground">
						People with access
					</h3>
					<div className="space-y-3">
						<AnimatePresence>
							{users.map((user) => (
								<motion.div
									key={user.id}
									layout
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
									className="flex items-center justify-between"
								>
									<div className="flex items-center space-x-3">
										<Avatar>
											<AvatarImage src={user.avatarUrl} alt={user.name} />
											<AvatarFallback>
												{user.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{user.name}</p>
											<p className="text-sm text-muted-foreground">
												{user.email}
											</p>
										</div>
									</div>
									{user.role === "owner" ? (
										<div className="flex items-center text-sm text-muted-foreground">
											Owner <Check className="h-4 w-4 ml-2 text-primary" />
										</div>
									) : (
										<div className="flex items-center space-x-2">
											<AnimatePresence mode="wait">
												{removingUserId === user.id ? (
													<motion.div
														key="remove"
														initial={{ opacity: 0, width: 0 }}
														animate={{ opacity: 1, width: "auto" }}
														exit={{ opacity: 0, width: 0 }}
														className="flex items-center space-x-1"
													>
														<Button
															variant="destructive"
															size="sm"
															onClick={() => handleRemoveUser(user.id)}
														>
															<Trash2 className="h-4 w-4 mr-1" />
															Remove
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => setRemovingUserId(null)}
														>
															<X className="h-4 w-4" />
														</Button>
													</motion.div>
												) : (
													<motion.div
														key="actions"
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														exit={{ opacity: 0 }}
														className="flex items-center"
													>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	className="w-[110px] justify-between text-muted-foreground"
																>
																	{user.role === "viewer" && "Can view"}
																	{user.role === "editor" && "Can edit"}
																	<ChevronDown className="h-4 w-4 opacity-50" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent>
																<DropdownMenuItem
																	onSelect={() =>
																		handleRoleChange(user.id, "viewer")
																	}
																>
																	Can view
																</DropdownMenuItem>
																<DropdownMenuItem
																	onSelect={() =>
																		handleRoleChange(user.id, "editor")
																	}
																>
																	Can edit
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => setRemovingUserId(user.id)}
														>
															<X className="h-4 w-4" />
														</Button>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									)}
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</div>
			</CardContent>
			<CardFooter className="bg-muted/50 p-4 flex items-center justify-between rounded-b-lg">
				<div className="flex items-center space-x-2 overflow-hidden">
					<Link className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
					<p className="text-sm text-muted-foreground truncate">{fileUrl}</p>
				</div>
				<Button variant="secondary" onClick={handleCopyLink}>
					{copied ? (
						<Check className="h-4 w-4 mr-2 text-green-500" />
					) : (
						<Copy className="h-4 w-4 mr-2" />
					)}
					{copied ? "Copied!" : "Copy link"}
				</Button>
			</CardFooter>
		</Card>
	);
};
