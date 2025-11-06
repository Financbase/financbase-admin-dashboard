/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
	usePayrollRuns,
	usePayrollEntries,
	useProcessPayroll,
	useUpdatePayrollRunStatus,
	type PayrollRun,
} from "@/hooks/hr/use-payroll";
import { PayrollRunForm } from "@/components/hr/payroll-run-form";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const organizationId = currentUser?.organizationId || undefined;

  // Fetch payroll runs
  const { data: payrollRuns = [], isLoading, error } = usePayrollRuns({
    status: statusFilter || undefined,
    organizationId,
  });

  // Fetch payroll entries for selected run
  const { data: employeePayroll = [] } = usePayrollEntries(selectedRun || undefined);

  // Calculate stats from runs
  const stats: PayrollStats = {
    totalRuns: payrollRuns.length,
    completedRuns: payrollRuns.filter((r) => r.status === "completed").length,
    processingRuns: payrollRuns.filter((r) => r.status === "processing").length,
    draftRuns: payrollRuns.filter((r) => r.status === "draft").length,
    totalEmployees: employeePayroll.length,
    totalGrossPay: payrollRuns.reduce((sum, r) => sum + (parseFloat(r.totalGrossPay || "0")), 0),
    totalNetPay: payrollRuns.reduce((sum, r) => sum + (parseFloat(r.totalNetPay || "0")), 0),
    totalTaxes: payrollRuns.reduce((sum, r) => sum + (parseFloat(r.totalTaxes || "0")), 0),
    totalDeductions: payrollRuns.reduce((sum, r) => sum + (parseFloat(r.totalDeductions || "0")), 0),
    averageGrossPay: payrollRuns.length > 0
      ? payrollRuns.reduce((sum, r) => sum + (parseFloat(r.totalGrossPay || "0")), 0) / payrollRuns.length
      : 0,
    averageNetPay: payrollRuns.length > 0
      ? payrollRuns.reduce((sum, r) => sum + (parseFloat(r.totalNetPay || "0")), 0) / payrollRuns.length
      : 0,
    monthlyTrend: [],
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

  const processMutation = useProcessPayroll();
  const updateStatusMutation = useUpdatePayrollRunStatus();

  const handlePayrollAction = async (action: string, payrollRunId: string) => {
    if (action === "process") {
      await processMutation.mutateAsync({ payrollRunId });
    } else if (action === "approve") {
      await updateStatusMutation.mutateAsync({ id: payrollRunId, status: "completed" });
    } else if (action === "reject") {
      await updateStatusMutation.mutateAsync({ id: payrollRunId, status: "failed" });
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
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
            <Button onClick={() => setIsFormOpen(true)}>
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
                            <h3 className="font-medium text-lg">{run.runNumber || `Payroll Run ${run.id.slice(0, 8)}`}</h3>
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
                            {new Date(run.payPeriodStart).toLocaleDateString()} - {new Date(run.payPeriodEnd).toLocaleDateString()} • Payment Date: {new Date(run.payDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {run.totalEmployees || 0} employees • {run.totalContractors || 0} contractors
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
                            onClick={() => {
                              handlePayrollAction('process', run.id);
                              setSelectedRun(run.id);
                            }}
                            disabled={processMutation.isPending}
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
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePayrollAction('reject', run.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRun(selectedRun === run.id ? null : run.id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Gross Pay</p>
                        <p className="font-medium">${parseFloat(run.totalGrossPay || "0").toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Deductions</p>
                        <p className="font-medium">${parseFloat(run.totalDeductions || "0").toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Net Pay</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          ${parseFloat(run.totalNetPay || "0").toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Taxes</p>
                        <p className="font-medium">${parseFloat(run.totalTaxes || "0").toLocaleString()}</p>
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
              <CardTitle>Payroll Entries</CardTitle>
              <CardDescription>
                Individual employee/contractor payroll breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employeePayroll.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 dark:text-slate-300">No payroll entries found for this run</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Employee/Contractor</th>
                        <th className="text-right p-4 font-medium text-sm">Gross Pay</th>
                        <th className="text-right p-4 font-medium text-sm">Deductions</th>
                        <th className="text-right p-4 font-medium text-sm">Taxes</th>
                        <th className="text-right p-4 font-medium text-sm">Net Pay</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeePayroll.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {entry.employeeId ? "Employee" : "Contractor"} {entry.id.slice(0, 8)}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-right font-medium">
                            ${parseFloat(entry.grossPay || "0").toLocaleString()}
                          </td>
                          <td className="p-4 text-sm text-right">
                            ${parseFloat(entry.totalDeductions || "0").toLocaleString()}
                          </td>
                          <td className="p-4 text-sm text-right">
                            ${parseFloat(entry.totalTaxes || "0").toLocaleString()}
                          </td>
                          <td className="p-4 text-sm text-right font-medium text-green-600">
                            ${parseFloat(entry.netPay || "0").toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={entry.status === 'paid' ? 'default' : entry.status === 'processed' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {entry.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <PayrollRunForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          organizationId={organizationId || "00000000-0000-0000-0000-000000000000"}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
}