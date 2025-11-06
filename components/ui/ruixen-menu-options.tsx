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

interface RuixenMenuOptionsProps {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  onActionComplete?: () => void;
}

export function RuixenMenuOptions({ entityType, entityId, entityName, onActionComplete }: RuixenMenuOptionsProps = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {entityName ? `${entityType}: ${entityName}` : "Menu options"}
        </div>
      </CardContent>
    </Card>
  );
}

