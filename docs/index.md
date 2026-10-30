---
layout: home

hero:
  name: '@kyizl/craftify'
  text: ''
  tagline: Typed, runtime-validated API wrapper for <span class="grunge-pika" data-text="PikaNetwork">PikaNetwork</span>.
features:
  - icon:
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/></svg>'
    title: Validated at the boundary
    details: Every response is checked against a zod schema before it reaches you, so it is not just typed, it is actually verified at runtime.
  - icon:
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/></svg>'
    title: Generated enums, not guesses
    details: Gamemode, mode, stat, and interval combinations come from a real crawl of the live API, so invalid ones are rejected client-side before a request is sent.
  - icon:
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>'
    title: Rate-limited and cached by default
    details: A token-bucket limiter and a pluggable Keyv cache are built in, so you do not have to hand-roll backoff logic.
  - icon:
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/></svg>'
    title: First-class batching
    details: Bounded-concurrency batch requests with order preservation and per-item failure isolation.
---

<div class="craftify-landing">

## A quick look

```ts
import { Gamemode, PikaNetworkClient, Stat } from '@kyizl/craftify';

const client = new PikaNetworkClient({ apiKey: process.env.PIKA_API_KEY! });

const leaderboard = await client.getLeaderboard({
  gamemode: Gamemode.BedWars,
  stat: Stat.BedWars.Kills,
  page: 1,
  limit: 10,
});

const player = await client.getProfile('divena');
const stats = await client.getProfileStats({
  username: 'divena',
  gamemode: Gamemode.BedWars,
});
const finals = stats.StatKey.BedWars.FinalKills;

const clan = await client.getClan('THEBOIS');
const recap = await client.getMatchRecap('8b17beb5-e8be-489f-b083-fed74ad8d7d7');

const players = await client.getProfiles(['divena', 'resuns', 'Si1ent_']);
const [clan_batch, profile_batch, recap_batch] = await client.batch([
  () => client.getClan('THEBOIS'),
  () => client.getProfile('divena'),
  () => client.getMatchRecap('8b17beb5-e8be-489f-b083-fed74ad8d7d7'),
]);
```

<ClientOnly>
  <CraftifyStats />
</ClientOnly>

<p class="craftify-landing-callout">
  Start with the <a href="/guide/getting-started">Getting Started</a> guide, review the <a href="/api/">API Reference</a> for the client types, or inspect the <a href="/pika-network-api/overview">PikaNetwork API</a> reference for the underlying HTTP contract.
</p>

</div>
