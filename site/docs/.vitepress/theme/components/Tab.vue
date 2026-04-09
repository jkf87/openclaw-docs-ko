<script setup>
import { inject, ref, onMounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
})

const activeTab = inject<import('vue').Ref<number>>('activeTab', ref(0))
const registerTab = inject<(label: string) => number>('registerTab', () => 0)
const index = ref(-1)

onMounted(() => {
  index.value = registerTab(props.title)
})
</script>

<template>
  <div v-show="activeTab === index" class="tab-panel">
    <slot />
  </div>
</template>
