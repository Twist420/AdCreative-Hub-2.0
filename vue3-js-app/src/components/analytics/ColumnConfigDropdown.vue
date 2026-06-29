<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, GripVertical, X } from 'lucide-vue-next'

const props = defineProps({
  columns: { type: Array, required: true },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'toggle', 'drag'])
const rootRef = ref(null)
const draggingIndex = ref(null)
const dragOverIndex = ref(null)

const handlePointerDown = (event) => {
  if (!props.open) return
  if (event.target?.closest?.('[data-column-config-trigger="true"]')) return
  if (!rootRef.value?.contains(event.target)) emit('close')
}

const handleKeyDown = (event) => {
  if (event.key === 'Escape') emit('close')
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
  <div
    v-if="open"
    ref="rootRef"
    class="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80"
  >
    <div class="flex items-center justify-between border-b border-slate-100 px-3 py-2">
      <span class="text-xs font-black text-slate-700">字段配置</span>
      <button type="button" class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="emit('close')">
        <X class="h-3.5 w-3.5" />
      </button>
    </div>
    <div class="max-h-80 overflow-y-auto p-1.5">
      <div
        v-for="(column, index) in columns"
        :key="column.id"
        draggable="true"
        :class="`flex h-9 cursor-grab items-center gap-2 rounded-lg px-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 active:cursor-grabbing ${
          draggingIndex === index ? 'scale-[0.98] bg-indigo-50 text-indigo-700 opacity-70 shadow-sm' : ''
        } ${dragOverIndex === index && draggingIndex !== index ? 'translate-y-0.5 bg-slate-100 ring-2 ring-indigo-100' : ''}`"
        @dragstart="draggingIndex = index"
        @dragend="
          draggingIndex = null;
          dragOverIndex = null
        "
        @dragover.prevent="dragOverIndex = index"
        @dragleave="dragOverIndex === index && (dragOverIndex = null)"
        @drop="
          draggingIndex !== null && draggingIndex !== index && emit('drag', draggingIndex, index);
          draggingIndex = null;
          dragOverIndex = null
        "
      >
        <GripVertical class="h-3.5 w-3.5 shrink-0 text-slate-300" />
        <button
          type="button"
          :class="`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            column.visible ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white'
          }`"
          @click="emit('toggle', column.id)"
        >
          <Check v-if="column.visible" class="h-3 w-3" />
        </button>
        <span class="min-w-0 flex-1 truncate">{{ column.name }}</span>
      </div>
    </div>
  </div>
</template>
