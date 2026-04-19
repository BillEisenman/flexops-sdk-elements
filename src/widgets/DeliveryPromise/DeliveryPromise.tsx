// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import { fetchDeliveryEstimate } from '../../api/client';
import type { DeliveryEstimate } from '../../api/types';
import type { DeliveryPromiseProps } from './types';
import { DeliveryPromiseResult } from './DeliveryPromiseResult';
import { getStyles } from './styles';

/**
 * Compute the next ship date based on a cutoff hour and timezone.
 * If the current time is past the cutoff, the next business day is used.
 */
function getNextShipDate(cutoffHour: number, cutoffTimezone: string): Date {
  const now = new Date();

  // Format the current time in the cutoff timezone to get the local hour
  const tzParts = new Intl.DateTimeFormat('en-US', {
    timeZone: cutoffTimezone,
    hour: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now);

  const hourStr = tzParts.find((p) => p.type === 'hour')?.value ?? '0';
  const weekday = tzParts.find((p) => p.type === 'weekday')?.value ?? '';
  const currentHour = parseInt(hourStr, 10);

  // Start from today
  const shipDate = new Date(now);

  // If past cutoff, push to next day
  if (currentHour >= cutoffHour) {
    shipDate.setDate(shipDate.getDate() + 1);
  }

  // Skip weekends (Sat=6, Sun=0 in getDay(); but we use the tz weekday)
  const skipWeekend = (d: Date) => {
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
    if (day === 6) d.setDate(d.getDate() + 2); // Saturday -> Monday
  };

  skipWeekend(shipDate);

  // Also handle the case where the cutoff check moved us onto Sat
  if (['Sat', 'Sun'].includes(weekday) && currentHour < cutoffHour) {
    skipWeekend(shipDate);
  }

  return shipDate;
}

/**
 * Add business days to a date, skipping weekends.
 */
function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) {
      remaining--;
    }
  }
  return result;
}

/**
 * Calculate hours and minutes remaining until cutoff.
 */
function getTimeUntilCutoff(cutoffHour: number, cutoffTimezone: string): { hours: number; minutes: number } | null {
  const now = new Date();
  const tzString = now.toLocaleString('en-US', { timeZone: cutoffTimezone, hour12: false });
  const tzDate = new Date(tzString);
  const currentHour = tzDate.getHours();
  const currentMinute = tzDate.getMinutes();

  const cutoffMinutes = cutoffHour * 60;
  const currentMinutes = currentHour * 60 + currentMinute;

  if (currentMinutes >= cutoffMinutes) return null;

  const diff = cutoffMinutes - currentMinutes;
  return { hours: Math.floor(diff / 60), minutes: diff % 60 };
}

/**
 * Embeddable delivery promise widget. Shows estimated delivery dates
 * for a given origin and destination, with cutoff-time awareness.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io', apiKey: 'fxk_live_...' }}>
 *   <DeliveryPromise
 *     originPostalCode="10001"
 *     destinationPostalCode="90210"
 *     cutoffHour={15}
 *   />
 * </FlexOpsProvider>
 * ```
 */
export function DeliveryPromise({
  originPostalCode,
  originCountry = 'US',
  destinationPostalCode: destPropZip,
  destinationCountry = 'US',
  cutoffHour = 15,
  cutoffTimezone = 'America/New_York',
  maxResults = 1,
  layout = 'card',
  hideCarrier = false,
  onEstimateLoaded,
  onError,
  className,
  style,
  theme: themeOverride,
}: DeliveryPromiseProps) {
  const { config, theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);

  const [destZip, setDestZip] = useState(destPropZip ?? '');
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<DeliveryEstimate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEstimates = useCallback(async (zip: string) => {
    if (!zip || !originPostalCode) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchDeliveryEstimate(config, {
        originPostalCode: originPostalCode.trim(),
        originCountry: originCountry.trim(),
        destinationPostalCode: zip.trim(),
        destinationCountry: destinationCountry.trim(),
      });
      setEstimates(response.estimates);
      onEstimateLoaded?.(response.estimates);
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Failed to fetch delivery estimate';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [config, originPostalCode, originCountry, destinationCountry, onEstimateLoaded, onError]);

  // Auto-fetch when destination ZIP is provided via prop
  useEffect(() => {
    if (destPropZip) {
      setDestZip(destPropZip);
      loadEstimates(destPropZip);
    }
  }, [destPropZip, loadEstimates]);

  function handleZipSubmit() {
    if (destZip.trim()) {
      loadEstimates(destZip);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleZipSubmit();
    }
  }

  // Compute cutoff countdown
  const timeUntilCutoff = getTimeUntilCutoff(cutoffHour, cutoffTimezone);
  const shipDate = getNextShipDate(cutoffHour, cutoffTimezone);

  // Resolve delivery dates from transit days + ship date
  const resolvedEstimates = estimates?.slice(0, maxResults).map((est) => ({
    ...est,
    resolvedDate: addBusinessDays(shipDate, est.businessDaysInTransit),
  }));

  const containerStyle = layout === 'inline' ? s.containerInline : s.container;

  return (
    <div style={{ ...containerStyle, ...style }} className={className}>
      {layout === 'card' && (
        <div style={s.heading}>
          <span aria-hidden="true">&#128230;</span> Delivery Estimate
        </div>
      )}

      {/* ZIP input when no destination is pre-set */}
      {!destPropZip && (
        <div style={s.zipRow}>
          <input
            type="text"
            style={s.input}
            placeholder="Enter ZIP code"
            value={destZip}
            onChange={(e) => setDestZip(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={10}
            aria-label="Destination ZIP code"
          />
          <button
            type="button"
            style={s.button}
            onClick={handleZipSubmit}
            disabled={loading || !destZip.trim()}
          >
            Check
          </button>
        </div>
      )}

      {error && <div style={s.errorMessage}>{error}</div>}

      {loading && <div style={s.loading}>Checking delivery times...</div>}

      {resolvedEstimates && !loading && (
        <>
          {resolvedEstimates.length === 0 && (
            <div style={s.loading}>No delivery estimates available for this destination.</div>
          )}

          {resolvedEstimates.length === 1 ? (
            <DeliveryPromiseResult
              estimate={resolvedEstimates[0]}
              resolvedDate={resolvedEstimates[0].resolvedDate}
              hideCarrier={hideCarrier}
              theme={theme}
            />
          ) : (
            <ul style={s.multiResultList}>
              {resolvedEstimates.map((est, i) => (
                <li key={i}>
                  <DeliveryPromiseResult
                    estimate={est}
                    resolvedDate={est.resolvedDate}
                    hideCarrier={hideCarrier}
                    theme={theme}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* Cutoff notice */}
          {timeUntilCutoff && (
            <div style={s.cutoffNotice}>
              <span aria-hidden="true">&#9200;</span>
              {' '}Order within {timeUntilCutoff.hours}h {timeUntilCutoff.minutes}m to ship today
            </div>
          )}
        </>
      )}
    </div>
  );
}
