// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import { fetchTracking } from '../../api/client';
import type { WidgetTrackingResponse } from '../../api/types';
import type { TrackingWidgetProps } from './types';
import { TrackingSearch } from './TrackingSearch';
import { TrackingBrandingHeader } from './TrackingBranding';
import { TrackingTimeline } from './TrackingTimeline';
import { getStyles } from './styles';
import { getCarrierInfo } from '../../utils/carrier-logos';

const STATUS_COLORS: Record<string, (theme: ReturnType<typeof resolveTheme>) => string> = {
  delivered: (t) => t.successColor,
  in_transit: (t) => t.primaryColor,
  out_for_delivery: (t) => t.primaryColor,
  exception: (t) => t.errorColor,
  return_to_sender: (t) => t.warningColor,
};

function getStatusColor(status: string, theme: ReturnType<typeof resolveTheme>): string {
  const key = status.toLowerCase().replace(/[\s-]/g, '_');
  const colorFn = STATUS_COLORS[key];
  return colorFn ? colorFn(theme) : theme.primaryColor;
}

/**
 * Embeddable tracking widget. Displays real-time package tracking status
 * with workspace branding applied automatically.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io' }}>
 *   <TrackingWidget token="abc123def456" />
 * </FlexOpsProvider>
 * ```
 */
export function TrackingWidget({
  token: initialToken,
  showSearchInput = true,
  pollingIntervalMs = 0,
  showBranding = true,
  onTrackingLoaded,
  onError,
  className,
  style,
  theme: themeOverride,
}: TrackingWidgetProps) {
  const { config, theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);

  const [activeToken, setActiveToken] = useState(initialToken ?? '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WidgetTrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTracking = useCallback(async (tkn: string) => {
    if (!tkn) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchTracking(config, tkn);
      setData(response);
      onTrackingLoaded?.(response);
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Failed to load tracking';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [config, onTrackingLoaded, onError]);

  // Load on mount if token provided
  useEffect(() => {
    if (initialToken) {
      setActiveToken(initialToken);
      loadTracking(initialToken);
    }
  }, [initialToken, loadTracking]);

  // Polling
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (pollingIntervalMs > 0 && activeToken) {
      intervalRef.current = setInterval(() => {
        loadTracking(activeToken);
      }, pollingIntervalMs);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollingIntervalMs, activeToken, loadTracking]);

  function handleSearch(tkn: string) {
    setActiveToken(tkn);
    setData(null);
    loadTracking(tkn);
  }

  // Resolve accent color from branding
  const accentColor = (showBranding && data?.branding?.primaryColor) || theme.primaryColor;
  const statusColor = data ? getStatusColor(data.status, theme) : theme.primaryColor;

  return (
    <div style={{ ...s.container, ...style }} className={className}>
      {showBranding && data?.branding && (
        <TrackingBrandingHeader branding={data.branding} theme={theme} />
      )}

      <h3 style={s.heading}>Track Your Package</h3>

      {showSearchInput && (
        <TrackingSearch onSearch={handleSearch} loading={loading} theme={theme} />
      )}

      {error && <div style={s.errorMessage}>{error}</div>}

      {loading && !data && <div style={s.loading}>Loading tracking information...</div>}

      {data && (
        <>
          {/* Status card */}
          <div style={{
            ...s.statusCard,
            backgroundColor: `${statusColor}10`,
            border: `1px solid ${statusColor}30`,
          }}>
            <div style={{ ...s.statusLabel, color: statusColor }}>Status</div>
            <div style={{ ...s.statusValue, color: statusColor }}>
              {data.status.replace(/_/g, ' ')}
            </div>
            {data.statusMessage && (
              <div style={{ ...s.statusMessage, color: theme.mutedTextColor }}>
                {data.statusMessage}
              </div>
            )}
          </div>

          {/* Meta rows */}
          <div>
            <div style={s.metaRow}>
              <span style={s.metaLabel}>Tracking Number</span>
              <span style={s.metaValue}>{data.trackingNumber}</span>
            </div>
            <div style={s.metaRow}>
              <span style={s.metaLabel}>Carrier</span>
              <span style={s.metaValue}>{getCarrierInfo(data.carrier).displayName}</span>
            </div>
            {data.estimatedDelivery && (
              <div style={s.metaRow}>
                <span style={s.metaLabel}>Est. Delivery</span>
                <span style={s.metaValue}>{data.estimatedDelivery}</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <TrackingTimeline
            events={data.events}
            theme={theme}
            accentColor={accentColor}
          />

          {/* Support footer */}
          {showBranding && data.branding?.supportEmail && (
            <div style={s.supportFooter}>
              Need help?{' '}
              <a href={`mailto:${data.branding.supportEmail}`} style={s.supportLink}>
                {data.branding.supportEmail}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
