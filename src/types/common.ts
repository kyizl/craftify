export interface RequestConfig {
  timeoutMs?: number;

  maxRetries?: number;

  skipCache?: boolean;

  cacheTtlMs?: number;

  signal?: AbortSignal;

  headers?: Record<string, string>;
}

export type BatchResult<T> =
  { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

export interface BatchOptions {
  concurrency?: number;
  throwOnError?: boolean;
  onProgress?: (completed: number, total: number) => void;
}
