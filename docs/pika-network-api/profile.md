---
title: Player Profile
order: 2
---

# Player profile

`GET /profile/{username}` returns the [`Profile`](./schemas#profile) schema. The path parameter is a Minecraft username and is documented as not case-sensitive.

The TypeScript example assumes `pika` is configured as shown in the [getting-started guide](/guide/getting-started).

## Response `200`

The OpenAPI schema does not mark any top-level profile property as required. A property may be absent; `clan` is additionally nullable.

| Field              | Type                               | Notes                                                                                             |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `username`         | `string`                           | Minecraft username                                                                                |
| `lastSeen`         | `integer`                          | Unix timestamp in milliseconds                                                                    |
| `rank`             | `object`                           | Network level: `level`, `experience`, `percentage`, `rankDisplay`                                 |
| `ranks`            | `object[]`                         | Server ranks: `name`, `displayName`, `server`, nullable `season`, `expiry` (`-1` means permanent) |
| `friends`          | `object[]`                         | Each entry contains a `username`                                                                  |
| `clan`             | [`Clan`](./schemas#clan) `\| null` | BedWars guild, when present                                                                       |
| `email_verified`   | `boolean`                          | Linked email verification state                                                                   |
| `discord_verified` | `boolean`                          | Linked Discord verification state                                                                 |
| `discord_boosting` | `boolean`                          | Discord boosting state                                                                            |

Craftify's permissive profile validator also accepts an optional `boosting` field. That field is **not present in the current upstream `Profile` schema**; do not rely on it as a documented response property.

## Request

```bash
curl \
  -H "X-Api-Key: $PIKA_API_KEY" \
  "https://stats.pika-network.net/api/profile/JustThiemo"
```

```ts
const profile = await pika.getProfile('JustThiemo');

if (profile) {
  console.log(profile.username, profile.rank?.level, profile.clan?.tag);
}
```

## Status codes

| Status | Meaning                                                         |
| ------ | --------------------------------------------------------------- |
| `200`  | Profile returned                                                |
| `404`  | No player with that name; the documented response body is empty |
| `429`  | Per-key rate limit exceeded                                     |

All documented profile requests require `X-Api-Key`. See the [authentication and rate-limit overview](./overview#getting-an-api-key).
