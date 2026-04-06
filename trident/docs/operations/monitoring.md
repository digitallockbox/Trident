# Monitoring

## Prometheus

Backend exposes metrics at `GET /metrics` via prom-client.

Config: `ops/monitoring/prometheus/prometheus.yml`

## Grafana

Dashboard template: `ops/monitoring/grafana/dashboards.json`

Key metrics:

- `http_requests_total` — Request count by status
- `http_request_duration_seconds` — Latency histogram

## Logs

- Format: JSON (winston)
- Rotation: `ops/logs/rotation/logrotate.conf`
- Log directory: `backend/logs/`
