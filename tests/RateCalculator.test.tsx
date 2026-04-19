// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { RateCalculator } from '../src/widgets/RateCalculator/RateCalculator';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com' }}>
    {children}
  </FlexOpsProvider>
);

const mockRatesResponse = {
  rates: [
    { carrierName: 'USPS', serviceName: 'Priority Mail', estimatedRate: 8.50, estimatedDeliveryDays: 2, carrierLogoUrl: null },
    { carrierName: 'UPS', serviceName: 'Ground', estimatedRate: 12.25, estimatedDeliveryDays: 5, carrierLogoUrl: null },
  ],
  generatedAtUtc: '2026-03-20T00:00:00Z',
  disclaimer: 'Estimates may vary',
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('RateCalculator', () => {
  it('renders form with ZIP and weight inputs', () => {
    render(<RateCalculator />, { wrapper });

    expect(screen.getByPlaceholderText('10001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('90210')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('16')).toBeInTheDocument();
    expect(screen.getByText('Get Shipping Rates')).toBeInTheDocument();
  });

  it('renders with pre-filled values', () => {
    render(
      <RateCalculator defaultFromPostalCode="10001" defaultToPostalCode="90210" defaultWeightOz={16} />,
      { wrapper },
    );

    expect(screen.getByDisplayValue('10001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('90210')).toBeInTheDocument();
    expect(screen.getByDisplayValue('16')).toBeInTheDocument();
  });

  it('does not call API when weight is missing', async () => {
    render(
      <RateCalculator defaultFromPostalCode="10001" defaultToPostalCode="90210" />,
      { wrapper },
    );

    // Weight is empty — form submit triggers browser validation, API should not be called
    fireEvent.click(screen.getByText('Get Shipping Rates'));

    // Give time for any async operations
    await new Promise((r) => setTimeout(r, 100));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches rates and displays results', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRatesResponse) });

    const onRatesFetched = vi.fn();
    render(
      <RateCalculator
        defaultFromPostalCode="10001"
        defaultToPostalCode="90210"
        defaultWeightOz={16}
        onRatesFetched={onRatesFetched}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Get Shipping Rates'));

    await waitFor(() => {
      expect(screen.getByText('Priority Mail')).toBeInTheDocument();
      expect(screen.getByText('$8.50')).toBeInTheDocument();
      expect(screen.getByText('Ground')).toBeInTheDocument();
      expect(screen.getByText('$12.25')).toBeInTheDocument();
    });

    expect(onRatesFetched).toHaveBeenCalledWith(mockRatesResponse.rates);
  });

  it('calls onRateSelected when a rate is clicked', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRatesResponse) });

    const onRateSelected = vi.fn();
    render(
      <RateCalculator
        defaultFromPostalCode="10001"
        defaultToPostalCode="90210"
        defaultWeightOz={16}
        onRateSelected={onRateSelected}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Get Shipping Rates'));

    await waitFor(() => {
      expect(screen.getByText('Priority Mail')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Priority Mail').closest('li')!);
    expect(onRateSelected).toHaveBeenCalledWith(mockRatesResponse.rates[0]);
  });

  it('displays error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false, status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const onError = vi.fn();
    render(
      <RateCalculator
        defaultFromPostalCode="10001"
        defaultToPostalCode="90210"
        defaultWeightOz={16}
        onError={onError}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Get Shipping Rates'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalled();
  });

  it('hides dimensions when showDimensions is false', () => {
    render(<RateCalculator showDimensions={false} />, { wrapper });

    expect(screen.queryByPlaceholderText('12')).not.toBeInTheDocument();
  });

  it('shows country fields when showCountry is true', () => {
    render(<RateCalculator showCountry />, { wrapper });

    const countryInputs = screen.getAllByPlaceholderText('US');
    expect(countryInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('limits results when maxResults is set', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRatesResponse) });

    render(
      <RateCalculator
        defaultFromPostalCode="10001"
        defaultToPostalCode="90210"
        defaultWeightOz={16}
        maxResults={1}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Get Shipping Rates'));

    await waitFor(() => {
      expect(screen.getByText('Priority Mail')).toBeInTheDocument();
      expect(screen.queryByText('Ground')).not.toBeInTheDocument();
    });
  });
});
