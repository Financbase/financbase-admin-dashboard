import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {} from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";

interface AnimateChangeInHeightProps {
	children: React.ReactNode;
	className?: string;
}

export const AnimateChangeInHeight: React.FC<AnimateChangeInHeightProps> = ({
	children,
	className,
}) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [height, setHeight] = useState<number | "auto">("auto");

	useEffect(() => {
		if (containerRef.current) {
			const resizeObserver = new ResizeObserver((entries) => {
				// We only have one entry, so we can use entries[0].
				const observedHeight = entries[0].contentRect.height;
				setHeight(observedHeight);
			});

			resizeObserver.observe(containerRef.current);

			return () => {
				// Cleanup the observer when the component is unmounted
				resizeObserver.disconnect();
			};
		}
	}, []);

	return (
		<motion.div
			className={cn(className, "overflow-hidden")}
			style={{ height }}
			animate={{ height }}
			transition={{ duration: 0.1, damping: 0.2, ease: "easeIn" }}
		>
			<div ref={containerRef}>{children}</div>
		</motion.div>
	);
};

// Database field mappings for the filters
export enum FilterType {
	STATUS = "status",
	PROJECT = "projectId",
	CLIENT = "clientId",
	TAGS = "tags",
	BILLABLE = "isBillable",
	AMOUNT = "amount",
	DURATION = "duration",
	SUBMITTED_DATE = "submittedAt",
	APPROVED_DATE = "approvedAt",
	CREATED_DATE = "createdAt",
	TASK_NAME = "taskName",
	DESCRIPTION = "description",
	USER = "userId",
	APPROVED_BY = "approvedBy",
	REJECTED_BY = "rejectedBy",
	REJECTION_REASON = "rejectionReason",
}

export enum FilterOperator {
	IS = "is",
	IS_NOT = "is not",
	IS_ANY_OF = "is any of",
	IS_NOT_ANY_OF = "is not any of",
	CONTAINS = "contains",
	DOES_NOT_CONTAIN = "does not contain",
	CONTAINS_ALL = "contains all",
	CONTAINS_ANY = "contains any",
	GREATER_THAN = "greater than",
	LESS_THAN = "less than",
	BETWEEN = "between",
	BEFORE = "before",
	AFTER = "after",
}

// Database status values
export enum Status {
	DRAFT = "draft",
	SUBMITTED = "submitted",
	APPROVED = "approved",
	REJECTED = "rejected",
	PAID = "paid",
}

// Database boolean values
export enum Billable {
	YES = "true",
	NO = "false",
}

// Amount/Duration ranges
export enum AmountRange {
	UNDER_100 = "under_100",
	_100_500 = "100_500",
	_500_1000 = "500_1000",
	OVER_1000 = "over_1000",
}

export enum DurationRange {
	UNDER_1H = "under_1h",
	_1H_4H = "1h_4h",
	_4H_8H = "4h_8h",
	OVER_8H = "over_8h",
}

export type FilterOption = {
	name: FilterType | Status | Billable | AmountRange | DurationRange | string;
	icon: React.ReactNode | undefined;
	label?: string;
};

export type Filter = {
	id: string;
	type: FilterType;
	operator: FilterOperator;
	value: string[];
};

const FilterIcon = ({
	type,
}: {
	type: FilterType | Status | Billable | AmountRange | DurationRange | string;
}) => {
	switch (type) {
		case FilterType.STATUS:
			return <CircleDashed className="size-3.5" />;
		case FilterType.PROJECT:
			return <Circle className="size-3.5" />;
		case FilterType.CLIENT:
			return <UserCircle className="size-3.5" />;
		case FilterType.TAGS:
			return <Tag className="size-3.5" />;
		case FilterType.BILLABLE:
			return <Circle className="size-3.5" />;
		case FilterType.AMOUNT:
			return <SignalHigh className="size-3.5" />;
		case FilterType.DURATION:
			return <SignalMedium className="size-3.5" />;
		case FilterType.SUBMITTED_DATE:
			return <Calendar className="size-3.5" />;
		case FilterType.APPROVED_DATE:
			return <CalendarCheck className="size-3.5" />;
		case FilterType.TASK_NAME:
			return <FileText className="size-3.5" />;
		case FilterType.DESCRIPTION:
			return <FileText className="size-3.5" />;
		case FilterType.USER:
			return <User className="size-3.5" />;
		case FilterType.APPROVED_BY:
			return <UserCheck className="size-3.5" />;
		case FilterType.REJECTED_BY:
			return <UserX className="size-3.5" />;
		case FilterType.REJECTION_REASON:
			return <X className="size-3.5" />;
			return <CircleDashed className="size-3.5 text-muted-foreground" />;
		case Status.SUBMITTED:
			return <Circle className="size-3.5 text-yellow-400" />;
		case Status.APPROVED:
			return <CircleCheck className="size-3.5 text-green-400" />;
		case Status.REJECTED:
			return <CircleX className="size-3.5 text-red-400" />;
		case Status.PAID:
			return <CircleCheck className="size-3.5 text-blue-400" />;
		case Billable.YES:
			return <CircleCheck className="size-3.5 text-green-400" />;
		case Billable.NO:
			return <CircleX className="size-3.5 text-muted-foreground" />;
		case AmountRange.UNDER_100:
			return <div className="bg-green-400 rounded-full size-2.5" />;
		case AmountRange._100_500:
			return <div className="bg-blue-400 rounded-full size-2.5" />;
		case AmountRange._500_1000:
			return <div className="bg-amber-400 rounded-full size-2.5" />;
		case AmountRange.OVER_1000:
			return <div className="bg-red-400 rounded-full size-2.5" />;
		case DurationRange.UNDER_1H:
			return <div className="bg-green-400 rounded-full size-2.5" />;
		case DurationRange._1H_4H:
			return <div className="bg-blue-400 rounded-full size-2.5" />;
		case DurationRange._4H_8H:
			return <div className="bg-amber-400 rounded-full size-2.5" />;
		case DurationRange.OVER_8H:
			return <div className="bg-red-400 rounded-full size-2.5" />;
	}
};

export const filterViewOptions: FilterOption[][] = [
	[
		{
			name: FilterType.STATUS,
			icon: <FilterIcon type={FilterType.STATUS} />,
		},
		{
			name: FilterType.PROJECT,
			icon: <FilterIcon type={FilterType.PROJECT} />,
		},
		{
			name: FilterType.CLIENT,
			icon: <FilterIcon type={FilterType.CLIENT} />,
		},
		{
			name: FilterType.TAGS,
			icon: <FilterIcon type={FilterType.TAGS} />,
		},
	],
	[
		{
			name: FilterType.BILLABLE,
			icon: <FilterIcon type={FilterType.BILLABLE} />,
		},
		{
			name: FilterType.AMOUNT,
			icon: <FilterIcon type={FilterType.AMOUNT} />,
		},
		{
			name: FilterType.DURATION,
			icon: <FilterIcon type={FilterType.DURATION} />,
		},
	],
	[
		{
			name: FilterType.SUBMITTED_DATE,
			icon: <FilterIcon type={FilterType.SUBMITTED_DATE} />,
		},
		{
			name: FilterType.APPROVED_DATE,
			icon: <FilterIcon type={FilterType.APPROVED_DATE} />,
		},
		{
			name: FilterType.CREATED_DATE,
			icon: <FilterIcon type={FilterType.CREATED_DATE} />,
		},
	],
	[
		{
			name: FilterType.TASK_NAME,
			icon: <FilterIcon type={FilterType.TASK_NAME} />,
		},
		{
			name: FilterType.DESCRIPTION,
			icon: <FilterIcon type={FilterType.DESCRIPTION} />,
		},
		{
			name: FilterType.USER,
			icon: <FilterIcon type={FilterType.USER} />,
		},
	],
];

export const statusFilterOptions: FilterOption[] = Object.values(Status).map(
	(status) => ({
		name: status,
		icon: <FilterIcon type={status} />,
	}),
);

export const billableFilterOptions: FilterOption[] = Object.values(
	Billable,
).map((billable) => ({
	name: billable,
	icon: <FilterIcon type={billable} />,
}));

export const amountFilterOptions: FilterOption[] = Object.values(
	AmountRange,
).map((range) => ({
	name: range,
	icon: <FilterIcon type={range} />,
}));

export const durationFilterOptions: FilterOption[] = Object.values(
	DurationRange,
).map((range) => ({
	name: range,
	icon: <FilterIcon type={range} />,
}));

export const dateFilterOptions: FilterOption[] = [
	{ name: "today", icon: undefined, label: "Today" },
	{ name: "yesterday", icon: undefined, label: "Yesterday" },
	{ name: "this_week", icon: undefined, label: "This week" },
	{ name: "last_week", icon: undefined, label: "Last week" },
	{ name: "this_month", icon: undefined, label: "This month" },
	{ name: "last_month", icon: undefined, label: "Last month" },
	{ name: "this_year", icon: undefined, label: "This year" },
	{ name: "last_year", icon: undefined, label: "Last year" },
];

export const filterViewToFilterOptions: Record<FilterType, FilterOption[]> = {
	[FilterType.STATUS]: statusFilterOptions,
	[FilterType.PROJECT]: [], // Will be populated from API
	[FilterType.CLIENT]: [], // Will be populated from API
	[FilterType.TAGS]: [], // Will be populated from API
	[FilterType.BILLABLE]: billableFilterOptions,
	[FilterType.AMOUNT]: amountFilterOptions,
	[FilterType.DURATION]: durationFilterOptions,
	[FilterType.SUBMITTED_DATE]: dateFilterOptions,
	[FilterType.APPROVED_DATE]: dateFilterOptions,
	[FilterType.CREATED_DATE]: dateFilterOptions,
};

const filterOperators = ({
	filterType,
	filterValues,
}: {
	filterType: FilterType;
	filterValues: string[];
}) => {
	switch (filterType) {
		case FilterType.STATUS:
		case FilterType.PROJECT:
		case FilterType.CLIENT:
		case FilterType.BILLABLE:
		case FilterType.USER:
		case FilterType.APPROVED_BY:
		case FilterType.REJECTED_BY:
			if (Array.isArray(filterValues) && filterValues.length > 1) {
				return [FilterOperator.IS_ANY_OF, FilterOperator.IS_NOT_ANY_OF];
			}
			return [FilterOperator.IS, FilterOperator.IS_NOT];
		case FilterType.TAGS:
			if (Array.isArray(filterValues) && filterValues.length > 1) {
				return [FilterOperator.CONTAINS_ANY, FilterOperator.CONTAINS_ALL];
			}
			return [FilterOperator.CONTAINS, FilterOperator.DOES_NOT_CONTAIN];
		case FilterType.AMOUNT:
		case FilterType.DURATION:
			return [
				FilterOperator.GREATER_THAN,
				FilterOperator.LESS_THAN,
				FilterOperator.BETWEEN,
			];
		case FilterType.SUBMITTED_DATE:
		case FilterType.APPROVED_DATE:
		case FilterType.CREATED_DATE:
			return [FilterOperator.BEFORE, FilterOperator.AFTER];
		case FilterType.TASK_NAME:
		case FilterType.DESCRIPTION:
		case FilterType.REJECTION_REASON:
			return [FilterOperator.CONTAINS, FilterOperator.DOES_NOT_CONTAIN];
		default:
			return [FilterOperator.IS];
	}
};

const FilterOperatorDropdown = ({
	filterType,
	operator,
	filterValues,
	setOperator,
}: {
	filterType: FilterType;
	operator: FilterOperator;
	filterValues: string[];
	setOperator: (operator: FilterOperator) => void;
}) => {
	const operators = filterOperators({ filterType, filterValues });
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="bg-muted hover:bg-muted/50 px-1.5 py-1 text-muted-foreground hover:text-primary transition shrink-0">
				{operator}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-fit min-w-fit">
				{operators.map((operator) => (
					<DropdownMenuItem
						key={operator}
						onClick={() => setOperator(operator)}
					>
						{operator}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const FilterValueCombobox = ({
	filterType,
	filterValues,
	setFilterValues,
	options = [],
}: {
	filterType: FilterType;
	filterValues: string[];
	setFilterValues: (filterValues: string[]) => void;
	options?: FilterOption[];
}) => {
	const [open, setOpen] = useState(false);
	const [commandInput, setCommandInput] = useState("");
	const commandInputRef = useRef<HTMLInputElement>(null);
	const nonSelectedFilterValues =
		options?.filter((filter) => !filterValues.includes(filter.name)) || [];

	return (
		<Popover
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				if (!open) {
					setTimeout(() => {
						setCommandInput("");
					}, 200);
				}
			}}
		>
			<PopoverTrigger
				className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition
  text-muted-foreground hover:text-primary shrink-0"
			>
				<div className="flex gap-1.5 items-center">
					{filterType !== FilterType.AMOUNT &&
						filterType !== FilterType.DURATION && (
							<div
								className={cn(
									"flex items-center flex-row",
									filterType === FilterType.TAGS
										? "-space-x-1"
										: "-space-x-1.5",
								)}
							>
								<AnimatePresence mode="popLayout">
									{filterValues?.slice(0, 3).map((value) => (
										<motion.div
											key={value}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											transition={{ duration: 0.2 }}
										>
											<FilterIcon type={value as FilterType} />
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						)}
					{filterValues?.length === 1
						? filterValues?.[0]
						: `${filterValues?.length} selected`}
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<AnimateChangeInHeight>
					<Command>
						<CommandInput
							placeholder={filterType}
							className="h-9"
							value={commandInput}
							onInputCapture={(e) => {
								setCommandInput(e.currentTarget.value);
							}}
							ref={commandInputRef}
						/>
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup>
								{filterValues.map((value) => (
									<CommandItem
										key={value}
										className="group flex gap-2 items-center"
										onSelect={() => {
											setFilterValues(filterValues.filter((v) => v !== value));
											setTimeout(() => {
												setCommandInput("");
											}, 200);
											setOpen(false);
										}}
									>
										<Checkbox checked={true} />
										<FilterIcon type={value as FilterType} />
										{value}
									</CommandItem>
								))}
							</CommandGroup>
							{nonSelectedFilterValues?.length > 0 && (
								<>
									<CommandSeparator />
									<CommandGroup>
										{nonSelectedFilterValues.map((filter: FilterOption) => (
											<CommandItem
												className="group flex gap-2 items-center"
												key={filter.name}
												value={filter.name}
												onSelect={(currentValue: string) => {
													setFilterValues([...filterValues, currentValue]);
													setTimeout(() => {
														setCommandInput("");
													}, 200);
													setOpen(false);
												}}
											>
												<Checkbox
													checked={false}
													className="opacity-0 group-data-[selected=true]:opacity-100"
												/>
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
										))}
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				</AnimateChangeInHeight>
			</PopoverContent>
		</Popover>
	);
};

const FilterValueDateCombobox = ({
	filterType,
	filterValues,
	setFilterValues,
}: {
	filterType: FilterType;
	filterValues: string[];
	setFilterValues: (filterValues: string[]) => void;
}) => {
	const [open, setOpen] = useState(false);
	const [commandInput, setCommandInput] = useState("");
	const commandInputRef = useRef<HTMLInputElement>(null);

	const handleDateSelect = (value: string) => {
		setFilterValues([value]);
		setTimeout(() => {
			setCommandInput("");
		}, 200);
		setOpen(false);
	};

	return (
		<Popover
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				if (!open) {
					setTimeout(() => {
						setCommandInput("");
					}, 200);
				}
			}}
		>
			<PopoverTrigger
				className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition
  text-muted-foreground hover:text-primary shrink-0"
			>
				{filterValues?.[0] || "Select date"}
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0">
				<AnimateChangeInHeight>
					<Command>
						<CommandInput
							placeholder={filterType}
							className="h-9"
							value={commandInput}
							onInputCapture={(e) => {
								setCommandInput(e.currentTarget.value);
							}}
							ref={commandInputRef}
						/>
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup>
								{dateFilterOptions.map((filter: FilterOption) => (
									<CommandItem
										className="group flex gap-2 items-center"
										key={filter.name}
										value={filter.name}
										onSelect={handleDateSelect}
									>
										<span className="text-accent-foreground">
											{filter.name}
										</span>
										<Check
											className={cn(
												"ml-auto",
												filterValues.includes(filter.name)
													? "opacity-100"
													: "opacity-0",
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</AnimateChangeInHeight>
			</PopoverContent>
		</Popover>
	);
};

const FilterValueAmountCombobox = ({
	filterType,
	filterValues,
	setFilterValues,
}: {
	filterType: FilterType;
	filterValues: string[];
	setFilterValues: (filterValues: string[]) => void;
}) => {
	const [open, setOpen] = useState(false);
	const [commandInput, setCommandInput] = useState("");
	const commandInputRef = useRef<HTMLInputElement>(null);

	const handleAmountSelect = (value: string) => {
		setFilterValues([value]);
		setTimeout(() => {
			setCommandInput("");
		}, 200);
		setOpen(false);
	};

	return (
		<Popover
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				if (!open) {
					setTimeout(() => {
						setCommandInput("");
					}, 200);
				}
			}}
		>
			<PopoverTrigger
				className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition
  text-muted-foreground hover:text-primary shrink-0"
			>
				{filterValues?.[0] || "Select amount"}
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0">
				<AnimateChangeInHeight>
					<Command>
						<CommandInput
							placeholder={filterType}
							className="h-9"
							value={commandInput}
							onInputCapture={(e) => {
								setCommandInput(e.currentTarget.value);
							}}
							ref={commandInputRef}
						/>
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup>
								{amountFilterOptions.map((filter: FilterOption) => (
									<CommandItem
										className="group flex gap-2 items-center"
										key={filter.name}
										value={filter.name}
										onSelect={handleAmountSelect}
									>
										{filter.icon}
										<span className="text-accent-foreground">
											{filter.name}
										</span>
										<Check
											className={cn(
												"ml-auto",
												filterValues.includes(filter.name)
													? "opacity-100"
													: "opacity-0",
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</AnimateChangeInHeight>
			</PopoverContent>
		</Popover>
	);
};

const FilterValueDurationCombobox = ({
	filterType,
	filterValues,
	setFilterValues,
}: {
	filterType: FilterType;
	filterValues: string[];
	setFilterValues: (filterValues: string[]) => void;
}) => {
	const [open, setOpen] = useState(false);
	const [commandInput, setCommandInput] = useState("");
	const commandInputRef = useRef<HTMLInputElement>(null);

	const handleDurationSelect = (value: string) => {
		setFilterValues([value]);
		setTimeout(() => {
			setCommandInput("");
		}, 200);
		setOpen(false);
	};

	return (
		<Popover
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				if (!open) {
					setTimeout(() => {
						setCommandInput("");
					}, 200);
				}
			}}
		>
			<PopoverTrigger
				className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition
  text-muted-foreground hover:text-primary shrink-0"
			>
				{filterValues?.[0] || "Select duration"}
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0">
				<AnimateChangeInHeight>
					<Command>
						<CommandInput
							placeholder={filterType}
							className="h-9"
							value={commandInput}
							onInputCapture={(e) => {
								setCommandInput(e.currentTarget.value);
							}}
							ref={commandInputRef}
						/>
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup>
								{durationFilterOptions.map((filter: FilterOption) => (
									<CommandItem
										className="group flex gap-2 items-center"
										key={filter.name}
										value={filter.name}
										onSelect={handleDurationSelect}
									>
										{filter.icon}
										<span className="text-accent-foreground">
											{filter.name}
										</span>
										<Check
											className={cn(
												"ml-auto",
												filterValues.includes(filter.name)
													? "opacity-100"
													: "opacity-0",
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</AnimateChangeInHeight>
			</PopoverContent>
		</Popover>
	);
};

export default function Filters({
	filters,
	setFilters,
	onApplyFilters,
	loading = false,
}: {
	filters: Filter[];
	setFilters: Dispatch<SetStateAction<Filter[]>>;
	onApplyFilters?: (filters: Filter[]) => void;
	loading?: boolean;
}) {
	const handleClearFilters = () => {
		setFilters([]);
		onApplyFilters?.([]);
	};

	return (
		<div className="flex gap-2 flex-wrap">
			{filters
				.filter((filter) => filter.value?.length > 0)
				.map((filter) => (
					<div key={filter.id} className="flex gap-[1px] items-center text-xs">
						<div className="flex gap-1.5 shrink-0 rounded-l bg-muted px-1.5 py-1 items-center">
							<FilterIcon type={filter.type} />
							{filter.type}
						</div>
						<FilterOperatorDropdown
							filterType={filter.type}
							operator={filter.operator}
							filterValues={filter.value}
							setOperator={(operator) => {
								setFilters((prev) =>
									prev.map((f) =>
										f.id === filter.id ? { ...f, operator } : f,
									),
								);
								onApplyFilters?.(
									filters.map((f) =>
										f.id === filter.id ? { ...f, operator } : f,
									),
								);
							}}
						/>
						{filter.type === FilterType.SUBMITTED_DATE ||
						filter.type === FilterType.APPROVED_DATE ||
						filter.type === FilterType.CREATED_DATE ? (
							<FilterValueDateCombobox
								filterType={filter.type}
								filterValues={filter.value}
								setFilterValues={(filterValues) => {
									setFilters((prev) =>
										prev.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
									onApplyFilters?.(
										filters.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
								}}
							/>
						) : filter.type === FilterType.AMOUNT ? (
							<FilterValueAmountCombobox
								filterType={filter.type}
								filterValues={filter.value}
								setFilterValues={(filterValues) => {
									setFilters((prev) =>
										prev.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
									onApplyFilters?.(
										filters.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
								}}
							/>
						) : filter.type === FilterType.DURATION ? (
							<FilterValueDurationCombobox
								filterType={filter.type}
								filterValues={filter.value}
								setFilterValues={(filterValues) => {
									setFilters((prev) =>
										prev.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
									onApplyFilters?.(
										filters.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
								}}
							/>
						) : (
							<FilterValueCombobox
								filterType={filter.type}
								filterValues={filter.value}
								setFilterValues={(filterValues) => {
									setFilters((prev) =>
										prev.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
									onApplyFilters?.(
										filters.map((f) =>
											f.id === filter.id ? { ...f, value: filterValues } : f,
										),
									);
								}}
								options={filterViewToFilterOptions[filter.type]}
							/>
						)}
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								const newFilters = filters.filter((f) => f.id !== filter.id);
								setFilters(newFilters);
								onApplyFilters?.(newFilters);
							}}
							className="bg-muted rounded-l-none rounded-r-sm h-6 w-6 text-muted-foreground hover:text-primary hover:bg-muted/50 transition shrink-0"
						>
							<X className="size-3" />
						</Button>
					</div>
				))}
			{filters.length > 0 && (
				<Button
					variant="outline"
					size="sm"
					className="transition group h-6 text-xs items-center rounded-sm"
					onClick={handleClearFilters}
					disabled={loading}
				>
					{loading ? "Loading..." : "Clear"}
				</Button>
			)}
		</div>
	);
}
