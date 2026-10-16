// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useEffect, useRef } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import type { ReturnPortalProps } from './types';
import { getStyles } from './styles';

/** Shown, and passed to `onError`, because the Gateway has no shopper return endpoint. */
const RETURN_PORTAL_UNAVAILABLE_MESSAGE =
  'Self-service returns are not available yet. Please contact the store to start a return.';

/**
 * Self-service return portal: not available yet.
 *
 * The FlexOps Gateway has no shopper-facing endpoint to look up an order by order number and
 * email or ZIP, or to submit a return from it. Its returns API is workspace-scoped and needs a
 * signed-in or API-key caller, which a shopper's browser must not hold. Until that endpoint
 * exists this widget makes no request: it shows a notice and reports the gap through `onError`
 * once, so an integrator can hide it or link to their own returns process.
 */
export function ReturnPortal({
  onError,
  className,
  style,
  theme: themeOverride,
}: ReturnPortalProps) {
  const { theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);

  const reported = useRef(false);
  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    onError?.(new Error(RETURN_PORTAL_UNAVAILABLE_MESSAGE));
  }, [onError]);

  return (
    <div style={{ ...s.container, ...style }} className={className}>
      <h3 style={s.heading}>Start a Return</h3>
      <div role="status" style={s.instructions}>{RETURN_PORTAL_UNAVAILABLE_MESSAGE}</div>
    </div>
  );
}
