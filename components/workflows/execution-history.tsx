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
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  RefreshCw,
  Play,
  Eye
} from 'lucide-react';

interface WorkflowExecution {
  id: number;
  workflowId: number;
  userId: string;
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggerData: Record<string, any>;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  errorData?: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

interface ExecutionLog {
  id: number;
  workflowId: number;
  executionId: string;
  userId: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details: Record<string, any>;
  stepId?: string;
  createdAt: string;
}

interface ExecutionHistoryProps {
  workflowId: number;
  onViewExecution: (execution: WorkflowExecution) => void;
  onRerunExecution: (execution: WorkflowExecution) => void;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  running: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_ICONS = {
  pending: Clock,
  running: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: AlertTriangle,
};

export function ExecutionHistory({
  workflowId,
  onViewExecution,
  onRerunExecution
}: ExecutionHistoryProps) {
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('executions');

  // Fetch executions
  const { data: executions = [], isLoading: executionsLoading, refetch: refetchExecutions } = useQuery({
    queryKey: ['workflow-executions', workflowId, statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        workflowId: workflowId.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      
      const response = await fetch(`/api/workflows/${workflowId}/executions?${params}`);
      return response.json();
    },
  });

  // Fetch execution logs
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['workflow-logs', selectedExecution?.executionId],
    queryFn: async () => {
      if (!selectedExecution) return [];
      
      const response = await fetch(`/api/workflows/${workflowId}/logs?executionId=${selectedExecution.executionId}`);
      return response.json();
    },
    enabled: !!selectedExecution,
  });

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1) return `${Math.round(duration * 1000)}ms`;
    if (duration < 60) return `${Math.round(duration)}s`;
    return `${Math.round(duration / 60)}m ${Math.round(duration % 60)}s`;
  };

  const filteredExecutions = executions.filter((execution: WorkflowExecution) => {
    if (statusFilter !== 'all' && execution.status !== statusFilter) return false;
    if (searchTerm && !execution.executionId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Execution History</h3>
          <p className="text-sm text-muted-foreground">
            View and monitor workflow executions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchExecutions()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search executions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="executions">Executions ({filteredExecutions.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="executions" className="space-y-4">
          {executionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredExecutions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Executions</h4>
                  <p className="text-muted-foreground">
                    This workflow hasn't been executed yet
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Execution ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExecutions.map((execution: WorkflowExecution) => (
                      <TableRow 
                        key={execution.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedExecution(execution)}
                      >
                        <TableCell>
                          <div className="font-mono text-sm">
                            {execution.executionId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <Badge className={cn("text-xs", getStatusColor(execution.status))}>
                              {execution.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(execution.startedAt), 'MMM d, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(execution.startedAt), 'h:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDuration(execution.duration)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewExecution(execution);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {execution.status === 'failed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRerunExecution(execution);
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {!selectedExecution ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Execution Selected</h4>
                  <p className="text-muted-foreground">
                    Select an execution to view its logs
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Logs</h4>
                  <p className="text-muted-foreground">
                    No logs found for this execution
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {logs.map((log: ExecutionLog) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-1 rounded",
                        log.level === 'error' && "bg-red-100 text-red-600",
                        log.level === 'warning' && "bg-yellow-100 text-yellow-600",
                        log.level === 'info' && "bg-blue-100 text-blue-600",
                        log.level === 'debug' && "bg-gray-100 text-gray-600",
                        log.level === 'critical' && "bg-red-100 text-red-600"
                      )}>
                        {log.level === 'error' && <XCircle className="h-3 w-3" />}
                        {log.level === 'warning' && <AlertTriangle className="h-3 w-3" />}
                        {log.level === 'info' && <CheckCircle className="h-3 w-3" />}
                        {log.level === 'debug' && <Activity className="h-3 w-3" />}
                        {log.level === 'critical' && <XCircle className="h-3 w-3" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                          {log.stepId && (
                            <Badge variant="secondary" className="text-xs">
                              {log.stepId}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{log.message}</p>
                        {Object.keys(log.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">
                              View details
                            </summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Execution Details */}
      {selectedExecution && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Details</CardTitle>
            <CardDescription>
              Execution ID: {selectedExecution.executionId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedExecution.status)}
                  <Badge className={cn("text-xs", getStatusColor(selectedExecution.status))}>
                    {selectedExecution.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Duration</Label>
                <p className="text-sm mt-1">{formatDuration(selectedExecution.duration)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Started</Label>
                <p className="text-sm mt-1">
                  {format(new Date(selectedExecution.startedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Completed</Label>
                <p className="text-sm mt-1">
                  {selectedExecution.completedAt 
                    ? format(new Date(selectedExecution.completedAt), 'MMM d, yyyy h:mm a')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {selectedExecution.errorData && (
              <div>
                <Label className="text-sm font-medium text-red-600">Error Details</Label>
                <pre className="text-xs bg-red-50 p-3 rounded mt-1 overflow-auto">
                  {JSON.stringify(selectedExecution.errorData, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewExecution(selectedExecution)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              {selectedExecution.status === 'failed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRerunExecution(selectedExecution)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Rerun
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
