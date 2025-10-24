/**
 * Bill Pay Dashboard Component
 * Main dashboard for bill pay automation with real-time data
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Upload,
  Filter,
  Search
} from 'lucide-react';

interface Bill {
  id: string;
  billNumber: string;
  amount: string;
  currency: string;
  status: string;
  priority: string;
  description: string;
  dueDate: string;
  vendorName?: string;
  createdAt: string;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  status: string;
  category: string;
  totalBills: number;
  totalSpent: string;
}

interface DashboardStats {
  totalBills: number;
  totalAmount: string;
  overdueBills: number;
  pendingApprovals: number;
  scheduledToday: number;
  disputed: number;
}

export default function BillPayDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0,
    totalAmount: '0',
    overdueBills: 0,
    pendingApprovals: 0,
    scheduledToday: 0,
    disputed: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch bills
      const billsResponse = await fetch('/api/bills?limit=10');
      const billsData = await billsResponse.json();
      setBills(billsData.bills || []);

      // Fetch vendors
      const vendorsResponse = await fetch('/api/vendors?limit=10');
      const vendorsData = await vendorsResponse.json();
      setVendors(vendorsData.vendors || []);

      // Fetch bills requiring attention
      const attentionResponse = await fetch('/api/bills/attention');
      const attentionData = await attentionResponse.json();
      
      setStats({
        totalBills: billsData.total || 0,
        totalAmount: billsData.bills?.reduce((sum: number, bill: Bill) => 
          sum + parseFloat(bill.amount), 0).toFixed(2) || '0',
        overdueBills: attentionData.overdue?.length || 0,
        pendingApprovals: attentionData.pendingApproval?.length || 0,
        scheduledToday: attentionData.scheduledToday?.length || 0,
        disputed: attentionData.disputed?.length || 0
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bill Pay Automation</h1>
          <p className="text-gray-600">Manage bills, vendors, and payments efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Bill
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBills}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.totalAmount} total amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueBills}</div>
            <p className="text-xs text-muted-foreground">
              Bills past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.scheduledToday}</div>
            <p className="text-xs text-muted-foreground">
              Payments scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bills */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>Latest bills requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.slice(0, 5).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bill.billNumber}</span>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(bill.priority)}>
                            {bill.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{bill.description}</p>
                        <p className="text-xs text-gray-500">
                          {bill.vendorName} • Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${bill.amount}</div>
                        <div className="text-xs text-gray-500">{bill.currency}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Vendors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
                <CardDescription>Vendors by total spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.slice(0, 5).map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{vendor.name}</div>
                        <p className="text-sm text-gray-600">{vendor.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{vendor.category}</Badge>
                          <Badge className={vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {vendor.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${vendor.totalSpent}</div>
                        <div className="text-xs text-gray-500">{vendor.totalBills} bills</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Bills</CardTitle>
                  <CardDescription>Manage and track all your bills</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{bill.billNumber}</span>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(bill.priority)}>
                          {bill.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{bill.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bill.vendorName} • Created: {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${bill.amount}</div>
                      <div className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Pay</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vendors</CardTitle>
                  <CardDescription>Manage your vendor relationships</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{vendor.name}</div>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{vendor.category}</Badge>
                        <Badge className={vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {vendor.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${vendor.totalSpent}</div>
                      <div className="text-sm text-gray-500">{vendor.totalBills} bills</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm">View Bills</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Bills awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No pending approvals</h3>
                <p className="text-gray-600">All bills are up to date</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}