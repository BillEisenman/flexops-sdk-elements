// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useMemo } from 'react';
import { FlexOpsContext, resolveTheme } from './context';
import type { FlexOpsConfig } from './types';

export interface FlexOpsProviderProps {
  /** FlexOps configuration including baseUrl and optional API key. */
  config: FlexOpsConfig;
  children: React.ReactNode;
}

/**
 * Provider component that supplies configuration and theming to all
 * FlexOps widgets. Wrap your widget tree with this component.
 *
 * @example
 * ```tsx
 * <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io' }}>
 *   <RateCalculator />
 *   <TrackingWidget token="abc123" />
 * </FlexOpsProvider>
 * ```
 */
export function FlexOpsProvider({ config, children }: FlexOpsProviderProps) {
  const value = useMemo(() => ({
    config,
    theme: resolveTheme(config.theme),
  }), [config]);

  return (
    <FlexOpsContext.Provider value={value}>
      {children}
    </FlexOpsContext.Provider>
  );
}
