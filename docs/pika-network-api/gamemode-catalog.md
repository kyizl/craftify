---
title: Gamemode Catalog
order: 9
---

# Gamemode Catalog

Generated at doc-build time from `src/networks/pika-network/enums.ts`, the same source the client validates every request against.

This catalog is generated from the package's exported gamemode enums and stat mappings. It describes the identifiers accepted by the Craftify client; the official OpenAPI schema's `GameMode` enum is listed in the [schema reference](./schemas#gamemode).

## Field reference

| Column              | Maps to                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| Raw key             | `stat` query parameter on [`GET /leaderboards`](./endpoints#leaderboards)          |
| Display name        | key on [`PlayerLeaderboard`](./schemas#playerleaderboard) or `name` on `StatTotal` |
| Display name `null` | the client has no display-name mapping for that stat key                           |

## Full catalog

Filter by gamemode name or stat; raw keys and display names both match. `yearly` is documented by the upstream API only for BedWars and Unranked Practice. Historical seasons use `interval=total`.

<CatalogSearch />
