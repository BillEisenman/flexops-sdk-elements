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
    apiKey: 'fxk_live_...',              // Optional — for future authenticated endpoints
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
