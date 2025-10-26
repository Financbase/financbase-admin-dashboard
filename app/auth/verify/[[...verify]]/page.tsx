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
