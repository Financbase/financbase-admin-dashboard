"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
