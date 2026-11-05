<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const progress = ref(0);
let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let frame = 0;
let observedArticle: HTMLElement | null = null;
let observedOutline: HTMLElement | null = null;

function updateProgress(): void {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    progress.value = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

    const outline = document.querySelector<HTMLElement>('.VPDocAsideOutline');
    const content = outline?.querySelector<HTMLElement>('.content');
    const list = content?.querySelector<HTMLElement>('.VPDocOutlineItem.root');
    const article = document.querySelector<HTMLElement>('.VPDoc .vp-doc');

    if (!content || !list || !article) return;

    const contentRect = content.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const articleRect = article.getBoundingClientRect();
    const articleTop = articleRect.top + window.scrollY;
    const articleTravel = Math.max(1, articleRect.height - window.innerHeight);
    const articleProgress = Math.min(
      1,
      Math.max(0, (window.scrollY - articleTop) / articleTravel),
    );
    const markerHeight = Math.min(24, Math.max(14, listRect.height / 12));
    const markerStart = listRect.top - contentRect.top;
    const markerTravel = Math.max(0, listRect.height - markerHeight);

    content.style.setProperty('--craftify-outline-start', `${markerStart}px`);
    content.style.setProperty('--craftify-outline-track-height', `${listRect.height}px`);
    content.style.setProperty('--craftify-outline-height', `${markerHeight}px`);
    content.style.setProperty(
      '--craftify-outline-offset',
      `${markerTravel * articleProgress}px`,
    );
  });
}

function observeLayout(): void {
  const article = document.querySelector<HTMLElement>('.VPDoc .vp-doc');
  const outline = document.querySelector<HTMLElement>('.VPDocAsideOutline .content');

  if (article !== observedArticle) {
    if (observedArticle) resizeObserver?.unobserve(observedArticle);
    observedArticle = article;
    if (observedArticle) resizeObserver?.observe(observedArticle);
  }

  if (outline !== observedOutline) {
    if (observedOutline) resizeObserver?.unobserve(observedOutline);
    observedOutline = outline;
    if (observedOutline) resizeObserver?.observe(observedOutline);
  }

  updateProgress();
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  resizeObserver = new ResizeObserver(updateProgress);
  resizeObserver.observe(document.documentElement);
  mutationObserver = new MutationObserver(observeLayout);
  mutationObserver.observe(document.querySelector('#app') ?? document.body, {
    childList: true,
    subtree: true,
  });
  observeLayout();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress);
  window.removeEventListener('resize', updateProgress);
  mutationObserver?.disconnect();
  resizeObserver?.disconnect();
  cancelAnimationFrame(frame);
});
</script>

<template>
  <div
    class="craftify-scroll-progress"
    :style="{ '--craftify-scroll-progress': `${progress}%` }"
    aria-hidden="true"
  />
</template>
