/**
 * Test Setup Configuration
 * Global test setup for Vitest
 */

import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import dotenv from 'dotenv';

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
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: async () => Promise.resolve(data),
      status: init?.status || 200,
    })),
    redirect: vi.fn(),
    next: vi.fn(),
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
  Webhook: vi.fn().mockImplementation(() => ({
    verify: (...args: any[]) => mockSvixVerify(...args),
  })),
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
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  QueryClient: vi.fn().mockImplementation(() => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock database for unit tests, but allow real database for integration tests
// vi.mock('@/lib/db', () => ({
//   db: {
//     insert: vi.fn(),
//     select: vi.fn(),
//     update: vi.fn(),
//     delete: vi.fn(),
//     query: {
//       clients: {
//         findFirst: vi.fn(),
//         findMany: vi.fn(),
//       },
//       leads: {
//         findFirst: vi.fn(),
//         findMany: vi.fn(),
//       },
//       transactions: {
//         findFirst: vi.fn(),
//         findMany: vi.fn(),
//       },
//     },
//   },
// }));

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
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'loader' }, 'Loading...'),
  TrendingUp: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'trending-up' }, '↑'),
  TrendingDown: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'trending-down' }, '↓'),
  DollarSign: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'dollar-sign' }, '$'),
  ShoppingCart: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'shopping-cart' }, '🛒'),
  Users: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'users' }, '👥'),
  Package: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'package' }, '📦'),
  Activity: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'activity' }, '📊'),
  Star: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'star' }, '⭐'),
  BarChart3: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'bar-chart' }, '📈'),
  Briefcase: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'briefcase' }, '💼'),
  CheckCircle: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'check-circle' }, '✅'),
  Eye: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'eye' }, '👁️'),
  MoreHorizontal: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'more-horizontal' }, '⋯'),
  XCircle: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'x-circle' }, '❌'),
  Key: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'key' }, '🔑'),
  LayoutDashboard: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'layout-dashboard' }, '🏠'),
  Minus: ({ className }: { className?: string }) => React.createElement('div', { className, 'data-testid': 'minus' }, '-'),
}));
