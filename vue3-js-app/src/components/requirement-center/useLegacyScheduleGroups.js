import { computed, ref, unref } from 'vue'

const priorityOrder = { Highest: 0, High: 1, Mid: 2, Low: 3, '': 4 }

export const useLegacyScheduleGroups = ({ schedules, requirements }) => {
  const collapsedWeeks = ref({})
  const scheduleSearchQuery = ref('')
  const scheduleFilters = ref({
    priority: '全部',
    difficulty: '全部',
    form: '全部',
    scenario: '全部',
    directionType: '全部',
    owner: '全部',
  })

  const groupedSchedules = computed(() => {
    const list = unref(schedules) || []
    const requirementList = unref(requirements) || []
    const filtered = list.filter((schedule) => {
      const matchSearch =
        !scheduleSearchQuery.value ||
        requirementList.some(
          (requirement) =>
            requirement.scheduleId === schedule.id &&
            String(requirement.id || '')
              .toLowerCase()
              .includes(scheduleSearchQuery.value.toLowerCase()),
        )
      const matchPriority = scheduleFilters.value.priority === '全部' || schedule.priority === scheduleFilters.value.priority
      const matchDifficulty = scheduleFilters.value.difficulty === '全部' || schedule.difficulty === scheduleFilters.value.difficulty
      const matchForm = scheduleFilters.value.form === '全部' || schedule.form === scheduleFilters.value.form
      const matchScenario = scheduleFilters.value.scenario === '全部' || schedule.scenario === scheduleFilters.value.scenario
      const matchType = scheduleFilters.value.directionType === '全部' || schedule.directionType === scheduleFilters.value.directionType
      const matchOwner = scheduleFilters.value.owner === '全部' || schedule.owner === scheduleFilters.value.owner
      return matchSearch && matchPriority && matchDifficulty && matchForm && matchScenario && matchType && matchOwner
    })

    const groups = {}
    filtered.forEach((schedule) => {
      groups[schedule.weekRange] = [...(groups[schedule.weekRange] || []), schedule]
    })
    Object.keys(groups).forEach((week) => {
      groups[week] = groups[week].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99))
    })
    return Object.keys(groups)
      .sort()
      .reduce((acc, week) => ({ ...acc, [week]: groups[week] }), {})
  })

  const toggleWeek = (week) => {
    collapsedWeeks.value = { ...collapsedWeeks.value, [week]: !collapsedWeeks.value[week] }
  }

  return {
    collapsedWeeks,
    scheduleSearchQuery,
    scheduleFilters,
    groupedSchedules,
    toggleWeek,
  }
}
