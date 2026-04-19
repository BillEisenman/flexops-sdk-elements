// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { useFlexOps } from '../src/provider/context';

function TestConsumer() {
  const { config, theme } = useFlexOps();
  return (
    <div>
      <span data-testid="base-url">{config.baseUrl}</span>
      <span data-testid="primary-color">{theme.primaryColor}</span>
      <span data-testid="api-key">{config.apiKey ?? 'none'}</span>
    </div>
  );
}

describe('FlexOpsProvider', () => {
  it('provides config and default theme to children', () => {
    render(
      <FlexOpsProvider config={{ baseUrl: 'https://api.test.com' }}>
        <TestConsumer />
      </FlexOpsProvider>,
    );

    expect(screen.getByTestId('base-url').textContent).toBe('https://api.test.com');
    expect(screen.getByTestId('primary-color').textContent).toBe('#2563eb');
    expect(screen.getByTestId('api-key').textContent).toBe('none');
  });

  it('merges custom theme with defaults', () => {
    render(
      <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', theme: { primaryColor: '#ff0000' } }}>
        <TestConsumer />
      </FlexOpsProvider>,
    );

    expect(screen.getByTestId('primary-color').textContent).toBe('#ff0000');
  });

  it('passes API key through config', () => {
    render(
      <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_abc123' }}>
        <TestConsumer />
      </FlexOpsProvider>,
    );

    expect(screen.getByTestId('api-key').textContent).toBe('fxk_test_abc123');
  });
});

describe('useFlexOps', () => {
  it('throws when used outside provider', () => {
    function BadConsumer() {
      useFlexOps();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      'useFlexOps must be used within a <FlexOpsProvider>',
    );
  });
});
