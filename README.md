# LuminaRail Frontend (`luminarail-frontend`)

> **"Open financial rails for Stellar."**

`luminarail-frontend` is the client-side user interface application for LuminaRail. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Stellar Wallet (Freighter)** integration foundation.

---

## High-Level Architecture

```
app/
├── (routes)/
│   ├── auth/login/      # Auth login / register foundation
│   ├── dashboard/       # Main user dashboard overview
│   ├── quotes/          # Exchange quote interface
│   ├── orders/          # Active & past settlement order tracking
│   ├── transactions/    # Historical settlement & Horizon transaction list
│   ├── merchant/        # Merchant API key & webhook management
│   └── admin/           # Admin system monitoring & audit trail
components/
├── layout/              # Navbars, Headers, Footers, Containers
├── ui/                  # Reusable UI primitives
└── wallet/              # Stellar wallet connection modal & buttons
hooks/                   # Custom hooks (useStellarWallet, useAuth, useQuotes, etc.)
lib/
├── api/                 # Clean API client abstraction over backend REST endpoints
├── stellar/             # Freighter API & Stellar SDK helpers
└── utils/               # Tailwind merge & helper utilities
services/                # Type-safe API service interfaces
types/                   # TypeScript interfaces (auth, quotes, orders, wallets)
```

---

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variable template
cp .env.example .env.local

# 3. Start local development server
npm run dev
```

---

## Quality & Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Unit & Component tests
npm test
```

---

## Security Principles

- Never commit secrets or private keys.
- Environment variables exposed to the browser must strictly use the `NEXT_PUBLIC_` prefix.
- All financial calculations and rates are enforced server-side by `luminarail-backend`.

---

## License

[MIT License](./LICENSE)