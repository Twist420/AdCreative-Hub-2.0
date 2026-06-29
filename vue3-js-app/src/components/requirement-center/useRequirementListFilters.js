import { computed, ref, unref } from 'vue'
import { parseRequirementVersionId } from './requirementUtils'

const FILTER_ALL = '全部'
const FILTER_SEPARATOR = '|'

export const requirementFilterConfigs = [
  { key: 'materialStage', label: '素材阶段', options: ['全部', '新', '老', '迭'] },
  { key: 'broadDirection', label: '大方向', options: ['全部', '大字报', '原始玩法', '3D玩法'] },
  { key: 'assetType', label: '制作类型', options: ['全部', 'Video', 'Image', 'Playable'] },
  { key: 'creativePersonnel', label: '创意人员', options: ['全部', '唐欣怡', '吉意煊', '马嘉良'] },
  { key: 'priority', label: '优先级', options: ['全部', 'Low', 'Mid', 'High', 'Highest'] },
  { key: 'reqStatus', label: '需求状态', options: ['全部', 'Draft', 'Pending', 'Approved', 'Modification'] },
  { key: 'prodStatus', label: '制作状态', options: ['全部', 'Unscheduled', 'Scheduled', 'InProgress', 'Completed'] },
]

export const getRequirementFilterOptionLabel = (option) => {
  const labels = {
    Video: '视频',
    Image: '图片',
    Playable: '试玩',
    Low: '低',
    Mid: '中',
    High: '高',
    Highest: '最高',
    Draft: '草稿',
    Pending: '待审核',
    Approved: '审核通过',
    Modification: '需求修改',
    Unscheduled: '未排期',
    Scheduled: '已排期',
    InProgress: '进行中',
    Completed: '已完成',
  }
  return labels[option] || option
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

const filterIsActive = (filterValue) => decodeFilterValue(filterValue).length > 0

const rangesOverlap = (sourceStart, sourceEnd, filterStart, filterEnd) => {
  if (!filterStart && !filterEnd) return true
  if (!sourceStart && !sourceEnd) return false
  const start = sourceStart || sourceEnd
  const end = sourceEnd || sourceStart
  const sourceStartTime = new Date(`${start}T00:00:00`).getTime()
  const sourceEndTime = new Date(`${end}T00:00:00`).getTime()
  const filterStartTime = filterStart ? new Date(`${filterStart}T00:00:00`).getTime() : -Infinity
  const filterEndTime = filterEnd ? new Date(`${filterEnd}T00:00:00`).getTime() : Infinity
  return sourceStartTime <= filterEndTime && sourceEndTime >= filterStartTime
}

export const useRequirementListFilters = ({
  requirements,
  highRiskRequirements,
  currentSort,
  sortOrder,
}) => {
  const searchQuery = ref('')
  const filters = ref({
    materialStage: FILTER_ALL,
    broadDirection: FILTER_ALL,
    creativePersonnel: FILTER_ALL,
    priority: FILTER_ALL,
    reqStatus: FILTER_ALL,
    prodStatus: FILTER_ALL,
    assetType: FILTER_ALL,
    scheduleRisk: FILTER_ALL,
  })
  const openRequirementFilterKey = ref(null)
  const createdRangeStart = ref('')
  const createdRangeEnd = ref('')
  const completedRangeStart = ref('')
  const completedRangeEnd = ref('')

  const getFilterDisplayText = (value) => {
    const selectedValues = decodeFilterValue(value)
    if (selectedValues.length === 0) return FILTER_ALL
    if (selectedValues.length === 1) return getRequirementFilterOptionLabel(selectedValues[0])
    return `${selectedValues.length} 项`
  }

  const toggleRequirementFilterOption = (key, option) => {
    if (option === FILTER_ALL) {
      filters.value = { ...filters.value, [key]: FILTER_ALL }
      return
    }
    const currentValues = decodeFilterValue(filters.value[key])
    const nextValues = currentValues.includes(option)
      ? currentValues.filter((value) => value !== option)
      : [...currentValues, option]
    filters.value = { ...filters.value, [key]: encodeFilterValue(nextValues) }
  }

  const clearRequirementFilter = (key) => {
    filters.value = { ...filters.value, [key]: FILTER_ALL }
    openRequirementFilterKey.value = null
  }

  const resetRequirementFilters = () => {
    filters.value = Object.fromEntries(Object.keys(filters.value).map((key) => [key, FILTER_ALL]))
    createdRangeStart.value = ''
    createdRangeEnd.value = ''
    completedRangeStart.value = ''
    completedRangeEnd.value = ''
    openRequirementFilterKey.value = null
  }

  const filteredRequirements = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const list = unref(requirements) || []
    const riskItems = unref(highRiskRequirements) || []
    const riskMap = new Map(riskItems.map((item) => [item.req.id, item]))

    const filteredList = list.filter((requirement) => {
      const matchSearch =
        !query ||
        [requirement.id, requirement.name, requirement.localizationBatchId].some((value) =>
          String(value || '').toLowerCase().includes(query),
        )
      const matchStage = filterMatches(filters.value.materialStage, requirement.materialStage)
      const matchDirection = filterMatches(filters.value.broadDirection, requirement.broadDirection)
      const matchCreative = filterMatches(filters.value.creativePersonnel, requirement.creativePersonnel)
      const matchPriority = filterMatches(filters.value.priority, requirement.priority)
      const matchReqStatus = filterMatches(filters.value.reqStatus, requirement.reqStatus)
      const matchProdStatus = filterMatches(filters.value.prodStatus, requirement.prodStatus)
      const matchAssetType = filterMatches(filters.value.assetType, requirement.assetType)
      const requirementRisk = requirement.isLocalization ? undefined : riskMap.get(requirement.id)
      const selectedRiskValues = decodeFilterValue(filters.value.scheduleRisk)
      const matchScheduleRisk =
        !filterIsActive(filters.value.scheduleRisk) ||
        (selectedRiskValues.includes('有风险') && Boolean(requirementRisk)) ||
        (selectedRiskValues.includes('严重风险') && requirementRisk?.severity === 'danger')
      const matchCreatedRange = rangesOverlap(
        requirement.createdAt?.slice(0, 10),
        requirement.createdAt?.slice(0, 10),
        createdRangeStart.value,
        createdRangeEnd.value,
      )
      const matchCompletedRange = rangesOverlap(
        requirement.completedAt?.slice(0, 10),
        requirement.completedAt?.slice(0, 10),
        completedRangeStart.value,
        completedRangeEnd.value,
      )

      return (
        matchSearch &&
        matchStage &&
        matchDirection &&
        matchCreative &&
        matchPriority &&
        matchReqStatus &&
        matchProdStatus &&
        matchAssetType &&
        matchScheduleRisk &&
        matchCreatedRange &&
        matchCompletedRange
      )
    })

    const sortKey = unref(currentSort) || 'none'
    const sortDirection = unref(sortOrder) || 'desc'
    const getRiskSortValue = (requirement) => {
      const risk = riskMap.get(requirement.id)
      if (!risk) return 0
      return risk.severity === 'danger' ? 2 : 1
    }
    const getPrioritySortValue = (requirement) => {
      const priorityOrder = { Highest: 4, High: 3, Mid: 2, Low: 1, '': 0 }
      return priorityOrder[requirement.priority || ''] || 0
    }
    const progressOrder = {
      Unscheduled: 0,
      Scheduled: 1,
      InProgress: 2,
      Completed: 3,
    }
    const sortedList = [...filteredList].sort((a, b) => {
      let comparison = 0
      if (sortKey === 'scheduleRisk' || sortKey === 'none') {
        comparison = getRiskSortValue(a) - getRiskSortValue(b)
        if (comparison === 0 && sortKey === 'scheduleRisk') {
          const aDue = riskMap.get(a.id)?.daysUntilDue ?? 999
          const bDue = riskMap.get(b.id)?.daysUntilDue ?? 999
          comparison = bDue - aDue
        }
      } else if (sortKey === 'priority') {
        comparison = getPrioritySortValue(a) - getPrioritySortValue(b)
      } else if (sortKey === 'form') {
        comparison = String(a.assetType || '').localeCompare(String(b.assetType || ''))
      } else if (sortKey === 'progress') {
        comparison = (progressOrder[a.prodStatus] || 0) - (progressOrder[b.prodStatus] || 0)
      } else if (sortKey === 'broadDirection') {
        comparison = String(a.broadDirection || '').localeCompare(String(b.broadDirection || ''))
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    const visibleIds = new Set(sortedList.map((requirement) => requirement.id))
    const parentByMajorId = new Map()
    sortedList.forEach((requirement) => {
      const parsed = parseRequirementVersionId(requirement.id)
      if (parsed?.version === 1) parentByMajorId.set(parsed.majorId, requirement.id)
    })

    const getDisplayParentId = (requirement) => {
      if (requirement.parentId) return requirement.parentId
      const parsed = parseRequirementVersionId(requirement.id)
      if (!parsed || parsed.version === 1) return undefined
      const parentId = parentByMajorId.get(parsed.majorId)
      return parentId && parentId !== requirement.id ? parentId : undefined
    }

    const roots = sortedList.filter((requirement) => {
      const displayParentId = getDisplayParentId(requirement)
      return !displayParentId || !visibleIds.has(displayParentId)
    })
    const result = []
    const visited = new Set()
    const flatten = (requirement, level) => {
      if (visited.has(requirement.id)) return
      visited.add(requirement.id)
      result.push({ ...requirement, level })
      sortedList
        .filter((child) => getDisplayParentId(child) === requirement.id)
        .forEach((child) => flatten(child, level + 1))
    }
    roots.forEach((requirement) => flatten(requirement, 0))
    return result
  })

  const hasActiveRequirementQuery = computed(() =>
    Boolean(searchQuery.value.trim()) ||
    Object.values(filters.value).some((value) => value !== FILTER_ALL) ||
    Boolean(createdRangeStart.value || createdRangeEnd.value || completedRangeStart.value || completedRangeEnd.value),
  )

  return {
    searchQuery,
    filters,
    filterConfigs: requirementFilterConfigs,
    openRequirementFilterKey,
    createdRangeStart,
    createdRangeEnd,
    completedRangeStart,
    completedRangeEnd,
    filteredRequirements,
    hasActiveRequirementQuery,
    getFilterDisplayText,
    getFilterOptionLabel: getRequirementFilterOptionLabel,
    toggleRequirementFilterOption,
    clearRequirementFilter,
    resetRequirementFilters,
    decodeFilterValue,
  }
}
