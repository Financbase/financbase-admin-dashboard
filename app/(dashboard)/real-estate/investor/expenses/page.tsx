/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils/real-estate-formatting';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { ExpenseTrendChart } from '@/components/financial/intelligence/expense-trend-chart';

export default function InvestorExpensesPage() {
  const router = useRouter();
  const [months, setMonths] = useState('12');

  // Fetch expense analytics
  const { data: expenseData, isLoading: expenseLoading } = useQuery({
    queryKey: ['investor-expenses', months],
    queryFn: async () => {
      const response = await fetch(`/api/real-estate/investor/expenses?months=${months}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      return data;
    },
  });

  const expenseBreakdown = expenseData?.expenseBreakdown || [];
  const monthlyExpenses = expenseData?.monthlyExpenses || [];
  const topVendors = expenseData?.topVendors || [];

  const totalExpenses = expenseBreakdown.reduce((sum: number, item: any) => sum + item.totalAmount, 0);
  const averageMonthly = monthlyExpenses.length > 0
    ? monthlyExpenses.reduce((sum: number, item: any) => sum + item.totalExpenses, 0) / monthlyExpenses.length
    : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Expenses</h1>
          <p className="text-muted-foreground">Review and add property-related expenses.</p>
        </div>
        <div className="flex gap-2">
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
              <SelectItem value="24">Last 24 Months</SelectItem>
              <SelectItem value="36">Last 36 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push('/real-estate/investor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {expenseLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                Over last {months} months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageMonthly)}</div>
              <p className="text-xs text-muted-foreground">
                {expenseBreakdown.length} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Vendors</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topVendors.length}</div>
              <p className="text-xs text-muted-foreground">
                Vendors tracked
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Breakdown by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Category</CardTitle>
          <CardDescription>Total expenses grouped by category</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : expenseBreakdown.length > 0 ? (
            <div className="space-y-4">
              {expenseBreakdown.map((item: any, index: number) => {
                const percentage = totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{item.category}</span>
                        <Badge variant="outline">{item.expenseCount} transactions</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.totalAmount)}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No expense data available for the selected period.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Vendors */}
      {topVendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
            <CardDescription>Vendors with highest total expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topVendors.map((vendor: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{vendor.vendor}</div>
                    <div className="text-sm text-muted-foreground">
                      {vendor.transactionCount} transaction{vendor.transactionCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(vendor.totalAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trend */}
      <ExpenseTrendChart months={months} height={400} />
    </div>
  );
}


