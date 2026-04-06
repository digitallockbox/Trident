# Deployment

## Docker

```bash
cd infra/docker
docker compose up --build
```

## Kubernetes

```bash
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress/
```

## Manual

```bash
bash scripts/build/build-all.sh
cd backend && node dist/index.js
# Serve frontend/dist with nginx
```
