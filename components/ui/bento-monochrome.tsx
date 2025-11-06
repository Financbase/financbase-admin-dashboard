/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const BentoCard = ({ title, description, className, children }: BentoCardProps) => (
  <Card className={cn("border-2", className)}>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    {children && <CardContent>{children}</CardContent>}
  </Card>
);

export function BentoMonochrome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <BentoCard
        title="Analytics"
        description="Track your performance"
        className="md:col-span-2"
      >
        <div className="h-32 bg-muted rounded-lg" />
      </BentoCard>
      <BentoCard title="Revenue" description="Current earnings">
        <div className="h-32 bg-muted rounded-lg" />
      </BentoCard>
      <BentoCard title="Users" description="Active users">
        <div className="h-32 bg-muted rounded-lg" />
      </BentoCard>
      <BentoCard
        title="Reports"
        description="Detailed insights"
        className="md:col-span-2"
      >
        <div className="h-32 bg-muted rounded-lg" />
      </BentoCard>
      <BentoCard title="Settings" description="Configuration">
        <div className="h-32 bg-muted rounded-lg" />
      </BentoCard>
    </div>
  );
}
