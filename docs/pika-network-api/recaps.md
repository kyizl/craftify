---
title: Match Recaps
order: 7
---

# Match recaps

`GET /recaps/{gameId}` returns a [`Recap`](./schemas#recap) for a completed match. The path parameter is an opaque game identifier; the OpenAPI schema does not define a pattern or provide a sample ID, so examples use a placeholder rather than an invented identifier.

The TypeScript example assumes `pika` is configured as shown in the [getting-started guide](/guide/getting-started).

## Response `200`

The published response schema contains:

| Field            | Type       | Notes                                      |
| ---------------- | ---------- | ------------------------------------------ |
| `id`             | `string`   | Recap identifier                           |
| `mapName`        | `string`   | Map name                                   |
| `gameType`       | `string`   | Game type; the schema example is `BedWars` |
| `gameServerName` | `string`   | Server name                                |
| `gameStart`      | `string`   | Game start value as returned by the API    |
| `gameDuration`   | `string`   | Duration as returned by the API            |
| `users`          | `object[]` | Players and their stat maps                |
| `winners`        | `string[]` | Winning player names                       |
| `stats`          | `string[]` | Stat names shown in this recap             |

Each `users[]` entry can contain `username` and `stats`. The `stats` object is keyed by game-specific display names, and its values may be strings or numbers. Do not hard-code one fixed set of stat keys across all game types.

## Request

Replace `YOUR_GAME_ID` with an ID obtained from a real match or the official API:

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/recaps/YOUR_GAME_ID"
```

```ts
const recap = await pika.getMatchRecap('YOUR_GAME_ID');
```

Craftify sets `skipCache: true` by default for recap requests because recap data is treated as a live lookup. You can override that behavior through the optional request configuration.

## Status codes

| Status | Meaning                                                                  |
| ------ | ------------------------------------------------------------------------ |
| `200`  | Recap returned                                                           |
| `400`  | Invalid game ID; the response uses the [`Error`](./schemas#error) schema |
| `404`  | No recap exists for that game; empty body                                |
| `429`  | Per-key rate limit exceeded                                              |
