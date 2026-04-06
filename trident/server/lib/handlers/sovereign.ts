import { Handler } from '../router';

export const version: Handler = (req, res) => {
  // Platform version
  // ...
  res.json({ ok: true, version: '1.0.0' });
};

export const capabilities: Handler = (req, res) => {
  // Enabled modules
  // ...
  res.json({ ok: true, modules: [] });
};

export const health: Handler = (req, res) => {
  // Full system health
  // ...
  res.json({ ok: true, health: 'ok' });
};
