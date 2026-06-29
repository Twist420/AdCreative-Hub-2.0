<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowDown, ArrowUp, Check, Database, FileText, Info, Layers, MoreHorizontal, Paperclip, Plus, RefreshCw, Search, X } from 'lucide-vue-next'
import AssetCard from './asset-library/AssetCard.vue'
import AssetFolderTree from './asset-library/AssetFolderTree.vue'
import CreateLibraryModal from './asset-library/CreateLibraryModal.vue'
import DetailModal from './DetailModal.vue'
import {
  ASSET_FACET_CATEGORIES,
  ASSET_FACETS,
  FOLDER_TREE,
  INITIAL_ITEMS,
  PRESET_UPLOADS_PREVIEWS,
  getLeafFolders,
  insertNodeAtPath,
  parseDuration,
  removeNodeAtPath,
} from './asset-library/assetLibraryData'

const currentPath = ref([])
const selectedDetailItem = ref(null)
const searchQuery = ref('')
const activeFacetIds = ref([])
const playingCardId = ref(null)
const folderTree = ref(FOLDER_TREE)
const libraryItems = ref(INITIAL_ITEMS)
const sortField = ref('citationCount')
const sortDirection = ref('desc')
const createModalOpen = ref(false)
const createParentPath = ref(['片段'])
const selectedAssetIds = ref([])
const isUploadModalOpen = ref(false)
const isMoveModalOpen = ref(false)
const isFolderControlOpen = ref(false)
const isDragging = ref(false)
const batchNamesText = ref('')
const uploadAttachments = ref([])
const selectedUploadFolder = ref('')
const targetMoveFolder = ref('')
const isCreatingInMove = ref(false)
const newMoveLibSystem = ref('Fragment')
const newMoveLibName = ref('')
const controlNodePath = ref([])
const controlNodeName = ref('')
const controlNodePrefix = ref('')
const controlNodeTags = ref('')
const setupPrefix = ref('')
const setupTags = ref('')
const setupError = ref('')
const showAdminConfirm = ref(false)
const adminPassword = ref('')
const toastMessage = ref('')
const toastTone = ref('success')

const leafFolders = computed(() => getLeafFolders(folderTree.value))
const currentFolderName = computed(() => currentPath.value.at(-1) || '全部资产')
const currentFolder = computed(() =>
  leafFolders.value.find((folder) => folder.path.join('/') === currentPath.value.join('/')),
)
const activeNode = computed(() => findNodeByPath(folderTree.value, currentPath.value))
const isLeafFolder = computed(() => Boolean(activeNode.value && (!activeNode.value.children || activeNode.value.children.length === 0 || activeNode.value.isLeaf)))
const needsSetup = computed(() =>
  Boolean(activeNode.value && currentPath.value.length > 0 && isLeafFolder.value && (!activeNode.value.prefix || !(activeNode.value.defaultTags || []).length)),
)
const showFolderGrid = computed(() =>
  Boolean(activeNode.value?.children?.length && !searchQuery.value.trim() && activeFacetIds.value.length === 0),
)

const activeFacets = computed(() => activeFacetIds.value.map((id) => ASSET_FACETS.find((facet) => facet.id === id)).filter(Boolean))
const activeFacetLabel = computed(() => activeFacets.value.length ? activeFacets.value.map((facet) => facet.label).join(' / ') : '全部资产')
const facetCounts = computed(() =>
  Object.fromEntries(ASSET_FACETS.map((facet) => [facet.id, libraryItems.value.filter((item) => facet.match(item)).length])),
)

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const pathName = currentPath.value.at(-1)
  return libraryItems.value
    .filter((item) => {
      if (!pathName) return true
      return item.subType === pathName || currentPath.value.includes(item.subType)
    })
    .filter((item) => {
      if (!query) return true
      return [item.id, item.name, item.type, item.subType, ...(item.tags || [])].join(' ').toLowerCase().includes(query)
    })
    .filter((item) => activeFacets.value.every((facet) => facet.match(item)))
    .sort((a, b) => {
      const metricValue = (item, field) => {
        if (field === 'citationCount') return item.citationCount || 0
        if (field === 'createdAt') return new Date(item.createdAt || '').getTime() || 0
        if (field === 'duration') return parseDuration(item.duration)
        if (field === 'spent') return (item.performance || []).reduce((sum, record) => sum + (record.spent || 0), 0)
        if (field === 'installs') return (item.performance || []).reduce((sum, record) => sum + (record.installs || 0), 0)
        if (field === 'ir') return item.performance?.[0]?.ir || 0
        if (field === 'cpi') return item.performance?.[0]?.cpi ?? 999999
        return 0
      }
      const valueA = metricValue(a, sortField.value)
      const valueB = metricValue(b, sortField.value)
      if (valueA === valueB) return 0
      if (sortField.value === 'cpi') {
        return sortDirection.value === 'desc'
          ? (valueA < valueB ? -1 : 1)
          : (valueA > valueB ? -1 : 1)
      }
      return sortDirection.value === 'desc'
        ? (valueA > valueB ? -1 : 1)
        : (valueA < valueB ? -1 : 1)
    })
})

const toggleFacet = (facetId) => {
  if (facetId === 'all') {
    activeFacetIds.value = []
    return
  }
  activeFacetIds.value = activeFacetIds.value.includes(facetId)
    ? activeFacetIds.value.filter((id) => id !== facetId)
    : [...activeFacetIds.value.filter((id) => id !== 'all'), facetId]
}

const showToast = (message, tone = 'success') => {
  toastMessage.value = message
  toastTone.value = tone
  window.setTimeout(() => {
    if (toastMessage.value === message) toastMessage.value = ''
  }, 1800)
}

const setSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortField.value = field
  sortDirection.value = 'desc'
}

const openCreateModal = (parentPath = currentPath.value.length ? currentPath.value : ['片段']) => {
  createParentPath.value = [...parentPath]
  createModalOpen.value = true
}

const createLibrary = ({ name, parentPath, system, selectedAssets }) => {
  const newNode = {
    name,
    isLeaf: true,
    prefix: system === 'Fragment' ? 'NEW-FR-' : 'NEW-COMP-',
    defaultTags: [],
  }
  folderTree.value = insertNodeAtPath(folderTree.value, parentPath, newNode)
  const nextPath = [...parentPath, name]
  currentPath.value = nextPath
  if (selectedAssets.length > 0) {
    libraryItems.value = libraryItems.value.map((item) =>
      selectedAssets.includes(item.id) ? { ...item, subType: name } : item,
    )
  }
  createModalOpen.value = false
}

const createChildLibraryInline = ({ parentPath, name }) => {
  const cleanName = String(name || '').trim()
  if (!cleanName) return
  const parentNode = findNodeByPath(folderTree.value, parentPath)
  const system = parentPath[0] === '组件' || parentNode?.system === 'Component' ? 'Component' : 'Fragment'
  const newNode = {
    name: cleanName,
    isLeaf: true,
    system,
    prefix: '',
    defaultTags: [],
  }
  folderTree.value = insertNodeAtPath(folderTree.value, parentPath, newNode)
  currentPath.value = [...parentPath, cleanName]
}

const findNodeByPath = (nodes, path) => {
  if (!path.length) return null
  const [head, ...rest] = path
  const node = nodes.find((item) => item.name === head)
  if (!node) return null
  if (!rest.length) return node
  return findNodeByPath(node.children || [], rest)
}

const findPathInTree = (nodes, targetName, path = []) => {
  for (const node of nodes) {
    const nextPath = [...path, node.name]
    if (node.name === targetName) return nextPath
    if (node.children) {
      const result = findPathInTree(node.children, targetName, nextPath)
      if (result) return result
    }
  }
  return null
}

const itemPath = (item) =>
  findPathInTree(folderTree.value, item.subType) || [item.type === 'Component' ? '组件' : '片段', item.subType]

const pathIncludes = (assetPath, targetPath) => {
  if (!targetPath.length) return true
  if (assetPath.length < targetPath.length) return false
  return targetPath.every((segment, index) => assetPath[index] === segment)
}

const folderStatistics = (path) => {
  const items = libraryItems.value.filter((item) => pathIncludes(itemPath(item), path))
  return {
    totalCount: items.length,
    previews: items.slice(0, 4),
  }
}

watch(
  [activeNode, currentPath],
  () => {
    if (!activeNode.value) return
    setupPrefix.value = activeNode.value.prefix || ''
    setupTags.value = (activeNode.value.defaultTags || []).join(', ')
    setupError.value = ''
  },
  { immediate: true },
)

const updateNodeAtPath = (nodes, path, updater) => {
  if (!path.length) return nodes
  return nodes.map((node) => {
    if (node.name !== path[0]) return node
    if (path.length === 1) return updater(node)
    return { ...node, children: updateNodeAtPath(node.children || [], path.slice(1), updater) }
  })
}

const openFolderControl = (path) => {
  const node = findNodeByPath(folderTree.value, path)
  if (!node) return
  controlNodePath.value = [...path]
  controlNodeName.value = node.name
  controlNodePrefix.value = node.prefix || ''
  controlNodeTags.value = (node.defaultTags || []).join(', ')
  showAdminConfirm.value = false
  adminPassword.value = ''
  isFolderControlOpen.value = true
}

const saveFolderControl = () => {
  const oldPath = [...controlNodePath.value]
  const nextName = controlNodeName.value.trim()
  if (!nextName) {
    showToast('资产库名称不能为空', 'error')
    return
  }
  folderTree.value = updateNodeAtPath(folderTree.value, oldPath, (node) => ({
    ...node,
    name: nextName,
    prefix: controlNodePrefix.value.trim(),
    defaultTags: controlNodeTags.value.split(',').map((tag) => tag.trim()).filter(Boolean),
  }))
  const nextPath = [...oldPath.slice(0, -1), nextName]
  if (currentPath.value.join('/') === oldPath.join('/')) currentPath.value = nextPath
  libraryItems.value = libraryItems.value.map((item) => (item.subType === oldPath.at(-1) ? { ...item, subType: nextName } : item))
  isFolderControlOpen.value = false
  showToast('资产库目录已保存')
}

const saveFolderSetup = () => {
  if (!setupPrefix.value.trim()) {
    setupError.value = '请输入微分子资产库默认前缀，如 "AI-PRE-"'
    return
  }
  if (!setupTags.value.trim()) {
    setupError.value = '请输入微分子资产库默认标签，如 "AI生成, 爆点"'
    return
  }
  const cleanTags = setupTags.value.split(',').map((tag) => tag.trim()).filter(Boolean)
  folderTree.value = updateNodeAtPath(folderTree.value, currentPath.value, (node) => ({
    ...node,
    prefix: setupPrefix.value.trim().toUpperCase(),
    defaultTags: cleanTags,
  }))
  setupError.value = ''
  showToast('资产库已成功配置并激活！')
}

const deleteFolderWithPass = () => {
  if (!['admin', 'admin888'].includes(adminPassword.value)) {
    showToast('管理员密码错误，无权执行此敏感删除操作！', 'error')
    return
  }
  if (controlNodePath.value.length <= 1) return
  const removedPath = controlNodePath.value.join('/')
  folderTree.value = removeNodeAtPath(folderTree.value, controlNodePath.value)
  if (currentPath.value.join('/') === removedPath || currentPath.value.join('/').startsWith(`${removedPath}/`)) {
    currentPath.value = []
  }
  showAdminConfirm.value = false
  adminPassword.value = ''
  isFolderControlOpen.value = false
  showToast('资产库目录已删除')
}

const toggleAssetSelection = (id) => {
  selectedAssetIds.value = selectedAssetIds.value.includes(id)
    ? selectedAssetIds.value.filter((assetId) => assetId !== id)
    : [...selectedAssetIds.value, id]
}

const openUploadModal = () => {
  selectedUploadFolder.value = currentFolder.value?.name || leafFolders.value[0]?.name || ''
  batchNamesText.value = ''
  uploadAttachments.value = []
  isUploadModalOpen.value = true
}

const openMoveModal = () => {
  targetMoveFolder.value = leafFolders.value.find((leaf) => leaf.name !== currentFolderName.value)?.name || leafFolders.value[0]?.name || ''
  isCreatingInMove.value = false
  newMoveLibSystem.value = 'Fragment'
  newMoveLibName.value = ''
  isMoveModalOpen.value = true
}

const appendFiles = (files) => {
  const nextAttachments = Array.from(files).map((file) => ({
    name: file.name,
    size: file.size,
    sizeStr: file.size < 102400 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1024 / 1024).toFixed(2)} MB`,
  }))
  uploadAttachments.value = [...uploadAttachments.value, ...nextAttachments]
  const names = nextAttachments.map((file) => file.name.replace(/\.[^.]+$/, ''))
  batchNamesText.value = [...batchNamesText.value.split('\n').map((name) => name.trim()).filter(Boolean), ...names].join('\n')
}

const removeAttachment = (index) => {
  uploadAttachments.value = uploadAttachments.value.filter((_, itemIndex) => itemIndex !== index)
}

const uploadAssets = () => {
  const names = batchNamesText.value.split('\n').map((name) => name.trim()).filter(Boolean)
  if (!selectedUploadFolder.value) {
    showToast('请选择归类的缩微资产库目录', 'error')
    return
  }
  if (!batchNamesText.value.trim()) {
    showToast('请输入素材名称（可录入单个或换行批量录入）', 'error')
    return
  }
  if (!names.length) {
    showToast('没有检测到有效的素材名称。', 'error')
    return
  }
  const targetLeaf = leafFolders.value.find((leaf) => leaf.name === selectedUploadFolder.value) || leafFolders.value[0]
  const prefix = targetLeaf?.prefix || (targetLeaf?.system === 'Component' ? 'COMP-' : 'FR-')
  const newItems = names.map((name, index) => ({
    ...libraryItems.value[0],
    id: `${prefix}${Date.now().toString(36).toUpperCase()}-${index + 1}`,
    name,
    type: targetLeaf?.system || 'Fragment',
    subType: targetLeaf?.name || 'AI前贴',
    tags: ['新上传', ...(targetLeaf?.defaultTags || [])],
    previewUrl: PRESET_UPLOADS_PREVIEWS[index % PRESET_UPLOADS_PREVIEWS.length],
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'Insufficient Data',
    citationCount: 0,
    performance: [],
  }))
  libraryItems.value = [...newItems, ...libraryItems.value]
  currentPath.value = targetLeaf?.path || currentPath.value
  isUploadModalOpen.value = false
  showToast(`成功上传了 ${newItems.length} 个创意素材至 〖${targetLeaf?.name || selectedUploadFolder.value}〗 资产库！`)
}

const moveAssets = () => {
  if (selectedAssetIds.value.length === 0) {
    showToast('请选择需要移动的资产', 'error')
    return
  }
  if (!isCreatingInMove.value && !targetMoveFolder.value) {
    showToast('请选择或指定目标资产库目录', 'error')
    return
  }
  const movedCount = selectedAssetIds.value.length
  let finalFolder = targetMoveFolder.value
  let finalPath = leafFolders.value.find((leaf) => leaf.name === targetMoveFolder.value)?.path
  if (isCreatingInMove.value) {
    const name = newMoveLibName.value.trim()
    if (!name) {
      showToast('请输入新建资产库名称', 'error')
      return
    }
    const parentPath = [newMoveLibSystem.value === 'Component' ? '组件' : '片段']
    const newNode = { name, isLeaf: true, prefix: '', defaultTags: [] }
    folderTree.value = insertNodeAtPath(folderTree.value, parentPath, newNode)
    finalFolder = name
    finalPath = [...parentPath, name]
  }
  libraryItems.value = libraryItems.value.map((item) =>
    selectedAssetIds.value.includes(item.id) ? { ...item, subType: finalFolder } : item,
  )
  if (finalPath) currentPath.value = finalPath
  selectedAssetIds.value = []
  isMoveModalOpen.value = false
  showToast(`已成功将 ${movedCount} 个资产批量移动至 〖${finalFolder}〗 目录！`)
}

const createIterationAsset = (sourceItem) => {
  const now = new Date()
  const newId = `${sourceItem.id}-iter-${now.getTime().toString().slice(-5)}`
  const newItem = {
    ...sourceItem,
    id: newId,
    name: `${sourceItem.name} 迭代版`,
    citationCount: 0,
    status: 'Insufficient Data',
    createdAt: now.toISOString().slice(0, 16).replace('T', ' '),
    parentAssetId: sourceItem.id,
    referencedAssetIds: [...(sourceItem.referencedAssetIds || [])],
    relatedAssets: [...(sourceItem.relatedAssets || [])],
    relatedComponents: [...(sourceItem.relatedComponents || [])],
    performance: [],
  }
  libraryItems.value = [newItem, ...libraryItems.value]
  currentPath.value = itemPath(sourceItem)
  selectedDetailItem.value = newItem
  searchQuery.value = ''
  showToast(`已从 ${sourceItem.id} 创建迭代资产 ${newId}`)
}

const saveDetailItem = (updatedItem) => {
  libraryItems.value = libraryItems.value.map((item) => (item.id === selectedDetailItem.value?.id ? updatedItem : item))
  selectedDetailItem.value = updatedItem
  showToast(`已保存资产 ${updatedItem.id} 的修改`)
}
</script>

<template>
  <section class="flex h-full min-h-[760px] overflow-hidden bg-slate-50">
    <div
      v-if="toastMessage"
      :class="`fixed right-8 top-20 z-[260] flex max-w-sm items-center gap-2.5 rounded-2xl border px-4 py-3 text-[11px] font-black shadow-2xl ${
        toastTone === 'error'
          ? 'border-rose-100 bg-rose-50 text-rose-700'
          : 'border-emerald-100 bg-emerald-50 text-emerald-700'
      }`"
    >
      <span :class="`h-2 w-2 shrink-0 rounded-full ${toastTone === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`"></span>
      <span>{{ toastMessage }}</span>
    </div>

    <aside class="flex w-[276px] shrink-0 flex-col border-r border-slate-150 bg-white">
      <div class="border-b border-slate-100 p-4">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Database class="h-4 w-4" />
          </div>
          <div>
            <h2 class="text-sm font-black text-slate-900">资产库目录</h2>
            <p class="text-[10px] font-bold text-slate-400">Library Explorer</p>
          </div>
        </div>
        <button class="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black text-white transition-all hover:bg-black" type="button" @click="openCreateModal(['片段'])">
          <Plus class="h-4 w-4" />
          新建资产库
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-3 no-scrollbar">
        <button
          :class="`mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-black transition-all ${currentPath.length === 0 ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`"
          type="button"
          title="点击返回最上层级"
          @click="currentPath = []"
        >
          <Database class="h-3.5 w-3.5" />
          全部资产
        </button>
        <AssetFolderTree
          :nodes="folderTree"
          :current-path="currentPath"
          @select-path="currentPath = $event"
          @create-child="createChildLibraryInline"
          @manage-path="openFolderControl"
        />
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col gap-5 overflow-hidden bg-slate-50 p-6">
      <header class="z-10 flex h-16 shrink-0 items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white px-6 shadow-sm">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <div class="relative w-56 shrink-0">
            <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input v-model="searchQuery" class="w-full rounded-xl border border-slate-100 bg-slate-50 py-1.5 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10" placeholder="在当前目录下模糊定位..." />
          </div>
          <button v-if="searchQuery" type="button" class="rounded bg-slate-100 px-2 py-1 text-[9.5px] font-bold text-slate-400 hover:text-slate-800" @click="searchQuery = ''">
            清除
          </button>
          <div class="h-4 w-px bg-slate-200"></div>
          <span class="shrink-0 text-[9.5px] font-bold tracking-tight text-slate-400">排序方式:</span>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="option in [{ key: 'citationCount', label: '引用' }, { key: 'spent', label: '预算' }, { key: 'installs', label: '安装' }, { key: 'ir', label: 'IR' }, { key: 'cpi', label: 'CPI' }, { key: 'createdAt', label: '更新时间' }, { key: 'duration', label: '视频长度' }]"
              :key="option.key"
              :class="`flex cursor-pointer select-none items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-black transition-all duration-150 ${
                sortField === option.key
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`"
              type="button"
              @click="setSort(option.key)"
            >
              <span>{{ option.label }}</span>
              <ArrowUp v-if="sortField === option.key && sortDirection === 'asc'" class="h-2.5 w-2.5 shrink-0 text-white" />
              <ArrowDown v-else-if="sortField === option.key" class="h-2.5 w-2.5 shrink-0 text-white" />
            </button>
          </div>
        </div>
        <button type="button" class="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-black hover:shadow-lg" @click="openUploadModal">
          <Plus class="h-4 w-4 shrink-0" />
          上传素材
        </button>
      </header>

      <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div class="max-h-64 overflow-y-auto px-6 py-4 no-scrollbar">
            <div class="space-y-3">
              <div
                v-for="category in ASSET_FACET_CATEGORIES"
                :key="category.id"
                class="grid grid-cols-[112px_minmax(0,1fr)] gap-6 border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div class="pt-1">
                  <p class="text-xs font-black text-indigo-600">{{ category.label }}</p>
                </div>
                <div class="space-y-2.5">
                  <div v-for="group in category.groups" :key="`${category.id}-${group.title}`" class="grid grid-cols-[104px_minmax(0,1fr)] gap-5">
                    <p class="pt-0.5 text-[9.5px] font-bold leading-6 text-slate-400">{{ group.title }}</p>
                    <div class="flex flex-wrap items-center gap-x-7 gap-y-2">
                      <button
                        v-for="facet in group.facets"
                        :key="facet.id"
                        :class="`group inline-flex h-6 items-center gap-1 whitespace-nowrap text-xs font-black leading-6 transition-all ${
                          activeFacetIds.includes(facet.id) || (facet.id === 'all' && activeFacetIds.length === 0)
                            ? 'text-indigo-600'
                            : 'text-slate-700 hover:text-indigo-600'
                        }`"
                        type="button"
                        @click="toggleFacet(facet.id)"
                      >
                        <span :class="activeFacetIds.includes(facet.id) || (facet.id === 'all' && activeFacetIds.length === 0) ? 'border-b-2 border-indigo-500 pb-0.5' : 'pb-0.5'">
                          {{ facet.label }}
                        </span>
                        <span :class="`text-[9.5px] font-bold ${activeFacetIds.includes(facet.id) || (facet.id === 'all' && activeFacetIds.length === 0) ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-300'}`">
                          {{ facetCounts[facet.id] || 0 }}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="border-t border-slate-100 bg-white/80 px-6 py-3">
            <div class="flex min-h-7 flex-wrap items-center gap-2">
              <span class="mr-1 text-[9.5px] font-bold text-slate-400">已选标签</span>
              <span v-if="activeFacets.length === 0" class="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-300">全部资产</span>
              <template v-else>
                <button
                  v-for="facet in activeFacets"
                  :key="facet.id"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
                  type="button"
                  title="移除此筛选标签"
                  @click="toggleFacet(facet.id)"
                >
                  {{ facet.label }}
                  <X class="h-3 w-3" />
                </button>
              </template>
              <button
                v-if="activeFacets.length > 0 || searchQuery.trim()"
                type="button"
                class="ml-auto rounded-xl px-3 py-1.5 text-xs font-black text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                @click="activeFacetIds = []; searchQuery = ''"
              >
                清除全部
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar">
          <div v-if="selectedAssetIds.length > 0" class="mb-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/90 p-3.5 font-sans shadow-md backdrop-blur-md">
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                <Layers class="h-4 w-4 shrink-0" />
              </div>
              <div>
                <p class="text-left text-xs font-black leading-none tracking-tight text-slate-800">
                  已批量选中 <span class="text-sm font-extrabold text-indigo-600">{{ selectedAssetIds.length }}</span> 个微分子资产
                </p>
                <p class="mt-1 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">Multi-Select Batch Actions Mode Activated</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-[11px] font-black text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow" @click="openMoveModal">
                <RefreshCw class="h-3.5 w-3.5 shrink-0" />
                批量移动到其它资产库...
              </button>
              <button type="button" class="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-500 transition-all hover:bg-slate-50" @click="selectedAssetIds = []">
                <X class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                取消操作
              </button>
            </div>
          </div>

          <div v-if="needsSetup" class="mx-auto my-12 flex max-w-md flex-col rounded-3xl border border-slate-200/60 bg-white p-8 text-left shadow-xl">
            <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm">
              <Info class="h-6 w-6" />
            </div>
            <h3 class="text-sm font-black tracking-tight text-slate-800">配置并激活您的微分子资产库</h3>
            <p class="mt-1 text-[9px] font-bold uppercase tracking-widest text-indigo-600">Activate Micro-Asset Library</p>
            <p class="mb-6 mt-3 text-[11px] font-semibold leading-relaxed text-slate-500">
              该资产库是初始创建的，需要首先配置其内属资产的<strong class="font-extrabold text-slate-900">“默认标识前缀”</strong>与<strong class="font-extrabold text-slate-900">“推荐应用默认标签”</strong>才可解锁上传以及查看功能。
            </p>
            <div class="mb-6 space-y-4">
              <label class="block space-y-1.5">
                <span class="block text-[9px] font-black uppercase tracking-widest text-slate-400">格式标识前缀 (所有内属新建资产自动应用)</span>
                <input v-model="setupPrefix" type="text" placeholder="例: AI-PRE-, PROD-" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs font-bold uppercase text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/15" />
              </label>
              <label class="block space-y-1.5">
                <span class="block text-[9px] font-black uppercase tracking-widest text-slate-400">默认初始标签 (英文逗号分隔)</span>
                <input v-model="setupTags" type="text" placeholder="如: 真人, 冰雪, 爆点" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/15" />
              </label>
              <p v-if="setupError" class="rounded-xl bg-rose-50 px-3 py-2 text-[10px] font-black text-rose-600">{{ setupError }}</p>
            </div>
            <button type="button" class="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-xs font-black text-white shadow-md transition-all hover:bg-black" @click="saveFolderSetup">
              <Check class="h-4 w-4" />
              保存设置并激活此资产库
            </button>
          </div>

          <div v-else-if="showFolderGrid" class="space-y-6">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">子文件夹结构</h3>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <article
                v-for="subNode in activeNode.children"
                :key="subNode.name"
                class="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-150/60 bg-white p-4 shadow-3xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-250 hover:shadow-xs"
                @click="currentPath = [...currentPath, subNode.name]"
              >
                <div>
                  <div class="mb-4 flex items-center justify-between">
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                      <Layers class="h-4.5 w-4.5" />
                    </div>
                    <div class="flex items-center gap-1.5" @click.stop>
                      <span class="rounded-full border border-slate-100 bg-white px-2.5 py-0.5 text-[9.5px] font-bold text-slate-500">
                        {{ folderStatistics([...currentPath, subNode.name]).totalCount }} 个资产
                      </span>
                      <button
                        type="button"
                        class="flex items-center justify-center rounded-md border border-slate-200/50 bg-white p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
                        title="管理资产库与配置"
                        @click="openFolderControl([...currentPath, subNode.name])"
                      >
                        <MoreHorizontal class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 class="text-xs font-black tracking-tight text-slate-800 transition-colors group-hover:text-indigo-600">{{ subNode.name }}</h4>
                  <span class="font-mono text-[9.5px] font-bold uppercase tracking-widest text-slate-400">{{ [...currentPath, subNode.name].join(' / ') }}</span>
                </div>
                <div class="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/50 bg-white p-2">
                  <div v-for="item in folderStatistics([...currentPath, subNode.name]).previews" :key="item.id" class="relative aspect-square overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    <img :src="item.previewUrl" :alt="item.name" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                    <div class="absolute inset-x-0 bottom-0 bg-black/50 px-1 py-0.5 text-center">
                      <p class="truncate text-[9.5px] font-bold leading-none text-white">{{ item.name }}</p>
                    </div>
                  </div>
                  <div
                    v-for="index in Math.max(0, 4 - folderStatistics([...currentPath, subNode.name]).previews.length)"
                    :key="`empty-${subNode.name}-${index}`"
                    class="flex aspect-square items-center justify-center rounded-lg border border-dashed border-slate-200/60 bg-slate-50 text-slate-300"
                  >
                    <Layers class="h-4 w-4 opacity-30" />
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div v-else-if="filteredItems.length === 0" class="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-center">
            <Database class="h-9 w-9 text-slate-300" />
            <div class="mt-3 text-sm font-black text-slate-700">当前目录下没有符合「{{ activeFacetLabel }}」的资产</div>
            <p class="mt-1 text-xs font-bold text-slate-400">可以清除筛选，或上传素材并补充类型标签。</p>
          </div>

          <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            <AssetCard
              v-for="item in filteredItems"
              :key="item.id"
              :item="item"
              :playing="playingCardId === item.id"
              :selected="selectedAssetIds.includes(item.id)"
              @open="selectedDetailItem = $event"
              @toggle-select="toggleAssetSelection"
              @toggle-play="playingCardId = playingCardId === $event ? null : $event"
              @create-iteration="createIterationAsset"
            />
          </div>
        </div>
    </main>

    <DetailModal
      :selected-detail-item="selectedDetailItem"
      :available-assets="libraryItems"
      @close="selectedDetailItem = null"
      @save="saveDetailItem"
      @create-iteration="createIterationAsset"
    />
    <CreateLibraryModal
      :open="createModalOpen"
      :folder-tree="folderTree"
      :library-items="libraryItems"
      :initial-parent-path="createParentPath"
      @close="createModalOpen = false"
      @create="createLibrary"
    />

    <div v-if="isUploadModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm">
      <div class="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div class="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <div class="flex items-center gap-2.5">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white"><Plus class="h-4 w-4" /></div>
            <div><h3 class="text-xs font-black tracking-tight text-slate-800">上传广告创意素材</h3><p class="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Upload Asset Module</p></div>
          </div>
          <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600" @click="isUploadModalOpen = false"><X class="h-4 w-4" /></button>
        </div>
        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 no-scrollbar">
          <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">本地附件/素材上传 *</label>
          <label
            :class="`flex cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 transition-all hover:bg-slate-50 ${isDragging ? 'border-slate-900 bg-slate-100/50' : 'border-slate-200 bg-slate-50/30'}`"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="
              isDragging = false;
              appendFiles($event.dataTransfer.files)
            "
          >
            <input type="file" multiple class="hidden" @change="appendFiles($event.target.files)" />
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shadow-inner"><Paperclip class="h-4 w-4" /></div>
            <div class="text-center">
              <p class="text-[11px] font-bold text-slate-700">将本地素材与创意附件拖拽至此，或 <span class="font-black text-indigo-600">点击浏览文件</span></p>
              <p class="mt-0.5 text-[9px] font-bold tracking-tight text-slate-400">支持 MP4, MOV, PNG, JPG, GIF, JSON 等所有格式附件</p>
            </div>
          </label>
          <div v-if="uploadAttachments.length > 0" class="space-y-1.5">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">已添加的附件列表 ({{ uploadAttachments.length }})</label>
            <div class="max-h-32 divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-100 bg-white no-scrollbar">
              <div v-for="(attachment, index) in uploadAttachments" :key="`${attachment.name}-${index}`" class="flex items-center justify-between p-2.5 hover:bg-slate-50">
                <div class="flex min-w-0 items-center gap-2"><FileText class="h-4 w-4 shrink-0 text-slate-400" /><div class="truncate"><p class="truncate text-[11px] font-bold text-slate-700">{{ attachment.name }}</p><p class="font-mono text-[8.5px] font-bold tracking-wider text-slate-400">{{ attachment.sizeStr }}</p></div></div>
                <button type="button" class="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500" @click="removeAttachment(index)"><X class="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
          <p class="text-[10.5px] font-medium text-slate-400">支持多行输入（批量上传模式），每行代表一个独立的创意素材。</p>
          <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">素材创意名称 *（随附件自动解析，并支持手动修改）</label>
          <textarea v-model="batchNamesText" placeholder="请输入素材名称。每行输入一个创意，若上传单个创意则只输入一行。" class="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/15" />
          <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">归属资产微分子库 *</label>
          <div class="max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-1 no-scrollbar">
            <button v-for="leaf in leafFolders" :key="leaf.path.join('/')" type="button" :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold ${selectedUploadFolder === leaf.name ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`" @click="selectedUploadFolder = leaf.name">
              <span>{{ leaf.system === 'Fragment' ? '🎬' : '📦' }} {{ leaf.path.join(' > ') }}</span>
            </button>
          </div>
        </div>
        <div class="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4">
          <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700" @click="isUploadModalOpen = false">取消</button>
          <button type="button" class="rounded-xl bg-slate-900 px-5 py-2 text-[11px] font-black text-white shadow-md" @click="uploadAssets">确认并上传</button>
        </div>
      </div>
    </div>

    <div v-if="isMoveModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm">
      <div class="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div class="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <div class="flex items-center gap-2.5"><div class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Layers class="h-4 w-4" /></div><div><h3 class="text-xs font-black tracking-tight text-slate-800">批量整理移动资产</h3><p class="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Move & Reorganize Module</p></div></div>
          <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600" @click="isMoveModalOpen = false"><X class="h-4 w-4" /></button>
        </div>
        <div class="space-y-5 p-6 text-left">
          <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
            <p class="text-xs font-bold text-slate-600">当前已选择 <strong class="font-black text-indigo-600">{{ selectedAssetIds.length }}</strong> 个广告资产。</p>
            <p class="mt-1 text-[10px] text-slate-400">请选择目的微分子库。移动后，这些资产将彻底划归该资产库旗下。</p>
          </div>
          <div v-if="!isCreatingInMove" class="space-y-4">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">选择已有目的微分子库 *</label>
            <div class="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-1 no-scrollbar">
              <button v-for="leaf in leafFolders" :key="leaf.path.join('/')" type="button" :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold ${targetMoveFolder === leaf.name ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`" @click="targetMoveFolder = leaf.name">
                <span>{{ leaf.system === 'Fragment' ? '🎬' : '📦' }} {{ leaf.path.join(' > ') }}</span>
              </button>
            </div>
            <div class="text-center">
              <button type="button" class="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black text-indigo-600 underline hover:text-indigo-800" @click="isCreatingInMove = true; newMoveLibName = ''; newMoveLibSystem = 'Fragment'">
                <Plus class="h-3.5 w-3.5" />
                ➕ 新建目的资产库并移入资产
              </button>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
              <p class="text-[10px] font-bold text-indigo-700">您正在创建一个全新的资产库并将选中的 {{ selectedAssetIds.length }} 个资产进行存入。</p>
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">目的微分子库分类体系 *</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="option in [{ key: 'Fragment', label: '🎬 片段分类层级 (Fragments Hierarchy)' }, { key: 'Component', label: '📦 组件分类层级 (Components Hierarchy)' }]"
                  :key="option.key"
                  type="button"
                  :class="`rounded-xl border px-3 py-2 text-left text-xs font-black ${newMoveLibSystem === option.key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'}`"
                  @click="newMoveLibSystem = option.key"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            <label class="block space-y-1.5">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400">新建目的资产库名称 *</span>
              <input v-model="newMoveLibName" type="text" placeholder="请输入资产库名称" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" />
            </label>
            <div class="text-center">
              <button type="button" class="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 underline hover:text-slate-800" @click="isCreatingInMove = false">
                🔙 返回选择已有资产库
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4">
          <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700" @click="isMoveModalOpen = false">取消</button>
          <button type="button" class="rounded-xl bg-slate-900 px-5 py-2 text-[11px] font-black text-white shadow-md" @click="moveAssets">确认并移动</button>
        </div>
      </div>
    </div>

    <div v-if="isFolderControlOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm">
      <div class="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div class="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <div class="flex items-center gap-2.5">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><MoreHorizontal class="h-4 w-4" /></div>
            <div>
              <h3 class="text-xs font-black tracking-tight text-slate-800">资产库属性信息与安全配置</h3>
              <p class="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Asset Library Properties & Administration</p>
            </div>
          </div>
          <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600" @click="isFolderControlOpen = false"><X class="h-4 w-4" /></button>
        </div>
        <div class="flex-1 space-y-5 overflow-y-auto p-6 text-left no-scrollbar">
          <label class="space-y-1.5 block">
            <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400">资产库名称 *</span>
            <input v-model="controlNodeName" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/15" placeholder="请输入创意资产库名称" />
          </label>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label class="space-y-1.5 block">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400">默认初始前缀</span>
              <input v-model="controlNodePrefix" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none" placeholder="例如: AI-PRE-" />
            </label>
            <label class="space-y-1.5 block">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400">默认初始标签 (逗号分隔)</span>
              <input v-model="controlNodeTags" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none" placeholder="如: 真人, 冰雪" />
            </label>
          </div>
          <div class="border-t border-slate-100 pt-4">
            <div class="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
              <div class="flex items-start gap-2.5">
                <Info class="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <div>
                  <h4 class="text-[11px] font-black leading-none text-slate-800">敏感管理员操作：强制删除子资产库</h4>
                  <p class="mt-1 text-[10px] font-semibold leading-snug text-slate-500">删除该分属资产库为极度高危动作，将永久移除与之关联的分类结构！此动作需要通过超级管理员授权并输入特权凭证。</p>
                </div>
              </div>
              <button v-if="!showAdminConfirm" type="button" class="flex w-full items-center justify-center gap-1 rounded-xl border border-rose-200/60 bg-rose-50 py-2 text-[10.5px] font-bold text-rose-600 hover:bg-rose-100" @click="showAdminConfirm = true">🔒 解锁删除此资产库</button>
              <div v-else class="space-y-3 p-1">
                <label class="space-y-1 block">
                  <span class="block text-[9px] font-black uppercase tracking-widest text-slate-400">超级管理员特权密码确认 *</span>
                  <input v-model="adminPassword" type="password" class="w-full rounded-xl border border-rose-200/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-200" placeholder="请输入超级管理员密码（默认：admin）" />
                </label>
                <div class="flex gap-2">
                  <button type="button" class="flex-1 rounded-xl bg-rose-600 py-2 text-[10.5px] font-black text-white shadow-sm hover:bg-rose-700" @click="deleteFolderWithPass">💥 确认强制删除</button>
                  <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10.5px] font-bold text-slate-500 hover:bg-slate-50" @click="showAdminConfirm = false; adminPassword = ''">取消</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4">
          <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50" @click="isFolderControlOpen = false">放弃保存</button>
          <button type="button" class="rounded-xl bg-slate-900 px-5 py-2 text-[11px] font-black text-white shadow-md hover:bg-black" @click="saveFolderControl">保存资产库配置</button>
        </div>
      </div>
    </div>
  </section>
</template>
