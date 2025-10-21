import {} from "lucide-react";
import React, { memo, useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface ChartData {
	name: string;
	value: number;
	[key: string]: string | number;
}

interface OptimizedChartProps {
	data: ChartData[];
	type?: "line" | "area" | "bar";
	height?: number;
	showLegend?: boolean;
	showGrid?: boolean;
	colors?: string[];
	className?: string;
}

/**
 * Optimized Chart component with React.memo and memoized data processing
 * Prevents unnecessary re-renders when parent components update
 */
export const OptimizedChart = memo<OptimizedChartProps>(
	({
		data,
		type = "line",
		height = 300,
		showLegend = true,
		showGrid = true,
		colors = ["#8884d8", "#82ca9d", "#ffc658"],
		className,
	}) => {
		// Memoize processed data to prevent unnecessary recalculations
		const processedData = useMemo(() => {
			if (!Array.isArray(data)) return [];
			return data.map((item) => ({
				...item,
				// Add any data transformations here
				formattedValue:
					typeof item.value === "number"
						? item.value.toLocaleString()
						: item.value,
			}));
		}, [data]);

		// Memoize chart configuration
		const chartConfig = useMemo(
			() => ({
				margin: { top: 5, right: 30, left: 20, bottom: 5 },
				colors,
			}),
			[colors],
		);

		const renderChart = () => {
			const commonProps = {
				data: processedData,
				height,
				margin: chartConfig.margin,
			};

			switch (type) {
				case "area":
					return (
						<AreaChart {...commonProps}>
							{showGrid && <CartesianGrid strokeDasharray="3 3" />}
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							{showLegend && <Legend />}
							<Area
								type="monotone"
								dataKey="value"
								stroke={colors[0]}
								fill={colors[0]}
								fillOpacity={0.3}
							/>
						</AreaChart>
					);

				case "bar":
					return (
						<BarChart {...commonProps}>
							{showGrid && <CartesianGrid strokeDasharray="3 3" />}
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							{showLegend && <Legend />}
							<Bar dataKey="value" fill={colors[0]} />
						</BarChart>
					);

				default:
					return (
						<LineChart {...commonProps}>
							{showGrid && <CartesianGrid strokeDasharray="3 3" />}
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							{showLegend && <Legend />}
							<Line
								type="monotone"
								dataKey="value"
								stroke={colors[0]}
								strokeWidth={2}
								dot={{ r: 4 }}
							/>
						</LineChart>
					);
			}
		};

		if (!processedData.length) {
			return (
				<div
					className={`flex items-center justify-center h-${height} ${className || ""}`}
				>
					<p className="text-slate-500">No data available</p>
				</div>
			);
		}

		return (
			<div className={className}>
				<ResponsiveContainer width="100%" height={height}>
					{renderChart()}
				</ResponsiveContainer>
			</div>
		);
	},
);

OptimizedChart.displayName = "OptimizedChart";
