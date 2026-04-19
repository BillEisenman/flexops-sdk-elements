// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import { checkReturnEligibility, submitReturn } from '../../api/client';
import type { ReturnableItem, ReturnEligibilityResponse, ReturnConfirmation } from '../../api/types';
import type { ReturnPortalProps } from './types';
import { getStyles } from './styles';
import { formatCurrency } from '../../utils/format';

const DEFAULT_REASONS = [
  'Wrong item received',
  'Item damaged',
  'Item defective',
  'No longer needed',
  'Better price found',
  'Item not as described',
  'Other',
];

interface SelectedItem {
  lineItemId: string;
  quantity: number;
  reason: string;
}

/**
 * Embeddable self-service return portal. Customers look up their order,
 * select items to return, and receive an RMA with label or QR code.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io', apiKey: 'fxk_live_...' }}>
 *   <ReturnPortal
 *     returnReasons={['Damaged', 'Wrong item', 'Changed mind']}
 *     onReturnSubmitted={(conf) => console.log('RMA:', conf.rmaNumber)}
 *   />
 * </FlexOpsProvider>
 * ```
 */
export function ReturnPortal({
  defaultOrderNumber = '',
  defaultEmailOrZip = '',
  returnReasons,
  skipLookup = false,
  onReturnSubmitted,
  onError,
  className,
  style,
  theme: themeOverride,
}: ReturnPortalProps) {
  const { config, theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);
  const reasons = returnReasons?.length ? returnReasons : DEFAULT_REASONS;

  const [step, setStep] = useState<'lookup' | 'select' | 'confirm'>('lookup');
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [emailOrZip, setEmailOrZip] = useState(defaultEmailOrZip);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [eligibility, setEligibility] = useState<ReturnEligibilityResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [confirmation, setConfirmation] = useState<ReturnConfirmation | null>(null);

  const lookupOrder = useCallback(async () => {
    if (!orderNumber.trim() || !emailOrZip.trim()) {
      setError('Please enter your order number and email or ZIP code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await checkReturnEligibility(config, {
        orderNumber: orderNumber.trim(),
        emailOrZip: emailOrZip.trim(),
      });

      setEligibility(response);

      if (!response.eligible) {
        setError(response.message ?? 'This order is not eligible for returns.');
      } else {
        setStep('select');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Failed to look up order';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [orderNumber, emailOrZip, config, onError]);

  // Auto-lookup if both defaults are provided and skipLookup is true
  useEffect(() => {
    if (skipLookup && defaultOrderNumber && defaultEmailOrZip) {
      lookupOrder();
    }
  }, [skipLookup, defaultOrderNumber, defaultEmailOrZip, lookupOrder]);

  function toggleItem(item: ReturnableItem, checked: boolean) {
    if (checked) {
      setSelectedItems((prev) => [...prev, {
        lineItemId: item.lineItemId,
        quantity: 1,
        reason: reasons[0],
      }]);
    } else {
      setSelectedItems((prev) => prev.filter((s) => s.lineItemId !== item.lineItemId));
    }
  }

  function updateItemQuantity(lineItemId: string, qty: number) {
    setSelectedItems((prev) => prev.map((s) =>
      s.lineItemId === lineItemId ? { ...s, quantity: qty } : s
    ));
  }

  function updateItemReason(lineItemId: string, reason: string) {
    setSelectedItems((prev) => prev.map((s) =>
      s.lineItemId === lineItemId ? { ...s, reason } : s
    ));
  }

  async function handleSubmitReturn() {
    if (selectedItems.length === 0) {
      setError('Please select at least one item to return.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitReturn(config, {
        orderNumber: orderNumber.trim(),
        emailOrZip: emailOrZip.trim(),
        items: selectedItems,
      });
      setConfirmation(result);
      setStep('confirm');
      onReturnSubmitted?.(result);
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Failed to submit return';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...s.container, ...style }} className={className}>
      <h3 style={s.heading}>Start a Return</h3>

      {/* Step 1: Order Lookup */}
      {step === 'lookup' && (
        <>
          <div style={s.stepIndicator}>Step 1 of 3 — Find your order</div>
          <div style={s.fieldGroupFull}>
            <label style={s.label}>Order Number</label>
            <input style={s.input} type="text" placeholder="ORD-12345"
              value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
          </div>
          <div style={s.fieldGroupFull}>
            <label style={s.label}>Email or ZIP Code</label>
            <input style={s.input} type="text" placeholder="you@example.com or 10001"
              value={emailOrZip} onChange={(e) => setEmailOrZip(e.target.value)} />
          </div>
          <button type="button" style={loading ? s.buttonDisabled : s.button}
            onClick={lookupOrder} disabled={loading}>
            {loading ? 'Looking up order...' : 'Find Order'}
          </button>
        </>
      )}

      {/* Step 2: Item Selection */}
      {step === 'select' && eligibility && (
        <>
          <div style={s.stepIndicator}>Step 2 of 3 — Select items to return</div>

          {eligibility.returnWindowCloses && (
            <div style={s.windowNotice}>
              &#9200; Return window closes {eligibility.returnWindowCloses}
            </div>
          )}

          {eligibility.items.map((item) => {
            const selected = selectedItems.find((s) => s.lineItemId === item.lineItemId);
            return (
              <div key={item.lineItemId} style={s.itemCard}>
                <input type="checkbox" style={s.checkbox}
                  checked={!!selected}
                  onChange={(e) => toggleItem(item, e.target.checked)}
                  aria-label={`Select ${item.productName}`} />
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} style={s.itemImage} />
                ) : (
                  <div style={s.itemImage} />
                )}
                <div style={s.itemInfo}>
                  <div style={s.itemName}>{item.productName}</div>
                  <div style={s.itemSku}>SKU: {item.sku}</div>
                  <div style={s.itemPrice}>{formatCurrency(item.price)} x {item.quantity}</div>
                  {selected && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label style={{ ...s.label, marginBottom: 0 }}>Qty:</label>
                      <input type="number" style={s.qtyInput} min={1} max={item.maxReturnableQty}
                        value={selected.quantity}
                        onChange={(e) => updateItemQuantity(item.lineItemId, Math.min(parseInt(e.target.value) || 1, item.maxReturnableQty))} />
                      <select style={s.select} value={selected.reason}
                        onChange={(e) => updateItemReason(item.lineItemId, e.target.value)}>
                        {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button type="button" style={loading || selectedItems.length === 0 ? s.buttonDisabled : s.button}
            onClick={handleSubmitReturn} disabled={loading || selectedItems.length === 0}>
            {loading ? 'Submitting return...' : `Return ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}`}
          </button>
          <button type="button" style={{ ...s.buttonSecondary, marginTop: '8px' }}
            onClick={() => { setStep('lookup'); setEligibility(null); setSelectedItems([]); }}>
            Back
          </button>
        </>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirm' && confirmation && (
        <div style={s.successBox}>
          <div style={s.successTitle}>&#10003; Return Submitted</div>
          <div style={s.rmaNumber}>RMA #{confirmation.rmaNumber}</div>
          <div style={s.instructions}>{confirmation.instructions}</div>
          {confirmation.returnLabelUrl && (
            <a href={confirmation.returnLabelUrl} target="_blank" rel="noopener noreferrer" style={s.linkButton}>
              Download Return Label
            </a>
          )}
          {confirmation.qrCodeUrl && (
            <div style={{ marginTop: '12px' }}>
              <img src={confirmation.qrCodeUrl} alt="QR Code for drop-off" style={{ width: '120px', height: '120px' }} />
              <div style={{ ...s.instructions, marginTop: '4px' }}>Show this QR code at any drop-off location</div>
            </div>
          )}
        </div>
      )}

      {error && <div style={s.errorMessage}>{error}</div>}
    </div>
  );
}
