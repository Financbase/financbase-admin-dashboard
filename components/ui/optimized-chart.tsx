"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OptimizedChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground">Optimized chart visualization would go here</p>
        </div>
      </CardContent>
    </Card>
  );
}
