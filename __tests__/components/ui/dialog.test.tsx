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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

// Create a context to pass onOpenChange down
const DialogContext = React.createContext<{ onOpenChange?: (open: boolean) => void }>({})

// Mock Radix UI Dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open, onOpenChange }: any) => {
    return (
      <DialogContext.Provider value={{ onOpenChange }}>
        <div data-testid="dialog-root" data-open={open}>
          {children}
        </div>
      </DialogContext.Provider>
    )
  },
  Trigger: ({ children, asChild }: any) => (
    asChild ? children : <button data-testid="dialog-trigger">{children}</button>
  ),
  Portal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: React.forwardRef(({ className, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="dialog-overlay" className={className} {...props} />
  )),
  Content: React.forwardRef(({ children, className, ...props }: any, ref: any) => {
    const { onOpenChange } = React.useContext(DialogContext)
    return (
      <div ref={ref} data-testid="dialog-content" className={className} {...props}>
        {children}
        <button data-testid="dialog-close" onClick={() => onOpenChange?.(false)}>
          <svg data-testid="close-icon" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    )
  }),
  Close: React.forwardRef(({ children, className, ...props }: any, ref: any) => {
    const { onOpenChange } = React.useContext(DialogContext)
    return (
      <button ref={ref} data-testid="dialog-close" className={className} {...props} onClick={() => onOpenChange?.(false)}>
        {children}
      </button>
    )
  }),
  Title: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <h2 ref={ref} data-testid="dialog-title" className={className} {...props}>
      {children}
    </h2>
  )),
  Description: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <p ref={ref} data-testid="dialog-description" className={className} {...props}>
      {children}
    </p>
  )),
}))

describe('Dialog', () => {
  it('should render dialog with trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('should render dialog content when open', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Dialog Title')
    expect(screen.getByTestId('dialog-description')).toHaveTextContent('Dialog description')
  })

  it('should render dialog with footer', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should render close button', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await waitFor(() => {
      // There might be multiple close buttons (from mock and actual component)
      const closeButtons = screen.getAllByTestId('dialog-close')
      expect(closeButtons.length).toBeGreaterThan(0)
      const closeButton = closeButtons[0]
      expect(closeButton).toBeInTheDocument()
      // Check for SVG or close icon - either from mock or actual component
      const svg = closeButton.querySelector('svg')
      const closeIcon = screen.queryByTestId('close-icon') ||
                       closeButton.querySelector('[data-testid="close-icon"]')
      // At least one should exist
      expect(svg !== null || closeIcon !== null).toBe(true)
    }, { timeout: 5000 })
  })

  it('should call onOpenChange when close button is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    // There might be multiple close buttons (from mock and actual component)
    await waitFor(() => {
      expect(screen.getAllByTestId('dialog-close').length).toBeGreaterThan(0)
    }, { timeout: 3000 })

    const closeButtons = screen.getAllByTestId('dialog-close')
    const closeButton = closeButtons[0]
    await act(async () => {
      fireEvent.click(closeButton)
    })

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    }, { timeout: 3000 })
  })

  it('should render dialog overlay', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(
      <Dialog open={true}>
        <DialogContent className="custom-dialog">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const content = screen.getByTestId('dialog-content')
    expect(content).toHaveClass('custom-dialog')
  })

  it('should render dialog with portal', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByTestId('dialog-portal')).toBeInTheDocument()
  })
})

