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
import { useState } from "react";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Use explicit class names for Tailwind to detect them during build
  const colSpanClass = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
  }[colSpan] || "md:col-span-1";
  
  const rowSpanClass = rowSpan ? {
    1: "md:row-span-1",
    2: "md:row-span-2",
    3: "md:row-span-3",
  }[rowSpan] || "" : "";

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
    }
  };

  const increaseColSpan = () => {
    if (colSpan < 3) {
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
    if (newRowSpan <= 3) {
      handleResize(colSpan, newRowSpan);
    }
  };

  const decreaseRowSpan = () => {
    const currentRowSpan = rowSpan || 1;
    if (currentRowSpan > 1) {
      handleResize(colSpan, currentRowSpan - 1);
    }
  };

  return (
    <div
      ref={setNodeRef}
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
          <div className="flex items-center justify-between w-full">
            {defaultHeader}
            {isEditMode && (
              <div className="flex items-center gap-1">
                {/* Resize Controls - More Visible */}
                <DropdownMenu>
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
                        "opacity-100"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Resize widget"
                      title={`Current size: ${colSpan}×${rowSpan || 1}`}
                    >
                      <Move className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
                      Resize Widget
                    </div>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Width (Columns)
                    </div>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseColSpan();
                      }}
                      disabled={colSpan <= 1}
                    >
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Decrease Width ({colSpan - 1} cols)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        increaseColSpan();
                      }}
                      disabled={colSpan >= 3}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Increase Width ({colSpan + 1} cols)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Height (Rows)
                    </div>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseRowSpan();
                      }}
                      disabled={(rowSpan || 1) <= 1}
                    >
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Decrease Height ({(rowSpan || 1) - 1} rows)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        increaseRowSpan();
                      }}
                      disabled={(rowSpan || 1) >= 3}
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
                        "opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRemoveDialog(true);
                      }}
                      aria-label="Remove widget"
                      title="Remove widget"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                    <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Widget?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{widget.title}" from your dashboard? 
                            You can add it back later from the widget library.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => {
                            e.stopPropagation();
                            setShowRemoveDialog(false);
                          }}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(widget.id);
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
                {/* Drag Handle */}
                <div
                  {...attributes}
                  {...listeners}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    "bg-gray-100 dark:bg-gray-800",
                    "hover:bg-gray-200 dark:hover:bg-gray-700",
                    "cursor-grab active:cursor-grabbing",
                    "transition-colors"
                  )}
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
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
      {/* Resize handles on corners (visual indicators in edit mode) */}
      {isEditMode && (
        <>
          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5",
              "bg-blue-500 dark:bg-blue-400 rounded-full",
              "opacity-60 group-hover:opacity-100 transition-opacity",
              "cursor-nwse-resize",
              "ring-2 ring-white dark:ring-gray-900",
              "shadow-sm hover:shadow-md"
            )}
            title="Resize widget (drag corner)"
          />
          <div
            className={cn(
              "absolute -bottom-1 -left-1 w-5 h-5",
              "bg-blue-500 dark:bg-blue-400 rounded-full",
              "opacity-60 group-hover:opacity-100 transition-opacity",
              "cursor-nesw-resize",
              "ring-2 ring-white dark:ring-gray-900",
              "shadow-sm hover:shadow-md"
            )}
            title="Resize widget (drag corner)"
          />
          <div
            className={cn(
              "absolute -top-1 -right-1 w-5 h-5",
              "bg-blue-500 dark:bg-blue-400 rounded-full",
              "opacity-60 group-hover:opacity-100 transition-opacity",
              "cursor-nesw-resize",
              "ring-2 ring-white dark:ring-gray-900",
              "shadow-sm hover:shadow-md"
            )}
            title="Resize widget (drag corner)"
          />
          <div
            className={cn(
              "absolute -top-1 -left-1 w-5 h-5",
              "bg-blue-500 dark:bg-blue-400 rounded-full",
              "opacity-60 group-hover:opacity-100 transition-opacity",
              "cursor-nwse-resize",
              "ring-2 ring-white dark:ring-gray-900",
              "shadow-sm hover:shadow-md"
            )}
            title="Resize widget (drag corner)"
          />
        </>
      )}
    </div>
  );
}
