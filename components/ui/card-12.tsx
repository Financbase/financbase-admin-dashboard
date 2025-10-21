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
