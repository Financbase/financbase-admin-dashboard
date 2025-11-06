/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Circle } from "lucide-react";
import type { TimelineItem } from "@/app/(public)/about/data";

interface CompanyTimelineProps {
	items: TimelineItem[];
	className?: string;
}

const getStatusConfig = (status: TimelineItem["status"]) => {
	const configs = {
		completed: {
			progressColor: "bg-green-500 dark:bg-green-400",
			borderColor: "border-green-500/20 dark:border-green-400/20",
			badgeBg: "bg-green-100 dark:bg-green-900/30",
			badgeText: "text-green-800 dark:text-green-200",
			icon: CheckCircle,
		},
		current: {
			progressColor: "bg-blue-600 dark:bg-blue-400",
			borderColor: "border-blue-600/20 dark:border-blue-400/20",
			badgeBg: "bg-blue-100 dark:bg-blue-900/30",
			badgeText: "text-blue-800 dark:text-blue-200",
			icon: Clock,
		},
		upcoming: {
			progressColor: "bg-yellow-500 dark:bg-yellow-400",
			borderColor: "border-yellow-500/20 dark:border-yellow-400/20",
			badgeBg: "bg-yellow-100 dark:bg-yellow-900/30",
			badgeText: "text-yellow-800 dark:text-yellow-200",
			icon: Circle,
		},
	};

	return configs[status];
};

export function CompanyTimeline({ items, className }: CompanyTimelineProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	if (!items || items.length === 0) {
		return (
			<div
				className={cn(
					"w-full max-w-4xl mx-auto px-4 sm:px-6 py-8",
					className
				)}
			>
				<p className="text-center text-muted-foreground">
					No timeline items to display
				</p>
			</div>
		);
	}

	return (
		<section
			ref={ref}
			className={cn(
				"w-full max-w-4xl mx-auto px-4 sm:px-6 py-8",
				className
			)}
			role="list"
			aria-label="Company timeline of events and milestones"
		>
			<div className="relative">
				{/* Vertical line */}
				<div
					className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-border"
					aria-hidden="true"
				/>

				{/* Animated progress line */}
				<motion.div
					className="absolute left-4 sm:left-6 top-0 w-px bg-primary origin-top"
					initial={{ scaleY: 0 }}
					animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
					transition={{
						duration: 1.2,
						ease: "easeOut",
						delay: 0.2,
					}}
					aria-hidden="true"
				/>

				<div className="space-y-8 sm:space-y-12 relative">
					{items.map((item, index) => {
						const config = getStatusConfig(item.status);
						const IconComponent = config.icon;

						return (
							<motion.div
								key={`${item.title}-${index}`}
								className="relative group"
								initial={{ opacity: 0, y: 40, scale: 0.98 }}
								animate={
									isInView
										? { opacity: 1, y: 0, scale: 1 }
										: { opacity: 0, y: 40, scale: 0.98 }
								}
								transition={{
									duration: 0.5,
									delay: index * 0.1,
									ease: [0.25, 0.46, 0.45, 0.94],
								}}
								viewport={{ once: true, margin: "-30px" }}
								role="listitem"
								aria-label={`Timeline item ${index + 1}: ${item.title}`}
							>
								<div className="flex items-start gap-4 sm:gap-6">
									{/* Icon */}
									<div className="relative flex-shrink-0">
										<motion.div
											className="relative"
											whileHover={{ scale: 1.05 }}
											transition={{ duration: 0.2 }}
											tabIndex={0}
											role="img"
											aria-label={`Status indicator for ${item.title}`}
										>
											<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-background shadow-lg relative z-10 bg-card flex items-center justify-center">
												<IconComponent
													className={cn(
														"w-5 h-5 sm:w-6 sm:h-6",
														config.badgeText
													)}
													aria-hidden="true"
												/>
											</div>
										</motion.div>
									</div>

									{/* Content */}
									<motion.div
										className="flex-1 min-w-0"
										whileHover={{ y: -2 }}
										transition={{ duration: 0.2 }}
									>
										<Card
											className={cn(
												"border transition-all duration-300 hover:shadow-md relative",
												"bg-card/50 backdrop-blur-sm",
												config.borderColor,
												"group-hover:border-primary/30"
											)}
										>
											<CardContent className="p-4 sm:p-6">
												<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
													<div className="flex-1 min-w-0">
														<motion.h3
															className="text-lg sm:text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300"
															layoutId={`title-${index}`}
														>
															{item.title}
														</motion.h3>

														<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
															{item.category && (
																<span className="font-medium">
																	{item.category}
																</span>
															)}
															{item.category && item.date && (
																<span
																	className="w-1 h-1 bg-muted-foreground rounded-full"
																	aria-hidden="true"
																/>
															)}
															{item.date && (
																<time dateTime={item.date}>
																	{new Date(item.date).toLocaleDateString(
																		"en-US",
																		{
																			year: "numeric",
																			month: "long",
																			day: "numeric",
																		}
																	)}
																</time>
															)}
														</div>
													</div>

													<Badge
														className={cn(
															"w-fit text-xs font-medium border",
															config.badgeBg,
															config.badgeText,
															"border-current/20"
														)}
														aria-label={`Status: ${item.status}`}
													>
														{item.status.charAt(0).toUpperCase() +
															item.status.slice(1)}
													</Badge>
												</div>

												<motion.p
													className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4"
													initial={{ opacity: 0.8 }}
													whileHover={{ opacity: 1 }}
												>
													{item.description}
												</motion.p>

												{/* Progress bar */}
												<div
													className="h-1 bg-muted rounded-full overflow-hidden"
													role="progressbar"
													aria-valuenow={
														item.status === "completed"
															? 100
															: item.status === "current"
																? 65
																: 25
													}
													aria-valuemin={0}
													aria-valuemax={100}
													aria-label={`Progress for ${item.title}`}
												>
													<motion.div
														className={cn(
															"h-full rounded-full",
															config.progressColor
														)}
														initial={{ width: 0 }}
														animate={
															isInView
																? {
																		width:
																			item.status === "completed"
																				? "100%"
																				: item.status === "current"
																					? "65%"
																					: "25%",
																	}
																: { width: 0 }
														}
														transition={{
															duration: 1.2,
															delay: index * 0.2 + 0.8,
															ease: "easeOut",
														}}
													/>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								</div>
							</motion.div>
						);
					})}
				</div>

				{/* End marker */}
				<motion.div
					className="absolute left-4 sm:left-6 -bottom-6 transform -translate-x-1/2"
					initial={{ opacity: 0, scale: 0 }}
					animate={
						isInView
							? { opacity: 1, scale: 1 }
							: { opacity: 0, scale: 0 }
					}
					transition={{
						duration: 0.4,
						delay: items.length * 0.1 + 0.3,
						type: "spring",
						stiffness: 400,
					}}
					aria-hidden="true"
				>
					<div className="w-3 h-3 bg-primary rounded-full shadow-sm" />
				</motion.div>
			</div>
		</section>
	);
}

