---
title: Profile Stats
order: 5
---

# Profile Stats

<Badge type="info" text="GET" /> `/profile/{username}/leaderboard`

Per-player rank and value across every stat for a gamemode/mode. Not [Profile](./profile), despite the shared prefix.

## Path and query parameters

| Parameter  | Type     | Required                                       | Description                                                 |
| ---------- | -------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `username` | `string` | <Badge type="warning" text="required" /> path  | case-insensitive                                            |
| `type`     | `string` | <Badge type="warning" text="required" /> query | gamemode id                                                 |
| `mode`     | `string` | <Badge type="tip" text="recommended" /> query  | not crawled without this param                              |
| `interval` | `string` | <Badge type="info" text="optional" /> query    | same `yearly` restriction as [Leaderboards](./leaderboards) |

## Response `200`

::: danger key quirk
Object keyed by the stat's **display name**, not the raw `stat` key used by [Leaderboards](./leaderboards).
:::

| Field                           | Type      | Notes                                                                                                                  |
| ------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `<displayName>`                 | `object`  | key is e.g. `"Bow kills"`, not `BOW_KILLS`. See [Gamemode Catalog](./gamemode-catalog) for the raw to display mapping. |
| `<displayName>.metadata.total`  | `number`  | players tracked for this stat                                                                                          |
| `<displayName>.entries`         | `Entry[]` | exactly one entry, this player's own rank                                                                              |
| `<displayName>.entries[].place` | `number`  | 1-indexed absolute rank                                                                                                |
| `<displayName>.entries[].value` | `string`  | numeric string                                                                                                         |
| `<displayName>.entries[].id`    | `string`  | player username                                                                                                        |

## Live example

Real `GET` request from your browser, bedwars stats for `resuns`.

<LiveEndpoint url="https://stats.pika-network.net/api/profile/resuns/leaderboard?type=bedwars&interval=total&mode=ALL_MODES" />

## Response `204`

::: danger not an error
Player exists, has no data for this gamemode/mode. Empty body, treat exactly like an empty result.
:::

```text
GET /profile/xloray/leaderboard?type=bedwars&interval=total&mode=DOUBLES
204 No Content
```

## Request forms

::: code-group

```text [HTTP]
GET /profile/resuns/leaderboard?type=bedwars&interval=total&mode=ALL_MODES
```

```bash [cURL]
curl 'https://stats.pika-network.net/api/profile/resuns/leaderboard?type=bedwars&interval=total&mode=ALL_MODES'
```

```ts [craftify]
import { Gamemode, PikaNetworkClient } from '@kyizl/craftify';

const pika = new PikaNetworkClient({ apiKey: process.env.PIKA_API_KEY! });

const stats = await pika.getProfileStats({
  username: 'resuns',
  gamemode: Gamemode.BedWars,
});

stats.StatKey.BedWars.Kills;
```

:::

## Errors

| Status             | Condition                                      | Verified                                                                                 |
| ------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `204` (empty body) | valid request, no data for this gamemode/mode  | <Badge type="tip" text="crawl-confirmed" />                                              |
| `400`              | invalid gamemode / mode / interval combination | <Badge type="warning" text="inferred" /> by symmetry with [Leaderboards](./leaderboards) |
| `404` (empty body) | username does not exist                        | <Badge type="warning" text="inferred" /> by symmetry with [Profile](./profile)           |
