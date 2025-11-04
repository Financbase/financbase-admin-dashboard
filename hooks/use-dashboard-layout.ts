/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { WIDGET_REGISTRY, DEFAULT_WIDGET_ORDER, type WidgetConfig } from "@/lib/widget-registry";

export interface DashboardLayoutState {
  widgetOrder: string[];
  widgetVisibility: Record<string, boolean>;
  widgetSizes: Record<string, { colSpan: number; rowSpan?: number }>;
}

const DEFAULT_LAYOUT: DashboardLayoutState = {
  widgetOrder: DEFAULT_WIDGET_ORDER,
  widgetVisibility: Object.keys(WIDGET_REGISTRY).reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {} as Record<string, boolean>),
  widgetSizes: Object.keys(WIDGET_REGISTRY).reduce((acc, id) => {
    const widget = WIDGET_REGISTRY[id];
    acc[id] = {
      colSpan: widget.defaultColSpan,
      rowSpan: widget.defaultRowSpan,
    };
    return acc;
  }, {} as Record<string, { colSpan: number; rowSpan?: number }>),
};

export function useDashboardLayout() {
  const [layout, setLayout] = useLocalStorage<DashboardLayoutState>(
    "dashboard-layout",
    DEFAULT_LAYOUT
  );

  // Initialize layout if it doesn't exist or is missing new widgets
  useEffect(() => {
    const allWidgetIds = Object.keys(WIDGET_REGISTRY);
    const missingWidgets = allWidgetIds.filter(
      (id) => !layout.widgetOrder.includes(id)
    );

    if (missingWidgets.length > 0) {
      setLayout((prev) => ({
        ...prev,
        widgetOrder: [
          ...prev.widgetOrder,
          ...missingWidgets.sort(
            (a, b) =>
              WIDGET_REGISTRY[a].defaultOrder - WIDGET_REGISTRY[b].defaultOrder
          ),
        ],
        widgetVisibility: {
          ...prev.widgetVisibility,
          ...missingWidgets.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {} as Record<string, boolean>),
        },
        widgetSizes: {
          ...prev.widgetSizes,
          ...missingWidgets.reduce((acc, id) => {
            const widget = WIDGET_REGISTRY[id];
            acc[id] = {
              colSpan: widget.defaultColSpan,
              rowSpan: widget.defaultRowSpan,
            };
            return acc;
          }, {} as Record<string, { colSpan: number; rowSpan?: number }>),
        },
      }));
    }
  }, [layout.widgetOrder, setLayout]);

  const reorderWidgets = useCallback(
    (newOrder: string[]) => {
      setLayout((prev) => ({
        ...prev,
        widgetOrder: newOrder,
      }));
    },
    [setLayout]
  );

  const toggleWidgetVisibility = useCallback(
    (widgetId: string, isVisible: boolean) => {
      const widget = WIDGET_REGISTRY[widgetId];
      if (widget?.isPermanent) return; // Can't hide permanent widgets

      setLayout((prev) => ({
        ...prev,
        widgetVisibility: {
          ...prev.widgetVisibility,
          [widgetId]: isVisible,
        },
      }));
    },
    [setLayout]
  );

  const updateWidgetSize = useCallback(
    (widgetId: string, colSpan: number, rowSpan?: number) => {
      setLayout((prev) => ({
        ...prev,
        widgetSizes: {
          ...prev.widgetSizes,
          [widgetId]: { colSpan, rowSpan },
        },
      }));
    },
    [setLayout]
  );

  const resetToDefault = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
  }, [setLayout]);

  const addWidget = useCallback(
    (widgetId: string) => {
      const widget = WIDGET_REGISTRY[widgetId];
      if (!widget) return;

      // Check if widget is already in the layout
      if (layout.widgetOrder.includes(widgetId)) {
        // If it exists but is hidden, make it visible
        if (layout.widgetVisibility[widgetId] === false) {
          toggleWidgetVisibility(widgetId, true);
        }
        return;
      }

      // Add widget to layout
      setLayout((prev) => ({
        ...prev,
        widgetOrder: [...prev.widgetOrder, widgetId],
        widgetVisibility: {
          ...prev.widgetVisibility,
          [widgetId]: true,
        },
        widgetSizes: {
          ...prev.widgetSizes,
          [widgetId]: {
            colSpan: widget.defaultColSpan,
            rowSpan: widget.defaultRowSpan,
          },
        },
      }));
    },
    [layout.widgetOrder, layout.widgetVisibility, setLayout, toggleWidgetVisibility]
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      const widget = WIDGET_REGISTRY[widgetId];
      if (!widget || widget.isPermanent) return; // Can't remove permanent widgets

      setLayout((prev) => ({
        ...prev,
        widgetOrder: prev.widgetOrder.filter((id) => id !== widgetId),
        widgetVisibility: {
          ...prev.widgetVisibility,
          [widgetId]: false,
        },
      }));
    },
    [setLayout]
  );

  const getVisibleWidgets = useCallback((): WidgetConfig[] => {
    return layout.widgetOrder
      .filter((id) => layout.widgetVisibility[id] !== false)
      .map((id) => WIDGET_REGISTRY[id])
      .filter((widget): widget is WidgetConfig => widget !== undefined);
  }, [layout.widgetOrder, layout.widgetVisibility]);

  const getAvailableWidgets = useCallback((): WidgetConfig[] => {
    const visibleIds = new Set(
      layout.widgetOrder.filter((id) => layout.widgetVisibility[id] !== false)
    );
    return Object.values(WIDGET_REGISTRY).filter(
      (widget) => !visibleIds.has(widget.id)
    );
  }, [layout.widgetOrder, layout.widgetVisibility]);

  return {
    layout,
    visibleWidgets: getVisibleWidgets(),
    availableWidgets: getAvailableWidgets(),
    reorderWidgets,
    toggleWidgetVisibility,
    updateWidgetSize,
    addWidget,
    removeWidget,
    resetToDefault,
  };
}
