# Deployment Guide

Instructions for deploying the Trident platform in development, staging, and production environments.

---

## 1. Environment Variables

- See `.env.example` for all required variables.
- Key variables:
  - DATABASE_URL
  - SOLANA_KEYPAIR
  - SOLANA_RPC_URL
  - JWT_SECRET
  - ...

---

## 2. Docker

- Build images:
  ```sh
  docker-compose build
  ```
- Start services:
  ```sh
  docker-compose up -d
  ```
- Stop services:
  ```sh
  docker-compose down
  ```

---

## 3. Database Migrations

- Run migrations:
  ```sh
  yarn migrate
  ```

---

## 4. Production Checklist

- Set all secrets and production variables.
- Enable HTTPS and security headers.
- Set up logging and monitoring.
- Run smoke tests after deploy.

---

## 5. Troubleshooting

- Check logs with `docker-compose logs`.
- Verify environment variables are set.
- See BUGLOG.md for known issues.
