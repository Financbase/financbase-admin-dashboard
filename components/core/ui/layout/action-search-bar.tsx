"use client";

import { Input } from "@/components/ui/input";
import type { Action } from "@/drizzle/schema/actions";
import { useActions } from "@/hooks/use-actions";
import { AnimatePresence, motion } from "framer-motion";
import {} from "lucide-react";
import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay = 500): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Icon mapping for action icons
const iconMap: Record<string, React.ReactNode> = {
	PlaneTakeoff: <PlaneTakeoff className="h-4 w-4 text-blue-500" />,
	BarChart2: <BarChart2 className="h-4 w-4 text-orange-500" />,
	Video: <Video className="h-4 w-4 text-purple-500" />,
	AudioLines: <AudioLines className="h-4 w-4 text-green-500" />,
	Globe: <Globe className="h-4 w-4 text-blue-500" />,
};

function ActionSearchBar() {
	const [query, setQuery] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const [selectedAction, setSelectedAction] = useState<Action | null>(null);
	const debouncedQuery = useDebounce(query, 200);

	// Fetch actions from API
	const {
		data: actionsData,
		isLoading,
		error,
		refetch,
	} = useActions({
		query: debouncedQuery || undefined,
		limit: 20,
		enabled: isFocused,
	});

	const actions = actionsData?.actions || [];

	useEffect(() => {
		if (!isFocused) {
			return;
		}

		// Refetch when query changes
		if (debouncedQuery !== query) {
			refetch();
		}
	}, [debouncedQuery, isFocused, refetch]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
		setIsTyping(true);
	};

	const handleFocus = () => {
		setSelectedAction(null);
		setIsFocused(true);
	};

	const handleActionClick = (action: Action) => {
		setSelectedAction(action);
		setIsFocused(false);
		setQuery("");

		// Here you can add action execution logic
		console.log("Action selected:", action);

		// Example: Execute different actions based on type
		switch (action.actionType) {
			case "link":
				if (action.actionData?.url) {
					window.open(action.actionData.url, "_blank");
				}
				break;
			case "function":
				if (action.actionData?.functionName) {
					// Execute custom function
					console.log("Executing function:", action.actionData.functionName);
				}
				break;
			case "api":
				if (action.actionData?.endpoint) {
					// Make API call
					console.log("Calling API:", action.actionData.endpoint);
				}
				break;
			default:
				console.log("Command action:", action.label);
		}
	};

	const container = {
		hidden: { opacity: 0, height: 0 },
		show: {
			opacity: 1,
			height: "auto",
			transition: {
				height: {
					duration: 0.4,
				},
				staggerChildren: 0.1,
			},
		},
		exit: {
			opacity: 0,
			height: 0,
			transition: {
				height: {
					duration: 0.3,
				},
				opacity: {
					duration: 0.2,
				},
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
			},
		},
		exit: {
			opacity: 0,
			y: -10,
			transition: {
				duration: 0.2,
			},
		},
	};

	return (
		<div className="w-full max-w-xl mx-auto">
			<div className="relative flex flex-col justify-start items-center min-h-[300px]">
				<div className="w-full max-w-sm sticky top-0 bg-background z-10 pt-4 pb-1">
					<label
						className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block"
						htmlFor="search"
					>
						Search Commands
					</label>
					<div className="relative">
						<Input
							type="text"
							placeholder="What's up?"
							value={query}
							onChange={handleInputChange}
							onFocus={handleFocus}
							onBlur={() => setTimeout(() => setIsFocused(false), 200)}
							className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0"
						/>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
							<AnimatePresence mode="popLayout">
								{query.length > 0 ? (
									<motion.div
										key="send"
										initial={{ y: -20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										exit={{ y: 20, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
									</motion.div>
								) : (
									<motion.div
										key="search"
										initial={{ y: -20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										exit={{ y: 20, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				<div className="w-full max-w-sm">
					<AnimatePresence>
						{isFocused && !selectedAction && (
							<motion.div
								className="w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1"
								variants={container}
								initial="hidden"
								animate="show"
								exit="exit"
							>
								{isLoading && (
									<div className="px-3 py-4 flex items-center justify-center">
										<Loader2 className="h-4 w-4 animate-spin text-gray-400" />
										<span className="ml-2 text-sm text-gray-500">
											Loading actions...
										</span>
									</div>
								)}

								{error && (
									<div className="px-3 py-4 flex items-center text-red-500">
										<AlertCircle className="h-4 w-4 mr-2" />
										<span className="text-sm">
											Failed to load actions. Please try again.
										</span>
									</div>
								)}

								{!isLoading && !error && actions.length === 0 && query && (
									<div className="px-3 py-4 text-center text-gray-500">
										<span className="text-sm">
											No actions found for "{query}"
										</span>
									</div>
								)}

								{!isLoading && !error && actions.length > 0 && (
									<motion.ul>
										{actions.map((action) => (
											<motion.li
												key={action.id}
												className="px-3 py-2 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md"
												variants={item}
												layout
												onClick={() => handleActionClick(action)}
											>
												<div className="flex items-center gap-2 justify-between">
													<div className="flex items-center gap-2">
														<span className="text-gray-500">
															{iconMap[action.icon || ""] || (
																<Search className="h-4 w-4 text-gray-500" />
															)}
														</span>
														<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
															{action.label}
														</span>
														{action.description && (
															<span className="text-xs text-gray-400">
																{action.description}
															</span>
														)}
													</div>
												</div>
												<div className="flex items-center gap-2">
													{action.shortcut && (
														<span className="text-xs text-gray-400">
															{action.shortcut}
														</span>
													)}
													{action.endLabel && (
														<span className="text-xs text-gray-400 text-right">
															{action.endLabel}
														</span>
													)}
												</div>
											</motion.li>
										))}
									</motion.ul>
								)}

								<div className="mt-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
									<div className="flex items-center justify-between text-xs text-gray-500">
										<span>Press ⌘K to open commands</span>
										<span>ESC to cancel</span>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}

export { ActionSearchBar };
