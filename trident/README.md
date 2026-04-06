# Trident Platform

A full-stack web platform with Node.js backend, React frontend, PostgreSQL database, and 27 specialized engines.

**27 Engines:**
Fusion • Overwatch • Aegis • Sentinel • Continuum • Helix • Nexus • Sovereign • Oracle • Overmind • Pantheon • Infinity • Paragon • Echelon • Genesis • Helios • Apex • Lumen • Chronos • Nexus2 • Solaris • Monarch • Hyperion • Omega • Eternum • Prime • Ascendant

## Quick Start (Docker - Recommended)

**No Node.js installation required!**

```bash
# 1. Install Docker from https://docker.com/get-started/
# 2. Run the entire platform:
docker-compose up --build

# 3. Access:
# Frontend: http://localhost
# Backend API: http://localhost:3000/api
# Health: http://localhost:3000/health
```

See [DOCKER.md](DOCKER.md) for detailed Docker setup and security features.

## Traditional Setup (Requires Node.js 25+)

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
trident/
├── server/
│   ├── engine/          (27 engines)
│   ├── routes/          (27 API routes)
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── hooks/       (27 custom hooks)
│   │   ├── pages/       (27 page components)
│   │   ├── components/  (reusable UI components)
│   │   ├── styles/
│   │   └── utils/
│   └── public/
├── docker-compose.yml   (orchestration)
└── DOCKER.md           (Docker guide)
```

## Security

✅ Non-root user execution  
✅ Multi-stage optimized builds  
✅ Health checks & auto-restart  
✅ Network isolation  
✅ Dropped capabilities  
✅ Read-only filesystems  
✅ Security headers  
✅ Rate limiting

## Development

The platform uses TypeScript for type safety. ESLint configured for code quality. All 27 engines have matching routes, React hooks, and page components.

---

# Trident Developer Onboarding Guide

## 1. Overview

Trident is a modular on-chain split engine. You only need to connect your frontend and backend to Trident—no need to rewrite core logic.

## 2. File Structure

- **Frontend**: UI, SDK integration, wallet adapters
- **Backend**: Indexer, API routes, analytics
- **Shared Types**: All types in `frontend/src/types/trident-sdk.ts`

## 3. Frontend Integration

- Use the SDK in `frontend/src/logic/trident-sdk.ts`
- Add UI components for gifts, tips, products, jobs, earnings, etc.
- Integrate Solana wallet adapters (Phantom, Solflare, Backpack)

## 4. Backend Integration

- Use the indexer in `server/audit-trail/indexer.ts`
- Implement API routes in `server/routes/trident.ts`
- Store analytics, metadata, and profiles in your DB

## 5. API Endpoints

- `/creator/:id/earnings`
- `/affiliate/:id/stats`
- `/store/products`
- `/jobs/:id`
- `/username/:handle`

## 6. Event Indexing

- Listen for on-chain events: SplitExecuted, ProductSale, JobPayment, AffiliateConversion, ConfigUpdated
- Store events for dashboards and analytics

## 7. Next Steps

- Implement missing logic in SDK, indexer, and API
- Build your UI and connect to the SDK
- Deploy backend and frontend

## 8. Support

For questions, reach out to the Trident team or check the whitepaper and docs.
