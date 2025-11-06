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

interface EcommerceStatsCardProps {
  title?: string;
  timeFrame?: string;
  mainMetric?: {
    value: number;
    change: number;
    changePeriod: string;
    label: string;
    currency: string;
  };
  subStats?: Array<{
    value: string;
    label: string;
    subLabel: string;
    trend: "up" | "down" | "neutral";
    icon?: React.ReactNode;
  }>;
  ranking?: {
    score: string;
    category: string;
    icon?: React.ReactNode;
    trend: "up" | "down";
  };
  performance?: {
    title: string;
    bars: Array<{ level: number; period: string }>;
    label: string;
    conversionRate: number;
  };
}

export function EcommerceStatsCard({ title, timeFrame, mainMetric, subStats, ranking, performance }: EcommerceStatsCardProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "E-commerce Stats"}</CardTitle>
        {timeFrame && <p className="text-sm text-muted-foreground">{timeFrame}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {mainMetric ? `${mainMetric.label}: ${mainMetric.currency}${mainMetric.value.toLocaleString()}` : "Statistics"}
        </div>
      </CardContent>
    </Card>
  );
}

