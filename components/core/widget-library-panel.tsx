/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import type { WidgetConfig } from "@/lib/widget-registry";

interface WidgetLibraryPanelProps {
  availableWidgets: WidgetConfig[];
  onAddWidget: (widgetId: string) => void;
  onClose?: () => void;
}

export function WidgetLibraryPanel({
  availableWidgets,
  onAddWidget,
  onClose,
}: WidgetLibraryPanelProps) {
  if (availableWidgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Widget Library</CardTitle>
          <CardDescription>All available widgets are already added</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have added all available widgets to your dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Widget Library</CardTitle>
            <CardDescription>
              Add widgets to customize your dashboard
            </CardDescription>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {availableWidgets.map((widget) => (
              <div
                key={widget.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  "hover:bg-muted/50 transition-colors cursor-pointer",
                  "group"
                )}
                onClick={() => onAddWidget(widget.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {widget.icon && (
                    <div className="flex-shrink-0">
                      <widget.icon
                        className={cn(
                          "h-5 w-5",
                          widget.iconColor || "text-blue-500"
                        )}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {widget.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {widget.description}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddWidget(widget.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

