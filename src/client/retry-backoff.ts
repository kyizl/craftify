export const defaultRetryBackoff = {
  factor: 2,
  minTimeoutMs: 1000,
  maxTimeoutMs: 8000,
  randomize: true,
} as const;
