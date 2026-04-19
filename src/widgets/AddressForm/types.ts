// Copyright (c) FlexOps, LLC. All rights reserved.

import type { AddressValidationResult } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';

export interface AddressFormProps {
  /** Pre-fill street line 1. */
  defaultStreet1?: string;
  /** Pre-fill street line 2. */
  defaultStreet2?: string;
  /** Pre-fill city. */
  defaultCity?: string;
  /** Pre-fill state/province code. */
  defaultState?: string;
  /** Pre-fill postal code. */
  defaultPostalCode?: string;
  /** Pre-fill country code (default: "US"). */
  defaultCountry?: string;
  /** Whether to auto-validate on submit (default: true). */
  autoValidate?: boolean;
  /** Called with the validated/normalized address on successful submit. */
  onAddressValidated?: (result: AddressValidationResult) => void;
  /** Called on validation or API error. */
  onError?: (error: Error) => void;
  /** Label for the submit button (default: "Validate Address"). */
  submitLabel?: string;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}

export interface AddressFormValues {
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
