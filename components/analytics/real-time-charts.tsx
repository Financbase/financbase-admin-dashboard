"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RealTimeCharts() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-muted-foreground">Real-time chart visualization would go here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
