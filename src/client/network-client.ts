import { defu } from 'defu';
import PQueue from 'p-queue';
import { runBatch } from '@/client/batch';
import { KeyvCache, NullCache } from '@/client/cache';
import { HttpClient } from '@/client/http';
import { defaultNetworkClientOptions } from '@/client/network-client-options';
import { TokenBucketRateLimiter } from '@/client/rate-limiter';
import { NetworkValidationError } from '@/errors';
import type { NetworkCache } from '@/client/cache';
import type { NetworkClientOptions } from '@/client/network-client-options';
import type { BatchOptions, BatchResult, RequestConfig } from '@/types';
import type { z } from 'zod';

export interface NetworkResponseMetadata {
  status: number;
  headers: Headers;
}

export abstract class NetworkClient {
  private readonly http: HttpClient;
  private readonly cache: NetworkCache;
  private readonly config: Required<
    Pick<NetworkClientOptions, keyof typeof defaultNetworkClientOptions>
  >;
  private readonly batchQueue: PQueue;
  private lastResponseMetadata: NetworkResponseMetadata | null = null;

  protected abstract readonly networkName: string;
  protected abstract readonly baseUrl: string;

  constructor(options: NetworkClientOptions = {}) {
    this.config = defu(options, defaultNetworkClientOptions);
    const rateLimiter = new TokenBucketRateLimiter(options.rateLimit);
    this.http = new HttpClient({
      network:
        (this as unknown as { networkName?: string }).networkName ??
        this.constructor.name ??
        'NetworkClient',
      rateLimiter,
      defaultTimeoutMs: this.config.timeoutMs,
      defaultMaxRetries: this.config.maxRetries,
      headers: options.headers,
      userAgent: this.config.userAgent,
    });
    this.cache =
      options.cache === false ? new NullCache() : (options.cache ?? new KeyvCache());
    this.batchQueue = new PQueue({ concurrency: this.config.batchConcurrency });
  }

  protected async fetchAndValidate<S extends z.ZodType>(
    cacheKey: string,
    url: string,
    schema: S,
    config: RequestConfig = {},
  ): Promise<z.infer<S> | null> {
    if (!config.skipCache) {
      const cached = await this.cache.get<z.infer<S> | null>(cacheKey);
      if (cached !== undefined) return cached;
    }

    const raw = await this.http.getJson(url, {
      timeoutMs: config.timeoutMs ?? this.config.timeoutMs,
      maxRetries: config.maxRetries ?? this.config.maxRetries,
      signal: config.signal,
      headers: config.headers,
      onResponse: (response) => {
        this.lastResponseMetadata = {
          status: response.status,
          headers: new Headers(response.headers),
        };
      },
    });

    if (raw === null) {
      if (!config.skipCache) {
        await this.cache.set(cacheKey, null, config.cacheTtlMs ?? 10_000);
      }
      return null;
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new NetworkValidationError(
        this.networkName || this.constructor.name,
        `Response from ${url} didn't match the expected shape`,
        { url, issues: parsed.error.issues },
      );
    }

    const data = parsed.data;
    await this.cache.set(
      cacheKey,
      data,
      config.cacheTtlMs ?? this.config.defaultCacheTtlMs,
    );
    return data;
  }

  async invalidate(cacheKey: string): Promise<void> {
    await this.cache.delete(cacheKey);
  }

  getLastResponseMetadata(): NetworkResponseMetadata | null {
    return this.lastResponseMetadata;
  }

  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  async batch<const T extends readonly (() => Promise<unknown>)[]>(
    operations: T,
    options?: BatchOptions,
  ): Promise<{ [K in keyof T]: BatchResult<Awaited<ReturnType<T[K]>>> }> {
    return runBatch(operations, this.batchQueue, options);
  }
}
