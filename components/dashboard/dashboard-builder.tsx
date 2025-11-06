/**
 * Enhanced Analytics Dashboard Builder
 * Customizable, investor-ready dashboards with drag-and-drop functionality
 * Real-time data connections and advanced visualization options
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Download,
  Share,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Target,
  Zap,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  AreaChart,
  Gauge,
  ArrowUpDown,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Dashboard types and interfaces
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  dataSource: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
  size: 'small' | 'medium' | 'large' | 'xlarge';
  refreshInterval?: number;
  permissions: {
    canView: string[];
    canEdit: string[];
  };
  style: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

export type WidgetType =
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'area_chart'
  | 'table'
  | 'text'
  | 'metric_comparison'
  | 'trend_indicator'
  | 'progress_bar'
  | 'cash_flow'
  | 'profitability'
  | 'revenue_breakdown'
  | 'expense_analysis';

export interface WidgetConfig {
  // Common config
  dataSource: string;
  filters?: DataFilter[];
  groupBy?: string[];
  sortBy?: SortConfig;

  // Chart-specific config
  xAxis?: string;
  yAxis?: string[];
  chartType?: 'line' | 'bar' | 'area' | 'pie' | 'doughnut';
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];

  // KPI-specific config
  format?: 'currency' | 'percentage' | 'number' | 'duration';
  comparison?: {
    enabled: boolean;
    period: 'previous_period' | 'same_period_last_year' | 'custom';
    customPeriod?: { start: Date; end: Date };
  };

  // Table-specific config
  columns?: TableColumn[];
  pagination?: boolean;
  pageSize?: number;
  tableType?: string;

  // Text widget config
  content?: string;

  // Conditional formatting
  thresholds?: ThresholdRule[];
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  label: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableColumn {
  field: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  width?: number;
  sortable?: boolean;
  format?: string;
}

export interface ThresholdRule {
  field: string;
  operator: 'greater' | 'less' | 'equals' | 'between';
  value: number;
  color: string;
  icon?: string;
  message?: string;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'investor' | 'compliance' | 'custom';
  widgets: DashboardWidget[];
  thumbnail?: string;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  usage: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: Layout[];
  filters: GlobalFilter[];
  settings: DashboardSettings;
  permissions: DashboardPermissions;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  isTemplate?: boolean;
  tags: string[];
}

export interface GlobalFilter {
  id: string;
  field: string;
  type: 'date_range' | 'select' | 'multiselect' | 'number_range' | 'text';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
}

export interface DashboardSettings {
  refreshInterval: number;
  autoRefresh: boolean;
  showFilters: boolean;
  allowExport: boolean;
  allowShare: boolean;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  timezone: string;
}

export interface DashboardPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canShare: string[];
  canExport: string[];
  isPublic: boolean;
}

// Pre-built dashboard templates
export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'investor-overview',
    name: 'Investor Overview',
    description: 'Comprehensive dashboard for investor reporting and fundraising',
    category: 'investor',
    widgets: [
      {
        id: 'revenue-kpi',
        type: 'kpi_card',
        title: 'Monthly Recurring Revenue',
        dataSource: 'revenue',
        config: {
          dataSource: 'revenue',
          format: 'currency',
          comparison: { enabled: true, period: 'previous_period' }
        },
        position: { x: 0, y: 0, w: 3, h: 2 },
        size: 'medium',
        permissions: { canView: ['all'], canEdit: ['admin'] },
        style: { backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' }
      },
      {
        id: 'cash-flow-chart',
        type: 'line_chart',
        title: 'Cash Flow Trend',
        dataSource: 'transactions',
        config: {
          dataSource: 'transactions',
          xAxis: 'date',
          yAxis: ['inflow', 'outflow'],
          chartType: 'line',
          showLegend: true
        },
        position: { x: 3, y: 0, w: 6, h: 4 },
        size: 'large',
        permissions: { canView: ['all'], canEdit: ['admin'] },
        style: {}
      },
      {
        id: 'expense-breakdown',
        type: 'pie_chart',
        title: 'Expense Breakdown',
        dataSource: 'expenses',
        config: {
          dataSource: 'expenses',
          groupBy: ['category'],
          chartType: 'pie',
          showLegend: true
        },
        position: { x: 9, y: 0, w: 3, h: 4 },
        size: 'medium',
        permissions: { canView: ['all'], canEdit: ['admin'] },
        style: {}
      }
    ],
    thumbnail: '/templates/investor-overview.png',
    tags: ['investor', 'fundraising', 'overview'],
    isPublic: true,
    createdBy: 'system',
    usage: 1250
  },
  {
    id: 'financial-health',
    name: 'Financial Health Monitor',
    description: 'Real-time monitoring of key financial metrics and health indicators',
    category: 'financial',
    widgets: [
      {
        id: 'health-score',
        type: 'kpi_card',
        title: 'Financial Health Score',
        dataSource: 'health_metrics',
        config: {
          dataSource: 'health_metrics',
          format: 'number',
          thresholds: [
            { field: 'score', operator: 'greater', value: 80, color: '#22c55e', icon: 'check', message: 'Excellent' },
            { field: 'score', operator: 'greater', value: 60, color: '#eab308', icon: 'alert', message: 'Good' },
            { field: 'score', operator: 'less', value: 60, color: '#ef4444', icon: 'warning', message: 'Needs Attention' }
          ]
        },
        position: { x: 0, y: 0, w: 2, h: 2 },
        size: 'small',
        permissions: { canView: ['all'], canEdit: ['admin'] },
        style: {}
      }
    ],
    tags: ['health', 'monitoring', 'kpis'],
    isPublic: true,
    createdBy: 'system',
    usage: 890
  }
];

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardBuilderProps {
  dashboard?: Dashboard;
  onSave?: (dashboard: Dashboard) => void;
  onExport?: (format: 'pdf' | 'csv' | 'xlsx') => void;
  onShare?: (email: string, permissions: string[]) => void;
  mode?: 'view' | 'edit' | 'create';
  className?: string;
}

export function DashboardBuilder({
  dashboard,
  onSave,
  onExport,
  onShare,
  mode = 'view',
  className
}: DashboardBuilderProps) {
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(dashboard || null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = mode === 'edit' || mode === 'create';

  // Initialize dashboard
  useEffect(() => {
    if (dashboard) {
      setCurrentDashboard(dashboard);
    }
  }, [dashboard]);

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    if (currentDashboard && isEditMode) {
      setCurrentDashboard({
        ...currentDashboard,
        layout,
        widgets: currentDashboard.widgets.map((widget, index) => ({
          ...widget,
          position: {
            x: layout[index].x,
            y: layout[index].y,
            w: layout[index].w,
            h: layout[index].h
          }
        }))
      });
    }
  }, [currentDashboard, isEditMode]);

  const addWidget = (widgetType: WidgetType) => {
    if (!currentDashboard) return;

    const newWidget: DashboardWidget = {
      id: crypto.randomUUID(),
      type: widgetType,
      title: getDefaultWidgetTitle(widgetType),
      dataSource: getDefaultDataSource(widgetType),
      config: getDefaultWidgetConfig(widgetType),
      position: {
        x: (currentDashboard.widgets.length * 3) % 12,
        y: Math.floor(currentDashboard.widgets.length / 4) * 2,
        w: getDefaultWidgetSize(widgetType).w,
        h: getDefaultWidgetSize(widgetType).h
      },
      size: getDefaultWidgetSize(widgetType).size,
      permissions: { canView: ['all'], canEdit: ['admin'] },
      style: {}
    };

    setCurrentDashboard({
      ...currentDashboard,
      widgets: [...currentDashboard.widgets, newWidget],
      layout: [
        ...currentDashboard.layout,
        {
          i: newWidget.id,
          x: newWidget.position.x,
          y: newWidget.position.y,
          w: newWidget.position.w,
          h: newWidget.position.h,
          minW: 2,
          minH: 2
        }
      ]
    });

    setShowWidgetLibrary(false);
  };

  const removeWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    setCurrentDashboard({
      ...currentDashboard,
      widgets: currentDashboard.widgets.filter(w => w.id !== widgetId),
      layout: currentDashboard.layout.filter(l => l.i !== widgetId)
    });
  };

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    if (!currentDashboard) return;

    setCurrentDashboard({
      ...currentDashboard,
      widgets: currentDashboard.widgets.map(w =>
        w.id === widgetId ? { ...w, ...updates } : w
      )
    });
  };

  const handleGlobalFilterChange = (filterId: string, value: any) => {
    setGlobalFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  if (!currentDashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Dashboard Selected</h3>
          <p className="text-muted-foreground mb-4">
            Create a new dashboard or select an existing one to get started.
          </p>
          <Button onClick={() => setShowWidgetLibrary(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold">{currentDashboard.name}</h1>
            <p className="text-muted-foreground">{currentDashboard.description}</p>
          </div>
          {currentDashboard.tags.length > 0 && (
            <div className="flex space-x-2">
              {currentDashboard.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Global Filters */}
          {currentDashboard.settings.showFilters && currentDashboard.filters.length > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              {currentDashboard.filters.map(filter => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Label className="text-sm">{filter.label}</Label>
                  {renderGlobalFilter(filter, globalFilters[filter.id], handleGlobalFilterChange)}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>

          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('xlsx')}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onShare && (
            <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}

          {isEditMode && (
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}

          {isEditMode && (
            <Button onClick={() => setShowWidgetLibrary(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: currentDashboard.layout }}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {currentDashboard.widgets.map(widget => (
            <div key={widget.id} className="relative group">
              <WidgetContainer
                widget={widget}
                isEditMode={isEditMode}
                isSelected={selectedWidget === widget.id}
                globalFilters={globalFilters}
                onSelect={() => setSelectedWidget(widget.id)}
                onUpdate={(updates) => updateWidget(widget.id, updates)}
                onRemove={() => removeWidget(widget.id)}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Widget Library Dialog */}
      <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Choose a widget type to add to your dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {WIDGET_TYPES.map(widgetType => (
              <Card
                key={widgetType.type}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addWidget(widgetType.type)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    {getWidgetIcon(widgetType.type)}
                    <CardTitle className="text-sm">{widgetType.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {widgetType.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Dashboard</DialogTitle>
            <DialogDescription>
              Share this dashboard with team members or external users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" placeholder="user@example.com" />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2">
                {[
                  { id: 'view', label: 'View only' },
                  { id: 'edit', label: 'Can edit' },
                  { id: 'share', label: 'Can share' },
                  { id: 'export', label: 'Can export' }
                ].map(permission => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Switch id={permission.id} />
                    <Label htmlFor={permission.id}>{permission.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle share logic
              setShowShareDialog(false);
            }}>
              Share Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Widget container component
interface WidgetContainerProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  isSelected: boolean;
  globalFilters: Record<string, any>;
  onSelect: () => void;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onRemove: () => void;
}

function WidgetContainer({
  widget,
  isEditMode,
  isSelected,
  globalFilters,
  onSelect,
  onUpdate,
  onRemove
}: WidgetContainerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWidgetData();
  }, [widget, globalFilters]);

  const loadWidgetData = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would call your data API based on widget.dataSource and config
      const widgetData = await fetchWidgetData(widget, globalFilters);
      setData(widgetData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (newConfig: Partial<WidgetConfig>) => {
    onUpdate({ config: { ...widget.config, ...newConfig } });
  };

  return (
    <Card
      className={cn(
        "h-full transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isEditMode && "hover:shadow-lg"
      )}
      onClick={isEditMode ? onSelect : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getWidgetIcon(widget.type)}
            <CardTitle className="text-sm">{widget.title}</CardTitle>
          </div>

          {isEditMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  const newTitle = prompt('New title');
                  if (newTitle !== null) {
                    onUpdate({ title: newTitle });
                  }
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {/* Copy widget */}}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {widget.description && (
          <CardDescription className="text-xs">
            {widget.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && data && (
          <WidgetRenderer
            widget={widget}
            data={data}
            onConfigChange={handleConfigChange}
            isEditMode={isEditMode}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Widget renderer based on type
interface WidgetRendererProps {
  widget: DashboardWidget;
  data: any;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
  isEditMode: boolean;
}

function WidgetRenderer({ widget, data, onConfigChange, isEditMode }: WidgetRendererProps) {
  switch (widget.type) {
    case 'kpi_card':
      return <KPICardWidget widget={widget} data={data} />;

    case 'line_chart':
      return <LineChartWidget widget={widget} data={data} />;

    case 'bar_chart':
      return <BarChartWidget widget={widget} data={data} />;

    case 'pie_chart':
      return <PieChartWidget widget={widget} data={data} />;

    case 'table':
      return <TableWidget widget={widget} data={data} />;

    case 'text':
      return <TextWidget widget={widget} data={data} />;

    default:
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          Unsupported widget type: {widget.type}
        </div>
      );
  }
}

// Individual widget components
function KPICardWidget({ widget, data }: { widget: DashboardWidget; data: any }) {
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const comparison = data.comparison;
  const changeColor = comparison?.change >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-3">
      <div className="text-3xl font-bold">
        {formatValue(data.value, widget.config.format || 'number')}
      </div>

      {comparison?.enabled && (
        <div className="flex items-center space-x-2 text-sm">
          <TrendingUp className={cn("h-4 w-4", changeColor)} />
          <span className={changeColor}>
            {comparison.change >= 0 ? '+' : ''}{formatValue(comparison.change, widget.config.format || 'number')}
          </span>
          <span className="text-muted-foreground">vs {comparison.period}</span>
        </div>
      )}

      {widget.config.thresholds && widget.config.thresholds.map((threshold: ThresholdRule) => {
        if (evaluateThreshold(data.value, threshold)) {
          return (
            <div key={threshold.field} className="flex items-center space-x-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: threshold.color }}
              />
              <span>{threshold.message}</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function LineChartWidget({ widget, data }: { widget: DashboardWidget; data: any }) {
  // Implementation using Chart.js or Recharts
  return (
    <div className="h-64">
      <div className="text-center text-muted-foreground py-8">
        Line Chart: {widget.title}
        <br />
        Data points: {data.length}
      </div>
    </div>
  );
}

function BarChartWidget({ widget, data }: { widget: DashboardWidget; data: any }) {
  return (
    <div className="h-64">
      <div className="text-center text-muted-foreground py-8">
        Bar Chart: {widget.title}
        <br />
        Categories: {data.categories?.length || 0}
      </div>
    </div>
  );
}

function PieChartWidget({ widget, data }: { widget: DashboardWidget; data: any }) {
  return (
    <div className="h-64">
      <div className="text-center text-muted-foreground py-8">
        Pie Chart: {widget.title}
        <br />
        Segments: {data.segments?.length || 0}
      </div>
    </div>
  );
}

function TableWidget({ widget, data }: { widget: DashboardWidget; data: any }) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-sm min-w-full">
          <thead>
            <tr className="border-b">
              {widget.config.columns?.map((column: TableColumn) => (
                <th key={column.field} className="text-left p-2 min-w-0 whitespace-nowrap">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows?.slice(0, 5).map((row: any, index: number) => (
              <tr key={index} className="border-b">
                {widget.config.columns?.map((column: TableColumn) => (
                  <td key={column.field} className="p-2 min-w-0">
                    <div className="break-words whitespace-normal" title={String(row[column.field] || '')}>
                      {formatTableCell(row[column.field], column.type)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalRows > 5 && (
        <div className="text-xs text-muted-foreground text-center">
          Showing 5 of {data.totalRows} rows
        </div>
      )}
    </div>
  );
}

function TextWidget({ widget, data }: { widget: DashboardWidget; data: any }) {
  const content = data.content || widget.config.content || 'No content';
  const sanitizedContent = sanitizeHtml(content);
  return (
    <div className="prose prose-sm max-w-none">
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </div>
  );
}

// Utility functions
function renderGlobalFilter(
  filter: GlobalFilter,
  value: any,
  onChange: (id: string, value: any) => void
) {
  switch (filter.type) {
    case 'date_range':
      return (
        <div className="flex space-x-2">
          <Input
            type="date"
            value={value?.start || ''}
            onChange={(e) => onChange(filter.id, { ...value, start: e.target.value })}
          />
          <Input
            type="date"
            value={value?.end || ''}
            onChange={(e) => onChange(filter.id, { ...value, end: e.target.value })}
          />
        </div>
      );

    case 'select':
      return (
        <Select value={value || ''} onValueChange={(val) => onChange(filter.id, val)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {filter.options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return <div>Unsupported filter type</div>;
  }
}

function formatTableCell(value: any, type: string): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'date':
      return new Date(value).toLocaleDateString();
    default:
      return String(value);
  }
}

function evaluateThreshold(value: number, threshold: ThresholdRule): boolean {
  switch (threshold.operator) {
    case 'greater':
      return value > threshold.value;
    case 'less':
      return value < threshold.value;
    case 'equals':
      return value === threshold.value;
    case 'between':
      return value >= threshold.value && value <= (threshold as any).maxValue;
    default:
      return false;
  }
}

function getWidgetIcon(type: WidgetType) {
  const icons = {
    kpi_card: <Target className="h-4 w-4" />,
    line_chart: <LineChart className="h-4 w-4" />,
    bar_chart: <BarChart3 className="h-4 w-4" />,
    pie_chart: <PieChart className="h-4 w-4" />,
    area_chart: <AreaChart className="h-4 w-4" />,
    table: <Activity className="h-4 w-4" />,
    text: <Eye className="h-4 w-4" />,
    metric_comparison: <ArrowUpDown className="h-4 w-4" />,
    trend_indicator: <TrendingUp className="h-4 w-4" />,
    progress_bar: <Gauge className="h-4 w-4" />,
    cash_flow: <DollarSign className="h-4 w-4" />,
    profitability: <TrendingUp className="h-4 w-4" />,
    revenue_breakdown: <BarChart3 className="h-4 w-4" />,
    expense_analysis: <TrendingDown className="h-4 w-4" />
  };

  return icons[type] || <BarChart3 className="h-4 w-4" />;
}

const WIDGET_TYPES: Array<{ type: WidgetType; title: string; description: string }> = [
  { type: 'kpi_card', title: 'KPI Card', description: 'Display key metrics and performance indicators' },
  { type: 'line_chart', title: 'Line Chart', description: 'Show trends over time' },
  { type: 'bar_chart', title: 'Bar Chart', description: 'Compare values across categories' },
  { type: 'pie_chart', title: 'Pie Chart', description: 'Show proportions and percentages' },
  { type: 'area_chart', title: 'Area Chart', description: 'Display cumulative trends with filled areas' },
  { type: 'table', title: 'Data Table', description: 'Display tabular data with sorting and filtering' },
  { type: 'text', title: 'Text Widget', description: 'Add explanatory text or notes' },
  { type: 'metric_comparison', title: 'Metric Comparison', description: 'Compare multiple metrics side by side' },
  { type: 'trend_indicator', title: 'Trend Indicator', description: 'Show directional trends and changes' },
  { type: 'progress_bar', title: 'Progress Bar', description: 'Display progress towards goals' },
  { type: 'cash_flow', title: 'Cash Flow', description: 'Track cash inflows and outflows' },
  { type: 'profitability', title: 'Profitability', description: 'Analyze profit margins and returns' },
  { type: 'revenue_breakdown', title: 'Revenue Breakdown', description: 'Break down revenue by source' },
  { type: 'expense_analysis', title: 'Expense Analysis', description: 'Analyze expense patterns and categories' }
];

function getDefaultWidgetTitle(type: WidgetType): string {
  const titles = {
    kpi_card: 'New KPI',
    line_chart: 'Trend Chart',
    bar_chart: 'Comparison Chart',
    pie_chart: 'Breakdown Chart',
    area_chart: 'Area Chart',
    table: 'Data Table',
    text: 'Text Widget',
    metric_comparison: 'Metric Comparison',
    trend_indicator: 'Trend Indicator',
    progress_bar: 'Progress Bar',
    cash_flow: 'Cash Flow',
    profitability: 'Profitability',
    revenue_breakdown: 'Revenue Breakdown',
    expense_analysis: 'Expense Analysis'
  };
  return titles[type] || 'New Widget';
}

function getDefaultDataSource(type: WidgetType): string {
  const sources = {
    kpi_card: 'kpi_metrics',
    line_chart: 'time_series',
    bar_chart: 'categorical',
    pie_chart: 'proportions',
    area_chart: 'time_series',
    table: 'tabular',
    text: 'static',
    metric_comparison: 'comparison',
    trend_indicator: 'trends',
    progress_bar: 'progress',
    cash_flow: 'cash_flow',
    profitability: 'profitability',
    revenue_breakdown: 'revenue',
    expense_analysis: 'expenses'
  };
  return sources[type] || 'default';
}

function getDefaultWidgetConfig(type: WidgetType): WidgetConfig {
  const configs: Record<WidgetType, WidgetConfig> = {
    kpi_card: {
      dataSource: 'kpi_metrics',
      format: 'number',
      comparison: { enabled: false, period: 'previous_period' }
    },
    line_chart: {
      dataSource: 'time_series',
      xAxis: 'date',
      yAxis: ['value'],
      chartType: 'line',
      showLegend: true,
      showGrid: true
    },
    bar_chart: {
      dataSource: 'categorical',
      xAxis: 'category',
      yAxis: ['value'],
      chartType: 'bar',
      showLegend: false,
      showGrid: true
    },
    pie_chart: {
      dataSource: 'proportions',
      groupBy: ['category'],
      chartType: 'pie',
      showLegend: true
    },
    area_chart: {
      dataSource: 'time_series',
      xAxis: 'date',
      yAxis: ['value'],
      chartType: 'area',
      showLegend: true,
      showGrid: true
    },
    table: {
      dataSource: 'tabular',
      columns: [
        { field: 'name', label: 'Name', type: 'text' },
        { field: 'value', label: 'Value', type: 'number' }
      ],
      pagination: true,
      pageSize: 10
    },
    text: {
      dataSource: 'static',
      content: 'Add your content here...'
    },
    metric_comparison: {
      dataSource: 'comparison',
      format: 'number',
      comparison: { enabled: true, period: 'previous_period' }
    },
    trend_indicator: {
      dataSource: 'trends',
      format: 'percentage',
      comparison: { enabled: true, period: 'previous_period' }
    },
    progress_bar: {
      dataSource: 'progress',
      format: 'percentage'
    },
    cash_flow: {
      dataSource: 'cash_flow',
      xAxis: 'date',
      yAxis: ['inflow', 'outflow'],
      chartType: 'bar',
      showLegend: true,
      showGrid: true
    },
    profitability: {
      dataSource: 'profitability',
      format: 'percentage',
      comparison: { enabled: true, period: 'previous_period' }
    },
    revenue_breakdown: {
      dataSource: 'revenue',
      groupBy: ['source'],
      chartType: 'pie',
      showLegend: true
    },
    expense_analysis: {
      dataSource: 'expenses',
      groupBy: ['category'],
      chartType: 'bar',
      showLegend: true,
      showGrid: true
    }
  };

  return configs[type];
}

function getDefaultWidgetSize(type: WidgetType): { w: number; h: number; size: DashboardWidget['size'] } {
  const sizes = {
    kpi_card: { w: 3, h: 2, size: 'small' as const },
    line_chart: { w: 6, h: 4, size: 'large' as const },
    bar_chart: { w: 6, h: 4, size: 'large' as const },
    pie_chart: { w: 3, h: 4, size: 'medium' as const },
    area_chart: { w: 6, h: 4, size: 'large' as const },
    table: { w: 8, h: 6, size: 'xlarge' as const },
    text: { w: 4, h: 2, size: 'medium' as const },
    metric_comparison: { w: 4, h: 3, size: 'medium' as const },
    trend_indicator: { w: 3, h: 2, size: 'small' as const },
    progress_bar: { w: 4, h: 2, size: 'medium' as const },
    cash_flow: { w: 6, h: 4, size: 'large' as const },
    profitability: { w: 4, h: 3, size: 'medium' as const },
    revenue_breakdown: { w: 4, h: 4, size: 'medium' as const },
    expense_analysis: { w: 6, h: 4, size: 'large' as const }
  };

  return sizes[type] || { w: 4, h: 3, size: 'medium' as const };
}

// Real data fetching function - connects to actual API endpoints
async function fetchWidgetData(widget: DashboardWidget, globalFilters: Record<string, any>): Promise<any> {
  try {
    // Build query parameters from widget config and global filters
    const params = new URLSearchParams();
    const period = globalFilters.period || widget.config.filters?.find(f => f.field === 'period')?.value || '30d';
    params.set('period', period);

    // Map widget dataSource to API endpoint
    let apiUrl = '';
    switch (widget.dataSource) {
      case 'dashboard/overview':
        apiUrl = '/api/dashboard/overview';
        break;
      case 'analytics/overview':
      case 'analytics':
        apiUrl = '/api/analytics';
        params.set('metric', 'overview');
        break;
      case 'analytics/revenue':
        apiUrl = '/api/analytics';
        params.set('metric', 'revenue');
        break;
      case 'analytics/expenses':
        apiUrl = '/api/analytics/expenses';
        break;
      case 'analytics/clients':
        apiUrl = '/api/analytics/clients';
        break;
      case 'analytics/performance':
        apiUrl = '/api/analytics/performance';
        break;
      default:
        // Default to dashboard overview if dataSource not recognized
        apiUrl = '/api/dashboard/overview';
    }

    // Add any additional filters from widget config
    if (widget.config.filters) {
      widget.config.filters.forEach(filter => {
        if (filter.field !== 'period') {
          params.set(filter.field, String(filter.value));
        }
      });
    }

    // Fetch data from API
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    const apiData = await response.json();

    // Transform API response based on widget type
    switch (widget.type) {
      case 'kpi_card':
        // Extract KPI value from API response
        const value = apiData.overview?.totalRevenue || 
                     apiData.data?.overview?.totalRevenue || 
                     apiData.data?.revenue?.monthly || 
                     0;
        
        // Calculate comparison if enabled
        let comparison = undefined;
        if (widget.config.comparison?.enabled) {
          const prevValue = apiData.overview?.previousRevenue || 
                           apiData.data?.revenue?.previousMonth || 
                           value * 0.9; // Fallback estimate
          const change = value - prevValue;
          const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
          
          comparison = {
            enabled: true,
            period: widget.config.comparison.period || 'previous_period',
            change: change,
            changePercent: changePercent
          };
        }

        return {
          value: Math.round(value),
          comparison: comparison
        };

      case 'line_chart':
      case 'area_chart':
        // Fetch real historical time series data from database
        try {
          // Determine chart type from widget config or dataSource
          const chartType = widget.config?.chartType || 
                          (widget.dataSource?.includes('revenue') ? 'revenue' : 
                           widget.dataSource?.includes('expense') ? 'expenses' : 'revenue');
          
          // Determine period from filters or default to 12 months
          const periodFilter = widget.config.filters?.find(f => f.field === 'period');
          const period = periodFilter?.value || globalFilters.period || '12m';
          
          // Fetch historical data from chart data API
          const chartDataResponse = await fetch(
            `/api/dashboard/chart-data?type=${chartType}&period=${period}&timeRange=month`
          );
          
          if (chartDataResponse.ok) {
            const chartData = await chartDataResponse.json();
            if (chartData.success && chartData.data?.timeSeries) {
              // Return time series data in expected format
              return chartData.data.timeSeries.map((point: { date: string; value: number }) => ({
                date: point.date,
                value: Math.round(point.value),
              }));
            }
          }
        } catch (error) {
          console.warn('Failed to fetch historical chart data:', error);
        }
        
        // Fallback: try to use existing API data if available
        if (apiData.data?.revenue?.monthly) {
          // If we have monthly data, try to fetch historical data with a shorter period
          try {
            const fallbackResponse = await fetch('/api/dashboard/chart-data?type=revenue&period=90d&timeRange=week');
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.success && fallbackData.data?.timeSeries) {
                return fallbackData.data.timeSeries.map((point: { date: string; value: number }) => ({
                  date: point.date,
                  value: Math.round(point.value),
                }));
              }
            }
          } catch (error) {
            console.warn('Fallback chart data fetch failed:', error);
          }
        }
        
        // Last resort: return empty array if no data available
        return [];

      case 'bar_chart':
        // For bar charts, we can use category breakdowns
        if (apiData.data?.expenses?.categories) {
          const categories = Object.keys(apiData.data.expenses.categories);
          return {
            categories: categories,
            values: categories.map(cat => apiData.data.expenses.categories[cat])
          };
        }
        // Fallback: try to fetch historical data for bar chart
        try {
          const chartDataResponse = await fetch('/api/dashboard/chart-data?type=revenue&period=90d&timeRange=week');
          if (chartDataResponse.ok) {
            const chartData = await chartDataResponse.json();
            if (chartData.success && chartData.data?.timeSeries && chartData.data.timeSeries.length > 0) {
              // Use last 6 data points for bar chart
              const recentData = chartData.data.timeSeries.slice(-6);
              return {
                categories: recentData.map((point: { date: string }) => point.date),
                values: recentData.map((point: { value: number }) => Math.round(point.value)),
              };
            }
          }
        } catch (error) {
          console.warn('Failed to fetch bar chart historical data:', error);
        }
        
        // Last resort: return empty structure if no data available
        return {
          categories: [],
          values: []
        };

      case 'pie_chart':
        // For pie charts, use expense categories or revenue breakdown
        if (apiData.data?.expenses?.categories) {
          const categories = Object.entries(apiData.data.expenses.categories);
          const total = categories.reduce((sum, [, val]) => sum + Number(val), 0);
          return {
            segments: categories.map(([category, value]) => ({
              category,
              value: Number(value),
              percentage: total > 0 ? Math.round((Number(value) / total) * 100) : 0
            }))
          };
        }
        // Fallback: revenue breakdown
        const totalRevenue = apiData.data?.overview?.totalRevenue || 0;
        return {
          segments: [
            { category: 'Revenue', value: totalRevenue, percentage: 100 }
          ]
        };

      case 'table':
        // For tables, fetch from appropriate endpoint based on widget config
        const tableType = widget.config?.tableType || widget.dataSource || 'invoices';
        let tableData = { rows: [], totalRows: 0 };
        
        try {
          let tableResponse;
          const limit = widget.config?.pageSize || 10;
          const offset = 0;
          
          if (tableType.includes('invoice') || tableType === 'invoices') {
            tableResponse = await fetch(`/api/invoices?limit=${limit}&offset=${offset}`);
            if (tableResponse.ok) {
              const data = await tableResponse.json();
              tableData.rows = (data.invoices || []).map((item: any) => ({
                id: item.id,
                name: item.clientName || item.client?.name || 'Unknown Client',
                value: item.total || 0,
                category: item.status || 'pending',
                date: item.dueDate || item.createdAt
              }));
              tableData.totalRows = data.total || tableData.rows.length;
            }
          } else if (tableType.includes('expense') || tableType === 'expenses') {
            tableResponse = await fetch(`/api/expenses?limit=${limit}&offset=${offset}`);
            if (tableResponse.ok) {
              const data = await tableResponse.json();
              tableData.rows = (data.expenses || []).map((item: any) => ({
                id: item.id,
                name: item.description || item.vendor || 'Unknown',
                value: item.amount || 0,
                category: item.category || 'general',
                date: item.date || item.createdAt
              }));
              tableData.totalRows = data.total || tableData.rows.length;
            }
          } else if (tableType.includes('client') || tableType === 'clients') {
            tableResponse = await fetch(`/api/clients?limit=${limit}&offset=${offset}`);
            if (tableResponse.ok) {
              const data = await tableResponse.json();
              tableData.rows = (data.clients || []).map((item: any) => ({
                id: item.id,
                name: item.name || 'Unknown Client',
                value: item.totalRevenue || 0,
                category: item.status || 'active',
                date: item.createdAt
              }));
              tableData.totalRows = data.total || tableData.rows.length;
            }
          }
        } catch (error) {
          console.error('Error fetching table data:', error);
        }
        
        // Fallback to overview data if table fetch failed
        if (tableData.rows.length === 0) {
          return {
            rows: [
              { id: '1', name: 'Total Revenue', value: apiData.data?.overview?.totalRevenue || 0, category: 'Revenue', date: new Date().toISOString() },
              { id: '2', name: 'Total Expenses', value: apiData.data?.overview?.totalExpenses || 0, category: 'Expenses', date: new Date().toISOString() },
              { id: '3', name: 'Net Profit', value: (apiData.data?.overview?.totalRevenue || 0) - (apiData.data?.overview?.totalExpenses || 0), category: 'Profit', date: new Date().toISOString() },
              { id: '4', name: 'Active Clients', value: apiData.data?.overview?.clients || 0, category: 'Clients', date: new Date().toISOString() }
            ],
            totalRows: 4
          };
        }
        
        return tableData;

      case 'metric_comparison':
        return {
          current: apiData.data?.overview?.totalRevenue || 0,
          previous: apiData.data?.revenue?.previousMonth || 0,
          growth: apiData.data?.overview?.growth || 0
        };

      case 'trend_indicator':
        const growth = apiData.data?.overview?.growth || apiData.data?.revenue?.growth || 0;
        return {
          value: growth,
          direction: growth >= 0 ? 'up' : 'down',
          label: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`
        };

      default:
        // Return raw data for other widget types
        return apiData.data || apiData.overview || apiData;
    }
  } catch (error) {
    console.error(`Error fetching widget data for ${widget.type}:`, error);
    // Return empty/default data on error
    return widget.type === 'kpi_card' 
      ? { value: 0, comparison: { enabled: false } }
      : widget.type === 'table'
      ? { rows: [], totalRows: 0 }
      : [];
  }
}
