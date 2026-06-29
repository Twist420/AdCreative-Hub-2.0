<script setup>
import { computed } from 'vue'
import { channelDisplayName, normalizeChannels } from './channel'

const props = defineProps({
  channels: {
    type: Array,
    default: () => [],
  },
  maxVisible: {
    type: Number,
    default: 2,
  },
})

const labels = computed(() => normalizeChannels(props.channels.length > 0 ? props.channels : ['all']).map(channelDisplayName))
const visibleLabels = computed(() => labels.value.slice(0, props.maxVisible))
const hiddenCount = computed(() => Math.max(0, labels.value.length - visibleLabels.value.length))
</script>

<template>
  <div class="group/channel relative mx-auto flex max-w-[180px] items-center justify-center gap-1 overflow-visible">
    <div class="flex max-w-[180px] items-center justify-center gap-1 overflow-hidden">
      <span
        v-for="label in visibleLabels"
        :key="label"
        class="max-w-[72px] truncate rounded-full border border-slate-150 bg-slate-50 px-2.5 py-1 text-[9px] font-black text-slate-500"
      >
        {{ label }}
      </span>
      <span
        v-if="hiddenCount > 0"
        class="rounded-full border border-slate-150 bg-white px-2 py-1 text-[9px] font-black text-slate-400"
      >
        ...
      </span>
    </div>
    <span class="pointer-events-none absolute left-1/2 top-full z-[120] mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-lg group-hover/channel:block">
      {{ labels.join('、') }}
    </span>
  </div>
</template>
