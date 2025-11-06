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

interface FreelancerStatsCardProps {
  title?: string;
  timeFrame?: string;
  earnings?: {
    amount: number;
    change: number;
    changePeriod: string;
  };
  subStats?: Array<{
    value: number;
    label: string;
    subLabel: string;
  }> | [
    { value: number; label: string; subLabel: string },
    { value: number; label: string; subLabel: string },
  ];
  ranking?: {
    score?: string;
    place?: string;
    category: string;
    icon?: React.ReactNode;
    trend?: "up" | "down";
  };
  availability?: {
    title?: string;
    hours?: number;
    label?: string;
    bars?: Array<{ level: number }>;
  };
}

export function FreelancerStatsCard({ title, timeFrame, earnings, subStats, ranking, availability }: FreelancerStatsCardProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Freelancer Stats"}</CardTitle>
        {timeFrame && <p className="text-sm text-muted-foreground">{timeFrame}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {earnings ? `$${earnings.amount.toLocaleString()}` : "Freelancer statistics"}
        </div>
      </CardContent>
    </Card>
  );
}
