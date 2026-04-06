# Trident Backend Deployment Steps (Automated/Manual)

## 1. Run All Tests

npx vitest run

## 2. Audit Dependencies

npm audit --omit=dev

## 3. Prune Dev Dependencies

npm prune --production

## 4. Build for Production

npm run build

## 5. Start in Production

# With Node.js

set NODE_ENV=production && node dist/lib/server.js

# Or with PM2 (recommended for production)

pm install -g pm2
pm2 start ecosystem.config.js

## 6. Docker Build & Run

# Build Docker image

# (from project root, or cd server)

docker build -t trident-backend -f Dockerfile .

# Run Docker container

# (ensure port 3000 is available)

docker run -d -p 3000:3000 --name trident-backend trident-backend

## 7. Health Check

# Test health endpoint

curl http://localhost:3000/health

## 8. Logs & Monitoring

# PM2 logs

pm2 logs trident-backend

# Docker logs

# docker logs trident-backend

---

Automate these steps in CI/CD for best results. For questions or further automation, ask Copilot!
