import { describe, it, expect } from 'vitest';
import createRouter from '../lib/router-esm.js';

function mockReqRes(path, method = 'GET') {
    const req = { url: path, method, params: {}, headers: {}, baseUrl: '' };
    const res = { statusCode: 200, end: () => { }, setHeader: () => { } };
    return { req, res };
}

describe('router-esm integration', () => {
    it('should route to correct handler for sanitized path', (done) => {
        const router = createRouter();
        let called = false;
        router.get('/safe', (req, res, next) => {
            called = true;
            expect(req.url).toBe('/safe');
            done();
        });
        const { req, res } = mockReqRes('/safe');
        router.handle(req, res, () => {
            expect(called).toBe(true);
            done();
        });
    });

    it('should not route to handler for dangerous path', (done) => {
        const router = createRouter();
        let called = false;
        router.get('/safe', (req, res, next) => {
            called = true;
        });
        const { req, res } = mockReqRes('/<script>alert(1)</script>');
        router.handle(req, res, () => {
            expect(called).toBe(false);
            done();
        });
    });
});
