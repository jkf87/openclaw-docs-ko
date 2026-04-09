<script setup>
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <div class="step">
    <div class="step-header">
      <span class="step-number"></span>
      <strong v-if="title">{{ title }}</strong>
    </div>
    <div class="step-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.step {
  counter-increment: step-counter;
  padding-left: 32px;
  position: relative;
  margin-bottom: 16px;
  border-left: 2px solid var(--vp-c-divider);
  padding-top: 4px;
  padding-bottom: 4px;
}
.step-header { margin-bottom: 8px; }
.step-number::before {
  content: counter(step-counter);
  position: absolute;
  left: -13px;
  top: 2px;
  width: 24px;
  height: 24px;
  background: var(--vp-c-brand-1);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
.step-content { font-size: 0.95em; }
</style>
