<template>
  <div class="columns">
    <slot />
  </div>
</template>

<style scoped>
.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin: 16px 0;
}
</style>
