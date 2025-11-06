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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Save, 
  TestTube, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Settings,
  Webhook,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface WebhookFormProps {
  webhook?: any;
  onSave: (webhook: any) => void;
  onCancel: () => void;
  onTest?: (webhook: any) => void;
}

const AVAILABLE_EVENTS = [
  { category: 'Invoice', events: [
    { value: 'invoice.created', label: 'Invoice Created' },
    { value: 'invoice.updated', label: 'Invoice Updated' },
    { value: 'invoice.paid', label: 'Invoice Paid' },
    { value: 'invoice.overdue', label: 'Invoice Overdue' },
    { value: 'invoice.cancelled', label: 'Invoice Cancelled' },
  ]},
  { category: 'Expense', events: [
    { value: 'expense.created', label: 'Expense Created' },
    { value: 'expense.approved', label: 'Expense Approved' },
    { value: 'expense.rejected', label: 'Expense Rejected' },
    { value: 'expense.updated', label: 'Expense Updated' },
  ]},
  { category: 'Client', events: [
    { value: 'client.created', label: 'Client Created' },
    { value: 'client.updated', label: 'Client Updated' },
    { value: 'client.deleted', label: 'Client Deleted' },
  ]},
  { category: 'Payment', events: [
    { value: 'payment.received', label: 'Payment Received' },
    { value: 'payment.failed', label: 'Payment Failed' },
    { value: 'payment.refunded', label: 'Payment Refunded' },
  ]},
  { category: 'Report', events: [
    { value: 'report.generated', label: 'Report Generated' },
    { value: 'report.scheduled', label: 'Report Scheduled' },
  ]},
  { category: 'System', events: [
    { value: 'user.login', label: 'User Login' },
    { value: 'user.logout', label: 'User Logout' },
    { value: 'system.maintenance', label: 'System Maintenance' },
  ]},
];

export function WebhookForm({ webhook, onSave, onCancel, onTest }: WebhookFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    secret: '',
    events: [] as string[],
    isActive: true,
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    },
    headers: {} as Record<string, string>,
    filters: {} as Record<string, any>,
    timeout: 30000,
  });

  const [showSecret, setShowSecret] = useState(false);
  const [customHeaderKey, setCustomHeaderKey] = useState('');
  const [customHeaderValue, setCustomHeaderValue] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const nameId = useId();
  const descriptionId = useId();
  const urlId = useId();
  const secretId = useId();
  const timeoutId = useId();
  const maxRetriesId = useId();
  const retryDelayId = useId();
  const backoffMultiplierId = useId();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (webhook) {
      setFormData({
        name: webhook.name || '',
        description: webhook.description || '',
        url: webhook.url || '',
        secret: webhook.secret || '',
        events: webhook.events || [],
        isActive: webhook.isActive ?? true,
        retryPolicy: webhook.retryPolicy || {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2
        },
        headers: webhook.headers || {},
        filters: webhook.filters || {},
        timeout: webhook.timeout || 30000,
      });
    }
  }, [webhook]);

  const saveWebhookMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = webhook ? `/api/webhooks/${webhook.id}` : '/api/webhooks';
      const method = webhook ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      onSave(formData);
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/webhooks/${webhook?.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPayload: data }),
      });
      return response.json();
    },
    onSuccess: (result) => {
      setTestResult(result);
      setIsTesting(false);
    },
    onError: () => {
      setIsTesting(false);
    },
  });

  const handleSave = () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      return;
    }

    saveWebhookMutation.mutate(formData);
  };

  const handleTest = () => {
    if (!webhook) return;
    
    setIsTesting(true);
    testWebhookMutation.mutate({
      test: true,
      message: 'This is a test webhook payload',
      timestamp: new Date().toISOString(),
    });
  };

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handleAddHeader = () => {
    if (customHeaderKey && customHeaderValue) {
      setFormData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [customHeaderKey]: customHeaderValue
        }
      }));
      setCustomHeaderKey('');
      setCustomHeaderValue('');
    }
  };

  const handleRemoveHeader = (key: string) => {
    setFormData(prev => ({
      ...prev,
      headers: Object.fromEntries(
        Object.entries(prev.headers).filter(([k]) => k !== key)
      )
    }));
  };

  const generateSecret = () => {
    const secret = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
    setFormData(prev => ({ ...prev, secret }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Webhook className="mr-2 h-5 w-5" />
            {webhook ? 'Edit Webhook' : 'Create Webhook'}
          </CardTitle>
          <CardDescription>
            {webhook ? 'Update your webhook configuration' : 'Set up a new webhook endpoint'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Webhook Name</Label>
                  <Input
                    id={nameId}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={urlId}>Webhook URL</Label>
                  <Input
                    id={urlId}
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/webhook"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={descriptionId}>Description</Label>
                <Textarea
                  id={descriptionId}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this webhook"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={secretId}>Webhook Secret</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id={secretId}
                      type={showSecret ? 'text' : 'password'}
                      value={formData.secret}
                      onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="Enter webhook secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button type="button" variant="outline" onClick={generateSecret}>
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This secret will be used to sign webhook payloads for verification
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Webhook is active</Label>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <div>
                <Label>Select Events to Subscribe To</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose which events should trigger this webhook
                </p>
              </div>

              <div className="space-y-4">
                {AVAILABLE_EVENTS.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-medium text-sm mb-2">{category.category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {category.events.map((event) => (
                        <div
                          key={event.value}
                          className={cn(
                            "flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors",
                            formData.events.includes(event.value)
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted"
                          )}
                          onClick={() => handleEventToggle(event.value)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event.value)}
                            onChange={() => handleEventToggle(event.value)}
                            className="rounded"
                          />
                          <span className="text-sm">{event.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {formData.events.length > 0 && (
                <div className="mt-4">
                  <Label>Selected Events</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                        <button
                          type="button"
                          onClick={() => handleEventToggle(event)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={timeoutId}>Timeout (ms)</Label>
                  <Input
                    id={timeoutId}
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                    min="1000"
                    max="300000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={maxRetriesId}>Max Retries</Label>
                  <Input
                    id={maxRetriesId}
                    type="number"
                    value={formData.retryPolicy.maxRetries}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      retryPolicy: { ...prev.retryPolicy, maxRetries: parseInt(e.target.value) || 3 }
                    }))}
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={retryDelayId}>Retry Delay (ms)</Label>
                  <Input
                    id={retryDelayId}
                    type="number"
                    value={formData.retryPolicy.retryDelay}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      retryPolicy: { ...prev.retryPolicy, retryDelay: parseInt(e.target.value) || 1000 }
                    }))}
                    min="100"
                    max="60000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={backoffMultiplierId}>Backoff Multiplier</Label>
                  <Input
                    id={backoffMultiplierId}
                    type="number"
                    step="0.1"
                    value={formData.retryPolicy.backoffMultiplier}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      retryPolicy: { ...prev.retryPolicy, backoffMultiplier: parseFloat(e.target.value) || 2 }
                    }))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Custom Headers</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add custom headers to include with webhook requests
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Header name"
                      value={customHeaderKey}
                      onChange={(e) => setCustomHeaderKey(e.target.value)}
                    />
                    <Input
                      placeholder="Header value"
                      value={customHeaderValue}
                      onChange={(e) => setCustomHeaderValue(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddHeader}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {Object.keys(formData.headers).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(formData.headers).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2 border rounded">
                          <span className="text-sm font-medium">{key}:</span>
                          <span className="text-sm text-muted-foreground">{value}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveHeader(key)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              {webhook ? (
                <div className="space-y-4">
                  <div>
                    <Label>Test Webhook</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send a test payload to verify your webhook endpoint is working
                    </p>
                  </div>

                  <Button
                    onClick={handleTest}
                    disabled={isTesting}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        Test Webhook
                      </>
                    )}
                  </Button>

                  {testResult && (
                    <div className="space-y-2">
                      <Label>Test Result</Label>
                      <div className={cn(
                        "p-3 border rounded-lg",
                        testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          {testResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={cn(
                            "font-medium",
                            testResult.success ? "text-green-800" : "text-red-800"
                          )}>
                            {testResult.success ? 'Test Successful' : 'Test Failed'}
                          </span>
                        </div>
                        {testResult.httpStatus && (
                          <p className="text-sm text-muted-foreground">
                            HTTP Status: {testResult.httpStatus}
                          </p>
                        )}
                        {testResult.duration && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {testResult.duration}ms
                          </p>
                        )}
                        {testResult.errorMessage && (
                          <p className="text-sm text-red-600">
                            Error: {testResult.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Save the webhook first to test it
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.url || formData.events.length === 0}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {webhook ? 'Update Webhook' : 'Create Webhook'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
