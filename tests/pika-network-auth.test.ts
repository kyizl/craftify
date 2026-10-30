import { afterEach, describe, expect, it, vi } from 'vitest';
import { PikaNetworkClient } from '@/networks/pika-network/pika-network-client';

describe('PikaNetwork authentication', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the configured API key on requests', async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        Response.json(
          { username: 'player' },
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new PikaNetworkClient({
      apiKey: 'test-key',
      baseUrl: 'https://stats.example.test/api',
      cache: false,
      maxRetries: 0,
    });

    await client.getProfile('player');

    const requestHeaders = fetchMock.mock.calls[0]?.[1]?.headers;
    expect(new Headers(requestHeaders).get('X-Api-Key')).toBe('test-key');
  });

  it('rejects a blank API key during client construction', () => {
    expect(() => new PikaNetworkClient({ apiKey: '  ' })).toThrow(TypeError);
  });

  it('waits for the Retry-After interval before retrying a rate-limited request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          { error: 'rate limited' },
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '0.02',
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        Response.json(
          { username: 'player' },
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const client = new PikaNetworkClient({
      apiKey: 'test-key',
      baseUrl: 'https://stats.example.test/api',
      cache: false,
      maxRetries: 1,
      rateLimit: { ratePerSecond: 100, burst: 10 },
    });
    const startedAt = Date.now();

    await client.getProfile('player');

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(20);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
