import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the database connection
vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => ({
    sql: vi.fn(),
  })),
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

describe('Real Estate API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/real-estate/stats', () => {
    it('should return property statistics', async () => {
      const { GET } = await import('@/app/api/real-estate/stats/route');
      
      const mockSql = vi.fn().mockResolvedValue([
        {
          total_properties: 5,
          total_value: 2500000,
          total_invested: 2000000,
          active_properties: 4,
          vacant_properties: 1,
          maintenance_properties: 0,
        }
      ]);

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const request = new NextRequest('http://localhost:3000/api/real-estate/stats');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual({
        totalProperties: 5,
        totalValue: 2500000,
        monthlyIncome: 0,
        occupancyRate: 0,
        averageROI: 0,
        portfolioGrowth: 0,
        activeProperties: 4,
        vacantProperties: 1,
        maintenanceProperties: 0,
        occupiedUnits: 0,
      });
    });

    it('should handle database errors gracefully', async () => {
      const { GET } = await import('@/app/api/real-estate/stats/route');
      
      const mockSql = vi.fn().mockRejectedValue(new Error('Database connection failed'));

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const request = new NextRequest('http://localhost:3000/api/real-estate/stats');
      const response = await GET();

      expect(response.status).toBe(500);
    });

    it('should return empty stats when no properties exist', async () => {
      const { GET } = await import('@/app/api/real-estate/stats/route');
      
      const mockSql = vi.fn().mockResolvedValue([]);

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const request = new NextRequest('http://localhost:3000/api/real-estate/stats');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual({
        totalProperties: 0,
        totalValue: 0,
        monthlyIncome: 0,
        occupancyRate: 0,
        averageROI: 0,
        portfolioGrowth: 0,
      });
    });
  });

  describe('GET /api/real-estate/properties', () => {
    it('should return properties with pagination', async () => {
      const { GET } = await import('@/app/api/real-estate/properties/route');
      
      const mockCountSql = vi.fn().mockResolvedValue([{ total: 10 }]);
      const mockPropertiesSql = vi.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Test Property',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip_code: '12345',
          property_type: 'residential',
          purchase_price: 300000,
          current_value: 350000,
          square_footage: 1500,
          bedrooms: 3,
          bathrooms: 2,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      ]);

      const mockSql = vi.fn()
        .mockImplementationOnce(() => mockCountSql())
        .mockImplementationOnce(() => mockPropertiesSql());

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const request = new NextRequest('http://localhost:3000/api/real-estate/properties?limit=10&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.properties).toHaveLength(1);
      expect(data.total).toBe(10);
      expect(data.limit).toBe(10);
      expect(data.offset).toBe(0);
      expect(data.hasMore).toBe(false);
    });

    it('should handle invalid pagination parameters', async () => {
      const { GET } = await import('@/app/api/real-estate/properties/route');
      
      const mockSql = vi.fn().mockResolvedValue([]);

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const request = new NextRequest('http://localhost:3000/api/real-estate/properties?limit=invalid&offset=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(50); // Default limit
      expect(data.offset).toBe(0); // Default offset
    });
  });

  describe('GET /api/real-estate/realtor/stats', () => {
    it('should return realtor statistics', async () => {
      const { GET } = await import('@/app/api/real-estate/realtor/stats/route');
      
      const mockSql = vi.fn().mockResolvedValue([
        {
          active_listings: 3,
          total_commissions: 15000,
          monthly_commissions: 5000,
          avg_days_on_market: 30,
          conversion_rate: 20.5,
          new_leads: 5,
          scheduled_showings: 2,
          closed_deals: 1,
        }
      ]);

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual({
        activeListings: 3,
        totalCommissions: 15000,
        monthlyCommissions: 5000,
        averageDaysOnMarket: 30,
        conversionRate: 20.5,
        totalLeads: 8, // new_leads + scheduled_showings + closed_deals
        newLeads: 5,
        scheduledShowings: 2,
        closedDeals: 1,
      });
    });
  });

  describe('GET /api/real-estate/realtor/leads', () => {
    it('should return leads with pagination', async () => {
      const { GET } = await import('@/app/api/real-estate/realtor/leads/route');
      
      const mockCountSql = vi.fn().mockResolvedValue([{ total: 5 }]);
      const mockLeadsSql = vi.fn().mockResolvedValue([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          status: 'new',
          property_interest: '3BR House',
          budget: 400000,
          last_contact: '2024-01-15',
          source: 'Website',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        }
      ]);

      const mockSql = vi.fn()
        .mockImplementationOnce(() => mockCountSql())
        .mockImplementationOnce(() => mockLeadsSql());

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const request = new NextRequest('http://localhost:3000/api/real-estate/realtor/leads');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.leads).toHaveLength(1);
      expect(data.total).toBe(5);
      expect(data.leads[0]).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        status: 'new',
        propertyInterest: '3BR House',
        budget: 400000,
        lastContact: '2024-01-15',
        source: 'Website',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      });
    });
  });

  describe('POST /api/real-estate/realtor/leads', () => {
    it('should create a new lead', async () => {
      const { POST } = await import('@/app/api/real-estate/realtor/leads/route');
      
      const mockSql = vi.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-5678',
          status: 'new',
          property_interest: '2BR Condo',
          budget: 300000,
          last_contact: '2024-01-16',
          source: 'Referral',
          created_at: '2024-01-16T00:00:00Z',
          updated_at: '2024-01-16T00:00:00Z',
        }
      ]);

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const requestBody = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        propertyInterest: '2BR Condo',
        budget: 300000,
        source: 'Referral',
      };

      const request = new NextRequest('http://localhost:3000/api/real-estate/realtor/leads', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.lead).toEqual({
        id: 1,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        status: 'new',
        propertyInterest: '2BR Condo',
        budget: 300000,
        lastContact: '2024-01-16',
        source: 'Referral',
        createdAt: '2024-01-16T00:00:00Z',
        updatedAt: '2024-01-16T00:00:00Z',
      });
    });

    it('should handle invalid request body', async () => {
      const { POST } = await import('@/app/api/real-estate/realtor/leads/route');
      
      const request = new NextRequest('http://localhost:3000/api/real-estate/realtor/leads', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/real-estate/buyer/stats', () => {
    it('should return buyer statistics', async () => {
      const { GET } = await import('@/app/api/real-estate/buyer/stats/route');
      
      const mockSql = vi.fn().mockResolvedValue([
        {
          saved_properties: 8,
          viewed_properties: 12,
          offers_submitted: 2,
          pre_approved_amount: 500000,
          monthly_budget: 2500,
          down_payment_saved: 75000,
        }
      ]);

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual({
        savedProperties: 8,
        viewedProperties: 12,
        offersSubmitted: 2,
        preApprovedAmount: 500000,
        monthlyBudget: 2500,
        downPaymentSaved: 75000,
      });
    });
  });

  describe('GET /api/real-estate/buyer/saved-properties', () => {
    it('should return saved properties', async () => {
      const { GET } = await import('@/app/api/real-estate/buyer/saved-properties/route');
      
      const mockSql = vi.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Charming Family Home',
          address: '123 Oak Street',
          city: 'Springfield',
          state: 'IL',
          zip_code: '62701',
          property_type: 'residential',
          purchase_price: 350000,
          current_value: 365000,
          square_footage: 1800,
          bedrooms: 3,
          bathrooms: 2,
          status: 'saved',
          saved_date: '2024-01-10',
          notes: 'Great neighborhood, good schools',
          rating: 4,
        }
      ]);

      vi.mocked(await import('@neondatabase/serverless')).neon.mockReturnValue({
        sql: mockSql,
      });

      const request = new NextRequest('http://localhost:3000/api/real-estate/buyer/saved-properties');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.savedProperties).toHaveLength(1);
      expect(data.savedProperties[0]).toEqual({
        id: 1,
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
      });
    });
  });
});
