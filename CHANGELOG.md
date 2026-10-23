# Changelog

## 3.2.0 (2026-10-22)

### Fixed

- `onError` now receives the Gateway's error code. Every widget passes a failed request's `FlexOpsApiError` to `onError` as thrown, instead of a new `Error` holding only the message, so an integrator can tell refusals such as `HazmatDeclarationRequired`, `HAZMAT_ATTESTATION_REQUIRED` and `VALIDATION_FAILED` apart. `FlexOpsApiError` extends `Error` and carries the HTTP `status`, the error envelope's `errorCode` (or `undefined`) and its `data` when present; `message` is unchanged. It is now exported: `if (error instanceof FlexOpsApiError && error.errorCode === 'HazmatDeclarationRequired') ...`. The `onError` parameter type is still `Error`, so existing handlers compile unchanged. Errors that are not from a Gateway response, such as a network failure, still arrive as the `Error` that was thrown.

## 3.1.0 (2026-10-22)

### Added

- `DeliveryPromise` prop `service`: quote only the service you ship with, such as `"Ground Advantage"` or `"USPS Priority Mail"`, matched on the whole service name, or carrier and service name, ignoring case. Without it the widget still shows the fastest service, which for USPS is Priority Mail Express. When the estimate does not quote that service, the widget says so and does not call `onError`; `onEstimateLoaded` receives only the matching service.

## 3.0.0 (2026-10-19)

Releases the Gateway alignment and HAZMAT declaration work merged since 2.0.0, ahead of the Gateway's order-less HAZMAT Enforce rule. It is a major release because public exports and props changed.

### Breaking

- Removed `ReturnPortal`, `ReturnPortalProps` and the `ReturnableItem`, `ReturnEligibilityResponse` and `ReturnConfirmation` types. The Gateway has no shopper return routes; returns are merchant-initiated. (#34)
- `ShippingLabelProps` requires `hazmatClassification` unless `orderId` is set. A label without an order must declare what the parcel holds (`HazmatClassification.None` for an ordinary parcel); the Gateway refuses undeclared order-less labels with `HazmatDeclarationRequired`. Without either, the widget shows a configuration error and calls `onError` instead of requesting a label. (#32)
- `DeliveryPromise` reads transit days from `POST /api/rates/public-estimate`, the Gateway's documented route; the delivery-estimate route it called does not exist. `DeliveryEstimate.confidencePercent` is now always `null`. (#34)

### Added

- `HazmatClassification` export: the Gateway class numbers (0-6), and `ShippingLabel` props `hazmatClassification` and `orderId`. (#32)
- `DeliveryPromise` prop `weightOz` (default 16). (#34)
- Gateway contract test: every API client function runs against a recording fetch, and each call must match an operation in the Developer Docs OpenAPI snapshot (`tests/fixtures/gateway-operations.json`), with no POST, PUT, PATCH or DELETE through `/api/ApiProxy`. A client function added without a contract scenario fails the test.

### Fixed

- `AddressForm` sends `POST /api/addresses/validate` the Gateway's `line1`/`line2` request (it sent `street1`/`street2`) and maps the Gateway's `suggestedAddress` and `warnings` back; `AddressValidationResult` gains `validationUnavailable` and `isResidential`. (#34)
- An empty success response (204, or Content-Length 0) no longer fails with a JSON parse error. Lookups report `Gateway returned no content.` with the status; `ShippingLabel` treats it as neither a preview nor a label, so a purchase stays unresolved.

### Unchanged

- Requests and retries: only `ShippingLabel` sends an `Idempotency-Key`, one per purchase and reused on **Retry Same Purchase**. Elements never retries a request on its own.
