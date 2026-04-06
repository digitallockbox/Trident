# Trident Platform - Quick Start Guide

## 🚀 Start in 3 Steps (Docker)

### Step 1: Install Docker
Download and install Docker Desktop for your OS:
- **Windows:** https://docker.com/products/docker-desktop
- **macOS:** https://docker.com/products/docker-desktop
- **Linux:** https://docs.docker.com/engine/install/

### Step 2: Clone/Open Trident
```bash
cd c:\Users\samsp\New folder\trident
```

### Step 3: Launch Everything
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

## 🌐 Access Your Platform

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost | React app with 27 engines |
| Backend API | http://localhost:3000 | API routes |
| Health Check | http://localhost:3000/health | Service status |

## 📊 What's Running

```
Frontend (Nginx + React)
├── Port 80
├── Serves React SPA
└── Proxies /api to backend

Backend (Node.js + Express)
├── Port 3000
├── 27 Engine modules
├── 27 API routes
└── PostgreSQL integration

Database (PostgreSQL)
├── Port 5432 (internal only)
├── Isolated on trident-network
└── Automatic backups: ~/trident-db-data
```

## 🛑 Stop Everything

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 📋 Useful Commands

```bash
# View running services
docker-compose ps

# See logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db psql -U postgres -d trident

# Rebuild after code changes
docker-compose up --build

# Clean everything
docker-compose down -v --rmi all
```

## 🔧 Edit Code

Code changes in:
- `server/**/*.ts` - Backend code
- `frontend/**/*.tsx` - Frontend code

**During development:**
```bash
# Backend auto-compiles and restarts
docker-compose up backend

# Frontend hot-reloads (needs npm install locally or different setup)
docker-compose up frontend
```

## 🔒 Security Features

✅ Non-root user execution  
✅ Minimal Alpine base images  
✅ Health checks → auto-restart  
✅ Network isolation  
✅ Dropped Linux capabilities  
✅ Read-only filesystems  
✅ Security headers configured  
✅ Rate limiting enabled  

## 📝 Environment Variables

Edit before first run:
```bash
# Backend secrets
server/.env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-secret-key
API_KEY=your-api-key

# Frontend config
frontend/.env
VITE_API_URL=http://localhost:3000/api
```

## ❓ Troubleshooting

### Containers not starting?
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Port already in use?
- Port 80: Change `ports: ["8080:3000"]` in docker-compose.yml (frontend)
- Port 3000: Change `ports: ["3001:3000"]` (backend)

### Database won't connect?
```bash
docker-compose exec db psql -U postgres -d trident
```

### Clean slate?
```bash
docker-compose down -v --rmi all
docker-compose up --build
```

## 🎯 Next Steps

1. ✅ Install Docker
2. ✅ Run `docker-compose up --build`
3. ✅ Visit http://localhost
4. ✅ Explore the 27 engines
5. ✅ Start customizing!

## 📚 Full Documentation

See [DOCKER.md](DOCKER.md) for comprehensive Docker setup and advanced configurations.

---

**No Node.js/npm required. Everything runs in containers!**
