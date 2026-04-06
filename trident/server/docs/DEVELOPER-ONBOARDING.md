# Developer Onboarding Guide

Welcome to the Trident project! This guide will help you get set up and productive quickly.

---

## 1. Prerequisites

- Node.js (version X.X.X+)
- Yarn or npm
- Docker (for local development)
- Solana CLI (for blockchain integration)

---

## 2. Clone the Repository

```sh
git clone <repo-url>
cd trident
```

---

## 3. Environment Setup

- Copy `.env.example` to `.env` in both backend and frontend folders.
- Fill in required environment variables (see DEPLOYMENT.md).

---

## 4. Install Dependencies

```sh
cd server && yarn install
cd ../frontend && yarn install
```

---

## 5. Running Locally

- Backend: `yarn dev` or `yarn start`
- Frontend: `yarn dev`
- Docker: `docker-compose up`

---

## 6. Running Tests

- Backend: `yarn test`
- Frontend: `yarn test`

---

## 7. Adding a New Engine

- See `docs/PROJECT-COMPLETION-PLAN.md` for engine structure and requirements.

---

## 8. Useful Links

- [Project Completion Plan](./PROJECT-COMPLETION-PLAN.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Checklist](./SECURITY-CHECKLIST.md)
