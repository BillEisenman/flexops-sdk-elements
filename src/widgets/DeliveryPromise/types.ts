// Copyright (c) FlexOps, LLC. All rights reserved.

import type { DeliveryEstimate } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';

export interface DeliveryPromiseProps {
  /** Origin postal code (seller's warehouse). */
  originPostalCode: string;
  /** Origin country code (default: "US"). */
  originCountry?: string;
  /** Destination postal code. If omitted, a ZIP input is shown. */
  destinationPostalCode?: string;
  /** Destination country code (default: "US"). */
  destinationCountry?: string;
  /** Package weight in ounces used to pick the services quoted (default: 16). */
  weightOz?: number;
  /** Order cutoff hour in 24h format (default: 15 = 3pm). Orders after this hour ship next business day. */
  cutoffHour?: number;
  /** Cutoff timezone IANA identifier (default: "America/New_York"). */
  cutoffTimezone?: string;
  /**
   * Only quote this service, e.g. "Ground Advantage" or "USPS Priority Mail": the service you ship with, so the
   * date is not a faster service's. Matches the whole service name, or carrier and service name, ignoring case.
   * Default: every service, fastest first.
   */
  service?: string;
  /** Only show the fastest N results (default: 1). */
  maxResults?: number;
  /** Display layout. "inline" is compact for product pages, "card" has a border. Default: "card". */
  layout?: 'inline' | 'card';
  /** Hide the carrier name and only show the delivery date (default: false). */
  hideCarrier?: boolean;
  /** Called when delivery estimates are loaded, fastest first. `confidencePercent` is always null. */
  onEstimateLoaded?: (estimates: DeliveryEstimate[]) => void;
  /**
   * Called on error. A failed Gateway request passes the `FlexOpsApiError` itself (check with
   * `instanceof`), carrying the HTTP `status`, the envelope `errorCode` and any `data`.
   */
  onError?: (error: Error) => void;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}
