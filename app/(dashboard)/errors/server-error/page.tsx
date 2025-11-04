/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, MessageSquare, Copy } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ServerErrorPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const errorCode = searchParams.get('code') || 'INTERNAL_SERVER_ERROR';
  const [copied, setCopied] = useState(false);

  const copyRequestId = () => {
    if (requestId) {
      navigator.clipboard.writeText(requestId);
      setCopied(true);
      toast.success('Request ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getErrorTitle = () => {
    const titles: Record<string, string> = {
      INTERNAL_SERVER_ERROR: 'Server Error',
      DATABASE_ERROR: 'Database Error',
      NETWORK_ERROR: 'Network Error',
    };
    return titles[errorCode] || 'Server Error';
  };

  const getErrorDescription = () => {
    const descriptions: Record<string, string> = {
      INTERNAL_SERVER_ERROR: 'We encountered an error while processing your request. Our team has been notified.',
      DATABASE_ERROR: 'Unable to connect to the database. Please try again in a few moments.',
      NETWORK_ERROR: 'Network connection issue detected. Please check your internet connection.',
    };
    return descriptions[errorCode] || 'Something went wrong on our end. Please try again later.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{getErrorTitle()}</CardTitle>
          <CardDescription className="mt-2">
            {getErrorDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestId && (
            <div className="rounded-md bg-muted p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Request ID
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRequestId}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs font-mono text-foreground break-all">
                {requestId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please include this ID when contacting support for faster resolution.
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/help-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-3 mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Development Info
              </p>
              <p className="text-xs text-muted-foreground">
                Error Code: <code className="font-mono">{errorCode}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

