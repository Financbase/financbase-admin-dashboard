import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Team Collaboration - Financbase",
	description: "Team collaboration tools - chat, meetings, and real-time communication",
};

export default function CollaborationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Collaboration-specific navigation and layout */}
			<div className="lg:pl-64">
				{children}
			</div>
		</div>
	);
}
