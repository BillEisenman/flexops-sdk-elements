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

// Mirrors Gateway DeliveryPromiseDTOs

export interface DeliveryEstimateRequest {
  originPostalCode: string;
  originCountry: string;
  destinationPostalCode: string;
  destinationCountry: string;
}

export interface DeliveryEstimate {
  carrierName: string;
  serviceName: string;
  estimatedDeliveryDate: string;
  businessDaysInTransit: number;
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
}

// Mirrors Gateway ReturnPortalDTOs

export interface ReturnEligibilityRequest {
  orderNumber: string;
  emailOrZip: string;
}

export interface ReturnableItem {
  lineItemId: string;
  productName: string;
  sku: string;
  quantity: number;
  maxReturnableQty: number;
  imageUrl: string | null;
  price: number;
}

export interface ReturnEligibilityResponse {
  eligible: boolean;
  orderNumber: string;
  items: ReturnableItem[];
  returnWindowCloses: string | null;
  message: string | null;
}

export interface ReturnSubmission {
  orderNumber: string;
  emailOrZip: string;
  items: { lineItemId: string; quantity: number; reason: string }[];
}

export interface ReturnConfirmation {
  rmaNumber: string;
  returnLabelUrl: string | null;
  qrCodeUrl: string | null;
  instructions: string;
}

// Mirrors Gateway ShippingLabelDTOs

export interface CreateLabelRequest {
  from: AddressValidationRequest;
  to: AddressValidationRequest;
  weightOz: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
  carrier?: string;
  service?: string;
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
