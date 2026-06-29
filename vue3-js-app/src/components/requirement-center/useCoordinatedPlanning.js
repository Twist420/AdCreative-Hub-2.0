import { computed, ref, watchEffect } from 'vue'
import { producers } from './people'
import { getScheduledTaskViews } from './requirementUtils'

const FILTER_ALL = '全部'
const FILTER_SEPARATOR = '|'

const coordinatedFilterGroups = [
  {
    key: 'assetType',
    label: '类型',
    minWidth: 'min-w-[128px]',
    options: [
      ['全部', '全部类型'],
      ['Video', '视频'],
      ['Image', '图片'],
      ['Playable', '试玩'],
    ],
  },
  {
    key: 'broadDirection',
    label: '方向',
    minWidth: 'min-w-[134px]',
    options: [
      ['全部', '全部方向'],
      ['原始玩法', '原始玩法'],
      ['3D玩法', '3D玩法'],
      ['大字报', '大字报'],
    ],
  },
  {
    key: 'creativePersonnel',
    label: '创意人员',
    minWidth: 'min-w-[142px]',
    icon: 'user',
    options: [
      ['全部', '全部'],
      ['唐欣怡', '唐欣怡'],
      ['吉意煊', '吉意煊'],
      ['马嘉良', '马嘉良'],
    ],
  },
]

const flexibleFilterFields = [
  { key: 'priority', label: '优先级', options: ['最高', '高', '中', '低'] },
  { key: 'materialStage', label: '素材阶段', options: ['新', '老', '迭'] },
  { key: 'productionPersonnel', label: '制作人员', options: producers.filter((producer) => producer.status === '在职').map((producer) => producer.name) },
  { key: 'scenario', label: '场景', options: ['通投', '本地化', 'ASO'] },
  { key: 'channels', label: '渠道', options: ['all', 'apl', 'fb', 'uac', 'adjoe', 'moloco', 'unity'] },
  { key: 'reqStatus', label: '需求提交状态', options: ['草稿', '待审核', '审核通过', '需求修改'] },
  { key: 'productionProgress', label: '制作完成进度', options: ['完全未开始', '进行中', '部分完成', '已完成'] },
  { key: 'deliveryStatus', label: '投放状态', options: ['未投放', '投放中', '已暂停'] },
  { key: 'language', label: '语言', options: ['en', 'de', 'fr', 'it', 'jp', 'kr', 'tw', 'es', 'pt'] },
]

const flexibleOperators = [
  { key: 'equals', label: '等于' },
  { key: 'notEquals', label: '不等于' },
  { key: 'contains', label: '包含' },
  { key: 'notContains', label: '不包含' },
  { key: 'isEmpty', label: '为空' },
  { key: 'isNotEmpty', label: '不为空' },
]

const priorityRank = {
  Highest: 4,
  High: 3,
  Mid: 2,
  Low: 1,
}

const priorityLabelMap = {
  Highest: '最高',
  High: '高',
  Mid: '中',
  Low: '低',
}

const scenarioLabelMap = {
  Standard: '通投',
  Localized: '本地化',
  ASO: 'ASO',
}

const reqStatusLabelMap = {
  Draft: '草稿',
  Pending: '待审核',
  Approved: '审核通过',
  Modification: '需求修改',
}

const deliveryStatusLabelMap = {
  NotLaunched: '未投放',
  Delivering: '投放中',
  Paused: '已暂停',
}

const addDaysToDateString = (dateString, daysToAdd) => {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + daysToAdd)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateValue = (dateString) => {
  if (!dateString) return null
  const timestamp = new Date(`${dateString}T00:00:00`).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
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

const rangesOverlap = (startA, endA, startB, endB) => {
  if (!startB && !endB) return true
  const aStart = parseDateValue(startA)
  const aEnd = parseDateValue(endA || startA)
  const bStart = startB ? parseDateValue(startB) : null
  const bEnd = endB ? parseDateValue(endB) : null
  if (aStart === null || aEnd === null) return true
  if (bStart !== null && aEnd < bStart) return false
  if (bEnd !== null && aStart > bEnd) return false
  return true
}

const getDefaultWeekRanges = (existingRanges, limit, todayDateString) => {
  const sortedRanges = [...(existingRanges || [])].filter(Boolean).sort((a, b) => {
    const aRange = parseWeekRangeDates(a)
    const bRange = parseWeekRangeDates(b)
    return bRange.endTime - aRange.endTime || bRange.startTime - aRange.startTime
  })
  const todayTime = parseDateValue(todayDateString) ?? Date.now()
  const existingCurrentRange =
    sortedRanges.find((range) => {
      const { startTime, endTime } = parseWeekRangeDates(range)
      return todayTime >= startTime && todayTime < endTime
    }) || sortedRanges[0]
  const fallbackStart = todayDateString
  const fallbackEnd = addDaysToDateString(fallbackStart, 7)
  const { start: currentStart, end: currentEnd } = existingCurrentRange
    ? parseWeekRangeDates(existingCurrentRange)
    : { start: fallbackStart, end: fallbackEnd }
  const generatedRanges = [`${currentStart} ~ ${currentEnd}`]

  for (let index = 1; index <= 4; index += 1) {
    const start = addDaysToDateString(currentStart, index * 7)
    generatedRanges.push(`${start} ~ ${addDaysToDateString(start, 7)}`)
  }
  for (let index = 1; generatedRanges.length < limit; index += 1) {
    const start = addDaysToDateString(currentStart, -index * 7)
    generatedRanges.push(`${start} ~ ${addDaysToDateString(start, 7)}`)
  }

  return Array.from(new Set([...sortedRanges, ...generatedRanges]))
    .sort((a, b) => {
      const aRange = parseWeekRangeDates(a)
      const bRange = parseWeekRangeDates(b)
      return bRange.startTime - aRange.startTime || bRange.endTime - aRange.endTime
    })
    .slice(0, Math.max(limit, sortedRanges.length))
}

const decodeFilterValue = (value) =>
  !value || value === FILTER_ALL ? [] : String(value).split(FILTER_SEPARATOR).filter(Boolean)

const encodeFilterValue = (values) => {
  const normalized = Array.from(new Set(values.filter((value) => value && value !== FILTER_ALL)))
  return normalized.length > 0 ? normalized.join(FILTER_SEPARATOR) : FILTER_ALL
}

const filterMatches = (filterValue, actualValue) => {
  const selectedValues = decodeFilterValue(filterValue)
  return selectedValues.length === 0 || selectedValues.includes(actualValue || '')
}

const createCoordinatedFlexibleFilter = () => ({
  id: `condition-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  field: 'priority',
  operator: 'equals',
  value: '高',
})

export const useCoordinatedPlanning = ({
  schedules,
  requirements,
  todayDateString,
  defaultDateRangeStart,
  defaultDateRangeEnd,
}) => {
  const searchQuery = ref('')
  const filters = ref({
    assetType: FILTER_ALL,
    broadDirection: FILTER_ALL,
    creativePersonnel: FILTER_ALL,
  })
  const openCoordinatedFilterKey = ref(null)
  const isFlexibleFilterPanelOpen = ref(false)
  const openFlexibleFilterMenu = ref(null)
  const coordinatedFlexibleFilters = ref([])
  const currentSort = ref('none')
  const sortOrder = ref('desc')
  const selectedWeekRange = ref('')
  const selectedWeekRanges = ref([])
  const dateRangeStart = ref(defaultDateRangeStart || addDaysToDateString(todayDateString, -90))
  const dateRangeEnd = ref(defaultDateRangeEnd || todayDateString)

  const weekRanges = computed(() =>
    getDefaultWeekRanges(Array.from(new Set(schedules.value.map((schedule) => schedule.weekRange))), 24, todayDateString)
      .sort((a, b) => {
        const aRange = parseWeekRangeDates(a)
        const bRange = parseWeekRangeDates(b)
        return bRange.startTime - aRange.startTime || bRange.endTime - aRange.endTime
      }),
  )

  const futureWeekRanges = computed(() => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now()
    return weekRanges.value.filter((range) => parseWeekRangeDates(range).startTime > todayTime)
  })

  const currentWeekRange = computed(() => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now()
    return (
      weekRanges.value.find((range) => {
        const { startTime, endTime } = parseWeekRangeDates(range)
        return todayTime >= startTime && todayTime < endTime
      }) ||
      futureWeekRanges.value.at(-1) ||
      weekRanges.value[0] ||
      ''
    )
  })

  const pinnedWeekRanges = computed(() => {
    const nearestFutureRanges = [...futureWeekRanges.value].sort((a, b) => {
      const aRange = parseWeekRangeDates(a)
      const bRange = parseWeekRangeDates(b)
      return aRange.startTime - bRange.startTime || aRange.endTime - bRange.endTime
    })
    return [currentWeekRange.value, ...nearestFutureRanges.slice(0, 3)]
      .filter(Boolean)
      .filter((range, index, ranges) => ranges.indexOf(range) === index)
      .sort((a, b) => {
        const aRange = parseWeekRangeDates(a)
        const bRange = parseWeekRangeDates(b)
        return bRange.startTime - aRange.startTime || bRange.endTime - aRange.endTime
      })
  })

  const weekStatusMap = computed(() => {
    const statusMap = {}
    weekRanges.value.forEach((weekRange) => {
      const weekSchedules = schedules.value.filter((schedule) => schedule.weekRange === weekRange)
      if (weekSchedules.length === 0) {
        statusMap[weekRange] = 'completed'
        return
      }

      let hasRequirements = false
      let allCompleted = true
      weekSchedules.forEach((schedule) => {
        const scheduleRequirements = requirements.value.filter((requirement) => requirement.scheduleId === schedule.id)
        if (scheduleRequirements.length > 0) {
          hasRequirements = true
          if (!scheduleRequirements.every((requirement) => requirement.prodStatus === 'Completed')) {
            allCompleted = false
          }
        } else if ((schedule.totalRequiredCount || 0) > 0) {
          allCompleted = false
        }
      })
      statusMap[weekRange] = hasRequirements && allCompleted ? 'completed' : 'inprogress'
    })
    return statusMap
  })

  const weekVisualMap = computed(() => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now()
    return Object.fromEntries(
      weekRanges.value.map((weekRange) => {
        const { startTime, endTime } = parseWeekRangeDates(weekRange)
        const weekSchedules = schedules.value.filter((schedule) => schedule.weekRange === weekRange)
        const weekScheduleIds = new Set(weekSchedules.map((schedule) => schedule.id))
        const weekRequirements = requirements.value.filter((requirement) => weekScheduleIds.has(requirement.scheduleId))
        const hasUnfinished =
          weekRequirements.some((requirement) => requirement.prodStatus !== 'Completed') ||
          weekSchedules.some((schedule) => {
            const existingCount = requirements.value.filter((requirement) => requirement.scheduleId === schedule.id).length
            return existingCount === 0 && (schedule.totalRequiredCount || 0) > 0
          })

        let tone = 'past'
        if (todayTime >= startTime && todayTime < endTime) tone = 'current'
        else if (startTime > todayTime) tone = 'future'
        else if (hasUnfinished) tone = 'pastUnfinished'

        const meta = {
          current: {
            label: '当前周期',
            dotClass: 'bg-emerald-500 ring-4 ring-emerald-100',
            buttonClass: 'bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100',
            activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/15',
            dropdownActiveClass: 'bg-emerald-50 text-emerald-700',
          },
          future: {
            label: '未来周期',
            dotClass: 'bg-orange-400 ring-4 ring-orange-100',
            buttonClass: 'bg-orange-50 text-orange-700 border-orange-150 hover:bg-orange-100',
            activeClass: 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/15',
            dropdownActiveClass: 'bg-orange-50 text-orange-700',
          },
          past: {
            label: '已完成周期',
            dotClass: 'bg-slate-300 ring-4 ring-slate-100',
            buttonClass: 'bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100',
            activeClass: 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/15',
            dropdownActiveClass: 'bg-slate-100 text-slate-600',
          },
          pastUnfinished: {
            label: '历史周期有未完成',
            dotClass: 'bg-rose-500 ring-4 ring-rose-100',
            buttonClass: 'bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100',
            activeClass: 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/15',
            dropdownActiveClass: 'bg-slate-100 text-slate-600',
          },
        }
        return [weekRange, { tone, ...meta[tone] }]
      }),
    )
  })

  const overflowWeekRanges = computed(() =>
    weekRanges.value
      .filter((range) => !pinnedWeekRanges.value.includes(range))
      .filter((range) => {
        const visual = weekVisualMap.value[range]
        const hasRealSchedule = schedules.value.some((schedule) => schedule.weekRange === range)
        return !(hasRealSchedule && visual?.tone === 'past' && weekStatusMap.value[range] === 'completed')
      }),
  )

  watchEffect(() => {
    if (weekRanges.value.length === 0) return
    if (!selectedWeekRange.value || !weekRanges.value.includes(selectedWeekRange.value)) {
      selectedWeekRange.value = currentWeekRange.value
    }
    const validSelections = selectedWeekRanges.value.filter((range) => weekRanges.value.includes(range))
    if (validSelections.length === 0 && currentWeekRange.value) {
      selectedWeekRanges.value = [currentWeekRange.value]
    } else if (validSelections.length !== selectedWeekRanges.value.length) {
      selectedWeekRanges.value = validSelections
    }
  })

  const coordinatedToolbarFilterGroups = computed(() =>
    coordinatedFilterGroups.map((group) => ({
      ...group,
      value: filters.value[group.key],
    })),
  )

  const getScheduleRequirements = (scheduleId) =>
    requirements.value.filter((requirement) => requirement.scheduleId === scheduleId)

  const getScheduleFlexibleValues = (schedule, field) => {
    const reqs = getScheduleRequirements(schedule.id)
    if (field === 'priority') return [priorityLabelMap[schedule.priority] || '']
    if (field === 'materialStage') return [schedule.materialStage || '']
    if (field === 'productionPersonnel') {
      return Array.from(new Set(reqs.flatMap((req) => req.productionPersonnel || []))).filter(Boolean)
    }
    if (field === 'scenario') return [scenarioLabelMap[schedule.scenario] || '']
    if (field === 'channels') {
      return Array.from(new Set([...(schedule.channels || []), ...reqs.flatMap((req) => req.channels || [])])).filter(Boolean)
    }
    if (field === 'reqStatus') return reqs.map((req) => reqStatusLabelMap[req.reqStatus] || '')
    if (field === 'productionProgress') {
      const completed = reqs.filter((req) => req.prodStatus === 'Completed').length
      const inProgress = reqs.filter((req) => req.prodStatus === 'InProgress').length
      if (reqs.length === 0 || (completed === 0 && inProgress === 0)) return ['完全未开始']
      if (completed === reqs.length) return ['已完成']
      if (completed > 0) return ['部分完成']
      return ['进行中']
    }
    if (field === 'deliveryStatus') {
      return Array.from(new Set(reqs.map((req) => deliveryStatusLabelMap[req.deliveryStatus] || ''))).filter(Boolean)
    }
    if (field === 'language') {
      return Array.from(new Set(reqs.map((req) => req.language || ''))).filter(Boolean)
    }
    return []
  }

  const scheduleMatchesFlexibleFilter = (schedule, condition) => {
    const values = getScheduleFlexibleValues(schedule, condition.field).filter(Boolean)
    const hasValue = values.length > 0
    if (condition.operator === 'isEmpty') return !hasValue
    if (condition.operator === 'isNotEmpty') return hasValue
    const expectedValue = String(condition.value || '').trim()
    if (!expectedValue) return true
    if (condition.operator === 'equals') return values.some((value) => value === expectedValue)
    if (condition.operator === 'notEquals') return values.every((value) => value !== expectedValue)
    if (condition.operator === 'contains') return values.some((value) => String(value).includes(expectedValue))
    if (condition.operator === 'notContains') return values.every((value) => !String(value).includes(expectedValue))
    return true
  }

  const filteredSchedules = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const getScheduleRiskValue = (schedule) => {
      const weekStart = todayDateString
      const weekEnd = addDaysToDateString(todayDateString, 6)
      return getScheduleRequirements(schedule.id)
        .filter(
          (requirement) =>
            (requirement.priority === 'Highest' || requirement.priority === 'High') &&
            requirement.prodStatus !== 'Completed',
        )
        .reduce((score, requirement) => {
          const dueDate =
            schedule.productionEnd ||
            schedule.submissionDeadline ||
            schedule.requirementEnd ||
            requirement.endDate ||
            ''
          const dueTime = parseDateValue(dueDate)
          const todayTime = parseDateValue(todayDateString)
          const taskViews = getScheduledTaskViews(requirement)
          const lastTaskEnd = taskViews.map((task) => task.endDate).filter(Boolean).sort().at(-1) || ''
          const hasDeadlineOverflow = Boolean(dueDate && lastTaskEnd && lastTaskEnd > dueDate)
          const hasNoPlan = taskViews.length === 0
          const hasUpcomingTask = taskViews.some((task) => rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd))
          const isDeadlinePassed = dueTime !== null && todayTime !== null && dueTime < todayTime
          const isDeadlineWithinWeek =
            dueTime !== null &&
            todayTime !== null &&
            dueTime >= todayTime &&
            dueTime <= (parseDateValue(weekEnd) ?? dueTime)

          if (
            isDeadlinePassed ||
            hasDeadlineOverflow ||
            (hasNoPlan && isDeadlineWithinWeek) ||
            (!hasUpcomingTask && isDeadlineWithinWeek)
          ) {
            return score + 100
          }
          if (hasNoPlan || !hasUpcomingTask) return score + 10
          return score
        }, 0)
    }

    const sorted = schedules.value
      .filter((schedule) => {
        if (selectedWeekRanges.value.length > 0) return selectedWeekRanges.value.includes(schedule.weekRange)
        return schedule.weekRange === selectedWeekRange.value
      })
      .filter((schedule) => {
        const parsed = parseWeekRangeDates(schedule.weekRange)
        return rangesOverlap(schedule.requirementStart || parsed.start, schedule.requirementEnd || parsed.end, dateRangeStart.value, dateRangeEnd.value)
      })
      .filter((schedule) => filterMatches(filters.value.assetType, schedule.form))
      .filter((schedule) => filterMatches(filters.value.broadDirection, schedule.broadDirection))
      .filter((schedule) => filterMatches(filters.value.creativePersonnel, schedule.owner))
      .filter((schedule) => coordinatedFlexibleFilters.value.every((condition) => scheduleMatchesFlexibleFilter(schedule, condition)))
      .filter((schedule) => {
        if (!query) return true
        const relatedRequirements = getScheduleRequirements(schedule.id)
        return (
          String(schedule.directionName || '').toLowerCase().includes(query) ||
          String(schedule.id || '').toLowerCase().includes(query) ||
          relatedRequirements.some((requirement) =>
            [requirement.id, requirement.name].some((value) => String(value || '').toLowerCase().includes(query)),
          )
        )
      })

    sorted.sort((a, b) => {
      let comparison = 0
      if (currentSort.value === 'scheduleRisk') {
        comparison = getScheduleRiskValue(a) - getScheduleRiskValue(b)
      } else if (currentSort.value === 'priority') {
        comparison = (priorityRank[a.priority] || 0) - (priorityRank[b.priority] || 0)
      } else if (currentSort.value === 'progress') {
        const getProgress = (schedule) => {
          const reqs = getScheduleRequirements(schedule.id)
          if (reqs.length === 0) return 0
          return reqs.filter((req) => req.prodStatus === 'Completed').length / reqs.length
        }
        comparison = getProgress(a) - getProgress(b)
      } else if (currentSort.value === 'form') {
        comparison = String(a.form || '').localeCompare(String(b.form || ''))
      } else if (currentSort.value === 'broadDirection') {
        comparison = String(a.broadDirection || '').localeCompare(String(b.broadDirection || ''))
      }
      return sortOrder.value === 'desc' ? -comparison : comparison
    })

    return sorted
  })

  const getScheduleInsight = (scheduleId) => {
    const reqs = getScheduleRequirements(scheduleId)
    const completed = reqs.filter((req) => req.prodStatus === 'Completed').length
    const inProgress = reqs.filter((req) => req.prodStatus === 'InProgress').length

    if (completed > 0 && inProgress === 0) {
      return {
        status: '快完成',
        statusTone: 'border-emerald-150 bg-emerald-50 text-emerald-700',
        suggestion: '已有需求完成，可检查是否需要投放打包',
        completedNotLaunched: completed,
      }
    }

    if (inProgress > 0) {
      return {
        status: '进行中',
        statusTone: 'border-indigo-150 bg-indigo-50 text-indigo-700',
        suggestion: '已有需求进入制作中',
        completedNotLaunched: 0,
      }
    }

    return null
  }

  const toggleRequirementFilterOption = (key, option) => {
    if (option === FILTER_ALL) {
      filters.value = { ...filters.value, [key]: FILTER_ALL }
      return
    }
    const currentValues = decodeFilterValue(filters.value[key])
    const nextValues = currentValues.includes(option)
      ? currentValues.filter((item) => item !== option)
      : [...currentValues, option]
    filters.value = { ...filters.value, [key]: encodeFilterValue(nextValues) }
  }

  const updateFlexibleFilter = (id, updates) => {
    coordinatedFlexibleFilters.value = coordinatedFlexibleFilters.value.map((condition) =>
      condition.id === id ? { ...condition, ...updates } : condition,
    )
  }

  const addFlexibleFilter = () => {
    coordinatedFlexibleFilters.value = [
      ...coordinatedFlexibleFilters.value,
      createCoordinatedFlexibleFilter(),
    ]
  }

  const removeFlexibleFilter = (id) => {
    coordinatedFlexibleFilters.value = coordinatedFlexibleFilters.value.filter((condition) => condition.id !== id)
    if (openFlexibleFilterMenu.value?.startsWith(`${id}:`)) {
      openFlexibleFilterMenu.value = null
    }
  }

  const clearRequirementFilter = (key) => {
    filters.value = { ...filters.value, [key]: FILTER_ALL }
    openCoordinatedFilterKey.value = null
  }

  const setSortOption = (key) => {
    if (currentSort.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      return
    }
    currentSort.value = key
    sortOrder.value = 'desc'
  }

  const resetCoordinatedFilters = () => {
    coordinatedFlexibleFilters.value = []
    currentSort.value = 'none'
    sortOrder.value = 'desc'
    selectedWeekRange.value = currentWeekRange.value
    selectedWeekRanges.value = currentWeekRange.value ? [currentWeekRange.value] : []
    dateRangeStart.value = defaultDateRangeStart || addDaysToDateString(todayDateString, -90)
    dateRangeEnd.value = defaultDateRangeEnd || todayDateString
    isFlexibleFilterPanelOpen.value = false
    openFlexibleFilterMenu.value = null
  }

  const syncDateRangeToWeekSelections = (ranges) => {
    const parsedRanges = ranges.map((range) => parseWeekRangeDates(range))
    if (parsedRanges.length === 0) return
    const orderedStarts = parsedRanges.map((range) => range.start).sort()
    const orderedEnds = parsedRanges.map((range) => range.end).sort()
    dateRangeStart.value = orderedStarts[0]
    dateRangeEnd.value = orderedEnds[orderedEnds.length - 1]
  }

  const toggleSelectedWeekRange = (range) => {
    const next = selectedWeekRanges.value.includes(range)
      ? selectedWeekRanges.value.filter((item) => item !== range)
      : [...selectedWeekRanges.value, range]
    const nextSelections = next.length > 0 ? next : [range]
    selectedWeekRanges.value = nextSelections
    selectedWeekRange.value = nextSelections.includes(range) ? range : nextSelections[0]
    syncDateRangeToWeekSelections(nextSelections)
  }

  return {
    searchQuery,
    filters,
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
    getScheduleInsight,
    updateFlexibleFilter,
    addFlexibleFilter,
    removeFlexibleFilter,
    clearRequirementFilter,
    setSortOption,
    toggleRequirementFilterOption,
    resetCoordinatedFilters,
    toggleSelectedWeekRange,
  }
}
