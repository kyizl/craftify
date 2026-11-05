---
title: Clans and Guilds
order: 6
---

# Clans and guilds

The upstream OpenAPI groups these BedWars guild routes under **Guilds** and uses `clans` in the URL. The route parameter is named `name` in the HTTP contract; Craftify's method uses the clearer local name `clanName`.

The TypeScript examples assume `pika` is configured as shown in the [getting-started guide](/guide/getting-started).

## Routes

| HTTP route                  | Craftify method                        | Purpose                                  |
| --------------------------- | -------------------------------------- | ---------------------------------------- |
| `GET /clans/{name}`         | `getClan(clanName)`                    | Fetch a guild by name                    |
| `GET /clans?username=...`   | `getPlayerClan(username)`              | Find the guild a player belongs to       |
| `GET /clans/{name}/members` | `getClanMembers({ clanName, stats? })` | Fetch members and selected BedWars stats |

`getClans(names)` is a batched client helper over `getClan`; it does not call a separate batch endpoint.

All three HTTP routes require the `X-Api-Key` header. The documented responses are `200`, `404`, and `429`; the global API-key failure is `401`.

## Fetch a guild

`GET /clans/{name}` accepts one required path parameter:

| Parameter | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `name`    | `string` | Yes      | Guild name  |

The `200` response uses the [`Clan`](./schemas#clan) schema. Its documented properties include `name`, `tag`, `currentTrophies`, `creationTime`, `owner.username`, `leveling` and `members`. `creationTime` is a local date-time string without a timezone.

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/clans/NEXUS"
```

```ts
const clan = await pika.getClan('NEXUS');
```

## Find a player's guild

`GET /clans` accepts one required query parameter:

| Parameter  | Type     | Required | Description        |
| ---------- | -------- | -------- | ------------------ |
| `username` | `string` | Yes      | Minecraft username |

The `200` response has the same `Clan` shape as `GET /clans/{name}`. `404` means the player is not in a guild.

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/clans?username=voodootje0"
```

```ts
const clan = await pika.getPlayerClan('voodootje0');
```

## Fetch guild members

`GET /clans/{name}/members` accepts the required `name` path parameter and an optional `stats` query parameter:

| Parameter | Type     | Required | Description                                                                                               |
| --------- | -------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `name`    | `string` | Yes      | Guild name                                                                                                |
| `stats`   | `string` | No       | Comma-separated BedWars stat keys; maximum 20. Defaults to `WINS,KILLS,FINAL_KILLS,BED_DESTROYED,PLAYED`. |

The `200` response is an array of [`ClanMember`](./schemas#clanmember) objects. The client accepts either a comma-separated string or a string array and validates the 20-item limit before sending the request.

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/clans/Cheaters/members?stats=WINS,KILLS,FINAL_KILLS"
```

```ts
const members = await pika.getClanMembers({
  clanName: 'Cheaters',
  stats: ['WINS', 'KILLS', 'FINAL_KILLS'],
});
```

## Response compatibility

The generated [`Clan`](./schemas#clan) and [`ClanMember`](./schemas#clanmember) pages describe the published upstream contract. Craftify's runtime validators are deliberately permissive and preserve unknown properties. They also tolerate optional compatibility fields such as `trophies`, `createdAt`, and a member `rank`; those extra fields are **not** part of the current OpenAPI schema and should not be treated as guaranteed API fields.

There is one response-shape difference worth knowing: OpenAPI describes the members endpoint as `ClanMember[]` with `user.username`, while Craftify's member-stat type also accepts a flat `username` and an optional `stats` object (`total`, `weekly`, `monthly`). The authenticated response body was not available during this documentation audit, so the validator accepts both forms rather than claiming that one is the only live shape.
