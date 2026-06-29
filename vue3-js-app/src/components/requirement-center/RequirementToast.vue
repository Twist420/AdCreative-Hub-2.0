<script setup>
import { AlertCircle } from 'lucide-vue-next'

defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div
    v-if="message"
    class="fixed right-6 top-6 z-[220] max-w-sm rounded-2xl border border-amber-100 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-2xl shadow-slate-900/12"
  >
    <div class="flex items-start gap-2">
      <AlertCircle class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <span class="leading-relaxed">{{ message }}</span>
    </div>
  </div>
</template>
