<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  FileEdit,
  Gamepad2,
  Image as ImageIcon,
  Plus,
  Radio,
  Target,
  Trash2,
  User,
  Video,
} from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'
import { getPersonAvatarUrl } from './people'

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
  isEditing: {
    type: Boolean,
    default: false,
  },
  todayDateString: {
    type: String,
    default: '2026-06-26',
  },
  showInstantTooltip: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['open-detail', 'open-requirement', 'edit', 'save', 'delete', 'add-requirement', 'update-schedule', 'clear-instant-tooltip'])
const cardRootRef = ref(null)
const openEditMenuKey = ref(null)

const formOptions = [
  { value: 'Playable', label: '试玩' },
  { value: 'Image', label: '图片' },
  { value: 'Video', label: '视频' },
]
const broadDirectionOptions = ['3D玩法', '大字报', '原始玩法']
const materialStageOptions = ['新', '迭', '老']
const priorityOptions = [
  { value: 'Highest', label: '🔴 最高' },
  { value: 'High', label: '🟠 高' },
  { value: 'Mid', label: '🟡 中' },
  { value: 'Low', label: '🟢 低' },
]
const ownerOptions = ['唐欣怡', '吉意煊', '马嘉良']
const scenarioOptions = [
  { value: 'Standard', label: '通投' },
  { value: 'ASO', label: 'ASO' },
  { value: 'Localized', label: '本地化' },
]
const channelOptions = ['all', 'apl', 'fb', 'uac', 'adjoe', 'moloco', 'unity']

const associatedReqs = computed(() => props.requirements)

const totalReqs = computed(() => associatedReqs.value.length)
const completedReqs = computed(() => associatedReqs.value.filter((r) => r.prodStatus === 'Completed').length)
const inProgressReqs = computed(() => associatedReqs.value.filter((r) => r.prodStatus === 'InProgress').length)
const scheduledReqs = computed(() => associatedReqs.value.filter((r) => r.prodStatus === 'Scheduled' || !r.prodStatus).length)

const completedPercent = computed(() => (totalReqs.value > 0 ? (completedReqs.value / totalReqs.value) * 100 : 0))
const inProgressPercent = computed(() => (totalReqs.value > 0 ? (inProgressReqs.value / totalReqs.value) * 100 : 0))
const totalProdPercent = computed(() => (totalReqs.value > 0 ? Math.round((completedReqs.value / totalReqs.value) * 100) : 0))

const approvedReqsCount = computed(() => associatedReqs.value.filter((r) => r.reqStatus === 'Approved').length)
const pendingReqsCount = computed(() =>
  associatedReqs.value.filter((r) => r.reqStatus === 'Pending' || r.reqStatus === 'Modification').length,
)
const totalPlannedCount = computed(() => props.schedule.totalRequiredCount || 1)
const unsubmittedReqsCount = computed(() =>
  Math.max(0, totalPlannedCount.value - approvedReqsCount.value - pendingReqsCount.value),
)
const approvedPct = computed(() => Math.min(100, (approvedReqsCount.value / totalPlannedCount.value) * 100))
const pendingPct = computed(() =>
  Math.min(100 - approvedPct.value, (pendingReqsCount.value / totalPlannedCount.value) * 100),
)
const localSubmissionPercent = computed(() =>
  Math.min(100, Math.round(((approvedReqsCount.value + pendingReqsCount.value) / totalPlannedCount.value) * 100)),
)

const visibleAssociatedReqs = computed(() => associatedReqs.value.slice(0, 3))
const hiddenAssociatedReqCount = computed(() => Math.max(0, associatedReqs.value.length - visibleAssociatedReqs.value.length))

const cardPriorityStyle = 'border-slate-150 shadow-xs hover:shadow-md'

const getDelayDays = (dateString) => {
  if (!dateString) return 0
  const target = new Date(`${dateString}T00:00:00`)
  const today = new Date(`${props.todayDateString}T00:00:00`)
  if (Number.isNaN(target.getTime()) || Number.isNaN(today.getTime())) return 0
  return Math.max(0, Math.floor((today.getTime() - target.getTime()) / 86400000))
}

const scheduleDelayedItems = computed(() =>
  associatedReqs.value
    .map((req) => ({
      req,
      delayedDays: getDelayDays(req.endDate || props.schedule.productionEnd || props.schedule.submissionDeadline || props.schedule.requirementEnd),
    }))
    .filter((item) => item.delayedDays > 0)
    .sort((a, b) => b.delayedDays - a.delayedDays),
)

const delayedTooltipText = computed(() => {
  if (!scheduleDelayedItems.value.length) return ''
  const firstDelayedItem = scheduleDelayedItems.value[0]
  return `延期需求 ${scheduleDelayedItems.value.length} 个：${firstDelayedItem.req.id} 已延期 ${firstDelayedItem.delayedDays} 天`
})

const showDelayedTooltip = (event) => {
  if (props.showInstantTooltip && delayedTooltipText.value) {
    props.showInstantTooltip(event, delayedTooltipText.value)
  }
}

const update = (updates) => emit('update-schedule', props.schedule.id, updates)
const selectAndClose = (updates) => {
  update(updates)
  openEditMenuKey.value = null
}

const openDetail = () => {
  if (!props.isEditing) emit('open-detail', props.schedule)
}

const openNativeDatePicker = (event) => {
  event.currentTarget?.showPicker?.()
}

const closeEditMenus = () => {
  openEditMenuKey.value = null
}

const handleDocumentClick = (event) => {
  if (!cardRootRef.value?.contains(event.target)) closeEditMenus()
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeEditMenus()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})

const formValueClass = (value) => {
  const active = (props.schedule.form || 'Video') === value
  if (active && value === 'Playable') return 'border-indigo-200 bg-indigo-600 text-white'
  if (active && value === 'Image') return 'border-amber-200 bg-amber-500 text-white'
  if (active) return 'border-rose-200 bg-rose-500 text-white'
  return 'border-slate-200 bg-white text-slate-500 hover:border-indigo-150 hover:text-indigo-600'
}

const simplePillClass = (active, tone = 'indigo') => {
  if (!active) return 'border-slate-200 bg-white text-slate-500 hover:border-indigo-150 hover:text-indigo-600'
  if (tone === 'rose') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (tone === 'orange') return 'border-orange-200 bg-orange-50 text-orange-700'
  if (tone === 'emerald') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (tone === 'slate') return 'border-slate-200 bg-slate-50 text-slate-600'
  return 'border-indigo-200 bg-indigo-50 text-indigo-700'
}

const priorityTone = (value) => {
  if (value === 'Highest') return 'rose'
  if (value === 'High') return 'orange'
  if (value === 'Low') return 'slate'
  return 'indigo'
}

const channelColorClass = computed(() => {
  const chan = props.schedule.channels?.[0] || 'all'
  const chanNorm = chan.toLowerCase()

  if (chanNorm === 'fb') return 'text-blue-600 border-blue-100 bg-blue-50/40'
  if (chanNorm === 'uac') return 'text-emerald-600 border-emerald-100 bg-emerald-50/40'
  if (chanNorm === 'apl') return 'text-orange-600 border-orange-100 bg-orange-50/40'
  if (chanNorm === 'adjoe') return 'text-fuchsia-600 border-fuchsia-100 bg-fuchsia-50/40'
  if (chanNorm === 'moloco') return 'text-rose-600 border-rose-100 bg-rose-50/40'
  if (chanNorm === 'unity') return 'text-purple-600 border-purple-100 bg-purple-50/40'
  return 'text-slate-600 border-slate-200 bg-slate-50/70'
})

const channelLabel = computed(() => (props.schedule.channels?.[0] || 'all').toUpperCase())

const getRequirementStatusClass = (req) => {
  if (req.prodStatus === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-150'
  if (req.prodStatus === 'InProgress') return 'bg-sky-50 text-sky-700 border-sky-150'
  return 'bg-slate-50 text-slate-550 border-slate-150'
}

const getRequirementStatusLabel = (req) => {
  if (req.prodStatus === 'Completed') return '已完成'
  if (req.prodStatus === 'InProgress') return '进行中'
  return '未开始'
}

const getBaseId = (id) => String(id || '').split('-')[0]
</script>

<template>
  <div
    ref="cardRootRef"
    :class="`h-[470px] bg-white rounded-3xl border transition-all p-5 flex flex-col cursor-pointer group relative overflow-hidden min-w-0 ${cardPriorityStyle}`"
    @click="openDetail"
  >
    <div class="flex min-h-0 flex-1 flex-col">
      <div :class="`mb-3 ${isEditing ? 'flex items-start gap-1' : 'flex flex-col pr-9 min-[480px]:flex-row min-[480px]:items-start justify-between gap-2'}`">
        <div :class="`flex min-w-0 gap-1.5 ${isEditing ? 'flex-nowrap' : 'flex-wrap'}`" @click="isEditing ? $event.stopPropagation() : null">
          <template v-if="isEditing">
            <div class="relative shrink-0">
              <button
                class="inline-flex h-[24px] w-[50px] items-center justify-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-extrabold text-slate-705"
                type="button"
                @click.stop="openEditMenuKey = openEditMenuKey === 'form' ? null : 'form'"
              >
                {{ schedule.form === 'Playable' ? '试玩' : schedule.form === 'Image' ? '图片' : '视频' }}
              </button>
              <div v-if="openEditMenuKey === 'form'" class="absolute left-0 top-full z-[220] mt-1 w-24 rounded-xl border border-slate-150 bg-white p-1 shadow-xl">
                <button v-for="option in formOptions" :key="option.value" class="flex h-7 w-full items-center rounded-lg px-2 text-left text-[10px] font-extrabold text-slate-650 hover:bg-slate-50" type="button" @click.stop="selectAndClose({ form: option.value })">
                  {{ option.label }}
                </button>
              </div>
            </div>
            <div class="relative shrink-0">
              <button
                class="inline-flex h-[24px] w-[62px] items-center justify-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-extrabold text-slate-705"
                type="button"
                @click.stop="openEditMenuKey = openEditMenuKey === 'broadDirection' ? null : 'broadDirection'"
              >
                {{ schedule.broadDirection || '原始玩法' }}
              </button>
              <div v-if="openEditMenuKey === 'broadDirection'" class="absolute left-0 top-full z-[220] mt-1 w-28 rounded-xl border border-slate-150 bg-white p-1 shadow-xl">
                <button v-for="option in broadDirectionOptions" :key="option" class="flex h-7 w-full items-center rounded-lg px-2 text-left text-[10px] font-extrabold text-slate-650 hover:bg-slate-50" type="button" @click.stop="selectAndClose({ broadDirection: option })">
                  {{ option }}
                </button>
              </div>
            </div>
            <div class="relative shrink-0">
              <button
                class="inline-flex h-[24px] w-[38px] items-center justify-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-extrabold text-slate-705"
                type="button"
                @click.stop="openEditMenuKey = openEditMenuKey === 'materialStage' ? null : 'materialStage'"
              >
                {{ schedule.materialStage || '新' }}
              </button>
              <div v-if="openEditMenuKey === 'materialStage'" class="absolute left-0 top-full z-[220] mt-1 w-20 rounded-xl border border-slate-150 bg-white p-1 shadow-xl">
                <button v-for="option in materialStageOptions" :key="option" class="flex h-7 w-full items-center rounded-lg px-2 text-left text-[10px] font-extrabold text-slate-650 hover:bg-slate-50" type="button" @click.stop="selectAndClose({ materialStage: option })">
                  {{ option }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
          <span
            :class="`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] shrink-0 whitespace-nowrap ${
              schedule.form === 'Playable'
                ? 'bg-indigo-50 border-indigo-150 text-indigo-700'
                : schedule.form === 'Image'
                  ? 'bg-amber-50 border-amber-150 text-amber-700'
                  : 'bg-rose-50 border-rose-150 text-rose-700'
            }`"
          >
            <Gamepad2 v-if="schedule.form === 'Playable'" class="w-2.5 h-2.5 shrink-0" />
            <ImageIcon v-else-if="schedule.form === 'Image'" class="w-2.5 h-2.5 shrink-0" />
            <Video v-else class="w-2.5 h-2.5 shrink-0" />
            {{ schedule.form === 'Playable' ? '试玩' : schedule.form === 'Image' ? '图片' : '视频' }}
          </span>

          <span
            :class="`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] shrink-0 whitespace-nowrap ${
              schedule.broadDirection === '3D玩法'
                ? 'bg-violet-50 border-violet-150 text-violet-700'
                : schedule.broadDirection === '大字报'
                  ? 'bg-red-50 border-red-150 text-red-700'
                  : 'bg-slate-50 border-slate-150 text-slate-650'
            }`"
          >
            {{ schedule.broadDirection || '原始玩法' }}
          </span>

          <span
            :class="`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] shrink-0 whitespace-nowrap ${
              schedule.materialStage === '新'
                ? 'bg-emerald-50 border-emerald-150 text-emerald-700'
                : schedule.materialStage === '迭'
                  ? 'bg-indigo-50 border-indigo-150 text-indigo-700'
                  : 'bg-slate-50 border-slate-150 text-slate-600'
            }`"
          >
            #{{ schedule.materialStage || '新' }}
          </span>
          </template>
        </div>

        <div :class="`flex shrink-0 items-center justify-end gap-1.5 self-start min-[480px]:self-auto ${isEditing ? 'flex-nowrap' : 'flex-wrap'}`" @click="isEditing ? $event.stopPropagation() : null">
          <div
            v-if="isEditing"
            class="relative shrink-0"
          >
            <button
              :class="`h-[24px] w-[66px] cursor-pointer whitespace-nowrap rounded-full border px-1 py-0.5 text-[10px] font-bold outline-none ${
                schedule.priority === 'Highest'
                  ? 'border-rose-200 bg-rose-50 font-extrabold text-rose-700'
                  : schedule.priority === 'High'
                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                    : schedule.priority === 'Low'
                      ? 'border-slate-200 bg-slate-50 text-slate-500'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`"
              type="button"
              @click.stop="openEditMenuKey = openEditMenuKey === 'priority' ? null : 'priority'"
            >
              {{ schedule.priority === 'Highest' ? '🔴 最高' : schedule.priority === 'High' ? '🟠 高' : schedule.priority === 'Low' ? '🟢 低' : '🟡 中' }}
            </button>
            <div v-if="openEditMenuKey === 'priority'" class="absolute right-0 top-full z-[220] mt-1 w-24 rounded-xl border border-slate-150 bg-white p-1 shadow-xl">
              <button v-for="option in priorityOptions" :key="option.value" class="flex h-7 w-full items-center rounded-lg px-2 text-left text-[10px] font-extrabold text-slate-650 hover:bg-slate-50" type="button" @click.stop="selectAndClose({ priority: option.value })">
                {{ option.label }}
              </button>
            </div>
          </div>
          <span
            v-else
            :class="`px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] flex items-center leading-none shrink-0 whitespace-nowrap ${
              schedule.priority === 'Highest'
                ? 'bg-rose-50 border-rose-150 text-rose-700'
                : schedule.priority === 'High'
                  ? 'bg-orange-50 border-orange-150 text-orange-705'
                  : schedule.priority === 'Low'
                    ? 'bg-slate-50 border-slate-150 text-slate-500'
                    : 'bg-indigo-50 border-indigo-150 text-indigo-700'
            }`"
          >
            {{ schedule.priority === 'Highest' ? '🔴 最高' : schedule.priority === 'High' ? '🟠 高' : schedule.priority === 'Low' ? '🟢 低' : '🟡 中' }}
          </span>

          <button
            :class="`flex h-[24px] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border py-0.5 text-[10px] font-bold whitespace-nowrap transition-all ${
              isEditing
                ? 'w-[50px] bg-emerald-50 border-emerald-200 px-1 hover:bg-emerald-100 text-emerald-700 font-black shadow-xs'
                : 'bg-indigo-50 border-indigo-200 px-2.5 hover:bg-indigo-100 text-indigo-700 hover:border-indigo-300 shadow-3xs'
            }`"
            :title="isEditing ? '保存修改企划并锁定' : '编辑此创意企划'"
            type="button"
            @click.stop="isEditing ? emit('save', schedule) : emit('edit', schedule)"
          >
            <CheckCircle v-if="isEditing" class="w-3 h-3 text-emerald-600 shrink-0" />
            <FileEdit v-else class="w-3 h-3 text-indigo-600 shrink-0" />
            <span>{{ isEditing ? '保存' : '编辑' }}</span>
          </button>
        </div>
      </div>

      <div class="mb-2" @click.stop="isEditing ? null : openDetail()">
        <input
          v-if="isEditing"
          :value="schedule.directionName || ''"
          class="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-0 text-sm font-black leading-none tracking-tight text-slate-850 transition-all hover:bg-slate-100/80 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-150"
          placeholder="输入方向名称..."
          title="修改方向名称"
          @input="update({ directionName: $event.target.value })"
        />
        <div
          v-else
          :class="`h-[38px] px-3 py-0 rounded-xl border flex items-center justify-between gap-2 shadow-3xs ${
            schedule.priority === 'Highest'
              ? 'bg-rose-50/70 text-rose-900 border-rose-150/60'
              : schedule.priority === 'High'
                ? 'bg-amber-50/70 text-amber-900 border-amber-150/60'
                : schedule.priority === 'Low'
                  ? 'bg-emerald-55/75 text-emerald-900 border-emerald-150/60'
                  : 'bg-slate-50 text-slate-800 border-slate-150'
          }`"
        >
          <h3 class="min-w-0 text-sm font-black tracking-tight leading-snug truncate" :title="schedule.directionName">
            {{ schedule.directionName || '未命名方向' }}
          </h3>
          <span
            v-if="scheduleDelayedItems.length"
            tabindex="0"
            class="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-rose-150 bg-white/90 px-2 text-[9px] font-black text-rose-600"
            :aria-label="delayedTooltipText"
            :title="delayedTooltipText"
            @mouseenter="showDelayedTooltip"
            @mouseleave="emit('clear-instant-tooltip')"
            @focus="showDelayedTooltip"
            @blur="emit('clear-instant-tooltip')"
          >
            <AlertCircle class="h-3 w-3" />
            {{ scheduleDelayedItems.length }}
          </span>
        </div>
      </div>

      <div class="mb-3 flex h-[34px] items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-0" @click.stop="isEditing ? null : openDetail()">
        <Target class="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <input
          v-if="isEditing"
          :value="schedule.validationGoal || ''"
          class="h-7 w-full rounded border border-slate-200 bg-white px-2 py-0 text-[11px] font-bold text-slate-600 transition-all hover:border-slate-300 focus:border-indigo-505 focus:outline-none"
          placeholder="关联测试假说或检验目标..."
          title="修改测试目标"
          @input="update({ validationGoal: $event.target.value })"
        />
        <p v-else class="text-[11px] text-slate-600 font-bold leading-relaxed truncate block max-w-full" :title="schedule.validationGoal">
          {{ schedule.validationGoal || '暂无验证假说或检验目标...' }}
        </p>
      </div>

      <div class="mb-3 grid grid-cols-1 gap-x-2 gap-y-2 rounded-xl border-t border-b border-slate-100/70 bg-slate-50/30 p-2 py-2 text-[10px] min-[440px]:grid-cols-2" @click.stop="isEditing ? null : openDetail()">
        <div class="flex items-center gap-1 text-slate-600" @click="isEditing ? $event.stopPropagation() : null">
          <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span class="font-semibold text-slate-400 shrink-0">负责:</span>
          <div v-if="isEditing" class="flex min-w-0 flex-1 items-center gap-1">
            <img
              :src="getPersonAvatarUrl(schedule.owner)"
              :alt="schedule.owner || '未指派'"
              class="h-5 w-5 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
              referrerpolicy="no-referrer"
            />
            <div class="relative min-w-0 flex-1">
              <button
                class="inline-flex h-6 w-full items-center justify-between rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-extrabold text-slate-705 hover:border-slate-300"
                type="button"
                @click.stop="openEditMenuKey = openEditMenuKey === 'owner' ? null : 'owner'"
              >
                <span class="truncate">{{ schedule.owner || '未指派' }}</span>
              </button>
              <div v-if="openEditMenuKey === 'owner'" class="absolute left-0 top-full z-[220] mt-1 w-36 rounded-xl border border-slate-150 bg-white p-1 shadow-xl">
                <button v-for="person in ownerOptions" :key="person" class="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[10px] font-extrabold text-slate-650 hover:bg-slate-50" type="button" @click.stop="selectAndClose({ owner: person })">
                  <img :src="getPersonAvatarUrl(person)" :alt="person" class="h-5 w-5 shrink-0 rounded-full border border-slate-150 bg-slate-50 object-cover" referrerpolicy="no-referrer" />
                  <span class="truncate">{{ person }}</span>
                </button>
              </div>
            </div>
          </div>
          <PersonParts v-else :name="schedule.owner || '未指派'" size="xs" class-name="rounded border border-slate-100 bg-white px-1 py-0.5" />
        </div>

        <div class="flex items-center gap-1 text-slate-600" @click="isEditing ? $event.stopPropagation() : null">
          <Compass class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span class="font-semibold text-slate-400 shrink-0">场景:</span>
          <div
            v-if="isEditing"
            class="relative min-w-[65px] flex-1"
          >
            <button
              class="inline-flex h-6 w-full items-center justify-between rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-extrabold text-slate-705 hover:border-slate-300"
              type="button"
              @click.stop="openEditMenuKey = openEditMenuKey === 'scenario' ? null : 'scenario'"
            >
              <span>{{ schedule.scenario === 'Localized' ? '本地化' : schedule.scenario === 'ASO' ? 'ASO' : '通投' }}</span>
            </button>
            <div v-if="openEditMenuKey === 'scenario'" class="absolute left-0 top-full z-[220] mt-1 w-24 rounded-xl border border-slate-150 bg-white p-1 shadow-xl">
              <button v-for="option in scenarioOptions" :key="option.value" class="flex h-7 w-full items-center rounded-lg px-2 text-left text-[10px] font-extrabold text-slate-650 hover:bg-slate-50" type="button" @click.stop="selectAndClose({ scenario: option.value })">
                {{ option.label }}
              </button>
            </div>
          </div>
          <span
            v-else
            :class="`font-extrabold bg-white px-1.5 py-0.5 rounded border border-slate-100 font-sans ${
              schedule.scenario === 'Localized'
                ? 'text-blue-600 border-blue-100 bg-blue-50/10'
                : schedule.scenario === 'ASO'
                  ? 'text-amber-600 border-amber-100 bg-amber-50/10'
                  : 'text-slate-655'
            }`"
          >
            {{ schedule.scenario === 'Localized' ? '本地化' : schedule.scenario === 'ASO' ? 'ASO' : '通投' }}
          </span>
        </div>

        <div class="flex items-center gap-1 text-slate-600 min-[440px]:col-span-2" @click="isEditing ? $event.stopPropagation() : null">
          <Radio class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span class="font-semibold text-slate-400 shrink-0">渠道:</span>
          <div
            v-if="isEditing"
            class="relative min-w-[125px] flex-1"
          >
            <button
              class="inline-flex h-6 w-full items-center justify-center rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-extrabold uppercase text-slate-705 hover:border-slate-300"
              type="button"
              @click.stop="openEditMenuKey = openEditMenuKey === 'channels' ? null : 'channels'"
            >
              {{ (schedule.channels?.[0] || 'all').toUpperCase() }}
            </button>
            <div v-if="openEditMenuKey === 'channels'" class="absolute left-0 top-full z-[220] mt-1 w-28 rounded-xl border border-slate-150 bg-white p-1 shadow-xl">
              <button v-for="option in channelOptions" :key="option" class="flex h-7 w-full items-center rounded-lg px-2 text-left font-mono text-[10px] font-extrabold uppercase text-slate-650 hover:bg-slate-50" type="button" @click.stop="selectAndClose({ channels: [option] })">
                {{ option.toUpperCase() }}
              </button>
            </div>
          </div>
          <span v-else :class="`font-extrabold uppercase px-2 py-0.5 rounded border font-mono flex-1 text-center text-[10px] ${channelColorClass}`">
            {{ channelLabel }}
          </span>
        </div>

        <div class="grid grid-cols-1 min-[520px]:grid-cols-2 gap-2 text-slate-600 min-[440px]:col-span-2">
          <div class="flex items-center gap-1 min-w-0" @click="isEditing ? $event.stopPropagation() : null">
            <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="font-semibold text-slate-400 shrink-0">初版:</span>
            <input
              v-if="isEditing"
              type="date"
              :value="schedule.acceptanceDate || ''"
              class="h-6 min-w-0 flex-1 rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] font-bold text-slate-605 hover:border-slate-300 focus:outline-none"
              title="修改初版验收时间"
              @click="openNativeDatePicker"
              @input="update({ acceptanceDate: $event.target.value })"
            />
            <span v-else class="font-mono font-bold text-slate-650 bg-white px-1.5 py-0.5 rounded border border-slate-100 flex-1 text-[10px] text-center">
              {{ schedule.acceptanceDate || '--' }}
            </span>
          </div>

          <div class="flex items-center gap-1 min-w-0" @click="isEditing ? $event.stopPropagation() : null">
            <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="font-semibold text-slate-400 shrink-0">截止:</span>
            <input
              v-if="isEditing"
              type="date"
              :value="schedule.submissionDeadline || ''"
              class="h-6 min-w-0 flex-1 rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] font-bold text-slate-605 hover:border-slate-300 focus:outline-none"
              title="修改截止时间"
              @click="openNativeDatePicker"
              @input="update({ submissionDeadline: $event.target.value })"
            />
            <span v-else class="font-mono font-bold text-slate-650 bg-white px-1.5 py-0.5 rounded border border-slate-100 flex-1 text-[10px] text-center">
              {{ schedule.submissionDeadline || '--' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-auto shrink-0 space-y-3 pt-3 border-t border-slate-100">
      <div>
        <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1 text-[10px]">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-extrabold text-slate-500 uppercase tracking-tight flex items-center gap-1 shrink-0">
              <span class="w-1.5 h-1.5 bg-indigo-550 rounded-full inline-block shrink-0" />
              1. 需求提交进度
            </span>
            <span v-if="!isEditing" class="text-slate-500 font-bold ml-1 font-sans shrink-0">
              <span class="text-[9px] flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/70">
                <span>有效: <strong class="text-slate-700 font-bold">{{ schedule.validCount }}</strong></span>
                <span class="text-slate-300">|</span>
                <span>总: <strong class="text-slate-705 font-bold">{{ schedule.totalRequiredCount }}</strong></span>
              </span>
            </span>
            <span v-else class="flex items-center gap-1 text-[9px] shrink-0" @click.stop>
              <span class="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">
                <span class="font-bold text-slate-400">有效:</span>
                <input
                  class="no-number-stepper h-4 w-8 rounded border border-slate-200 bg-white px-1 text-center font-mono text-[10px] font-bold text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  type="number"
                  min="0"
                  title="输入有效个数"
                  :value="schedule.validCount"
                  @input="update({ validCount: Math.max(0, Number($event.target.value) || 0) })"
                />
              </span>
              <span class="font-bold text-slate-300">/</span>
              <span class="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">
                <span class="font-bold text-slate-400">总:</span>
                <input
                  class="no-number-stepper h-4 w-8 rounded border border-slate-200 bg-white px-1 text-center font-mono text-[10px] font-bold text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  type="number"
                  min="1"
                  title="输入总计划数"
                  :value="schedule.totalRequiredCount"
                  @input="update({ totalRequiredCount: Math.max(1, Number($event.target.value) || 1) })"
                />
              </span>
            </span>
          </div>
          <span class="font-mono font-black text-emerald-600 shrink-0 font-sans">{{ localSubmissionPercent }}%</span>
        </div>
        <div
          class="w-full h-2 bg-slate-150 rounded-full flex overflow-hidden border border-slate-200/60 shadow-3xs hover:opacity-90 transition-opacity"
          :title="`审核通过: ${approvedReqsCount} | 待审核: ${pendingReqsCount} | 未提交: ${unsubmittedReqsCount}`"
        >
          <div v-if="approvedPct > 0" class="h-full bg-emerald-500 transition-all duration-300 shrink-0" :style="{ width: `${approvedPct}%` }" />
          <div v-if="pendingPct > 0" class="h-full bg-amber-400 transition-all duration-300 shrink-0" :style="{ width: `${pendingPct}%` }" />
        </div>
        <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[8px] font-bold text-slate-400 mt-1 uppercase select-none">
          <span class="flex items-center gap-0.5 text-slate-400 shrink-0"><span class="w-1.5 h-1.5 bg-slate-300 rounded-full" />未提交:{{ unsubmittedReqsCount }}</span>
          <span class="flex items-center gap-0.5 text-amber-500 font-sans shrink-0"><span class="w-1.5 h-1.5 bg-amber-400 rounded-full" />待审核:{{ pendingReqsCount }}</span>
          <span class="flex items-center gap-0.5 text-emerald-600 font-sans shrink-0"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full" />审核通过:{{ approvedReqsCount }}</span>
        </div>
      </div>

      <div>
        <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1 text-[10px]">
          <span class="font-extrabold text-slate-500 uppercase tracking-tight flex flex-wrap items-center gap-1">
            <span class="inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-emerald-505 rounded-full inline-block shrink-0" />
              2. 制作完成进度
            </span>
            <span v-if="scheduleInsight && !isEditing" :class="`inline-flex h-5 items-center rounded-full border px-2 text-[9px] font-black ${scheduleInsight.statusTone}`" :title="scheduleInsight.suggestion">
              {{ scheduleInsight.status }}
            </span>
            <span
              v-if="scheduleInsight && scheduleInsight.completedNotLaunched > 0 && !isEditing"
              class="inline-flex h-5 items-center rounded-full border border-emerald-150 bg-emerald-50 px-2 text-[9px] font-black text-emerald-700"
              title="已完成且未投放，可进入投放打包建议"
            >
              可打包 {{ scheduleInsight.completedNotLaunched }}
            </span>
          </span>
          <span class="font-mono font-black text-emerald-600 font-sans">{{ totalProdPercent }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-150 rounded-full flex overflow-hidden border border-slate-200/60 shadow-3xs" :title="`未开始: ${scheduledReqs} | 进行中: ${inProgressReqs} | 已完成: ${completedReqs}`">
          <div v-if="completedPercent > 0" class="h-full bg-emerald-500 transition-all duration-300 shrink-0" :style="{ width: `${completedPercent}%` }" />
          <div v-if="inProgressPercent > 0" class="h-full bg-blue-500 transition-all duration-300 shrink-0" :style="{ width: `${inProgressPercent}%` }" />
        </div>
        <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[8px] font-bold text-slate-400 mt-1 uppercase select-none">
          <span class="flex items-center gap-0.5 shrink-0"><span class="w-1.5 h-1.5 bg-slate-300 rounded-full" />未开始:{{ scheduledReqs }}</span>
          <span class="flex items-center gap-0.5 text-blue-550 font-sans shrink-0"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full" />进行中:{{ inProgressReqs }}</span>
          <span class="flex items-center gap-0.5 text-emerald-600 font-sans shrink-0"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full" />已完成:{{ completedReqs }}</span>
        </div>
      </div>

      <div class="mt-auto flex min-h-10 items-center justify-between gap-3 pt-4">
        <div class="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
          <button
            v-for="req in visibleAssociatedReqs"
            :key="req.id"
            :class="`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black font-mono shadow-3xs transition-all hover:scale-105 ${getRequirementStatusClass(req)}`"
            :title="`${req.id} (${req.name || ''}) - 制作状态: ${getRequirementStatusLabel(req)}`"
            type="button"
            @click.stop="emit('open-requirement', req)"
          >
            {{ getBaseId(req.id) }}
          </button>
          <span
            v-if="hiddenAssociatedReqCount > 0"
            class="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[8px] font-black text-slate-500 font-sans shadow-3xs"
            :title="`还有 ${hiddenAssociatedReqCount} 个额外关联需求`"
          >
            +{{ hiddenAssociatedReqCount }}
          </span>
          <span v-if="associatedReqs.length === 0" class="truncate text-[10px] text-slate-450 italic font-sans font-medium">暂无关联需求</span>
        </div>

        <button
          type="button"
          :class="`relative z-20 inline-flex h-[34px] shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-[10px] font-black whitespace-nowrap transition-all duration-200 ${
            isEditing
              ? 'cursor-not-allowed bg-slate-100 text-slate-400 ring-1 ring-slate-200 shadow-none'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500 hover:bg-slate-950 hover:ring-slate-950 hover:-translate-y-0.5'
          }`"
          :title="isEditing ? '保存方向后再新建需求' : '新建需求'"
          @click.stop="emit('add-requirement', schedule.id)"
          :disabled="isEditing"
        >
          <Plus class="w-3 h-3" />
          新建需求
        </button>
      </div>
    </div>

    <button
      :class="`absolute top-2.5 right-2.5 rounded-lg border border-slate-200 bg-white/95 p-1 text-slate-350 shadow-3xs transition-all hover:bg-rose-50 hover:text-rose-600 ${
        isEditing ? 'hidden' : 'opacity-0 group-hover:opacity-100'
      }`"
      title="删除此方向"
      type="button"
      @click.stop="emit('delete', schedule)"
    >
      <Trash2 class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
