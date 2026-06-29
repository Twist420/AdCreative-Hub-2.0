<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  className: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const wrapperRef = ref(null)
const open = ref(false)

const selectedOption = computed(() => props.options.find((option) => option.value === props.modelValue))
const displayLabel = computed(() => selectedOption.value?.label || props.placeholder)

const choose = (value) => {
  emit('update:modelValue', value)
  open.value = false
}

const handlePointerDown = (event) => {
  if (!wrapperRef.value?.contains(event.target)) open.value = false
}

const handleKeyDown = (event) => {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', handlePointerDown)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handlePointerDown)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div ref="wrapperRef" :class="`relative ${className}`">
    <button
      type="button"
      :class="`flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white font-black shadow-3xs outline-none transition-all hover:border-indigo-200 hover:bg-slate-50 ${
        open ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
      } ${compact ? 'h-8 px-2 text-xs' : 'h-9 px-3 text-xs'} ${modelValue ? 'text-slate-800' : 'text-slate-400'}`"
      @click="open = !open"
    >
      <span class="min-w-0 truncate">{{ displayLabel }}</span>
      <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`" />
    </button>
    <div
      v-if="open"
      class="absolute left-0 top-[calc(100%+6px)] z-[90] max-h-64 min-w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl shadow-slate-200/80"
    >
      <button
        type="button"
        :class="`flex h-8 w-full items-center justify-between rounded-md px-3 text-left text-xs font-bold transition-colors ${
          modelValue === '' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`"
        @click="choose('')"
      >
        <span>{{ placeholder }}</span>
        <Check v-if="modelValue === ''" class="h-3.5 w-3.5" />
      </button>
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="`flex h-8 w-full items-center justify-between rounded-md px-3 text-left text-xs font-bold transition-colors ${
          option.value === modelValue ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`"
        @click="choose(option.value)"
      >
        <span class="min-w-0 truncate">{{ option.label }}</span>
        <Check v-if="option.value === modelValue" class="h-3.5 w-3.5 shrink-0" />
      </button>
    </div>
  </div>
</template>
