/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge, badgeVariants } from '@/components/ui/badge'

describe('Badge', () => {
  it('should render badge with default variant', async () => {
    render(<Badge>Badge</Badge>)

    await waitFor(() => {
      const badge = screen.getByText('Badge')
      expect(badge).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render badge with different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toBeInTheDocument()

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should accept custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)

    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })

  it('should accept all standard span HTML attributes', () => {
    render(
      <Badge data-testid="badge" aria-label="Status badge">
        Status
      </Badge>
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('aria-label', 'Status badge')
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })
})

describe('badgeVariants', () => {
  it('should return correct classes for variants', () => {
    const defaultClasses = badgeVariants()
    expect(defaultClasses).toContain('bg-primary')

    const secondaryClasses = badgeVariants({ variant: 'secondary' })
    expect(secondaryClasses).toContain('bg-secondary')

    const destructiveClasses = badgeVariants({ variant: 'destructive' })
    expect(destructiveClasses).toContain('bg-destructive')
  })
})

