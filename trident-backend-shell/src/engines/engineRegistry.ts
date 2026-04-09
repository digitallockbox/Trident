// engineRegistry.ts (stub for backend-shell)

export type EngineName = 'aegis' | 'omega' | 'overwatch';

export const engineRegistry: Record<EngineName, { create: () => any; version: string }> = {
    aegis: { create: () => ({ name: 'aegis' }), version: '1.0.0' },
    omega: { create: () => ({ name: 'omega' }), version: '1.0.0' },
    overwatch: { create: () => ({ name: 'overwatch' }), version: '1.0.0' },
};
