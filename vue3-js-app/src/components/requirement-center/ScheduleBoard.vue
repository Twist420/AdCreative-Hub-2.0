<script setup>
import { Calendar, Plus } from 'lucide-vue-next'
import CoordinatedDirectionCardExact from './CoordinatedDirectionCardExact.vue'

defineProps({
  schedules: { type: Array, default: () => [] },
  editingScheduleId: { default: null },
  todayDateString: { type: String, required: true },
  getScheduleRequirements: { type: Function, required: true },
  getScheduleInsight: { type: Function, required: true },
  showInstantTooltip: { type: Function, default: null },
})

const emit = defineEmits([
  'open-detail',
  'open-requirement',
  'edit',
  'save',
  'delete',
  'add-requirement',
  'update-schedule',
  'add-schedule',
  'clear-instant-tooltip',
])
</script>

<template>
  <div class="min-h-0 flex-1 overflow-auto space-y-3 pb-4 no-scrollbar">
    <div
      v-if="schedules.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 py-16 text-center shadow-sm"
    >
      <Calendar class="mb-2 h-10 w-10 text-slate-200" />
      <p class="text-xs font-bold text-slate-400">目前选定条件暂无具体排期，请调整勾选周期/筛选条件，或点击新周期开始</p>
    </div>
    <div v-else class="grid min-w-[1360px] grid-cols-4 items-start gap-4 pb-2">
      <CoordinatedDirectionCardExact
        v-for="schedule in schedules"
        :key="schedule.id"
        :schedule="schedule"
        :requirements="getScheduleRequirements(schedule.id)"
        :schedule-insight="getScheduleInsight(schedule.id)"
        :is-editing="editingScheduleId === schedule.id"
        :today-date-string="todayDateString"
        :show-instant-tooltip="showInstantTooltip"
        @open-detail="emit('open-detail', $event)"
        @open-requirement="emit('open-requirement', $event)"
        @edit="emit('edit', $event)"
        @save="emit('save')"
        @delete="emit('delete', $event)"
        @add-requirement="emit('add-requirement', $event)"
        @update-schedule="(id, updates) => emit('update-schedule', id, updates)"
        @clear-instant-tooltip="emit('clear-instant-tooltip')"
      />
    </div>

    <div
      class="group flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-3 transition-all hover:border-primary hover:bg-slate-50/50"
      @click="emit('add-schedule')"
    >
      <Plus class="h-4 w-4 text-slate-400 transition-all group-hover:scale-105 group-hover:text-primary" />
      <span class="text-[11px] font-bold text-slate-500 transition-colors group-hover:text-primary">创建新的创意排期方向</span>
    </div>
  </div>
</template>
