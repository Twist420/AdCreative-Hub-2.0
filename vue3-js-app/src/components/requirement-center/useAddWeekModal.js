import { computed, ref } from 'vue'
import { getMonthWeeks, parseDateValue } from './dateUtils'

export const useAddWeekModal = ({
  addScheduleRow,
  selectedWeekRange,
  selectedWeekRanges,
  dateRangeStart,
  dateRangeEnd,
}) => {
  const showAddWeekPopup = ref(false)
  const newWeekRange = ref('')
  const newWeekStart = ref('')
  const newWeekEnd = ref('')
  const newWeekCalendarYear = ref(2026)
  const newWeekCalendarMonth = ref(6)

  const jumpNewWeekCalendarToToday = () => {
    const today = new Date()
    newWeekCalendarYear.value = today.getFullYear()
    newWeekCalendarMonth.value = today.getMonth() + 1
  }

  const openAddWeekPopup = () => {
    jumpNewWeekCalendarToToday()
    newWeekStart.value = ''
    newWeekEnd.value = ''
    newWeekRange.value = ''
    showAddWeekPopup.value = true
  }

  const selectNewWeekDay = (dateString) => {
    if (!newWeekStart.value || (newWeekStart.value && newWeekEnd.value)) {
      newWeekStart.value = dateString
      newWeekEnd.value = ''
      newWeekRange.value = ''
      return
    }

    const startTime = parseDateValue(newWeekStart.value) || 0
    const selectedTime = parseDateValue(dateString) || 0
    const start = selectedTime < startTime ? dateString : newWeekStart.value
    const end = selectedTime < startTime ? newWeekStart.value : dateString
    newWeekStart.value = start
    newWeekEnd.value = end
    newWeekRange.value = `${start} ~ ${end}`
  }

  const prevNewWeekMonth = () => {
    if (newWeekCalendarMonth.value === 1) {
      newWeekCalendarYear.value -= 1
      newWeekCalendarMonth.value = 12
      return
    }
    newWeekCalendarMonth.value -= 1
  }

  const nextNewWeekMonth = () => {
    if (newWeekCalendarMonth.value === 12) {
      newWeekCalendarYear.value += 1
      newWeekCalendarMonth.value = 1
      return
    }
    newWeekCalendarMonth.value += 1
  }

  const confirmAddWeek = () => {
    if (!newWeekStart.value || !newWeekEnd.value) return
    const range = `${newWeekStart.value} ~ ${newWeekEnd.value}`
    addScheduleRow(range)
    if (selectedWeekRange) selectedWeekRange.value = range
    if (selectedWeekRanges) selectedWeekRanges.value = [range]
    if (dateRangeStart) dateRangeStart.value = newWeekStart.value
    if (dateRangeEnd) dateRangeEnd.value = newWeekEnd.value
    showAddWeekPopup.value = false
    newWeekRange.value = ''
    newWeekStart.value = ''
    newWeekEnd.value = ''
  }

  const newWeekCalendarWeeks = computed(() => getMonthWeeks(newWeekCalendarYear.value, newWeekCalendarMonth.value))

  return {
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
  }
}
