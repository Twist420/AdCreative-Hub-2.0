<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: {
    type: String,
    default: 'neutral',
  },
  label: {
    type: String,
    required: true,
  },
})

const toneClass = computed(() => {
  const map = {
    neutral: 'ad-pill-neutral',
    indigo: 'ad-pill-indigo',
    emerald: 'ad-pill-emerald',
    amber: 'ad-pill-amber',
    orange: 'ad-pill-orange',
    rose: 'ad-pill-rose',
    blue: 'ad-pill-blue',
    violet: 'ad-pill-violet',
  }

  return map[props.tone] || map.neutral
})
</script>

<template>
  <span class="ad-pill" :class="toneClass">
    <slot />
    <span>{{ label }}</span>
  </span>
</template>
