// Copyright (c) FlexOps, LLC. All rights reserved.

/**
 * The error a widget reports to `onError`: the thrown Error itself, so a FlexOpsApiError keeps
 * its `status`, `errorCode` and `data`; anything else becomes an Error with its message, or the
 * fallback.
 */
export function toError(err: unknown, fallback: string): Error {
  if (err instanceof Error) return err;
  const message = (err as { message?: unknown } | null | undefined)?.message;
  return new Error(typeof message === 'string' ? message : fallback);
}
