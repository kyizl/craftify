---
title: Leaderboards
order: 2
---

# Leaderboards

<Badge type="info" text="GET" /> `/leaderboards`

Global paginated ranking for one stat, one gamemode, one mode.

## Query parameters

| Parameter  | Type     | Required                                 | Description                                                     |
| ---------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `type`     | `string` | <Badge type="warning" text="required" /> | gamemode id, see [Gamemode Catalog](./gamemode-catalog)         |
| `stat`     | `string` | <Badge type="warning" text="required" /> | raw stat key, case-sensitive, mixed-case (`kills`, `BOW_KILLS`) |
| `mode`     | `string` | <Badge type="tip" text="recommended" />  | not crawled without this param; unconfirmed if omittable        |
| `interval` | `string` | <Badge type="info" text="optional" />    | `total` \| `weekly` \| `monthly` \| `yearly`, default `total`   |
| `offset`   | `number` | <Badge type="info" text="optional" />    | zero-indexed, default `0`                                       |
| `limit`    | `number` | <Badge type="info" text="optional" />    | requested page size, **hard-capped at 25** server-side          |

`interval=yearly` valid only for gamemodes tagged `yearly` in the [Gamemode Catalog](./gamemode-catalog). Other gamemodes: `200` with empty result, not `400`.

## Try it

<LeaderboardPlayground />

## Response `200`

<LiveEndpoint url="https://stats.pika-network.net/api/leaderboards?type=bedwars&stat=kills&interval=total&mode=ALL_MODES&offset=0&limit=5" />

| Field             | Type              | Notes                                                                  |
| ----------------- | ----------------- | ---------------------------------------------------------------------- |
| `metadata.total`  | `number`          | total players tracked for this stat, not page size                     |
| `entries`         | `Entry[] \| null` | `null` observed in place of `[]` in some cases                         |
| `entries[].place` | `number`          | 1-indexed, absolute rank                                               |
| `entries[].value` | `string`          | numeric string, see [numeric encoding](./overview#numeric-encoding)    |
| `entries[].id`    | `string`          | player username                                                        |
| `entries[].clan`  | `string`          | <Badge type="info" text="optional" /> omitted, not `null`, when absent |
| `entries[].rank`  | `string`          | <Badge type="info" text="optional" /> omitted when absent              |

## Request forms

::: code-group

```text [HTTP]
GET /leaderboards?type=bedwars&stat=kills&interval=total&mode=ALL_MODES&offset=0&limit=15
```

```bash [cURL]
curl 'https://stats.pika-network.net/api/leaderboards?type=bedwars&stat=kills&interval=total&mode=ALL_MODES&offset=0&limit=15'
```

```ts [craftify]
import { Gamemode, PikaNetworkClient, Stat } from '@kyizl/craftify';

const pika = new PikaNetworkClient({ apiKey: process.env.PIKA_API_KEY! });

await pika.getLeaderboard({
  gamemode: Gamemode.BedWars,
  stat: Stat.BedWars.Kills,
  limit: 15,
});
```

:::

## Errors

| Status | Condition                                                        |
| ------ | ---------------------------------------------------------------- |
| `400`  | invalid `type`                                                   |
| `400`  | invalid `stat` for `type`                                        |
| `400`  | invalid `mode` for `type`                                        |
| `400`  | `stat` valid for `type` overall but not for the requested `mode` |

No `404` case. Unmatched query values return `400`; the route itself always resolves.
