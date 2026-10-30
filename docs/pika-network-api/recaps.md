---
title: Match Recaps
order: 7
---

# Match Recaps

<Badge type="info" text="GET" /> `/recaps/{gameId}`

Summary of one completed match. Contents vary by gamemode.

## Path parameters

| Parameter | Type     | Required                                 | Description             |
| --------- | -------- | ---------------------------------------- | ----------------------- |
| `gameId`  | `string` | <Badge type="warning" text="required" /> | opaque match identifier |

## Response `200`

::: warning open schema
`Record<string, unknown>`. No fixed shape asserted; contents differ by gamemode and are not independently catalogued.
:::

## Live example

`8b17beb5-e8be-489f-b083-fed74ad8d7d7` is a real bedwars recap id referenced in PikaNetwork's own community documentation. Recaps are not retained forever, so this may now return `404` rather than `200`, that outcome is itself accurate documentation of the retention window.

<LiveEndpoint url="https://stats.pika-network.net/api/recaps/8b17beb5-e8be-489f-b083-fed74ad8d7d7" />

## Request forms

::: code-group

```text [HTTP]
GET /recaps/8b17beb5-e8be-489f-b083-fed74ad8d7d7
```

```bash [cURL]
curl 'https://stats.pika-network.net/api/recaps/8b17beb5-e8be-489f-b083-fed74ad8d7d7'
```

```ts [craftify]
import { PikaNetworkClient } from '@kyizl/craftify';

const pika = new PikaNetworkClient({ apiKey: process.env.PIKA_API_KEY! });

const recap = await pika.getMatchRecap('8b17beb5-e8be-489f-b083-fed74ad8d7d7');
```

:::

## Errors

| Status             | Condition              |
| ------------------ | ---------------------- |
| `404` (empty body) | game id does not exist |

## Caching

| Property        | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Mutability      | immutable once the match ends                                         |
| Default caching | disabled (`skipCache: true`), a given `gameId` is rarely re-requested |
| Override        | pass `config.skipCache: false` to cache anyway                        |
