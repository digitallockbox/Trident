import { describe, it, expect, beforeEach } from 'vitest';
import { Eternum } from '../../engine/eternum';

describe('Eternum Engine', () => {
    let eternum: Eternum;

    beforeEach(() => {
        eternum = new Eternum();
    });

    describe('set/get', () => {
        it('stores and retrieves a value', async () => {
            await eternum.execute({ action: 'set', key: 'name', value: 'Trident' });
            const result = await eternum.execute({ action: 'get', key: 'name' });

            expect(result.value).toBe('Trident');
        });

        it('returns null for missing key', async () => {
            const result = await eternum.execute({ action: 'get', key: 'nope' });
            expect(result.value).toBeNull();
        });

        it('supports namespaces', async () => {
            await eternum.execute({ action: 'set', key: 'x', value: 'A', namespace: 'alpha' });
            await eternum.execute({ action: 'set', key: 'x', value: 'B', namespace: 'beta' });

            const a = await eternum.execute({ action: 'get', key: 'x', namespace: 'alpha' });
            const b = await eternum.execute({ action: 'get', key: 'x', namespace: 'beta' });

            expect(a.value).toBe('A');
            expect(b.value).toBe('B');
        });

        it('rejects set without key', async () => {
            const result = await eternum.execute({ action: 'set', value: 'orphan' });
            expect(result.status).toBe('error');
        });

        it('overwrites existing key', async () => {
            await eternum.execute({ action: 'set', key: 'k', value: 1 });
            await eternum.execute({ action: 'set', key: 'k', value: 2 });
            const result = await eternum.execute({ action: 'get', key: 'k' });
            expect(result.value).toBe(2);
        });
    });

    describe('delete', () => {
        it('removes a key', async () => {
            await eternum.execute({ action: 'set', key: 'temp', value: 'data' });
            const del = await eternum.execute({ action: 'delete', key: 'temp' });
            expect(del.deleted).toBe(true);

            const get = await eternum.execute({ action: 'get', key: 'temp' });
            expect(get.value).toBeNull();
        });
    });

    describe('list', () => {
        it('lists keys in namespace', async () => {
            await eternum.execute({ action: 'set', key: 'a', value: 1, namespace: 'test' });
            await eternum.execute({ action: 'set', key: 'b', value: 2, namespace: 'test' });
            await eternum.execute({ action: 'set', key: 'c', value: 3, namespace: 'other' });

            const result = await eternum.execute({ action: 'list', namespace: 'test' });
            expect(result.keys).toHaveLength(2);
        });
    });

    describe('stats', () => {
        it('returns store statistics', async () => {
            await eternum.execute({ action: 'set', key: 'a', value: 1 });
            await eternum.execute({ action: 'set', key: 'b', value: 2, namespace: 'ns' });

            const result = await eternum.execute({ action: 'stats' });
            expect(result.totalKeys).toBe(2);
            expect(Object.keys(result.namespaces)).toHaveLength(2); // default + ns
        });
    });
});
