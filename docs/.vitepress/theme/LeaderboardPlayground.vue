<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { data } from '../data/pika-network-catalog.data';

const gamemodeOptions = data.gamemodes.map((g) => g.gamemode);

const gamemode = ref(
  gamemodeOptions.includes('bedwars') ? 'bedwars' : gamemodeOptions[0],
);
const interval = ref('total');
const offset = ref(0);
const limit = ref(10);
const copied = ref(false);
const copyMessage = ref('');
let copyTimer: ReturnType<typeof setTimeout> | undefined;

const activeGamemode = computed(() =>
  data.gamemodes.find((g) => g.gamemode === gamemode.value)!,
);

const stat = ref(activeGamemode.value.stats[0]?.rawKey ?? '');
const mode = ref(activeGamemode.value.modes[0] ?? '');

watch(gamemode, () => {
  stat.value = activeGamemode.value.stats[0]?.rawKey ?? '';
  mode.value = activeGamemode.value.modes[0] ?? '';
  if (!activeGamemode.value.yearlyCapable && interval.value === 'yearly') {
    interval.value = 'total';
  }
});

const intervals = computed(() =>
  activeGamemode.value.yearlyCapable
    ? ['weekly', 'monthly', 'yearly', 'total']
    : ['weekly', 'monthly', 'total'],
);

const offsetError = computed(() =>
  Number.isInteger(offset.value) && offset.value >= 0
    ? ''
    : 'Offset must be a whole number greater than or equal to 0.',
);
const limitError = computed(() =>
  Number.isInteger(limit.value) && limit.value >= 1 && limit.value <= 25
    ? ''
    : 'Limit must be a whole number between 1 and 25.',
);
const validationErrors = computed(() =>
  [offsetError.value, limitError.value].filter(Boolean),
);
const hasValidationErrors = computed(() => validationErrors.value.length > 0);

async function writeClipboardText(text: string): Promise<void> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const activeElement = document.activeElement;
    const selection = document.getSelection();
    const originalRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    textarea.style.fontSize = '16px';
    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } finally {
      textarea.remove();
      if (originalRange && selection) {
        selection.removeAllRanges();
        selection.addRange(originalRange);
      }
      if (activeElement instanceof HTMLElement) activeElement.focus();
    }

    if (!copied) throw new Error('Clipboard fallback failed');
  }
}

const requestUrl = computed(() => {
  const safeOffset = Math.max(
    0,
    Math.trunc(Number.isFinite(offset.value) ? offset.value : 0),
  );
  const safeLimit = Math.min(
    25,
    Math.max(1, Math.trunc(Number.isFinite(limit.value) ? limit.value : 10)),
  );
  const params = new URLSearchParams({
    type: gamemode.value,
    stat: stat.value,
    interval: interval.value,
    offset: String(safeOffset),
    limit: String(safeLimit),
  });
  if (mode.value) params.set('mode', mode.value);
  return `https://stats.pika-network.net/api/leaderboards?${params.toString()}`;
});

async function copyUrl() {
  if (copyTimer) {
    clearTimeout(copyTimer);
    copyTimer = undefined;
  }
  copied.value = false;
  copyMessage.value = '';

  try {
    await writeClipboardText(requestUrl.value);
    copied.value = true;
    copyMessage.value = 'Request URL copied to clipboard.';
    copyTimer = setTimeout(() => {
      copied.value = false;
      copyMessage.value = '';
      copyTimer = undefined;
    }, 1800);
  } catch {
    copyMessage.value =
      'Clipboard access is unavailable. Select the URL above and copy it manually.';
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer);
});
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
          <option
            v-for="value in intervals"
            :key="value"
            :value="value"
          >
            {{ value }}
          </option>
        </select>
      </label>

      <label>
        <span>offset</span>
        <input
          v-model.number="offset"
          type="number"
          min="0"
          step="1"
          :aria-invalid="Boolean(offsetError)"
          :aria-describedby="offsetError ? 'craftify-offset-error' : undefined"
        />
        <span
          v-if="offsetError"
          id="craftify-offset-error"
          class="craftify-field-error"
        >
          {{ offsetError }}
        </span>
      </label>

      <label>
        <span>limit</span>
        <input
          v-model.number="limit"
          type="number"
          min="1"
          max="25"
          step="1"
          :aria-invalid="Boolean(limitError)"
          :aria-describedby="limitError ? 'craftify-limit-error' : undefined"
        />
        <span
          v-if="limitError"
          id="craftify-limit-error"
          class="craftify-field-error"
        >
          {{ limitError }}
        </span>
      </label>
    </div>

    <div class="craftify-playground-output">
      <code aria-label="Generated leaderboard request URL">{{ requestUrl }}</code>
      <div class="craftify-playground-actions">
        <button
          type="button"
          @click="copyUrl"
          :disabled="hasValidationErrors"
          :aria-label="copied ? 'Request URL copied' : 'Copy request URL'"
        >
          {{ copied ? 'copied' : 'copy URL' }}
        </button>
        <a
          :href="
            hasValidationErrors ? undefined : '/pika-network-api/endpoints#leaderboards'
          "
          :aria-disabled="hasValidationErrors"
          :tabindex="hasValidationErrors ? -1 : 0"
          >endpoint docs</a
        >
      </div>
    </div>

    <p
      class="craftify-playground-status"
      role="status"
      aria-live="polite"
    >
      {{ copyMessage }}
    </p>

    <p
      v-if="validationErrors.length"
      class="craftify-playground-warning"
      role="alert"
    >
      {{ validationErrors.join(' ') }} Correct the highlighted values to copy or open this
      request.
    </p>

    <p
      v-if="!stat || !mode"
      class="craftify-playground-warning"
    >
      This gamemode does not expose a stat or mode option in the local catalog. Check the
      official endpoint reference before sending this request.
    </p>
  </div>
</template>
