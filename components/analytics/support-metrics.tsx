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

export function SupportMetrics() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Support Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Open Tickets</p>
              <p className="text-2xl font-bold">23</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Avg Response Time</p>
              <p className="text-2xl font-bold">2.4h</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Satisfaction</p>
              <p className="text-2xl font-bold">4.8/5</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
