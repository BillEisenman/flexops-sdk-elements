// Copyright (c) FlexOps, LLC. All rights reserved.

import type { LabelResponse } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';

export interface ShippingLabelProps {
  /** Pre-fill the sender address fields. */
  defaultFrom?: {
    street1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Lock the sender address so it can't be edited (e.g., warehouse address). */
  lockFrom?: boolean;
  /** Pre-select a carrier (e.g., "usps"). */
  defaultCarrier?: string;
  /** Pre-select a service (e.g., "priority"). */
  defaultService?: string;
  /** Show carrier/service selectors (default: true). */
  showServiceSelection?: boolean;
  /** Called when the label is successfully created. */
  onLabelCreated?: (label: LabelResponse) => void;
  /** Called on error. */
  onError?: (error: Error) => void;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}
