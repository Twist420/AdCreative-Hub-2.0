<script setup>
defineProps({
  tooltip: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div
    v-if="tooltip"
    class="pointer-events-none fixed z-[240] max-w-[380px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold leading-relaxed text-slate-700 shadow-xl shadow-slate-900/12"
    :style="{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }"
  >
    {{ tooltip.content }}
  </div>
</template>
