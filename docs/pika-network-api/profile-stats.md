---
title: Player Stats
order: 3
---

# Player stats by gamemode

`GET /profile/{username}/leaderboard` returns a [`PlayerLeaderboard`](./schemas#playerleaderboard) object keyed by stat display name (`Kills`, `Final kills`, `Balance`, and so on). The upstream description says each stat contains the total ranked-player count and the requested player's entry, or `entries: null` when the player has no entry for that period.

The TypeScript example assumes `pika`, `Gamemode`, and the relevant stat constants are available as shown in the [getting-started guide](/guide/getting-started).

## Parameters

| Parameter  | Location | Required | Description                                                    |
| ---------- | -------- | -------- | -------------------------------------------------------------- |
| `username` | Path     | Yes      | Minecraft username                                             |
| `type`     | Query    | Yes      | Game mode from the [`GameMode`](./schemas#gamemode) enum       |
| `interval` | Query    | Yes      | `weekly`, `monthly`, `yearly`, or `total`; defaults to `total` |
| `mode`     | Query    | Yes      | Sub-mode filter; defaults to `ALL_MODES`                       |
| `season`   | Query    | No       | Historical season number; past seasons only support `total`    |

`yearly` is available only for BedWars and Unranked Practice. The `mode` parameter is required by the raw HTTP contract even though the server documents the `ALL_MODES` default.

## Response `200`

The response is a map from stat display name to a `Leaderboard` object:

- `metadata.total`: integer count of players ranked for that stat.
- `entries`: nullable array of [`LeaderboardEntry`](./schemas#leaderboardentry) values.
- `entries[].place`: integer leaderboard position.
- `entries[].id`: player username.
- `entries[].value`: numeric value encoded as a string.
- `entries[].clan` and `entries[].rank`: optional strings.

The published OpenAPI schema permits `entries: null`; it does not promise that every stat has exactly one entry. The OpenAPI response list currently declares `200` and `429` only. It does not declare a `204` response.

## Request

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/profile/JustThiemo/leaderboard?type=bedwars&interval=total&mode=ALL_MODES"
```

```ts
const stats = await pika.getProfileStats({
  username: 'JustThiemo',
  gamemode: Gamemode.BedWars,
});

const finalKills = stats.StatKey.BedWars.FinalKills;
```

Craftify defaults `interval` to `total` and resolves the default sub-mode before sending the request. It normalizes an empty response to an empty `ProfileStats` array; individual stat values are available through `StatKey` or `getProfileStat()`.
