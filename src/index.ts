// Copyright (c) FlexOps, LLC. All rights reserved.

// Provider
export { FlexOpsProvider } from './provider/FlexOpsProvider';
export type { FlexOpsProviderProps } from './provider/FlexOpsProvider';
export type { FlexOpsConfig, FlexOpsTheme } from './provider/types';
export { defaultTheme } from './provider/types';
export { useFlexOps } from './provider/context';

// Widgets
export { RateCalculator } from './widgets/RateCalculator/RateCalculator';
export type { RateCalculatorProps } from './widgets/RateCalculator/types';
export { TrackingWidget } from './widgets/TrackingWidget/TrackingWidget';
export type { TrackingWidgetProps } from './widgets/TrackingWidget/types';
export { DeliveryPromise } from './widgets/DeliveryPromise/DeliveryPromise';
export type { DeliveryPromiseProps } from './widgets/DeliveryPromise/types';
export { AddressForm } from './widgets/AddressForm/AddressForm';
export type { AddressFormProps } from './widgets/AddressForm/types';
export { ReturnPortal } from './widgets/ReturnPortal/ReturnPortal';
export type { ReturnPortalProps } from './widgets/ReturnPortal/types';
export { ShippingLabel } from './widgets/ShippingLabel/ShippingLabel';
export type { ShippingLabelProps } from './widgets/ShippingLabel/types';
export { HsCodeLookup } from './widgets/HsCodeLookup/HsCodeLookup';
export type { HsCodeLookupProps } from './widgets/HsCodeLookup/types';

// API types (for callback consumers)
export type {
  CarrierRateEstimate,
  PublicRateEstimateResponse,
  DeliveryEstimate,
  DeliveryEstimateResponse,
  AddressValidationResult,
  ReturnableItem,
  ReturnEligibilityResponse,
  ReturnConfirmation,
  LabelResponse,
  WidgetTrackingResponse,
  WidgetTrackingEvent,
  WidgetBranding,
  HsCodeClassification,
  HsCodeClassifyResponse,
} from './api/types';
