---
title: Totals
order: 3
---

# Totals

<Badge type="info" text="GET" /> `/leaderboards/total`

Server-wide aggregate per stat, for one gamemode. Not per-player, see [Profile Stats](./profile-stats).

## Query parameters

| Parameter | Type     | Required                                   | Description                                                                      |
| --------- | -------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| `type`    | `string` | <Badge type="warning" text="required" />   | gamemode id                                                                      |
| `mode`    | `string` | <Badge type="danger" text="conditional" /> | required only for `pillars` (`Seasonal`); all other gamemodes crawled without it |

## Response `200`

Array, not object.

<LiveEndpoint url="https://stats.pika-network.net/api/leaderboards/total?type=bedwars" />

| Field        | Type     | Notes                                                                                                                    |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `[].name`    | `string` | display name, matches [Gamemode Catalog](./gamemode-catalog), not the raw `stat` key from [Leaderboards](./leaderboards) |
| `[].total`   | `number` | players tracked for this stat                                                                                            |
| `[].average` | `number` | mean across tracked players                                                                                              |
| `[].sum`     | `number` | sum across tracked players                                                                                               |

::: tip numeric encoding
Unlike `/leaderboards`, every numeric field here is a genuine JSON `number`, not a numeric string.
:::

## Request forms

::: code-group

```text [HTTP]
GET /leaderboards/total?type=bedwars
```

```bash [cURL]
curl 'https://stats.pika-network.net/api/leaderboards/total?type=bedwars'
```

```ts [craftify]
import { Gamemode, PikaNetworkClient } from '@kyizl/craftify';

const pika = new PikaNetworkClient({ apiKey: process.env.PIKA_API_KEY! });

await pika.getTotals({ gamemode: Gamemode.BedWars });
```

:::

## Errors

| Status | Condition                 |
| ------ | ------------------------- |
| `400`  | invalid or missing `type` |

No `404` case.
