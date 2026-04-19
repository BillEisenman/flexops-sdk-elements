// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState, useCallback } from 'react';
import { useFlexOps } from '../../provider/context';
import { resolveTheme } from '../../provider/context';
import { fetchRates } from '../../api/client';
import type { CarrierRateEstimate, PublicRateEstimateResponse } from '../../api/types';
import type { RateCalculatorProps, RateFormValues } from './types';
import { RateForm } from './RateForm';
import { RateResults } from './RateResults';
import { getStyles } from './styles';

/**
 * Embeddable rate calculator widget. Displays shipping rate estimates
 * from multiple carriers based on origin, destination, and package details.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io' }}>
 *   <RateCalculator
 *     defaultFromPostalCode="10001"
 *     onRateSelected={(rate) => console.log('Selected:', rate)}
 *   />
 * </FlexOpsProvider>
 * ```
 */
export function RateCalculator({
  defaultFromPostalCode = '',
  defaultFromCountry = 'US',
  defaultToPostalCode = '',
  defaultToCountry = 'US',
  defaultWeightOz,
  showDimensions = true,
  showCountry = false,
  maxResults,
  onRatesFetched,
  onRateSelected,
  onError,
  className,
  style,
  theme: themeOverride,
}: RateCalculatorProps) {
  const { config, theme: providerTheme } = useFlexOps();
  const theme = themeOverride ? resolveTheme({ ...providerTheme, ...themeOverride }) : providerTheme;
  const s = getStyles(theme);

  const [formValues, setFormValues] = useState<RateFormValues>({
    fromPostalCode: defaultFromPostalCode,
    fromCountry: defaultFromCountry,
    toPostalCode: defaultToPostalCode,
    toCountry: defaultToCountry,
    weightOz: defaultWeightOz?.toString() ?? '',
    lengthIn: '',
    widthIn: '',
    heightIn: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicRateEstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const weight = parseFloat(formValues.weightOz);
    if (!formValues.fromPostalCode || !formValues.toPostalCode || isNaN(weight) || weight <= 0) {
      setError('Please fill in origin ZIP, destination ZIP, and weight.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetchRates(config, {
        fromPostalCode: formValues.fromPostalCode.trim(),
        fromCountry: formValues.fromCountry.trim() || 'US',
        toPostalCode: formValues.toPostalCode.trim(),
        toCountry: formValues.toCountry.trim() || 'US',
        weightOz: weight,
        lengthIn: formValues.lengthIn ? parseFloat(formValues.lengthIn) : undefined,
        widthIn: formValues.widthIn ? parseFloat(formValues.widthIn) : undefined,
        heightIn: formValues.heightIn ? parseFloat(formValues.heightIn) : undefined,
      });

      setResult(response);
      onRatesFetched?.(response.rates);
    } catch (err) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string }).message ?? 'Failed to fetch rates';
      setError(message);
      onError?.(new Error(message));
    } finally {
      setLoading(false);
    }
  }, [formValues, config, onRatesFetched, onError]);

  const handleRateSelected = useCallback((rate: CarrierRateEstimate) => {
    onRateSelected?.(rate);
  }, [onRateSelected]);

  return (
    <div style={{ ...s.container, ...style }} className={className}>
      <h3 style={s.heading}>Shipping Rate Calculator</h3>

      <RateForm
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleSubmit}
        loading={loading}
        showDimensions={showDimensions}
        showCountry={showCountry}
        theme={theme}
      />

      {error && <div style={s.errorMessage}>{error}</div>}

      {loading && <div style={s.loading}>Comparing rates across carriers...</div>}

      {result && !loading && (
        <RateResults
          rates={result.rates}
          disclaimer={result.disclaimer}
          maxResults={maxResults}
          onRateSelected={onRateSelected ? handleRateSelected : undefined}
          theme={theme}
        />
      )}
    </div>
  );
}
