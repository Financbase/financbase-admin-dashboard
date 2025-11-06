/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

export interface CurrentUser {
	id: string;
	clerkId: string;
	organizationId: string | null;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
}

async function fetchCurrentUser(): Promise<CurrentUser> {
	const response = await fetch("/api/auth/me");
	if (!response.ok) {
		throw new Error("Failed to fetch current user");
	}
	return response.json();
}

/**
 * Hook to get the current authenticated user's database information
 * including organizationId
 */
export function useCurrentUser() {
	return useQuery({
		queryKey: ["currentUser"],
		queryFn: fetchCurrentUser,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

