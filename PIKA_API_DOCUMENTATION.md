# PikaNetwork Stats API

This repository's complete PikaNetwork HTTP API reference is maintained in the [Craftify documentation site](docs/pika-network-api/overview.md). It is generated from the official upstream OpenAPI specification rather than maintained as a separate, hand-written endpoint list.

## Official sources

- [Interactive API documentation](https://stats.pika-network.net/docs)
- [OpenAPI JSON](https://stats.pika-network.net/openapi.json)
- [API base URL](https://stats.pika-network.net/api)
- Local checked-in specification: [`docs/public/pika-network-openapi.json`](docs/public/pika-network-openapi.json)

## Complete local references

- [Overview, authentication, rate limits, response conventions](docs/pika-network-api/overview.md)
- [All endpoints, parameters, response codes, and request examples](docs/pika-network-api/endpoints.md)
- [All reusable response schemas](docs/pika-network-api/schemas.md)
- [Gamemode and stat catalog](docs/pika-network-api/gamemode-catalog.md)

## API coverage

The current upstream OpenAPI document contains **28 GET operations**, grouped into seven categories:

| Category     | Endpoints                                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Players      | `/profile/{username}`, `/profile/{username}/leaderboard`, `/players/{username}/teams`, `/profile/{username}/history`, `/profile/{username}/events`, `/profile/{username}/fights` |
| Leaderboards | `/leaderboards`, `/leaderboards/total`, `/leaderboards/stats`, `/leaderboards/movers`                                                                                            |
| Teams        | `/teams/{mode}/top`, `/teams/{mode}/{entityId}`, `/teams/{mode}/stats`, `/teams/{mode}/{entityId}/history`, `/teams/vs`                                                          |
| Guilds       | `/clans/{name}`, `/clans/{name}/members`, `/clans?username={username}`                                                                                                           |
| Events       | `/events`, `/events/{id}`, `/events/winners`, `/events/types`                                                                                                                    |
| Fights       | `/fights`, `/fights/stats`, `/fights/{id}`                                                                                                                                       |
| Other        | `/seasons`, `/seasons/details`, `/recaps/{gameId}`                                                                                                                               |

The OpenAPI document currently defines **37 reusable schemas**. The generated endpoint and schema pages cover the full published specification, including operations that were absent from the previous hand-written reference. The current OpenAPI contract does not declare a `/ping` operation; do not rely on it as a documented endpoint.

## Refreshing the reference

```bash
# Download the current upstream specification and regenerate both references.
npm run docs:openapi:update

# Regenerate from the checked-in snapshot without network access.
npm run docs:openapi

# Build the documentation site.
npm run docs:build
```

The update script validates the upstream OpenAPI structure before replacing the checked-in snapshot. The docs build then generates the readable endpoint and schema references from that snapshot, keeping local builds reproducible.
