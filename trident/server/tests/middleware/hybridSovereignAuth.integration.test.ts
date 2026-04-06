import { describe, it, expect, beforeEach } from "vitest";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { createHybridSovereignAuth } from "../../middleware/hybridSovereignAuth";

const TEST_API_KEY = "INTEGRATION_KEY";
const TEST_TENANT = "integration-tenant";

const tenants = [
    { key: TEST_API_KEY, tenant: TEST_TENANT, active: true },
    { key: "INACTIVE_KEY", tenant: "inactive", active: false },
];

function mockReqRes(headers: Record<string, string | undefined> = {}) {
    const req: any = {
        method: "POST",
        url: "/",
        originalUrl: "/",
        headers,
    };

    const res: any = {
        statusCode: 200,
        ended: false,
        endedMsg: undefined,
        setHeader() { },
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        end(msg?: string) {
            this.ended = true;
            this.endedMsg = msg ?? "";
        },
    };

    let nextCalled = false;
    const next = (err?: any) => {
        nextCalled = true;
        req.nextErr = err;
    };

    return { req, res, next, nextCalled: () => nextCalled };
}

describe("hybridSovereignAuth integration", () => {
    let keypair: nacl.SignKeyPair;
    let replayStore: Set<string>;
    let hybridAuth: ReturnType<typeof createHybridSovereignAuth>;

    beforeEach(() => {
        keypair = nacl.sign.keyPair();
        replayStore = new Set();
        hybridAuth = createHybridSovereignAuth({
            tenants,
            replayStore,
            maxSkewMs: 5 * 60 * 1000,
        });
    });

    it("rejects inactive API key", () => {
        const messageObj = {
            nonce: "n6",
            timestamp: Date.now(),
            action: "test",
            payload: {},
        };

        const message = JSON.stringify(messageObj);
        const signature = nacl.sign.detached(
            new TextEncoder().encode(message),
            keypair.secretKey
        );

        const headers = {
            "x-api-key": "INACTIVE_KEY",
            "x-solana-publickey": bs58.encode(keypair.publicKey),
            "x-solana-signature": bs58.encode(signature),
            "x-solana-message": message,
        };

        const { req, res, next, nextCalled } = mockReqRes(headers);

        hybridAuth(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res.ended).toBe(true);
        expect(res.endedMsg).toBe("Invalid or inactive API key");
        expect(nextCalled()).toBe(false);
    });

    it("rejects malformed message JSON", () => {
        const message = "{invalidJson:";
        const signature = nacl.sign.detached(
            new TextEncoder().encode(message),
            keypair.secretKey
        );

        const headers = {
            "x-api-key": TEST_API_KEY,
            "x-solana-publickey": bs58.encode(keypair.publicKey),
            "x-solana-signature": bs58.encode(signature),
            "x-solana-message": message,
        };

        const { req, res, next, nextCalled } = mockReqRes(headers);

        hybridAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(res.endedMsg).toBe("Malformed authentication data");
        expect(nextCalled()).toBe(false);
    });

    it("rejects missing nonce/timestamp/action", () => {
        const messageObj = { foo: "bar" };
        const message = JSON.stringify(messageObj);

        const signature = nacl.sign.detached(
            new TextEncoder().encode(message),
            keypair.secretKey
        );

        const headers = {
            "x-api-key": TEST_API_KEY,
            "x-solana-publickey": bs58.encode(keypair.publicKey),
            "x-solana-signature": bs58.encode(signature),
            "x-solana-message": message,
        };

        const { req, res, next, nextCalled } = mockReqRes(headers);

        hybridAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.ended).toBe(true);
        expect(res.endedMsg).toBe("Missing nonce, timestamp, or action");
        expect(nextCalled()).toBe(false);
    });

    it("accepts multiple valid requests with unique nonces", () => {
        for (let i = 0; i < 3; i++) {
            const messageObj = {
                nonce: `unique-nonce-${i}`,
                timestamp: Date.now(),
                action: "test",
                payload: { i },
            };

            const message = JSON.stringify(messageObj);
            const signature = nacl.sign.detached(
                new TextEncoder().encode(message),
                keypair.secretKey
            );

            const headers = {
                "x-api-key": TEST_API_KEY,
                "x-solana-publickey": bs58.encode(keypair.publicKey),
                "x-solana-signature": bs58.encode(signature),
                "x-solana-message": message,
            };

            const { req, res, next, nextCalled } = mockReqRes(headers);

            hybridAuth(req, res, next);

            expect(res.statusCode).toBe(200);
            expect(res.ended).toBe(false);
            expect(nextCalled()).toBe(true);

            expect(req.tenant).toBe(TEST_TENANT);
            expect(req.apiKey).toBe(TEST_API_KEY);
            expect(req.solanaPublicKey).toBe(headers["x-solana-publickey"]);
            expect(req.action).toBe("test");
            expect(req.payload).toEqual({ i });
        }
    });
});
