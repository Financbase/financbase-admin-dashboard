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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboardDateRange } from "@/contexts/dashboard-context";
import { DATE_RANGE_OPTIONS, formatDateRange } from "@/lib/date-range-utils";
import { cn } from "@/lib/utils";
import {
	Calendar as CalendarIcon,
	ChevronDown,
	Key,
	LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

interface DateRangePickerProps {
	className?: string;
}

export default function DateRangePicker({ className }: DateRangePickerProps) {
	const { dateRange, setDateRange, setDateRangeByValue } =
		useDashboardDateRange();
	const [isOpen, setIsOpen] = useState(false);
	const [showCustomRange, setShowCustomRange] = useState(false);
	const [customRange, setCustomRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({
		from: undefined,
		to: undefined,
	});

	const handlePresetSelect = (_value: string) => {
		if (_value === "custom") {
			setShowCustomRange(true);
			return;
		}

		setDateRangeByValue(_value);
		setIsOpen(false);
	};

	const handleCustomRangeApply = () => {
		if (customRange.from && customRange.to) {
			setDateRange({
				from: customRange.from,
				to: customRange.to,
				label: "Custom",
			});
			setIsOpen(false);
			setShowCustomRange(false);
		}
	};

	const handleCustomRangeCancel = () => {
		setShowCustomRange(false);
		setCustomRange({ from: undefined, to: undefined });
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild={true}>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!dateRange && "text-muted-foreground",
						className,
					)}
					data-testid="date-range-picker"
					aria-label="Select date range"
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{dateRange ? formatDateRange(dateRange) : "Select date range"}
					<ChevronDown className="ml-auto h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				align="start"
				data-testid="date-range-picker-content"
			>
				<div className="p-4">
					{showCustomRange ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="font-medium text-sm" data-testid="custom-range">
									Custom Range
								</h4>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCustomRangeCancel}
									data-testid="custom-range-cancel"
								>
									Cancel
								</Button>
							</div>

							<div className="space-y-2">
								<section>
									<label
										htmlFor="date-from"
										className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1"
									>
										From
									</label>
									<div id="date-from" aria-label="From date selector">
										<CalendarComponent
											mode="single"
											selected={customRange.from}
											onSelect={(date) =>
												setCustomRange((prev) => ({ ...prev, from: date }))
											}
											className="rounded-md border"
										/>
									</div>
								</section>

								<section>
									<label
										htmlFor="date-to"
										className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1"
									>
										To
									</label>
									<div id="date-to" aria-label="To date selector">
										<CalendarComponent
											mode="single"
											selected={customRange.to}
											onSelect={(date) =>
												setCustomRange((prev) => ({ ...prev, to: date }))
											}
											className="rounded-md border"
										/>
									</div>
								</section>
							</div>

							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={handleCustomRangeApply}
									disabled={!(customRange.from && customRange.to)}
									className="flex-1"
									data-testid="custom-range-apply"
								>
									Apply
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={handleCustomRangeCancel}
									className="flex-1"
								>
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							<h4 className="font-medium text-sm" data-testid="quick-select">
								Quick Select
							</h4>
							<div
								className="grid grid-cols-2 gap-2"
								data-testid="date-range-options"
							>
								{DATE_RANGE_OPTIONS.map((option) => (
									<Button
										key={option.value}
										variant="ghost"
										size="sm"
										className="justify-start text-left"
										onClick={() => handlePresetSelect(option.value)}
									>
										{option.label}
									</Button>
								))}
								<Button
									variant="ghost"
									size="sm"
									className="justify-start text-left col-span-2"
									onClick={() => handlePresetSelect("custom")}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									Custom Range
								</Button>
							</div>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
