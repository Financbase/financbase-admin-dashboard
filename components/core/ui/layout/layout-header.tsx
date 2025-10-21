"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LayoutHeader({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Layout header content</p>
      </CardContent>
    </Card>
  );
}
