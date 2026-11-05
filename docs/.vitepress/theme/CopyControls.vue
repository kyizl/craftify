<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

const copyTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();
const originalLabels = new WeakMap<
  HTMLButtonElement,
  { ariaLabel: string | null; title: string | null }
>();
function getCopyText(button: HTMLButtonElement): string | null {
  const container = button.parentElement;
  const code = button.nextElementSibling?.nextElementSibling;
  if (!container || !code) return null;

  const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(container.className);
  const clone = code.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll('.vp-copy-ignore, .diff.remove')
    .forEach((node) => node.remove());

  let text = clone.textContent ?? '';
  if (isShell) text = text.replace(/^ *(\$|>) /gm, '').trim();
  return text;
}

function announce(button: HTMLButtonElement, message: string): void {
  let status = button.parentElement?.querySelector<HTMLElement>(
    '.craftify-copy-announcement',
  );
  if (!status && button.parentElement) {
    status = document.createElement('span');
    status.className = 'craftify-copy-announcement';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    button.parentElement.append(status);
  }
  if (status) status.textContent = message;
}

function setState(button: HTMLButtonElement, state: 'copied' | 'failed'): void {
  const previousTimer = copyTimers.get(button);
  if (previousTimer) clearTimeout(previousTimer);

  const labels = originalLabels.get(button) ?? {
    ariaLabel: button.getAttribute('aria-label'),
    title: button.getAttribute('title'),
  };
  originalLabels.set(button, labels);
  button.classList.remove('copied', 'copy-failed');

  if (state === 'copied') {
    button.classList.add('copied');
    button.setAttribute('aria-label', 'Code copied to clipboard');
    button.setAttribute('title', 'Copied');
    announce(button, 'Code copied to clipboard.');
  } else {
    button.classList.add('copy-failed');
    button.setAttribute(
      'aria-label',
      'Copy failed. Select the code and copy it manually.',
    );
    button.setAttribute('title', 'Copy failed');
    announce(button, 'Copy failed. Select the code and copy it manually.');
  }

  if (state === 'copied') {
    const timer = setTimeout(() => {
      button.classList.remove('copied');
      if (labels.ariaLabel === null) button.removeAttribute('aria-label');
      else button.setAttribute('aria-label', labels.ariaLabel);
      if (labels.title === null) button.removeAttribute('title');
      else button.setAttribute('title', labels.title);
      announce(button, '');
      copyTimers.delete(button);
    }, 2000);
    copyTimers.set(button, timer);
  }
}

async function copyCode(button: HTMLButtonElement): Promise<void> {
  const text = getCopyText(button);
  if (text === null) return;

  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    setState(button, 'copied');
    return;
  } catch {
    // Continue with the selection-based fallback for denied or unavailable clipboard APIs.
  }

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
  } catch {
    copied = false;
  } finally {
    textarea.remove();
    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
    if (activeElement instanceof HTMLElement) activeElement.focus();
  }

  setState(button, copied ? 'copied' : 'failed');
}

function handleClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>(
    'div[class*="language-"] > button.copy',
  );
  if (!button) return;

  event.preventDefault();
  event.stopPropagation();
  void copyCode(button);
}

onMounted(() => {
  window.addEventListener('click', handleClick, true);
});
onBeforeUnmount(() => {
  window.removeEventListener('click', handleClick, true);
});
</script>

<template>
  <span
    class="craftify-copy-controls"
    aria-hidden="true"
  />
</template>
