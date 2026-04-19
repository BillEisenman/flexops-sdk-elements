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
    maxWidth: '520px',
    boxSizing: 'border-box',
  };

  const heading: CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '16px',
    color: theme.textColor,
  };

  const sectionTitle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.textColor,
    marginBottom: '8px',
    marginTop: '16px',
    paddingBottom: '4px',
    borderBottom: `1px solid ${theme.borderColor}`,
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

  const fieldGroupThree: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
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

  const inputLocked: CSSProperties = {
    ...input,
    backgroundColor: `${theme.borderColor}40`,
    color: theme.mutedTextColor,
  };

  const select: CSSProperties = {
    ...input,
    appearance: 'auto' as const,
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
    marginTop: '8px',
  };

  const buttonDisabled: CSSProperties = {
    ...button,
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const successBox: CSSProperties = {
    marginTop: '16px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: `${theme.successColor}08`,
    border: `1px solid ${theme.successColor}25`,
  };

  const successTitle: CSSProperties = {
    fontWeight: 700,
    fontSize: '16px',
    color: theme.successColor,
    marginBottom: '12px',
  };

  const metaRow: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
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

  const linkButton: CSSProperties = {
    display: 'inline-block',
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: theme.primaryColor,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: theme.fontSize,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
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
    padding: '16px',
    color: theme.mutedTextColor,
  };

  return {
    container, heading, sectionTitle, fieldGroup, fieldGroupFull, fieldGroupThree,
    label, input, inputLocked, select, button, buttonDisabled,
    successBox, successTitle, metaRow, metaLabel, metaValue, linkButton,
    errorMessage, loading,
  };
}
