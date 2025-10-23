/**
 * Bill Pay Dashboard Component
 * OCR document processing, vendor management, and payment automation UI
 * Uses battle-tested patterns: atomic components, optimistic UI, TypeScript safety
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Receipt,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Zap,
  Target,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import type {
  Bill,
  Vendor,
  Payment,
  DocumentProcessingResult,
  BillApproval
} from '@/lib/services/bill-pay/bill-pay-service';

// Bill upload schema
const billUploadSchema = z.object({
  documentType: z.enum(['invoice', 'receipt', 'bill', 'auto']),
  vendorId: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

type BillUploadFormData = z.infer<typeof billUploadSchema>;

interface BillPayDashboardProps {
  userId: string;
  className?: string;
}

export function BillPayDashboard({ userId, className }: BillPayDashboardProps) {
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState(0);

  const queryClient = useQueryClient();

  // Fetch bills
  const { data: bills, isLoading: billsLoading, refetch: refetchBills } = useQuery({
    queryKey: ['bills', userId],
    queryFn: async () => {
      const response = await fetch(`/api/bills?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      return response.json().then(data => data.bills || []);
    },
    refetchInterval: 30000
  });

  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors', userId],
    queryFn: async () => {
      const response = await fetch(`/api/vendors?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json().then(data => data.vendors || []);
    }
  });

  // Fetch bills requiring attention
  const { data: attentionBills } = useQuery({
    queryKey: ['bills-attention', userId],
    queryFn: async () => {
      return await billPayService.getBillsRequiringAttention(userId);
    }
  });

  // Process document mutation
  const processDocumentMutation = useMutation({
    mutationFn: async ({ file, formData }: { file: File; formData: BillUploadFormData }) => {
      return await billPayService.processDocument(userId, file, formData.documentType);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills-attention'] });
      setShowUploadDialog(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error('Document processing failed:', error);
    }
  });

  // Schedule payment mutation
  const schedulePaymentMutation = useMutation({
    mutationFn: async ({
      billId,
      paymentData
    }: {
      billId: string;
      paymentData: { paymentMethod: string; scheduledDate: Date }
    }) => {
      return await billPayService.schedulePayment(userId, billId, paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills-attention'] });
    }
  });

  const uploadForm = useForm<BillUploadFormData>({
    resolver: zodResolver(billUploadSchema),
    defaultValues: {
      documentType: 'auto',
      priority: 'medium'
    }
  });

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = uploadForm.getValues();
      await processDocumentMutation.mutateAsync({ file, formData });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Filter bills based on current filters
  const filteredBills = React.useMemo(() => {
    if (!bills) return [];

    return bills.filter(bill => {
      const statusMatch = filterStatus === 'all' || bill.status === filterStatus;
      const vendorMatch = filterVendor === 'all' || bill.vendorId === filterVendor;
      return statusMatch && vendorMatch;
    });
  }, [bills, filterStatus, filterVendor]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'disputed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bill Pay Automation</h1>
          <p className="text-muted-foreground">
            OCR document processing and automated payment workflows
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => refetchBills()}
            disabled={billsLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", billsLoading && "animate-spin")} />
            Refresh
          </Button>

          <div className="relative">
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="bill-upload"
            />
            <Button asChild>
              <label htmlFor="bill-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Bill
              </label>
            </Button>
          </div>

          <Button onClick={() => setShowVendorDialog(true)}>
            <User className="h-4 w-4 mr-2" />
            Manage Vendors
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {processDocumentMutation.isPending && uploadProgress < 100 && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            Processing document... {uploadProgress}%
            <Progress value={uploadProgress} className="mt-2" />
          </AlertDescription>
        </Alert>
      )}

      {/* Attention Required */}
      {attentionBills && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {attentionBills.overdue.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {attentionBills.pendingApproval.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {attentionBills.scheduledToday.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Payments due today
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disputed</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {attentionBills.disputed.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require review
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Bills</CardTitle>
              <CardDescription>
                Manage invoices, receipts, and payment schedules
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterVendor} onValueChange={setFilterVendor}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors?.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {billsLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading bills...</span>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Bills Yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first bill to get started with automated processing.
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Bill
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map(bill => (
                      <BillRow
                        key={bill.id}
                        bill={bill}
                        vendor={vendors?.find(v => v.id === bill.vendorId)}
                        onView={() => setSelectedBill(bill.id)}
                        onSchedule={(paymentData) =>
                          schedulePaymentMutation.mutate({
                            billId: bill.id,
                            paymentData
                          })
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Bill</DialogTitle>
            <DialogDescription>
              Upload an invoice, receipt, or bill for AI processing
            </DialogDescription>
          </DialogHeader>

          <BillUploadForm
            vendors={vendors || []}
            form={uploadForm}
            onSubmit={(data) => {
              // Handle form submission
              setShowUploadDialog(false);
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={uploadForm.handleSubmit((data) => {
                // Handle upload
              })}
              disabled={processDocumentMutation.isPending}
            >
              {processDocumentMutation.isPending ? 'Processing...' : 'Upload & Process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Details Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>
              Review and manage bill information and payment schedule
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <BillDetails
              billId={selectedBill}
              onSchedule={(paymentData) => {
                schedulePaymentMutation.mutate({
                  billId: selectedBill,
                  paymentData
                });
                setSelectedBill(null);
              }}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBill(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Management Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vendor Management</DialogTitle>
            <DialogDescription>
              Manage your vendors and payment preferences
            </DialogDescription>
          </DialogHeader>

          <VendorManagement
            userId={userId}
            vendors={vendors || []}
            onClose={() => setShowVendorDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Bill row component
interface BillRowProps {
  bill: Bill;
  vendor?: Vendor;
  onView: () => void;
  onSchedule: (paymentData: { paymentMethod: string; scheduledDate: Date }) => void;
}

function BillRow({ bill, vendor, onView, onSchedule }: BillRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{vendor?.name || 'Unknown Vendor'}</p>
            <p className="text-xs text-muted-foreground">
              {bill.invoiceNumber || 'No invoice #'}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="max-w-xs">
          <p className="font-medium truncate">{bill.description}</p>
          <p className="text-xs text-muted-foreground">{bill.category}</p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">{formatCurrency(bill.amount)}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(bill.dueDate)}</span>
          {bill.dueDate < new Date() && bill.status !== 'paid' && (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge className={getStatusColor(bill.status)}>
          {bill.status.replace('_', ' ')}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge className={getPriorityColor(bill.priority)}>
          {bill.priority}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>

          {bill.status === 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSchedule({
                paymentMethod: 'default',
                scheduledDate: bill.dueDate
              })}
            >
              <Zap className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// Bill upload form component
interface BillUploadFormProps {
  vendors: Vendor[];
  form: any;
  onSubmit: (data: BillUploadFormData) => void;
}

function BillUploadForm({ vendors, form, onSubmit }: BillUploadFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Document Type</label>
        <Select
          value={form.watch('documentType')}
          onValueChange={(value: any) => form.setValue('documentType', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="receipt">Receipt</SelectItem>
            <SelectItem value="bill">Bill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Vendor (Optional)</label>
        <Select
          value={form.watch('vendorId') || ''}
          onValueChange={(value) => form.setValue('vendorId', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select vendor or leave blank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Auto-detect from document</SelectItem>
            {vendors.map(vendor => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Priority</label>
        <Select
          value={form.watch('priority')}
          onValueChange={(value: any) => form.setValue('priority', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          Our AI will extract vendor, amount, due date, and other details automatically.
          You can review and correct the extracted data before processing.
        </AlertDescription>
      </Alert>
    </form>
  );
}

// Bill details component
interface BillDetailsProps {
  billId: string;
  onSchedule: (paymentData: { paymentMethod: string; scheduledDate: Date }) => void;
}

function BillDetails({ billId, onSchedule }: BillDetailsProps) {
  const { data: bill, isLoading } = useQuery({
    queryKey: ['bill', billId],
    queryFn: async () => {
      const response = await fetch(`/api/bills/${billId}`);
      if (!response.ok) throw new Error('Failed to fetch bill');
      return response.json().then(data => data.bill);
    }
  });

  const { data: vendor } = useQuery({
    queryKey: ['vendor', bill?.vendorId],
    queryFn: async () => {
      if (!bill?.vendorId) return null;
      const response = await fetch(`/api/vendors/${bill.vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch vendor');
      return response.json().then(data => data.vendor);
    },
    enabled: !!bill?.vendorId
  });

  const { data: approvals } = useQuery({
    queryKey: ['bill-approvals', billId],
    queryFn: async () => {
      const response = await fetch(`/api/bills/${billId}/approvals`);
      if (!response.ok) throw new Error('Failed to fetch approvals');
      return response.json().then(data => data.approvals || []);
    },
    enabled: !!billId
  });

  if (isLoading || !bill) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading bill details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bill Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bill Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vendor:</span>
              <span className="text-sm font-medium">{vendor?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Invoice #:</span>
              <span className="text-sm font-medium">{bill.invoiceNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Category:</span>
              <span className="text-sm font-medium">{bill.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(bill.status)}>{bill.status.replace('_', ' ')}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="text-sm font-medium font-mono">{formatCurrency(bill.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Due Date:</span>
              <span className="text-sm font-medium">{formatDate(bill.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Days Remaining:</span>
              <span className={cn(
                "text-sm font-medium",
                bill.dueDate < new Date() ? "text-red-600" : "text-green-600"
              )}>
                {Math.ceil((bill.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Workflow */}
      {approvals && approvals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approval Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvals[0].steps.map((step: any, index: number) => (
                <div key={step.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{step.name}</span>
                    <Badge
                      variant={step.status === 'approved' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {step.status}
                    </Badge>
                  </div>
                  {step.approvedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(step.approvedAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        {bill.status === 'approved' && (
          <Button onClick={() => onSchedule({
            paymentMethod: 'default',
            scheduledDate: bill.dueDate
          })}>
            <Zap className="h-4 w-4 mr-2" />
            Schedule Payment
          </Button>
        )}

        {bill.status === 'pending_approval' && (
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Approvals
          </Button>
        )}
      </div>
    </div>
  );
}

// Vendor management component
interface VendorManagementProps {
  userId: string;
  vendors: Vendor[];
  onClose: () => void;
}

function VendorManagement({ userId, vendors, onClose }: VendorManagementProps) {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList>
        <TabsTrigger value="list">All Vendors</TabsTrigger>
        <TabsTrigger value="add">Add Vendor</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Auto Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map(vendor => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{vendor.paymentTerms} days</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={vendor.autoPay ? 'default' : 'secondary'}>
                      {vendor.autoPay ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="add" className="space-y-4">
        <VendorForm
          onSubmit={(vendorData) => {
            // Handle vendor creation
            onClose();
          }}
        />
      </TabsContent>
    </Tabs>
  );
}

// Vendor form component
interface VendorFormProps {
  onSubmit: (data: any) => void;
}

function VendorForm({ onSubmit }: VendorFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      paymentTerms: 30,
      category: 'other',
      autoPay: false,
      approvalRequired: true,
      approvalThreshold: 1000
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Vendor Name</label>
          <input
            {...form.register('name')}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            placeholder="Company Name"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            {...form.register('email')}
            type="email"
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            placeholder="billing@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Payment Terms (Days)</label>
          <input
            {...form.register('paymentTerms')}
            type="number"
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            defaultValue={30}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <Select defaultValue="other">
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="office_supplies">Office Supplies</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="professional_services">Professional Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            {...form.register('autoPay')}
            type="checkbox"
            className="rounded"
          />
          <span className="text-sm">Enable Auto Pay</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            {...form.register('approvalRequired')}
            type="checkbox"
            className="rounded"
          />
          <span className="text-sm">Require Approval</span>
        </label>
      </div>

      <Button type="submit" className="w-full">
        Add Vendor
      </Button>
    </form>
  );
}
