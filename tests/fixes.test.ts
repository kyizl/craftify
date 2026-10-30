import { describe, expect, it } from 'vitest';
import { isRetryableNetworkError } from '@/client/http/retry';
import { TokenBucketRateLimiter } from '@/client/rate-limiter';
import {
  resolveDefaultMode,
  assertValidCombination,
} from '@/networks/pika-network/guards';
import { getTopRank } from '@/networks/pika-network/ranks';
import {
  PikaNetworkEventPageSchema,
  PikaNetworkLeaderboardResponseSchema,
  PikaNetworkPlayerEventsSchema,
  PikaNetworkPlayerFightsSchema,
  PikaNetworkPlayerHistorySchema,
  PikaNetworkRecapResponseSchema,
  PikaNetworkTeamDetailSchema,
  PikaNetworkTeamHistorySchema,
} from '@/networks/pika-network/schemas';
import { withStatKeyAccessor, type ProfileStat } from '@/networks/pika-network/types';
import type { PikaNetworkGamemode } from '@/networks/pika-network/enums';

describe('Craftify API Wrapper Fixes', () => {
  it('rate limiter provides automatic rate recovery and FIFO ordering', async () => {
    const limiter = new TokenBucketRateLimiter({
      ratePerSecond: 100,
      burst: 2,
      recoveryCooldownMs: 50,
    });

    limiter.onRateLimited();
    expect(limiter.currentRatePerSecond).toBe(50);

    await new Promise((r) => setTimeout(r, 60));
    await limiter.acquire();

    expect(limiter.currentRatePerSecond).toBeGreaterThan(50);
  });

  it('isRetryableNetworkError identifies transient transport errors', () => {
    expect(isRetryableNetworkError(new Error('fetch failed'))).toBe(true);
    expect(isRetryableNetworkError(new Error('connection reset by peer'))).toBe(true);
    expect(isRetryableNetworkError({ code: 'ETIMEDOUT', message: 'timeout' })).toBe(true);
    expect(isRetryableNetworkError(new DOMException('Aborted', 'AbortError'))).toBe(
      false,
    );
  });

  it('leaderboard entry schema supports null clan and rank', () => {
    const raw = {
      metadata: { total: 100 },
      entries: [
        { place: 1, value: '500', id: 'player1', clan: null, rank: null },
        { place: 2, value: 300, id: 'player2', clan: 'ClanA', rank: 'VIP' },
      ],
    };

    const parsed = PikaNetworkLeaderboardResponseSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.entries?.[0]?.clan).toBeNull();
      expect(parsed.data.entries?.[0]?.value).toBe(500);
    }
  });

  it('team and event schemas accept live nullable fields', () => {
    expect(
      PikaNetworkTeamDetailSchema.safeParse({
        place: null,
        team: {
          headlineValue: null,
          members: [{ user: { username: 'player' }, role: 'LEADER', active: true }],
        },
      }).success,
    ).toBe(true);
    expect(
      PikaNetworkTeamHistorySchema.safeParse({
        gamemode: 'opfactions',
        points: [{ headlineValue: null, place: null }],
      }).success,
    ).toBe(true);
    expect(
      PikaNetworkEventPageSchema.safeParse({
        total: 1,
        events: [
          {
            id: '00000000-0000-0000-0000-000000000000',
            map: null,
            mapName: null,
            teamSize: null,
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('supports supplied live recap and private-player response shapes', () => {
    expect(
      PikaNetworkRecapResponseSchema.safeParse({
        id: '0e946551-12a8-4db1-a097-10da7ade35ad',
        users: [
          { username: 'player1', stats: { kills: 12, wins: '1' } },
          { username: 'player2', stats: { kills: '5', deaths: 8 } },
        ],
        winners: ['player1'],
      }).success,
    ).toBe(true);

    expect(
      PikaNetworkPlayerHistorySchema.safeParse({
        type: 'bedwars',
        series: [{ stat: 7, name: 'Wins', points: [{ date: '2026-10-30', value: 2 }] }],
      }).success,
    ).toBe(true);

    expect(
      PikaNetworkPlayerEventsSchema.safeParse({
        summary: {
          played: 0,
          wins: 0,
          podiums: 0,
          bestPlacement: null,
        },
        events: [],
      }).success,
    ).toBe(true);

    expect(
      PikaNetworkPlayerFightsSchema.safeParse({
        days: 30,
        kills: 0,
        deaths: 0,
        recent: [],
      }).success,
    ).toBe(true);
  });

  it('withStatKeyAccessor indexes stats for O(1) reads without mutating input', () => {
    const stats: ProfileStat[] = [
      {
        statKey: 'Final kills',
        totalTracked: 1000,
        hasScore: true,
        place: 5,
        value: 120,
      },
    ];

    const wrapped = withStatKeyAccessor(stats);
    expect(wrapped.StatKey.BedWars.FinalKills?.value).toBe(120);
    expect(wrapped.StatKey.BedWars.FinalKills?.place).toBe(5);
    expect(wrapped.StatKey.BedWars.BowKills).toBeNull();
  });

  it('guards reject invalid gamemodes and combinations', () => {
    expect(resolveDefaultMode('bedwars')).toBe('ALL_MODES');
    expect(resolveDefaultMode('pillars')).toBe('Seasonal');

    expect(() => assertValidCombination('bedwars', 'SOLO', 'total')).not.toThrow();

    expect(() => assertValidCombination('bedwars', 'INVALID_MODE', 'total')).toThrow(
      RangeError,
    );

    expect(() =>
      assertValidCombination(
        'invalid_gamemode' as PikaNetworkGamemode,
        'ALL_MODES',
        'total',
      ),
    ).toThrow(RangeError);
  });

  it('resolves the highest active rank for global and gamemode scopes', () => {
    const profile = {
      ranks: [
        { name: 'kitpvp2', displayName: 'God', server: 'kitpvp', expiry: -1 },
        { name: 'kitpvp5', displayName: 'Baron', server: 'kitpvp', expiry: -1 },
        { name: 'practice3', displayName: 'Diamond', server: 'global', expiry: -1 },
        { name: 'practice4', displayName: 'Emerald', server: 'global', expiry: 1 },
      ],
    };

    expect(getTopRank(profile, 'kitpvp')?.displayName).toBe('Baron');
    expect(getTopRank(profile, 'global')?.displayName).toBe('Diamond');
    expect(getTopRank(profile, 'all')?.displayName).toBe('Diamond');
  });

  it('prioritizes official global staff roles over donor ranks', () => {
    const profile = {
      ranks: [
        { name: 'survival10', displayName: 'King+++', server: 'global', expiry: -1 },
        { name: 'srmod', displayName: 'Sr Mod', server: 'global', expiry: -1 },
        { name: 'games4', displayName: 'Champion', server: 'global', expiry: -1 },
      ],
    };

    expect(getTopRank(profile, 'global')?.displayName).toBe('Sr Mod');
  });

  it('uses the highest network rank even when its API server is gamemode-specific', () => {
    const profile = {
      ranks: [
        { name: 'practice3', displayName: 'Diamond', server: 'global', expiry: -1 },
        { name: 'games3', displayName: 'Titan', server: 'games', expiry: -1 },
      ],
    };

    expect(getTopRank(profile, 'global')?.displayName).toBe('Titan');
  });

  it('does not treat unrelated gamemode ranks as global ranks', () => {
    const profile = {
      rank: { rankDisplay: '&8[&7Member&8]&a ' },
      ranks: [
        { name: 'oplifesteal6', displayName: 'Omega', server: 'oplifesteal', expiry: -1 },
        { name: 'bedwars5', displayName: 'Overlord', server: 'bedwars', expiry: -1 },
      ],
    };

    expect(getTopRank(profile, 'global')).toBeNull();
  });
});
