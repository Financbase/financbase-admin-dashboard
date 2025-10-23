import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Enhanced Collaboration Hub - Financbase",
	description: "Advanced team collaboration tools - workspaces, client management, approval workflows, real-time chat, and practice management for accounting professionals",
};

export default function CollaborationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Enhanced collaboration navigation and layout */}
			<div className="lg:pl-64">
				{children}
			</div>
		</div>
	);
}
