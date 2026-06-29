<script setup>
import RequirementDetailOverlay from './RequirementDetailOverlay.vue'

defineProps({
  requirement: { type: Object, default: null },
  schedule: { type: Object, default: null },
})

const emit = defineEmits(['close', 'delete', 'update'])
</script>

<template>
  <RequirementDetailOverlay
    v-if="requirement"
    :requirement="requirement"
    :schedule="schedule"
    @close="emit('close')"
    @delete="emit('delete', $event)"
    @update="emit('update', $event)"
  />
</template>
