import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { join } from 'path'

describe('API Routes', () => {
	const apiPath = join(process.cwd(), 'app', 'api')

	describe('AI Routes', () => {
		it('should have financial analysis route file', () => {
			const routePath = join(apiPath, 'ai', 'financial-analysis', 'route.ts')
			expect(existsSync(routePath)).toBe(true)
		})

		it('should have categorize route file', () => {
			const routePath = join(apiPath, 'ai', 'categorize', 'route.ts')
			expect(existsSync(routePath)).toBe(true)
		})
	})

	describe('Email Routes', () => {
		it('should have send-invoice route file', () => {
			const routePath = join(apiPath, 'email', 'send-invoice', 'route.ts')
			expect(existsSync(routePath)).toBe(true)
		})
	})

	describe('Search Routes', () => {
		it('should have search route file', () => {
			const routePath = join(apiPath, 'search', 'route.ts')
			expect(existsSync(routePath)).toBe(true)
		})
	})

	describe('Upload Routes', () => {
		it('should have uploadthing route file', () => {
			const routePath = join(apiPath, 'uploadthing', 'route.ts')
			expect(existsSync(routePath)).toBe(true)
		})
	})

	describe('Health Check Route', () => {
		it('should have health check route file', () => {
			const routePath = join(apiPath, 'health', 'route.ts')
			expect(existsSync(routePath)).toBe(true)
		})
	})
})
