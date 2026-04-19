// Copyright (c) FlexOps, LLC. All rights reserved.

import React from 'react';
import type { WidgetBranding } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';
import { getStyles } from './styles';

interface TrackingBrandingProps {
  branding: WidgetBranding;
  theme: FlexOpsTheme;
}

export function TrackingBrandingHeader({ branding, theme }: TrackingBrandingProps) {
  const s = getStyles(theme);

  if (!branding.companyName && !branding.logoUrl) return null;

  return (
    <div style={s.brandingHeader}>
      {branding.logoUrl && (
        <img
          src={branding.logoUrl}
          alt={branding.companyName ?? 'Company logo'}
          style={s.brandingLogo}
        />
      )}
      {branding.companyName && (
        <span style={s.brandingName}>{branding.companyName}</span>
      )}
    </div>
  );
}
