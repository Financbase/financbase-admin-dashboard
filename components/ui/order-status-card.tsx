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

export interface OrderStatusCardProps {
  title?: string;
  description?: string;
  timelineItems?: Array<{
    icon?: React.ReactNode;
    title: string;
    details?: string;
    subItems?: Array<{
      icon?: React.ReactNode;
      text: string;
    }>;
    statusChange?: {
      from: string;
      to: string;
    };
  }>;
  onContinue?: () => void;
  onClose?: () => void;
}

export function OrderStatusCard({ title, description, timelineItems, onContinue, onClose }: OrderStatusCardProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Order Status"}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {timelineItems ? `${timelineItems.length} timeline items` : "Order information"}
        </div>
      </CardContent>
    </Card>
  );
}

