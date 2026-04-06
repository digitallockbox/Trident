import { describe, it, expect } from 'vitest';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { solanaAuth } from '../middleware/solanaAuth';

// Mock request/response/next
function mockReqRes(
    headers: Record<string, string | undefined> = {},
    body: any = undefined
) {
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

describe('solanaAuth middleware', () => {
    it('rejects missing headers', () => {
        const { req, res, next, nextCalled } = mockReqRes();
        solanaAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('rejects invalid signature', () => {
        const keypair = nacl.sign.keyPair();
        const message = 'test-message';

        const signature = nacl.sign.detached(
            new TextEncoder().encode(message),
            keypair.secretKey
        );

        // Tamper signature
        signature[0] = (signature[0] + 1) % 256;

        const headers = {
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message
        };

        const { req, res, next, nextCalled } = mockReqRes(headers);
        solanaAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(nextCalled()).toBe(false);
    });

    it('accepts valid signature', () => {
        const keypair = nacl.sign.keyPair();
        const message = 'test-message';

        const signature = nacl.sign.detached(
            new TextEncoder().encode(message),
            keypair.secretKey
        );

        const headers = {
            'x-solana-publickey': bs58.encode(keypair.publicKey),
            'x-solana-signature': bs58.encode(signature),
            'x-solana-message': message
        };

        const { req, res, next, nextCalled } = mockReqRes(headers);
        solanaAuth(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res.ended).toBe(false);
        expect(nextCalled()).toBe(true);
        expect(req.solanaPublicKey).toBe(headers['x-solana-publickey']);
    });
});
