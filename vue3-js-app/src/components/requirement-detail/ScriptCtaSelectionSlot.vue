<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { getOptionById } from './scriptWorkbenchData'

const props = defineProps({
  selected: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['pick', 'clear', 'update:description'])

const selectedItem = computed(() => (props.selected ? getOptionById(props.selected) : null))
</script>

<template>
  <div class="space-y-2">
    <div class="flex min-h-[168px] flex-col rounded-xl border border-dashed border-sky-200 bg-white p-3">
      <div class="flex items-center justify-between gap-2">
        <label v-if="!hideLabel" class="block text-[9px] font-black uppercase tracking-widest text-slate-500">CTA / 落版</label>
        <span v-else />
        <button class="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-600 hover:bg-indigo-100" type="button" @click="$emit('pick')">
          {{ selectedItem ? '更换' : '选择' }}
        </button>
      </div>

      <div v-if="selectedItem" class="group mt-3 flex flex-1 items-center gap-3">
        <img :src="selectedItem.previewUrl" :alt="selectedItem.name" class="h-12 w-10 shrink-0 rounded-lg object-cover shadow-3xs" referrerpolicy="no-referrer" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[11px] font-black text-slate-800">{{ selectedItem.name }}</p>
          <p class="mt-1 text-[9px] font-bold text-slate-400">{{ selectedItem.type }} / {{ selectedItem.duration }}</p>
        </div>
        <button class="rounded-full p-1 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500" type="button" @click="$emit('clear')">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <div v-else class="flex flex-1 items-center text-[10px] font-black text-slate-300">
        未选择落版
      </div>
    </div>

    <textarea
      :value="description"
      class="h-16 w-full resize-none rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-slate-700 outline-none focus:border-indigo-300 focus:bg-white"
      placeholder="补充 CTA / 落版要求..."
      @input="$emit('update:description', $event.target.value)"
    />
  </div>
</template>
