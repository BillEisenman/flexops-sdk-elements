// Copyright (c) FlexOps, LLC. All rights reserved.

import { createContext, useContext } from 'react';
import type { FlexOpsConfig, FlexOpsTheme } from './types';
import { defaultTheme } from './types';

export interface FlexOpsContextValue {
  config: FlexOpsConfig;
  theme: FlexOpsTheme;
}

export const FlexOpsContext = createContext<FlexOpsContextValue | null>(null);

/** Hook to access FlexOps configuration and theme. */
export function useFlexOps(): FlexOpsContextValue {
  const ctx = useContext(FlexOpsContext);
  if (!ctx) {
    throw new Error('useFlexOps must be used within a <FlexOpsProvider>');
  }
  return ctx;
}

/** Merge user theme overrides with defaults. */
export function resolveTheme(overrides?: Partial<FlexOpsTheme>): FlexOpsTheme {
  if (!overrides) return { ...defaultTheme };
  return { ...defaultTheme, ...overrides };
}
