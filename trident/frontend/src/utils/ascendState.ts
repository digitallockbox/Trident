import { eternum } from "./eternum";
import { PRIME } from "./primeKernel";
import { AscendStateSchema, AscendState } from "./ascend.schema";

// Use import.meta.env for Vite or fallback to window._env_ for CRA, else default
const KEY =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.REACT_APP_ASCEND_STATE_KEY) ||
  (typeof window !== "undefined" && (window as any)._env_ && (window as any)._env_.REACT_APP_ASCEND_STATE_KEY) ||
  "ascend_state";

// AscendState type now comes from schema

/**
 * Load Ascend state with schema validation.
 */
export const loadAscend = (): AscendState => {
  try {
    const raw = eternum.load(KEY, { enabled: PRIME.enabled });

    // Validate + normalize using Zod
    const parsed = AscendStateSchema.safeParse(raw);

    if (!parsed.success) {
      return { enabled: PRIME.enabled };
    }

    return parsed.data;
  } catch {
    return { enabled: PRIME.enabled };
  }
};

/**
 * Save Ascend state safely.
 */
export const saveAscend = (state: AscendState): void => {
  try {
    const parsed = AscendStateSchema.parse(state);
    eternum.save(KEY, parsed);
  } catch {
    // ignore invalid writes
  }
};

/**
 * Toggle Ascend mode.
 */
export const toggleAscend = (): AscendState => {
  const current = loadAscend();
  const next = { enabled: !current.enabled };
  saveAscend(next);
  return next;
};

/**
 * Reset to PRIME defaults.
 */
export const resetAscend = (): AscendState => {
  const defaults = { enabled: PRIME.enabled };
  saveAscend(defaults);
  return defaults;
};

/**
 * Clear storage.
 */
export const clearAscend = (): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    // ignore
  }
};
