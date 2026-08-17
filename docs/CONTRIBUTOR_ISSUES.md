# LuminaRail Frontend — Proposed Contributor Issues

This document contains 10 repository-grounded, production-relevant contributor issues for `luminarail-frontend`.

---

### Issue 1: Improve wallet connection error handling and fallback UI when Freighter extension is missing
- **Problem**: When a user attempts to connect a Stellar wallet without having the Freighter extension installed, the app displays a raw browser console warning rather than a user-friendly modal with extension download links.
- **Scope**: Update `components/wallet/WalletSelectModal.tsx` and `hooks/useStellarWallet.ts` to detect extension availability cleanly and render a helpful state with links to install Freighter / LOBSTR.
- **Acceptance Criteria**:
  - Handle missing wallet extension gracefully with clear error alert in UI.
  - Provide direct installation links to official extension stores.
  - Add unit tests covering missing extension scenario.
- **Relevant Area**: Frontend
- **Difficulty**: Easy
- **Potential Skills**: TypeScript, React, Next.js, Vitest

---

### Issue 2: Add live countdown timer and auto-refresh UX for FX quote expiration
- **Problem**: FX quotes returned by `POST /quotes` have an `expiresAt` timestamp (e.g. 30 seconds), but the quote selection modal doesn't show a visual ticking countdown bar or offer automated rate refresh when expired.
- **Scope**: Update `components/orders/CreateOrderModal.tsx` and `hooks/useQuotes.ts` to render an active visual timer bar and auto-fetch a fresh quote upon expiration.
- **Acceptance Criteria**:
  - Visual countdown component displaying remaining valid seconds.
  - Disable order creation when quote is expired and prompt user to refresh.
  - Unit tests verifying timer tick down and reset behavior.
- **Relevant Area**: Frontend
- **Difficulty**: Medium
- **Potential Skills**: TypeScript, React, Custom Hooks, Vitest

---

### Issue 3: Add transaction status filter tabs and date range search in transaction history
- **Problem**: `app/transactions/page.tsx` supports basic string search filtering, but lacks status tabs (`All`, `Completed`, `Pending`, `Failed`) and date range pickers for auditing large transaction lists.
- **Scope**: Extend `app/transactions/page.tsx` and transaction services to support multi-attribute client-side and server-side filtering.
- **Acceptance Criteria**:
  - Filter tabs for order states (`COMPLETED`, `SETTLEMENT_PENDING`, `FAILED`).
  - Clear filter reset button and active filter count badge.
  - Test coverage for filter logic.
- **Relevant Area**: Frontend
- **Difficulty**: Easy / Medium
- **Potential Skills**: TypeScript, React, Tailwind CSS

---

### Issue 4: Add manual settlement retry button and troubleshooting details for failed orders
- **Problem**: When an order enters `FAILED` or `SETTLEMENT_PENDING` timeout, the order details modal only shows a static status badge without actionable troubleshooting steps or a manual retry trigger for authenticated users.
- **Scope**: Update `components/orders/OrderDetailsModal.tsx` to display error diagnostic logs and add a "Retry Settlement" action calling backend retry endpoints.
- **Acceptance Criteria**:
  - Actionable retry button shown for eligible failed/pending orders.
  - Clear diagnostic tooltip explaining the failure reason.
  - Unit tests for retry handler.
- **Relevant Area**: Frontend
- **Difficulty**: Medium
- **Potential Skills**: TypeScript, React, Next.js API client

---

### Issue 5: Improve ARIA accessibility (a11y) labels and keyboard focus traps across all modal components
- **Problem**: Dialog modals (`CreateOrderModal`, `NgnPaymentModal`, `OrderDetailsModal`, `WalletSelectModal`) lack proper ARIA dialog roles, aria-describedby attributes, and focus trap control for screen readers.
- **Scope**: Audit and enhance modal primitives with accessible dialog markup, ESC key listeners, and focus traps.
- **Acceptance Criteria**:
  - Modal containers use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
  - Pressing `ESC` closes any open modal.
  - Focus returns to trigger button upon close.
- **Relevant Area**: Frontend
- **Difficulty**: Easy
- **Potential Skills**: React, ARIA, Accessibility (a11y), Tailwind CSS

---

### Issue 6: Optimize mobile Paystack checkout payment modal and QR code payment flow
- **Problem**: Mobile web users opening `NgnPaymentModal.tsx` experience squeezed layout spacing on small screens (<360px width) when displaying hosted Paystack URLs.
- **Scope**: Refactor `components/payments/NgnPaymentModal.tsx` to optimize layout responsiveness, add a copyable payment link button, and display a scannable QR code for desktop-to-mobile payment transfer.
- **Acceptance Criteria**:
  - Fluid layout responsive across mobile viewports (320px - 768px).
  - One-click "Copy Payment Link" button with copied notification toast.
  - Test coverage for payment modal rendering across screen sizes.
- **Relevant Area**: Frontend
- **Difficulty**: Easy / Medium
- **Potential Skills**: TypeScript, React, Tailwind CSS, Responsive Design

---

### Issue 7: Implement skeleton loaders and empty states for Dashboard order lists
- **Problem**: While loading orders or transaction history, the dashboard displays blank spaces before content pops in, causing layout shifts.
- **Scope**: Create reusable animated skeleton loader components and empty state illustrations when no active orders exist.
- **Acceptance Criteria**:
  - Skeleton placeholders matching card and table dimensions during API fetch.
  - Informative empty state cards encouraging users to get an FX quote.
  - Visual snapshot tests.
- **Relevant Area**: Frontend
- **Difficulty**: Easy
- **Potential Skills**: TypeScript, React, Tailwind CSS

---

### Issue 8: Add active wallet account switching and disconnect controls in Header
- **Problem**: Connected users cannot easily switch Stellar public keys or disconnect their active wallet without clearing browser storage manually.
- **Scope**: Update `components/wallet/WalletConnectButton.tsx` and `Header.tsx` to show a wallet dropdown popover displaying current balance, network, switch wallet option, and disconnect button.
- **Acceptance Criteria**:
  - Dropdown menu when clicking connected wallet address badge.
  - Disconnect action that clears stored wallet state cleanly.
  - Unit tests for wallet disconnect state transition.
- **Relevant Area**: Frontend
- **Difficulty**: Medium
- **Potential Skills**: TypeScript, React, Stellar SDK / Freighter API

---

### Issue 9: Add CSV and JSON export functionality for user transaction history
- **Problem**: Merchants and users auditing payments need to export transaction records to CSV or JSON for accounting, but no export mechanism exists.
- **Scope**: Add export utility functions in `lib/utils` and export buttons on `app/transactions/page.tsx`.
- **Acceptance Criteria**:
  - "Export CSV" and "Export JSON" buttons on transaction history page.
  - Generated file includes Order ID, Payment Ref, NGN Amount, USDC Amount, Rate, Stellar Hash, and Status.
  - Unit tests verifying CSV generation logic.
- **Relevant Area**: Frontend
- **Difficulty**: Easy
- **Potential Skills**: TypeScript, React, Web APIs

---

### Issue 10: Expand Vitest unit test coverage for OrderLifecycleTimeline component
- **Problem**: `OrderLifecycleTimeline.tsx` visually depicts 10 order state transitions, but unit test coverage currently lacks checks for step highlighting, active animations, and timestamp formatting.
- **Scope**: Create `tests/components/OrderLifecycleTimeline.test.tsx` testing state transitions across all 10 order states.
- **Acceptance Criteria**:
  - Test suite covering all 10 order states (`CREATED` through `COMPLETED` / `FAILED`).
  - Verify active step CSS classes and timestamp rendering.
  - 100% test coverage for timeline component.
- **Relevant Area**: Frontend
- **Difficulty**: Medium
- **Potential Skills**: TypeScript, Vitest, React Testing Library
