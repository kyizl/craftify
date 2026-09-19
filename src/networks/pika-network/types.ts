import { StatKey } from '@/networks/pika-network/enums';
import type {
  PikaNetworkGamemode,
  PikaNetworkInterval,
  PikaNetworkMode,
  PikaNetworkStat,
} from '@/networks/pika-network/enums';
import type { PikaNetworkLeaderboardResponse } from '@/networks/pika-network/schemas';

export interface GetLeaderboardParams<
  G extends PikaNetworkGamemode = PikaNetworkGamemode,
> {
  gamemode: G;
  stat: PikaNetworkStat<G> | (string & {});
  mode?: PikaNetworkMode<G> | (string & {});
  interval?: PikaNetworkInterval;
  /**
   * 1-indexed page number
   */
  page?: number;
  limit?: number;
}

export interface GetProfileStatsParams<
  G extends PikaNetworkGamemode = PikaNetworkGamemode,
> {
  username: string;
  gamemode: G;
  mode?: PikaNetworkMode<G> | (string & {});
  interval?: PikaNetworkInterval;
}

export interface GetTotalsParams<G extends PikaNetworkGamemode = PikaNetworkGamemode> {
  gamemode: G;
}

export interface LeaderboardEntry {
  place: number;
  value: number;
  id: string;
  clan?: string | null;
  rank?: string | null;
}

export interface LeaderboardPage {
  totalTracked: number;
  entries: LeaderboardEntry[];
}

export function toLeaderboardPage(raw: PikaNetworkLeaderboardResponse): LeaderboardPage {
  return {
    totalTracked: raw.metadata.total,
    entries: raw.entries ?? [],
  };
}

export interface ProfileStat {
  statKey: string;
  totalTracked: number;
  hasScore: boolean;
  place: number | null;
  value: number | null;
}

/**
 * provides direct access to profile stats through the `StatKey` hierarchy.
 * stats that were not fetched or have no recorded value resolve to `null`.
 */
export type ProfileStatAccessor = {
  [G in keyof typeof StatKey]: {
    [K in keyof (typeof StatKey)[G]]: ProfileStat | null;
  };
};

/**
 * profile stats returned as a normal `ProfileStat[]` with an additional
 * non-enumerable `StatKey` accessor for direct, autocomplete-friendly lookup.
 */
export type ProfileStats = ProfileStat[] & { readonly StatKey: ProfileStatAccessor };

/**
 * wraps a raw `ProfileStat[]` with the `.StatKey.<Gamemode>.<Stat>` accessor
 * indexed via a Map for O(1) reads without mutating the caller's input array.
 */
export function withStatKeyAccessor(stats: ProfileStat[]): ProfileStats {
  const statMap = new Map<string, ProfileStat>();
  for (const stat of stats) {
    statMap.set(stat.statKey, stat);
  }

  const accessor = {} as Record<string, Record<string, ProfileStat | null>>;

  for (const [gamemodeKey, gamemodeStats] of Object.entries(StatKey)) {
    const gamemodeAccessor = {} as Record<string, ProfileStat | null>;
    for (const [statFriendlyKey, rawStatKey] of Object.entries(gamemodeStats)) {
      Object.defineProperty(gamemodeAccessor, statFriendlyKey, {
        enumerable: true,
        get: () => statMap.get(rawStatKey) ?? null,
      });
    }
    accessor[gamemodeKey] = gamemodeAccessor;
  }

  const result = [...stats] as ProfileStats;
  Object.defineProperty(result, 'StatKey', {
    value: accessor,
    enumerable: false,
    writable: false,
  });
  return result;
}

export {
  type ClanMember,
  type PikaNetworkClanResponse,
  type PikaNetworkLeaderboardResponse,
  type PikaNetworkProfileDonorRank,
  type PikaNetworkProfileFriend,
  type PikaNetworkProfileResponse,
  type PikaNetworkTotalsResponse,
} from '@/networks/pika-network/schemas';
