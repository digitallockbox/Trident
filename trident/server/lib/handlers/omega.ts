import { Handler } from '../router';
import type { PayoutRequest, PayoutResponse } from '../models/payout';
import { sendNativePayout, sendSplTokenPayout } from '../../services/solana.service';
import { getPayoutById } from '../../services/payouts.repo';

export const payout: Handler = async (req, res) => {
  const { wallet, amount, token } = req.body as PayoutRequest;
  try {
    let tx: string;
    if (!token || token === 'SOL') {
      tx = await sendNativePayout(wallet, amount);
    } else {
      tx = await sendSplTokenPayout(wallet, amount, token);
    }
    const response: PayoutResponse = { ok: true, tx };
    res.json(response);
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || 'Payout failed' });
  }
};

export const batch: Handler = async (req, res) => {
  // Batch payouts for efficiency
  // ...
  res.json({ ok: true, batch: [] });
};

export const status: Handler = async (req, res) => {
  const { id } = req.params;
  try {
    const payout = await getPayoutById(id);
    if (!payout) {
      res.status(404).json({ ok: false, error: 'Payout not found' });
      return;
    }
    res.json({ ok: true, payout });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || 'Failed to fetch payout status' });
  }
};

export const balance: Handler = (req, res) => {
  // Check treasury balance
  // ...
  res.json({ ok: true, balance: 0 });
};
