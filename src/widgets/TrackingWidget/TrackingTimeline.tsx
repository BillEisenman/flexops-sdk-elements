// Copyright (c) FlexOps, LLC. All rights reserved.

import React from 'react';
import type { WidgetTrackingEvent } from '../../api/types';
import type { FlexOpsTheme } from '../../provider/types';
import { getStyles } from './styles';
import { formatDate } from '../../utils/format';

interface TrackingTimelineProps {
  events: WidgetTrackingEvent[];
  theme: FlexOpsTheme;
  accentColor?: string;
}

export function TrackingTimeline({ events, theme, accentColor }: TrackingTimelineProps) {
  const s = getStyles(theme);
  const dotColor = accentColor ?? theme.primaryColor;

  if (events.length === 0) return null;

  return (
    <div style={s.timelineContainer}>
      <div style={s.timelineHeading}>Tracking History</div>
      {events.map((event, index) => (
        <div key={`${event.timestamp}-${index}`} style={s.timelineItem}>
          <div>
            <div style={{ ...s.timelineDot, backgroundColor: index === 0 ? dotColor : theme.borderColor }} />
            {index < events.length - 1 && <div style={s.timelineLine} />}
          </div>
          <div style={s.timelineContent}>
            <div style={s.timelineDescription}>{event.description}</div>
            <div style={s.timelineMeta}>
              {formatDate(event.timestamp)}
              {event.location && ` \u2022 ${event.location}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
