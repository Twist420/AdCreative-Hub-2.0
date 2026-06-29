import { buildRequirementForSchedule } from './requirementUtils'
import { formatCalendarDate, parseDateValue } from './dateUtils'
import { filterIsActive, filterMatches } from './filters'
import { channelDisplayName } from './channel'

const getWeekRange = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Other'
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date)
  monday.setDate(diff)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  return `${formatCalendarDate(monday)} ~ ${formatCalendarDate(nextMonday)}`
}

const parseWeekRangeDates = (weekRange) => {
  const [start = '', end = ''] = String(weekRange || '').split(' ~ ')
  return {
    start,
    end,
    startTime: parseDateValue(start) ?? 0,
    endTime: parseDateValue(end) ?? 0,
  }
}

export const useScheduleActions = ({
  schedules,
  requirements,
  selectedWeekRange,
  editingScheduleId,
  selectedSchedule,
  deliverySets,
  filters,
  coordinatedFlexibleFilters,
  scheduleMatchesFlexibleFilter,
  searchQuery,
  dateRangeStart,
  dateRangeEnd,
  selectedWeekRanges,
  allWeekRanges,
  todayDateString = '2026-06-26',
  scheduleInsights,
  showToast = () => {},
}) => {
  const isScheduleVisibleInCoordinatedView = (schedule) => {
    const parsed = parseWeekRangeDates(schedule.weekRange)
    const start = schedule.requirementStart || parsed.start
    const end = schedule.requirementEnd || parsed.end
    if ((dateRangeStart?.value || dateRangeEnd?.value) && (end < dateRangeStart.value || start > dateRangeEnd.value)) return false
    if (filters?.value?.creativePersonnel && filterIsActive(filters.value.creativePersonnel) && !filterMatches(filters.value.creativePersonnel, schedule.owner)) return false
    if (filters?.value?.assetType && filterIsActive(filters.value.assetType) && !filterMatches(filters.value.assetType, schedule.form)) return false
    if (filters?.value?.broadDirection && filterIsActive(filters.value.broadDirection) && !filterMatches(filters.value.broadDirection, schedule.broadDirection)) return false
    if (filters?.value?.scheduleRisk && filterIsActive(filters.value.scheduleRisk)) return false
    if (
      coordinatedFlexibleFilters?.value?.length > 0 &&
      scheduleMatchesFlexibleFilter &&
      !coordinatedFlexibleFilters.value.every((condition) => scheduleMatchesFlexibleFilter(schedule, condition))
    ) {
      return false
    }
    const query = searchQuery?.value?.trim().toLowerCase()
    if (query) {
      return schedule.directionName?.toLowerCase().includes(query) || schedule.id?.toLowerCase().includes(query)
    }
    return true
  }

  const updateSchedule = (id, updates) => {
    schedules.value = schedules.value.map((schedule) => {
      if (schedule.id !== id) return schedule
      const updated = { ...schedule, ...updates }
      if (updates.requirementEnd) {
        updated.weekRange = getWeekRange(updates.requirementEnd)
      }
      return updated
    })
    if (selectedSchedule?.value?.id === id) {
      selectedSchedule.value = { ...selectedSchedule.value, ...updates }
    }
  }

  const addScheduleRow = (weekRange, atTop = false) => {
    const defaultWeek = weekRange || '2026-05-20 ~ 2026-05-27'
    const newSchedule = {
      id: `sched-new-${Date.now()}`,
      weekRange: defaultWeek,
      directionName: '新方向',
      priority: '',
      difficulty: '',
      form: '',
      scenario: '',
      directionType: '',
      validCount: 0,
      totalRequiredCount: 0,
      submittedCount: 0,
      owner: '唐欣怡',
      requirementStart: '',
      requirementEnd: '',
      productionEnd: '',
      directionTags: [],
      broadDirection: '原始玩法',
      materialStage: '新',
    }
    schedules.value = atTop ? [newSchedule, ...schedules.value] : [...schedules.value, newSchedule]
    if (editingScheduleId) editingScheduleId.value = newSchedule.id
    if (!isScheduleVisibleInCoordinatedView(newSchedule)) {
      showToast('新建方向已创建，但被当前筛选隐藏。清空筛选或调整条件后可查看。')
    }
    return newSchedule
  }

  const addRequirementForSchedule = (schedule) => {
    const requirement = buildRequirementForSchedule(schedule, requirements.value)
    requirements.value = [requirement, ...requirements.value]
    return requirement
  }

  const addScheduleDirectionTag = (schedule, tagInput) => {
    const nextTag = String(tagInput || '').trim()
    if (!nextTag) return
    const currentTags = schedule.directionTags || []
    if (currentTags.includes(nextTag)) return
    updateSchedule(schedule.id, { directionTags: [...currentTags, nextTag] })
  }

  const removeScheduleDirectionTag = (schedule, tag) => {
    updateSchedule(schedule.id, {
      directionTags: (schedule.directionTags || []).filter((item) => item !== tag),
    })
  }

  const getDefaultCycleAdjustTarget = (schedule) => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now()
    const targetRanges = (allWeekRanges?.value || [])
      .filter((range) => range !== schedule.weekRange)
      .map((range) => ({ range, parsed: parseWeekRangeDates(range) }))
      .filter(({ parsed }) => parsed.endTime >= todayTime)
      .sort((a, b) => a.parsed.startTime - b.parsed.startTime)
    return (
      targetRanges[0]?.range ||
      (selectedWeekRange.value !== schedule.weekRange ? selectedWeekRange.value : '') ||
      (allWeekRanges?.value || []).find((range) => range !== schedule.weekRange) ||
      schedule.weekRange
    )
  }

  const applyCycleAdjustment = ({ schedule, targetWeekRange, requirementIds = [] }) => {
    if (!targetWeekRange || targetWeekRange === schedule.weekRange) {
      showToast(targetWeekRange ? '目标周期和当前周期一致，无需调整。' : '请先选择要调整到的周期范围。')
      return null
    }
    const targetDates = parseWeekRangeDates(targetWeekRange)
    const selectedIds = new Set(requirementIds)
    const relatedRequirements = requirements.value.filter((req) => req.scheduleId === schedule.id)
    const selectedRequirements = relatedRequirements.filter((req) => req.prodStatus !== 'Completed' && selectedIds.has(req.id))
    const remainingRequirements = relatedRequirements.filter((req) => !selectedIds.has(req.id))

    if (remainingRequirements.length === 0) {
      const movedSchedule = {
        ...schedule,
        weekRange: targetWeekRange,
        requirementStart: targetDates.start,
        requirementEnd: targetDates.end,
        submissionDeadline: targetDates.end,
        acceptanceDate: targetDates.start,
        rolloverStatus: 'None',
        decisionNote: `方向整体调整到 ${targetWeekRange}，未复制方向。`,
      }
      schedules.value = schedules.value.map((item) => (item.id === schedule.id ? movedSchedule : item))
      if (selectedSchedule?.value?.id === schedule.id) selectedSchedule.value = movedSchedule
      selectedWeekRange.value = targetWeekRange
      if (selectedWeekRanges) selectedWeekRanges.value = [targetWeekRange]
      if (dateRangeStart) dateRangeStart.value = targetDates.start
      if (dateRangeEnd) dateRangeEnd.value = targetDates.end
      showToast('方向已整体调整到所选周期。')
      return movedSchedule
    }

    const inheritedScheduleId = `${schedule.id}-roll-${Date.now()}`
    const inheritedSchedule = {
      ...schedule,
      id: inheritedScheduleId,
      weekRange: targetWeekRange,
      requirementStart: targetDates.start,
      requirementEnd: targetDates.end,
      submissionDeadline: targetDates.end,
      acceptanceDate: targetDates.start,
      validCount: 0,
      submittedCount: 0,
      totalRequiredCount: selectedRequirements.length,
      inheritedFromScheduleId: schedule.id,
      inheritedToScheduleIds: [],
      inheritanceLabel: `继承自 ${schedule.weekRange}`,
      rolloverStatus: 'CarriedOver',
      decisionNote: `调整 ${selectedRequirements.length} 条未完成需求到 ${targetWeekRange}，复用原需求编号。`,
    }
    schedules.value = schedules.value
      .map((item) =>
        item.id === schedule.id
          ? {
              ...item,
              rolloverStatus: 'PartialCompleted',
              inheritedToScheduleIds: [...(item.inheritedToScheduleIds || []), inheritedScheduleId],
              decisionNote: `已调整 ${selectedRequirements.length} 条未完成需求到 ${targetWeekRange}`,
            }
          : item,
      )
      .concat(inheritedSchedule)
    requirements.value = requirements.value.map((req) =>
      selectedIds.has(req.id) && req.scheduleId === schedule.id
        ? {
            ...req,
            scheduleId: inheritedScheduleId,
            currentScheduleId: inheritedScheduleId,
            inheritedFromScheduleId: schedule.id,
            rolloverStatus: 'CarriedOver',
          }
        : req,
    )
    if (selectedSchedule) selectedSchedule.value = inheritedSchedule
    selectedWeekRange.value = targetWeekRange
    if (selectedWeekRanges) selectedWeekRanges.value = [targetWeekRange]
    if (dateRangeStart) dateRangeStart.value = targetDates.start
    if (dateRangeEnd) dateRangeEnd.value = targetDates.end
    showToast(selectedRequirements.length > 0 ? '已复制继承方向，并调整选中的未完成需求。' : '已复制继承方向，原方向下需求保持不变。')
    return inheritedSchedule
  }

  const updateSchedulePriority = (schedule, value) => {
    if (value === 'Closed') {
      updateSchedule(schedule.id, {
        rolloverStatus: 'Closed',
        closePermissionRole: 'Owner',
        closeReason: '手动将方向优先级调整为关闭。',
      })
      showToast('方向已标记为关闭。')
      return
    }
    updateSchedule(schedule.id, {
      priority: value,
      rolloverStatus: schedule.rolloverStatus === 'Closed' ? 'None' : schedule.rolloverStatus,
      closeReason: '',
    })
    requirements.value = requirements.value.map((req) => (req.scheduleId === schedule.id ? { ...req, priority: value } : req))
    showToast('方向优先级已同步到方向下需求。')
  }

  const createDeliverySetDraft = (schedule) => {
    const insight = scheduleInsights?.value?.get?.(schedule.id) || scheduleInsights?.get?.(schedule.id)
    const readyRequirements =
      insight?.readyRequirements ||
      requirements.value.filter((req) => req.scheduleId === schedule.id && req.prodStatus === 'Completed' && req.deliveryStatus !== 'Delivering')
    if (readyRequirements.length === 0) {
      showToast('当前方向暂无全部完成且未投放的素材。')
      return []
    }
    const groupedByChannel = readyRequirements.reduce((acc, req) => {
      const channels = req.channels?.length ? req.channels : ['all']
      channels.forEach((channel) => {
        acc[channel] = [...(acc[channel] || []), req]
      })
      return acc
    }, {})
    const now = new Date().toISOString()
    const drafts = Object.entries(groupedByChannel).map(([channel, reqs]) => ({
      id: `ds-${Date.now()}-${channel}`,
      scheduleId: schedule.id,
      inheritedFromScheduleId: schedule.inheritedFromScheduleId,
      scheduleIds: [schedule.id, ...(schedule.inheritedFromScheduleId ? [schedule.inheritedFromScheduleId] : [])],
      requirementIds: reqs.map((req) => req.id),
      status: 'Draft',
      channel,
      setName: `${schedule.directionName}-${channelDisplayName(channel)}-${reqs.length}条`,
      createdBy: schedule.owner || '唐欣怡',
      createdAt: now,
    }))
    if (deliverySets) deliverySets.value = [...drafts, ...deliverySets.value]
    requirements.value = requirements.value.map((req) => {
      const draft = drafts.find((item) => item.requirementIds.includes(req.id))
      return draft ? { ...req, deliverySetId: draft.id } : req
    })
    showToast(`已按渠道生成 ${drafts.length} 个 Delivery Set 草稿。`)
    return drafts
  }

  return {
    isScheduleVisibleInCoordinatedView,
    updateSchedule,
    addScheduleRow,
    addRequirementForSchedule,
    addScheduleDirectionTag,
    removeScheduleDirectionTag,
    getDefaultCycleAdjustTarget,
    applyCycleAdjustment,
    updateSchedulePriority,
    createDeliverySetDraft,
  }
}
