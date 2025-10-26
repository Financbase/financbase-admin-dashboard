'use client'

import { SignIn } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthErrorBoundary } from '@/components/auth/auth-error-boundary'
import { clerkTheme } from '@/lib/clerk-theme'

export default function ForgotPasswordPage() {
  return (
    <AuthErrorBoundary>
      <AuthLayout
        title="Reset Your Password"
        subtitle="Enter your email address and we'll send you a link to reset your password"
        showTrustIndicators={false}
      >
        <SignIn 
          appearance={clerkTheme}
          routing="path"
          path="/auth/forgot-password"
          signUpUrl="/auth/sign-up"
        />
      </AuthLayout>
    </AuthErrorBoundary>
  )
}
