"use client";

import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthErrorBoundaryProps {
  children: ReactNode;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AuthErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 text-center min-h-screen"
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
            We encountered an error while loading the sign-in page. This might be 
            a temporary issue.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mb-6 p-4 bg-gray-100 rounded-md text-left max-w-md">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                {this.state.error.message}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div className="space-y-3">
            <Button
              onClick={this.handleReset}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

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

    return <>{this.props.children}</>;
  }
}
