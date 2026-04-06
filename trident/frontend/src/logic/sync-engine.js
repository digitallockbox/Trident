export function syncAndClaim(payload = {}) {
  return {
    ok: true,
    payload,
    timestamp: Date.now(),
  };
}
