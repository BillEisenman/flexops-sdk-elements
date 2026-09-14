// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useCallback, useRef, useId } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import { createLabel } from '../../api/client';
import type { LabelResponse, LabelPurchasePreview, CreateLabelRequest } from '../../api/types';
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
  defaultCarrier = 'usps',
  defaultService = 'PRIORITY',
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
  const [maximum, setMaximum] = useState('');
  const [pending, setPending] = useState<{ request: CreateLabelRequest; key: string; preview: LabelPurchasePreview; attempted: boolean; client: { baseUrl: string; apiKey?: string } } | null>(null);
  const busy = useRef(false);
  const maximumId = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState<LabelResponse | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy.current || pending) return;

    const weight = parseFloat(weightOz);
    if (!from.street1 || !from.postalCode || !to.street1 || !to.postalCode || isNaN(weight) || weight <= 0) {
      setError('Please fill in both addresses and package weight.');
      return;
    }

    const limit = Number(maximum);
    if (!Number.isFinite(limit) || limit <= 0 || limit > 1000000 || !/^\d+(\.\d{1,2})?$/.test(maximum) || !carrier || !service) {
      setError('Enter a maximum postage amount in USD and select a carrier and service.');
      return;
    }
    busy.current = true;
    setLoading(true);
    setError(null);
    setLabel(null);

    try {
      const request: CreateLabelRequest = {
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
        maximumPostageAmount: limit,
      };
      const key = crypto.randomUUID();
      const response = await createLabel(config, request, undefined, key);
      if ('status' in response) setPending({ request, key, preview: response, attempted: false, client: { baseUrl: config.baseUrl, apiKey: config.apiKey } });
      else { setLabel(response); onLabelCreated?.(response); }
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Failed to create label';
      setError(message);
      onError?.(new Error(message));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [from, to, weightOz, lengthIn, widthIn, heightIn, carrier, service, config, onLabelCreated, onError, maximum, pending]);

  async function approve() {
    if (!pending || busy.current) return;
    if (!pending.attempted && Date.parse(pending.preview.expiresAt) <= Date.now()) {
      setError('Approval expired. Cancel and preview again.');
      return;
    }
    busy.current = true;
    setLoading(true);
    setError(null);
    setPending({ ...pending, attempted: true });
    try {
      const result = await createLabel(pending.client, pending.request, undefined, pending.key, pending.preview.confirmationToken);
      if ('status' in result) throw new Error('Purchase did not return a label.');
      setLabel(result); setPending(null); onLabelCreated?.(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Purchase outcome is unknown.';
      setError(`${message} Retain purchase reference ${pending.key}. Retry this purchase only; do not create another label. Contact an operator if reconciliation is required.`);
      onError?.(new Error(message));
    } finally { busy.current = false; setLoading(false); }
  }

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
        <fieldset disabled={loading || pending !== null} style={{ border: 0, padding: 0, margin: 0 }}>
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
              <label style={s.label}>Carrier</label>
              <select style={s.select} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                <option value="">Select carrier</option>
                <option value="usps">USPS</option>
                <option value="ups">UPS</option>
                <option value="fedex">FedEx</option>
                <option value="dhl">DHL Express</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Service</label>
              <input style={s.input} type="text" placeholder="e.g., priority"
                value={service} onChange={(e) => setService(e.target.value)} />
            </div>
          </div>
        )}

        <div style={s.fieldGroupFull}>
          <label style={s.label} htmlFor={maximumId}>Maximum postage (USD)</label>
          <input id={maximumId} style={s.input} type="number" min="0.01" max="1000000" step="0.01"
            value={maximum} onChange={(e) => setMaximum(e.target.value)} required />
        </div>
        <button type="submit" style={loading ? s.buttonDisabled : s.button} disabled={loading}>
          {loading ? 'Requesting preview...' : 'Preview Postage'}
        </button>
        </fieldset>
      </form>
      {pending && <section aria-label="Approve postage" style={s.successBox}>
        <h4>Approve Postage</h4>
        <p>Quoted postage: {formatCurrency(pending.preview.quotedPostageAmount)} USD</p>
        <p>Maximum authorized postage: {formatCurrency(pending.preview.maximumPostageAmount)} USD</p>
        <p>Later carrier adjustments and separate fees are outside this maximum.</p>
        <p>Approval expires: {new Date(pending.preview.expiresAt).toLocaleString()}</p>
        <button type="button" disabled={loading} style={s.button} onClick={approve}>
          {pending.attempted ? 'Retry Same Purchase' : 'Approve and Buy'}
        </button>
        {!pending.attempted && <button type="button" disabled={loading} onClick={() => { setPending(null); setError(null); }}>Cancel</button>}
      </section>}

      {error && <div role="alert" style={s.errorMessage}>{error}</div>}
      {loading && <div style={s.loading}>Creating your shipping label...</div>}
    </div>
  );
}
