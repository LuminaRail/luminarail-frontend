import { describe, it, expect } from 'vitest';
import { ApiClient } from '../lib/api';
import { truncateAddress } from '../lib/utils';

describe('Frontend Foundation Smoke Test', () => {
  it('should format wallet address correctly', () => {
    const address = 'GBBD47IF6LWK2P7MDEVSCWR7DPCCM3GHESLGZWYF26TYD40010010001';
    expect(truncateAddress(address)).toBe('GBBD...0001');
  });

  it('should expose ApiClient class', () => {
    expect(ApiClient).toBeDefined();
  });
});
