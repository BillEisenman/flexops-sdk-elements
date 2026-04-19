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
    padding: '16px 20px',
    maxWidth: '480px',
    boxSizing: 'border-box',
  };

  const containerInline: CSSProperties = {
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
    color: theme.textColor,
    boxSizing: 'border-box',
  };

  const heading: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '12px',
    color: theme.textColor,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const zipRow: CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
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

  const promiseCard: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: `${theme.successColor}08`,
    border: `1px solid ${theme.successColor}25`,
    marginBottom: '8px',
  };

  const promiseIcon: CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: `${theme.successColor}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: theme.successColor,
    fontSize: '18px',
  };

  const promiseContent: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const promiseDateLabel: CSSProperties = {
    fontSize: '12px',
    color: theme.mutedTextColor,
    marginBottom: '2px',
  };

  const promiseDate: CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    color: theme.successColor,
  };

  const promiseCarrier: CSSProperties = {
    fontSize: '12px',
    color: theme.mutedTextColor,
    marginTop: '2px',
  };

  const promiseConfidence: CSSProperties = {
    fontSize: '11px',
    color: theme.mutedTextColor,
    fontStyle: 'italic',
    textAlign: 'right' as const,
    flexShrink: 0,
  };

  const cutoffNotice: CSSProperties = {
    fontSize: '12px',
    color: theme.warningColor,
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const multiResultList: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
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
    padding: '12px',
    color: theme.mutedTextColor,
    fontSize: '13px',
  };

  return {
    container, containerInline, heading, zipRow, input, button,
    promiseCard, promiseIcon, promiseContent,
    promiseDateLabel, promiseDate, promiseCarrier, promiseConfidence,
    cutoffNotice, multiResultList, errorMessage, loading,
  };
}
