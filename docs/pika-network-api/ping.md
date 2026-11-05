---
title: Ping
order: 8
---

# Ping

`GET /ping` is a small health-check route used by `PikaNetworkClient.ping()`. It is **not included in the published OpenAPI document**, so it is documented separately from the 28 official operations and may change without notice.

The TypeScript example assumes `pika` is configured as shown in the [getting-started guide](/guide/getting-started).

## Observed response

I sent a direct unauthenticated request to the official API on **5 November 2026**. It returned:

| Status | Content type               | Body    |
| ------ | -------------------------- | ------- |
| `200`  | `text/plain;charset=UTF-8` | `Pong!` |

```bash
curl "https://stats.pika-network.net/api/ping"
```

No API key was required for that probe. This observation is not a guarantee that the route will remain public or retain the same response.

## Craftify behavior

```ts
const isOnline = await pika.ping();
```

The client sends `GET /ping` without using the response cache. It returns `true` only when the response body is exactly `Pong!`; an unexpected body, HTTP failure, or network error resolves to `false`.

Use the official [OpenAPI document](https://stats.pika-network.net/openapi.json) for the supported HTTP contract. Do not use this health check as an authentication or feature-availability check.
