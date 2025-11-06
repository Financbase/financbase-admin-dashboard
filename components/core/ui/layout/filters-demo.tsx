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
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Filters } from "@/components/ui/filters";

// Stub types for demo purposes
type Filter = {
	id: string;
	type: string;
	operator: string;
	value: string[];
};
type FilterOption = {
	name: string;
	value: string;
	icon?: React.ReactNode;
	label?: string;
};
type FilterOperatorType = {
	IS: string;
	BEFORE: string;
	AFTER: string;
};
type FilterTypeType = {
	DUE_DATE: string;
	STATUS: string;
	PRIORITY: string;
};
const FilterOperator = {
	IS: "is",
	BEFORE: "before",
	AFTER: "after",
} as const;
const FilterType = {
	DUE_DATE: "due_date",
	STATUS: "status",
	PRIORITY: "priority",
} as const;
type FilterType = typeof FilterType[keyof typeof FilterType];
const DueDate = {
	IN_THE_PAST: "in_the_past",
	TODAY: "today",
	TOMORROW: "tomorrow",
	THIS_WEEK: "this_week",
	NEXT_WEEK: "next_week",
} as const;
const AnimateChangeInHeight = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const filterViewOptions = [] as any[];
const filterViewToFilterOptions: Record<string, FilterOption[]> = {
	due_date: [
		{ name: "Today", value: "today" },
		{ name: "Tomorrow", value: "tomorrow" },
		{ name: "This Week", value: "this_week" },
	],
	status: [
		{ name: "Active", value: "active" },
		{ name: "Completed", value: "completed" },
	],
	priority: [
		{ name: "High", value: "high" },
		{ name: "Medium", value: "medium" },
		{ name: "Low", value: "low" },
	],
};
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Key, ListFilter } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";

export function ComboboxDemo() {
	const [open, setOpen] = React.useState(false);
	const [selectedView, setSelectedView] = React.useState<FilterType | null>(
		null,
	);
	const [commandInput, setCommandInput] = React.useState("");
	const commandInputRef = React.useRef<HTMLInputElement>(null);
	const [filters, setFilters] = React.useState<Filter[]>([]);

	return (
		<div className="flex gap-2 flex-wrap">
			<Filters />
			{filters.filter((filter) => filter.value?.length > 0).length > 0 && (
				<Button
					variant="outline"
					size="sm"
					className="transition group h-6 text-xs items-center rounded-sm"
					onClick={() => setFilters([])}
				>
					Clear
				</Button>
			)}
			<Popover
				open={open}
				onOpenChange={(open) => {
					setOpen(open);
					if (!open) {
						setTimeout(() => {
							setSelectedView(null);
							setCommandInput("");
						}, 200);
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						role="combobox"
						aria-expanded={open}
						size="sm"
						className={cn(
							"transition group h-6 text-xs items-center rounded-sm flex gap-1.5 items-center",
							filters.length > 0 && "w-6",
						)}
					>
						<ListFilter className="size-3 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
						{!filters.length && "Filter"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<AnimateChangeInHeight>
						<Command>
							<CommandInput
								placeholder={selectedView ? String(selectedView) : "Filter..."}
								className="h-9"
								value={commandInput}
								onInputCapture={(e) => {
									setCommandInput(e.currentTarget.value);
								}}
								ref={commandInputRef}
							/>
							<CommandList>
								<CommandEmpty>No results found.</CommandEmpty>
								{selectedView ? (
									<CommandGroup>
										{((selectedView && filterViewToFilterOptions[selectedView]) || []).map(
											(filter: FilterOption) => (
												<CommandItem
													className="group text-muted-foreground flex gap-2 items-center"
													key={filter.name}
													value={filter.name}
													onSelect={(currentValue) => {
														setFilters((prev) => [
															...prev,
															{
																id: nanoid(),
																type: selectedView,
																operator:
																	selectedView === "due_date" &&
																	currentValue !== DueDate.IN_THE_PAST
																		? FilterOperator.BEFORE
																		: FilterOperator.IS,
																value: [currentValue],
															},
														]);
														setTimeout(() => {
															setSelectedView(null);
															setCommandInput("");
														}, 200);
														setOpen(false);
													}}
												>
													{filter.icon}
													<span className="text-accent-foreground">
														{filter.name}
													</span>
													{filter.label && (
														<span className="text-muted-foreground text-xs ml-auto">
															{filter.label}
														</span>
													)}
												</CommandItem>
											),
										)}
									</CommandGroup>
								) : (
									filterViewOptions.map(
										(group: FilterOption[], index: number) => (
											<React.Fragment key={index}>
												<CommandGroup>
													{group.map((filter: FilterOption) => (
														<CommandItem
															className="group text-muted-foreground flex gap-2 items-center"
															key={filter.name}
															value={filter.name}
															onSelect={(currentValue) => {
																setSelectedView(currentValue as unknown as FilterType);
																setCommandInput("");
																commandInputRef.current?.focus();
															}}
														>
															{filter.icon}
															<span className="text-accent-foreground">
																{filter.name}
															</span>
														</CommandItem>
													))}
												</CommandGroup>
												{index < filterViewOptions.length - 1 && (
													<CommandSeparator />
												)}
											</React.Fragment>
										),
									)
								)}
							</CommandList>
						</Command>
					</AnimateChangeInHeight>
				</PopoverContent>
			</Popover>
		</div>
	);
}
