"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReportBuilder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">Build custom reports with drag-and-drop interface</p>
          <Button>Create New Report</Button>
        </div>
      </CardContent>
    </Card>
  );
}
