import { describe, it, expect, beforeEach } from 'vitest';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { createHybridSovereignAuth } from '../../middleware/hybridSovereignAuth';

const TEST_API_KEY = 'TEST_KEY';
const TEST_TENANT = 'test-tenant';
const tenants = [
    { key: TEST_API_KEY, tenant: TEST_TENANT, active: true },
];

function mockReqRes(headers: Record<string, string | undefined> = {}) {
    const req: any = { headers, url: '/' };
    const res: any = {
        statusCode: 200,
        ended: false,
        endedMsg: undefined,
        setHeader: () => { },
        end(msg?: string) {
            this.ended = true;
            this.endedMsg = msg;
        },
        status(code: number) {
            this.statusCode = code;
            return this;
        },
    };
    let nextCalled = false;
    const next = (err?: any) => {
        nextCalled = true;
        req.nextErr = err;
    };
    return { req, res, next, nextCalled: () => nextCalled };
}

describe('hybridSovereignAuth middleware', () => {
    let keypair: nacl.SignKeyPair;
    let replayStore: Set<string>;
    let hybridAuth: ReturnType<typeof createHybridSovereignAuth>;

    beforeEach(() => {
        keypair = nacl.sign.keyPair();
        replayStore = new Set();
        hybridAuth = createHybridSovereignAuth({ tenants, replayStore, maxSkewMs: 5 * 60 * 1000 });
    });

    it('rejects missing headers', () => {
        const { req, res, next, nextCalled } = mockReqRes();
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects invalid API key', () => {
        const messageObj = { nonce: 'n1', timestamp: Date.now(), action: 'test', payload: {} };
        const message = JSON.stringify(messageObj);
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        const headers = {
            'x-api-key': 'WRONG_KEY',
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message,
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(403);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects invalid signature', () => {
        const messageObj = { nonce: 'n2', timestamp: Date.now(), action: 'test', payload: {} };
        const message = JSON.stringify(messageObj);
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        signature[0] = (signature[0] + 1) % 256; // tamper
        const headers = {
            'x-api-key': TEST_API_KEY,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message,
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects expired timestamp', () => {
        const messageObj = { nonce: 'n3', timestamp: Date.now() - 10 * 60 * 1000, action: 'test', payload: {} };
        const message = JSON.stringify(messageObj);
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        const headers = {
            'x-api-key': TEST_API_KEY,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message,
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(res.endedMsg).toBe('Message expired');
        expect(nextCalled()).toBe(false);
    });

    it('rejects replayed nonce', () => {
        const messageObj = { nonce: 'n4', timestamp: Date.now(), action: 'test', payload: {} };
        const message = JSON.stringify(messageObj);
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        const headers = {
            'x-api-key': TEST_API_KEY,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message,
        };
        // First request: should pass
        const first = mockReqRes(headers);
        hybridAuth(first.req, first.res, first.next);
        expect(first.res.statusCode).toBe(200);
        expect(first.res.ended).toBe(false);
        expect(first.nextCalled()).toBe(true);
        // Second request with same nonce: should fail
        const second = mockReqRes(headers);
        hybridAuth(second.req, second.res, second.next);
        expect(second.res.statusCode).toBe(401);
        expect(second.res.ended).toBe(true);
        expect(second.res.endedMsg).toBe('Replay detected');
        expect(second.nextCalled()).toBe(false);
    });

    it('accepts valid request', () => {
        const messageObj = { nonce: 'n5', timestamp: Date.now(), action: 'test', payload: { foo: 'bar' } };
        const message = JSON.stringify(messageObj);
        const signature = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
        const headers = {
            'x-api-key': TEST_API_KEY,
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message,
        };
        const { req, res, next, nextCalled } = mockReqRes(headers);
        hybridAuth(req, res, next);
        expect(res.statusCode).toBe(200);
        expect(res.ended).toBe(false);
        expect(nextCalled()).toBe(true);
        expect(req.tenant).toBe(TEST_TENANT);
        expect(req.apiKey).toBe(TEST_API_KEY);
        expect(req.solanaPublicKey).toBe(headers['x-solana-publickey']);
        expect(req.action).toBe('test');
        expect(req.payload).toEqual({ foo: 'bar' });
    });
});
