// Trident API Routes (Express)
// Place in: server/routes/trident.ts

import express from 'express';
import { ApiResponse, CreatorEarnings, AffiliateStats, ProductMetadata, JobMetadata } from '../../frontend/src/types/trident-sdk';
const { Connection, Keypair, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');
const { Pool } = require('pg');

const router = express.Router();

// GET /creator/:id/earnings
router.get('/creator/:id/earnings', async (req, res) => {
    // TODO: Fetch from DB/on-chain
    const response: ApiResponse<CreatorEarnings> = { success: false, error: 'Not implemented' };
    res.json(response);
});

// GET /affiliate/:id/stats
router.get('/affiliate/:id/stats', async (req, res) => {
    // TODO: Fetch from DB/on-chain
    const response: ApiResponse<AffiliateStats> = { success: false, error: 'Not implemented' };
    res.json(response);
});

// GET /store/products
router.get('/store/products', async (req, res) => {
    // TODO: Fetch from DB/on-chain
    const response: ApiResponse<ProductMetadata[]> = { success: false, error: 'Not implemented' };
    res.json(response);
});

// GET /jobs/:id
router.get('/jobs/:id', async (req, res) => {
    // TODO: Fetch from DB/on-chain
    const response: ApiResponse<JobMetadata> = { success: false, error: 'Not implemented' };
    res.json(response);
});

// GET /username/:handle
router.get('/username/:handle', async (req, res) => {
    // TODO: Fetch from DB/on-chain
    const response: ApiResponse<{ userId: string }> = { success: false, error: 'Not implemented' };
    res.json(response);
});

// POST endpoint for sending a gift/tip (SplitExecuted)
router.post('/send-gift', async (req, res) => {
    try {
        const { amount, creator, platform, affiliate, mint, referenceId } = req.body;
        const fromPubkey = new PublicKey(creator);
        const toPubkey = new PublicKey(platform);
        const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
        const feePayer = Keypair.fromSecretKey(bs58.decode(process.env.FEE_PAYER_SECRET)); // Set FEE_PAYER_SECRET in env

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey,
                toPubkey,
                lamports: amount,
            })
        );
        // In real use, the creator signs; here, feePayer signs for demo
        const signature = await sendAndConfirmTransaction(connection, tx, [feePayer]);
        // Store event in DB
        await pool.query(
            `INSERT INTO split_executed (amount, creator, platform, affiliate, mint, timestamp, reference_id, signature)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
            [amount, creator, platform, affiliate || null, mint, referenceId || null, signature]
        );
        res.json({ success: true, signature });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// --- Full Solana transaction and DB logic for /purchase-product ---
router.post('/purchase-product', async (req, res) => {
    try {
        const { productId, buyer, seller, amount, mint, affiliate } = req.body;
        const fromPubkey = new PublicKey(buyer);
        const toPubkey = new PublicKey(seller);
        const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
        const feePayer = Keypair.fromSecretKey(bs58.decode(process.env.FEE_PAYER_SECRET)); // Set FEE_PAYER_SECRET in env

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey,
                toPubkey,
                lamports: amount,
            })
        );
        const signature = await sendAndConfirmTransaction(connection, tx, [feePayer]);
        await pool.query(
            `INSERT INTO product_sale (product_id, buyer, seller, amount, mint, affiliate, timestamp, signature)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
            [productId, buyer, seller, amount, mint, affiliate || null, signature]
        );
        res.json({ success: true, signature });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// --- Full Solana transaction and DB logic for /pay-job ---
router.post('/pay-job', async (req, res) => {
    try {
        const { jobId, worker, employer, amount, mint, affiliate } = req.body;
        const fromPubkey = new PublicKey(employer);
        const toPubkey = new PublicKey(worker);
        const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
        const feePayer = Keypair.fromSecretKey(bs58.decode(process.env.FEE_PAYER_SECRET)); // Set FEE_PAYER_SECRET in env

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey,
                toPubkey,
                lamports: amount,
            })
        );
        const signature = await sendAndConfirmTransaction(connection, tx, [feePayer]);
        await pool.query(
            `INSERT INTO job_payment (job_id, worker, employer, amount, mint, affiliate, timestamp, signature)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
            [jobId, worker, employer, amount, mint, affiliate || null, signature]
        );
        res.json({ success: true, signature });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// --- Backend endpoint for user login/profile ---
router.post('/user/login', async (req, res) => {
    const { pubkey } = req.body;
    if (!pubkey) return res.json({ success: false, error: 'Missing pubkey' });
    try {
        let result = await pool.query('SELECT * FROM users WHERE pubkey = $1', [pubkey]);
        let profile;
        if (result.rows.length === 0) {
            // Create new user with default role
            result = await pool.query(
                'INSERT INTO users (pubkey, role, display_name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
                [pubkey, 'user', '', '']
            );
        }
        profile = result.rows[0];
        res.json({ success: true, data: profile });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// Add PUT endpoint for profile editing and role management
router.put('/user/:pubkey', async (req, res) => {
    const { pubkey } = req.params;
    const { display_name, avatar_url, role } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET display_name = $1, avatar_url = $2, role = $3 WHERE pubkey = $4 RETURNING *',
            [display_name, avatar_url, role, pubkey]
        );
        if (result.rows.length === 0) return res.json({ success: false, error: 'User not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// Add isAdmin field to user profile and admin-only middleware
function isAdmin(req, res, next) {
    // Example: check if user is admin (assume pubkey in req.body or req.user)
    const pubkey = req.body.pubkey || (req.user && req.user.pubkey);
    if (!pubkey) return res.status(401).json({ success: false, error: 'Unauthorized' });
    pool.query('SELECT role FROM users WHERE pubkey = $1', [pubkey])
        .then(result => {
            if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Forbidden: Admins only' });
            }
            next();
        })
        .catch(e => res.status(500).json({ success: false, error: e.message }));
}

// Example: Protect a route with admin-only access
router.delete('/user/:pubkey', isAdmin, async (req, res) => {
    const { pubkey } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE pubkey = $1', [pubkey]);
        res.json({ success: true });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// Add GET /users endpoint for admin panel
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT pubkey, role, display_name FROM users');
        res.json({ success: true, data: result.rows });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

export default router;
