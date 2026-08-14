# LuminaRail Frontend — Application Architecture

This document describes the architectural layout, state flow, hook abstractions, and wallet integration details for `luminarail-frontend`.

---

## App Router Structure

The frontend uses Next.js 16 App Router. Route directories are organized under `app/`:

```
app/
├── layout.tsx         # Global page shell, fonts, theme provider & global navbar
├── page.tsx           # Product overview landing page
├── globals.css        # Tailwind CSS 4 setup & CSS custom properties
├── admin/             # System audit logs & settlement queue inspection
├── auth/              # Registration & authentication login forms
├── dashboard/         # Combined user overview & quick action tiles
├── merchant/          # Merchant API key generation & webhook settings
├── orders/            # Order creation wizard & status tracking list
├── quotes/            # FX quote calculator interface
└── transactions/      # Historical settlement log & Stellar transaction lookup
```

---

## State Management Architecture

State is managed locally within page components and encapsulated through custom React hooks under `hooks/`:

### Custom Hooks Summary

1. **`useStellarWallet`**:
   - Manages non-custodial browser wallet connections (Freighter & Lobstr).
   - Tracks wallet connection status (`isConnecting`, `isConnected`), public address (`publicKey`), and active network details.
   - Provides `connect()` and `disconnect()` actions.

2. **`useAuth`**:
   - Manages user login credentials, JWT token lifecycle, and authentication state (`user`, `isAuthenticated`).

3. **`useQuotes`**:
   - Handles state for FX rate inquiries, fee calculations, rate expiration counters, and quote generation requests.

4. **`useOrders`**:
   - Manages settlement order creation, form inputs, status polling, and order history pagination.

---

## Service Layer (`lib/api/` & `services/`)

The application interacts with `luminarail-backend` REST endpoints through a clean service abstraction:

```
UI Page Component
      │
      ▼
Custom Hook (useQuotes / useOrders / useAuth)
      │
      ▼
Service Wrapper (services/quotes.ts, services/orders.ts)
      │
      ▼
ApiClient Singleton (lib/api/api.client.ts)
      │
      ▼
HTTP REST Backend (/api/v1/*)
```

- **Error Handling**: API errors are parsed into standardized client-side error structures to prevent unhandled runtime exceptions.
- **Type Safety**: Request payloads and response interfaces are strictly typed using TypeScript interfaces defined under `types/`.
