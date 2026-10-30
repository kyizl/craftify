---
title: Endpoint Reference
order: 2
---

# Endpoint Reference

Every request requires `X-Api-Key`. Configure the client with `new PikaNetworkClient({ apiKey })`. Use the live API's exact game-mode and stat identifiers.

## Players

| Route                                 | Client method               | Parameters                                                                       | Result                                   |
| ------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| `GET /profile/{username}`             | `getProfile(username)`      | Minecraft username                                                               | `PikaNetworkProfileResponse \| null`     |
| `GET /profile/{username}/leaderboard` | `getProfileStats(params)`   | username, `gamemode`, optional `mode`, `interval`, `season`                      | `ProfileStats`; empty array when no data |
| `GET /players/{username}/teams`       | `getPlayerTeams(username)`  | Minecraft username                                                               | `PikaNetworkPlayerTeam[]`                |
| `GET /profile/{username}/history`     | `getProfileHistory(params)` | username, `gamemode`, optional comma-list `stats`, `days` (1-365; default 90)    | `PikaNetworkPlayerHistory \| null`       |
| `GET /profile/{username}/events`      | `getProfileEvents(params)`  | username, optional `limit` (max 50), `offset`                                    | `PikaNetworkPlayerEvents \| null`        |
| `GET /profile/{username}/fights`      | `getProfileFights(params)`  | username, optional game-mode `mode`, `days` (1-30; default 30), `limit` (max 50) | `PikaNetworkPlayerFights \| null`        |

## Leaderboards

| Route                      | Client method                  | Parameters                                                                                | Result                      |
| -------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------- |
| `GET /leaderboards`        | `getLeaderboard(params)`       | `gamemode`, raw stat key, optional sub-mode, interval, page, limit (max 25), season       | `LeaderboardPage`           |
| `GET /leaderboards/total`  | `getTotals(params)`            | `gamemode`, optional season                                                               | `PikaNetworkTotalsResponse` |
| `GET /leaderboards/stats`  | `getLeaderboardStats(params)`  | `gamemode`, optional stat-id prefix                                                       | `PikaNetworkStatId[]`       |
| `GET /leaderboards/movers` | `getLeaderboardMovers(params)` | `gamemode`, optional lowercase history stat id, `window` (`1d` or `7d`), `limit` (max 50) | `PikaNetworkMover[]`        |

`getLeaderboard` and `getProfileStats` accept `weekly`, `monthly`, `yearly`, or `total` intervals. Yearly data is documented only for BedWars and Unranked Practice. Historical seasons use `total`.

## Teams

| Route                                  | Client method            | Parameters                                                                           | Result                           |
| -------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------- |
| `GET /teams/{mode}/top`                | `getTopTeams(params)`    | team mode, optional `limit`, `offset`, `with=change`, season                         | `PikaNetworkTopTeam[]`           |
| `GET /teams/{mode}/{entityId}`         | `getTeam(params)`        | team mode and entity id                                                              | `PikaNetworkTeamDetail \| null`  |
| `GET /teams/{mode}/stats`              | `getTeamStats(mode)`     | team mode                                                                            | `PikaNetworkTeamStatCatalog`     |
| `GET /teams/{mode}/{entityId}/history` | `getTeamHistory(params)` | team mode, entity id, optional `limit` (max 5000), season                            | `PikaNetworkTeamHistory \| null` |
| `GET /teams/vs`                        | `compareTeams(params)`   | team mode, ids `a` and `b`; optional `at` or both `from` and `to` epoch milliseconds | `PikaNetworkTeamComparison`      |

Team modes are `opfactions`, `opskyblock`, `oneblock`, `skymines`, `opprison`, `kitpvp`, `skypvp`, `genpvp`, `survival`, and `oplifesteal`. The client rejects incomplete or mutually exclusive comparison ranges before sending a request.

## Guilds

| Route                            | Client method             | Parameters                                         | Result                                 |
| -------------------------------- | ------------------------- | -------------------------------------------------- | -------------------------------------- |
| `GET /clans/{name}`              | `getClan(name)`           | exact BedWars guild name                           | `PikaNetworkClanResponse \| null`      |
| `GET /clans/{name}/members`      | `getClanMembers(params)`  | guild name, optional comma-list stat keys (max 20) | `PikaNetworkClanMemberStatsResponse[]` |
| `GET /clans?username={username}` | `getPlayerClan(username)` | Minecraft username                                 | `PikaNetworkClanResponse \| null`      |

## Events

| Route                 | Client method             | Parameters                                                           | Result                     |
| --------------------- | ------------------------- | -------------------------------------------------------------------- | -------------------------- |
| `GET /events`         | `getEvents(params)`       | optional event `type`, `limit` (max 50), `offset`                    | `PikaNetworkEventPage`     |
| `GET /events/{id}`    | `getEvent(id)`            | event UUID                                                           | `PikaNetworkEvent \| null` |
| `GET /events/winners` | `getEventWinners(params)` | optional type, `days` (max 3650; 0 means all time), `limit` (max 50) | `PikaNetworkEventWinner[]` |
| `GET /events/types`   | `getEventTypes()`         | none                                                                 | `PikaNetworkEventType[]`   |

## Fights

| Route               | Client method           | Parameters                                                      | Result                           |
| ------------------- | ----------------------- | --------------------------------------------------------------- | -------------------------------- |
| `GET /fights`       | `getFights(params)`     | required game-mode `mode`, optional `limit` (max 50)            | `PikaNetworkFight[]`             |
| `GET /fights/stats` | `getFightStats(params)` | required game-mode `mode`, optional `hours` (1-168; default 24) | `PikaNetworkModeFights`          |
| `GET /fights/{id}`  | `getFight(id)`          | fight id from `/fights`                                         | `PikaNetworkFightDetail \| null` |

## Other

| Route                  | Client method             | Parameters                                     | Result                                 |
| ---------------------- | ------------------------- | ---------------------------------------------- | -------------------------------------- |
| `GET /seasons`         | `getSeasons()`            | none                                           | `PikaNetworkSeasons`                   |
| `GET /seasons/details` | `getSeasonDetails(type?)` | optional mode key such as `grizzly:opfactions` | `PikaNetworkSeasonDetails`             |
| `GET /recaps/{gameId}` | `getMatchRecap(gameId)`   | opaque game id                                 | `PikaNetworkRecapResponse \| null`     |
| `GET /ping`            | `ping()`                  | none                                           | `boolean`; failures resolve to `false` |

## Response Handling

The client validates JSON responses with exported Zod schemas and retains unknown fields for forward compatibility. A `204` response becomes `null` for history, event, and fight lookups where privacy can hide data; profile stats resolve to an empty array. A `404` entity response resolves to `null`. Other non-success statuses throw the corresponding `NetworkAPIError` subclass.

`getRateLimitInfo()` returns the latest response's `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After` values as numbers or `null` when a header is absent or not numeric.
