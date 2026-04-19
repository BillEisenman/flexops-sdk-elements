// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { TrackingWidget } from '../src/widgets/TrackingWidget/TrackingWidget';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com' }}>
    {children}
  </FlexOpsProvider>
);

const mockTrackingResponse = {
  trackingNumber: '9400111899223456789012',
  carrier: 'USPS',
  status: 'in_transit',
  statusMessage: 'In Transit to Destination',
  estimatedDelivery: 'March 22, 2026',
  events: [
    { timestamp: '2026-03-20T14:30:00Z', description: 'Departed USPS Facility', location: 'New York, NY', statusCode: 'in_transit' },
    { timestamp: '2026-03-20T08:00:00Z', description: 'Accepted at USPS Origin Facility', location: 'New York, NY', statusCode: 'accepted' },
  ],
  branding: {
    companyName: 'Acme Shipping',
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#ff6600',
    secondaryColor: '#333333',
    supportEmail: 'support@acme.com',
  },
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('TrackingWidget', () => {
  it('renders search input by default', () => {
    render(<TrackingWidget />, { wrapper });

    expect(screen.getByPlaceholderText('Enter tracking token')).toBeInTheDocument();
    expect(screen.getByText('Track')).toBeInTheDocument();
  });

  it('hides search input when showSearchInput is false', () => {
    render(<TrackingWidget showSearchInput={false} />, { wrapper });

    expect(screen.queryByPlaceholderText('Enter tracking token')).not.toBeInTheDocument();
  });

  it('loads tracking data when token prop is provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTrackingResponse) });

    render(<TrackingWidget token="abc123" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('in transit')).toBeInTheDocument();
      expect(screen.getByText('9400111899223456789012')).toBeInTheDocument();
      expect(screen.getByText('USPS')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/widget/tracking/abc123',
      expect.any(Object),
    );
  });

  it('displays branding header with logo and company name', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTrackingResponse) });

    render(<TrackingWidget token="abc123" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Acme Shipping')).toBeInTheDocument();
      expect(screen.getByAltText('Acme Shipping')).toHaveAttribute('src', 'https://example.com/logo.png');
    });
  });

  it('hides branding when showBranding is false', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTrackingResponse) });

    render(<TrackingWidget token="abc123" showBranding={false} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('9400111899223456789012')).toBeInTheDocument();
    });

    expect(screen.queryByText('Acme Shipping')).not.toBeInTheDocument();
    expect(screen.queryByText('support@acme.com')).not.toBeInTheDocument();
  });

  it('renders tracking timeline events', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTrackingResponse) });

    render(<TrackingWidget token="abc123" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Departed USPS Facility')).toBeInTheDocument();
      expect(screen.getByText('Accepted at USPS Origin Facility')).toBeInTheDocument();
      expect(screen.getAllByText(/New York, NY/)).toHaveLength(2);
    });
  });

  it('displays support email footer', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTrackingResponse) });

    render(<TrackingWidget token="abc123" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('support@acme.com')).toBeInTheDocument();
      expect(screen.getByText('support@acme.com').closest('a')).toHaveAttribute('href', 'mailto:support@acme.com');
    });
  });

  it('loads tracking on search submit', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTrackingResponse) });

    render(<TrackingWidget />, { wrapper });

    const input = screen.getByPlaceholderText('Enter tracking token');
    fireEvent.change(input, { target: { value: 'xyz789' } });
    fireEvent.click(screen.getByText('Track'));

    await waitFor(() => {
      expect(screen.getByText('9400111899223456789012')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/widget/tracking/xyz789',
      expect.any(Object),
    );
  });

  it('displays error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false, status: 404,
      json: () => Promise.resolve({ message: 'Tracking link not found' }),
    });

    const onError = vi.fn();
    render(<TrackingWidget token="bad-token" onError={onError} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Tracking link not found')).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalled();
  });

  it('calls onTrackingLoaded callback', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTrackingResponse) });

    const onTrackingLoaded = vi.fn();
    render(<TrackingWidget token="abc123" onTrackingLoaded={onTrackingLoaded} />, { wrapper });

    await waitFor(() => {
      expect(onTrackingLoaded).toHaveBeenCalledWith(mockTrackingResponse);
    });
  });
});
