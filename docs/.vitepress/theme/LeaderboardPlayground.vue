<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { data } from '../data/pika-network-catalog.data';

const gamemodeOptions = data.gamemodes.map((g) => g.gamemode);

const gamemode = ref(
  gamemodeOptions.includes('bedwars') ? 'bedwars' : gamemodeOptions[0],
);
const interval = ref('total');
const offset = ref(0);
const limit = ref(25);
const copied = ref(false);

const activeGamemode = computed(() =>
  data.gamemodes.find((g) => g.gamemode === gamemode.value)!,
);

const stat = ref(activeGamemode.value.stats[0]?.rawKey ?? '');
const mode = ref(activeGamemode.value.modes[0] ?? '');

watch(gamemode, () => {
  stat.value = activeGamemode.value.stats[0]?.rawKey ?? '';
  mode.value = activeGamemode.value.modes[0] ?? '';
});

const requestUrl = computed(() => {
  const params = new URLSearchParams({
    type: gamemode.value,
    stat: stat.value,
    interval: interval.value,
    mode: mode.value,
    offset: String(offset.value),
    limit: String(limit.value),
  });
  return `https://stats.pika-network.net/api/leaderboards?${params.toString()}`;
});

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(requestUrl.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="craftify-playground">
    <div class="craftify-playground-header">
      <span class="craftify-playground-badge">GET</span>
      <span class="craftify-playground-path">/leaderboards</span>
    </div>

    <div class="craftify-playground-fields">
      <label>
        <span>type</span>
        <select v-model="gamemode">
          <option
            v-for="g in gamemodeOptions"
            :key="g"
            :value="g"
          >
            {{ g }}
          </option>
        </select>
      </label>

      <label>
        <span>stat</span>
        <select v-model="stat">
          <option
            v-for="s in activeGamemode.stats"
            :key="s.rawKey"
            :value="s.rawKey"
          >
            {{ s.rawKey }}
          </option>
        </select>
      </label>

      <label>
        <span>mode</span>
        <select v-model="mode">
          <option
            v-for="m in activeGamemode.modes"
            :key="m"
            :value="m"
          >
            {{ m }}
          </option>
        </select>
      </label>

      <label>
        <span>interval</span>
        <select v-model="interval">
          <option>total</option>
          <option>weekly</option>
          <option>monthly</option>
          <option>yearly</option>
        </select>
      </label>

      <label>
        <span>offset</span>
        <input
          v-model.number="offset"
          type="number"
          min="0"
          step="15"
        />
      </label>

      <label>
        <span>limit</span>
        <input
          v-model.number="limit"
          type="number"
          min="1"
          max="15"
        />
      </label>
    </div>

    <div class="craftify-playground-output">
      <code>{{ requestUrl }}</code>
      <div class="craftify-playground-actions">
        <button
          type="button"
          @click="copyUrl"
        >
          {{ copied ? 'copied' : 'copy' }}
        </button>
        <a
          :href="requestUrl"
          target="_blank"
          rel="noopener"
          >open</a
        >
      </div>
    </div>

    <p
      v-if="interval === 'yearly' && !activeGamemode.yearlyCapable"
      class="craftify-playground-warning"
    >
      <code>{{ gamemode }}</code> does not support <code>interval=yearly</code>. This
      request returns <code>200</code> with an empty result, not <code>400</code>.
    </p>
  </div>
</template>

<style scoped>
.craftify-playground {
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  padding: 20px;
  margin: 24px 0;
  background: var(--vp-c-bg-soft);
}

.craftify-playground-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-family: var(--vp-font-family-mono);
}

.craftify-playground-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  background: var(--vp-badge-info-bg);
  color: var(--vp-badge-info-text);
  border: 1px solid var(--vp-badge-info-border);
}

.craftify-playground-path {
  font-weight: 600;
}

.craftify-playground-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.craftify-playground-fields label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.craftify-playground-fields select,
.craftify-playground-fields input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  padding: 6px 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  transition: border-color 0.2s ease;
}

.craftify-playground-fields select:focus,
.craftify-playground-fields input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.craftify-playground-output {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 2px;
  background: var(--vp-code-block-bg);
  overflow-x: auto;
}

.craftify-playground-output code {
  flex: 1;
  white-space: nowrap;
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
}

.craftify-playground-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.craftify-playground-actions button,
.craftify-playground-actions a {
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  padding: 4px 10px;
  font-size: 0.75rem;
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.craftify-playground-actions button:hover,
.craftify-playground-actions a:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.craftify-playground-warning {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--vp-c-warning-1);
}
</style>
