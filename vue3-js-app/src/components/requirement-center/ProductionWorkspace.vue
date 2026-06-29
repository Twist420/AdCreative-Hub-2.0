<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ProductionCalendarView from './ProductionCalendarView.vue'
import ProductionCapacityView from './ProductionCapacityView.vue'
import ProductionGanttView from './ProductionGanttView.vue'
import ProductionRiskModal from './ProductionRiskModal.vue'
import ProductionScheduleHeader from './ProductionScheduleHeader.vue'
import { useProductionPlanning } from './useProductionPlanning'

const props = defineProps({
  requirements: {
    type: Array,
    default: () => [],
  },
  schedules: {
    type: Array,
    default: () => [],
  },
  todayDateString: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['open-requirement'])

const workspaceRootRef = ref(null)
const requirementsRef = computed(() => props.requirements)
const schedulesRef = computed(() => props.schedules)

const {
  productionView,
  selectedProducers,
  isProducerFilterOpen,
  showProductionRiskModal,
  calendarYear,
  calendarMonth,
  productionTasks,
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
} = useProductionPlanning({
  requirements: requirementsRef,
  schedules: schedulesRef,
  todayDateString: props.todayDateString,
})

const closeOpenMenus = () => {
  isProducerFilterOpen.value = false
}

const handleDocumentClick = (event) => {
  if (!workspaceRootRef.value?.contains(event.target)) closeOpenMenus()
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeOpenMenus()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div ref="workspaceRootRef" class="relative flex flex-1 flex-col gap-4 overflow-hidden">
    <ProductionScheduleHeader
      :production-view="productionView"
      :delayed-count="delayedProductionRiskItems.length"
      :selected-producers="selectedProducers"
      @production-view-change="productionView = $event"
      @open-risk-modal="showProductionRiskModal = true"
      @clear-selected-producers="selectedProducers = []"
    />

    <Teleport to="body">
      <ProductionRiskModal v-if="showProductionRiskModal" :items="delayedProductionRiskItems" @close="showProductionRiskModal = false" />
    </Teleport>

    <div class="flex-1 overflow-auto rounded-2xl border border-slate-150 bg-white p-4 shadow-3xs">
      <ProductionCapacityView
        v-if="productionView === 'capacity'"
        :groups="personnelCapacityGroups"
        @select-producer="
          selectedProducers = [$event];
          productionView = 'calendar'
        "
      />

      <ProductionCalendarView
        v-else-if="productionView === 'calendar'"
        :calendar-year="calendarYear"
        :calendar-month="calendarMonth"
        :calendar-weeks="productionCalendarWeeks"
        :production-tasks="productionTasks"
        :selected-producers="selectedProducers"
        :active-producers="activeProducers"
        :is-producer-filter-open="isProducerFilterOpen"
        @jump-today="jumpToday"
        @prev-month="handlePrevMonth"
        @next-month="handleNextMonth"
        @toggle-producer-filter="isProducerFilterOpen = !isProducerFilterOpen"
        @clear-producers="
          selectedProducers = [];
          isProducerFilterOpen = false
        "
        @toggle-producer="toggleProducer"
        @open-requirement="emit('open-requirement', $event)"
      />

      <ProductionGanttView
        v-else
        :gantt-start="productionGanttStart"
        :days="productionGanttDays"
        :rows="productionGanttRows"
        :selected-producers="selectedProducers"
        @select-producer="selectedProducers = [$event]"
        @open-requirement="emit('open-requirement', $event)"
      />
    </div>
  </div>
</template>
