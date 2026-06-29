<script setup>
import { AlertCircle, Calendar, ExternalLink, Layers, Users } from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'

defineProps({
  productionView: { type: String, default: 'gantt' },
  delayedCount: { type: Number, default: 0 },
  selectedProducers: { type: Array, default: () => [] },
})

const emit = defineEmits(['production-view-change', 'open-risk-modal', 'clear-selected-producers'])
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Calendar class="h-5 w-5 text-indigo-550" />
      </div>
      <div>
        <h2 class="text-sm font-black leading-tight text-slate-800">制作排期</h2>
        <p class="mt-0.5 text-[10px] font-bold text-slate-400">用于手动排期时查看人员占用、任务风险和团队工时负荷</p>
      </div>
    </div>

    <div class="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
      <button
        v-for="tab in [
          { id: 'gantt', label: '甘特视图', icon: Layers },
          { id: 'calendar', label: '日历视图', icon: Calendar },
          { id: 'capacity', label: '岗位产能', icon: Users },
        ]"
        :key="tab.id"
        :class="`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all ${
          productionView === tab.id ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
        }`"
        type="button"
        @click="emit('production-view-change', tab.id)"
      >
        <component :is="tab.icon" class="h-3.5 w-3.5" />
        {{ tab.label }}
      </button>
    </div>
  </div>

  <div v-if="delayedCount > 0" class="shrink-0 rounded-2xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-[10px] font-bold text-rose-700 shadow-3xs">
    <button type="button" class="flex w-full items-center justify-between gap-3 text-left" @click="emit('open-risk-modal')">
      <span class="flex min-w-0 items-center gap-2">
        <AlertCircle class="h-3.5 w-3.5 shrink-0 text-rose-500" />
        <span class="shrink-0 font-black">排期预警</span>
        <span class="truncate text-rose-500/80">{{ delayedCount }} 个已延期需求</span>
        <span class="hidden truncate text-slate-400 lg:inline">点击查看延期需求</span>
      </span>
      <span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-rose-500">
        查看
        <ExternalLink class="h-3 w-3" />
      </span>
    </button>
  </div>

  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 class="text-sm font-black text-slate-900">
        {{ productionView === 'capacity' ? '岗位 / 人员产能视图' : productionView === 'calendar' ? '日历视图' : '甘特视图' }}
      </h3>
      <p class="mt-1 text-[10px] font-bold text-slate-400">
        {{ productionView === 'capacity' ? '先按岗位判断未来 7 天占用，点击人员可切到日历定位。' : '手动排期时查看人员占用，同一天同一人可显示多条任务。' }}
      </p>
      <div v-if="productionView !== 'capacity' && selectedProducers.length > 0" class="mt-2 flex flex-wrap items-center gap-1.5">
        <span class="text-[10px] font-black text-slate-400">当前筛选:</span>
        <PersonParts v-for="person in selectedProducers" :key="person" :name="person" size="xs" class-name="rounded-xl border border-indigo-100 bg-indigo-50 px-1.5 py-0.5" />
      </div>
    </div>
    <button
      v-if="productionView !== 'capacity' && selectedProducers.length > 0"
      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
      type="button"
      @click="emit('clear-selected-producers')"
    >
      清除定位
    </button>
  </div>
</template>
