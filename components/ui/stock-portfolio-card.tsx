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

export function StockPortfolioCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Value</span>
            <span className="font-bold">$125,430</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Today's Change</span>
            <span className="font-bold text-green-600">+$2,340</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
