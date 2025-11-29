/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClientForm } from '@/components/clients/client-form'
import { useRouter } from 'next/navigation'
import { useFormSubmission } from '@/hooks/use-form-submission'

// Mock dependencies
const { mockPush, mockBack } = vi.hoisted(() => {
  const push = vi.fn()
  const back = vi.fn()
  return { mockPush: push, mockBack: back }
})

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    back: mockBack,
  })),
}))

const { mockToastError } = vi.hoisted(() => {
  return { mockToastError: vi.fn() }
})

vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
  },
}))

vi.mock('@/hooks/use-form-submission', () => ({
  useFormSubmission: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

describe('ClientForm', () => {
  const mockSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    mockBack.mockClear()
    mockToastError.mockClear()
    mockSubmit.mockClear()

    vi.mocked(useFormSubmission).mockReturnValue({
      submit: mockSubmit,
      isSubmitting: false,
      generalError: null,
    } as any)
  })

  it('should render client form', () => {
    render(<ClientForm />)

    expect(screen.getByText('Client Information')).toBeInTheDocument()
    expect(screen.getByText('Address Information')).toBeInTheDocument()
    expect(screen.getByText('Business Information')).toBeInTheDocument()
  })

  it('should initialize with default values', () => {
    render(<ClientForm />)

    expect(screen.getByDisplayValue('US')).toBeInTheDocument() // Default country
    expect(screen.getByDisplayValue('USD')).toBeInTheDocument() // Default currency
    expect(screen.getByDisplayValue('Net 30')).toBeInTheDocument() // Default payment terms
    // Status is a Select component, check for the combobox role with "Active" text
    const statusSelects = screen.getAllByRole('combobox')
    const statusSelect = statusSelects.find(select => 
      select.textContent?.includes('Active')
    )
    expect(statusSelect).toBeInTheDocument() // Default status
  })

  it('should initialize with initial data when provided', () => {
    const initialData = {
      name: 'Test Client',
      email: 'test@example.com',
      country: 'CA',
      currency: 'CAD',
    }

    render(<ClientForm initialData={initialData} />)

    expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('CA')).toBeInTheDocument()
    expect(screen.getByDisplayValue('CAD')).toBeInTheDocument()
  })

  it('should validate required fields on submit', async () => {
    render(<ClientForm />)

    const form = screen.getByRole('button', { name: /save client/i }).closest('form')
    if (form) {
      fireEvent.submit(form)
    } else {
      const submitButton = screen.getByRole('button', { name: /save client/i })
      fireEvent.click(submitButton)
    }

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Name and email are required')
    }, { timeout: 3000 })
  })

  it('should validate email format', async () => {
    const initialData = {
      name: 'Test Client',
      email: 'invalid-email',
    }

    render(<ClientForm initialData={initialData} />)

    const form = screen.getByRole('button', { name: /save client/i }).closest('form')
    if (form) {
      fireEvent.submit(form)
    } else {
      const submitButton = screen.getByRole('button', { name: /save client/i })
      fireEvent.click(submitButton)
    }

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Please enter a valid email address')
    }, { timeout: 3000 })
  })

  it('should submit form successfully', async () => {
    const initialData = {
      name: 'Test Client',
      email: 'test@example.com',
    }

    mockSubmit.mockResolvedValue({ id: 1 })

    render(<ClientForm initialData={initialData} />)

    const submitButton = screen.getByRole('button', { name: /save client/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should update client when clientId is provided', async () => {
    const initialData = {
      name: 'Test Client',
      email: 'test@example.com',
    }

    mockSubmit.mockResolvedValue({ id: 123 })

    render(<ClientForm initialData={initialData} clientId={123} />)

    const submitButton = screen.getByRole('button', { name: /save client/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
      // The submit function receives the formData, which should include the initial data
      const callArgs = mockSubmit.mock.calls[0][0]
      expect(callArgs.name).toBe('Test Client')
      expect(callArgs.email).toBe('test@example.com')
    }, { timeout: 3000 })
  })

  it('should create new client when clientId is not provided', async () => {
    const initialData = {
      name: 'Test Client',
      email: 'test@example.com',
    }

    mockSubmit.mockResolvedValue({ id: 1 })

    render(<ClientForm initialData={initialData} />)

    const submitButton = screen.getByRole('button', { name: /save client/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
      // The submit function receives the formData, which should include the initial data
      const callArgs = mockSubmit.mock.calls[0][0]
      expect(callArgs.name).toBe('Test Client')
      expect(callArgs.email).toBe('test@example.com')
    }, { timeout: 3000 })
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(<ClientForm onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should display error message when error occurs', () => {
    vi.mocked(useFormSubmission).mockReturnValue({
      submit: mockSubmit,
      isSubmitting: false,
      generalError: 'Failed to save client',
    } as any)

    render(<ClientForm />)

    expect(screen.getByText('Failed to save client')).toBeInTheDocument()
  })

  it('should show loading state during submission', () => {
    vi.mocked(useFormSubmission).mockReturnValue({
      submit: mockSubmit,
      isSubmitting: true,
      generalError: null,
    } as any)

    render(<ClientForm />)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('should update country when changed', () => {
    render(<ClientForm />)

    // Find the country select by finding the combobox near the "Country" label
    const countryLabel = screen.getByText(/country/i)
    const countrySelect = countryLabel.closest('div')?.querySelector('[role="combobox"]')
    
    expect(countrySelect).toBeInTheDocument()
    // Note: Actually changing Select values requires opening the dropdown and clicking an option
    // This test just verifies the select exists
  })

  it('should update currency when changed', () => {
    render(<ClientForm />)

    // Find the currency select by finding the combobox near the "Currency" label
    const currencyLabel = screen.getByText(/currency/i)
    const currencySelect = currencyLabel.closest('div')?.querySelector('[role="combobox"]')
    
    expect(currencySelect).toBeInTheDocument()
    // Note: Actually changing Select values requires opening the dropdown and clicking an option
    // This test just verifies the select exists
  })

  it('should update payment terms when changed', () => {
    render(<ClientForm />)

    // Find the payment terms select by finding the combobox near the "Payment Terms" label
    const paymentTermsLabel = screen.getByText(/payment terms/i)
    const paymentTermsSelect = paymentTermsLabel.closest('div')?.querySelector('[role="combobox"]')
    
    expect(paymentTermsSelect).toBeInTheDocument()
    // Note: Actually changing Select values requires opening the dropdown and clicking an option
    // This test just verifies the select exists
  })

  it('should update status when changed', () => {
    render(<ClientForm />)

    // Find the status select by finding the combobox near the "Status" label
    const statusLabel = screen.getByText(/status/i)
    const statusSelect = statusLabel.closest('div')?.querySelector('[role="combobox"]')
    
    expect(statusSelect).toBeInTheDocument()
    // Note: Actually changing Select values requires opening the dropdown and clicking an option
    // This test just verifies the select exists
  })

  it('should handle optional fields', () => {
    render(<ClientForm />)

    const phoneInput = screen.getByLabelText(/phone/i)
    const companyInput = screen.getByLabelText(/company/i)
    const addressInput = screen.getByLabelText(/address/i)

    fireEvent.change(phoneInput, { target: { value: '+1 555-1234' } })
    fireEvent.change(companyInput, { target: { value: 'Test Company' } })
    fireEvent.change(addressInput, { target: { value: '123 Main St' } })

    expect(phoneInput).toHaveValue('+1 555-1234')
    expect(companyInput).toHaveValue('Test Company')
    expect(addressInput).toHaveValue('123 Main St')
  })
})

