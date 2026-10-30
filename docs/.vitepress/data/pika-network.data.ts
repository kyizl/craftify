import { defaultNetworkClientOptions } from '../../../src/client/network-client-options';
import { defaultRetryBackoff } from '../../../src/client/retry-backoff';
import {
  PikaNetworkGamemodes,
  PikaNetworkStats,
  YearlyCapableGamemodes,
} from '../../../src/networks/pika-network/enums';
import { PikaNetworkDefaultRateLimit } from '../../../src/networks/pika-network/pika-network-defaults';

export interface PikaNetworkDocsData {
  gamemodeCount: number;
  gamemodes: readonly string[];
  totalStatCount: number;
  statCountByGamemode: Record<string, number>;
  yearlyCapableGamemodes: readonly string[];
  defaultTimeoutMs: number;
  defaultMaxRetries: number;
  defaultCacheTtlMs: number;
  defaultBatchConcurrency: number;
  defaultRateLimit: { ratePerSecond: number; burst: number };
  retryBackoff: { factor: number; minTimeoutMs: number; maxTimeoutMs: number };
}

export default {
  watch: [
    '../../../src/networks/pika-network/enums.ts',
    '../../../src/networks/pika-network/pika-network-defaults.ts',
    '../../../src/client/network-client-options.ts',
    '../../../src/client/retry-backoff.ts',
  ],
  load(): PikaNetworkDocsData {
    return {
      gamemodeCount: PikaNetworkGamemodes.length,
      gamemodes: PikaNetworkGamemodes,
      totalStatCount: Object.values(PikaNetworkStats).reduce<number>(
        (sum, stats) => sum + Object.keys(stats).length,
        0,
      ),
      statCountByGamemode: Object.fromEntries(
        Object.entries(PikaNetworkStats).map(([gamemode, stats]) => [
          gamemode,
          Object.keys(stats).length,
        ]),
      ),
      yearlyCapableGamemodes: YearlyCapableGamemodes,
      defaultTimeoutMs: defaultNetworkClientOptions.timeoutMs,
      defaultMaxRetries: defaultNetworkClientOptions.maxRetries,
      defaultCacheTtlMs: defaultNetworkClientOptions.defaultCacheTtlMs,
      defaultBatchConcurrency: defaultNetworkClientOptions.batchConcurrency,
      defaultRateLimit: PikaNetworkDefaultRateLimit,
      retryBackoff: defaultRetryBackoff,
    };
  },
};
