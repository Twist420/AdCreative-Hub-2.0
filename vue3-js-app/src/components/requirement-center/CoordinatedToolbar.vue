<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Activity, AlertCircle, Check, ChevronDown, Filter, Plus, Search, User, X } from 'lucide-vue-next'
import DateRangePicker from '../DateRangePicker.vue'
import WeekRangeRuleInfo from './WeekRangeRuleInfo.vue'

defineProps({
  weekRanges: { type: Array, default: () => [] },
  pinnedWeekRanges: { type: Array, default: () => [] },
  overflowWeekRanges: { type: Array, default: () => [] },
  selectedWeekRanges: { type: Array, default: () => [] },
  weekVisualMap: { type: Object, default: () => ({}) },
  selectedWeekRange: { type: String, required: true },
  dateRangeStart: { type: String, default: '' },
  dateRangeEnd: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
  coordinatedFlexibleFilters: { type: Array, default: () => [] },
  isFlexibleFilterPanelOpen: { type: Boolean, default: false },
  openFlexibleFilterMenu: { default: null },
  flexibleFilterFields: { type: Array, default: () => [] },
  flexibleOperators: { type: Array, default: () => [] },
  coordinatedFilterGroups: { type: Array, default: () => [] },
  openCoordinatedFilterKey: { default: null },
  currentSort: { type: String, default: 'none' },
  sortOrder: { type: String, default: 'desc' },
  filteredScheduleCount: { type: Number, default: 0 },
})

const emit = defineEmits([
  'toggle-week',
  'open-add-week',
  'update-search',
  'update-date-range',
  'toggle-flexible-panel',
  'set-flexible-menu',
  'update-flexible-filter',
  'remove-flexible-filter',
  'add-flexible-filter',
  'set-filter-menu',
  'clear-filter',
  'toggle-filter-option',
  'set-sort',
  'reset-filters',
])

const showWeekFilterDropdown = ref(false)
const toolbarRootRef = ref(null)

const FILTER_ALL = '全部'
const FILTER_SEPARATOR = '|'

const sortOptions = [
  { key: 'scheduleRisk', label: '风险' },
  { key: 'priority', label: '优先级' },
  { key: 'progress', label: '进度' },
  { key: 'form', label: '类型' },
]

const decodeFilterValue = (value) =>
  !value || value === FILTER_ALL ? [] : String(value).split(FILTER_SEPARATOR).filter(Boolean)

const getFilterOptionLabel = (option) => {
  const labels = {
    Video: '视频',
    Image: '图片',
    Playable: '试玩',
    Highest: '最高',
    High: '高',
    Mid: '中',
    Low: '低',
  }
  return labels[option] || option
}

const getDropdownDisplay = (group) => {
  const selectedValues = decodeFilterValue(group.value)
  const labelByValue = Object.fromEntries(group.options)
  if (selectedValues.length === 0) return labelByValue[FILTER_ALL] || '全部'
  if (selectedValues.length === 1) return labelByValue[selectedValues[0]] || getFilterOptionLabel(selectedValues[0])
  return `${selectedValues.length} 项`
}

const isGroupFilterActive = (group) => decodeFilterValue(group.value).length > 0
const getFieldConfig = (fields, fieldKey) => fields.find((field) => field.key === fieldKey) || fields[0]
const getOperatorConfig = (operators, operatorKey) => operators.find((operator) => operator.key === operatorKey) || operators[0]

const closeOpenMenus = () => {
  showWeekFilterDropdown.value = false
  emit('set-flexible-menu', null)
  emit('set-filter-menu', null)
}

const handleDocumentClick = (event) => {
  if (!toolbarRootRef.value?.contains(event.target)) closeOpenMenus()
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeOpenMenus()
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
  <div ref="toolbarRootRef" class="flex shrink-0 flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex max-w-full flex-wrap items-center gap-2 overflow-visible pb-1 sm:max-w-[75%] md:max-w-[80%]">
        <button
          v-for="weekRange in pinnedWeekRanges"
          :key="weekRange"
          :class="`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black transition-all outline-none ${
            selectedWeekRanges.includes(weekRange)
              ? weekVisualMap[weekRange]?.activeClass || 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15'
              : weekVisualMap[weekRange]?.buttonClass || 'bg-white text-slate-705 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`"
          type="button"
          :title="weekVisualMap[weekRange]?.label"
          @click="emit('toggle-week', weekRange)"
        >
          <span :class="`h-2.5 w-2.5 shrink-0 rounded-full ${weekVisualMap[weekRange]?.dotClass || 'bg-amber-500 ring-4 ring-amber-100'}`" />
          <span class="font-mono">{{ weekRange }}</span>
          <Check v-if="selectedWeekRanges.includes(weekRange)" class="h-3.5 w-3.5 shrink-0 stroke-[3]" />
        </button>
        <div v-if="overflowWeekRanges.length > 0" class="relative shrink-0">
          <button
            :class="`flex h-[34px] items-center gap-1.5 rounded-xl border px-3 text-[11px] font-black transition-all outline-none ${
              overflowWeekRanges.some((range) => selectedWeekRanges.includes(range))
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`"
            type="button"
            @click="showWeekFilterDropdown = !showWeekFilterDropdown"
          >
            <span>更多周期</span>
            <span class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{{ overflowWeekRanges.length }}</span>
            <ChevronDown :class="`h-3 w-3 transition-transform ${showWeekFilterDropdown ? 'rotate-180' : ''}`" />
          </button>
          <div v-if="showWeekFilterDropdown" class="absolute left-0 top-full z-[100] mt-2 w-64 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
            <button
              v-for="weekRange in overflowWeekRanges"
              :key="weekRange"
              :class="`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-colors ${
                selectedWeekRanges.includes(weekRange)
                  ? weekVisualMap[weekRange]?.dropdownActiveClass || 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`"
              type="button"
              :title="weekVisualMap[weekRange]?.label"
              @click="emit('toggle-week', weekRange)"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span :class="`h-2.5 w-2.5 shrink-0 rounded-full ${weekVisualMap[weekRange]?.dotClass || 'bg-amber-500 ring-4 ring-amber-100'}`" />
                <span class="truncate font-mono">{{ weekRange }}</span>
              </span>
              <Check v-if="selectedWeekRanges.includes(weekRange)" class="h-3.5 w-3.5 shrink-0 stroke-[3]" />
            </button>
          </div>
        </div>
        <WeekRangeRuleInfo class-name="h-[34px] w-[34px] border border-slate-150 bg-white shadow-3xs hover:border-indigo-200" />
        <button
          class="flex shrink-0 items-center gap-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-450 transition-all hover:border-slate-400 hover:text-slate-650"
          type="button"
          @click="emit('open-add-week')"
        >
          <Plus class="h-3 w-3" />
          新周期
        </button>
      </div>

      <div class="group relative min-w-[200px]">
        <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-indigo-600" />
        <input
          :value="searchQuery"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-[11px] font-bold text-slate-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100/50"
          placeholder="在当前周期搜索需求或方向..."
          type="text"
          @input="emit('update-search', $event.target.value)"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2 border-t border-slate-100 pt-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <span class="inline-flex h-8 items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <Filter class="h-3 w-3 text-indigo-500" />
            快速筛选
          </span>

          <div class="relative">
            <button
              type="button"
              :class="`inline-flex h-8 min-w-[128px] items-center justify-between gap-2 rounded-xl border px-3 text-[10px] font-black shadow-3xs transition-all ${
                coordinatedFlexibleFilters.length > 0
                  ? 'border-indigo-150 bg-indigo-50 text-indigo-700'
                  : 'border-slate-150 bg-white text-slate-600 hover:border-slate-300'
              }`"
              @click="emit('toggle-flexible-panel')"
            >
              <span>通用筛选</span>
              <span v-if="coordinatedFlexibleFilters.length > 0" class="rounded-full bg-indigo-100 px-1.5 text-[9px] text-indigo-600">{{ coordinatedFlexibleFilters.length }}</span>
              <ChevronDown :class="`h-3 w-3 transition-transform ${isFlexibleFilterPanelOpen ? 'rotate-180' : ''}`" />
            </button>
            <div v-if="isFlexibleFilterPanelOpen" class="absolute left-0 top-full z-[130] mt-2 w-[620px] rounded-3xl border border-slate-150 bg-white p-4 shadow-2xl shadow-slate-900/10">
              <div class="flex items-center gap-2 text-sm font-black text-slate-850">
                <span>设置筛选条件</span>
                <AlertCircle class="h-4 w-4 text-slate-400" />
              </div>
              <div class="mt-4 flex flex-col gap-2">
                <div v-if="coordinatedFlexibleFilters.length === 0" class="rounded-2xl border border-dashed border-slate-150 bg-slate-50 px-3 py-3 text-[11px] font-bold text-slate-400">
                  暂无通用条件，可添加优先级、素材阶段、制作人员、场景、渠道、需求提交状态、制作完成进度、投放状态、语言等条件。
                </div>
                <div v-for="condition in coordinatedFlexibleFilters" :key="condition.id" class="flex min-w-0 items-center gap-2">
                  <div class="relative">
                    <button
                      class="inline-flex h-8 min-w-[120px] items-center justify-between gap-2 rounded-xl border border-slate-150 bg-white px-3 text-[11px] font-black text-slate-700 shadow-3xs transition-all hover:border-indigo-200"
                      type="button"
                      @click="emit('set-flexible-menu', openFlexibleFilterMenu === `${condition.id}:field` ? null : `${condition.id}:field`)"
                    >
                      <span>{{ getFieldConfig(flexibleFilterFields, condition.field).label }}</span>
                      <ChevronDown class="h-3.5 w-3.5" />
                    </button>
                    <div v-if="openFlexibleFilterMenu === `${condition.id}:field`" class="absolute left-0 top-full z-[140] mt-2 w-48 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                      <button
                        v-for="field in flexibleFilterFields"
                        :key="field.key"
                        :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${condition.field === field.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`"
                        type="button"
                        @click="
                          emit('update-flexible-filter', condition.id, { field: field.key, value: field.options[0] || '' });
                          emit('set-flexible-menu', null)
                        "
                      >
                        <span>{{ field.label }}</span>
                        <Check v-if="condition.field === field.key" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
                      </button>
                    </div>
                  </div>

                  <div class="relative">
                    <button
                      class="inline-flex h-8 min-w-[104px] items-center justify-between gap-2 rounded-xl border border-slate-150 bg-white px-3 text-[11px] font-black text-slate-700 shadow-3xs transition-all hover:border-indigo-200"
                      type="button"
                      @click="emit('set-flexible-menu', openFlexibleFilterMenu === `${condition.id}:operator` ? null : `${condition.id}:operator`)"
                    >
                      <span>{{ getOperatorConfig(flexibleOperators, condition.operator).label }}</span>
                      <ChevronDown class="h-3.5 w-3.5" />
                    </button>
                    <div v-if="openFlexibleFilterMenu === `${condition.id}:operator`" class="absolute left-0 top-full z-[140] mt-2 w-48 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                      <button
                        v-for="operator in flexibleOperators"
                        :key="operator.key"
                        :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${condition.operator === operator.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`"
                        type="button"
                        @click="
                          emit('update-flexible-filter', condition.id, { operator: operator.key });
                          emit('set-flexible-menu', null)
                        "
                      >
                        <span>{{ operator.label }}</span>
                        <Check v-if="condition.operator === operator.key" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
                      </button>
                    </div>
                  </div>

                  <div class="relative min-w-0 flex-1">
                    <button
                      :disabled="condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty'"
                      :class="`inline-flex h-8 w-full items-center justify-between gap-2 rounded-xl border px-3 text-[11px] font-black shadow-3xs transition-all ${
                        condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty'
                          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                          : 'border-slate-150 bg-white text-slate-700 hover:border-indigo-200'
                      }`"
                      type="button"
                      @click="emit('set-flexible-menu', openFlexibleFilterMenu === `${condition.id}:value` ? null : `${condition.id}:value`)"
                    >
                      <span class="truncate">{{ condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty' ? '无需选择值' : condition.value }}</span>
                      <ChevronDown v-if="condition.operator !== 'isEmpty' && condition.operator !== 'isNotEmpty'" class="h-3.5 w-3.5 shrink-0" />
                    </button>
                    <div v-if="openFlexibleFilterMenu === `${condition.id}:value` && condition.operator !== 'isEmpty' && condition.operator !== 'isNotEmpty'" class="absolute left-0 top-full z-[140] mt-2 w-full rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                      <button
                        v-for="option in getFieldConfig(flexibleFilterFields, condition.field).options"
                        :key="option"
                        :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${condition.value === option ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`"
                        type="button"
                        @click="
                          emit('update-flexible-filter', condition.id, { value: option });
                          emit('set-flexible-menu', null)
                        "
                      >
                        <span>{{ option }}</span>
                        <Check v-if="condition.value === option" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
                      </button>
                    </div>
                  </div>

                  <button
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                    type="button"
                    aria-label="删除筛选条件"
                    @click="emit('remove-flexible-filter', condition.id)"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                class="mt-4 inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-[12px] font-black text-slate-700 transition-all hover:bg-slate-50"
                type="button"
                @click="emit('add-flexible-filter')"
              >
                <Plus class="h-4 w-4" />
                添加条件
              </button>
            </div>
          </div>

          <div v-for="group in coordinatedFilterGroups" :key="group.key" class="relative">
            <button
              type="button"
              :class="`inline-flex h-8 ${group.minWidth} items-center justify-between gap-2 rounded-xl border px-2.5 text-[10px] font-black shadow-3xs transition-all ${
                isGroupFilterActive(group)
                  ? 'border-indigo-150 bg-indigo-50 pr-7 text-indigo-700'
                  : 'border-slate-150 bg-white text-slate-600 hover:border-slate-300'
              }`"
              @click="emit('set-filter-menu', openCoordinatedFilterKey === group.key ? null : group.key)"
            >
              <span class="flex min-w-0 items-center gap-1.5">
                <User v-if="group.icon === 'user'" class="h-3.5 w-3.5 shrink-0 text-slate-350" />
                <span class="shrink-0 text-slate-400">{{ group.label }}</span>
                <span class="max-w-[70px] truncate text-inherit">{{ getDropdownDisplay(group) }}</span>
              </span>
              <ChevronDown v-if="!isGroupFilterActive(group)" :class="`h-3 w-3 shrink-0 transition-transform ${openCoordinatedFilterKey === group.key ? 'rotate-180' : ''}`" />
            </button>
            <button
              v-if="isGroupFilterActive(group)"
              class="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-lg text-indigo-400 transition-all hover:bg-white/80 hover:text-rose-500"
              type="button"
              @click.stop="emit('clear-filter', group.key)"
            >
              <X class="h-3 w-3" />
            </button>

            <div v-if="openCoordinatedFilterKey === group.key" class="absolute left-0 top-full z-[120] mt-2 w-52 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <button
                :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${!isGroupFilterActive(group) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`"
                type="button"
                @click="
                  emit('toggle-filter-option', group.key, '全部');
                  emit('set-filter-menu', null)
                "
              >
                <span>{{ Object.fromEntries(group.options).全部 || '全部' }}</span>
                <Check v-if="!isGroupFilterActive(group)" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
              </button>
              <div class="my-1 h-px bg-slate-100" />
              <button
                v-for="[value, label] in group.options.filter(([value]) => value !== '全部')"
                :key="value"
                :class="`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                  decodeFilterValue(group.value).includes(value) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`"
                type="button"
                @click="emit('toggle-filter-option', group.key, value)"
              >
                <span
                  :class="`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                    decodeFilterValue(group.value).includes(value)
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-200 bg-white text-transparent'
                  }`"
                >
                  <Check class="h-3 w-3 stroke-[3]" />
                </span>
                <span class="truncate">{{ label }}</span>
              </button>
            </div>
          </div>

          <DateRangePicker
            label="周期时间"
            :start="dateRangeStart"
            :end="dateRangeEnd"
            compact
            class-name="min-w-[260px] flex-1"
            @change="emit('update-date-range', $event)"
          />

          <button
            type="button"
            class="inline-flex h-8 items-center rounded-xl border border-slate-150 bg-white px-3 text-[10px] font-black text-slate-400 transition-all hover:border-rose-150 hover:bg-rose-50 hover:text-rose-600"
            @click="emit('reset-filters')"
          >
            清空筛选
          </button>
        </div>

        <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <span class="inline-flex h-8 items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 text-[10px] font-black text-amber-600">
            <Activity class="h-3 w-3" />
            排序
          </span>
          <div class="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-150 bg-slate-50 p-1">
            <button
              v-for="sortOption in sortOptions"
              :key="sortOption.key"
              type="button"
              :class="`h-6 rounded-xl px-2.5 text-[10px] font-black transition-all ${
                currentSort === sortOption.key
                  ? 'bg-white text-indigo-650 shadow-3xs'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
              }`"
              @click="emit('set-sort', sortOption.key)"
            >
              {{ sortOption.label }}
              <span v-if="currentSort === sortOption.key" class="ml-1 text-[9px] text-indigo-400">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-[10px] font-black text-slate-400">当前显示 {{ filteredScheduleCount }} 个方向</span>
      </div>
    </div>
  </div>
</template>
