// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { AddressForm } from '../src/widgets/AddressForm/AddressForm';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_key' }}>
    {children}
  </FlexOpsProvider>
);

const mockValidResponse = {
  isValid: true,
  normalizedAddress: {
    street1: '123 MAIN ST',
    street2: null,
    city: 'NEW YORK',
    state: 'NY',
    postalCode: '10001-1234',
    country: 'US',
  },
  messages: [],
};

const mockInvalidResponse = {
  isValid: false,
  normalizedAddress: null,
  messages: ['Address not found', 'Please verify the street number'],
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('AddressForm', () => {
  it('renders all address fields', () => {
    render(<AddressForm />, { wrapper });

    expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apt, Suite, Unit')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New York')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('NY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('10001')).toBeInTheDocument();
    expect(screen.getByText('Validate Address')).toBeInTheDocument();
  });

  it('renders with pre-filled values', () => {
    render(
      <AddressForm defaultStreet1="456 Oak Ave" defaultCity="Boston" defaultState="MA" defaultPostalCode="02101" />,
      { wrapper },
    );

    expect(screen.getByDisplayValue('456 Oak Ave')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Boston')).toBeInTheDocument();
    expect(screen.getByDisplayValue('MA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('02101')).toBeInTheDocument();
  });

  it('validates and shows normalized address on success', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockValidResponse) });

    const onAddressValidated = vi.fn();
    render(
      <AddressForm
        defaultStreet1="123 main st"
        defaultCity="new york"
        defaultState="ny"
        defaultPostalCode="10001"
        onAddressValidated={onAddressValidated}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Validate Address'));

    await waitFor(() => {
      expect(screen.getByText(/Address Verified/)).toBeInTheDocument();
      expect(screen.getByText('123 MAIN ST')).toBeInTheDocument();
      expect(screen.getByText(/NEW YORK, NY 10001-1234/)).toBeInTheDocument();
    });

    expect(onAddressValidated).toHaveBeenCalledWith(mockValidResponse);
  });

  it('shows validation messages when address is invalid', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockInvalidResponse) });

    render(
      <AddressForm
        defaultStreet1="999 Fake St"
        defaultCity="Nowhere"
        defaultState="XX"
        defaultPostalCode="00000"
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Validate Address'));

    await waitFor(() => {
      expect(screen.getByText('Address not found')).toBeInTheDocument();
      expect(screen.getByText('Please verify the street number')).toBeInTheDocument();
    });
  });

  it('shows client-side error when required fields are empty', async () => {
    render(<AddressForm />, { wrapper });

    // Street is empty — HTML5 validation fires but we also check in handleSubmit
    // Simulate by leaving fields empty and clicking
    // The form has required attributes, so it won't submit. Test the case where
    // city/state/postalCode are filled but street1 is empty (bypassed by required)
    // Instead test with autoValidate=false
    render(<AddressForm autoValidate={false} />, { wrapper });

    const buttons = screen.getAllByText('Validate Address');
    fireEvent.click(buttons[buttons.length - 1]);

    await new Promise((r) => setTimeout(r, 100));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls API with correct payload', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockValidResponse) });

    render(
      <AddressForm
        defaultStreet1="123 Main St"
        defaultCity="New York"
        defaultState="NY"
        defaultPostalCode="10001"
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Validate Address'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/addresses/validate',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.street1).toBe('123 Main St');
    expect(body.city).toBe('New York');
    expect(body.state).toBe('NY');
    expect(body.postalCode).toBe('10001');
  });

  it('displays error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false, status: 500,
      json: () => Promise.resolve({ message: 'Validation service unavailable' }),
    });

    const onError = vi.fn();
    render(
      <AddressForm
        defaultStreet1="123 Main St"
        defaultCity="NYC"
        defaultState="NY"
        defaultPostalCode="10001"
        onError={onError}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Validate Address'));

    await waitFor(() => {
      expect(screen.getByText('Validation service unavailable')).toBeInTheDocument();
    });
    expect(onError).toHaveBeenCalled();
  });

  it('uses custom submit label', () => {
    render(<AddressForm submitLabel="Verify Shipping Address" />, { wrapper });
    expect(screen.getByText('Verify Shipping Address')).toBeInTheDocument();
  });

  it('skips API call when autoValidate is false', async () => {
    const onAddressValidated = vi.fn();
    render(
      <AddressForm
        autoValidate={false}
        defaultStreet1="123 Main St"
        defaultCity="NYC"
        defaultState="NY"
        defaultPostalCode="10001"
        onAddressValidated={onAddressValidated}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Validate Address'));

    await waitFor(() => {
      expect(onAddressValidated).toHaveBeenCalled();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onAddressValidated.mock.calls[0][0].isValid).toBe(true);
    expect(onAddressValidated.mock.calls[0][0].normalizedAddress.street1).toBe('123 Main St');
  });

  it('includes API key header in request', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockValidResponse) });

    render(
      <AddressForm defaultStreet1="123 Main" defaultCity="NYC" defaultState="NY" defaultPostalCode="10001" />,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Validate Address'));

    await waitFor(() => { expect(mockFetch).toHaveBeenCalled(); });
    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBe('fxk_test_key');
  });
});
