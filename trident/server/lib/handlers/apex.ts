import { Handler } from '../router';

export const split: Handler = async (req, res) => {
  const { amount, creatorId, affiliateId } = req.body;
  // deterministic split logic
  // ...
  res.json({ ok: true, split: { amount, creatorId, affiliateId } });
};

export const preview: Handler = async (req, res) => {
  // Simulate a split without committing
  // ...
  res.json({ ok: true, preview: {} });
};

export const rules: Handler = (req, res) => {
  // Fetch active split rules
  // ...
  res.json({ ok: true, rules: [] });
};

export const updateRules: Handler = async (req, res) => {
  // Update split rules (admin-only)
  // ...
  res.json({ ok: true, updated: true });
};
