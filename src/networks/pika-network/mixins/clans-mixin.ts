import { assertMaximumListItems } from '@/networks/pika-network/request-validation';
import {
  PikaNetworkClanMembersSchema,
  PikaNetworkClanResponseSchema,
} from '@/networks/pika-network/schemas';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type {
  GetClanMembersParams,
  PikaNetworkClanMemberStatsResponse,
  PikaNetworkClanResponse,
} from '@/networks/pika-network/types';
import type { BatchOptions, BatchResult, RequestConfig } from '@/types';

export interface ClansMixin {
  getClan(
    clanName: string,
    config?: RequestConfig,
  ): Promise<PikaNetworkClanResponse | null>;
  getClans(
    clanNames: string[],
    config?: RequestConfig,
    options?: BatchOptions,
  ): Promise<BatchResult<PikaNetworkClanResponse | null>[]>;
  getPlayerClan(
    username: string,
    config?: RequestConfig,
  ): Promise<PikaNetworkClanResponse | null>;
  getClanMembers(
    parameters: GetClanMembersParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkClanMemberStatsResponse[]>;
}

export function withClans<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, ClansMixin> {
  abstract class WithClans extends Base implements ClansMixin {
    async getClan(
      clanName: string,
      config?: RequestConfig,
    ): Promise<PikaNetworkClanResponse | null> {
      const url = `${this.baseUrl}/clans/${encodeURIComponent(clanName)}`;
      return this.fetchAndValidate(
        `pika-network:clan:${clanName.toLowerCase()}`,
        url,
        PikaNetworkClanResponseSchema,
        config,
      );
    }

    async getClans(
      clanNames: string[],
      config?: RequestConfig,
      options?: BatchOptions,
    ): Promise<BatchResult<PikaNetworkClanResponse | null>[]> {
      return this.batch(
        clanNames.map((clanName) => () => this.getClan(clanName, config)),
        options,
      );
    }

    async getPlayerClan(
      username: string,
      config?: RequestConfig,
    ): Promise<PikaNetworkClanResponse | null> {
      const query = new URLSearchParams({ username });
      const url = `${this.baseUrl}/clans?${query.toString()}`;
      return this.fetchAndValidate(
        `pika-network:player-clan:${username.toLowerCase()}`,
        url,
        PikaNetworkClanResponseSchema,
        config,
      );
    }

    async getClanMembers(
      parameters: GetClanMembersParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkClanMemberStatsResponse[]> {
      const { clanName, stats } = parameters;
      const query = new URLSearchParams();
      if (stats) {
        assertMaximumListItems(stats, 'stats', 20);
        const values = Array.isArray(stats) ? stats : stats.split(',');
        if (values.length > 0) query.set('stats', values.join(','));
      }
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/clans/${encodeURIComponent(clanName)}/members${suffix}`;
      const raw = await this.fetchAndValidate(
        `pika-network:clan-members:${clanName.toLowerCase()}:${query.toString()}`,
        url,
        PikaNetworkClanMembersSchema,
        config,
      );
      return raw ?? [];
    }
  }

  return WithClans;
}
