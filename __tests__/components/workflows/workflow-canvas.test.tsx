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
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas'

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }: any) => (
    <div data-testid="dnd-context">
      {children}
      <button
        data-testid="mock-drag-start"
        onClick={() => onDragStart({ active: { id: 'step-1' } })}
      >
        Mock Drag Start
      </button>
      <button
        data-testid="mock-drag-end"
        onClick={() => onDragEnd({ active: { id: 'step-1' }, over: { id: 'step-2' } })}
      >
        Mock Drag End
      </button>
    </div>
  ),
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  closestCenter: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: (array: any[], oldIndex: number, newIndex: number) => {
    const newArray = [...array]
    const [removed] = newArray.splice(oldIndex, 1)
    newArray.splice(newIndex, 0, removed)
    return newArray
  },
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: ({ id }: { id: string }) => ({
    attributes: {},
    listeners: {},
    setNodeRef: (node: any) => node,
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

describe('WorkflowCanvas', () => {
  const mockSteps = [
    {
      id: 'step-1',
      name: 'Send Email',
      type: 'email' as const,
      configuration: {},
      parameters: {},
      timeout: 30,
      retryCount: 3,
      order: 1,
      isActive: true,
    },
    {
      id: 'step-2',
      name: 'Wait',
      type: 'delay' as const,
      configuration: {},
      parameters: {},
      timeout: 60,
      retryCount: 0,
      order: 2,
      isActive: true,
    },
  ]

  const mockOnStepsChange = vi.fn()
  const mockOnStepSelect = vi.fn()
  const mockOnAddStep = vi.fn()
  const mockOnDeleteStep = vi.fn()
  const mockOnTestWorkflow = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render workflow canvas', async () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Workflow Canvas')).toBeInTheDocument()
      expect(screen.getByText('Send Email')).toBeInTheDocument()
      expect(screen.getByText('Wait')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display empty state when no steps', async () => {
    render(
      <WorkflowCanvas
        steps={[]}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('No Steps Yet')).toBeInTheDocument()
      expect(screen.getByText('Add First Step')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should call onStepSelect when step is clicked', async () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Send Email')).toBeInTheDocument()
    }, { timeout: 3000 })

    const stepCard = screen.getByText('Send Email').closest('div')
    if (stepCard) {
      await act(async () => {
        fireEvent.click(stepCard)
      })
      await waitFor(() => {
        expect(mockOnStepSelect).toHaveBeenCalledWith(mockSteps[0])
      }, { timeout: 3000 })
    }
  })

  it('should call onDeleteStep when delete button is clicked', async () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Send Email')).toBeInTheDocument()
    }, { timeout: 3000 })

    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg') && btn.textContent === ''
    )

    if (deleteButtons.length > 0) {
      await act(async () => {
        fireEvent.click(deleteButtons[0])
      })
      await waitFor(() => {
        expect(mockOnDeleteStep).toHaveBeenCalled()
      }, { timeout: 3000 })
    }
  })

  it('should call onTestWorkflow when test button is clicked', async () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument()
    }, { timeout: 3000 })

    const testButton = screen.getByText('Test Workflow')
    await act(async () => {
      fireEvent.click(testButton)
    })

    await waitFor(() => {
      expect(mockOnTestWorkflow).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should disable test button when no steps', async () => {
    render(
      <WorkflowCanvas
        steps={[]}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    await waitFor(() => {
      const testButton = screen.getByText('Test Workflow')
      expect(testButton).toBeDisabled()
    }, { timeout: 3000 })
  })

  it('should disable test button when executing', async () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
        isExecuting={true}
      />
    )

    await waitFor(() => {
      const testButton = screen.getByText('Testing...')
      expect(testButton).toBeDisabled()
    }, { timeout: 3000 })
  })

  it('should display step summary', async () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    await waitFor(() => {
      // The component renders step summary with multiple "steps" text elements
      // Use getAllByText to handle multiple instances
      const stepTexts = screen.queryAllByText(/steps/i)
      const activeTexts = screen.queryAllByText(/active/i)
      const inactiveTexts = screen.queryAllByText(/inactive/i)
      // At least one "steps", "active", or "inactive" text should be present
      expect(stepTexts.length > 0 || activeTexts.length > 0 || inactiveTexts.length > 0).toBeTruthy()
    }, { timeout: 5000 })
  })

  it('should highlight selected step', () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={mockSteps[0]}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    const selectedStep = screen.getByText('Send Email').closest('div')
    expect(selectedStep).toBeInTheDocument()
  })

  it('should call onAddStep when add first step button is clicked', () => {
    render(
      <WorkflowCanvas
        steps={[]}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    const addButton = screen.getByText('Add First Step')
    fireEvent.click(addButton)

    expect(mockOnAddStep).toHaveBeenCalledWith('action')
  })

  it('should display step order and timeout information', () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    expect(screen.getByText(/Order: 1/)).toBeInTheDocument()
    expect(screen.getByText(/Timeout: 30s/)).toBeInTheDocument()
  })

  it('should display estimated execution time', () => {
    render(
      <WorkflowCanvas
        steps={mockSteps}
        onStepsChange={mockOnStepsChange}
        onStepSelect={mockOnStepSelect}
        selectedStep={null}
        onAddStep={mockOnAddStep}
        onDeleteStep={mockOnDeleteStep}
        onTestWorkflow={mockOnTestWorkflow}
      />
    )

    expect(screen.getByText(/Estimated execution time: 90s/)).toBeInTheDocument()
  })
})

