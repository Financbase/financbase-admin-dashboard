/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { ArrowUp, Code, Puzzle } from "lucide-react";
("use client");

import { ProjectStatusCard } from "@/components/core/ui/layout/expandable-card";
import { useState } from "react";

function ExpandableCardDemo() {
	const [refreshKey, setRefreshKey] = useState(0);

	const handleRefresh = () => {
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Project Status Dashboard</h2>
				<button
					type="button"
					onClick={handleRefresh}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					Refresh All
				</button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Example with static data */}
				<ProjectStatusCard
					key={`static-${refreshKey}`}
					title="Design System"
					progress={100}
					dueDate="Dec 31, 2023"
					contributors={[
						{ name: "Emma" },
						{ name: "John" },
						{ name: "Lisa" },
						{ name: "David" },
					]}
					tasks={[
						{ title: "Create Component Library", completed: true },
						{ title: "Implement Design Tokens", completed: true },
						{ title: "Write Style Guide", completed: true },
						{ title: "Set up Documentation", completed: true },
					]}
					githubStars={256}
					openIssues={0}
					onRefresh={handleRefresh}
				/>

				{/* Example with API integration */}
				<ProjectStatusCard
					key={`api-${refreshKey}`}
					projectId="example-project-1"
					onRefresh={handleRefresh}
				/>

				{/* Another example with API integration */}
				<ProjectStatusCard
					key={`api-2-${refreshKey}`}
					projectId="example-project-2"
					onRefresh={handleRefresh}
				/>
			</div>
		</div>
	);
}

export { ExpandableCardDemo };
