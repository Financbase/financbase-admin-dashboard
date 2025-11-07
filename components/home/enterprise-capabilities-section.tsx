/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FloatingPaths } from "@/components/auth/floating-paths";
import { ReactNode } from "react";

interface Capability {
	icon?: ReactNode;
	iconName?: string;
	title: string;
	description: string;
}

interface EnterpriseCapabilitiesSectionProps {
	capabilities: Capability[];
	title?: string;
	description?: string;
	iconMap?: Record<string, React.ComponentType<{ className?: string }>>;
}

export function EnterpriseCapabilitiesSection({
	capabilities,
	title = "Enterprise-Grade Capabilities",
	description = "Everything you need to connect and automate your business workflows",
	iconMap,
}: EnterpriseCapabilitiesSectionProps) {
	return (
		<Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg relative overflow-hidden">
			{/* Floating Paths Background */}
			<div className="absolute inset-0 z-0 overflow-hidden opacity-30">
				<FloatingPaths position={1} />
				<FloatingPaths position={-1} />
			</div>
			<div className="absolute inset-0 z-[1] bg-gradient-to-t from-white/80 via-white/80 to-transparent pointer-events-none" />

			<CardContent className="p-8 relative z-10">
				<div className="text-center mb-8">
					<h3 className="text-2xl font-bold text-slate-900 mb-4">
						{title}
					</h3>
					<p className="text-slate-600">
						{description}
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{capabilities.map((capability) => {
						// Handle both icon and iconName cases
						let iconElement: ReactNode = null;
						
						if (capability.icon) {
							iconElement = capability.icon;
						} else if (capability.iconName && iconMap) {
							const IconComponent = iconMap[capability.iconName];
							if (IconComponent) {
								iconElement = <IconComponent className="h-6 w-6" />;
							}
						}

						return (
							<div
								key={`capability-${capability.title.toLowerCase().replace(/\s+/g, '-')}`}
								className="group p-6 rounded-lg border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-white/50 backdrop-blur-sm"
							>
								<div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
									{iconElement}
								</div>
								<h4 className="font-semibold text-slate-900 mb-2">{capability.title}</h4>
								<p className="text-sm text-slate-600">{capability.description}</p>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

