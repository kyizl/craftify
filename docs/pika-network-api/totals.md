---
title: Leaderboard Totals
order: 5
---

# Leaderboard totals

`GET /leaderboards/total` returns one [`StatTotal`](./schemas#stattotal) object per stat for a game mode.

The TypeScript example assumes `pika` and `Gamemode` are available as shown in the [getting-started guide](/guide/getting-started).

## Parameters

| Parameter | Location | Required | Description                                              |
| --------- | -------- | -------- | -------------------------------------------------------- |
| `type`    | Query    | Yes      | Game mode from the [`GameMode`](./schemas#gamemode) enum |
| `season`  | Query    | No       | Historical season number; omit for the current season    |

The published OpenAPI contract does **not** define a general `mode` query parameter for this route. Craftify currently adds a mode value for the `pillars` gamemode as a client compatibility behavior; that special case is not a general raw-HTTP parameter guarantee.

## Response `200`

The response is an array of `StatTotal` objects:

| Field     | Type      | Meaning                          |
| --------- | --------- | -------------------------------- |
| `name`    | `string`  | Stat display name                |
| `total`   | `integer` | Number of players with this stat |
| `sum`     | `number`  | Sum of the stat values           |
| `average` | `number`  | Average stat value               |

The documented operation responses are `200` and `429`.

## Request

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/leaderboards/total?type=bedwars"
```

```ts
const totals = await pika.getTotals({ gamemode: Gamemode.BedWars });
```

Craftify returns an empty array when the upstream response has no body, while the raw HTTP reference remains the source of truth for the documented `StatTotal[]` response.
