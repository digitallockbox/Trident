# Load Test Plan

## Targets

- Backend API: `http://localhost:4000`
- Endpoints: `/health`, `/api/engines/*`, `/metrics`

## Scenarios

1. **Baseline**: 10 concurrent users, 60s duration
2. **Stress**: Ramp from 10 → 200 users over 5 minutes
3. **Soak**: 50 concurrent users, 30 minute duration

## Tools

- k6 or Artillery recommended
