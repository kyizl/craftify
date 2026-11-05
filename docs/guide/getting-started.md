---
title: Getting Started
order: 1
---

<script setup>
import { data } from '../.vitepress/data/pika-network.data';
</script>

# Getting Started

This project is a TypeScript client for the public PikaNetwork stats API. The canonical upstream reference lives at the service itself:

- [PikaNetwork docs](https://stats.pika-network.net/docs)
- [OpenAPI schema](https://stats.pika-network.net/openapi.json)
- [Public API URL](https://stats.pika-network.net/api)

Craftify does not duplicate the upstream API manually. It models the live contract, validates responses, and exposes safe, typed helpers on top of it.

## Install

```bash
npm install @kyizl/craftify
```

## Create a client

```ts
import { PikaNetworkClient } from '@kyizl/craftify';

const apiKey = process.env.PIKA_API_KEY;
if (!apiKey) throw new Error('PIKA_API_KEY is required');

const pika = new PikaNetworkClient({ apiKey });
```

Every documented PikaNetwork API operation requires an API key from `/apikey` in-game. Keep it in an environment variable and never commit it. If you set a custom `baseUrl`, `apiKey` becomes optional and the `X-Api-Key` header is only sent when you provide one. Craftify's separate [`ping()` health check](/pika-network-api/ping) was observed to work without a key, but it is not part of the published OpenAPI contract.

## Read the live contract

Before writing a custom query, open the official docs and compare against the generated enums in this package:

- [PikaNetwork docs](https://stats.pika-network.net/docs)
- [OpenAPI schema](https://stats.pika-network.net/openapi.json)

The API is not fully self-documenting in a TypeScript sense, so the package validates the live shapes and exposes ergonomic enums for gamemode, mode, stat, interval, and season values. This keeps your app aligned with the upstream service instead of a stale hand-written copy.

## Fetch a leaderboard

```ts
import { Gamemode, Stat } from '@kyizl/craftify';

const leaderboard = await pika.getLeaderboard({
  gamemode: Gamemode.BedWars,
  stat: Stat.BedWars.Kills,
  limit: 10,
});

for (const entry of leaderboard.entries) {
  console.log(entry.place, entry.id, entry.value);
}
```

`Gamemode` and `Stat` are ergonomic aliases for the live raw identifiers. Raw strings still work everywhere, but the generated constants make invalid combinations fail earlier and help with autocomplete.

## Fetch a player's stats

```ts
const stats = await pika.getProfileStats({
  username: 'divena',
  gamemode: Gamemode.BedWars,
});

const finalKills = stats.StatKey.BedWars.FinalKills;
```

`getProfileStats()` returns the per-player stat view for a gamemode or mode. If the upstream service returns no rows for a valid request, the client resolves that to the documented empty state rather than throwing unexpectedly.

## Fetch a profile

```ts
const profile = await pika.getProfile('divena');
```

Profile responses include account metadata and optional donor/clan data; a missing account resolves to `null` in the same way the upstream API resolves `404` to empty.

## Batch requests

Every list-returning method has a batched variant, with bounded concurrency and per-item isolation. See [Batch Requests](./batch-requests) for the contract.

```ts
const profiles = await pika.getProfiles(['divena', 'Notch', 'jeb_']);
```

## What's tracked

This build's generated enums currently cover **{{ data.gamemodeCount }} gamemodes** and **{{ data.totalStatCount }} distinct stats**, generated from the live upstream shapes and kept in sync at doc-build time. See [Gamemodes and Enums](./gamemodes-and-enums) for the catalog and generation pattern.

## Handle errors and empty responses correctly

```ts
import { NetworkBadRequestError } from '@kyizl/craftify';

try {
  await pika.getLeaderboard({
    gamemode: 'opprison',
    stat: 'PRISON_TOKEN_BALANCE',
    mode: 'SOLO',
  });
} catch (error) {
  if (error instanceof NetworkBadRequestError) {
    console.error('Invalid gamemode/mode/stat combination.');
  }
}
```

The upstream API uses a small set of status codes that matter in practice:

- `200`: success
- `204`: valid request, no data for a mode or stat filter
- `400`: invalid parameter combination
- `404`: entity not found or unmapped route
- `429`: rate-limited

The client narrows these into typed error classes where possible and normalizes empty, valid responses instead of treating them as exceptions.

See the full error hierarchy in the [API Reference](/api/classes/NetworkAPIError).
