import { PikaNetworkRecapResponseSchema } from '@/networks/pika-network/schemas';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type { PikaNetworkRecapResponse } from '@/networks/pika-network/schemas';
import type { RequestConfig } from '@/types';

export interface RecapsMixin {
  getMatchRecap(
    gameId: string,
    config?: RequestConfig,
  ): Promise<PikaNetworkRecapResponse | null>;
}

export function withRecaps<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, RecapsMixin> {
  abstract class WithRecaps extends Base implements RecapsMixin {
    async getMatchRecap(
      gameId: string,
      config?: RequestConfig,
    ): Promise<PikaNetworkRecapResponse | null> {
      const url = `${this.baseUrl}/recaps/${encodeURIComponent(gameId)}`;
      return this.fetchAndValidate(
        `pika-network:recap:${gameId}`,
        url,
        PikaNetworkRecapResponseSchema,
        {
          skipCache: true,
          ...config,
        },
      );
    }
  }

  return WithRecaps;
}
