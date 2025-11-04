/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
