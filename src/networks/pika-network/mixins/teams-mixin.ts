import { PikaNetworkTeamModes } from '@/networks/pika-network/enums';
import {
  assertIntegerRange,
  assertNonNegativeInteger,
  assertSafeInteger,
  clampIntegerMaximum,
} from '@/networks/pika-network/request-validation';
import {
  PikaNetworkTeamDetailSchema,
  PikaNetworkTeamHistorySchema,
  PikaNetworkTeamStatCatalogSchema,
  PikaNetworkTeamComparisonSchema,
  PikaNetworkTopTeamsSchema,
} from '@/networks/pika-network/schemas';
import type { PikaNetworkTeamMode } from '@/networks/pika-network/enums';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type {
  CompareTeamsParams,
  GetTeamHistoryParams,
  GetTeamParams,
  GetTopTeamsParams,
  PikaNetworkTeamDetail,
  PikaNetworkTeamHistory,
  PikaNetworkTeamStatCatalog,
  PikaNetworkTeamComparison,
  PikaNetworkTopTeam,
} from '@/networks/pika-network/types';
import type { RequestConfig } from '@/types';

export interface TeamsMixin {
  getTopTeams(
    parameters: GetTopTeamsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkTopTeam[]>;
  getTeam(
    parameters: GetTeamParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkTeamDetail | null>;
  getTeamStats(
    mode: PikaNetworkTeamMode,
    config?: RequestConfig,
  ): Promise<PikaNetworkTeamStatCatalog>;
  getTeamHistory(
    parameters: GetTeamHistoryParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkTeamHistory | null>;
  compareTeams(
    parameters: CompareTeamsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkTeamComparison>;
}

export function withTeams<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, TeamsMixin> {
  abstract class WithTeams extends Base implements TeamsMixin {
    private assertTeamMode(mode: string): asserts mode is PikaNetworkTeamMode {
      if (!(PikaNetworkTeamModes as readonly string[]).includes(mode)) {
        throw new RangeError(`"${mode}" is not a valid PikaNetwork team mode.`);
      }
    }

    async getTopTeams(
      parameters: GetTopTeamsParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkTopTeam[]> {
      const { mode, limit, offset, with: include, season } = parameters;
      this.assertTeamMode(mode);
      if (season !== undefined) assertSafeInteger(season, 'season');
      const query = new URLSearchParams();
      if (limit !== undefined) {
        query.set(
          'limit',
          String(assertIntegerRange(limit, 'limit', 1, Number.MAX_SAFE_INTEGER)),
        );
      }
      if (offset !== undefined) {
        query.set('offset', String(assertNonNegativeInteger(offset, 'offset')));
      }
      if (include) query.set('with', include);
      if (season !== undefined) query.set('season', String(season));
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/teams/${mode}/top${suffix}`;
      const raw = await this.fetchAndValidate(
        `pika-network:teams-top:${mode}:${query.toString()}`,
        url,
        PikaNetworkTopTeamsSchema,
        config,
      );
      return raw ?? [];
    }

    async getTeam(
      parameters: GetTeamParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkTeamDetail | null> {
      const { mode, entityId } = parameters;
      this.assertTeamMode(mode);
      const id = encodeURIComponent(String(entityId));
      const url = `${this.baseUrl}/teams/${mode}/${id}`;
      return this.fetchAndValidate(
        `pika-network:team:${mode}:${String(entityId)}`,
        url,
        PikaNetworkTeamDetailSchema,
        config,
      );
    }

    async getTeamStats(
      mode: PikaNetworkTeamMode,
      config?: RequestConfig,
    ): Promise<PikaNetworkTeamStatCatalog> {
      this.assertTeamMode(mode);
      const url = `${this.baseUrl}/teams/${mode}/stats`;
      const raw = await this.fetchAndValidate(
        `pika-network:team-stats:${mode}`,
        url,
        PikaNetworkTeamStatCatalogSchema,
        config,
      );
      return raw ?? { gamemode: mode, stats: [] };
    }

    async getTeamHistory(
      parameters: GetTeamHistoryParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkTeamHistory | null> {
      const { mode, entityId, limit, season } = parameters;
      this.assertTeamMode(mode);
      if (season !== undefined) assertSafeInteger(season, 'season');
      const query = new URLSearchParams();
      if (limit !== undefined) {
        query.set('limit', String(clampIntegerMaximum(limit, 'limit', 5000, 1)));
      }
      if (season !== undefined) query.set('season', String(season));
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/teams/${mode}/${encodeURIComponent(String(entityId))}/history${suffix}`;
      return this.fetchAndValidate(
        `pika-network:team-history:${mode}:${String(entityId)}:${query.toString()}`,
        url,
        PikaNetworkTeamHistorySchema,
        config,
      );
    }

    async compareTeams(
      parameters: CompareTeamsParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkTeamComparison> {
      const { gamemode, a, b, at, from, to } = parameters;
      this.assertTeamMode(gamemode);
      if (at !== undefined) assertSafeInteger(at, 'at');
      if (from !== undefined) assertSafeInteger(from, 'from');
      if (to !== undefined) assertSafeInteger(to, 'to');
      const hasRange = from !== undefined || to !== undefined;
      if (at !== undefined && hasRange) {
        throw new RangeError('The at parameter cannot be combined with from or to');
      }
      if (hasRange && (from === undefined || to === undefined)) {
        throw new RangeError('The from and to parameters must be provided together');
      }

      const query = new URLSearchParams({
        gamemode,
        a: String(a),
        b: String(b),
      });
      if (at !== undefined) query.set('at', String(at));
      if (from !== undefined) query.set('from', String(from));
      if (to !== undefined) query.set('to', String(to));
      const url = `${this.baseUrl}/teams/vs?${query.toString()}`;
      const raw = await this.fetchAndValidate(
        `pika-network:team-comparison:${query.toString()}`,
        url,
        PikaNetworkTeamComparisonSchema,
        config,
      );
      if (!raw) throw new TypeError('The team comparison endpoint returned no content');
      return raw;
    }
  }

  return WithTeams;
}
