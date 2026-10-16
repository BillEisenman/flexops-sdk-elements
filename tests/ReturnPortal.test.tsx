// Copyright (c) FlexOps, LLC. All rights reserved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FlexOpsProvider } from '../src/provider/FlexOpsProvider';
import { ReturnPortal } from '../src/widgets/ReturnPortal/ReturnPortal';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FlexOpsProvider config={{ baseUrl: 'https://api.test.com', apiKey: 'fxk_test_key' }}>
    {children}
  </FlexOpsProvider>
);

const unavailable = 'Self-service returns are not available yet. Please contact the store to start a return.';

beforeEach(() => {
  mockFetch.mockReset();
});

// The Gateway has no shopper return route (POST /api/returns/eligibility and
// /api/returns/submit do not exist), so the widget must fail clearly, not 404 (#33).
describe('ReturnPortal', () => {
  it('shows that self-service returns are unavailable instead of a lookup form', () => {
    render(<ReturnPortal />, { wrapper });

    expect(screen.getByText('Start a Return')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(unavailable);
    expect(screen.queryByPlaceholderText('ORD-12345')).not.toBeInTheDocument();
    expect(screen.queryByText('Find Order')).not.toBeInTheDocument();
  });

  it('reports the gap through onError once', async () => {
    const onError = vi.fn();
    const { rerender } = render(<ReturnPortal onError={onError} />, { wrapper });
    rerender(<ReturnPortal onError={onError} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect(onError.mock.calls[0][0].message).toBe(unavailable);
  });

  it('never calls the Gateway, even with an order to look up', async () => {
    const onReturnSubmitted = vi.fn();
    render(
      <ReturnPortal defaultOrderNumber="ORD-1" defaultEmailOrZip="10001" skipLookup onReturnSubmitted={onReturnSubmitted} />,
      { wrapper },
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(mockFetch).not.toHaveBeenCalled();
    expect(onReturnSubmitted).not.toHaveBeenCalled();
  });
});
