"use client";

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
import { type FolderUser, useFolderSharing } from "@/hooks/use-folder-sharing";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	CheckCircle,
	Folder,
	Key,
	User as UserIcon,
	XCircle,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

// Define the type for a user
export interface User {
	id: string;
	name: string;
	email: string;
	avatar: string;
	role: "Owner" | "Editor" | "Viewer";
}

// Define the props for the ShareCard component
export interface ShareCardProps {
	folderId: string;
	folderName?: string;
	itemCount?: number;
	className?: string;
}

export const ShareCard = ({
	folderId,
	folderName,
	itemCount = 0,
	className,
}: ShareCardProps) => {
	const { data, loading, error, inviteUser, changeUserRole } =
		useFolderSharing(folderId);

	const [inviteEmail, setInviteEmail] = React.useState("");
	const [inviteRole, setInviteRole] =
		React.useState<Omit<User["role"], "Owner">>("Viewer");

	const handleInviteClick = async () => {
		if (!inviteEmail.trim()) {
			toast.error("Please enter an email address");
			return;
		}

		const result = await inviteUser(
			inviteEmail.trim(),
			inviteRole.toLowerCase() as "owner" | "editor" | "viewer",
		);

		if (result.success) {
			setInviteEmail("");
		}
	};

	const handleRoleChange = async (
		userId: string,
		newRole: Omit<User["role"], "Owner">,
	) => {
		await changeUserRole(
			userId,
			newRole.toLowerCase() as "owner" | "editor" | "viewer",
		);
	};

	// Animation variants for the list container and items
	const listVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	if (loading) {
		return (
			<div
				className={cn(
					"w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-sm p-6",
					className,
				)}
			>
				<div className="flex items-center justify-center h-32">
					<div className="text-sm text-muted-foreground">
						Loading folder sharing...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={cn(
					"w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-sm p-6",
					className,
				)}
			>
				<div className="flex items-center justify-center h-32">
					<div className="text-sm text-destructive">
						Error loading folder sharing: {error}
					</div>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div
				className={cn(
					"w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-sm p-6",
					className,
				)}
			>
				<div className="flex items-center justify-center h-32">
					<div className="text-sm text-muted-foreground">
						No folder data available
					</div>
				</div>
			</div>
		);
	}

	const users = data.users as User[];

	return (
		<div
			className={cn(
				"w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-sm p-6 space-y-6",
				className,
			)}
		>
			{/* Card Header */}
			<div className="flex items-center space-x-4">
				<div className="flex items-center justify-center w-12 h-12 rounded-lg">
					{/* Placeholder for folder image/icon */}
					<img
						src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=320&q=75"
						alt="Folder Thumbnail"
						className="w-full h-full object-cover rounded-lg"
					/>
				</div>
				<div>
					<h2 className="text-lg font-semibold">
						{folderName || data.folder.name}
					</h2>
					<p className="text-sm text-muted-foreground">{itemCount} Items</p>
				</div>
			</div>

			{/* Share Section */}
			<div className="space-y-2">
				<p className="text-sm font-medium">Share this folder</p>
				<div className="flex flex-col sm:flex-row gap-2">
					<Input
						type="email"
						placeholder="Add an email or name"
						value={inviteEmail}
						onChange={(e) => setInviteEmail(e.target.value)}
						className="flex-grow"
					/>
					<div className="flex gap-2">
						<Select
							value={inviteRole}
							onValueChange={(value: Omit<User["role"], "Owner">) =>
								setInviteRole(value)
							}
						>
							<SelectTrigger className="w-full sm:w-[120px]">
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Viewer">Can view</SelectItem>
								<SelectItem value="Editor">Can edit</SelectItem>
							</SelectContent>
						</Select>
						<Button onClick={handleInviteClick}>Send Invite</Button>
					</div>
				</div>
			</div>

			{/* Access List Section */}
			<div className="space-y-4">
				<h3 className="text-sm font-medium">Access</h3>
				<motion.ul
					className="space-y-4"
					variants={listVariants}
					initial="hidden"
					animate="visible"
				>
					<AnimatePresence>
						{users.map((user) => (
							<motion.li
								key={user.id}
								variants={itemVariants}
								className="flex items-center justify-between"
								layout
							>
								<div className="flex items-center gap-3">
									<Avatar className="w-9 h-9">
										<AvatarImage src={user.avatar} alt={user.name} />
										<AvatarFallback>
											{user.name
												.split(" ")
												.map((n) => n[0])
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

								{user.role === "Owner" ? (
									<span className="text-sm text-muted-foreground">Owner</span>
								) : (
									<Select
										value={user.role}
										onValueChange={(newRole: Omit<User["role"], "Owner">) =>
											handleRoleChange(user.id, newRole)
										}
									>
										<SelectTrigger className="w-[120px] text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Viewer">Can view</SelectItem>
											<SelectItem value="Editor">Can edit</SelectItem>
										</SelectContent>
									</Select>
								)}
							</motion.li>
						))}
					</AnimatePresence>
				</motion.ul>
			</div>
		</div>
	);
};
