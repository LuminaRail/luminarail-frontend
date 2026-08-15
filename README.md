# LuminaRail Frontend (`luminarail-frontend`)

> **Open financial rails for Stellar.**

`luminarail-frontend` is the client-side user interface application for LuminaRail. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and non-custodial Stellar wallet integration primitives (**Freighter API** & **Lobstr Signer Extension**).

---

## Overview

### What the Project Does
`luminarail-frontend` provides an interface for users, merchants, and system administrators interacting with the LuminaRail cross-border settlement platform. It allows users to request real-time FX rate quotes, create fiat-to-Stellar settlement orders, connect non-custodial Stellar wallets, track payment and settlement statuses, view historical transaction logs, manage merchant credentials, and monitor system audit trails.

### The Problem It Solves
Traditional cross-border payment portals are often complex, lack real-time settlement transparency, and force custodial risk on users. `luminarail-frontend` provides:
- **Intuitive Self-Service Interfaces**: Clear steps for requesting FX rates, placing settlement orders, and inspecting transactions.
- **Non-Custodial Wallet Integration**: Connects directly with Freighter and Lobstr browser wallet extensions so users sign transactions securely on their device.
- **Role-Tailored Views**: Dedicated dashboard sections for regular users, merchants, and system administrators.

### Ecosystem Purpose
`luminarail-frontend` connects end-users to `luminarail-backend` REST endpoints, displaying settlement statuses and facilitating non-custodial wallet authorizations on the Stellar Testnet.

### Who Can Contribute
Frontend developers with experience in Next.js (App Router), React 19, TypeScript, Tailwind CSS, accessibility, or Web3 wallet integrations are invited to contribute.

---

## Features

- **Authentication & Onboarding**: Views for user registration, login authentication, and active session management.
- **User Dashboard Overview**: Consolidated dashboard displaying wallet status, recent orders, and quick access to settlement actions.
- **FX Quote Request Interface**: Calculator to query real-time foreign exchange rates (e.g., NGN/USDC) and view fee breakdowns before placing orders.
- **Order Placement & Status Tracking**: Create settlement orders and track progress through state machine transitions (`CREATED` → `PAYMENT_PENDING` → `SETTLEMENT_PENDING` → `COMPLETED`).
- **Non-Custodial Wallet Integration**: Connect browser wallets using the `@stellar/freighter-api` and `@lobstrco/signer-extension-api` via the custom `useStellarWallet` hook.
- **Transaction History**: Searchable list of past settlement orders and Stellar network transactions.
- **Merchant Management Portal**: View for managing merchant API keys and webhook settings.
- **Admin System Monitoring**: Administrative view for system auditing and settlement queue inspection.

---

## Architecture

`luminarail-frontend` uses the Next.js App Router architecture with modular component decomposition and custom hook state management.

```
Client Browser (User / Merchant / Admin)
       │
       ▼
Next.js App Router Pages (app/)
       │
       ├── Page Components (dashboard, quotes, orders, transactions, merchant, admin)
       │
       ├── UI Primitives & Layouts (components/ui/ & components/layout/)
       │
       ├── Custom React Hooks (hooks/)
       │     ├── useStellarWallet (Freighter & Lobstr API connection state)
       │     ├── useAuth (Session authentication state)
       │     ├── useQuotes (FX quote fetching state)
       │     └── useOrders (Order query & creation state)
       │
       └── Services & API Layer (lib/api/ & services/)
             │
             ├── ApiClient (Fetch HTTP abstraction over REST backend)
             └── Service Wrappers (auth.ts, quotes.ts, orders.ts, wallets.ts)
```

---

## Tech Stack

- **Framework**: Next.js 16.3 (App Router)
- **Library**: React 19.2
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4 with `@tailwindcss/postcss` and `clsx` / `tailwind-merge`
- **Icons**: Lucide React 0.475
- **Stellar Wallet APIs**: `@stellar/freighter-api` 6.0, `@lobstrco/signer-extension-api` 2.1, `@stellar/stellar-sdk` 13.0
- **Testing Framework**: Vitest 3.0

---

## Project Structure

```
luminarail-frontend/
├── app/                  # Next.js App Router routes & pages
│   ├── layout.tsx        # Root layout with theme provider & navigation
│   ├── page.tsx          # Landing page
│   ├── globals.css       # Global styles & Tailwind imports
│   ├── admin/            # Admin monitoring pages
│   ├── auth/             # Login & registration pages
│   ├── dashboard/        # Main user dashboard
│   ├── merchant/         # Merchant API key & webhook management
│   ├── orders/           # Order creation & tracking views
│   ├── quotes/           # FX rate calculator page
│   └── transactions/     # Transaction history logs
├── components/           # UI components
│   ├── layout/           # Header, Footer, Navbar, and Container layouts
│   ├── theme/            # Theme toggle & provider components
│   └── wallet/           # Stellar wallet modal & connect buttons
├── hooks/                # React custom hooks
│   ├── useAuth.ts        # Authentication state hook
│   ├── useOrders.ts      # Order management hook
│   ├── useQuotes.ts      # Quote fetching hook
│   └── useStellarWallet.ts # Stellar wallet connection & public key state hook
├── lib/                  # Helper utilities and API clients
│   ├── api/              # Low-level HTTP client implementation
│   ├── stellar/          # Stellar SDK & Freighter helpers
│   └── utils/            # Styling & helper utilities
├── services/             # Type-safe service definitions for API endpoints
├── types/                # TypeScript type declarations (auth, quotes, orders, wallets)
├── public/               # Static assets & favicon
├── tests/                # Vitest test suite
├── .env.example          # Environment variables template
├── package.json          # Dependencies & scripts
└── next.config.ts        # Next.js framework configuration
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Quick Start Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LuminaRail/luminarail-frontend.git
   cd luminarail-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Environment Variables

Client-side environment variables must use the `NEXT_PUBLIC_` prefix:

```env
# Stellar Network Configuration ('testnet' or 'public')
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# LuminaRail Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Optional WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

> [!IMPORTANT]
> Never place secret API keys, private keys, or credentials in frontend environment variables.

---

## Development

Available npm scripts in `package.json`:

```bash
# Start Next.js development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start

# Run ESLint check
npm run lint

# Run TypeScript type check (no emit)
npm run type-check

# Run Vitest test suite
npm test
```

---

## Testing

The project uses [Vitest](https://vitest.dev/) for testing UI helper functions, hooks, and API client abstractions.

```bash
# Run tests once
npm test
```

---

## Contributing

1. **Fork & Clone** the repository.
2. **Create a Feature Branch**: `git checkout -b feature/my-ui-component`
3. **Install Dependencies**: `npm install`
4. **Make Your Changes**: Ensure responsive design, modern UI styling, and clean TypeScript code.
5. **Run Checks**: Run `npm run type-check`, `npm run lint`, and `npm test`.
6. **Commit**: Use standard commit messages (e.g., `feat: add order status badge component`).
7. **Open Pull Request**: Submit your PR against `develop`.

---

## Good First Contributions

- **Component Tests**: Add Vitest tests for UI primitives and custom hooks.
- **Error States**: Improve UI display for network timeouts or API error messages.
- **Accessibility (a11y)**: Add ARIA labels, keyboard focus indicators, and screen-reader support to modals.
- **Theme Enhancements**: Refine dark mode color contrasts and responsive mobile navigation.

---

## Issue Guidelines

Please format bug reports and feature requests clearly:
- **Title**: Concise description of the issue or feature.
- **Description**: Detailed context and background.
- **Steps to Reproduce**: Detailed steps to recreate UI bugs.
- **Expected vs Actual**: Description of expected UI behavior versus current behavior.

---

## Security

- **Client-Side Security**: Never embed private keys, secret seeds (`S...`), or backend secrets in frontend code.
- **Non-Custodial Principle**: Wallet private keys remain exclusively within the user's browser extension (Freighter / Lobstr).

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Project Status

- **Current Status**: Active Development / Testnet Client UI
- **Backend API Requirement**: Requires `luminarail-backend` running locally or on testnet.