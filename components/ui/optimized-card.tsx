"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OptimizedCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Optimized</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Load Time</span>
            <span className="font-bold text-green-600">1.2s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bundle Size</span>
            <span className="font-bold text-green-600">245KB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
            <span className="font-bold text-green-600">98.5%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
