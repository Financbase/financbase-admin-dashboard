import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@/src/test/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
	it('renders with default props', () => {
		render(<Button>Click me</Button>)

		const button = screen.getByRole('button', { name: /click me/i })
		expect(button).toBeInTheDocument()
		expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-10', 'px-4', 'py-2')
	})

	it('renders with different variants', () => {
		const { rerender } = render(<Button variant="destructive">Delete</Button>)

		let button = screen.getByRole('button', { name: /delete/i })
		expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')

		rerender(<Button variant="outline">Outline</Button>)
		button = screen.getByRole('button', { name: /outline/i })
		expect(button).toHaveClass('border', 'border-input', 'bg-background')

		rerender(<Button variant="secondary">Secondary</Button>)
		button = screen.getByRole('button', { name: /secondary/i })
		expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')

		rerender(<Button variant="ghost">Ghost</Button>)
		button = screen.getByRole('button', { name: /ghost/i })
		expect(button).toHaveClass('hover:bg-accent')

		rerender(<Button variant="link">Link</Button>)
		button = screen.getByRole('button', { name: /link/i })
		expect(button).toHaveClass('text-primary', 'underline-offset-4')
	})

	it('renders with different sizes', () => {
		const { rerender } = render(<Button size="sm">Small</Button>)

		let button = screen.getByRole('button', { name: /small/i })
		expect(button).toHaveClass('h-9', 'rounded-md', 'px-3')

		rerender(<Button size="lg">Large</Button>)
		button = screen.getByRole('button', { name: /large/i })
		expect(button).toHaveClass('h-11', 'rounded-md', 'px-8')

		rerender(<Button size="icon">Icon</Button>)
		button = screen.getByRole('button', { name: /icon/i })
		expect(button).toHaveClass('h-10', 'w-10')
	})

	it('applies custom className', () => {
		render(<Button className="custom-class">Custom</Button>)

		const button = screen.getByRole('button', { name: /custom/i })
		expect(button).toHaveClass('custom-class')
	})

	it('forwards other props to button element', () => {
		render(<Button type="submit" disabled>Submit</Button>)

		const button = screen.getByRole('button', { name: /submit/i })
		expect(button).toHaveAttribute('type', 'submit')
		expect(button).toBeDisabled()
		expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
	})

	it('supports asChild prop with Slot', () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>
		)

		const link = screen.getByRole('link', { name: /link button/i })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/test')
		expect(link).toHaveClass('bg-primary', 'text-primary-foreground') // Should still apply button styles
	})

	it('has correct focus styles', () => {
		render(<Button>Focus Test</Button>)

		const button = screen.getByRole('button', { name: /focus test/i })
		expect(button).toHaveClass(
			'focus-visible:outline-none',
			'focus-visible:ring-2',
			'focus-visible:ring-ring',
			'focus-visible:ring-offset-2'
		)
	})

	it('has correct transition styles', () => {
		render(<Button>Transition Test</Button>)

		const button = screen.getByRole('button', { name: /transition test/i })
		expect(button).toHaveClass('transition-colors')
	})

	it('handles click events', () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick}>Clickable</Button>)

		const button = screen.getByRole('button', { name: /clickable/i })
		button.click()

		expect(handleClick).toHaveBeenCalledTimes(1)
	})

	it('renders children correctly', () => {
		render(
			<Button>
				<span>Icon</span>
				Text
			</Button>
		)

		expect(screen.getByText('Icon')).toBeInTheDocument()
		expect(screen.getByText('Text')).toBeInTheDocument()
	})
})