import { z } from 'zod';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type { RequestConfig } from '@/types';

const pingSchema = z.string();

export interface PingMixin {
  ping(config?: RequestConfig): Promise<boolean>;
}

export function withPing<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, PingMixin> {
  abstract class WithPing extends Base implements PingMixin {
    async ping(config?: RequestConfig): Promise<boolean> {
      try {
        const url = `${this.baseUrl}/ping`;
        const raw = await this.fetchAndValidate('pika-network:ping', url, pingSchema, {
          skipCache: true,
          ...config,
          headers: {
            Accept: 'text/plain, */*',
            ...config?.headers,
          },
        });
        return raw === 'Pong!';
      } catch {
        return false;
      }
    }
  }

  return WithPing;
}
