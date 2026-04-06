/**
 * Nexus2 — Advanced Connection & Mesh Engine
 *
 * Manages service mesh topology, inter-engine communication,
 * load balancing, and circuit breaker patterns.
 */
export class Nexus2 {
  private nodes: Map<string, {
    id: string;
    name: string;
    connections: string[];
    weight: number;
    status: 'healthy' | 'degraded' | 'down';
    circuitBreaker: { failures: number; open: boolean; lastFailure: string | null };
  }> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'topology';

    switch (action) {
      case 'addNode':
        return this.addNode(data);
      case 'connect':
        return this.connect(data);
      case 'balance':
        return this.loadBalance(data);
      case 'circuit':
        return this.circuitBreaker(data);
      case 'topology':
        return this.getTopology();
      default:
        return { status: 'error', engine: 'Nexus2', error: `Unknown action: ${action}` };
    }
  }

  private addNode(data: Record<string, any>): Record<string, any> {
    const name = data.name as string;
    if (!name) return { status: 'error', engine: 'Nexus2', error: 'Missing node name' };

    const id = `NODE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.nodes.set(id, {
      id,
      name,
      connections: [],
      weight: Number(data.weight) || 1,
      status: 'healthy',
      circuitBreaker: { failures: 0, open: false, lastFailure: null },
    });

    return { status: 'success', engine: 'Nexus2', nodeId: id, name };
  }

  private connect(data: Record<string, any>): Record<string, any> {
    const from = data.from as string;
    const to = data.to as string;
    if (!from || !to) return { status: 'error', engine: 'Nexus2', error: 'Missing from or to node' };

    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    if (!fromNode) return { status: 'error', engine: 'Nexus2', error: 'Source node not found' };
    if (!toNode) return { status: 'error', engine: 'Nexus2', error: 'Target node not found' };

    if (!fromNode.connections.includes(to)) fromNode.connections.push(to);
    if (!toNode.connections.includes(from)) toNode.connections.push(from);

    return { status: 'success', engine: 'Nexus2', connected: { from, to } };
  }

  private loadBalance(data: Record<string, any>): Record<string, any> {
    const targets = Array.isArray(data.targets) ? data.targets : Array.from(this.nodes.keys());
    const strategy = (data.strategy as string) || 'weighted';

    const available = targets
      .map(id => this.nodes.get(id))
      .filter((n): n is NonNullable<typeof n> => !!n && n.status !== 'down' && !n.circuitBreaker.open);

    if (available.length === 0) {
      return { status: 'error', engine: 'Nexus2', error: 'No healthy nodes available' };
    }

    let selected: typeof available[0];
    switch (strategy) {
      case 'round-robin':
        selected = available[Math.floor(Math.random() * available.length)];
        break;
      case 'weighted': {
        const totalWeight = available.reduce((s, n) => s + n.weight, 0);
        let rand = Math.random() * totalWeight;
        selected = available[0];
        for (const node of available) {
          rand -= node.weight;
          if (rand <= 0) { selected = node; break; }
        }
        break;
      }
      case 'least-connections':
        selected = available.sort((a, b) => a.connections.length - b.connections.length)[0];
        break;
      default:
        selected = available[0];
    }

    return {
      status: 'success',
      engine: 'Nexus2',
      strategy,
      selected: { id: selected.id, name: selected.name, weight: selected.weight },
      candidates: available.length,
    };
  }

  private circuitBreaker(data: Record<string, any>): Record<string, any> {
    const nodeId = data.nodeId as string;
    const event = data.event as string; // 'failure', 'success', 'reset'
    if (!nodeId) return { status: 'error', engine: 'Nexus2', error: 'Missing nodeId' };

    const node = this.nodes.get(nodeId);
    if (!node) return { status: 'error', engine: 'Nexus2', error: 'Node not found' };

    const threshold = Number(data.threshold) || 5;

    switch (event) {
      case 'failure':
        node.circuitBreaker.failures++;
        node.circuitBreaker.lastFailure = new Date().toISOString();
        if (node.circuitBreaker.failures >= threshold) {
          node.circuitBreaker.open = true;
          node.status = 'down';
        } else {
          node.status = 'degraded';
        }
        break;
      case 'success':
        node.circuitBreaker.failures = Math.max(0, node.circuitBreaker.failures - 1);
        if (node.circuitBreaker.failures === 0) {
          node.circuitBreaker.open = false;
          node.status = 'healthy';
        }
        break;
      case 'reset':
        node.circuitBreaker = { failures: 0, open: false, lastFailure: null };
        node.status = 'healthy';
        break;
    }

    return {
      status: 'success',
      engine: 'Nexus2',
      nodeId,
      circuitBreaker: node.circuitBreaker,
      nodeStatus: node.status,
    };
  }

  private getTopology(): Record<string, any> {
    const nodes = Array.from(this.nodes.values()).map(n => ({
      id: n.id,
      name: n.name,
      status: n.status,
      connections: n.connections.length,
      weight: n.weight,
      circuitOpen: n.circuitBreaker.open,
    }));

    const edges: Array<{ from: string; to: string }> = [];
    const seen = new Set<string>();
    for (const node of this.nodes.values()) {
      for (const conn of node.connections) {
        const key = [node.id, conn].sort().join('-');
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from: node.id, to: conn });
        }
      }
    }

    return {
      status: 'success',
      engine: 'Nexus2',
      nodes,
      edges,
      totalNodes: nodes.length,
      totalEdges: edges.length,
    };
  }
}
