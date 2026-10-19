// Copyright (c) FlexOps, LLC. All rights reserved.

// Contract test: every API client function must call a documented public Gateway operation.
// Fixture tests/fixtures/gateway-operations.json is the "METHOD /path" list from the Developer Docs
// OpenAPI snapshot (Docs/FlexOpsDeveloperDocs/static/openapi/gateway.json); refresh it from that
// file when the Gateway's documented surface changes.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as client from '../src/api/client';

const operations: string[] = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'gateway-operations.json'), 'utf8'),
).operations;

/** Strips the query, maps a leading /api/v1 to /api and lower-cases, as ASP.NET routing does. */
function normalize(path: string): string {
  return path.split('?')[0].replace(/^\/api\/v1(?=\/|$)/i, '/api').replace(/\/+$/, '').toLowerCase();
}

const documented = operations.map((op) => {
  const [method, path] = op.split(' ');
  return { method: method.toUpperCase(), segments: normalize(path).split('/') };
});

function isDocumented(method: string, path: string): boolean {
  const segments = normalize(path).split('/');
  return documented.some((op) => op.method === method && op.segments.length === segments.length &&
    op.segments.every((s, i) => (s.startsWith('{') && s.endsWith('}') && segments[i].length > 0) || s === segments[i]));
}

const config = { baseUrl: 'https://gateway.contract.test', apiKey: 'fxk_contract' };
const address = { street1: '1 Main', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' };
const label = { from: address, to: { ...address, postalCode: '97201' }, weightOz: 8, maximumPostageAmount: 20, hazmatClassification: 0 as const };

/** One call per exported client function, with dummy arguments. */
const scenarios: Record<string, () => Promise<unknown>> = {
  fetchRates: () => client.fetchRates(config, { fromPostalCode: '78701', fromCountry: 'US', toPostalCode: '97201', toCountry: 'US', weightOz: 8 }),
  fetchDeliveryEstimate: () => client.fetchDeliveryEstimate(config, {
    originPostalCode: '78701', originCountry: 'US', destinationPostalCode: '97201', destinationCountry: 'US', weightOz: 8 }),
  validateAddress: () => client.validateAddress(config, address),
  createLabel: () => client.createLabel(config, label),
  fetchTracking: () => client.fetchTracking(config, 'contract-token'),
  classifyHsCode: () => client.classifyHsCode(config, { title: 'Cotton T-Shirt' }),
};

function reply(method: string, path: string): unknown {
  if (/public-estimate$/i.test(path)) return { rates: [], generatedAtUtc: '2026-10-19T00:00:00Z', disclaimer: '' };
  if (/addresses\/validate$/i.test(path)) return { isValid: true, warnings: [] };
  if (/shipping\/labels$/i.test(path) && method === 'POST') {
    return { labelId: 'lbl', trackingNumber: '9400', carrierCode: 'USPS', labelData: 'JVBERi0=', rate: 1, isSandbox: true };
  }
  if (/widget\/tracking\//i.test(path)) {
    return { trackingNumber: '9400', carrier: 'USPS', status: 'in_transit', statusMessage: '', estimatedDelivery: null, events: [], branding: null };
  }
  if (/hs-codes\/classify$/i.test(path)) return { productDescription: '', classifications: [], provider: 'flexops' };
  return {};
}

describe('Gateway contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exercises every exported client function', () => {
    const exported = Object.entries(client).filter(([, value]) => typeof value === 'function').map(([name]) => name);
    expect(Object.keys(scenarios).sort()).toEqual(exported.sort());
  });

  it('sends every call to a documented operation, and no write through ApiProxy', async () => {
    const calls: { fn: string; method: string; path: string }[] = [];
    let current = '';
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      const path = new URL(url).pathname;
      calls.push({ fn: current, method, path });
      return new Response(JSON.stringify(reply(method, path)), { status: 200, headers: { 'content-type': 'application/json' } });
    }));

    for (const [name, scenario] of Object.entries(scenarios)) {
      current = name;
      await scenario();
    }

    for (const name of Object.keys(scenarios)) {
      expect(calls.some((c) => c.fn === name), `${name} made no Gateway call`).toBe(true);
    }
    expect(calls.filter((c) => c.method !== 'GET' && /^\/api\/apiproxy(\/|$)/.test(normalize(c.path)))).toEqual([]);
    expect(calls.filter((c) => !isDocumented(c.method, c.path))).toEqual([]);
    expect(calls).toHaveLength(6);
  });
});
