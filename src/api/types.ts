// Copyright (c) FlexOps, LLC. All rights reserved.

// Mirrors Gateway PublicRateDTOs

export interface PublicRateEstimateRequest {
  fromPostalCode: string;
  fromCountry: string;
  toPostalCode: string;
  toCountry: string;
  weightOz: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
}

export interface CarrierRateEstimate {
  carrierName: string;
  serviceName: string;
  estimatedRate: number;
  estimatedDeliveryDays: number | null;
  carrierLogoUrl: string | null;
}

export interface PublicRateEstimateResponse {
  rates: CarrierRateEstimate[];
  generatedAtUtc: string;
  disclaimer: string;
}

// Mirrors Gateway TrackingWidgetDTOs

export interface WidgetTrackingEvent {
  timestamp: string;
  description: string;
  location: string | null;
  statusCode: string | null;
}

export interface WidgetBranding {
  companyName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  supportEmail: string | null;
}

export interface WidgetTrackingResponse {
  trackingNumber: string;
  carrier: string;
  status: string;
  statusMessage: string;
  estimatedDelivery: string | null;
  events: WidgetTrackingEvent[];
  branding: WidgetBranding | null;
}

// Delivery estimates. The Gateway has no delivery-estimate endpoint; the transit days come
// from the public rate estimate (Gateway PublicRateDTOs, POST /api/rates/public-estimate).

export interface DeliveryEstimateRequest {
  originPostalCode: string;
  originCountry: string;
  destinationPostalCode: string;
  destinationCountry: string;
  /** Package weight in ounces. The public rate estimate requires one. */
  weightOz: number;
}

/** Transit time for one carrier service, fastest first. */
export interface DeliveryTransitEstimate {
  carrierName: string;
  serviceName: string;
  businessDaysInTransit: number;
}

export interface DeliveryEstimate {
  carrierName: string;
  serviceName: string;
  /** Local `YYYY-MM-DD` date: the next ship date plus the business days in transit. */
  estimatedDeliveryDate: string;
  businessDaysInTransit: number;
  /** Always null: the Gateway's public estimate carries no on-time confidence. */
  confidencePercent: number | null;
}

export interface DeliveryEstimateResponse {
  estimates: DeliveryEstimate[];
  generatedAtUtc: string;
}

// Mirrors Gateway AddressValidationDTOs

export interface AddressValidationRequest {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  normalizedAddress: {
    street1: string;
    street2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  messages: string[];
  /** True when the carrier check could not complete; this is not an address rejection. */
  validationUnavailable?: boolean;
  /** Residential indicator from the carrier, when known. */
  isResidential?: boolean | null;
}

// Mirrors Gateway ShippingLabelDTOs

/**
 * USPS HAZMAT classification, sent as the Gateway `HazmatClassification` number.
 * There is no default: send `HazmatClassification.None` (0) to declare that the parcel
 * holds no dangerous goods. A label without an order must declare one.
 */
export const HazmatClassification = {
  None: 0,
  LimitedQuantity: 1,
  LithiumBatteryContainedInEquipment: 2,
  LithiumBatteryPackedWithEquipment: 3,
  LithiumBatteryStandalone: 4,
  OtherRestricted: 5,
  LithiumBatteryUsedDevice: 6,
} as const;
export type HazmatClassification = (typeof HazmatClassification)[keyof typeof HazmatClassification];

/** True when `value` is one of the Gateway HAZMAT class numbers. */
export function isHazmatClassification(value: unknown): value is HazmatClassification {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 6;
}

export interface CreateLabelRequest {
  from: AddressValidationRequest;
  to: AddressValidationRequest;
  weightOz: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
  carrier?: string;
  service?: string;
  maximumPostageAmount: number;
  /** Order the label is bought against. */
  orderId?: number;
  /** Declared HAZMAT class; sent only when set. Required by the Gateway when there is no orderId. */
  hazmatClassification?: HazmatClassification;
}

export interface LabelPurchasePreview {
  status: 'Preview';
  quotedPostageAmount: number;
  maximumPostageAmount: number;
  currency: 'USD';
  expiresAt: string;
  confirmationToken: string;
}

export interface LabelResponse {
  labelId: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  labelUrl: string;
  cost: number;
}

// Mirrors Gateway HsCodeClassifyDTOs

export interface HsCodeClassifyRequest {
  title: string;
  description?: string;
  category?: string;
  material?: string;
  destinationCountry?: string;
  maxResults?: number;
}

export interface HsCodeClassification {
  hsCode: string;
  description: string;
  chapter: string;
  chapterDescription: string;
  confidencePercent: number;
  dutyRatePercent: number | null;
}

export interface HsCodeClassifyResponse {
  productDescription: string;
  classifications: HsCodeClassification[];
  provider: string;
}

export interface FlexOpsApiError {
  message: string;
  status: number;
}
