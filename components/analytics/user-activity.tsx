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

export function UserActivity() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Users</span>
              <span className="font-bold">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">New Signups</span>
              <span className="font-bold">+45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Page Views</span>
              <span className="font-bold">12,345</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
