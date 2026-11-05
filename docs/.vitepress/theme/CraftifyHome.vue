<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  document.querySelector('.VPHome')?.setAttribute('role', 'main');
});
</script>

<template>
  <div class="craftify-home-content">
    <section
      class="craftify-home-intro"
      aria-labelledby="craftify-quickstart-title"
    >
      <div class="craftify-home-intro-copy">
        <p class="craftify-home-eyebrow">A QUICK START</p>
        <h2 id="craftify-quickstart-title">Make your first request.</h2>
        <p>
          Install Craftify, create a client and work with validated player data using
          familiar TypeScript.
        </p>
      </div>

      <div
        class="craftify-home-terminal"
        role="region"
        aria-label="TypeScript quick-start example"
      >
        <div class="craftify-terminal-bar">
          <span class="craftify-terminal-file">quick-start.ts</span>
        </div>
        <pre><code><span class="token-keyword">import</span> { <span class="token-class">PikaNetworkClient</span>, <span class="token-class">Gamemode</span> } <span class="token-keyword">from</span> <span class="token-string">'@kyizl/craftify'</span>;

<span class="token-keyword">const</span> client = <span class="token-keyword">new</span> <span class="token-class">PikaNetworkClient</span>({
  apiKey: process.env.<span class="token-property">PIKA_API_KEY</span>,
});

<span class="token-keyword">const</span> profile = <span class="token-keyword">await</span> client.<span class="token-method">getProfile</span>(<span class="token-string">'JustThiemo'</span>);
<span class="token-keyword">const</span> stats = <span class="token-keyword">await</span> client.<span class="token-method">getProfileStats</span>({
  username: profile.username,
  gamemode: Gamemode.BedWars,
});</code></pre>
      </div>
    </section>

    <section
      class="craftify-home-capabilities"
      aria-labelledby="craftify-capabilities-title"
    >
      <div class="craftify-home-section-heading">
        <p class="craftify-home-eyebrow">THE CLIENT</p>
        <h2 id="craftify-capabilities-title">Everything important, handled.</h2>
      </div>

      <div class="craftify-home-feature-grid">
        <article class="craftify-home-feature">
          <span class="craftify-feature-index">01</span>
          <h3>Runtime validation</h3>
          <p>
            Zod schemas validate upstream payloads at the boundary and surface malformed
            responses as clear errors.
          </p>
        </article>
        <article class="craftify-home-feature">
          <span class="craftify-feature-index">02</span>
          <h3>Useful TypeScript types</h3>
          <p>
            Exported gamemodes, modes, stats and intervals provide precise types and
            editor autocomplete.
          </p>
        </article>
        <article class="craftify-home-feature">
          <span class="craftify-feature-index">03</span>
          <h3>Predictable requests</h3>
          <p>
            Throttling, bounded retries, caching hooks and structured errors keep network
            behavior manageable.
          </p>
        </article>
        <article class="craftify-home-feature">
          <span class="craftify-feature-index">04</span>
          <h3>Batch operations</h3>
          <p>
            Run related lookups with bounded concurrency and control how individual
            failures are reported.
          </p>
        </article>
      </div>
    </section>

    <nav
      class="craftify-home-navigation"
      aria-labelledby="craftify-navigation-title"
    >
      <div class="craftify-home-paths-heading">
        <p class="craftify-home-eyebrow">EXPLORE</p>
        <h2 id="craftify-navigation-title">Documentation</h2>
      </div>
      <div class="craftify-home-links">
        <a href="/guide/getting-started">
          <span class="craftify-home-link-index">01</span>
          <span>
            <strong>Getting started</strong>
            <small>Install, configure and make your first request.</small>
          </span>
          <span aria-hidden="true">↗</span>
        </a>
        <a href="/api/">
          <span class="craftify-home-link-index">02</span>
          <span>
            <strong>TypeScript API</strong>
            <small>Browse exported methods, types and schemas.</small>
          </span>
          <span aria-hidden="true">↗</span>
        </a>
        <a href="/pika-network-api/overview">
          <span class="craftify-home-link-index">03</span>
          <span>
            <strong>HTTP API reference</strong>
            <small>Explore upstream endpoints and response schemas.</small>
          </span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </nav>
  </div>
</template>
