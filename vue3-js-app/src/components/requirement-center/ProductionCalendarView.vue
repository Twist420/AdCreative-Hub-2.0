<script setup>
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'

const props = defineProps({
  calendarYear: { type: Number, required: true },
  calendarMonth: { type: Number, required: true },
  calendarWeeks: { type: Array, default: () => [] },
  productionTasks: { type: Array, default: () => [] },
  selectedProducers: { type: Array, default: () => [] },
  activeProducers: { type: Array, default: () => [] },
  isProducerFilterOpen: { type: Boolean, default: false },
})

const emit = defineEmits([
  'jump-today',
  'prev-month',
  'next-month',
  'toggle-producer-filter',
  'clear-producers',
  'toggle-producer',
  'open-requirement',
])

const parseDateValue = (dateString) => new Date(`${dateString}T00:00:00`).getTime()

const rangesOverlap = (start, end, rangeStart, rangeEnd) => {
  const sourceStart = parseDateValue(start || end)
  const sourceEnd = parseDateValue(end || start)
  const targetStart = parseDateValue(rangeStart)
  const targetEnd = parseDateValue(rangeEnd)
  return sourceStart <= targetEnd && sourceEnd >= targetStart
}

const priorityOrder = {
  Highest: 0,
  High: 1,
  Mid: 2,
  Low: 3,
  '': 4,
}

const getTaskPriorityRank = (task) => priorityOrder[task.requirement?.priority || ''] ?? 4

const getVisibleWeekTasks = (week) =>
  props.productionTasks
    .filter((task) => (props.selectedProducers.length === 0 || props.selectedProducers.includes(task.producer)) && rangesOverlap(task.startDate, task.endDate, week.days[0].dateString, week.days[6].dateString))
    .sort((a, b) => getTaskPriorityRank(a) - getTaskPriorityRank(b) || String(a.startDate || '').localeCompare(String(b.startDate || '')))
    .slice(0, 5)

const isTaskStartInWeek = (task, week) => parseDateValue(task.startDate) >= parseDateValue(week.days[0].dateString)
const isTaskEndInWeek = (task, week) => parseDateValue(task.endDate) <= parseDateValue(week.days[6].dateString)
</script>

<template>
  <div class="rounded-2xl border border-slate-150 bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div class="flex items-center gap-2">
        <button type="button" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" @click="emit('jump-today')">
          今天
        </button>
        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700" @click="emit('prev-month')">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700" @click="emit('next-month')">
          <ChevronRight class="h-4 w-4" />
        </button>
        <div class="ml-2 text-sm font-black text-slate-800">{{ calendarYear }}年{{ calendarMonth }}月</div>

        <div class="relative ml-2">
          <button
            type="button"
            :class="`inline-flex h-8 min-w-[104px] items-center justify-between gap-2 rounded-xl border px-3 text-[10px] font-black shadow-3xs transition-all ${
              selectedProducers.length > 0
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
            }`"
            @click="emit('toggle-producer-filter')"
          >
            <PersonParts v-if="selectedProducers.length === 1" :name="selectedProducers[0]" size="xs" />
            <span v-else class="truncate">{{ selectedProducers.length === 0 ? '全部人员' : `${selectedProducers.length} 人` }}</span>
            <ChevronDown :class="`h-3.5 w-3.5 shrink-0 transition-transform ${isProducerFilterOpen ? 'rotate-180' : ''}`" />
          </button>

          <div v-if="isProducerFilterOpen" class="absolute left-0 top-full z-[130] mt-2 max-h-72 w-40 overflow-y-auto rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
            <button
              type="button"
              :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${selectedProducers.length === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`"
              @click="emit('clear-producers')"
            >
              <span>全部人员</span>
              <Check v-if="selectedProducers.length === 0" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
            </button>
            <div class="my-1 h-px bg-slate-100" />
            <button
              v-for="producer in activeProducers"
              :key="producer.name"
              type="button"
              :class="`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${selectedProducers.includes(producer.name) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`"
              @click="emit('toggle-producer', producer.name)"
            >
              <span
                :class="`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                  selectedProducers.includes(producer.name) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 bg-white text-transparent'
                }`"
              >
                <Check class="h-3 w-3 stroke-[3]" />
              </span>
              <PersonParts :name="producer.name" size="xs" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[10px] font-black">
        <span class="rounded-lg px-3 py-1.5 text-slate-400">日</span>
        <span class="rounded-lg px-3 py-1.5 text-slate-400">周</span>
        <span class="rounded-lg bg-white px-3 py-1.5 text-indigo-600 shadow-xs">月</span>
      </div>
    </div>

    <div class="grid grid-cols-7 border-b border-slate-100 text-[10px] font-black text-slate-500">
      <div v-for="weekday in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="weekday" class="px-3 py-2">
        {{ weekday }}
      </div>
    </div>

    <div>
      <div v-for="(week, weekIndex) in calendarWeeks" :key="week.days[0].dateString" class="relative grid min-h-[168px] grid-cols-7 overflow-visible border-b border-slate-100">
        <div
          v-for="day in week.days"
          :key="day.dateString"
          :class="`min-h-[168px] border-r border-slate-100 p-2 ${day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60'} ${day.isWeekend ? 'bg-slate-50' : ''}`"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <span :class="`flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-black ${day.isToday ? 'bg-indigo-600 text-white' : day.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`">
              {{ day.dayNum === 1 && day.isCurrentMonth ? `${calendarMonth}月1日` : day.dayNum }}
            </span>
            <span v-if="productionTasks.filter((task) => (selectedProducers.length === 0 || selectedProducers.includes(task.producer)) && rangesOverlap(task.startDate, task.endDate, day.dateString, day.dateString)).length > 0" class="text-[9px] font-bold text-slate-300">
              {{ productionTasks.filter((task) => (selectedProducers.length === 0 || selectedProducers.includes(task.producer)) && rangesOverlap(task.startDate, task.endDate, day.dateString, day.dateString)).length }} 条
            </span>
          </div>
        </div>

        <div class="pointer-events-none absolute inset-x-0 top-9 z-10">
          <button
            v-for="(task, laneIndex) in getVisibleWeekTasks(week)"
            :key="`${weekIndex}-${task.id}`"
            type="button"
            :class="`pointer-events-auto absolute flex h-6 items-center truncate px-2 text-left text-[10px] font-black shadow-3xs transition-all hover:z-20 hover:ring-2 hover:ring-indigo-100 ${
              task.requirement.priority === 'Highest'
                ? 'bg-rose-100 text-rose-700'
                : task.status === '已完成'
                  ? 'bg-slate-100 text-slate-500'
                  : task.role.includes('平面')
                    ? 'bg-lime-100 text-lime-800'
                    : 'bg-sky-100 text-sky-800'
            } ${isTaskStartInWeek(task, week) ? 'rounded-l-md' : 'rounded-l-none'} ${isTaskEndInWeek(task, week) ? 'rounded-r-md' : 'rounded-r-none'}`"
            :style="{
              left: `calc(${Math.max(0, Math.floor((Math.max(parseDateValue(task.startDate), parseDateValue(week.days[0].dateString)) - parseDateValue(week.days[0].dateString)) / 86400000)) / 7 * 100}% + 8px)`,
              top: `${laneIndex * 26}px`,
              width: `calc(${Math.max(1, Math.floor((Math.min(parseDateValue(task.endDate), parseDateValue(week.days[6].dateString)) - Math.max(parseDateValue(task.startDate), parseDateValue(week.days[0].dateString))) / 86400000) + 1) / 7 * 100}% - 16px)`,
            }"
            :title="`${task.displayRequirementId} / ${task.requirement.name} / ${task.producer}`"
            @click="emit('open-requirement', task.requirement)"
          >
            {{ task.displayRequirementId }}
            <span class="ml-1 font-bold opacity-70">{{ task.producer }}</span>
            <span class="ml-1 font-bold opacity-70">{{ task.role }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
