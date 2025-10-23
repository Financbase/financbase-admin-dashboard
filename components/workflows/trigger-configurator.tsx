"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Database, 
  Clock, 
  Webhook, 
  Play, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Zap
} from 'lucide-react';

interface WorkflowTrigger {
  id: string;
  eventType: 'invoice_created' | 'expense_approved' | 'report_generated' | 'webhook' | 'schedule' | 'manual';
  conditions: Record<string, any>;
  filters: Record<string, any>;
  webhookUrl?: string;
  scheduleExpression?: string;
  isActive: boolean;
}

interface TriggerConfiguratorProps {
  triggers: WorkflowTrigger[];
  onTriggersChange: (triggers: WorkflowTrigger[]) => void;
  onAddTrigger: (trigger: WorkflowTrigger) => void;
  onUpdateTrigger: (trigger: WorkflowTrigger) => void;
  onDeleteTrigger: (triggerId: string) => void;
}

const TRIGGER_TYPES = [
  {
    type: 'invoice_created',
    name: 'Invoice Created',
    description: 'When a new invoice is created',
    icon: Database,
    color: 'bg-blue-500',
  },
  {
    type: 'expense_approved',
    name: 'Expense Approved',
    description: 'When an expense is approved',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  {
    type: 'report_generated',
    name: 'Report Generated',
    description: 'When a report is generated',
    icon: AlertTriangle,
    color: 'bg-orange-500',
  },
  {
    type: 'webhook',
    name: 'Webhook Received',
    description: 'When a webhook is received',
    icon: Webhook,
    color: 'bg-purple-500',
  },
  {
    type: 'schedule',
    name: 'Scheduled',
    description: 'On a scheduled basis',
    icon: Calendar,
    color: 'bg-yellow-500',
  },
  {
    type: 'manual',
    name: 'Manual Trigger',
    description: 'Triggered manually',
    icon: Play,
    color: 'bg-gray-500',
  },
];

const SCHEDULE_EXAMPLES = [
  { label: 'Every day at 9 AM', value: '0 9 * * *' },
  { label: 'Every Monday at 10 AM', value: '0 10 * * 1' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
];

export function TriggerConfigurator({
  triggers,
  onTriggersChange,
  onAddTrigger,
  onUpdateTrigger,
  onDeleteTrigger
}: TriggerConfiguratorProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTrigger | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Partial<WorkflowTrigger>>({
    eventType: 'manual',
    conditions: {},
    filters: {},
    isActive: true,
  });

  const handleAddTrigger = () => {
    if (!newTrigger.eventType) return;

    const trigger: WorkflowTrigger = {
      id: `trigger_${Date.now()}`,
      eventType: newTrigger.eventType,
      conditions: newTrigger.conditions || {},
      filters: newTrigger.filters || {},
      webhookUrl: newTrigger.webhookUrl,
      scheduleExpression: newTrigger.scheduleExpression,
      isActive: newTrigger.isActive ?? true,
    };

    onAddTrigger(trigger);
    setNewTrigger({
      eventType: 'manual',
      conditions: {},
      filters: {},
      isActive: true,
    });
    setShowAddForm(false);
  };

  const handleUpdateTrigger = (updatedTrigger: WorkflowTrigger) => {
    onUpdateTrigger(updatedTrigger);
    setSelectedTrigger(updatedTrigger);
  };

  const getTriggerTypeInfo = (eventType: string) => {
    return TRIGGER_TYPES.find(t => t.type === eventType) || TRIGGER_TYPES[0];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Triggers</h3>
          <p className="text-sm text-muted-foreground">
            Configure when your workflow should execute
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Zap className="mr-2 h-4 w-4" />
          Add Trigger
        </Button>
      </div>

      {/* Triggers List */}
      <div className="space-y-2">
        {triggers.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Triggers</h4>
                <p className="text-muted-foreground mb-4">
                  Add triggers to define when your workflow should run
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Zap className="mr-2 h-4 w-4" />
                  Add First Trigger
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          triggers.map((trigger) => {
            const triggerInfo = getTriggerTypeInfo(trigger.eventType);
            const Icon = triggerInfo.icon;
            
            return (
              <Card 
                key={trigger.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedTrigger?.id === trigger.id && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => setSelectedTrigger(trigger)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", triggerInfo.color)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{triggerInfo.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {trigger.eventType}
                        </Badge>
                        <Badge variant={trigger.isActive ? "default" : "secondary"} className="text-xs">
                          {trigger.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {triggerInfo.description}
                      </p>
                      {trigger.scheduleExpression && (
                        <p className="text-xs text-muted-foreground">
                          Schedule: {trigger.scheduleExpression}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrigger(trigger.id);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Trigger Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Trigger</CardTitle>
            <CardDescription>
              Configure when your workflow should execute
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Trigger Type</Label>
              <Select
                value={newTrigger.eventType}
                onValueChange={(value) => setNewTrigger(prev => ({ ...prev, eventType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((trigger) => (
                    <SelectItem key={trigger.type} value={trigger.type}>
                      <div className="flex items-center gap-2">
                        <trigger.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{trigger.name}</div>
                          <div className="text-xs text-muted-foreground">{trigger.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newTrigger.eventType === 'webhook' && (
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={newTrigger.webhookUrl || ''}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
            )}

            {newTrigger.eventType === 'schedule' && (
              <div className="space-y-2">
                <Label htmlFor="scheduleExpression">Schedule Expression (Cron)</Label>
                <Select
                  value={newTrigger.scheduleExpression}
                  onValueChange={(value) => setNewTrigger(prev => ({ ...prev, scheduleExpression: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_EXAMPLES.map((example) => (
                      <SelectItem key={example.value} value={example.value}>
                        {example.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newTrigger.scheduleExpression || ''}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, scheduleExpression: e.target.value }))}
                  placeholder="0 9 * * *"
                />
                <p className="text-xs text-muted-foreground">
                  Use cron format: minute hour day month weekday
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="conditions">Conditions (Optional)</Label>
              <Textarea
                id="conditions"
                value={JSON.stringify(newTrigger.conditions || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const conditions = JSON.parse(e.target.value);
                    setNewTrigger(prev => ({ ...prev, conditions }));
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder='{"amount": {"$gt": 1000}, "status": "pending"}'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                JSON object defining when this trigger should fire
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newTrigger.isActive ?? true}
                onCheckedChange={(checked) => setNewTrigger(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Trigger is active</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTrigger}>
                <Zap className="mr-2 h-4 w-4" />
                Add Trigger
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trigger Configuration */}
      {selectedTrigger && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Trigger</CardTitle>
            <CardDescription>
              Edit trigger settings and conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="conditions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="conditions" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="triggerConditions">Execution Conditions</Label>
                  <Textarea
                    id="triggerConditions"
                    value={JSON.stringify(selectedTrigger.conditions, null, 2)}
                    onChange={(e) => {
                      try {
                        const conditions = JSON.parse(e.target.value);
                        handleUpdateTrigger({ ...selectedTrigger, conditions });
                      } catch {
                        // Invalid JSON, keep as is
                      }
                    }}
                    placeholder='{"amount": {"$gt": 1000}}'
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define conditions that must be met for this trigger to fire
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="triggerFilters">Data Filters</Label>
                  <Textarea
                    id="triggerFilters"
                    value={JSON.stringify(selectedTrigger.filters, null, 2)}
                    onChange={(e) => {
                      try {
                        const filters = JSON.parse(e.target.value);
                        handleUpdateTrigger({ ...selectedTrigger, filters });
                      } catch {
                        // Invalid JSON, keep as is
                      }
                    }}
                    placeholder='{"include": ["id", "amount", "status"]}'
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Filter which data is passed to the workflow
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="triggerActive"
                    checked={selectedTrigger.isActive}
                    onCheckedChange={(checked) => 
                      handleUpdateTrigger({ ...selectedTrigger, isActive: checked })
                    }
                  />
                  <Label htmlFor="triggerActive">Trigger is active</Label>
                </div>

                {selectedTrigger.eventType === 'schedule' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduleExpression">Schedule Expression</Label>
                    <Input
                      id="scheduleExpression"
                      value={selectedTrigger.scheduleExpression || ''}
                      onChange={(e) => 
                        handleUpdateTrigger({ ...selectedTrigger, scheduleExpression: e.target.value })
                      }
                      placeholder="0 9 * * *"
                    />
                  </div>
                )}

                {selectedTrigger.eventType === 'webhook' && (
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={selectedTrigger.webhookUrl || ''}
                      onChange={(e) => 
                        handleUpdateTrigger({ ...selectedTrigger, webhookUrl: e.target.value })
                      }
                      placeholder="https://api.example.com/webhook"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
