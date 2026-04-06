/**
 * Eternum — Persistent Storage Engine
 *
 * Key-value store with namespaces, TTL support, and bulk operations.
 * Acts as the platform's general-purpose data persistence layer.
 */
export class Eternum {
  private store: Map<string, {
    value: any;
    namespace: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: number | null;
  }> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'get';

    switch (action) {
      case 'set':
        return this.set(data);
      case 'get':
        return this.get(data);
      case 'delete':
        return this.remove(data);
      case 'list':
        return this.list(data);
      case 'purge':
        return this.purgeExpired();
      case 'stats':
        return this.stats();
      default:
        return { status: 'error', engine: 'Eternum', error: `Unknown action: ${action}` };
    }
  }

  private set(data: Record<string, any>): Record<string, any> {
    const key = data.key as string;
    const value = data.value;
    const namespace = (data.namespace as string) || 'default';
    const ttlMs = Number(data.ttlMs) || null;

    if (!key) return { status: 'error', engine: 'Eternum', error: 'Missing key' };

    const fullKey = `${namespace}:${key}`;
    const now = new Date();
    const existing = this.store.get(fullKey);

    this.store.set(fullKey, {
      value,
      namespace,
      createdAt: existing?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });

    return {
      status: 'success',
      engine: 'Eternum',
      key,
      namespace,
      stored: true,
      expiresAt: ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null,
    };
  }

  private get(data: Record<string, any>): Record<string, any> {
    const key = data.key as string;
    const namespace = (data.namespace as string) || 'default';
    if (!key) return { status: 'error', engine: 'Eternum', error: 'Missing key' };

    const fullKey = `${namespace}:${key}`;
    const entry = this.store.get(fullKey);

    if (!entry) {
      return { status: 'success', engine: 'Eternum', key, namespace, found: false, value: null };
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(fullKey);
      return { status: 'success', engine: 'Eternum', key, namespace, found: false, expired: true, value: null };
    }

    return {
      status: 'success',
      engine: 'Eternum',
      key,
      namespace,
      found: true,
      value: entry.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  private remove(data: Record<string, any>): Record<string, any> {
    const key = data.key as string;
    const namespace = (data.namespace as string) || 'default';
    if (!key) return { status: 'error', engine: 'Eternum', error: 'Missing key' };

    const fullKey = `${namespace}:${key}`;
    const existed = this.store.delete(fullKey);

    return { status: 'success', engine: 'Eternum', key, namespace, deleted: existed };
  }

  private list(data: Record<string, any>): Record<string, any> {
    const namespace = (data.namespace as string) || 'default';
    const prefix = `${namespace}:`;
    const limit = Math.min(Number(data.limit) || 100, 1000);
    const keys: string[] = [];

    for (const [fullKey, entry] of this.store.entries()) {
      if (fullKey.startsWith(prefix)) {
        if (entry.expiresAt && Date.now() > entry.expiresAt) continue;
        keys.push(fullKey.slice(prefix.length));
        if (keys.length >= limit) break;
      }
    }

    return { status: 'success', engine: 'Eternum', namespace, keys, count: keys.length };
  }

  private purgeExpired(): Record<string, any> {
    const now = Date.now();
    let purged = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }

    return { status: 'success', engine: 'Eternum', purged, remaining: this.store.size };
  }

  private stats(): Record<string, any> {
    const namespaces: Record<string, number> = {};
    for (const entry of this.store.values()) {
      namespaces[entry.namespace] = (namespaces[entry.namespace] || 0) + 1;
    }

    return {
      status: 'success',
      engine: 'Eternum',
      totalKeys: this.store.size,
      namespaces,
      generatedAt: new Date().toISOString(),
    };
  }
}
