/**
 * Integration Management Component Tests
 * Tests for integration management UI components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { IntegrationHub } from '@/components/integrations/integration-hub';

// Mock fetch
global.fetch = vi.fn();

describe('IntegrationHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render integration hub component', () => {
    render(<IntegrationHub />);
    expect(screen.getByText(/integration hub/i)).toBeInTheDocument();
  });

  it('should display tabs for different sections', () => {
    render(<IntegrationHub />);
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
    expect(screen.getByText(/marketplace/i)).toBeInTheDocument();
    expect(screen.getByText(/webhooks/i)).toBeInTheDocument();
    expect(screen.getByText(/developer/i)).toBeInTheDocument();
  });

  it('should render integration cards', () => {
    render(<IntegrationHub />);
    // IntegrationHub uses SAMPLE_INTEGRATIONS which should render cards
    expect(screen.getByText(/stripe/i)).toBeInTheDocument();
  });
});

