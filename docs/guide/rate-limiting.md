---
title: Rate Limiting
order: 5
---

<script setup>
import { data } from '../.vitepress/data/pika-network.data';
</script>

# Rate Limiting

Read this before changing the defaults.

PikaNetwork documents a limit of **120 requests per minute per API key**. Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`; `429` responses include `Retry-After`. `PikaNetworkClient` defaults to **{{ data.defaultRateLimit.ratePerSecond }} requests/second**, burst **{{ data.defaultRateLimit.burst }}**, matching the published quota while avoiding an initial burst above it.

## Why proactive, not reactive

Every request acquires a token from a [`TokenBucketRateLimiter`](/api/classes/TokenBucketRateLimiter) before it's sent. The client also honors upstream `429` responses with retry backoff.

## The 429 backoff is still there underneath

Even with the proactive limiter, a `429` can still happen if another process uses the same key. When it does:

1. The rate limiter's `onRateLimited()` halves its rate and drains the bucket, so subsequent requests, including unrelated ones sharing the same client instance, immediately slow down.
2. The request itself retries with jittered exponential backoff: factor **{{ data.retryBackoff.factor }}**, between **{{ data.retryBackoff.minTimeoutMs }}ms** and **{{ data.retryBackoff.maxTimeoutMs }}ms**, up to `maxRetries` attempts (default **{{ data.defaultMaxRetries }}**).
3. If retries are exhausted, it throws [`NetworkRateLimitError`](/api/classes/NetworkRateLimitError).

## Overriding the defaults

```ts
const pika = new PikaNetworkClient({
  rateLimit: { ratePerSecond: 200, burst: 10 },
});
```

Keep the aggregate traffic for a key at or below 120 requests per minute. Multiple client instances using the same key have independent local limiters and should be coordinated by the application.

## Other relevant defaults

| Setting           | Default                            | Option              |
| ----------------- | ---------------------------------- | ------------------- |
| Request timeout   | {{ data.defaultTimeoutMs }}ms      | `timeoutMs`         |
| Max retries       | {{ data.defaultMaxRetries }}       | `maxRetries`        |
| Cache TTL         | {{ data.defaultCacheTtlMs }}ms     | `defaultCacheTtlMs` |
| Batch concurrency | {{ data.defaultBatchConcurrency }} | `batchConcurrency`  |

All four are set in `src/client/network-client-options.ts` and documented in [`NetworkClientOptions`](/api/interfaces/NetworkClientOptions).
