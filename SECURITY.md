# Security Policy — LuminaRail Frontend

Security is paramount for LuminaRail as a financial settlement infrastructure project.

---

## Core Security Rules

1. **Off-Chain Personal Data**: Sensitive user information, PII, and banking credentials must remain off-chain and securely handled by backend services.
2. **Never Trust Client-Side Calculations**: The frontend acts purely as a user interface and presentation layer. All financial values, quotes, rates, order totals, and settlement rules are strictly calculated and validated server-side by `luminarail-backend`.
3. **Secret Hygiene**:
   - Never commit `.env`, private keys, secret keys, or wallet seed phrases.
   - Frontend environment variables exposed to the browser must strictly start with `NEXT_PUBLIC_` and must only contain public, non-sensitive configuration values.
4. **Stellar Wallet Security**: Wallet connection implementations (e.g. Freighter) must never request or store raw secret seed phrases. Transactions must be signed via wallet extension prompts.

---

## Reporting Vulnerabilities

If you discover a potential security vulnerability within LuminaRail, please do **not** open a public issue.

Please submit security disclosures directly to `security@luminarail.org` (or contact project maintainers). Provide detailed steps to reproduce the issue so it can be patched promptly.
