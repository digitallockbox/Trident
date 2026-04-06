export const APP_NAME = 'Trident';
export const API_VERSION = 'v1';

export const TIER_LEVELS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;
export type TierLevel = typeof TIER_LEVELS[number];

export const CYCLE_STATES = ['running', 'frozen', 'completed'] as const;
export type CycleState = typeof CYCLE_STATES[number];

export const RPC_TARGETS = ['primary', 'failover'] as const;
export type RpcTarget = typeof RPC_TARGETS[number];
