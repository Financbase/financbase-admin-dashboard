/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { type Workspace, useWorkspaces } from "@/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	Filter,
	Key,
	Loader2Icon,
	PlusIcon,
	Puzzle,
	Users,
	XCircle,
} from "lucide-react";
import * as React from "react";
import { logger } from '@/lib/logger';

// Generic workspace interface - can be extended
export interface WorkspaceInterface extends Workspace {}

// Context for workspace state management
interface WorkspaceContextValue<T extends WorkspaceInterface> {
	open: boolean;
	setOpen: (open: boolean) => void;
	selectedWorkspace: T | undefined;
	workspaces: T[];
	onWorkspaceSelect: (workspace: T) => void;
	getWorkspaceId: (workspace: T) => string;
	getWorkspaceName: (workspace: T) => string;
	loading: boolean;
	error: Error | null;
	createWorkspace?: (data: {
		name: string;
		slug: string;
		description?: string;
		logo?: string;
		plan?: string;
	}) => Promise<T>;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue<any> | null>(
	null,
);

function useWorkspaceContext<T extends WorkspaceInterface>() {
	const context = React.useContext(
		WorkspaceContext,
	) as WorkspaceContextValue<T> | null;
	if (!context) {
		throw new Error(
			"Workspace components must be used within WorkspaceProvider",
		);
	}
	return context;
}

// Main provider component
interface WorkspaceProviderProps<T extends WorkspaceInterface> {
	children: React.ReactNode;
	workspaces?: T[];
	selectedWorkspaceId?: string;
	onWorkspaceChange?: (workspace: T) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	getWorkspaceId?: (workspace: T) => string;
	getWorkspaceName?: (workspace: T) => string;
}

function WorkspaceProvider<T extends WorkspaceInterface>({
	children,
	workspaces: externalWorkspaces,
	selectedWorkspaceId,
	onWorkspaceChange,
	open: controlledOpen,
	onOpenChange,
	getWorkspaceId = (workspace) => workspace.workspaceId,
	getWorkspaceName = (workspace) => workspace.name,
}: WorkspaceProviderProps<T>) {
	const [internalOpen, setInternalOpen] = React.useState(false);

	const open = controlledOpen ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;

	// Use the hook for API integration
	const {
		workspaces: apiWorkspaces,
		loading,
		error,
		selectedWorkspace: apiSelectedWorkspace,
		createWorkspace,
		selectWorkspace,
	} = useWorkspaces();

	// Use external workspaces if provided, otherwise use API workspaces
	const workspaces = (externalWorkspaces || apiWorkspaces) as T[];

	// Determine selected workspace
	const selectedWorkspace = React.useMemo(() => {
		if (selectedWorkspaceId) {
			return (
				workspaces.find((ws) => getWorkspaceId(ws) === selectedWorkspaceId) ||
				undefined
			);
		}
		return (
			(apiSelectedWorkspace as T | undefined) || workspaces[0] || undefined
		);
	}, [workspaces, selectedWorkspaceId, getWorkspaceId, apiSelectedWorkspace]);

	const handleWorkspaceSelect = React.useCallback(
		(workspace: T) => {
			selectWorkspace(workspace as Workspace);
			onWorkspaceChange?.(workspace);
			setOpen(false);
		},
		[selectWorkspace, onWorkspaceChange, setOpen],
	);

	const handleCreateWorkspace = React.useCallback(
		async (workspaceData: {
			name: string;
			slug: string;
			description?: string;
			logo?: string;
			plan?: string;
		}): Promise<T> => {
			try {
				const createData: {
					name: string;
					slug: string;
					description?: string;
					logo?: string;
					plan?: "free" | "pro" | "team" | "enterprise";
				} = {
					name: workspaceData.name,
					slug: workspaceData.slug,
				};

				// Add optional properties only if they exist
				if (workspaceData.description !== undefined) {
					createData.description = workspaceData.description;
				}
				if (workspaceData.logo !== undefined) {
					createData.logo = workspaceData.logo;
				}

				// Only add plan if it exists and is valid
				if (
					workspaceData.plan &&
					["free", "pro", "team", "enterprise"].includes(workspaceData.plan)
				) {
					createData.plan = workspaceData.plan as
						| "free"
						| "pro"
						| "team"
						| "enterprise";
				}

				const result = await createWorkspace?.(createData);
				if (!result) {
					throw new Error("Failed to create workspace");
				}
				return result as T;
			} catch (error) {
				logger.error("Failed to create workspace:", error);
				throw error;
			}
		},
		[createWorkspace],
	);

	const value: WorkspaceContextValue<T> = {
		open,
		setOpen,
		selectedWorkspace,
		workspaces,
		onWorkspaceSelect: handleWorkspaceSelect,
		getWorkspaceId,
		getWorkspaceName,
		loading,
		error,
		createWorkspace: handleCreateWorkspace,
	};

	return (
		<WorkspaceContext.Provider value={value}>
			<Popover open={open} onOpenChange={setOpen}>
				{children}
			</Popover>
		</WorkspaceContext.Provider>
	);
}

// Trigger component
interface WorkspaceTriggerProps extends React.ComponentProps<"button"> {
	renderTrigger?: (
		workspace: WorkspaceInterface,
		isOpen: boolean,
	) => React.ReactNode;
}

function WorkspaceTrigger({
	className,
	renderTrigger,
	...props
}: WorkspaceTriggerProps) {
	const { open, selectedWorkspace, getWorkspaceName, loading } =
		useWorkspaceContext();

	if (loading && !selectedWorkspace) {
		return (
			<Button
				variant="outline"
				className={cn("justify-between", className)}
				disabled
				{...props}
			>
				<div className="flex items-center gap-2">
					<Loader2Icon className="h-4 w-4 animate-spin" />
					<span>Loading workspaces...</span>
				</div>
			</Button>
		);
	}

	if (!selectedWorkspace) {
		return (
			<Button
				variant="outline"
				className={cn("justify-between", className)}
				disabled
				{...props}
			>
				<span>No workspaces available</span>
			</Button>
		);
	}

	if (renderTrigger) {
		return (
			<PopoverTrigger asChild>
				<button className={className} {...props}>
					{renderTrigger(selectedWorkspace, open)}
				</button>
			</PopoverTrigger>
		);
	}

	return (
		<PopoverTrigger asChild>
			<button
				data-state={open ? "open" : "closed"}
				className={cn(
					"border-input bg-background ring-offset-background flex h-12 w-full max-w-72 items-center justify-between rounded-md border px-3 py-2 text-sm",
					"placeholder:text-muted-foreground focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"hover:bg-accent hover:text-accent-foreground",
					className,
				)}
				{...props}
			>
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<Avatar className="h-6 w-6">
						<AvatarImage
							src={selectedWorkspace.logo}
							alt={getWorkspaceName(selectedWorkspace)}
						/>
						<AvatarFallback className="text-xs">
							{getWorkspaceName(selectedWorkspace).charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="truncate">
						{getWorkspaceName(selectedWorkspace)}
					</span>
					{selectedWorkspace.plan && (
						<span className="text-muted-foreground text-xs capitalize">
							{selectedWorkspace.plan}
						</span>
					)}
				</div>
				<ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
			</button>
		</PopoverTrigger>
	);
}

// Content component
interface WorkspaceContentProps
	extends React.ComponentProps<typeof PopoverContent> {
	renderWorkspace?: (
		workspace: WorkspaceInterface,
		isSelected: boolean,
	) => React.ReactNode;
	title?: string;
	searchable?: boolean;
	onSearch?: (query: string) => void;
	showCreateButton?: boolean;
	onCreateWorkspace?: () => void;
}

function WorkspaceContent({
	className,
	children,
	renderWorkspace,
	title = "Workspaces",
	searchable = false,
	onSearch,
	showCreateButton = true,
	onCreateWorkspace,
	...props
}: WorkspaceContentProps) {
	const {
		workspaces,
		selectedWorkspace,
		onWorkspaceSelect,
		getWorkspaceId,
		getWorkspaceName,
		loading,
		error,
		createWorkspace,
	} = useWorkspaceContext();

	const [searchQuery, setSearchQuery] = React.useState("");
	const [creatingWorkspace, setCreatingWorkspace] = React.useState(false);

	const filteredWorkspaces = React.useMemo(() => {
		if (!searchQuery) return workspaces;
		return workspaces.filter((ws) =>
			getWorkspaceName(ws).toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [workspaces, searchQuery, getWorkspaceName]);

	React.useEffect(() => {
		onSearch?.(searchQuery);
	}, [searchQuery, onSearch]);

	const handleCreateWorkspace = React.useCallback(async () => {
		if (!createWorkspace) return;

		try {
			setCreatingWorkspace(true);
			await createWorkspace({
				name: "New Workspace",
				slug: `workspace-${Date.now()}`,
				description: "A new workspace",
			});
		} catch (error) {
			logger.error("Failed to create workspace:", error);
		} finally {
			setCreatingWorkspace(false);
		}
	}, [createWorkspace]);

	const defaultRenderWorkspace = (
		workspace: WorkspaceInterface,
		isSelected: boolean,
	) => (
		<div className="flex min-w-0 flex-1 items-center gap-2">
			<Avatar className="h-6 w-6">
				<AvatarImage src={workspace.logo} alt={getWorkspaceName(workspace)} />
				<AvatarFallback className="text-xs">
					{getWorkspaceName(workspace).charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="flex min-w-0 flex-1 flex-col items-start">
				<span className="truncate text-sm">{getWorkspaceName(workspace)}</span>
				{workspace.plan && (
					<span className="text-muted-foreground text-xs capitalize">
						{workspace.plan} plan
					</span>
				)}
			</div>
			{isSelected && <CheckIcon className="ml-auto h-4 w-4" />}
		</div>
	);

	if (error) {
		return (
			<PopoverContent
				className={cn("p-0", className)}
				align={props.align || "start"}
				{...props}
			>
				<div className="p-4">
					<div className="flex items-center gap-2 text-sm text-destructive">
						<XCircle className="h-4 w-4" />
						<span>{error?.message || String(error)}</span>
					</div>
				</div>
			</PopoverContent>
		);
	}

	return (
		<PopoverContent
			className={cn("p-0", className)}
			align={props.align || "start"}
			{...props}
		>
			<div className="border-b px-3 py-2">
				<p className="text-muted-foreground text-sm font-medium">{title}</p>
			</div>

			{searchable && (
				<div className="border-b px-3 py-2">
					<input
						type="text"
						placeholder="Search workspaces..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none"
					/>
				</div>
			)}

			<div className="max-h-[300px] overflow-y-auto">
				{loading ? (
					<div className="flex items-center justify-center p-4">
						<Loader2Icon className="h-4 w-4 animate-spin" />
						<span className="ml-2 text-sm">Loading workspaces...</span>
					</div>
				) : filteredWorkspaces.length === 0 ? (
					<div className="text-muted-foreground px-3 py-2 text-center text-sm">
						No workspaces found
					</div>
				) : (
					<div className="p-1">
						{filteredWorkspaces.map((workspace) => {
							const isSelected =
								selectedWorkspace &&
								getWorkspaceId(selectedWorkspace) === getWorkspaceId(workspace);

							return (
								<button
									key={getWorkspaceId(workspace)}
									onClick={() => onWorkspaceSelect(workspace)}
									className={cn(
										"flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm",
										"hover:bg-accent hover:text-accent-foreground",
										"focus:outline-none",
										isSelected && "bg-accent text-accent-foreground",
									)}
								>
									{renderWorkspace
										? renderWorkspace(workspace, !!isSelected)
										: defaultRenderWorkspace(workspace, !!isSelected)}
								</button>
							);
						})}
					</div>
				)}
			</div>

			{showCreateButton && createWorkspace && (
				<>
					<div className="border-t" />
					<div className="p-1">
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground w-full justify-start"
							onClick={handleCreateWorkspace}
							disabled={creatingWorkspace}
						>
							{creatingWorkspace ? (
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<PlusIcon className="mr-2 h-4 w-4" />
							)}
							{creatingWorkspace ? "Creating..." : "Create workspace"}
						</Button>
					</div>
				</>
			)}

			{children && (
				<>
					<div className="border-t" />
					<div className="p-1">{children}</div>
				</>
			)}
		</PopoverContent>
	);
}

export { WorkspaceProvider as Workspaces, WorkspaceTrigger, WorkspaceContent };
