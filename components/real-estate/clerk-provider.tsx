'use client'

import { ClerkProvider as ClerkProviderBase } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface ClerkProviderProps {
  children: ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <ClerkProviderBase>
      {children}
    </ClerkProviderBase>
  )
}
