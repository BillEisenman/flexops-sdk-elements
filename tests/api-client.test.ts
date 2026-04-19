// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRates, fetchDeliveryEstimate, validateAddress, checkReturnEligibility, submitReturn, createLabel, fetchTracking, classifyHsCode } from '../src/api/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('fetchRates', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends POST to public-estimate endpoint with correct body', async () => {
    const mockResponse = {
      rates: [{ carrierName: 'USPS', serviceName: 'Priority', estimatedRate: 8.50, estimatedDeliveryDays: 2, carrierLogoUrl: null }],
      generatedAtUtc: '2026-03-20T00:00:00Z',
      disclaimer: 'Estimates only',
    };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await fetchRates(config, {
      fromPostalCode: '10001',
      fromCountry: 'US',
      toPostalCode: '90210',
      toCountry: 'US',
      weightOz: 16,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/rates/public-estimate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
    expect(result.rates).toHaveLength(1);
    expect(result.rates[0].carrierName).toBe('USPS');
  });

  it('includes API key header when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ rates: [], generatedAtUtc: '', disclaimer: '' }) });

    await fetchRates({ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_123' }, {
      fromPostalCode: '10001', fromCountry: 'US', toPostalCode: '90210', toCountry: 'US', weightOz: 16,
    });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['X-API-Key']).toBe('fxk_test_123');
  });

  it('strips trailing slash from baseUrl', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ rates: [], generatedAtUtc: '', disclaimer: '' }) });

    await fetchRates({ baseUrl: 'https://api.test.com/' }, {
      fromPostalCode: '10001', fromCountry: 'US', toPostalCode: '90210', toCountry: 'US', weightOz: 16,
    });

    expect(mockFetch.mock.calls[0][0]).toBe('https://api.test.com/api/rates/public-estimate');
  });

  it('throws on non-OK response with message from body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ message: 'Invalid postal code' }),
    });

    await expect(fetchRates(config, {
      fromPostalCode: 'invalid', fromCountry: 'US', toPostalCode: '90210', toCountry: 'US', weightOz: 16,
    })).rejects.toEqual(expect.objectContaining({ message: 'Invalid postal code', status: 422 }));
  });

  it('throws with generic message when body parsing fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(fetchRates(config, {
      fromPostalCode: '10001', fromCountry: 'US', toPostalCode: '90210', toCountry: 'US', weightOz: 16,
    })).rejects.toEqual(expect.objectContaining({ message: 'Request failed with status 500', status: 500 }));
  });
});

describe('fetchDeliveryEstimate', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends POST to delivery-estimate endpoint with correct body', async () => {
    const mockResponse = {
      estimates: [{
        carrierName: 'USPS', serviceName: 'Priority Mail',
        estimatedDeliveryDate: '2026-04-04', businessDaysInTransit: 2, confidencePercent: 97,
      }],
      generatedAtUtc: '2026-04-01T12:00:00Z',
    };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await fetchDeliveryEstimate(config, {
      originPostalCode: '10001', originCountry: 'US',
      destinationPostalCode: '90210', destinationCountry: 'US',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/shipping/delivery-estimate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
    expect(result.estimates).toHaveLength(1);
    expect(result.estimates[0].carrierName).toBe('USPS');
  });

  it('includes API key header when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ estimates: [], generatedAtUtc: '' }) });

    await fetchDeliveryEstimate({ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_456' }, {
      originPostalCode: '10001', originCountry: 'US',
      destinationPostalCode: '90210', destinationCountry: 'US',
    });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['X-API-Key']).toBe('fxk_test_456');
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({
      ok: false, status: 422,
      json: () => Promise.resolve({ message: 'Invalid postal code format' }),
    });

    await expect(fetchDeliveryEstimate(config, {
      originPostalCode: 'bad', originCountry: 'US',
      destinationPostalCode: '90210', destinationCountry: 'US',
    })).rejects.toEqual(expect.objectContaining({ message: 'Invalid postal code format', status: 422 }));
  });
});

describe('validateAddress', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends POST to addresses/validate endpoint', async () => {
    const mockResponse = { isValid: true, normalizedAddress: { street1: '123 MAIN ST', street2: null, city: 'NYC', state: 'NY', postalCode: '10001', country: 'US' }, messages: [] };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await validateAddress(config, { street1: '123 main st', city: 'nyc', state: 'ny', postalCode: '10001', country: 'US' });

    expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/addresses/validate', expect.objectContaining({ method: 'POST' }));
    expect(result.isValid).toBe(true);
  });
});

describe('checkReturnEligibility', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends POST to returns/eligibility endpoint', async () => {
    const mockResponse = { eligible: true, orderNumber: 'ORD-123', items: [], returnWindowCloses: null, message: null };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await checkReturnEligibility(config, { orderNumber: 'ORD-123', emailOrZip: 'test@test.com' });

    expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/returns/eligibility', expect.objectContaining({ method: 'POST' }));
    expect(result.eligible).toBe(true);
  });
});

describe('submitReturn', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends POST to returns/submit endpoint', async () => {
    const mockResponse = { rmaNumber: 'RMA-456', returnLabelUrl: null, qrCodeUrl: null, instructions: 'Ship it back' };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await submitReturn(config, { orderNumber: 'ORD-123', emailOrZip: 'test@test.com', items: [{ lineItemId: 'li-1', quantity: 1, reason: 'Damaged' }] });

    expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/returns/submit', expect.objectContaining({ method: 'POST' }));
    expect(result.rmaNumber).toBe('RMA-456');
  });
});

describe('createLabel', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends POST to shipping/labels endpoint', async () => {
    const mockResponse = { labelId: 'lbl_1', trackingNumber: '1Z999', carrier: 'ups', service: 'Ground', labelUrl: 'https://test/lbl.pdf', cost: 12.50 };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await createLabel(config, {
      from: { street1: '123 WH', city: 'Dallas', state: 'TX', postalCode: '75201', country: 'US' },
      to: { street1: '456 Main', city: 'LA', state: 'CA', postalCode: '90210', country: 'US' },
      weightOz: 16,
    });

    expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/shipping/labels', expect.objectContaining({ method: 'POST' }));
    expect(result.trackingNumber).toBe('1Z999');
    expect(result.cost).toBe(12.50);
  });

  it('includes API key header when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ labelId: 'x', trackingNumber: 'x', carrier: 'x', service: 'x', labelUrl: 'x', cost: 0 }) });

    await createLabel({ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_789' }, {
      from: { street1: 'a', city: 'b', state: 'c', postalCode: 'd', country: 'US' },
      to: { street1: 'e', city: 'f', state: 'g', postalCode: 'h', country: 'US' },
      weightOz: 1,
    });

    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBe('fxk_test_789');
  });
});

describe('fetchTracking', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends GET to widget tracking endpoint with encoded token', async () => {
    const mockResponse = {
      trackingNumber: '9400111899223456789012',
      carrier: 'USPS',
      status: 'in_transit',
      statusMessage: 'In Transit to Destination',
      estimatedDelivery: '2026-03-22',
      events: [],
      branding: null,
    };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await fetchTracking(config, 'abc123');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/widget/tracking/abc123',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.trackingNumber).toBe('9400111899223456789012');
    expect(result.carrier).toBe('USPS');
  });

  it('encodes special characters in token', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ trackingNumber: '', carrier: '', status: '', statusMessage: '', estimatedDelivery: null, events: [], branding: null }) });

    await fetchTracking(config, 'abc/123+456');

    expect(mockFetch.mock.calls[0][0]).toBe('https://api.test.com/api/widget/tracking/abc%2F123%2B456');
  });

  it('throws on 404 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Tracking link not found' }),
    });

    await expect(fetchTracking(config, 'nonexistent')).rejects.toEqual(
      expect.objectContaining({ message: 'Tracking link not found', status: 404 }),
    );
  });
});

describe('classifyHsCode', () => {
  const config = { baseUrl: 'https://api.test.com' };

  it('sends POST to hs-codes/classify endpoint with correct body', async () => {
    const mockResponse = {
      productDescription: 'Cotton T-Shirt',
      classifications: [{
        hsCode: '6109.10', description: 'T-shirts of cotton', chapter: '61',
        chapterDescription: 'Articles of apparel, knitted', confidencePercent: 92, dutyRatePercent: 16.5,
      }],
      provider: 'flexops',
    };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

    const result = await classifyHsCode(config, { title: 'Cotton T-Shirt', description: 'Crew neck tee', maxResults: 3 });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/api/shipping/hs-codes/classify',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.title).toBe('Cotton T-Shirt');
    expect(body.description).toBe('Crew neck tee');
    expect(result.classifications).toHaveLength(1);
    expect(result.classifications[0].hsCode).toBe('6109.10');
  });

  it('includes API key header when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ productDescription: '', classifications: [], provider: '' }) });

    await classifyHsCode({ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_hs' }, { title: 'Widget' });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['X-API-Key']).toBe('fxk_test_hs');
  });
});
