<script setup>
import ScheduleCreateSelectorModal from './ScheduleCreateSelectorModal.vue'

defineProps({
  selectedCreateType: { type: String, default: 'Video' },
  schedules: { type: Array, default: () => [] },
  requirements: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-create-type', 'close', 'select-schedule', 'create-standalone'])
</script>

<template>
  <ScheduleCreateSelectorModal
    :selected-create-type="selectedCreateType"
    :schedules="schedules"
    :requirements="requirements"
    @select-create-type="emit('select-create-type', $event)"
    @close="emit('close')"
    @select-schedule="emit('select-schedule', $event)"
    @create-standalone="emit('create-standalone')"
  />
</template>
