/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import RuixenMenuOptions from "@/components/ui/ruixen-menu-options";

export default function DemoOne() {
	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold mb-4">Ruixen Menu Options Demo</h2>

			{/* Example 1: Posts */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold mb-2">Posts Management</h3>
				<RuixenMenuOptions
					entityType="posts"
					entityId="post-123"
					entityName="Sample Blog Post"
					onActionComplete={() => console.log("Post action completed")}
				/>
			</div>

			{/* Example 2: Projects */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold mb-2">Project Management</h3>
				<RuixenMenuOptions
					entityType="projects"
					entityId="project-456"
					entityName="Website Redesign Project"
					onActionComplete={() => console.log("Project action completed")}
				/>
			</div>

			{/* Example 3: Employees */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold mb-2">Employee Management</h3>
				<RuixenMenuOptions
					entityType="employees"
					entityId="emp-789"
					entityName="John Doe"
					onActionComplete={() => console.log("Employee action completed")}
				/>
			</div>

			<div className="mt-8 p-4 bg-gray-50 rounded-lg">
				<p className="text-sm text-gray-600">
					<strong>How to use:</strong> Replace the entityType, entityId, and
					entityName props with actual values from your data. The component will
					handle all the API calls and show loading states automatically.
				</p>
			</div>
		</div>
	);
}
