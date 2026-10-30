// Copyright (c) FlexOps, LLC. All rights reserved.

/**
 * Only sandbox (`test_`) keys may run in a web page: anyone can read a key sent from a browser, and
 * the rest can spend money. Thrown before any request, and never repeats the key.
 */
export function assertApiKeyAllowedHere(apiKey: string | undefined): void {
  if (apiKey && typeof window !== 'undefined' && !apiKey.startsWith('test_')) {
    throw new Error(
      'FlexOps Elements only accepts test_ API keys in the browser. Keep other keys on your server and '
      + 'set baseUrl to a server route that adds the key. See "API keys and your server" in the README.',
    );
  }
}
