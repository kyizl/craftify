import {
  PikaNetworkRequiredMode,
  PikaNetworkStats,
  PikaNetworkStatAliases,
  type PikaNetworkGamemode,
} from '@/networks/pika-network/enums';
import {
  assertValidCombination,
  assertValidGamemode,
  resolveDefaultMode,
} from '@/networks/pika-network/guards';
import {
  assertIntegerRange,
  assertNonNegativeInteger,
  assertSafeInteger,
  clampIntegerMaximum,
} from '@/networks/pika-network/request-validation';
import {
  PikaNetworkLeaderboardStatsSchema,
  PikaNetworkLeaderboardResponseSchema,
  PikaNetworkMoversSchema,
  PikaNetworkTotalsResponseSchema,
} from '@/networks/pika-network/schemas';
import {
  toLeaderboardPage,
  type GetLeaderboardParams,
  type GetLeaderboardMoversParams,
  type GetLeaderboardStatsParams,
  type GetTotalsParams,
  type LeaderboardPage,
  type PikaNetworkMover,
  type PikaNetworkStatId,
  type PikaNetworkTotalsResponse,
} from '@/networks/pika-network/types';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type { BatchOptions, BatchResult, RequestConfig } from '@/types';

function resolveStatDisplayName(
  gamemode: PikaNetworkGamemode,
  stat: string,
): string | null {
  const stats = (PikaNetworkStats as Record<string, Record<string, string | null>>)[
    gamemode
  ];
  if (!stats) return null;
  if (Object.hasOwn(stats, stat)) return stat;
  const entry = Object.entries(stats).find(([, displayName]) => displayName === stat);
  return entry?.[0] ?? null;
}

export interface LeaderboardsMixin {
  getLeaderboard<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
    parameters: GetLeaderboardParams<G>,
    config?: RequestConfig,
  ): Promise<LeaderboardPage>;
  getLeaderboards(
    requests: GetLeaderboardParams<PikaNetworkGamemode>[],
    config?: RequestConfig,
    options?: BatchOptions,
  ): Promise<BatchResult<LeaderboardPage>[]>;
  getTotals<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
    parameters: GetTotalsParams<G>,
    config?: RequestConfig,
  ): Promise<PikaNetworkTotalsResponse>;
  getLeaderboardStats(
    parameters: GetLeaderboardStatsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkStatId[]>;
  getLeaderboardMovers(
    parameters: GetLeaderboardMoversParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkMover[]>;
}

export function withLeaderboards<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, LeaderboardsMixin> {
  abstract class WithLeaderboards extends Base implements LeaderboardsMixin {
    async getLeaderboard<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
      parameters: GetLeaderboardParams<G>,
      config?: RequestConfig,
    ): Promise<LeaderboardPage> {
      const {
        gamemode,
        stat,
        mode = resolveDefaultMode(gamemode),
        interval = 'total',
        page = 1,
        limit = 25,
        season,
      } = parameters;
      assertValidCombination(gamemode, mode, interval);
      if (season !== undefined) assertSafeInteger(season, 'season');
      if (season !== undefined && interval !== 'total') {
        throw new RangeError('Historical seasons only support the total interval');
      }

      const effectiveLimit = clampIntegerMaximum(limit, 'limit', 25, 1);
      const effectivePage = assertIntegerRange(page, 'page', 1, Number.MAX_SAFE_INTEGER);
      const offset = assertNonNegativeInteger(
        (effectivePage - 1) * effectiveLimit,
        'offset',
      );

      const statStr = String(stat);
      const resolvedStat =
        (PikaNetworkStatAliases as Record<string, Record<string, string>>)[gamemode]?.[
          statStr
        ] ??
        resolveStatDisplayName(gamemode, statStr) ??
        stat;

      const query = new URLSearchParams({
        type: gamemode,
        stat: String(resolvedStat),
        interval,
        mode,
        offset: String(offset),
        limit: String(effectiveLimit),
      });
      if (season !== undefined) query.set('season', String(season));

      const url = `${this.baseUrl}/leaderboards?${query.toString()}`;
      const cacheKey = `pika-network:leaderboard:${gamemode}:${String(resolvedStat)}:${mode}:${interval}:${offset}:${effectiveLimit}:${season ?? 'current'}`;

      const raw = await this.fetchAndValidate(
        cacheKey,
        url,
        PikaNetworkLeaderboardResponseSchema,
        config,
      );
      return raw ? toLeaderboardPage(raw) : { totalTracked: 0, entries: [] };
    }

    async getLeaderboards(
      requests: GetLeaderboardParams<PikaNetworkGamemode>[],
      config?: RequestConfig,
      options?: BatchOptions,
    ): Promise<BatchResult<LeaderboardPage>[]> {
      return this.batch(
        requests.map((request) => () => this.getLeaderboard(request, config)),
        options,
      );
    }

    async getTotals<G extends PikaNetworkGamemode = PikaNetworkGamemode>(
      parameters: GetTotalsParams<G>,
      config?: RequestConfig,
    ) {
      const { gamemode } = parameters;
      const { season } = parameters;
      if (season !== undefined) assertSafeInteger(season, 'season');
      const params = new URLSearchParams({ type: gamemode });
      if (season !== undefined) params.set('season', String(season));
      if (gamemode === 'pillars') {
        params.set('mode', PikaNetworkRequiredMode.pillars);
      }
      const url = `${this.baseUrl}/leaderboards/total?${params.toString()}`;
      const raw = await this.fetchAndValidate(
        `pika-network:totals:${gamemode}:${season ?? 'current'}`,
        url,
        PikaNetworkTotalsResponseSchema,
        config,
      );
      return raw ?? [];
    }

    async getLeaderboardStats(
      parameters: GetLeaderboardStatsParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkStatId[]> {
      assertValidGamemode(parameters.gamemode);
      const query = new URLSearchParams({ type: parameters.gamemode });
      if (parameters.prefix) query.set('prefix', parameters.prefix);
      const url = `${this.baseUrl}/leaderboards/stats?${query.toString()}`;
      const raw = await this.fetchAndValidate(
        `pika-network:leaderboard-stats:${query.toString()}`,
        url,
        PikaNetworkLeaderboardStatsSchema,
        config,
      );
      return raw ?? [];
    }

    async getLeaderboardMovers(
      parameters: GetLeaderboardMoversParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkMover[]> {
      assertValidGamemode(parameters.gamemode);
      const { gamemode, stat, window = '1d', limit = 25 } = parameters;
      const query = new URLSearchParams({
        type: gamemode,
        window,
        limit: String(clampIntegerMaximum(limit, 'limit', 50, 1)),
      });
      if (stat) query.set('stat', stat);
      const url = `${this.baseUrl}/leaderboards/movers?${query.toString()}`;
      const raw = await this.fetchAndValidate(
        `pika-network:leaderboard-movers:${query.toString()}`,
        url,
        PikaNetworkMoversSchema,
        config,
      );
      return raw ?? [];
    }
  }

  return WithLeaderboards;
}
