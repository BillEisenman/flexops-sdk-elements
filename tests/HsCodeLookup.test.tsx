// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { HsCodeLookup } from '../src/widgets/HsCodeLookup/HsCodeLookup';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_key' }}>
    {children}
  </FlexOpsProvider>
);

const mockClassifyResponse = {
  productDescription: 'Cotton T-Shirt',
  classifications: [
    {
      hsCode: '6109.10',
      description: 'T-shirts, singlets and other vests, knitted or crocheted, of cotton',
      chapter: '61',
      chapterDescription: 'Articles of apparel and clothing accessories, knitted or crocheted',
      confidencePercent: 92,
      dutyRatePercent: 16.5,
    },
    {
      hsCode: '6109.90',
      description: 'T-shirts, singlets and other vests, of other textile materials',
      chapter: '61',
      chapterDescription: 'Articles of apparel and clothing accessories, knitted or crocheted',
      confidencePercent: 65,
      dutyRatePercent: 32,
    },
    {
      hsCode: '6110.20',
      description: 'Jerseys, pullovers, cardigans and similar articles, of cotton',
      chapter: '61',
      chapterDescription: 'Articles of apparel and clothing accessories, knitted or crocheted',
      confidencePercent: 35,
      dutyRatePercent: null,
    },
  ],
  provider: 'flexops',
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('HsCodeLookup', () => {
  it('renders form with product title input', () => {
    render(<HsCodeLookup />, { wrapper });

    expect(screen.getByPlaceholderText('e.g. Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Product Title')).toBeInTheDocument();
    expect(screen.getByText('Classify Product')).toBeInTheDocument();
  });

  it('renders with pre-filled title and description', () => {
    render(
      <HsCodeLookup defaultTitle="Silk Scarf" defaultDescription="Luxury silk scarf" />,
      { wrapper },
    );

    expect(screen.getByDisplayValue('Silk Scarf')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Luxury silk scarf')).toBeInTheDocument();
  });

  it('classifies product and shows results with confidence', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClassifyResponse) });

    render(
      <HsCodeLookup defaultTitle="Cotton T-Shirt" />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => {
      expect(screen.getByText('6109.10')).toBeInTheDocument();
      expect(screen.getByText('6109.90')).toBeInTheDocument();
      expect(screen.getByText('92% confidence')).toBeInTheDocument();
      expect(screen.getByText('65% confidence')).toBeInTheDocument();
    });
  });

  it('calls onCodeSelected when a result is clicked', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClassifyResponse) });

    const onCodeSelected = vi.fn();
    render(
      <HsCodeLookup defaultTitle="Cotton T-Shirt" onCodeSelected={onCodeSelected} />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => {
      expect(screen.getByText('6109.10')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('6109.10'));

    expect(onCodeSelected).toHaveBeenCalledWith(mockClassifyResponse.classifications[0]);
  });

  it('shows confidence bar with correct fill', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClassifyResponse) });

    render(
      <HsCodeLookup defaultTitle="Cotton T-Shirt" />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => {
      // jsdom converts hex colors to rgb
      const fill0 = screen.getByTestId('confidence-fill-0');
      expect(fill0.style.width).toBe('92%');
      expect(fill0.style.backgroundColor).toBe('rgb(22, 163, 74)');

      const fill1 = screen.getByTestId('confidence-fill-1');
      expect(fill1.style.width).toBe('65%');
      expect(fill1.style.backgroundColor).toBe('rgb(217, 119, 6)');

      const fill2 = screen.getByTestId('confidence-fill-2');
      expect(fill2.style.width).toBe('35%');
      expect(fill2.style.backgroundColor).toBe('rgb(220, 38, 38)');
    });
  });

  it('displays duty rate when available', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClassifyResponse) });

    render(
      <HsCodeLookup defaultTitle="Cotton T-Shirt" />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => {
      expect(screen.getByText('Duty: 16.5%')).toBeInTheDocument();
      expect(screen.getByText('Duty: 32%')).toBeInTheDocument();
    });
  });

  it('hides material field when showMaterialField is false', () => {
    render(<HsCodeLookup showMaterialField={false} />, { wrapper });

    expect(screen.queryByPlaceholderText('e.g. 100% Cotton')).not.toBeInTheDocument();
  });

  it('hides category field when showCategoryField is false', () => {
    render(<HsCodeLookup showCategoryField={false} />, { wrapper });

    expect(screen.queryByPlaceholderText('e.g. Apparel')).not.toBeInTheDocument();
  });

  it('displays error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false, status: 500,
      json: () => Promise.resolve({ message: 'Classification service unavailable' }),
    });

    const onError = vi.fn();
    render(
      <HsCodeLookup defaultTitle="Test Product" onError={onError} />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => {
      expect(screen.getByText('Classification service unavailable')).toBeInTheDocument();
    });
    expect(onError).toHaveBeenCalled();
  });

  it('calls onClassified callback with classifications', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClassifyResponse) });

    const onClassified = vi.fn();
    render(
      <HsCodeLookup defaultTitle="Cotton T-Shirt" onClassified={onClassified} />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => {
      expect(onClassified).toHaveBeenCalledWith(mockClassifyResponse.classifications);
    });
  });

  it('limits results to maxResults', async () => {
    const limitedResponse = {
      ...mockClassifyResponse,
      classifications: mockClassifyResponse.classifications.slice(0, 1),
    };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(limitedResponse) });

    render(
      <HsCodeLookup defaultTitle="Cotton T-Shirt" maxResults={1} />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => {
      expect(screen.getByText('6109.10')).toBeInTheDocument();
    });

    // Verify the request body included maxResults
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.maxResults).toBe(1);
  });

  it('sends correct request payload with all fields', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClassifyResponse) });

    render(
      <HsCodeLookup
        defaultTitle="Cotton T-Shirt"
        defaultDescription="100% cotton crew neck"
        defaultCategory="Apparel"
        destinationCountry="GB"
        maxResults={5}
      />,
      { wrapper },
    );

    // Fill in the material field
    fireEvent.change(screen.getByPlaceholderText('e.g. 100% Cotton'), { target: { value: 'Cotton' } });

    fireEvent.click(screen.getByText('Classify Product'));

    await waitFor(() => { expect(mockFetch).toHaveBeenCalled(); });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/shipping/hs-codes/classify',
      expect.objectContaining({ method: 'POST' }),
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.title).toBe('Cotton T-Shirt');
    expect(body.description).toBe('100% cotton crew neck');
    expect(body.category).toBe('Apparel');
    expect(body.material).toBe('Cotton');
    expect(body.destinationCountry).toBe('GB');
    expect(body.maxResults).toBe(5);
  });
});
