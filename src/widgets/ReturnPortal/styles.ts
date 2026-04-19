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
    marginTop: '4px',
  };

  const buttonDisabled: CSSProperties = {
    ...button,
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const buttonSecondary: CSSProperties = {
    ...button,
    backgroundColor: theme.secondaryColor,
  };

  const itemCard: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '6px',
    marginBottom: '8px',
  };

  const itemImage: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    objectFit: 'cover' as const,
    backgroundColor: `${theme.borderColor}`,
    flexShrink: 0,
  };

  const itemInfo: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const itemName: CSSProperties = {
    fontWeight: 600,
    fontSize: '14px',
    color: theme.textColor,
  };

  const itemSku: CSSProperties = {
    fontSize: '12px',
    color: theme.mutedTextColor,
    marginTop: '2px',
  };

  const itemPrice: CSSProperties = {
    fontSize: '13px',
    color: theme.mutedTextColor,
    marginTop: '2px',
  };

  const checkbox: CSSProperties = {
    width: '18px',
    height: '18px',
    flexShrink: 0,
    accentColor: theme.primaryColor,
  };

  const qtyInput: CSSProperties = {
    width: '50px',
    padding: '4px 8px',
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center' as const,
  };

  const windowNotice: CSSProperties = {
    fontSize: '12px',
    color: theme.warningColor,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const successBox: CSSProperties = {
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: `${theme.successColor}08`,
    border: `1px solid ${theme.successColor}25`,
    textAlign: 'center' as const,
  };

  const successTitle: CSSProperties = {
    fontWeight: 700,
    fontSize: '16px',
    color: theme.successColor,
    marginBottom: '8px',
  };

  const rmaNumber: CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: theme.textColor,
    marginBottom: '8px',
  };

  const instructions: CSSProperties = {
    fontSize: '13px',
    color: theme.mutedTextColor,
    marginTop: '8px',
    lineHeight: '1.5',
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

  const stepIndicator: CSSProperties = {
    fontSize: '12px',
    color: theme.mutedTextColor,
    marginBottom: '12px',
  };

  return {
    container, heading, fieldGroupFull, label, input, select,
    button, buttonDisabled, buttonSecondary,
    itemCard, itemImage, itemInfo, itemName, itemSku, itemPrice,
    checkbox, qtyInput, windowNotice,
    successBox, successTitle, rmaNumber, instructions, linkButton,
    errorMessage, loading, stepIndicator,
  };
}
