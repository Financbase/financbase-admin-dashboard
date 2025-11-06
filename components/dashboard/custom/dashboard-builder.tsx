"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Save, 
  Share2, 
  Settings, 
  Eye, 
  Grid, 
  Layout, 
  Palette,
  Copy,
  Trash2,
  Move,
  Maximize2,
  Lock,
  Unlock,
  Download,
  Upload
} from 'lucide-react';
import { WidgetLibrary } from './widget-library';
import { WidgetConfigurator } from './widget-configurator';
import { DashboardCanvas } from './dashboard-canvas';

interface DashboardBuilderProps {
  dashboardId?: number;
  onSave: (dashboard: any) => void;
  onCancel: () => void;
}

export function DashboardBuilder({ dashboardId, onSave, onCancel }: DashboardBuilderProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedWidget, setSelectedWidget] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch dashboard if editing
  const { data: existingDashboard, isLoading } = useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: async () => {
      if (!dashboardId) return null;
      const response = await fetch(`/api/dashboards/${dashboardId}`);
      return response.json();
    },
    enabled: !!dashboardId,
  });

  // Create/Update dashboard mutation
  const saveDashboardMutation = useMutation({
    mutationFn: async (dashboardData: any) => {
      const url = dashboardId 
        ? `/api/dashboards/${dashboardId}`
        : '/api/dashboards';
      const method = dashboardId ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboardData),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      onSave(data);
    },
  });

  // Initialize dashboard
  useEffect(() => {
    if (existingDashboard) {
      setDashboard(existingDashboard);
    } else if (!dashboardId) {
      // Create new dashboard
      setDashboard({
        name: 'New Dashboard',
        description: '',
        layout: {
          columns: 12,
          rows: 8,
          cellSize: { width: 200, height: 150 },
          gap: 16,
          padding: 16,
        },
        widgets: [],
        theme: 'light',
        colorScheme: 'blue',
        isPublic: false,
      });
    }
  }, [existingDashboard, dashboardId]);

  const handleAddWidget = (widgetTemplate: any) => {
    if (!dashboard) return;

    const newWidget = {
      id: Date.now(), // Temporary ID
      type: widgetTemplate.type,
      title: widgetTemplate.name,
      position: {
        x: 0,
        y: 0,
        w: widgetTemplate.defaultSize.w,
        h: widgetTemplate.defaultSize.h,
      },
      config: widgetTemplate.defaultConfig,
      isVisible: true,
    };

    setDashboard({
      ...dashboard,
      widgets: [...dashboard.widgets, newWidget],
    });

    setShowWidgetLibrary(false);
  };

  const handleUpdateWidget = (widgetId: number, updates: any) => {
    if (!dashboard) return;

    setDashboard({
      ...dashboard,
      widgets: dashboard.widgets.map((widget: any) =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
    });
  };

  const handleRemoveWidget = (widgetId: number) => {
    if (!dashboard) return;

    setDashboard({
      ...dashboard,
      widgets: dashboard.widgets.filter((widget: any) => widget.id !== widgetId),
    });
    setSelectedWidget(null);
  };

  const handleSave = () => {
    if (!dashboard) return;

    saveDashboardMutation.mutate(dashboard);
  };

  const handleDuplicate = () => {
    if (!dashboard) return;

    const duplicatedDashboard = {
      ...dashboard,
      name: `${dashboard.name} (Copy)`,
      widgets: dashboard.widgets.map((widget: any) => ({
        ...widget,
        id: Date.now() + Math.random(),
      })),
    };

    setDashboard(duplicatedDashboard);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Input
                value={dashboard.name}
                onChange={(e) => setDashboard({ ...dashboard, name: e.target.value })}
                className="text-lg font-semibold border-none p-0 h-auto"
                placeholder="Dashboard name"
              />
              <Input
                value={dashboard.description || ''}
                onChange={(e) => setDashboard({ ...dashboard, description: e.target.value })}
                className="text-sm text-muted-foreground border-none p-0 h-auto mt-1"
                placeholder="Dashboard description"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button
              variant="outline"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowWidgetLibrary(true)}
              disabled={isPreviewMode}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>

            <Button
              onClick={handleSave}
              disabled={saveDashboardMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveDashboardMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {!isPreviewMode && (
          <div className="w-80 border-r bg-muted/25 p-4 space-y-4">
            <Tabs defaultValue="widgets" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="widgets">Widgets</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="widgets" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Widget Library</h3>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowWidgetLibrary(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Widgets
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Current Widgets</h3>
                  <div className="space-y-2">
                    {dashboard.widgets.map((widget: any) => (
                      <Card 
                        key={widget.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedWidget?.id === widget.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedWidget(widget)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{widget.title}</p>
                              <p className="text-xs text-muted-foreground">{widget.type}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveWidget(widget.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Layout Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Columns</Label>
                      <Input
                        type="number"
                        value={dashboard.layout.columns}
                        onChange={(e) => setDashboard({
                          ...dashboard,
                          layout: { ...dashboard.layout, columns: parseInt(e.target.value) }
                        })}
                        min="1"
                        max="24"
                      />
                    </div>
                    <div>
                      <Label>Cell Width</Label>
                      <Input
                        type="number"
                        value={dashboard.layout.cellSize.width}
                        onChange={(e) => setDashboard({
                          ...dashboard,
                          layout: { 
                            ...dashboard.layout, 
                            cellSize: { 
                              ...dashboard.layout.cellSize, 
                              width: parseInt(e.target.value) 
                            }
                          }
                        })}
                        min="100"
                        max="500"
                      />
                    </div>
                    <div>
                      <Label>Cell Height</Label>
                      <Input
                        type="number"
                        value={dashboard.layout.cellSize.height}
                        onChange={(e) => setDashboard({
                          ...dashboard,
                          layout: { 
                            ...dashboard.layout, 
                            cellSize: { 
                              ...dashboard.layout.cellSize, 
                              height: parseInt(e.target.value) 
                            }
                          }
                        })}
                        min="100"
                        max="500"
                      />
                    </div>
                    <div>
                      <Label>Gap</Label>
                      <Input
                        type="number"
                        value={dashboard.layout.gap}
                        onChange={(e) => setDashboard({
                          ...dashboard,
                          layout: { ...dashboard.layout, gap: parseInt(e.target.value) }
                        })}
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 p-4">
          <DashboardCanvas
            dashboard={dashboard}
            selectedWidget={selectedWidget}
            onSelectWidget={setSelectedWidget}
            onUpdateWidget={handleUpdateWidget}
            onRemoveWidget={handleRemoveWidget}
            isPreviewMode={isPreviewMode}
          />
        </div>

        {/* Widget Configurator */}
        {selectedWidget && !isPreviewMode && (
          <div className="w-80 border-l bg-muted/25 p-4">
            <WidgetConfigurator
              widget={selectedWidget}
              onUpdate={(updates) => handleUpdateWidget(selectedWidget.id, updates)}
              onClose={() => setSelectedWidget(null)}
            />
          </div>
        )}
      </div>

      {/* Widget Library Dialog */}
      <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Widget Library</DialogTitle>
            <DialogDescription>
              Choose a widget to add to your dashboard
            </DialogDescription>
          </DialogHeader>
          <WidgetLibrary onSelectWidget={handleAddWidget} />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard Settings</DialogTitle>
            <DialogDescription>
              Configure your dashboard appearance and behavior
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Theme</Label>
              <Select
                value={dashboard.theme}
                onValueChange={(value) => setDashboard({ ...dashboard, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color Scheme</Label>
              <Select
                value={dashboard.colorScheme}
                onValueChange={(value) => setDashboard({ ...dashboard, colorScheme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={dashboard.isPublic}
                onChange={(e) => setDashboard({ ...dashboard, isPublic: e.target.checked })}
              />
              <Label htmlFor="isPublic">Make dashboard public</Label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
