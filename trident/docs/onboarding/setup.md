# Developer Setup

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (or Docker)

## Quick Start

```bash
git clone <repo-url> trident
cd trident
npm install
cd shared && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

## Running Locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

## Building

```bash
bash scripts/build/build-all.sh
```
