export const getRecentUtcRange = (days = 30) => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days + 1)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export const toUtcDate = (value) => {
  if (!value) return new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day || 1))
}

export const formatUtcDate = (date) => date.toISOString().slice(0, 10)

export const shiftUtcMonth = (date, delta) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1))

export const getUtcMonthDays = (monthDate) => {
  const year = monthDate.getUTCFullYear()
  const month = monthDate.getUTCMonth()
  const first = new Date(Date.UTC(year, month, 1))
  const start = new Date(first)
  start.setUTCDate(first.getUTCDate() - first.getUTCDay())
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    return date
  })
}

export const getUtcWeekRange = (offsetWeeks = 0) => {
  const today = new Date()
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const start = new Date(end)
  start.setUTCDate(end.getUTCDate() - end.getUTCDay() + offsetWeeks * 7)
  const rangeEnd = new Date(start)
  rangeEnd.setUTCDate(start.getUTCDate() + 6)
  return { start: formatUtcDate(start), end: formatUtcDate(rangeEnd) }
}

export const getSingleUtcDayRange = (delta = 0) => {
  const today = new Date()
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + delta))
  return { start: formatUtcDate(date), end: formatUtcDate(date) }
}

export const getUtcMonthRange = (offsetMonths = 0) => {
  const today = new Date()
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + offsetMonths, 1))
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0))
  return { start: formatUtcDate(start), end: formatUtcDate(end) }
}

export const isWithinDateRange = (date, start, end) =>
  Boolean(start && end && date >= start && date <= end)

export const isDateRangeEdge = (date, start, end) => date === start || date === end
