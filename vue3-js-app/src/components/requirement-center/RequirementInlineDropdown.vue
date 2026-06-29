<script setup>
import { ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps({
  menuKey: { type: String, required: true },
  value: { type: String, required: true },
  options: { type: Array, default: () => [] },
  triggerClass: { type: String, default: '' },
  panelClass: { type: String, default: 'w-36' },
  openMenuKey: { default: null },
})

const emit = defineEmits(['set-open-menu', 'select'])

const getSelectedLabel = () =>
  props.options.find((option) => option.value === props.value)?.label || props.value
</script>

<template>
  <div class="relative inline-flex justify-center">
    <button
      type="button"
      :class="`inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-3xs transition-all ${triggerClass}`"
      @click.stop="emit('set-open-menu', openMenuKey === menuKey ? null : menuKey)"
    >
      <span class="truncate">{{ getSelectedLabel() }}</span>
      <ChevronDown :class="`h-3 w-3 shrink-0 transition-transform ${openMenuKey === menuKey ? 'rotate-180' : ''}`" />
    </button>
    <div
      v-if="openMenuKey === menuKey"
      :class="`absolute left-1/2 top-full z-[160] mt-2 -translate-x-1/2 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/12 ${panelClass}`"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
          option.value === value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
        }`"
        @click.stop="
          emit('select', option.value);
          emit('set-open-menu', null)
        "
      >
        <span>{{ option.label }}</span>
        <Check v-if="option.value === value" class="h-3.5 w-3.5 shrink-0 stroke-[3] text-indigo-500" />
      </button>
    </div>
  </div>
</template>
