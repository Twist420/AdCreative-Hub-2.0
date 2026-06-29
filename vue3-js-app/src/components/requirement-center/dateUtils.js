export { default as ProductionSubmitDateDisplay } from './ProductionSubmitDateDisplay.vue'
export { default as WeekRangeRuleInfo } from './WeekRangeRuleInfo.vue'

export const formatCalendarDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const openNativeDatePicker = (event) => {
  event.currentTarget?.showPicker?.()
}

export const parseDateValue = (dateString) => {
  if (!dateString) return null
  const timestamp = new Date(`${dateString}T00:00:00`).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export const getDateRangeDays = (startDate, endDate) => {
  const startTime = parseDateValue(startDate)
  const endTime = parseDateValue(endDate)
  if (startTime === null || endTime === null) return 0
  return Math.max(1, Math.round((endTime - startTime) / 86400000) + 1)
}

export const getSubmitTimeBadge = (submitDate, todayDate) => {
  const submitTime = parseDateValue(submitDate)
  const todayTime = parseDateValue(todayDate)
  if (submitTime === null || todayTime === null) return null
  const diffDays = Math.round((submitTime - todayTime) / 86400000)
  if (diffDays < 0) {
    return {
      label: '延期',
      className: 'border-rose-100 bg-rose-50 text-rose-600',
    }
  }
  if (diffDays <= 1) {
    return {
      label: '1天内',
      className: 'border-amber-100 bg-amber-50 text-amber-700',
    }
  }
  return null
}

export const getSubmitDelayDays = (submitDate, todayDate) => {
  const submitTime = parseDateValue(submitDate)
  const todayTime = parseDateValue(todayDate)
  if (submitTime === null || todayTime === null || submitTime >= todayTime) return 0
  return Math.ceil((todayTime - submitTime) / 86400000)
}

export const getMonthWeeks = (year, month, todayDateString) => {
  const weeks = []
  const todayString = todayDateString || formatCalendarDate(new Date())
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const dayOfWeek = firstDayOfMonth.getDay()
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const currentDate = new Date(year, month - 1, 1 - startOffset)

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const days = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const dateString = formatCalendarDate(currentDate)
      const day = currentDate.getDay()
      days.push({
        dayNum: currentDate.getDate(),
        dateString,
        isToday: dateString === todayString,
        isWeekend: day === 0 || day === 6,
        isCurrentMonth: currentDate.getMonth() + 1 === month,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    if (weekIndex < 5 || days.some((day) => day.isCurrentMonth)) {
      weeks.push({ days })
    }
  }

  return weeks
}

export const parseWeekRangeDates = (weekRange) => {
  const [start, end] = String(weekRange || '')
    .split('~')
    .map((part) => part.trim())
  return {
    start,
    end,
    startTime: parseDateValue(start) ?? 0,
    endTime: parseDateValue(end) ?? 0,
  }
}

export const rangesOverlap = (itemStart, itemEnd, filterStart, filterEnd) => {
  const filterStartTime = parseDateValue(filterStart)
  const filterEndTime = parseDateValue(filterEnd)
  if (filterStartTime === null && filterEndTime === null) return true

  const itemStartTime = parseDateValue(itemStart) ?? parseDateValue(itemEnd)
  const itemEndTime = parseDateValue(itemEnd) ?? itemStartTime
  if (itemStartTime === null || itemEndTime === null) return false

  return (
    (filterStartTime === null || itemEndTime >= filterStartTime) &&
    (filterEndTime === null || itemStartTime <= filterEndTime)
  )
}

export const addDaysToDateString = (dateString, daysToAdd) => {
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString
  date.setDate(date.getDate() + daysToAdd)
  return formatCalendarDate(date)
}

const defaultWeekRangeCount = 20

export const getDefaultWeekRanges = (
  ranges,
  count = defaultWeekRangeCount,
  baseDate = formatCalendarDate(new Date()),
) => {
  const sortedRanges = [...(ranges || [])].sort((a, b) => {
    const aRange = parseWeekRangeDates(a)
    const bRange = parseWeekRangeDates(b)
    return bRange.endTime - aRange.endTime || bRange.startTime - aRange.startTime
  })
  const baseTime = parseDateValue(baseDate) ?? Date.now()
  const existingCurrentRange =
    sortedRanges.find((range) => {
      const { startTime, endTime } = parseWeekRangeDates(range)
      return baseTime >= startTime && baseTime < endTime
    }) || sortedRanges[0]
  const fallbackCurrentStart = baseDate
  const fallbackCurrentEnd = addDaysToDateString(fallbackCurrentStart, 7)
  const { start: currentStart, end: currentEnd } = existingCurrentRange
    ? parseWeekRangeDates(existingCurrentRange)
    : { start: fallbackCurrentStart, end: fallbackCurrentEnd }
  const generatedRanges = []

  generatedRanges.push(`${currentStart} ~ ${currentEnd}`)
  for (let index = 1; index <= 4; index += 1) {
    const start = addDaysToDateString(currentStart, index * 7)
    generatedRanges.push(`${start} ~ ${addDaysToDateString(start, 7)}`)
  }
  for (let index = 1; generatedRanges.length < count; index += 1) {
    const start = addDaysToDateString(currentStart, -index * 7)
    generatedRanges.push(`${start} ~ ${addDaysToDateString(start, 7)}`)
  }

  return Array.from(new Set([...sortedRanges, ...generatedRanges]))
    .sort((a, b) => {
      const aRange = parseWeekRangeDates(a)
      const bRange = parseWeekRangeDates(b)
      return bRange.startTime - aRange.startTime || bRange.endTime - aRange.endTime
    })
    .slice(0, Math.max(count, sortedRanges.length))
}
