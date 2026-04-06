import { Handler } from '../router';

export const list: Handler = (req, res) => {
  // List all engines + status
  // ...
  res.json({ ok: true, engines: [] });
};

export const enable: Handler = async (req, res) => {
  const { name } = req.params;
  // Enable engine
  // ...
  res.json({ ok: true, engine: name, status: 'enabled' });
};

export const disable: Handler = async (req, res) => {
  const { name } = req.params;
  // Disable engine
  // ...
  res.json({ ok: true, engine: name, status: 'disabled' });
};

export const audit: Handler = (req, res) => {
  // Fetch audit logs
  // ...
  res.json({ ok: true, logs: [] });
};
