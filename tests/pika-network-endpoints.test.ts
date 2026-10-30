import { afterEach, describe, expect, it, vi } from 'vitest';
import { PikaNetworkClient } from '@/networks/pika-network/pika-network-client';

const responseBodies: Record<string, unknown> = {
  '/api/profile/player': { username: 'player' },
  '/api/profile/player/leaderboard': {},
  '/api/players/player/teams': [],
  '/api/profile/player/history': { series: [] },
  '/api/leaderboards': { metadata: { total: 0 }, entries: [] },
  '/api/leaderboards/total': [],
  '/api/leaderboards/stats': [],
  '/api/leaderboards/movers': [],
  '/api/teams/opfactions/top': [],
  '/api/teams/opfactions/1': { team: {} },
  '/api/teams/opfactions/stats': { gamemode: 'opfactions', stats: [] },
  '/api/teams/opfactions/1/history': { points: [] },
  '/api/teams/vs': { mode: 'current', a: {}, b: {} },
  '/api/clans/guild': { name: 'guild' },
  '/api/clans/guild/members': [],
  '/api/clans': { name: 'guild' },
  '/api/events': { total: 0, events: [] },
  '/api/events/event-id': { id: 'event-id' },
  '/api/events/winners': [],
  '/api/events/types': [],
  '/api/profile/player/events': { events: [] },
  '/api/fights': [],
  '/api/fights/stats': { hours: 6 },
  '/api/fights/fight-id': { fight: { id: 'fight-id' } },
  '/api/profile/player/fights': {},
  '/api/seasons': {},
  '/api/seasons/details': {},
  '/api/recaps/game-id': { id: 'game-id' },
  '/api/ping': 'Pong!',
};

describe('PikaNetwork endpoint coverage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls every documented endpoint with authentication', async () => {
    const requestedUrls: URL[] = [];
    const fetchMock = vi.fn<typeof fetch>((input) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      requestedUrls.push(url);
      const isPing = url.pathname.endsWith('/ping');
      const body = isPing ? 'Pong!' : JSON.stringify(responseBodies[url.pathname]);
      return Promise.resolve(
        new Response(body, {
          status: 200,
          headers: {
            'Content-Type': isPing ? 'text/plain' : 'application/json',
            'X-RateLimit-Limit': '120',
            'X-RateLimit-Remaining': '119',
            'X-RateLimit-Reset': '42',
          },
        }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new PikaNetworkClient({
      apiKey: 'test-key',
      baseUrl: 'https://stats.example.test/api',
      cache: false,
      maxRetries: 0,
      rateLimit: { ratePerSecond: 100, burst: 100 },
    });

    await client.getProfile('player');
    await client.getProfileStats({ username: 'player', gamemode: 'bedwars', season: 7 });
    await client.getPlayerTeams('player');
    await client.getProfileHistory({ username: 'player', gamemode: 'bedwars', days: 30 });
    await client.getLeaderboard({ gamemode: 'bedwars', stat: 'wins', season: 7 });
    await client.getTotals({ gamemode: 'bedwars', season: 7 });
    await client.getLeaderboardStats({ gamemode: 'wildkits', prefix: 'loot.' });
    await client.getLeaderboardMovers({ gamemode: 'bedwars', stat: 'common.kills' });
    await client.getTopTeams({ mode: 'opfactions', limit: 10, with: 'change' });
    await client.getTeam({ mode: 'opfactions', entityId: 1 });
    await client.getTeamStats('opfactions');
    await client.getTeamHistory({ mode: 'opfactions', entityId: 1, limit: 20 });
    await client.compareTeams({ gamemode: 'opfactions', a: 1, b: 2 });
    await client.getClan('guild');
    await client.getClanMembers({ clanName: 'guild', stats: ['WINS', 'KILLS'] });
    await client.getPlayerClan('player');
    await client.getEvents({ type: 'SPLEEF', limit: 10, offset: 5 });
    await client.getEvent('event-id');
    await client.getEventWinners({ days: 7 });
    await client.getEventTypes();
    await client.getProfileEvents({ username: 'player', limit: 5 });
    await client.getFights({ mode: 'kitpvp', limit: 10 });
    await client.getFightStats({ mode: 'kitpvp', hours: 6 });
    await client.getFight('fight-id');
    await client.getProfileFights({ username: 'player', mode: 'kitpvp', days: 7 });
    await client.getSeasons();
    await client.getSeasonDetails('grizzly:opfactions');
    await client.getMatchRecap('game-id');
    expect(await client.ping()).toBe(true);
    expect(client.getRateLimitInfo()).toEqual({
      limit: 120,
      remaining: 119,
      resetSeconds: 42,
      retryAfterSeconds: null,
    });

    expect(requestedUrls.map((url) => url.pathname)).toEqual(Object.keys(responseBodies));
    expect(requestedUrls[4]?.searchParams.get('season')).toBe('7');
    expect(requestedUrls[6]?.searchParams.get('prefix')).toBe('loot.');
    expect(requestedUrls[11]?.searchParams.get('limit')).toBe('20');
    expect(requestedUrls[26]?.searchParams.get('type')).toBe('grizzly:opfactions');

    for (const [, init] of fetchMock.mock.calls) {
      expect(new Headers(init?.headers).get('X-Api-Key')).toBe('test-key');
    }
  });

  it('rejects invalid team comparison ranges without making a request', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    const client = new PikaNetworkClient({ apiKey: 'test-key', cache: false });

    await expect(
      client.compareTeams({ gamemode: 'opfactions', a: 1, b: 2, from: 1 }),
    ).rejects.toThrow(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects historical seasons with non-total intervals before requesting', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    const client = new PikaNetworkClient({ apiKey: 'test-key', cache: false });

    await expect(
      client.getProfileStats({
        username: 'player',
        gamemode: 'bedwars',
        season: 7,
        interval: 'weekly',
      }),
    ).rejects.toThrow(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects out-of-range history, fight, team, and clan parameters before requesting', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    const client = new PikaNetworkClient({ apiKey: 'test-key', cache: false });
    const tooManyStats = Array.from({ length: 21 }, (_, index) => `STAT_${index}`);

    await expect(
      client.getProfileHistory({ username: 'player', gamemode: 'bedwars', days: 366 }),
    ).rejects.toThrow(RangeError);
    await expect(client.getFightStats({ mode: 'kitpvp', hours: 169 })).rejects.toThrow(
      RangeError,
    );
    await expect(client.getFightStats({ mode: 'kitpvp', hours: 0 })).rejects.toThrow(
      RangeError,
    );
    await expect(
      client.getProfileFights({ username: 'player', days: 31 }),
    ).rejects.toThrow(RangeError);
    await expect(client.getEventWinners({ days: 3651 })).rejects.toThrow(RangeError);
    await expect(
      client.getTeamHistory({ mode: 'opfactions', entityId: 1, limit: 0 }),
    ).rejects.toThrow(RangeError);
    await expect(
      client.getClanMembers({ clanName: 'guild', stats: tooManyStats }),
    ).rejects.toThrow(RangeError);
    await expect(client.getTotals({ gamemode: 'bedwars', season: 7.5 })).rejects.toThrow(
      RangeError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('caps documented maximum page sizes before requesting', async () => {
    const requestedUrls: URL[] = [];
    const fetchMock = vi.fn<typeof fetch>((input) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      requestedUrls.push(url);
      return Promise.resolve(
        Response.json(responseBodies[url.pathname], {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const client = new PikaNetworkClient({
      apiKey: 'test-key',
      baseUrl: 'https://stats.example.test/api',
      cache: false,
      maxRetries: 0,
      rateLimit: { ratePerSecond: 100, burst: 10 },
    });

    await client.getLeaderboard({ gamemode: 'bedwars', stat: 'wins', limit: 50 });
    await client.getEvents({ limit: 100 });
    await client.getProfileEvents({ username: 'player', limit: 100 });
    await client.getFights({ mode: 'kitpvp', limit: 100 });
    await client.getTeamHistory({ mode: 'opfactions', entityId: 1, limit: 6000 });
    await client.getLeaderboardMovers({ gamemode: 'bedwars', limit: 100 });

    expect(requestedUrls.map((url) => url.searchParams.get('limit'))).toEqual([
      '25',
      '50',
      '50',
      '50',
      '5000',
      '50',
    ]);
  });
});
