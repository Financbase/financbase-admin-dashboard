/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useId } from 'react';
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
import { 
  Settings, 
  Mail, 
  Bell, 
  Webhook, 
  Brain, 
  Clock, 
  Target, 
  Play,
  Save,
  TestTube
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'notification' | 'gpt';
  configuration: Record<string, any>;
  parameters: Record<string, any>;
  conditions?: Record<string, any>;
  timeout: number;
  retryCount: number;
  order: number;
  isActive: boolean;
}

interface StepConfiguratorProps {
  step: WorkflowStep | null;
  onStepUpdate: (step: WorkflowStep) => void;
  onTestStep: (step: WorkflowStep) => void;
  isTesting?: boolean;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

const STEP_CONFIGURATIONS: Record<string, {
  icon: any;
  title: string;
  description: string;
  fields: FieldConfig[];
}> = {
  email: {
    icon: Mail,
    title: 'Email Configuration',
    description: 'Configure email sending parameters',
    fields: [
      { key: 'to', label: 'Recipient', type: 'text', required: true, placeholder: 'user@example.com' },
      { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Email subject' },
      { key: 'template', label: 'Template', type: 'select', options: ['default', 'invoice', 'reminder', 'welcome'] },
      { key: 'body', label: 'Message Body', type: 'textarea', placeholder: 'Email content...' },
    ]
  },
  notification: {
    icon: Bell,
    title: 'Notification Configuration',
    description: 'Configure in-app notification settings',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Notification title' },
      { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Notification message' },
      { key: 'type', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'error'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'] },
    ]
  },
  webhook: {
    icon: Webhook,
    title: 'Webhook Configuration',
    description: 'Configure webhook endpoint and payload',
    fields: [
      { key: 'url', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://api.example.com/webhook' },
      { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'PATCH', 'GET'] },
      { key: 'headers', label: 'Headers', type: 'textarea', placeholder: '{"Authorization": "Bearer token"}' },
      { key: 'payload', label: 'Payload Template', type: 'textarea', placeholder: '{"event": "{{event_type}}", "data": "{{trigger_data}}"}' },
    ]
  },
  gpt: {
    icon: Brain,
    title: 'AI Analysis Configuration',
    description: 'Configure AI analysis parameters',
    fields: [
      { key: 'query', label: 'Analysis Query', type: 'textarea', required: true, placeholder: 'Analyze the financial data and provide insights...' },
      { key: 'analysisType', label: 'Analysis Type', type: 'select', options: ['financial', 'trend', 'prediction', 'recommendation'] },
      { key: 'context', label: 'Context Data', type: 'textarea', placeholder: 'Additional context for the analysis...' },
      { key: 'confidence', label: 'Confidence Threshold', type: 'number', placeholder: '0.8' },
    ]
  },
  delay: {
    icon: Clock,
    title: 'Delay Configuration',
    description: 'Configure wait time and conditions',
    fields: [
      { key: 'duration', label: 'Duration', type: 'text', required: true, placeholder: '5 minutes, 1 hour, 30 seconds' },
      { key: 'condition', label: 'Conditional Delay', type: 'textarea', placeholder: 'Wait only if condition is met...' },
    ]
  },
  condition: {
    icon: Target,
    title: 'Condition Configuration',
    description: 'Configure conditional logic',
    fields: [
      { key: 'expression', label: 'Condition Expression', type: 'textarea', required: true, placeholder: 'amount > 1000 AND status = "pending"' },
      { key: 'trueAction', label: 'If True', type: 'text', placeholder: 'Next step ID' },
      { key: 'falseAction', label: 'If False', type: 'text', placeholder: 'Alternative step ID' },
    ]
  },
  action: {
    icon: Play,
    title: 'Action Configuration',
    description: 'Configure custom business logic',
    fields: [
      { key: 'actionType', label: 'Action Type', type: 'select', options: ['create_invoice', 'update_status', 'send_reminder', 'calculate_total'] },
      { key: 'parameters', label: 'Parameters', type: 'textarea', placeholder: '{"field": "value"}' },
      { key: 'output', label: 'Output Variable', type: 'text', placeholder: 'result' },
    ]
  },
};

export function StepConfigurator({
  step,
  onStepUpdate,
  onTestStep,
  isTesting = false
}: StepConfiguratorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('configuration');
  const nameId = useId();
  const timeoutId = useId();
  const retryCountId = useId();
  const isActiveId = useId();
  const conditionsId = useId();

  useEffect(() => {
    if (step) {
      setFormData({
        ...step.configuration,
        ...step.parameters,
        name: step.name,
        timeout: step.timeout,
        retryCount: step.retryCount,
        isActive: step.isActive,
      });
    }
  }, [step]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    if (!step) return;

    const updatedStep: WorkflowStep = {
      ...step,
      name: formData.name || step.name,
      configuration: {
        ...step.configuration,
        ...Object.fromEntries(
          Object.entries(formData).filter(([key]) => 
            !['name', 'timeout', 'retryCount', 'isActive'].includes(key)
          )
        )
      },
      timeout: formData.timeout || step.timeout,
      retryCount: formData.retryCount || step.retryCount,
      isActive: formData.isActive !== undefined ? formData.isActive : step.isActive,
    };

    onStepUpdate(updatedStep);
  };

  const handleTest = () => {
    if (!step) return;
    onTestStep(step);
  };

  if (!step) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Step Selected</h3>
            <p className="text-muted-foreground">
              Select a step from the canvas to configure it
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = STEP_CONFIGURATIONS[step.type];
  const Icon = config.icon;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{step.type}</Badge>
          <Badge variant={step.isActive ? "default" : "secondary"}>
            {step.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-4">
            <div className="space-y-4">
              {config.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'text' && (
                    <Input
                      id={field.key}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <Textarea
                      id={field.key}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select
                      value={formData[field.key] || ''}
                      onValueChange={(value) => handleFieldChange(field.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {field.type === 'number' && (
                    <Input
                      id={field.key}
                      type="number"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={nameId}>Step Name</Label>
                <Input
                  id={nameId}
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter step name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={timeoutId}>Timeout (seconds)</Label>
                  <Input
                    id={timeoutId}
                    type="number"
                    value={formData.timeout || 300}
                    onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value) || 300)}
                    min="1"
                    max="3600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={retryCountId}>Retry Count</Label>
                  <Input
                    id={retryCountId}
                    type="number"
                    value={formData.retryCount || 0}
                    onChange={(e) => handleFieldChange('retryCount', parseInt(e.target.value) || 0)}
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={isActiveId}
                  checked={formData.isActive !== undefined ? formData.isActive : true}
                  onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                />
                <Label htmlFor={isActiveId}>Step is active</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={conditionsId}>Execution Conditions</Label>
                <Textarea
                  id={conditionsId}
                  value={formData.conditions || ''}
                  onChange={(e) => handleFieldChange('conditions', e.target.value)}
                  placeholder="Enter conditions for step execution (e.g., amount > 1000)"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like {"{trigger_data.field}"} or {"{step_results.previous_step}"}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Available Variables</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div><code>trigger_data.*</code> - Data from workflow trigger</div>
                  <div><code>step_results.*</code> - Results from previous steps</div>
                  <div><code>variables.*</code> - Workflow variables</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting}
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTesting ? 'Testing...' : 'Test Step'}
            </Button>
          </div>

          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
