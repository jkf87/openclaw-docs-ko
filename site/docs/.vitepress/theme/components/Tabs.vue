<script setup>
import { ref, provide } from 'vue'

const activeTab = ref(0)
provide('activeTab', activeTab)
provide('setActiveTab', (i: number) => { activeTab.value = i })

const tabLabels = ref<string[]>([])
provide('registerTab', (label: string) => {
  if (!tabLabels.value.includes(label)) {
    tabLabels.value.push(label)
  }
  return tabLabels.value.indexOf(label)
})
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button
        v-for="(label, i) in tabLabels"
        :key="label"
        :class="{ active: activeTab === i }"
        class="tab-button"
        @click="activeTab = i"
      >
        {{ label }}
      </button>
    </div>
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.tabs-container { margin: 16px 0; }
.tabs-header {
  display: flex;
  border-bottom: 2px solid var(--vp-c-divider);
  gap: 0;
}
.tab-button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  color: var(--vp-c-text-2);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}
.tab-button:hover { color: var(--vp-c-text-1); }
.tab-button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}
.tabs-content { padding-top: 12px; }
</style>
