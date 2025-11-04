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
import { Heart, Activity, TrendingUp } from "lucide-react";

export function HealthStatCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Health Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Heart Rate</span>
            <Badge variant="secondary">72 BPM</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Steps Today</span>
            <span className="font-bold text-green-600">8,432</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Sleep Quality</span>
            <Badge variant="default">Good</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
