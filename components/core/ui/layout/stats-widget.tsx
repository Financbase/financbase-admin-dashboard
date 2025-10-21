"use client";

import { useMarketingAnalytics } from "@/lib/hooks/use-marketing-analytics";
import { ArrowDown, ArrowUp, BarChart3 } from "lucide-react";
import React, {
	useState,
	useEffect,
	useMemo,
	useRef,
	useCallback,
} from "react";

// A small utility function to generate random numbers in a range
const getRandom = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

// A function to generate a smooth SVG path from data points
const generateSmoothPath = (
	points: number[],
	width: number,
	height: number,
) => {
	if (!points || points.length < 2) {
		return `M 0 ${height}`;
	}

	const xStep = width / (points.length - 1);
	const pathData = points.map((point, i) => {
		const x = i * xStep;
		// Scale point to height, with a small padding from top/bottom
		const y = height - (point / 100) * (height * 0.8) - height * 0.1;
		return [x, y];
	});

	let path = `M ${pathData[0][0]} ${pathData[0][1]}`;

	for (let i = 0; i < pathData.length - 1; i++) {
		const x1 = pathData[i][0];
		const y1 = pathData[i][1];
		const x2 = pathData[i + 1][0];
		const y2 = pathData[i + 1][1];
		const midX = (x1 + x2) / 2;
		path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
	}

	return path;
};

interface StatsWidgetProps {
	amount?: number;
	change?: number;
	chartData?: number[];
	title?: string;
	autoUpdate?: boolean;
	updateInterval?: number;
}

// The main Stats Widget Component, now shadcn/ui theme compatible
export const StatsWidget = ({
	amount = 283,
	change = 36,
	chartData = [30, 55, 45, 75, 60, 85, 70],
	title = "This Week",
	autoUpdate = true,
	updateInterval = 3000,
}: StatsWidgetProps) => {
	const [stats, setStats] = useState({
		amount,
		change,
		chartData,
	});
	const linePathRef = useRef<SVGPathElement>(null);
	const areaPathRef = useRef<SVGPathElement>(null);
	const { trackComponentInteraction } = useMarketingAnalytics();

	// Function to generate new random data for interactivity
	const updateStats = useCallback(() => {
		const newAmount = getRandom(100, 999);
		const newChange = getRandom(-50, 100);
		const newChartData = Array.from({ length: 7 }, () => getRandom(10, 90));

		setStats({
			amount: newAmount,
			change: newChange,
			chartData: newChartData,
		});
	}, []);

	// Auto-update stats every 3 seconds
	useEffect(() => {
		if (!autoUpdate) return;

		const intervalId = setInterval(updateStats, updateInterval);
		return () => clearInterval(intervalId);
	}, [autoUpdate, updateInterval, updateStats]);

	// SVG viewbox dimensions
	const svgWidth = 150;
	const svgHeight = 60;

	// Generate the SVG path for the line, memoized for performance
	const linePath = useMemo(
		() => generateSmoothPath(stats.chartData, svgWidth, svgHeight),
		[stats.chartData],
	);

	// Generate the SVG path for the gradient area
	const areaPath = useMemo(() => {
		if (!linePath.startsWith("M")) return "";
		return `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
	}, [linePath]);

	// Animate the line graph on change
	useEffect(() => {
		const path = linePathRef.current;
		const area = areaPathRef.current;

		if (path && area) {
			const length = path.getTotalLength();
			// --- Animate Line ---
			path.style.transition = "none";
			path.style.strokeDasharray = `${length} ${length}`;
			path.style.strokeDashoffset = length.toString();

			// --- Animate Area ---
			area.style.transition = "none";
			area.style.opacity = "0";

			// Trigger reflow to apply initial styles before transition
			path.getBoundingClientRect();

			// --- Start Transitions ---
			path.style.transition =
				"stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease";
			path.style.strokeDashoffset = "0";

			area.style.transition = "opacity 0.8s ease-in-out 0.2s, fill 0.5s ease"; // Delay start
			area.style.opacity = "1";
		}
	}, []); // Run animation on mount and when chart data changes

	const isPositiveChange = stats.change >= 0;
	// Use CSS variables for colors, which are defined in the global CSS
	const changeColorClass = isPositiveChange
		? "text-green-600 dark:text-green-400"
		: "text-red-600 dark:text-red-400";
	const graphStrokeColor = isPositiveChange
		? "hsl(var(--chart-2))"
		: "hsl(var(--destructive))";
	const gradientId = isPositiveChange
		? "areaGradientSuccess"
		: "areaGradientDestructive";

	const handleWidgetClick = useCallback(() => {
		trackComponentInteraction("stats_widget", "marketing", "click", {
			title,
			amount: stats.amount,
			change: stats.change,
		});
	}, [trackComponentInteraction, title, stats.amount, stats.change]);

	return (
		<div
			className="w-full max-w-md bg-card text-card-foreground rounded-3xl shadow-lg p-6 border cursor-pointer hover:shadow-xl transition-shadow"
			onClick={handleWidgetClick}
		>
			<div className="flex justify-between items-center">
				{/* Left side content */}
				<div className="flex flex-col w-1/2">
					<div className="flex items-center text-muted-foreground text-md">
						<span>{title}</span>
						<span
							className={`ml-2 flex items-center font-semibold ${changeColorClass}`}
						>
							{Math.abs(stats.change)}%
							{isPositiveChange ? (
								<ArrowUp size={16} className="ml-1" />
							) : (
								<ArrowDown size={16} className="ml-1" />
							)}
						</span>
					</div>
					<p className="text-4xl font-bold text-foreground mt-2">
						${stats.amount}
					</p>
				</div>

				{/* Right side chart */}
				<div className="w-1/2 h-16">
					<svg
						viewBox={`0 0 ${svgWidth} ${svgHeight}`}
						className="w-full h-full"
						preserveAspectRatio="none"
						aria-label="Statistics chart"
						role="img"
					>
						<title>
							Performance chart showing{" "}
							{stats.change >= 0 ? "positive" : "negative"} trend
						</title>
						<defs>
							{/* Gradients using CSS variables for theme compatibility */}
							<linearGradient
								id="areaGradientSuccess"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor="hsl(var(--chart-2))"
									stopOpacity={0.4}
								/>
								<stop
									offset="100%"
									stopColor="hsl(var(--chart-2))"
									stopOpacity={0}
								/>
							</linearGradient>
							<linearGradient
								id="areaGradientDestructive"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor="hsl(var(--destructive))"
									stopOpacity={0.4}
								/>
								<stop
									offset="100%"
									stopColor="hsl(var(--destructive))"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<path ref={areaPathRef} d={areaPath} fill={`url(#${gradientId})`} />
						<path
							ref={linePathRef}
							d={linePath}
							fill="none"
							stroke={graphStrokeColor}
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</div>
		</div>
	);
};

// Main App component to display the widget
export function Component() {
	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center font-sans p-4 bg-background transition-colors duration-300">
			<StatsWidget />
		</div>
	);
}
