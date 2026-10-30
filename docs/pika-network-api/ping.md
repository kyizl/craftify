---
title: Ping
order: 8
---

# Ping

<Badge type="info" text="GET" /> `/ping`

Liveness check.

## Response `200`

::: warning not JSON
`text/plain` body. Anything other than exactly `Pong!`, including a `200` with a different body, is unhealthy.
:::

<LiveEndpoint url="https://stats.pika-network.net/api/ping" raw />

## Example

::: code-group

```text [HTTP]
GET /ping
```

```bash [cURL]
curl 'https://stats.pika-network.net/api/ping'
```

```ts [craftify]
import { PikaNetworkClient } from '@kyizl/craftify';

const pika = new PikaNetworkClient({ apiKey: process.env.PIKA_API_KEY! });

const healthy = await pika.ping();
```

:::

## Client behavior

| Property   | Value                          |
| ---------- | ------------------------------ |
| Caching    | none                           |
| On failure | resolves `false`, never throws |
