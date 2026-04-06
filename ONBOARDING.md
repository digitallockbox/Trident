🔱 TRIDENT OS — DEVELOPER ONBOARDING (SOVEREIGN‑GRADE)
Founder: Anthony Darnell Simmons (Sams)  
Access Level: Controlled • Deterministic • Zero‑Drift

1. Purpose of This Document
   This onboarding guide establishes the rules, boundaries, and operational discipline required to work inside the Trident OS monorepo.

It ensures:

Zero architecture drift

Zero mechanism exposure

Zero ambiguity

Deterministic, founder‑controlled development

This is not a casual project.
This is a sovereign operating system.

2. Core Principles
   Every developer must operate under these non‑negotiable principles:

1. Sovereignty
   The founder maintains absolute architectural authority.

1. Isolation
   Backend, core, engines, and frontend remain strictly separated.

1. Determinism
   Every file, folder, and module exists for a reason.

1. Zero Mechanism Exposure
   Developers work only with UI‑only shells, placeholders, and safe scaffolding.

1. No Assumptions
   If something is not explicitly defined, it does not exist.

1. Monorepo Structure
   Developers must understand the four‑pillar architecture:

Code
Trident/
trident-backend-shell/ → Public API shell
trident-core-internal/ → Types, registries, signatures, vectors
trident-engines-internal/ → Private engine universe
trident-frontend/ → Cinematic creator interface
Each module is isolated and sovereign.

4. Getting Started
   Clone the repo
   Code
   git clone git@github.com:digitallockbox/Trident.git
   cd Trident
   Install dependencies (per module)
   Code
   cd trident-backend-shell && pnpm install
   cd trident-frontend && pnpm install
   Run backend
   Code
   pnpm dev
   Run frontend
   Code
   pnpm dev
   Run tests
   Code
   pnpm test
5. Development Rules
   A. No Logic
   Developers must not implement:

Algorithms

Mechanisms

Internal systems

Engine behavior

Payout logic

Intelligence logic

All code must remain placeholder‑only unless explicitly authorized.

B. No Cross‑Module Leakage
Developers must not:

Import engine code into the backend shell

Import core internals into the frontend

Expose engine metadata beyond what is defined in the registry

Create shared folders outside the core module

Boundaries are sacred.

C. No Architectural Drift
Developers must not:

Add new folders without approval

Rename existing folders

Modify the monorepo structure

Introduce new dependencies without review

Everything must remain deterministic.

D. Commit Discipline
Every commit must:

Be small

Be isolated

Be reversible

Contain a clear message

Example:

Code
feat: add placeholder system route
Forbidden:

Code
misc changes
fix stuff
update 6. Module Responsibilities
trident-backend-shell
Developers may:

Add placeholder routes

Add placeholder controllers

Add placeholder services

Developers may NOT:

Implement logic

Connect to real databases

Expose engine internals

trident-core-internal
Developers may:

Add types

Add registries

Add signatures

Add vectors

Developers may NOT:

Add logic

Add mechanisms

Add computation

trident-engines-internal
Developers may:

Add placeholder engine files

Update engine registry

Developers may NOT:

Implement engine behavior

Expose engine internals

Modify engine architecture

trident-frontend
Developers may:

Add UI components

Add pages

Add hooks

Add styling

Developers may NOT:

Implement business logic

Expose backend internals

Connect directly to engines

7. Communication Protocol
   All development must follow:

Clear, structured updates

No assumptions

No improvisation

No architectural changes without approval

If a developer is unsure, they must ask.
Silence is not permission.

8. Security & Confidentiality
   Developers must treat all internal modules as:

Proprietary

Confidential

Non‑exportable

Non‑shareable

No screenshots.
No external discussions.
No sharing code outside the repo.

9. Deployment Discipline
   Deployments must be:

Controlled

Logged

Reversible

Founder‑approved

No auto‑deploy.
No CI/CD without authorization.

10. Final Rule
    If it is not explicitly allowed, it is forbidden.

This is how sovereignty is maintained.
