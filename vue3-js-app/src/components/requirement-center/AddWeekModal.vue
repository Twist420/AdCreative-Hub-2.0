<script setup>
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { getDateRangeDays, parseDateValue } from './dateUtils'

const props = defineProps({
  todayDateString: {
    type: String,
    required: true,
  },
  calendarYear: {
    type: Number,
    required: true,
  },
  calendarMonth: {
    type: Number,
    required: true,
  },
  calendarWeeks: {
    type: Array,
    default: () => [],
  },
  newWeekStart: {
    type: String,
    default: '',
  },
  newWeekEnd: {
    type: String,
    default: '',
  },
  newWeekRange: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'jump-today', 'prev-month', 'next-month', 'select-day', 'confirm'])

const dayClass = (day) => {
  const dayTime = parseDateValue(day.dateString) || 0
  const startTime = parseDateValue(props.newWeekStart)
  const endTime = parseDateValue(props.newWeekEnd)
  const isStart = day.dateString === props.newWeekStart
  const isEnd = day.dateString === props.newWeekEnd
  const isInRange = startTime !== null && endTime !== null && dayTime >= startTime && dayTime <= endTime

  if (isStart || isEnd) return 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
  if (isInRange) return 'border-indigo-100 bg-indigo-50 text-indigo-700'
  if (day.isToday) return 'border-indigo-300 bg-white text-indigo-700 ring-2 ring-indigo-100'
  if (day.isCurrentMonth) return 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600'
  return 'border-transparent bg-transparent text-slate-300 hover:bg-white/70'
}
</script>

<template>
  <div class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm">
    <div class="flex w-full max-w-[420px] flex-col gap-5 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-black text-slate-900">创建排期周期</h3>
          <p class="mt-1 text-[11px] font-bold text-slate-400">点击开始日期，再点击结束日期。</p>
        </div>
        <button class="rounded-xl border border-slate-200 p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700" type="button" @click="emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
        <div class="flex items-center gap-2">
          <Calendar class="h-4 w-4 text-indigo-600" />
          <span class="text-[11px] font-black text-slate-500">今天</span>
          <span class="font-mono text-xs font-black text-indigo-700">{{ todayDateString }}</span>
        </div>
        <button class="rounded-lg border border-indigo-100 bg-white px-2.5 py-1 text-[10px] font-black text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-50" type="button" @click="emit('jump-today')">
          回到今天
        </button>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
        <div class="mb-3 flex items-center justify-between">
          <button class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-200 hover:text-indigo-600" type="button" @click="emit('prev-month')">
            <ChevronLeft class="h-4 w-4" />
          </button>
          <div class="text-sm font-black text-slate-800">{{ calendarYear }} 年 {{ calendarMonth }} 月</div>
          <button class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-200 hover:text-indigo-600" type="button" @click="emit('next-month')">
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>

        <div class="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400">
          <span v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="py-1">{{ day }}</span>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <template v-for="week in calendarWeeks" :key="week.days[0].dateString">
            <button
              v-for="day in week.days"
              :key="day.dateString"
              :class="`relative h-9 rounded-xl border text-[11px] font-black transition-all ${dayClass(day)}`"
              type="button"
              :title="day.isToday ? `今天 ${day.dateString}` : day.dateString"
              @click="emit('select-day', day.dateString)"
            >
              {{ day.dayNum }}
              <span v-if="day.isToday && day.dateString !== newWeekStart && day.dateString !== newWeekEnd" class="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-500" />
            </button>
          </template>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">已选时间范围</div>
          <div class="mt-1 font-mono text-xs font-black text-slate-800">{{ newWeekRange || '请选择开始与结束日期' }}</div>
        </div>
        <span v-if="newWeekStart && newWeekEnd" class="shrink-0 rounded-xl bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700">
          {{ getDateRangeDays(newWeekStart, newWeekEnd) }} 天
        </span>
      </div>

      <div class="flex gap-2">
        <button class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-50" type="button" @click="emit('close')">
          取消
        </button>
        <button class="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" type="button" :disabled="!newWeekStart || !newWeekEnd" @click="emit('confirm')">
          确认创建
        </button>
      </div>
    </div>
  </div>
</template>
