# Backend Architecture

## Stack

- Runtime: Node.js 20+
- Framework: Express 4.19
- Language: TypeScript 5.6 (CommonJS)
- Database: PostgreSQL via Prisma 5.10
- Metrics: prom-client

## Directory Layout

```
backend/src/
  api/          — Routes, controllers, validators, middleware
  core/         — Config, env, logger, errors, security, metrics
  modules/      — Domain modules (engines, audit-trail, auth, users, etc.)
  services/     — Cross-cutting services (email, queue, cache)
  db/           — Prisma schema, migrations, repositories
  types/        — Shared TypeScript types
  utils/        — Utility functions
  app.ts        — Express app factory
  server.ts     — Server bootstrap
  index.ts      — Entry point
```
