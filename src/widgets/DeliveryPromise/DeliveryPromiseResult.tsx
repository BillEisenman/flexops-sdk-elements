// Copyright (c) FlexOps, LLC. All rights reserved.

import React from 'react';
import type { DeliveryEstimate } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';
import { getStyles } from './styles';

interface DeliveryPromiseResultProps {
  estimate: DeliveryEstimate;
  resolvedDate: Date;
  hideCarrier: boolean;
  theme: FlexOpsTheme;
}

function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function DeliveryPromiseResult({
  estimate,
  resolvedDate,
  hideCarrier,
  theme,
}: DeliveryPromiseResultProps) {
  const s = getStyles(theme);

  return (
    <div style={s.promiseCard}>
      <div style={s.promiseIcon} aria-hidden="true">&#10003;</div>
      <div style={s.promiseContent}>
        <div style={s.promiseDateLabel}>Get it by</div>
        <div style={s.promiseDate} data-testid="delivery-date">
          {formatDeliveryDate(resolvedDate)}
        </div>
        {!hideCarrier && (
          <div style={s.promiseCarrier}>
            via {estimate.carrierName} {estimate.serviceName}
          </div>
        )}
      </div>
      {estimate.confidencePercent !== null && (
        <div style={s.promiseConfidence}>
          {estimate.confidencePercent}% on-time
        </div>
      )}
    </div>
  );
}
