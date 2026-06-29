<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3'
import {
  Check,
  ChevronDown,
  Download,
  Filter,
  Maximize,
  MousePointer2,
  Play,
  Plus,
  Search,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'

const INITIAL_TESTING_DATA = {
  id: 'test-root',
  name: '测试阶段',
  type: 'root',
  children: [
    {
      id: 'test-cat-1',
      name: '母版',
      type: 'category',
      children: [
        {
          id: 'test-master-1',
          name: '母版1',
          type: 'master',
          previewUrl: 'https://picsum.photos/seed/m1/200/120',
          children: [
            {
              id: 'test-dir-1',
              name: '复测改动方向1',
              type: 'direction',
              children: [
                { id: 'test-pt-1', name: '方向1 - 验证点1', type: 'point', videos: ['视频A', '视频B'] },
                { id: 'test-pt-2', name: '方向1 - 验证点2', type: 'point', videos: ['视频C'] },
              ],
            },
            {
              id: 'test-dir-2',
              name: '复测改动方向2',
              type: 'direction',
              children: [
                { id: 'test-pt-3', name: '方向1 - 验证点1', type: 'point', videos: ['视频D', '视频E'] },
                { id: 'test-pt-4', name: '方向1 - 验证点2', type: 'point', videos: ['视频F'] },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const INITIAL_EXISTING_DATA = {
  id: 'existing-root',
  name: '已有母版',
  type: 'root',
  children: [
    {
      id: 'existing-master-1',
      name: '大字报v1',
      type: 'master',
      videos: ['预览视频1', '预览视频2'],
      children: [
        {
          id: 'existing-mod-1',
          name: '模块1',
          type: 'module',
          children: [
            { id: 'existing-iter-1', name: '迭代1', type: 'iteration', videos: ['视频1', '视频2'] },
            { id: 'existing-iter-2', name: '迭代2', type: 'iteration', videos: ['视频3'] },
          ],
        },
      ],
    },
  ],
}

const activeTab = ref('testing')
const searchQuery = ref('')
const filterLevel = ref('all')
const isFilterMenuOpen = ref(false)
const zoomLevel = ref(100)
const playingVideo = ref(null)
const testingData = ref(INITIAL_TESTING_DATA)
const existingData = ref(INITIAL_EXISTING_DATA)
const iterationRootRef = ref(null)
const svgRef = ref(null)
const containerRef = ref(null)
let zoomBehavior = null

const filterLevelOptions = [
  { value: 'all', label: '所有层级' },
  { value: 'master', label: '母版层' },
  { value: 'direction', label: '方向层' },
  { value: 'point', label: '验证点层' },
  { value: 'module', label: '模块层' },
  { value: 'iteration', label: '迭代层' },
]

const currentData = computed(() => (activeTab.value === 'testing' ? testingData.value : existingData.value))

const filterNode = (node) => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query && filterLevel.value === 'all') return node

  const matchesSearch = node.name.toLowerCase().includes(query)
  const matchesLevel = filterLevel.value === 'all' || node.type === filterLevel.value
  const filteredChildren = node.children ? node.children.map(filterNode).filter(Boolean) : []

  if (matchesSearch && matchesLevel) return { ...node, children: filteredChildren }
  if (filteredChildren.length > 0) return { ...node, children: filteredChildren }
  return null
}

const filteredData = computed(() => filterNode(currentData.value) || { ...currentData.value, children: [] })

const updateTree = (node, parentId) => {
  if (node.id === parentId) {
    return {
      ...node,
      children: [
        ...(node.children || []),
        {
          id: `node-${Date.now()}`,
          name: '新节点',
          type: 'iteration',
          children: [],
        },
      ],
    }
  }
  if (!node.children) return node
  return { ...node, children: node.children.map((child) => updateTree(child, parentId)) }
}

const addNode = (parentId) => {
  if (activeTab.value === 'testing') {
    testingData.value = updateTree(testingData.value, parentId)
  } else {
    existingData.value = updateTree(existingData.value, parentId)
  }
}

const drawTree = async () => {
  await nextTick()
  if (!svgRef.value || !containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const g = svg.append('g')
  zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
      zoomLevel.value = Math.round(event.transform.k * 100)
    })

  svg.call(zoomBehavior)

  const root = d3.hierarchy(filteredData.value)
  const treeLayout = d3.tree().nodeSize([250, 400])
  treeLayout(root)

  g.append('g')
    .attr('fill', 'none')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5)
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr('d', d3.linkHorizontal().x((d) => d.y).y((d) => d.x))

  const node = g.append('g')
    .selectAll('g')
    .data(root.descendants())
    .join('g')
    .attr('transform', (d) => `translate(${d.y},${d.x})`)

  node.each(function renderNode(d) {
    const el = d3.select(this)
    const isRoot = d.depth === 0
    const data = d.data
    const cardWidth = 220
    const hasVideos = data.videos && data.videos.length > 0
    const hasPreview = Boolean(data.previewUrl)
    let cardHeight = 40

    if (isRoot && (hasPreview || hasVideos)) {
      cardHeight = 160
    } else if (!isRoot && hasVideos) {
      cardHeight = 40 + data.videos.length * 20 + 10
    }

    el.append('rect')
      .attr('x', 0)
      .attr('y', -cardHeight / 2)
      .attr('width', cardWidth)
      .attr('height', cardHeight)
      .attr('rx', 12)
      .attr('fill', isRoot ? '#0f172a' : '#ffffff')
      .attr('stroke', isRoot ? '#0f172a' : '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('class', 'shadow-sm transition-all hover:shadow-md')

    el.append('text')
      .attr('x', 12)
      .attr('y', -cardHeight / 2 + 24)
      .attr('fill', isRoot ? '#ffffff' : '#1e293b')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(data.name)

    const addButton = el.append('g')
      .attr('transform', `translate(${cardWidth - 30}, ${-cardHeight / 2 + 10})`)
      .attr('class', 'cursor-pointer group')
      .on('click', (event) => {
        event.stopPropagation()
        addNode(data.id)
      })

    addButton.append('circle')
      .attr('r', 10)
      .attr('fill', isRoot ? 'rgba(255,255,255,0.1)' : '#f1f5f9')
      .attr('class', 'group-hover:fill-primary/10 transition-colors')

    addButton.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', isRoot ? '#ffffff' : '#64748b')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('+')

    if (isRoot && (data.previewUrl || hasVideos)) {
      const previewWidth = cardWidth - 24
      const previewHeight = 100
      const centerY = -cardHeight / 2 + 36 + previewHeight / 2

      el.append('rect')
        .attr('x', 12)
        .attr('y', -cardHeight / 2 + 36)
        .attr('width', previewWidth)
        .attr('height', previewHeight)
        .attr('rx', 8)
        .attr('fill', '#f8fafc')

      el.append('image')
        .attr('href', data.previewUrl || `https://picsum.photos/seed/${data.id}/200/120`)
        .attr('x', 12)
        .attr('y', -cardHeight / 2 + 36)
        .attr('width', previewWidth)
        .attr('height', previewHeight)
        .attr('preserveAspectRatio', 'xMidYMid slice')
        .attr('style', 'clip-path: inset(0% round 8px);')

      el.append('circle')
        .attr('cx', cardWidth / 2)
        .attr('cy', centerY)
        .attr('r', 15)
        .attr('fill', 'rgba(0,0,0,0.4)')
        .attr('class', 'cursor-pointer hover:fill-black/60 transition-colors')
        .on('click', () => {
          playingVideo.value = { name: data.name, id: data.id }
        })

      el.append('path')
        .attr('d', 'M-4,-5 L6,0 L-4,5 Z')
        .attr('transform', `translate(${cardWidth / 2}, ${centerY})`)
        .attr('fill', '#ffffff')
        .attr('pointer-events', 'none')
    } else if (hasVideos) {
      const videoGroup = el.append('g')
        .attr('transform', `translate(12, ${-cardHeight / 2 + 40})`)

      data.videos.forEach((videoName, index) => {
        const videoItem = videoGroup.append('g')
          .attr('transform', `translate(0, ${index * 20})`)
          .attr('class', 'cursor-pointer group')
          .on('click', (event) => {
            event.stopPropagation()
            playingVideo.value = { name: videoName, id: `${data.id}-${index}` }
          })

        videoItem.append('rect')
          .attr('x', -4)
          .attr('y', -12)
          .attr('width', cardWidth - 16)
          .attr('height', 18)
          .attr('rx', 4)
          .attr('fill', 'transparent')
          .attr('class', 'group-hover:fill-slate-100 transition-colors')

        videoItem.append('text')
          .attr('x', 0)
          .attr('y', 2)
          .attr('fill', '#64748b')
          .attr('font-size', '10px')
          .attr('class', 'group-hover:fill-primary group-hover:font-bold transition-all')
          .text(`▶ ${videoName}`)
      })
    }
  })

  const initialTransform = d3.zoomIdentity.translate(100, height / 2).scale(0.6)
  svg.call(zoomBehavior.transform, initialTransform)
  if (width <= 0) zoomLevel.value = 60
}

const zoomIn = () => {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().call(zoomBehavior.scaleBy, 1.2)
}

const zoomOut = () => {
  if (!svgRef.value || !zoomBehavior) return
  d3.select(svgRef.value).transition().call(zoomBehavior.scaleBy, 0.8)
}

const resetZoom = () => {
  if (!svgRef.value || !containerRef.value || !zoomBehavior) return
  const height = containerRef.value.clientHeight
  const initialTransform = d3.zoomIdentity.translate(100, height / 2).scale(0.6)
  d3.select(svgRef.value).transition().call(zoomBehavior.transform, initialTransform)
}

const selectFilterLevel = (value) => {
  filterLevel.value = value
  isFilterMenuOpen.value = false
}

const closeOpenMenus = () => {
  isFilterMenuOpen.value = false
}

const handleDocumentClick = (event) => {
  if (!iterationRootRef.value?.contains(event.target)) closeOpenMenus()
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeOpenMenus()
}

watch([filteredData, activeTab], drawTree, { deep: true })

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
  drawTree()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
  d3.select(svgRef.value).on('.zoom', null)
})
</script>

<template>
  <div ref="iterationRootRef" class="flex h-full flex-col overflow-hidden bg-slate-50">
    <div class="flex shrink-0 flex-col border-b border-slate-200 bg-white">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-bold text-slate-900">迭代记录</h2>
          <div class="flex rounded-xl bg-slate-100 p-1">
            <button
              v-for="tab in [
                { value: 'testing', label: '测试阶段' },
                { value: 'existing', label: '已有母版' },
              ]"
              :key="tab.value"
              :class="`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === tab.value ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`"
              type="button"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="mr-4 flex items-center rounded-xl bg-slate-100 p-1">
            <button class="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white hover:text-slate-900" type="button" @click="zoomOut">
              <ZoomOut class="h-4 w-4" />
            </button>
            <span class="min-w-[40px] px-2 text-center text-[10px] font-bold text-slate-600">{{ zoomLevel }}%</span>
            <button class="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white hover:text-slate-900" type="button" @click="zoomIn">
              <ZoomIn class="h-4 w-4" />
            </button>
            <div class="mx-1 h-4 w-px bg-slate-200" />
            <button class="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white hover:text-slate-900" type="button" @click="resetZoom">
              <Maximize class="h-4 w-4" />
            </button>
          </div>
          <button class="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800" type="button">
            <Share2 class="h-4 w-4" />
            分享画板
          </button>
          <button class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50" type="button">
            <Download class="h-4 w-4" />
            导出
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4 px-6 pb-4">
        <div class="relative max-w-md flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-9 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="搜索节点名称..."
            type="text"
          />
          <button v-if="searchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" type="button" @click="searchQuery = ''">
            <X class="h-3 w-3" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <Filter class="h-4 w-4 text-slate-400" />
          <div class="relative">
            <button
              :class="`inline-flex h-9 min-w-[116px] items-center justify-between gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${
                filterLevel === 'all'
                  ? 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`"
              type="button"
              @click.stop="isFilterMenuOpen = !isFilterMenuOpen"
            >
              <span>{{ filterLevelOptions.find((item) => item.value === filterLevel)?.label || '所有层级' }}</span>
              <ChevronDown :class="`h-3.5 w-3.5 shrink-0 transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`" />
            </button>
            <div v-if="isFilterMenuOpen" class="absolute left-0 top-full z-[120] mt-2 w-36 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <button
                v-for="option in filterLevelOptions"
                :key="option.value"
                :class="`flex h-8 w-full items-center justify-between rounded-xl px-3 text-left text-[11px] font-black transition-all ${
                  filterLevel === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`"
                type="button"
                @click.stop="selectFilterLevel(option.value)"
              >
                <span>{{ option.label }}</span>
                <Check v-if="filterLevel === option.value" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
              </button>
            </div>
          </div>
        </div>

        <div class="ml-auto text-[10px] font-bold text-slate-400">共 {{ filteredData.children?.length || 0 }} 个主分支</div>
      </div>
    </div>

    <div ref="containerRef" class="relative flex-1 overflow-hidden bg-slate-100">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.03]"
        :style="{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: `${20 * (zoomLevel / 100)}px ${20 * (zoomLevel / 100)}px` }"
      />

      <svg ref="svgRef" class="h-full w-full cursor-grab active:cursor-grabbing" />

      <div v-if="playingVideo" class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-10 backdrop-blur-sm">
        <div class="flex h-full max-h-[800px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div class="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Play class="h-4 w-4 fill-primary text-primary" />
              </div>
              <h3 class="text-sm font-bold text-slate-900">{{ playingVideo.name }}</h3>
            </div>
            <button class="rounded-full p-2 transition-colors hover:bg-slate-100" type="button" @click="playingVideo = null">
              <X class="h-5 w-5 text-slate-400" />
            </button>
          </div>
          <div class="group relative flex flex-1 items-center justify-center bg-slate-900">
            <div class="relative h-full aspect-[9/16] bg-black shadow-2xl">
              <img :src="`https://picsum.photos/seed/${playingVideo.id}/1080/1920`" alt="Video Preview" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md transition-transform group-hover:scale-110">
                  <Play class="h-8 w-8 fill-white text-white" />
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div class="h-full w-1/3 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
            <div class="flex items-center gap-4">
              <button class="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900" type="button">
                <Download class="h-4 w-4" />
                下载视频
              </button>
              <button class="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900" type="button">
                <Share2 class="h-4 w-4" />
                分享
              </button>
            </div>
            <div class="text-[10px] font-bold text-slate-400">分辨率: 1080 x 1920 (9:16)</div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-6 left-6 flex flex-col gap-2">
        <div class="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-xl backdrop-blur-md">
          <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <MousePointer2 class="h-3 w-3" />
            拖拽移动，滚轮缩放
          </div>
          <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <Plus class="h-3 w-3" />
            点击节点右上角添加子节点
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
