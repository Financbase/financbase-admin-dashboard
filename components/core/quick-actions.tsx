/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { FileText, Receipt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function QuickActions() {
	const router = useRouter();

	const actions = [
		{
			title: "Create New Invoice",
			description: "Generate a new invoice for your clients",
			icon: FileText,
			href: "/dashboard/invoices/new",
			color: "bg-blue-500 hover:bg-blue-600",
		},
		{
			title: "Add Expense",
			description: "Track your business expenses",
			icon: Receipt,
			href: "/dashboard/expenses/new",
			color: "bg-green-500 hover:bg-green-600",
		},
		{
			title: "Add Client",
			description: "Add a new client to your database",
			icon: Users,
			href: "/dashboard/clients/new",
			color: "bg-purple-500 hover:bg-purple-600",
		},
	];

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
				Quick Actions
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{actions.map((action) => {
					const Icon = action.icon;
					return (
						<Button
							key={action.title}
							variant="outline"
							className={`h-auto p-4 flex flex-col items-center text-center space-y-2 ${action.color} text-white border-0 hover:shadow-md transition-all duration-200`}
							onClick={() => router.push(action.href)}
						>
							<Icon className="h-6 w-6" />
							<div>
								<div className="font-medium text-sm">{action.title}</div>
								<div className="text-xs opacity-90 mt-1">{action.description}</div>
							</div>
						</Button>
					);
				})}
			</div>
		</div>
	);
}
