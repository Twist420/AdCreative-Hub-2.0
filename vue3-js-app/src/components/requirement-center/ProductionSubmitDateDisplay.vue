<script setup>
defineProps({
  date: {
    type: String,
    default: '',
  },
  badge: {
    type: Object,
    default: null,
  },
})

const formatCompactDate = (date) => String(date || '').replaceAll('-', '/')
</script>

<template>
  <div class="flex justify-center">
    <div class="relative inline-flex h-9 min-w-[118px] items-center justify-center rounded-xl border border-slate-150 bg-white px-3 text-[12px] font-black text-slate-800 shadow-3xs transition-all group-hover:border-indigo-150">
      <span class="whitespace-nowrap">{{ date ? formatCompactDate(date) : '-' }}</span>
      <span
        v-if="badge"
        :class="`absolute -right-2 -top-2 inline-flex h-5 items-center rounded-full border bg-white px-1.5 text-[9px] font-black shadow-3xs ${badge.className}`"
      >
        {{ badge.label }}
      </span>
    </div>
  </div>
</template>
