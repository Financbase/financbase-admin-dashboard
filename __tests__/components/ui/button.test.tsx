/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button, buttonVariants } from '@/components/ui/button'

describe('Button', () => {
  it('should render button with default variant', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
  })

  it('should render button with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render button with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button size="icon">Icon</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })
  })

  it('should be disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(handleClick).not.toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should accept all standard button HTML attributes', () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Submit
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })
})

describe('buttonVariants', () => {
  it('should return correct classes for variants', () => {
    const defaultClasses = buttonVariants()
    expect(defaultClasses).toContain('bg-primary')

    const destructiveClasses = buttonVariants({ variant: 'destructive' })
    expect(destructiveClasses).toContain('bg-destructive')

    const outlineClasses = buttonVariants({ variant: 'outline' })
    expect(outlineClasses).toContain('border')
  })

  it('should return correct classes for sizes', () => {
    const defaultSizeClasses = buttonVariants({ size: 'default' })
    expect(defaultSizeClasses).toContain('h-10')

    const smallClasses = buttonVariants({ size: 'sm' })
    expect(smallClasses).toContain('h-9')

    const largeClasses = buttonVariants({ size: 'lg' })
    expect(largeClasses).toContain('h-11')
  })
})

