import { StatKey } from '@/networks/pika-network/enums';
import type {
  PikaNetworkGamemode,
  PikaNetworkInterval,
  PikaNetworkMode,
  PikaNetworkStat,
  PikaNetworkTeamMode,
} from '@/networks/pika-network/enums';
import type { PikaNetworkLeaderboardResponse } from '@/networks/pika-network/schemas';

export interface GetLeaderboardParams<
  G extends PikaNetworkGamemode = PikaNetworkGamemode,
> {
  gamemode: G;
  stat: PikaNetworkStat<G> | (string & {});
  mode?: PikaNetworkMode<G> | (string & {});
  interval?: PikaNetworkInterval;

  page?: number;
  limit?: number;
  season?: number;
}

export interface GetProfileStatsParams<
  G extends PikaNetworkGamemode = PikaNetworkGamemode,
> {
  username: string;
  gamemode: G;
  mode?: PikaNetworkMode<G> | (string & {});
  interval?: PikaNetworkInterval;
  season?: number;
}

export interface GetTotalsParams<G extends PikaNetworkGamemode = PikaNetworkGamemode> {
  gamemode: G;
  season?: number;
}

export interface GetPlayerHistoryParams {
  username: string;
  gamemode: PikaNetworkGamemode;
  stats?: string | string[];
  days?: number;
}

export interface GetLeaderboardStatsParams {
  gamemode: PikaNetworkGamemode;
  prefix?: string;
}

export interface GetLeaderboardMoversParams {
  gamemode: PikaNetworkGamemode;
  stat?: string;
  window?: '1d' | '7d';
  limit?: number;
}

export interface GetTopTeamsParams {
  mode: PikaNetworkTeamMode;
  limit?: number;
  offset?: number;
  with?: 'change';
  season?: number;
}

export interface GetTeamParams {
  mode: PikaNetworkTeamMode;
  entityId: string | number;
}

export interface GetTeamHistoryParams extends GetTeamParams {
  limit?: number;
  season?: number;
}

export interface CompareTeamsParams {
  gamemode: PikaNetworkTeamMode;
  a: string | number;
  b: string | number;
  at?: number;
  from?: number;
  to?: number;
}

export interface GetClanMembersParams {
  clanName: string;
  stats?: string | string[];
}

export interface GetEventsParams {
  type?: string;
  limit?: number;
  offset?: number;
}

export interface GetEventWinnersParams {
  type?: string;
  days?: number;
  limit?: number;
}

export interface GetPlayerEventsParams {
  username: string;
  limit?: number;
  offset?: number;
}

export interface GetFightsParams {
  mode: PikaNetworkGamemode;
  limit?: number;
}

export interface GetFightStatsParams {
  mode: PikaNetworkGamemode;
  hours?: number;
}

export interface GetPlayerFightsParams {
  username: string;
  mode?: PikaNetworkGamemode;
  days?: number;
  limit?: number;
}

export interface PikaNetworkRateLimitInfo {
  limit: number | null;
  remaining: number | null;
  resetSeconds: number | null;
  retryAfterSeconds: number | null;
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

export type ProfileStatAccessor = {
  [G in keyof typeof StatKey]: {
    [K in keyof (typeof StatKey)[G]]: ProfileStat | null;
  };
};

export type ProfileStats = ProfileStat[] & { readonly StatKey: ProfileStatAccessor };

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
  type PikaNetworkPlayerTeam,
  type PikaNetworkPlayerHistory,
  type PikaNetworkStatId,
  type PikaNetworkMover,
  type PikaNetworkTopTeam,
  type PikaNetworkTeamDetail,
  type PikaNetworkTeamMember,
  type PikaNetworkTeam,
  type PikaNetworkTeamStatCatalog,
  type PikaNetworkTeamSnapshot,
  type PikaNetworkTeamHistory,
  type PikaNetworkTeamComparison,
  type PikaNetworkClanMemberStatsResponse,
  type PikaNetworkClanMemberStats,
  type PikaNetworkSeasons,
  type PikaNetworkSeasonDetails,
  type PikaNetworkSeasonDates,
  type PikaNetworkEventSummary,
  type PikaNetworkEvent,
  type PikaNetworkEventStanding,
  type PikaNetworkEventPage,
  type PikaNetworkEventWinner,
  type PikaNetworkEventType,
  type PikaNetworkPlayerEvents,
  type PikaNetworkConsumable,
  type PikaNetworkCount,
  type PikaNetworkGearPiece,
  type PikaNetworkFight,
  type PikaNetworkFightSide,
  type PikaNetworkFightDetail,
  type PikaNetworkPlayerFights,
  type PikaNetworkModeFights,
  type PikaNetworkTotalsResponse,
} from '@/networks/pika-network/schemas';
