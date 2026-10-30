# @kyizl/craftify

Typed, runtime-validated API client for CraftiGames stats networks. PikaNetwork is fully implemented; JartexNetwork is planned on top of the same network-agnostic foundation.

## Install

```bash
npm install @kyizl/craftify
```

## Quick start

```ts
import { Gamemode, PikaNetworkClient, Stat } from '@kyizl/craftify';

const apiKey = process.env.PIKA_API_KEY;
if (!apiKey) throw new Error('PIKA_API_KEY is required');

const pika = new PikaNetworkClient({ apiKey });

const leaderboard = await pika.getLeaderboard({
  gamemode: Gamemode.BedWars,
  stat: Stat.BedWars.Kills,
  limit: 10,
});

const stats = await pika.getProfileStats({
  username: 'divena',
  gamemode: Gamemode.BedWars,
});
const finals = stats.StatKey.BedWars.FinalKills;

const profile = await pika.getProfile('divena');

const profiles = await pika.getProfiles(['divena', 'Notch', 'jeb_']);
```

Invalid combinations throw synchronously, before any request is sent:

```ts
await pika.getLeaderboard({
  gamemode: 'opprison',
  stat: 'PRISON_TOKEN_BALANCE',
  mode: 'SOLO',
});
```

See the [Getting Started](docs/guide/getting-started.md), [Gamemodes and Enums](docs/guide/gamemodes-and-enums.md), [Ergonomic Constants](docs/guide/ergonomic-constants.md), [Batch Requests](docs/guide/batch-requests.md), and [Rate Limiting](docs/guide/rate-limiting.md) guides for the full picture, or browse the live documentation site linked from the [API Reference](docs/api/index.md).

## Documentation

Full guides and the generated API reference live at the project's documentation site (craftify.kyizl.is-a.dev), covering:

- [Getting Started](docs/guide/getting-started.md), for the shortest path from install to a validated response.
- [Gamemodes and Enums](docs/guide/gamemodes-and-enums.md), for how the generated enums are crawled and kept accurate.
- [Ergonomic Constants](docs/guide/ergonomic-constants.md), for the `Gamemode` / `Mode` / `Stat` / `Interval` / `StatKey` aliases.
- [Batch Requests](docs/guide/batch-requests.md), for the concurrency, ordering, and failure-isolation contract.
- [Rate Limiting](docs/guide/rate-limiting.md), for why the defaults are conservative and how to override them responsibly.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, the verification workflow, and commit conventions.

## License

MIT
