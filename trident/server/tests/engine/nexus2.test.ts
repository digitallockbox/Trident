import { describe, it, expect, beforeEach } from 'vitest';
import { Nexus2 } from '../../engine/nexus2';

describe('Nexus2 Engine', () => {
    let nexus2: Nexus2;

    beforeEach(() => {
        nexus2 = new Nexus2();
    });

    describe('addNode', () => {
        it('adds a node to the mesh', async () => {
            const result = await nexus2.execute({ action: 'addNode', name: 'worker-1', weight: 3 });

            expect(result.status).toBe('success');
            expect(result.nodeId).toBeDefined();
            expect(result.name).toBe('worker-1');
        });

        it('rejects node without name', async () => {
            const result = await nexus2.execute({ action: 'addNode' });
            expect(result.status).toBe('error');
        });
    });

    describe('connect', () => {
        it('connects two nodes bidirectionally', async () => {
            const a = await nexus2.execute({ action: 'addNode', name: 'A' });
            const b = await nexus2.execute({ action: 'addNode', name: 'B' });

            const result = await nexus2.execute({ action: 'connect', from: a.nodeId, to: b.nodeId });

            expect(result.status).toBe('success');
            expect(result.connected.from).toBe(a.nodeId);
            expect(result.connected.to).toBe(b.nodeId);
        });

        it('rejects connection with missing node', async () => {
            const a = await nexus2.execute({ action: 'addNode', name: 'A' });
            const result = await nexus2.execute({ action: 'connect', from: a.nodeId, to: 'fake' });
            expect(result.status).toBe('error');
        });
    });

    describe('balance', () => {
        it('selects a node via weighted strategy', async () => {
            await nexus2.execute({ action: 'addNode', name: 'heavy', weight: 10 });
            await nexus2.execute({ action: 'addNode', name: 'light', weight: 1 });

            const result = await nexus2.execute({ action: 'balance', strategy: 'weighted' });

            expect(result.status).toBe('success');
            expect(result.selected).toBeDefined();
            expect(result.candidates).toBe(2);
        });

        it('returns error with no healthy nodes', async () => {
            const result = await nexus2.execute({ action: 'balance' });
            expect(result.status).toBe('error');
        });
    });

    describe('circuit breaker', () => {
        it('opens circuit after threshold failures', async () => {
            const node = await nexus2.execute({ action: 'addNode', name: 'fragile' });

            for (let i = 0; i < 5; i++) {
                await nexus2.execute({ action: 'circuit', nodeId: node.nodeId, event: 'failure', threshold: 5 });
            }

            const result = await nexus2.execute({
                action: 'circuit',
                nodeId: node.nodeId,
                event: 'failure',
                threshold: 5,
            });

            expect(result.circuitBreaker.open).toBe(true);
            expect(result.nodeStatus).toBe('down');
        });

        it('resets circuit breaker', async () => {
            const node = await nexus2.execute({ action: 'addNode', name: 'recoverable' });

            // Trip the breaker
            for (let i = 0; i < 5; i++) {
                await nexus2.execute({ action: 'circuit', nodeId: node.nodeId, event: 'failure', threshold: 5 });
            }

            // Reset
            const result = await nexus2.execute({ action: 'circuit', nodeId: node.nodeId, event: 'reset' });

            expect(result.circuitBreaker.open).toBe(false);
            expect(result.nodeStatus).toBe('healthy');
        });
    });

    describe('topology', () => {
        it('returns mesh topology', async () => {
            const a = await nexus2.execute({ action: 'addNode', name: 'A' });
            const b = await nexus2.execute({ action: 'addNode', name: 'B' });
            await nexus2.execute({ action: 'connect', from: a.nodeId, to: b.nodeId });

            const topo = await nexus2.execute({ action: 'topology' });

            expect(topo.totalNodes).toBe(2);
            expect(topo.totalEdges).toBe(1);
            expect(topo.nodes).toHaveLength(2);
            expect(topo.edges).toHaveLength(1);
        });
    });
});
