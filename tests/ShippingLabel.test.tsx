// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { ShippingLabel } from '../src/widgets/ShippingLabel/ShippingLabel';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_key' }}>
    {children}
  </FlexOpsProvider>
);

const mockLabelResponse = {
  labelId: 'lbl_abc123',
  trackingNumber: '9400111899223456789012',
  carrierCode: 'usps',
  serviceCode: 'Priority Mail',
  labelData: 'https://api.test.com/labels/lbl_abc123.pdf',
  isSandbox: true,
  rate: 8.50,
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ShippingLabel', () => {
  it('renders from and to address sections', () => {
    render(<ShippingLabel />, { wrapper });

    expect(screen.getByText('Create Shipping Label')).toBeInTheDocument();
    expect(screen.getByText('From (Sender)')).toBeInTheDocument();
    expect(screen.getByText('To (Recipient)')).toBeInTheDocument();
    expect(screen.getByText('Package')).toBeInTheDocument();
    expect(screen.getByText('Preview Postage')).toBeInTheDocument();
  });

  it('pre-fills sender address from defaultFrom prop', () => {
    render(
      <ShippingLabel defaultFrom={{ street1: '123 Warehouse Ln', city: 'Dallas', state: 'TX', postalCode: '75201' }} />,
      { wrapper },
    );

    expect(screen.getByDisplayValue('123 Warehouse Ln')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dallas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TX')).toBeInTheDocument();
    expect(screen.getByDisplayValue('75201')).toBeInTheDocument();
  });

  it('locks sender fields when lockFrom is true', () => {
    render(
      <ShippingLabel
        defaultFrom={{ street1: '123 Warehouse Ln', city: 'Dallas', state: 'TX', postalCode: '75201' }}
        lockFrom
      />,
      { wrapper },
    );

    const warehouseInput = screen.getByDisplayValue('123 Warehouse Ln');
    expect(warehouseInput).toHaveAttribute('readonly');
  });

  it('creates label and shows confirmation', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockLabelResponse) });

    const onLabelCreated = vi.fn();
    render(
      <ShippingLabel
        defaultFrom={{ street1: '123 Warehouse', city: 'Dallas', state: 'TX', postalCode: '75201' }}
        onLabelCreated={onLabelCreated}
      />,
      { wrapper },
    );

    // Fill recipient
    fireEvent.change(screen.getByPlaceholderText('456 Customer Ave'), { target: { value: '789 Buyer Rd' } });
    fireEvent.change(screen.getByPlaceholderText('Los Angeles'), { target: { value: 'LA' } });
    fireEvent.change(screen.getByPlaceholderText('CA'), { target: { value: 'CA' } });
    fireEvent.change(screen.getByPlaceholderText('90210'), { target: { value: '90210' } });
    fireEvent.change(screen.getByPlaceholderText('16'), { target: { value: '16' } });

    fireEvent.change(screen.getByLabelText('Maximum postage (USD)'), { target: { value: '10.00' } });
    fireEvent.click(screen.getByText('Preview Postage'));

    await waitFor(() => {
      expect(screen.getByText(/Label Created/)).toBeInTheDocument();
      expect(screen.getByText('9400111899223456789012')).toBeInTheDocument();
      expect(screen.getByText(/USPS/)).toBeInTheDocument();
      expect(screen.getByText('$8.50')).toBeInTheDocument();
    });

    expect(onLabelCreated).toHaveBeenCalledWith(expect.objectContaining({ trackingNumber: mockLabelResponse.trackingNumber, carrier: 'usps', cost: 8.5 }));
  });

  it('shows download label link', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockLabelResponse) });

    render(
      <ShippingLabel defaultFrom={{ street1: '123 WH', city: 'Dallas', state: 'TX', postalCode: '75201' }} />,
      { wrapper },
    );

    fireEvent.change(screen.getByPlaceholderText('456 Customer Ave'), { target: { value: '789 Main' } });
    fireEvent.change(screen.getByPlaceholderText('Los Angeles'), { target: { value: 'LA' } });
    fireEvent.change(screen.getByPlaceholderText('CA'), { target: { value: 'CA' } });
    fireEvent.change(screen.getByPlaceholderText('90210'), { target: { value: '90210' } });
    fireEvent.change(screen.getByPlaceholderText('16'), { target: { value: '8' } });

    fireEvent.change(screen.getByLabelText('Maximum postage (USD)'), { target: { value: '10.00' } });
    fireEvent.click(screen.getByText('Preview Postage'));

    await waitFor(() => {
      const link = screen.getByText('Download Label');
      expect(link).toHaveAttribute('href', 'https://api.test.com/labels/lbl_abc123.pdf');
    });
  });

  it('allows creating another label after success', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockLabelResponse) });

    render(
      <ShippingLabel defaultFrom={{ street1: '123 WH', city: 'Dallas', state: 'TX', postalCode: '75201' }} />,
      { wrapper },
    );

    fireEvent.change(screen.getByPlaceholderText('456 Customer Ave'), { target: { value: '789 Main' } });
    fireEvent.change(screen.getByPlaceholderText('Los Angeles'), { target: { value: 'LA' } });
    fireEvent.change(screen.getByPlaceholderText('CA'), { target: { value: 'CA' } });
    fireEvent.change(screen.getByPlaceholderText('90210'), { target: { value: '90210' } });
    fireEvent.change(screen.getByPlaceholderText('16'), { target: { value: '8' } });

    fireEvent.change(screen.getByLabelText('Maximum postage (USD)'), { target: { value: '10.00' } });
    fireEvent.click(screen.getByText('Preview Postage'));

    await waitFor(() => { expect(screen.getByText(/Label Created/)).toBeInTheDocument(); });

    fireEvent.click(screen.getByText('Create Another'));

    expect(screen.getByText('Create Shipping Label')).toBeInTheDocument();
    expect(screen.getByText('Preview Postage')).toBeInTheDocument();
  });

  it('displays error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false, status: 422,
      json: () => Promise.resolve({ message: 'Invalid recipient address' }),
    });

    const onError = vi.fn();
    render(
      <ShippingLabel
        defaultFrom={{ street1: '123 WH', city: 'Dallas', state: 'TX', postalCode: '75201' }}
        onError={onError}
      />,
      { wrapper },
    );

    fireEvent.change(screen.getByPlaceholderText('456 Customer Ave'), { target: { value: '789 Main' } });
    fireEvent.change(screen.getByPlaceholderText('Los Angeles'), { target: { value: 'LA' } });
    fireEvent.change(screen.getByPlaceholderText('CA'), { target: { value: 'CA' } });
    fireEvent.change(screen.getByPlaceholderText('90210'), { target: { value: '90210' } });
    fireEvent.change(screen.getByPlaceholderText('16'), { target: { value: '8' } });

    fireEvent.change(screen.getByLabelText('Maximum postage (USD)'), { target: { value: '10.00' } });
    fireEvent.click(screen.getByText('Preview Postage'));

    await waitFor(() => {
      expect(screen.getByText('Invalid recipient address')).toBeInTheDocument();
    });
    expect(onError).toHaveBeenCalled();
  });

  it('calls correct API endpoint with payload', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockLabelResponse) });

    render(
      <ShippingLabel defaultFrom={{ street1: '123 WH', city: 'Dallas', state: 'TX', postalCode: '75201' }} />,
      { wrapper },
    );

    fireEvent.change(screen.getByPlaceholderText('456 Customer Ave'), { target: { value: '789 Buyer' } });
    fireEvent.change(screen.getByPlaceholderText('Los Angeles'), { target: { value: 'LA' } });
    fireEvent.change(screen.getByPlaceholderText('CA'), { target: { value: 'CA' } });
    fireEvent.change(screen.getByPlaceholderText('90210'), { target: { value: '90210' } });
    fireEvent.change(screen.getByPlaceholderText('16'), { target: { value: '16' } });

    fireEvent.change(screen.getByLabelText('Maximum postage (USD)'), { target: { value: '10.00' } });
    fireEvent.click(screen.getByText('Preview Postage'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/shipping/labels',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.origin.postalCode).toBe('75201');
    expect(body.destination.postalCode).toBe('90210');
    expect(body.package.weight).toBe(16);
  });

  it('hides carrier selection when showServiceSelection is false', () => {
    render(<ShippingLabel showServiceSelection={false} />, { wrapper });

    expect(screen.queryByText('Carrier')).not.toBeInTheDocument();
    expect(screen.queryByText('Service')).not.toBeInTheDocument();
  });

  it('includes API key header', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockLabelResponse) });

    render(
      <ShippingLabel defaultFrom={{ street1: '123 WH', city: 'Dallas', state: 'TX', postalCode: '75201' }} />,
      { wrapper },
    );

    fireEvent.change(screen.getByPlaceholderText('456 Customer Ave'), { target: { value: '789 Main' } });
    fireEvent.change(screen.getByPlaceholderText('Los Angeles'), { target: { value: 'LA' } });
    fireEvent.change(screen.getByPlaceholderText('CA'), { target: { value: 'CA' } });
    fireEvent.change(screen.getByPlaceholderText('90210'), { target: { value: '90210' } });
    fireEvent.change(screen.getByPlaceholderText('16'), { target: { value: '8' } });

    fireEvent.change(screen.getByLabelText('Maximum postage (USD)'), { target: { value: '10.00' } });
    fireEvent.click(screen.getByText('Preview Postage'));

    await waitFor(() => { expect(mockFetch).toHaveBeenCalled(); });
    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBe('fxk_test_key');
  });
});

const preview = { status: 'Preview', quotedPostageAmount: 8.5, maximumPostageAmount: 10,
  currency: 'USD', expiresAt: '2099-01-01T00:00:00Z', confirmationToken: 'signed-preview' };
function fillPurchase() {
  render(<ShippingLabel defaultFrom={{ street1: '123 WH', city: 'Dallas', state: 'TX', postalCode: '75201' }} />, { wrapper });
  for (const [placeholder, value] of [['456 Customer Ave', '789 Main'], ['Los Angeles', 'LA'], ['CA', 'CA'], ['90210', '90210'], ['16', '8']])
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
  fireEvent.change(screen.getByLabelText('Maximum postage (USD)'), { target: { value: '10.00' } });
  fireEvent.click(screen.getByText('Preview Postage'));
}
it('cancels a preview without dispatching a purchase', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => preview });
  fillPurchase();
  await screen.findByText('Approve and Buy');
  expect(mockFetch).toHaveBeenCalledTimes(1);
  const body = JSON.parse(mockFetch.mock.calls[0][1].body);
  expect(body.origin.addressLine1).toBe('123 WH');
  expect(body.package.weightUnit).toBe('oz');
  expect(body.confirmationToken).toBeUndefined();
  fireEvent.click(screen.getByText('Cancel'));
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Preview Postage')).toBeEnabled();
});
it('requires approval and retries the exact purchase after response loss', async () => {
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => preview })
    .mockRejectedValueOnce(new Error('Response lost'))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockLabelResponse, isSandbox: false }) });
  fillPurchase();
  fireEvent.click(await screen.findByText('Approve and Buy'));
  await screen.findByRole('alert');
  expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Retry Same Purchase'));
  await screen.findByText('Label Created', { exact: false });
  expect(mockFetch).toHaveBeenCalledTimes(3);
  expect(mockFetch.mock.calls[1][1].body).toBe(mockFetch.mock.calls[2][1].body);
  expect(mockFetch.mock.calls[0][1].headers['Idempotency-Key']).toBe(mockFetch.mock.calls[2][1].headers['Idempotency-Key']);
  expect(JSON.parse(mockFetch.mock.calls[1][1].body).confirmationToken).toBe('signed-preview');
});
