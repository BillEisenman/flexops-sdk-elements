// Copyright (c) FlexOps, LLC. All rights reserved.

import type {
  PublicRateEstimateRequest,
  PublicRateEstimateResponse,
  DeliveryEstimateRequest,
  DeliveryTransitEstimate,
  AddressValidationRequest,
  AddressValidationResult,
  CreateLabelRequest,
  LabelResponse,
  LabelPurchasePreview,
  WidgetTrackingResponse,
  HsCodeClassifyRequest,
  HsCodeClassifyResponse,
} from './types';
import { FlexOpsApiError } from './types';
import { assertApiKeyAllowedHere } from './keys';

interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
}

/** Headers for the anonymous routes, whose CORS policy refuses X-API-Key. */
function publicHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

function buildHeaders(config: ClientConfig): Record<string, string> {
  assertApiKeyAllowedHere(config.apiKey);
  const headers = publicHeaders();
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
  }
  return headers;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Parses a Gateway response. A 2xx with no body (204, or Content-Length 0) yields undefined.
 * A failure throws a FlexOpsApiError carrying the status and the error envelope's `message`,
 * `errorCode` and `data`.
 */
async function handleResponse<T>(response: Response): Promise<T | undefined> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let errorCode: string | undefined;
    let data: unknown;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === 'object') {
        const envelope = body as { message?: unknown; errorCode?: unknown; data?: unknown };
        if (typeof envelope.message === 'string' && envelope.message) message = envelope.message;
        if (typeof envelope.errorCode === 'string' && envelope.errorCode) errorCode = envelope.errorCode;
        if (envelope.data !== null) data = envelope.data;
      }
    } catch {
      // Not JSON: use the default message
    }
    throw new FlexOpsApiError(message, response.status, errorCode, data);
  }
  if (response.status === 204 || response.headers?.get('content-length') === '0') return undefined;
  return response.json() as Promise<T>;
}

/** Like handleResponse, for calls whose widget needs a body: an empty success is an error. */
async function handleBody<T>(response: Response): Promise<T> {
  const body = await handleResponse<T>(response);
  if (body === undefined) throw new FlexOpsApiError('Gateway returned no content.', response.status);
  return body;
}

/** Fetch shipping rate estimates from the public rates endpoint. */
export async function fetchRates(
  config: ClientConfig,
  request: PublicRateEstimateRequest,
  signal?: AbortSignal,
): Promise<PublicRateEstimateResponse> {
  const base = stripTrailingSlash(config.baseUrl);
  const response = await fetch(`${base}/api/rates/public-estimate`, {
    method: 'POST',
    headers: publicHeaders(),
    body: JSON.stringify(request),
    signal,
  });
  return handleBody<PublicRateEstimateResponse>(response);
}

/**
 * Fetch transit times for a destination, fastest first. The Gateway has no delivery-estimate
 * endpoint, so this reads `estimatedDeliveryDays` from the anonymous public rate estimate
 * (`api/rates/public-estimate`) and drops services that carry no transit time.
 */
export async function fetchDeliveryEstimate(
  config: ClientConfig,
  request: DeliveryEstimateRequest,
  signal?: AbortSignal,
): Promise<{ estimates: DeliveryTransitEstimate[]; generatedAtUtc: string }> {
  const result = await fetchRates(config, {
    fromPostalCode: request.originPostalCode,
    fromCountry: request.originCountry,
    toPostalCode: request.destinationPostalCode,
    toCountry: request.destinationCountry,
    weightOz: request.weightOz,
  }, signal);
  const estimates = (result.rates ?? [])
    .filter((rate) => Number.isInteger(rate.estimatedDeliveryDays) && (rate.estimatedDeliveryDays as number) >= 0)
    .map((rate) => ({ carrierName: rate.carrierName, serviceName: rate.serviceName,
      businessDaysInTransit: rate.estimatedDeliveryDays as number }))
    .sort((a, b) => a.businessDaysInTransit - b.businessDaysInTransit);
  return { estimates, generatedAtUtc: result.generatedAtUtc };
}

/**
 * Validate and normalize a shipping address. Calls the Gateway AddressValidationController
 * (`api/addresses/validate`), whose request uses `line1`/`line2` and whose result carries
 * `suggestedAddress` and `warnings`; both are mapped to the widget types here.
 */
export async function validateAddress(
  config: ClientConfig,
  request: AddressValidationRequest,
  signal?: AbortSignal,
): Promise<AddressValidationResult> {
  const base = stripTrailingSlash(config.baseUrl);
  const response = await fetch(`${base}/api/addresses/validate`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify({
      line1: request.street1, line2: request.street2, city: request.city,
      state: request.state, postalCode: request.postalCode, country: request.country,
    }),
    signal,
  });
  const result = await handleBody<GatewayAddressValidationResult>(response);
  const suggested = result.suggestedAddress;
  const normalizedAddress = suggested
    ? { street1: suggested.line1, street2: suggested.line2 ?? null, city: suggested.city,
        state: suggested.state, postalCode: suggested.postalCode, country: suggested.country }
    : result.isValid
      ? { street1: request.street1, street2: request.street2 ?? null, city: request.city,
          state: request.state, postalCode: request.postalCode, country: request.country }
      : null;
  const warnings = result.warnings ?? [];
  return {
    isValid: result.isValid,
    normalizedAddress,
    messages: result.validationUnavailable && warnings.length === 0
      ? ['Address validation is unavailable right now. Try again later.'] : warnings,
    ...(result.validationUnavailable !== undefined ? { validationUnavailable: result.validationUnavailable } : {}),
    ...(result.isResidential !== undefined ? { isResidential: result.isResidential } : {}),
  };
}

/** The Gateway AddressValidationDTOs.AddressValidationResult wire shape. */
interface GatewayAddressValidationResult {
  isValid: boolean;
  validationUnavailable?: boolean;
  isResidential?: boolean | null;
  suggestedAddress?: { line1: string; line2?: string | null; city: string; state: string; postalCode: string; country: string } | null;
  warnings?: string[];
}

/** Preview or explicitly approve a label using the same immutable request and key. */
export async function createLabel(
  config: ClientConfig,
  request: CreateLabelRequest,
  signal?: AbortSignal,
  idempotencyKey?: string,
  confirmationToken?: string,
): Promise<LabelResponse | LabelPurchasePreview> {
  if (confirmationToken && !idempotencyKey?.trim()) throw new Error('Reuse the original purchase key when approving or retrying.');
  const purchaseKey = idempotencyKey ?? crypto.randomUUID();
  const address = (value: CreateLabelRequest['from']) => ({
    addressLine1: value.street1, addressLine2: value.street2,
    city: value.city, stateProvince: value.state, postalCode: value.postalCode, countryCode: value.country,
  });
  const response = await fetch(`${stripTrailingSlash(config.baseUrl)}/api/shipping/labels`, {
    method: 'POST',
    headers: { ...buildHeaders(config), 'Idempotency-Key': purchaseKey },
    body: JSON.stringify({
      origin: address(request.from), destination: address(request.to),
      package: { weight: request.weightOz, weightUnit: 'oz', length: request.lengthIn,
        width: request.widthIn, height: request.heightIn, dimensionUnit: 'in' },
      carrierCode: request.carrier, serviceCode: request.service, labelFormat: 'PDF',
      orderId: request.orderId, hazmatClassification: request.hazmatClassification,
      maximumPostageAmount: request.maximumPostageAmount, confirmationToken,
    }),
    signal,
  });
  // Gateway ShippingLabel: it echoes the carrier but not the service, so the service shown is
  // the one this request bought.
  const result = await handleResponse<LabelPurchasePreview & {
    isSandbox?: boolean; labelId: string; trackingNumber: string; carrierCode: string;
    labelData: string; rate: number;
  }>(response);
  // An empty success is neither a preview nor a label: fail closed so the purchase stays unresolved.
  if (result?.status === 'Preview') {
    if (confirmationToken || !result.confirmationToken || result.currency !== 'USD' ||
        !Number.isFinite(result.quotedPostageAmount) || result.quotedPostageAmount <= 0 ||
        result.maximumPostageAmount !== request.maximumPostageAmount ||
        result.quotedPostageAmount > request.maximumPostageAmount || !Number.isFinite(Date.parse(result.expiresAt))) {
      throw new Error('Gateway returned an invalid approval preview.');
    }
    return result;
  }
  if (!result?.trackingNumber || (!confirmationToken && result.isSandbox !== true))
    throw new Error('Gateway did not return a preview or a confirmed sandbox label.');
  return { labelId: result.labelId, trackingNumber: result.trackingNumber,
    carrier: result.carrierCode, service: request.service ?? '', cost: result.rate,
    labelUrl: /^https:\/\//i.test(result.labelData) ? result.labelData : `data:application/pdf;base64,${result.labelData}` };
}

/** Fetch tracking data for a tracking link token. */
export async function fetchTracking(
  config: ClientConfig,
  token: string,
  signal?: AbortSignal,
): Promise<WidgetTrackingResponse> {
  const base = stripTrailingSlash(config.baseUrl);
  const encodedToken = encodeURIComponent(token);
  const response = await fetch(`${base}/api/widget/tracking/${encodedToken}`, {
    method: 'GET',
    headers: publicHeaders(),
    signal,
  });
  return handleBody<WidgetTrackingResponse>(response);
}

/** Classify a product into HS codes. */
export async function classifyHsCode(
  config: ClientConfig,
  request: HsCodeClassifyRequest,
  signal?: AbortSignal,
): Promise<HsCodeClassifyResponse> {
  const base = stripTrailingSlash(config.baseUrl);
  const response = await fetch(`${base}/api/shipping/hs-codes/classify`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify(request),
    signal,
  });
  return handleBody<HsCodeClassifyResponse>(response);
}
