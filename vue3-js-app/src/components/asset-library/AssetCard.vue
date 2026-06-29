<script setup>
import { ArrowUpRight, Check, FileText, History, Play, PlayCircle, RefreshCw, X } from 'lucide-vue-next'
import { getAssetUsageSlots } from './assetLibraryData'

const props = defineProps({
  item: { type: Object, required: true },
  viewMode: { type: String, default: 'grid' },
  playing: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['open', 'toggle-play', 'toggle-select', 'create-iteration'])

const statusMeta = {
  Recommended: ['推荐', 'bg-emerald-50 text-emerald-600 border-emerald-100'],
  'Not Recommended': ['不推荐', 'bg-rose-50 text-rose-600 border-rose-100'],
  Disabled: ['停用', 'bg-slate-50 text-slate-400 border-slate-100'],
  'Insufficient Data': ['数据不足', 'bg-amber-50 text-amber-600 border-amber-100'],
}

const usageSlots = () => getAssetUsageSlots(props.item).slice(0, 3)
const statusLabel = () => statusMeta[props.item.status]?.[0] || props.item.status || '数据不足'
const statusClassName = () => statusMeta[props.item.status]?.[1] || statusMeta['Insufficient Data'][1]
const isVideoLike = () => props.item.sourceFileUrl?.endsWith('.mp4') || props.item.sourceFileUrl?.endsWith('.mov') || props.item.duration
</script>

<template>
  <article
    v-if="viewMode === 'grid'"
    class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-100 bg-white font-sans transition-all hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40"
    @click="emit('open', item)"
  >
    <div class="relative aspect-square overflow-hidden bg-slate-900">
      <div v-if="playing" class="absolute inset-0 z-30 flex items-center justify-center bg-black">
        <video
          :src="item.sourceFileUrl"
          controls
          autoplay
          class="h-full w-full object-contain"
          @click.stop
          @ended.stop="emit('toggle-play', item.id)"
        />
        <button
          class="absolute right-1.5 top-1.5 z-40 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/80 text-xs text-white shadow-lg backdrop-blur-md hover:bg-slate-900"
          title="关闭预览"
          type="button"
          @click.stop="emit('toggle-play', item.id)"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <template v-else>
        <button
          :class="`absolute right-1.5 top-1.5 z-20 transition-all duration-200 ${selected ? 'scale-100 opacity-100' : 'scale-95 opacity-0 group-hover:opacity-100'}`"
          type="button"
          @click.stop="emit('toggle-select', item.id)"
        >
          <span
            :class="`flex h-5 w-5 items-center justify-center rounded-md border text-white shadow-sm transition-all ${
              selected
                ? 'border-indigo-600 bg-indigo-600'
                : 'border-slate-350 bg-white/95 text-transparent backdrop-blur-sm hover:bg-white active:scale-95'
            }`"
          >
            <Check v-if="selected" class="h-3.5 w-3.5 stroke-[3.5]" />
          </span>
        </button>

        <img :src="item.previewUrl" :alt="item.name" class="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105" referrerpolicy="no-referrer" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        <div class="absolute left-1.5 top-1.5 flex gap-1">
          <span :class="`rounded border px-1.5 py-0.5 text-[7.5px] font-black backdrop-blur-md ${statusClassName()}`">
            {{ statusLabel() }}
          </span>
        </div>

        <button
          v-if="isVideoLike()"
          class="absolute inset-0 z-10 flex items-center justify-center bg-black/5 transition-all group-hover:bg-black/30"
          title="点击在卡片内直接预览播放"
          type="button"
          @click.stop="emit('toggle-play', item.id)"
        >
          <span class="flex h-9 w-9 scale-90 items-center justify-center rounded-full bg-indigo-600/90 text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 hover:bg-indigo-500 active:scale-95">
            <Play class="ml-0.5 h-4 w-4 fill-current" />
          </span>
        </button>

        <div class="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
          <div class="flex items-center gap-1 rounded bg-slate-900/45 px-1.5 py-0.5 text-[8px] font-black text-white/95 backdrop-blur-sm">
            <PlayCircle class="h-3 w-3 text-indigo-400" />
            <span>{{ item.duration || '视频' }}</span>
          </div>
          <div class="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
            <ArrowUpRight class="h-2.5 w-2.5" />
          </div>
        </div>
      </template>
    </div>

    <div class="flex flex-1 flex-col gap-1.5 bg-slate-50/20 p-2 text-left">
      <div class="space-y-0.5 font-sans">
        <p class="font-mono text-[7.5px] font-black uppercase leading-none tracking-widest text-slate-400">
          {{ item.subType }}
        </p>
        <h4 class="line-clamp-1 text-[10px] font-black leading-tight text-slate-800 transition-colors group-hover:text-slate-900">
          {{ item.name }}
        </h4>
      </div>

      <div class="flex flex-wrap gap-1">
        <span v-for="slot in usageSlots()" :key="slot" class="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[7px] font-black leading-none text-indigo-600">
          {{ slot }}
        </span>
      </div>

      <div class="flex flex-wrap gap-0.5">
        <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="rounded border border-slate-100/60 bg-white px-1 py-0.5 text-[7px] font-bold leading-none text-slate-500">
          #{{ tag }}
        </span>
        <span v-if="item.tags.length > 2" class="text-[7px] font-bold leading-none text-slate-400">+{{ item.tags.length - 2 }}</span>
      </div>

      <div class="mt-auto flex items-center justify-between border-t border-slate-150/40 pt-1.5 text-[8px]">
        <div class="flex items-center gap-0.5 font-bold text-slate-400">
          <History class="h-2.5 w-2.5" />
          <span>引用 {{ item.citationCount }}次</span>
        </div>
        <button
          class="inline-flex items-center gap-0.5 rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[7.5px] font-black text-indigo-650 opacity-0 transition-all hover:border-indigo-200 hover:bg-indigo-100 group-hover:opacity-100"
          title="从该资产创建迭代资产"
          type="button"
          @click.stop="emit('create-iteration', item)"
        >
          <RefreshCw class="h-2.5 w-2.5" />
          迭代
        </button>
      </div>
    </div>
  </article>

  <article v-else :class="`grid grid-cols-[32px_84px_minmax(0,1.7fr)_1fr_120px_96px] items-center gap-4 rounded-2xl border bg-white p-3 shadow-3xs transition-all hover:border-slate-300 hover:shadow-lg ${selected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-150'}`">
    <button
      type="button"
      :class="`flex h-5 w-5 items-center justify-center rounded border text-[10px] font-black ${selected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-500'}`"
      @click="emit('toggle-select', item.id)"
    >
      ✓
    </button>
    <button class="relative h-16 overflow-hidden rounded-xl bg-slate-900" type="button" title="点击在卡片内直接预览播放" @click="emit('toggle-play', item.id)">
      <img :src="item.previewUrl" :alt="item.name" class="h-full w-full object-cover opacity-85" />
      <span class="absolute inset-0 flex items-center justify-center bg-black/15 text-white">
        <Play class="h-4 w-4 fill-current" />
      </span>
    </button>
    <button class="min-w-0 text-left" type="button" @click="emit('open', item)">
      <div class="truncate text-sm font-black text-slate-900">{{ item.name }}</div>
      <div class="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-400">
        <FileText class="h-3 w-3" />
        <span class="truncate">{{ item.id }} · {{ item.subType }}</span>
      </div>
    </button>
    <div class="flex min-w-0 flex-wrap gap-1.5">
      <span v-for="slot in usageSlots" :key="slot" class="rounded-lg bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-600">
        {{ slot }}
      </span>
      <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500">
        {{ tag }}
      </span>
    </div>
    <div class="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
      <span class="inline-flex items-center gap-1"><History class="h-3 w-3" />{{ item.citationCount }}次</span>
      <span class="inline-flex items-center gap-1"><PlayCircle class="h-3 w-3" />{{ item.duration || '视频' }}</span>
      <span class="inline-flex items-center gap-1"><RefreshCw class="h-3 w-3" />{{ item.tags.length }}</span>
      <span class="inline-flex items-center gap-1"><ArrowUpRight class="h-3 w-3" />详情</span>
    </div>
    <div class="flex justify-end">
      <span :class="`rounded-xl border px-2.5 py-1.5 text-[10px] font-black ${statusMeta[item.status]?.[1] || statusMeta['Insufficient Data'][1]}`">
        {{ statusMeta[item.status]?.[0] || item.status }}
      </span>
      <button
        type="button"
        class="ml-2 rounded-xl border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-black text-indigo-600 hover:bg-indigo-100"
        title="从该资产创建迭代资产"
        @click="emit('create-iteration', item)"
      >
        迭代
      </button>
    </div>
  </article>
</template>
