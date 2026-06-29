<script setup>
import { Check, Copy, X } from 'lucide-vue-next'
import { getSubVersionFormatName, getSubVersionSizedFormatName } from './detailUtils'

defineProps({
  requirement: {
    type: Object,
    required: true,
  },
  subVersions: {
    type: Array,
    default: () => [],
  },
  previewDimensions: {
    type: Array,
    default: () => ['9:16'],
  },
  copiedText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'copy'])
</script>

<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200 sm:p-6 md:p-8">
    <div class="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[24px] border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
      <div class="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-lg shadow-sm">📁</div>
          <div>
            <h3 class="flex items-center gap-2 text-sm font-black text-slate-800">
              小版本名称列表
              <span class="rounded-lg border border-indigo-100/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">{{ subVersions.length }} 个版本</span>
            </h3>
            <p class="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">按版本和尺寸分别复制创意文件名</p>
          </div>
        </div>
        <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600" type="button" @click="emit('close')">
          <X class="h-4.5 w-4.5" />
        </button>
      </div>

      <div class="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-6">
        <div
          v-for="(subVersion, index) in subVersions"
          :key="`${subVersion.version}-${index}`"
          class="group relative flex flex-col gap-3 rounded-2xl border border-l-4 border-slate-150 border-l-slate-300 bg-slate-50 p-4 transition-all hover:border-indigo-150 hover:border-l-indigo-500 hover:bg-indigo-50/20"
        >
          <div class="min-w-0 pr-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-lg border border-indigo-100 bg-indigo-50/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-700">
                版本 {{ Number(subVersion.version) || subVersion.version }}
              </span>
              <span class="truncate text-[11px] font-black text-slate-600" :title="subVersion.name">{{ subVersion.name }}</span>
            </div>
            <div class="mt-2 cursor-text select-all break-all rounded-xl border border-slate-205 bg-white px-3 py-2 font-mono text-[10.5px] font-bold leading-relaxed text-slate-700 shadow-4xs transition-all group-hover:border-indigo-100" :title="getSubVersionFormatName(requirement, subVersion)">
              {{ getSubVersionFormatName(requirement, subVersion) }}
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="dimension in (previewDimensions.length ? previewDimensions : ['9:16'])"
              :key="`${subVersion.version}-${dimension}`"
              :class="`inline-flex h-8 min-w-[88px] cursor-pointer select-none items-center justify-center gap-1.5 rounded-xl border px-3 text-[10px] font-black shadow-3xs transition-all ${copiedText === getSubVersionSizedFormatName(requirement, subVersion, dimension) ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600' : 'border-slate-200 bg-white text-indigo-600 hover:border-indigo-100/50 hover:bg-slate-50 hover:text-indigo-700'}`"
              type="button"
              :title="getSubVersionSizedFormatName(requirement, subVersion, dimension)"
              @click="emit('copy', getSubVersionSizedFormatName(requirement, subVersion, dimension))"
            >
              <Check v-if="copiedText === getSubVersionSizedFormatName(requirement, subVersion, dimension)" class="h-3.5 w-3.5" />
              <Copy v-else class="h-3.5 w-3.5" />
              <span>{{ copiedText === getSubVersionSizedFormatName(requirement, subVersion, dimension) ? '已复制' : '复制' }} {{ String(dimension).includes(':') ? dimension : String(dimension).replace(/^(\d+)(\d{2})$/, '$1:$2') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
