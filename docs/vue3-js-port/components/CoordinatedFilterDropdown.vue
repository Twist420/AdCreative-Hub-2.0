<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '全部',
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)

const displayText = computed(() => {
  const found = props.options.find((option) => option.value === props.modelValue)
  return found?.label || props.modelValue || '全部'
})

const isActive = computed(() => props.modelValue && props.modelValue !== '全部')

const selectOption = (value) => {
  emit('update:modelValue', value)
  open.value = false
}
</script>

<template>
  <div class="ad-filter-dropdown">
    <button
      type="button"
      class="ad-filter-trigger"
      :class="{ 'is-active': isActive }"
      @click="open = !open"
    >
      <span class="ad-filter-label">{{ label }}</span>
      <span class="ad-filter-value">{{ displayText }}</span>
      <span class="ad-filter-chevron" :class="{ 'is-open': open }" aria-hidden="true" />
    </button>

    <div v-if="open" class="ad-filter-panel">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="ad-filter-option"
        :class="{ 'is-selected': option.value === modelValue }"
        @click="selectOption(option.value)"
      >
        <span>{{ option.label }}</span>
        <span v-if="option.value === modelValue" class="ad-filter-check">✓</span>
      </button>
    </div>
  </div>
</template>
