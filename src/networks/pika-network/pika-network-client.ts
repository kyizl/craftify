import { defu } from 'defu';
import { NetworkClient } from '@/client';
import { withClans } from '@/networks/pika-network/mixins/clans-mixin';
import { withEvents } from '@/networks/pika-network/mixins/events-mixin';
import { withFights } from '@/networks/pika-network/mixins/fights-mixin';
import { withLeaderboards } from '@/networks/pika-network/mixins/leaderboards-mixin';
import { withPing } from '@/networks/pika-network/mixins/ping-mixin';
import { withPlayerData } from '@/networks/pika-network/mixins/player-data-mixin';
import { withProfile } from '@/networks/pika-network/mixins/profile-mixin';
import { withProfileStats } from '@/networks/pika-network/mixins/profile-stats-mixin';
import { withRecaps } from '@/networks/pika-network/mixins/recaps-mixin';
import { withSeasons } from '@/networks/pika-network/mixins/seasons-mixin';
import { withTeams } from '@/networks/pika-network/mixins/teams-mixin';
import {
  PikaNetworkDefaultBaseUrl,
  PikaNetworkDefaultRateLimit,
} from '@/networks/pika-network/pika-network-defaults';
import type { NetworkClientOptions } from '@/client';
import type { PikaNetworkMixinConstructor } from '@/networks/pika-network/mixins/mixin-constructor';
import type { PikaNetworkRateLimitInfo } from '@/networks/pika-network/types';

export interface PikaNetworkDefaultHostOptions extends NetworkClientOptions {
  apiKey: string;
  baseUrl?: undefined;
}

export interface PikaNetworkCustomHostOptions extends NetworkClientOptions {
  apiKey?: string;
  baseUrl: string;
}

export type PikaNetworkClientOptions =
  PikaNetworkDefaultHostOptions | PikaNetworkCustomHostOptions;

const withLeaderboardsMixin = withLeaderboards(
  NetworkClient as PikaNetworkMixinConstructor,
);
const withProfileStatsMixin = withProfileStats(withLeaderboardsMixin);
const withProfileMixin = withProfile(withProfileStatsMixin);
const withClansMixin = withClans(withProfileMixin);
const withPlayerDataMixin = withPlayerData(withClansMixin);
const withTeamsMixin = withTeams(withPlayerDataMixin);
const withEventsMixin = withEvents(withTeamsMixin);
const withFightsMixin = withFights(withEventsMixin);
const withSeasonsMixin = withSeasons(withFightsMixin);
const withRecapsMixin = withRecaps(withSeasonsMixin);
const PikaNetworkFeatureSet = withPing(withRecapsMixin);

export class PikaNetworkClient extends PikaNetworkFeatureSet {
  protected readonly networkName = 'PikaNetwork';
  protected readonly baseUrl: string;

  constructor(options: PikaNetworkClientOptions) {
    const baseUrl = normalizeBaseUrl(options.baseUrl ?? PikaNetworkDefaultBaseUrl);
    const apiKey = resolveApiKey(options.apiKey, baseUrl);
    super({
      ...defu(options, { rateLimit: PikaNetworkDefaultRateLimit }),
      headers: {
        ...options.headers,
        ...(apiKey !== undefined && { 'X-Api-Key': apiKey }),
      },
    });
    this.baseUrl = baseUrl;
  }

  getRateLimitInfo(): PikaNetworkRateLimitInfo | null {
    const headers = this.getLastResponseMetadata()?.headers;
    if (!headers) return null;
    return {
      limit: parseHeaderNumber(headers.get('X-RateLimit-Limit')),
      remaining: parseHeaderNumber(headers.get('X-RateLimit-Remaining')),
      resetSeconds: parseHeaderNumber(headers.get('X-RateLimit-Reset')),
      retryAfterSeconds: parseHeaderNumber(headers.get('Retry-After')),
    };
  }
}

function parseHeaderNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveApiKey(apiKey: string | undefined, baseUrl: string): string | undefined {
  if (apiKey === undefined) {
    if (baseUrl === normalizeBaseUrl(PikaNetworkDefaultBaseUrl)) {
      throw new TypeError('apiKey is required when using the default baseUrl');
    }
    return undefined;
  }
  const trimmed = apiKey.trim();
  if (trimmed.length === 0) {
    throw new TypeError('apiKey must not be empty');
  }
  return trimmed;
}

function normalizeBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.trim();
  if (normalized.length === 0) {
    throw new TypeError('baseUrl must not be empty');
  }
  return normalized.replace(/\/+$/, '');
}
