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

  const successBox: CSSProperties = {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: `${theme.successColor}08`,
    border: `1px solid ${theme.successColor}25`,
  };

  const successTitle: CSSProperties = {
    fontWeight: 600,
    color: theme.successColor,
    marginBottom: '8px',
    fontSize: '13px',
  };

  const normalizedLine: CSSProperties = {
    fontSize: '13px',
    color: theme.textColor,
    lineHeight: '1.5',
  };

  const warningBox: CSSProperties = {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: `${theme.warningColor}08`,
    border: `1px solid ${theme.warningColor}25`,
  };

  const warningText: CSSProperties = {
    fontSize: '13px',
    color: theme.warningColor,
  };

  const errorMessage: CSSProperties = {
    color: theme.errorColor,
    fontSize: '13px',
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: `${theme.errorColor}10`,
    borderRadius: '6px',
  };

  const loading: CSSProperties = {
    textAlign: 'center' as const,
    padding: '12px',
    color: theme.mutedTextColor,
  };

  return {
    container, heading, fieldGroup, fieldGroupFull, label, input,
    button, buttonDisabled, successBox, successTitle, normalizedLine,
    warningBox, warningText, errorMessage, loading,
  };
}
