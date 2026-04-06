import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new client.Counter({
    name: 'trident_http_requests_total',
    help: 'Total HTTP requests handled by Trident backend',
    labelNames: ['method', 'path', 'status'],
    registers: [registry],
});

export const httpRequestDurationSeconds = new client.Histogram({
    name: 'trident_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [registry],
});

export const metricsRegistry = registry;
