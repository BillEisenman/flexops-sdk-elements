// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useCallback } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import { createLabel } from '../../api/client';
import type { LabelResponse } from '../../api/types';
import type { ShippingLabelProps } from './types';
import { getStyles } from './styles';
import { formatCurrency } from '../../utils/format';
import { getCarrierInfo } from '../../utils/carrier-logos';

/**
 * Embeddable shipping label creator. Collects from/to addresses, package
 * details, and carrier selection in a single form — creates a label and
 * shows the tracking number and download link.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io', apiKey: 'fxk_live_...' }}>
 *   <ShippingLabel
 *     defaultFrom={{ street1: '123 Warehouse Ln', city: 'Dallas', state: 'TX', postalCode: '75201' }}
 *     lockFrom
 *     onLabelCreated={(label) => console.log('Tracking:', label.trackingNumber)}
 *   />
 * </FlexOpsProvider>
 * ```
 */
export function ShippingLabel({
  defaultFrom,
  lockFrom = false,
  defaultCarrier = '',
  defaultService = '',
  showServiceSelection = true,
  onLabelCreated,
  onError,
  className,
  style,
  theme: themeOverride,
}: ShippingLabelProps) {
  const { config, theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);

  const [from, setFrom] = useState({
    street1: defaultFrom?.street1 ?? '',
    city: defaultFrom?.city ?? '',
    state: defaultFrom?.state ?? '',
    postalCode: defaultFrom?.postalCode ?? '',
    country: defaultFrom?.country ?? 'US',
  });

  const [to, setTo] = useState({
    street1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const [weightOz, setWeightOz] = useState('');
  const [lengthIn, setLengthIn] = useState('');
  const [widthIn, setWidthIn] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [carrier, setCarrier] = useState(defaultCarrier);
  const [service, setService] = useState(defaultService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState<LabelResponse | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const weight = parseFloat(weightOz);
    if (!from.street1 || !from.postalCode || !to.street1 || !to.postalCode || isNaN(weight) || weight <= 0) {
      setError('Please fill in both addresses and package weight.');
      return;
    }

    setLoading(true);
    setError(null);
    setLabel(null);

    try {
      const response = await createLabel(config, {
        from: {
          street1: from.street1.trim(),
          city: from.city.trim(),
          state: from.state.trim(),
          postalCode: from.postalCode.trim(),
          country: from.country.trim() || 'US',
        },
        to: {
          street1: to.street1.trim(),
          city: to.city.trim(),
          state: to.state.trim(),
          postalCode: to.postalCode.trim(),
          country: to.country.trim() || 'US',
        },
        weightOz: weight,
        lengthIn: lengthIn ? parseFloat(lengthIn) : undefined,
        widthIn: widthIn ? parseFloat(widthIn) : undefined,
        heightIn: heightIn ? parseFloat(heightIn) : undefined,
        carrier: carrier || undefined,
        service: service || undefined,
      });
      setLabel(response);
      onLabelCreated?.(response);
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Failed to create label';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [from, to, weightOz, lengthIn, widthIn, heightIn, carrier, service, config, onLabelCreated, onError]);

  if (label) {
    const carrierInfo = getCarrierInfo(label.carrier);
    return (
      <div style={{ ...s.container, ...style }} className={className}>
        <div style={s.successBox}>
          <div style={s.successTitle}>&#10003; Label Created</div>
          <div style={s.metaRow}>
            <span style={s.metaLabel}>Tracking Number</span>
            <span style={s.metaValue}>{label.trackingNumber}</span>
          </div>
          <div style={s.metaRow}>
            <span style={s.metaLabel}>Carrier</span>
            <span style={s.metaValue}>{carrierInfo.displayName} — {label.service}</span>
          </div>
          <div style={s.metaRow}>
            <span style={s.metaLabel}>Cost</span>
            <span style={s.metaValue}>{formatCurrency(label.cost)}</span>
          </div>
          <a href={label.labelUrl} target="_blank" rel="noopener noreferrer" style={s.linkButton}>
            Download Label
          </a>
          <button type="button" style={{ ...s.linkButton, marginLeft: '8px', backgroundColor: theme.secondaryColor }}
            onClick={() => setLabel(null)}>
            Create Another
          </button>
        </div>
      </div>
    );
  }

  const fromInputStyle = lockFrom ? s.inputLocked : s.input;

  return (
    <div style={{ ...s.container, ...style }} className={className}>
      <h3 style={s.heading}>Create Shipping Label</h3>

      <form onSubmit={handleSubmit}>
        {/* From Address */}
        <div style={s.sectionTitle}>From (Sender)</div>
        <div style={s.fieldGroupFull}>
          <label style={s.label}>Street Address</label>
          <input style={fromInputStyle} type="text" placeholder="123 Warehouse Ln"
            value={from.street1} onChange={(e) => setFrom((p) => ({ ...p, street1: e.target.value }))}
            readOnly={lockFrom} required />
        </div>
        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>City</label>
            <input style={fromInputStyle} type="text" placeholder="Dallas"
              value={from.city} onChange={(e) => setFrom((p) => ({ ...p, city: e.target.value }))}
              readOnly={lockFrom} required />
          </div>
          <div>
            <label style={s.label}>State</label>
            <input style={fromInputStyle} type="text" placeholder="TX" maxLength={3}
              value={from.state} onChange={(e) => setFrom((p) => ({ ...p, state: e.target.value }))}
              readOnly={lockFrom} required />
          </div>
        </div>
        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>ZIP</label>
            <input style={fromInputStyle} type="text" placeholder="75201" maxLength={10}
              value={from.postalCode} onChange={(e) => setFrom((p) => ({ ...p, postalCode: e.target.value }))}
              readOnly={lockFrom} required />
          </div>
          <div>
            <label style={s.label}>Country</label>
            <input style={fromInputStyle} type="text" placeholder="US" maxLength={2}
              value={from.country} onChange={(e) => setFrom((p) => ({ ...p, country: e.target.value }))}
              readOnly={lockFrom} />
          </div>
        </div>

        {/* To Address */}
        <div style={s.sectionTitle}>To (Recipient)</div>
        <div style={s.fieldGroupFull}>
          <label style={s.label}>Street Address</label>
          <input style={s.input} type="text" placeholder="456 Customer Ave"
            value={to.street1} onChange={(e) => setTo((p) => ({ ...p, street1: e.target.value }))} required />
        </div>
        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>City</label>
            <input style={s.input} type="text" placeholder="Los Angeles"
              value={to.city} onChange={(e) => setTo((p) => ({ ...p, city: e.target.value }))} required />
          </div>
          <div>
            <label style={s.label}>State</label>
            <input style={s.input} type="text" placeholder="CA" maxLength={3}
              value={to.state} onChange={(e) => setTo((p) => ({ ...p, state: e.target.value }))} required />
          </div>
        </div>
        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>ZIP</label>
            <input style={s.input} type="text" placeholder="90210" maxLength={10}
              value={to.postalCode} onChange={(e) => setTo((p) => ({ ...p, postalCode: e.target.value }))} required />
          </div>
          <div>
            <label style={s.label}>Country</label>
            <input style={s.input} type="text" placeholder="US" maxLength={2}
              value={to.country} onChange={(e) => setTo((p) => ({ ...p, country: e.target.value }))} />
          </div>
        </div>

        {/* Package Details */}
        <div style={s.sectionTitle}>Package</div>
        <div style={s.fieldGroupFull}>
          <label style={s.label}>Weight (oz)</label>
          <input style={s.input} type="number" placeholder="16" min="0.1" step="0.1"
            value={weightOz} onChange={(e) => setWeightOz(e.target.value)} required />
        </div>
        <div style={s.fieldGroupThree}>
          <div>
            <label style={s.label}>Length (in)</label>
            <input style={s.input} type="number" placeholder="12" min="0.1" step="0.1"
              value={lengthIn} onChange={(e) => setLengthIn(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>Width (in)</label>
            <input style={s.input} type="number" placeholder="8" min="0.1" step="0.1"
              value={widthIn} onChange={(e) => setWidthIn(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>Height (in)</label>
            <input style={s.input} type="number" placeholder="6" min="0.1" step="0.1"
              value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
          </div>
        </div>

        {/* Carrier Selection */}
        {showServiceSelection && (
          <div style={s.fieldGroup}>
            <div>
              <label style={s.label}>Carrier (optional)</label>
              <select style={s.select} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                <option value="">Auto-select best</option>
                <option value="usps">USPS</option>
                <option value="ups">UPS</option>
                <option value="fedex">FedEx</option>
                <option value="dhl">DHL Express</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Service (optional)</label>
              <input style={s.input} type="text" placeholder="e.g., priority"
                value={service} onChange={(e) => setService(e.target.value)} />
            </div>
          </div>
        )}

        <button type="submit" style={loading ? s.buttonDisabled : s.button} disabled={loading}>
          {loading ? 'Creating label...' : 'Create Label'}
        </button>
      </form>

      {error && <div style={s.errorMessage}>{error}</div>}
      {loading && <div style={s.loading}>Creating your shipping label...</div>}
    </div>
  );
}
