<script setup lang="ts">
import { computed, ref } from 'vue';
import { data } from '../data/pika-network-catalog.data';

const query = ref('');

const filteredGamemodes = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) return data.gamemodes;

  return data.gamemodes
    .map((gamemode) => {
      if (gamemode.gamemode.toLowerCase().includes(term)) return gamemode;

      const stats = gamemode.stats.filter(
        (stat) =>
          stat.rawKey.toLowerCase().includes(term) ||
          stat.displayName?.toLowerCase().includes(term),
      );
      return stats.length ? { ...gamemode, stats } : null;
    })
    .filter((gamemode): gamemode is (typeof data.gamemodes)[number] => gamemode !== null);
});

const normalizedQuery = computed(() => query.value.trim());
</script>

<template>
  <div class="craftify-catalog">
    <input
      v-model="query"
      type="search"
      class="craftify-catalog-search"
      aria-label="Filter gamemodes and stats"
      placeholder="filter by gamemode or stat, e.g. bedwars, BOW_KILLS, Balance"
      autocomplete="off"
    />

    <p
      class="craftify-catalog-result-count"
      role="status"
      aria-live="polite"
    >
      {{ filteredGamemodes.length }}
      {{ filteredGamemodes.length === 1 ? 'gamemode' : 'gamemodes' }}
      {{ normalizedQuery ? `match “${normalizedQuery}”` : 'available' }}
    </p>

    <p
      v-if="!filteredGamemodes.length"
      class="craftify-catalog-empty"
    >
      no gamemode or stat matches <code>{{ query }}</code>
    </p>

    <details
      v-for="gamemode in filteredGamemodes"
      :key="gamemode.gamemode"
      class="craftify-catalog-entry"
      :open="normalizedQuery.length > 0"
    >
      <summary>
        <code>{{ gamemode.gamemode }}</code>
        <span class="craftify-catalog-count">{{ gamemode.stats.length }} stats</span>
        <span
          v-if="gamemode.yearlyCapable"
          class="craftify-catalog-yearly"
          >yearly</span
        >
      </summary>

      <p>
        <strong>Modes:</strong>
        <code
          v-for="mode in gamemode.modes"
          :key="mode"
          >{{ mode }}
        </code>
      </p>
      <p v-if="gamemode.requiredMode">
        <strong>Required mode:</strong> <code>{{ gamemode.requiredMode }}</code>
      </p>
      <p v-if="gamemode.aliases.length">
        <strong>Aliases:</strong>
        <span
          v-for="entry in gamemode.aliases"
          :key="entry.alias"
        >
          <code>{{ entry.alias }}</code> resolves to the same data as
          <code>{{ entry.canonical }}</code
          >.
        </span>
      </p>

      <table>
        <thead>
          <tr>
            <th>Raw key</th>
            <th>Display name</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="stat in gamemode.stats"
            :key="stat.rawKey"
          >
            <td>
              <code>{{ stat.rawKey }}</code>
            </td>
            <td>
              <code v-if="stat.displayName">{{ stat.displayName }}</code>
              <em v-else>leaderboard only</em>
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>
