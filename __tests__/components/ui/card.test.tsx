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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardToolbar,
} from '@/components/ui/card'

describe('Card', () => {
  it('should render card with default elevation', async () => {
    render(<Card>Card content</Card>)

    await waitFor(() => {
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render card with different elevations', () => {
    const { rerender } = render(<Card elevation="flat">Flat</Card>)
    expect(screen.getByText('Flat')).toBeInTheDocument()

    rerender(<Card elevation="raised">Raised</Card>)
    expect(screen.getByText('Raised')).toBeInTheDocument()

    rerender(<Card elevation="floating">Floating</Card>)
    expect(screen.getByText('Floating')).toBeInTheDocument()
  })

  it('should render card with header, title, and description', async () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
      </Card>
    )

    await waitFor(() => {
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should render card with content', () => {
    render(
      <Card>
        <CardContent>Card content here</CardContent>
      </Card>
    )

    expect(screen.getByText('Card content here')).toBeInTheDocument()
  })

  it('should render card with footer', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )

    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('should render card with toolbar', () => {
    render(
      <Card>
        <CardToolbar>Toolbar content</CardToolbar>
      </Card>
    )

    expect(screen.getByText('Toolbar content')).toBeInTheDocument()
  })

  it('should render complete card structure', async () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should accept custom className', () => {
    render(<Card className="custom-card">Content</Card>)

    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('custom-card')
  })

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Card ref={ref}>Content</Card>)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

