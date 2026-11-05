---
title: Schema Reference
order: 3
---

# Response schema reference

Generated from all **37 reusable schemas** in the official OpenAPI document. The property tables include inherited and nested properties, requiredness, nullability, constraints, examples and links to referenced schemas.

## GameMode

**Allowed values:** `"opfactions"`, `"opprison"`, `"opskyblock"`, `"oneblock"`, `"survival"`, `"kitpvp"`, `"unrankedpractice"`, `"rankedpractice"`, `"bedwars"`, `"skywars"`, `"oplifesteal"`, `"skypvp"`, `"skymines"`, `"genpvp"`, `"wildkits"`, `"dungeons"`

**Type:** `"opfactions"` | `"opprison"` | `"opskyblock"` | `"oneblock"` | `"survival"` | `"kitpvp"` | `"unrankedpractice"` | `"rankedpractice"` | `"bedwars"` | `"skywars"` | `"oplifesteal"` | `"skypvp"` | `"skymines"` | `"genpvp"` | `"wildkits"` | `"dungeons"`

## Profile

| Field path                     | Type                             | Required | Nullable | Constraints and description                                          |
| ------------------------------ | -------------------------------- | -------- | -------- | -------------------------------------------------------------------- |
| `username`                     | string                           | No       | No       | example: `"JustThiemo"`                                              |
| `lastSeen`                     | integer                          | No       | No       | format: `int64`; example: `1792020692705`; Unix time in milliseconds |
| `rank`                         | object                           | No       | No       | Network level                                                        |
| `rank.level`                   | integer                          | No       | No       | example: `14`                                                        |
| `rank.experience`              | integer                          | No       | No       | example: `427`                                                       |
| `rank.percentage`              | number                           | No       | No       | example: `65.69`; Progress to the next level, 0-100                  |
| `rank.rankDisplay`             | string                           | No       | No       | example: `"&7"`; Color code for the level                            |
| `ranks`                        | object[]                         | No       | No       | Bought ranks per server                                              |
| `ranks[].name`                 | string                           | No       | No       | example: `"opfac7"`                                                  |
| `ranks[].displayName`          | string                           | No       | No       | example: `"Eternal"`                                                 |
| `ranks[].server`               | string                           | No       | No       | example: `"opfac"`                                                   |
| `ranks[].season`               | integer or null                  | No       | Yes      |                                                                      |
| `ranks[].expiry`               | integer                          | No       | No       | format: `int64`; example: `-1`; -1 = permanent                       |
| `friends`                      | object[]                         | No       | No       |                                                                      |
| `friends[].username`           | string                           | No       | No       |                                                                      |
| `clan`                         | [`Clan`](./schemas#clan) or null | No       | Yes      | The player's BedWars guild, or null                                  |
| `clan.name`                    | string                           | No       | No       | example: `"NEXUS"`                                                   |
| `clan.tag`                     | string                           | No       | No       | example: `"✽Nexu5✽"`                                                 |
| `clan.currentTrophies`         | integer                          | No       | No       | example: `0`                                                         |
| `clan.creationTime`            | string                           | No       | No       | example: `"2022-11-03T10:35:35"`; Local date-time without zone       |
| `clan.owner`                   | object                           | No       | No       |                                                                      |
| `clan.owner.username`          | string                           | No       | No       | example: `"svit2008"`                                                |
| `clan.leveling`                | object                           | No       | No       |                                                                      |
| `clan.leveling.level`          | integer                          | No       | No       | example: `111`                                                       |
| `clan.leveling.exp`            | integer                          | No       | No       | example: `131557`                                                    |
| `clan.leveling.totalExp`       | integer                          | No       | No       | example: `15050336`                                                  |
| `clan.members`                 | object[]                         | No       | No       |                                                                      |
| `clan.members[].user`          | object                           | No       | No       |                                                                      |
| `clan.members[].user.username` | string                           | No       | No       |                                                                      |
| `clan.members[].joinDate`      | string                           | No       | No       | example: `"2026-03-30T10:36:27"`                                     |
| `email_verified`               | boolean                          | No       | No       |                                                                      |
| `discord_verified`             | boolean                          | No       | No       |                                                                      |
| `discord_boosting`             | boolean                          | No       | No       |                                                                      |

## LeaderboardEntry

| Field path | Type    | Required | Nullable | Constraints and description                                                     |
| ---------- | ------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `place`    | integer | No       | No       | example: `1`                                                                    |
| `value`    | string  | No       | No       | example: `"15066"`; Numeric value as a string (can be very large or fractional) |
| `id`       | string  | No       | No       | example: `"ohRickyy"`; Username                                                 |
| `clan`     | string  | No       | No       | example: `"Tragedy"`; BedWars only: the player's guild                          |
| `rank`     | string  | No       | No       | example: `"Eternal"`; Rank on that server, when the player has one              |

## Leaderboard

| Field path        | Type                                                       | Required | Nullable | Constraints and description                                                     |
| ----------------- | ---------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `metadata`        | object                                                     | No       | No       |                                                                                 |
| `metadata.total`  | integer                                                    | No       | No       | example: `2173602`; Ranked players for this stat                                |
| `entries`         | [`LeaderboardEntry`](./schemas#leaderboardentry)[] or null | No       | Yes      |                                                                                 |
| `entries[].place` | integer                                                    | No       | No       | example: `1`                                                                    |
| `entries[].value` | string                                                     | No       | No       | example: `"15066"`; Numeric value as a string (can be very large or fractional) |
| `entries[].id`    | string                                                     | No       | No       | example: `"ohRickyy"`; Username                                                 |
| `entries[].clan`  | string                                                     | No       | No       | example: `"Tragedy"`; BedWars only: the player's guild                          |
| `entries[].rank`  | string                                                     | No       | No       | example: `"Eternal"`; Rank on that server, when the player has one              |

## PlayerLeaderboard

Keyed by stat display name

| Field path          | Type                                                       | Required | Nullable | Constraints and description                                                     |
| ------------------- | ---------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `*`                 | [`Leaderboard`](./schemas#leaderboard)                     | No       | No       |                                                                                 |
| `*.metadata`        | object                                                     | No       | No       |                                                                                 |
| `*.metadata.total`  | integer                                                    | No       | No       | example: `2173602`; Ranked players for this stat                                |
| `*.entries`         | [`LeaderboardEntry`](./schemas#leaderboardentry)[] or null | No       | Yes      |                                                                                 |
| `*.entries[].place` | integer                                                    | No       | No       | example: `1`                                                                    |
| `*.entries[].value` | string                                                     | No       | No       | example: `"15066"`; Numeric value as a string (can be very large or fractional) |
| `*.entries[].id`    | string                                                     | No       | No       | example: `"ohRickyy"`; Username                                                 |
| `*.entries[].clan`  | string                                                     | No       | No       | example: `"Tragedy"`; BedWars only: the player's guild                          |
| `*.entries[].rank`  | string                                                     | No       | No       | example: `"Eternal"`; Rank on that server, when the player has one              |

Example:

```json
{
  "Wins": {
    "metadata": {
      "total": 2173602
    },
    "entries": [
      {
        "place": 4120,
        "value": "312",
        "id": "SPY_TankAF"
      }
    ]
  },
  "Kills": {
    "metadata": {
      "total": 21401
    },
    "entries": null
  }
}
```

## StatTotal

| Field path | Type    | Required | Nullable | Constraints and description                |
| ---------- | ------- | -------- | -------- | ------------------------------------------ |
| `name`     | string  | No       | No       | example: `"Kills"`                         |
| `total`    | integer | No       | No       | example: `4483313`; Players with this stat |
| `sum`      | number  | No       | No       | example: `604369594`                       |
| `average`  | number  | No       | No       | example: `134.8`                           |

## TopTeam

| Field path       | Type            | Required | Nullable | Constraints and description                                                  |
| ---------------- | --------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `place`          | integer         | No       | No       | example: `1`                                                                 |
| `entityId`       | string          | No       | No       | example: `"61"`                                                              |
| `displayName`    | string          | No       | No       | example: `"§c§lNo§4§lHook"`; May contain color codes                         |
| `value`          | string          | No       | No       | example: `"30911100000000"`; Headline value (worth, points...) as a string   |
| `placeChange24h` | integer or null | No       | Yes      | example: `2`; With `with=change`: places gained in 24 hours (positive = up)  |
| `valueChange24h` | number or null  | No       | Yes      | example: `1250000000`; With `with=change`: headline value gained in 24 hours |

## TeamMember

| Field path      | Type    | Required | Nullable | Constraints and description                                                                                |
| --------------- | ------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `user`          | object  | No       | No       |                                                                                                            |
| `user.username` | string  | No       | No       | example: `"AlexandrosGR"`                                                                                  |
| `role`          | string  | No       | No       | example: `"LEADER"`; Depends on the mode: LEADER, CO_LEADER, OFFICER, MODERATOR, MEMBER, RECRUIT, OWNER... |
| `active`        | boolean | No       | No       |                                                                                                            |
| `joinedAt`      | integer | No       | No       | format: `int64`                                                                                            |

## TeamDetail

| Field path                     | Type                                   | Required | Nullable | Constraints and description                                                                                          |
| ------------------------------ | -------------------------------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `place`                        | integer or null                        | No       | Yes      | example: `2`                                                                                                         |
| `team`                         | object                                 | No       | No       |                                                                                                                      |
| `team.gamemode`                | string                                 | No       | No       | example: `"opfactions"`                                                                                              |
| `team.family`                  | string                                 | No       | No       | example: `"factions"`; factions, islands, teams...                                                                   |
| `team.entityId`                | string                                 | No       | No       | example: `"20"`                                                                                                      |
| `team.displayName`             | string                                 | No       | No       | example: `"§021§6g"`                                                                                                 |
| `team.tag`                     | string                                 | No       | No       |                                                                                                                      |
| `team.memberCount`             | integer                                | No       | No       | example: `5`                                                                                                         |
| `team.headlineValue`           | number                                 | No       | No       | example: `11918540000000`                                                                                            |
| `team.season`                  | integer                                | No       | No       | example: `49`                                                                                                        |
| `team.aggStats`                | Record<string, number>                 | No       | No       | example: `{"common.kills":243,"common.deaths":21,"common.balance":280100000000}`; Members' combined stats by stat id |
| `team.aggStats.*`              | number                                 | No       | No       |                                                                                                                      |
| `team.breakdown`               | Record<string, any>                    | No       | No       | Mode-specific details                                                                                                |
| `team.members`                 | [`TeamMember`](./schemas#teammember)[] | No       | No       |                                                                                                                      |
| `team.members[].user`          | object                                 | No       | No       |                                                                                                                      |
| `team.members[].user.username` | string                                 | No       | No       | example: `"AlexandrosGR"`                                                                                            |
| `team.members[].role`          | string                                 | No       | No       | example: `"LEADER"`; Depends on the mode: LEADER, CO_LEADER, OFFICER, MODERATOR, MEMBER, RECRUIT, OWNER...           |
| `team.members[].active`        | boolean                                | No       | No       |                                                                                                                      |
| `team.members[].joinedAt`      | integer                                | No       | No       | format: `int64`                                                                                                      |

## TeamStatCatalog

| Field path     | Type     | Required | Nullable | Constraints and description |
| -------------- | -------- | -------- | -------- | --------------------------- |
| `gamemode`     | string   | No       | No       | example: `"opfactions"`     |
| `stats`        | object[] | No       | No       |                             |
| `stats[].id`   | string   | No       | No       | example: `"common.kills"`   |
| `stats[].name` | string   | No       | No       | example: `"Kills"`          |

## PlayerTeam

| Field path    | Type   | Required | Nullable | Constraints and description                       |
| ------------- | ------ | -------- | -------- | ------------------------------------------------- |
| `gamemode`    | string | No       | No       | example: `"opskyblock"`                           |
| `entityId`    | string | No       | No       | example: `"fb215822-8446-4ba6-b38f-36da17f6a0c3"` |
| `displayName` | string | No       | No       | example: `"SPY_TankAF's Island"`                  |
| `role`        | string | No       | No       | example: `"OWNER"`                                |

## Clan

| Field path                | Type     | Required | Nullable | Constraints and description                                    |
| ------------------------- | -------- | -------- | -------- | -------------------------------------------------------------- |
| `name`                    | string   | No       | No       | example: `"NEXUS"`                                             |
| `tag`                     | string   | No       | No       | example: `"✽Nexu5✽"`                                           |
| `currentTrophies`         | integer  | No       | No       | example: `0`                                                   |
| `creationTime`            | string   | No       | No       | example: `"2022-11-03T10:35:35"`; Local date-time without zone |
| `owner`                   | object   | No       | No       |                                                                |
| `owner.username`          | string   | No       | No       | example: `"svit2008"`                                          |
| `leveling`                | object   | No       | No       |                                                                |
| `leveling.level`          | integer  | No       | No       | example: `111`                                                 |
| `leveling.exp`            | integer  | No       | No       | example: `131557`                                              |
| `leveling.totalExp`       | integer  | No       | No       | example: `15050336`                                            |
| `members`                 | object[] | No       | No       |                                                                |
| `members[].user`          | object   | No       | No       |                                                                |
| `members[].user.username` | string   | No       | No       |                                                                |
| `members[].joinDate`      | string   | No       | No       | example: `"2026-03-30T10:36:27"`                               |

## SeasonDates

| Field path | Type           | Required | Nullable | Constraints and description                                                          |
| ---------- | -------------- | -------- | -------- | ------------------------------------------------------------------------------------ |
| `season`   | integer        | No       | No       | example: `48`                                                                        |
| `start`    | string         | No       | No       | format: `date`; example: `"2026-08-01"`                                              |
| `end`      | string or null | No       | Yes      | format: `date`; example: `"2026-09-12"`; The next season's start; null while running |

## Recap

| Field path         | Type                             | Required | Nullable | Constraints and description                               |
| ------------------ | -------------------------------- | -------- | -------- | --------------------------------------------------------- |
| `id`               | string                           | No       | No       |                                                           |
| `mapName`          | string                           | No       | No       |                                                           |
| `gameType`         | string                           | No       | No       | example: `"BedWars"`                                      |
| `gameServerName`   | string                           | No       | No       |                                                           |
| `gameStart`        | string                           | No       | No       |                                                           |
| `gameDuration`     | string                           | No       | No       |                                                           |
| `users`            | object[]                         | No       | No       |                                                           |
| `users[].username` | string                           | No       | No       |                                                           |
| `users[].stats`    | Record<string, string or number> | No       | No       | example: `{"Kills":7,"Final kills":3,"Beds destroyed":1}` |
| `users[].stats.*`  | string or number                 | No       | No       |                                                           |
| `winners`          | string[]                         | No       | No       |                                                           |
| `stats`            | string[]                         | No       | No       | Stat names shown in this recap                            |

## Error

| Field path  | Type    | Required | Nullable | Constraints and description |
| ----------- | ------- | -------- | -------- | --------------------------- |
| `timestamp` | string  | No       | No       |                             |
| `status`    | integer | No       | No       | example: `400`              |
| `error`     | string  | No       | No       | example: `"Bad Request"`    |
| `path`      | string  | No       | No       |                             |

## PlayerHistory

| Field path                | Type     | Required | Nullable | Constraints and description |
| ------------------------- | -------- | -------- | -------- | --------------------------- |
| `type`                    | string   | No       | No       | example: `"KIT_PVP"`        |
| `from`                    | string   | No       | No       | format: `date`              |
| `to`                      | string   | No       | No       | format: `date`              |
| `series`                  | object[] | No       | No       |                             |
| `series[].stat`           | string   | No       | No       | example: `"kills"`          |
| `series[].name`           | string   | No       | No       | example: `"Kills"`          |
| `series[].points`         | object[] | No       | No       |                             |
| `series[].points[].date`  | string   | No       | No       | format: `date`              |
| `series[].points[].value` | number   | No       | No       |                             |

## StatId

| Field path | Type   | Required | Nullable | Constraints and description  |
| ---------- | ------ | -------- | -------- | ---------------------------- |
| `id`       | string | No       | No       | example: `"crate.open.epic"` |
| `name`     | string | No       | No       | example: `"crate.open.epic"` |

## Mover

| Field path | Type    | Required | Nullable | Constraints and description           |
| ---------- | ------- | -------- | -------- | ------------------------------------- |
| `id`       | string  | No       | No       | example: `"PincoPancoNada"`; Username |
| `from`     | number  | No       | No       |                                       |
| `to`       | number  | No       | No       |                                       |
| `gain`     | number  | No       | No       | example: `855300137379`               |
| `place`    | integer | No       | No       | example: `1`                          |

## TeamSnapshot

| Field path      | Type                   | Required | Nullable | Constraints and description                                      |
| --------------- | ---------------------- | -------- | -------- | ---------------------------------------------------------------- |
| `snapshotTs`    | integer                | No       | No       | format: `int64`; Epoch milliseconds                              |
| `headlineValue` | number                 | No       | No       |                                                                  |
| `place`         | integer or null        | No       | Yes      |                                                                  |
| `aggStats`      | Record<string, number> | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `aggStats.*`    | number                 | No       | No       |                                                                  |

## TeamHistory

| Field path               | Type                                       | Required | Nullable | Constraints and description                                      |
| ------------------------ | ------------------------------------------ | -------- | -------- | ---------------------------------------------------------------- |
| `gamemode`               | string                                     | No       | No       | example: `"opfactions"`                                          |
| `entityId`               | string                                     | No       | No       | example: `"6"`                                                   |
| `interval`               | string                                     | No       | No       | example: `"Lifetime"`                                            |
| `points`                 | [`TeamSnapshot`](./schemas#teamsnapshot)[] | No       | No       |                                                                  |
| `points[].snapshotTs`    | integer                                    | No       | No       | format: `int64`; Epoch milliseconds                              |
| `points[].headlineValue` | number                                     | No       | No       |                                                                  |
| `points[].place`         | integer or null                            | No       | Yes      |                                                                  |
| `points[].aggStats`      | Record<string, number>                     | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `points[].aggStats.*`    | number                                     | No       | No       |                                                                  |

## TeamVsSide

| Field path               | Type                                               | Required | Nullable | Constraints and description                                      |
| ------------------------ | -------------------------------------------------- | -------- | -------- | ---------------------------------------------------------------- |
| `entityId`               | string                                             | No       | No       |                                                                  |
| `displayName`            | string or null                                     | No       | Yes      | May contain color codes                                          |
| `place`                  | integer or null                                    | No       | Yes      |                                                                  |
| `headlineValue`          | number or null                                     | No       | Yes      |                                                                  |
| `aggStats`               | Record<string, number> or null                     | No       | Yes      |                                                                  |
| `aggStats.*`             | number                                             | No       | No       |                                                                  |
| `snapshot`               | [`TeamSnapshot`](./schemas#teamsnapshot) or null   | No       | Yes      | With `at`                                                        |
| `snapshot.snapshotTs`    | integer                                            | No       | No       | format: `int64`; Epoch milliseconds                              |
| `snapshot.headlineValue` | number                                             | No       | No       |                                                                  |
| `snapshot.place`         | integer or null                                    | No       | Yes      |                                                                  |
| `snapshot.aggStats`      | Record<string, number>                             | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `snapshot.aggStats.*`    | number                                             | No       | No       |                                                                  |
| `series`                 | [`TeamSnapshot`](./schemas#teamsnapshot)[] or null | No       | Yes      | With `from`/`to`                                                 |
| `series[].snapshotTs`    | integer                                            | No       | No       | format: `int64`; Epoch milliseconds                              |
| `series[].headlineValue` | number                                             | No       | No       |                                                                  |
| `series[].place`         | integer or null                                    | No       | Yes      |                                                                  |
| `series[].aggStats`      | Record<string, number>                             | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `series[].aggStats.*`    | number                                             | No       | No       |                                                                  |

## TeamVs

| Field path                 | Type                                               | Required | Nullable | Constraints and description                                      |
| -------------------------- | -------------------------------------------------- | -------- | -------- | ---------------------------------------------------------------- |
| `gamemode`                 | string                                             | No       | No       |                                                                  |
| `mode`                     | `"current"` \| `"at"` \| `"range"`                 | No       | No       |                                                                  |
| `at`                       | integer or null                                    | No       | Yes      |                                                                  |
| `from`                     | integer or null                                    | No       | Yes      |                                                                  |
| `to`                       | integer or null                                    | No       | Yes      |                                                                  |
| `a`                        | [`TeamVsSide`](./schemas#teamvsside)               | No       | No       |                                                                  |
| `a.entityId`               | string                                             | No       | No       |                                                                  |
| `a.displayName`            | string or null                                     | No       | Yes      | May contain color codes                                          |
| `a.place`                  | integer or null                                    | No       | Yes      |                                                                  |
| `a.headlineValue`          | number or null                                     | No       | Yes      |                                                                  |
| `a.aggStats`               | Record<string, number> or null                     | No       | Yes      |                                                                  |
| `a.aggStats.*`             | number                                             | No       | No       |                                                                  |
| `a.snapshot`               | [`TeamSnapshot`](./schemas#teamsnapshot) or null   | No       | Yes      | With `at`                                                        |
| `a.snapshot.snapshotTs`    | integer                                            | No       | No       | format: `int64`; Epoch milliseconds                              |
| `a.snapshot.headlineValue` | number                                             | No       | No       |                                                                  |
| `a.snapshot.place`         | integer or null                                    | No       | Yes      |                                                                  |
| `a.snapshot.aggStats`      | Record<string, number>                             | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `a.snapshot.aggStats.*`    | number                                             | No       | No       |                                                                  |
| `a.series`                 | [`TeamSnapshot`](./schemas#teamsnapshot)[] or null | No       | Yes      | With `from`/`to`                                                 |
| `a.series[].snapshotTs`    | integer                                            | No       | No       | format: `int64`; Epoch milliseconds                              |
| `a.series[].headlineValue` | number                                             | No       | No       |                                                                  |
| `a.series[].place`         | integer or null                                    | No       | Yes      |                                                                  |
| `a.series[].aggStats`      | Record<string, number>                             | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `a.series[].aggStats.*`    | number                                             | No       | No       |                                                                  |
| `b`                        | [`TeamVsSide`](./schemas#teamvsside)               | No       | No       |                                                                  |
| `b.entityId`               | string                                             | No       | No       |                                                                  |
| `b.displayName`            | string or null                                     | No       | Yes      | May contain color codes                                          |
| `b.place`                  | integer or null                                    | No       | Yes      |                                                                  |
| `b.headlineValue`          | number or null                                     | No       | Yes      |                                                                  |
| `b.aggStats`               | Record<string, number> or null                     | No       | Yes      |                                                                  |
| `b.aggStats.*`             | number                                             | No       | No       |                                                                  |
| `b.snapshot`               | [`TeamSnapshot`](./schemas#teamsnapshot) or null   | No       | Yes      | With `at`                                                        |
| `b.snapshot.snapshotTs`    | integer                                            | No       | No       | format: `int64`; Epoch milliseconds                              |
| `b.snapshot.headlineValue` | number                                             | No       | No       |                                                                  |
| `b.snapshot.place`         | integer or null                                    | No       | Yes      |                                                                  |
| `b.snapshot.aggStats`      | Record<string, number>                             | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `b.snapshot.aggStats.*`    | number                                             | No       | No       |                                                                  |
| `b.series`                 | [`TeamSnapshot`](./schemas#teamsnapshot)[] or null | No       | Yes      | With `from`/`to`                                                 |
| `b.series[].snapshotTs`    | integer                                            | No       | No       | format: `int64`; Epoch milliseconds                              |
| `b.series[].headlineValue` | number                                             | No       | No       |                                                                  |
| `b.series[].place`         | integer or null                                    | No       | Yes      |                                                                  |
| `b.series[].aggStats`      | Record<string, number>                             | No       | No       | example: `{"common.kills":240,"common.balance":1277309960898.6}` |
| `b.series[].aggStats.*`    | number                                             | No       | No       |                                                                  |

## ClanMember

| Field path        | Type                   | Required | Nullable | Constraints and description        |
| ----------------- | ---------------------- | -------- | -------- | ---------------------------------- |
| `username`        | string                 | No       | No       |                                    |
| `joinDate`        | string                 | No       | No       | example: `"2022-05-14T00:13:14"`   |
| `stats`           | object or null         | No       | Yes      |                                    |
| `stats.total`     | Record<string, number> | No       | No       | example: `{"WINS":35,"KILLS":285}` |
| `stats.total.*`   | number                 | No       | No       |                                    |
| `stats.weekly`    | Record<string, number> | No       | No       | example: `{"WINS":35,"KILLS":285}` |
| `stats.weekly.*`  | number                 | No       | No       |                                    |
| `stats.monthly`   | Record<string, number> | No       | No       | example: `{"WINS":35,"KILLS":285}` |
| `stats.monthly.*` | number                 | No       | No       |                                    |

## EventSummary

| Field path  | Type                                        | Required | Nullable | Constraints and description         |
| ----------- | ------------------------------------------- | -------- | -------- | ----------------------------------- |
| `id`        | string                                      | No       | No       | format: `uuid`                      |
| `type`      | string                                      | No       | No       | example: `"SPLEEF"`                 |
| `name`      | string                                      | No       | No       | example: `"Spleef"`                 |
| `map`       | string                                      | No       | No       | example: `"greek"`                  |
| `mapName`   | string                                      | No       | No       | example: `"Greek"`                  |
| `teamSize`  | integer                                     | No       | No       | example: `1`                        |
| `startedAt` | integer                                     | No       | No       | format: `int64`; Epoch milliseconds |
| `endedAt`   | integer                                     | No       | No       | format: `int64`; Epoch milliseconds |
| `outcome`   | `"WIN"` \| `"NO_WINNER"` \| `"FORCE_ENDED"` | No       | No       |                                     |
| `players`   | integer                                     | No       | No       | example: `143`                      |
| `winners`   | string[]                                    | No       | No       | example: `["Wrath"]`                |

## EventStanding

| Field path  | Type                                                    | Required | Nullable | Constraints and description                                                        |
| ----------- | ------------------------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| `username`  | string                                                  | No       | No       |                                                                                    |
| `placement` | integer                                                 | No       | No       | example: `1`                                                                       |
| `winner`    | boolean                                                 | No       | No       |                                                                                    |
| `team`      | integer or null                                         | No       | Yes      |                                                                                    |
| `teamColor` | string or null                                          | No       | Yes      | example: `"#FF5555"`                                                               |
| `outAt`     | integer or null                                         | No       | Yes      | format: `int64`; Epoch ms when they went out; null for players still in at the end |
| `outReason` | `"ELIMINATED"` \| `"KNOCKED_OUT"` \| `"LEFT"` \| `null` | No       | Yes      |                                                                                    |
| `kills`     | integer                                                 | No       | No       |                                                                                    |
| `score`     | integer                                                 | No       | No       |                                                                                    |

## Event

| Field path              | Type                                                                 | Required | Nullable | Constraints and description                                                        |
| ----------------------- | -------------------------------------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| `id`                    | string                                                               | No       | No       | format: `uuid`                                                                     |
| `type`                  | string                                                               | No       | No       | example: `"SPLEEF"`                                                                |
| `name`                  | string                                                               | No       | No       | example: `"Spleef"`                                                                |
| `map`                   | string                                                               | No       | No       | example: `"greek"`                                                                 |
| `mapName`               | string                                                               | No       | No       | example: `"Greek"`                                                                 |
| `teamSize`              | integer                                                              | No       | No       | example: `1`                                                                       |
| `startedAt`             | integer                                                              | No       | No       | format: `int64`; Epoch milliseconds                                                |
| `endedAt`               | integer                                                              | No       | No       | format: `int64`; Epoch milliseconds                                                |
| `outcome`               | `"WIN"` \| `"NO_WINNER"` \| `"FORCE_ENDED"`                          | No       | No       |                                                                                    |
| `players`               | integer                                                              | No       | No       | example: `143`                                                                     |
| `winners`               | string[]                                                             | No       | No       | example: `["Wrath"]`                                                               |
| `progression`           | `"LAST_STANDING"` \| `"BRACKET"` \| `"BEST_SCORE"` \| `"MOST_KILLS"` | No       | No       |                                                                                    |
| `server`                | string                                                               | No       | No       |                                                                                    |
| `host`                  | string or null                                                       | No       | Yes      | Who started the countdown                                                          |
| `endReason`             | string or null                                                       | No       | Yes      |                                                                                    |
| `standings`             | [`EventStanding`](./schemas#eventstanding)[]                         | No       | No       | Everyone, best first                                                               |
| `standings[].username`  | string                                                               | No       | No       |                                                                                    |
| `standings[].placement` | integer                                                              | No       | No       | example: `1`                                                                       |
| `standings[].winner`    | boolean                                                              | No       | No       |                                                                                    |
| `standings[].team`      | integer or null                                                      | No       | Yes      |                                                                                    |
| `standings[].teamColor` | string or null                                                       | No       | Yes      | example: `"#FF5555"`                                                               |
| `standings[].outAt`     | integer or null                                                      | No       | Yes      | format: `int64`; Epoch ms when they went out; null for players still in at the end |
| `standings[].outReason` | `"ELIMINATED"` \| `"KNOCKED_OUT"` \| `"LEFT"` \| `null`              | No       | Yes      |                                                                                    |
| `standings[].kills`     | integer                                                              | No       | No       |                                                                                    |
| `standings[].score`     | integer                                                              | No       | No       |                                                                                    |

## EventWinner

| Field path | Type    | Required | Nullable | Constraints and description |
| ---------- | ------- | -------- | -------- | --------------------------- |
| `username` | string  | No       | No       |                             |
| `wins`     | integer | No       | No       |                             |
| `podiums`  | integer | No       | No       |                             |
| `played`   | integer | No       | No       |                             |

## EventType

| Field path      | Type    | Required | Nullable | Constraints and description         |
| --------------- | ------- | -------- | -------- | ----------------------------------- |
| `type`          | string  | No       | No       | example: `"SPLEEF"`                 |
| `name`          | string  | No       | No       | example: `"Spleef"`                 |
| `events`        | integer | No       | No       |                                     |
| `lastStartedAt` | integer | No       | No       | format: `int64`; Epoch milliseconds |

## PlayerEvents

| Field path                 | Type                                        | Required | Nullable | Constraints and description         |
| -------------------------- | ------------------------------------------- | -------- | -------- | ----------------------------------- |
| `summary`                  | object                                      | No       | No       |                                     |
| `summary.played`           | integer                                     | No       | No       |                                     |
| `summary.wins`             | integer                                     | No       | No       |                                     |
| `summary.podiums`          | integer                                     | No       | No       |                                     |
| `summary.bestPlacement`    | integer or null                             | No       | Yes      |                                     |
| `events`                   | object[]                                    | No       | No       |                                     |
| `events[].event`           | [`EventSummary`](./schemas#eventsummary)    | No       | No       |                                     |
| `events[].event.id`        | string                                      | No       | No       | format: `uuid`                      |
| `events[].event.type`      | string                                      | No       | No       | example: `"SPLEEF"`                 |
| `events[].event.name`      | string                                      | No       | No       | example: `"Spleef"`                 |
| `events[].event.map`       | string                                      | No       | No       | example: `"greek"`                  |
| `events[].event.mapName`   | string                                      | No       | No       | example: `"Greek"`                  |
| `events[].event.teamSize`  | integer                                     | No       | No       | example: `1`                        |
| `events[].event.startedAt` | integer                                     | No       | No       | format: `int64`; Epoch milliseconds |
| `events[].event.endedAt`   | integer                                     | No       | No       | format: `int64`; Epoch milliseconds |
| `events[].event.outcome`   | `"WIN"` \| `"NO_WINNER"` \| `"FORCE_ENDED"` | No       | No       |                                     |
| `events[].event.players`   | integer                                     | No       | No       | example: `143`                      |
| `events[].event.winners`   | string[]                                    | No       | No       | example: `["Wrath"]`                |
| `events[].placement`       | integer                                     | No       | No       |                                     |
| `events[].winner`          | boolean                                     | No       | No       |                                     |
| `events[].kills`           | integer                                     | No       | No       |                                     |
| `events[].score`           | integer                                     | No       | No       |                                     |
| `events[].outReason`       | string or null                              | No       | Yes      |                                     |

## Consumable

| Field path | Type    | Required | Nullable | Constraints and description |
| ---------- | ------- | -------- | -------- | --------------------------- |
| `id`       | string  | No       | No       | example: `"GoldenHead"`     |
| `name`     | string  | No       | No       | example: `"Golden Head"`    |
| `count`    | integer | No       | No       | example: `2`                |

## Count

| Field path | Type    | Required | Nullable | Constraints and description |
| ---------- | ------- | -------- | -------- | --------------------------- |
| `key`      | string  | No       | No       | example: `"DIAMOND_SWORD"`  |
| `count`    | integer | No       | No       | example: `289`              |

## GearPiece

| Field path | Type                    | Required | Nullable | Constraints and description |
| ---------- | ----------------------- | -------- | -------- | --------------------------- |
| `type`     | string                  | No       | No       | example: `"DIAMOND_SWORD"`  |
| `ench`     | Record<string, integer> | No       | No       | example: `{"Sharpness":5}`  |
| `ench.*`   | integer                 | No       | No       |                             |
| `set`      | string                  | No       | No       | Bonus gear set              |
| `kit`      | string                  | No       | No       | example: `"kit:Knight"`     |
| `scrolls`  | string[]                | No       | No       |                             |
| `extra`    | Record<string, number>  | No       | No       |                             |
| `extra.*`  | number                  | No       | No       |                             |

## FightSide

| Field path               | Type                                                       | Required | Nullable | Constraints and description                                                                       |
| ------------------------ | ---------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| `username`               | string or null                                             | No       | Yes      | Null when their stats are private                                                                 |
| `rank`                   | string or null                                             | No       | Yes      | example: `"Baron"`                                                                                |
| `elo`                    | integer or null                                            | No       | Yes      | Null where the mode has no rating                                                                 |
| `sets`                   | string[]                                                   | No       | No       | example: `["kit:Knight"]`                                                                         |
| `weapon`                 | string or null                                             | No       | Yes      | example: `"DIAMOND_SWORD"`; What they held: a material, `kit:<kit>:<material>` or a bonus item id |
| `loadout`                | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear at the kill                                                          |
| `loadout.*`              | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `loadout.*.type`         | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `loadout.*.ench`         | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `loadout.*.ench.*`       | integer                                                    | No       | No       |                                                                                                   |
| `loadout.*.set`          | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `loadout.*.kit`          | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `loadout.*.scrolls`      | string[]                                                   | No       | No       |                                                                                                   |
| `loadout.*.extra`        | Record<string, number>                                     | No       | No       |                                                                                                   |
| `loadout.*.extra.*`      | number                                                     | No       | No       |                                                                                                   |
| `consumables`            | [`Consumable`](./schemas#consumable)[]                     | No       | No       | What they used during the fight                                                                   |
| `consumables[].id`       | string                                                     | No       | No       | example: `"GoldenHead"`                                                                           |
| `consumables[].name`     | string                                                     | No       | No       | example: `"Golden Head"`                                                                          |
| `consumables[].count`    | integer                                                    | No       | No       | example: `2`                                                                                      |
| `startLoadout`           | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear when the fight began                                                 |
| `startLoadout.*`         | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `startLoadout.*.type`    | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `startLoadout.*.ench`    | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `startLoadout.*.ench.*`  | integer                                                    | No       | No       |                                                                                                   |
| `startLoadout.*.set`     | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `startLoadout.*.kit`     | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `startLoadout.*.scrolls` | string[]                                                   | No       | No       |                                                                                                   |
| `startLoadout.*.extra`   | Record<string, number>                                     | No       | No       |                                                                                                   |
| `startLoadout.*.extra.*` | number                                                     | No       | No       |                                                                                                   |

## Fight

| Field path                      | Type                                                       | Required | Nullable | Constraints and description                                                                       |
| ------------------------------- | ---------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| `id`                            | string                                                     | No       | No       | example: `"1793201854084.a03adfb5-5041-40ec-b879-03a4be0f672c"`                                   |
| `time`                          | integer                                                    | No       | No       | format: `int64`; Epoch milliseconds                                                               |
| `mode`                          | string                                                     | No       | No       | example: `"KitPvP"`                                                                               |
| `server`                        | string or null                                             | No       | Yes      | example: `"pika-kitpvp"`                                                                          |
| `killType`                      | `"melee"` \| `"projectile"` \| `"other"`                   | No       | No       |                                                                                                   |
| `cause`                         | string or null                                             | No       | Yes      | example: `"ENTITY_ATTACK"`; Damage cause of the killing blow                                      |
| `duration`                      | integer or null                                            | No       | Yes      | example: `11900`; Ms from when both sides were in combat to the kill                              |
| `weapon`                        | object or null                                             | No       | Yes      |                                                                                                   |
| `weapon.item`                   | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `weapon.enchants`               | Record<string, integer>                                    | No       | No       |                                                                                                   |
| `weapon.enchants.*`             | integer                                                    | No       | No       |                                                                                                   |
| `winner`                        | [`FightSide`](./schemas#fightside)                         | No       | No       |                                                                                                   |
| `winner.username`               | string or null                                             | No       | Yes      | Null when their stats are private                                                                 |
| `winner.rank`                   | string or null                                             | No       | Yes      | example: `"Baron"`                                                                                |
| `winner.elo`                    | integer or null                                            | No       | Yes      | Null where the mode has no rating                                                                 |
| `winner.sets`                   | string[]                                                   | No       | No       | example: `["kit:Knight"]`                                                                         |
| `winner.weapon`                 | string or null                                             | No       | Yes      | example: `"DIAMOND_SWORD"`; What they held: a material, `kit:<kit>:<material>` or a bonus item id |
| `winner.loadout`                | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear at the kill                                                          |
| `winner.loadout.*`              | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `winner.loadout.*.type`         | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `winner.loadout.*.ench`         | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `winner.loadout.*.ench.*`       | integer                                                    | No       | No       |                                                                                                   |
| `winner.loadout.*.set`          | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `winner.loadout.*.kit`          | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `winner.loadout.*.scrolls`      | string[]                                                   | No       | No       |                                                                                                   |
| `winner.loadout.*.extra`        | Record<string, number>                                     | No       | No       |                                                                                                   |
| `winner.loadout.*.extra.*`      | number                                                     | No       | No       |                                                                                                   |
| `winner.consumables`            | [`Consumable`](./schemas#consumable)[]                     | No       | No       | What they used during the fight                                                                   |
| `winner.consumables[].id`       | string                                                     | No       | No       | example: `"GoldenHead"`                                                                           |
| `winner.consumables[].name`     | string                                                     | No       | No       | example: `"Golden Head"`                                                                          |
| `winner.consumables[].count`    | integer                                                    | No       | No       | example: `2`                                                                                      |
| `winner.startLoadout`           | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear when the fight began                                                 |
| `winner.startLoadout.*`         | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `winner.startLoadout.*.type`    | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `winner.startLoadout.*.ench`    | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `winner.startLoadout.*.ench.*`  | integer                                                    | No       | No       |                                                                                                   |
| `winner.startLoadout.*.set`     | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `winner.startLoadout.*.kit`     | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `winner.startLoadout.*.scrolls` | string[]                                                   | No       | No       |                                                                                                   |
| `winner.startLoadout.*.extra`   | Record<string, number>                                     | No       | No       |                                                                                                   |
| `winner.startLoadout.*.extra.*` | number                                                     | No       | No       |                                                                                                   |
| `loser`                         | [`FightSide`](./schemas#fightside)                         | No       | No       |                                                                                                   |
| `loser.username`                | string or null                                             | No       | Yes      | Null when their stats are private                                                                 |
| `loser.rank`                    | string or null                                             | No       | Yes      | example: `"Baron"`                                                                                |
| `loser.elo`                     | integer or null                                            | No       | Yes      | Null where the mode has no rating                                                                 |
| `loser.sets`                    | string[]                                                   | No       | No       | example: `["kit:Knight"]`                                                                         |
| `loser.weapon`                  | string or null                                             | No       | Yes      | example: `"DIAMOND_SWORD"`; What they held: a material, `kit:<kit>:<material>` or a bonus item id |
| `loser.loadout`                 | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear at the kill                                                          |
| `loser.loadout.*`               | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `loser.loadout.*.type`          | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `loser.loadout.*.ench`          | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `loser.loadout.*.ench.*`        | integer                                                    | No       | No       |                                                                                                   |
| `loser.loadout.*.set`           | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `loser.loadout.*.kit`           | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `loser.loadout.*.scrolls`       | string[]                                                   | No       | No       |                                                                                                   |
| `loser.loadout.*.extra`         | Record<string, number>                                     | No       | No       |                                                                                                   |
| `loser.loadout.*.extra.*`       | number                                                     | No       | No       |                                                                                                   |
| `loser.consumables`             | [`Consumable`](./schemas#consumable)[]                     | No       | No       | What they used during the fight                                                                   |
| `loser.consumables[].id`        | string                                                     | No       | No       | example: `"GoldenHead"`                                                                           |
| `loser.consumables[].name`      | string                                                     | No       | No       | example: `"Golden Head"`                                                                          |
| `loser.consumables[].count`     | integer                                                    | No       | No       | example: `2`                                                                                      |
| `loser.startLoadout`            | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear when the fight began                                                 |
| `loser.startLoadout.*`          | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `loser.startLoadout.*.type`     | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `loser.startLoadout.*.ench`     | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `loser.startLoadout.*.ench.*`   | integer                                                    | No       | No       |                                                                                                   |
| `loser.startLoadout.*.set`      | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `loser.startLoadout.*.kit`      | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `loser.startLoadout.*.scrolls`  | string[]                                                   | No       | No       |                                                                                                   |
| `loser.startLoadout.*.extra`    | Record<string, number>                                     | No       | No       |                                                                                                   |
| `loser.startLoadout.*.extra.*`  | number                                                     | No       | No       |                                                                                                   |

## FightDetail

| Field path                            | Type                                                       | Required | Nullable | Constraints and description                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `fight`                               | [`Fight`](./schemas#fight)                                 | No       | No       |                                                                                                                             |
| `fight.id`                            | string                                                     | No       | No       | example: `"1793201854084.a03adfb5-5041-40ec-b879-03a4be0f672c"`                                                             |
| `fight.time`                          | integer                                                    | No       | No       | format: `int64`; Epoch milliseconds                                                                                         |
| `fight.mode`                          | string                                                     | No       | No       | example: `"KitPvP"`                                                                                                         |
| `fight.server`                        | string or null                                             | No       | Yes      | example: `"pika-kitpvp"`                                                                                                    |
| `fight.killType`                      | `"melee"` \| `"projectile"` \| `"other"`                   | No       | No       |                                                                                                                             |
| `fight.cause`                         | string or null                                             | No       | Yes      | example: `"ENTITY_ATTACK"`; Damage cause of the killing blow                                                                |
| `fight.duration`                      | integer or null                                            | No       | Yes      | example: `11900`; Ms from when both sides were in combat to the kill                                                        |
| `fight.weapon`                        | object or null                                             | No       | Yes      |                                                                                                                             |
| `fight.weapon.item`                   | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                                                  |
| `fight.weapon.enchants`               | Record<string, integer>                                    | No       | No       |                                                                                                                             |
| `fight.weapon.enchants.*`             | integer                                                    | No       | No       |                                                                                                                             |
| `fight.winner`                        | [`FightSide`](./schemas#fightside)                         | No       | No       |                                                                                                                             |
| `fight.winner.username`               | string or null                                             | No       | Yes      | Null when their stats are private                                                                                           |
| `fight.winner.rank`                   | string or null                                             | No       | Yes      | example: `"Baron"`                                                                                                          |
| `fight.winner.elo`                    | integer or null                                            | No       | Yes      | Null where the mode has no rating                                                                                           |
| `fight.winner.sets`                   | string[]                                                   | No       | No       | example: `["kit:Knight"]`                                                                                                   |
| `fight.winner.weapon`                 | string or null                                             | No       | Yes      | example: `"DIAMOND_SWORD"`; What they held: a material, `kit:<kit>:<material>` or a bonus item id                           |
| `fight.winner.loadout`                | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear at the kill                                                                                    |
| `fight.winner.loadout.*`              | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                                             |
| `fight.winner.loadout.*.type`         | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                                                  |
| `fight.winner.loadout.*.ench`         | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                                                  |
| `fight.winner.loadout.*.ench.*`       | integer                                                    | No       | No       |                                                                                                                             |
| `fight.winner.loadout.*.set`          | string                                                     | No       | No       | Bonus gear set                                                                                                              |
| `fight.winner.loadout.*.kit`          | string                                                     | No       | No       | example: `"kit:Knight"`                                                                                                     |
| `fight.winner.loadout.*.scrolls`      | string[]                                                   | No       | No       |                                                                                                                             |
| `fight.winner.loadout.*.extra`        | Record<string, number>                                     | No       | No       |                                                                                                                             |
| `fight.winner.loadout.*.extra.*`      | number                                                     | No       | No       |                                                                                                                             |
| `fight.winner.consumables`            | [`Consumable`](./schemas#consumable)[]                     | No       | No       | What they used during the fight                                                                                             |
| `fight.winner.consumables[].id`       | string                                                     | No       | No       | example: `"GoldenHead"`                                                                                                     |
| `fight.winner.consumables[].name`     | string                                                     | No       | No       | example: `"Golden Head"`                                                                                                    |
| `fight.winner.consumables[].count`    | integer                                                    | No       | No       | example: `2`                                                                                                                |
| `fight.winner.startLoadout`           | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear when the fight began                                                                           |
| `fight.winner.startLoadout.*`         | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                                             |
| `fight.winner.startLoadout.*.type`    | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                                                  |
| `fight.winner.startLoadout.*.ench`    | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                                                  |
| `fight.winner.startLoadout.*.ench.*`  | integer                                                    | No       | No       |                                                                                                                             |
| `fight.winner.startLoadout.*.set`     | string                                                     | No       | No       | Bonus gear set                                                                                                              |
| `fight.winner.startLoadout.*.kit`     | string                                                     | No       | No       | example: `"kit:Knight"`                                                                                                     |
| `fight.winner.startLoadout.*.scrolls` | string[]                                                   | No       | No       |                                                                                                                             |
| `fight.winner.startLoadout.*.extra`   | Record<string, number>                                     | No       | No       |                                                                                                                             |
| `fight.winner.startLoadout.*.extra.*` | number                                                     | No       | No       |                                                                                                                             |
| `fight.loser`                         | [`FightSide`](./schemas#fightside)                         | No       | No       |                                                                                                                             |
| `fight.loser.username`                | string or null                                             | No       | Yes      | Null when their stats are private                                                                                           |
| `fight.loser.rank`                    | string or null                                             | No       | Yes      | example: `"Baron"`                                                                                                          |
| `fight.loser.elo`                     | integer or null                                            | No       | Yes      | Null where the mode has no rating                                                                                           |
| `fight.loser.sets`                    | string[]                                                   | No       | No       | example: `["kit:Knight"]`                                                                                                   |
| `fight.loser.weapon`                  | string or null                                             | No       | Yes      | example: `"DIAMOND_SWORD"`; What they held: a material, `kit:<kit>:<material>` or a bonus item id                           |
| `fight.loser.loadout`                 | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear at the kill                                                                                    |
| `fight.loser.loadout.*`               | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                                             |
| `fight.loser.loadout.*.type`          | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                                                  |
| `fight.loser.loadout.*.ench`          | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                                                  |
| `fight.loser.loadout.*.ench.*`        | integer                                                    | No       | No       |                                                                                                                             |
| `fight.loser.loadout.*.set`           | string                                                     | No       | No       | Bonus gear set                                                                                                              |
| `fight.loser.loadout.*.kit`           | string                                                     | No       | No       | example: `"kit:Knight"`                                                                                                     |
| `fight.loser.loadout.*.scrolls`       | string[]                                                   | No       | No       |                                                                                                                             |
| `fight.loser.loadout.*.extra`         | Record<string, number>                                     | No       | No       |                                                                                                                             |
| `fight.loser.loadout.*.extra.*`       | number                                                     | No       | No       |                                                                                                                             |
| `fight.loser.consumables`             | [`Consumable`](./schemas#consumable)[]                     | No       | No       | What they used during the fight                                                                                             |
| `fight.loser.consumables[].id`        | string                                                     | No       | No       | example: `"GoldenHead"`                                                                                                     |
| `fight.loser.consumables[].name`      | string                                                     | No       | No       | example: `"Golden Head"`                                                                                                    |
| `fight.loser.consumables[].count`     | integer                                                    | No       | No       | example: `2`                                                                                                                |
| `fight.loser.startLoadout`            | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear when the fight began                                                                           |
| `fight.loser.startLoadout.*`          | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                                             |
| `fight.loser.startLoadout.*.type`     | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                                                  |
| `fight.loser.startLoadout.*.ench`     | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                                                  |
| `fight.loser.startLoadout.*.ench.*`   | integer                                                    | No       | No       |                                                                                                                             |
| `fight.loser.startLoadout.*.set`      | string                                                     | No       | No       | Bonus gear set                                                                                                              |
| `fight.loser.startLoadout.*.kit`      | string                                                     | No       | No       | example: `"kit:Knight"`                                                                                                     |
| `fight.loser.startLoadout.*.scrolls`  | string[]                                                   | No       | No       |                                                                                                                             |
| `fight.loser.startLoadout.*.extra`    | Record<string, number>                                     | No       | No       |                                                                                                                             |
| `fight.loser.startLoadout.*.extra.*`  | number                                                     | No       | No       |                                                                                                                             |
| `items`                               | Record<string, object>                                     | No       | No       | In-game name and lore of each bonus piece, by `<set>:<slot>`                                                                |
| `items.*`                             | object                                                     | No       | No       |                                                                                                                             |
| `items.*.name`                        | string                                                     | No       | No       |                                                                                                                             |
| `items.*.lore`                        | string[]                                                   | No       | No       |                                                                                                                             |
| `items.*.material`                    | string or null                                             | No       | Yes      |                                                                                                                             |
| `indexable`                           | boolean                                                    | No       | No       | False for a fight on a development or testing server: it answers by its id (with `X-Robots-Tag: noindex`) but is in no list |

## PlayerFights

| Field path                                     | Type                                                       | Required | Nullable | Constraints and description                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| `days`                                         | integer                                                    | No       | No       |                                                                                                   |
| `kills`                                        | integer                                                    | No       | No       | example: `336`                                                                                    |
| `deaths`                                       | integer                                                    | No       | No       | example: `72`                                                                                     |
| `bestStreak`                                   | integer                                                    | No       | No       | example: `60`; Most kills in a row without dying                                                  |
| `streak`                                       | integer                                                    | No       | No       | example: `5`; The run going on now                                                                |
| `recent`                                       | object[]                                                   | No       | No       |                                                                                                   |
| `recent[].fight`                               | [`Fight`](./schemas#fight)                                 | No       | No       |                                                                                                   |
| `recent[].fight.id`                            | string                                                     | No       | No       | example: `"1793201854084.a03adfb5-5041-40ec-b879-03a4be0f672c"`                                   |
| `recent[].fight.time`                          | integer                                                    | No       | No       | format: `int64`; Epoch milliseconds                                                               |
| `recent[].fight.mode`                          | string                                                     | No       | No       | example: `"KitPvP"`                                                                               |
| `recent[].fight.server`                        | string or null                                             | No       | Yes      | example: `"pika-kitpvp"`                                                                          |
| `recent[].fight.killType`                      | `"melee"` \| `"projectile"` \| `"other"`                   | No       | No       |                                                                                                   |
| `recent[].fight.cause`                         | string or null                                             | No       | Yes      | example: `"ENTITY_ATTACK"`; Damage cause of the killing blow                                      |
| `recent[].fight.duration`                      | integer or null                                            | No       | Yes      | example: `11900`; Ms from when both sides were in combat to the kill                              |
| `recent[].fight.weapon`                        | object or null                                             | No       | Yes      |                                                                                                   |
| `recent[].fight.weapon.item`                   | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `recent[].fight.weapon.enchants`               | Record<string, integer>                                    | No       | No       |                                                                                                   |
| `recent[].fight.weapon.enchants.*`             | integer                                                    | No       | No       |                                                                                                   |
| `recent[].fight.winner`                        | [`FightSide`](./schemas#fightside)                         | No       | No       |                                                                                                   |
| `recent[].fight.winner.username`               | string or null                                             | No       | Yes      | Null when their stats are private                                                                 |
| `recent[].fight.winner.rank`                   | string or null                                             | No       | Yes      | example: `"Baron"`                                                                                |
| `recent[].fight.winner.elo`                    | integer or null                                            | No       | Yes      | Null where the mode has no rating                                                                 |
| `recent[].fight.winner.sets`                   | string[]                                                   | No       | No       | example: `["kit:Knight"]`                                                                         |
| `recent[].fight.winner.weapon`                 | string or null                                             | No       | Yes      | example: `"DIAMOND_SWORD"`; What they held: a material, `kit:<kit>:<material>` or a bonus item id |
| `recent[].fight.winner.loadout`                | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear at the kill                                                          |
| `recent[].fight.winner.loadout.*`              | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `recent[].fight.winner.loadout.*.type`         | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `recent[].fight.winner.loadout.*.ench`         | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `recent[].fight.winner.loadout.*.ench.*`       | integer                                                    | No       | No       |                                                                                                   |
| `recent[].fight.winner.loadout.*.set`          | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `recent[].fight.winner.loadout.*.kit`          | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `recent[].fight.winner.loadout.*.scrolls`      | string[]                                                   | No       | No       |                                                                                                   |
| `recent[].fight.winner.loadout.*.extra`        | Record<string, number>                                     | No       | No       |                                                                                                   |
| `recent[].fight.winner.loadout.*.extra.*`      | number                                                     | No       | No       |                                                                                                   |
| `recent[].fight.winner.consumables`            | [`Consumable`](./schemas#consumable)[]                     | No       | No       | What they used during the fight                                                                   |
| `recent[].fight.winner.consumables[].id`       | string                                                     | No       | No       | example: `"GoldenHead"`                                                                           |
| `recent[].fight.winner.consumables[].name`     | string                                                     | No       | No       | example: `"Golden Head"`                                                                          |
| `recent[].fight.winner.consumables[].count`    | integer                                                    | No       | No       | example: `2`                                                                                      |
| `recent[].fight.winner.startLoadout`           | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear when the fight began                                                 |
| `recent[].fight.winner.startLoadout.*`         | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `recent[].fight.winner.startLoadout.*.type`    | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `recent[].fight.winner.startLoadout.*.ench`    | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `recent[].fight.winner.startLoadout.*.ench.*`  | integer                                                    | No       | No       |                                                                                                   |
| `recent[].fight.winner.startLoadout.*.set`     | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `recent[].fight.winner.startLoadout.*.kit`     | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `recent[].fight.winner.startLoadout.*.scrolls` | string[]                                                   | No       | No       |                                                                                                   |
| `recent[].fight.winner.startLoadout.*.extra`   | Record<string, number>                                     | No       | No       |                                                                                                   |
| `recent[].fight.winner.startLoadout.*.extra.*` | number                                                     | No       | No       |                                                                                                   |
| `recent[].fight.loser`                         | [`FightSide`](./schemas#fightside)                         | No       | No       |                                                                                                   |
| `recent[].fight.loser.username`                | string or null                                             | No       | Yes      | Null when their stats are private                                                                 |
| `recent[].fight.loser.rank`                    | string or null                                             | No       | Yes      | example: `"Baron"`                                                                                |
| `recent[].fight.loser.elo`                     | integer or null                                            | No       | Yes      | Null where the mode has no rating                                                                 |
| `recent[].fight.loser.sets`                    | string[]                                                   | No       | No       | example: `["kit:Knight"]`                                                                         |
| `recent[].fight.loser.weapon`                  | string or null                                             | No       | Yes      | example: `"DIAMOND_SWORD"`; What they held: a material, `kit:<kit>:<material>` or a bonus item id |
| `recent[].fight.loser.loadout`                 | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear at the kill                                                          |
| `recent[].fight.loser.loadout.*`               | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `recent[].fight.loser.loadout.*.type`          | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `recent[].fight.loser.loadout.*.ench`          | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `recent[].fight.loser.loadout.*.ench.*`        | integer                                                    | No       | No       |                                                                                                   |
| `recent[].fight.loser.loadout.*.set`           | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `recent[].fight.loser.loadout.*.kit`           | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `recent[].fight.loser.loadout.*.scrolls`       | string[]                                                   | No       | No       |                                                                                                   |
| `recent[].fight.loser.loadout.*.extra`         | Record<string, number>                                     | No       | No       |                                                                                                   |
| `recent[].fight.loser.loadout.*.extra.*`       | number                                                     | No       | No       |                                                                                                   |
| `recent[].fight.loser.consumables`             | [`Consumable`](./schemas#consumable)[]                     | No       | No       | What they used during the fight                                                                   |
| `recent[].fight.loser.consumables[].id`        | string                                                     | No       | No       | example: `"GoldenHead"`                                                                           |
| `recent[].fight.loser.consumables[].name`      | string                                                     | No       | No       | example: `"Golden Head"`                                                                          |
| `recent[].fight.loser.consumables[].count`     | integer                                                    | No       | No       | example: `2`                                                                                      |
| `recent[].fight.loser.startLoadout`            | Record<string, [`GearPiece`](./schemas#gearpiece)> or null | No       | Yes      | Fight pages only: their gear when the fight began                                                 |
| `recent[].fight.loser.startLoadout.*`          | [`GearPiece`](./schemas#gearpiece)                         | No       | No       |                                                                                                   |
| `recent[].fight.loser.startLoadout.*.type`     | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `recent[].fight.loser.startLoadout.*.ench`     | Record<string, integer>                                    | No       | No       | example: `{"Sharpness":5}`                                                                        |
| `recent[].fight.loser.startLoadout.*.ench.*`   | integer                                                    | No       | No       |                                                                                                   |
| `recent[].fight.loser.startLoadout.*.set`      | string                                                     | No       | No       | Bonus gear set                                                                                    |
| `recent[].fight.loser.startLoadout.*.kit`      | string                                                     | No       | No       | example: `"kit:Knight"`                                                                           |
| `recent[].fight.loser.startLoadout.*.scrolls`  | string[]                                                   | No       | No       |                                                                                                   |
| `recent[].fight.loser.startLoadout.*.extra`    | Record<string, number>                                     | No       | No       |                                                                                                   |
| `recent[].fight.loser.startLoadout.*.extra.*`  | number                                                     | No       | No       |                                                                                                   |
| `recent[].won`                                 | boolean                                                    | No       | No       |                                                                                                   |
| `opponents`                                    | object[]                                                   | No       | No       | Head to head with the players met most                                                            |
| `opponents[].username`                         | string                                                     | No       | No       |                                                                                                   |
| `opponents[].kills`                            | integer                                                    | No       | No       |                                                                                                   |
| `opponents[].deaths`                           | integer                                                    | No       | No       |                                                                                                   |
| `weapons`                                      | [`Count`](./schemas#count)[]                               | No       | No       |                                                                                                   |
| `weapons[].key`                                | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `weapons[].count`                              | integer                                                    | No       | No       | example: `289`                                                                                    |
| `consumables`                                  | [`Consumable`](./schemas#consumable)[]                     | No       | No       |                                                                                                   |
| `consumables[].id`                             | string                                                     | No       | No       | example: `"GoldenHead"`                                                                           |
| `consumables[].name`                           | string                                                     | No       | No       | example: `"Golden Head"`                                                                          |
| `consumables[].count`                          | integer                                                    | No       | No       | example: `2`                                                                                      |
| `deathsBy`                                     | [`Count`](./schemas#count)[]                               | No       | No       | Deaths with no player killer, by damage cause                                                     |
| `deathsBy[].key`                               | string                                                     | No       | No       | example: `"DIAMOND_SWORD"`                                                                        |
| `deathsBy[].count`                             | integer                                                    | No       | No       | example: `289`                                                                                    |
| `modes`                                        | object[]                                                   | No       | No       |                                                                                                   |
| `modes[].mode`                                 | string                                                     | No       | No       |                                                                                                   |
| `modes[].kills`                                | integer                                                    | No       | No       |                                                                                                   |
| `modes[].deaths`                               | integer                                                    | No       | No       |                                                                                                   |

## ModeFights

| Field path            | Type                                   | Required | Nullable | Constraints and description |
| --------------------- | -------------------------------------- | -------- | -------- | --------------------------- |
| `hours`               | integer                                | No       | No       |                             |
| `kills`               | integer                                | No       | No       | example: `5017`             |
| `medianDuration`      | integer or null                        | No       | Yes      | example: `9452`; Ms         |
| `killers`             | object[]                               | No       | No       |                             |
| `killers[].username`  | string                                 | No       | No       |                             |
| `killers[].kills`     | integer                                | No       | No       |                             |
| `weapons`             | [`Count`](./schemas#count)[]           | No       | No       |                             |
| `weapons[].key`       | string                                 | No       | No       | example: `"DIAMOND_SWORD"`  |
| `weapons[].count`     | integer                                | No       | No       | example: `289`              |
| `sets`                | object[]                               | No       | No       |                             |
| `sets[].set`          | string                                 | No       | No       | example: `"elderflame"`     |
| `sets[].kills`        | integer                                | No       | No       |                             |
| `sets[].worn`         | integer                                | No       | No       |                             |
| `consumables`         | [`Consumable`](./schemas#consumable)[] | No       | No       |                             |
| `consumables[].id`    | string                                 | No       | No       | example: `"GoldenHead"`     |
| `consumables[].name`  | string                                 | No       | No       | example: `"Golden Head"`    |
| `consumables[].count` | integer                                | No       | No       | example: `2`                |
| `causes`              | [`Count`](./schemas#count)[]           | No       | No       |                             |
| `causes[].key`        | string                                 | No       | No       | example: `"DIAMOND_SWORD"`  |
| `causes[].count`      | integer                                | No       | No       | example: `289`              |

---

Generated from the [official OpenAPI JSON](/pika-network-openapi.json).
