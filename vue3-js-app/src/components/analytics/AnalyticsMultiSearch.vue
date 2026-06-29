<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown, Search, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  searchValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '搜索' },
  className: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:searchValue'])
const wrapperRef = ref(null)
const open = ref(false)

const selectedCount = computed(() => props.modelValue.length)
const displayText = computed(() => (selectedCount.value > 0 ? `${props.placeholder} · ${selectedCount.value}` : props.searchValue || props.placeholder))
const visibleOptions = computed(() => props.options.filter((option) => option.label.toLowerCase().includes(props.searchValue.toLowerCase())))

const toggleValue = (value) => {
  const current = props.modelValue
  emit('update:modelValue', current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
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
  <div ref="wrapperRef" :class="`relative min-w-[190px] ${className}`">
    <button
      type="button"
      :class="`flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold shadow-3xs outline-none transition-all hover:border-indigo-200 hover:bg-slate-50 ${
        open ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
      } ${selectedCount || searchValue ? 'text-slate-800' : 'text-slate-400'}`"
      @click="open = !open"
    >
      <Search class="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span class="min-w-0 flex-1 truncate text-left">{{ displayText }}</span>
      <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`" />
    </button>

    <div v-if="open" class="absolute left-0 top-[calc(100%+6px)] z-[90] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
      <div class="border-b border-slate-100 p-2">
        <div class="relative min-w-0">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            :value="searchValue"
            :placeholder="placeholder"
            class="h-9 w-full rounded-lg border border-slate-200 bg-white py-0 pl-9 pr-8 text-xs font-bold text-slate-800 shadow-3xs outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            @input="emit('update:searchValue', $event.target.value)"
          />
          <button
            v-if="searchValue"
            type="button"
            class="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            @click="emit('update:searchValue', '')"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div class="max-h-56 overflow-y-auto p-1">
        <button
          v-for="option in visibleOptions"
          :key="option.value"
          type="button"
          :class="`flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-bold transition-colors ${
            modelValue.includes(option.value) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`"
          @click="toggleValue(option.value)"
        >
          <span :class="`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${modelValue.includes(option.value) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white'}`">
            <Check v-if="modelValue.includes(option.value)" class="h-3 w-3" />
          </span>
          <span class="min-w-0 truncate">{{ option.label }}</span>
        </button>
        <div v-if="visibleOptions.length === 0" class="px-3 py-4 text-center text-xs font-bold text-slate-400">没有匹配项</div>
      </div>
    </div>
  </div>
</template>
