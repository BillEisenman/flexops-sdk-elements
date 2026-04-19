// Copyright (c) FlexOps, LLC. All rights reserved.

import type { CSSProperties } from 'react';
import type { FlexOpsTheme } from '../../provider/types';

export function getStyles(theme: FlexOpsTheme) {
  const container: CSSProperties = {
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
    color: theme.textColor,
    backgroundColor: theme.backgroundColor,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: theme.borderRadius,
    padding: '20px',
    maxWidth: '480px',
    boxSizing: 'border-box',
  };

  const heading: CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '16px',
    color: theme.textColor,
  };

  const searchRow: CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  };

  const input: CSSProperties = {
    flex: 1,
    padding: '8px 12px',
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '6px',
    fontSize: theme.fontSize,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
    boxSizing: 'border-box',
    outline: 'none',
  };

  const button: CSSProperties = {
    padding: '8px 16px',
    backgroundColor: theme.primaryColor,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: theme.fontSize,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: theme.fontFamily,
    whiteSpace: 'nowrap',
  };

  const brandingHeader: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${theme.borderColor}`,
  };

  const brandingLogo: CSSProperties = {
    maxHeight: '32px',
    maxWidth: '120px',
    objectFit: 'contain' as const,
  };

  const brandingName: CSSProperties = {
    fontWeight: 600,
    fontSize: '16px',
    color: theme.textColor,
  };

  const statusCard: CSSProperties = {
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center' as const,
  };

  const statusLabel: CSSProperties = {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '4px',
  };

  const statusValue: CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
  };

  const statusMessage: CSSProperties = {
    fontSize: '13px',
    marginTop: '4px',
  };

  const metaRow: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '13px',
    borderBottom: `1px solid ${theme.borderColor}`,
  };

  const metaLabel: CSSProperties = {
    color: theme.mutedTextColor,
    fontWeight: 500,
  };

  const metaValue: CSSProperties = {
    color: theme.textColor,
    fontWeight: 600,
  };

  const timelineContainer: CSSProperties = {
    marginTop: '16px',
  };

  const timelineHeading: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '12px',
    color: theme.textColor,
  };

  const timelineItem: CSSProperties = {
    display: 'flex',
    gap: '12px',
    paddingBottom: '16px',
    position: 'relative' as const,
  };

  const timelineDot: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: theme.primaryColor,
    flexShrink: 0,
    marginTop: '4px',
    position: 'relative' as const,
    zIndex: 1,
  };

  const timelineLine: CSSProperties = {
    position: 'absolute' as const,
    left: '4px',
    top: '14px',
    bottom: 0,
    width: '2px',
    backgroundColor: theme.borderColor,
  };

  const timelineContent: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const timelineDescription: CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: theme.textColor,
  };

  const timelineMeta: CSSProperties = {
    fontSize: '12px',
    color: theme.mutedTextColor,
    marginTop: '2px',
  };

  const errorMessage: CSSProperties = {
    color: theme.errorColor,
    fontSize: '13px',
    padding: '8px 12px',
    backgroundColor: `${theme.errorColor}10`,
    borderRadius: '6px',
  };

  const loading: CSSProperties = {
    textAlign: 'center' as const,
    padding: '20px',
    color: theme.mutedTextColor,
  };

  const supportFooter: CSSProperties = {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.borderColor}`,
    fontSize: '12px',
    color: theme.mutedTextColor,
    textAlign: 'center' as const,
  };

  const supportLink: CSSProperties = {
    color: theme.primaryColor,
    textDecoration: 'none',
  };

  return {
    container, heading, searchRow, input, button,
    brandingHeader, brandingLogo, brandingName,
    statusCard, statusLabel, statusValue, statusMessage,
    metaRow, metaLabel, metaValue,
    timelineContainer, timelineHeading, timelineItem,
    timelineDot, timelineLine, timelineContent,
    timelineDescription, timelineMeta,
    errorMessage, loading, supportFooter, supportLink,
  };
}
