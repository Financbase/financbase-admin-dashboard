"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TimesheetConfirmation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Confirmation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please review and confirm your timesheet entries.
          </p>
          <div className="flex gap-2">
            <Button>Confirm</Button>
            <Button variant="outline">Edit</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
