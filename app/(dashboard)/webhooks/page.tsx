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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookList } from '@/components/webhooks/webhook-list';
import { WebhookForm } from '@/components/webhooks/webhook-form';
import { DeliveryLogs } from '@/components/webhooks/delivery-logs';
import { 
  Webhook, 
  Activity, 
  Settings, 
  TestTube,
  Eye,
  Plus
} from 'lucide-react';

interface Webhook {
  id: number;
  name: string;
  description: string;
  url: string;
  events: string[];
  isActive: boolean;
  deliveryCount: number;
  successCount: number;
  failureCount: number;
  lastDeliveryAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function WebhooksPage() {
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [activeTab, setActiveTab] = useState('webhooks');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateWebhook = () => {
    setSelectedWebhook(null);
    setShowCreateForm(true);
    setActiveTab('form');
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowCreateForm(true);
    setActiveTab('form');
  };

  const handleViewDeliveries = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setActiveTab('deliveries');
  };

  const handleTestWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setActiveTab('form');
    // In a real implementation, this would trigger the test
    console.log('Test webhook:', webhook);
  };

  const handleWebhookSave = (webhook: any) => {
    console.log('Webhook saved:', webhook);
    setShowCreateForm(false);
    setSelectedWebhook(null);
    setActiveTab('webhooks');
  };

  const handleWebhookCancel = () => {
    setShowCreateForm(false);
    setSelectedWebhook(null);
    setActiveTab('webhooks');
  };

  const handleViewDelivery = (delivery: any) => {
    console.log('View delivery:', delivery);
  };

  const handleRetryDelivery = (deliveryId: string) => {
    console.log('Retry delivery:', deliveryId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Manage webhook endpoints and monitor delivery status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateWebhook}>
            <Plus className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Webhooks List */}
        <TabsContent value="webhooks" className="space-y-4">
          <WebhookList 
            onEditWebhook={handleEditWebhook}
            onViewDeliveries={handleViewDeliveries}
            onTestWebhook={handleTestWebhook}
          />
        </TabsContent>

        {/* Webhook Form */}
        <TabsContent value="form" className="space-y-4">
          {showCreateForm ? (
            <WebhookForm
              webhook={selectedWebhook}
              onSave={handleWebhookSave}
              onCancel={handleWebhookCancel}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Webhook Selected</h4>
                  <p className="text-muted-foreground mb-4">
                    Create a new webhook or select an existing one to edit
                  </p>
                  <Button onClick={handleCreateWebhook}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Delivery Logs */}
        <TabsContent value="deliveries" className="space-y-4">
          {selectedWebhook ? (
            <DeliveryLogs
              webhookId={selectedWebhook.id}
              onViewDelivery={handleViewDelivery}
              onRetryDelivery={handleRetryDelivery}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Select a Webhook</h4>
                  <p className="text-muted-foreground">
                    Choose a webhook to view its delivery logs
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Webhook Settings
              </CardTitle>
              <CardDescription>
                Configure global webhook settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Default Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure default settings for new webhooks
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Retry Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Set default retry behavior for failed deliveries
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure webhook security and signature verification
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up alerts and monitoring for webhook failures
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
