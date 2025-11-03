import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
	AlertCircle,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Code2,
	Flag,
	Key,
	MessageCircle,
	RefreshCw,
	XCircle,
} from "lucide-react";
// components/ui/economic-calendar.tsx
import * as React from "react";

// Type definition for a single economic event
export interface EconomicEvent {
	id: string;
	countryCode: string;
	eventName: string;
	eventDate: string;
	eventTime: string | null;
	actual: string | null;
	forecast: string | null;
	prior: string | null;
	impact: "high" | "medium" | "low";
	currency: string;
	unit: string | null;
	importance: string | null;
	source: string | null;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

// Props for the main component
interface EconomicCalendarProps {
	title: string;
	className?: string;
	limit?: number;
	country?: string;
	impact?: "high" | "medium" | "low";
	onRefresh?: () => void;
}

// API response types
interface EconomicCalendarResponse {
	success: boolean;
	data: {
		events: EconomicEvent[];
		pagination: {
			total: number;
			limit: number;
			offset: number;
			hasMore: boolean;
		};
	};
	error?: string;
	details?: string;
}

// A simple volatility icon component
const VolatilityIcon = ({ impact }: { impact: EconomicEvent["impact"] }) => {
	const barCount = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
	return (
		<div className="flex items-end gap-0.5 h-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<span
					key={i}
					className={cn(
						"w-1 rounded-full",
						i === 0 ? "h-2" : i === 1 ? "h-3" : "h-4",
						i < barCount ? "bg-foreground/80" : "bg-muted",
					)}
				/>
			))}
		</div>
	);
};

export const EconomicCalendar = React.forwardRef<
	HTMLDivElement,
	EconomicCalendarProps
>(({ title, className, limit = 20, country, impact, onRefresh }, ref) => {
	const scrollContainerRef = React.useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(true);

	// Data fetching state
	const [events, setEvents] = React.useState<EconomicEvent[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [retryCount, setRetryCount] = React.useState(0);

	// Function to fetch economic events
	const fetchEvents = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: "0",
			});

			if (country) params.append("country", country);
			if (impact) params.append("impact", impact);

			const response = await fetch(
				`/api/economic-calendar?${params.toString()}`,
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: EconomicCalendarResponse = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to fetch economic events");
			}

			setEvents(data.data.events);
		} catch (err) {
			console.error("Error fetching economic events:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch economic events",
			);
		} finally {
			setLoading(false);
		}
	}, [limit, country, impact]);

	// Initial fetch and when filters change
	React.useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);

	// Handle refresh
	const handleRefresh = React.useCallback(() => {
		setRetryCount((prev) => prev + 1);
		fetchEvents();
		onRefresh?.();
	}, [fetchEvents, onRefresh]);

	// Function to handle scrolling and update button states
	const handleScroll = () => {
		const container = scrollContainerRef.current;
		if (container) {
			const scrollLeft = container.scrollLeft;
			const scrollWidth = container.scrollWidth;
			const clientWidth = container.clientWidth;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
		}
	};

	// Scroll function for navigation buttons
	const scroll = (direction: "left" | "right") => {
		const container = scrollContainerRef.current;
		if (container) {
			const scrollAmount = container.clientWidth * 0.8;
			container.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	React.useEffect(() => {
		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);
			handleScroll(); // Initial check
			return () => container.removeEventListener("scroll", handleScroll);
		}
	}, [events]);

	// Framer Motion variants for animations
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 14,
			},
		},
	};

	if (loading) {
		return (
			<div
				ref={ref}
				className={cn("w-full max-w-6xl mx-auto font-sans p-4", className)}
			>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-foreground flex items-center gap-2">
						{title}
						<ChevronRight className="h-5 w-5 text-muted-foreground" />
					</h2>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="flex items-center gap-2 text-muted-foreground">
						<RefreshCw className="h-4 w-4 animate-spin" />
						<span>Loading economic events...</span>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				ref={ref}
				className={cn("w-full max-w-6xl mx-auto font-sans p-4", className)}
			>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-foreground flex items-center gap-2">
						{title}
						<ChevronRight className="h-5 w-5 text-muted-foreground" />
					</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						className="flex items-center gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Retry
					</Button>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div
			ref={ref}
			className={cn("w-full max-w-6xl mx-auto font-sans p-4", className)}
		>
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold text-foreground flex items-center gap-2">
					{title}
					<ChevronRight className="h-5 w-5 text-muted-foreground" />
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						className="flex items-center gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Refresh
					</Button>
					{canScrollLeft && (
						<motion.button
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							onClick={() => scroll("left")}
							aria-label="Scroll left"
							className="p-1.5 rounded-full bg-background border hover:bg-muted transition-colors"
						>
							<ChevronLeft className="h-5 w-5 text-foreground" />
						</motion.button>
					)}
					{canScrollRight && (
						<motion.button
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							onClick={() => scroll("right")}
							aria-label="Scroll right"
							className="p-1.5 rounded-full bg-background border hover:bg-muted transition-colors"
						>
							<ChevronRight className="h-5 w-5 text-foreground" />
						</motion.button>
					)}
					<Code2 className="h-6 w-6 text-muted-foreground ml-2" />
				</div>
			</div>

			{/* Scrollable Events Container */}
			<div
				ref={scrollContainerRef}
				className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
			>
				<motion.div
					className="flex flex-nowrap gap-4"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					{events.length === 0 ? (
						<div className="flex-shrink-0 w-72 bg-card border rounded-2xl p-8 text-center">
							<p className="text-muted-foreground">No economic events found</p>
							<Button
								variant="outline"
								size="sm"
								onClick={handleRefresh}
								className="mt-4"
							>
								Try Again
							</Button>
						</div>
					) : (
						events.map((event) => (
							<motion.div
								key={event.id}
								variants={itemVariants}
								className="flex-shrink-0 w-72 bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
							>
								<div className="flex justify-between items-center mb-3">
									<div className="flex items-center gap-2">
										<p className="text-sm text-muted-foreground">
											{new Date(event.eventDate).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</p>
										{event.eventTime && (
											<span className="text-sm font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
												{event.eventTime}
											</span>
										)}
									</div>
									<VolatilityIcon impact={event.impact} />
								</div>

								<div className="flex items-center gap-3 mb-4">
									<img
										src={(() => {
											// Security: Validate country code to prevent XSS
											// Country codes should be 2-3 letter uppercase ISO codes
											const countryCode = event.countryCode?.toLowerCase().slice(0, 3);
											if (countryCode && /^[a-z]{2,3}$/.test(countryCode)) {
												return `https://flagcdn.com/w40/${countryCode}.png`;
											}
											return '';
										})()}
										alt={`${event.countryCode} flag`}
										className="h-8 w-8 rounded-full object-cover bg-muted"
										onError={(e) => {
											// Fallback to a generic flag icon if country flag fails to load
											const target = e.target as HTMLImageElement;
											target.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="16" fill="#E5E7EB"/>
                            <text x="16" y="20" text-anchor="middle" fill="#6B7280" font-size="14" font-family="Arial">${event.countryCode}</text>
                          </svg>
                        `)}`;
										}}
									/>
									<h3 className="font-semibold text-foreground truncate">
										{event.eventName}
									</h3>
								</div>

								<div className="grid grid-cols-3 text-center text-sm">
									<div>
										<p className="text-muted-foreground">Actual</p>
										<p className="font-medium text-foreground mt-1">
											{event.actual ?? "—"}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground">Forecast</p>
										<p className="font-medium text-foreground mt-1">
											{event.forecast ?? "—"}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground">Prior</p>
										<p className="font-medium text-foreground mt-1">
											{event.prior ?? "—"}
										</p>
									</div>
								</div>
							</motion.div>
						))
					)}
				</motion.div>
			</div>

			{/* Footer Link */}
			<a
				href="#"
				className="text-sm text-blue-500 hover:underline mt-2 inline-block"
			>
				See all market events ›
			</a>
		</div>
	);
});

EconomicCalendar.displayName = "EconomicCalendar";
