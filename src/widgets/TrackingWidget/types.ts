// Copyright (c) FlexOps, LLC. All rights reserved.

import type { FlexOpsTheme } from '../../provider/types';

export interface TrackingWidgetProps {
  /** Pre-set tracking link token. */
  token?: string;
  /** Show search input to enter a token (default: true). */
  showSearchInput?: boolean;
  /** Polling interval in ms for live updates (default: 0 — no polling). */
  pollingIntervalMs?: number;
  /** Show workspace branding from API response (default: true). */
  showBranding?: boolean;
  /** Called when tracking data is loaded. */
  onTrackingLoaded?: (data: import('../../api/types').WidgetTrackingResponse) => void;
  /** Called on error. */
  onError?: (error: Error) => void;
  /** Additional CSS class for the outer container. */
  className?: string;
  /** Inline styles for the outer container. */
  style?: React.CSSProperties;
  /** Widget-level theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}
