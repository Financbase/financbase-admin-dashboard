/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
