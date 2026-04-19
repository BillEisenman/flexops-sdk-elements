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

  const textarea: CSSProperties = {
    ...input,
    minHeight: '60px',
    resize: 'vertical' as const,
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
    alignItems: 'flex-start',
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

  const hsCodeBadge: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: theme.primaryColor,
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'monospace',
    flexShrink: 0,
    marginRight: '12px',
    whiteSpace: 'nowrap',
  };

  const resultInfo: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const codeName: CSSProperties = {
    fontWeight: 600,
    fontSize: '14px',
    color: theme.textColor,
  };

  const codeDescription: CSSProperties = {
    fontSize: '12px',
    color: theme.mutedTextColor,
    marginTop: '4px',
    lineHeight: '1.4',
  };

  const confidenceBar: CSSProperties = {
    height: '6px',
    borderRadius: '3px',
    backgroundColor: theme.borderColor,
    marginTop: '8px',
    overflow: 'hidden',
  };

  const confidenceLabel: CSSProperties = {
    fontSize: '11px',
    color: theme.mutedTextColor,
    marginTop: '4px',
  };

  const dutyRate: CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: theme.secondaryColor,
    marginTop: '4px',
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
    padding: '20px',
    color: theme.mutedTextColor,
  };

  return {
    container, heading, fieldGroupFull, label, input, textarea,
    button, buttonDisabled, resultsList, resultItem, resultItemHover,
    hsCodeBadge, resultInfo, codeName, codeDescription,
    confidenceBar, confidenceLabel, dutyRate, errorMessage, loading,
  };
}
