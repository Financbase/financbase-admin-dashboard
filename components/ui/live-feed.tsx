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

export function LiveFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">Live activity feed</div>
      </CardContent>
    </Card>
  );
}

interface NotificationCenterFeedProps {
  limit?: number;
  autoRefresh?: boolean;
  showControls?: boolean;
  entityTypes?: string[];
  cardTitle?: string;
  cardDescription?: string;
}

export function NotificationCenterFeed({ limit, autoRefresh, showControls, entityTypes, cardTitle, cardDescription }: NotificationCenterFeedProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle || "Live Feed"}</CardTitle>
        {cardDescription && <p className="text-sm text-muted-foreground">{cardDescription}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {limit ? `Showing ${limit} items` : "Live activity feed"}
        </div>
      </CardContent>
    </Card>
  );
}

