# Contributing to LuminaRail Frontend

Thank you for your interest in contributing to **LuminaRail Frontend**! LuminaRail is an open-source settlement infrastructure platform connecting local payment rails (such as NGN via Paystack) with programmable USDC stablecoin settlement on the Stellar network using Soroban smart contracts.

---

## Drips Wave & Stellar Open Source Ecosystem

LuminaRail is part of the Stellar open-source ecosystem and Drips Wave contributor program. We welcome open-source contributions from developers of all skill levels.

### 1. What LuminaRail Is
LuminaRail is a non-custodial fiat-to-stablecoin payment and settlement gateway. It allows businesses and users to lock foreign exchange rates, make local fiat deposits, and settle USDC directly into Stellar wallets in seconds.

### 2. Why We Use Stellar & Soroban
- **Stellar**: Provides ultra-fast (3-5s finality) and near-zero cost asset transfers for global cross-border payments.
- **Soroban**: Stellar's Rust-based WebAssembly smart contract platform, enabling programmable escrow, fee management, and verifiable atomic settlement.

### 3. Which Repository Should You Work In?
- **`luminarail-frontend`** (This repository): Next.js 16, React 19, TypeScript, Tailwind CSS UI for user dashboards, quotes, order management, and wallet connections.
- **`luminarail-backend`**: Node.js, Express, PostgreSQL, Prisma API service handling Paystack webhooks, order state machines, and Soroban contract invocation.
- **`luminarail-contracts`**: Soroban Rust smart contracts (`settlement_vault`, `escrow`, `fee_manager`).

---

## Contributor Skill Breakdown

### Good for Beginner / Intermediate Contributors (TypeScript & React)
- UI layout, responsive styling, and accessibility (a11y) improvements
- Quote expiration timers and modal state UX
- Transaction filtering and pagination controls
- Wallet connection error handling and user feedback toasts
- Component unit test coverage (Vitest / React Testing Library)

### Requires Deeper Stellar / Web3 Knowledge
- Stellar wallet integration expansion (Freighter, LOBSTR, WalletConnect)
- Stellar transaction XDR decoding & Horizon RPC query optimizations
- Real-time WebSocket / SSE order settlement timeline updates
- Soroban contract event listeners and on-chain verification UI

---

## Development Setup & Workflow

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Clone & Branch Strategy
We follow a strict branching model. All work should branch off and merge into `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Never commit secrets or private keys).*

### 3. Install Dependencies & Run Local Server
```bash
npm install
npm run dev
```

### 4. Running Verification Commands
Before submitting code, all of the following commands MUST pass cleanly:
```bash
npm run type-check   # Strict TypeScript check
npm run lint         # ESLint checks
npm test             # Vitest unit test suite
npm run build        # Production Next.js Turbopack build
```

---

## Submitting a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request targeting the **`develop`** branch.
3. Complete the PR description detailing the problem solved, changes made, and verification results.
4. Request review from maintainers.

---

## License & Security
- LuminaRail is open-source under the [MIT License](./LICENSE).
- For security vulnerabilities, please refer to [SECURITY.md](./SECURITY.md).
