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
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should accept value and onChange', async () => {
    const handleChange = vi.fn()
    render(<Input value="test" onChange={handleChange} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('test')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'new value' } })
    })

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should set inputMode automatically based on type', () => {
    const { rerender } = render(<Input type="email" />)
    let input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.inputMode).toBe('email')

    rerender(<Input type="tel" />)
    input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.inputMode).toBe('tel')

    rerender(<Input type="url" />)
    input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.inputMode).toBe('url')

    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.inputMode).toBe('numeric')

    rerender(<Input type="search" />)
    input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.inputMode).toBe('search')
  })

  it('should use provided inputMode when set', () => {
    render(<Input type="text" inputMode="numeric" />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.inputMode).toBe('numeric')
  })

  it('should not set inputMode when autoInputMode is false', () => {
    render(<Input type="email" autoInputMode={false} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.inputMode).toBe('')
  })

  it('should accept placeholder', () => {
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is set', () => {
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should accept custom className', () => {
    render(<Input className="custom-class" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('should accept all standard input HTML attributes', () => {
    render(
      <Input
        type="password"
        name="password"
        id="password-input"
        required
        aria-label="Password"
      />
    )

    const input = screen.getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('password')
    expect(input.name).toBe('password')
    expect(input.id).toBe('password-input')
    expect(input).toBeRequired()
  })

  it('should forward ref', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})

