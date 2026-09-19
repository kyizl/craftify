---
title: Profile
order: 4
---

# Profile

<Badge type="info" text="GET" /> `/profile/{username}`

Account profile: rank, boosting flags, clan membership. Not gameplay stats, see [Profile Stats](./profile-stats).

## Path parameters

| Parameter  | Type     | Required                                 | Description      |
| ---------- | -------- | ---------------------------------------- | ---------------- |
| `username` | `string` | <Badge type="warning" text="required" /> | case-insensitive |

## Response `200`

<<<<<<< HEAD
::: warning unverified schema
Not covered by the query-parameter crawl, no combinations to enumerate. Field types below reflect the client's validation schema, which is deliberately permissive.
:::

| Field              | Type                    | Notes                                                       |
| ------------------ | ----------------------- | ----------------------------------------------------------- |
| `username`         | `string`                | <Badge type="info" text="optional" />                       |
| `lastSeen`         | `number`                | <Badge type="info" text="optional" /> unix ms               |
| `discord_verified` | `boolean`               | <Badge type="info" text="optional" />                       |
| `email_verified`   | `boolean`               | <Badge type="info" text="optional" />                       |
| `boosting`         | `boolean`               | <Badge type="info" text="optional" />                       |
| `discord_boosting` | `boolean`               | <Badge type="info" text="optional" />                       |
| `rank.level`       | `number`                | <Badge type="info" text="optional" />                       |
| `rank.experience`  | `number`                | <Badge type="info" text="optional" />                       |
| `rank.percentage`  | `number`                | <Badge type="info" text="optional" />                       |
| `rank.rankDisplay` | `string`                | <Badge type="info" text="optional" />                       |
| `ranks`            | `DonorRank[]`           | <Badge type="info" text="optional" />                       |
| `clan`             | `{ name, tag } \| null` | <Badge type="info" text="optional" /> nullable, not omitted |
| `friends`          | `unknown[]`             | <Badge type="info" text="optional" />                       |
| _(other fields)_   | `unknown`               | schema is passthrough; unlisted fields survive parsing      |
=======
The response includes account metadata, donor ranks, optional clan details, and friend usernames. Additional fields are preserved by the client for forward compatibility.

| Field              | Type                     | Notes                                                       |
| ------------------ | ------------------------ | ----------------------------------------------------------- |
| `username`         | `string`                 | <Badge type="info" text="optional" />                       |
| `lastSeen`         | `number`                 | <Badge type="info" text="optional" /> unix ms               |
| `discord_verified` | `boolean`                | <Badge type="info" text="optional" />                       |
| `email_verified`   | `boolean`                | <Badge type="info" text="optional" />                       |
| `boosting`         | `boolean`                | <Badge type="info" text="optional" />                       |
| `discord_boosting` | `boolean`                | <Badge type="info" text="optional" />                       |
| `rank.level`       | `number`                 | <Badge type="info" text="optional" />                       |
| `rank.experience`  | `number`                 | <Badge type="info" text="optional" />                       |
| `rank.percentage`  | `number`                 | <Badge type="info" text="optional" />                       |
| `rank.rankDisplay` | `string`                 | <Badge type="info" text="optional" />                       |
| `ranks`            | `DonorRank[]`            | <Badge type="info" text="optional" /> donor/server ranks    |
| `clan`             | `{ name, tag } \| null`  | <Badge type="info" text="optional" /> nullable, not omitted |
| `friends`          | `{ username: string }[]` | <Badge type="info" text="optional" />                       |
| _(other fields)_   | `unknown`                | schema is passthrough; unlisted fields survive parsing      |

Each donor rank can include `name`, `displayName`, `server`, `season`, and `expiry`.

Use `getTopRank(profile, scope)` to select the highest active donor rank. The
scope can be `global`, a gamemode such as `kitpvp`, or `all`.
>>>>>>> 828dd22 (feat(ranks): add profile rank util)

## Live example

This runs a real `GET` request from your browser directly to `stats.pika-network.net`, no proxy, no mock data. Response reflects whatever that account looks like right now.

<LiveEndpoint url="https://stats.pika-network.net/api/profile/resuns" />

## Request forms

::: code-group

```text [HTTP]
GET /profile/resuns
```

```bash [cURL]
curl 'https://stats.pika-network.net/api/profile/resuns'
```

```ts [craftify]
import { PikaNetworkClient } from '@kyizl/craftify';

const pika = new PikaNetworkClient();

const profile = await pika.getProfile('resuns');
```

:::

## Errors

| Status             | Condition               |
| ------------------ | ----------------------- |
| `404` (empty body) | username does not exist |

No `400` case.
