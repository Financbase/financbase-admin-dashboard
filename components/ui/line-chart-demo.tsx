"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LineChartDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground">Line chart visualization would go here</p>
        </div>
      </CardContent>
    </Card>
  );
}
