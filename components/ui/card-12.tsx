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

export function Card12() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card 12</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is a specialized card component for project management.
        </p>
      </CardContent>
    </Card>
  );
}

export interface OpportunityCardProps {
  status?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  [key: string]: any;
}

export function OpportunityCard({ status, onAccept, onDecline, ...props }: OpportunityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunity</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Status: {status || "Available"}</p>
        {onAccept && <button onClick={onAccept}>Accept</button>}
        {onDecline && <button onClick={onDecline}>Decline</button>}
      </CardContent>
    </Card>
  );
}
