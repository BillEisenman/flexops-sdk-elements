// Copyright (c) FlexOps, LLC. All rights reserved.

import type { HazmatClassification, LabelResponse } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';

/**
 * What the parcel holds. The integrator declares it; the widget never asks the end customer.
 * A label without an `orderId` must declare it (`HazmatClassification.None` for an ordinary
 * parcel); a label bought against an order may omit it.
 */
export type ShippingLabelDeclarationProps =
  | { orderId?: undefined; hazmatClassification: HazmatClassification }
  | { orderId: number; hazmatClassification?: HazmatClassification };

export type ShippingLabelProps = ShippingLabelBaseProps & ShippingLabelDeclarationProps;

export interface ShippingLabelBaseProps {
  /** Pre-fill the sender address fields. */
  defaultFrom?: {
    name?: string;
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
