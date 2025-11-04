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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Webhook,
  Activity
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

interface WebhookListProps {
  onEditWebhook: (webhook: Webhook) => void;
  onViewDeliveries: (webhook: Webhook) => void;
  onTestWebhook: (webhook: Webhook) => void;
}

export function WebhookList({
  onEditWebhook,
  onViewDeliveries,
  onTestWebhook
}: WebhookListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const queryClient = useQueryClient();

  // Fetch webhooks
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const response = await fetch('/api/webhooks');
      return response.json();
    },
  });

  // Toggle webhook status mutation
  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ webhookId, isActive }: { webhookId: number; isActive: boolean }) => {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['webhooks']);
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['webhooks']);
    },
  });

  const filteredWebhooks = webhooks.filter((webhook: Webhook) =>
    webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    webhook.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (webhook: Webhook) => {
    if (!webhook.isActive) {
      return <Pause className="h-4 w-4 text-gray-500" />;
    }
    
    if (webhook.failureCount > 0 && webhook.failureCount > webhook.successCount) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (webhook.successCount > 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusColor = (webhook: Webhook) => {
    if (!webhook.isActive) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    if (webhook.failureCount > 0 && webhook.failureCount > webhook.successCount) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    if (webhook.successCount > 0) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getSuccessRate = (webhook: Webhook) => {
    if (webhook.deliveryCount === 0) return 0;
    return Math.round((webhook.successCount / webhook.deliveryCount) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhooks</h2>
          <p className="text-muted-foreground">
            Manage your webhook endpoints and monitor delivery status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search webhooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Webhook className="mr-2 h-5 w-5" />
            Your Webhooks ({filteredWebhooks.length})
          </CardTitle>
          <CardDescription>
            Manage and monitor your webhook endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredWebhooks.length === 0 ? (
            <div className="text-center py-8">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No webhooks created yet</p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Webhook
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Webhook</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebhooks.map((webhook: Webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{webhook.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {webhook.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {webhook.url}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{webhook.events.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(webhook)}
                          <Badge className={cn("text-xs", getStatusColor(webhook))}>
                            {webhook.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{webhook.deliveryCount}</div>
                          <div className="text-muted-foreground">
                            {webhook.successCount} success, {webhook.failureCount} failed
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${getSuccessRate(webhook)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{getSuccessRate(webhook)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.lastDeliveryAt ? (
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(webhook.lastDeliveryAt), { addSuffix: true })}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Never</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditWebhook(webhook)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDeliveries(webhook)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTestWebhook(webhook)}
                          >
                            <TestTube className="h-4 w-4" />
                          </Button>

                          <Switch
                            checked={webhook.isActive}
                            onCheckedChange={(checked) => 
                              toggleWebhookMutation.mutate({
                                webhookId: webhook.id,
                                isActive: checked
                              })
                            }
                            disabled={toggleWebhookMutation.isPending}
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Webhook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Webhook</DialogTitle>
            <DialogDescription>
              Set up a new webhook endpoint to receive events
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8">
            <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Webhook creation form will be implemented here
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
