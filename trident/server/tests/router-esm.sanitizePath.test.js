import assert from 'assert';
import { describe, it } from 'vitest';
// Import the sanitizePath function from router-esm.js
import * as router from '../lib/router-esm.js';

describe('sanitizePath', () => {
  it('should allow safe paths', () => {
    const safe = '/api/v1/resource-123_ABC~.json';
    assert.strictEqual(router.sanitizePath(safe), safe);
  });

  it('should strip dangerous characters', () => {
    const dangerous = '/api/<script>alert(1)</script>/../etc/passwd';
    const sanitized = router.sanitizePath(dangerous);
    assert(!sanitized.includes('<'));
    assert(!sanitized.includes('>'));
    assert(!sanitized.includes('..'));
    assert(!sanitized.includes('script'));
  });

  it('should decode percent-encoded and sanitize', () => {
    const encoded = '/api/%3Cbad%3E';
    const sanitized = router.sanitizePath(encoded);
    assert(!sanitized.includes('<'));
    assert(!sanitized.includes('>'));
  });

  it('should collapse multiple slashes', () => {
    const messy = '///api//v1///test';
    assert.strictEqual(router.sanitizePath(messy), '/api/v1/test');
  });

  it('should return empty string for non-string input', () => {
    assert.strictEqual(router.sanitizePath(null), '');
    assert.strictEqual(router.sanitizePath(undefined), '');
    assert.strictEqual(router.sanitizePath(123), '');
  });
});
