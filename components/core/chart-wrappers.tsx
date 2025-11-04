/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React from "react";
import { SalesChart, RevenueChart } from "./sales-chart";

interface ChartWrapperProps {
  className?: string;
}

export function SalesChartWrapper({ className }: ChartWrapperProps) {
  return (
    <div className={`w-full h-full min-h-0 ${className || ""}`}>
      <SalesChart />
    </div>
  );
}

export function RevenueChartWrapper({ className }: ChartWrapperProps) {
  return (
    <div className={`w-full h-full min-h-0 ${className || ""}`}>
      <RevenueChart />
    </div>
  );
}
