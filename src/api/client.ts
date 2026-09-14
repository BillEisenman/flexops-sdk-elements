// Copyright (c) FlexOps, LLC. All rights reserved.

import type {
  PublicRateEstimateRequest,
  PublicRateEstimateResponse,
  DeliveryEstimateRequest,
  DeliveryEstimateResponse,
  AddressValidationRequest,
  AddressValidationResult,
  ReturnEligibilityRequest,
  ReturnEligibilityResponse,
  ReturnSubmission,
  ReturnConfirmation,
  CreateLabelRequest,
  LabelResponse,
  LabelPurchasePreview,
  WidgetTrackingResponse,
  HsCodeClassifyRequest,
  HsCodeClassifyResponse,
  FlexOpsApiError,
} from './types';

interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
}

function buildHeaders(config: ClientConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
  }
  return headers;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // Use default message
    }
    const error: FlexOpsApiError = { message, status: response.status };
    throw error;
  }
  return response.json() as Promise<T>;
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
    headers: buildHeaders(config),
    body: JSON.stringify(request),
    signal,
  });
  return handleResponse<PublicRateEstimateResponse>(response);
}

/** Fetch delivery date estimates for a destination. */
export async function fetchDeliveryEstimate(
  config: ClientConfig,
  request: DeliveryEstimateRequest,
  signal?: AbortSignal,
): Promise<DeliveryEstimateResponse> {
  const base = stripTrailingSlash(config.baseUrl);
  const response = await fetch(`${base}/api/shipping/delivery-estimate`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify(request),
    signal,
  });
  return handleResponse<DeliveryEstimateResponse>(response);
}

/** Validate and normalize a shipping address. */
export async function validateAddress(
  config: ClientConfig,
  request: AddressValidationRequest,
  signal?: AbortSignal,
): Promise<AddressValidationResult> {
  const base = stripTrailingSlash(config.baseUrl);
  const response = await fetch(`${base}/api/addresses/validate`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify(request),
    signal,
  });
  return handleResponse<AddressValidationResult>(response);
}

/** Check return eligibility for an order. */
export async function checkReturnEligibility(
  config: ClientConfig,
  request: ReturnEligibilityRequest,
  signal?: AbortSignal,
): Promise<ReturnEligibilityResponse> {
  const base = stripTrailingSlash(config.baseUrl);
  const response = await fetch(`${base}/api/returns/eligibility`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify(request),
    signal,
  });
  return handleResponse<ReturnEligibilityResponse>(response);
}

/** Submit a return request. */
export async function submitReturn(
  config: ClientConfig,
  request: ReturnSubmission,
  signal?: AbortSignal,
): Promise<ReturnConfirmation> {
  const base = stripTrailingSlash(config.baseUrl);
  const response = await fetch(`${base}/api/returns/submit`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify(request),
    signal,
  });
  return handleResponse<ReturnConfirmation>(response);
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
      maximumPostageAmount: request.maximumPostageAmount, confirmationToken,
    }),
    signal,
  });
  const result = await handleResponse<LabelPurchasePreview & {
    isSandbox?: boolean; labelId: string; trackingNumber: string; carrierCode: string;
    serviceCode: string; labelData: string; rate: number;
  }>(response);
  if (result.status === 'Preview') {
    if (confirmationToken || !result.confirmationToken || result.currency !== 'USD' ||
        !Number.isFinite(result.quotedPostageAmount) || result.quotedPostageAmount <= 0 ||
        result.maximumPostageAmount !== request.maximumPostageAmount ||
        result.quotedPostageAmount > request.maximumPostageAmount || !Number.isFinite(Date.parse(result.expiresAt))) {
      throw new Error('Gateway returned an invalid approval preview.');
    }
    return result;
  }
  if (!result.trackingNumber || (!confirmationToken && result.isSandbox !== true))
    throw new Error('Gateway did not return a preview or a confirmed sandbox label.');
  return { labelId: result.labelId, trackingNumber: result.trackingNumber,
    carrier: result.carrierCode, service: result.serviceCode, cost: result.rate,
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
    headers: buildHeaders(config),
    signal,
  });
  return handleResponse<WidgetTrackingResponse>(response);
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
  return handleResponse<HsCodeClassifyResponse>(response);
}
