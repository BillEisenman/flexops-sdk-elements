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

// Gateway PublicRatesController (api/rates/public-estimate) response; out of transit order on purpose.
const mockEstimateResponse = {
  rates: [
    { carrierName: 'UPS', serviceName: 'Ground', estimatedRate: 10.74, estimatedDeliveryDays: 5, carrierLogoUrl: null },
    { carrierName: 'USPS', serviceName: 'Priority Mail', estimatedRate: 8.66, estimatedDeliveryDays: 2, carrierLogoUrl: null },
  ],
  generatedAtUtc: '2026-04-01T12:00:00Z',
  disclaimer: 'Rates are estimates.',
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
        'https://api.test.com/api/rates/public-estimate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            fromPostalCode: '10001',
            fromCountry: 'US',
            toPostalCode: '90210',
            toCountry: 'US',
            weightOz: 16,
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

  it('sends the configured package weight', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" weightOz={8} />,
      { wrapper },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body).weightOz).toBe(8);
  });

  it('refuses a non-positive weight without calling the Gateway', async () => {
    const onError = vi.fn();
    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" weightOz={0} onError={onError} />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText('DeliveryPromise needs a package weight above 0 oz.')).toBeInTheDocument();
    });
    expect(onError).toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows no on-time confidence, which the Gateway does not provide', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEstimateResponse) });

    render(
      <DeliveryPromise originPostalCode="10001" destinationPostalCode="90210" />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByTestId('delivery-date')).toBeInTheDocument();
    });
    expect(screen.queryByText(/on-time/)).not.toBeInTheDocument();
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
      expect(onEstimateLoaded).toHaveBeenCalled();
    });
    const estimates = onEstimateLoaded.mock.calls[0][0];
    expect(estimates.map((e: { carrierName: string; businessDaysInTransit: number; confidencePercent: number | null }) =>
      [e.carrierName, e.businessDaysInTransit, e.confidencePercent])).toEqual([['USPS', 2, null], ['UPS', 5, null]]);
    for (const e of estimates) expect(e.estimatedDeliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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
      json: () => Promise.resolve({ rates: [], generatedAtUtc: '2026-04-01T12:00:00Z', disclaimer: '' }),
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
