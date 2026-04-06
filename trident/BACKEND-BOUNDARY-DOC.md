# Trident Contractor Boundary Document

**Purpose:**
This document defines the strict boundaries for all external contributors (contractors) working on Trident. It ensures core intellectual property, engine logic, and sensitive infrastructure remain protected while enabling productive, safe collaboration on the shell (frontend and backend API surface).

---

## 1. Scope of Contractor Access

**Contractors are permitted to:**

- Work on `trident-frontend` (Next.js/React app):
  - UI pages, components, styling, and public assets.
- Work on `trident-backend-shell`:
  - API route handlers (excluding engine wiring/logic)
  - Types, DTOs, and validation schemas
  - Integration with engine entrypoints (e.g., `executeOmegaEntry`)
- Propose changes to API contracts (with review)
- Write and update tests for the above

**Contractors are strictly prohibited from:**

- Accessing or modifying any `internal-*` package or repo (e.g., `trident-core-internal`, `internal-omega`, etc.)
- Viewing, editing, or reverse-engineering engine, payouts, orchestration, or security logic
- Changing engine wiring or entrypoint logic (e.g., `executeOmegaEntry`)
- Accessing infrastructure, deployment, or CI/CD secrets
- Making direct calls to money, payouts, or security modules
- Attempting to inspect containers, logs, or binaries beyond their scope

---

## 2. Non-Negotiable Rules

- No new direct calls to money, payouts, or security logic without written approval from the core team.
- No attempts to bypass, patch, or replace engine entrypoints (e.g., `executeOmegaEntry`).
- No attempts to access or decompile internal packages, binaries, or containers.
- All code reviews will check for boundary violations. Any violation is grounds for immediate access revocation.

---

## 3. API Contract Boundaries

- All engine interactions must go through the provided entrypoints (e.g., `executeEngine('omega', payload)` or `executeOmegaEntry`).
- Only types and DTOs defined in `src/contracts/engines.ts` (or equivalent) are to be used for engine requests/responses.
- No direct imports from internal packages are allowed.
- Validation schemas must be defined and enforced at the API boundary.

---

## 4. Security & Review Expectations

- Access is limited to `trident-frontend` and `trident-backend-shell` repositories only.
- CI/CD for shell repos must not contain tokens or secrets that can access internal repos or packages.
- All PRs are reviewed for boundary adherence, security, and code quality.
- Any suspicious activity or boundary violation will be investigated and may result in immediate removal.

---

## 5. Onboarding Checklist

1. Sign NDA and accept the access policy.
2. Receive access to `trident-frontend` and `trident-backend-shell` only.
3. Read this boundary document and confirm understanding.
4. Receive API contracts and example tasks (e.g., "add a new page that calls `executeEngine('omega', payload)`").
5. All work is subject to review for boundary adherence.

---

**Questions?**
Contact the core team before proceeding if you are unsure whether a change is in scope.

---

_This document must be acknowledged by all contractors before any work begins. Any violation will result in immediate access review and possible termination of contract._
