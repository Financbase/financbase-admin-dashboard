"use client";

import React, { useState, useCallback } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BentoGrid } from "@/components/ui/bento-grid";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign as DollarSignIcon,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  Zap as ZapIcon,
  Brain as BrainIcon,
  Star as StarIcon,
  FileText,
  Settings,
  Eye,
  Plus,
  LayoutGrid
} from "lucide-react";
import { DashboardSearch } from "./dashboard-search";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { SortableWidgetItem } from "./widget-sortable-item";
import { WidgetLibraryPanel } from "./widget-library-panel";
import { cn } from "@/lib/utils";

export default function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)
  const {
    visibleWidgets,
    availableWidgets,
    layout,
    reorderWidgets,
    updateWidgetSize,
    addWidget,
    removeWidget,
  } = useDashboardLayout()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Here you would typically filter your dashboard data based on the search query
    console.log('Searching for:', query)
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = layout.widgetOrder.indexOf(active.id as string);
      const newIndex = layout.widgetOrder.indexOf(over.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...layout.widgetOrder];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        reorderWidgets(newOrder);
      }
    }
  }, [layout.widgetOrder, reorderWidgets]);

	return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights and comprehensive financial overview
          </p>
				</div>
        <div className="flex items-center space-x-2">
          {isEditMode && (
            <Button
              variant="outline"
              onClick={() => setShowWidgetLibrary(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
              {availableWidgets.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {availableWidgets.length}
                </Badge>
              )}
            </Button>
          )}
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="mr-2 h-4 w-4" />
            {isEditMode ? "Done Editing" : "Customize Dashboard"}
          </Button>
          {!isEditMode && (
            <>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
            </>
          )}
				</div>
			</div>

      {/* Search Bar */}
      <div className="max-w-md">
        <DashboardSearch 
          onSearch={handleSearch}
          placeholder="Search transactions, clients, or reports..."
        />
      </div>

      {/* Edit Mode Info Banner */}
      {isEditMode && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Edit Mode Active
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Drag widgets to reorder • Use resize controls to adjust size • Click remove to delete widgets
                </p>
              </div>
              <Badge variant="secondary" className="text-blue-700 dark:text-blue-300">
                {visibleWidgets.length} widget{visibleWidgets.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className={cn("max-w-7xl mx-auto", isEditMode && "ring-2 ring-blue-500 ring-offset-2 rounded-lg p-2")}>
        {visibleWidgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Add widgets to customize your dashboard
            </p>
            {isEditMode && (
              <Button onClick={() => setShowWidgetLibrary(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            )}
          </div>
        ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={visibleWidgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            <BentoGrid>
              {visibleWidgets.map((widget) => {
                const WidgetComponent = widget.component;
                const widgetSize = layout.widgetSizes[widget.id] || {
                  colSpan: widget.defaultColSpan,
                  rowSpan: widget.defaultRowSpan,
                };

                // Generate header based on widget configuration or use default
                let widgetHeader = widget.header;
                if (!widgetHeader) {
                  // Default headers based on widget ID for backwards compatibility
                  const headerMap: Record<string, React.ReactNode> = {
                    "financial-overview": (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSignIcon className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">Portfolio Value</span>
                        </div>
                        <Badge variant="secondary" className="text-green-600">
                          +8.5%
                        </Badge>
                      </div>
                    ),
                    "quick-actions": (
                      <div className="flex items-center space-x-2">
                        <ZapIcon className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Actions</span>
                      </div>
                    ),
                    "ai-insights": (
                      <div className="flex items-center space-x-2">
                        <BrainIcon className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">AI Analysis</span>
                      </div>
                    ),
                    "sales-performance": (
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Sales Chart</span>
                      </div>
                    ),
                    "top-products": (
                      <div className="flex items-center space-x-2">
                        <StarIcon className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium">Top Performers</span>
                      </div>
                    ),
                    "revenue-analysis": (
                      <div className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Revenue Chart</span>
                      </div>
                    ),
                    "customer-analytics": (
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        <span className="text-sm font-medium">Customer Data</span>
                      </div>
                    ),
                    "recent-activity": (
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium">Activity Feed</span>
                      </div>
                    ),
                    "support-tickets": (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">Support</span>
                      </div>
                    ),
                    "recent-orders": (
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Order History</span>
                      </div>
                    ),
                    "financial-widgets": (
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Financial Tools</span>
                      </div>
                    ),
                  };
                  widgetHeader = headerMap[widget.id];
                }

                return (
                  <SortableWidgetItem
                    key={widget.id}
                    widget={widget}
                    isEditMode={isEditMode}
                    colSpan={widgetSize.colSpan}
                    rowSpan={widgetSize.rowSpan}
                    header={widgetHeader}
                    onResize={(newColSpan, newRowSpan) =>
                      updateWidgetSize(widget.id, newColSpan, newRowSpan)
                    }
                      onRemove={removeWidget}
                  >
                    <WidgetComponent />
                  </SortableWidgetItem>
                );
              })}
            </BentoGrid>
          </SortableContext>
        </DndContext>
        )}
      </div>

      {/* Widget Library Dialog */}
      <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Widget Library</DialogTitle>
            <DialogDescription>
              Add widgets to customize your dashboard layout
            </DialogDescription>
          </DialogHeader>
          <WidgetLibraryPanel
            availableWidgets={availableWidgets}
            onAddWidget={(widgetId) => {
              addWidget(widgetId);
              setShowWidgetLibrary(false);
            }}
            onClose={() => setShowWidgetLibrary(false)}
          />
        </DialogContent>
      </Dialog>
		</div>
	);
}