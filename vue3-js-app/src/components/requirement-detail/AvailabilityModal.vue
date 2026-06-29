<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { formatScheduledRequirementId } from '../requirement-center/requirementUtils'
import { addDaysToDateString, formatShortDateRange, getProductionPeople, getScheduleRolePreset, rangesOverlap } from './detailUtils'
import { formatCalendarDate, getMonthWeeks, parseDateValue } from '../requirement-center/dateUtils'

const props = defineProps({
  requirement: {
    type: Object,
    required: true,
  },
  productionScheduleContext: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close'])

const view = ref('calendar')
const todayDateString = formatCalendarDate(new Date())
const today = new Date(`${todayDateString}T00:00:00`)
const calendarYear = ref(today.getFullYear())
const calendarMonth = ref(today.getMonth() + 1)
const selectedProducers = ref([])
const isProducerMenuOpen = ref(false)
const modalRootRef = ref(null)
const scheduleHorizonEnd = computed(() => addDaysToDateString(todayDateString, 13))

const productionPeople = computed(() => getProductionPeople())
const currentRequirementTasks = computed(() =>
  (props.requirement.tasks || [])
    .filter((task) => task.designer)
    .map((task) => ({
      id: `${props.requirement.id}:draft:${task.id}`,
      requirementId: props.requirement.id,
      displayRequirementId: formatScheduledRequirementId(props.requirement, task),
      requirementName: props.requirement.name || props.requirement.id,
      role: task.role || task.type,
      status: task.status || '待排期',
      producer: task.designer,
      title: task.role || task.type || '制作任务',
      startDate: task.startDate || todayDateString,
      endDate: task.endDate || task.startDate || todayDateString,
    })),
)

const tasks = computed(() => {
  const currentDraftIds = new Set(currentRequirementTasks.value.map((task) => task.id.replace(':draft:', ':')))
  return [
    ...props.productionScheduleContext
      .filter((task) => !currentDraftIds.has(task.id))
      .map((task) => ({
        ...task,
        title: `${task.displayRequirementId || task.requirementId} · ${task.role || '制作任务'}`,
      })),
    ...currentRequirementTasks.value,
  ]
})
const visibleTasks = computed(() =>
  selectedProducers.value.length
    ? tasks.value.filter((task) => selectedProducers.value.includes(task.producer))
    : tasks.value,
)
const rows = computed(() =>
  productionPeople.value
    .filter((person) => selectedProducers.value.length === 0 || selectedProducers.value.includes(person.name))
    .map((person) => ({
      ...person,
      tasks: visibleTasks.value.filter((task) => task.producer === person.name),
    })),
)
const weeks = computed(() => getMonthWeeks(calendarYear.value, calendarMonth.value, todayDateString))
const ganttStart = computed(() => addDaysToDateString(todayDateString, -3))
const ganttDays = computed(() =>
  Array.from({ length: 31 }, (_, index) => {
    const dateString = addDaysToDateString(ganttStart.value, index)
    const date = new Date(`${dateString}T00:00:00`)
    return {
      dateString,
      day: date.getDate(),
      month: date.getMonth() + 1,
      isToday: dateString === todayDateString,
      isWeekend: [0, 6].includes(date.getDay()),
    }
  }),
)

const getGanttTaskMeta = (task) => {
  const dayWidth = 52
  const ganttStartTime = parseDateValue(ganttStart.value) || 0
  const taskStartTime = parseDateValue(task.startDate) || ganttStartTime
  const taskEndTime = parseDateValue(task.endDate) || taskStartTime
  const startIndex = Math.max(0, Math.floor((taskStartTime - ganttStartTime) / 86400000))
  const endIndex = Math.min(ganttDays.value.length - 1, Math.floor((taskEndTime - ganttStartTime) / 86400000))
  const workDays = Math.max(1, Math.round((taskEndTime - taskStartTime) / 86400000) + 1)
  const barClass = task.status === '已完成'
    ? 'bg-slate-500 text-white'
    : task.status === '制作中'
      ? 'bg-sky-400 text-white'
      : 'bg-sky-200 text-sky-900'
  return {
    left: `${startIndex * dayWidth + 8}px`,
    width: `${Math.max((endIndex - startIndex + 1) * dayWidth - 16, 92)}px`,
    workDays,
    barClass,
  }
}

const taskOffset = (task) => {
  const start = parseDateValue(task.startDate) || parseDateValue(ganttStart.value)
  const base = parseDateValue(ganttStart.value) || start
  return Math.max(0, Math.round((start - base) / 86400000))
}

const taskSpan = (task) => {
  const start = parseDateValue(task.startDate)
  const end = parseDateValue(task.endDate) ?? start
  if (start === null || end === null) return 1
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}

const getDayTasks = (day) =>
  visibleTasks.value.filter((task) => rangesOverlap(task.startDate, task.endDate, day.dateString, day.dateString))

const getWeekTasks = (week) => {
  const weekStart = week.days[0].dateString
  const weekEnd = week.days[6].dateString
  return visibleTasks.value
    .filter((task) => rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd))
    .sort((a, b) => (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0))
    .slice(0, 5)
}

const getCalendarTaskBarMeta = (task, week, laneIndex) => {
  const weekStart = week.days[0].dateString
  const weekEnd = week.days[6].dateString
  const taskStartTime = parseDateValue(task.startDate) || parseDateValue(weekStart) || 0
  const taskEndTime = parseDateValue(task.endDate) || taskStartTime
  const weekStartTime = parseDateValue(weekStart) || taskStartTime
  const weekEndTime = parseDateValue(weekEnd) || taskEndTime
  const clippedStart = Math.max(taskStartTime, weekStartTime)
  const clippedEnd = Math.min(taskEndTime, weekEndTime)
  const startIndex = Math.max(0, Math.floor((clippedStart - weekStartTime) / 86400000))
  const spanDays = Math.max(1, Math.floor((clippedEnd - clippedStart) / 86400000) + 1)
  return {
    style: {
      left: `calc(${(startIndex / 7) * 100}% + 8px)`,
      width: `calc(${(spanDays / 7) * 100}% - 16px)`,
      top: `${laneIndex * 26}px`,
    },
    startsInWeek: taskStartTime >= weekStartTime,
    endsInWeek: taskEndTime <= weekEndTime,
  }
}

const getCalendarTaskTone = (task) => {
  if (task.status === '已完成') return 'bg-slate-100 text-slate-500'
  if (String(task.role || '').includes('平面')) return 'bg-lime-100 text-lime-800'
  return 'bg-sky-100 text-sky-800'
}

const producerFilterLabel = computed(() => {
  if (selectedProducers.value.length === 0) return '全部人员'
  if (selectedProducers.value.length === 1) return selectedProducers.value[0]
  return `${selectedProducers.value.length} 人`
})

const toggleProducer = (name) => {
  selectedProducers.value = selectedProducers.value.includes(name)
    ? selectedProducers.value.filter((item) => item !== name)
    : [...selectedProducers.value, name]
}

const jumpToday = () => {
  const nextToday = new Date(`${todayDateString}T00:00:00`)
  calendarYear.value = nextToday.getFullYear()
  calendarMonth.value = nextToday.getMonth() + 1
}

const prevMonth = () => {
  if (calendarMonth.value === 1) {
    calendarYear.value -= 1
    calendarMonth.value = 12
    return
  }
  calendarMonth.value -= 1
}

const nextMonth = () => {
  if (calendarMonth.value === 12) {
    calendarYear.value += 1
    calendarMonth.value = 1
    return
  }
  calendarMonth.value += 1
}

const closeModal = () => {
  emit('close')
}

const closeOpenMenus = () => {
  isProducerMenuOpen.value = false
}

const handleDocumentClick = (event) => {
  if (!modalRootRef.value?.contains(event.target)) closeOpenMenus()
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') {
    if (isProducerMenuOpen.value) {
      closeOpenMenus()
      return
    }
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div class="fixed inset-0 z-[320] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-xs">
    <div ref="modalRootRef" class="flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
      <div class="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h3 class="text-base font-black text-slate-900">人员排期情况</h3>
          <p class="mt-1 text-[11px] font-bold text-slate-400">查看 {{ todayDateString }} 至 {{ scheduleHorizonEnd }} 的人员闲忙，再决定负责人和时间。</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <button
              :class="`inline-flex h-9 min-w-[116px] items-center justify-between gap-2 rounded-2xl border px-3 text-[11px] font-black shadow-3xs transition-all ${
                selectedProducers.length > 0
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`"
              type="button"
              @click.stop="isProducerMenuOpen = !isProducerMenuOpen"
            >
              <span class="truncate">{{ producerFilterLabel }}</span>
              <ChevronDown :class="`h-3.5 w-3.5 shrink-0 transition-transform ${isProducerMenuOpen ? 'rotate-180' : ''}`" />
            </button>

            <div v-if="isProducerMenuOpen" class="absolute left-0 top-full z-[340] mt-2 max-h-72 w-40 overflow-y-auto rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <button
                :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${selectedProducers.length === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`"
                type="button"
                @click.stop="
                  selectedProducers = [];
                  isProducerMenuOpen = false
                "
              >
                <span>全部人员</span>
                <Check v-if="selectedProducers.length === 0" class="h-4 w-4 text-indigo-500" />
              </button>
              <div class="my-1 h-px bg-slate-100" />
              <button
                v-for="person in productionPeople"
                :key="person.id"
                :class="`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                  selectedProducers.includes(person.name) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`"
                type="button"
                @click.stop="toggleProducer(person.name)"
              >
                <span
                  :class="`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                    selectedProducers.includes(person.name)
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-200 bg-white text-transparent'
                  }`"
                >
                  <Check class="h-3 w-3 stroke-[3]" />
                </span>
                <span class="truncate">{{ person.name }}</span>
              </button>
            </div>
          </div>
          <button
            v-for="item in [{ id: 'calendar', label: '日历图' }, { id: 'gantt', label: '甘特图' }]"
            :key="item.id"
            :class="`rounded-2xl px-4 py-2 text-[11px] font-black transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-150'}`"
            type="button"
            @click="view = item.id"
          >
            {{ item.label }}
          </button>
          <button class="ml-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600" type="button" @click="closeModal">
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-auto bg-slate-50/70 p-6 no-scrollbar">
        <div v-if="view === 'calendar'" class="min-h-full rounded-2xl border border-slate-150 bg-white">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div class="flex items-center gap-2">
              <button class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" type="button" @click="jumpToday">
                今天
              </button>
              <button class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700" type="button" @click="prevMonth">
                <ChevronLeft class="h-4 w-4" />
              </button>
              <button class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700" type="button" @click="nextMonth">
                <ChevronRight class="h-4 w-4" />
              </button>
              <div class="ml-2 text-sm font-black text-slate-800">{{ calendarYear }}年{{ calendarMonth }}月</div>
            </div>
            <div class="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[10px] font-black">
              <span class="rounded-lg px-3 py-1.5 text-slate-400">日</span>
              <span class="rounded-lg px-3 py-1.5 text-slate-400">周</span>
              <span class="rounded-lg bg-white px-3 py-1.5 text-indigo-600 shadow-xs">月</span>
            </div>
          </div>
          <div class="grid grid-cols-7 border-b border-slate-100 text-[10px] font-black text-slate-500">
            <div v-for="weekday in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="weekday" class="px-3 py-2">{{ weekday }}</div>
          </div>
          <div v-for="week in weeks" :key="week.days[0].dateString" class="relative grid min-h-[148px] grid-cols-7 overflow-visible border-b border-slate-100 last:border-b-0">
            <div
              v-for="day in week.days"
              :key="day.dateString"
              :class="`min-h-[148px] border-r border-slate-100 p-2 last:border-r-0 ${day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60'} ${day.isWeekend ? 'bg-slate-50' : ''}`"
            >
              <div class="mb-2 flex items-center justify-between gap-2">
                <span :class="`flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-black ${day.isToday ? 'bg-indigo-600 text-white' : day.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`">
                  {{ day.dayNum === 1 && day.isCurrentMonth ? `${calendarMonth}月1日` : day.dayNum }}
                </span>
                <span v-if="getDayTasks(day).length > 0" class="text-[9px] font-bold text-slate-300">{{ getDayTasks(day).length }} 条</span>
              </div>
            </div>
            <div class="pointer-events-none absolute inset-x-0 top-9 z-10">
              <div
                v-for="(task, laneIndex) in getWeekTasks(week)"
                :key="`${week.days[0].dateString}-${task.id}`"
                :class="`absolute flex h-6 items-center truncate px-2 text-left text-[10px] font-black shadow-3xs ${getCalendarTaskTone(task)} ${getCalendarTaskBarMeta(task, week, laneIndex).startsInWeek ? 'rounded-l-md' : 'rounded-l-none'} ${getCalendarTaskBarMeta(task, week, laneIndex).endsInWeek ? 'rounded-r-md' : 'rounded-r-none'}`"
                :style="getCalendarTaskBarMeta(task, week, laneIndex).style"
                :title="`${task.displayRequirementId || task.requirementId} / ${task.requirementName} / ${task.producer}`"
              >
                {{ task.displayRequirementId || task.requirementId }}
                <span class="ml-1 font-bold opacity-70">{{ task.producer }}</span>
                <span class="ml-1 font-bold opacity-70">{{ task.role }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="min-h-full overflow-auto rounded-2xl border border-slate-150 bg-white">
          <div class="flex min-w-max border-b border-slate-100 bg-slate-50/80">
            <div class="grid w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-black text-slate-400">
              <div class="flex h-12 items-center border-r border-slate-100 px-3">人员</div>
              <div class="flex h-12 items-center border-r border-slate-100 px-3">岗位</div>
              <div class="flex h-12 items-center border-r border-slate-100 px-3">需求编号</div>
              <div class="flex h-12 items-center px-3">状态</div>
            </div>
            <div class="shrink-0" :style="{ width: `${ganttDays.length * 52}px` }">
              <div class="grid h-12" :style="{ gridTemplateColumns: `repeat(${ganttDays.length}, 52px)` }">
                <div
                  v-for="day in ganttDays"
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

          <div class="min-w-max">
            <div v-for="person in rows" :key="person.id" class="border-b border-slate-100 bg-white last:border-b-0">
              <div class="flex h-10 items-center gap-2 border-b border-slate-100 bg-white px-3">
                <ChevronDown class="h-3.5 w-3.5 text-slate-350" />
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white">
                  {{ person.name.slice(0, 1) }}
                </span>
                <span class="text-xs font-black text-slate-800">{{ person.name }}</span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400">{{ person.group }}</span>
                <span class="ml-auto text-[9px] font-black text-slate-350">{{ person.tasks.length }} 项</span>
              </div>

              <div v-if="person.tasks.length === 0" class="flex">
                <div class="grid h-11 w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-bold text-slate-350">
                  <div class="flex items-center border-r border-slate-100 px-3">暂无排期</div>
                  <div class="border-r border-slate-100" />
                  <div class="border-r border-slate-100" />
                  <div />
                </div>
                <div class="shrink-0" :style="{ width: `${ganttDays.length * 52}px` }">
                  <div class="grid h-11" :style="{ gridTemplateColumns: `repeat(${ganttDays.length}, 52px)` }">
                    <div
                      v-for="day in ganttDays"
                      :key="`${person.id}-empty-${day.dateString}`"
                      :class="`border-r border-slate-100 ${day.isWeekend ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]' : ''}`"
                    />
                  </div>
                </div>
              </div>

              <div v-else v-for="(task, index) in person.tasks" :key="task.id" class="flex">
                <div class="grid h-10 w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-bold text-slate-500">
                  <div class="flex min-w-0 items-center border-r border-slate-100 px-3">
                    <span v-if="index === 0" class="truncate text-slate-700">{{ person.name }}</span>
                    <span v-else class="text-slate-250">同人员</span>
                  </div>
                  <div class="flex items-center border-r border-slate-100 px-3">
                    <span :class="`rounded-lg px-2 py-0.5 text-[9px] font-black ${getScheduleRolePreset(task.role).className}`">
                      {{ getScheduleRolePreset(task.role).role }}
                    </span>
                  </div>
                  <div class="flex items-center border-r border-slate-100 px-3 font-mono text-indigo-600">
                    {{ task.displayRequirementId || task.requirementId }}
                  </div>
                  <div class="flex items-center px-3">
                    <span class="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">{{ task.status }}</span>
                  </div>
                </div>

                <div class="shrink-0" :style="{ width: `${ganttDays.length * 52}px` }">
                  <div class="relative grid h-10" :style="{ gridTemplateColumns: `repeat(${ganttDays.length}, 52px)` }">
                    <div
                      v-for="day in ganttDays"
                      :key="`${task.id}-${day.dateString}`"
                      :class="`border-r border-slate-100 ${day.isWeekend ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]' : ''}`"
                    />
                    <div
                      v-if="ganttDays.find((day) => day.isToday)"
                      class="pointer-events-none absolute top-0 h-full w-px bg-indigo-500/80"
                      :style="{ left: `${ganttDays.findIndex((day) => day.isToday) * 52 + 26}px` }"
                    />
                    <div
                      :class="`absolute top-1.5 flex h-7 items-center justify-between gap-2 rounded-md px-2 text-[9px] font-black shadow-sm ${getGanttTaskMeta(task).barClass}`"
                      :style="{ left: getGanttTaskMeta(task).left, width: getGanttTaskMeta(task).width }"
                      :title="`${task.requirementName} / ${task.startDate} ~ ${task.endDate}`"
                    >
                      <span class="truncate">{{ task.requirementName }}</span>
                      <span class="shrink-0">{{ getGanttTaskMeta(task).workDays }} 工作日</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
