<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { AlertCircle, CalendarDays, Check, ChevronUp, ChevronDown, Lightbulb, Plus, Trash2, User } from 'lucide-vue-next'
import AvailabilityModal from './AvailabilityModal.vue'
import { formatScheduledRequirementId } from '../requirement-center/requirementUtils'
import {
  addDaysToDateString,
  deriveRequirementFromTasks,
  formatShortDateRange,
  getDifficultyEstimatedHours,
  getProducerOptionGroups,
  getProductionPeople,
  getScheduleRolePreset,
  getScheduleGapHints,
  normalizePlannedTaskStatus,
  rangesOverlap,
  SCHEDULE_ROLE_PRESETS,
  TASK_STATUSES,
} from './detailUtils'
import { formatCalendarDate, parseDateValue } from '../requirement-center/dateUtils'

const props = defineProps({
  requirement: {
    type: Object,
    required: true,
  },
  subVersions: {
    type: Array,
    default: () => [],
  },
  productionScheduleContext: {
    type: Array,
    default: () => [],
  },
  scheduleDeadline: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update', 'toast'])

const scheduleBySubVersion = ref(Boolean(props.requirement.tasks?.some((task) => task.version)))
const showAvailability = ref(false)
const schedulePanelRootRef = ref(null)
const openDropdownKey = ref('')
const todayDateString = formatCalendarDate(new Date())
const scheduleHorizonEnd = addDaysToDateString(todayDateString, 13)

const scheduleTaskGroups = computed(() => {
  const tasks = props.requirement.tasks || []
  if (!scheduleBySubVersion.value) {
    return [
      {
        key: 'major',
        title: '大版本排期',
        subtitle: '默认对整条需求排期，所有小版本共用这组人员和时间。',
        tasks: tasks.filter((task) => !task.version),
        version: null,
      },
    ]
  }
  return props.subVersions.map((version) => ({
    key: version.version,
    title: `v${version.version}`,
    subtitle: version.name,
    tasks: tasks.filter((task) => task.version === version.version),
    version,
  }))
})

const commitTasks = (tasks) => {
  emit('update', deriveRequirementFromTasks(props.requirement, tasks))
}

const updateTask = (taskId, updates) => {
  const nextTasks = (props.requirement.tasks || []).map((task) => {
    if (task.id !== taskId) return task
    const nextTask = { ...task, ...updates }
    return { ...nextTask, status: updates.status || normalizePlannedTaskStatus(nextTask) }
  })
  commitTasks(nextTasks)
}

const addTask = (version, preset = SCHEDULE_ROLE_PRESETS[3]) => {
  const taskIndex = (props.requirement.tasks || []).length + 1
  const estimatedHours = getDifficultyEstimatedHours(
    { role: preset.role, type: preset.type },
    props.requirement.difficulty,
  )
  const nextTask = {
    id: `${props.requirement.id}-custom-${Date.now()}${version ? `-${version.version}` : ''}`,
    type: preset.type,
    role: preset.role || `补充任务 ${taskIndex}`,
    status: '待排期',
    designer: '',
    startDate: '',
    endDate: '',
    duration: `${estimatedHours}H`,
    estimatedWorkDays: estimatedHours,
    dependencyIds: [],
    version: version?.version,
    versionName: version?.name,
  }
  commitTasks([...(props.requirement.tasks || []), nextTask])
}

const removeTask = (taskId) => {
  commitTasks((props.requirement.tasks || []).filter((task) => task.id !== taskId))
}

const moveTask = (taskId, direction) => {
  const tasks = [...(props.requirement.tasks || [])]
  const currentIndex = tasks.findIndex((task) => task.id === taskId)
  if (currentIndex < 0) return
  const currentVersion = tasks[currentIndex].version || ''
  const groupIndexes = tasks.map((task, index) => ((task.version || '') === currentVersion ? index : -1)).filter((index) => index >= 0)
  const groupPosition = groupIndexes.indexOf(currentIndex)
  const targetPosition = groupPosition + direction
  if (targetPosition < 0 || targetPosition >= groupIndexes.length) return
  const targetIndex = groupIndexes[targetPosition]
  ;[tasks[currentIndex], tasks[targetIndex]] = [tasks[targetIndex], tasks[currentIndex]]
  commitTasks(tasks)
}

const toggleSubVersionSchedule = () => {
  const enabled = !scheduleBySubVersion.value
  scheduleBySubVersion.value = enabled
  const tasks = props.requirement.tasks || []
  if (enabled) {
    const baseTasks = tasks.some((task) => !task.version)
      ? tasks.filter((task) => !task.version)
      : tasks
          .filter((task) => task.version === props.subVersions[0]?.version)
          .map((task) => ({
            ...task,
            version: undefined,
            versionName: undefined,
          }))
    const sourceTasks = baseTasks.length > 0 ? baseTasks : tasks
    const nextTasks = props.subVersions.flatMap((version) =>
      sourceTasks.map((task) => ({
        ...task,
        id: `${props.requirement.id}-${version.version}-${task.type}-${task.role || 'task'}`,
        version: version.version,
        versionName: version.name,
      })),
    )
    commitTasks(nextTasks)
    return
  }
  const firstVersion = props.subVersions[0]?.version
  const sourceTasks = tasks.filter((task) => !task.version || task.version === firstVersion)
  commitTasks(sourceTasks.map((task) => ({ ...task, id: task.id.replace(`-${firstVersion}-`, '-'), version: undefined, versionName: undefined })))
}

const currentRequirementScheduleItems = computed(() =>
  (props.requirement.tasks || [])
    .filter((task) => task.designer && task.startDate && task.endDate)
    .map((task) => ({
      id: `${props.requirement.id}:draft:${task.id}`,
      requirementId: props.requirement.id,
      displayRequirementId: formatScheduledRequirementId(props.requirement, task),
      requirementName: `${props.requirement.name || props.requirement.id}${task.version ? ` / v${task.version}` : ''}`,
      priority: props.requirement.priority,
      role: getScheduleRolePreset(task.role, task.type).role,
      producer: task.designer,
      status: task.status || '待排期',
      startDate: task.startDate,
      endDate: task.endDate,
    })),
)

const getTaskScheduleContext = (task) => {
  if (!task.designer) return { visibleTasks: [], conflictingTasks: [] }
  const visibleTasks = [...props.productionScheduleContext, ...currentRequirementScheduleItems.value]
    .filter((item) => {
      if (item.id === `${props.requirement.id}:${task.id}`) return false
      if (item.id === `${props.requirement.id}:draft:${task.id}`) return false
      if (item.producer !== task.designer) return false
      return rangesOverlap(item.startDate, item.endDate, todayDateString, scheduleHorizonEnd)
    })
    .sort((a, b) => (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0))

  const conflictingTasks = task.startDate && task.endDate
    ? visibleTasks.filter((item) => rangesOverlap(item.startDate, item.endDate, task.startDate, task.endDate))
    : []
  return { visibleTasks, conflictingTasks }
}

const getTaskDateWarnings = (task, conflictingTasks) => {
  const warnings = []
  const startTime = parseDateValue(task.startDate)
  const endTime = parseDateValue(task.endDate)
  const deadline = props.scheduleDeadline || props.requirement.endDate
  const deadlineTime = parseDateValue(deadline)
  if (startTime !== null && endTime !== null && startTime > endTime) {
    warnings.push({ tone: 'danger', text: '开始时间晚于结束时间，请调整日期顺序。' })
  }
  if (deadlineTime !== null && endTime !== null && endTime > deadlineTime) {
    warnings.push({ tone: 'danger', text: `结束时间超过方向制作截止 ${formatShortDateRange(deadline, deadline)}。` })
  }
  if (task.designer && (!task.startDate || !task.endDate)) {
    warnings.push({ tone: 'warning', text: '已选择负责人，但开始/结束时间还未补齐，保存后仍会视为待排期。' })
  }
  if (conflictingTasks.length > 0) {
    const currentReqConflicts = conflictingTasks.filter((item) => item.id.startsWith(`${props.requirement.id}:draft:`)).length
    warnings.push({
      tone: currentReqConflicts > 0 ? 'danger' : 'warning',
      text: currentReqConflicts > 0
        ? `与当前需求内 ${currentReqConflicts} 个同人子任务撞期，请调整顺序或拆给其他人。`
        : `与 ${conflictingTasks.length} 个同人任务撞期，建议确认优先级或调整时间。`,
    })
  }
  return warnings
}

const getRecommendedScheduleSlots = (task) => {
  const estimatedHours =
    Number(task.estimatedWorkDays) ||
    parseFloat(task.duration || '') ||
    getDifficultyEstimatedHours(task, props.requirement.difficulty)
  const requiredDays = Math.max(1, Math.ceil(estimatedHours / 8))
  const optionGroups = getProducerOptionGroups(task)
  const candidates = task.designer
    ? getProductionPeople().filter((person) => person.isActive && person.name === task.designer)
    : optionGroups.flatMap((group) => group.isRecommended ? group.people : [])
  const fallbackCandidates = candidates.length ? candidates : getProductionPeople().filter((person) => person.isActive)
  return fallbackCandidates.map((person) => {
    const visibleTasks = [...props.productionScheduleContext, ...currentRequirementScheduleItems.value]
      .filter((item) => item.producer === person.name && item.id !== `${props.requirement.id}:draft:${task.id}`)
      .filter((item) => item.id !== `${props.requirement.id}:${task.id}`)
      .filter((item) => rangesOverlap(item.startDate, item.endDate, todayDateString, scheduleHorizonEnd))
      .sort((a, b) => (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0))
    const firstGap = getScheduleGapHints(visibleTasks, todayDateString, scheduleHorizonEnd).find((gap) => gap.days >= requiredDays)
    const startDate = firstGap?.start || todayDateString
    const busyDays = visibleTasks.reduce((sum, item) => {
      const start = parseDateValue(item.startDate)
      const end = parseDateValue(item.endDate) ?? start
      if (start === null || end === null) return sum
      return sum + Math.max(1, Math.round((end - start) / 86400000) + 1)
    }, 0)
    return {
      person,
      startDate,
      endDate: addDaysToDateString(startDate, requiredDays - 1),
      hours: estimatedHours,
      requiredDays,
      busyCount: visibleTasks.length,
      busyDays,
      hasGap: Boolean(firstGap),
    }
  }).sort((a, b) => {
    if (Number(b.hasGap) !== Number(a.hasGap)) return Number(b.hasGap) - Number(a.hasGap)
    return (
      (parseDateValue(a.startDate) || 0) -
        (parseDateValue(b.startDate) || 0) ||
      a.busyDays - b.busyDays ||
      a.busyCount - b.busyCount
    )
  }).slice(0, 3)
}

const scheduleIssues = computed(() => {
  const tasks = props.requirement.tasks || []
  const issues = tasks.flatMap((task) => {
    const { conflictingTasks } = getTaskScheduleContext(task)
    return getTaskDateWarnings(task, conflictingTasks).map((warning) => ({ task, ...warning }))
  })
  return {
    issues,
    dangerCount: issues.filter((issue) => issue.tone === 'danger').length,
    warningCount: issues.filter((issue) => issue.tone === 'warning').length,
  }
})

const openNativeDatePicker = (event) => {
  event.currentTarget?.showPicker?.()
}

const setOpenDropdown = (key) => {
  openDropdownKey.value = openDropdownKey.value === key ? '' : key
}

const closeOpenDropdown = () => {
  openDropdownKey.value = ''
}

const handleDocumentClick = (event) => {
  if (!schedulePanelRootRef.value?.contains(event.target)) closeOpenDropdown()
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeOpenDropdown()
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
  <div ref="schedulePanelRootRef" class="space-y-6">
    <section class="rounded-[28px] border border-slate-150 bg-white p-5 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h4 class="text-[13px] font-black text-slate-800">需求难度</h4>
          <p class="mt-1 text-[10px] font-bold text-slate-400">先确定复杂度，再按岗位拆分制作排期。</p>
        </div>
        <button class="inline-flex items-center gap-2 rounded-2xl border border-slate-150 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" type="button" @click="showAvailability = true">
          <CalendarDays class="h-3.5 w-3.5" />
          查看人员排期
        </button>
      </div>

      <div class="mt-4 grid grid-cols-4 gap-2">
        <button
          v-for="difficulty in ['S', 'A', 'B', 'C']"
          :key="difficulty"
          :class="`h-12 rounded-2xl text-lg font-black transition-all ${requirement.difficulty === difficulty ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-150'}`"
          type="button"
          @click="emit('update', { ...requirement, difficulty })"
        >
          {{ difficulty }}
        </button>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h4 class="text-[13px] font-black text-slate-800">子任务</h4>
          <p class="mt-1 text-[10px] font-bold text-slate-400">点击岗位按钮增加一项排期，再选择状态、负责人、工时和日期。</p>
        </div>
        <button
          :class="`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black shadow-3xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 ${scheduleBySubVersion ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-slate-150 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'}`"
          type="button"
          :aria-pressed="scheduleBySubVersion"
          @click="toggleSubVersionSchedule"
        >
          <span :class="`flex h-4 w-7 items-center rounded-full p-0.5 transition-all ${scheduleBySubVersion ? 'bg-indigo-600' : 'bg-slate-200'}`">
            <span :class="`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${scheduleBySubVersion ? 'translate-x-3' : 'translate-x-0'}`" />
          </span>
          小版本单独排期
        </button>
      </div>

      <div v-if="scheduleIssues.issues.length" class="rounded-2xl border border-slate-150 bg-white p-3 shadow-3xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-[10px] font-black text-slate-700">
            <AlertCircle :class="`h-3.5 w-3.5 ${scheduleIssues.dangerCount > 0 ? 'text-rose-500' : 'text-amber-500'}`" />
            <span>排期检查</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">
              {{ scheduleIssues.dangerCount }} 严重 / {{ scheduleIssues.warningCount }} 提醒
            </span>
          </div>
          <span class="text-[9px] font-bold text-slate-400">保存前建议处理红色问题</span>
        </div>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="(issue, index) in scheduleIssues.issues.slice(0, 4)" :key="`${issue.task.id}-${index}`" :class="`inline-flex max-w-full items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[9px] font-black ${issue.tone === 'danger' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-amber-100 bg-amber-50 text-amber-700'}`">
            <span class="shrink-0">{{ getScheduleRolePreset(issue.task.role, issue.task.type).role }}</span>
            <span v-if="issue.task.version" class="shrink-0 text-current/60">v{{ issue.task.version }}</span>
            <span class="truncate">{{ issue.text }}</span>
          </span>
          <span v-if="scheduleIssues.issues.length > 4" class="inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1.5 text-[9px] font-black text-slate-400">
            +{{ scheduleIssues.issues.length - 4 }}
          </span>
        </div>
      </div>

      <div
        v-for="group in scheduleTaskGroups"
        :key="group.key"
        :class="`rounded-[24px] border p-4 shadow-sm ${scheduleBySubVersion ? 'border-indigo-100 bg-indigo-50/40 shadow-indigo-100/40' : 'border-slate-150 bg-white'}`"
      >
        <div class="mb-4 flex items-center justify-between gap-3">
          <div :class="`min-w-0 ${scheduleBySubVersion ? 'border-l-4 border-indigo-600 pl-3' : ''}`">
            <div class="flex items-center gap-2">
              <span class="text-[12px] font-black text-slate-800">{{ group.title }}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400">{{ group.tasks.length }} 项</span>
            </div>
            <p v-if="group.subtitle" class="mt-1 truncate text-[10px] font-bold text-slate-400">{{ group.subtitle }}</p>
          </div>
          <div class="flex shrink-0 items-center justify-end gap-1.5">
            <button
              v-for="preset in SCHEDULE_ROLE_PRESETS"
              :key="preset.role"
              class="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-xl border border-slate-150 bg-white px-2.5 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              type="button"
              @click="addTask(group.version, preset)"
            >
              <Plus :class="`h-3 w-3 ${preset.accentClassName}`" />
              {{ preset.role }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div v-for="(task, taskIndex) in group.tasks" :key="task.id" class="rounded-2xl border border-slate-150 bg-slate-50/60 p-3">
            <div class="grid grid-cols-[88px_minmax(0,1fr)_52px_28px] items-center gap-2">
              <span :class="`flex h-8 items-center justify-center rounded-lg text-[12px] font-black ${getScheduleRolePreset(task.role, task.type).className}`">{{ getScheduleRolePreset(task.role, task.type).role }}</span>
              <div class="relative min-w-0">
                <button
                  class="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 text-left text-[11px] font-bold text-slate-600 outline-none transition-all hover:border-indigo-200 focus:border-indigo-400"
                  type="button"
                  @click.stop="setOpenDropdown(`status:${task.id}`)"
                >
                  <span class="truncate">{{ task.status || '待排期' }}</span>
                  <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${openDropdownKey === `status:${task.id}` ? 'rotate-180' : ''}`" />
                </button>
                <div v-if="openDropdownKey === `status:${task.id}`" class="absolute left-0 right-0 top-full z-[80] mt-1 rounded-xl border border-slate-150 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                  <button
                    v-for="status in TASK_STATUSES"
                    :key="status"
                    :class="`flex h-8 w-full items-center justify-between rounded-lg px-2 text-left text-[11px] font-bold transition-all ${(task.status || '待排期') === status ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`"
                    type="button"
                    @click.stop="updateTask(task.id, { status }); closeOpenDropdown()"
                  >
                    <span>{{ status }}</span>
                    <Check v-if="(task.status || '待排期') === status" class="h-3.5 w-3.5 text-indigo-500" />
                  </button>
                </div>
              </div>
              <div class="flex h-8 items-center justify-center gap-1">
                <button class="flex h-7 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30" type="button" title="上移排期项" :disabled="taskIndex === 0" @click="moveTask(task.id, -1)">
                  <ChevronUp class="h-3.5 w-3.5" />
                </button>
                <button class="flex h-7 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30" type="button" title="下移排期项" :disabled="taskIndex === group.tasks.length - 1" @click="moveTask(task.id, 1)">
                  <ChevronDown class="h-3.5 w-3.5" />
                </button>
              </div>
              <button class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white transition-all hover:bg-rose-600" type="button" title="删除排期项" @click="removeTask(task.id)">
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>

            <div class="mt-2 grid grid-cols-[minmax(0,1fr)_86px] items-center gap-2">
              <div class="relative min-w-0">
                <button
                  class="flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 text-left text-[11px] font-bold text-slate-600 outline-none transition-all hover:border-indigo-200 focus:border-indigo-400"
                  type="button"
                  @click.stop="setOpenDropdown(`producer:${task.id}`)"
                >
                  <span class="min-w-0 truncate">{{ task.designer || '负责人' }}</span>
                  <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${openDropdownKey === `producer:${task.id}` ? 'rotate-180' : ''}`" />
                </button>
                <div v-if="openDropdownKey === `producer:${task.id}`" class="absolute left-0 top-full z-[80] mt-1 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-xl border border-slate-150 bg-white p-1.5 shadow-xl shadow-slate-900/10 no-scrollbar">
                  <button
                    :class="`mb-1 flex h-8 w-full items-center justify-between rounded-lg px-2 text-left text-[11px] font-bold transition-all ${!task.designer ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`"
                    type="button"
                    @click.stop="updateTask(task.id, { designer: '' }); closeOpenDropdown()"
                  >
                    <span>负责人</span>
                    <Check v-if="!task.designer" class="h-3.5 w-3.5 text-indigo-500" />
                  </button>
                  <div v-for="optionGroup in getProducerOptionGroups(task)" :key="optionGroup.group" class="border-t border-slate-100 py-1 first:border-t-0">
                    <div class="px-2 py-1 text-[9px] font-black text-slate-400">
                      {{ optionGroup.isRecommended ? `${optionGroup.label}（推荐）` : optionGroup.label }}
                    </div>
                    <button
                      v-for="person in optionGroup.people"
                      :key="person.id"
                      :class="`flex h-8 w-full items-center justify-between rounded-lg px-2 text-left text-[11px] font-bold transition-all ${task.designer === person.name ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`"
                      type="button"
                      @click.stop="updateTask(task.id, { designer: person.name }); closeOpenDropdown()"
                    >
                      <span class="truncate">{{ person.name }}</span>
                      <Check v-if="task.designer === person.name" class="h-3.5 w-3.5 text-indigo-500" />
                    </button>
                  </div>
                </div>
              </div>
              <label class="flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2">
                <input :value="task.estimatedWorkDays ?? parseFloat(task.duration || '8')" class="min-w-0 flex-1 bg-transparent text-right text-[11px] font-bold text-slate-600 outline-none" min="0.1" step="0.1" type="number" @input="updateTask(task.id, { estimatedWorkDays: Number($event.target.value) || 0, duration: `${Number($event.target.value) || 0}H` })" />
                <span class="ml-1 text-[11px] font-black text-slate-500">H</span>
              </label>
            </div>

            <div class="mt-2 grid grid-cols-[24px_minmax(0,1fr)_18px_minmax(0,1fr)] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <CalendarDays class="h-4 w-4 text-slate-350" />
              <input :value="task.startDate || ''" class="h-7 min-w-0 bg-transparent text-center text-[11px] font-bold text-slate-600 outline-none" type="date" @click="openNativeDatePicker" @change="updateTask(task.id, { startDate: $event.target.value })" />
              <span class="text-center text-[12px] font-black text-slate-350">~</span>
              <input :value="task.endDate || ''" class="h-7 min-w-0 bg-transparent text-center text-[11px] font-bold text-slate-600 outline-none" type="date" @click="openNativeDatePicker" @change="updateTask(task.id, { endDate: $event.target.value })" />
            </div>

            <div v-if="getRecommendedScheduleSlots(task).length > 0" class="mt-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-2.5">
              <div class="mb-2 flex items-center justify-between gap-2">
                <span class="inline-flex items-center gap-1 text-[9px] font-black text-indigo-600">
                  <Lightbulb class="h-3 w-3" />
                  {{ task.designer ? '推荐时间' : '推荐人员与时间' }}
                </span>
                <span class="rounded-full bg-white/80 px-2 py-0.5 text-[8px] font-black text-slate-400">
                  {{ requirement.difficulty || 'C' }} 级 · {{ getRecommendedScheduleSlots(task)[0].hours }}H
                </span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="slot in getRecommendedScheduleSlots(task)"
                  :key="`${task.id}-${slot.person.name}-${slot.startDate}`"
                  class="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-indigo-100 bg-white px-2.5 py-1.5 text-left text-[9px] font-black text-slate-600 transition-all hover:border-indigo-250 hover:bg-indigo-100 hover:text-indigo-700"
                  type="button"
                  :title="`采纳 ${slot.person.name} / ${formatShortDateRange(slot.startDate, slot.endDate)} / ${slot.hours}H`"
                  @click="updateTask(task.id, {
                    designer: slot.person.name,
                    startDate: slot.startDate,
                    endDate: slot.endDate,
                    estimatedWorkDays: slot.hours,
                    duration: `${slot.hours}H`,
                    status: normalizePlannedTaskStatus({ ...task, designer: slot.person.name, startDate: slot.startDate, endDate: slot.endDate }),
                  })"
                >
                  <span class="shrink-0 text-indigo-600">{{ slot.person.name }}</span>
                  <span class="shrink-0 text-slate-350">·</span>
                  <span class="shrink-0">{{ formatShortDateRange(slot.startDate, slot.endDate) }}</span>
                  <span v-if="!slot.hasGap" class="shrink-0 rounded bg-amber-50 px-1 text-amber-600">需确认</span>
                </button>
              </div>
            </div>

            <div v-if="task.designer" class="mt-2 rounded-2xl border border-slate-150 bg-white p-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-[10px] font-black text-slate-700">
                  <User class="h-3.5 w-3.5 text-indigo-500" />
                  <span>{{ task.designer }} · 未来两周占用</span>
                </div>
                <span
                  :class="`rounded-full px-2 py-0.5 text-[9px] font-black ${
                    getTaskScheduleContext(task).conflictingTasks.length > 0
                      ? 'bg-amber-50 text-amber-700'
                      : getTaskScheduleContext(task).visibleTasks.length > 0
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-50 text-emerald-600'
                  }`"
                >
                  {{
                    getTaskScheduleContext(task).conflictingTasks.length > 0
                      ? `${getTaskScheduleContext(task).conflictingTasks.length} 个撞期`
                      : getTaskScheduleContext(task).visibleTasks.length > 0
                        ? `${getTaskScheduleContext(task).visibleTasks.length} 个占用`
                        : '暂无占用'
                  }}
                </span>
              </div>
              <div v-if="getTaskScheduleContext(task).visibleTasks.length > 0" class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="item in getTaskScheduleContext(task).visibleTasks.slice(0, 3)"
                  :key="item.id"
                  :class="`inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold ${
                    getTaskScheduleContext(task).conflictingTasks.some((conflict) => conflict.id === item.id)
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-slate-150 bg-slate-50 text-slate-500'
                  }`"
                  :title="`${item.requirementName} / ${item.role} / ${formatShortDateRange(item.startDate, item.endDate)}`"
                >
                  <span class="shrink-0">{{ formatShortDateRange(item.startDate, item.endDate) }}</span>
                  <span class="max-w-[120px] truncate">{{ item.displayRequirementId || item.requirementId }}</span>
                </span>
                <span v-if="getTaskScheduleContext(task).visibleTasks.length > 3" class="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-400">
                  +{{ getTaskScheduleContext(task).visibleTasks.length - 3 }}
                </span>
              </div>
              <div v-else class="mt-2 rounded-xl border border-dashed border-emerald-100 bg-emerald-50 px-3 py-2 text-[9px] font-black text-emerald-600">
                未来两周暂无其它任务，可优先安排。
              </div>
              <div v-if="getScheduleGapHints(getTaskScheduleContext(task).visibleTasks, todayDateString, scheduleHorizonEnd).length > 0" class="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                <span class="text-slate-400">可参考空档:</span>
                <span v-for="gap in getScheduleGapHints(getTaskScheduleContext(task).visibleTasks, todayDateString, scheduleHorizonEnd).slice(0, 3)" :key="`${gap.start}-${gap.end}`" class="rounded-lg bg-indigo-50 px-2 py-1 text-indigo-600">
                  {{ formatShortDateRange(gap.start, gap.end) }} · {{ gap.days }}天
                </span>
              </div>
            </div>

            <div v-if="getTaskDateWarnings(task, getTaskScheduleContext(task).conflictingTasks).length > 0" class="mt-2 space-y-1">
              <div
                v-for="(warning, warningIndex) in getTaskDateWarnings(task, getTaskScheduleContext(task).conflictingTasks)"
                :key="`${warning.text}-${warningIndex}`"
                :class="`rounded-xl border px-3 py-2 text-[9px] font-black ${warning.tone === 'danger' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-amber-100 bg-amber-50 text-amber-700'}`"
              >
                {{ warning.text }}
              </div>
            </div>
          </div>
          <div v-if="group.tasks.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[11px] font-bold text-slate-400">
            先点击上方岗位按钮，增加一项制作排期。
          </div>
        </div>
      </div>
    </section>

    <AvailabilityModal
      v-if="showAvailability"
      :requirement="requirement"
      :production-schedule-context="productionScheduleContext"
      @close="showAvailability = false"
    />
  </div>
</template>
