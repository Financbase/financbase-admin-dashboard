import { BarChart3 } from "lucide-react";
("use client");

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/core/ui/layout/chart";
import { cn } from "@/lib/utils";
import React from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

const chartConfig: ChartConfig = {
	leads: {
		label: "Leads",
		color: "#3b82f6",
	},
	converted: {
		label: "Converted",
		color: "#10b981",
	},
};

export { chartConfig as areaChartConfig };
