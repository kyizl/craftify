import type { NetworkCache } from '@/client/cache';
import type { RateLimiterOptions } from '@/client/rate-limiter';

export interface NetworkClientOptions {
  headers?: Record<string, string>;

  rateLimit?: RateLimiterOptions;

  cache?: NetworkCache | false;

  defaultCacheTtlMs?: number;

  timeoutMs?: number;

  maxRetries?: number;

  userAgent?: string;

  batchConcurrency?: number;
}

export const defaultNetworkClientOptions = {
  defaultCacheTtlMs: 60_000,
  timeoutMs: 10_000,
  maxRetries: 2,
  userAgent: 'craftify',
  batchConcurrency: 10,
} as const satisfies Partial<NetworkClientOptions>;
