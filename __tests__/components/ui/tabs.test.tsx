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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Mock Radix UI Tabs
vi.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, defaultValue, value, onValueChange }: any) => {
    const [currentValue, setCurrentValue] = React.useState(value || defaultValue || '')
    
    React.useEffect(() => {
      if (value !== undefined) {
        setCurrentValue(value)
      }
    }, [value])

    const handleValueChange = (newValue: string) => {
      setCurrentValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <div data-testid="tabs-root" data-value={currentValue}>
        {React.Children.map(children, (child: any) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              currentValue,
              onValueChange: handleValueChange,
            } as any)
          }
          return child
        })}
      </div>
    )
  },
  List: React.forwardRef(({ children, className, currentValue, onValueChange, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="tabs-list" className={className} {...props}>
      {React.Children.map(children, (child: any) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            currentValue,
            onValueChange,
          } as any)
        }
        return child
      })}
    </div>
  )),
  Trigger: React.forwardRef(({ children, value, className, currentValue, onValueChange, ...props }: any, ref: any) => {
    const isActive = currentValue === value
    return (
      <button
        ref={ref}
        data-testid={`tabs-trigger-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        className={className}
        onClick={() => onValueChange?.(value)}
        {...props}
      >
        {children}
      </button>
    )
  }),
  Content: React.forwardRef(({ children, value, className, currentValue, ...props }: any, ref: any) => {
    const isActive = currentValue === value
    if (!isActive) return null
    return (
      <div ref={ref} data-testid={`tabs-content-${value}`} className={className} {...props}>
        {children}
      </div>
    )
  }),
}))

describe('Tabs', () => {
  it('should render tabs with default value', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('should switch tabs when trigger is clicked', async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    await waitFor(() => {
      expect(screen.getByTestId('tabs-trigger-tab2')).toBeInTheDocument()
    }, { timeout: 3000 })

    const tab2Trigger = screen.getByTestId('tabs-trigger-tab2')
    await act(async () => {
      fireEvent.click(tab2Trigger)
    })

    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should call onValueChange when tab changes', async () => {
    const onValueChange = vi.fn()
    render(
      <Tabs defaultValue="tab1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    await waitFor(() => {
      expect(screen.getByTestId('tabs-trigger-tab2')).toBeInTheDocument()
    }, { timeout: 3000 })

    const tab2Trigger = screen.getByTestId('tabs-trigger-tab2')
    await act(async () => {
      fireEvent.click(tab2Trigger)
    })

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith('tab2')
    }, { timeout: 3000 })
  })

  it('should show active tab content only', async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    const tab2Trigger = screen.getByTestId('tabs-trigger-tab2')
    await act(async () => {
      fireEvent.click(tab2Trigger)
    })

    await waitFor(() => {
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should accept custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Content
        </TabsContent>
      </Tabs>
    )

    const list = screen.getByTestId('tabs-list')
    expect(list).toHaveClass('custom-list')

    const content = screen.getByTestId('tabs-content-tab1')
    expect(content).toHaveClass('custom-content')
  })
})

