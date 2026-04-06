# API Endpoints

## Health

- `GET /health` — Health check

## Metrics

- `GET /metrics` — Prometheus metrics

## Auth

- `POST /api/auth/login` — Authenticate
- `POST /api/auth/register` — Register

## Engines

All 27 engines are available under `/api/<engine-name>/` (aegis, apex, ascendant, chronos, continuum, echelon, eternum, fusion, genesis, helios, helix, hyperion, infinity, lumen, monarch, nexus, nexus2, omega, oracle, overmind, overwatch, pantheon, paragon, prime, sentinel, solaris, sovereign).

## Operator

- `GET /api/operator/` — Operator dashboard data
- `POST /api/operator/action` — Execute operator action
