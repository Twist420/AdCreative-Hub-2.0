<script setup>
import { Check, Edit2, X } from 'lucide-vue-next'

defineProps({
  node: {
    type: Object,
    required: true,
  },
  editingId: {
    type: String,
    default: null,
  },
  tempName: {
    type: String,
    default: '',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['start-edit', 'update-temp', 'save', 'cancel'])
</script>

<template>
  <div v-if="editingId === node.id" class="z-50 flex items-center gap-1 rounded bg-white p-0.5 shadow-lg ring-1 ring-primary">
    <input
      :value="tempName"
      class="w-24 rounded border-none bg-slate-50 px-1 py-0.5 text-[10px] font-bold outline-none"
      type="text"
      @input="$emit('update-temp', $event.target.value)"
      @keydown.enter="$emit('save')"
      @keydown.esc="$emit('cancel')"
    />
    <button class="rounded p-0.5 text-emerald-500 hover:bg-emerald-50" type="button" @click="$emit('save')">
      <Check class="h-3 w-3" />
    </button>
    <button class="rounded p-0.5 text-rose-400 hover:bg-rose-50" type="button" @click="$emit('cancel')">
      <X class="h-3 w-3" />
    </button>
  </div>
  <div v-else class="group/name flex min-w-0 items-center gap-1">
    <span
      :class="compact ? 'max-w-[120px] truncate text-[10px] font-black' : node.level === 1 ? 'text-sm font-black text-slate-900' : 'text-[12px] font-black text-slate-800'"
      class="cursor-text select-none transition-colors group-hover/name:text-primary"
      @dblclick="$emit('start-edit', node)"
    >
      {{ node.name }}
    </span>
    <button class="opacity-0 transition-opacity group-hover/name:opacity-100" type="button" @click="$emit('start-edit', node)">
      <Edit2 class="h-3 w-3 text-slate-350" />
    </button>
  </div>
</template>
