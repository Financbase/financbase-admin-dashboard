/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client'

import { SignUp } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthErrorBoundary } from '@/components/auth/auth-error-boundary'
import { clerkTheme } from '@/lib/clerk-theme'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignUpContent() {
  const searchParams = useSearchParams()
  const persona = searchParams.get('persona')
  
  // Build redirect URL with persona parameter if present
  const redirectUrl = persona 
    ? `/onboarding?persona=${encodeURIComponent(persona)}`
    : '/onboarding'

  return (
    <SignUp 
      appearance={clerkTheme}
      routing="path"
      path="/auth/sign-up"
      signInUrl="/auth/sign-in"
      redirectUrl={redirectUrl}
      afterSignUpUrl={redirectUrl}
    />
  )
}

export default function SignUpPage() {
  return (
    <AuthErrorBoundary>
      <AuthLayout
        title="Join Financbase"
        subtitle="Create your account to start managing your finances with AI-powered insights"
        showTrustIndicators={true}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        }>
          <SignUpContent />
        </Suspense>
      </AuthLayout>
    </AuthErrorBoundary>
  )
}

