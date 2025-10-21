"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FraudCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Fraud Detection
          <Badge variant="destructive">Alert</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900">Suspicious Activity Detected</p>
            <p className="text-xs text-red-700">Multiple failed login attempts from unknown IP</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Risk Level</span>
            <Badge variant="destructive">High</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
