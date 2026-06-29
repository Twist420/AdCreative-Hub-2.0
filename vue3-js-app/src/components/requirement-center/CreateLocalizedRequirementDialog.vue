<script setup>
import { CheckCircle, Search, XCircle } from 'lucide-vue-next'
import { localizationLanguages, formatCurrencyCompact } from './requirementUtils'

const props = defineProps({
  schedule: { type: Object, required: true },
  selectedLanguageCodes: { type: Array, default: () => [] },
  selectedSourceIds: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  candidates: { type: Array, default: () => [] },
  recentSpendMap: { type: Object, default: () => ({}) },
  disabledReason: { type: String, default: '' },
  submitDisabled: { type: Boolean, default: false },
})

const emit = defineEmits([
  'close',
  'search-change',
  'toggle-language',
  'toggle-source',
  'create-standard',
  'create-localized',
])

const getAssetTypeLabel = (assetType) => {
  if (assetType === 'Image') return '图片'
  if (assetType === 'Playable') return '试玩'
  return '视频'
}
</script>

<template>
  <div class="fixed inset-0 z-[115] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md animate-in fade-in duration-200">
    <div class="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
      <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-7 py-5">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-xl bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-700">本地化方向</span>
            <span class="rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">{{ getAssetTypeLabel(schedule.form) }}</span>
          </div>
          <h3 class="mt-2 truncate text-xl font-black text-slate-900">创建需求：{{ schedule.directionName }}</h3>
          <p class="mt-1 text-xs font-semibold text-slate-400">先选择本地化语言，再选择来源需求；确认后按语言生成本地化大版本。</p>
        </div>
        <button type="button" class="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700" @click="emit('close')">
          <XCircle class="h-8 w-8" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto bg-slate-50/60 p-6 no-scrollbar">
        <div class="space-y-4">
          <section class="rounded-3xl border border-slate-150 bg-white p-5 shadow-3xs">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 class="text-sm font-black text-slate-900">选择语言</h4>
                <p class="mt-1 text-[11px] font-semibold text-slate-400">同一批中，每个语言生成 1 条本地化大版本需求。</p>
              </div>
              <span class="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-600">已选 {{ selectedLanguageCodes.length }} 个</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="item in localizationLanguages"
                :key="item.code"
                type="button"
                :class="`rounded-xl border px-4 py-2 text-xs font-black transition-all ${
                  selectedLanguageCodes.includes(item.code)
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                }`"
                @click="emit('toggle-language', item.code)"
              >
                {{ item.label }}
              </button>
            </div>
          </section>

          <section class="flex min-h-[420px] flex-col rounded-3xl border border-slate-150 bg-white shadow-3xs">
            <div class="border-b border-slate-100 p-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 class="text-sm font-black text-slate-900">选择需求</h4>
                  <p class="mt-1 text-[11px] font-semibold text-slate-400">可多选，默认按最近 30 天花费倒序；支持搜索编号、名称和方向。</p>
                </div>
                <div class="relative w-full sm:w-80">
                  <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    :value="searchQuery"
                    placeholder="搜索来源需求..."
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs font-bold text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    @input="emit('search-change', $event.target.value)"
                  />
                </div>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto p-3 no-scrollbar">
              <div v-if="candidates.length === 0" class="flex h-full min-h-[240px] items-center justify-center text-center text-xs font-bold text-slate-400">
                暂无可作为本地化来源的需求
              </div>
              <div v-else class="grid grid-cols-1 gap-2 xl:grid-cols-2">
                <button
                  v-for="req in candidates"
                  :key="req.id"
                  type="button"
                  :class="`w-full rounded-2xl border p-3 text-left transition-all ${
                    selectedSourceIds.includes(req.id)
                      ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                      : 'border-slate-150 bg-white hover:border-indigo-200 hover:bg-slate-50'
                  }`"
                  @click="emit('toggle-source', req.id)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="font-mono text-xs font-black text-slate-900">{{ req.id }}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">{{ String(req.language || 'en').toUpperCase() }}</span>
                        <span :class="`rounded-full px-2 py-0.5 text-[9px] font-black ${req.assetType === 'Image' ? 'bg-amber-50 text-amber-700' : req.assetType === 'Playable' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`">
                          {{ getAssetTypeLabel(req.assetType) }}
                        </span>
                        <CheckCircle v-if="selectedSourceIds.includes(req.id)" class="h-4 w-4 text-indigo-600" />
                      </div>
                      <div class="mt-1 truncate text-xs font-black text-slate-700">{{ req.name }}</div>
                      <div class="mt-1 truncate text-[10px] font-bold text-slate-400">{{ req.direction || req.broadDirection || '-' }}</div>
                    </div>
                    <div class="shrink-0 text-right">
                      <div class="text-[9px] font-black text-slate-400">近 30 天花费</div>
                      <div class="mt-1 font-mono text-xs font-black text-emerald-600">{{ formatCurrencyCompact(recentSpendMap[req.id] || 0) }}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <div v-if="disabledReason" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-black text-rose-600">
            {{ disabledReason }}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/80 px-7 py-4">
        <p class="text-[10px] font-bold text-slate-400">命名规则：创建日期 + 语言本地化 + 原始需求编号；本地化需求编号从 8000 开始。</p>
        <div class="flex items-center gap-2">
          <button type="button" class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-600 transition-all hover:border-indigo-200 hover:text-indigo-600" @click="emit('create-standard')">
            创建全新需求
          </button>
          <button
            type="button"
            :disabled="submitDisabled"
            :class="`rounded-xl px-6 py-2.5 text-xs font-black text-white shadow-lg transition-all ${submitDisabled ? 'bg-slate-300 shadow-none' : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-slate-950'}`"
            @click="emit('create-localized')"
          >
            确认创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
