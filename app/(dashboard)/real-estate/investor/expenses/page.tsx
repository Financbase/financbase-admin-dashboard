"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function InvestorExpensesPage() {
  const router = useRouter();
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Expenses</h1>
          <p className="text-muted-foreground">Review and add property-related expenses.</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/real-estate/investor')}>Back to Investor</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          Expense tracking UI will appear here.
        </CardContent>
      </Card>
    </div>
  );
}


