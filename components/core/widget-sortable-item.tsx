/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Maximize2, Minimize2, Move, Trash2 } from "lucide-react";
import { BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { WidgetConfig } from "@/lib/widget-registry";
import type { ReactNode } from "react";
import { useState, useCallback } from "react";

interface SortableWidgetItemProps {
  widget: WidgetConfig;
  isEditMode: boolean;
  colSpan: number;
  rowSpan?: number;
  header?: ReactNode;
  children: ReactNode;
  onResize?: (colSpan: number, rowSpan?: number) => void;
  onRemove?: (widgetId: string) => void;
}

export function SortableWidgetItem({
  widget,
  isEditMode,
  colSpan,
  rowSpan,
  header,
  children,
  onResize,
  onRemove,
}: SortableWidgetItemProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [resizeMenuOpen, setResizeMenuOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: widget.id,
    disabled: !isEditMode, // Disable sorting when not in edit mode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Use explicit class names for Tailwind to detect them during build
  // Support up to 12 columns for flexible grid layouts
  const colSpanClass = {
    1: "col-span-12 md:col-span-1",
    2: "col-span-12 md:col-span-2",
    3: "col-span-12 md:col-span-3",
    4: "col-span-12 md:col-span-4",
    5: "col-span-12 md:col-span-5",
    6: "col-span-12 md:col-span-6",
    12: "col-span-12",
  }[colSpan] || `col-span-12 md:col-span-${colSpan}`;
  
  const rowSpanClass = rowSpan ? {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    5: "row-span-5",
    6: "row-span-6",
  }[rowSpan] || `row-span-${rowSpan}` : "";

  const defaultHeader = header || (
    <div className="flex items-center space-x-2">
      {widget.icon && (
        <widget.icon
          className={cn("h-5 w-5", widget.iconColor || "text-blue-500")}
        />
      )}
      <span className="text-sm font-medium">{widget.title}</span>
    </div>
  );

  const handleResize = (newColSpan: number, newRowSpan?: number) => {
    if (onResize) {
      onResize(newColSpan, newRowSpan);
      // Keep menu open to allow multiple resize operations
      // The menu will close when user clicks outside or presses escape
    }
  };

  const increaseColSpan = () => {
    // Support up to 6 columns (half of 12-column grid)
    if (colSpan < 6) {
      handleResize(colSpan + 1, rowSpan);
    }
  };

  const decreaseColSpan = () => {
    if (colSpan > 1) {
      handleResize(colSpan - 1, rowSpan);
    }
  };

  const increaseRowSpan = () => {
    const newRowSpan = (rowSpan || 1) + 1;
    // Support up to 6 rows
    if (newRowSpan <= 6) {
      handleResize(colSpan, newRowSpan);
    }
  };

  const decreaseRowSpan = () => {
    const currentRowSpan = rowSpan || 1;
    if (currentRowSpan > 1) {
      handleResize(colSpan, currentRowSpan - 1);
    }
  };



  // Set ref for sortable
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
  }, [setNodeRef]);

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn(
        "relative group",
        isEditMode && "cursor-move",
        isDragging && "z-50"
      )}
    >
      <BentoGridItem
        title={widget.title}
        description={widget.description}
        header={
          <div className="flex items-center justify-between w-full relative">
            {defaultHeader}
            {isEditMode && (
              <div className="flex items-center gap-1 z-10">
                {/* Resize Controls - More Visible */}
                <DropdownMenu open={resizeMenuOpen} onOpenChange={setResizeMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        "bg-blue-50 dark:bg-blue-950/50",
                        "hover:bg-blue-100 dark:hover:bg-blue-900/50",
                        "border border-blue-200 dark:border-blue-800",
                        "transition-colors",
                        "opacity-100",
                        "relative z-10"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      aria-label="Resize widget"
                      title={`Current size: ${colSpan}×${rowSpan || 1}`}
                    >
                      <Move className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
                      Resize Widget
                    </div>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Width (Columns)
                    </div>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        decreaseColSpan();
                      }}
                      disabled={colSpan <= 1}
                    >
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Decrease Width ({colSpan - 1} cols)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        increaseColSpan();
                      }}
                      disabled={colSpan >= 6}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Increase Width ({colSpan + 1} cols)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Height (Rows)
                    </div>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        decreaseRowSpan();
                      }}
                      disabled={(rowSpan || 1) <= 1}
                    >
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Decrease Height ({(rowSpan || 1) - 1} rows)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        increaseRowSpan();
                      }}
                      disabled={(rowSpan || 1) >= 6}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Increase Height ({(rowSpan || 1) + 1} rows)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs text-center text-muted-foreground bg-muted/50">
                      Current: {colSpan}×{rowSpan || 1}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Remove Button */}
                {!widget.isPermanent && onRemove && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        "bg-red-50 dark:bg-red-950/50",
                        "hover:bg-red-100 dark:hover:bg-red-900/50",
                        "border border-red-200 dark:border-red-800",
                        "transition-colors",
                        "opacity-100",
                        "relative z-10"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRemoveDialog(true);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      aria-label="Remove widget"
                      title="Remove widget"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                    <AlertDialog 
                      open={showRemoveDialog} 
                      onOpenChange={(open) => {
                        setShowRemoveDialog(open);
                      }}
                    >
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Widget?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{widget.title}" from your dashboard? 
                            You can add it back later from the widget library.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel 
                            onClick={(e) => {
                            e.stopPropagation();
                            setShowRemoveDialog(false);
                            }}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (onRemove) {
                              onRemove(widget.id);
                              }
                              setShowRemoveDialog(false);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                {/* Drag Handle - Only enable in edit mode */}
                {isEditMode && (
                  <div
                    {...attributes}
                    {...listeners}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg",
                      "bg-blue-50 dark:bg-blue-950/50",
                      "hover:bg-blue-100 dark:hover:bg-blue-900/50",
                      "border border-blue-200 dark:border-blue-800",
                      "cursor-grab active:cursor-grabbing",
                      "transition-all duration-200",
                      "touch-none", // Prevent touch scrolling on mobile
                      "hover:scale-110 hover:shadow-md",
                      "active:scale-95",
                      "select-none", // Prevent text selection during drag
                      "relative z-20" // Ensure drag handle is above other controls
                    )}
                    aria-label="Drag to reorder"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4 text-blue-600 dark:text-blue-400 pointer-events-none" />
                  </div>
                )}
              </div>
            )}
          </div>
        }
        className={cn(
          colSpanClass,
          rowSpanClass,
          isEditMode &&
            "ring-2 ring-blue-500 ring-offset-2 dark:ring-blue-400",
          isDragging && "shadow-2xl"
        )}
      >
        {children}
      </BentoGridItem>
    </div>
  );
}
