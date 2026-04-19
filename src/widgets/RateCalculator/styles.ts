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

  const fieldGroup: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  };

  const fieldGroupFull: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginBottom: '12px',
  };

  const label: CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: theme.mutedTextColor,
    marginBottom: '4px',
  };

  const input: CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '6px',
    fontSize: theme.fontSize,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
    backgroundColor: theme.backgroundColor,
    boxSizing: 'border-box',
    outline: 'none',
  };

  const button: CSSProperties = {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: theme.primaryColor,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: theme.fontSize,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: theme.fontFamily,
    marginTop: '4px',
  };

  const buttonDisabled: CSSProperties = {
    ...button,
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const resultsList: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '16px 0 0 0',
  };

  const resultItem: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '6px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  };

  const resultItemHover: CSSProperties = {
    ...resultItem,
    borderColor: theme.primaryColor,
  };

  const carrierBadge: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
    marginRight: '12px',
  };

  const resultInfo: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const carrierName: CSSProperties = {
    fontWeight: 600,
    fontSize: '14px',
    color: theme.textColor,
  };

  const serviceName: CSSProperties = {
    fontSize: '12px',
    color: theme.mutedTextColor,
    marginTop: '2px',
  };

  const resultPrice: CSSProperties = {
    fontWeight: 700,
    fontSize: '16px',
    color: theme.primaryColor,
    textAlign: 'right' as const,
    flexShrink: 0,
    marginLeft: '12px',
  };

  const deliveryDays: CSSProperties = {
    fontSize: '11px',
    color: theme.mutedTextColor,
    textAlign: 'right' as const,
  };

  const errorMessage: CSSProperties = {
    color: theme.errorColor,
    fontSize: '13px',
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: `${theme.errorColor}10`,
    borderRadius: '6px',
  };

  const disclaimer: CSSProperties = {
    fontSize: '11px',
    color: theme.mutedTextColor,
    marginTop: '12px',
    fontStyle: 'italic',
  };

  const loading: CSSProperties = {
    textAlign: 'center' as const,
    padding: '20px',
    color: theme.mutedTextColor,
  };

  const dimensionsToggle: CSSProperties = {
    fontSize: '12px',
    color: theme.primaryColor,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: theme.fontFamily,
    marginBottom: '12px',
  };

  return {
    container, heading, fieldGroup, fieldGroupFull, label, input,
    button, buttonDisabled, resultsList, resultItem, resultItemHover,
    carrierBadge, resultInfo, carrierName, serviceName,
    resultPrice, deliveryDays, errorMessage, disclaimer, loading,
    dimensionsToggle,
  };
}
