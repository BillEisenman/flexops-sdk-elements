// Copyright (c) FlexOps, LLC. All rights reserved.

import React from 'react';
import type { RateFormValues } from './types';
import type { FlexOpsTheme } from '../../provider/types';
import { getStyles } from './styles';

interface RateFormProps {
  values: RateFormValues;
  onChange: (values: RateFormValues) => void;
  onSubmit: () => void;
  loading: boolean;
  showDimensions: boolean;
  showCountry: boolean;
  theme: FlexOpsTheme;
}

export function RateForm({
  values, onChange, onSubmit, loading, showDimensions, showCountry, theme,
}: RateFormProps) {
  const s = getStyles(theme);

  function update(field: keyof RateFormValues, value: string) {
    onChange({ ...values, [field]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.fieldGroup}>
        <div>
          <label style={s.label}>From ZIP</label>
          <input
            style={s.input}
            type="text"
            placeholder="10001"
            value={values.fromPostalCode}
            onChange={(e) => update('fromPostalCode', e.target.value)}
            maxLength={10}
            required
          />
        </div>
        <div>
          <label style={s.label}>To ZIP</label>
          <input
            style={s.input}
            type="text"
            placeholder="90210"
            value={values.toPostalCode}
            onChange={(e) => update('toPostalCode', e.target.value)}
            maxLength={10}
            required
          />
        </div>
      </div>

      {showCountry && (
        <div style={s.fieldGroup}>
          <div>
            <label style={s.label}>From Country</label>
            <input
              style={s.input}
              type="text"
              placeholder="US"
              value={values.fromCountry}
              onChange={(e) => update('fromCountry', e.target.value)}
              maxLength={2}
            />
          </div>
          <div>
            <label style={s.label}>To Country</label>
            <input
              style={s.input}
              type="text"
              placeholder="US"
              value={values.toCountry}
              onChange={(e) => update('toCountry', e.target.value)}
              maxLength={2}
            />
          </div>
        </div>
      )}

      <div style={s.fieldGroupFull}>
        <div>
          <label style={s.label}>Weight (oz)</label>
          <input
            style={s.input}
            type="number"
            placeholder="16"
            value={values.weightOz}
            onChange={(e) => update('weightOz', e.target.value)}
            min="0.1"
            step="0.1"
            required
          />
        </div>
      </div>

      {showDimensions && (
        <div style={{ ...s.fieldGroup, gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div>
            <label style={s.label}>Length (in)</label>
            <input
              style={s.input}
              type="number"
              placeholder="12"
              value={values.lengthIn}
              onChange={(e) => update('lengthIn', e.target.value)}
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label style={s.label}>Width (in)</label>
            <input
              style={s.input}
              type="number"
              placeholder="8"
              value={values.widthIn}
              onChange={(e) => update('widthIn', e.target.value)}
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label style={s.label}>Height (in)</label>
            <input
              style={s.input}
              type="number"
              placeholder="6"
              value={values.heightIn}
              onChange={(e) => update('heightIn', e.target.value)}
              min="0.1"
              step="0.1"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        style={loading ? s.buttonDisabled : s.button}
        disabled={loading}
      >
        {loading ? 'Getting Rates...' : 'Get Shipping Rates'}
      </button>
    </form>
  );
}
