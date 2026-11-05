---
title: Overview
order: 1
---

<script setup>
import { data } from '../.vitepress/data/pika-network-catalog.data';
</script>

# PikaNetwork Stats API

The PikaNetwork Stats API exposes player profiles, game statistics, leaderboards, teams, guilds, events, PvP fights, seasons, and match recaps. This section is a complete companion reference for the official API, not a replacement for its live documentation.

<div class="craftify-endpoint-grid">
  <a href="https://stats.pika-network.net/docs" class="craftify-endpoint-card" target="_blank" rel="noreferrer">
    <div class="craftify-endpoint-card-head"><Badge type="tip" text="official" /><code>Interactive API docs</code></div>
    <p>Explore endpoints, authorize with your key, and send live requests</p>
  </a>
  <a href="https://stats.pika-network.net/openapi.json" class="craftify-endpoint-card" target="_blank" rel="noreferrer">
    <div class="craftify-endpoint-card-head"><Badge type="tip" text="official" /><code>OpenAPI JSON</code></div>
    <p>Machine-readable OpenAPI 3.0.3 contract</p>
  </a>
  <a href="https://stats.pika-network.net/" class="craftify-endpoint-card" target="_blank" rel="noreferrer">
    <div class="craftify-endpoint-card-head"><Badge type="tip" text="official" /><code>Pika Stats website</code></div>
    <p>See the player profiles, leaderboards and public stats experience powered by this API</p>
  </a>
  <a href="/pika-network-openapi.json" class="craftify-endpoint-card">
    <div class="craftify-endpoint-card-head"><Badge type="info" text="snapshot" /><code>Local specification</code></div>
    <p>Versioned snapshot used to generate the endpoint and schema references</p>
  </a>
</div>

## At a glance

<div class="craftify-api-metrics">
  <div><strong>28</strong><span>operations</span></div>
  <div><strong>7</strong><span>categories</span></div>
  <div><strong>37</strong><span>reusable schemas</span></div>
  <div><strong>{{ data.gamemodes.length }}</strong><span>client gamemodes</span></div>
</div>

## Getting an API key

The API is free for PikaNetwork players. Every **documented API operation** must include an API key in the `X-Api-Key` header.

1. Join the PikaNetwork Minecraft server and link your Discord account with `/linkaccount`.
2. Run `/apikey` in-game. Your key is sent in chat; click it to place it in your chat box and copy it.
3. Send the key with every API request using the `X-Api-Key` header.

Keys are issued per account and do not expire. If a key is exposed, run `/apikey reset` to invalidate the old key and generate a replacement. Missing, invalid, reset, or staff-revoked keys receive `401 Unauthorized`.

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/profile/JustThiemo"
```

**Security:** never place a private key in frontend JavaScript, a public repository, a browser extension, or a client-side environment variable. Keep it on a trusted server and proxy requests through your backend when building a public website.

The upstream API does not allow this documentation site's browser origin to read API responses with `fetch`. Use the cURL or server-side examples below; do not work around the restriction by exposing your private key in browser code. The separate [`/ping` health check](./ping) is not part of the published OpenAPI contract and was observed to respond without a key.

## Base URL and request format

```text
https://stats.pika-network.net/api
```

The API uses HTTPS and JSON for its documented endpoints. The OpenAPI document declares API-key authentication through `X-Api-Key`. Path and query parameter names are case-sensitive; use the exact identifiers shown in the reference.

## Rate limits

The official documentation specifies **120 requests per minute per API key**. Rate-limit headers are returned with responses:

| Header                  | Meaning                                  |
| ----------------------- | ---------------------------------------- |
| `X-RateLimit-Limit`     | Request allowance for the current window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset`     | Reset time, expressed in seconds         |
| `Retry-After`           | How long to wait after a `429` response  |

When rate limited, stop sending requests until `Retry-After` has elapsed. Cache stable responses, avoid polling faster than necessary, and use the response headers instead of assuming a reset schedule.

## Response and data conventions

### Status codes

| Status | Meaning                                     | How to handle it                                                                                                |
| ------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `200`  | Request succeeded                           | Parse the documented response body.                                                                             |
| `204`  | Request succeeded with no response body     | Treat as an empty/private/unavailable result; do not try to parse JSON. The exact meaning is endpoint-specific. |
| `400`  | Invalid parameter or request                | Check the endpoint's allowed values and constraints.                                                            |
| `401`  | Missing, invalid, reset, or revoked API key | Obtain or reset your key and send it in `X-Api-Key`.                                                            |
| `404`  | Requested resource does not exist           | Check the identifier and endpoint-specific retention/availability rules.                                        |
| `429`  | Per-key rate limit exceeded                 | Wait for `Retry-After` and reduce request frequency.                                                            |
| `503`  | A temporarily unavailable upstream feature  | Retry later with backoff; documented for event/fight data and season dates.                                     |

Not every endpoint returns every status. The endpoint reference lists only statuses declared for that operation in the current OpenAPI document.

### Numbers and timestamps

- Some leaderboard values are **numeric strings**, not JSON numbers. Do not assume every number-like value can be used in arithmetic without parsing it.
- Aggregates and many team statistics are JSON numbers. Large balances can exceed JavaScript's safe integer range; use decimal-safe handling when exact precision matters.
- Fields described as epoch milliseconds are Unix timestamps in milliseconds, not seconds. Divide by `1000` before passing them to JavaScript's `Date` constructor.
- Some date-time strings are local date-times without an explicit timezone. Do not silently interpret them as UTC.
- Nullable fields may explicitly contain `null`; optional fields may be omitted. Those are different states.

### Identifiers are not interchangeable

- Game mode slugs such as `bedwars`, `kitpvp`, and `opfactions` identify a network game mode.
- A sub-mode such as `DOUBLES` or `NODEBUFF` filters stats within a game mode.
- Leaderboard `stat` values are internal stat keys. Profile history and mover endpoints can use separate lowercase/dotted stat identifiers. Use the exact identifier documented for each endpoint.
- Team `entityId` values are mode-specific. They can be numeric-looking strings or UUIDs; preserve them as strings.
- Event IDs are UUIDs. Fight IDs have the form `<epoch-ms>.<uuid>`. Match recap IDs are opaque identifiers supplied by the game.

### Game modes and display names

The OpenAPI `GameMode` enum currently lists `opfactions`, `opprison`, `opskyblock`, `oneblock`, `survival`, `kitpvp`, `unrankedpractice`, `rankedpractice`, `bedwars`, `skywars`, `oplifesteal`, `skypvp`, `skymines`, `genpvp`, `wildkits`, and `dungeons`. Team routes use a narrower, separate path `mode` enum; do not assume every game mode supports team endpoints.

Player and team names can contain Minecraft formatting codes. The official docs recommend stripping them before rendering untrusted names:

```ts
const cleanMinecraftText = (value: string) => value.replace(/§[0-9a-fk-or]/gi, '');
```

The official site and OpenAPI description both note that the service can change without notice. Recheck the live specification when relying on newly added fields or routes.

## Explore the reference

| Reference                                       | What's covered                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [Complete endpoint reference](./endpoints)      | All 28 operations, every declared parameter, response status, response schema, and request example |
| [Response schema reference](./schemas)          | All 37 reusable OpenAPI schemas, properties, types, nullability, formats, and examples             |
| [Gamemode and stat catalog](./gamemode-catalog) | Client-supported game modes, sub-modes, stat keys, aliases, and display names                      |

## API categories

- **Players:** profiles, per-mode leaderboards, teams, daily history, event history, and PvP history.
- **Leaderboards:** global rankings, stat totals, stat ID discovery, and daily/weekly movers.
- **Teams:** ranked groups, group details, stat catalogs, history snapshots, and comparisons.
- **Guilds:** BedWars guild details, member totals, and player-to-guild lookup. The API calls guilds `clans` in its route names; see the [clan endpoints](./clans).
- **Events:** event listings, standings, event types, winners, and player event history.
- **Fights:** recent PvP kills, mode-wide summaries, detailed loadouts, and player fight history.
- **Other:** season numbers, season date ranges, and match recaps. The package also exposes [`ping()`](./ping), a health-check route not included in the published OpenAPI document.

## Relationship to Craftify

This reference documents the raw HTTP API. The [`@kyizl/craftify` guide](/guide/getting-started) documents the TypeScript wrapper, whose method names and normalized return values are not always identical to raw HTTP parameters and payloads. Use the [TypeScript API reference](/api/) for exported client methods and types.

The bundled [OpenAPI snapshot](/pika-network-openapi.json) is the input to the generated [endpoint reference](./endpoints) and [schema reference](./schemas). Run `npm run docs:openapi:update` to download the latest official specification and regenerate both pages. Run `npm run docs:openapi` to regenerate from the committed snapshot without making a network request.
