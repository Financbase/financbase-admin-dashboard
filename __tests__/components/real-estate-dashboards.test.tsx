import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealtorDashboard } from '@/app/real-estate/realtor/page';
import { BuyerDashboard } from '@/app/real-estate/buyer/page';
import { InvestorDashboard } from '@/app/real-estate/investor/page';

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
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
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

      // Should show loading initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Realtor Dashboard')).toBeInTheDocument();
      });

      // Should show KPI metrics
      expect(screen.getByText('Active Listings')).toBeInTheDocument();
      expect(screen.getByText('Monthly Commissions')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Days on Market')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      vi.mocked(fetch).mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <RealtorDashboard />
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // Should eventually show dashboard with default values
      await waitFor(() => {
        expect(screen.getByText('Realtor Dashboard')).toBeInTheDocument();
      });

      // Should show default values (0) when API fails
      expect(screen.getByText('0')).toBeInTheDocument(); // Default active listings
    });
  });

  describe('BuyerDashboard', () => {
    it('should render buyer dashboard with stats', async () => {
      // Mock API responses
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

      // Should show loading initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Buyer Dashboard')).toBeInTheDocument();
      });

      // Should show buyer-specific metrics
      expect(screen.getByText('Pre-Approved Amount')).toBeInTheDocument();
      expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
      expect(screen.getByText('Down Payment Saved')).toBeInTheDocument();
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
      });

      // Should show affordability inputs
      expect(screen.getByLabelText('Monthly Income')).toBeInTheDocument();
      expect(screen.getByLabelText('Monthly Debt')).toBeInTheDocument();
      expect(screen.getByLabelText('Down Payment %')).toBeInTheDocument();
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

      // Should show loading initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Investor Dashboard')).toBeInTheDocument();
      });

      // Should show investor-specific metrics
      expect(screen.getByText('Total Properties')).toBeInTheDocument();
      expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText('Monthly Cash Flow')).toBeInTheDocument();
      expect(screen.getByText('Average ROI')).toBeInTheDocument();
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

      await waitFor(() => {
        expect(screen.getByText('Property Portfolio')).toBeInTheDocument();
      });

      // Should show property cards
      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('123 Test St')).toBeInTheDocument();
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

      // Should show loading initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // Should eventually show dashboard with default values
      await waitFor(() => {
        expect(screen.getByText('Realtor Dashboard')).toBeInTheDocument();
      });

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
      });

      // Should handle gracefully with default values
      expect(screen.getByText('Active Listings')).toBeInTheDocument();
    });
  });
});
