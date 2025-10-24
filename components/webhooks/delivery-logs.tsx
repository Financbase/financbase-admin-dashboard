"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Search, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Activity,
  Filter,
  Download
} from 'lucide-react';

interface WebhookDelivery {
  id: number;
  webhookId: number;
  deliveryId: string;
  eventType: string;
  eventId: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  httpStatus?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  duration?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryLogsProps {
  webhookId: number;
  onViewDelivery: (delivery: WebhookDelivery) => void;
  onRetryDelivery: (deliveryId: string) => void;
}

export function DeliveryLogs({ webhookId, onViewDelivery, onRetryDelivery }: DeliveryLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<WebflowDelivery | null>(null);

  const { data: deliveries = [], isLoading, refetch } = useQuery({
    queryKey: ['webhookDeliveries', webhookId, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/webhooks/${webhookId}/deliveries?${params}`);
      return response.json();
    },
  });

  const filteredDeliveries = deliveries.filter((delivery: WebhookDelivery) => {
    const matchesSearch = delivery.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'retrying': return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'retrying': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHttpStatusColor = (status?: number) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Delivery Logs</h2>
          <p className="text-muted-foreground">
            Monitor webhook delivery attempts and troubleshoot issues
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deliveries..."
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
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="retrying">Retrying</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Delivery History ({filteredDeliveries.length})
          </CardTitle>
          <CardDescription>
            Recent webhook delivery attempts and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deliveries found</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>HTTP Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery: WebhookDelivery) => (
                    <TableRow
                      key={delivery.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedDelivery?.id === delivery.id && "bg-muted"
                      )}
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <TableCell className="font-medium">
                        <code className="text-sm">{delivery.deliveryId.substring(0, 8)}...</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{delivery.eventType}</p>
                          <p className="text-xs text-muted-foreground">{delivery.eventId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(delivery.status)}
                          <Badge className={cn("text-xs", getStatusColor(delivery.status))}>
                            {delivery.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.httpStatus ? (
                          <span className={cn("font-medium", getHttpStatusColor(delivery.httpStatus))}>
                            {delivery.httpStatus}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{delivery.attemptCount}</span>
                          <span className="text-muted-foreground">/{delivery.maxAttempts}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.duration ? (
                          <span className="text-sm">{delivery.duration}ms</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(delivery.createdAt), 'MMM dd, HH:mm')}</p>
                          <p className="text-muted-foreground">
                            {formatDistanceToNow(new Date(delivery.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDelivery(delivery);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {delivery.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRetryDelivery(delivery.deliveryId);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* Delivery Details */}
      {selectedDelivery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Delivery Details: {selectedDelivery.deliveryId.substring(0, 8)}...
            </CardTitle>
            <CardDescription>Detailed information about this delivery attempt</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="payload">Payload</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedDelivery.status)}
                      <Badge className={cn("text-xs", getStatusColor(selectedDelivery.status))}>
                        {selectedDelivery.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">HTTP Status</Label>
                    <p className="text-sm">
                      {selectedDelivery.httpStatus ? (
                        <span className={cn("font-medium", getHttpStatusColor(selectedDelivery.httpStatus))}>
                          {selectedDelivery.httpStatus}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Attempts</Label>
                    <p className="text-sm">
                      {selectedDelivery.attemptCount} / {selectedDelivery.maxAttempts}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm">
                      {selectedDelivery.duration ? `${selectedDelivery.duration}ms` : 'Not available'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Event Type</Label>
                    <p className="text-sm">{selectedDelivery.eventType}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Event ID</Label>
                    <p className="text-sm font-mono text-xs">{selectedDelivery.eventId}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Created At</Label>
                    <p className="text-sm">{format(new Date(selectedDelivery.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Updated At</Label>
                    <p className="text-sm">{format(new Date(selectedDelivery.updatedAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                  </div>
                </div>

                {selectedDelivery.errorMessage && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-600">Error Message</Label>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-800">{selectedDelivery.errorMessage}</p>
                    </div>
                  </div>
                )}

                {selectedDelivery.nextRetryAt && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Next Retry</Label>
                    <p className="text-sm">
                      {format(new Date(selectedDelivery.nextRetryAt), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payload" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Webhook Payload</Label>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedDelivery.payload, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="response" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Response Body</Label>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                    {selectedDelivery.responseBody || 'No response body'}
                  </pre>
                </div>

                {selectedDelivery.responseHeaders && Object.keys(selectedDelivery.responseHeaders).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Response Headers</Label>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedDelivery.responseHeaders, null, 2)}
                    </pre>
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
