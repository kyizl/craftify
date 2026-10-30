import {
  PikaNetworkSeasonDetailsSchema,
  PikaNetworkSeasonsSchema,
} from '@/networks/pika-network/schemas';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type {
  PikaNetworkSeasonDetails,
  PikaNetworkSeasons,
} from '@/networks/pika-network/types';
import type { RequestConfig } from '@/types';

export interface SeasonsMixin {
  getSeasons(config?: RequestConfig): Promise<PikaNetworkSeasons>;
  getSeasonDetails(
    type?: string,
    config?: RequestConfig,
  ): Promise<PikaNetworkSeasonDetails>;
}

export function withSeasons<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, SeasonsMixin> {
  abstract class WithSeasons extends Base implements SeasonsMixin {
    async getSeasons(config?: RequestConfig): Promise<PikaNetworkSeasons> {
      const url = `${this.baseUrl}/seasons`;
      const raw = await this.fetchAndValidate(
        'pika-network:seasons',
        url,
        PikaNetworkSeasonsSchema,
        config,
      );
      return raw ?? {};
    }

    async getSeasonDetails(
      type?: string,
      config?: RequestConfig,
    ): Promise<PikaNetworkSeasonDetails> {
      const query = new URLSearchParams();
      if (type) query.set('type', type);
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/seasons/details${suffix}`;
      const raw = await this.fetchAndValidate(
        `pika-network:season-details:${query.toString()}`,
        url,
        PikaNetworkSeasonDetailsSchema,
        config,
      );
      if (!raw) throw new TypeError('The season details endpoint returned no content');
      return raw;
    }
  }

  return WithSeasons;
}
