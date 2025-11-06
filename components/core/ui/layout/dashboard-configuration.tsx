/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	Filter,
	Headphones,
	LayoutDashboard,
	LayoutGrid,
	RotateCcw,
	Settings,
	GripVertical,
} from "lucide-react";
import type React from "react";
import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Import new animation library
import {
	AnimatedCard,
	StaggeredContainer,
	cardVariants,
	fadeInUpVariants,
	smoothTransition,
	staggerContainerVariants,
} from "@/lib/animations";

// Note: This component requires 'framer-motion'.

// --- Internal Data Structure ---
export interface DashboardWidget {
	/** Unique key for the widget (used for toggling). */
	id: string;
	/** Display title of the widget. */
	title: string;
	/** Brief description of the widget. */
	description: string;
	/** If true, the widget cannot be hidden. */
	isPermanent?: boolean;
}

// --- 📦 API (Props) Definition ---
export interface DashboardLayoutConfiguratorProps {
	/** Array of all available widgets. */
	availableWidgets: DashboardWidget[];
	/** Array of IDs of widgets currently visible/selected. */
	visibleWidgetIds: string[];
	/** Callback when widget visibility changes. */
	onVisibilityChange: (newVisibleIds: string[]) => void;
	/** Callback when widget order changes. */
	onOrderChange?: (newOrder: string[]) => void;
	/** Callback to restore the entire dashboard layout to default. */
	onLayoutReset: () => void;
	/** Optional class name for the card container. */
	className?: string;
}

/**
 * An animated control panel for managing dashboard layout and widget visibility.
 * Ideal for power users who need customization options.
 */
const DashboardLayoutConfigurator: React.FC<
	DashboardLayoutConfiguratorProps
> = ({
	availableWidgets,
	visibleWidgetIds,
	onVisibilityChange,
	onOrderChange,
	onLayoutReset,
	className,
}) => {
	const isWidgetVisible = (id: string) => visibleWidgetIds.includes(id);

	const handleToggleWidget = (widget: DashboardWidget, isChecked: boolean) => {
		if (widget.isPermanent) return;

		const newVisibleIds = isChecked
			? [...visibleWidgetIds, widget.id]
			: visibleWidgetIds.filter((id) => id !== widget.id);

		onVisibilityChange(newVisibleIds);
	};

	// Framer Motion variants for widget list items
	const itemVariants = {
		hidden: { opacity: 0, x: -10 },
		visible: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -10 },
	};

	// Framer Motion variants for buttons
	const buttonVariants = {
		tap: { scale: 0.98 },
	};

	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		
		if (over && active.id !== over.id && onOrderChange) {
			const oldIndex = visibleWidgetIds.indexOf(active.id as string);
			const newIndex = visibleWidgetIds.indexOf(over.id as string);
			
			if (oldIndex !== -1 && newIndex !== -1) {
				const newOrder = [...visibleWidgetIds];
				const [removed] = newOrder.splice(oldIndex, 1);
				newOrder.splice(newIndex, 0, removed);
				onOrderChange(newOrder);
			}
		}
	}, [visibleWidgetIds, onOrderChange]);

	// Sortable widget item component
	const SortableWidgetItem = ({ widget }: { widget: DashboardWidget }) => {
		const {
			attributes,
			listeners,
			setNodeRef,
			transform,
			transition,
			isDragging,
		} = useSortable({ id: widget.id });

		const style = {
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? 0.5 : 1,
		};

		return (
			<motion.div
				ref={setNodeRef}
				style={style}
				layout
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -10 }}
				transition={{
					...smoothTransition,
					layout: { duration: 0.3 },
				}}
				className={cn(
					"flex items-start space-x-3 p-2 rounded-lg transition-colors duration-150",
					isWidgetVisible(widget.id)
						? "hover:bg-muted/70"
						: "opacity-70 hover:bg-muted/50",
					isDragging && "z-50"
				)}
			>
				{!widget.isPermanent && onOrderChange && (
					<div
						{...attributes}
						{...listeners}
						className={cn(
							"flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing",
							"text-muted-foreground hover:text-foreground transition-colors",
							"mt-1"
						)}
						aria-label="Drag to reorder"
					>
						<GripVertical className="h-4 w-4" />
					</div>
				)}
				<div className="pt-1">
					<Checkbox
						id={`widget-${widget.id}`}
						checked={isWidgetVisible(widget.id)}
						onCheckedChange={(checked: boolean) =>
							handleToggleWidget(widget, checked)
						}
						disabled={widget.isPermanent}
						className={cn(
							widget.isPermanent && "bg-primary border-primary",
							widget.isPermanent
								? "opacity-100 cursor-not-allowed"
								: "cursor-pointer",
						)}
					/>
				</div>

				<label
					htmlFor={`widget-${widget.id}`}
					className={cn(
						"flex flex-col text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1",
						widget.isPermanent && "text-primary/90",
					)}
				>
					<span className="text-foreground">{widget.title}</span>
					<span className="text-xs text-muted-foreground mt-0.5">
						{widget.description}
					</span>
				</label>
			</motion.div>
		);
	};

	return (
		<AnimatedCard
			className="w-full max-w-lg mx-auto shadow-xl"
			layoutId="dashboard-config"
		>
			<Card
				className={cn("w-full max-w-lg mx-auto shadow-xl", className)}
				style={{ willChange: "transform, opacity" }}
			>
				<CardHeader className="p-6 border-b">
					<CardTitle className="text-2xl font-bold text-foreground flex items-center">
						<LayoutGrid className="h-6 w-6 mr-3 text-primary" />
						Dashboard Configuration
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground mt-1">
						Toggle widget visibility and manage your dashboard layout settings.
					</CardDescription>
				</CardHeader>

				<CardContent className="p-0">
					<h3 className="text-lg font-semibold text-foreground px-6 pt-6 pb-2">
						Widget Visibility {onOrderChange && <span className="text-sm text-muted-foreground font-normal">(Drag to reorder)</span>}
					</h3>

					<ScrollArea className="h-[300px] px-6">
						{onOrderChange ? (
							<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
								<SortableContext
									items={visibleWidgetIds}
									strategy={verticalListSortingStrategy}
								>
									<AnimatePresence initial={false}>
										<StaggeredContainer
											initial="hidden"
											animate="visible"
											variants={staggerContainerVariants}
										>
											{availableWidgets
												.sort((a, b) => {
													const aIndex = visibleWidgetIds.indexOf(a.id);
													const bIndex = visibleWidgetIds.indexOf(b.id);
													// Permanent widgets first, then by visible order
													if (a.isPermanent && !b.isPermanent) return -1;
													if (!a.isPermanent && b.isPermanent) return 1;
													if (aIndex === -1 && bIndex === -1) return 0;
													if (aIndex === -1) return 1;
													if (bIndex === -1) return -1;
													return aIndex - bIndex;
												})
												.map((widget) => (
													<SortableWidgetItem key={widget.id} widget={widget} />
												))}
										</StaggeredContainer>
									</AnimatePresence>
								</SortableContext>
							</DndContext>
						) : (
							<AnimatePresence initial={false}>
								<StaggeredContainer
									initial="hidden"
									animate="visible"
									variants={staggerContainerVariants}
								>
									{availableWidgets.map((widget) => (
										<motion.div
											key={widget.id}
											layout
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											transition={{
												...smoothTransition,
												layout: { duration: 0.3 },
											}}
											className={cn(
												"flex items-start space-x-3 p-2 rounded-lg transition-colors duration-150",
												isWidgetVisible(widget.id)
													? "hover:bg-muted/70"
													: "opacity-70 hover:bg-muted/50",
											)}
										>
											<div className="pt-1">
												<Checkbox
													id={`widget-${widget.id}`}
													checked={isWidgetVisible(widget.id)}
													onCheckedChange={(checked: boolean) =>
														handleToggleWidget(widget, checked)
													}
													disabled={widget.isPermanent}
													className={cn(
														widget.isPermanent && "bg-primary border-primary",
														widget.isPermanent
															? "opacity-100 cursor-not-allowed"
															: "cursor-pointer",
													)}
												/>
											</div>

											<label
												htmlFor={`widget-${widget.id}`}
												className={cn(
													"flex flex-col text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
													widget.isPermanent && "text-primary/90",
												)}
											>
												<span className="text-foreground">{widget.title}</span>
												<span className="text-xs text-muted-foreground mt-0.5">
													{widget.description}
												</span>
											</label>
										</motion.div>
									))}
								</StaggeredContainer>
							</AnimatePresence>
						)}
					</ScrollArea>
				</CardContent>

				<div className="p-6 pt-4 border-t">
					<motion.div whileTap="tap" variants={{ tap: { scale: 0.98 } }}>
						<Button
							onClick={onLayoutReset}
							variant="outline"
							className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors duration-150"
						>
							<RotateCcw className="h-4 w-4 mr-2" />
							Reset Layout to Default
						</Button>
					</motion.div>
				</div>
			</Card>
		</AnimatedCard>
	);
};

const mockWidgets: DashboardWidget[] = [
	{
		id: "metrics",
		title: "Key Metrics",
		description: "Overall performance indicators.",
		isPermanent: true,
	},
	{
		id: "activity",
		title: "Recent Activity",
		description: "Chronological feed of user actions.",
	},
	{
		id: "charts",
		title: "Usage Charts",
		description: "Time-series usage visualization.",
	},
	{
		id: "tasks",
		title: "Pending Tasks",
		description: "Your assigned open items.",
	},
	{
		id: "config",
		title: "Server Configuration",
		description: "Low-level server health data.",
	},
	{
		id: "tickets",
		title: "Support Tickets",
		description: "Live count of open support tickets.",
	},
];

const ExampleUsage = () => {
	const defaultVisible = mockWidgets
		.filter((w) => w.isPermanent || w.id === "activity" || w.id === "charts")
		.map((w) => w.id);
	const [visibleIds, setVisibleIds] = useState<string[]>(defaultVisible);

	const handleVisibilityChange = (newIds: string[]) => {
		setVisibleIds(newIds);
		console.log("New Visible Widgets:", newIds);
	};

	const handleLayoutReset = () => {
		const defaultIds = mockWidgets
			.filter((w) => w.isPermanent)
			.map((w) => w.id);
		setVisibleIds(defaultIds);
		alert("Layout reset applied! Only permanent widgets are now visible.");
	};

	return (
		<div className="p-8 bg-background border rounded-lg max-w-2xl mx-auto shadow-md">
			<h3 className="text-xl font-semibold text-foreground mb-6">
				Dashboard Layout Control Demo
			</h3>

			<DashboardLayoutConfigurator
				availableWidgets={mockWidgets}
				visibleWidgetIds={visibleIds}
				onVisibilityChange={handleVisibilityChange}
				onLayoutReset={handleLayoutReset}
			/>

			<div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
				<p>
					Currently Visible Widgets ({visibleIds.length}):{" "}
					<strong className="text-foreground">{visibleIds.join(", ")}</strong>
				</p>
				<p className="mt-2 text-xs">
					"Key Metrics" is permanent and cannot be unchecked.
				</p>
			</div>
		</div>
	);
};

export default ExampleUsage;
