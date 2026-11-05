---
title: Endpoint Reference
order: 2
---

# Complete endpoint reference

Generated from OpenAPI **3.0.3** (API version **1.0.0**): **28 operations** across 7 categories. This reference expands the upstream paths, parameters, response codes, headers and schema references. The [machine-readable snapshot](/pika-network-openapi.json) remains the source of truth.

**Base URL:** `https://stats.pika-network.net/api`

## Authentication

The upstream specification defines **ApiKey** as an API key in the `header` header `X-Api-Key`. Obtain a free key in-game with `/apikey` after linking Discord with `/linkaccount`. A missing or invalid key receives `401`. Use `/apikey reset` if the key is exposed; the old key stops working.

**Global security requirement:** `ApiKey`. An operation can override this requirement with its own security declaration.

## Shared parameter definitions

| Parameter             | Location | Required | Type                                                                                                                                                          | Constraints and description                                                                                                                                                                 |
| --------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `username` (username) | path     | Yes      | string                                                                                                                                                        | example: `"JustThiemo"`; Minecraft username (not case-sensitive)                                                                                                                            |
| `type` (type)         | query    | Yes      | [`GameMode`](./schemas#gamemode)                                                                                                                              | example: `"bedwars"`; Game mode                                                                                                                                                             |
| `mode` (teamMode)     | path     | Yes      | `"opfactions"` \| `"opskyblock"` \| `"oneblock"` \| `"skymines"` \| `"opprison"` \| `"kitpvp"` \| `"skypvp"` \| `"genpvp"` \| `"survival"` \| `"oplifesteal"` | example: `"opfactions"`; Game mode with groups                                                                                                                                              |
| `interval` (interval) | query    | Yes      | `"weekly"` \| `"monthly"` \| `"yearly"` \| `"total"`                                                                                                          | default: `"total"`; Period. `yearly` exists only for BedWars and Unranked Practice; past seasons only have `total`.                                                                         |
| `mode` (subMode)      | query    | Yes      | string                                                                                                                                                        | default: `"ALL_MODES"`; example: `"ALL_MODES"`; Sub-mode filter: `ALL_MODES` for everything, or e.g. BedWars `SOLO`, `DOUBLES`, `TRIPLES`, `QUAD`; Practice `NODEBUFF`, `BOXING`, `SUMO`... |
| `season` (season)     | query    | No       | integer                                                                                                                                                       | Past season number (see `/seasons`). Leave out for the current season.                                                                                                                      |

## Site-level authentication and rate-limit behavior

The official website and the OpenAPI `info.description` document the following behavior globally. These details are **not declared as per-operation response objects or response headers in the OpenAPI `paths` section**, so they are intentionally kept separate from the operation response tables above.

| Behavior            | Official website documentation                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Authentication      | Every request needs a free `X-Api-Key` key. Missing, invalid, reset or staff-revoked keys receive `401 Unauthorized`. |
| Rate limit          | 120 requests per minute per API key.                                                                                  |
| Rate-limit headers  | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (reset is expressed in seconds).                |
| Throttling response | `429 Too Many Requests` includes `Retry-After`; wait for that duration and cache responses where practical.           |

Source: [official PikaNetwork API documentation](https://stats.pika-network.net/docs).

## Operations

### Players

Profiles, per-mode stats and their daily history

#### GET `/profile/{username}`

Player profile

Network level, ranks per server, friends, guild and linked accounts.

##### Parameters: GET `/profile/{username}`

| Name       | In   | Type   | Required | Constraints and description                                      |
| ---------- | ---- | ------ | -------- | ---------------------------------------------------------------- |
| `username` | path | string | Yes      | example: `"JustThiemo"`; Minecraft username (not case-sensitive) |

##### Responses: GET `/profile/{username}`

| Status | Meaning                                                                            | Body and response headers                        |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| `200`  | The player                                                                         | application/json: [`Profile`](./schemas#profile) |
| `404`  | No player with that name (empty body)                                              | No response body documented                      |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                      |

##### Example request: GET `/profile/{username}`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/profile/JustThiemo' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/profile/{username}/leaderboard`

A player's stats in one game mode

Every stat of the mode, keyed by its display name (`Kills`, `Final kills`, `Balance`...). Each stat has the total number of ranked players and the player's own entry with their value and leaderboard place, or `entries: null` if they have none for that period.

##### Parameters: GET `/profile/{username}/leaderboard`

| Name       | In    | Type                                                 | Required | Constraints and description                                                                                                                                                                 |
| ---------- | ----- | ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `username` | path  | string                                               | Yes      | example: `"JustThiemo"`; Minecraft username (not case-sensitive)                                                                                                                            |
| `type`     | query | [`GameMode`](./schemas#gamemode)                     | Yes      | example: `"bedwars"`; Game mode                                                                                                                                                             |
| `interval` | query | `"weekly"` \| `"monthly"` \| `"yearly"` \| `"total"` | Yes      | default: `"total"`; Period. `yearly` exists only for BedWars and Unranked Practice; past seasons only have `total`.                                                                         |
| `mode`     | query | string                                               | Yes      | default: `"ALL_MODES"`; example: `"ALL_MODES"`; Sub-mode filter: `ALL_MODES` for everything, or e.g. BedWars `SOLO`, `DOUBLES`, `TRIPLES`, `QUAD`; Practice `NODEBUFF`, `BOXING`, `SUMO`... |
| `season`   | query | integer                                              | No       | Past season number (see `/seasons`). Leave out for the current season.                                                                                                                      |

##### Responses: GET `/profile/{username}/leaderboard`

| Status | Meaning                                                                            | Body and response headers                                            |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `200`  | Stats by display name                                                              | application/json: [`PlayerLeaderboard`](./schemas#playerleaderboard) |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                                          |

##### Example request: GET `/profile/{username}/leaderboard`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/profile/JustThiemo/leaderboard?type=bedwars&interval=total&mode=ALL_MODES' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/players/{username}/teams`

A player's faction / island / gang / team in each mode

##### Parameters: GET `/players/{username}/teams`

| Name       | In   | Type   | Required | Constraints and description                                      |
| ---------- | ---- | ------ | -------- | ---------------------------------------------------------------- |
| `username` | path | string | Yes      | example: `"JustThiemo"`; Minecraft username (not case-sensitive) |

##### Responses: GET `/players/{username}/teams`

| Status | Meaning                                                                            | Body and response headers                                |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `200`  | One entry per mode the player is in a group in (empty array if none)               | application/json: [`PlayerTeam`](./schemas#playerteam)[] |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                              |

##### Example request: GET `/players/{username}/teams`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/players/JustThiemo/teams' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/profile/{username}/history`

A player's daily progression in one mode

Their lifetime stats day by day (minigames and Practice: all modes summed), for the stats the site tracks. A day only has a point if they played; missing days carry the previous value. Stats with no data are left out.

##### Parameters: GET `/profile/{username}/history`

| Name       | In    | Type                             | Required | Constraints and description                                                    |
| ---------- | ----- | -------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `username` | path  | string                           | Yes      | example: `"JustThiemo"`; Minecraft username (not case-sensitive)               |
| `type`     | query | [`GameMode`](./schemas#gamemode) | Yes      | example: `"bedwars"`; Game mode                                                |
| `stats`    | query | string                           | No       | Comma list of stat ids (default: the mode's tracked stats)                     |
| `days`     | query | integer                          | No       | minimum: `1`; maximum: `365`; default: `90`; Days back from today (UTC), 1-365 |

##### Responses: GET `/profile/{username}/history`

| Status | Meaning                                                                            | Body and response headers                                    |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `200`  | The series                                                                         | application/json: [`PlayerHistory`](./schemas#playerhistory) |
| `204`  | The player keeps their stats private (empty body)                                  | No response body documented                                  |
| `400`  | No such player                                                                     | application/json: [`Error`](./schemas#error)                 |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                                  |

##### Example request: GET `/profile/{username}/history`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/profile/JustThiemo/history?type=bedwars&days=90' -H "X-Api-Key: $PIKA_API_KEY"
```

### Leaderboards

Player rankings per game mode and stat, and the day's biggest movers

#### GET `/leaderboards`

Top players for one stat

Use the stat's internal key (`wins`, `kills`, `BALANCE`, `PRISON_PRESTIGE`, `HARVEST_SUGAR_CANE`...), not its display name. Pages hold at most **25** entries; a higher `limit` is capped. BedWars entries include the player's guild in `clan`.

##### Parameters: GET `/leaderboards`

| Name       | In    | Type                                                 | Required | Constraints and description                                                                                                                                                                 |
| ---------- | ----- | ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | query | [`GameMode`](./schemas#gamemode)                     | Yes      | example: `"bedwars"`; Game mode                                                                                                                                                             |
| `stat`     | query | string                                               | Yes      | example: `"wins"`; Internal stat key                                                                                                                                                        |
| `interval` | query | `"weekly"` \| `"monthly"` \| `"yearly"` \| `"total"` | Yes      | default: `"total"`; Period. `yearly` exists only for BedWars and Unranked Practice; past seasons only have `total`.                                                                         |
| `mode`     | query | string                                               | Yes      | default: `"ALL_MODES"`; example: `"ALL_MODES"`; Sub-mode filter: `ALL_MODES` for everything, or e.g. BedWars `SOLO`, `DOUBLES`, `TRIPLES`, `QUAD`; Practice `NODEBUFF`, `BOXING`, `SUMO`... |
| `offset`   | query | integer                                              | No       | minimum: `0`; default: `0`; Entries to skip                                                                                                                                                 |
| `limit`    | query | integer                                              | No       | minimum: `1`; maximum: `25`; default: `25`; Entries per page (max 25)                                                                                                                       |
| `season`   | query | integer                                              | No       | Past season number (see `/seasons`). Leave out for the current season.                                                                                                                      |

##### Responses: GET `/leaderboards`

| Status | Meaning                                                                            | Body and response headers                                |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `200`  | One page of the ranking                                                            | application/json: [`Leaderboard`](./schemas#leaderboard) |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                              |

##### Example request: GET `/leaderboards`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/leaderboards?type=bedwars&stat=wins&interval=total&mode=ALL_MODES&offset=0&limit=25' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/leaderboards/total`

Totals for every stat of a mode

How many players have each stat, plus the sum and average across all of them.

##### Parameters: GET `/leaderboards/total`

| Name     | In    | Type                             | Required | Constraints and description                                            |
| -------- | ----- | -------------------------------- | -------- | ---------------------------------------------------------------------- |
| `type`   | query | [`GameMode`](./schemas#gamemode) | Yes      | example: `"bedwars"`; Game mode                                        |
| `season` | query | integer                          | No       | Past season number (see `/seasons`). Leave out for the current season. |

##### Responses: GET `/leaderboards/total`

| Status | Meaning                                                                            | Body and response headers                              |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `200`  | One entry per stat                                                                 | application/json: [`StatTotal`](./schemas#stattotal)[] |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                            |

##### Example request: GET `/leaderboards/total`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/leaderboards/total?type=bedwars' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/leaderboards/stats`

Every stat id a mode has a board for

Use `id` as `stat=` on `/leaderboards`. `name` is the display name when known, else the id. Handy for stats per item, like each crate.

##### Parameters: GET `/leaderboards/stats`

| Name     | In    | Type                             | Required | Constraints and description                           |
| -------- | ----- | -------------------------------- | -------- | ----------------------------------------------------- |
| `type`   | query | [`GameMode`](./schemas#gamemode) | Yes      | example: `"bedwars"`; Game mode                       |
| `prefix` | query | string                           | No       | example: `"crate.open."`; Only ids starting with this |

##### Responses: GET `/leaderboards/stats`

| Status | Meaning                                                                            | Body and response headers                        |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| `200`  | Stat ids                                                                           | application/json: [`StatId`](./schemas#statid)[] |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                      |

##### Example request: GET `/leaderboards/stats`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/leaderboards/stats?type=bedwars&prefix=crate.open.' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/leaderboards/movers`

Biggest gainers of one stat

Each player's value today minus their last value on or before the start of the window. Only players who played today and gained are listed; private players are hidden. Note: `stat` is the lowercase stat id used by `/profile/{username}/history` (`common.balance`), not the leaderboard key.

##### Parameters: GET `/leaderboards/movers`

| Name     | In    | Type                             | Required | Constraints and description                                                                         |
| -------- | ----- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `type`   | query | [`GameMode`](./schemas#gamemode) | Yes      | example: `"bedwars"`; Game mode                                                                     |
| `stat`   | query | string                           | No       | example: `"common.kills"`; Lowercase stat id (default: the mode's first tracked stat)               |
| `window` | query | `"1d"` \| `"7d"`                 | No       | default: `"1d"`; `1d` = today vs yesterday, `7d` = today vs a week ago (UTC days; today is partial) |
| `limit`  | query | integer                          | No       | maximum: `50`; default: `25`; 1-50                                                                  |

##### Responses: GET `/leaderboards/movers`

| Status | Meaning                                                                            | Body and response headers                      |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `200`  | Movers, biggest gain first                                                         | application/json: [`Mover`](./schemas#mover)[] |
| `400`  | Untracked stat or bad window                                                       | No response body documented                    |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                    |

##### Example request: GET `/leaderboards/movers`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/leaderboards/movers?type=bedwars&stat=common.kills&window=1d&limit=25' -H "X-Api-Key: $PIKA_API_KEY"
```

### Teams

Factions (OpFactions), islands (OpSkyBlock, OneBlock, SkyMines), gangs (OpPrison) and teams (KitPvP, SkyPvP, GenPvP, Survival, OpLifeSteal)

#### GET `/teams/{mode}/top`

Top groups of a mode

Factions, islands, gangs or teams ranked by their headline value (worth, points...). In Survival and OpLifeSteal every team has 0, so the order there is not a ranking.

##### Parameters: GET `/teams/{mode}/top`

| Name     | In    | Type                                                                                                                                                          | Required | Constraints and description                                            |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `mode`   | path  | `"opfactions"` \| `"opskyblock"` \| `"oneblock"` \| `"skymines"` \| `"opprison"` \| `"kitpvp"` \| `"skypvp"` \| `"genpvp"` \| `"survival"` \| `"oplifesteal"` | Yes      | example: `"opfactions"`; Game mode with groups                         |
| `limit`  | query | integer                                                                                                                                                       | No       | minimum: `1`; default: `25`; example: `15`                             |
| `offset` | query | integer                                                                                                                                                       | No       | minimum: `0`; default: `0`                                             |
| `with`   | query | `"change"`                                                                                                                                                    | No       | `change` adds each group's 24-hour place and value change              |
| `season` | query | integer                                                                                                                                                       | No       | Past season number (see `/seasons`). Leave out for the current season. |

##### Responses: GET `/teams/{mode}/top`

| Status | Meaning                                                                            | Body and response headers                          |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| `200`  | Groups in order                                                                    | application/json: [`TopTeam`](./schemas#topteam)[] |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                        |

##### Example request: GET `/teams/{mode}/top`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/teams/opfactions/top?limit=15&offset=0' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/teams/{mode}/{entityId}`

One faction / island / gang / team

Members with roles, headline value, place and the members' combined stats (`aggStats`, keyed by stat id; names in `/teams/{mode}/stats`). `breakdown` holds mode-specific details (OpFactions: worth components, allies, spawners...).

##### Parameters: GET `/teams/{mode}/{entityId}`

| Name       | In   | Type                                                                                                                                                          | Required | Constraints and description                                                                                          |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `mode`     | path | `"opfactions"` \| `"opskyblock"` \| `"oneblock"` \| `"skymines"` \| `"opprison"` \| `"kitpvp"` \| `"skypvp"` \| `"genpvp"` \| `"survival"` \| `"oplifesteal"` | Yes      | example: `"opfactions"`; Game mode with groups                                                                       |
| `entityId` | path | string                                                                                                                                                        | Yes      | example: `"20"`; From `/teams/{mode}/top` or `/players/{username}/teams` (a number for factions, a UUID for islands) |

##### Responses: GET `/teams/{mode}/{entityId}`

| Status | Meaning                                                                            | Body and response headers                              |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `200`  | The group                                                                          | application/json: [`TeamDetail`](./schemas#teamdetail) |
| `404`  | No such group                                                                      | No response body documented                            |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                            |

##### Example request: GET `/teams/{mode}/{entityId}`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/teams/opfactions/YOUR_TEAM_ID' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/teams/{mode}/stats`

Names of a mode's team stats

Maps the stat ids used in `aggStats` to display names. Some ids that appear in `aggStats` are not listed here.

##### Parameters: GET `/teams/{mode}/stats`

| Name   | In   | Type                                                                                                                                                          | Required | Constraints and description                    |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------- |
| `mode` | path | `"opfactions"` \| `"opskyblock"` \| `"oneblock"` \| `"skymines"` \| `"opprison"` \| `"kitpvp"` \| `"skypvp"` \| `"genpvp"` \| `"survival"` \| `"oplifesteal"` | Yes      | example: `"opfactions"`; Game mode with groups |

##### Responses: GET `/teams/{mode}/stats`

| Status | Meaning                                                                            | Body and response headers                                        |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `200`  | Stat catalog                                                                       | application/json: [`TeamStatCatalog`](./schemas#teamstatcatalog) |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                                      |

##### Example request: GET `/teams/{mode}/stats`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/teams/opfactions/stats' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/teams/{mode}/{entityId}/history`

A group's snapshot series

Hourly snapshots of place, headline value and every team stat, oldest first.

##### Parameters: GET `/teams/{mode}/{entityId}/history`

| Name       | In    | Type                                                                                                                                                          | Required | Constraints and description                                             |
| ---------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `mode`     | path  | `"opfactions"` \| `"opskyblock"` \| `"oneblock"` \| `"skymines"` \| `"opprison"` \| `"kitpvp"` \| `"skypvp"` \| `"genpvp"` \| `"survival"` \| `"oplifesteal"` | Yes      | example: `"opfactions"`; Game mode with groups                          |
| `entityId` | path  | string                                                                                                                                                        | Yes      | example: `"6"`; From `/teams/{mode}/top` or `/players/{username}/teams` |
| `limit`    | query | integer                                                                                                                                                       | No       | maximum: `5000`; default: `500`; The newest N snapshots, 1-5000         |
| `season`   | query | integer                                                                                                                                                       | No       | Past season number (see `/seasons`). Leave out for the current season.  |

##### Responses: GET `/teams/{mode}/{entityId}/history`

| Status | Meaning                                                                            | Body and response headers                                |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `200`  | The series                                                                         | application/json: [`TeamHistory`](./schemas#teamhistory) |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                              |

##### Example request: GET `/teams/{mode}/{entityId}/history`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/teams/opfactions/YOUR_TEAM_ID/history?limit=500' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/teams/vs`

Compare two groups

Without time params: both groups now. With `at` (epoch ms): each side's last snapshot at or before then. With `from` and `to`: each side's series in that span (newest 500 points).

##### Parameters: GET `/teams/vs`

| Name       | In    | Type    | Required | Constraints and description                    |
| ---------- | ----- | ------- | -------- | ---------------------------------------------- |
| `gamemode` | query | string  | Yes      | example: `"opfactions"`; Game mode with groups |
| `a`        | query | string  | Yes      | example: `"6"`; First group's entityId         |
| `b`        | query | string  | Yes      | example: `"7"`; Second group's entityId        |
| `at`       | query | integer | No       | format: `int64`; Epoch ms                      |
| `from`     | query | integer | No       | format: `int64`; Epoch ms                      |
| `to`       | query | integer | No       | format: `int64`; Epoch ms                      |

##### Responses: GET `/teams/vs`

| Status | Meaning                                                                            | Body and response headers                      |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `200`  | Both sides                                                                         | application/json: [`TeamVs`](./schemas#teamvs) |
| `400`  | `at` together with `from`/`to`, or only one of `from`/`to`                         | No response body documented                    |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                    |

##### Example request: GET `/teams/vs`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/teams/vs?gamemode=opfactions&a=6&b=7' -H "X-Api-Key: $PIKA_API_KEY"
```

### Guilds

BedWars guilds (called clans in the API)

#### GET `/clans/{name}`

A BedWars guild

A BedWars guild by its exact name: tag, trophies, owner, members with join dates and level.

##### Parameters: GET `/clans/{name}`

| Name   | In   | Type   | Required | Constraints and description    |
| ------ | ---- | ------ | -------- | ------------------------------ |
| `name` | path | string | Yes      | example: `"NEXUS"`; Guild name |

##### Responses: GET `/clans/{name}`

| Status | Meaning                                                                            | Body and response headers                  |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `200`  | The guild                                                                          | application/json: [`Clan`](./schemas#clan) |
| `404`  | No guild with that name (empty body)                                               | No response body documented                |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                |

##### Example request: GET `/clans/{name}`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/clans/NEXUS' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/clans/{name}/members`

A guild's members with their BedWars totals

The whole roster in one call: each member's all-time, weekly and monthly totals (all modes summed). `stats` is null for members with private stats.

##### Parameters: GET `/clans/{name}/members`

| Name    | In    | Type   | Required | Constraints and description                                                                       |
| ------- | ----- | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| `name`  | path  | string | Yes      | example: `"Cheaters"`                                                                             |
| `stats` | query | string | No       | default: `"WINS,KILLS,FINAL_KILLS,BED_DESTROYED,PLAYED"`; Comma list of BedWars stat keys, max 20 |

##### Responses: GET `/clans/{name}/members`

| Status | Meaning                                                                            | Body and response headers                                |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `200`  | Members                                                                            | application/json: [`ClanMember`](./schemas#clanmember)[] |
| `404`  | No such guild                                                                      | No response body documented                              |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                              |

##### Example request: GET `/clans/{name}/members`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/clans/Cheaters/members?stats=WINS%2CKILLS%2CFINAL_KILLS%2CBED_DESTROYED%2CPLAYED' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/clans`

The guild a player is in

##### Parameters: GET `/clans`

| Name       | In    | Type   | Required | Constraints and description                 |
| ---------- | ----- | ------ | -------- | ------------------------------------------- |
| `username` | query | string | Yes      | example: `"voodootje0"`; Minecraft username |

##### Responses: GET `/clans`

| Status | Meaning                                                                            | Body and response headers                  |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `200`  | Their guild, same shape as /clans/{name}                                           | application/json: [`Clan`](./schemas#clan) |
| `404`  | Not in a guild                                                                     | No response body documented                |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                |

##### Example request: GET `/clans`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/clans?username=voodootje0' -H "X-Api-Key: $PIKA_API_KEY"
```

### Events

Events hosted on the events server (Spleef, Sumo, Parkour...) with everyone's final placement

#### GET `/events`

Events, newest first

Every finished event with its winners. Test runs and cancelled lobbies are never recorded.

##### Parameters: GET `/events`

| Name     | In    | Type    | Required | Constraints and description                             |
| -------- | ----- | ------- | -------- | ------------------------------------------------------- |
| `type`   | query | string  | No       | example: `"SPLEEF"`; An event type from `/events/types` |
| `limit`  | query | integer | No       | maximum: `50`; default: `20`; Max 50                    |
| `offset` | query | integer | No       | default: `0`                                            |

##### Responses: GET `/events`

| Status | Meaning                                                                            | Body and response headers   |
| ------ | ---------------------------------------------------------------------------------- | --------------------------- |
| `200`  | A page of events                                                                   | application/json: object    |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented |
| `503`  | Fights or events are not available right now                                       | application/json: object    |

##### Example request: GET `/events`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/events?type=SPLEEF&limit=20&offset=0' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/events/{id}`

One event with everyone's placement

##### Parameters: GET `/events/{id}`

| Name | In   | Type   | Required | Constraints and description       |
| ---- | ---- | ------ | -------- | --------------------------------- |
| `id` | path | string | Yes      | format: `uuid`; Event id (a UUID) |

##### Responses: GET `/events/{id}`

| Status | Meaning                                                                            | Body and response headers                    |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| `200`  | The event                                                                          | application/json: [`Event`](./schemas#event) |
| `400`  | Not a UUID                                                                         | No response body documented                  |
| `404`  | No such event                                                                      | No response body documented                  |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                  |
| `503`  | Fights or events are not available right now                                       | application/json: object                     |

##### Example request: GET `/events/{id}`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/events/YOUR_EVENT_UUID' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/events/winners`

Most event wins

Per player, with their latest name. Force-ended events don't count.

##### Parameters: GET `/events/winners`

| Name    | In    | Type    | Required | Constraints and description                                                 |
| ------- | ----- | ------- | -------- | --------------------------------------------------------------------------- |
| `type`  | query | string  | No       | One event type only                                                         |
| `days`  | query | integer | No       | maximum: `3650`; default: `0`; Only events in the last N days; 0 = all time |
| `limit` | query | integer | No       | maximum: `50`; default: `25`; Max 50                                        |

##### Responses: GET `/events/winners`

| Status | Meaning                                                                            | Body and response headers                                  |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `200`  | Most wins first                                                                    | application/json: [`EventWinner`](./schemas#eventwinner)[] |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                                |
| `503`  | Fights or events are not available right now                                       | application/json: object                                   |

##### Example request: GET `/events/winners`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/events/winners?days=0&limit=25' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/events/types`

Every event type played

##### Parameters: GET `/events/types`

| Name | In   | Type | Required | Constraints and description |
| ---- | ---- | ---- | -------- | --------------------------- |
| None | None | None | None     | No parameters               |

##### Responses: GET `/events/types`

| Status | Meaning                                                                            | Body and response headers                              |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `200`  | Most played first                                                                  | application/json: [`EventType`](./schemas#eventtype)[] |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                            |
| `503`  | Fights or events are not available right now                                       | application/json: object                               |

##### Example request: GET `/events/types`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/events/types' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/profile/{username}/events`

A player's events

Their totals and events, newest first.

##### Parameters: GET `/profile/{username}/events`

| Name       | In    | Type    | Required | Constraints and description                                      |
| ---------- | ----- | ------- | -------- | ---------------------------------------------------------------- |
| `username` | path  | string  | Yes      | example: `"JustThiemo"`; Minecraft username (not case-sensitive) |
| `limit`    | query | integer | No       | maximum: `50`; default: `20`; Max 50                             |
| `offset`   | query | integer | No       | default: `0`                                                     |

##### Responses: GET `/profile/{username}/events`

| Status | Meaning                                                                            | Body and response headers                                  |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `200`  | Their events                                                                       | application/json: [`PlayerEvents`](./schemas#playerevents) |
| `204`  | The player keeps their stats private (empty body)                                  | No response body documented                                |
| `400`  | No such player                                                                     | application/json: [`Error`](./schemas#error)               |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                                |
| `503`  | Fights or events are not available right now                                       | application/json: object                                   |

##### Example request: GET `/profile/{username}/events`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/profile/JustThiemo/events?limit=20&offset=0' -H "X-Api-Key: $PIKA_API_KEY"
```

### Fights

Every PvP kill on the network: both players' gear, how long it took, what they used

#### GET `/fights`

The latest kills in a mode

PvP kills from the last 2 days, newest first, with both sides' rank, sets and held weapon, how long the fight took and what each side used. Players with private stats have `username: null`.

##### Parameters: GET `/fights`

| Name    | In    | Type                             | Required | Constraints and description               |
| ------- | ----- | -------------------------------- | -------- | ----------------------------------------- |
| `mode`  | query | [`GameMode`](./schemas#gamemode) | Yes      | example: `"kitpvp"`; Game mode (its slug) |
| `limit` | query | integer                          | No       | maximum: `50`; default: `25`; Max 50      |

##### Responses: GET `/fights`

| Status | Meaning                                                                            | Body and response headers                      |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `200`  | Fights                                                                             | application/json: [`Fight`](./schemas#fight)[] |
| `400`  | Bad mode                                                                           | No response body documented                    |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                    |
| `503`  | Fights or events are not available right now                                       | application/json: object                       |

##### Example request: GET `/fights`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/fights?mode=kitpvp&limit=25' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/fights/stats`

A mode's recent PvP

Top killers, weapons, sets (kills made wearing each, and how many players wore it), consumables, death causes, the kill count and the median fight length.

##### Parameters: GET `/fights/stats`

| Name    | In    | Type                             | Required | Constraints and description                                |
| ------- | ----- | -------------------------------- | -------- | ---------------------------------------------------------- |
| `mode`  | query | [`GameMode`](./schemas#gamemode) | Yes      | example: `"kitpvp"`; Game mode (its slug)                  |
| `hours` | query | integer                          | No       | minimum: `1`; maximum: `168`; default: `24`; Window, 1-168 |

##### Responses: GET `/fights/stats`

| Status | Meaning                                                                            | Body and response headers                              |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `200`  | The mode's PvP                                                                     | application/json: [`ModeFights`](./schemas#modefights) |
| `400`  | Bad mode or hours                                                                  | No response body documented                            |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                            |
| `503`  | Fights or events are not available right now                                       | application/json: object                               |

##### Example request: GET `/fights/stats`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/fights/stats?mode=kitpvp&hours=24' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/fights/{id}`

One fight with both full loadouts

Every slot of both players' gear with enchants, sets, kits and scrolls, their gear when the fight began, and the in-game name and lore of each bonus item.

##### Parameters: GET `/fights/{id}`

| Name | In   | Type   | Required | Constraints and description                     |
| ---- | ---- | ------ | -------- | ----------------------------------------------- |
| `id` | path | string | Yes      | A fight id from `/fights` (`<epoch ms>.<uuid>`) |

##### Responses: GET `/fights/{id}`

| Status | Meaning                                                                            | Body and response headers                                |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `200`  | The fight                                                                          | application/json: [`FightDetail`](./schemas#fightdetail) |
| `404`  | No such fight                                                                      | No response body documented                              |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                              |
| `503`  | Fights or events are not available right now                                       | application/json: object                                 |

##### Example request: GET `/fights/{id}`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/fights/YOUR_EPOCH_MS.YOUR_FIGHT_UUID' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/profile/{username}/fights`

A player's fights

Kills, deaths, their latest fights, head to head against the players they met most, the weapons they killed with, what they used, deaths with no player killer, per-mode totals and kill streaks.

##### Parameters: GET `/profile/{username}/fights`

| Name       | In    | Type                             | Required | Constraints and description                                      |
| ---------- | ----- | -------------------------------- | -------- | ---------------------------------------------------------------- |
| `username` | path  | string                           | Yes      | example: `"JustThiemo"`; Minecraft username (not case-sensitive) |
| `mode`     | query | [`GameMode`](./schemas#gamemode) | No       | One game mode only                                               |
| `days`     | query | integer                          | No       | minimum: `1`; maximum: `30`; default: `30`; 1-30                 |
| `limit`    | query | integer                          | No       | maximum: `50`; default: `20`; Latest fights to include, max 50   |

##### Responses: GET `/profile/{username}/fights`

| Status | Meaning                                                                            | Body and response headers                                  |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `200`  | Their fights                                                                       | application/json: [`PlayerFights`](./schemas#playerfights) |
| `204`  | The player keeps their stats private (empty body)                                  | No response body documented                                |
| `400`  | No such player                                                                     | application/json: [`Error`](./schemas#error)               |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                                |
| `503`  | Fights or events are not available right now                                       | application/json: object                                   |

##### Example request: GET `/profile/{username}/fights`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/profile/JustThiemo/fights?days=30&limit=20' -H "X-Api-Key: $PIKA_API_KEY"
```

### Other

Seasons and match recaps

#### GET `/seasons`

Seasons per mode

Past (finished) season numbers per mode, keyed as `grizzly:{mode}`. The current season is not listed; requests without `season` return it. Some listed seasons have no data at all.

##### Parameters: GET `/seasons`

| Name | In   | Type | Required | Constraints and description |
| ---- | ---- | ---- | -------- | --------------------------- |
| None | None | None | None     | No parameters               |

##### Responses: GET `/seasons`

| Status | Meaning                                                                            | Body and response headers                   |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| `200`  | Seasons                                                                            | application/json: Record<string, integer[]> |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                 |

##### Example request: GET `/seasons`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/seasons' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/seasons/details`

Season start and end dates

When each season of a mode started and ended. A season ends when the next one starts, so the running season has `end: null`. Seasons without a recorded start date are left out.

##### Parameters: GET `/seasons/details`

| Name   | In    | Type   | Required | Constraints and description                                       |
| ------ | ----- | ------ | -------- | ----------------------------------------------------------------- |
| `type` | query | string | No       | Only this type, e.g. `grizzly:opfactions` (returns just its list) |

##### Responses: GET `/seasons/details`

| Status | Meaning                                                                            | Body and response headers                                                  |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `200`  | Dates per type, oldest season first                                                | application/json: Record<string, [`SeasonDates`](./schemas#seasondates)[]> |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                                                |
| `503`  | Dates can't be read right now                                                      | No response body documented                                                |

##### Example request: GET `/seasons/details`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/seasons/details' -H "X-Api-Key: $PIKA_API_KEY"
```

#### GET `/recaps/{gameId}`

A match recap

The result of one game: map, duration, every player's stats and the winners. The game id comes from the recap link shown in game after a match.

##### Parameters: GET `/recaps/{gameId}`

| Name     | In   | Type   | Required | Constraints and description |
| -------- | ---- | ------ | -------- | --------------------------- |
| `gameId` | path | string | Yes      |                             |

##### Responses: GET `/recaps/{gameId}`

| Status | Meaning                                                                            | Body and response headers                    |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| `200`  | The recap                                                                          | application/json: [`Recap`](./schemas#recap) |
| `400`  | Not a valid game id                                                                | application/json: [`Error`](./schemas#error) |
| `404`  | No recap for that game                                                             | No response body documented                  |
| `429`  | Over your key's limit (120 a minute). Wait the seconds in `Retry-After` and retry. | No response body documented                  |

##### Example request: GET `/recaps/{gameId}`

Replace uppercase ID placeholders with values returned by the API.

```bash
curl 'https://stats.pika-network.net/api/recaps/YOUR_GAME_ID' -H "X-Api-Key: $PIKA_API_KEY"
```

## Schema definitions

All 37 reusable schemas are expanded in the [schema reference](./schemas). Download the [official OpenAPI snapshot](/pika-network-openapi.json) for the complete machine-readable contract.
