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
import { Activity } from "lucide-react";

export function Waveform() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Audio Waveform
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-end space-x-1 h-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="bg-blue-500 rounded-sm"
                style={{
                  width: '4px',
                  height: `${Math.random() * 60 + 20}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Audio waveform visualization
        </p>
      </CardContent>
    </Card>
  );
}
