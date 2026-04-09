<script setup>
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <details class="accordion">
    <summary>{{ title }}</summary>
    <div class="accordion-content">
      <slot />
    </div>
  </details>
</template>

<style scoped>
.accordion {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 8px 0;
  padding: 0;
  overflow: hidden;
}
.accordion summary {
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  user-select: none;
}
.accordion summary:hover { background: var(--vp-c-bg-mute); }
.accordion-content { padding: 12px 16px; }
</style>
