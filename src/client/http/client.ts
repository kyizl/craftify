import { createFetch } from 'ofetch';
import { RetrySignal, withRetry } from '@/client/http/retry';
import { interpretStatus } from '@/client/http/status';
import {
  NetworkAPIError,
  NetworkBadRequestError,
  NetworkHTTPError,
  NetworkRateLimitError,
} from '@/errors';
import type { TokenBucketRateLimiter } from '@/client/rate-limiter';

const fetch = createFetch({
  fetch: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init),
});

export interface HttpClientOptions {
  network: string;
  rateLimiter: TokenBucketRateLimiter;
  headers?: Record<string, string>;
  defaultTimeoutMs?: number;
  defaultMaxRetries?: number;
  userAgent?: string;
}

export interface GetJsonOptions {
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  onResponse?: (response: { status: number; headers: Headers }) => void;
}

export class HttpClient {
  private readonly network: string;
  private readonly rateLimiter: TokenBucketRateLimiter;
  private readonly defaultTimeoutMs: number;
  private readonly defaultMaxRetries: number;
  private readonly headers: Record<string, string>;
  private readonly userAgent: string;

  constructor(options: HttpClientOptions) {
    this.network = options.network;
    this.rateLimiter = options.rateLimiter;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 10_000;
    this.defaultMaxRetries = options.defaultMaxRetries ?? 2;
    this.headers = options.headers ?? {};
    this.userAgent = options.userAgent ?? 'craftify';
  }

  async getJson(url: string, options: GetJsonOptions = {}): Promise<unknown> {
    const maxRetries = options.maxRetries ?? this.defaultMaxRetries;

    try {
      return await withRetry(
        async () => {
          await this.rateLimiter.acquire();

          if (options.signal?.aborted) {
            throw new DOMException('This operation was aborted', 'AbortError');
          }

          let response;
          try {
            response = await fetch.raw(url, {
              timeout: options.timeoutMs ?? this.defaultTimeoutMs,
              signal: options.signal,
              ignoreResponseError: true,
              retry: false,
              headers: {
                Accept: 'application/json',
                'User-Agent': this.userAgent,
                ...this.headers,
                ...options.headers,
              },
            });
          } catch (error) {
            if (
              options.signal?.aborted ||
              (error instanceof Error && error.name === 'AbortError')
            ) {
              throw error;
            }
            throw new NetworkHTTPError(
              this.network,
              `Error fetching ${url}: ${(error as Error)?.message ?? error}`,
              { url, cause: error },
            );
          }

          options.onResponse?.({ status: response.status, headers: response.headers });

          const outcome = interpretStatus(response.status, response._data, url);

          switch (outcome.kind) {
            case 'success': {
              return outcome.body;
            }
            case 'empty': {
              return null;
            }
            case 'bad-request': {
              throw new NetworkBadRequestError(
                this.network,
                `Bad request (check gamemode/mode/stat/interval casing and combination): ${url}`,
                { url, cause: outcome.body },
              );
            }
            case 'http-error': {
              throw new NetworkHTTPError(this.network, outcome.message, {
                status: response.status,
                url,
              });
            }
            case 'retryable': {
              throw new RetrySignal(
                outcome.isRateLimit,
                outcome.isRateLimit
                  ? parseRetryAfter(response.headers.get('Retry-After'))
                  : undefined,
              );
            }
          }
        },
        this.rateLimiter,
        maxRetries,
        options.signal,
      );
    } catch (error) {
      if (
        options.signal?.aborted ||
        (error instanceof Error && error.name === 'AbortError')
      ) {
        throw error;
      }
      if (error instanceof NetworkAPIError) throw error;
      if (error instanceof RetrySignal) {
        throw error.isRateLimit
          ? new NetworkRateLimitError(this.network, 'rate-limit-exceeded', { url })
          : new NetworkHTTPError(this.network, `Error from ${url} after retries`, {
              url,
            });
      }
      throw error;
    }
  }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return undefined;
  return Math.max(0, retryAt - Date.now());
}
