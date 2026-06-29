<script setup>
import { computed, ref, watch } from 'vue'
import {
  BarChart2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  Layout as LayoutIcon,
  Link as LinkIcon,
  PlayCircle,
  RefreshCw,
  Search,
  Tag,
  X,
} from 'lucide-vue-next'
import AnalyticsSelect from './analytics/AnalyticsSelect.vue'
import { getAssetUsageSlots, getEffectivePerformance, getMockCreatives } from './asset-library/assetLibraryData'

const props = defineProps({
  selectedDetailItem: { type: Object, default: null },
  availableAssets: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'save', 'create-iteration'])

const isEditMode = ref(false)
const detailTab = ref('overview')
const selectedRatio = ref('9:16')
const form = ref({})
const newTagInput = ref('')
const newRequirementInput = ref('')
const relationPickerMode = ref(null)
const relationPickerPath = ref([])
const relationPickerSearch = ref('')
const relationPickerExpanded = ref({ 片段: true, 组件: true })

const typeOptions = [
  { value: 'Fragment', label: '片段' },
  { value: 'Component', label: '组件' },
]
const statusOptions = [
  { value: 'Insufficient Data', label: '数据不足' },
  { value: 'Recommended', label: '推荐' },
  { value: 'Not Recommended', label: '不推荐' },
  { value: 'Disabled', label: '停用' },
]
const ratioOptions = ['9:16', '1:1', '16:9', '4:5']
const quickTags = ['仙子', '冰雪', '奖励', '消除', '惊艳', '搞笑', '萌妹', '真机实测']

const statusMeta = {
  Recommended: ['推荐', 'border-emerald-250 bg-emerald-55/70 text-emerald-700', 'bg-emerald-500 animate-pulse'],
  'Not Recommended': ['不推荐', 'border-amber-250 bg-amber-55/70 text-amber-700', 'bg-amber-500'],
  Disabled: ['已停用', 'border-rose-250 bg-rose-55/70 text-rose-700', 'bg-rose-500'],
  'Insufficient Data': ['数据不足', 'border-slate-200 bg-slate-50/70 text-slate-600', 'bg-slate-400'],
}

watch(
  () => props.selectedDetailItem,
  (item) => {
    if (!item) return
    form.value = {
      ...item,
      id: item.id || 'hook-ai-01-v1',
      name: item.name || '',
      type: item.type || 'Fragment',
      subType: item.subType || '',
      theme: item.theme || '魔幻/冰雪',
      tags: [...(item.tags || [])],
      status: item.status || 'Insufficient Data',
      duration: item.duration || '00:05',
      sourceFileUrl: item.sourceFileUrl || '',
      parentComponent: item.parentComponent || '剧情片段-02',
      relatedAssets: item.relatedAssets || ['material-ai-bg-01', 'material-voice-05'],
      relatedRequirements: item.relatedRequirements || ['cp4116-10', 'cp4116-09', 'cp4116-08', 'cp4116-07'],
      relatedComponents: item.relatedComponents || ['comp-login-panel', 'comp-particle-emitter'],
      parentAssetId: item.parentAssetId || '',
      referencedAssetIds: item.referencedAssetIds || item.relatedAssets || [],
      citationCount: item.citationCount || 0,
      createdAt: item.createdAt || '2026-05-18 14:20',
    }
    isEditMode.value = false
    detailTab.value = 'overview'
    selectedRatio.value = '9:16'
    newTagInput.value = ''
    newRequirementInput.value = ''
  },
  { immediate: true },
)

const performance = computed(() => (props.selectedDetailItem ? getEffectivePerformance({ ...props.selectedDetailItem, ...form.value }) : []))
const creatives = computed(() => (props.selectedDetailItem ? getMockCreatives({ ...props.selectedDetailItem, ...form.value }) : []))
const usageSlots = computed(() => (props.selectedDetailItem ? getAssetUsageSlots({ ...props.selectedDetailItem, ...form.value }) : []))
const status = computed(() => statusMeta[form.value.status] || statusMeta['Insufficient Data'])
const previewRatioClass = computed(() => {
  if (selectedRatio.value === '1:1') return 'aspect-square max-h-[500px]'
  if (selectedRatio.value === '16:9') return 'aspect-video'
  if (selectedRatio.value === '4:5') return 'aspect-[4/5] max-h-[500px]'
  return 'aspect-[9/16] max-h-[500px]'
})
const requirementRows = computed(() => (form.value.relatedRequirements || []).map((requirementId, index) => ({
  requirementId,
  title: ['新烧树（花园）+奖励大字报（老）', '冰雪仙子神秘空投', '玩法段-塔防合成升级展示', '真人前贴-爆奖反应'][index % 4],
  launchDate: ['2026-05-11', '2026-05-18', '2026-05-26'][index % 3],
  daysRunning: 5 + index * 3,
})))
const stableHash = (value) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) % 100000
  return hash
}
const getRelationMetrics = (requirementId, index, totalRows) => {
  const totalSpent = performance.value.reduce((sum, item) => sum + (item.spent || 0), 0)
  const totalImpressions = performance.value.reduce((sum, item) => {
    if (!item.spent || !item.cpm) return sum
    return sum + (item.spent / item.cpm) * 1000
  }, 0)
  const safeRowCount = Math.max(totalRows, 1)
  const hash = stableHash(`${requirementId}-${index}`)
  const share = (0.82 + (hash % 36) / 100) / safeRowCount
  const spent = Math.round(totalSpent * share)
  const avgCpm = totalSpent > 0 && totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 18
  const impressions = avgCpm > 0 ? (spent / avgCpm) * 1000 : 0
  const ctr = 0.02 + (hash % 21) / 1000
  return { spent, clicks: Math.round(impressions * ctr), ctr }
}
const requirementPerformanceRows = computed(() =>
  requirementRows.value.map((row, index) => ({
    ...row,
    ...getRelationMetrics(row.requirementId, index, Math.max(requirementRows.value.length, 1)),
  })),
)
const requirementPerformanceSummary = computed(() => {
  const spent = requirementPerformanceRows.value.reduce((sum, row) => sum + row.spent, 0)
  const clicks = requirementPerformanceRows.value.reduce((sum, row) => sum + row.clicks, 0)
  const ctr = spent > 0
    ? requirementPerformanceRows.value.reduce((sum, row) => sum + row.ctr * row.spent, 0) / spent
    : 0
  return { spent, clicks, ctr }
})
const selectableAssets = computed(() =>
  props.availableAssets.filter((asset) => asset.id !== form.value.id),
)
const assetPath = (asset) => [
  asset.type === 'Component' ? '组件' : '片段',
  asset.subType || '未分类',
]
const buildRelationTree = (assets) => {
  const roots = []
  assets.forEach((asset) => {
    let level = roots
    assetPath(asset).forEach((segment, index, path) => {
      const nextPath = path.slice(0, index + 1)
      let node = level.find((item) => item.name === segment)
      if (!node) {
        node = { name: segment, path: nextPath, children: [] }
        level.push(node)
      }
      level = node.children
    })
  })
  return roots
}
const relationTree = computed(() => buildRelationTree(selectableAssets.value))
const selectedParentAsset = computed(() =>
  selectableAssets.value.find((asset) => asset.id === form.value.parentAssetId),
)
const selectedReferenceAssets = computed(() =>
  (form.value.referencedAssetIds || [])
    .map((assetId) => selectableAssets.value.find((asset) => asset.id === assetId))
    .filter(Boolean),
)
const assetInPickerPath = (asset, targetPath) => {
  if (!targetPath.length) return true
  const currentPath = assetPath(asset)
  if (currentPath.length < targetPath.length) return false
  return targetPath.every((segment, index) => currentPath[index] === segment)
}
const relationPickerAssets = computed(() => {
  const query = relationPickerSearch.value.trim().toLowerCase()
  return selectableAssets.value.filter((asset) => {
    if (!assetInPickerPath(asset, relationPickerPath.value)) return false
    if (!query) return true
    return [
      asset.id,
      asset.name,
      asset.subType,
      asset.type,
      ...(asset.tags || []),
      assetPath(asset).join('/'),
    ].join(' ').toLowerCase().includes(query)
  })
})
const relationPickerTitle = computed(() => {
  if (relationPickerMode.value === 'parent') return '选择父资产'
  if (relationPickerMode.value === 'reference') return '添加引用资产'
  return ''
})

const addTag = () => {
  const value = newTagInput.value.trim()
  if (!value || form.value.tags.includes(value)) return
  form.value.tags = [...form.value.tags, value]
  newTagInput.value = ''
}

const addQuickTag = (tag) => {
  if (form.value.tags.includes(tag)) return
  form.value.tags = [...form.value.tags, tag]
}

const removeTag = (tag) => {
  form.value.tags = form.value.tags.filter((item) => item !== tag)
}

const addRequirement = () => {
  const value = newRequirementInput.value.trim()
  if (!value || form.value.relatedRequirements.includes(value)) return
  form.value.relatedRequirements = [...form.value.relatedRequirements, value]
  newRequirementInput.value = ''
}

const removeRequirement = (requirementId) => {
  form.value.relatedRequirements = form.value.relatedRequirements.filter((item) => item !== requirementId)
}

const openRelationPicker = (mode) => {
  relationPickerMode.value = mode
  relationPickerSearch.value = ''
  relationPickerPath.value = []
}

const selectRelationPath = (path) => {
  relationPickerPath.value = [...path]
}

const toggleRelationNode = (path) => {
  const key = path.join('/')
  relationPickerExpanded.value = {
    ...relationPickerExpanded.value,
    [key]: !relationPickerExpanded.value[key],
  }
}

const selectRelationAsset = (asset) => {
  if (relationPickerMode.value === 'parent') {
    form.value.parentAssetId = asset.id
    relationPickerMode.value = null
    return
  }

  const selectedIds = form.value.referencedAssetIds || []
  form.value.referencedAssetIds = selectedIds.includes(asset.id)
    ? selectedIds.filter((assetId) => assetId !== asset.id)
    : [...selectedIds, asset.id]
}

const clearParentAsset = () => {
  form.value.parentAssetId = ''
}

const removeReferenceAsset = (assetId) => {
  form.value.referencedAssetIds = (form.value.referencedAssetIds || []).filter((item) => item !== assetId)
}

const save = () => {
  emit('save', {
    ...props.selectedDetailItem,
    ...form.value,
    id: String(form.value.id || '').trim(),
    name: String(form.value.name || '').trim(),
    subType: String(form.value.subType || '').trim(),
    theme: String(form.value.theme || '').trim(),
    duration: String(form.value.duration || '').trim(),
    sourceFileUrl: String(form.value.sourceFileUrl || '').trim(),
  })
  isEditMode.value = false
}

const money = (value) => `$${Math.round(value || 0).toLocaleString()}`
</script>

<template>
  <Teleport to="body">
    <div v-if="selectedDetailItem" class="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/65 p-4 font-sans backdrop-blur-md">
      <div class="relative flex h-[92vh] max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div class="flex h-20 shrink-0 select-none items-center justify-between border-b border-slate-100 bg-white px-6">
          <div class="flex items-center gap-4">
            <div class="flex flex-col text-left">
              <span class="flex items-center gap-1.5 text-sm font-black leading-tight text-slate-800">
                <LayoutIcon class="h-4 w-4 text-indigo-600" />
                {{ isEditMode ? '资产信息编辑' : '资产信息详情' }}
              </span>
              <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                <span class="rounded bg-indigo-50 px-1.5 py-0.5 text-[10.5px] font-black text-indigo-700">
                  <template v-if="isEditMode">
                    <span class="flex items-center gap-1">
                      <AnalyticsSelect v-model="form.type" :options="typeOptions" compact class-name="w-20" />
                      <input v-model="form.subType" type="text" placeholder="子类型" class="h-8 w-20 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-bold text-indigo-700 outline-none focus:border-indigo-300" />
                    </span>
                  </template>
                  <template v-else>
                    {{ form.type === 'Fragment' ? '片段' : '组件' }} • {{ form.subType || '无' }}
                  </template>
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="mr-1 inline-flex items-center gap-1.5 rounded-xl border border-indigo-150 bg-indigo-50 px-3.5 py-2 text-xs font-black text-indigo-650 shadow-3xs transition-all hover:border-indigo-200 hover:bg-indigo-100"
              title="从当前资产创建迭代资产，并自动关联父资产"
              @click="emit('create-iteration', selectedDetailItem)"
            >
              <RefreshCw class="h-3.5 w-3.5" />
              迭代
            </button>

            <div class="mr-2">
              <div v-if="isEditMode" class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                <span class="px-1 text-[10px] font-bold text-slate-500">状态:</span>
                <AnalyticsSelect v-model="form.status" :options="statusOptions" compact class-name="w-28" />
              </div>
              <span v-else :class="`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-black ${status[1]}`">
                <span :class="`h-1.5 w-1.5 rounded-full ${status[2]}`"></span>
                {{ status[0] }}
              </span>
            </div>

            <div :class="`flex rounded-xl border p-1 shadow-3xs ${isEditMode ? 'border-indigo-200 bg-indigo-50' : 'border-emerald-200 bg-emerald-50'}`">
              <button
                type="button"
                :class="`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black transition-all ${
                  !isEditMode ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                }`"
                @click="isEditMode = false"
              >
                <Eye class="h-3.5 w-3.5" />
                阅读
              </button>
              <button
                type="button"
                :class="`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black transition-all ${
                  isEditMode ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-white/70 hover:text-indigo-700'
                }`"
                @click="isEditMode = true"
              >
                <Edit3 class="h-3.5 w-3.5" />
                编辑
              </button>
            </div>

            <button
              type="button"
              class="ml-1 flex items-center justify-center rounded-lg border border-transparent p-1 px-2 text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
              title="关闭"
              @click="emit('close')"
            >
              <X class="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div class="no-scrollbar flex shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-150 bg-slate-50/60 p-6 lg:w-[36%]">
            <div :class="`relative flex w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-850 bg-slate-950 shadow-md ${previewRatioClass}`">
              <div class="pointer-events-none absolute inset-0 scale-150 select-none opacity-15 blur-2xl">
                <img :src="selectedDetailItem.previewUrl" alt="" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
              </div>
              <video
                v-if="form.sourceFileUrl?.endsWith('.mp4') || form.sourceFileUrl?.endsWith('.mov') || form.duration"
                :key="form.sourceFileUrl"
                :src="form.sourceFileUrl"
                controls
                class="relative z-10 h-full w-full select-none object-cover"
              />
              <img v-else :src="selectedDetailItem.previewUrl" alt="" class="relative z-10 h-full w-full select-none object-cover" referrerpolicy="no-referrer" />
              <div class="absolute bottom-3 left-3 z-[15] flex items-center gap-1 rounded-lg border border-white/10 bg-black/75 px-2.5 py-1 font-mono text-[11px] font-black text-white shadow-lg backdrop-blur-md">
                <PlayCircle class="h-3.5 w-3.5" />
                <input v-if="isEditMode" v-model="form.duration" type="text" placeholder="时长" class="w-12 border-none bg-transparent p-0 text-center font-mono text-[11.5px] font-black text-white outline-none" />
                <span v-else>{{ form.duration || '00:00' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-2 rounded-2xl border border-slate-150 bg-white p-2 shadow-3xs">
              <button
                v-for="ratio in ratioOptions"
                :key="ratio"
                type="button"
                :class="`rounded-xl px-3 py-2 text-[11px] font-black transition-all ${selectedRatio === ratio ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`"
                @click="selectedRatio = ratio"
              >
                {{ ratio }}
              </button>
            </div>

            <div class="shrink-0 space-y-3 rounded-2xl border border-slate-150 bg-white p-4 text-left shadow-3xs">
              <div class="flex items-center gap-1.5 rounded-lg border border-slate-150 bg-slate-50/80 px-2.5 py-1.5 text-[11px] font-bold text-slate-500">
                <span class="font-black text-slate-500">📅 入库时间:</span>
                <input
                  v-if="isEditMode"
                  v-model="form.createdAt"
                  type="text"
                  class="flex-1 rounded border border-slate-250 bg-white px-1.5 py-px font-mono text-[11px] text-slate-800 outline-none"
                />
                <span v-else class="font-mono font-bold text-slate-800">{{ form.createdAt }}</span>
              </div>

              <div>
                <span class="mb-1 block text-[9.5px] font-bold text-slate-400">🔗 源文件地址</span>
                <a
                  :href="form.sourceFileUrl || '#'"
                  target="_blank"
                  rel="noreferrer"
                  class="flex items-center justify-between gap-1 truncate rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[10.5px] font-bold text-indigo-605 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-850"
                  :title="form.sourceFileUrl ? '打开源文件' : '暂未配置有效物理存储路径！'"
                  @click="!form.sourceFileUrl && $event.preventDefault()"
                >
                  <span class="flex items-center gap-1 truncate">
                    <LinkIcon class="h-3 w-3 shrink-0 text-indigo-400" />
                    {{ form.sourceFileUrl ? '打开源文件' : '未配置源文件' }}
                  </span>
                  <ExternalLink v-if="form.sourceFileUrl" class="h-2.5 w-2.5 shrink-0" />
                </a>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-150 bg-white p-4 shadow-3xs">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <FileText class="h-3.5 w-3.5" />
                  Fixed Attributes
                </h3>
                <span class="font-mono text-[10px] font-black text-slate-400">{{ form.id }}</span>
              </div>
              <div class="space-y-3 text-xs">
                <label class="block">
                  <span class="mb-1 block text-[10px] font-black text-slate-400">素材名称</span>
                  <input v-if="isEditMode" v-model="form.name" placeholder="请输入资产标题..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:border-indigo-300" />
                  <span v-else class="font-black text-slate-800">{{ form.name }}</span>
                </label>
                <label class="block">
                  <span class="mb-1 block text-[10px] font-black text-slate-400">主题</span>
                  <input v-if="isEditMode" v-model="form.theme" placeholder="例: 冰雪/精灵/奖励" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:border-indigo-300" />
                  <span v-else class="font-bold text-slate-600">{{ form.theme || '魔幻冰雪 / 传统消除' }}</span>
                </label>
                <label class="block">
                  <span class="mb-1 block text-[10px] font-black text-slate-400">源文件链接</span>
                  <input v-if="isEditMode" v-model="form.sourceFileUrl" class="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-[11px] outline-none focus:border-indigo-300" />
                  <span v-else class="block truncate font-mono text-[11px] text-slate-500">{{ form.sourceFileUrl }}</span>
                </label>
                <div>
                  <a
                    :href="form.sourceFileUrl || '#'"
                    target="_blank"
                    rel="noreferrer"
                    :class="`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-black transition-all ${
                      form.sourceFileUrl ? 'border-indigo-100 bg-indigo-50 text-indigo-650 hover:bg-indigo-100' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`"
                    :title="form.sourceFileUrl ? '打开源文件' : '暂未配置有效物理存储路径！'"
                    @click="!form.sourceFileUrl && $event.preventDefault()"
                  >
                    <ExternalLink class="h-3.5 w-3.5" />
                    {{ form.sourceFileUrl ? '打开源文件' : '未配置源文件' }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
            <div class="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-3">
              <div class="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  :class="`rounded-lg px-4 py-2 text-xs font-black transition-all ${detailTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`"
                  @click="detailTab = 'overview'"
                >
                  资产概览
                </button>
                <button
                  type="button"
                  :class="`rounded-lg px-4 py-2 text-xs font-black transition-all ${detailTab === 'relations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`"
                  @click="detailTab = 'relations'"
                >
                  关联需求
                </button>
              </div>
              <button v-if="isEditMode" type="button" class="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white shadow-lg shadow-slate-200" @click="save">
                <Check class="h-3.5 w-3.5" />
                保存修改
              </button>
            </div>

            <div class="no-scrollbar min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-6">
              <div v-if="detailTab === 'overview'" class="space-y-4">
                <section class="rounded-2xl border border-slate-150 bg-white p-5 shadow-3xs">
                  <h3 class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-black uppercase tracking-wider text-slate-805">
                    <Tag class="h-4 w-4 text-indigo-500" />
                    创意标签分拣面板
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span class="mr-1 text-[10px] font-black text-slate-400">适用位置</span>
                    <span v-for="slot in usageSlots" :key="slot" class="rounded-xl bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-600">{{ slot }}</span>
                    <span v-if="usageSlots.length" class="text-[10px] font-bold text-slate-400">用于提需求时判断可引用段落</span>
                    <button
                      v-for="tag in form.tags"
                      :key="tag"
                      type="button"
                      :class="`rounded-xl px-3 py-1.5 text-[10px] font-black ${isEditMode ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600' : 'bg-slate-100 text-slate-500'}`"
                      @click="isEditMode && removeTag(tag)"
                    >
                      {{ tag }}
                    </button>
                    <span v-if="!form.tags.length" class="py-0.5 text-xs text-slate-400">暂无任何标签物料标签</span>
                  </div>
                  <div v-if="isEditMode" class="mt-3 flex gap-2">
                    <input v-model="newTagInput" class="h-9 flex-1 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-indigo-300" placeholder="自定义新标签回车或点击添加..." @keydown.enter.prevent="addTag" />
                    <button type="button" class="rounded-xl bg-indigo-600 px-4 text-xs font-black text-white" @click="addTag">添加</button>
                  </div>
                  <div v-if="isEditMode" class="mt-2 flex flex-wrap gap-1.5">
                    <span class="w-full text-[9px] font-black uppercase text-slate-450">🎯 快捷点击添加/移除多选：</span>
                    <button
                      v-for="tag in quickTags"
                      :key="tag"
                      type="button"
                      class="rounded-lg border border-slate-100 bg-white px-2 py-1 text-[10px] font-black text-slate-500 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"
                      @click="addQuickTag(tag)"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </section>

                <section class="rounded-2xl border border-slate-150 bg-white p-5 shadow-3xs">
                  <h3 class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-black uppercase tracking-wider text-slate-850">
                    <BarChart2 class="h-4 w-4 text-indigo-500" />
                    核心获客数据统计指标
                  </h3>
                  <div class="mt-2.5 overflow-hidden rounded-xl border border-slate-150 shadow-3xs">
                    <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-2.5 text-[10.5px] font-bold text-slate-600">
                      <span>📊 渠道详细核心统计详情表</span>
                      <span class="font-mono text-[9px] font-medium text-slate-400">Standard Ads API</span>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="w-full min-w-[580px] border-collapse text-left font-mono text-[11px]">
                        <thead>
                          <tr class="border-b border-slate-100 bg-slate-50/40 text-slate-450">
                            <th class="p-2.5 font-bold">投放渠道</th>
                            <th class="p-2.5 text-right font-bold">花费 ($)</th>
                            <th class="p-2.5 text-right font-bold">安装量</th>
                            <th class="p-2.5 text-right font-bold">付费用户</th>
                            <th class="p-2.5 text-right font-bold">IR (%)</th>
                            <th class="p-2.5 text-right font-bold">CPI</th>
                            <th class="p-2.5 text-right font-bold">CPM</th>
                            <th class="p-2.5 text-right font-bold">CPA</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          <tr v-for="record in performance" :key="record.channel" class="transition-all hover:bg-slate-50/20">
                            <td class="flex items-center gap-1 p-2.5 font-sans text-[10px] font-black uppercase text-slate-800">
                              <span
                                :class="`h-1.5 w-1.5 rounded-full ${
                                  String(record.channel).toLowerCase() === 'applovin'
                                    ? 'bg-blue-500'
                                    : String(record.channel).toLowerCase() === 'facebook'
                                      ? 'bg-indigo-650'
                                      : 'bg-red-500'
                                }`"
                              ></span>
                              {{ record.channel }}
                            </td>
                            <td class="p-2 text-right"><span class="font-bold text-slate-905">${{ Number(record.spent || 0).toLocaleString() }}</span></td>
                            <td class="p-2 text-right"><span class="text-slate-700">{{ Number(record.installs || 0).toLocaleString() }}</span></td>
                            <td class="p-2 text-right"><span class="text-slate-550">{{ Number(record.paidUsers || 0).toLocaleString() }}</span></td>
                            <td class="p-2 text-right"><span class="text-slate-800">{{ ((record.ir || 0) * 100).toFixed(1) }}%</span></td>
                            <td class="p-1 px-2.5 text-right font-bold text-indigo-650">${{ Number(record.cpi || 0).toFixed(2) }}</td>
                            <td class="p-1 px-2.5 text-right font-bold text-slate-500">${{ Number(record.cpm || 0).toFixed(1) }}</td>
                            <td class="border-none p-1 px-2.5 text-right font-bold text-indigo-900">${{ Number(record.cpa || 0).toFixed(1) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section class="rounded-2xl border border-slate-150 bg-white p-5 shadow-3xs">
                  <h3 class="mb-4 flex items-center gap-2 text-xs font-black text-slate-800">
                    <ExternalLink class="h-4 w-4 text-indigo-500" />
                    关联创意
                  </h3>
                  <div class="grid gap-2 md:grid-cols-2">
                    <div v-for="creative in creatives" :key="creative.id" class="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                      <div class="min-w-0">
                        <div class="font-mono text-[11px] font-black text-indigo-600">{{ creative.id }}</div>
                        <div class="mt-0.5 text-[10px] font-bold text-slate-400">{{ creative.channel }}</div>
                      </div>
                      <span class="rounded-xl bg-white px-2.5 py-1 text-[10px] font-black text-slate-600 shadow-3xs">{{ money(creative.spent) }}</span>
                    </div>
                  </div>
                </section>

                <section class="rounded-2xl border border-slate-150 bg-white p-5 shadow-3xs">
                  <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h3 class="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-805">
                      <ClipboardList class="h-4 w-4 shrink-0 text-indigo-550" />
                      资产结构关系
                    </h3>
                    <div v-if="isEditMode" class="flex items-center gap-2">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10.5px] font-black text-indigo-650 hover:border-indigo-200 hover:bg-indigo-100"
                        @click="openRelationPicker('parent')"
                      >
                        选择父资产
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10.5px] font-black text-emerald-650 hover:border-emerald-200 hover:bg-emerald-100"
                        @click="openRelationPicker('reference')"
                      >
                        添加引用资产
                      </button>
                    </div>
                  </div>

                  <div class="overflow-x-auto rounded-xl border border-slate-150 bg-white shadow-3xs">
                    <table class="w-full min-w-[420px] border-collapse text-left text-xs">
                      <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-450">
                        <tr>
                          <th class="px-4 py-3">关系类型</th>
                          <th class="px-4 py-3">关联对象</th>
                          <th v-if="isEditMode" class="px-4 py-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr class="hover:bg-slate-50/60">
                          <td class="px-4 py-3">
                            <span class="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-650 ring-1 ring-indigo-100">父资产</span>
                          </td>
                          <td class="px-4 py-3">
                            <div v-if="selectedParentAsset" class="flex items-center gap-2">
                              <img :src="selectedParentAsset.previewUrl" alt="" class="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-150" referrerpolicy="no-referrer" />
                              <div class="min-w-0">
                                <div class="truncate text-xs font-black text-slate-800">{{ selectedParentAsset.name }}</div>
                              </div>
                            </div>
                            <span v-else class="text-[11px] font-black text-slate-400">{{ form.parentAssetId ? '资产未匹配' : (form.parentComponent || '暂无父资产') }}</span>
                          </td>
                          <td v-if="isEditMode" class="px-4 py-3 text-right">
                            <div class="inline-flex items-center gap-1">
                              <button type="button" class="inline-flex h-7 items-center rounded-lg border border-slate-200 px-2 text-[10px] font-black text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-650" @click="openRelationPicker('parent')">
                                选择
                              </button>
                              <button
                                v-if="form.parentAssetId || form.parentComponent"
                                type="button"
                                class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                title="清空父资产"
                                @click="
                                  form.parentAssetId = '';
                                  form.parentComponent = ''
                                "
                              >
                                <X class="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr v-for="assetId in form.referencedAssetIds || []" :key="`overview-reference-${assetId}`" class="hover:bg-slate-50/60">
                          <td class="px-4 py-3">
                            <span class="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-650 ring-1 ring-emerald-100">引用资产</span>
                          </td>
                          <td class="px-4 py-3">
                            <div v-if="selectableAssets.find((asset) => asset.id === assetId)" class="flex items-center gap-2">
                              <img :src="selectableAssets.find((asset) => asset.id === assetId).previewUrl" alt="" class="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-150" referrerpolicy="no-referrer" />
                              <div class="min-w-0">
                                <div class="truncate text-xs font-black text-slate-800">{{ selectableAssets.find((asset) => asset.id === assetId).name }}</div>
                              </div>
                            </div>
                            <span v-else class="text-[11px] font-black text-slate-400">资产未匹配</span>
                          </td>
                          <td v-if="isEditMode" class="px-4 py-3 text-right">
                            <button
                              type="button"
                              class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              title="移除引用资产"
                              @click="removeReferenceAsset(assetId)"
                            >
                              <X class="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                        <tr v-if="!form.parentAssetId && !(form.referencedAssetIds || []).length && !form.parentComponent">
                          <td :colspan="isEditMode ? 3 : 2" class="px-4 py-8 text-center text-xs font-bold text-slate-400">暂无资产结构关系</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div v-else class="space-y-4">
                <section class="rounded-2xl border border-slate-150 bg-white p-5 shadow-3xs">
                  <h3 class="mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-1.5 text-xs font-black uppercase tracking-wider text-slate-805">
                    <ClipboardList class="h-4 w-4 shrink-0 text-indigo-550" />
                    关联需求投放表现
                  </h3>
                  <div class="space-y-2.5">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-black text-slate-805">关联创意需求</span>
                        <span class="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-500">{{ requirementRows.length }}</span>
                      </div>
                      <span class="text-[10px] font-bold text-slate-400">按最近引用需求展示</span>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-150 bg-slate-50/70 px-3 py-2">
                      <span class="text-[10px] font-black text-slate-400">投放汇总</span>
                      <span class="rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-black text-slate-700 ring-1 ring-slate-150">需求 {{ requirementRows.length }}</span>
                      <span class="rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-black text-slate-700 ring-1 ring-slate-150">点击 {{ requirementPerformanceSummary.clicks.toLocaleString() }}</span>
                      <span class="rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-black text-slate-700 ring-1 ring-slate-150">消耗 ${{ requirementPerformanceSummary.spent.toLocaleString() }}</span>
                      <span class="rounded-lg bg-indigo-50 px-2 py-1 font-mono text-[10px] font-black text-indigo-650 ring-1 ring-indigo-100">平均 CTR {{ (requirementPerformanceSummary.ctr * 100).toFixed(2) }}%</span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-slate-150 bg-white shadow-3xs">
                      <table class="w-full min-w-[980px] table-fixed border-collapse text-left text-xs">
                        <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-450">
                          <tr>
                            <th class="w-[300px] whitespace-nowrap px-4 py-3">需求</th>
                            <th class="w-[120px] whitespace-nowrap px-4 py-3 text-right">点击</th>
                            <th class="w-[130px] whitespace-nowrap px-4 py-3 text-right">消耗</th>
                            <th class="w-[100px] whitespace-nowrap px-4 py-3 text-right">CTR</th>
                            <th class="w-[130px] whitespace-nowrap px-4 py-3 text-right">投放日期</th>
                            <th class="w-[110px] whitespace-nowrap px-4 py-3 text-right">消耗周期</th>
                            <th class="w-[70px] whitespace-nowrap px-4 py-3 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          <tr v-for="row in requirementPerformanceRows" :key="row.requirementId" class="hover:bg-slate-50/70">
                            <td class="whitespace-nowrap px-4 py-3">
                              <div class="flex min-w-0 items-center gap-3">
                                <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-150 bg-slate-50 text-slate-400">
                                  <FileText class="h-4 w-4" />
                                </span>
                                <div class="min-w-0">
                                  <div class="truncate text-xs font-black text-slate-800">{{ row.title }}</div>
                                  <div class="mt-0.5 font-mono text-[11px] font-bold text-slate-500">{{ row.requirementId }}</div>
                                </div>
                              </div>
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-right font-mono text-[11px] font-black text-slate-700">{{ row.clicks.toLocaleString() }}</td>
                            <td class="whitespace-nowrap px-4 py-3 text-right font-mono text-[11px] font-black text-slate-700">${{ row.spent.toLocaleString() }}</td>
                            <td class="whitespace-nowrap px-4 py-3 text-right font-mono text-[11px] font-black text-indigo-650">{{ (row.ctr * 100).toFixed(2) }}%</td>
                            <td class="whitespace-nowrap px-4 py-3 text-right font-mono text-[11px] font-bold text-slate-500">{{ row.launchDate }}</td>
                            <td class="whitespace-nowrap px-4 py-3 text-right">
                              <span class="inline-flex rounded-lg bg-slate-50 px-2 py-1 font-mono text-[10px] font-black text-slate-600 ring-1 ring-slate-150">{{ row.daysRunning }} 天</span>
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-right">
                              <button
                                v-if="isEditMode"
                                type="button"
                                class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                title="移除关联需求"
                                @click="removeRequirement(row.requirementId)"
                              >
                                <X class="h-3.5 w-3.5" />
                              </button>
                              <span v-else class="text-[10px] font-bold text-slate-300">-</span>
                            </td>
                          </tr>
                          <tr v-if="requirementPerformanceRows.length === 0">
                            <td colspan="7" class="px-4 py-8 text-center text-xs font-bold text-slate-400">暂无关联创意需求</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div v-if="isEditMode" class="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                    <input
                      v-model="newRequirementInput"
                      class="w-full rounded-lg border border-slate-205 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="新增关联需求 ID，回车添加"
                      @keydown.enter.prevent="addRequirement"
                    />
                  </div>
                </section>


              </div>
            </div>

            <div v-if="isEditMode" class="sticky bottom-0 z-10 mt-0 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <span class="mr-auto text-[11px] font-bold text-slate-400">正在进行物料卡片修改。请点击保存更新：</span>
              <button
                type="button"
                class="cursor-pointer rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-black text-slate-700 transition-all hover:bg-slate-200"
                @click="isEditMode = false"
              >
                放弃修改
              </button>
              <button
                type="button"
                class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-1.5 text-xs font-black text-white shadow-sm transition-all hover:bg-indigo-700"
                @click="save"
              >
                <Check class="h-3.5 w-3.5" />
                保存更改
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isEditMode && relationPickerMode" class="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-sm">
        <div class="flex h-[78vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <aside class="w-64 shrink-0 border-r border-slate-100 bg-slate-50/80 p-4">
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Folder class="h-4 w-4" />
              </div>
              <div class="min-w-0 text-left">
                <div class="text-xs font-black text-slate-800">选择资产关系</div>
                <div class="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {{ relationPickerMode === 'parent' ? 'Parent Asset' : 'Referenced Assets' }}
                </div>
              </div>
            </div>

            <button
              type="button"
              :class="`mb-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                relationPickerPath.length === 0 ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`"
              @click="selectRelationPath([])"
            >
              <span>全部资产</span>
              <span :class="`rounded px-1.5 font-mono text-[9px] ${relationPickerPath.length === 0 ? 'bg-white/15 text-white' : 'bg-white text-slate-400'}`">{{ selectableAssets.length }}</span>
            </button>

            <div class="space-y-1">
              <div v-for="root in relationTree" :key="`modal-${root.path.join('/')}`">
                <div
                  :class="`flex items-center gap-1 rounded-xl px-2 py-1.5 text-left transition-all ${
                    relationPickerPath.join('/') === root.path.join('/') ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`"
                >
                  <button type="button" class="flex min-w-0 flex-1 items-center gap-2" @click="selectRelationPath(root.path)">
                    <Folder :class="`h-3.5 w-3.5 shrink-0 ${relationPickerPath.join('/') === root.path.join('/') ? 'text-white' : 'text-slate-400'}`" />
                    <span class="truncate text-[11px] font-black">{{ root.name }}</span>
                  </button>
                  <button
                    v-if="root.children.length"
                    type="button"
                    :class="`rounded p-1 ${relationPickerPath.join('/') === root.path.join('/') ? 'text-white/80 hover:bg-white/10' : 'text-slate-300 hover:bg-slate-200 hover:text-slate-600'}`"
                    @click="toggleRelationNode(root.path)"
                  >
                    <ChevronDown v-if="relationPickerExpanded[root.path.join('/')]" class="h-3 w-3" />
                    <ChevronRight v-else class="h-3 w-3" />
                  </button>
                </div>
                <div v-if="relationPickerExpanded[root.path.join('/')]" class="mt-1 space-y-0.5 pl-4">
                  <button
                    v-for="child in root.children"
                    :key="`modal-child-${child.path.join('/')}`"
                    type="button"
                    :class="`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-all ${
                      relationPickerPath.join('/') === child.path.join('/') ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                    }`"
                    @click="selectRelationPath(child.path)"
                  >
                    <span class="truncate text-[11px] font-black">{{ child.name }}</span>
                    <span :class="`rounded px-1 font-mono text-[9px] ${relationPickerPath.join('/') === child.path.join('/') ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-400'}`">
                      {{ selectableAssets.filter((asset) => assetInPickerPath(asset, child.path)).length }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div class="flex min-w-0 flex-1 flex-col bg-white">
            <div class="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
              <div>
                <div class="text-sm font-black text-slate-900">{{ relationPickerTitle }}</div>
                <div class="mt-0.5 text-[10px] font-bold text-slate-400">
                  {{ relationPickerMode === 'parent' ? (form.parentAssetId ? `已选父资产 ${form.parentAssetId}` : '未选择') : `已选引用 ${(form.referencedAssetIds || []).length} 个` }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="relationPickerMode === 'reference'"
                  type="button"
                  class="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-slate-800"
                  @click="relationPickerMode = null"
                >
                  完成选择
                </button>
                <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="关闭选择器" @click="relationPickerMode = null">
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>
            <div class="flex min-h-0 flex-1 flex-col p-4">
              <div class="relative mb-3">
                <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="relationPickerSearch"
                  class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  placeholder="搜索资产名称、标签或目录..."
                />
              </div>
              <div class="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-2 no-scrollbar">
                <button
                  v-for="asset in relationPickerAssets"
                  :key="`modal-asset-${asset.id}`"
                  type="button"
                  :class="`mb-2 flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition-all last:mb-0 ${
                    form.parentAssetId === asset.id || (form.referencedAssetIds || []).includes(asset.id)
                      ? 'border-indigo-200 ring-2 ring-indigo-100'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`"
                  @click="selectRelationAsset(asset)"
                >
                  <img :src="asset.previewUrl" alt="" class="h-14 w-10 shrink-0 rounded-lg object-cover" referrerpolicy="no-referrer" />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-xs font-black text-slate-800">{{ asset.name }}</div>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <span class="font-mono text-[10px] font-black text-indigo-600">{{ asset.id }}</span>
                      <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-400">{{ assetPath(asset).join(' / ') }}</span>
                    </div>
                  </div>
                  <span
                    :class="`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      form.parentAssetId === asset.id || (form.referencedAssetIds || []).includes(asset.id)
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-white text-transparent'
                    }`"
                  >
                    <Check class="h-3.5 w-3.5" />
                  </span>
                </button>
                <div v-if="relationPickerAssets.length === 0" class="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-xs font-bold text-slate-400">
                  <span>没有匹配的资产</span>
                  <span class="mt-1 text-[10px] text-slate-350">可切换目录或清空搜索条件后继续选择。</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
