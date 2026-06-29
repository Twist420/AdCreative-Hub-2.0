import { computed, ref } from 'vue'
import { addDaysToDateString, getMonthWeeks, parseDateValue } from './dateUtils'
import { producers as knownProducers } from './people'
import { getScheduledTaskViews } from './requirementUtils'

const rangesOverlap = (start, end, rangeStart, rangeEnd) => {
  const sourceStart = new Date(`${start || end}T00:00:00`).getTime()
  const sourceEnd = new Date(`${end || start}T00:00:00`).getTime()
  const targetStart = new Date(`${rangeStart}T00:00:00`).getTime()
  const targetEnd = new Date(`${rangeEnd}T00:00:00`).getTime()
  return sourceStart <= targetEnd && sourceEnd >= targetStart
}

export const useProductionPlanning = ({ requirements, schedules, todayDateString }) => {
  const productionView = ref('gantt')
  const selectedProducers = ref([])
  const isProducerFilterOpen = ref(false)
  const showProductionRiskModal = ref(false)
  const calendarYear = ref(2026)
  const calendarMonth = ref(6)

  const productionTasks = computed(() => requirements.value.flatMap(getScheduledTaskViews))

  const activeProducers = computed(() => {
    return knownProducers.filter((producer) => producer.status === '在职')
  })

  const productionInsights = computed(() => {
    const weekStart = todayDateString
    const weekEnd = addDaysToDateString(todayDateString, 6)
    const upcomingTasks = productionTasks.value.filter((task) => rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd))
    const weeklyCapacity = activeProducers.value.length * 5
    const scheduledWorkDays = upcomingTasks.reduce((sum, task) => sum + (task.estimatedWorkDays || 1), 0)
    const scheduledProducerCount = new Set(upcomingTasks.map((task) => task.producer).filter(Boolean)).size

    const highRiskRequirements = requirements.value
      .filter((req) => (req.priority === 'Highest' || req.priority === 'High') && req.prodStatus !== 'Completed')
      .map((req) => {
        const schedule = schedules?.value?.find((item) => item.id === req.scheduleId)
        const dueDate = schedule?.productionEnd || schedule?.submissionDeadline || schedule?.requirementEnd || req.endDate || ''
        const dueTime = parseDateValue(dueDate)
        const todayTime = parseDateValue(todayDateString)
        const taskViews = getScheduledTaskViews(req)
        const hasUpcomingTask = taskViews.some((task) => rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd))
        const lastTaskEnd = taskViews.map((task) => task.endDate).filter(Boolean).sort().at(-1) || ''
        const lastTaskEndTime = parseDateValue(lastTaskEnd)
        const hasDeadlineOverflow = Boolean(dueDate && lastTaskEnd && lastTaskEnd > dueDate)
        const hasNoPlan = taskViews.length === 0
        const isDeadlinePassed = dueTime !== null && todayTime !== null && dueTime < todayTime
        const weekEndTime = parseDateValue(weekEnd)
        const isDeadlineWithinWeek = dueTime !== null && todayTime !== null && weekEndTime !== null && dueTime >= todayTime && dueTime <= weekEndTime
        const daysUntilDue = dueTime !== null && todayTime !== null ? Math.ceil((dueTime - todayTime) / 86400000) : null

        let reason = ''
        let severity = 'warning'
        let action = ''

        if (isDeadlinePassed && req.prodStatus !== 'Completed') {
          severity = 'danger'
          reason = '已过截止'
          action = '立即确认是否延期或压缩排期'
        } else if (hasDeadlineOverflow) {
          severity = 'danger'
          reason = '无法按截止完成'
          action = '调整人员或拆分并行岗位'
        } else if (hasNoPlan) {
          severity = isDeadlineWithinWeek ? 'danger' : 'warning'
          reason = '未排期'
          action = isDeadlineWithinWeek ? '今天补排负责人和时间' : '补齐负责人、开始和结束时间'
        } else if (!hasUpcomingTask && isDeadlineWithinWeek) {
          severity = 'danger'
          reason = '临期无任务'
          action = '优先插入未来7天排期'
        } else if (!hasUpcomingTask) {
          reason = '未来7天无任务'
          action = '确认是否延后或降级处理'
        }

        const deadlineDelayDays = dueTime !== null && todayTime !== null && dueTime < todayTime ? Math.ceil((todayTime - dueTime) / 86400000) : 0
        const scheduleDelayDays = dueTime !== null && lastTaskEndTime !== null && lastTaskEndTime > dueTime ? Math.ceil((lastTaskEndTime - dueTime) / 86400000) : 0

        return {
          req,
          schedule,
          dueDate,
          lastTaskEnd,
          taskCount: taskViews.length,
          daysUntilDue,
          delayedDays: Math.max(deadlineDelayDays, scheduleDelayDays),
          severity,
          reason,
          action,
        }
      })
      .filter((item) => item.reason)
      .sort((a, b) => {
        const severityScore = { danger: 0, warning: 1 }
        const severityDiff = severityScore[a.severity] - severityScore[b.severity]
        if (severityDiff !== 0) return severityDiff
        return (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999)
      })

    return {
      weekStart,
      weekEnd,
      upcomingTaskCount: upcomingTasks.length,
      scheduledWorkDays,
      weeklyCapacity,
      loadRate: weeklyCapacity > 0 ? Math.round((scheduledWorkDays / weeklyCapacity) * 100) : 0,
      scheduledProducerCount,
      highRiskRequirements,
    }
  })

  const delayedProductionRiskItems = computed(() =>
    productionInsights.value.highRiskRequirements
      .map((item) => ({ req: item.req, delayedDays: item.delayedDays }))
      .filter((item) => item.delayedDays > 0)
      .sort((a, b) => b.delayedDays - a.delayedDays),
  )

  const personnelCapacityGroups = computed(() => {
    const weekStart = todayDateString
    const weekEnd = addDaysToDateString(todayDateString, 6)
    const referenceDays = Array.from({ length: 14 }, (_, index) => addDaysToDateString(todayDateString, index))

    const producerRows = activeProducers.value.map((producer) => {
      const tasks = productionTasks.value
        .filter((task) => task.producer === producer.name)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
      const weekTasks = tasks.filter((task) => rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd))
      const weekWorkDays = weekTasks.reduce((sum, task) => sum + (task.estimatedWorkDays || 1), 0)
      const loadRate = Math.round((weekWorkDays / 5) * 100)
      const nextAvailable =
        referenceDays.find((date) => !tasks.some((task) => rangesOverlap(task.startDate, task.endDate, date, date))) ||
        addDaysToDateString(todayDateString, 14)
      return {
        producer,
        tasks,
        weekTasks,
        weekWorkDays,
        loadRate,
        nextAvailable,
      }
    })

    return activeProducers.value.reduce((groups, producer) => {
      groups[producer.group] = producerRows
        .filter((row) => row.producer.group === producer.group)
        .sort((a, b) => a.loadRate - b.loadRate || a.producer.name.localeCompare(b.producer.name))
      return groups
    }, {})
  })

  const productionGanttStart = computed(() => addDaysToDateString(todayDateString, -3))
  const productionGanttEnd = computed(() => addDaysToDateString(productionGanttStart.value, 30))
  const productionGanttDays = computed(() =>
    Array.from({ length: 31 }, (_, index) => {
      const dateString = addDaysToDateString(productionGanttStart.value, index)
      const date = new Date(`${dateString}T00:00:00`)
      const day = date.getDay()
      return {
        dateString,
        day: date.getDate(),
        month: date.getMonth() + 1,
        isToday: dateString === todayDateString,
        isWeekend: day === 0 || day === 6,
      }
    }),
  )
  const productionGanttRows = computed(() =>
    activeProducers.value
      .map((producer) => ({
        producer,
        tasks: productionTasks.value
          .filter((task) => task.producer === producer.name && rangesOverlap(task.startDate, task.endDate, productionGanttStart.value, productionGanttEnd.value))
          .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate)),
      }))
      .sort((a, b) => b.tasks.length - a.tasks.length || a.producer.name.localeCompare(b.producer.name)),
  )
  const productionCalendarWeeks = computed(() => getMonthWeeks(calendarYear.value, calendarMonth.value, todayDateString))

  const handlePrevMonth = () => {
    if (calendarMonth.value === 1) {
      calendarMonth.value = 12
      calendarYear.value -= 1
      return
    }
    calendarMonth.value -= 1
  }

  const handleNextMonth = () => {
    if (calendarMonth.value === 12) {
      calendarMonth.value = 1
      calendarYear.value += 1
      return
    }
    calendarMonth.value += 1
  }

  const jumpToday = () => {
    calendarYear.value = Number(todayDateString.slice(0, 4))
    calendarMonth.value = Number(todayDateString.slice(5, 7))
  }

  const toggleProducer = (producerName) => {
    selectedProducers.value = selectedProducers.value.includes(producerName)
      ? selectedProducers.value.filter((name) => name !== producerName)
      : [...selectedProducers.value, producerName]
  }

  return {
    productionView,
    selectedProducers,
    isProducerFilterOpen,
    showProductionRiskModal,
    calendarYear,
    calendarMonth,
    productionTasks,
    productionInsights,
    delayedProductionRiskItems,
    activeProducers,
    personnelCapacityGroups,
    productionGanttStart,
    productionGanttDays,
    productionGanttRows,
    productionCalendarWeeks,
    handlePrevMonth,
    handleNextMonth,
    jumpToday,
    toggleProducer,
    addDaysToDateString,
    rangesOverlap,
  }
}
