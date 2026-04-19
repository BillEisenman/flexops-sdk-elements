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
  /** Order cutoff hour in 24h format (default: 15 = 3pm). Orders after this hour ship next business day. */
  cutoffHour?: number;
  /** Cutoff timezone IANA identifier (default: "America/New_York"). */
  cutoffTimezone?: string;
  /** Only show the fastest N results (default: 1). */
  maxResults?: number;
  /** Display layout. "inline" is compact for product pages, "card" has a border. Default: "card". */
  layout?: 'inline' | 'card';
  /** Hide the carrier name and only show the delivery date (default: false). */
  hideCarrier?: boolean;
  /** Called when delivery estimates are loaded. */
  onEstimateLoaded?: (estimates: DeliveryEstimate[]) => void;
  /** Called on error. */
  onError?: (error: Error) => void;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}
