import { describe, it, expect, beforeEach } from 'vitest';
import { Aegis } from '../../engine/aegis';

describe('Aegis Engine', () => {
    let aegis: Aegis;

    beforeEach(() => {
        aegis = new Aegis();
    });

    describe('scan', () => {
        it('returns success for clean payloads', async () => {
            const result = await aegis.execute({
                action: 'scan',
                wallet: 'test-wallet',
                origin: 'https://trident.app',
                payload: { name: 'safe data' },
            });

            expect(result.status).toBe('success');
            expect(result.engine).toBe('Aegis');
            expect(result.allowed).toBe(true);
            expect(result.riskScore).toBeLessThan(70);
            expect(result.threats).toHaveLength(0);
        });

        it('detects XSS threats', async () => {
            const result = await aegis.execute({
                action: 'scan',
                wallet: 'test-wallet',
                origin: 'https://trident.app',
                payload: '<script>alert("xss")</script>',
            });

            expect(result.threats.length).toBeGreaterThan(0);
            expect(result.riskScore).toBeGreaterThan(0);
        });

        it('detects SQL injection', async () => {
            const result = await aegis.execute({
                action: 'scan',
                wallet: 'test-wallet',
                origin: 'https://trident.app',
                payload: "'; DROP TABLE users; --",
            });

            expect(result.threats.length).toBeGreaterThan(0);
        });

        it('increases risk for missing wallet', async () => {
            const withWallet = await aegis.execute({
                action: 'scan',
                wallet: 'w1',
                origin: 'x',
                payload: 'clean',
            });

            const withoutWallet = await aegis.execute({
                action: 'scan',
                origin: 'x',
                payload: 'clean',
            });

            expect(withoutWallet.riskScore).toBeGreaterThan(withWallet.riskScore);
        });

        it('blocks high-risk payloads', async () => {
            const result = await aegis.execute({
                action: 'scan',
                payload: '<script>x</script> union select * from users; --',
            });

            expect(result.status).toBe('blocked');
            expect(result.allowed).toBe(false);
        });
    });

    describe('validate', () => {
        it('grants access for valid credentials', async () => {
            const result = await aegis.execute({
                action: 'validate',
                wallet: 'abc123',
                role: 'admin',
                resource: '/dashboard',
            });

            expect(result.status).toBe('success');
            expect(result.granted).toBe(true);
            expect(result.issues).toHaveLength(0);
        });

        it('denies access for missing wallet', async () => {
            const result = await aegis.execute({
                action: 'validate',
                role: 'admin',
                resource: '/dashboard',
            });

            expect(result.status).toBe('denied');
            expect(result.granted).toBe(false);
            expect(result.issues).toContain('Missing or invalid wallet');
        });

        it('denies access for invalid role', async () => {
            const result = await aegis.execute({
                action: 'validate',
                wallet: 'abc123',
                role: 'hacker',
                resource: '/admin',
            });

            expect(result.granted).toBe(false);
            expect(result.issues).toContain('Invalid role');
        });
    });

    describe('report', () => {
        it('returns threat report', async () => {
            // Run some scans first
            await aegis.execute({ action: 'scan', wallet: 'w1', origin: 'x', payload: 'clean' });
            await aegis.execute({ action: 'scan', payload: '<script>' });

            const report = await aegis.execute({ action: 'report' });

            expect(report.status).toBe('success');
            expect(report.totalScans).toBe(2);
            expect(report.averageRisk).toBeGreaterThan(0);
        });

        it('returns empty report with no scans', async () => {
            const report = await aegis.execute({ action: 'report' });

            expect(report.totalScans).toBe(0);
            expect(report.averageRisk).toBe(0);
        });
    });

    it('returns error for unknown action', async () => {
        const result = await aegis.execute({ action: 'destroy' });
        expect(result.status).toBe('error');
        expect(result.error).toContain('Unknown action');
    });
});
