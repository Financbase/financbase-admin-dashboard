"use client";

import type React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthErrorBoundaryProps {
  error?: Error | null;
  reset?: () => void;
  children: React.ReactNode;
}

export function AuthErrorBoundary({
  error,
  reset,
  children,
}: AuthErrorBoundaryProps) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-sm">
          We encountered an error while processing your request. This might be 
          a temporary issue.
        </p>

        <div className="space-y-3">
          {reset && (
            <Button
              onClick={reset}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = "mailto:support@financbase.com";
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Error ID: {Date.now().toString(36)}
        </p>
      </motion.div>
    );
  }

  return <>{children}</>;
}
