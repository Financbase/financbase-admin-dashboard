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
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatisticsCard5() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics Card 5</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value</span>
            <span className="text-2xl font-bold">$12,345</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Change</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
