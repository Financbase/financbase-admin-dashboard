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

export default function VerifyPage() {
  return (
    <AuthErrorBoundary>
      <AuthLayout
        title="Verify Your Account"
        subtitle="We've sent a verification code to your email or phone"
        showTrustIndicators={false}
      >
        <SignIn 
          appearance={clerkTheme}
          routing="path"
          path="/auth/verify"
          signUpUrl="/auth/sign-up"
        />
      </AuthLayout>
    </AuthErrorBoundary>
  )
}
