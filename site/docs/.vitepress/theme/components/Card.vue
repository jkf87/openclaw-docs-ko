<script setup>
defineProps({
  title: { type: String, default: '' },
  href: { type: String, default: '' },
  icon: { type: String, default: '' },
})
</script>

<template>
  <component :is="href ? 'a' : 'div'" :href="href" class="card" :class="{ 'card-link': !!href }">
    <div class="card-header">
      <span v-if="icon" class="card-icon">{{ icon }}</span>
      <strong v-if="title">{{ title }}</strong>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin: 4px 0;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
  display: block;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card-link:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.card-icon { font-size: 1.2em; }
.card-body { font-size: 0.9em; color: var(--vp-c-text-2); }
</style>
