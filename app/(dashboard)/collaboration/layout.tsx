/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
