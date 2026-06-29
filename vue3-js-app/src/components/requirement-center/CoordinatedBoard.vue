<script setup>
import ScheduleBoard from './ScheduleBoard.vue'

defineProps({
  schedules: { type: Array, default: () => [] },
  editingScheduleId: { default: null },
  todayDateString: { type: String, required: true },
  getScheduleRequirements: { type: Function, required: true },
  getScheduleInsight: { type: Function, required: true },
  showInstantTooltip: { type: Function, default: null },
})

const emit = defineEmits([
  'open-detail',
  'open-requirement',
  'edit',
  'save',
  'delete',
  'add-requirement',
  'update-schedule',
  'add-schedule',
  'clear-instant-tooltip',
])
</script>

<template>
  <ScheduleBoard
    :schedules="schedules"
    :editing-schedule-id="editingScheduleId"
    :today-date-string="todayDateString"
    :get-schedule-requirements="getScheduleRequirements"
    :get-schedule-insight="getScheduleInsight"
    :show-instant-tooltip="showInstantTooltip"
    @open-detail="emit('open-detail', $event)"
    @open-requirement="emit('open-requirement', $event)"
    @edit="emit('edit', $event)"
    @save="emit('save')"
    @delete="emit('delete', $event)"
    @add-requirement="emit('add-requirement', $event)"
    @update-schedule="(id, updates) => emit('update-schedule', id, updates)"
    @add-schedule="emit('add-schedule')"
    @clear-instant-tooltip="emit('clear-instant-tooltip')"
  />
</template>
