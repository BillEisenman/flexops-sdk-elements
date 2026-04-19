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
  carrier: 'usps',
  service: 'Priority Mail',
  labelUrl: 'https://api.test.com/labels/lbl_abc123.pdf',
  cost: 8.50,
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
    expect(screen.getByText('Create Label')).toBeInTheDocument();
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

    fireEvent.click(screen.getByText('Create Label'));

    await waitFor(() => {
      expect(screen.getByText(/Label Created/)).toBeInTheDocument();
      expect(screen.getByText('9400111899223456789012')).toBeInTheDocument();
      expect(screen.getByText(/USPS/)).toBeInTheDocument();
      expect(screen.getByText('$8.50')).toBeInTheDocument();
    });

    expect(onLabelCreated).toHaveBeenCalledWith(mockLabelResponse);
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

    fireEvent.click(screen.getByText('Create Label'));

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

    fireEvent.click(screen.getByText('Create Label'));

    await waitFor(() => { expect(screen.getByText(/Label Created/)).toBeInTheDocument(); });

    fireEvent.click(screen.getByText('Create Another'));

    expect(screen.getByText('Create Shipping Label')).toBeInTheDocument();
    expect(screen.getByText('Create Label')).toBeInTheDocument();
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

    fireEvent.click(screen.getByText('Create Label'));

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

    fireEvent.click(screen.getByText('Create Label'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/shipping/labels',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.from.postalCode).toBe('75201');
    expect(body.to.postalCode).toBe('90210');
    expect(body.weightOz).toBe(16);
  });

  it('hides carrier selection when showServiceSelection is false', () => {
    render(<ShippingLabel showServiceSelection={false} />, { wrapper });

    expect(screen.queryByText('Carrier (optional)')).not.toBeInTheDocument();
    expect(screen.queryByText('Service (optional)')).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByText('Create Label'));

    await waitFor(() => { expect(mockFetch).toHaveBeenCalled(); });
    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBe('fxk_test_key');
  });
});
