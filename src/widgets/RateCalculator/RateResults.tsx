// Copyright (c) FlexOps, LLC. All rights reserved.

import React, { useState } from 'react';
import type { CarrierRateEstimate } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';
import { getStyles } from './styles';
import { getCarrierInfo } from '../../utils/carrier-logos';
import { formatCurrency, formatDeliveryDays } from '../../utils/format';

interface RateResultsProps {
  rates: CarrierRateEstimate[];
  disclaimer: string;
  maxResults?: number;
  onRateSelected?: (rate: CarrierRateEstimate) => void;
  theme: FlexOpsTheme;
}

export function RateResults({
  rates, disclaimer, maxResults, onRateSelected, theme,
}: RateResultsProps) {
  const s = getStyles(theme);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayRates = maxResults ? rates.slice(0, maxResults) : rates;

  if (displayRates.length === 0) {
    return (
      <div style={{ ...s.loading, padding: '12px' }}>
        No rates available for this route.
      </div>
    );
  }

  return (
    <div>
      <ul style={s.resultsList}>
        {displayRates.map((rate, index) => {
          const carrier = getCarrierInfo(rate.carrierName);
          return (
            <li
              key={`${rate.carrierName}-${rate.serviceName}-${index}`}
              style={hoveredIndex === index ? s.resultItemHover : s.resultItem}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onRateSelected?.(rate)}
              role={onRateSelected ? 'button' : undefined}
              tabIndex={onRateSelected ? 0 : undefined}
              onKeyDown={(e) => {
                if (onRateSelected && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRateSelected(rate);
                }
              }}
            >
              <div
                style={{ ...s.carrierBadge, backgroundColor: carrier.color }}
                title={carrier.displayName}
              >
                {carrier.abbreviation}
              </div>
              <div style={s.resultInfo}>
                <div style={s.carrierName}>{carrier.displayName}</div>
                <div style={s.serviceName}>{rate.serviceName}</div>
              </div>
              <div>
                <div style={s.resultPrice}>
                  {formatCurrency(rate.estimatedRate)}
                </div>
                <div style={s.deliveryDays}>
                  {formatDeliveryDays(rate.estimatedDeliveryDays)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {disclaimer && <p style={s.disclaimer}>{disclaimer}</p>}
    </div>
  );
}
