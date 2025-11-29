/**
 * Integration Management Component Tests
 * Tests for integration management UI components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { IntegrationHub } from '@/components/integrations/integration-hub';

// Mock fetch
global.fetch = vi.fn();

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({ src, alt, ...props }: any) => {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={src} alt={alt} {...props} />;
	},
}));

// Mock child components that might have dependencies
vi.mock('@/components/marketplace/marketplace-system', () => ({
	MarketplaceSystem: () => <div data-testid="marketplace-system">Marketplace</div>,
}));

vi.mock('@/components/integrations/webhook-management', () => ({
	WebhookManagement: () => <div data-testid="webhook-management">Webhooks</div>,
}));

vi.mock('@/components/integrations/developer-portal', () => ({
	DeveloperPortal: () => <div data-testid="developer-portal">Developer Portal</div>,
}));

describe('IntegrationHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render integration hub component', async () => {
    render(<IntegrationHub />);
    await waitFor(() => {
      expect(screen.getByText(/integration hub/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display tabs for different sections', async () => {
    render(<IntegrationHub />);
    await waitFor(() => {
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
      // Use getAllByText since "marketplace" appears multiple times
      const marketplaceElements = screen.getAllByText(/marketplace/i);
      expect(marketplaceElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/webhooks/i)).toBeInTheDocument();
      expect(screen.getByText(/developer/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render integration cards', async () => {
    render(<IntegrationHub />);
    await waitFor(() => {
      // IntegrationHub uses SAMPLE_INTEGRATIONS which should render cards
      // Use getAllByText since "Stripe" appears multiple times
      const stripeElements = screen.getAllByText(/stripe/i);
      expect(stripeElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});

