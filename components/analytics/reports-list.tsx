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

export function ReportsList() {
  const reports = [
    { id: 1, name: "Monthly Sales Report", created: "2024-01-15", status: "Completed" },
    { id: 2, name: "User Analytics", created: "2024-01-14", status: "In Progress" },
    { id: 3, name: "Performance Metrics", created: "2024-01-13", status: "Completed" },
  ];

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <CardTitle>{report.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created: {report.created}</span>
              <span className="text-sm font-medium">{report.status}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
