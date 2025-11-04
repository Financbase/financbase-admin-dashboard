/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client'

import { SignIn } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthErrorBoundary } from '@/components/auth/auth-error-boundary'
import { clerkTheme } from '@/lib/clerk-theme'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function SSOCallbackPage() {
  return (
    <AuthErrorBoundary>
      <AuthLayout
        title="Completing Sign In"
        subtitle="Please wait while we complete your authentication"
        showTrustIndicators={false}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Almost there...
            </h3>
            
            <p className="text-gray-600 max-w-sm">
              We're setting up your account and will redirect you shortly.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Processing authentication</span>
            </div>
          </motion.div>

          {/* Hidden Clerk component that handles the actual redirect */}
          <div className="hidden">
            <SignIn 
              appearance={clerkTheme}
              routing="path"
              path="/auth/sso-callback"
            />
          </div>
        </div>
      </AuthLayout>
    </AuthErrorBoundary>
  )
}
