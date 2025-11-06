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
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUser } from "@clerk/nextjs";

export interface CurrentEmployee {
	id: string;
	userId: string;
	organizationId: string;
	firstName: string;
	lastName: string;
	email: string;
	position: string;
	department: string;
	status: string;
}

async function fetchCurrentEmployee(clerkId: string): Promise<CurrentEmployee | null> {
	const response = await fetch(`/api/employees`);
	if (!response.ok) {
		if (response.status === 404) {
			return null;
		}
		throw new Error("Failed to fetch current employee");
	}
	const employees = await response.json();
	// Find employee where userId (Clerk ID) matches
	const employee = Array.isArray(employees) 
		? employees.find((emp: any) => emp.userId === clerkId)
		: null;
	return employee || null;
}

/**
 * Hook to get the current user's employee record
 * Returns null if the user is not an employee
 */
export function useCurrentEmployee() {
	const { data: currentUser } = useCurrentUser();
	const { user } = useUser();

	return useQuery({
		queryKey: ["currentEmployee", currentUser?.clerkId || user?.id],
		queryFn: () => {
			const clerkId = currentUser?.clerkId || user?.id;
			if (!clerkId) {
				return Promise.resolve(null);
			}
			return fetchCurrentEmployee(clerkId);
		},
		enabled: !!(currentUser?.clerkId || user?.id),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

