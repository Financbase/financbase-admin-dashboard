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

interface FinancialStatsCardProps {
  title?: string;
  timeFrame?: string;
  mainMetric?: {
    amount: number;
    change: number;
    changePeriod: string;
    currency: string;
  };
  subStats?: Array<{
    value: string;
    label: string;
    subLabel: string;
    trend: "up" | "neutral" | "down";
  }> | [
    {
      value: string;
      label: string;
      subLabel: string;
      trend: "up" | "down" | "neutral";
    },
    {
      value: string;
      label: string;
      subLabel: string;
      trend: "up" | "down" | "neutral";
    },
  ];
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
    conversionRate?: number;
    healthScore?: number;
  };
}

export function FinancialStatsCard({ title, timeFrame, mainMetric, subStats, ranking, performance }: FinancialStatsCardProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Financial Stats"}</CardTitle>
        {timeFrame && <p className="text-sm text-muted-foreground">{timeFrame}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {mainMetric ? `${mainMetric.currency}${mainMetric.amount.toLocaleString()}` : "Financial statistics"}
        </div>
      </CardContent>
    </Card>
  );
}
