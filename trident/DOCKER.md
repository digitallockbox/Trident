# Trident Platform - Docker Setup Guide

## Prerequisites
- Docker (https://docker.com/get-started/)
- Docker Compose
- No Node.js/npm installation required!

## Security Features Implemented

### ✅ Non-Root User Execution
- Backend: Runs as `nodejs` user (UID 1001)
- Frontend: Runs as `nginx` user (UID 1001)
- Database: Runs as `postgres` user
- Prevents privilege escalation attacks

### ✅ Minimal Base Images
- `node:25-alpine` (backend) - ~165 MB
- `nginx:alpine` (frontend) - ~42 MB
- `postgres:16-alpine` (database) - ~90 MB
- Reduces attack surface

### ✅ Multi-Stage Builds
- Backend: Separates build and runtime
- Frontend: Separates build and production serving
- Reduces final image size and dependencies

### ✅ Health Checks
- All services have health checks
- Automatic container restart on failure
- Orchestrated startup order

### ✅ Security Capabilities
- Dropped unnecessary Linux capabilities
- Read-only root filesystem (frontend)
- No new privileges allowed
- Resource limits enforced

### ✅ Network Isolation
- Custom bridge network (172.20.0.0/16)
- Services communicate via container names
- No external port access to database

### ✅ Signal Handling
- Backend uses `dumb-init` for proper PID 1 handling
- Graceful shutdown on SIGTERM
- Prevents zombie processes

### ✅ Environment Security
- Secrets via environment variables
- `.env` file not committed to git
- Database credentials isolated to docker-compose

### ✅ Nginx Hardening (Frontend)
- Security headers (CSP, X-Frame-Options, etc.)
- Gzip compression enabled
- Rate limiting (10 req/s per IP)
- Hidden file access denied
- SPA routing with index.html fallback

## Quick Start

### 1. Setup Environment Variables
```bash
# Copy example files
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env

# Edit with your secrets (Windows PowerShell)
notepad server/.env
notepad frontend/.env
```

### 2. Build and Start Services
```bash
# Windows PowerShell
docker-compose up --build

# Or background mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### 3. Access the Platform
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:3000/api
- Health check: http://localhost:3000/health

### 4. Verify Services
```bash
# Check running containers
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Execute commands in container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db psql -U postgres -d trident
```

## Stopping Services
```bash
# Stop all services
docker-compose down

# Remove volumes as well
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Production Deployment

For production, add:

1. **SSL/TLS Certificates**
   - Use Let's Encrypt with certbot
   - Mount certificates into nginx

2. **Environment Variables**
   - Use Docker secrets (Swarm)
   - Or AWS Secrets Manager (ECS)

3. **Logging**
   - Configure log drivers (splunk, awslogs, etc.)
   - Centralized log aggregation

4. **Monitoring**
   - Prometheus for metrics
   - Grafana for dashboards

5. **Backup Strategy**
   - PostgreSQL backup volumes
   - Automated daily snapshots

## Troubleshooting

### Containers won't start
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Health check failing
```bash
docker-compose ps  # Check STATUS column
docker-compose exec backend curl http://localhost:3000/health
```

### Database connection issues
```bash
# Test database connectivity
docker-compose exec backend telnet db 5432
```

### Port conflicts
```bash
# Check which process is using port 80/3000
netstat -ano | findstr :80
netstat -ano | findstr :3000
```

## Security Best Practices Checklist

- ✅ Non-root user execution
- ✅ Minimal base images
- ✅ Health checks configured
- ✅ Network isolation
- ✅ Secret management
- ✅ Capability dropping
- ✅ Read-only filesystem (where possible)
- ✅ Security headers configured
- ✅ Rate limiting enabled
- ✅ Proper signal handling

## Next Steps

1. Install Docker from https://docker.com/get-started/
2. Run `docker-compose up --build`
3. Access frontend at http://localhost
4. Start developing without local Node.js!
