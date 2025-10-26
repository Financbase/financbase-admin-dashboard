"use client";

import { Suspense } from "react";
import { EnhancedLayout } from "@/components/layout/enhanced-layout";
import "./dashboard.css";

// Force dynamic rendering for all dashboard pages
export const dynamic = 'force-dynamic';

// Enhanced layout with full navigation and sidebar
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Mock user data - in production this would come from auth context
	const user = {
		name: "John Doe",
		email: "john@financbase.com",
		avatar: "/avatars/john-doe.jpg",
		role: "Admin"
	};

	return (
		<EnhancedLayout user={user} notifications={3}>
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