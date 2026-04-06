# TODO Backlog — Trident Platform

## Legend

- [ ] Open
- [~] In Progress
- [x] Done

---

## 1. Backend

### 1.1 Auth & Identity

- [ ] Normalize error responses for /v1/auth/\*
- [ ] Add rate limiting to login endpoint
- [ ] Add tests for refresh token rotation

### 1.2 API Endpoints

- [ ] Audit all routes for completeness (auth, users, engines, sections, streams, payouts)
- [ ] Add/complete input validation for every endpoint
- [ ] Normalize error responses across all endpoints
- [ ] Add/expand tests for all endpoints (unit + integration)
- [ ] Document all endpoints (parameters, responses, errors)

### 1.3 Engine Implementations

- [ ] Implement core logic for Sorvereign engine
- [ ] Implement core logic for Router engine
- [ ] Implement core logic for Paragon engine
- [ ] Ensure every engine route validates input (if any)
- [ ] Add audit logging for all engine invocations
- [ ] Add tests for engine signatures and vectors

### 1.4 Solana Integration

- [ ] Finalize instruction builders
- [ ] Normalize Solana error handling
- [ ] Add event indexing + DB models
- [ ] Load treasury keypair securely (backend)
- [ ] Connect audit-trail indexer to Solana RPC/WebSocket or webhook
- [ ] Parse logs for SplitExecuted, ProductSale, etc. in audit-trail indexer
- [ ] Store Solana events in DB, update analytics (audit-trail indexer)
- [ ] Add DB connection, error handling, logging to audit-trail indexer
- [ ] Fetch on-chain data in routes/trident.ts (multiple TODOs)

### 1.2 Engines

- [ ] Ensure every engine route validates input (if any)
- [ ] Add audit logging for all engine invocations
- [ ] Add tests for engine signatures and vectors

### 1.3 Solana Integration

- [ ] Finalize instruction builders
- [ ] Normalize Solana error handling
- [ ] Add event indexing + DB models

---

## 2. Frontend (Trident Dashboard)

- [ ] Add loading/error states to all API panels
- [ ] Implement API usage panel
- [ ] Implement payout controls and cycle display
- [ ] List and manage API keys (ApiUsagePanel)
- [ ] Show API usage graph (ApiUsagePanel)
- [ ] Show error logs (ApiUsagePanel)
- [ ] Manage webhooks (ApiUsagePanel)
- [ ] Add business settings panels (BusinessSettingsPanel)

---

## 3. Frontend (LiveStreamLab)

- [ ] Wire stream start/stop to real backend
- [ ] Display payout balance from Trident
- [ ] Show micro‑identity summary on dashboard
- [ ] Use Solana web3.js to check if ATA exists (trident-sdk.ts)
- [ ] Fetch on-chain or API data for balances and account info (trident-sdk.ts)

---

## 4. Testing

- [ ] Add integration tests for /v1/micro/\*
- [ ] Add E2E tests for login → dashboard flow
- [ ] Add tests for Solana service
- [ ] Add integration tests for engine core logic (Sorvereign, Router, Paragon)
- [ ] Add integration tests for audit-trail indexer

---

## 5. Docs

- [ ] Per‑engine API docs
- [ ] Security model doc
- [ ] Solana integration doc

---

## 6. Deployment

- [ ] Add docker-compose.yml
- [ ] Add .env.example
- [ ] Document deployment steps (local → staging → prod)
