/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Pause,
  Play
} from 'lucide-react';

interface SyncStatusProps {
  connectionId: number;
  onStartSync: (connectionId: number) => void;
  onStopSync: (syncId: string) => void;
}

interface SyncStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  type: 'full' | 'incremental' | 'manual';
  direction: 'import' | 'export' | 'bidirectional';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  errors: Array<{
    type: string;
    message: string;
    details?: any;
  }>;
}

export function SyncStatus({ connectionId, onStartSync, onStopSync }: SyncStatusProps) {
  const [isPolling, setIsPolling] = useState(false);

  // Fetch sync status
  const { data: syncStatus, isLoading, refetch } = useQuery({
    queryKey: ['syncStatus', connectionId],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/connections/${connectionId}/sync-status`);
      return response.json();
    },
    refetchInterval: isPolling ? 2000 : false, // Poll every 2 seconds when active
  });

  // Fetch sync history
  const { data: syncHistory = [] } = useQuery({
    queryKey: ['syncHistory', connectionId],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/connections/${connectionId}/sync-history`);
      return response.json();
    },
  });

  // Start polling when sync is running
  useEffect(() => {
    if (syncStatus?.status === 'running') {
      setIsPolling(true);
    } else {
      setIsPolling(false);
    }
  }, [syncStatus?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled': return <Pause className="h-5 w-5 text-gray-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuccessRate = (sync: SyncStatus) => {
    if (sync.processedRecords === 0) return 0;
    return Math.round((sync.successRecords / sync.processedRecords) * 100);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Sync Status */}
      {syncStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Current Sync Status
            </CardTitle>
            <CardDescription>
              Real-time sync progress and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(syncStatus.status)}
                  <div>
                    <p className="font-medium">
                      {syncStatus.type.charAt(0).toUpperCase() + syncStatus.type.slice(1)} Sync
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {syncStatus.direction} • {syncStatus.entityTypes?.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getStatusColor(syncStatus.status))}>
                    {syncStatus.status}
                  </Badge>
                  {syncStatus.status === 'running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStopSync(syncStatus.id)}
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {syncStatus.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{syncStatus.processedRecords} / {syncStatus.totalRecords}</span>
                  </div>
                  <Progress 
                    value={(syncStatus.processedRecords / syncStatus.totalRecords) * 100} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{syncStatus.successRecords}</p>
                  <p className="text-sm text-muted-foreground">Success</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{syncStatus.failedRecords}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {getSuccessRate(syncStatus)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {syncStatus.duration ? formatDuration(syncStatus.duration) : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>

              {/* Errors */}
              {syncStatus.errors && syncStatus.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Errors ({syncStatus.errors.length})</p>
                  <div className="space-y-1">
                    {syncStatus.errors.slice(0, 3).map((error, index) => (
                      <div key={index} className="bg-red-50 p-2 rounded text-sm">
                        <p className="font-medium text-red-800">{error.type}</p>
                        <p className="text-red-600">{error.message}</p>
                      </div>
                    ))}
                    {syncStatus.errors.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{syncStatus.errors.length - 3} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {syncStatus.status !== 'running' && (
                  <Button onClick={() => onStartSync(connectionId)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Sync
                  </Button>
                )}
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Sync History
          </CardTitle>
          <CardDescription>
            Recent sync operations and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncHistory.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sync history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncHistory.map((sync: SyncStatus) => (
                <div key={sync.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sync.status)}
                    <div>
                      <p className="font-medium text-sm">
                        {sync.type.charAt(0).toUpperCase() + sync.type.slice(1)} Sync
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sync.direction} • {sync.processedRecords} records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {sync.successRecords} / {sync.processedRecords}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getSuccessRate(sync)}% success
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {sync.startedAt ? formatDistanceToNow(new Date(sync.startedAt), { addSuffix: true }) : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sync.duration ? formatDuration(sync.duration) : '-'}
                      </p>
                    </div>
                    <Badge className={cn("text-xs", getStatusColor(sync.status))}>
                      {sync.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
