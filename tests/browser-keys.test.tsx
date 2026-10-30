// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { fetchRates, fetchTracking, validateAddress } from '../src/api/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const RATE_REQUEST = { fromPostalCode: '10001', fromCountry: 'US', toPostalCode: '90210', toCountry: 'US', weightOz: 16 };
const ADDRESS = { street1: '1 Main St', city: 'Dallas', state: 'TX', postalCode: '75201', country: 'US' };
const SERVER_ONLY_KEYS = ['live_abc123', 'sk_abc123', 'pk_abc123', 'fxp_abc123', 'unknown_abc123'];

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ rates: [], generatedAtUtc: '', disclaimer: '' }) });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('API keys in the browser', () => {
  it.each(SERVER_ONLY_KEYS)('FlexOpsProvider refuses %s', (apiKey) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(
      <FlexOpsProvider config={{ baseUrl: '/api/flexops', apiKey }}><span /></FlexOpsProvider>,
    )).toThrow(/test_/);
  });

  it.each(SERVER_ONLY_KEYS)('the API client refuses %s before any request', async (apiKey) => {
    await expect(validateAddress({ baseUrl: 'https://gateway.flexops.io', apiKey }, ADDRESS)).rejects.toThrow(/test_/);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not repeat the key in the error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    let message = '';
    try {
      render(<FlexOpsProvider config={{ baseUrl: '/api/flexops', apiKey: 'live_abc123' }}><span /></FlexOpsProvider>);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).not.toBe('');
    expect(message).not.toContain('abc123');
  });

  it('allows a test_ key', () => {
    expect(() => render(
      <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io', apiKey: 'test_abc123' }}><span /></FlexOpsProvider>,
    )).not.toThrow();
  });

  it('allows any key outside a browser', async () => {
    vi.stubGlobal('window', undefined);

    await validateAddress({ baseUrl: 'https://gateway.flexops.io', apiKey: 'live_abc123' }, ADDRESS).catch(() => {});

    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBe('live_abc123');
  });
});

describe('anonymous routes', () => {
  it('fetchRates never sends a key, which their CORS policy would refuse', async () => {
    await fetchRates({ baseUrl: 'https://gateway.flexops.io', apiKey: 'test_abc123' }, RATE_REQUEST);

    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBeUndefined();
  });

  it('fetchTracking never sends a key', async () => {
    await fetchTracking({ baseUrl: 'https://gateway.flexops.io', apiKey: 'test_abc123' }, 'token').catch(() => {});

    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBeUndefined();
  });
});

describe('merchant server route', () => {
  it('calls the relative baseUrl with no key, so the server can add it', async () => {
    await validateAddress({ baseUrl: '/api/flexops' }, ADDRESS).catch(() => {});

    expect(mockFetch.mock.calls[0][0]).toBe('/api/flexops/api/addresses/validate');
    expect(mockFetch.mock.calls[0][1].headers['X-API-Key']).toBeUndefined();
  });
});
