import { PikaNetworkProfileResponseSchema } from '@/networks/pika-network/schemas';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type { PikaNetworkProfileResponse } from '@/networks/pika-network/types';
import type { BatchOptions, BatchResult, RequestConfig } from '@/types';

export interface ProfileMixin {
  getProfile(
    username: string,
    config?: RequestConfig,
  ): Promise<PikaNetworkProfileResponse | null>;
  getProfiles(
    usernames: string[],
    config?: RequestConfig,
    options?: BatchOptions,
  ): Promise<BatchResult<PikaNetworkProfileResponse | null>[]>;
}

export function withProfile<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, ProfileMixin> {
  abstract class WithProfile extends Base implements ProfileMixin {
    async getProfile(
      username: string,
      config?: RequestConfig,
    ): Promise<PikaNetworkProfileResponse | null> {
      const url = `${this.baseUrl}/profile/${encodeURIComponent(username)}`;
      return this.fetchAndValidate(
        `pika-network:profile:${username.toLowerCase()}`,
        url,
        PikaNetworkProfileResponseSchema,
        config,
      );
    }

    async getProfiles(
      usernames: string[],
      config?: RequestConfig,
      options?: BatchOptions,
    ): Promise<BatchResult<PikaNetworkProfileResponse | null>[]> {
      return this.batch(
        usernames.map((username) => () => this.getProfile(username, config)),
        options,
      );
    }
  }

  return WithProfile;
}
