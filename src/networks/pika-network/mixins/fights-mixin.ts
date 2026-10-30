import { assertValidGamemode } from '@/networks/pika-network/guards';
import {
  assertIntegerRange,
  clampIntegerMaximum,
} from '@/networks/pika-network/request-validation';
import {
  PikaNetworkFightDetailSchema,
  PikaNetworkFightsSchema,
  PikaNetworkModeFightsSchema,
} from '@/networks/pika-network/schemas';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type {
  GetFightStatsParams,
  GetFightsParams,
  PikaNetworkFight,
  PikaNetworkFightDetail,
  PikaNetworkModeFights,
} from '@/networks/pika-network/types';
import type { RequestConfig } from '@/types';

export interface FightsMixin {
  getFights(
    parameters: GetFightsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkFight[]>;
  getFight(id: string, config?: RequestConfig): Promise<PikaNetworkFightDetail | null>;
  getFightStats(
    parameters: GetFightStatsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkModeFights>;
}

export function withFights<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, FightsMixin> {
  abstract class WithFights extends Base implements FightsMixin {
    async getFights(
      parameters: GetFightsParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkFight[]> {
      const { mode, limit } = parameters;
      assertValidGamemode(mode);
      const query = new URLSearchParams({ mode });
      if (limit !== undefined) {
        query.set('limit', String(clampIntegerMaximum(limit, 'limit', 50, 1)));
      }
      const url = `${this.baseUrl}/fights?${query.toString()}`;
      const raw = await this.fetchAndValidate(
        `pika-network:fights:${query.toString()}`,
        url,
        PikaNetworkFightsSchema,
        config,
      );
      return raw ?? [];
    }

    async getFight(
      id: string,
      config?: RequestConfig,
    ): Promise<PikaNetworkFightDetail | null> {
      const url = `${this.baseUrl}/fights/${encodeURIComponent(id)}`;
      return this.fetchAndValidate(
        `pika-network:fight:${id}`,
        url,
        PikaNetworkFightDetailSchema,
        config,
      );
    }

    async getFightStats(
      parameters: GetFightStatsParams,
      config?: RequestConfig,
    ): Promise<PikaNetworkModeFights> {
      const { mode, hours } = parameters;
      assertValidGamemode(mode);
      if (hours !== undefined) assertIntegerRange(hours, 'hours', 1, 168);
      const query = new URLSearchParams({ mode });
      if (hours !== undefined) query.set('hours', String(hours));
      const url = `${this.baseUrl}/fights/stats?${query.toString()}`;
      const raw = await this.fetchAndValidate(
        `pika-network:fight-stats:${query.toString()}`,
        url,
        PikaNetworkModeFightsSchema,
        config,
      );
      if (!raw) throw new TypeError('The fight statistics endpoint returned no content');
      return raw;
    }
  }

  return WithFights;
}
