---
title: Leaderboard Explorer
order: 4
---

# Leaderboard explorer

Build a real request URL for the official `GET /leaderboards` endpoint. The controls use the package's current gamemode/stat catalog; the generated [endpoint reference](./endpoints) remains authoritative for the complete raw HTTP contract.

<LeaderboardPlayground />

The explorer only constructs the URL; it does not send a request or attach credentials. Include your `X-Api-Key` header when calling it. The **endpoint docs** link opens the full request and response contract without making an unauthenticated request.

## Raw HTTP contract

| Parameter  | Required | Description                                                                               |
| ---------- | -------- | ----------------------------------------------------------------------------------------- |
| `type`     | Yes      | Game mode slug, such as `bedwars`.                                                        |
| `stat`     | Yes      | Internal stat key, such as `wins`, `kills`, or `FINAL_KILLS`. It is not the display name. |
| `interval` | Yes      | `weekly`, `monthly`, `yearly`, or `total`.                                                |
| `mode`     | Yes      | Sub-mode, such as `ALL_MODES`, `DOUBLES`, or `SOLO`.                                      |
| `offset`   | No       | Number of entries to skip; minimum `0`, default `0`.                                      |
| `limit`    | No       | Entries per page; `1` to `25`, default `25`.                                              |
| `season`   | No       | Historical season number. Omit for the current season.                                    |

`yearly` data exists only for BedWars and Unranked Practice. Historical seasons only have `total` interval data. Check the selected game mode's available stat and sub-mode values before sending the request.

## Response

The response is a `Leaderboard` object with `metadata.total` and `entries`. Each entry has an absolute one-based `place`, a player username in `id`, and a `value` encoded as a **string**. `clan` (BedWars guild) and `rank` are optional. `entries` is nullable.

## cURL

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/leaderboards?type=bedwars&stat=wins&interval=total&mode=ALL_MODES&offset=0&limit=10"
```

## With Craftify

```ts
import { Gamemode, PikaNetworkClient, Stat } from '@kyizl/craftify';

const client = new PikaNetworkClient({
  apiKey: process.env.PIKA_API_KEY!,
});

const leaderboard = await client.getLeaderboard({
  gamemode: Gamemode.BedWars,
  stat: Stat.BedWars.Wins,
  limit: 10,
});
```

The wrapper uses `gamemode` instead of the raw API's `type`, and may expose pagination using a page number rather than a raw `offset`. See the [getting-started guide](/guide/getting-started) and the generated [TypeScript reference](/api/).
