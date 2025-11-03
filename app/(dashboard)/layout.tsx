import { Suspense } from "react";
import { EnhancedLayout } from "@/components/layout/enhanced-layout";
import { currentUser } from "@clerk/nextjs/server";
import "./dashboard.css";

// Force dynamic rendering for all dashboard pages
export const dynamic = 'force-dynamic';

// Enhanced layout with full navigation and sidebar
export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fetch the actual authenticated user from Clerk (server-side only)
	const clerkUser = await currentUser();

	// Transform Clerk user data to match the layout's expected format
	const user = clerkUser ? {
		name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
		email: clerkUser.emailAddresses[0]?.emailAddress || '',
		avatar: clerkUser.imageUrl || undefined,
		role: clerkUser.publicMetadata?.role as string || 'user'
	} : undefined;

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