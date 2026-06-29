<script setup>
import { ChevronDown } from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'
import { getPriorityLabel } from './styles'

defineProps({
  ganttStart: { type: String, required: true },
  days: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  selectedProducers: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-producer', 'open-requirement'])

const dateToIndex = (dateString, ganttStart) => {
  const start = new Date(`${ganttStart}T00:00:00`).getTime()
  const value = new Date(`${dateString}T00:00:00`).getTime()
  return Math.max(0, Math.floor((value - start) / 86400000))
}

const getTaskTime = (dateString, fallback) => {
  const time = new Date(`${dateString}T00:00:00`).getTime()
  return Number.isNaN(time) ? fallback : time
}

const getTaskStartIndex = (task, ganttStart) => dateToIndex(task.startDate, ganttStart)

const getTaskEndIndex = (task, ganttStart, days) =>
  Math.min(days.length - 1, dateToIndex(task.endDate || task.startDate, ganttStart))

const getTaskBarWidth = (task, ganttStart, days) =>
  `${Math.max((getTaskEndIndex(task, ganttStart, days) - getTaskStartIndex(task, ganttStart) + 1) * 52 - 16, 92)}px`

const getTaskWorkDays = (task) => {
  const start = getTaskTime(task.startDate, 0)
  const end = getTaskTime(task.endDate, start)
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}

const getPriorityClass = (priority) => {
  if (priority === 'Highest') return 'bg-rose-500 text-white'
  if (priority === 'High') return 'bg-orange-400 text-white'
  if (priority === 'Low') return 'bg-emerald-100 text-emerald-700'
  return 'bg-indigo-100 text-indigo-700'
}

const getTodayLineLeft = (days) => {
  const todayIndex = days.findIndex((day) => day.isToday)
  return todayIndex >= 0 ? `${todayIndex * 52 + 26}px` : ''
}
</script>

<template>
  <div class="overflow-auto rounded-2xl border border-slate-150 bg-white">
    <div class="flex min-w-max border-b border-slate-100 bg-slate-50/80">
      <div class="grid w-[520px] shrink-0 grid-cols-[40px_220px_88px_80px_92px] border-r border-slate-150 text-[10px] font-black text-slate-400">
        <div class="flex h-12 items-center justify-center border-r border-slate-100">#</div>
        <div class="flex h-12 items-center border-r border-slate-100 px-3">需求方向 / 名称</div>
        <div class="flex h-12 items-center border-r border-slate-100 px-3">需求编号</div>
        <div class="flex h-12 items-center border-r border-slate-100 px-3">制作类型</div>
        <div class="flex h-12 items-center px-3">优先级</div>
      </div>
      <div class="shrink-0" :style="{ width: `${days.length * 52}px` }">
        <div class="grid h-12" :style="{ gridTemplateColumns: `repeat(${days.length}, 52px)` }">
          <div
            v-for="day in days"
            :key="day.dateString"
            :class="`relative flex items-center justify-center border-r border-slate-150 text-[10px] font-black ${
              day.isToday ? 'text-indigo-600' : day.isWeekend ? 'bg-slate-100 text-slate-350' : 'text-slate-400'
            }`"
          >
            {{ day.day === 1 ? `${day.month}/1` : day.day }}
            <span v-if="day.isToday" class="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="max-h-[560px] min-w-max">
      <div
        v-for="{ producer, tasks } in rows.filter(({ producer }) => selectedProducers.length === 0 || selectedProducers.includes(producer.name))"
        :key="producer.name"
        :class="`border-b border-slate-100 last:border-b-0 ${selectedProducers.includes(producer.name) ? 'bg-indigo-50/40' : 'bg-white'}`"
      >
        <button class="flex h-10 w-full items-center gap-2 border-b border-slate-100 bg-white px-3 text-left transition-all hover:bg-slate-50" type="button" @click="emit('select-producer', producer.name)">
          <ChevronDown class="h-3.5 w-3.5 text-slate-350" />
          <PersonParts :name="producer.name" size="xs" />
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400">{{ producer.group }}</span>
          <span class="ml-auto text-[9px] font-black text-slate-350">{{ tasks.length }} 项</span>
        </button>

        <div v-if="tasks.length === 0" class="flex">
          <div class="grid h-11 w-[520px] shrink-0 grid-cols-[40px_220px_88px_80px_92px] border-r border-slate-150 text-[10px] font-bold text-slate-350">
            <div class="border-r border-slate-100" />
            <div class="flex items-center border-r border-slate-100 px-3">暂无排期</div>
            <div class="border-r border-slate-100" />
            <div class="border-r border-slate-100" />
            <div />
          </div>
          <div class="shrink-0" :style="{ width: `${days.length * 52}px` }">
            <div class="grid h-11" :style="{ gridTemplateColumns: `repeat(${days.length}, 52px)` }">
              <div v-for="day in days" :key="`${producer.name}-empty-${day.dateString}`" :class="`border-r border-slate-100 ${day.isWeekend ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]' : ''}`" />
            </div>
          </div>
        </div>

        <div v-for="(task, index) in tasks" v-else :key="task.id" class="flex">
          <div class="grid h-10 w-[520px] shrink-0 grid-cols-[40px_220px_88px_80px_92px] border-r border-slate-150 text-[10px] font-bold text-slate-500">
            <div class="flex items-center justify-center border-r border-slate-100 text-slate-350">{{ index + 1 }}</div>
            <div class="flex min-w-0 items-center border-r border-slate-100 px-3">
              <span class="truncate" :title="task.requirement.name">{{ task.requirement.name }}</span>
            </div>
            <div class="flex items-center border-r border-slate-100 px-3 font-mono text-indigo-600">{{ task.displayRequirementId }}</div>
            <div class="flex items-center border-r border-slate-100 px-3">
              <span class="rounded-lg bg-cyan-100 px-2 py-0.5 text-[9px] font-black text-cyan-700">{{ task.role }}</span>
            </div>
            <div class="flex items-center px-3">
              <span :class="`rounded-lg px-2 py-0.5 text-[9px] font-black ${getPriorityClass(task.requirement.priority)}`">{{ getPriorityLabel(task.requirement.priority) }}</span>
            </div>
          </div>

          <div class="shrink-0" :style="{ width: `${days.length * 52}px` }">
            <div class="relative grid h-10" :style="{ gridTemplateColumns: `repeat(${days.length}, 52px)` }">
              <div v-for="day in days" :key="`${task.id}-${day.dateString}`" :class="`border-r border-slate-100 ${day.isWeekend ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]' : ''}`" />
              <div v-if="getTodayLineLeft(days)" class="pointer-events-none absolute top-0 h-full w-px bg-indigo-500/80" :style="{ left: getTodayLineLeft(days) }" />
              <button
                type="button"
                :class="`absolute top-1.5 flex h-7 items-center justify-between gap-2 rounded-md px-2 text-[9px] font-black shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  task.status === '已完成' ? 'bg-slate-500 text-white' : task.status === '制作中' ? 'bg-sky-400 text-white' : 'bg-sky-200 text-sky-900'
                }`"
                :style="{
                  left: `${getTaskStartIndex(task, ganttStart) * 52 + 8}px`,
                  width: getTaskBarWidth(task, ganttStart, days),
                }"
                :title="`${task.requirement.name} / ${task.startDate} ~ ${task.endDate}`"
                @click="emit('open-requirement', task.requirement)"
              >
                <span class="truncate">{{ task.requirement.name }}</span>
                <span class="shrink-0">{{ getTaskWorkDays(task) }} 工作日</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
