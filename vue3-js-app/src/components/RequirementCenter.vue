<script setup>
import { computed, ref } from 'vue'
import MaterialUpload from './MaterialUpload.vue'
import {
  AddWeekModal,
  CoordinatedToolbar,
  CreateLocalizedRequirementDialog,
  IterationDirectionSelectorModal,
  LegacyScheduleTable,
  ProductionWorkspace,
  RequirementDetailOverlay,
  RequirementInstantTooltip,
  RequirementListView,
  RequirementToast,
  ScheduleBoard,
  ScheduleSelectorModal,
  buildLocalizedRequirements,
  buildRequirementForSchedule,
  buildRequirementIteration,
  buildStandaloneRequirementDraft,
  formatCalendarDate,
  formatRequirementId,
  getRequirementMajorId,
  getNextAssetIndexForType,
  getScheduledTaskViews,
  parseDateValue,
  parseRequirementVersionId,
  producers,
  summarizeProductionStatus,
  useAddWeekModal,
  useCoordinatedPlanning,
  useLegacyScheduleGroups,
  useRequirementVersioning,
  useScheduleActions,
  useScheduleInsights,
} from './requirement-center'
import { generateFinishedCreativePerformance, generateRequirements, generateSchedules } from '../services/mockData'

const props = defineProps({
  subView: {
    type: String,
    default: 'coordinated',
  },
})

defineEmits(['sub-view-change'])

const initializeRequirements = () => {
  const activeProducerNames = producers.filter((producer) => producer.status === '在职').map((producer) => producer.name)
  const difficultyOptions = ['S', 'A', 'B', 'C']
  return generateRequirements().map((requirement, index) => {
    const activeProductionPersonnel = (requirement.productionPersonnel || []).filter((person) =>
      activeProducerNames.includes(person),
    )
    const productionPersonnel = activeProductionPersonnel.length > 0
      ? activeProductionPersonnel
      : [activeProducerNames[index % activeProducerNames.length]].filter(Boolean)
    const difficulty = requirement.difficulty || difficultyOptions[index % difficultyOptions.length]
    const startDay = 1 + (index % 6) * 4 + (index % 2)
    const spanDays = difficulty === 'S' ? 4 : difficulty === 'A' ? 3 : difficulty === 'B' ? 2 : 1
    const endDay = startDay + spanDays
    const startDate = `2026-06-${String(startDay).padStart(2, '0')}`
    const endDate = `2026-06-${String(endDay).padStart(2, '0')}`

    return {
      ...requirement,
      difficulty,
      productionPersonnel,
      startDate: requirement.startDate || startDate,
      endDate: requirement.endDate || endDate,
    }
  })
}

const schedules = ref(generateSchedules())
const requirements = ref(initializeRequirements())
const deliverySets = ref([])
const editingScheduleId = ref(null)
const selectedSchedule = ref(null)
const selectedRequirement = ref(null)
const pendingConfirm = ref(null)
const showScheduleSelector = ref(false)
const selectedCreateType = ref('Video')
const localizedSchedule = ref(null)
const localizedSearchQuery = ref('')
const selectedLanguageCodes = ref(['de'])
const selectedSourceIds = ref([])
const pendingIteration = ref(null)
const toastMessage = ref('')
const instantTooltip = ref(null)
const viewingSpecificRequirements = ref([])
let toastTimer = null

const todayDateString = formatCalendarDate(new Date())

const finishedCreativePerformance = computed(() => generateFinishedCreativePerformance(requirements.value))

const showToast = (message) => {
  toastMessage.value = message
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2600)
}

const showInstantTooltip = (event, content) => {
  const rect = event.currentTarget.getBoundingClientRect()
  instantTooltip.value = {
    content,
    left: Math.min(rect.left, window.innerWidth - 420),
    top: rect.bottom + 8,
  }
}

const {
  searchQuery,
  openCoordinatedFilterKey,
  isFlexibleFilterPanelOpen,
  openFlexibleFilterMenu,
  coordinatedFlexibleFilters,
  currentSort,
  sortOrder,
  selectedWeekRange,
  selectedWeekRanges,
  pinnedWeekRanges,
  overflowWeekRanges,
  weekVisualMap,
  dateRangeStart,
  dateRangeEnd,
  weekRanges,
  coordinatedToolbarFilterGroups,
  flexibleFilterFields,
  flexibleOperators,
  filteredSchedules,
  getScheduleRequirements,
  updateFlexibleFilter,
  addFlexibleFilter,
  removeFlexibleFilter,
  clearRequirementFilter,
  setSortOption,
  toggleRequirementFilterOption,
  resetCoordinatedFilters,
  toggleSelectedWeekRange,
} = useCoordinatedPlanning({
  schedules,
  requirements,
  todayDateString,
})

const { collapsedWeeks, groupedSchedules, toggleWeek } = useLegacyScheduleGroups({
  schedules,
  requirements,
})

const { scheduleInsights, getScheduleInsight } = useScheduleInsights({
  schedules,
  requirements,
  deliverySets,
  todayDateString,
})

const highRiskRequirements = computed(() => {
  const todayTime = parseDateValue(todayDateString)
  const weekEndTime = todayTime === null ? null : todayTime + 6 * 86400000
  return requirements.value
    .filter((requirement) => (requirement.priority === 'Highest' || requirement.priority === 'High') && requirement.prodStatus !== 'Completed')
    .map((requirement) => {
      const schedule = schedules.value.find((item) => item.id === requirement.scheduleId)
      const dueDate = schedule?.productionEnd || schedule?.submissionDeadline || schedule?.requirementEnd || requirement.endDate || ''
      const dueTime = parseDateValue(dueDate)
      const taskViews = getScheduledTaskViews(requirement)
      const lastTaskEnd =
        taskViews
          .map((task) => task.endDate)
          .filter(Boolean)
          .sort()
          .at(-1) || ''
      const lastTaskEndTime = parseDateValue(lastTaskEnd)
      const hasNoPlan = taskViews.length === 0
      const hasDeadlineOverflow = Boolean(dueDate && lastTaskEnd && lastTaskEnd > dueDate)
      const isDeadlinePassed = dueTime !== null && todayTime !== null && dueTime < todayTime
      const isDeadlineWithinWeek = dueTime !== null && todayTime !== null && weekEndTime !== null && dueTime >= todayTime && dueTime <= weekEndTime
      const daysUntilDue = dueTime !== null && todayTime !== null ? Math.ceil((dueTime - todayTime) / 86400000) : null
      let severity = 'warning'
      let reason = ''
      if (isDeadlinePassed) {
        severity = 'danger'
        reason = '已过截止'
      } else if (hasDeadlineOverflow) {
        severity = 'danger'
        reason = '无法按截止完成'
      } else if (hasNoPlan) {
        severity = isDeadlineWithinWeek ? 'danger' : 'warning'
        reason = '未排期'
      } else if (isDeadlineWithinWeek) {
        severity = 'danger'
        reason = '临期风险'
      }
      return reason ? { req: requirement, schedule, dueDate, lastTaskEnd, daysUntilDue, severity, reason } : null
    })
    .filter(Boolean)
    .sort((a, b) => {
      const severityScore = { danger: 0, warning: 1 }
      const severityDiff = severityScore[a.severity] - severityScore[b.severity]
      if (severityDiff !== 0) return severityDiff
      return (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999)
    })
})

const productionScheduleContext = computed(() =>
  requirements.value.flatMap((requirement) =>
    getScheduledTaskViews(requirement).map((task) => ({
      id: task.id,
      requirementId: requirement.id,
      displayRequirementId: task.displayRequirementId,
      requirementName: requirement.name || requirement.id,
      priority: requirement.priority,
      role: task.role,
      producer: task.producer,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
    })),
  ),
)

const {
  updateSchedule,
  addScheduleRow,
  applyCycleAdjustment,
  updateSchedulePriority,
  createDeliverySetDraft,
} = useScheduleActions({
  schedules,
  requirements,
  selectedWeekRange,
  selectedWeekRanges,
  editingScheduleId,
  selectedSchedule,
  deliverySets,
  dateRangeStart,
  dateRangeEnd,
  allWeekRanges: weekRanges,
  todayDateString,
  scheduleInsights,
  showToast,
})

const {
  showAddWeekPopup,
  newWeekRange,
  newWeekStart,
  newWeekEnd,
  newWeekCalendarYear,
  newWeekCalendarMonth,
  newWeekCalendarWeeks,
  openAddWeekPopup,
  jumpNewWeekCalendarToToday,
  selectNewWeekDay,
  prevNewWeekMonth,
  nextNewWeekMonth,
  confirmAddWeek,
} = useAddWeekModal({
  todayDateString,
  addScheduleRow,
  selectedWeekRange,
  selectedWeekRanges,
  dateRangeStart,
  dateRangeEnd,
})

const {
  getRequirementVersionGroup,
  isBlankRequirementDraft,
  stripBlankVersionsForReview,
} = useRequirementVersioning({ requirements })

const requestConfirm = ({ title, message, tone = 'danger', onConfirm }) => {
  pendingConfirm.value = { title, message, tone, onConfirm }
}

const closeConfirm = () => {
  pendingConfirm.value = null
}

const confirmPendingAction = () => {
  const action = pendingConfirm.value?.onConfirm
  pendingConfirm.value = null
  action?.()
}

const performDeleteSchedule = (schedule) => {
  schedules.value = schedules.value.filter((item) => item.id !== schedule.id)
  requirements.value = requirements.value.filter((requirement) => requirement.scheduleId !== schedule.id)
  if (editingScheduleId.value === schedule.id) editingScheduleId.value = null
  if (selectedSchedule.value?.id === schedule.id) selectedSchedule.value = null
}

const deleteSchedule = (schedule) => {
  if (!schedule) return
  if (schedule.skipConfirm) {
    performDeleteSchedule(schedule)
    return
  }
  requestConfirm({
    title: schedule.confirmMessage || '确定删除此排期及方向？',
    message: '删除后会同时移除该方向下关联的需求记录，此操作无法在当前页面内撤销。',
    onConfirm: () => performDeleteSchedule(schedule),
  })
}

const updateRequirement = (id, updates) => {
  const mergeRequirement = (requirement) => {
    const next = { ...requirement, ...updates }
    return { ...next, prodStatus: summarizeProductionStatus(next) }
  }
  const entersReview = updates.reqStatus !== undefined && updates.reqStatus !== 'Draft'
  const nextList = requirements.value.map((requirement) => (requirement.id === id ? mergeRequirement(requirement) : requirement))
  const active = nextList.find((requirement) => requirement.id === id)
  requirements.value = entersReview && active ? stripBlankVersionsForReview(nextList, active) : nextList
  if (selectedRequirement.value?.id === id) {
    selectedRequirement.value = mergeRequirement(selectedRequirement.value)
  }
}

const replaceRequirement = (nextRequirement) => {
  const normalizedRequirement = { ...nextRequirement, prodStatus: summarizeProductionStatus(nextRequirement) }
  const nextList = requirements.value.map((requirement) =>
    requirement.id === normalizedRequirement.id ? normalizedRequirement : requirement,
  )
  requirements.value =
    normalizedRequirement.reqStatus !== 'Draft'
      ? stripBlankVersionsForReview(nextList, normalizedRequirement)
      : nextList
  if (selectedRequirement.value?.id === nextRequirement.id) {
    selectedRequirement.value = normalizedRequirement
  }
}

const deleteRequirement = (payload) => {
  const id = typeof payload === 'object' ? payload.id : payload
  if (!id) return
  const confirmMessage = payload?.confirmMessage || '确定要删除这行需求合约吗？'
  const performDelete = () => {
    requirements.value = requirements.value.filter((requirement) => requirement.id !== id)
    if (selectedRequirement.value?.id === id) selectedRequirement.value = null
  }
  if (!payload?.skipConfirm) {
    requestConfirm({
      title: confirmMessage,
      message: '删除后该需求将从当前排期、详情和列表视图中移除。',
      onConfirm: performDelete,
    })
    return
  }
  performDelete()
}

const openScheduleSelector = (type = 'Video') => {
  selectedCreateType.value = type || 'Video'
  showScheduleSelector.value = true
}

const localizedCandidates = computed(() => {
  const query = localizedSearchQuery.value.trim().toLowerCase()
  const schedule = localizedSchedule.value
  if (!schedule) return []
  const targetAssetType = schedule.form || selectedCreateType.value
  return requirements.value
    .filter((requirement) => !requirement.isLocalization && !requirement.sourceRequirementId)
    .filter((requirement) => !targetAssetType || requirement.assetType === targetAssetType)
    .filter((requirement) => {
      if (!query) return true
      return [requirement.id, requirement.name, requirement.direction, requirement.broadDirection].some((value) =>
        String(value || '').toLowerCase().includes(query),
      )
    })
    .sort((a, b) => {
      const spendDiff = (recentSpendMap.value[b.id] || 0) - (recentSpendMap.value[a.id] || 0)
      if (spendDiff !== 0) return spendDiff
      return (b.assetIndex || 0) - (a.assetIndex || 0)
    })
})

const recentSpendMap = computed(() => {
  const sinceDate = new Date(`${todayDateString}T00:00:00`)
  sinceDate.setDate(sinceDate.getDate() - 30)
  const sinceDateString = `${sinceDate.getFullYear()}-${String(sinceDate.getMonth() + 1).padStart(2, '0')}-${String(sinceDate.getDate()).padStart(2, '0')}`

  return finishedCreativePerformance.value
    .filter((item) => item.launchedAt >= sinceDateString)
    .reduce((acc, item) => {
      acc[item.requirementId] = (acc[item.requirementId] || 0) + item.spent
      return acc
    }, {})
})

const pendingIterationSource = computed(() =>
  requirements.value.find((requirement) => requirement.id === pendingIteration.value?.sourceId) || null,
)

const pendingIterationCount = computed(() =>
  pendingIterationSource.value ? getRequirementVersionGroup(pendingIterationSource.value).length : 0,
)

const selectedLocalizationSources = computed(() =>
  selectedSourceIds.value
    .map((id) => requirements.value.find((requirement) => requirement.id === id))
    .filter(Boolean),
)

const selectedLocalizationAssetTypes = computed(() =>
  Array.from(new Set(selectedLocalizationSources.value.map((source) => source.assetType))),
)

const hasMixedLocalizationAssetTypes = computed(() => selectedLocalizationAssetTypes.value.length > 1)

const localizedDisabledReason = computed(() => {
  if (selectedSourceIds.value.length === 0) return '请至少选择 1 条来源需求'
  if (selectedLanguageCodes.value.length === 0) return '请至少选择 1 个本地化语言'
  if (hasMixedLocalizationAssetTypes.value) return '同一批本地化不能混选视频、图片和试玩'
  return ''
})

const toggleLocalizedLanguage = (languageCode) => {
  selectedLanguageCodes.value = selectedLanguageCodes.value.includes(languageCode)
    ? selectedLanguageCodes.value.filter((code) => code !== languageCode)
    : [...selectedLanguageCodes.value, languageCode]
}

const toggleLocalizedSource = (requirementId) => {
  selectedSourceIds.value = selectedSourceIds.value.includes(requirementId)
    ? selectedSourceIds.value.filter((id) => id !== requirementId)
    : [...selectedSourceIds.value, requirementId]
}

const closeLocalizedDialog = () => {
  localizedSchedule.value = null
  localizedSearchQuery.value = ''
  selectedLanguageCodes.value = ['de']
  selectedSourceIds.value = []
}

const createLocalizedRequirements = () => {
  const schedule = localizedSchedule.value
  if (!schedule || localizedDisabledReason.value) return
  const sources = selectedLocalizationSources.value
  const created = buildLocalizedRequirements({
    schedule,
    sources,
    languages: selectedLanguageCodes.value,
    requirements: requirements.value,
    todayDateString,
    finishedCreativePerformance: finishedCreativePerformance.value,
  })
  requirements.value = [...created, ...requirements.value]
  updateSchedule(schedule.id, {
    totalRequiredCount: Math.max(schedule.totalRequiredCount || 1, getScheduleRequirements(schedule.id).length + created.length),
  })
  selectedRequirement.value = created[0] || null
  showScheduleSelector.value = false
  closeLocalizedDialog()
}

const createStandardRequirementFromLocalizedDialog = () => {
  const schedule = localizedSchedule.value
  if (!schedule) return
  const newRequirement = buildRequirementForSchedule(schedule, requirements.value)
  requirements.value = [newRequirement, ...requirements.value]
  updateSchedule(schedule.id, {
    totalRequiredCount: Math.max(schedule.totalRequiredCount || 1, getScheduleRequirements(schedule.id).length + 1),
  })
  selectedSchedule.value = schedule
  selectedRequirement.value = newRequirement
  showScheduleSelector.value = false
  closeLocalizedDialog()
}

const addRequirementForDirection = (scheduleId) => {
  if (editingScheduleId.value === scheduleId) return
  const schedule = schedules.value.find((item) => item.id === scheduleId)
  if (!schedule) return
  if (schedule.scenario === 'Localized') {
    localizedSchedule.value = schedule
    selectedCreateType.value = schedule.form || selectedCreateType.value
    selectedLanguageCodes.value = selectedLanguageCodes.value.length ? selectedLanguageCodes.value : ['de']
    showScheduleSelector.value = false
    return
  }
  const newRequirement = buildRequirementForSchedule(schedule, requirements.value)
  requirements.value = [newRequirement, ...requirements.value]
  updateSchedule(scheduleId, {
    totalRequiredCount: Math.max(schedule.totalRequiredCount || 1, getScheduleRequirements(scheduleId).length + 1),
  })
  selectedSchedule.value = schedule
  selectedRequirement.value = newRequirement
  showScheduleSelector.value = false
}

const createStandaloneRequirement = () => {
  const newRequirement = buildStandaloneRequirementDraft(selectedCreateType.value, requirements.value)
  requirements.value = [newRequirement, ...requirements.value]
  selectedRequirement.value = newRequirement
  showScheduleSelector.value = false
}

const openIterationSelector = ({ source, mode = 'single' }) => {
  pendingIteration.value = {
    sourceId: source.id,
    mode,
  }
  selectedCreateType.value = source.assetType || 'Video'
}

const createRequirementIteration = (scheduleId) => {
  const pending = pendingIteration.value
  const source = requirements.value.find((requirement) => requirement.id === pending?.sourceId)
  const schedule = schedules.value.find((item) => item.id === scheduleId)
  if (!pending || !source || !schedule) return
  const sources = pending.mode === 'all' ? getRequirementVersionGroup(source) : [source]
  const assetType = schedule.form || source.assetType
  const nextIndex = getNextAssetIndexForType(requirements.value, assetType)
  const created = sources.map((item, index) => {
    const sourceVersion =
      pending.mode === 'all'
        ? parseRequirementVersionId(item.id)?.version || Number.parseInt(item.assetVersion, 10) || index + 1
        : 1
    return buildRequirementIteration(item, schedule, nextIndex, String(sourceVersion).padStart(2, '0'))
  })
  requirements.value = [...created, ...requirements.value]
  updateSchedule(schedule.id, {
    totalRequiredCount: Math.max(schedule.totalRequiredCount || 1, getScheduleRequirements(schedule.id).length + created.length),
  })
  selectedRequirement.value = created[0]
  searchQuery.value = formatRequirementId(assetType, nextIndex, '01').split('-')[0]
  pendingIteration.value = null
}

const addSubRequirement = (source) => {
  const assetType = source.assetType || 'Video'
  const schedule = schedules.value.find((item) => item.id === source.scheduleId)
  const siblings = getRequirementVersionGroup(source)
  const blankChild = siblings.find((item) => item.id !== source.id && isBlankRequirementDraft(item))
  if (blankChild) {
    selectedRequirement.value = blankChild
    return
  }
  const majorId = getRequirementMajorId(source)
  const nextVersion = String(
    Math.max(...siblings.map((item) => parseRequirementVersionId(item.id)?.version || Number.parseInt(item.assetVersion, 10) || 0)) + 1,
  ).padStart(2, '0')
  const newRequirement = {
    ...source,
    id: `${majorId}-${nextVersion}`,
    parentId: source.id,
    parentRequirementId: source.id,
    assetVersion: nextVersion,
    name: '新子需求',
    previews: [],
    description: '',
    script: '',
    sections: undefined,
    reqStatus: 'Draft',
    prodStatus: 'Unscheduled',
    deliveryStatus: 'NotLaunched',
    status: 'Draft',
    rating: 0,
    scheduleId: schedule?.id || source.scheduleId,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    completedAt: '',
  }
  requirements.value = [newRequirement, ...requirements.value]
  selectedRequirement.value = newRequirement
}

</script>

<template>
  <RequirementToast :message="toastMessage" />
  <RequirementInstantTooltip :tooltip="instantTooltip" />

  <section v-if="subView === 'coordinated'" class="flex h-full min-h-[720px] flex-col space-y-3">
    <CoordinatedToolbar
      :week-ranges="weekRanges"
      :pinned-week-ranges="pinnedWeekRanges"
      :overflow-week-ranges="overflowWeekRanges"
      :selected-week-ranges="selectedWeekRanges"
      :week-visual-map="weekVisualMap"
      :selected-week-range="selectedWeekRange"
      :date-range-start="dateRangeStart"
      :date-range-end="dateRangeEnd"
      :search-query="searchQuery"
      :coordinated-flexible-filters="coordinatedFlexibleFilters"
      :is-flexible-filter-panel-open="isFlexibleFilterPanelOpen"
      :open-flexible-filter-menu="openFlexibleFilterMenu"
      :flexible-filter-fields="flexibleFilterFields"
      :flexible-operators="flexibleOperators"
      :coordinated-filter-groups="coordinatedToolbarFilterGroups"
      :open-coordinated-filter-key="openCoordinatedFilterKey"
      :current-sort="currentSort"
      :sort-order="sortOrder"
      :filtered-schedule-count="filteredSchedules.length"
      @toggle-week="toggleSelectedWeekRange"
      @open-add-week="openAddWeekPopup"
      @update-search="searchQuery = $event"
      @update-date-range="
        dateRangeStart = $event.start;
        dateRangeEnd = $event.end
      "
      @toggle-flexible-panel="
        isFlexibleFilterPanelOpen = !isFlexibleFilterPanelOpen;
        openCoordinatedFilterKey = null;
        openFlexibleFilterMenu = null
      "
      @set-flexible-menu="openFlexibleFilterMenu = $event"
      @update-flexible-filter="updateFlexibleFilter"
      @remove-flexible-filter="removeFlexibleFilter"
      @add-flexible-filter="addFlexibleFilter"
      @set-filter-menu="openCoordinatedFilterKey = $event"
      @clear-filter="clearRequirementFilter"
      @toggle-filter-option="toggleRequirementFilterOption"
      @set-sort="setSortOption"
      @reset-filters="resetCoordinatedFilters"
    />

    <ScheduleBoard
      :schedules="filteredSchedules"
      :editing-schedule-id="editingScheduleId"
      :today-date-string="todayDateString"
      :get-schedule-requirements="getScheduleRequirements"
      :get-schedule-insight="getScheduleInsight"
      :show-instant-tooltip="showInstantTooltip"
      @clear-instant-tooltip="instantTooltip = null"
      @open-detail="selectedSchedule = $event"
      @open-requirement="selectedRequirement = $event"
      @edit="editingScheduleId = $event.id"
      @save="editingScheduleId = null"
      @delete="deleteSchedule"
      @add-requirement="addRequirementForDirection"
      @update-schedule="updateSchedule"
      @add-schedule="addScheduleRow"
    />

    <Teleport to="body">
      <ScheduleDetailModal
        v-if="selectedSchedule"
        :schedule="selectedSchedule"
        :requirements="getScheduleRequirements(selectedSchedule.id)"
        :schedule-insight="getScheduleInsight(selectedSchedule.id)"
        :week-ranges="weekRanges"
        :week-visual-map="weekVisualMap"
        :delivery-sets="deliverySets"
        :editing-schedule-id="editingScheduleId"
        :today-date-string="todayDateString"
        @close="selectedSchedule = null"
        @add-requirement="addRequirementForDirection"
        @update-schedule="updateSchedule"
        @update-schedule-priority="updateSchedulePriority"
        @update-requirement="updateRequirement"
        @delete-requirement="deleteRequirement"
        @open-requirement="selectedRequirement = $event"
        @apply-cycle-adjustment="applyCycleAdjustment"
        @create-delivery-set="createDeliverySetDraft"
      />
    </Teleport>
  </section>

  <ProductionWorkspace
    v-else-if="subView === 'production'"
    :requirements="requirements"
    :schedules="schedules"
    :today-date-string="todayDateString"
    @open-requirement="selectedRequirement = $event"
  />
  <RequirementListView
    v-else-if="subView === 'list'"
    :requirements="requirements"
    :today-date-string="todayDateString"
    :get-requirement-version-group="getRequirementVersionGroup"
    :high-risk-requirements="highRiskRequirements"
    :current-sort="currentSort"
    :sort-order="sortOrder"
    @open-requirement="selectedRequirement = $event"
    @delete-requirement="deleteRequirement"
    @open-create="openScheduleSelector"
    @update-requirement="updateRequirement"
    @open-iteration="openIterationSelector"
    @add-sub-requirement="addSubRequirement"
  />
  <MaterialUpload v-else-if="subView === 'upload'" />
  <LegacyScheduleTable
    v-else
    :grouped-schedules="groupedSchedules"
    :collapsed-weeks="collapsedWeeks"
    :requirements="requirements"
    @toggle-week="toggleWeek"
    @add-schedule="addScheduleRow"
    @update-schedule="updateSchedule"
    @open-requirement="selectedRequirement = $event"
    @view-requirements="viewingSpecificRequirements = $event"
    @delete-schedule="deleteSchedule"
  />

  <Teleport to="body">
    <ScheduleSelectorModal
      v-if="showScheduleSelector"
      :selected-create-type="selectedCreateType"
      :schedules="schedules"
      :requirements="requirements"
      @select-create-type="selectedCreateType = $event"
      @close="showScheduleSelector = false"
      @select-schedule="addRequirementForDirection"
      @create-standalone="createStandaloneRequirement"
    />
  </Teleport>

  <Teleport to="body">
    <CreateLocalizedRequirementDialog
      v-if="localizedSchedule"
      :schedule="localizedSchedule"
      :selected-language-codes="selectedLanguageCodes"
      :selected-source-ids="selectedSourceIds"
      :search-query="localizedSearchQuery"
      :candidates="localizedCandidates"
      :recent-spend-map="recentSpendMap"
      :disabled-reason="localizedDisabledReason"
      :submit-disabled="Boolean(localizedDisabledReason)"
      @close="closeLocalizedDialog"
      @search-change="localizedSearchQuery = $event"
      @toggle-language="toggleLocalizedLanguage"
      @toggle-source="toggleLocalizedSource"
      @create-standard="createStandardRequirementFromLocalizedDialog"
      @create-localized="createLocalizedRequirements"
    />
  </Teleport>

  <Teleport to="body">
    <IterationDirectionSelectorModal
      v-if="pendingIteration && pendingIterationSource"
      :pending-iteration="pendingIteration"
      :source="pendingIterationSource"
      :iteration-count="pendingIterationCount"
      :selected-create-type="selectedCreateType"
      :schedules="schedules"
      :requirements="requirements"
      @close="pendingIteration = null"
      @create-iteration="createRequirementIteration"
    />
  </Teleport>

  <Teleport to="body">
    <RequirementDetailOverlay
      v-if="selectedRequirement"
      :requirement="selectedRequirement"
      :schedule="schedules.find((schedule) => schedule.id === selectedRequirement.scheduleId) || null"
      :production-schedule-context="productionScheduleContext"
      @close="selectedRequirement = null"
      @delete="deleteRequirement"
      @update="replaceRequirement"
    />
  </Teleport>

  <Teleport to="body">
    <AddWeekModal
      v-if="showAddWeekPopup"
      :today-date-string="todayDateString"
      :calendar-year="newWeekCalendarYear"
      :calendar-month="newWeekCalendarMonth"
      :calendar-weeks="newWeekCalendarWeeks"
      :new-week-start="newWeekStart"
      :new-week-end="newWeekEnd"
      :new-week-range="newWeekRange"
      @close="showAddWeekPopup = false"
      @jump-today="jumpNewWeekCalendarToToday"
      @prev-month="prevNewWeekMonth"
      @next-month="nextNewWeekMonth"
      @select-day="selectNewWeekDay"
      @confirm="confirmAddWeek"
    />
  </Teleport>

  <Teleport to="body">
    <div v-if="pendingConfirm" class="fixed inset-0 z-[320] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-sm" @click.self="closeConfirm">
      <div class="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white text-left shadow-2xl">
        <div class="border-b border-slate-100 px-6 py-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">Danger Confirm</p>
          <h3 class="mt-1 text-base font-black text-slate-900">{{ pendingConfirm.title }}</h3>
          <p class="mt-2 text-xs font-semibold leading-relaxed text-slate-500">{{ pendingConfirm.message }}</p>
        </div>
        <div class="flex justify-end gap-2.5 bg-slate-50/70 px-6 py-4">
          <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-black text-slate-600 hover:bg-slate-50" @click="closeConfirm">取消</button>
          <button type="button" class="rounded-xl bg-rose-600 px-5 py-2 text-[11px] font-black text-white shadow-sm hover:bg-rose-700" @click="confirmPendingAction">确认删除</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
