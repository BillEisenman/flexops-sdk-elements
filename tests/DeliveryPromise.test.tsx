// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { DeliveryPromise } from '../src/widgets/DeliveryPromise/DeliveryPromise';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_key' }}>
    {children}
  </FlexOpsProvider>
);

const mockEstimateResponse = {
  estimates: [
    {
      carrierName: 'USPS',
      serviceName: 'Priority Mail',
      estimatedDeliveryDate: '2026-04-04',
      businessDaysInTransit: 2,
      confidencePercent: 97,
    },
    {
      carrierName: 'UPS',
      serviceName: 'Ground',
      estimatedDeliveryDate: '2026-04-07',
      businessDaysInTransit: 5,
      confidencePercent: 94,
    },
  ],
  generatedAtUtc: '2026-04-01T12:00:00Z',
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('DeliveryPromise', () => {
  it('renders ZIP input when no destination is provided', () => {
    render(<DeliveryPromise originPostalCode="10001" />, { wrapper });

    expect(screen.getByPlaceholderText('Enter ZIP code')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
    expect(screen.getByText('Delivery Estimate')).toBeInTheDocument();
  });

  it('does not show ZIP input when destinationPostalCode is provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" />,
      { wrapper },
    );

    expect(screen.queryByPlaceholderText('Enter ZIP code')).not.toBeInTheDocument();

    // Wait for the auto-fetch to settle so React state updates complete
    await waitFor(() => {
      expect(screen.getByTestId('delivery-date')).toBeInTheDocument();
    });
  });

  it('auto-fetches estimates when destination ZIP is provided via prop', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" />,
      { wrapper },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/shipping/delivery-estimate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            originPostalCode: '10001',
            originCountry: 'US',
            destinationPostalCode: '90210',
            destinationCountry: 'US',
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Get it by')).toBeInTheDocument();
    });
  });

  it('displays delivery date and carrier info for single result', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" maxResults={1} />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByTestId('delivery-date')).toBeInTheDocument();
      expect(screen.getByText(/via USPS Priority Mail/)).toBeInTheDocument();
    });
  });

  it('displays confidence percentage when available', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText('97% on-time')).toBeInTheDocument();
    });
  });

  it('hides carrier info when hideCarrier is true', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" hideCarrier />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByTestId('delivery-date')).toBeInTheDocument();
    });

    expect(screen.queryByText(/via USPS/)).not.toBeInTheDocument();
  });

  it('shows multiple results when maxResults > 1', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" maxResults={3} />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText(/via USPS Priority Mail/)).toBeInTheDocument();
      expect(screen.getByText(/via UPS Ground/)).toBeInTheDocument();
    });
  });

  it('fetches estimates on ZIP submit', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(<DeliveryPromise originPostalCode="10001" />, { wrapper });

    const input = screen.getByPlaceholderText('Enter ZIP code');
    fireEvent.change(input, { target: { value: '90210' } });
    fireEvent.click(screen.getByText('Check'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(screen.getByTestId('delivery-date')).toBeInTheDocument();
    });
  });

  it('fetches estimates on Enter key press', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(<DeliveryPromise originPostalCode="10001" />, { wrapper });

    const input = screen.getByPlaceholderText('Enter ZIP code');
    fireEvent.change(input, { target: { value: '60601' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('displays error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Service unavailable' }),
    });

    const onError = vi.fn();
    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" onError={onError} />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText('Service unavailable')).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalled();
  });

  it('calls onEstimateLoaded callback with estimates', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    const onEstimateLoaded = vi.fn();
    render(
      <DeliveryPromise
        originPostalCode="10001"
        destinationPostalCode="90210"
        onEstimateLoaded={onEstimateLoaded}
      />,
      { wrapper },
    );

    await waitFor(() => {
      expect(onEstimateLoaded).toHaveBeenCalledWith(mockEstimateResponse.estimates);
    });
  });

  it('renders inline layout without border and heading', () => {
    render(
      <DeliveryPromise originPostalCode="10001" layout="inline" />,
      { wrapper },
    );

    expect(screen.queryByText('Delivery Estimate')).not.toBeInTheDocument();
  });

  it('includes API key header in request', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" />,
      { wrapper },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['X-API-Key']).toBe('fxk_test_key');
  });

  it('shows empty state when no estimates returned', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ estimates: [], generatedAtUtc: '2026-04-01T12:00:00Z' }),
    });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="99999" />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText('No delivery estimates available for this destination.')).toBeInTheDocument();
    });
  });

  it('does not fetch when ZIP input is empty', async () => {
    render(<DeliveryPromise originPostalCode="10001" />, { wrapper });

    fireEvent.click(screen.getByText('Check'));

    await new Promise((r) => setTimeout(r, 100));
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
