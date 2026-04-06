# System Overview

Trident is a monorepo platform with three main packages:

- **backend/** — Node.js + Express API server (TypeScript, CommonJS)
- **frontend/** — React + Vite SPA (TypeScript, ESM)
- **shared/** — Shared types, constants, and utilities

## Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│  Frontend   │────▶│   Backend    │────▶│ PostgreSQL│
│  (Vite/React│     │  (Express)   │     │           │
└─────────────┘     └──────────────┘     └───────────┘
       │                    │
       └────── shared/ ─────┘
```
