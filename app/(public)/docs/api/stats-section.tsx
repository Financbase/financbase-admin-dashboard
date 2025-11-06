/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Clock, Globe, TrendingUp } from "lucide-react";

const stats = [
	{
		label: "API Endpoints",
		value: "150+",
		description: "Comprehensive REST API",
		icon: BarChart3,
		color: "text-blue-600 dark:text-blue-400"
	},
	{
		label: "Response Time",
		value: "< 200ms",
		description: "Average latency",
		icon: Clock,
		color: "text-green-600 dark:text-green-400"
	},
	{
		label: "Uptime",
		value: "99.9%",
		description: "Service availability",
		icon: Globe,
		color: "text-purple-600 dark:text-purple-400"
	},
	{
		label: "Active Developers",
		value: "10k+",
		description: "Building with our API",
		icon: TrendingUp,
		color: "text-orange-600 dark:text-orange-400"
	}
];

export function StatsSection() {
	return (
		<section className="mb-20">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
				{stats.map((stat, index) => (
					<Card 
						key={index} 
						className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
					>
						<CardContent className="p-6 text-center">
							<div className={`inline-flex p-3 rounded-lg bg-muted mb-4 ${stat.color}`}>
								<stat.icon className="h-6 w-6" />
							</div>
							<div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
							<div className="text-sm font-semibold text-foreground mb-1">{stat.label}</div>
							<div className="text-xs text-muted-foreground">{stat.description}</div>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}

