'use client'

import { SignIn } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthErrorBoundary } from '@/components/auth/auth-error-boundary'
import { clerkTheme } from '@/lib/clerk-theme'

export default function SignInPage() {
  return (
    <AuthErrorBoundary>
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to your Financbase account to continue"
        showTrustIndicators={true}
      >
        <SignIn 
          appearance={clerkTheme}
          routing="path"
          path="/auth/sign-in"
          signUpUrl="/auth/sign-up"
          redirectUrl="/dashboard"
          afterSignInUrl="/dashboard"
        />
      </AuthLayout>
    </AuthErrorBoundary>
  )
}

