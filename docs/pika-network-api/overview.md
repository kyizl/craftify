---
title: Overview
order: 1
---

<script setup>
import { data } from '../.vitepress/data/pika-network-catalog.data';
</script>

# PikaNetwork Stats API

Unofficial reference for `stats.pika-network.net`'s public HTTP API. No specification is published upstream; every entry here is crawl-verified or explicitly marked as inferred.

Consuming this from TypeScript: use [`PikaNetworkClient`](/guide/getting-started), not this section directly.

<ClientOnly>
<CraftifyStats />
</ClientOnly>

## Base URL

```text
https://stats.pika-network.net/api
```

## Auth

<Badge type="warning" text="required" />

Every request requires the `X-Api-Key` header. Create a key in-game with `/apikey` after linking Discord with `/linkaccount`. Pass it to `new PikaNetworkClient({ apiKey })` and keep it out of source control.

## Content type

| Endpoint           | Content-Type       |
| ------------------ | ------------------ |
| all except `/ping` | `application/json` |
| `/ping`            | `text/plain`       |

## Numeric encoding

::: warning quirk
Numeric fields are not consistently typed.
:::

| Encoding       | Example                      | Where                                                 |
| -------------- | ---------------------------- | ----------------------------------------------------- |
| JSON `number`  | `4377967`                    | [Totals](./totals), most fields                       |
| numeric string | `"5158777955980.7333984375"` | [Leaderboards](./leaderboards) `value`, some balances |

Coerce both to `number` at the parse boundary. Do not assume one or the other.

## Status code contract

| Status | Body       | Meaning                                               |
| ------ | ---------- | ----------------------------------------------------- |
| `200`  | JSON       | success                                               |
| `204`  | empty      | valid request, no data for this gamemode/mode         |
| `404`  | empty      | entity does not exist (player, clan, recap)           |
| `404`  | JSON error | route unmapped                                        |
| `400`  | JSON error | invalid gamemode / mode / stat / interval combination |
| `429`  | JSON error | rate limited                                          |
| `5xx`  | varies     | upstream / edge failure                               |

::: danger not an error
`204` is a valid, successful response. Handle it as an empty result, never as a thrown exception.
:::

## Rate limits

The published limit is **120 requests per minute per key**. Responses expose `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`; `429` responses include `Retry-After`. The client defaults to 2 requests/second with a burst of 1. See [Rate Limiting](/guide/rate-limiting).

## Crawl coverage

| Metric              | Value                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Gamemodes           | {{ data.gamemodes.length }}                                                                   |
| Stat keys           | {{ data.gamemodes.reduce((sum, g) => sum + g.stats.length, 0) }}                              |
| Verification method | live `200` response per gamemode/stat combination, see [Gamemode Catalog](./gamemode-catalog) |

## Endpoints

<div class="craftify-endpoint-grid">

<a href="./leaderboards" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="info" text="GET" /><code>/leaderboards</code></div>
  <p>paginated global ranking</p>
</a>

<a href="./totals" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="info" text="GET" /><code>/leaderboards/total</code></div>
  <p>server-wide aggregate</p>
</a>

<a href="./profile" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="info" text="GET" /><code>/profile/${username}</code></div>
  <p>account profile</p>
</a>

<a href="./profile-stats" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="info" text="GET" /><code>/profile/${username}/leaderboard</code></div>
  <p>per-player stats</p>
</a>

<a href="./clans" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="info" text="GET" /><code>/clans/${clanName}</code></div>
  <p>clan profile</p>
</a>

<a href="./recaps" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="info" text="GET" /><code>/recaps/${gameId}</code></div>
  <p>match recap</p>
</a>

<a href="./ping" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="info" text="GET" /><code>/ping</code></div>
  <p>liveness check</p>
</a>

<a href="./endpoints" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="tip" text="reference" /><code>complete endpoint reference</code></div>
  <p>all routes, client methods, parameters, and response types</p>
</a>

<a href="./gamemode-catalog" class="craftify-endpoint-card">
  <div class="craftify-endpoint-card-head"><Badge type="tip" text="reference" /><code>gamemode catalog</code></div>
  <p>full crawl-verified gamemode/stat table</p>
</a>

</div>
