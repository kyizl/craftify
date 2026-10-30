import type { NetworkClient } from '@/client';

export type PikaNetworkMixinConstructor = new (...arguments_: any[]) => NetworkClient;

export type PikaNetworkMixinResult<
  TBase extends PikaNetworkMixinConstructor,
  TFeature,
> = TBase & (abstract new (...arguments_: ConstructorParameters<TBase>) => TFeature);
