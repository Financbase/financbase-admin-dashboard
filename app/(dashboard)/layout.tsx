"use client";

import { EnhancedLayout } from "@/components/layout/enhanced-layout";
import { useUser } from "@clerk/nextjs";
import { Suspense } from "react";
import "./dashboard.css";

// Force dynamic rendering for all dashboard pages
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = useUser();

	// Format user data for the layout
	const userData = user
		? {
				name: user.fullName || user.firstName || "User",
				email: user.primaryEmailAddress?.emailAddress || "user@example.com",
				avatar: user.imageUrl,
				role: user.publicMetadata?.role as string || "User",
		  }
		: undefined;

	return (
		<EnhancedLayout user={userData} notifications={3}>
			<Suspense
				fallback={
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				}
			>
				{children}
			</Suspense>
		</EnhancedLayout>
	);
}