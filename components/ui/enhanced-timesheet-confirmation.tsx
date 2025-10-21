"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Edit } from "lucide-react";

export function EnhancedTimesheetConfirmation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Enhanced Timesheet Confirmation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Hours</span>
            <Badge variant="secondary">40.5 hours</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="default">Pending Review</Badge>
          </div>
          <div className="flex gap-2">
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm & Submit
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Entries
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
