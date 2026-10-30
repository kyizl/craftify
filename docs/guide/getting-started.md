---
title: Getting Started
order: 1
---

<script setup>
import { data } from '../.vitepress/data/pika-network.data';
</script>

# Getting Started

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

Every request to the default PikaNetwork API requires a key from `/apikey` in-game. Keep it in an environment variable and never commit it. When you set a custom `baseUrl`, `apiKey` is optional and the `X-Api-Key` header is only sent if you provide one. The client also provides bounded rate limiting, retries, and caching. See the [Rate Limiting](./rate-limiting) guide before changing those defaults.

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

`Gamemode` and `Stat` are ergonomic, autocomplete-friendly aliases for plain strings. See [Ergonomic Constants](./ergonomic-constants). Raw strings work everywhere too.

## Fetch a player's stats

```ts
const stats = await pika.getProfileStats({
  username: 'divena',
  gamemode: Gamemode.BedWars,
});

const finalKills = stats.StatKey.BedWars.FinalKills;
```

## Fetch a profile

```ts
const profile = await pika.getProfile('divena');
```

## Batch requests

Every list-returning method has a batched counterpart, bounded by concurrency and rate-limited underneath. See [Batch Requests](./batch-requests) for the full contract.

```ts
const profiles = await pika.getProfiles(['divena', 'Notch', 'jeb_']);
```

## What's tracked

This build's generated enums currently cover **{{ data.gamemodeCount }} gamemodes** and **{{ data.totalStatCount }} distinct stats**, pulled live from `src/networks/pika-network/enums.ts` at doc-build time, so this number never goes stale. See [Gamemodes and Enums](./gamemodes-and-enums) for how that's generated.

## Handling errors

```ts
import { NetworkBadRequestError, NetworkRateLimitError } from '@kyizl/craftify';

try {
  await pika.getLeaderboard({
    gamemode: 'opprison',
    stat: 'PRISON_TOKEN_BALANCE',
    mode: 'SOLO',
  });
} catch (error) {
  if (error instanceof NetworkBadRequestError) {
  }
}
```

See the full error hierarchy in the [API Reference](/api/classes/NetworkAPIError).
