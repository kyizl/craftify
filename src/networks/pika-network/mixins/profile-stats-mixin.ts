import {
  assertValidCombination,
  resolveDefaultMode,
} from '@/networks/pika-network/guards';
import { assertSafeInteger } from '@/networks/pika-network/request-validation';
import { PikaNetworkProfileStatsResponseSchema } from '@/networks/pika-network/schemas';
import { withStatKeyAccessor } from '@/networks/pika-network/types';
import type {
  PikaNetworkGamemode,
  PikaNetworkStatKey,
} from '@/networks/pika-network/enums';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type {
  GetProfileStatsParams,
  ProfileStat,
  ProfileStats,
} from '@/networks/pika-network/types';
import type { BatchOptions, BatchResult, RequestConfig } from '@/types';

export interface ProfileStatsMixin {
  getProfileStats<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
    parameters: GetProfileStatsParams<G>,
    config?: RequestConfig,
  ): Promise<ProfileStats>;
  getProfileStat<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
    parameters: GetProfileStatsParams<G>,
    statKey: PikaNetworkStatKey<G> | string,
    config?: RequestConfig,
  ): Promise<ProfileStat | null>;
  getProfileStatsBatch(
    requests: GetProfileStatsParams<PikaNetworkGamemode>[],
    config?: RequestConfig,
    options?: BatchOptions,
  ): Promise<BatchResult<ProfileStats>[]>;
}

export function withProfileStats<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, ProfileStatsMixin> {
  abstract class WithProfileStats extends Base implements ProfileStatsMixin {
    async getProfileStats<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
      parameters: GetProfileStatsParams<G>,
      config?: RequestConfig,
    ): Promise<ProfileStats> {
      const {
        username,
        gamemode,
        mode = resolveDefaultMode(gamemode),
        interval = 'total',
        season,
      } = parameters;
      assertValidCombination(gamemode, mode, interval);
      if (season !== undefined) assertSafeInteger(season, 'season');
      if (season !== undefined && interval !== 'total') {
        throw new RangeError('Historical seasons only support the total interval');
      }

      const query = new URLSearchParams({
        type: gamemode,
        interval,
        mode,
      });
      if (season !== undefined) query.set('season', String(season));

      const url = `${this.baseUrl}/profile/${encodeURIComponent(username)}/leaderboard?${query.toString()}`;
      const cacheKey = `pika-network:profile-stats:${username.toLowerCase()}:${gamemode}:${mode}:${interval}:${season ?? 'current'}`;

      const raw = await this.fetchAndValidate(
        cacheKey,
        url,
        PikaNetworkProfileStatsResponseSchema,
        config,
      );
      if (!raw) return withStatKeyAccessor([]);

      const results: ProfileStat[] = Object.entries(raw).map(([statKey, stat]) => ({
        statKey,
        totalTracked: stat.metadata.total,
        hasScore: Boolean(stat.entries && stat.entries.length > 0),
        place: stat.entries?.[0]?.place ?? null,
        value: stat.entries?.[0]?.value ?? null,
      }));

      return withStatKeyAccessor(results);
    }

    async getProfileStat<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
      parameters: GetProfileStatsParams<G>,
      statKey: PikaNetworkStatKey<G> | string,
      config?: RequestConfig,
    ): Promise<ProfileStat | null> {
      const stats = await this.getProfileStats(parameters, config);
      return stats.find((stat) => stat.statKey === statKey) ?? null;
    }

    async getProfileStatsBatch(
      requests: GetProfileStatsParams<PikaNetworkGamemode>[],
      config?: RequestConfig,
      options?: BatchOptions,
    ): Promise<BatchResult<ProfileStats>[]> {
      return this.batch(
        requests.map((request) => () => this.getProfileStats(request, config)),
        options,
      );
    }
  }

  return WithProfileStats;
}
