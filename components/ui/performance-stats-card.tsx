/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceStatsCardProps {
  title?: string;
  timeFrame?: string;
  mainMetric?: {
    value: number;
    change: number;
    changePeriod: string;
    label: string;
    unit: string;
  };
  subStats?: Array<{
    value: string;
    label: string;
    subLabel: string;
    status: "healthy" | "warning" | "critical";
    icon?: React.ReactNode;
  }> | [
    {
      value: string;
      label: string;
      subLabel: string;
      status: "healthy" | "warning" | "critical";
      icon?: React.ReactNode;
    },
    {
      value: string;
      label: string;
      subLabel: string;
      status: "healthy" | "warning" | "critical";
      icon?: React.ReactNode;
    },
  ];
  ranking?: {
    score: string;
    category: string;
    icon?: React.ReactNode;
    trend?: "up" | "down";
    status?: "healthy" | "warning" | "critical";
  };
  performance?: {
    title: string;
    bars: Array<{ level: number; period: string }>;
    label: string;
    uptime?: number;
    conversionRate?: number;
  };
}

export function PerformanceStatsCard({ title, timeFrame, mainMetric, subStats, ranking, performance }: PerformanceStatsCardProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Performance Stats"}</CardTitle>
        {timeFrame && <p className="text-sm text-muted-foreground">{timeFrame}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {mainMetric ? `${mainMetric.label}: ${mainMetric.value}${mainMetric.unit}` : "Performance metrics"}
        </div>
      </CardContent>
    </Card>
  );
}
