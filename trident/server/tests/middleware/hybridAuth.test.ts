import { describe, it, expect, beforeEach } from 'vitest';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { createHybridAuth, ApiKeyRecord } from '../../middleware/hybridAuth';

function mockReqRes(headers: Record<string, string | undefined> = {}, body: any = undefined) {
    const req: any = { headers, body, url: '/' };
    const res: any = {
        statusCode: 200,
        ended: false,
        endedMsg: undefined,
        setHeader: () => { },
        end(msg?: string) {
            this.ended = true;
            this.endedMsg = msg;
        }
    };
    let nextCalled = false;
    const next = (err?: any) => {
        nextCalled = true;
        req.nextErr = err;
    };
    return { req, res, next, nextCalled: () => nextCalled };
}

describe('hybridAuth middleware', () => {
    const apiKey: ApiKeyRecord = { key: 'test-key', tenant: 'test-tenant', active: true };
    const config = { apiKeys: [apiKey] };
    let hybridAuth: ReturnType<typeof createHybridAuth>;

    beforeEach(() => {
        hybridAuth = createHybridAuth(config);
    });

    it('rejects missing headers', () => {
        const { req, res, next, nextCalled } = mockReqRes();
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects invalid API key', () => {
        const { req, res, next, nextCalled } = mockReqRes({ 'x-api-key': 'bad-key' });
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(403);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects invalid signature', () => {
        const keypair = nacl.sign.keyPair();
        const message = JSON.stringify({ nonce: 'n', timestamp: Date.now(), action: 'a', payload: {} });
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        signature[0] = (signature[0] + 1) % 256; // tamper
        const headers = {
            'x-api-key': apiKey.key,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects expired timestamp', () => {
        const keypair = nacl.sign.keyPair();
        const message = JSON.stringify({ nonce: 'n', timestamp: Date.now() - 10 * 60 * 1000, action: 'a', payload: {} });
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        const headers = {
            'x-api-key': apiKey.key,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects replayed nonce', () => {
        const keypair = nacl.sign.keyPair();
        const nonce = 'unique-nonce';
        const message = JSON.stringify({ nonce, timestamp: Date.now(), action: 'a', payload: {} });
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        const headers = {
            'x-api-key': apiKey.key,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res.ended).toBe(false);
        expect(nextCalled()).toBe(true);
        // replay
        const { req: req2, res: res2, next: next2, nextCalled: nextCalled2 } = mockReqRes(headers);
        hybridAuth(req2, res2, next2);
        expect(res2.statusCode).toBe(401);
        expect(res2.ended).toBe(true);
        expect(nextCalled2()).toBe(false);
    });

    it('accepts valid request', () => {
        const keypair = nacl.sign.keyPair();
        const message = JSON.stringify({ nonce: 'n', timestamp: Date.now(), action: 'a', payload: { foo: 1 } });
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        const headers = {
            'x-api-key': apiKey.key,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res.ended).toBe(false);
        expect(nextCalled()).toBe(true);
        expect(req.tenant).toBe(apiKey.tenant);
        expect(req.apiKey).toBe(apiKey.key);
        expect(req.solanaPublicKey).toBe(headers['x-solana-publickey']);
        expect(req.action).toBe('a');
        expect(req.payload).toEqual({ foo: 1 });
    });
});
