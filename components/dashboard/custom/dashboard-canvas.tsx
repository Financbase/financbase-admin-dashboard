"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Move, 
  Resize, 
  Settings, 
  Trash2, 
  Lock, 
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

interface DashboardCanvasProps {
  dashboard: any;
  selectedWidget: any;
  onSelectWidget: (widget: any) => void;
  onUpdateWidget: (widgetId: number, updates: any) => void;
  onRemoveWidget: (widgetId: number) => void;
  isPreviewMode: boolean;
}

export function DashboardCanvas({
  dashboard,
  selectedWidget,
  onSelectWidget,
  onUpdateWidget,
  onRemoveWidget,
  isPreviewMode
}: DashboardCanvasProps) {
  const [draggedWidget, setDraggedWidget] = useState<any>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const handleWidgetClick = (widget: any) => {
    if (!isPreviewMode) {
      onSelectWidget(widget);
    }
  };

  const handleWidgetDrag = useCallback((widget: any, deltaX: number, deltaY: number) => {
    if (isPreviewMode || widget.isLocked) return;

    const newPosition = {
      x: Math.max(0, widget.position.x + deltaX),
      y: Math.max(0, widget.position.y + deltaY),
      w: widget.position.w,
      h: widget.position.h,
    };

    onUpdateWidget(widget.id, { position: newPosition });
  }, [isPreviewMode, onUpdateWidget]);

  const handleWidgetResize = useCallback((widget: any, handle: string, deltaX: number, deltaY: number) => {
    if (isPreviewMode || widget.isLocked) return;

    const { x, y, w, h } = widget.position;
    let newPosition = { x, y, w, h };

    switch (handle) {
      case 'se': // South-east
        newPosition = { x, y, w: w + deltaX, h: h + deltaY };
        break;
      case 'sw': // South-west
        newPosition = { x: x + deltaX, y, w: w - deltaX, h: h + deltaY };
        break;
      case 'ne': // North-east
        newPosition = { x, y: y + deltaY, w: w + deltaX, h: h - deltaY };
        break;
      case 'nw': // North-west
        newPosition = { x: x + deltaX, y: y + deltaY, w: w - deltaX, h: h - deltaY };
        break;
      case 'n': // North
        newPosition = { x, y: y + deltaY, w, h: h - deltaY };
        break;
      case 's': // South
        newPosition = { x, y, w, h: h + deltaY };
        break;
      case 'e': // East
        newPosition = { x, y, w: w + deltaX, h };
        break;
      case 'w': // West
        newPosition = { x: x + deltaX, y, w: w - deltaX, h };
        break;
    }

    // Ensure minimum size
    newPosition.w = Math.max(1, newPosition.w);
    newPosition.h = Math.max(1, newPosition.h);

    onUpdateWidget(widget.id, { position: newPosition });
  }, [isPreviewMode, onUpdateWidget]);

  const renderWidget = (widget: any) => {
    const isSelected = selectedWidget?.id === widget.id;
    const isDragging = draggedWidget?.id === widget.id;

    return (
      <div
        key={widget.id}
        className={cn(
          "absolute border-2 rounded-lg bg-background shadow-sm transition-all",
          isSelected && "ring-2 ring-primary",
          isDragging && "opacity-50",
          !widget.isVisible && "opacity-30"
        )}
        style={{
          left: widget.position.x,
          top: widget.position.y,
          width: widget.position.w * dashboard.layout.cellSize.width,
          height: widget.position.h * dashboard.layout.cellSize.height,
          backgroundColor: widget.config.appearance?.backgroundColor,
          borderColor: widget.config.appearance?.borderColor,
          color: widget.config.appearance?.textColor,
        }}
        onClick={() => handleWidgetClick(widget)}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{widget.title}</h4>
            {!widget.isVisible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
            {widget.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
          
          {!isPreviewMode && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateWidget(widget.id, { isVisible: !widget.isVisible });
                }}
              >
                {widget.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateWidget(widget.id, { isLocked: !widget.isLocked });
                }}
              >
                {widget.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveWidget(widget.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Widget Content */}
        <div className="p-2 flex-1">
          {renderWidgetContent(widget)}
        </div>

        {/* Resize Handles */}
        {!isPreviewMode && !widget.isLocked && widget.isResizable && (
          <>
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary cursor-se-resize rounded-full"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizeHandle('se');
                setDraggedWidget(widget);
              }}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary cursor-sw-resize rounded-full"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizeHandle('sw');
                setDraggedWidget(widget);
              }}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary cursor-ne-resize rounded-full"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizeHandle('ne');
                setDraggedWidget(widget);
              }}
            />
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-primary cursor-nw-resize rounded-full"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizeHandle('nw');
                setDraggedWidget(widget);
              }}
            />
          </>
        )}

        {/* Drag Handle */}
        {!isPreviewMode && !widget.isLocked && widget.isMovable && (
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-transparent cursor-move"
            onMouseDown={(e) => {
              e.stopPropagation();
              setDraggedWidget(widget);
            }}
          />
        )}
      </div>
    );
  };

  const renderWidgetContent = (widget: any) => {
    switch (widget.type) {
      case 'chart':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                📊
              </div>
              <p className="text-sm text-muted-foreground">Chart Widget</p>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">Data Table</div>
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        );
      
      case 'metric':
        return (
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">$12,345</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xs text-green-600">+12.5%</div>
          </div>
        );
      
      case 'text':
        return (
          <div className="text-sm">
            <p>This is a text widget. You can add any text content here.</p>
          </div>
        );
      
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              🖼️
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                📦
              </div>
              <p className="text-sm text-muted-foreground">{widget.type}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full bg-muted/25 rounded-lg overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${dashboard.layout.cellSize.width}px ${dashboard.layout.cellSize.height}px`,
        }}
      />

      {/* Widgets */}
      {dashboard.widgets.map(renderWidget)}

      {/* Empty State */}
      {dashboard.widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <h3 className="text-lg font-medium mb-2">No widgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first widget to get started
            </p>
            {!isPreviewMode && (
              <Button onClick={() => {/* Open widget library */}}>
                Add Widget
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Mouse Event Handlers */}
      {!isPreviewMode && (
        <div
          className="absolute inset-0"
          onMouseMove={(e) => {
            if (draggedWidget && resizeHandle) {
              const deltaX = e.movementX / dashboard.layout.cellSize.width;
              const deltaY = e.movementY / dashboard.layout.cellSize.height;
              handleWidgetResize(draggedWidget, resizeHandle, deltaX, deltaY);
            } else if (draggedWidget && !resizeHandle) {
              const deltaX = e.movementX / dashboard.layout.cellSize.width;
              const deltaY = e.movementY / dashboard.layout.cellSize.height;
              handleWidgetDrag(draggedWidget, deltaX, deltaY);
            }
          }}
          onMouseUp={() => {
            setDraggedWidget(null);
            setResizeHandle(null);
          }}
        />
      )}
    </div>
  );
}
