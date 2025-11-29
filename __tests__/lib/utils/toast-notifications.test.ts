import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock sonner toast before importing the module
const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
}

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Mock api-error-handler at top level for dynamic imports
vi.mock('@/lib/utils/api-error-handler', async () => {
  const actual = await vi.importActual('@/lib/utils/api-error-handler')
  return {
    ...actual,
    parseApiError: vi.fn(),
    isValidationError: vi.fn(),
    isServerError: vi.fn(),
  }
})

// Import after mock is set up
import {
  dashboardToasts,
  handleApiError,
  handleApiSuccess,
  showLoadingToast,
  updateLoadingToast,
} from '@/lib/utils/toast-notifications'
import { toast } from 'sonner'

describe('toast-notifications', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset mock implementations
    vi.mocked(toast.error).mockClear()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.warning).mockClear()
    vi.mocked(toast.info).mockClear()
    vi.mocked(toast.loading).mockClear()
    vi.mocked(toast.dismiss).mockClear()
    
    // Reset api-error-handler mocks
    const apiErrorHandler = await import('@/lib/utils/api-error-handler')
    vi.mocked(apiErrorHandler.parseApiError).mockReset()
    vi.mocked(apiErrorHandler.isValidationError).mockReset()
    vi.mocked(apiErrorHandler.isServerError).mockReset()
  })

  describe('dashboardToasts.error', () => {
    it('should show failed to load stats error', () => {
      dashboardToasts.error.failedToLoadStats()

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load dashboard statistics',
        {
          description: 'Unable to fetch dashboard data. Please try refreshing the page.',
          duration: 5000,
        }
      )
    })

    it('should show failed to load chart error', () => {
      dashboardToasts.error.failedToLoadChart('Revenue')

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load Revenue chart',
        {
          description: 'Unable to fetch chart data. Please try refreshing the page.',
          duration: 5000,
        }
      )
    })

    it('should show failed to load activity error', () => {
      dashboardToasts.error.failedToLoadActivity()

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load recent activity',
        {
          description: 'Unable to fetch activity data. Please try refreshing the page.',
          duration: 5000,
        }
      )
    })

    it('should show failed to load insights error', () => {
      dashboardToasts.error.failedToLoadInsights()

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load AI insights',
        {
          description: 'Unable to fetch AI insights. Please try refreshing the page.',
          duration: 5000,
        }
      )
    })

    it('should show network error', () => {
      dashboardToasts.error.networkError()

      expect(toast.error).toHaveBeenCalledWith(
        'Network error',
        {
          description: 'Please check your internet connection and try again.',
          duration: 5000,
        }
      )
    })

    it('should show unauthorized error', () => {
      dashboardToasts.error.unauthorized()

      expect(toast.error).toHaveBeenCalledWith(
        'Session expired',
        {
          description: 'Please sign in again to continue.',
          duration: 5000,
        }
      )
    })

    it('should show server error', () => {
      dashboardToasts.error.serverError()

      expect(toast.error).toHaveBeenCalledWith(
        'Server error',
        {
          description: 'Something went wrong on our end. Please try again later.',
          duration: 5000,
        }
      )
    })

    it('should show validation error with field count', () => {
      const errors = {
        email: ['Invalid email'],
        password: ['Too short'],
      }

      dashboardToasts.error.validationError(errors)

      expect(toast.error).toHaveBeenCalledWith(
        'Validation failed: 2 fields need attention',
        {
          description: 'Please check the form fields and try again.',
          duration: 6000,
        }
      )
    })

    it('should show validation error with single field', () => {
      const errors = {
        email: ['Invalid email'],
      }

      dashboardToasts.error.validationError(errors)

      expect(toast.error).toHaveBeenCalledWith(
        'Validation failed: 1 field needs attention',
        {
          description: 'Please check the form fields and try again.',
          duration: 6000,
        }
      )
    })

    it('should show validation error without errors object', () => {
      dashboardToasts.error.validationError()

      expect(toast.error).toHaveBeenCalledWith(
        'Validation failed',
        {
          description: 'Please check the form fields and try again.',
          duration: 6000,
        }
      )
    })

    it('should show bad request error with custom message', () => {
      dashboardToasts.error.badRequest('Invalid input format')

      expect(toast.error).toHaveBeenCalledWith(
        'Invalid request',
        {
          description: 'Invalid input format',
          duration: 5000,
        }
      )
    })

    it('should show bad request error without message', () => {
      dashboardToasts.error.badRequest()

      expect(toast.error).toHaveBeenCalledWith(
        'Invalid request',
        {
          description: 'Please check your input and try again.',
          duration: 5000,
        }
      )
    })
  })

  describe('dashboardToasts.success', () => {
    it('should show data refreshed success', () => {
      dashboardToasts.success.dataRefreshed()

      expect(toast.success).toHaveBeenCalledWith(
        'Data refreshed',
        {
          description: 'Dashboard data has been updated successfully.',
          duration: 3000,
        }
      )
    })

    it('should show settings updated success', () => {
      dashboardToasts.success.settingsUpdated()

      expect(toast.success).toHaveBeenCalledWith(
        'Settings updated',
        {
          description: 'Your dashboard settings have been saved.',
          duration: 3000,
        }
      )
    })
  })

  describe('dashboardToasts.warning', () => {
    it('should show slow connection warning', () => {
      dashboardToasts.warning.slowConnection()

      expect(toast.warning).toHaveBeenCalledWith(
        'Slow connection detected',
        {
          description: 'Data may take longer to load. Please be patient.',
          duration: 4000,
        }
      )
    })

    it('should show partial data warning', () => {
      dashboardToasts.warning.partialData()

      expect(toast.warning).toHaveBeenCalledWith(
        'Partial data loaded',
        {
          description: 'Some dashboard components may not display complete information.',
          duration: 4000,
        }
      )
    })
  })

  describe('dashboardToasts.info', () => {
    it('should show loading data info', () => {
      dashboardToasts.info.loadingData()

      expect(toast.info).toHaveBeenCalledWith(
        'Loading dashboard data',
        {
          description: 'Please wait while we fetch your latest information.',
          duration: 2000,
        }
      )
    })

    it('should show date range changed info', () => {
      dashboardToasts.info.dateRangeChanged('Last 30 days')

      expect(toast.info).toHaveBeenCalledWith(
        'Date range updated',
        {
          description: 'Dashboard now shows data for Last 30 days.',
          duration: 3000,
        }
      )
    })
  })

  describe('handleApiError', () => {
    it('should handle 401 unauthorized error', async () => {
      const error = {
        response: {
          status: 401,
          json: async () => ({}),
        } as Response,
      }

      await handleApiError(error)

      expect(toast.error).toHaveBeenCalledWith(
        'Session expired',
        {
          description: 'Please sign in again to continue.',
          duration: 5000,
        }
      )
    })

    it('should handle validation error from API response', async () => {
      const { parseApiError, isValidationError, isServerError } = await import('@/lib/utils/api-error-handler')
      
      vi.mocked(parseApiError).mockResolvedValue({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { email: ['Invalid email'] },
      } as any)
      vi.mocked(isValidationError).mockReturnValue(true)
      vi.mocked(isServerError).mockReturnValue(false)

      const error = {
        response: {
          status: 400,
          json: async () => ({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: { email: ['Invalid email'] },
            },
          }),
        } as Response,
      }

      await handleApiError(error)

      // Should call validation error handler
      expect(toast.error).toHaveBeenCalled()
    })

    it('should handle network error', async () => {
      const error = new Error('fetch failed')

      await handleApiError(error)

      expect(toast.error).toHaveBeenCalledWith(
        'Network error',
        {
          description: 'Please check your internet connection and try again.',
          duration: 5000,
        }
      )
    })

    it('should handle generic error', async () => {
      const error = new Error('Something went wrong')

      await handleApiError(error)

      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong',
        {
          description: 'An unexpected error occurred. Please try again.',
          duration: 5000,
        }
      )
    })

    it('should handle server error (500+)', async () => {
      const { parseApiError, isValidationError, isServerError } = await import('@/lib/utils/api-error-handler')
      
      vi.mocked(parseApiError).mockResolvedValue(null)
      
      const error = {
        response: {
          status: 500,
          json: async () => ({}),
        } as Response,
      }

      await handleApiError(error)

      expect(toast.error).toHaveBeenCalledWith(
        'Server error',
        {
          description: 'Something went wrong on our end. Please try again later.',
          duration: 5000,
        }
      )
    })
  })

  describe('handleApiSuccess', () => {
    it('should show success toast with message', () => {
      handleApiSuccess('Operation successful')

      expect(toast.success).toHaveBeenCalledWith(
        'Operation successful',
        {
          description: undefined,
          duration: 3000,
        }
      )
    })

    it('should show success toast with message and description', () => {
      handleApiSuccess('Operation successful', 'Your changes have been saved')

      expect(toast.success).toHaveBeenCalledWith(
        'Operation successful',
        {
          description: 'Your changes have been saved',
          duration: 3000,
        }
      )
    })
  })

  describe('showLoadingToast', () => {
    it('should show loading toast', () => {
      showLoadingToast('Loading data...')

      expect(toast.loading).toHaveBeenCalledWith(
        'Loading data...',
        {
          description: 'Please wait...',
        }
      )
    })
  })

  describe('updateLoadingToast', () => {
    it('should dismiss loading toast and show success', () => {
      updateLoadingToast('toast-123', 'success', 'Operation complete', 'All done!')

      expect(toast.dismiss).toHaveBeenCalledWith('toast-123')
      expect(toast.success).toHaveBeenCalledWith(
        'Operation complete',
        {
          description: 'All done!',
          duration: 3000,
        }
      )
    })

    it('should dismiss loading toast and show error', () => {
      updateLoadingToast('toast-123', 'error', 'Operation failed', 'Something went wrong')

      expect(toast.dismiss).toHaveBeenCalledWith('toast-123')
      expect(toast.error).toHaveBeenCalledWith(
        'Operation failed',
        {
          description: 'Something went wrong',
          duration: 5000,
        }
      )
    })

    it('should handle success without description', () => {
      updateLoadingToast('toast-123', 'success', 'Operation complete')

      expect(toast.dismiss).toHaveBeenCalledWith('toast-123')
      expect(toast.success).toHaveBeenCalledWith(
        'Operation complete',
        {
          description: undefined,
          duration: 3000,
        }
      )
    })
  })
})

