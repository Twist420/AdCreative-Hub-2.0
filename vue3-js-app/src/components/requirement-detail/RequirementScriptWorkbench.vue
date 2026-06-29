<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Check, ChevronDown, ChevronRight, Copy, Folder, Layers, Plus, Search, X } from 'lucide-vue-next'
import ScriptCtaSelectionSlot from './ScriptCtaSelectionSlot.vue'
import ScriptReferenceResourceBox from './ScriptReferenceResourceBox.vue'
import ScriptRichTextEditor from './ScriptRichTextEditor.vue'
import ScriptVersionSegmentCard from './ScriptVersionSegmentCard.vue'
import {
  ASSET_OPTIONS,
  ASSET_PICKER_DIRECTORY_OPTIONS,
  ASSET_PICKER_DIRECTORY_TREE,
  ATTACHMENT_OPTIONS,
  createVersionDrafts,
  filterPickerOptions,
  FINISHED_PICKER_FACETS,
  FINISHED_OPTIONS,
  getOptionById,
  getStatusLabel,
  LANDING_OPTIONS,
  PICKER_FACETS,
  TEMPLATE_CONFIGS,
} from './scriptWorkbenchData'

const props = defineProps({
  requirement: {
    type: Object,
    required: true,
  },
  subVersions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update', 'toast'])

const getTemplateId = (value) => {
  if (String(value || '').includes('A段')) return 'same_a'
  if (String(value || '').includes('B段')) return 'same_b'
  return 'matrix'
}

const template = ref(getTemplateId(props.requirement.template))
const versionDrafts = ref(createVersionDrafts(props.subVersions, props.requirement.goal))
const sharedSegment = ref({
  id: 'shared-new',
  title: '新做核心片段',
  references: [],
  attachments: [],
  description: '',
})
const simpleReferences = ref([])
const simpleAttachments = ref([])
const pickerTarget = ref(null)
const pickerQuery = ref('')
const pickerFacet = ref('all')
const pickerDirectoryId = ref('all')
const expandedPickerDirectoryIds = ref(['fragment', 'pre_hook', 'component'])
const finishedPickerDirectionId = ref('current')
const finishedPickerSort = ref('spend')

const isSimpleAsset = computed(() => props.requirement.assetType === 'Image' || props.requirement.assetType === 'Playable')
const buildFinishedOptionsFromVersion = (version, index) =>
  (version.finishedReferenceIds || []).map((id, referenceIndex) => ({
    id,
    name: `${version.sourceRequirementName || version.name || version.sourceRequirementId || '原始需求'} 成片${referenceIndex + 1}`,
    type: '成片 / 当前方向',
    duration: '-',
    status: 'Pending Data',
    previewUrl: `https://picsum.photos/seed/${encodeURIComponent(id)}-${index}-${referenceIndex}/480/640`,
    directionGroup: '当前方向',
    spent: 7200 + index * 1800 + referenceIndex * 650,
    createdAt: `2026-06-${String(16 - ((index + referenceIndex) % 7)).padStart(2, '0')}`,
    isCurrentDirection: true,
  }))
const uniqueOptionsById = (items) => Array.from(new Map(items.map((item) => [item.id, item])).values())
const finishedOptions = computed(() => uniqueOptionsById([
  ...FINISHED_OPTIONS,
  ...props.subVersions.flatMap(buildFinishedOptionsFromVersion),
]))
const pickerOptions = computed(() => {
  if (!pickerTarget.value) return []
  if (pickerTarget.value.mode === 'landing') {
    const query = pickerQuery.value.trim().toLowerCase()
    if (!query) return LANDING_OPTIONS
    return LANDING_OPTIONS.filter((item) =>
      [item.id, item.name, item.type, item.status].join(' ').toLowerCase().includes(query),
    )
  }
  const pool = pickerTarget.value.mode === 'finished'
    ? finishedOptions.value
    : ASSET_OPTIONS
  const filtered = filterPickerOptions(pool, pickerFacet.value, pickerQuery.value).filter((item) => {
    if (pickerTarget.value?.mode === 'asset') {
      const activeDirectory = ASSET_PICKER_DIRECTORY_OPTIONS.find((directory) => directory.id === pickerDirectoryId.value) || ASSET_PICKER_DIRECTORY_OPTIONS[0]
      if (!activeDirectory.match(item)) return false
    }
    if (pickerTarget.value?.mode !== 'finished') return true
    const activeDirection = finishedDirectionOptions.value.find((direction) => direction.id === finishedPickerDirectionId.value) || finishedDirectionOptions.value[0]
    return activeDirection ? activeDirection.match(item) : true
  })
  if (pickerTarget.value.mode !== 'finished') return filtered
  return [...filtered].sort((a, b) => {
    if (finishedPickerSort.value === 'time') {
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    }
    return (b.spent || 0) - (a.spent || 0)
  })
})
const selectedPickerIds = computed(() => getTargetIds(pickerTarget.value))
const activePickerFacets = computed(() => (pickerTarget.value?.mode === 'finished' ? FINISHED_PICKER_FACETS : PICKER_FACETS))
const activePickerFacetGroups = computed(() => {
  const groups = []
  activePickerFacets.value.forEach((facet) => {
    const group = facet.group || '筛选'
    if (!groups.includes(group)) groups.push(group)
  })
  return groups.map((group) => ({
    group,
    facets: activePickerFacets.value.filter((facet) => (facet.group || '筛选') === group),
  }))
})
const finishedDirectionOptions = computed(() => {
  const groups = Array.from(new Set(finishedOptions.value.map((item) => item.directionGroup).filter((item) => item && item !== '当前方向')))
  return [
    {
      id: 'current',
      label: '当前方向',
      desc: props.requirement.direction || props.requirement.name || '当前需求方向',
      match: (item) => Boolean(item.isCurrentDirection) || String(item.type || '').includes('当前方向') || item.directionGroup === '当前方向',
    },
    ...groups.map((group) => ({
      id: group,
      label: group,
      desc: '大方向成片',
      match: (item) => item.directionGroup === group,
    })),
  ]
})

const finishedDirectionCounts = computed(() =>
  Object.fromEntries(finishedDirectionOptions.value.map((direction) => [direction.id, finishedOptions.value.filter(direction.match).length])),
)
const pickerDirectoryCounts = computed(() =>
  Object.fromEntries(ASSET_PICKER_DIRECTORY_OPTIONS.map((directory) => [directory.id, ASSET_OPTIONS.filter(directory.match).length])),
)
const pickerFacetCounts = computed(() => {
  if (!pickerTarget.value || pickerTarget.value.mode === 'landing') return {}
  const pool = pickerTarget.value.mode === 'finished' ? finishedOptions.value : ASSET_OPTIONS
  return Object.fromEntries(activePickerFacets.value.map((facet) => {
    const count = filterPickerOptions(pool, facet.id, pickerQuery.value).filter((item) => {
      if (pickerTarget.value?.mode === 'asset') {
        const activeDirectory = ASSET_PICKER_DIRECTORY_OPTIONS.find((directory) => directory.id === pickerDirectoryId.value) || ASSET_PICKER_DIRECTORY_OPTIONS[0]
        return activeDirectory.match(item)
      }
      const activeDirection = finishedDirectionOptions.value.find((direction) => direction.id === finishedPickerDirectionId.value) || finishedDirectionOptions.value[0]
      return activeDirection ? activeDirection.match(item) : true
    }).length
    return [facet.id, count]
  }))
})
const activePickerFacetLabel = computed(() =>
  activePickerFacets.value.find((facet) => facet.id === pickerFacet.value)?.label || '全部资产',
)
const activePickerDirectoryLabel = computed(() =>
  ASSET_PICKER_DIRECTORY_OPTIONS.find((directory) => directory.id === pickerDirectoryId.value)?.label || '全部资产',
)
const activeFinishedDirectionLabel = computed(() =>
  finishedDirectionOptions.value.find((direction) => direction.id === finishedPickerDirectionId.value)?.label || '当前方向',
)

const pickerTitle = computed(() => {
  if (!pickerTarget.value) return ''
  if (pickerTarget.value.mode === 'landing') return '选择 CTA / 落版'
  if (pickerTarget.value.mode === 'finished') return '引用成片'
  return '引用资产库'
})

const pickerDescription = computed(() => {
  if (!pickerTarget.value) return ''
  if (pickerTarget.value.mode === 'landing') return 'CTA/落版为单选，选择新项会替换当前结果。'
  if (pickerTarget.value.mode === 'finished') return '成片引用可多选，适合选择最近提交但还没有明确数据结论的成片。'
  return '资产库引用可多选，适合选择已经验证并沉淀的素材。'
})

const pickerFooterText = computed(() =>
  pickerTarget.value?.mode === 'landing'
    ? '选择后会自动替换当前 CTA/落版。'
    : '再次点击已选资产可以取消选择。',
)

const closePicker = () => {
  pickerTarget.value = null
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closePicker()
}

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
})

watch(
  () => props.requirement.id,
  () => {
    template.value = getTemplateId(props.requirement.template)
    versionDrafts.value = createVersionDrafts(props.subVersions, props.requirement.goal)
    sharedSegment.value = {
      id: 'shared-new',
      title: '新做核心片段',
      references: [],
      attachments: [],
      description: '',
    }
    simpleReferences.value = []
    simpleAttachments.value = []
    pickerTarget.value = null
  },
)

const syncSubVersions = () => {
  emit('update', {
    ...props.requirement,
    template: TEMPLATE_CONFIGS.find((item) => item.id === template.value)?.label || props.requirement.template,
    subVersions: versionDrafts.value.map((version) => ({
      version: version.version,
      name: version.name,
      testDirections: props.requirement.testDirections || [],
      finishedReferenceIds: version.references.filter((id) => String(id).startsWith('FIN-')),
    })),
  })
}

const updateVersion = (versionId, updates) => {
  versionDrafts.value = versionDrafts.value.map((version) => (version.version === versionId ? { ...version, ...updates } : version))
  syncSubVersions()
}

const addVersion = () => {
  const next = String(Math.max(0, ...versionDrafts.value.map((item) => Number(item.version) || 0)) + 1).padStart(2, '0')
  versionDrafts.value = [
    ...versionDrafts.value,
    {
      version: next,
      name: '',
      goal: '',
      references: [],
      attachments: [],
      description: '',
      copywriting: '',
      landingId: '9:16',
      landingNote: '',
      matrixColumns: ['A段', 'B段'],
      matrixCells: {
        A段: { references: [], inserts: [], attachments: [], description: '' },
        B段: { references: [], inserts: [], attachments: [], description: '' },
      },
    },
  ]
  syncSubVersions()
}

const duplicateVersion = (source) => {
  const next = String(Math.max(0, ...versionDrafts.value.map((item) => Number(item.version) || 0)) + 1).padStart(2, '0')
  versionDrafts.value = [
    ...versionDrafts.value,
    {
      ...source,
      version: next,
      references: [...source.references],
      attachments: [...source.attachments],
      matrixColumns: [...source.matrixColumns],
      matrixCells: JSON.parse(JSON.stringify(source.matrixCells)),
    },
  ]
  syncSubVersions()
}

const deleteVersion = (versionId) => {
  if (versionDrafts.value.length <= 1) return
  if (versionDrafts.value[0]?.version === versionId) return
  versionDrafts.value = versionDrafts.value.filter((version) => version.version !== versionId)
  syncSubVersions()
}

const getVersion = (versionId) => versionDrafts.value.find((version) => version.version === versionId)
const createEmptyMatrixCell = () => ({ references: [], inserts: [], attachments: [], description: '' })
const getCell = (version, column) => ({ ...createEmptyMatrixCell(), ...(version.matrixCells[column] || {}) })
const formatMatrixColumnName = (index) => (index < 26 ? `${String.fromCharCode(65 + index)}段` : `新增段${index + 1}`)
const normalizeMatrixColumns = (columns) => columns.map((_, index) => formatMatrixColumnName(index))

const updateCell = (versionId, column, updates) => {
  const version = getVersion(versionId)
  if (!version) return
  updateVersion(versionId, {
    matrixCells: {
      ...version.matrixCells,
      [column]: { ...getCell(version, column), ...updates },
    },
  })
}

const addMatrixColumn = (versionId, afterIndex = null) => {
  const version = getVersion(versionId)
  if (!version) return
  const insertIndex = afterIndex === null ? version.matrixColumns.length : Math.max(0, Math.min(afterIndex + 1, version.matrixColumns.length))
  const currentColumns = version.matrixColumns
  const nextColumns = normalizeMatrixColumns([
    ...version.matrixColumns.slice(0, insertIndex),
    '__new_matrix_column__',
    ...version.matrixColumns.slice(insertIndex),
  ])
  const nextCells = {}
  currentColumns.forEach((column, index) => {
    const nextColumn = nextColumns[index >= insertIndex ? index + 1 : index]
    nextCells[nextColumn] = getCell(version, column)
  })
  nextCells[nextColumns[insertIndex]] = createEmptyMatrixCell()
  updateVersion(versionId, {
    matrixColumns: nextColumns,
    matrixCells: nextCells,
  })
}

const deleteMatrixColumn = (versionId, column) => {
  if (column === 'B段') return
  const version = getVersion(versionId)
  if (!version) return
  const remainingColumns = version.matrixColumns.filter((item) => item !== column)
  const nextColumns = normalizeMatrixColumns(remainingColumns)
  const nextCells = Object.fromEntries(remainingColumns.map((item, index) => [nextColumns[index], getCell(version, item)]))
  updateVersion(versionId, {
    matrixColumns: nextColumns,
    matrixCells: nextCells,
  })
}

const toggleIds = (items, id) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id])

const getTargetIds = (target) => {
  if (!target) return []
  if (target.type === 'shared') return sharedSegment.value.references
  if (target.type === 'simple-root') return simpleReferences.value
  const version = getVersion(target.version)
  if (!version) return []
  if (target.mode === 'landing') return version.landingId ? [version.landingId] : []
  if (target.type === 'version') return version.references
  if (target.type === 'matrix') {
    const cell = getCell(version, target.column)
    return target.field === 'insert' ? cell.inserts : cell.references
  }
  return []
}

const applyTargetIds = (target, nextIds) => {
  if (!target) return
  if (target.type === 'shared') {
    sharedSegment.value = { ...sharedSegment.value, references: nextIds }
    return
  }
  if (target.type === 'simple-root') {
    simpleReferences.value = nextIds
    return
  }
  const version = getVersion(target.version)
  if (!version) return
  if (target.mode === 'landing') {
    updateVersion(target.version, { landingId: nextIds[nextIds.length - 1] || '' })
    pickerTarget.value = null
    return
  }
  if (target.type === 'version') updateVersion(target.version, { references: nextIds })
  if (target.type === 'matrix') updateCell(target.version, target.column, target.field === 'insert' ? { inserts: nextIds } : { references: nextIds })
}

const openPicker = (target) => {
  pickerTarget.value = target
  pickerQuery.value = ''
  pickerFacet.value = target.mode === 'asset' ? getDefaultPickerFacet(target) : 'all'
  if (target.mode === 'asset') pickerDirectoryId.value = getDefaultPickerDirectory(target)
  if (target.mode === 'finished') {
    finishedPickerDirectionId.value = 'current'
    finishedPickerSort.value = 'spend'
  }
}

const getDefaultPickerFacet = (target) => {
  if (!target || target.mode !== 'asset') return 'all'
  if (props.requirement.assetType === 'Image') return 'scene_component'
  if (props.requirement.assetType === 'Playable') return 'segment_mid'
  if (target.type === 'shared') return template.value === 'same_b' ? 'segment_b' : 'segment_a'
  const segment = target.column || ''
  if (segment === 'A段' || segment.startsWith('A')) return 'segment_a'
  if (segment === 'B段' || segment.startsWith('B') || segment.includes('大字报')) return 'segment_b'
  if (segment.includes('玩法') || segment.includes('中间') || segment.startsWith('C') || segment.startsWith('D')) return 'segment_mid'
  return 'all'
}

const getDefaultPickerDirectory = (target) => {
  if (!target || target.mode !== 'asset') return 'all'
  if (props.requirement.assetType === 'Image') return 'scene_component'
  if (props.requirement.assetType === 'Playable') return 'play_segment'
  if (target.type === 'shared') return template.value === 'same_b' ? 'billboard_segment' : 'pre_hook'
  const segment = target.column || ''
  if (segment === 'A段' || segment.startsWith('A')) return 'pre_hook'
  if (segment === 'B段' || segment.startsWith('B') || segment.includes('大字报')) return 'billboard_segment'
  if (segment.includes('玩法') || segment.includes('中间') || segment.startsWith('C') || segment.startsWith('D')) return 'play_segment'
  return 'all'
}

const togglePickerDirectoryExpanded = (id) => {
  expandedPickerDirectoryIds.value = expandedPickerDirectoryIds.value.includes(id)
    ? expandedPickerDirectoryIds.value.filter((item) => item !== id)
    : [...expandedPickerDirectoryIds.value, id]
}

const chooseOption = (id) => {
  const current = selectedPickerIds.value
  const nextIds = pickerTarget.value?.mode === 'landing' ? [id] : toggleIds(current, id)
  applyTargetIds(pickerTarget.value, nextIds)
}

const removeReference = (target, id) => {
  applyTargetIds(target, getTargetIds(target).filter((item) => item !== id))
}

const removeSharedAttachment = (id) => {
  sharedSegment.value = {
    ...sharedSegment.value,
    attachments: sharedSegment.value.attachments.filter((item) => item !== id),
  }
}

const removeVersionReference = ({ version, id }) => {
  const target = getVersion(version)
  if (!target) return
  updateVersion(version, {
    references: target.references.filter((item) => item !== id),
  })
}

const removeVersionAttachment = ({ version, id }) => {
  const target = getVersion(version)
  if (!target) return
  updateVersion(version, {
    attachments: target.attachments.filter((item) => item !== id),
  })
}

const addAttachment = (targetType, versionId, column) => {
  const nextAttachment = ATTACHMENT_OPTIONS.find((item) => {
    if (targetType === 'shared') return !sharedSegment.value.attachments.includes(item)
    if (targetType === 'simple-root') return !simpleAttachments.value.includes(item)
    const version = getVersion(versionId)
    if (!version) return false
    if (targetType === 'matrix') return !getCell(version, column).attachments.includes(item)
    return !version.attachments.includes(item)
  }) || `上传参考 ${Date.now()}`

  if (targetType === 'shared') sharedSegment.value = { ...sharedSegment.value, attachments: [...sharedSegment.value.attachments, nextAttachment] }
  if (targetType === 'simple-root') simpleAttachments.value = [...simpleAttachments.value, nextAttachment]
  if (targetType === 'version') {
    const version = getVersion(versionId)
    updateVersion(versionId, { attachments: [...version.attachments, nextAttachment] })
  }
  if (targetType === 'matrix') {
    const version = getVersion(versionId)
    const cell = getCell(version, column)
    updateCell(versionId, column, { attachments: [...cell.attachments, nextAttachment] })
  }
  emit('toast', '已添加上传参考')
}

const getReferenceOption = (id) => getOptionById(id) || finishedOptions.value.find((item) => item.id === id)

const isDisabledSameBVersion = (versionIndex) => template.value === 'same_b' && versionIndex === 0
</script>

<template>
  <div class="space-y-5">
    <section v-if="!isSimpleAsset" class="flex flex-wrap items-center gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-xs font-bold text-slate-400">布局模式：</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in TEMPLATE_CONFIGS"
            :key="item.id"
            :class="`rounded-full border px-5 py-2 text-xs font-black transition-all ${template === item.id ? 'border-indigo-500 bg-indigo-500 text-white shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`"
            type="button"
            @click="template = item.id; syncSubVersions()"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="isSimpleAsset" class="space-y-4">
      <div v-for="(version, versionIndex) in versionDrafts" :key="version.version" class="overflow-hidden border-t border-slate-200 bg-white pt-4">
        <div class="flex flex-wrap items-end gap-3 px-1 pb-4">
          <span class="shrink-0 rounded-lg bg-indigo-500 px-3 py-1.5 text-[10px] font-black text-white shadow-sm">v{{ version.version }}</span>
          <label class="min-w-[240px] flex-1 space-y-1">
            <span class="block text-[9px] font-black uppercase tracking-widest text-slate-500">版本名称</span>
            <input :value="version.name" :disabled="isDisabledSameBVersion(versionIndex)" class="w-full rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white disabled:text-slate-400" placeholder="填写版本名称" @input="updateVersion(version.version, { name: $event.target.value })" />
          </label>
          <label class="min-w-[240px] flex-1 space-y-1">
            <span class="block text-[9px] font-black uppercase tracking-widest text-slate-500">验证目标</span>
            <input :value="version.goal" :disabled="isDisabledSameBVersion(versionIndex)" class="w-full rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white disabled:text-slate-400" placeholder="填写这一版要验证的卖点、画面或交互目标" @input="updateVersion(version.version, { goal: $event.target.value })" />
          </label>
          <button class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" title="复制版本" type="button" @click="duplicateVersion(version)">
            <Copy class="h-3.5 w-3.5" />
          </button>
          <button v-if="versionIndex > 0" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-300 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500" title="删除版本" type="button" @click="deleteVersion(version.version)">
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
        <div class="grid grid-cols-1 gap-4 px-1 pb-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]">
          <ScriptReferenceResourceBox
            :asset-ids="version.references"
            :attachments="version.attachments"
            compact
            @upload-reference="addAttachment('version', version.version)"
            @pick-assets="openPicker({ type: 'version', version: version.version, mode: 'asset' })"
            @pick-finished="openPicker({ type: 'version', version: version.version, mode: 'finished' })"
            @remove-asset="removeReference({ type: 'version', version: version.version, mode: 'asset' }, $event)"
            @toggle-attachment="updateVersion(version.version, { attachments: version.attachments.filter((id) => id !== $event) })"
          />
          <ScriptRichTextEditor
            :model-value="version.description"
            compact
            :placeholder="requirement.assetType === 'Playable' ? '描述试玩的核心玩法、交互流程、关键反馈、失败/成功状态和制作注意事项...' : '描述图片的画面构图、主体元素、文案重点、风格方向、尺寸适配和制作注意事项...'"
            @update:model-value="updateVersion(version.version, { description: $event })"
          />
        </div>
      </div>
      <button
        class="flex min-h-[76px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-xs font-black text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-500"
        type="button"
        @click="addVersion"
      >
        <Plus class="h-4 w-4" />
        新增版本
      </button>
    </section>

    <section v-else-if="template === 'same_a' || template === 'same_b'" class="space-y-5">
      <template v-if="template === 'same_a'">
        <div class="space-y-3 border-t border-slate-100 pt-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800">A段需求</h4>
          </div>
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.95fr)_minmax(360px,1fr)]">
            <ScriptReferenceResourceBox
              :asset-ids="sharedSegment.references"
              :attachments="sharedSegment.attachments"
              @pick-assets="openPicker({ type: 'shared', mode: 'asset' })"
              @pick-finished="openPicker({ type: 'shared', mode: 'finished' })"
              @remove-asset="removeReference({ type: 'shared', mode: 'asset' }, $event)"
              @toggle-attachment="removeSharedAttachment"
              @upload-reference="addAttachment('shared')"
            />
            <ScriptRichTextEditor
              v-model="sharedSegment.description"
              placeholder="请在这里详细输入该A段落的创意脚本内容，包括画面表现、文案重点等..."
            />
          </div>
        </div>

        <div class="space-y-3 border-t border-slate-100 pt-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800">B段需求</h4>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
            <ScriptVersionSegmentCard
              v-for="(version, versionIndex) in versionDrafts"
              :key="version.version"
              :disabled="false"
              :index="versionIndex"
              :version="version"
              @clear-landing="updateVersion($event, { landingId: '' })"
              @delete="deleteVersion"
              @duplicate="duplicateVersion"
              @pick-assets="openPicker({ type: 'version', version: $event, mode: 'asset' })"
              @pick-finished="openPicker({ type: 'version', version: $event, mode: 'finished' })"
              @pick-landing="openPicker({ type: 'version', version: $event, mode: 'landing' })"
              @remove-asset="removeVersionReference"
              @toggle-attachment="removeVersionAttachment"
              @update="updateVersion($event.version, $event.updates)"
              @update-landing-note="updateVersion($event.version, { landingNote: $event.note })"
              @upload-reference="addAttachment('version', $event)"
            />
            <button class="flex min-h-[420px] w-[270px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-5xl font-light text-slate-300 transition-all hover:border-indigo-200 hover:text-indigo-400" type="button" @click="addVersion">
              +
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="space-y-3 border-t border-slate-100 pt-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800">A段</h4>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
            <ScriptVersionSegmentCard
              v-for="(version, versionIndex) in versionDrafts"
              :key="version.version"
              :disabled="versionIndex === 0"
              :index="versionIndex"
              :version="version"
              @clear-landing="updateVersion($event, { landingId: '' })"
              @delete="deleteVersion"
              @duplicate="duplicateVersion"
              @pick-assets="openPicker({ type: 'version', version: $event, mode: 'asset' })"
              @pick-finished="openPicker({ type: 'version', version: $event, mode: 'finished' })"
              @pick-landing="openPicker({ type: 'version', version: $event, mode: 'landing' })"
              @remove-asset="removeVersionReference"
              @toggle-attachment="removeVersionAttachment"
              @update="updateVersion($event.version, $event.updates)"
              @update-landing-note="updateVersion($event.version, { landingNote: $event.note })"
              @upload-reference="addAttachment('version', $event)"
            />
            <button class="flex min-h-[420px] w-[270px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-5xl font-light text-slate-300 transition-all hover:border-indigo-200 hover:text-indigo-400" type="button" @click="addVersion">
              +
            </button>
          </div>
        </div>

        <div class="space-y-3 border-t border-slate-100 pt-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800">B段需求</h4>
          </div>
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.95fr)_minmax(360px,1fr)]">
            <ScriptReferenceResourceBox
              :asset-ids="sharedSegment.references"
              :attachments="sharedSegment.attachments"
              @pick-assets="openPicker({ type: 'shared', mode: 'asset' })"
              @pick-finished="openPicker({ type: 'shared', mode: 'finished' })"
              @remove-asset="removeReference({ type: 'shared', mode: 'asset' }, $event)"
              @toggle-attachment="removeSharedAttachment"
              @upload-reference="addAttachment('shared')"
            />
            <ScriptRichTextEditor
              v-model="sharedSegment.description"
              placeholder="请在这里详细输入该B段落的创意脚本内容，包括画面表现、文案重点等..."
            />
          </div>
        </div>
      </template>
    </section>

    <section v-else class="space-y-4">
      <div v-for="(version, versionIndex) in versionDrafts" :key="version.version" class="overflow-hidden border-t border-slate-200 bg-white pt-4">
        <div class="flex flex-wrap items-end gap-3 px-1 pb-4">
          <span class="shrink-0 rounded-lg bg-indigo-500 px-3 py-1.5 text-[10px] font-black text-white shadow-sm">v{{ version.version }}</span>
          <label class="min-w-[240px] flex-1 space-y-1">
            <span class="block text-[9px] font-black uppercase tracking-widest text-slate-500">版本名称</span>
            <input :value="version.name" class="w-full rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white" placeholder="填写版本名称" @input="updateVersion(version.version, { name: $event.target.value })" />
          </label>
          <label class="min-w-[240px] flex-1 space-y-1">
            <span class="block text-[9px] font-black uppercase tracking-widest text-slate-500">验证目标</span>
            <input :value="version.goal" class="w-full rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white" placeholder="填写这一版要验证的卖点、画面或转化目标" @input="updateVersion(version.version, { goal: $event.target.value })" />
          </label>
          <button class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" title="复制版本" type="button" @click="duplicateVersion(version)">
            <Copy class="h-4 w-4" />
          </button>
          <button v-if="versionIndex > 0" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-300 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500" title="删除版本" type="button" @click="deleteVersion(version.version)">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="flex gap-3 overflow-x-auto px-1 pb-4 no-scrollbar">
          <button
            class="mt-24 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-indigo-200 bg-white text-indigo-500 transition-all hover:border-indigo-300 hover:bg-indigo-50"
            type="button"
            title="在最前面增加段落"
            @click="addMatrixColumn(version.version, -1)"
          >
            <Plus class="h-3.5 w-3.5" />
          </button>

          <template v-for="(column, index) in version.matrixColumns" :key="`${version.version}-${column}`">
            <div class="w-[280px] shrink-0 space-y-2">
              <div class="flex h-6 items-center justify-between">
                <label class="block text-[9px] font-black uppercase tracking-widest text-slate-500">{{ column }}</label>
                <button v-if="column !== 'B段'" class="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500" title="删除段落" type="button" @click="deleteMatrixColumn(version.version, column)">
                  <X class="h-3.5 w-3.5" />
                </button>
              </div>

              <ScriptReferenceResourceBox
                :asset-ids="[...getCell(version, column).references, ...getCell(version, column).inserts]"
                :attachments="getCell(version, column).attachments"
                compact
                hide-label
                @upload-reference="addAttachment('matrix', version.version, column)"
                @pick-assets="openPicker({ type: 'matrix', version: version.version, column, mode: 'asset', field: 'reference' })"
                @pick-finished="openPicker({ type: 'matrix', version: version.version, column, mode: 'finished', field: 'reference' })"
                @remove-asset="
                  updateCell(version.version, column, {
                    references: getCell(version, column).references.filter((id) => id !== $event),
                    inserts: getCell(version, column).inserts.filter((id) => id !== $event),
                  })
                "
                @toggle-attachment="updateCell(version.version, column, { attachments: getCell(version, column).attachments.filter((id) => id !== $event) })"
              />
              <textarea :value="getCell(version, column).description" class="h-16 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold leading-relaxed text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300" placeholder="添加描述..." @input="updateCell(version.version, column, { description: $event.target.value })" />
            </div>
            <button
              class="mt-24 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-indigo-200 bg-white text-indigo-500 transition-all hover:border-indigo-300 hover:bg-indigo-50"
              type="button"
              title="在这里增加段落"
              @click="addMatrixColumn(version.version, index)"
            >
              <Plus class="h-3.5 w-3.5" />
            </button>
          </template>

          <div class="w-[280px] shrink-0 space-y-2">
            <div class="flex h-6 items-center justify-between">
              <label class="block text-[9px] font-black uppercase tracking-widest text-slate-500">CTA / 落版</label>
            </div>
            <ScriptCtaSelectionSlot
              :selected="version.landingId"
              :description="version.landingNote"
              hide-label
              @pick="openPicker({ type: 'version', version: version.version, mode: 'landing' })"
              @clear="updateVersion(version.version, { landingId: '' })"
              @update:description="updateVersion(version.version, { landingNote: $event })"
            />
          </div>
        </div>
      </div>
      <button
        class="flex min-h-[76px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-xs font-black text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-500"
        type="button"
        @click="addVersion"
      >
        <Plus class="h-4 w-4" />
        新增版本
      </button>
    </section>

    <div v-if="pickerTarget" class="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm">
      <div :class="`flex h-[82vh] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl ${pickerTarget.mode === 'asset' || pickerTarget.mode === 'finished' ? 'max-w-[1440px]' : 'max-w-5xl'}`">
        <div class="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Folder v-if="pickerTarget.mode !== 'landing'" class="h-5 w-5" />
              <Layers v-else class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900">{{ pickerTitle }}</h3>
              <p class="mt-1 text-[10px] font-bold text-slate-400">{{ pickerDescription }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="rounded-xl bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-600">
              已选 {{ selectedPickerIds.length }}
            </span>
            <button class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600" type="button" @click="pickerTarget = null">
              <X class="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
        <div
          :class="`grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden bg-slate-50/70 ${
            pickerTarget.mode === 'landing'
              ? 'lg:grid-cols-[280px_minmax(0,1fr)]'
              : 'lg:grid-cols-[220px_280px_minmax(0,1fr)]'
          }`"
        >
          <aside v-if="pickerTarget.mode === 'finished'" class="overflow-auto border-r border-slate-100 bg-emerald-50/40 p-5 no-scrollbar">
            <div class="mb-3">
              <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600">大方向</p>
              <p class="mt-1 text-[10px] font-bold leading-relaxed text-slate-400">按创意大方向查看可引用成片</p>
            </div>
            <div class="max-h-[66vh] space-y-1 overflow-y-auto pr-1 no-scrollbar">
              <button
                v-for="direction in finishedDirectionOptions"
                :key="direction.id"
                :class="`w-full rounded-xl px-3 py-2.5 text-left transition-all ${
                  finishedPickerDirectionId === direction.id
                    ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`"
                type="button"
                @click="finishedPickerDirectionId = direction.id"
              >
                <span class="flex items-center justify-between gap-2">
                  <span class="truncate text-xs font-black">{{ direction.label }}</span>
                  <span :class="`rounded-lg px-1.5 py-0.5 text-[9px] font-black ${finishedPickerDirectionId === direction.id ? 'bg-emerald-50 text-emerald-500' : 'bg-white text-slate-300'}`">{{ finishedDirectionCounts[direction.id] || 0 }}</span>
                </span>
                <span class="mt-0.5 block truncate text-[9px] font-bold text-slate-400">{{ direction.desc }}</span>
              </button>
            </div>
          </aside>

          <aside v-if="pickerTarget.mode === 'asset'" class="overflow-auto border-r border-slate-100 bg-slate-50/80 p-5 no-scrollbar">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">资产目录</p>
              <button
                :class="`rounded-lg px-2 py-1 text-[9px] font-black ${pickerDirectoryId === 'all' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 hover:text-slate-700'}`"
                type="button"
                @click="pickerDirectoryId = 'all'"
              >
                全部 {{ pickerDirectoryCounts.all || 0 }}
              </button>
            </div>

            <div class="max-h-[66vh] space-y-1 overflow-y-auto pr-1 no-scrollbar">
              <div v-for="node in ASSET_PICKER_DIRECTORY_TREE" :key="node.id" class="space-y-1">
                <div class="flex items-center gap-1">
                  <button
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-white hover:text-slate-700"
                    type="button"
                    :title="expandedPickerDirectoryIds.includes(node.id) ? '收起目录' : '展开目录'"
                    @click="togglePickerDirectoryExpanded(node.id)"
                  >
                    <ChevronDown v-if="expandedPickerDirectoryIds.includes(node.id)" class="h-4 w-4" />
                    <ChevronRight v-else class="h-4 w-4" />
                  </button>
                  <button
                    :class="`min-w-0 flex-1 rounded-xl px-2.5 py-2 text-left transition-all ${pickerDirectoryId === node.id ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`"
                    type="button"
                    @click="pickerDirectoryId = node.id"
                  >
                    <span class="flex items-center justify-between gap-2">
                      <span class="truncate text-xs font-black">{{ node.label }}</span>
                      <span :class="`rounded-lg px-1.5 py-0.5 text-[9px] font-black ${pickerDirectoryId === node.id ? 'bg-indigo-50 text-indigo-500' : 'bg-white text-slate-300'}`">{{ pickerDirectoryCounts[node.id] || 0 }}</span>
                    </span>
                    <span class="mt-0.5 block truncate text-[9px] font-bold text-slate-400">{{ node.desc }}</span>
                  </button>
                </div>

                <div v-if="expandedPickerDirectoryIds.includes(node.id)" class="space-y-1">
                  <div v-for="child in node.children || []" :key="child.id" class="space-y-1 pl-4">
                    <div class="flex items-center gap-1">
                      <button
                        :class="`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${(child.children || []).length ? 'text-slate-400 hover:bg-white hover:text-slate-700' : 'text-slate-250'}`"
                        type="button"
                        :title="(child.children || []).length ? (expandedPickerDirectoryIds.includes(child.id) ? '收起目录' : '展开目录') : '选择目录'"
                        @click="(child.children || []).length ? togglePickerDirectoryExpanded(child.id) : pickerDirectoryId = child.id"
                      >
                        <ChevronDown v-if="(child.children || []).length && expandedPickerDirectoryIds.includes(child.id)" class="h-4 w-4" />
                        <ChevronRight v-else-if="(child.children || []).length" class="h-4 w-4" />
                        <span v-else class="h-1.5 w-1.5 rounded-full bg-slate-250" />
                      </button>
                      <button
                        :class="`min-w-0 flex-1 rounded-xl px-2.5 py-2 text-left transition-all ${pickerDirectoryId === child.id ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`"
                        type="button"
                        @click="pickerDirectoryId = child.id"
                      >
                        <span class="flex items-center justify-between gap-2">
                          <span class="truncate text-xs font-black">{{ child.label }}</span>
                          <span :class="`rounded-lg px-1.5 py-0.5 text-[9px] font-black ${pickerDirectoryId === child.id ? 'bg-indigo-50 text-indigo-500' : 'bg-white text-slate-300'}`">{{ pickerDirectoryCounts[child.id] || 0 }}</span>
                        </span>
                        <span class="mt-0.5 block truncate text-[9px] font-bold text-slate-400">{{ child.desc }}</span>
                      </button>
                    </div>

                    <div v-if="expandedPickerDirectoryIds.includes(child.id)" class="space-y-1 pl-4">
                      <button
                        v-for="leaf in child.children || []"
                        :key="leaf.id"
                        :class="`ml-9 flex w-[calc(100%-36px)] items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all ${pickerDirectoryId === leaf.id ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`"
                        type="button"
                        @click="pickerDirectoryId = leaf.id"
                      >
                        <span class="min-w-0">
                          <span class="block truncate text-xs font-black">{{ leaf.label }}</span>
                          <span class="mt-0.5 block truncate text-[9px] font-bold text-slate-400">{{ leaf.desc }}</span>
                        </span>
                        <span :class="`ml-2 rounded-lg px-1.5 py-0.5 text-[9px] font-black ${pickerDirectoryId === leaf.id ? 'bg-indigo-50 text-indigo-500' : 'bg-white text-slate-300'}`">{{ pickerDirectoryCounts[leaf.id] || 0 }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <aside class="overflow-auto border-r border-slate-100 bg-slate-50 p-5 no-scrollbar">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input v-model="pickerQuery" class="w-full rounded-2xl border border-slate-150 bg-white py-2.5 pl-9 pr-3 text-xs font-bold outline-none" placeholder="搜索资产名称 / 标签" />
            </div>
            <div v-if="pickerTarget.mode === 'landing'" class="mt-4 space-y-2">
              <button
                v-for="(item, index) in ['全部落版', '视频落版']"
                :key="item"
                :class="`w-full rounded-xl px-3 py-2 text-left text-xs font-black ${index === 0 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-white'}`"
                type="button"
              >
                {{ item }}
              </button>
            </div>
            <div v-else class="mt-4 max-h-[58vh] space-y-4 overflow-y-auto pr-1 no-scrollbar">
              <div v-for="facetGroup in activePickerFacetGroups" :key="facetGroup.group">
                <p :class="`mb-2 text-[10px] font-black ${pickerTarget.mode === 'finished' ? 'text-emerald-600' : 'text-indigo-600'}`">{{ facetGroup.group }}</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="facet in facetGroup.facets"
                    :key="facet.id"
                    :class="`rounded-xl border px-2.5 py-1.5 text-[10px] font-black transition-all ${
                      pickerFacet === facet.id
                        ? pickerTarget.mode === 'finished'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : pickerTarget.mode === 'finished'
                          ? 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                    }`"
                    type="button"
                    @click="pickerFacet = facet.id"
                  >
                    {{ facet.label }}
                    <span :class="`ml-1 ${pickerFacet === facet.id ? (pickerTarget.mode === 'finished' ? 'text-emerald-400' : 'text-indigo-400') : 'text-slate-300'}`">{{ pickerFacetCounts[facet.id] || 0 }}</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div class="flex-1 overflow-auto p-6 no-scrollbar">
            <div v-if="pickerTarget.mode !== 'landing'" class="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span class="text-[10px] font-black text-slate-400">当前范围</span>
              <span v-if="pickerTarget.mode === 'asset'" class="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-100">
                {{ activePickerDirectoryLabel }}
              </span>
              <span v-if="pickerTarget.mode === 'finished'" class="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-100">
                {{ activeFinishedDirectionLabel }}
              </span>
              <span :class="`rounded-lg px-2.5 py-1 text-[10px] font-black ring-1 ${pickerTarget.mode === 'finished' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-indigo-50 text-indigo-600 ring-indigo-100'}`">
                {{ activePickerFacetLabel }}
              </span>
              <span v-if="pickerQuery.trim()" class="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-100">
                搜索 {{ pickerQuery.trim() }}
              </span>
              <div v-if="pickerTarget.mode === 'finished'" class="ml-auto flex overflow-hidden rounded-xl border border-slate-150 bg-white p-1">
                <button
                  v-for="option in [{ id: 'spend', label: '花费倒序' }, { id: 'time', label: '时间顺序' }]"
                  :key="option.id"
                  :class="`rounded-lg px-3 py-1.5 text-[10px] font-black transition-all ${finishedPickerSort === option.id ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`"
                  type="button"
                  @click="finishedPickerSort = option.id"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div v-if="pickerOptions.length === 0" class="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <p class="text-xs font-black text-slate-400">没有符合条件的资产</p>
              <p class="mt-1 text-[10px] font-bold text-slate-300">可以清除搜索词，或切换其它分类标签。</p>
            </div>

            <div v-else :class="`grid gap-4 ${pickerTarget.mode === 'landing' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`">
              <button
                v-for="option in pickerOptions"
                :key="option.id"
                :class="`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 ${selectedPickerIds.includes(option.id) ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-150'}`"
                type="button"
                @click="chooseOption(option.id)"
              >
                <div class="relative aspect-video overflow-hidden bg-slate-100">
                  <img :src="option.previewUrl" class="h-full w-full object-cover transition-all group-hover:scale-105" referrerpolicy="no-referrer" />
                  <span class="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[9px] font-black text-indigo-600">{{ option.type }}</span>
                  <span v-if="selectedPickerIds.includes(option.id)" class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Check class="h-3.5 w-3.5" />
                  </span>
                </div>
                <div class="p-3">
                  <div class="truncate text-xs font-black text-slate-800">{{ option.name }}</div>
                  <div class="mt-2 flex items-center justify-between gap-2 text-[10px] font-bold text-slate-400">
                    <span>{{ getStatusLabel(option.status) }}</span>
                    <span>{{ option.duration }}</span>
                  </div>
                  <div v-if="pickerTarget.mode === 'finished'" class="mt-2 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-400">
                    <span class="truncate">{{ option.directionGroup || '当前方向' }}</span>
                    <span>{{ option.spent ? `$${option.spent.toLocaleString()}` : option.createdAt || '-' }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-4">
          <p class="text-[10px] font-bold text-slate-400">{{ pickerFooterText }}</p>
          <button class="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-black" type="button" @click="pickerTarget = null">
            {{ pickerTarget.mode === 'landing' ? '取消' : '完成选择' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
