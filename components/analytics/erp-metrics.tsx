"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ErpMetrics() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ERP System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">System Uptime</p>
              <p className="text-2xl font-bold">99.9%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Data Processed</p>
              <p className="text-2xl font-bold">2.4TB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
