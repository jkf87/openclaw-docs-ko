<template>
  <div class="steps">
    <slot />
  </div>
</template>

<style scoped>
.steps {
  counter-reset: step-counter;
  padding-left: 8px;
  margin: 16px 0;
}
</style>
