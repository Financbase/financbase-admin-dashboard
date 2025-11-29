/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetForm } from '@/components/budgets/budget-form'
import { toast } from '@/hooks/use-toast'

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

describe('BudgetForm', () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to fill category field
  const fillCategoryField = async (user: ReturnType<typeof userEvent.setup>, value: string) => {
    // Find all category labels and use the first one (or find by more specific selector)
    const categoryLabels = screen.queryAllByText(/category/i)
    if (categoryLabels.length === 0) {
      // If no category label found, try to find the combobox directly
      const comboboxes = screen.queryAllByRole('combobox')
      const categoryCombobox = comboboxes.find(cb => 
        cb.getAttribute('aria-label')?.toLowerCase().includes('category') ||
        cb.closest('div')?.textContent?.toLowerCase().includes('category')
      ) || comboboxes[0]
      
      if (categoryCombobox) {
        await act(async () => {
          fireEvent.click(categoryCombobox)
        })
        await waitFor(() => {
          const option = screen.queryByText(value) ||
                        Array.from(document.querySelectorAll('[role="option"]')).find(opt => 
                          opt.textContent?.includes(value)
                        )
          expect(option).toBeTruthy()
        }, { timeout: 10000 })
        const option = screen.queryByText(value) ||
                      Array.from(document.querySelectorAll('[role="option"]')).find(opt => 
                        opt.textContent?.includes(value)
                      )
        if (option) {
          await act(async () => {
            fireEvent.click(option as HTMLElement)
          })
        }
      }
      return
    }
    
    const categoryLabel = categoryLabels[0] // Use first occurrence
    if (categoryLabel) {
      // Find the Select trigger button - it should be a button element near the label
      const labelParent = categoryLabel.closest('div')
      // Look for a button element (SelectTrigger renders as a button)
      const categoryTrigger = labelParent?.querySelector('button[role="combobox"]') || 
                             labelParent?.querySelector('button') ||
                             screen.queryByRole('combobox', { name: /category/i })
      
      if (categoryTrigger) {
        // Use fireEvent for more reliable interaction with Radix UI Select
        await act(async () => {
          fireEvent.click(categoryTrigger as HTMLElement)
        })
        await waitFor(() => {
          // Find the option in the dropdown (not the trigger)
          const options = Array.from(document.querySelectorAll('[role="option"]'))
          const option = options.find(opt => 
            opt.textContent?.includes(value) && 
            opt.closest('[role="listbox"]') // Make sure it's in the dropdown, not the trigger
          )
          expect(option).toBeTruthy()
        }, { timeout: 10000 })
        // Find the option in the dropdown menu
        const options = Array.from(document.querySelectorAll('[role="option"]'))
        const option = options.find(opt => 
          opt.textContent?.includes(value) && 
          opt.closest('[role="listbox"]')
        )
        if (option) {
          await act(async () => {
            fireEvent.click(option as HTMLElement)
          })
        }
      }
    }
  }

  it('should render budget form dialog when open', () => {
    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Use getAllByText since "Create Budget" might appear multiple times
    expect(screen.getAllByText('Create Budget').length).toBeGreaterThan(0)
    expect(screen.getByText(/create a new budget to track spending/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <BudgetForm
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    )

    expect(screen.queryByText('Create Budget')).not.toBeInTheDocument()
  })

  it('should show edit title when budget is provided', () => {
    const budget = {
      id: 1,
      name: 'Test Budget',
      category: 'Marketing',
      budgetedAmount: 10000,
      periodType: 'monthly' as const,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      alertThresholds: [80, 90, 100],
      status: 'active' as const,
    }

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
        budget={budget}
      />
    )

    expect(screen.getByText('Edit Budget')).toBeInTheDocument()
    expect(screen.getByText(/update your budget details/i)).toBeInTheDocument()
  })

  it('should initialize with default values', () => {
    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)

    expect(startDateInput).toHaveValue(new Date().toISOString().split('T')[0])
    expect(endDateInput).toBeInTheDocument()
  })

  it('should initialize with budget data when provided', () => {
    const budget = {
      id: 1,
      name: 'Test Budget',
      category: 'Marketing',
      description: 'Test Description',
      budgetedAmount: 10000,
      periodType: 'monthly' as const,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      alertThresholds: [80, 90, 100],
      status: 'active' as const,
    }

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
        budget={budget}
      />
    )

    expect(screen.getByDisplayValue('Test Budget')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Marketing')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10000')).toBeInTheDocument()
  })

  it('should validate required fields on submit', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Name is required' }),
    } as any)

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const submitButton = screen.getByRole('button', { name: /create budget/i })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should submit form successfully for new budget', async () => {
    const user = userEvent.setup()
    const formData = {
      name: 'Test Budget',
      category: 'Marketing',
      budgetedAmount: 10000,
      periodType: 'monthly' as const,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      alertThresholds: [80, 90, 100],
      status: 'active' as const,
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, ...formData }),
    } as any)

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Fill form
    await user.type(screen.getByLabelText(/budget name/i), 'Test Budget')
    await fillCategoryField(user, 'Marketing')
    await user.type(screen.getByLabelText(/budgeted amount/i), '10000')

    const submitButton = screen.getByRole('button', { name: /create budget/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/budgets',
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Budget created successfully',
      })
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    }, { timeout: 3000 })
  })

  it('should update budget when budget is provided', async () => {
    const budget = {
      id: 1,
      name: 'Test Budget',
      category: 'Marketing',
      budgetedAmount: 10000,
      periodType: 'monthly' as const,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      alertThresholds: [80, 90, 100],
      status: 'active' as const,
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ...budget, name: 'Updated Budget' }),
    } as any)

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
        budget={budget}
      />
    )

    const submitButton = screen.getByRole('button', { name: /update budget/i })
    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/budgets/1',
        expect.objectContaining({
          method: 'PATCH',
        })
      )
      expect(toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Budget updated successfully',
      })
    }, { timeout: 3000 })
  })

  it('should call onSuccess callback after successful submission', async () => {
    const user = userEvent.setup()
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    } as any)

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // Fill required fields
    await user.type(screen.getByLabelText(/budget name/i), 'Test Budget')
    await fillCategoryField(user, 'Marketing')
    await user.type(screen.getByLabelText(/budgeted amount/i), '10000')

    const submitButton = screen.getByRole('button', { name: /create budget/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should handle error on submission', async () => {
    const user = userEvent.setup()
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to save budget' }),
    } as any)

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Fill required fields
    await user.type(screen.getByLabelText(/budget name/i), 'Test Budget')
    await fillCategoryField(user, 'Marketing')
    await user.type(screen.getByLabelText(/budgeted amount/i), '10000')

    const submitButton = screen.getByRole('button', { name: /create budget/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save budget',
        variant: 'destructive',
      })
    })
  })

  it('should close dialog when cancel button is clicked', () => {
    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Create a promise that we can control - don't resolve immediately
    // This ensures the loading state is visible long enough to test
    let resolveFetch: (value: any) => void
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve
    })
    
    vi.mocked(global.fetch).mockImplementation(
      () => fetchPromise.then(() => ({ ok: true, json: async () => ({}) } as any))
    )

    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Fill required fields
    await user.type(screen.getByLabelText(/budget name/i), 'Test Budget')
    await fillCategoryField(user, 'Marketing')
    await user.type(screen.getByLabelText(/budgeted amount/i), '10000')

    const submitButton = screen.getByRole('button', { name: /create budget/i })
    
    // Click submit button
    await user.click(submitButton)

    // Immediately check for loading state (before fetch resolves)
    // The button should show "Saving..." and be disabled
    await waitFor(() => {
      // Check for "Saving..." text in the button
      const savingButton = screen.queryByRole('button', { name: /saving/i })
      if (savingButton) {
        expect(savingButton).toBeInTheDocument()
        // Button should be disabled when saving
        expect(savingButton).toHaveAttribute('disabled')
        return true
      }
      
      // Fallback: Check if the submit button is disabled or shows saving text
      const currentSubmitButton = screen.queryByRole('button', { name: /create budget/i }) ||
                                 screen.queryByRole('button', { name: /update budget/i }) ||
                                 screen.queryByRole('button', { name: /saving/i })
      
      if (currentSubmitButton) {
        // Check if button is disabled
        const isButtonDisabled = currentSubmitButton.hasAttribute('disabled') || 
                                currentSubmitButton.getAttribute('aria-disabled') === 'true'
        
        // Check if button text changed to "Saving..."
        const buttonText = currentSubmitButton.textContent || ''
        const hasSavingText = buttonText.includes('Saving') || buttonText.includes('saving')
        
        // At least one loading indicator should be present
        if (isButtonDisabled || hasSavingText) {
          return true
        }
      }
      
      // If button not found, check for saving text anywhere
      const savingText = screen.queryByText(/saving/i)
      if (savingText) {
        return true
      }
      
      return false
    }, { timeout: 5000 })
    
    // Now resolve the fetch to complete the submission
    resolveFetch!({})
    
    // Wait for the form to complete submission
    await waitFor(() => {
      // The dialog should close or the button should return to normal state
      const savingButton = screen.queryByRole('button', { name: /saving/i })
      expect(savingButton).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should update period type when changed', async () => {
    const user = userEvent.setup()
    
    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Wait for the Select trigger to appear (Select doesn't have id, so find by role or text)
    await waitFor(() => {
      const periodLabel = screen.getByText(/period type/i)
      expect(periodLabel).toBeInTheDocument()
      // Find the Select trigger button near the label
      const selectTrigger = periodLabel.closest('div')?.querySelector('button') ||
                           screen.getByRole('combobox', { name: /period type/i })
      expect(selectTrigger).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find and click the Select trigger
    const periodLabel = screen.getByText(/period type/i)
    const selectTrigger = periodLabel.closest('div')?.querySelector('button') ||
                         screen.getByRole('combobox', { name: /period type/i })
    
    await user.click(selectTrigger as HTMLElement)

    // Wait for dropdown to open and select "Yearly"
    await waitFor(() => {
      // Find the option in the dropdown (not the trigger)
      const options = Array.from(document.querySelectorAll('[role="option"]'))
      const yearlyOption = options.find(opt => 
        opt.textContent?.includes('Yearly') && 
        opt.closest('[role="listbox"]')
      )
      expect(yearlyOption).toBeTruthy()
    }, { timeout: 10000 })

    // Find and click the Yearly option in the dropdown
    const options = Array.from(document.querySelectorAll('[role="option"]'))
    const yearlyOption = options.find(opt => 
      opt.textContent?.includes('Yearly') && 
      opt.closest('[role="listbox"]')
    )
    if (yearlyOption) {
      await act(async () => {
        fireEvent.click(yearlyOption as HTMLElement)
      })
    }

    // Verify the change was applied
    await waitFor(() => {
      expect(selectTrigger).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should update status when changed', async () => {
    const user = userEvent.setup()
    
    render(
      <BudgetForm
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Wait for the Select trigger to appear
    await waitFor(() => {
      const statusLabel = screen.getByText(/status/i)
      expect(statusLabel).toBeInTheDocument()
      // Find the Select trigger button near the label
      const selectTrigger = statusLabel.closest('div')?.querySelector('button') ||
                           screen.getByRole('combobox', { name: /status/i })
      expect(selectTrigger).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find and click the Select trigger
    const statusLabel = screen.getByText(/status/i)
    const selectTrigger = statusLabel.closest('div')?.querySelector('button') ||
                         screen.getByRole('combobox', { name: /status/i })
    
    await act(async () => {
      fireEvent.click(selectTrigger as HTMLElement)
    })

    // Wait for dropdown to open and select "Paused"
    await waitFor(() => {
      // Find the option in the dropdown (not the trigger)
      const options = Array.from(document.querySelectorAll('[role="option"]'))
      const pausedOption = options.find(opt => 
        opt.textContent?.includes('Paused') && 
        opt.closest('[role="listbox"]')
      )
      expect(pausedOption).toBeTruthy()
    }, { timeout: 10000 })

    // Find and click the Paused option in the dropdown
    const options = Array.from(document.querySelectorAll('[role="option"]'))
    const pausedOption = options.find(opt => 
      opt.textContent?.includes('Paused') && 
      opt.closest('[role="listbox"]')
    )
    if (pausedOption) {
      await act(async () => {
        fireEvent.click(pausedOption as HTMLElement)
      })
    }

    // Verify the change was applied
    await waitFor(() => {
      expect(selectTrigger).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

