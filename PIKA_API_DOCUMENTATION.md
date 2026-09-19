# PikaNetwork Stats API

Unofficial reference for `stats.pika-network.net`'s public HTTP API. No specification is published upstream; every entry here is crawl-verified or explicitly marked as inferred.

Consuming this from TypeScript: use `PikaNetworkClient`, not this document directly. Start at [`docs/guide/getting-started.md`](docs/guide/getting-started.md). A browsable, generated version of this same reference, including the full gamemode catalog, is published at the [documentation site](docs/pika-network-api/overview.md) (`npm run docs:dev`).

## Base URL

```text
https://stats.pika-network.net/api
```

## Auth

**None.** No API key, no token, no per-key quota. Rate-limited by IP only.

## Content type

| Endpoint           | Content-Type       |
| ------------------ | ------------------ |
| all except `/ping` | `application/json` |
| `/ping`            | `text/plain`       |

## Numeric encoding

**Quirk:** numeric fields are not consistently typed.

| Encoding       | Example                      | Where                                  |
| -------------- | ---------------------------- | -------------------------------------- |
| JSON `number`  | `4377967`                    | `/leaderboards/total`, most fields     |
| numeric string | `"5158777955980.7333984375"` | `/leaderboards` `value`, some balances |

Coerce both to `number` at the parse boundary.

## Status code contract

Implemented in `src/client/http/status.ts`:

| Status | Body       | Meaning                                               |
| ------ | ---------- | ----------------------------------------------------- |
| `200`  | JSON       | success                                               |
| `204`  | empty      | valid request, no data for this gamemode/mode         |
| `404`  | empty      | entity does not exist (player, clan, recap)           |
| `404`  | JSON error | route unmapped                                        |
| `400`  | JSON error | invalid gamemode / mode / stat / interval combination |
| `429`  | JSON error | rate limited                                          |
| `5xx`  | varies     | upstream / edge failure                               |

`204` is not an error. Handle as an empty result.

## Rate limits

**Undocumented upstream.** No `RateLimit-*` or `Retry-After` response headers. This package defaults to **350 req/s, burst 16**, derived from load testing, not a published SLA. See [Rate Limiting guide](docs/guide/rate-limiting.md).

## Endpoints

| Endpoint                                            | Method | Description              |
| --------------------------------------------------- | ------ | ------------------------ |
| [`/leaderboards`](#leaderboards)                    | `GET`  | paginated global ranking |
| [`/leaderboards/total`](#totals)                    | `GET`  | server-wide aggregate    |
| [`/profile/{username}`](#profile)                   | `GET`  | account profile          |
| [`/profile/{username}/leaderboard`](#profile-stats) | `GET`  | per-player stats         |
| [`/clans/{clanName}`](#clans)                       | `GET`  | clan profile             |
| [`/recaps/{gameId}`](#match-recaps)                 | `GET`  | match recap              |
| [`/ping`](#ping)                                    | `GET`  | liveness check           |

---

## Leaderboards

`GET /leaderboards`

Global paginated ranking for one stat, one gamemode, one mode.

| Parameter  | Type     | Required     | Description                                                     |
| ---------- | -------- | ------------ | --------------------------------------------------------------- |
| `type`     | `string` | **required** | gamemode id, see [catalog](#gamemode-catalog)                   |
| `stat`     | `string` | **required** | raw stat key, case-sensitive, mixed-case (`kills`, `BOW_KILLS`) |
| `mode`     | `string` | recommended  | not crawled without this param; unconfirmed if omittable        |
| `interval` | `string` | optional     | `total` \| `weekly` \| `monthly` \| `yearly`, default `total`   |
| `offset`   | `number` | optional     | zero-indexed, default `0`                                       |
| `limit`    | `number` | optional     | requested page size, **hard-capped at 15** server-side          |

`interval=yearly` valid only for gamemodes marked yearly-capable in the [catalog](#gamemode-catalog). Other gamemodes: `200` with empty result, not `400`.

Response `200`:

```jsonc
{
  "metadata": { "total": 4385375 },
  "entries": [
    { "place": 1, "value": "102939", "id": "divena", "clan": "Elite" },
    { "place": 7, "value": "74712", "id": "SUGARCANDYSC" },
  ],
}
```

| Field             | Type              | Notes                                                     |
| ----------------- | ----------------- | --------------------------------------------------------- |
| `metadata.total`  | `number`          | total players tracked for this stat, not page size        |
| `entries`         | `Entry[] \| null` | `null` observed in place of `[]` in some cases            |
| `entries[].place` | `number`          | 1-indexed, absolute rank                                  |
| `entries[].value` | `string`          | numeric string, see [numeric encoding](#numeric-encoding) |
| `entries[].id`    | `string`          | player username                                           |
| `entries[].clan`  | `string`          | optional, omitted (not `null`) when absent                |
| `entries[].rank`  | `string`          | optional, omitted when absent                             |

Example:

```text
GET /leaderboards?type=bedwars&stat=kills&interval=total&mode=ALL_MODES&offset=0&limit=15
```

Errors: `400` for invalid `type`, invalid `stat` for `type`, invalid `mode` for `type`, or a `stat` valid for `type` overall but not for the requested `mode`. No `404` case; the route always resolves.

## Totals

`GET /leaderboards/total`

Server-wide aggregate per stat, for one gamemode. Not per-player, see [Profile Stats](#profile-stats).

| Parameter | Type     | Required     | Description                                                                      |
| --------- | -------- | ------------ | -------------------------------------------------------------------------------- |
| `type`    | `string` | **required** | gamemode id                                                                      |
| `mode`    | `string` | conditional  | required only for `pillars` (`Seasonal`); all other gamemodes crawled without it |

Response `200`, array not object:

```jsonc
[
  { "name": "Kills", "total": 4377967, "average": 135.88, "sum": 594879698 },
  { "name": "Wins", "total": 2129989, "average": 21.65, "sum": 46114542 },
]
```

| Field        | Type     | Notes                                                                                               |
| ------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `[].name`    | `string` | display name, matches the [catalog](#gamemode-catalog), not the raw `stat` key from `/leaderboards` |
| `[].total`   | `number` | players tracked for this stat                                                                       |
| `[].average` | `number` | mean across tracked players                                                                         |
| `[].sum`     | `number` | sum across tracked players                                                                          |

Numeric fields here are genuine JSON numbers, unlike `/leaderboards`.

Example: `GET /leaderboards/total?type=bedwars`

Errors: `400` for invalid or missing `type`. No `404` case.

## Profile

`GET /profile/{username}`

Account profile: rank, boosting flags, clan membership. Not gameplay stats, see [Profile Stats](#profile-stats).

| Parameter  | Type     | Required            | Description      |
| ---------- | -------- | ------------------- | ---------------- |
| `username` | `string` | **required** (path) | case-insensitive |

**Unverified schema.** Not covered by the query-parameter crawl. Field types below reflect the client's validation schema, which is deliberately permissive.

The response includes account metadata, donor ranks, optional clan details, and friend usernames. Additional fields are preserved by the client for forward compatibility.

| Field                                                                                        | Type                     | Notes                                  |
| -------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------- |
| `username`, `lastSeen`, `discord_verified`, `email_verified`, `boosting`, `discord_boosting` | scalar                   | all optional                           |
| `rank.level`, `rank.experience`, `rank.percentage`, `rank.rankDisplay`                       | scalar                   | all optional                           |
| `ranks`                                                                                      | `DonorRank[]`            | optional donor/server ranks            |
| `clan`                                                                                       | `{ name, tag } \| null`  | optional, nullable rather than omitted |
| `friends`                                                                                    | `{ username: string }[]` | optional                               |
| _(other fields)_                                                                             | `unknown`                | schema is passthrough                  |

Each donor rank can include `name`, `displayName`, `server`, `season`, and `expiry`.

Example: `GET /profile/resuns`. This document is static; for a live, real request against this exact URL, see [Profile](docs/pika-network-api/profile.md) on the documentation site.

Errors: `404` (empty body) for a nonexistent username. No `400` case.

## Profile Stats

`GET /profile/{username}/leaderboard`

Per-player rank and value across every stat for a gamemode/mode. Not [Profile](#profile), despite the shared prefix.

| Parameter  | Type     | Required             | Description                                  |
| ---------- | -------- | -------------------- | -------------------------------------------- |
| `username` | `string` | **required** (path)  | case-insensitive                             |
| `type`     | `string` | **required** (query) | gamemode id                                  |
| `mode`     | `string` | recommended (query)  | not crawled without this param               |
| `interval` | `string` | optional (query)     | same `yearly` restriction as `/leaderboards` |

**Key quirk.** Response `200` is an object keyed by the stat's **display name**, not the raw `stat` key used by `/leaderboards`. Sample below is a real response captured during the crawl, not a fabricated shape:

```jsonc
{
  "Kills": {
    "metadata": { "total": 4385375 },
    "entries": [{ "place": 1, "value": "102939", "id": "divena" }],
  },
  "Bow kills": {
    "metadata": { "total": 415379 },
    "entries": [{ "place": 2363, "value": "161", "id": "divena" }],
  },
}
```

For bedwars, the key is literally `"Bow kills"`, even though `/leaderboards` expects `stat=BOW_KILLS` for the same stat. See the [catalog](#gamemode-catalog) for the raw-to-display mapping for every gamemode.

Response `204`: player exists, no data for this gamemode/mode, empty body. Not an error.

```text
GET /profile/xloray/leaderboard?type=bedwars&interval=total&mode=DOUBLES
204 No Content
```

Example: `GET /profile/resuns/leaderboard?type=bedwars&interval=total&mode=ALL_MODES`. This document is static; for a live request against this exact URL, see [Profile Stats](docs/pika-network-api/profile-stats.md) on the documentation site.

| Status             | Condition                                      | Verified                                         |
| ------------------ | ---------------------------------------------- | ------------------------------------------------ |
| `204` (empty body) | valid request, no data for this gamemode/mode  | crawl-confirmed                                  |
| `400`              | invalid gamemode / mode / interval combination | inferred, by symmetry with `/leaderboards`       |
| `404` (empty body) | username does not exist                        | inferred, by symmetry with `/profile/{username}` |

## Clans

`GET /clans/{clanName}`

Clan profile: tag, trophies, creation date, member list.

| Parameter  | Type     | Required            | Description      |
| ---------- | -------- | ------------------- | ---------------- |
| `clanName` | `string` | **required** (path) | case-insensitive |

**Unverified schema.** Not covered by the crawl. Field types below reflect the validation schema.

| Field                                  | Type        | Notes                                        |
| -------------------------------------- | ----------- | -------------------------------------------- |
| `name`, `tag`, `trophies`, `createdAt` | scalar      | all optional                                 |
| `members`                              | `unknown[]` | optional, entries passed through unvalidated |
| _(other fields)_                       | `unknown`   | schema is passthrough                        |

Example: `GET /clans/THEBOIS`. This document is static; for a live, real request against this exact URL, see [Clans](docs/pika-network-api/clans.md) on the documentation site.

Errors: `404` (empty body) for a nonexistent clan. No `400` case.

## Match Recaps

`GET /recaps/{gameId}`

Summary of one completed match. Contents vary by gamemode.

| Parameter | Type     | Required            | Description             |
| --------- | -------- | ------------------- | ----------------------- |
| `gameId`  | `string` | **required** (path) | opaque match identifier |

**Open schema.** Response `200` is `Record<string, unknown>`. No fixed shape asserted; contents differ by gamemode and are not independently catalogued.

Example: `GET /recaps/8b17beb5-e8be-489f-b083-fed74ad8d7d7`, a real bedwars recap id referenced in PikaNetwork's own community documentation. Recaps are not retained forever, so this specific id may now 404.

Errors: `404` (empty body) for a nonexistent game id.

Caching: recaps are immutable once a match ends, but this package disables caching for this endpoint by default (`skipCache: true`), since a `gameId` is rarely re-requested. Override with `config.skipCache: false`.

## Ping

`GET /ping`

Liveness check.

**Not JSON.** Response `200` is a `text/plain` body:

```text
Pong!
```

Anything else, including a `200` with a different body, is unhealthy.

Example: `GET /ping`

Client behavior: no caching, resolves `false` on failure, never throws.

## Gamemode Catalog

Generated from `src/networks/pika-network/enums.ts`. A stat is listed under a gamemode only if a real request for that exact combination returned `200`.

| Column              | Maps to                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Raw key             | `stat` query parameter on `/leaderboards`                                                |
| Display name        | response key on `/profile/{username}/leaderboard`, `name` field on `/leaderboards/total` |
| Display name `null` | leaderboard-only, no per-player entry on `/profile/{username}/leaderboard`               |

### `bedwars`

Modes: `ALL_MODES`, `DOUBLES`, `QUAD`, `SOLO`, `TRIPLES`

Yearly interval: supported

Aliases: `PROJECTILE_KILLS` -> `BOW_KILLS`

| Raw key              | Display name                |
| -------------------- | --------------------------- |
| `BED_DESTROYED`      | `Beds destroyed`            |
| `BOW_KILLS`          | `Bow kills`                 |
| `FINAL_KILLS`        | `Final kills`               |
| `HIGHEST_WIN_STREAK` | `Highest winstreak reached` |
| `kills`              | `Kills`                     |
| `played`             | `Games played`              |
| `wins`               | `Wins`                      |

### `dungeons`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key                     | Display name                |
| --------------------------- | --------------------------- |
| `BOSS_DAMAGE_DEALT_TOTAL`   | `Total Boss Damage`         |
| `BOSS_KILLS_TOTAL`          | `Total Boss Kills`          |
| `MOB_DAMAGE_DEALT_TOTAL`    | `Total Mob Damage`          |
| `MOB_KILLS_TOTAL`           | `Total Mob Kills`           |
| `PETS_DELETED`              | `Pets Deleted`              |
| `PETS_FUSED`                | `Pets Fused`                |
| `PETS_HATCHED`              | `Pets Hatched`              |
| `PETS_USED_IN_FUSION`       | `Pets Used in Fusion`       |
| `PITY_ROLLS`                | `Pity Rolls`                |
| `REBIRTH`                   | `Rebirth`                   |
| `TOTAL_BOMBS_THROWN`        | `Total Bombs Thrown`        |
| `TOTAL_CRYSTALS_OBTAINED`   | `Total Crystals Obtained`   |
| `TOTAL_ENCHANT_ACTIVATIONS` | `Total Enchant Activations` |
| `TOTAL_PERKS_ROLLED`        | `Total Perks Rolled`        |

### `genpvp`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key              | Display name         |
| -------------------- | -------------------- |
| `balance`            | `Balance`            |
| `CURRENT_KILLSTREAK` | `Current Killstreak` |
| `DEATHS`             | `Deaths`             |
| `HIGHEST_KILLSTREAK` | `Highest Killstreak` |
| `kills`              | `Kills`              |
| `LEVEL`              | `Level`              |

### `kitpvp`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key              | Display name         |
| -------------------- | -------------------- |
| `balance`            | `Balance`            |
| `CURRENT_KILLSTREAK` | `Current Killstreak` |
| `kills`              | `Kills`              |
| `KITPVP_LEVEL`       | `Level`              |
| `PRESTIGE`           | `Prestige`           |
| `TOTAL_KOTHS_WON`    | `Total koths won`    |

### `oneblock`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key               | Display name          |
| --------------------- | --------------------- |
| `balance`             | `Balance`             |
| `CUSTOM_CROPS_FARMED` | `Custom Crops Farmed` |
| `MOBS_KILLED`         | `Mobs Killed`         |
| `ONE_BLOCK_BROKEN`    | `One Block Broken`    |
| `PLAYER_LEVEL`        | `Player Level`        |

### `opfactions`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key              | Display name         |
| -------------------- | -------------------- |
| `balance`            | `Balance`            |
| `DEATHS`             | `Deaths`             |
| `HARVEST_SUGAR_CANE` | `Harvest Sugar Cane` |
| `HIGHEST_KILLSTREAK` | `Highest Killstreak` |
| `kills`              | `Kills`              |
| `MOBS_KILLED`        | `Mobs Killed`        |
| `PLAYER_LEVEL`       | `Player Level`       |
| `TOTAL_KOTHS_WON`    | `Total koths won`    |

### `oplifesteal`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key              | Display name         |
| -------------------- | -------------------- |
| `balance`            | `Balance`            |
| `BLOCKS_BROKEN`      | `Blocks Broken`      |
| `BLOCKS_PLACED`      | `Blocks Placed`      |
| `DEATHS`             | `Deaths`             |
| `HIGHEST_KILLSTREAK` | `Highest Killstreak` |
| `kills`              | `Kills`              |
| `MOBS_KILLED`        | `Mobs Killed`        |
| `PLAYER_LEVEL`       | `Player Level`       |

### `opprison`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key                    | Display name        |
| -------------------------- | ------------------- |
| `kills`                    | _leaderboard only_  |
| `PRISON_ASCENSION`         | `Ascension`         |
| `PRISON_BEACON_BALANCE`    | `Beacons`           |
| `PRISON_BLOCKS_BROKEN`     | `Blocks Broken`     |
| `PRISON_PRESTIGE`          | `Prestige`          |
| `PRISON_RAW_BLOCKS_BROKEN` | `Raw Blocks Broken` |
| `PRISON_TOKEN_BALANCE`     | `Tokens`            |

### `opskyblock`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key                  | Display name             |
| ------------------------ | ------------------------ |
| `ADVENTURER_SKILL_LEVEL` | `Adventurer Skill Level` |
| `ALCHEMIST_SKILL_LEVEL`  | `Alchemist Skill Level`  |
| `ARCHERY_SKILL_LEVEL`    | `Archery Skill Level`    |
| `AXES_SKILL_LEVEL`       | `Axes Skill Level`       |
| `balance`                | `Balance`                |
| `BANKER_SKILL_LEVEL`     | `Banker Skill Level`     |
| `FARMER_SKILL_LEVEL`     | `Farmer Skill Level`     |
| `kills`                  | _leaderboard only_       |
| `LUCKY_SKILL_LEVEL`      | `Lucky Skill Level`      |
| `MINER_SKILL_LEVEL`      | `Miner Skill Level`      |
| `PLAYER_LEVEL`           | `Player Level`           |
| `SKILL_LEVEL`            | `Skill Level`            |
| `Souls`                  | `Souls`                  |
| `SPECIAL_ORES_MINED`     | `Special Ores Mined`     |
| `WIZARD_SKILL_LEVEL`     | `Wizard Skill Level`     |

### `pillars`

Modes: `Seasonal`

Required mode: `Seasonal`

Yearly interval: not supported

| Raw key  | Display name   |
| -------- | -------------- |
| `kills`  | `Kills`        |
| `played` | `Games played` |
| `wins`   | `Wins`         |

### `skymines`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key              | Display name         |
| -------------------- | -------------------- |
| `balance`            | `Balance`            |
| `BLOCKS_MINED`       | `Blocks Mined`       |
| `BOSSES_KILLED`      | `Bosses Killed`      |
| `DEATHS`             | `Deaths`             |
| `HIGHEST_KILLSTREAK` | `Highest Killstreak` |
| `kills`              | `Kills`              |
| `PLAYER_LEVEL`       | `Player Level`       |

### `skypvp`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key               | Display name          |
| --------------------- | --------------------- |
| `balance`             | `Balance`             |
| `CURRENT_KILLSTREAK`  | `Current Killstreak`  |
| `DEATHS`              | `Deaths`              |
| `HIGHEST_KILLSTREAK`  | `Highest Killstreak`  |
| `kills`               | `Kills`               |
| `LUCKY_CRATES_OPENED` | `Lucky Crates Opened` |
| `RANK_RATING`         | `Rank Rating`         |

### `survival`

Modes: `ALL_MODES`

Yearly interval: not supported

| Raw key         | Display name    |
| --------------- | --------------- |
| `balance`       | `Balance`       |
| `EXP_COLLECTED` | `EXP Collected` |
| `MOBS_KILLED`   | `Mobs Killed`   |
| `PLAYER_LEVEL`  | `Player Level`  |

### `unrankedpractice`

Modes: `ALL_MODES`, `ARCHER`, `AXE_PVP`, `AXE_SHIELD`, `BATTLE_RUSH`, `BED_FIGHT`, `BOXING`, `BUILD_UHC`, `COMBO`, `CRYSTAL`, `DEBUFF`, `DIAMOND_SMP`, `FIREBALL_FIGHT`, `GAPPLE`, `MACE`, `MINECART`, `NETHERITE_NODEBUFF`, `NODEBUFF`, `PARKOUR`, `PEARL_FIGHT`, `SOUP`, `SPLEEF`, `SUMO`, `SWORD`, `THE_BRIDGE`, `VOID_FIGHT`

Yearly interval: supported

| Raw key              | Display name                |
| -------------------- | --------------------------- |
| `HIGHEST_WIN_STREAK` | `Highest winstreak reached` |
| `kills`              | `Kills`                     |
| `LOSSES`             | `Losses`                    |
| `MELEE_DEALT`        | `Hits dealt`                |
| `MELEE_TAKEN`        | `Hits taken`                |
| `played`             | `Games played`              |
| `VOID_KILLS`         | `Void kills`                |
| `wins`               | `Wins`                      |
