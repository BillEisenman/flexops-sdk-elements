// Copyright (c) FlexOps, LLC. All rights reserved.

import type { ReturnConfirmation } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';

export interface ReturnPortalProps {
  /** Pre-fill order number (e.g., from URL parameter). */
  defaultOrderNumber?: string;
  /** Pre-fill email or ZIP for identity verification. */
  defaultEmailOrZip?: string;
  /** Predefined list of return reasons to show in the dropdown. */
  returnReasons?: string[];
  /** Hide the order lookup form and go straight to item selection (requires both defaults). */
  skipLookup?: boolean;
  /** Called when the return is successfully submitted. */
  onReturnSubmitted?: (confirmation: ReturnConfirmation) => void;
  /** Called on error. */
  onError?: (error: Error) => void;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}
