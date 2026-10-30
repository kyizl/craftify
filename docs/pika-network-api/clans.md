---
title: Clans
order: 6
---

# Clans

<Badge type="info" text="GET" /> `/clans/{clanName}`

Clan profile: tag, trophies, creation date, member list.

## Path parameters

| Parameter  | Type     | Required                                 | Description      |
| ---------- | -------- | ---------------------------------------- | ---------------- |
| `clanName` | `string` | <Badge type="warning" text="required" /> | case-insensitive |

## Response `200`

::: warning unverified schema
Not covered by the crawl. Field types below reflect the validation schema.
:::

| Field            | Type        | Notes                                                                    |
| ---------------- | ----------- | ------------------------------------------------------------------------ |
| `name`           | `string`    | <Badge type="info" text="optional" />                                    |
| `tag`            | `string`    | <Badge type="info" text="optional" />                                    |
| `trophies`       | `number`    | <Badge type="info" text="optional" />                                    |
| `createdAt`      | `number`    | <Badge type="info" text="optional" /> unix ms                            |
| `members`        | `unknown[]` | <Badge type="info" text="optional" /> entries passed through unvalidated |
| _(other fields)_ | `unknown`   | schema is passthrough                                                    |

## Live example

Real `GET` request from your browser directly to `stats.pika-network.net`, no proxy, no mock data.

<LiveEndpoint url="https://stats.pika-network.net/api/clans/THEBOIS" />

## Request forms

::: code-group

```text [HTTP]
GET /clans/THEBOIS
```

```bash [cURL]
curl 'https://stats.pika-network.net/api/clans/THEBOIS'
```

```ts [craftify]
import { PikaNetworkClient } from '@kyizl/craftify';

const pika = new PikaNetworkClient({ apiKey: process.env.PIKA_API_KEY! });

const clan = await pika.getClan('THEBOIS');
```

:::

## Errors

| Status             | Condition           |
| ------------------ | ------------------- |
| `404` (empty body) | clan does not exist |

No `400` case.
