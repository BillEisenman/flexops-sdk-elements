// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState } from 'react';
import type { FlexOpsTheme } from '../../provider/types';
import { getStyles } from './styles';

interface TrackingSearchProps {
  onSearch: (token: string) => void;
  loading: boolean;
  theme: FlexOpsTheme;
}

export function TrackingSearch({ onSearch, loading, theme }: TrackingSearchProps) {
  const s = getStyles(theme);
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} style={s.searchRow}>
      <input
        style={s.input}
        type="text"
        placeholder="Enter tracking token"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={64}
        aria-label="Tracking token"
      />
      <button
        type="submit"
        style={s.button}
        disabled={loading || !value.trim()}
      >
        {loading ? 'Loading...' : 'Track'}
      </button>
    </form>
  );
}
