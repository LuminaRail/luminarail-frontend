# Contributing to LuminaRail Frontend

Thank you for your interest in contributing to **LuminaRail Frontend**. LuminaRail is an open-source settlement infrastructure platform connecting local payment rails with assets on the Stellar network.

---

## Branching Strategy

We follow a strict branching model across all LuminaRail repositories:

- `main`: Production-ready code. Direct commits are forbidden.
- `develop`: Primary integration branch. All feature work branches off and merges into `develop`.
- `feature/*`: Dedicated branches for new features or user interface components.
- `fix/*`: Dedicated branches for bug fixes.

---

## Getting Started

1. **Prerequisites**: Node.js v20+ and `npm` v10+.
2. **Clone & Branch**: Ensure you create your branch from `develop`.
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature-name
   ```
3. **Environment Setup**: Copy `.env.example` to `.env.local` for local development. Never commit real API credentials or private keys.

---

## Code Quality & Standards

- **TypeScript**: Strict mode enabled. Do not use `any` unless explicitly justified.
- **Component Architecture**: Keep components focused, modular, and reusable in `components/`.
- **API Abstraction**: All network requests must route through `lib/api` or `services/` abstractions. Never hardcode endpoints or trust client-side financial calculations.
- **Styling**: Use Tailwind CSS and follow LuminaRail's design tokens and responsive standards.

---

## Pull Request Checklist

Before submitting a PR to `develop`:

1. Ensure code builds cleanly: `npm run build`
2. Run type check: `npm run type-check`
3. Run linter: `npm run lint`
4. Run tests: `npm test`
5. Do not include sensitive information or hardcoded credentials.
