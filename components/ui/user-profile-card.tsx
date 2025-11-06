/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface UserProfileCardProps {
	user?: {
		name: string;
		email: string;
		avatar?: string;
	};
	onEdit?: () => void;
	isLoading?: boolean;
	error?: any;
	onViewProfile?: () => void;
	showStats?: boolean;
	compact?: boolean;
	className?: string;
}

export function Component({ user, onEdit, isLoading, error, onViewProfile, showStats, compact, className }: UserProfileCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>User Profile</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4">
					<Avatar>
						<AvatarImage src={user?.avatar} />
						<AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium">{user?.name || "User"}</p>
						<p className="text-sm text-muted-foreground">{user?.email || "user@example.com"}</p>
					</div>
					{onEdit && <Button onClick={onEdit} size="sm">Edit</Button>}
				</div>
			</CardContent>
		</Card>
	);
}

