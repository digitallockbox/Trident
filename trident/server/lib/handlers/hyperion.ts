import { Handler } from '../router';

export const metrics: Handler = (req, res) => {
  // Platform-wide metrics
  // ...
  res.json({ ok: true, metrics: {} });
};

export const creator: Handler = (req, res) => {
  const { id } = req.params;
  // Creator-level analytics
  // ...
  res.json({ ok: true, id, analytics: {} });
};

export const transactions: Handler = (req, res) => {
  // Transaction feed
  // ...
  res.json({ ok: true, transactions: [] });
};
