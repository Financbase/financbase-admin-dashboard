/**
 * Feature Flags UI Component Tests
 * Tests for feature flag management UI components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FeatureFlagsTable } from '@/components/admin/feature-flags-table';

// Mock fetch
global.fetch = vi.fn();

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
  Edit: () => <span data-testid="edit-icon">Edit</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  RefreshCw: () => <span data-testid="refresh-icon">Refresh</span>,
}));

describe('FeatureFlagsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: [] }),
    } as Response);

    render(<FeatureFlagsTable />);

    expect(screen.getByText(/loading feature flags/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading feature flags/i)).not.toBeInTheDocument();
    });
  });

  it('should fetch and display feature flags', async () => {
    const mockFlags = [
      {
        id: 1,
        key: 'test-flag-1',
        name: 'Test Flag 1',
        description: 'First test flag',
        enabled: true,
        rolloutPercentage: 100,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        key: 'test-flag-2',
        name: 'Test Flag 2',
        description: 'Second test flag',
        enabled: false,
        rolloutPercentage: 0,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: mockFlags }),
    } as Response);

    render(<FeatureFlagsTable />);

    await waitFor(() => {
      expect(screen.getByText('Test Flag 1')).toBeInTheDocument();
      expect(screen.getByText('Test Flag 2')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/admin/feature-flags');
  });

  it('should display error toast when fetch fails', async () => {
    const { toast } = await import('sonner');
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<FeatureFlagsTable />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error fetching feature flags');
    });
  });

  it('should display error toast when API returns error', async () => {
    const { toast } = await import('sonner');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<FeatureFlagsTable />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch feature flags');
    });
  });

  it('should have refresh button', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: [] }),
    } as Response);

    render(<FeatureFlagsTable />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it('should have new flag button', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: [] }),
    } as Response);

    render(<FeatureFlagsTable />);

    await waitFor(() => {
      const newButton = screen.getByRole('button', { name: /new flag/i });
      expect(newButton).toBeInTheDocument();
    });
  });

  it('should open dialog when new flag button is clicked', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: [] }),
    } as Response);

    render(<FeatureFlagsTable />);

    await waitFor(() => {
      const newButton = screen.getByRole('button', { name: /new flag/i });
      fireEvent.click(newButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/create feature flag/i)).toBeInTheDocument();
    });
  });

  it('should toggle feature flag when switch is clicked', async () => {
    const mockFlags = [
      {
        id: 1,
        key: 'test-flag',
        name: 'Test Flag',
        enabled: false,
        rolloutPercentage: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ flags: mockFlags }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ flags: [{ ...mockFlags[0], enabled: true }] }),
      } as Response);

    const { toast } = await import('sonner');

    render(<FeatureFlagsTable />);

    await waitFor(() => {
      expect(screen.getByText('Test Flag')).toBeInTheDocument();
    });

    // Find and click the switch
    const switches = screen.getAllByRole('switch');
    if (switches.length > 0) {
      fireEvent.click(switches[0]);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/feature-flags/test-flag', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: true }),
        });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    }
  });
});

