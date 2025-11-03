'use client';

/**
 * API Error Page
 * 
 * Displays detailed API error information with recovery options.
 * Used for critical API failures that prevent page functionality.
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorDetails {
  code?: string;
  message?: string;
  requestId?: string;
  timestamp?: string;
  details?: any;
}

export default function ApiErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    // Try to get error from URL params or session storage
    const errorParam = searchParams.get('error');
    const errorFromStorage = sessionStorage.getItem('apiError');

    if (errorParam) {
      try {
        setErrorDetails(JSON.parse(decodeURIComponent(errorParam)));
      } catch {
        setErrorDetails({ message: errorParam });
      }
    } else if (errorFromStorage) {
      try {
        setErrorDetails(JSON.parse(errorFromStorage));
        sessionStorage.removeItem('apiError');
      } catch {
        setErrorDetails({ message: errorFromStorage });
      }
    } else {
      setErrorDetails({
        message: 'An API error occurred',
        code: 'UNKNOWN_ERROR',
      });
    }
  }, [searchParams]);

  const handleRetry = () => {
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';
    router.push(returnUrl);
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <CardTitle>API Error</CardTitle>
          </div>
          <CardDescription>
            An error occurred while processing your request
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                {errorDetails?.message && (
                  <p className="font-medium">{errorDetails.message}</p>
                )}
                {errorDetails?.code && (
                  <p className="text-sm opacity-90">
                    Error Code: <code className="bg-black/10 px-1 rounded">{errorDetails.code}</code>
                  </p>
                )}
                {errorDetails?.requestId && (
                  <p className="text-xs opacity-75">
                    Request ID: <code>{errorDetails.requestId}</code>
                  </p>
                )}
                {errorDetails?.timestamp && (
                  <p className="text-xs opacity-75">
                    Time: {new Date(errorDetails.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {errorDetails?.details && (
            <div className="rounded-lg border bg-muted p-4">
              <h4 className="text-sm font-medium mb-2">Additional Details</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(errorDetails.details, null, 2)}
              </pre>
            </div>
          )}

          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
            <h4 className="text-sm font-medium mb-2">What you can do:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Try refreshing the page or retrying the operation</li>
              <li>Check your internet connection</li>
              <li>If the problem persists, contact support with the Request ID above</li>
              <li>Go back and try a different action</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleRetry} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button onClick={handleGoBack} variant="outline" className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
