# LuminaRail Frontend

LuminaRail Frontend is the Next.js user interface for **LuminaRail**, an NGN → USDC on-ramp and Stellar/Soroban cross-border settlement application.

It connects end-users to the deployed LuminaRail backend API to request real-time foreign exchange quotes, initiate NGN deposits via Paystack hosted checkout, monitor payment confirmation, attach non-custodial Stellar wallets, and track automated Soroban USDC settlements to destination addresses on the Stellar network.

---

## Current Features

### Dashboard
- **LuminaRail Dashboard**: Main operational hub for managing deposits and tracking settlements.
- **Deposit NGN / Buy USDC Action**: Quick-trigger action to start an NGN → USDC on-ramp flow.
- **NGN → USDC Converter**: Interactive rate conversion calculator powered by backend FX quotes.
- **Real-Time FX Quotes**: Live exchange rates and fee calculations fetched directly from backend quote services.
- **NGN Preset Amounts**: Quick-selection buttons (e.g., ₦50,000, ₦100,000, ₦250,000, ₦500,000) for fast entry.
- **Total NGN Deposited**: Display aggregate NGN deposited across user transactions.
- **Total USDC Settled**: Summary metric of total USDC received via Stellar settlement.
- **Active Orders**: Real-time list of in-progress orders requiring payment or wallet attachment.
- **Stellar Wallet Connection Status**: Header and dashboard indicator showing connected wallet type and public address.

### NGN → USDC Deposit Flow

The current user deposit and settlement flow proceeds through the following steps:

1. **User Enters NGN Amount**: User specifies desired NGN deposit amount or selects a preset on the converter interface.
2. **Frontend Requests Quote**: Frontend requests an FX quote from the LuminaRail backend (`POST /quotes`).
3. **User Reviews Quote Details**: Frontend displays quote parameters:
   - NGN source amount
   - USDC destination amount
   - Exchange rate (NGN/USDC)
   - Platform & provider fee breakdown
   - Quote expiration countdown
4. **Order Creation**: User creates an `ON_RAMP` order (`POST /orders`).
5. **Payment Initialization**: Frontend initializes payment through the backend (`POST /payments`).
6. **Paystack Communication**: LuminaRail backend communicates securely with Paystack API to initialize a hosted transaction.
7. **Redirect to Checkout**: Frontend opens the Paystack hosted checkout URL in a browser window or tab.
8. **Payment Status Check**: Frontend polls and refreshes payment status through the backend (`POST /payments/:id/verify`).
9. **Payment Confirmation**: Backend confirms payment completion via Paystack verification and webhooks.
10. **Proceed to Settlement**: Upon payment confirmation, the order transitions to settlement status.
11. **Wallet Connection & Association**: User connects or attaches their destination Stellar wallet address to the order (`PATCH /orders/:id/wallet`).
12. **Soroban Settlement**: LuminaRail backend & Soroban contracts execute settlement, delivering USDC directly to the user's destination wallet.

> **Note**: The frontend **never** accesses or uses the Paystack secret key. All secret-dependent Paystack API operations are executed strictly on the LuminaRail backend.

---

## Paystack

The Paystack integration operates via backend orchestration:

- The frontend calls the LuminaRail backend to request payment initialization.
- The backend communicates with Paystack and returns a hosted payment checkout URL (`instructions.paymentUrl`).
- The frontend presents the link to open the Paystack hosted checkout page.
- The frontend polls backend status endpoints (`POST /payments/:id/verify`) to detect when the payment moves from `PENDING` to `SUCCEEDED`.
- The frontend only displays successful payment confirmation after the backend explicitly verifies and confirms the transaction.

### Implementation Mode Notice

> [!IMPORTANT]
> The current implementation is configured for **Paystack TEST MODE**. Paystack checkout links and bank transfers operate in test mode with simulated checkout cards and test bank transfers. Production NGN deposits require a verified Paystack production account, live API credentials, webhooks, and regulatory compliance setup on the backend.

---

## Authentication

- **Registration & Login**: User authentication screens (`app/auth/login`) supporting new user registration and credentials login.
- **JWT-Based Authentication**: Secure session authentication utilizing JSON Web Tokens (JWT).
- **Authenticated API Requests**: Automatic injection of `Authorization: Bearer <token>` headers on all protected API calls (`ApiClient`).
- **Token Handling**: Auth tokens are stored client-side in session storage/local storage via the React `AuthContext` provider and automatically attached to outgoing requests.

> **Security Note**: `JWT_SECRET` is used exclusively by the backend to sign and verify tokens. It is never exposed to or stored within the frontend.

---

## Stellar Wallet

The frontend provides non-custodial Stellar wallet integration supporting browser extension signers and standards:

- **Supported Signers**:
  - **Freighter Wallet**: `@stellar/freighter-api` integration for browser extension connection and transaction signing.
  - **LOBSTR Extension**: `@lobstrco/signer-extension-api` integration for LOBSTR browser extension signing.
  - **WalletConnect**: Primitives for mobile wallet connection via WalletConnect protocol (when project ID is supplied).
- **Wallet Connection**: Dynamic modal (`WalletSelectModal`) and hook (`useStellarWallet`) to detect extension availability and request public key access.
- **Connected Wallet Address**: Displays formatted ed25519 public key (e.g., `G...`) and connection status indicator in the Header.
- **Destination Wallet Association**: Allows users to associate or update their destination Stellar wallet address on active orders (`updateOrderWallet`).
- **Wallet-Required Settlement Flow**: Prompts user if an order reaches `PAYMENT_CONFIRMED` status without an attached wallet address.
- **Dashboard Status**: Wallet status, active network (`testnet`), and quick disconnect actions are readily accessible from the header and modal controls.

---

## Orders

### Order Interface & Lifecycle

Orders track the complete lifecycle from FX quote selection through Soroban settlement:

```
CREATED
   ↓
AWAITING_PAYMENT
   ↓
PAYMENT_CONFIRMED
   ↓
SETTLEMENT_PENDING
   ↓
PROCESSING / SETTLEMENT_COMPLETED
   ↓
COMPLETED
```

### Complete Order States

The frontend supports all backend order states defined in `types/orders.ts`:
- `CREATED`: Initial order record generated from FX quote.
- `AWAITING_PAYMENT`: Order pending user NGN payment deposit.
- `PAYMENT_DETECTED`: Payment detected by system awaiting final confirmation.
- `PAYMENT_CONFIRMED`: NGN deposit verified by backend via Paystack.
- `SETTLEMENT_PENDING`: Order queued for Stellar/Soroban USDC transfer.
- `SETTLEMENT_COMPLETED`: Soroban USDC token contract execution confirmed.
- `COMPLETED`: Order successfully finalized.
- `FAILED`: Order processing or settlement failed.
- `CANCELLED`: Order cancelled before payment completion.
- `REFUNDED`: Payment refunded to customer.

### Order Features
- **Order Creation**: Generate orders with custom idempotency keys to prevent duplicate submissions.
- **Order Details Modal**: Inspect full order breakdown (`OrderDetailsModal`), including quotes, payment references, and settlement hashes.
- **Payment & Settlement Status**: Real-time visual status badges highlighting current progress.
- **Wallet Association**: Attach or update destination Stellar address directly within order views.
- **Order Lifecycle Timeline**: Visual timeline component (`OrderLifecycleTimeline`) detailing state transitions and timestamps.

---

## Transaction History

The transaction history view (`app/transactions/page.tsx`) offers a comprehensive audit trail of past orders:

- **Search Capabilities**: Filter transactions in real-time by:
  - Order ID
  - Paystack / Payment reference
  - Stellar transaction hash (`stellarTxHash`)
  - Asset pair (NGN, USDC)
- **Settlement Information**: View Soroban settlement status, ledger numbers, and destination addresses.
- **Stellar Expert Links**: Direct links to view raw Stellar blockchain transactions on Stellar Expert explorer (`https://stellar.expert/explorer/testnet/tx/<hash>`).
- **Pagination & Refresh**: Paginated transaction table with pull-to-refresh data reloading.

---

## Components

The UI is built from modular, accessible React components:

- `CreateOrderModal.tsx`: Modal dialog for selecting FX quote parameters and confirming order placement.
- `NgnPaymentModal.tsx`: Payment modal displaying Paystack test checkout link, instructions, auto-polling verification, and status refresh buttons.
- `OrderDetailsModal.tsx`: In-depth breakdown of individual order metadata, payment history, and settlement records.
- `OrderLifecycleTimeline.tsx`: Visual step-by-step timeline depicting order progress.
- `OrderSummaryCards.tsx`: Dashboard summary cards for key metrics (NGN deposited, USDC settled, active orders).
- `Header.tsx`: Navigation bar with authentication controls, wallet status, and mobile menu drawer.
- `WalletConnectButton.tsx`: Quick button component to open wallet connection options.
- `WalletSelectModal.tsx`: Modal for choosing between Freighter, LOBSTR, or WalletConnect integrations.
- `GridScan.tsx`: Canvas animation background for modern aesthetic styling.

---

## API Integration

The frontend communicates with the LuminaRail backend using `ApiClient` (`lib/api/index.ts`), a fetch wrapper supporting typed responses, bearer token authentication, and error formatting.

### API Base URL Configuration

The API base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable:

```env
NEXT_PUBLIC_API_URL=https://luminarail-backend.onrender.com/api/v1
```

For local development, it defaults to:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Endpoints Used
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/logout` - Session termination
- `GET /users/me` - Current user profile
- `POST /quotes` - Request FX rate quote
- `GET /quotes/:id` - Retrieve quote details
- `GET /orders` - Fetch user orders list
- `POST /orders` - Create new deposit order
- `GET /orders/:id` - Get order details by ID
- `PATCH /orders/:id/wallet` - Update destination Stellar wallet address
- `POST /payments` - Initialize Paystack deposit payment
- `GET /payments/:id` - Fetch payment record
- `POST /payments/:id/verify` - Poll/verify Paystack payment status
- `GET /settlements/order/:orderId` - Fetch settlement details by order ID
- `POST /wallets` - Register user Stellar public address

> [!CAUTION]
> Do NOT add `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `DATABASE_URL`, or any other backend secret to the frontend configuration.

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development:

```env
# Stellar Network Configuration ('testnet' or 'public')
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# LuminaRail Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Optional WalletConnect Project ID (Get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

### Security Rule
Variables prefixed with `NEXT_PUBLIC_` are bundled into client-side JavaScript code and exposed to browser users. **Never put backend secrets in `NEXT_PUBLIC_` environment variables.**

---

## Project Structure

```
luminarail-frontend/
├── app/                  # Next.js App Router pages and layouts
│   ├── admin/            # Administrative dashboard pages
│   ├── auth/             # Login & Registration screens
│   ├── dashboard/        # Main user dashboard and NGN converter
│   ├── merchant/         # Merchant key & webhook settings
│   ├── orders/           # Order management views
│   ├── quotes/           # FX rate calculator page
│   ├── transactions/     # Transaction history and search
│   ├── globals.css       # Global CSS and Tailwind directives
│   └── layout.tsx        # App layout with Auth & Theme context
├── components/           # React UI components
│   ├── backgrounds/      # GridScan background visualizer
│   ├── layout/           # Header navigation
│   ├── orders/           # Order modals and timeline components
│   ├── payments/         # Paystack NGN deposit modal
│   ├── theme/            # Theme provider and toggles
│   └── wallet/           # Stellar wallet connect modals & buttons
├── context/              # React Context state management (AuthContext)
├── hooks/                # Custom React hooks (useAuth, useOrders, useQuotes, useStellarWallet)
├── lib/                  # Utilities & API implementations
│   ├── api/              # ApiClient fetch abstraction
│   ├── stellar/          # Stellar wallet services & extension helpers
│   └── utils/            # Styling helper functions (cn, clsx)
├── services/             # Endpoint service clients (auth, orders, payments, quotes, settlements, wallets)
├── types/                # TypeScript type declarations (api, auth, orders, quotes, wallets)
├── public/               # Static assets & favicons
├── tests/                # Vitest unit test suite
├── .env.example          # Environment variable template
├── next.config.ts        # Next.js configuration
├── package.json          # Node.js dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Vitest test runner configuration
```

---

## Tech Stack

Selected dependencies from `package.json`:

- **Framework**: Next.js 16.3 (App Router)
- **Library**: React 19.2
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4 (`@tailwindcss/postcss`, `clsx`, `tailwind-merge`)
- **Icons**: Lucide React (`lucide-react`)
- **Stellar & Wallet Libraries**:
  - `@stellar/freighter-api` (v6.0)
  - `@lobstrco/signer-extension-api` (v2.1)
  - `@stellar/stellar-sdk` (v13.0)
- **Testing**: Vitest 3.0 (`vitest`)

---

## Local Development

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- LuminaRail backend service running locally (or deployed API endpoint)

### Step-by-Step Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run TypeScript type checking**:
   ```bash
   npm run type-check
   ```

5. **Run Vitest test suite**:
   ```bash
   npm test
   ```

6. **Create production build**:
   ```bash
   npm run build
   ```

---

## Production Deployment

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render (`https://luminarail-backend.onrender.com/api/v1`)

### Deployment Steps
1. Deploy `luminarail-frontend` project on Vercel.
2. In Vercel Project Settings > Environment Variables, configure:
   ```env
   NEXT_PUBLIC_API_URL=https://luminarail-backend.onrender.com/api/v1
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   ```
3. Whenever environment variables are updated in Vercel, trigger a new deployment to compile the variables into the static bundle.

---

## Testing

The frontend codebase is verified using TypeScript strict checks and Vitest unit tests.

### Verification Results
- **TypeScript Type-check (`npm run type-check`)**: Passed (0 errors)
- **Frontend Unit Tests (`npm test`)**: 16/16 passed across 3 test suites
- **Production Build (`npm run build`)**: Passed (Next.js Turbopack build succeeded, 11/11 pages static/prerendered)

---

## Security

- **No Backend Secrets**: No backend secrets (`JWT_SECRET`, `PAYSTACK_SECRET_KEY`, database URIs) exist in frontend code or environment configs.
- **Paystack Secret Protection**: All Paystack secret key operations are handled on the LuminaRail backend.
- **Backend Payment Verification**: Order payment statuses are only updated after backend verification via Paystack APIs/webhooks.
- **Non-Custodial Wallet Operations**: Private keys stay exclusively inside the user's browser wallet extension (Freighter / LOBSTR).
- **Authenticated Requests**: Protected endpoints require valid JWT credentials passed via Bearer headers.

---

## Current Status

### Implemented
- [x] Responsive LuminaRail Dashboard
- [x] Interactive NGN → USDC converter
- [x] Real-time FX quote integration
- [x] `ON_RAMP` order creation
- [x] Paystack hosted checkout integration
- [x] Payment status polling & verification
- [x] Payment confirmation handling
- [x] Stellar wallet connection (Freighter & LOBSTR)
- [x] Destination wallet association
- [x] Settlement status display & UI indicators
- [x] Order lifecycle visual timeline
- [x] Transaction history search and filtering
- [x] Stellar Expert transaction explorer links
- [x] Strict TypeScript coverage & unit tests
- [x] Production build validation

### Current Limitations
- **Paystack Test Mode**: Paystack integration is configured for **TEST MODE**. Live fiat bank deposits and card processing require live Paystack account verification, production keys, and active webhook handlers.
- **WalletConnect Setup**: Mobile wallet connection via WalletConnect requires supplying a valid `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

---

## Screens / User Flow

```
[ Dashboard ]
      │
      ▼
[ Deposit NGN / Buy USDC ]
      │
      ▼
[ FX Quote Calculator ] ──(Request Quote)──► [ Review Quote & Create Order ]
                                                            │
                                                            ▼
                                                [ Paystack Test Checkout ]
                                                            │
                                                            ▼
                                               [ Payment Confirmation ]
                                                            │
                                                            ▼
                                              [ Connect Stellar Wallet ]
                                                            │
                                                            ▼
                                               [ Soroban Settlement ]
                                                            │
                                                            ▼
                                              [ Transaction Audit Log ]
```

---

## Contributing

1. Fork and clone the repository.
2. Install dependencies: `npm install`
3. Configure `.env.local` using `.env.example`.
4. Run local dev server: `npm run dev`
5. Run tests: `npm test`
6. Run type check: `npm run type-check`
7. Test production build: `npm run build`
8. Submit a pull request against `develop`.

---

## License

This project is licensed under the [MIT License](./LICENSE).