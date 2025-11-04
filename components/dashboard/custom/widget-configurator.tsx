/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  X, 
  Palette, 
  Settings, 
  BarChart3, 
  Table, 
  TrendingUp,
  FileText,
  Image,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Move,
  Resize
} from 'lucide-react';

interface WidgetConfiguratorProps {
  widget: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

export function WidgetConfigurator({ widget, onUpdate, onClose }: WidgetConfiguratorProps) {
  const [config, setConfig] = useState(widget.config || {});
  const [appearance, setAppearance] = useState(widget.config?.appearance || {});
  const [behavior, setBehavior] = useState(widget.config?.behavior || {});

  const handleUpdate = (updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onUpdate({ config: newConfig });
  };

  const handleAppearanceUpdate = (updates: any) => {
    const newAppearance = { ...appearance, ...updates };
    setAppearance(newAppearance);
    handleUpdate({ appearance: newAppearance });
  };

  const handleBehaviorUpdate = (updates: any) => {
    const newBehavior = { ...behavior, ...updates };
    setBehavior(newBehavior);
    handleUpdate({ behavior: newBehavior });
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      case 'metric': return <TrendingUp className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'iframe': return <Globe className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getWidgetIcon(widget.type)}
          <div>
            <h3 className="font-medium">{widget.title}</h3>
            <p className="text-xs text-muted-foreground">{widget.type}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={widget.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Widget title"
            />
          </div>

          <div>
            <Label htmlFor="dataSource">Data Source</Label>
            <Select
              value={widget.dataSource || ''}
              onValueChange={(value) => onUpdate({ dataSource: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoices">Invoices</SelectItem>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="clients">Clients</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="custom">Custom Query</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {widget.type === 'text' && (
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={config.content || ''}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                placeholder="Enter text content..."
                rows={4}
              />
            </div>
          )}

          {widget.type === 'image' && (
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={config.imageUrl || ''}
                onChange={(e) => handleUpdate({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {widget.type === 'iframe' && (
            <div>
              <Label htmlFor="iframeUrl">Iframe URL</Label>
              <Input
                id="iframeUrl"
                value={config.iframeUrl || ''}
                onChange={(e) => handleUpdate({ iframeUrl: e.target.value })}
                placeholder="https://example.com/embed"
              />
            </div>
          )}

          <div>
            <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
            <Input
              id="refreshInterval"
              type="number"
              value={behavior.refreshInterval || 0}
              onChange={(e) => handleBehaviorUpdate({ refreshInterval: parseInt(e.target.value) || 0 })}
              placeholder="0 for no auto-refresh"
              min="0"
              max="3600"
            />
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <div>
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={appearance.backgroundColor || '#ffffff'}
                onChange={(e) => handleAppearanceUpdate({ backgroundColor: e.target.value })}
                className="w-12 h-8 p-1"
              />
              <Input
                value={appearance.backgroundColor || '#ffffff'}
                onChange={(e) => handleAppearanceUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="borderColor">Border Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="borderColor"
                type="color"
                value={appearance.borderColor || '#e5e7eb'}
                onChange={(e) => handleAppearanceUpdate({ borderColor: e.target.value })}
                className="w-12 h-8 p-1"
              />
              <Input
                value={appearance.borderColor || '#e5e7eb'}
                onChange={(e) => handleAppearanceUpdate({ borderColor: e.target.value })}
                placeholder="#e5e7eb"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="textColor"
                type="color"
                value={appearance.textColor || '#000000'}
                onChange={(e) => handleAppearanceUpdate({ textColor: e.target.value })}
                className="w-12 h-8 p-1"
              />
              <Input
                value={appearance.textColor || '#000000'}
                onChange={(e) => handleAppearanceUpdate({ textColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="isCollapsible">Collapsible</Label>
              <Switch
                id="isCollapsible"
                checked={behavior.isCollapsible !== false}
                onCheckedChange={(checked) => handleBehaviorUpdate({ isCollapsible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isResizable">Resizable</Label>
              <Switch
                id="isResizable"
                checked={behavior.isResizable !== false}
                onCheckedChange={(checked) => handleBehaviorUpdate({ isResizable: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isMovable">Movable</Label>
              <Switch
                id="isMovable"
                checked={behavior.isMovable !== false}
                onCheckedChange={(checked) => handleBehaviorUpdate({ isMovable: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isLocked">Locked</Label>
              <Switch
                id="isLocked"
                checked={widget.isLocked || false}
                onCheckedChange={(checked) => onUpdate({ isLocked: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isVisible">Visible</Label>
              <Switch
                id="isVisible"
                checked={widget.isVisible !== false}
                onCheckedChange={(checked) => onUpdate({ isVisible: checked })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Position and Size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Position & Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x">X Position</Label>
              <Input
                id="x"
                type="number"
                value={widget.position.x}
                onChange={(e) => onUpdate({ 
                  position: { ...widget.position, x: parseInt(e.target.value) || 0 }
                })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="y">Y Position</Label>
              <Input
                id="y"
                type="number"
                value={widget.position.y}
                onChange={(e) => onUpdate({ 
                  position: { ...widget.position, y: parseInt(e.target.value) || 0 }
                })}
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="w">Width</Label>
              <Input
                id="w"
                type="number"
                value={widget.position.w}
                onChange={(e) => onUpdate({ 
                  position: { ...widget.position, w: parseInt(e.target.value) || 1 }
                })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="h">Height</Label>
              <Input
                id="h"
                type="number"
                value={widget.position.h}
                onChange={(e) => onUpdate({ 
                  position: { ...widget.position, h: parseInt(e.target.value) || 1 }
                })}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Close
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => {
            if (confirm('Are you sure you want to remove this widget?')) {
              // This would be handled by the parent component
            }
          }}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
