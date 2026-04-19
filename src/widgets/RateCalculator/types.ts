// Copyright (c) FlexOps, LLC. All rights reserved.

import type { CarrierRateEstimate } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';

export interface RateCalculatorProps {
  /** Pre-fill origin postal code. */
  defaultFromPostalCode?: string;
  /** Pre-fill origin country (default: "US"). */
  defaultFromCountry?: string;
  /** Pre-fill destination postal code. */
  defaultToPostalCode?: string;
  /** Pre-fill destination country (default: "US"). */
  defaultToCountry?: string;
  /** Pre-fill package weight in ounces. */
  defaultWeightOz?: number;
  /** Show dimension inputs (default: true). */
  showDimensions?: boolean;
  /** Show country selector (default: false — domestic only). */
  showCountry?: boolean;
  /** Maximum number of rate results to display. */
  maxResults?: number;
  /** Called when rates are successfully fetched. */
  onRatesFetched?: (rates: CarrierRateEstimate[]) => void;
  /** Called when a user selects a rate. */
  onRateSelected?: (rate: CarrierRateEstimate) => void;
  /** Called on error. */
  onError?: (error: Error) => void;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}

export interface RateFormValues {
  fromPostalCode: string;
  fromCountry: string;
  toPostalCode: string;
  toCountry: string;
  weightOz: string;
  lengthIn: string;
  widthIn: string;
  heightIn: string;
}
