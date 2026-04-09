<script setup>
defineProps({
  cols: { type: [String, Number], default: 2 },
})
</script>

<template>
  <div class="card-group" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
    <slot />
  </div>
</template>

<style scoped>
.card-group {
  display: grid;
  gap: 12px;
  margin: 16px 0;
}
@media (max-width: 640px) {
  .card-group { grid-template-columns: 1fr !important; }
}
</style>
