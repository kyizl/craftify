import PQueue from 'p-queue';
import type { BatchOptions, BatchResult } from '@/types';

export async function runBatch<const T extends readonly (() => Promise<unknown>)[]>(
  operations: T,
  defaultQueue: PQueue,
  options: BatchOptions = {},
): Promise<{ [K in keyof T]: BatchResult<Awaited<ReturnType<T[K]>>> }> {
  const queue = options.concurrency
    ? new PQueue({ concurrency: options.concurrency })
    : defaultQueue;
  let completed = 0;

  const settled = await Promise.all(
    operations.map((operation) =>
      queue.add(async (): Promise<BatchResult<unknown>> => {
        try {
          return { status: 'fulfilled', value: await operation() };
        } catch (error) {
          return { status: 'rejected', reason: error };
        } finally {
          completed++;
          options.onProgress?.(completed, operations.length);
        }
      }),
    ),
  );

  const results = settled as { [K in keyof T]: BatchResult<Awaited<ReturnType<T[K]>>> };

  if (options.throwOnError) {
    const failures = (settled as BatchResult<unknown>[]).filter(
      (result) => result.status === 'rejected',
    );
    if (failures.length > 0) {
      const aggregateError = new AggregateError(
        failures.map((failure) => failure.reason),
        `${failures.length}/${settled.length} batch operations failed`,
      );
      Object.assign(aggregateError, { results });
      throw aggregateError;
    }
  }

  return results;
}
