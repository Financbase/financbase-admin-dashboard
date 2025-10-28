"use client";

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface PayrollRun {
  id: string;
  name: string;
  period: string;
  status: 'draft' | 'processing' | 'completed' | 'approved' | 'rejected';
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalTaxes: number;
  totalBenefits: number;
  processedAt: string | null;
  paymentDate: string;
  createdBy: string;
  notes: string;
}

interface EmployeePayroll {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  grossPay: number;
  deductions: {
    federalTax: number;
    stateTax: number;
    socialSecurity: number;
    medicare: number;
    healthInsurance: number;
    retirement401k: number;
    other: number;
  };
  netPay: number;
  hourlyRate: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimePay: number;
  bonus: number;
  status: 'paid' | 'pending' | 'failed';
}

interface PayrollStats {
  totalRuns: number;
  completedRuns: number;
  processingRuns: number;
  draftRuns: number;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalDeductions: number;
  averageGrossPay: number;
  averageNetPay: number;
  monthlyTrend: Array<{
    month: string;
    grossPay: number;
    netPay: number;
  }>;
}

export default function PayrollPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [selectedRun, setSelectedRun] = useState<string | null>(null);

  // Fetch payroll data
  const { data: payrollData, isLoading, error } = useQuery({
    queryKey: ['payroll', searchQuery, statusFilter, periodFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (periodFilter) params.append('period', periodFilter);

      const response = await fetch(`/api/hr/payroll?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch payroll data');
      return response.json();
    },
  });

  const payrollRuns: PayrollRun[] = payrollData?.payrollRuns || [];
  const employeePayroll: EmployeePayroll[] = payrollData?.employeePayroll || [];
  const stats: PayrollStats = payrollData?.stats || {
    totalRuns: 0,
    completedRuns: 0,
    processingRuns: 0,
    draftRuns: 0,
    totalEmployees: 0,
    totalGrossPay: 0,
    totalNetPay: 0,
    totalTaxes: 0,
    totalDeductions: 0,
    averageGrossPay: 0,
    averageNetPay: 0,
    monthlyTrend: []
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handlePayrollAction = async (action: string, payrollRunId: string) => {
    try {
      const response = await fetch('/api/hr/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payrollRunId })
      });
      
      if (response.ok) {
        // Refresh data or show success message
        console.log(`${action} action completed`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading payroll data: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Payroll Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Process and manage employee payroll
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Timesheets
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Payroll Run
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalEmployees}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Active employees
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Gross Pay
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${stats.totalGrossPay.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Net Pay
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${stats.totalNetPay.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    After deductions
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Taxes
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${stats.totalTaxes.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Federal, state, FICA
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payroll runs..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select 
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
              >
                <option value="">All Periods</option>
                <option value="2024-01">January 2024</option>
                <option value="2024-02">February 2024</option>
                <option value="2024-03">March 2024</option>
                <option value="2024-04">April 2024</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Runs */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payroll Runs
                </CardTitle>
                <CardDescription>
                  Manage payroll processing and payments
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payrollRuns.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No payroll runs found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create your first payroll run to get started.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Payroll Run
                  </Button>
                </div>
              ) : (
                payrollRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-6 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-lg">{run.name}</h3>
                            <Badge
                              variant={getStatusBadgeVariant(run.status)}
                              className="text-xs"
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(run.status)}
                                {run.status}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {run.period} • Payment Date: {new Date(run.paymentDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Created by {run.createdBy} • {run.totalEmployees} employees
                          </p>
                          {run.notes && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {run.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {run.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayrollAction('process', run.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                        {run.status === 'completed' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePayrollAction('approve', run.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePayrollAction('reject', run.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Gross Pay</p>
                        <p className="font-medium">${run.totalGrossPay.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Deductions</p>
                        <p className="font-medium">${run.totalDeductions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Net Pay</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          ${run.totalNetPay.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Taxes</p>
                        <p className="font-medium">${run.totalTaxes.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee Payroll Details */}
        {selectedRun && (
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Details</CardTitle>
              <CardDescription>
                Individual employee payroll breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-sm">Employee</th>
                      <th className="text-left p-4 font-medium text-sm">Department</th>
                      <th className="text-right p-4 font-medium text-sm">Gross Pay</th>
                      <th className="text-right p-4 font-medium text-sm">Deductions</th>
                      <th className="text-right p-4 font-medium text-sm">Net Pay</th>
                      <th className="text-left p-4 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeePayroll.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {employee.position}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                          {employee.department}
                        </td>
                        <td className="p-4 text-sm text-right font-medium">
                          ${employee.grossPay.toLocaleString()}
                        </td>
                        <td className="p-4 text-sm text-right">
                          ${Object.values(employee.deductions).reduce((sum, val) => sum + val, 0).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm text-right font-medium text-green-600">
                          ${employee.netPay.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={employee.status === 'paid' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {employee.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}