// Copyright (c) FlexOps, LLC. All rights reserved.

/** Theme configuration for FlexOps widgets. */
export interface FlexOpsTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
}

/** Default theme values. */
export const defaultTheme: FlexOpsTheme = {
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  mutedTextColor: '#64748b',
  borderColor: '#e2e8f0',
  borderRadius: '8px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  successColor: '#16a34a',
  errorColor: '#dc2626',
  warningColor: '#d97706',
};

/** Configuration for the FlexOps provider. */
export interface FlexOpsConfig {
  /** Base URL of the FlexOps Gateway API, or of your own server route for widgets that need a key. */
  baseUrl: string;
  /** Optional sandbox key (test_...). Any other key is refused in a browser: keep it on your server. */
  apiKey?: string;
  /** Optional workspace ID for attribution. */
  workspaceId?: string;
  /** Theme overrides. */
  theme?: Partial<FlexOpsTheme>;
}
