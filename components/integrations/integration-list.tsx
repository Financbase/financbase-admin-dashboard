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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Activity,
  ExternalLink
} from 'lucide-react';

interface Integration {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  isActive: boolean;
  isOfficial: boolean;
  version: string;
  features: string[];
}

interface Connection {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'expired';
  isActive: boolean;
  externalName: string;
  lastSyncAt: string | null;
  syncCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationListProps {
  onConnectIntegration: (integration: Integration) => void;
  onViewConnection: (connection: Connection) => void;
  onSyncConnection: (connection: Connection) => void;
}

export function IntegrationList({
  onConnectIntegration,
  onViewConnection,
  onSyncConnection
}: IntegrationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const queryClient = useQueryClient();

  // Fetch available integrations
  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await fetch('/api/integrations');
      return response.json();
    },
  });

  // Fetch user connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['integrationConnections'],
    queryFn: async () => {
      const response = await fetch('/api/integrations/connections');
      return response.json();
    },
  });

  // Toggle connection status mutation
  const toggleConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, isActive }: { connectionId: number; isActive: boolean }) => {
      const response = await fetch(`/api/integrations/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrationConnections']);
    },
  });

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await fetch(`/api/integrations/connections/${connectionId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrationConnections']);
    },
  });

  const categories = ['all', 'payment', 'communication', 'accounting', 'productivity'];
  
  const filteredIntegrations = integrations.filter((integration: Integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuccessRate = (connection: Connection) => {
    if (connection.syncCount === 0) return 0;
    return Math.round((connection.successCount / connection.syncCount) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-muted-foreground">
            Connect your favorite tools and automate your workflow
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Available Integrations ({filteredIntegrations.length})
          </CardTitle>
          <CardDescription>
            Connect with popular business tools and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No integrations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration: Integration) => (
                <Card key={integration.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: integration.color }}
                        >
                          <span className="text-lg font-bold">
                            {integration.icon || integration.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.category}</p>
                        </div>
                      </div>
                      {integration.isOfficial && (
                        <Badge variant="secondary" className="text-xs">
                          Official
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {integration.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {integration.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setShowConnectDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Connected Integrations ({connections.length})
          </CardTitle>
          <CardDescription>
            Manage your active integrations and monitor sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No integrations connected yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Connect your first integration to get started
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sync Stats</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection: Connection) => (
                    <TableRow key={connection.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {connection.externalName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(connection.status)}
                          <Badge className={cn("text-xs", getStatusColor(connection.status))}>
                            {connection.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{connection.syncCount}</div>
                          <div className="text-muted-foreground">
                            {connection.successCount} success, {connection.failureCount} failed
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${getSuccessRate(connection)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{getSuccessRate(connection)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {connection.lastSyncAt ? (
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(connection.lastSyncAt), { addSuffix: true })}
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
                            onClick={() => onViewConnection(connection)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSyncConnection(connection)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>

                          <Switch
                            checked={connection.isActive}
                            onCheckedChange={(checked) => 
                              toggleConnectionMutation.mutate({
                                connectionId: connection.id,
                                isActive: checked
                              })
                            }
                            disabled={toggleConnectionMutation.isPending}
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteConnectionMutation.mutate(connection.id)}
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

      {/* Connect Integration Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Set up your {selectedIntegration?.name} integration
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white mx-auto mb-4"
              style={{ backgroundColor: selectedIntegration?.color }}
            >
              <span className="text-2xl font-bold">
                {selectedIntegration?.icon || selectedIntegration?.name?.charAt(0)}
              </span>
            </div>
            <h4 className="text-lg font-medium mb-2">{selectedIntegration?.name}</h4>
            <p className="text-muted-foreground mb-4">
              {selectedIntegration?.description}
            </p>
            <Button 
              onClick={() => {
                if (selectedIntegration) {
                  onConnectIntegration(selectedIntegration);
                  setShowConnectDialog(false);
                }
              }}
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect to {selectedIntegration?.name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
