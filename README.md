# @flexops/elements

Embeddable React widgets for FlexOps shipping — rate calculator and package tracking.

## Installation

```bash
npm install @flexops/elements
```

## Quick Start

```tsx
import { FlexOpsProvider, RateCalculator, TrackingWidget } from '@flexops/elements';

function App() {
  return (
    <FlexOpsProvider config={{ baseUrl: 'https://gateway.flexops.io' }}>
      {/* Rate calculator with pre-filled origin */}
      <RateCalculator
        defaultFromPostalCode="10001"
        onRateSelected={(rate) => console.log('Selected:', rate)}
      />

      {/* Package tracking with a specific token */}
      <TrackingWidget token="your-tracking-token" />
    </FlexOpsProvider>
  );
}
```

## Components

### `<FlexOpsProvider>`

Wraps all FlexOps widgets with configuration and theming.

```tsx
<FlexOpsProvider
  config={{
    baseUrl: 'https://gateway.flexops.io',  // Required
    apiKey: 'fxk_live_...',              // Sent as X-API-Key; needed by AddressForm, ShippingLabel, HsCodeLookup
    theme: {                              // Optional — override default styling
      primaryColor: '#your-brand-color',
      fontFamily: 'Inter, sans-serif',
    },
  }}
>
  {children}
</FlexOpsProvider>
```

### `<RateCalculator>`

Displays shipping rate estimates from multiple carriers.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultFromPostalCode` | `string` | `''` | Pre-fill origin ZIP |
| `defaultToPostalCode` | `string` | `''` | Pre-fill destination ZIP |
| `defaultWeightOz` | `number` | — | Pre-fill weight |
| `showDimensions` | `boolean` | `true` | Show L/W/H inputs |
| `showCountry` | `boolean` | `false` | Show country selectors |
| `maxResults` | `number` | unlimited | Limit displayed rates |
| `onRatesFetched` | `(rates) => void` | — | Callback when rates load |
| `onRateSelected` | `(rate) => void` | — | Callback when user clicks a rate |
| `onError` | `(error) => void` | — | Callback on error |

### `<TrackingWidget>`

Displays real-time package tracking with workspace branding.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `token` | `string` | — | Tracking link token (auto-loads) |
| `showSearchInput` | `boolean` | `true` | Show token search input |
| `pollingIntervalMs` | `number` | `0` | Live update interval (0 = disabled) |
| `showBranding` | `boolean` | `true` | Show workspace branding |
| `onTrackingLoaded` | `(data) => void` | — | Callback when data loads |
| `onError` | `(error) => void` | — | Callback on error |

### Gateway endpoints

Each widget calls one FlexOps Gateway route. A configured `apiKey` is sent as `X-API-Key`; the Gateway refuses API keys sent as `Authorization: Bearer`.

| Widget | Request | API key |
|---|---|---|
| `RateCalculator` | `POST /api/rates/public-estimate` | Not needed (anonymous, rate-limited per IP) |
| `DeliveryPromise` | `POST /api/rates/public-estimate` | Not needed |
| `TrackingWidget` | `GET /api/widget/tracking/{token}` | Not needed |
| `AddressForm` | `POST /api/addresses/validate` | `shipping:read` |
| `HsCodeLookup` | `POST /api/shipping/hs-codes/classify` | `shipping:read`, international shipping enabled |
| `ShippingLabel` | `POST /api/shipping/labels` | `shipping:write` |

`DeliveryPromise` turns each service's `estimatedDeliveryDays` into a date after the next ship date, fastest first. The days are the Gateway's fixed per-service estimates, not carrier commitments, and carry no on-time confidence. Set `weightOz` (default 16) to the typical parcel weight.

These are the only Gateway calls Elements makes, all documented public operations; none goes through the legacy `/api/ApiProxy`. `npm test` checks every API client function against the documented operation list in `tests/fixtures/gateway-operations.json`. Only `ShippingLabel` sends an `Idempotency-Key` (one per purchase, reused on **Retry Same Purchase**); Elements never retries a request on its own. An empty success response (204) is reported as an error, and for a label it leaves the purchase unresolved rather than treating it as bought.

## Theming

Override any theme property via the provider or individual widgets:

```tsx
const customTheme = {
  primaryColor: '#8b5cf6',
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif',
};

<FlexOpsProvider config={{ baseUrl: '...', theme: customTheme }}>
  <RateCalculator />
</FlexOpsProvider>
```

Available theme properties: `primaryColor`, `secondaryColor`, `backgroundColor`, `textColor`, `mutedTextColor`, `borderColor`, `borderRadius`, `fontFamily`, `fontSize`, `successColor`, `errorColor`, `warningColor`.

## Requirements

- React 18+
- Modern browser with `fetch` API

## License

MIT - FlexOps, LLC

### `<ShippingLabel>` approval flow

The label form sends Gateway's normalized origin/destination/package payload. Enter a USD maximum and carrier/service, then select **Preview Postage**. Review the server quote and expiry, then explicitly **Approve and Buy**. Cancel returns to editing without a purchase. The maximum excludes later carrier adjustments and separate fees.

Deploy this widget with Gateway's bounded approval contract; an older Gateway cannot guarantee preview semantics. Sandbox responses may immediately show a synthetic label without postage. After any attempted live purchase, the form retains its request, original client configuration and key and offers **Retry Same Purchase**. An unknown outcome must be reconciled before starting another purchase. Operation state lasts for the mounted widget only: keep it mounted while unresolved and retain the displayed reference for operator recovery if the page closes. No browser persistence of private shipment data is added.

**HAZMAT declaration.** A label without an order must declare what the parcel holds. Set the `hazmatClassification` prop (TypeScript requires it unless you pass `orderId`); the widget sends it as given and never asks the end customer. Use `HazmatClassification.None` (0) for an ordinary parcel:

```tsx
import { ShippingLabel, HazmatClassification } from '@flexops/elements';

<ShippingLabel hazmatClassification={HazmatClassification.None} />
// or, for a label bought against an order (the class is then optional):
<ShippingLabel orderId={12345} />
```

Without `orderId` or a valid class the widget shows a configuration error and calls `onError` instead of requesting a label.

No npm publication or production carrier certification is implied by these source changes.

## Guarded label release compatibility

This release requires a Gateway deployment with the bounded label preview/approval contract (Gateway PR #509 or later). Do not use its live label preparation against an older Gateway: older servers may purchase immediately. Upgrade the Gateway and affected callers together during a purchase maintenance window.

Live label creation now requires a USD maximum, preview, explicit approval, and replay of the saved request with its original idempotency key. Never retry an uncertain purchase with a new key. Sandbox results do not certify production postage.
