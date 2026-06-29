<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-vue-next'
import {
  formatUtcDate,
  getRecentUtcRange,
  getSingleUtcDayRange,
  getUtcMonthDays,
  getUtcMonthRange,
  getUtcWeekRange,
  isDateRangeEdge,
  isWithinDateRange,
  shiftUtcMonth,
  toUtcDate,
} from './shared/date/dateRange'

const props = defineProps({
  label: { type: String, default: '' },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
  className: { type: String, default: '' },
  buttonClassName: { type: String, default: '' },
  align: { type: String, default: 'left' },
  compact: { type: Boolean, default: false },
  placeholder: { type: String, default: '选择时间范围' },
  mode: { type: String, default: '' },
})

const emit = defineEmits(['change'])

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this-week', label: 'This week' },
  { id: 'last-week', label: 'Last week' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'last-7', label: 'Last 7 days' },
  { id: 'last-30', label: 'Last 30 days' },
]

const wrapperRef = ref(null)
const triggerRef = ref(null)
const open = ref(false)
const draftStart = ref(props.start)
const draftEnd = ref(props.end)
const popupPosition = ref({ left: 16, top: 16 })
const analyticsPickerMenu = ref('')

const toDateString = (date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDate = (value) => {
  if (!value) return null
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const addDays = (date, amount) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1)
const startOfWeek = (date) => addDays(date, -date.getDay())
const monthTitle = (date) => date.toLocaleString('en-US', { month: 'short', year: 'numeric' })

const viewMonth = ref(parseDate(props.start) || new Date())
const analyticsViewMonth = ref(shiftUtcMonth(toUtcDate(props.start || props.end || getRecentUtcRange(30).start), 0))

const getMonthCells = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const start = startOfWeek(firstDay)
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index)
    return {
      date,
      value: toDateString(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthDate.getMonth(),
    }
  })
}

const getPresetRange = (id) => {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (id === 'today') return { start: toDateString(end), end: toDateString(end) }
  if (id === 'yesterday') {
    const day = addDays(end, -1)
    return { start: toDateString(day), end: toDateString(day) }
  }
  if (id === 'this-week') return { start: toDateString(startOfWeek(end)), end: toDateString(end) }
  if (id === 'last-week') {
    const lastWeekEnd = addDays(startOfWeek(end), -1)
    return { start: toDateString(addDays(lastWeekEnd, -6)), end: toDateString(lastWeekEnd) }
  }
  if (id === 'this-month') {
    return { start: toDateString(new Date(end.getFullYear(), end.getMonth(), 1)), end: toDateString(end) }
  }
  if (id === 'last-month') {
    return {
      start: toDateString(new Date(end.getFullYear(), end.getMonth() - 1, 1)),
      end: toDateString(new Date(end.getFullYear(), end.getMonth(), 0)),
    }
  }
  if (id === 'last-7') return { start: toDateString(addDays(end, -6)), end: toDateString(end) }
  if (id === 'last-30') return { start: toDateString(addDays(end, -29)), end: toDateString(end) }
  return { start: '', end: '' }
}

const hasValue = computed(() => Boolean(props.start || props.end))
const isAnalytics = computed(() => props.mode === 'launch' || props.mode === 'spend')
const popoverWidth = computed(() => (props.compact ? 'w-[min(650px,calc(100vw-32px))]' : 'w-[min(820px,calc(100vw-32px))]'))
const sideColumn = computed(() => (props.compact ? 'md:grid-cols-[136px_1fr]' : 'md:grid-cols-[180px_1fr]'))
const panelMaxHeight = computed(() => (props.compact ? 'max-h-[500px]' : 'max-h-[620px]'))
const monthHeaderHeight = computed(() => (props.compact ? 'h-11' : 'h-14'))
const dayCellHeight = computed(() => (props.compact ? 'h-7 text-xs' : 'h-9 text-sm'))
const summary = computed(() => (!props.start && !props.end ? props.placeholder : `${props.start || '不限'} ~ ${props.end || '不限'}`))
const rangeLabel = computed(() => (!draftStart.value && !draftEnd.value ? 'Select date range' : `${draftStart.value || '不限'} - ${draftEnd.value || '不限'}`))
const months = computed(() => [viewMonth.value, addMonths(viewMonth.value, 1)])
const analyticsMonths = computed(() => [analyticsViewMonth.value, shiftUtcMonth(analyticsViewMonth.value, 1)])
const analyticsDisplayRange = computed(() => (props.start && props.end ? `${props.start} - ${props.end}` : '选择时间范围'))
const analyticsYears = computed(() => {
  const current = new Date().getUTCFullYear()
  return Array.from({ length: 9 }, (_, index) => current - 4 + index)
})

const analyticsShortcuts = computed(() => [
  { label: 'Today', range: getSingleUtcDayRange(0) },
  { label: 'Yesterday', range: getSingleUtcDayRange(-1) },
  { label: 'This week', range: getUtcWeekRange(0) },
  { label: 'Last week', range: getUtcWeekRange(-1) },
  { label: 'This month', range: getUtcMonthRange(0) },
  { label: 'Last month', range: getUtcMonthRange(-1) },
  { label: 'Last 7 days', range: getRecentUtcRange(7) },
  { label: 'Last 30 days', range: getRecentUtcRange(30) },
])

const isBetween = (value, start, end) => Boolean(start && end && value >= start && value <= end)

const updateRange = (range) => {
  emit('change', range)
}

const updatePopupPosition = () => {
  const rect = triggerRef.value?.getBoundingClientRect()
  if (!rect) return
  const popupWidth = 720
  const viewportPadding = 16
  const maxLeft = Math.max(viewportPadding, window.innerWidth - popupWidth - viewportPadding)
  popupPosition.value = {
    left: Math.min(Math.max(viewportPadding, rect.left), maxLeft),
    top: rect.bottom + 8,
  }
}

const openAnalyticsCalendar = () => {
  updatePopupPosition()
  analyticsViewMonth.value = toUtcDate(props.start || props.end || getRecentUtcRange(30).start)
  open.value = !open.value
}

const handleDayClick = (value) => {
  if (!draftStart.value || (draftStart.value && draftEnd.value)) {
    draftStart.value = value
    draftEnd.value = ''
    updateRange({ start: value, end: '' })
    return
  }
  const nextStart = value < draftStart.value ? value : draftStart.value
  const nextEnd = value < draftStart.value ? draftStart.value : value
  draftStart.value = nextStart
  draftEnd.value = nextEnd
  updateRange({ start: nextStart, end: nextEnd })
}

const applyPreset = (id) => {
  const range = getPresetRange(id)
  draftStart.value = range.start
  draftEnd.value = range.end
  viewMonth.value = parseDate(range.start) || new Date()
  updateRange(range)
  open.value = false
}

const commitAnalyticsRange = (nextStart, nextEnd) => {
  draftStart.value = nextStart
  draftEnd.value = nextEnd
  analyticsPickerMenu.value = ''
  updateRange({ start: nextStart, end: nextEnd })
  open.value = false
}

const handleAnalyticsDayClick = (value) => {
  if (!draftStart.value || draftEnd.value) {
    draftStart.value = value
    draftEnd.value = ''
    return
  }
  const nextStart = value < draftStart.value ? value : draftStart.value
  const nextEnd = value < draftStart.value ? draftStart.value : value
  commitAnalyticsRange(nextStart, nextEnd)
}

const applyAnalyticsShortcut = (range) => {
  analyticsViewMonth.value = toUtcDate(range.start)
  commitAnalyticsRange(range.start, range.end)
}

const handleAnalyticsMonthChange = (base, month, panelIndex) => {
  const next = new Date(Date.UTC(base.getUTCFullYear(), month, 1))
  analyticsViewMonth.value = panelIndex === 0 ? next : shiftUtcMonth(next, -1)
  analyticsPickerMenu.value = ''
}

const handleAnalyticsYearChange = (base, year, panelIndex) => {
  const next = new Date(Date.UTC(year, base.getUTCMonth(), 1))
  analyticsViewMonth.value = panelIndex === 0 ? next : shiftUtcMonth(next, -1)
  analyticsPickerMenu.value = ''
}

const clearRange = () => {
  draftStart.value = ''
  draftEnd.value = ''
  updateRange({ start: '', end: '' })
}

const handlePointerDown = (event) => {
  if (!wrapperRef.value?.contains(event.target)) open.value = false
}

const handleKeyDown = (event) => {
  if (event.key === 'Escape') open.value = false
}

watch(
  () => [props.start, props.end],
  ([start, end]) => {
    draftStart.value = start
    draftEnd.value = end
  },
)

onMounted(() => {
  document.addEventListener('mousedown', handlePointerDown)
  document.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', updatePopupPosition)
  window.addEventListener('scroll', updatePopupPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handlePointerDown)
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', updatePopupPosition)
  window.removeEventListener('scroll', updatePopupPosition, true)
})
</script>

<template>
  <div ref="wrapperRef" :class="`relative ${className}`">
    <template v-if="isAnalytics">
      <button
        ref="triggerRef"
        type="button"
        :class="`flex h-9 min-w-[280px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold shadow-3xs transition-all hover:border-indigo-200 hover:bg-slate-50 ${
          open ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
        } ${buttonClassName}`"
        @click="openAnalyticsCalendar"
      >
        <Calendar class="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span class="shrink-0 text-xs font-black uppercase tracking-wide text-slate-400">UTC</span>
        <span v-if="mode === 'launch'" class="shrink-0 text-xs font-black text-slate-800">投放时间</span>
        <span v-else class="shrink-0 text-xs font-black text-slate-800">Last 30 days</span>
        <span :class="`min-w-0 flex-1 truncate text-left text-xs font-bold ${start && end ? 'text-slate-700' : 'text-slate-400'}`">
          {{ analyticsDisplayRange }}
        </span>
        <ChevronDown class="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      <div
        v-if="open"
        class="fixed z-50 w-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80"
        :style="{ left: `${popupPosition.left}px`, top: `${popupPosition.top}px` }"
      >
        <div class="flex">
          <aside class="w-40 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
            <button
              v-for="item in analyticsShortcuts"
              :key="item.label"
              type="button"
              class="mb-1.5 h-8 w-full rounded-md bg-white text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
              @click="applyAnalyticsShortcut(item.range)"
            >
              {{ item.label }}
            </button>
          </aside>

          <div class="flex-1">
            <div class="flex h-11 items-center justify-between border-b border-slate-200 px-5">
              <div class="flex items-center gap-2">
                <button type="button" class="rounded-md p-1 text-slate-500 hover:bg-slate-100" @click="analyticsViewMonth = shiftUtcMonth(analyticsViewMonth, -12)">
                  <ChevronsLeft class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-md p-1 text-slate-500 hover:bg-slate-100" @click="analyticsViewMonth = shiftUtcMonth(analyticsViewMonth, -1)">
                  <ChevronLeft class="h-4 w-4" />
                </button>
              </div>
              <div :class="`rounded-md px-2 py-1 text-[11px] font-black uppercase tracking-wide ${draftStart && draftEnd ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`">
                {{ draftStart && draftEnd ? `${draftStart} - ${draftEnd}` : 'Select date range' }}
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="rounded-md p-1 text-slate-500 hover:bg-slate-100" @click="analyticsViewMonth = shiftUtcMonth(analyticsViewMonth, 1)">
                  <ChevronRight class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-md p-1 text-slate-500 hover:bg-slate-100" @click="analyticsViewMonth = shiftUtcMonth(analyticsViewMonth, 12)">
                  <ChevronsRight class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-5 p-5">
              <div v-for="(month, monthIndex) in analyticsMonths" :key="formatUtcDate(month)" class="min-w-[240px] flex-1">
                <div class="mb-3 flex items-center justify-center gap-2">
                  <div class="relative w-[84px]">
                    <button
                      type="button"
                      :class="`flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 shadow-3xs outline-none transition-all hover:border-indigo-200 hover:bg-slate-50 ${
                        analyticsPickerMenu === `month-${monthIndex}` ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
                      }`"
                      @click="analyticsPickerMenu = analyticsPickerMenu === `month-${monthIndex}` ? '' : `month-${monthIndex}`"
                    >
                      <span>{{ MONTH_NAMES[month.getUTCMonth()] }}</span>
                      <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${analyticsPickerMenu === `month-${monthIndex}` ? 'rotate-180' : ''}`" />
                    </button>
                    <div
                      v-if="analyticsPickerMenu === `month-${monthIndex}`"
                      class="absolute left-0 top-[calc(100%+6px)] z-[80] max-h-64 w-full min-w-[92px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl shadow-slate-200/80"
                    >
                      <button
                        v-for="(monthName, monthValue) in MONTH_NAMES"
                        :key="monthName"
                        type="button"
                        :class="`flex h-7 w-full items-center rounded-md px-3 text-left text-xs font-bold transition-colors ${
                          monthValue === month.getUTCMonth() ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`"
                        @click="handleAnalyticsMonthChange(month, monthValue, monthIndex)"
                      >
                        {{ monthName }}
                      </button>
                    </div>
                  </div>
                  <div class="relative w-[86px]">
                    <button
                      type="button"
                      :class="`flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 shadow-3xs outline-none transition-all hover:border-indigo-200 hover:bg-slate-50 ${
                        analyticsPickerMenu === `year-${monthIndex}` ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
                      }`"
                      @click="analyticsPickerMenu = analyticsPickerMenu === `year-${monthIndex}` ? '' : `year-${monthIndex}`"
                    >
                      <span>{{ month.getUTCFullYear() }}</span>
                      <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${analyticsPickerMenu === `year-${monthIndex}` ? 'rotate-180' : ''}`" />
                    </button>
                    <div
                      v-if="analyticsPickerMenu === `year-${monthIndex}`"
                      class="absolute left-0 top-[calc(100%+6px)] z-[80] max-h-64 w-full min-w-[92px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl shadow-slate-200/80"
                    >
                      <button
                        v-for="year in analyticsYears"
                        :key="year"
                        type="button"
                        :class="`flex h-7 w-full items-center rounded-md px-3 text-left text-xs font-bold transition-colors ${
                          year === month.getUTCFullYear() ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`"
                        @click="handleAnalyticsYearChange(month, year, monthIndex)"
                      >
                        {{ year }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-7 gap-y-1 text-center">
                  <div v-for="day in WEEKDAYS" :key="day" class="py-1 text-[11px] font-black text-slate-500">{{ day }}</div>
                  <button
                    v-for="date in getUtcMonthDays(month)"
                    :key="formatUtcDate(date)"
                    type="button"
                    :class="`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                      isDateRangeEdge(formatUtcDate(date), draftStart, draftEnd)
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-100'
                        : isWithinDateRange(formatUtcDate(date), draftStart, draftEnd)
                          ? 'bg-indigo-50 text-indigo-700'
                          : date.getUTCMonth() === month.getUTCMonth()
                            ? 'text-slate-800 hover:bg-indigo-50 hover:text-indigo-700'
                            : 'text-slate-300 hover:bg-slate-50'
                    }`"
                    @click="handleAnalyticsDayClick(formatUtcDate(date))"
                  >
                    {{ date.getUTCDate() }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <button
        type="button"
        :class="`inline-flex w-full min-w-0 items-center gap-2 rounded-xl border px-3 text-left font-black shadow-3xs transition-all ${
          compact ? 'h-9 text-[10px]' : 'h-11 text-xs'
        } ${
          hasValue
            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
            : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
        } ${hasValue ? 'pr-8' : ''} ${buttonClassName}`"
        @click="open = !open"
      >
        <Calendar class="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span v-if="label" class="shrink-0 text-[10px] font-black text-slate-400">{{ label }}</span>
        <span class="min-w-0 flex-1 truncate whitespace-nowrap text-slate-700">{{ summary }}</span>
      </button>

      <button
        v-if="hasValue"
        type="button"
        :class="`absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-lg text-indigo-400 transition-all hover:bg-white/80 hover:text-rose-500 ${
          compact ? 'h-5 w-5' : 'h-6 w-6'
        }`"
        aria-label="清除时间范围"
        @click.stop="
          clearRange();
          open = false
        "
      >
        <X :class="compact ? 'h-3 w-3' : 'h-3.5 w-3.5'" />
      </button>

      <div
        v-if="open"
        :class="`absolute top-full z-[120] mt-2 ${popoverWidth} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`"
      >
      <div :class="`flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-100 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`">
        <div class="flex min-w-0 items-center gap-3">
          <span :class="`${compact ? 'text-[10px]' : 'text-xs'} font-black uppercase tracking-wide text-slate-400`">UTC</span>
          <span :class="`${compact ? 'text-xs' : 'text-sm'} truncate font-black text-slate-900`">{{ rangeLabel }}</span>
        </div>
        <Calendar class="h-4 w-4 shrink-0 text-slate-500" />
      </div>

      <div :class="`grid ${panelMaxHeight} grid-cols-1 overflow-y-auto ${sideColumn}`">
        <div :class="`${compact ? 'space-y-1.5 p-2' : 'space-y-2 p-3'} border-b border-slate-100 bg-white md:border-b-0 md:border-r`">
          <button
            v-for="preset in PRESETS"
            :key="preset.id"
            type="button"
            :class="`${compact ? 'h-7 rounded-lg text-[10px]' : 'h-9 rounded-xl text-xs'} w-full bg-slate-100 px-3 text-center font-bold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600`"
            @click="applyPreset(preset.id)"
          >
            {{ preset.label }}
          </button>
        </div>

        <div class="min-w-0">
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div
              v-for="(month, monthIndex) in months"
              :key="`${month.getFullYear()}-${month.getMonth()}`"
              :class="monthIndex === 0 ? 'border-b border-slate-100 md:border-b-0 md:border-r' : ''"
            >
              <div :class="`flex ${monthHeaderHeight} items-center justify-between border-b border-slate-100 ${compact ? 'px-3' : 'px-5'}`">
                <div v-if="monthIndex === 0" class="flex items-center gap-1">
                  <button type="button" :class="`${compact ? 'p-1' : 'p-1.5'} rounded-lg text-slate-500 hover:bg-slate-100`" @click="viewMonth = addMonths(viewMonth, -12)">
                    <ChevronsLeft :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
                  </button>
                  <button type="button" :class="`${compact ? 'p-1' : 'p-1.5'} rounded-lg text-slate-500 hover:bg-slate-100`" @click="viewMonth = addMonths(viewMonth, -1)">
                    <ChevronLeft :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
                  </button>
                </div>
                <div v-else />

                <span :class="`${compact ? 'text-sm' : 'text-base'} font-black text-slate-900`">{{ monthTitle(month) }}</span>

                <div v-if="monthIndex === 1" class="flex items-center gap-1">
                  <button type="button" :class="`${compact ? 'p-1' : 'p-1.5'} rounded-lg text-slate-500 hover:bg-slate-100`" @click="viewMonth = addMonths(viewMonth, 1)">
                    <ChevronRight :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
                  </button>
                  <button type="button" :class="`${compact ? 'p-1' : 'p-1.5'} rounded-lg text-slate-500 hover:bg-slate-100`" @click="viewMonth = addMonths(viewMonth, 12)">
                    <ChevronsRight :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
                  </button>
                </div>
                <div v-else />
              </div>

              <div :class="`grid grid-cols-7 gap-y-1 text-center ${compact ? 'px-3 pt-3' : 'px-4 pt-4'}`">
                <div v-for="day in WEEKDAYS" :key="day" :class="`${compact ? 'pb-1.5 text-[10px]' : 'pb-2 text-[11px]'} font-bold text-slate-500`">
                  {{ day }}
                </div>
                <button
                  v-for="cell in getMonthCells(month)"
                  :key="cell.value"
                  type="button"
                  :class="`${dayCellHeight} font-bold transition-all ${
                    cell.value === draftStart || cell.value === draftEnd
                      ? 'rounded-full bg-slate-950 text-white shadow-sm'
                      : isBetween(cell.value, draftStart, draftEnd)
                        ? 'bg-indigo-50 text-indigo-700'
                        : cell.inMonth
                          ? 'text-slate-800 hover:rounded-full hover:bg-slate-100'
                          : 'text-slate-300 hover:rounded-full hover:bg-slate-50'
                  }`"
                  @click="handleDayClick(cell.value)"
                >
                  {{ cell.day }}
                </button>
              </div>
            </div>
          </div>

          <div :class="`flex items-center justify-end gap-2 border-t border-slate-100 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`">
            <button
              type="button"
              :class="`${compact ? 'h-8 rounded-lg px-3 text-[10px]' : 'h-9 rounded-xl px-4 text-xs'} border border-slate-150 bg-white font-black text-slate-500 transition-all hover:border-rose-150 hover:bg-rose-50 hover:text-rose-600`"
              @click="clearRange"
            >
              清空
            </button>
            <button
              type="button"
              :class="`${compact ? 'h-8 rounded-lg px-4 text-[10px]' : 'h-9 rounded-xl px-5 text-xs'} bg-slate-950 font-black text-white shadow-sm transition-all hover:bg-slate-800`"
              @click="open = false"
            >
              完成
            </button>
          </div>
        </div>
      </div>
      </div>
    </template>
  </div>
</template>
