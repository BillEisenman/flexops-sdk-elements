// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { ReturnPortal } from '../src/widgets/ReturnPortal/ReturnPortal';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_key' }}>
    {children}
  </FlexOpsProvider>
);

const mockEligibilityResponse = {
  eligible: true,
  orderNumber: 'ORD-12345',
  items: [
    { lineItemId: 'li-1', productName: 'Blue T-Shirt', sku: 'BTS-M', quantity: 2, maxReturnableQty: 2, imageUrl: 'https://img.test/shirt.jpg', price: 29.99 },
    { lineItemId: 'li-2', productName: 'Red Hat', sku: 'RH-OS', quantity: 1, maxReturnableQty: 1, imageUrl: null, price: 15.00 },
  ],
  returnWindowCloses: 'April 15, 2026',
  message: null,
};

const mockIneligibleResponse = {
  eligible: false,
  orderNumber: 'ORD-99999',
  items: [],
  returnWindowCloses: null,
  message: 'Return window has expired.',
};

const mockConfirmation = {
  rmaNumber: 'RMA-78901',
  returnLabelUrl: 'https://api.test.com/labels/rma-78901.pdf',
  qrCodeUrl: 'https://api.test.com/qr/rma-78901.png',
  instructions: 'Drop off at any USPS location within 14 days.',
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ReturnPortal', () => {
  it('renders order lookup form with inputs', () => {
    render(<ReturnPortal />, { wrapper });

    expect(screen.getByText('Start a Return')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ORD-12345')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com or 10001')).toBeInTheDocument();
    expect(screen.getByText('Find Order')).toBeInTheDocument();
  });

  it('renders with pre-filled order number', () => {
    render(<ReturnPortal defaultOrderNumber="ORD-55555" />, { wrapper });
    expect(screen.getByDisplayValue('ORD-55555')).toBeInTheDocument();
  });

  it('looks up order and shows eligible items', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEligibilityResponse) });

    render(<ReturnPortal />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-12345' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => {
      expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('Red Hat')).toBeInTheDocument();
      expect(screen.getByText(/April 15, 2026/)).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/returns/eligibility',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('shows error for ineligible orders', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockIneligibleResponse) });

    render(<ReturnPortal />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-99999' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: '10001' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => {
      expect(screen.getByText('Return window has expired.')).toBeInTheDocument();
    });
  });

  it('selects items and submits return', async () => {
    // First call: eligibility check. Second call: submit return.
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEligibilityResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockConfirmation) });

    const onReturnSubmitted = vi.fn();
    render(<ReturnPortal onReturnSubmitted={onReturnSubmitted} />, { wrapper });

    // Step 1: Lookup
    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-12345' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => {
      expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument();
    });

    // Step 2: Select first item
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Submit
    fireEvent.click(screen.getByText('Return 1 item'));

    await waitFor(() => {
      expect(screen.getByText(/Return Submitted/)).toBeInTheDocument();
      expect(screen.getByText(/RMA-78901/)).toBeInTheDocument();
    });

    expect(onReturnSubmitted).toHaveBeenCalledWith(mockConfirmation);
  });

  it('shows return label download link', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEligibilityResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockConfirmation) });

    render(<ReturnPortal />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-12345' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => { expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument(); });

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByText('Return 1 item'));

    await waitFor(() => {
      const link = screen.getByText('Download Return Label');
      expect(link).toHaveAttribute('href', 'https://api.test.com/labels/rma-78901.pdf');
    });
  });

  it('shows QR code when available', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEligibilityResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockConfirmation) });

    render(<ReturnPortal />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-12345' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => { expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument(); });

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByText('Return 1 item'));

    await waitFor(() => {
      expect(screen.getByAltText('QR Code for drop-off')).toHaveAttribute('src', 'https://api.test.com/qr/rma-78901.png');
    });
  });

  it('displays error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false, status: 500,
      json: () => Promise.resolve({ message: 'Order lookup failed' }),
    });

    const onError = vi.fn();
    render(<ReturnPortal onError={onError} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-12345' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => {
      expect(screen.getByText('Order lookup failed')).toBeInTheDocument();
    });
    expect(onError).toHaveBeenCalled();
  });

  it('uses custom return reasons', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEligibilityResponse) });

    render(
      <ReturnPortal returnReasons={['Broken', 'Wrong size', 'Changed mind']} />,
      { wrapper },
    );

    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-12345' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => { expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument(); });

    // Select item to show the reason dropdown
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    const options = screen.getAllByRole('option');
    const optionTexts = options.map((o) => o.textContent);
    expect(optionTexts).toContain('Broken');
    expect(optionTexts).toContain('Wrong size');
    expect(optionTexts).toContain('Changed mind');
  });

  it('shows error when submitting with no items selected', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEligibilityResponse) });

    render(<ReturnPortal />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText('ORD-12345'), { target: { value: 'ORD-12345' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com or 10001'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText('Find Order'));

    await waitFor(() => { expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument(); });

    // The submit button should be disabled when no items selected
    const submitBtn = screen.getByText('Return 0 items');
    expect(submitBtn).toBeDisabled();
  });
});
