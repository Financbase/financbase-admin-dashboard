/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import DashboardContent from '@/components/core/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function UnauthorizedError() {
  const router = useRouter();

  const handleGoHome = () => {
    // Remove error parameter and navigate to clean dashboard
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="mt-2">
            You don't have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              The page or resource you're trying to access requires additional permissions that your account doesn't currently have.
            </p>
          </div>

          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
            <h4 className="text-sm font-medium mb-2">What you can do:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Contact your administrator to request access</li>
              <li>Check if you're signed in with the correct account</li>
              <li>Verify your subscription or plan includes this feature</li>
              <li>Return to the dashboard and try a different action</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/help-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Show unauthorized error if error parameter is present
  if (error === 'unauthorized') {
    return <UnauthorizedError />;
  }

  // Otherwise show normal dashboard content
  return <DashboardContent />;
}