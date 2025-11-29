# Remaining Test Fixes Guide

## Current Status
- **Test Files**: 29 failed | 146 passed (175 total)
- **Tests**: 133 failed | 1848 passed | 18 skipped (1999 total)
- **Progress**: Fixed 24 tests (from 157 to 133 failures)

## Files Fixed So Far

### ✅ Completed
1. `__tests__/components/expenses/expense-list.test.tsx` - All useQuery mocks updated
2. `__tests__/components/invoices/invoice-list.test.tsx` - Partially fixed (needs remaining tests)
3. `__tests__/components/budget-details-dialog.test.tsx` - Fixed
4. All hook tests (use-api-client, use-form-submission)
5. All utility tests (sanitize, error-parser, real-estate-formatting)
6. Chart component tests (cash-flow, revenue, expense-breakdown)
7. Dashboard tests (executive-dashboard, dashboard)

## Remaining Files to Fix

### High Priority (Most Common Patterns)

#### 1. Form Tests (Need async handling and proper mocking)
- `__tests__/components/clients/client-form.test.tsx`
- `__tests__/components/expenses/expense-form.test.tsx`
- `__tests__/components/budgets/budget-form.test.tsx`
- `__tests__/components/invoices/invoice-form.test.tsx`

**Pattern to Apply:**
```typescript
// Before
it('should validate required fields on submit', () => {
  render(<Form />)
  const submitButton = screen.getByRole('button', { name: /save/i })
  fireEvent.click(submitButton)
  expect(toast.error).toHaveBeenCalled()
})

// After
it('should validate required fields on submit', async () => {
  render(<Form />)
  const submitButton = screen.getByRole('button', { name: /save/i })
  fireEvent.click(submitButton)
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalled()
  }, { timeout: 3000 })
})
```

#### 2. List Tests (Need useQuery mocks updated)
- `__tests__/components/invoices/invoice-list.test.tsx` - Remaining tests
- Other list components

**Pattern to Apply:**
```typescript
// Before
vi.mocked(useQuery).mockReturnValue({
  data: mockData,
  isLoading: false,
} as any)

// After
import { createMockUseQueryResult } from '@/src/test/test-utils'

vi.mocked(useQuery).mockReturnValueOnce(
  createMockUseQueryResult({
    data: mockData,
    isLoading: false,
    isSuccess: true,
  })
)
```

#### 3. Dashboard/Chart Tests (Need loading state fixes)
- `__tests__/components/financial/financial-overview-dashboard.test.tsx`
- `__tests__/components/financial/intelligence/advanced-financial-dashboard.test.tsx`
- `__tests__/components/analytics/advanced-charts.test.tsx` - Loading state tests

**Pattern to Apply:**
```typescript
// Before
it('should render loading state', () => {
  vi.mocked(useQuery).mockReturnValue({ isLoading: true } as any)
  render(<Component />)
  expect(screen.getByTestId('chart')).toBeInTheDocument()
})

// After
it('should render loading state', async () => {
  vi.mocked(useQuery).mockReturnValue(
    createMockUseQueryResult({
      isLoading: true,
      isPending: true,
      isSuccess: false,
    })
  )
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
  }, { timeout: 3000 })
})
```

#### 4. Layout/UI Component Tests
- `__tests__/components/layout/enhanced-sidebar.test.tsx`
- `__tests__/components/layout/enhanced-top-nav.test.tsx`
- `__tests__/components/layout/enhanced-layout.test.tsx`

**Pattern to Apply:**
- Add `waitFor` for async interactions
- Use `act` for state updates
- Fix interaction tests with proper async handling

#### 5. Advanced Component Tests
- `__tests__/components/dashboard/dashboard-builder.test.tsx`
- `__tests__/components/bill-pay/bill-pay-dashboard.test.tsx`
- `__tests__/components/core/activity-feed.test.tsx`
- Other advanced components

## Step-by-Step Fix Process

### For Each Test File:

1. **Remove Duplicate Mocks**
   ```typescript
   // Remove these if present:
   vi.mock('recharts', () => ({ ... }))
   vi.mock('@tanstack/react-query', () => ({ ... }))
   
   // Add comment:
   // Note: recharts is mocked globally in __tests__/setup.ts
   // Note: @tanstack/react-query is mocked globally in __tests__/setup.ts
   ```

2. **Add Imports**
   ```typescript
   import { createMockUseQueryResult, createMockUseMutationResult } from '@/src/test/test-utils'
   import { waitFor, act } from '@testing-library/react'
   ```

3. **Update useQuery Mocks**
   ```typescript
   // Replace all instances of:
   vi.mocked(useQuery).mockReturnValue({ data, isLoading } as any)
   
   // With:
   vi.mocked(useQuery).mockReturnValue(
     createMockUseQueryResult({ data, isLoading, isSuccess: !isLoading })
   )
   ```

4. **Add Async Handling**
   ```typescript
   // Wrap assertions in waitFor:
   await waitFor(() => {
     expect(screen.getByText('Text')).toBeInTheDocument()
   }, { timeout: 3000 })
   ```

5. **Fix Loading States**
   ```typescript
   // Look for loading indicators, not content:
   await waitFor(() => {
     expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
   })
   ```

6. **Fix Interactions**
   ```typescript
   // Wrap interactions in act and wait for results:
   await act(async () => {
     fireEvent.click(button)
   })
   await waitFor(() => {
     expect(result).toBeInTheDocument()
   })
   ```

## Quick Reference: Common Patterns

### Pattern 1: Basic Component Render
```typescript
it('should render component', async () => {
  vi.mocked(useQuery).mockReturnValue(
    createMockUseQueryResult({ data: mockData, isSuccess: true })
  )
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Title')).toBeInTheDocument()
  }, { timeout: 3000 })
})
```

### Pattern 2: Loading State
```typescript
it('should show loading', async () => {
  vi.mocked(useQuery).mockReturnValue(
    createMockUseQueryResult({ isLoading: true, isPending: true })
  )
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
  }, { timeout: 3000 })
})
```

### Pattern 3: Form Submission
```typescript
it('should submit form', async () => {
  render(<Form />)
  const submit = screen.getByRole('button', { name: /submit/i })
  fireEvent.click(submit)
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalled()
  }, { timeout: 3000 })
})
```

### Pattern 4: Tab/Interaction
```typescript
it('should switch tabs', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByRole('tab', { name: /tab/i })).toBeInTheDocument()
  })
  const tab = screen.getByRole('tab', { name: /tab/i })
  await act(async () => {
    fireEvent.click(tab)
  })
  await waitFor(() => {
    expect(screen.getByText('Tab Content')).toBeInTheDocument()
  })
})
```

### Pattern 5: Multiple useQuery Calls
```typescript
it('should render with multiple queries', async () => {
  vi.mocked(useQuery).mockReturnValueOnce(
    createMockUseQueryResult({ data: data1, isSuccess: true })
  ).mockReturnValueOnce(
    createMockUseQueryResult({ data: data2, isSuccess: true })
  )
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
```

## Automated Fix Script

A helper script exists at `scripts/fix-component-tests.sh` but may need manual adjustments for complex cases.

## Testing After Fixes

After fixing each file, run:
```bash
npm test -- __tests__/components/[file-name].test.tsx
```

## Notes

- Always use `createMockUseQueryResult` for React Query mocks
- Always wrap async assertions in `waitFor` with timeout
- Loading states should look for loading indicators, not content
- Interactions should be wrapped in `act` when needed
- Use `mockReturnValueOnce` for multiple sequential queries

## Estimated Remaining Work

- **Form Tests**: ~20-30 tests across 4 files
- **List Tests**: ~15-20 tests across 2-3 files  
- **Dashboard Tests**: ~20-30 tests across 5-7 files
- **Layout Tests**: ~10-15 tests across 3 files
- **Other Components**: ~40-50 tests across 10-15 files

**Total**: ~105-145 tests remaining (some may be edge cases requiring component-specific fixes)

