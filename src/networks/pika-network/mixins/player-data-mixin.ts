import { assertValidGamemode } from '@/networks/pika-network/guards';
import {
  assertIntegerRange,
  assertNonNegativeInteger,
  clampIntegerMaximum,
} from '@/networks/pika-network/request-validation';
import {
  PikaNetworkPlayerEventsSchema,
  PikaNetworkPlayerFightsSchema,
  PikaNetworkPlayerHistorySchema,
  PikaNetworkPlayerTeamsSchema,
} from '@/networks/pika-network/schemas';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type {
  GetPlayerEventsParams,
  GetPlayerFightsParams,
  GetPlayerHistoryParams,
  PikaNetworkPlayerEvents,
  PikaNetworkPlayerFights,
  PikaNetworkPlayerHistory,
  PikaNetworkPlayerTeam,
} from '@/networks/pika-network/types';
import type { RequestConfig } from '@/types';

export interface PlayerDataMixin {
  getPlayerTeams(
    username: string,
    config?: RequestConfig,
  ): Promise<PikaNetworkPlayerTeam[]>;
  getProfileHistory(
    parameters: GetPlayerHistoryParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkPlayerHistory | null>;
  getProfileEvents(
    parameters: GetPlayerEventsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkPlayerEvents | null>;
  getProfileFights(
    parameters: GetPlayerFightsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkPlayerFights | null>;
}

export function withPlayerData<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, PlayerDataMixin> {
  abstract class WithPlayerData extends Base implements PlayerDataMixin {
    async getPlayerTeams(
      username: string,
      config?: RequestConfig,
    ): Promise<PikaNetworkPlayerTeam[]> {
      const url = `${this.baseUrl}/players/${encodeURIComponent(username)}/teams`;
      const raw = await this.fetchAndValidate(
        `pika-network:player-teams:${username.toLowerCase()}`,
        url,
        PikaNetworkPlayerTeamsSchema,
        config,
      );
      return raw ?? [];
    }

    async getProfileHistory(
      parameters: GetPlayerHistoryParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkPlayerHistory | null> {
      const { username, gamemode, stats, days } = parameters;
      assertValidGamemode(gamemode);
      if (days !== undefined) assertIntegerRange(days, 'days', 1, 365);
      const query = new URLSearchParams({ type: gamemode });
      if (stats) query.set('stats', Array.isArray(stats) ? stats.join(',') : stats);
      if (days !== undefined) query.set('days', String(days));
      const url = `${this.baseUrl}/profile/${encodeURIComponent(username)}/history?${query.toString()}`;
      return this.fetchAndValidate(
        `pika-network:profile-history:${username.toLowerCase()}:${query.toString()}`,
        url,
        PikaNetworkPlayerHistorySchema,
        config,
      );
    }

    async getProfileEvents(
      parameters: GetPlayerEventsParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkPlayerEvents | null> {
      const { username, limit, offset } = parameters;
      const query = new URLSearchParams();
      if (limit !== undefined) {
        query.set('limit', String(clampIntegerMaximum(limit, 'limit', 50, 1)));
      }
      if (offset !== undefined) {
        query.set('offset', String(assertNonNegativeInteger(offset, 'offset')));
      }
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/profile/${encodeURIComponent(username)}/events${suffix}`;
      return this.fetchAndValidate(
        `pika-network:profile-events:${username.toLowerCase()}:${query.toString()}`,
        url,
        PikaNetworkPlayerEventsSchema,
        config,
      );
    }

    async getProfileFights(
      parameters: GetPlayerFightsParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkPlayerFights | null> {
      const { username, mode, days, limit } = parameters;
      if (days !== undefined) assertIntegerRange(days, 'days', 1, 30);
      const query = new URLSearchParams();
      if (mode) query.set('mode', mode);
      if (days !== undefined) query.set('days', String(days));
      if (limit !== undefined) {
        query.set('limit', String(clampIntegerMaximum(limit, 'limit', 50, 1)));
      }
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/profile/${encodeURIComponent(username)}/fights${suffix}`;
      return this.fetchAndValidate(
        `pika-network:profile-fights:${username.toLowerCase()}:${query.toString()}`,
        url,
        PikaNetworkPlayerFightsSchema,
        config,
      );
    }
  }

  return WithPlayerData;
}
