// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useCallback } from 'react';
import { useFlexOps, resolveTheme } from '../../provider/context';
import { validateAddress } from '../../api/client';
import type { AddressValidationResult } from '../../api/types';
import type { AddressFormProps, AddressFormValues } from './types';
import { getStyles } from './styles';

/**
 * Embeddable address form with validation. Validates and normalizes
 * shipping addresses via the FlexOps address validation API.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io', apiKey: 'fxk_live_...' }}>
 *   <AddressForm onAddressValidated={(result) => console.log(result)} />
 * </FlexOpsProvider>
 * ```
 */
export function AddressForm({
  defaultStreet1 = '',
  defaultStreet2 = '',
  defaultCity = '',
  defaultState = '',
  defaultPostalCode = '',
  defaultCountry = 'US',
  autoValidate = true,
  onAddressValidated,
  onError,
  submitLabel = 'Validate Address',
  className,
  style,
  theme: themeOverride,
}: AddressFormProps) {
  const { config, theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);

  const [values, setValues] = useState<AddressFormValues>({
    street1: defaultStreet1,
    street2: defaultStreet2,
    city: defaultCity,
    state: defaultState,
    postalCode: defaultPostalCode,
    country: defaultCountry,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AddressValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof AddressFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setError(null);
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.street1.trim() || !values.city.trim() || !values.state.trim() || !values.postalCode.trim()) {
      setError('Please fill in street, city, state, and postal code.');
      return;
    }

    if (!autoValidate) {
      const passthrough: AddressValidationResult = {
        isValid: true,
        normalizedAddress: {
          street1: values.street1.trim(),
          street2: values.street2.trim() || null,
          city: values.city.trim(),
          state: values.state.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country.trim() || 'US',
        },
        messages: [],
      };
      setResult(passthrough);
      onAddressValidated?.(passthrough);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await validateAddress(config, {
        street1: values.street1.trim(),
        street2: values.street2.trim() || undefined,
        city: values.city.trim(),
        state: values.state.trim(),
        postalCode: values.postalCode.trim(),
        country: values.country.trim() || 'US',
      });
      setResult(response);
      onAddressValidated?.(response);
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Address validation failed';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [values, config, autoValidate, onAddressValidated, onError]);

  return (
    <div style={{ ...s.container, ...style }} className={className}>
      <h3 style={s.heading}>Shipping Address</h3>

      <form onSubmit={handleSubmit}>
        <div style={s.fieldGroupFull}>
          <label style={s.label}>Street Address</label>
          <input style={s.input} type="text" placeholder="123 Main St"
            value={values.street1} onChange={(e) => update('street1', e.target.value)} required />
        </div>

        <div style={s.fieldGroupFull}>
          <label style={s.label}>Street Line 2</label>
          <input style={s.input} type="text" placeholder="Apt, Suite, Unit"
            value={values.street2} onChange={(e) => update('street2', e.target.value)} />
        </div>

        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>City</label>
            <input style={s.input} type="text" placeholder="New York"
              value={values.city} onChange={(e) => update('city', e.target.value)} required />
          </div>
          <div>
            <label style={s.label}>State</label>
            <input style={s.input} type="text" placeholder="NY" maxLength={3}
              value={values.state} onChange={(e) => update('state', e.target.value)} required />
          </div>
        </div>

        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>Postal Code</label>
            <input style={s.input} type="text" placeholder="10001" maxLength={10}
              value={values.postalCode} onChange={(e) => update('postalCode', e.target.value)} required />
          </div>
          <div>
            <label style={s.label}>Country</label>
            <input style={s.input} type="text" placeholder="US" maxLength={2}
              value={values.country} onChange={(e) => update('country', e.target.value)} />
          </div>
        </div>

        <button type="submit" style={loading ? s.buttonDisabled : s.button} disabled={loading}>
          {loading ? 'Validating...' : submitLabel}
        </button>
      </form>

      {error && <div style={s.errorMessage}>{error}</div>}
      {loading && <div style={s.loading}>Validating address...</div>}

      {result && !loading && result.isValid && result.normalizedAddress && (
        <div style={s.successBox}>
          <div style={s.successTitle}>&#10003; Address Verified</div>
          <div style={s.normalizedLine}>{result.normalizedAddress.street1}</div>
          {result.normalizedAddress.street2 && (
            <div style={s.normalizedLine}>{result.normalizedAddress.street2}</div>
          )}
          <div style={s.normalizedLine}>
            {result.normalizedAddress.city}, {result.normalizedAddress.state} {result.normalizedAddress.postalCode}
          </div>
        </div>
      )}

      {result && !loading && !result.isValid && (
        <div style={s.warningBox}>
          {result.messages.map((msg, i) => (
            <div key={i} style={s.warningText}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}
