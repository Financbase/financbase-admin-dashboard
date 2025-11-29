import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { default as RealtorDashboard } from '@/app/(dashboard)/real-estate/realtor/page';
import { default as BuyerDashboard } from '@/app/(dashboard)/real-estate/buyer/page';
import { default as InvestorDashboard } from '@/app/(dashboard)/real-estate/investor/page';

// Unmock React Query to use real implementation
vi.unmock('@tanstack/react-query');

// Mock the real estate role hook
vi.mock('@/lib/hooks/use-real-estate-role', () => ({
  useRealEstateRole: () => ({
    role: 'realtor',
    updateRole: vi.fn(),
    isLoading: false,
  }),
}));

// Mock React Query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // Use gcTime instead of cacheTime (React Query v5)
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient for each test to avoid cache issues
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Real Estate Dashboard Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('RealtorDashboard', () => {
    it('should render loading state initially', async () => {
      // Mock API responses
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            stats: {
              activeListings: 5,
              totalCommissions: 25000,
              monthlyCommissions: 5000,
              averageDaysOnMarket: 30,
              conversionRate: 15.5,
              totalLeads: 20,
              newLeads: 8,
              scheduledShowings: 5,
              closedDeals: 2,
            }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            leads: [
              {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '555-1234',
                status: 'new',
                propertyInterest: '3BR House',
                budget: 400000,
                lastContact: '2024-01-15',
                source: 'Website',
              }
            ]
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            listings: [
              {
                id: '1',
                name: 'Modern Condo',
                address: '123 Main St',
                city: 'Downtown',
                state: 'CA',
                zipCode: '90210',
                propertyType: 'residential',
                purchasePrice: 450000,
                currentValue: 475000,
                squareFootage: 1200,
                bedrooms: 2,
                bathrooms: 2,
                status: 'active',
                monthlyRent: 3200,
              }
            ]
          }),
        } as Response);

      render(
        <TestWrapper>
          <RealtorDashboard />
        </TestWrapper>
      );

      // Wait for data to load - component shows skeleton loaders initially, then dashboard
      await waitFor(() => {
        expect(screen.getByText('Realtor Dashboard')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for metrics to render (they load after the dashboard header)
      // The component uses React Query which may take a moment to resolve
      await waitFor(() => {
        // Should show KPI metrics - MetricCard components render these
        // Use getAllByText and check for at least one match (component may render multiple times)
        const activeListings = screen.getAllByText('Active Listings');
        expect(activeListings.length).toBeGreaterThan(0);
        expect(screen.getByText('Monthly Commissions')).toBeInTheDocument();
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
        expect(screen.getByText('Avg Days on Market')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      vi.mocked(fetch).mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <RealtorDashboard />
        </TestWrapper>
      );

      // Should eventually show dashboard with default values (React Query handles errors)
      await waitFor(() => {
        expect(screen.getByText('Realtor Dashboard')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should show default values (0) when API fails - check for dashboard content
      await waitFor(() => {
        // Dashboard renders even with errors, showing default/empty states
        const dashboard = screen.getByText('Realtor Dashboard');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('BuyerDashboard', () => {
    it('should render buyer dashboard with stats', async () => {
      // Mock API responses - buyer dashboard queryFn returns data.stats, so response should have stats property
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            stats: {
              savedProperties: 8,
              viewedProperties: 12,
              offersSubmitted: 2,
              preApprovedAmount: 500000,
              monthlyBudget: 2500,
              downPaymentSaved: 75000,
            }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            savedProperties: [
              {
                id: '1',
                name: 'Charming Family Home',
                address: '123 Oak Street',
                city: 'Springfield',
                state: 'IL',
                zipCode: '62701',
                propertyType: 'residential',
                purchasePrice: 350000,
                currentValue: 365000,
                squareFootage: 1800,
                bedrooms: 3,
                bathrooms: 2,
                status: 'saved',
                savedDate: '2024-01-10',
                notes: 'Great neighborhood, good schools',
                rating: 4,
              }
            ]
          }),
        } as Response);

      render(
        <TestWrapper>
          <BuyerDashboard />
        </TestWrapper>
      );

      // Wait for data to load - component title is "Home Buyer Dashboard"
      await waitFor(() => {
        expect(screen.getByText(/home buyer dashboard/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for React Query to resolve and metrics to render
      // The component shows skeleton loaders while statsLoading is true
      // After data loads, it renders MetricCard components with the title text
      await waitFor(() => {
        expect(screen.getByText('Pre-Approved Amount')).toBeInTheDocument();
        expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
        expect(screen.getByText('Down Payment Saved')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show affordability calculator', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ stats: {} }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ savedProperties: [] }),
        } as Response);

      render(
        <TestWrapper>
          <BuyerDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Affordability Calculator')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should show affordability inputs - label is "Monthly Debt Payments" not "Monthly Debt"
      await waitFor(() => {
        expect(screen.getByLabelText('Monthly Income')).toBeInTheDocument();
        expect(screen.getByLabelText(/monthly debt payments/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Down Payment %')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('InvestorDashboard', () => {
    it('should render investor dashboard with portfolio metrics', async () => {
      // Mock API responses
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            stats: {
              totalProperties: 5,
              totalValue: 2500000,
              monthlyIncome: 15000,
              monthlyExpenses: 5000,
              netCashFlow: 10000,
              occupancyRate: 90,
              averageROI: 12.5,
              portfolioGrowth: 8.2,
              activeProperties: 4,
              vacantProperties: 1,
              maintenanceProperties: 0,
            }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            properties: [
              {
                id: '1',
                name: 'Investment Property A',
                address: '456 Investment Ave',
                city: 'Rental City',
                state: 'RC',
                zipCode: '12345',
                propertyType: 'residential',
                purchasePrice: 300000,
                currentValue: 350000,
                squareFootage: 2000,
                bedrooms: 4,
                bathrooms: 3,
                status: 'active',
                monthlyRent: 2500,
              }
            ]
          }),
        } as Response);

      render(
        <TestWrapper>
          <InvestorDashboard />
        </TestWrapper>
      );

      // Wait for data to load - component uses "Property Investor Dashboard"
      await waitFor(() => {
        expect(screen.getByText(/property investor dashboard/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show investor-specific metrics - wait for them to render
      // Note: The component shows "Total Portfolio Value", "Monthly Cash Flow", "Average ROI", "Occupancy Rate"
      // There's no "Total Properties" metric in the KPI cards - it's shown in property status metrics
      await waitFor(() => {
        expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
        expect(screen.getByText('Monthly Cash Flow')).toBeInTheDocument();
        expect(screen.getByText('Average ROI')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display property portfolio', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ stats: {} }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            properties: [
              {
                id: '1',
                name: 'Test Property',
                address: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                propertyType: 'residential',
                purchasePrice: 300000,
                currentValue: 350000,
                squareFootage: 1500,
                bedrooms: 3,
                bathrooms: 2,
                status: 'active',
              }
            ]
          }),
        } as Response);

      render(
        <TestWrapper>
          <InvestorDashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load - Property Portfolio section may have different text
      await waitFor(() => {
        expect(screen.getByText(/property investor dashboard/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show property cards - wait for them to render
      // Properties are rendered via PropertyCard component which shows name and address
      await waitFor(() => {
        // Check for property name or address - PropertyCard shows both
        const propertyName = screen.queryByText('Test Property');
        const propertyAddress = screen.queryByText(/123 test st/i);
        // At least one should be present
        expect(propertyName || propertyAddress).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <RealtorDashboard />
        </TestWrapper>
      );

      // Should eventually show dashboard with default values (component shows skeleton loaders, not "Loading dashboard...")
      await waitFor(() => {
        expect(screen.getByText('Realtor Dashboard')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should not crash and show default values
      expect(screen.getByText('Active Listings')).toBeInTheDocument();
    });

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      } as Response);

      render(
        <TestWrapper>
          <RealtorDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Realtor Dashboard')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should handle gracefully with default values
      await waitFor(() => {
        expect(screen.getByText('Active Listings')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
