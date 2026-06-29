<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Calendar,
  Check,
  ChevronDown,
  Hash,
  Inbox,
  ListTodo,
  Pause,
  Play,
  Plus,
  Tag,
  Target,
  Trash2,
  X,
} from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'
import ScheduleRequirementTable from './ScheduleRequirementTable.vue'
import { channelDisplayName } from './channel'
import { parseRequirementVersionId } from './requirementUtils'
import {
  getDeliveryStatusLabel,
  getDeliveryStatusStyle,
  getPriorityLabel,
  getPriorityStyle,
  getProdStatusLabel,
  getProdStatusStyle,
  getReqStatusLabel,
  getStatusStyle,
} from './styles'

const props = defineProps({
  schedule: {
    type: Object,
    required: true,
  },
  requirements: {
    type: Array,
    default: () => [],
  },
  scheduleInsight: {
    type: Object,
    default: null,
  },
  weekRanges: {
    type: Array,
    default: () => [],
  },
  weekVisualMap: {
    type: Object,
    default: () => ({}),
  },
  deliverySets: {
    type: Array,
    default: () => [],
  },
  editingScheduleId: {
    type: String,
    default: null,
  },
  todayDateString: {
    type: String,
    default: '2026-06-26',
  },
})

const emit = defineEmits([
  'close',
  'add-requirement',
  'update-schedule',
  'update-schedule-priority',
  'update-requirement',
  'delete-requirement',
  'open-requirement',
  'apply-cycle-adjustment',
  'create-delivery-set',
])

const openScheduleInfoMenuKey = ref(null)
const openRequirementMenuKey = ref(null)
const modalRootRef = ref(null)
const scheduleTagInput = ref('')
const isCycleAdjustOpen = ref(false)
const isCycleAdjustWeekMenuOpen = ref(false)
const cycleAdjustTargetWeekRange = ref('')
const cycleAdjustRequirementIds = ref([])

const associatedReqs = computed(() =>
  [...props.requirements].sort((a, b) => {
    const aParsed = parseRequirementVersionId(a.id)
    const bParsed = parseRequirementVersionId(b.id)
    const aMajor = aParsed?.majorId || `cp${a.assetIndex || 0}`
    const bMajor = bParsed?.majorId || `cp${b.assetIndex || 0}`
    if (aMajor !== bMajor) return (b.assetIndex || 0) - (a.assetIndex || 0)
    return Number(a.assetVersion || 0) - Number(b.assetVersion || 0)
  }),
)

const cycleAdjustCandidates = computed(() =>
  associatedReqs.value.filter((requirement) => requirement.prodStatus !== 'Completed'),
)

const completedNotLaunchedCount = computed(() => props.scheduleInsight?.completedNotLaunched || 0)

const parseWeekRangeDates = (weekRange) => {
  const [start = '', end = ''] = String(weekRange || '').split(' ~ ')
  const toTime = (dateString) => {
    const time = new Date(`${dateString}T00:00:00`).getTime()
    return Number.isNaN(time) ? 0 : time
  }
  return { start, end, startTime: toTime(start), endTime: toTime(end) }
}

const cycleAdjustTargetRanges = computed(() => {
  const todayTime = parseWeekRangeDates(`${props.todayDateString} ~ ${props.todayDateString}`).startTime
  return props.weekRanges
    .filter((range) => range && range !== props.schedule.weekRange)
    .map((range) => ({ range, parsed: parseWeekRangeDates(range) }))
    .filter(({ parsed }) => parsed.endTime >= todayTime)
    .sort((a, b) => a.parsed.startTime - b.parsed.startTime)
    .map(({ range }) => range)
})

const cycleAdjustRemainingCount = computed(() =>
  associatedReqs.value.filter((requirement) => !cycleAdjustRequirementIds.value.includes(requirement.id)).length,
)

const cycleAdjustMode = computed(() => (cycleAdjustRemainingCount.value === 0 ? 'move' : 'copy'))

const modalDeliverySetDrafts = computed(() =>
  props.deliverySets.filter((set) => (set.scheduleIds || [set.scheduleId]).includes(props.schedule.id)),
)

const scheduleInfoItems = computed(() => [
  {
    key: 'form',
    label: '类型',
    value: props.schedule.form || 'Video',
    display: props.schedule.form === 'Playable' ? '试玩' : props.schedule.form === 'Image' ? '图片' : '视频',
    options: [
      { value: 'Video', label: '视频' },
      { value: 'Image', label: '图片' },
      { value: 'Playable', label: '试玩' },
    ],
  },
  {
    key: 'broadDirection',
    label: '大方向',
    value: props.schedule.broadDirection || '原始玩法',
    display: props.schedule.broadDirection || '原始玩法',
    options: [
      { value: '原始玩法', label: '原始玩法' },
      { value: '3D玩法', label: '3D玩法' },
      { value: '大字报', label: '大字报' },
    ],
  },
  {
    key: 'materialStage',
    label: '阶段',
    value: props.schedule.materialStage || '新',
    display: props.schedule.materialStage || '新',
    options: [
      { value: '新', label: '新' },
      { value: '迭', label: '迭' },
      { value: '老', label: '老' },
    ],
  },
  {
    key: 'priority',
    label: '优先级',
    value: props.schedule.priority || 'Mid',
    display: getPriorityLabel(props.schedule.priority),
    options: [
      { value: 'Highest', label: '最高' },
      { value: 'High', label: '高' },
      { value: 'Mid', label: '中' },
      { value: 'Low', label: '低' },
    ],
  },
  {
    key: 'owner',
    label: '负责人',
    value: props.schedule.owner || '唐欣怡',
    display: props.schedule.owner || '未指派',
    options: ['唐欣怡', '吉意煊', '马嘉良', '张欢', '吴楠', '宋爽'].map((name) => ({
      value: name,
      label: name,
    })),
  },
])

const requirementDropdowns = {
  priority: {
    options: [
      { value: 'Low', label: '低' },
      { value: 'Mid', label: '中' },
      { value: 'High', label: '高' },
      { value: 'Highest', label: '最高' },
    ],
    label: getPriorityLabel,
    className: getPriorityStyle,
  },
  reqStatus: {
    options: [
      { value: 'Draft', label: '草稿' },
      { value: 'Pending', label: '待审核' },
      { value: 'Approved', label: '审核通过' },
      { value: 'Modification', label: '需求修改' },
    ],
    label: getReqStatusLabel,
    className: getStatusStyle,
  },
  prodStatus: {
    options: [
      { value: 'Unscheduled', label: '未排期' },
      { value: 'Scheduled', label: '已排期' },
      { value: 'InProgress', label: '进行中' },
      { value: 'Completed', label: '已完成' },
    ],
    label: getProdStatusLabel,
    className: getProdStatusStyle,
  },
}

const submitBadge = (dateString) => {
  if (!dateString) return { label: '未定', className: 'border-slate-150 bg-slate-50 text-slate-400' }
  if (dateString < props.todayDateString) return { label: '已逾期', className: 'border-rose-150 bg-rose-50 text-rose-600' }
  if (dateString === props.todayDateString) return { label: '今日', className: 'border-amber-150 bg-amber-50 text-amber-700' }
  return { label: dateString, className: 'border-slate-150 bg-slate-50 text-slate-600' }
}

const selectScheduleInfo = (key, value) => {
  if (key === 'priority') {
    emit('update-schedule-priority', props.schedule, value)
    openScheduleInfoMenuKey.value = null
    return
  }
  emit('update-schedule', props.schedule.id, { [key]: value })
  openScheduleInfoMenuKey.value = null
}

const addScheduleDirectionTag = () => {
  const tag = scheduleTagInput.value.trim()
  if (!tag) return
  const nextTags = Array.from(new Set([...(props.schedule.directionTags || []), tag]))
  emit('update-schedule', props.schedule.id, { directionTags: nextTags })
  scheduleTagInput.value = ''
}

const removeScheduleDirectionTag = (tag) => {
  emit('update-schedule', props.schedule.id, {
    directionTags: (props.schedule.directionTags || []).filter((item) => item !== tag),
  })
}

const updateRequirement = (id, updates) => {
  emit('update-requirement', id, updates)
  openRequirementMenuKey.value = null
}

const toggleCycleAdjustRequirement = (id) => {
  cycleAdjustRequirementIds.value = cycleAdjustRequirementIds.value.includes(id)
    ? cycleAdjustRequirementIds.value.filter((item) => item !== id)
    : [...cycleAdjustRequirementIds.value, id]
}

const openCycleAdjustPanel = () => {
  isCycleAdjustOpen.value = !isCycleAdjustOpen.value
  cycleAdjustRequirementIds.value = cycleAdjustCandidates.value.map((requirement) => requirement.id)
  cycleAdjustTargetWeekRange.value =
    cycleAdjustTargetRanges.value[0] ||
    props.weekRanges.find((range) => range !== props.schedule.weekRange) ||
    ''
  isCycleAdjustWeekMenuOpen.value = false
}

const createDeliverySetDraft = () => {
  emit('create-delivery-set', props.schedule)
}

const applyCycleAdjustment = () => {
  emit('apply-cycle-adjustment', {
    schedule: props.schedule,
    targetWeekRange: cycleAdjustTargetWeekRange.value,
    requirementIds: cycleAdjustRequirementIds.value,
  })
  isCycleAdjustOpen.value = false
  isCycleAdjustWeekMenuOpen.value = false
}

const closeOpenMenus = () => {
  openScheduleInfoMenuKey.value = null
  openRequirementMenuKey.value = null
  isCycleAdjustWeekMenuOpen.value = false
}

const handleDocumentClick = (event) => {
  if (!modalRootRef.value?.contains(event.target)) closeOpenMenus()
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
  <div class="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-slate-900/60 p-4 font-sans backdrop-blur-md fade-in duration-200 md:p-6">
    <div ref="modalRootRef" class="relative flex h-[88vh] w-full max-w-7xl animate-in flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl zoom-in-95 duration-200">
      <div class="shrink-0 select-none border-b border-slate-100 bg-white px-6 py-3 md:px-7 md:py-4">
        <div class="flex flex-col justify-between gap-2.5 md:flex-row md:items-start">
          <div class="min-w-0 flex-1 space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-lg border border-slate-150 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-3xs">
                <Hash class="h-3 w-3 text-slate-400" />
                <span class="font-extrabold text-slate-700">{{ schedule.id }}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1 font-mono text-[10px] font-bold text-sky-700 shadow-3xs">
                <Calendar class="h-3 w-3 text-sky-500" />
                <span>排期周期</span>
                <span class="font-black text-sky-900">{{ schedule.weekRange || '通用周期' }}</span>
              </span>
            </div>

            <div class="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(260px,0.48fr)_minmax(360px,1fr)] lg:items-stretch">
              <div class="flex min-h-[48px] items-center rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5">
                <h2 class="min-w-0 break-words text-xl font-black leading-tight tracking-tight text-slate-850 md:text-2xl" :title="schedule.directionName">
                  {{ schedule.directionName || '未命名方向' }}
                </h2>
              </div>
              <div class="flex min-h-[48px] items-start gap-2 rounded-2xl border border-slate-150 bg-white px-4 py-2.5 shadow-3xs">
                <Target class="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <div class="min-w-0">
                  <div class="text-[10px] font-black text-slate-400">验证目标</div>
                  <p class="mt-0.5 line-clamp-2 text-xs font-bold leading-relaxed text-slate-700" :title="schedule.validationGoal">
                    {{ schedule.validationGoal || '暂无验证目标' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            class="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-500 shadow-3xs transition-all hover:border-rose-150 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
            type="button"
            title="关闭 [Esc]"
            @click="emit('close')"
          >
            <X class="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <div class="mt-2.5 rounded-2xl border border-slate-150 bg-slate-50/70 px-4 py-2.5">
          <div class="mb-2.5">
            <div class="mb-2 flex items-center gap-1.5 text-[10px] font-black text-slate-400">基础信息</div>
            <div class="flex flex-wrap items-center gap-2">
              <div v-for="item in scheduleInfoItems" :key="item.key" class="relative">
                <button
                  class="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-650 shadow-3xs transition-all hover:border-indigo-150 hover:bg-indigo-50 hover:text-indigo-700"
                  type="button"
                  @click.stop="openScheduleInfoMenuKey = openScheduleInfoMenuKey === item.key ? null : item.key"
                >
                  <span class="text-slate-400">{{ item.label }}</span>
                  <span>{{ item.display }}</span>
                  <ChevronDown :class="`h-3 w-3 shrink-0 text-slate-400 transition-transform ${openScheduleInfoMenuKey === item.key ? 'rotate-180' : ''}`" />
                </button>
                <div v-if="openScheduleInfoMenuKey === item.key" class="absolute left-0 top-full z-[150] mt-2 w-40 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                  <button
                    v-for="option in item.options"
                    :key="option.value"
                    :class="`flex h-8 w-full items-center justify-between rounded-xl px-3 text-left text-[11px] font-black transition-all ${
                      item.value === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                    }`"
                    type="button"
                    @click.stop="selectScheduleInfo(item.key, option.value)"
                  >
                    <span>{{ option.label }}</span>
                    <Check v-if="item.value === option.value" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-150 pt-3">
            <div class="mb-2 flex items-center gap-1.5 text-[10px] font-black text-slate-400">
              <Tag class="h-3.5 w-3.5" />
              方向标签
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="tag in schedule.directionTags || []"
                :key="tag"
                class="inline-flex h-7 items-center gap-1.5 rounded-full border border-indigo-150 bg-indigo-50 px-3 text-xs font-black text-indigo-700"
              >
                {{ tag }}
                <button class="-mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700" type="button" @click.stop="removeScheduleDirectionTag(tag)">
                  <X class="h-3 w-3" />
                </button>
              </span>
              <span v-if="(schedule.directionTags || []).length === 0" class="text-xs font-bold text-slate-400">
                暂无标签，可添加冰雪、sort、皮肤等方向关键词
              </span>
              <div class="inline-flex h-8 min-w-[180px] items-center gap-1.5 rounded-full border border-dashed border-slate-250 bg-white px-2.5">
                <input
                  v-model="scheduleTagInput"
                  class="h-full min-w-0 flex-1 bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-350"
                  placeholder="添加标签"
                  @click.stop
                  @keydown.enter.prevent="addScheduleDirectionTag"
                />
                <button class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-all hover:bg-indigo-100 disabled:bg-slate-50 disabled:text-slate-300" type="button" title="添加方向标签" :disabled="!scheduleTagInput.trim()" @click.stop="addScheduleDirectionTag">
                  <Plus class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/15 p-3 md:p-4">
        <div v-if="scheduleInsight" class="mb-3 shrink-0 rounded-2xl border border-slate-150 bg-white p-3 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span :class="`inline-flex h-7 items-center rounded-full border px-3 text-xs font-black ${scheduleInsight.statusTone}`">
                  {{ scheduleInsight.status }}
                </span>
                <span
                  v-if="schedule.inheritedFromScheduleId"
                  class="inline-flex h-7 items-center rounded-full border border-blue-150 bg-blue-50 px-3 text-xs font-black text-blue-700"
                  :title="schedule.inheritanceLabel || `继承自 ${schedule.inheritedFromScheduleId}`"
                >
                  {{ schedule.inheritanceLabel || `继承自 ${schedule.inheritedFromScheduleId}` }}
                </span>
                <span
                  v-if="(schedule.inheritedToScheduleIds || []).length > 0"
                  class="inline-flex h-7 items-center rounded-full border border-amber-150 bg-amber-50 px-3 text-xs font-black text-amber-700"
                >
                  已结转 {{ schedule.inheritedToScheduleIds.length }} 个方向
                </span>
              </div>
              <p class="mt-2 text-xs font-bold text-slate-500">{{ scheduleInsight.suggestion }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button class="inline-flex h-8 items-center rounded-xl border border-amber-200 bg-amber-50 px-3 text-[11px] font-black text-amber-800 transition-all hover:bg-amber-100" type="button" @click="openCycleAdjustPanel">
                调整周期
              </button>
              <button
                class="inline-flex h-8 items-center rounded-xl border border-emerald-150 bg-emerald-50 px-3 text-[11px] font-black text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-150 disabled:bg-slate-50 disabled:text-slate-300"
                type="button"
                :disabled="completedNotLaunchedCount === 0"
                @click="createDeliverySetDraft"
              >
                生成 Set 草稿
              </button>
            </div>
          </div>

          <div v-if="isCycleAdjustOpen" class="mt-3 rounded-2xl border border-amber-150 bg-amber-50/35 p-3">
            <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <span class="text-xs font-black text-slate-800">调整周期</span>
                <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">{{ cycleAdjustMode === 'move' ? '移动方向' : '复制方向' }}</span>
                <div class="relative">
                  <button
                    class="inline-flex h-8 min-w-[250px] items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3 text-[11px] font-black text-amber-700 shadow-sm transition-all hover:border-amber-300"
                    type="button"
                    @click="isCycleAdjustWeekMenuOpen = !isCycleAdjustWeekMenuOpen"
                  >
                    <span class="flex min-w-0 items-center gap-2">
                      <span :class="`h-2.5 w-2.5 shrink-0 rounded-full ${weekVisualMap[cycleAdjustTargetWeekRange]?.dotClass || 'bg-amber-500 ring-4 ring-amber-100'}`" />
                      <span class="truncate font-mono">{{ cycleAdjustTargetWeekRange || '选择目标周期' }}</span>
                    </span>
                    <ChevronDown :class="`h-3.5 w-3.5 shrink-0 transition-transform ${isCycleAdjustWeekMenuOpen ? 'rotate-180' : ''}`" />
                  </button>
                  <div v-if="isCycleAdjustWeekMenuOpen" class="absolute left-0 top-full z-[130] mt-2 max-h-72 w-[300px] overflow-auto rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/12">
                    <button
                      v-for="range in cycleAdjustTargetRanges"
                      :key="range"
                      :title="weekVisualMap[range]?.label"
                      :class="`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                        cycleAdjustTargetWeekRange === range ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                      }`"
                      type="button"
                      @click="
                        cycleAdjustTargetWeekRange = range;
                        isCycleAdjustWeekMenuOpen = false
                      "
                    >
                      <span class="flex min-w-0 items-center gap-2">
                        <span :class="`h-2.5 w-2.5 shrink-0 rounded-full ${weekVisualMap[range]?.dotClass || 'bg-amber-500 ring-4 ring-amber-100'}`" />
                        <span class="truncate font-mono">{{ range }}</span>
                      </span>
                      <Check v-if="cycleAdjustTargetWeekRange === range" class="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                    <div v-if="cycleAdjustTargetRanges.length === 0" class="px-3 py-2 text-[11px] font-bold text-slate-400">暂无可调整的未来周期</div>
                  </div>
                </div>
                <span class="text-[11px] font-bold text-slate-500">
                  {{ cycleAdjustMode === 'move' ? '没有需求留在原方向下，确认后整体移动。' : '仍有需求留在原方向下，确认后复制继承方向。' }}
                </span>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button class="inline-flex h-8 items-center rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-500 transition-all hover:bg-slate-50" type="button" @click="isCycleAdjustOpen = false; isCycleAdjustWeekMenuOpen = false">
                  取消
                </button>
                <button
                  class="inline-flex h-8 items-center rounded-xl border border-slate-800 bg-slate-800 px-3 text-[11px] font-black text-white shadow-sm shadow-slate-900/15 transition-all hover:bg-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
                  type="button"
                  :disabled="!cycleAdjustTargetWeekRange"
                  @click="applyCycleAdjustment"
                >
                  {{ cycleAdjustMode === 'move' ? '移动方向' : '复制方向' }}
                </button>
              </div>
            </div>
            <div class="mt-3 flex flex-col gap-2 border-t border-amber-100 pt-3 md:flex-row md:items-center">
              <div class="flex shrink-0 items-center justify-between gap-2">
                <span class="text-[10px] font-black text-slate-400">跟随调整的未完成需求</span>
                <button class="text-[10px] font-black text-emerald-600 hover:text-emerald-700 disabled:text-slate-300" type="button" :disabled="cycleAdjustCandidates.length === 0" @click="cycleAdjustRequirementIds = cycleAdjustCandidates.map((req) => req.id)">
                  全选未完成
                </button>
              </div>
              <div class="flex flex-1 flex-wrap gap-2">
                <button
                  v-for="req in cycleAdjustCandidates"
                  :key="req.id"
                  :class="`inline-flex h-8 items-center gap-2 rounded-xl border px-3 text-[11px] font-black transition-all ${
                    cycleAdjustRequirementIds.includes(req.id)
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-150 bg-white/60 text-slate-500 hover:bg-white'
                  }`"
                  type="button"
                  @click="toggleCycleAdjustRequirement(req.id)"
                >
                  <span :class="`flex h-3.5 w-3.5 items-center justify-center rounded border ${cycleAdjustRequirementIds.includes(req.id) ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-transparent'}`">
                    <Check class="h-3 w-3 stroke-[3]" />
                  </span>
                  {{ req.id }}
                </button>
                <span v-if="cycleAdjustCandidates.length === 0" class="text-[11px] font-bold text-slate-400">没有未完成需求可重新挂靠；确认后只复制或移动方向本身</span>
              </div>
            </div>
          </div>

          <div v-if="modalDeliverySetDrafts.length > 0" class="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <span class="text-[10px] font-black text-slate-400">Delivery Set 草稿</span>
            <span
              v-for="set in modalDeliverySetDrafts"
              :key="set.id"
              class="inline-flex h-7 items-center rounded-full border border-emerald-150 bg-emerald-50 px-3 text-[11px] font-black text-emerald-700"
              :title="`包含：${set.requirementIds.join('、')}`"
            >
              {{ channelDisplayName(set.channel) }} · {{ set.requirementIds.length }} 条
            </span>
          </div>
        </div>

        <ScheduleRequirementTable
          :schedule="schedule"
          :requirements="associatedReqs"
          :editing-schedule-id="editingScheduleId"
          :is-cycle-adjust-open="isCycleAdjustOpen"
          :cycle-adjust-requirement-ids="cycleAdjustRequirementIds"
          :today-date-string="todayDateString"
          @add-requirement="emit('add-requirement', $event)"
          @open-requirement="emit('open-requirement', $event)"
          @update-requirement="updateRequirement"
          @delete-requirement="emit('delete-requirement', $event)"
          @toggle-cycle-requirement="toggleCycleAdjustRequirement"
        />
      </div>
    </div>
  </div>
</template>
