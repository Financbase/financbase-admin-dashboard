'use client'

import { SignUp } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthErrorBoundary } from '@/components/auth/auth-error-boundary'
import { clerkTheme } from '@/lib/clerk-theme'

export default function SignUpPage() {
  return (
    <AuthErrorBoundary>
      <AuthLayout
        title="Join Financbase"
        subtitle="Create your account to start managing your finances with AI-powered insights"
        showTrustIndicators={true}
      >
        <SignUp 
          appearance={clerkTheme}
          routing="path"
          path="/auth/sign-up"
          signInUrl="/auth/sign-in"
          redirectUrl="/onboarding"
        />
      </AuthLayout>
    </AuthErrorBoundary>
  )
}

