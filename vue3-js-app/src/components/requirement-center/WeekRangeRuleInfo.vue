<script setup>
import { Info } from 'lucide-vue-next'

defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span
    :class="`group/rule relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-white/70 hover:text-indigo-500 ${className}`"
    aria-label="查看周期显示规则"
    role="button"
    @click.stop
  >
    <Info class="h-3.5 w-3.5" />
    <span class="pointer-events-none absolute left-1/2 top-full z-[180] mt-2 hidden w-64 -translate-x-1/2 rounded-2xl border border-slate-150 bg-white p-3 text-left text-[10px] font-bold leading-relaxed text-slate-500 shadow-2xl shadow-slate-900/10 group-hover/rule:block">
      <span class="block text-[11px] font-black text-slate-800">周期显示规则</span>
      <span class="mt-2 block">橙色框：未来周期</span>
      <span class="block">绿色框：当前周期</span>
      <span class="block">灰色框：过去周期</span>
      <span class="mt-1 block pl-3 text-slate-400">- 灰色点：过去周期所有方向已完成</span>
      <span class="block pl-3 text-slate-400">- 红色点：过去周期存在方向未完成</span>
    </span>
  </span>
</template>
