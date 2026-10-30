export interface RateLimiterOptions {
  ratePerSecond?: number;

  burst?: number;

  recoveryCooldownMs?: number;
}

export class TokenBucketRateLimiter {
  private readonly capacity: number;
  private readonly initialRatePerMs: number;
  private readonly recoveryCooldownMs: number;

  private tokens: number;
  private ratePerMs: number;
  private lastRefillMs: number;
  private lastRateLimitMs: number;
  private queue: (() => void)[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: RateLimiterOptions = {}) {
    const ratePerSecond = Math.max(0.1, options.ratePerSecond ?? 60);
    this.capacity = Math.max(1, options.burst ?? 10);
    this.tokens = this.capacity;
    this.initialRatePerMs = ratePerSecond / 1000;
    this.ratePerMs = this.initialRatePerMs;
    this.recoveryCooldownMs = options.recoveryCooldownMs ?? 5000;
    this.lastRefillMs = Date.now();
    this.lastRateLimitMs = 0;
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillMs;
    if (elapsed <= 0) return;

    if (
      this.ratePerMs < this.initialRatePerMs &&
      now - this.lastRateLimitMs > this.recoveryCooldownMs
    ) {
      const recoveredRate = this.ratePerMs * 1.5;
      this.ratePerMs = Math.min(this.initialRatePerMs, recoveredRate);
    }

    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.ratePerMs);
    this.lastRefillMs = now;
  }

  private processQueue(): void {
    this.refillTokens();

    while (this.tokens >= 1 && this.queue.length > 0) {
      this.tokens -= 1;
      const resolve = this.queue.shift();
      resolve?.();
    }

    if (this.queue.length > 0 && !this.timer) {
      const deficit = 1 - this.tokens;
      const waitMs = Math.max(1, Math.ceil(deficit / this.ratePerMs));
      this.timer = setTimeout(() => {
        this.timer = null;
        this.processQueue();
      }, waitMs);
    }
  }

  acquire(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1 && this.queue.length === 0) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  onRateLimited(): void {
    this.ratePerMs = Math.max(this.ratePerMs * 0.5, 0.05 / 1000);
    this.tokens = 0;
    this.lastRefillMs = Date.now();
    this.lastRateLimitMs = Date.now();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.processQueue();
  }

  get currentRatePerSecond(): number {
    return this.ratePerMs * 1000;
  }
}
