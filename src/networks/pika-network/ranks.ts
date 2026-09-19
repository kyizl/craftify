import type { PikaNetworkGamemode } from '@/networks/pika-network/enums';
import type {
  PikaNetworkProfileDonorRank,
  PikaNetworkProfileResponse,
} from '@/networks/pika-network/schemas';

export type PikaNetworkRankScope = 'all' | 'global' | PikaNetworkGamemode;

const rankLadders: Record<string, readonly string[]> = {
  global: [
    'owner',
    'manager',
    'developer',
    'lead developer',
    'discord developer',
    'configurator',
    'website developer',
    'quality assurance',
    'game producer',
    'java developer',
    'admin',
    'admin of internal affairs',
    'admin of trial affairs',
    'sr mod',
    'moderator',
    'helper',
    'trial',
    'vip',
    'elite',
    'diamond',
    'titan',
    'champion',
    'partner',
  ],
  kitpvp: ['vip', 'god', 'legend', 'ultimate', 'baron'],
  opfactions: ['pro', 'hero', 'lord', 'legend', 'god', 'immortal'],
  opskyblock: ['skyvip', 'skyhero', 'skylord', 'skylegend', 'skygod', 'skyking'],
  opprison: ['smuggler', 'criminal', 'gangster', 'hitman', 'captain', 'boss'],
  oplifesteal: ['neutron', 'proton', 'gamma', 'beta', 'alpha', 'omega'],
  skypvp: ['hero', 'prime', 'delta', 'arcane', 'sigma'],
  genpvp: ['bandit'],
  practice: ['silver', 'gold', 'diamond', 'emerald'],
};

const serverAliases: Record<string, string> = {
  fac: 'opfactions',
  factions: 'opfactions',
  opfac: 'opfactions',
  opsb: 'opskyblock',
};

function normalizedScope(scope: string): string {
  return serverAliases[scope] ?? scope;
}

function rankScope(rank: PikaNetworkProfileDonorRank): string | undefined {
  if (rank.server) return normalizedScope(rank.server);
  const match = rank.name?.match(/^(.*?)(\d+)$/);
  return match?.[1] ? normalizedScope(match[1]) : undefined;
}

function normalizedRankName(name: string): string {
  return name.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
}

function isGlobalRank(rank: PikaNetworkProfileDonorRank): boolean {
  const displayName = rank.displayName;
  return (
    displayName !== undefined &&
    (rankLadders.global ?? []).some(
      (name) => normalizedRankName(name) === normalizedRankName(displayName),
    )
  );
}

function rankTier(rank: PikaNetworkProfileDonorRank, scope: string): number {
  const rankScopeName = rankScope(rank);
  const displayName = rank.displayName ? normalizedRankName(rank.displayName) : undefined;
  const ladder =
    scope === 'global' || scope === 'all'
      ? rankLadders.global
      : rankScopeName
        ? rankLadders[rankScopeName]
        : undefined;
  const ladderTier =
    displayName === undefined || ladder === undefined
      ? -1
      : ladder.findIndex((name) => normalizedRankName(name) === displayName);
  if (ladderTier >= 0) {
    if (scope === 'global' || scope === 'all') {
      const staffRankCount = 17;
      return ladderTier < staffRankCount
        ? 2000 + staffRankCount - ladderTier
        : 100 + ladderTier - staffRankCount;
    }
    return ladderTier + 1;
  }

  const numericTier = rank.name?.match(/(\d+)$/)?.[1];
  return scope === 'global' || scope === 'all'
    ? 1
    : numericTier === undefined
      ? 0
      : Number(numericTier);
}

function profileRankFallback(
  profile: PikaNetworkProfileResponse,
): PikaNetworkProfileDonorRank | null {
  const rankDisplay = profile.rank?.rankDisplay
    ?.replaceAll(/&[0-9a-f]/gi, '')
    .replaceAll(/[[\]]/g, '')
    .trim();
  if (
    rankDisplay === undefined ||
    rankDisplay === '' ||
    (rankLadders.global ?? []).every(
      (name) => normalizedRankName(name) !== normalizedRankName(rankDisplay),
    )
  ) {
    return null;
  }
  return {
    name: rankDisplay.toLowerCase(),
    displayName: rankDisplay,
    server: 'global',
    expiry: -1,
  };
}

/**
 * Returns the highest donor or staff rank in the requested scope.
 *
 * `global` selects ranks assigned network-wide, a gamemode selects that
 * gamemode's ladder, and `all` considers every donor rank.
 */
export function getTopRank(
  profile: PikaNetworkProfileResponse,
  scope: PikaNetworkRankScope = 'global',
): PikaNetworkProfileDonorRank | null {
  const requestedScope = normalizedScope(scope);
  const ranks = profile.ranks ?? [];
  const candidates = ranks.filter((rank) => {
    if (requestedScope === 'all') return true;
    return requestedScope === 'global'
      ? isGlobalRank(rank)
      : rankScope(rank) === requestedScope;
  });
  if (requestedScope === 'global') {
    const fallback = profileRankFallback(profile);
    if (fallback) candidates.push(fallback);
  }

  return (
    candidates
      .map((rank, index) => ({ rank, index }))
      .toSorted(
        (left, right) =>
          rankTier(right.rank, requestedScope) - rankTier(left.rank, requestedScope) ||
          left.index - right.index,
      )[0]?.rank ?? null
  );
}
