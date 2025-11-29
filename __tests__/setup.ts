/**
 * Test Setup Configuration
 * Global test setup for Vitest
 */

import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import dotenv from 'dotenv';

// Mock lucide-react icons FIRST - must be hoisted before any other mocks or imports
// This ensures Wallet and all other icons are available when components are loaded
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  
  // Create a simple icon component factory (defined inline to avoid hoisting issues)
  const createIcon = (testId: string, emoji: string) => {
    const IconComponent = ({ className, ...props }: any) => 
      React.createElement('div', { 
        className, 
        'data-testid': testId,
        ...props 
      }, emoji);
    IconComponent.displayName = `MockIcon(${testId})`;
    return IconComponent;
  };
  
  // Create all icon mocks - includes all commonly used icons
  const iconMocks = {
    Plus: createIcon('plus-icon', '+'),
    Edit: createIcon('edit-icon', 'Edit'),
    Trash2: createIcon('trash-icon', 'Trash'),
    RefreshCw: createIcon('refresh-icon', 'Refresh'),
    Check: createIcon('check-icon', '✓'),
    ChevronDown: createIcon('chevron-down-icon', '▼'),
    ChevronUp: createIcon('chevron-up-icon', '▲'),
    Search: createIcon('search-icon', '🔍'),
    Filter: createIcon('filter-icon', '⚙'),
    Loader2: createIcon('loader', 'Loading...'),
    TrendingUp: createIcon('trending-up', '↑'),
    TrendingDown: createIcon('trending-down', '↓'),
    DollarSign: createIcon('dollar-sign', '$'),
    ShoppingCart: createIcon('shopping-cart', '🛒'),
    Users: createIcon('users', '👥'),
    Package: createIcon('package', '📦'),
    Activity: createIcon('activity', '📊'),
    Star: createIcon('star', '⭐'),
    BarChart3: createIcon('bar-chart', '📈'),
    Briefcase: createIcon('briefcase', '💼'),
    CheckCircle: createIcon('check-circle', '✅'),
    Eye: createIcon('eye', '👁️'),
    MoreHorizontal: createIcon('more-horizontal', '⋯'),
    XCircle: createIcon('x-circle', '❌'),
    X: createIcon('x', '✕'),
    Key: createIcon('key', '🔑'),
    LayoutDashboard: createIcon('layout-dashboard', '🏠'),
    Minus: createIcon('minus', '-'),
    Wallet: createIcon('wallet', '💳'), // CRITICAL: Wallet must be explicitly included
    ThumbsUp: createIcon('thumbs-up-icon', '👍'),
    ThumbsDown: createIcon('thumbs-down-icon', '👎'),
  };
  
  // Return all actual icons, with our mocks overriding specific ones
  // This ensures Wallet and all other icons are available
  // IMPORTANT: Put iconMocks AFTER actual so our mocks override
  const mockResult: Record<string, any> = {
    ...actual,
    ...iconMocks,
    // Explicitly ensure critical icons are exported - always use our mock version
    Wallet: iconMocks.Wallet,
    X: iconMocks.X, // Explicitly ensure X is exported
  };
  
  return mockResult;
});

// Mock server-only module
vi.mock('server-only', () => ({}));

// Load environment variables for tests
dotenv.config({ path: '.env.local' });

// Add React to global scope for JSX support
global.React = React;

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    public headers: Headers;
    public url: string;
    public nextUrl: URL;
    
    constructor(url: string, public init?: RequestInit) {
      this.url = url;
      this.headers = new Headers(init?.headers);
      // Parse URL to extract searchParams - URL already has searchParams as a getter
      this.nextUrl = new URL(url);
    }
    
    json = vi.fn(async () => {
      if (this.init?.body) {
        if (typeof this.init.body === 'string') {
          try {
            return JSON.parse(this.init.body);
          } catch {
            throw new Error('Invalid JSON');
          }
        }
        return this.init.body;
      }
      return {};
    });
    
    text = vi.fn(async () => {
      if (this.init?.body) {
        return typeof this.init.body === 'string' ? this.init.body : JSON.stringify(this.init.body);
      }
      return '';
    });
    
    formData = vi.fn();
  },
  NextResponse: class MockNextResponse {
    public status: number;
    public headers: Headers;
    private body: any;
    
    constructor(body: any, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }
    
    json = vi.fn(async () => {
      // If body is a string, try to parse it as JSON, otherwise return as-is
      if (typeof this.body === 'string') {
        try {
          return JSON.parse(this.body);
        } catch {
          // If parsing fails, return the string (for CSV/text responses)
          throw new Error('Response is not JSON');
        }
      }
      return this.body;
    });
    
    text = vi.fn(async () => {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    });
    
    static json = vi.fn((data, init) => {
      return new MockNextResponse(data, init);
    });
    
    static redirect = vi.fn();
    static next = vi.fn();
  },
}));

// Mock Clerk authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => Promise.resolve({ userId: 'test-user-123' })),
  currentUser: vi.fn(() => Promise.resolve({
    id: 'test-user-123',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
  })),
}));

// Mock Svix Webhook (for Clerk webhook tests)
// Create a shared mock verify function that tests can customize
export const mockSvixVerify = vi.fn();
vi.mock('svix', () => ({
  Webhook: class MockWebhook {
    constructor(secret: string) {
      // Store secret if needed for tests
      this.secret = secret;
    }
    secret: string;
    verify = (...args: any[]) => mockSvixVerify(...args);
  },
}));

// Mock Clerk client components
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-123',
    isLoaded: true,
    isSignedIn: true,
  }),
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => {
  // Create a proper QueryClient class that can be instantiated with new
  class MockQueryClient {
    getQueryData = vi.fn();
    setQueryData = vi.fn();
    invalidateQueries = vi.fn();
    refetchQueries = vi.fn();
    clear = vi.fn();
    removeQueries = vi.fn();
    resetQueries = vi.fn();
    cancelQueries = vi.fn();
    getQueryState = vi.fn();
    getQueriesData = vi.fn();
    setQueriesData = vi.fn();
    getQueryCache = vi.fn().mockReturnValue({
      getAll: vi.fn().mockReturnValue([]),
      find: vi.fn(),
      findAll: vi.fn().mockReturnValue([]),
    });
    getMutationCache = vi.fn().mockReturnValue({
      getAll: vi.fn().mockReturnValue([]),
      find: vi.fn(),
      findAll: vi.fn().mockReturnValue([]),
    });
    constructor(options?: any) {
      // Accept options but don't need to do anything with them for mocks
    }
  }

  // Helper to create a complete UseQueryResult object
  const createUseQueryResult = (overrides: any = {}) => {
    const defaults = {
      data: undefined,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle' as const,
      isError: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: false,
      refetch: vi.fn(),
      status: 'success' as const,
    };

    const result = { ...defaults, ...overrides };
    
    // Ensure status matches the state
    if (result.isLoading || result.isPending) {
      result.status = 'pending';
    } else if (result.isError) {
      result.status = 'error';
    } else if (result.isSuccess) {
      result.status = 'success';
    }

    return result;
  };

  // Helper to create a complete UseMutationResult object
  const createUseMutationResult = (overrides: any = {}) => {
    const defaults = {
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      isError: false,
      isIdle: true,
      isPaused: false,
      isPending: false,
      isSuccess: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      status: 'idle' as const,
      submittedAt: 0,
      variables: undefined,
    };

    const result = { ...defaults, ...overrides };
    
    // Ensure status matches the state
    if (result.isPending) {
      result.status = 'pending';
      result.isIdle = false;
    } else if (result.isError) {
      result.status = 'error';
      result.isIdle = false;
    } else if (result.isSuccess) {
      result.status = 'success';
      result.isIdle = false;
    }

    return result;
  };

  // Default mock implementations
  const defaultUseQuery = vi.fn((options: any) => {
    // Support query key-based responses
    const queryKey = options?.queryKey?.[0];
    
    // Return a default successful result
    return createUseQueryResult({
      data: null,
      isSuccess: true,
      status: 'success',
    });
  });

  const defaultUseMutation = vi.fn(() => {
    return createUseMutationResult();
  });
  
  return {
    useQuery: defaultUseQuery,
    useMutation: defaultUseMutation,
    useQueryClient: vi.fn().mockReturnValue(new MockQueryClient()),
    QueryClient: MockQueryClient,
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
    // Export helpers for tests to use
    __createUseQueryResult: createUseQueryResult,
    __createUseMutationResult: createUseMutationResult,
  };
});

// Helper function to create a chainable query builder mock
const createQueryBuilder = (defaultResult: any[] = []) => {
  const builder: any = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    rightJoin: vi.fn().mockReturnThis(),
    fullJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
  };
  // Make it thenable (Promise-like) - when awaited, returns the default result
  builder.then = vi.fn((onResolve?: (value: any[]) => any) => {
    const promise = Promise.resolve(defaultResult);
    return onResolve ? promise.then(onResolve) : promise;
  });
  builder.catch = vi.fn((onReject?: (error: any) => any) => {
    const promise = Promise.resolve(defaultResult);
    return onReject ? promise.catch(onReject) : promise;
  });
  // Make it awaitable
  Object.defineProperty(builder, Symbol.toStringTag, { value: 'Promise' });
  return builder;
};

// Mock database for unit tests, but allow real database for integration tests
// This mock supports proper method chaining for Drizzle ORM queries
vi.mock('@/lib/db', () => {
  const queryBuilder = createQueryBuilder();
  
  return {
    db: {
      select: vi.fn().mockReturnValue(queryBuilder),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
          then: vi.fn((onResolve) => Promise.resolve([{ id: 1 }]).then(onResolve)),
        }),
        // Support direct await on insert().values()
        then: vi.fn((onResolve) => Promise.resolve([{ id: 1 }]).then(onResolve)),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
            then: vi.fn((onResolve) => Promise.resolve([{ id: 1 }]).then(onResolve)),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
        then: vi.fn((onResolve) => Promise.resolve([]).then(onResolve)),
    }),
    execute: vi.fn().mockResolvedValue({ rows: [] }),
      query: {
        invoices: {
          findFirst: vi.fn().mockResolvedValue(null),
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
    },
    getDbOrThrow: vi.fn(() => {
      const queryBuilder = createQueryBuilder();
      return {
        select: vi.fn().mockReturnValue(queryBuilder),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
            then: vi.fn((onResolve) => Promise.resolve([{ id: 1 }]).then(onResolve)),
      }),
          // Support direct await on insert().values()
          then: vi.fn((onResolve) => Promise.resolve([{ id: 1 }]).then(onResolve)),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
              then: vi.fn((onResolve) => Promise.resolve([{ id: 1 }]).then(onResolve)),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
          then: vi.fn((onResolve) => Promise.resolve([]).then(onResolve)),
    }),
    execute: vi.fn().mockResolvedValue({ rows: [] }),
        query: {
          invoices: {
            findFirst: vi.fn().mockResolvedValue(null),
            findMany: vi.fn().mockResolvedValue([]),
          },
        },
      };
    }),
  getRawSqlConnection: vi.fn(() => {
    // Return a mock function that can be used as a template tag (rawSql`SELECT ...`)
    // Template tag functions in JavaScript are called with (strings, ...values)
    // The function needs to be callable directly as a template tag
    const mockRawSql = async (strings: TemplateStringsArray, ...values: any[]) => {
      // Return a mock result for SQL queries (set_config returns void/empty array)
      return Promise.resolve([]);
    };
    // Ensure it's a function that can be called as a template tag
    return mockRawSql as any;
  }),
  sql: Object.assign(
    (strings: TemplateStringsArray, ...values: any[]) => {
      // Return a mock SQL object that can be used in queries
      return {
        toQuery: () => ({ sql: strings.join('?'), params: values }),
        mapWith: vi.fn(),
        as: vi.fn(),
        getSQL: () => ({ sql: strings.join('?'), params: values }),
      };
    },
    {
      // Add common SQL helper methods
      raw: vi.fn((query: string) => query),
      placeholder: vi.fn((name: string) => `:${name}`),
      join: vi.fn((parts: any[]) => parts.join(', ')),
    }
  ),
  };
});

// Mock services
vi.mock('@/lib/services/client-service', () => ({
  createClient: vi.fn(),
  getClientById: vi.fn(),
  getClients: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
  getClientStats: vi.fn(),
  searchClients: vi.fn(),
  getClientInvoiceHistory: vi.fn(),
  toggleClientStatus: vi.fn(),
  ClientService: {
    create: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getStats: vi.fn(),
    search: vi.fn(),
    getInvoiceHistory: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

vi.mock('@/lib/services/lead-management-service', () => ({
  LeadManagementService: {
    createLead: vi.fn(),
    getLeadById: vi.fn(),
    getPaginatedLeads: vi.fn(),
    updateLeadStatus: vi.fn(),
    createLeadActivity: vi.fn(),
    getLeadActivities: vi.fn(),
    createLeadTask: vi.fn(),
    getLeadTasks: vi.fn(),
    convertLeadToClient: vi.fn(),
    getLeadStats: vi.fn(),
    getPipelineMetrics: vi.fn(),
  },
}));

vi.mock('@/lib/services/transaction-service', () => ({
  TransactionService: {
    createTransaction: vi.fn(),
    getTransactionById: vi.fn(),
    getPaginatedTransactions: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    getTransactionStats: vi.fn(),
    getFinancialAnalysis: vi.fn(),
  },
}));

vi.mock('@/lib/services/account-service', () => ({
  AccountService: {
    createAccount: vi.fn(),
    getAccountById: vi.fn(),
    getPaginatedAccounts: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    getAccountStats: vi.fn(),
    reconcileAccount: vi.fn(),
  },
}));

vi.mock('@/lib/services/adboard-service', () => ({
  AdboardService: {
    createCampaign: vi.fn(),
    getCampaignById: vi.fn(),
    getPaginatedCampaigns: vi.fn(),
    updateCampaign: vi.fn(),
    deleteCampaign: vi.fn(),
    getCampaignStats: vi.fn(),
    getCampaignPerformance: vi.fn(),
    getOptimizationRecommendations: vi.fn(),
  },
}));

vi.mock('@/lib/services/unified-dashboard-service', () => ({
  UnifiedDashboardService: {
    getUnifiedMetrics: vi.fn(),
    getUnifiedWidgets: vi.fn(),
    getDataConsistencyReport: vi.fn(),
  },
}));

// Mock notification service
vi.mock('@/lib/services/notification-service', () => ({
  NotificationHelpers: {
    sendClientCreated: vi.fn(),
    sendClientUpdated: vi.fn(),
    sendClientDeleted: vi.fn(),
    sendLeadCreated: vi.fn(),
    sendLeadActivityCreated: vi.fn(),
    sendLeadTaskCreated: vi.fn(),
    sendTransactionCreated: vi.fn(),
    sendAccountReconciled: vi.fn(),
    sendCampaignCreated: vi.fn(),
    sendCampaignPerformanceAlert: vi.fn(),
  },
}));

// Mock AI services
vi.mock('@/lib/services/ai/financial-intelligence-service', () => ({
  FinancialIntelligenceService: {
    getFinancialHealthScore: vi.fn(),
    getFinancialInsights: vi.fn(),
    getFinancialPredictions: vi.fn(),
    getFinancialRecommendations: vi.fn(),
  },
}));

vi.mock('@/lib/services/ai/ai-assistant-service', () => ({
  AIAssistantService: {
    createConversation: vi.fn(),
    getConversationById: vi.fn(),
    getConversations: vi.fn(),
    addMessageToConversation: vi.fn(),
    getMessagesByConversationId: vi.fn(),
    generateAssistantResponse: vi.fn(),
    getSuggestions: vi.fn(),
  },
}));

// Note: lucide-react mock is defined at the top of this file (line ~12)
// This ensures all icons including Wallet are properly mocked and hoisted

// Mock analytics service
vi.mock('@/lib/services/analytics/analytics-service', () => ({
  AnalyticsService: {
    getRevenueAnalytics: vi.fn(),
    getExpenseAnalytics: vi.fn(),
    getClientAnalytics: vi.fn(),
    getPerformanceMetrics: vi.fn(),
  },
}));

// Mock dashboard service
vi.mock('@/lib/services/dashboard-service', () => ({
  DashboardService: {
    getOverviewMetrics: vi.fn(),
    getRecentActivity: vi.fn(),
    getAiInsights: vi.fn(),
  },
}));

// Mock payment service
vi.mock('@/lib/services/payment-service', () => ({
  PaymentService: {
    createPayment: vi.fn(),
    getPaymentById: vi.fn(),
    getPaginatedPayments: vi.fn(),
    updatePayment: vi.fn(),
    deletePayment: vi.fn(),
    getPaymentStats: vi.fn(),
    processPayment: vi.fn(),
  },
}));

// Mock project service
vi.mock('@/lib/services/project-service', () => ({
  ProjectService: {
    createProject: vi.fn(),
    getProjectById: vi.fn(),
    getPaginatedProjects: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getProjectStats: vi.fn(),
    createTimeEntry: vi.fn(),
    getTimeEntries: vi.fn(),
  },
}));

// Mock real estate service
vi.mock('@/lib/services/real-estate-service', () => ({
  RealEstateService: {
    createProperty: vi.fn(),
    getPropertyById: vi.fn(),
    getPaginatedProperties: vi.fn(),
    updateProperty: vi.fn(),
    deleteProperty: vi.fn(),
    getPropertyStats: vi.fn(),
    createTenant: vi.fn(),
    getTenants: vi.fn(),
  },
}));

// Mock report service
vi.mock('@/lib/services/report-service', () => ({
  ReportService: {
    createReport: vi.fn(),
    getReportById: vi.fn(),
    getPaginatedReports: vi.fn(),
    updateReport: vi.fn(),
    deleteReport: vi.fn(),
    generateReport: vi.fn(),
    scheduleReport: vi.fn(),
  },
}));

// Mock expense service
vi.mock('@/lib/services/expense-service', () => ({
  ExpenseService: {
    createExpense: vi.fn(),
    getExpenseById: vi.fn(),
    getPaginatedExpenses: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    getExpenseStats: vi.fn(),
    approveExpense: vi.fn(),
  },
}));

// Mock invoice service
vi.mock('@/lib/services/invoice-service', () => ({
  InvoiceService: {
    createInvoice: vi.fn(),
    getInvoiceById: vi.fn(),
    getPaginatedInvoices: vi.fn(),
    updateInvoice: vi.fn(),
    deleteInvoice: vi.fn(),
    getInvoiceStats: vi.fn(),
    sendInvoice: vi.fn(),
    markAsPaid: vi.fn(),
  },
}));

// Mock collaboration service
vi.mock('@/lib/services/collaboration-service', () => ({
  CollaborationService: {
    createSession: vi.fn(),
    getSessionById: vi.fn(),
    getPaginatedSessions: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    joinSession: vi.fn(),
    leaveSession: vi.fn(),
  },
}));

// Mock websocket context
vi.mock('@/contexts/websocket-context', () => ({
  useWebSocket: () => ({
    socket: null,
    isConnected: false,
    sendMessage: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }),
}));

// Mock collaboration context
vi.mock('@/contexts/collaboration-context', () => ({
  useCollaboration: () => ({
    isCollaborating: false,
    collaborators: [],
    startCollaboration: vi.fn(),
    endCollaboration: vi.fn(),
    inviteCollaborator: vi.fn(),
    removeCollaborator: vi.fn(),
  }),
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock feedback hook
vi.mock('@/hooks/use-feedback', () => ({
  useFeedback: () => ({
    submitFeedback: vi.fn(),
    getFeedback: vi.fn(),
  }),
}));

// Mock file upload
vi.mock('@/lib/upload', () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
  getFileUrl: vi.fn(),
}));

// Mock email service
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
  sendTemplateEmail: vi.fn(),
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

// Mock email-service module (functions)
vi.mock('@/lib/services/email-service', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  sendTemplateEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  sendInvoiceEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  sendNotificationEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
}));

// Mock EmailService class (from lib/email/service.ts)
vi.mock('@/lib/email/service', () => ({
  EmailService: {
    sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
    sendInvoiceEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
    sendNotificationEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
    sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
    sendMilestoneEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  },
  default: {
    sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
    sendInvoiceEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  },
}));

// Mock cache service
vi.mock('@/lib/cache', () => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
}));

// Mock search service
vi.mock('@/lib/search', () => ({
  search: vi.fn(),
  indexDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

// Mock security service
vi.mock('@/lib/security', () => ({
  encrypt: vi.fn(),
  decrypt: vi.fn(),
  hash: vi.fn(),
  verify: vi.fn(),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
}));

// Mock AI service
vi.mock('@/lib/ai', () => ({
  generateResponse: vi.fn(),
  analyzeText: vi.fn(),
  extractInsights: vi.fn(),
}));

// Mock hooks
vi.mock('@/lib/hooks', () => ({
  useDebounce: vi.fn((value) => value),
  useLocalStorage: vi.fn(() => [null, vi.fn()]),
  useSessionStorage: vi.fn(() => [null, vi.fn()]),
}));

// Global test utilities
// ResizeObserver must be a proper class constructor, not a function
// Mock ResizeObserver globally for all tests
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(_callback: ResizeObserverCallback) {
    // Constructor implementation
  }
} as any;

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock pointer capture APIs for Radix UI components
// These are required for proper event handling in jsdom test environment
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  writable: true,
  value: vi.fn().mockReturnValue(false),
});

Object.defineProperty(Element.prototype, 'setPointerCapture', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  writable: true,
  value: vi.fn(),
});

// Mock scrollIntoView for Radix UI Select and other components
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

// Mock scrollIntoView for Radix UI Select components
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

// Mock pointer events for better compatibility
if (typeof global.PointerEvent === 'undefined') {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, init?: PointerEventInit) {
      super(type, init);
      this.pointerId = init?.pointerId ?? 0;
      this.pressure = init?.pressure ?? 0;
      this.tangentialPressure = init?.tangentialPressure ?? 0;
      this.tiltX = init?.tiltX ?? 0;
      this.tiltY = init?.tiltY ?? 0;
      this.twist = init?.twist ?? 0;
      this.pointerType = init?.pointerType ?? 'mouse';
      this.isPrimary = init?.isPrimary ?? true;
    }
    pointerId: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    pointerType: string;
    isPrimary: boolean;
  } as any;
}

// Note: lucide-react mock is defined earlier in this file (line ~290)
// This ensures all icons including Wallet are properly mocked

// Mock OpenAI - both default export and named export
// Must be hoisted before any imports
vi.mock('openai', () => {
  class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock AI response',
              role: 'assistant',
            },
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        }),
      },
    };
    images = {
      generate: vi.fn().mockResolvedValue({
        data: [{
          url: 'https://example.com/image.png',
        }],
      }),
    };
    embeddings = {
      create: vi.fn().mockResolvedValue({
        data: [{
          embedding: Array(1536).fill(0.1),
        }],
      }),
    };
    constructor(_config?: any) {
      // Constructor can accept config but doesn't need to do anything
    }
  }
  
  return {
    default: MockOpenAI,
    OpenAI: MockOpenAI,
  };
});

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{
          text: 'Mock Claude response',
        }],
        usage: {
          input_tokens: 10,
          output_tokens: 20,
        },
      }),
    };
    constructor(_config?: any) {
      // Constructor can accept config but doesn't need to do anything
    }
  }
  
  return {
    default: MockAnthropic,
    Anthropic: MockAnthropic,
  };
});

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => {
  class MockGoogleGenerativeAI {
    getGenerativeModel = vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue('Mock Google AI response'),
        },
      }),
    });
    constructor(_apiKey?: string) {
      // Constructor can accept API key but doesn't need to do anything
    }
  }
  
  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI,
  };
});

// Mock react-grid-layout for dashboard-builder component
vi.mock('react-grid-layout', async () => {
  const React = await import('react')
  return {
    Responsive: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-grid' }, children),
    WidthProvider: (component: any) => component,
    Layout: {} as any,
    default: {
      Responsive: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-grid' }, children),
      WidthProvider: (component: any) => component,
    },
  }
})

vi.mock('react-grid-layout/css/styles.css', () => ({}))
vi.mock('react-resizable/css/styles.css', () => ({}))

// Mock Recharts - centralized mock for all component tests
vi.mock('recharts', () => {
  const createChartComponent = (testId: string) => {
    return ({ children, ...props }: any) => 
      React.createElement('div', { 
        'data-testid': testId,
        ...props 
      }, children);
  };

  const createChartElement = (testId: string) => {
    return (props: any) => 
      React.createElement('div', { 
        'data-testid': testId,
        ...props 
      });
  };

  return {
    ResponsiveContainer: ({ children, ...props }: any) => 
      React.createElement('div', { 
        'data-testid': 'responsive-container',
        ...props 
      }, children),
    LineChart: createChartComponent('line-chart'),
    AreaChart: createChartComponent('area-chart'),
    BarChart: createChartComponent('bar-chart'),
    PieChart: createChartComponent('pie-chart'),
    ComposedChart: createChartComponent('composed-chart'),
    Line: createChartElement('line'),
    Area: createChartElement('area'),
    Bar: createChartElement('bar'),
    Pie: createChartElement('pie'),
    Cell: createChartElement('cell'),
    CartesianGrid: createChartElement('cartesian-grid'),
    XAxis: createChartElement('x-axis'),
    YAxis: createChartElement('y-axis'),
    Tooltip: createChartElement('tooltip'),
    Legend: createChartElement('legend'),
    ReferenceLine: createChartElement('reference-line'),
    Brush: createChartElement('brush'),
    Scatter: createChartElement('scatter'),
    ScatterChart: createChartComponent('scatter-chart'),
    RadarChart: createChartComponent('radar-chart'),
    Radar: createChartElement('radar'),
    PolarGrid: createChartElement('polar-grid'),
    PolarAngleAxis: createChartElement('polar-angle-axis'),
    PolarRadiusAxis: createChartElement('polar-radius-axis'),
  };
});
