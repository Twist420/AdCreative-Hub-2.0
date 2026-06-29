<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { getOptionById, getReferenceSource } from './scriptWorkbenchData'

const props = defineProps({
  assetIds: {
    type: Array,
    default: () => [],
  },
  attachments: {
    type: Array,
    default: () => [],
  },
  compact: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['pick-assets', 'pick-finished', 'upload-reference', 'remove-asset', 'toggle-attachment'])

const uniqueAssetIds = computed(() => Array.from(new Set(props.assetIds)))
const references = computed(() => [
  ...uniqueAssetIds.value.map((id) => ({ id, source: getReferenceSource(id), option: getOptionById(id) })),
  ...props.attachments.map((id) => ({ id, source: '附件', option: null })),
])
const visibleReferences = computed(() => (props.compact ? references.value.slice(0, 6) : references.value))
const hiddenCount = computed(() => Math.max(0, references.value.length - visibleReferences.value.length))

const getSourceClass = (source) => (source === '成片' ? 'text-emerald-600' : source === '附件' ? 'text-rose-600' : 'text-indigo-600')
</script>

<template>
  <div
    v-if="disabled"
    :class="`flex items-center justify-center border border-dashed border-slate-200 bg-[repeating-linear-gradient(135deg,#fafafa_0,#fafafa_8px,#f5f5f5_8px,#f5f5f5_16px)] text-sm font-black text-slate-300 ${compact ? 'min-h-[150px]' : 'min-h-[240px]'}`"
  >
    不加A段
  </div>

  <div v-else :class="`flex flex-col overflow-hidden rounded-xl border border-dashed border-sky-200 bg-white ${compact ? 'min-h-[168px]' : 'h-full min-h-[260px]'}`">
    <div class="flex items-center justify-between gap-2 px-3 pt-3">
      <label v-if="!hideLabel" class="block text-[9px] font-black uppercase tracking-widest text-slate-500">需求参考</label>
      <span v-else />
      <span class="rounded-xl bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-400">{{ references.length }} 项</span>
    </div>

    <div :class="`flex flex-1 px-3 py-3 ${references.length > 0 ? 'items-start' : 'items-center justify-center'}`">
      <div v-if="references.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="(item, index) in visibleReferences"
          :key="`${item.source}-${item.id}`"
          class="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-3xs"
        >
          <img
            :src="item.option?.previewUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=360&h=360&fit=crop'"
            :alt="item.option?.name || item.id"
            class="h-full w-full object-cover"
            referrerpolicy="no-referrer"
          />
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-1.5 pb-1.5 pt-5">
            <p class="truncate text-[8px] font-black text-white">{{ item.option?.name || item.id }}</p>
          </div>
          <span class="absolute bottom-1 right-1 rounded-md bg-rose-400 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">
            参考{{ index + 1 }}
          </span>
          <span :class="`absolute left-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[8px] font-black shadow-sm ${getSourceClass(item.source)}`">
            {{ item.source }}
          </span>
          <button
            class="absolute right-1 top-1 rounded-full bg-white p-1 text-slate-300 opacity-0 shadow-sm transition-all hover:text-rose-500 group-hover:opacity-100"
            type="button"
            @click="item.source === '附件' ? $emit('toggle-attachment', item.id) : $emit('remove-asset', item.id)"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
        <div v-if="hiddenCount > 0" class="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-indigo-100 bg-indigo-50/40 text-[10px] font-black text-indigo-500">
          +{{ hiddenCount }}
        </div>
      </div>

      <div v-else class="text-center">
        <p :class="`${compact ? 'text-[11px]' : 'text-sm'} font-black text-slate-300`">拖拽/粘贴上传</p>
        <p class="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-200">Segment Preview</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50/80 p-3">
      <button class="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 hover:border-slate-300 hover:bg-slate-50" type="button" @click="$emit('upload-reference')">
        上传
      </button>
      <button class="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] font-black text-indigo-600 hover:bg-indigo-100" type="button" @click="$emit('pick-assets')">
        引用资产库
      </button>
      <button class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-600 hover:bg-emerald-100" type="button" @click="$emit('pick-finished')">
        引用成片
      </button>
    </div>
  </div>
</template>
