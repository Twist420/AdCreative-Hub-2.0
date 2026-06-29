<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'
import TagName from './tag-management/TagName.vue'

const initialData = [
  {
    id: 'ab-tags',
    name: 'AB段标签',
    level: 1,
    children: [
      {
        id: 'a-seg',
        name: 'A段标签',
        level: 2,
        children: [
          {
            id: 'a-content',
            name: '标签内容',
            level: 3,
            children: [
              { id: 'a1', name: '卖点宣传', level: 4 },
              { id: 'a2', name: '玩法', level: 4 },
              { id: 'a3', name: '氛围贴片', level: 4 },
              { id: 'a4', name: '热门视频', level: 4 },
              { id: 'a5', name: '剧情', level: 4 },
            ],
          },
        ],
      },
      {
        id: 'b-seg',
        name: 'B段标签',
        level: 2,
        children: [
          {
            id: 'b-content',
            name: '标签内容',
            level: 3,
            children: [
              { id: 'b1', name: '玩法主导', level: 4 },
              { id: 'b2', name: '卖点主导', level: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'universal-tags',
    name: '通用标签',
    level: 1,
    children: [
      {
        id: 'u1',
        name: '出现角色',
        level: 2,
        children: [
          {
            id: 'u1-1',
            name: '角色形象',
            level: 3,
            type: 'single',
            children: [
              {
                id: 'u1-1-1',
                name: '真人角色',
                level: 4,
                children: [
                  { id: 'u1-1-1-1', name: '女boss', level: 5 },
                  { id: 'u1-1-1-2', name: '老爷子', level: 5 },
                  { id: 'u1-1-1-3', name: '帅哥', level: 5 },
                ],
              },
              {
                id: 'u1-1-2',
                name: '卡通人物',
                level: 4,
                children: [
                  { id: 'u1-1-2-1', name: '红仙子', level: 5 },
                  { id: 'u1-1-2-2', name: 'max', level: 5 },
                ],
              },
              {
                id: 'u1-1-3',
                name: '动物角色',
                level: 4,
                children: [
                  { id: 'u1-1-3-1', name: '其他', level: 5 },
                ],
              },
              { id: 'u1-1-4', name: '无', level: 4 },
            ],
          },
          {
            id: 'u1-2',
            name: '角色身份',
            level: 3,
            children: [
              { id: 'u1-2-1', name: 'Boss', level: 4 },
              { id: 'u1-2-2', name: '玩家', level: 4 },
              { id: 'u1-2-3', name: '宠物', level: 4 },
            ],
          },
          {
            id: 'u1-3',
            name: '角色性别',
            level: 3,
            children: [
              { id: 'u1-3-1', name: '男性', level: 4 },
              { id: 'u1-3-2', name: '女性', level: 4 },
            ],
          },
          {
            id: 'u1-4',
            name: '角色年龄层',
            level: 3,
            children: [
              { id: 'u1-4-1', name: '幼年', level: 4 },
              { id: 'u1-4-2', name: '少年', level: 4 },
              { id: 'u1-4-3', name: '青年', level: 4 },
              { id: 'u1-4-4', name: '中年', level: 4 },
              { id: 'u1-4-5', name: '老年', level: 4 },
            ],
          },
        ],
      },
      {
        id: 'u2',
        name: '玩法',
        level: 2,
        children: [
          {
            id: 'u2-1',
            name: '玩法类型',
            level: 3,
            type: 'multi',
            children: [
              { id: 'u2-1-1', name: '原始三合', level: 4 },
              { id: 'u2-1-2', name: '非原始三合', level: 4 },
              { id: 'u2-1-3', name: '整理', level: 4 },
              { id: 'u2-1-4', name: '其他', level: 4 },
              { id: 'u2-1-5', name: '无', level: 4 },
            ],
          },
          {
            id: 'u2-2',
            name: '玩法体验',
            level: 3,
            children: [
              { id: 'u2-2-1', name: '成长感', level: 4 },
              { id: 'u2-2-2', name: '秩序感', level: 4 },
              { id: 'u2-2-3', name: '探索感', level: 4 },
            ],
          },
        ],
      },
      {
        id: 'u3',
        name: '情绪',
        level: 2,
        children: [
          {
            id: 'u3-1',
            name: '氛围情绪',
            level: 3,
            type: 'multi',
            children: [
              { id: 'u3-1-1', name: '舒缓', level: 4 },
              { id: 'u3-1-2', name: '激昂', level: 4 },
              { id: 'u3-1-3', name: '同情', level: 4 },
              { id: 'u3-1-4', name: '好奇', level: 4 },
              { id: 'u3-1-5', name: '愉悦', level: 4 },
              { id: 'u3-1-6', name: '解压', level: 4 },
              { id: 'u3-1-7', name: '爽感', level: 4 },
              { id: 'u3-1-8', name: '成就感', level: 4 },
              { id: 'u3-1-9', name: '紧迫', level: 4 },
              { id: 'u3-1-10', name: '搞笑', level: 4 },
              { id: 'u3-1-11', name: '其他', level: 4 },
            ],
          },
        ],
      },
      {
        id: 'u4',
        name: '文案',
        level: 2,
        children: [
          {
            id: 'u4-1',
            name: '文案内容',
            level: 3,
            type: 'multi',
            children: [
              { id: 'u4-1-1', name: '权威引导', level: 4 },
              { id: 'u4-1-2', name: '身份认同', level: 4 },
              { id: 'u4-1-3', name: '奖励诱导', level: 4 },
              { id: 'u4-1-4', name: '解说', level: 4 },
              { id: 'u4-1-5', name: '基础卖点', level: 4 },
              { id: 'u4-1-6', name: '对比', level: 4 },
              { id: 'u4-1-7', name: '氛围渲染', level: 4 },
              { id: 'u4-1-8', name: '其他', level: 4 },
            ],
          },
        ],
      },
      {
        id: 'u5',
        name: '形式',
        level: 2,
        children: [
          {
            id: 'u5-1',
            name: '传达形式',
            level: 3,
            type: 'multi',
            children: [
              { id: 'u5-1-1', name: '大字报', level: 4 },
              { id: 'u5-1-2', name: '口播', level: 4 },
              { id: 'u5-1-3', name: '真人剧情', level: 4 },
              { id: 'u5-1-4', name: '动画剧情', level: 4 },
              { id: 'u5-1-5', name: '模拟互动', level: 4 },
              { id: 'u5-1-6', name: '氛围画面', level: 4 },
              { id: 'u5-1-7', name: '其他', level: 4 },
            ],
          },
          {
            id: 'u5-2',
            name: '视觉类型',
            level: 3,
            type: 'multi',
            children: [
              { id: 'u5-2-1', name: '2D', level: 4 },
              { id: 'u5-2-2', name: '3D', level: 4 },
              { id: 'u5-2-3', name: 'AI', level: 4 },
              { id: 'u5-2-4', name: '欧卡', level: 4 },
              { id: 'u5-2-5', name: '漫画', level: 4 },
              { id: 'u5-2-6', name: '写实', level: 4 },
            ],
          },
        ],
      },
      {
        id: 'u6',
        name: '落板',
        level: 2,
        children: [
          {
            id: 'u6-1',
            name: '落板类型',
            level: 3,
            type: 'single',
            children: [
              { id: 'u6-1-1', name: '关卡', level: 4 },
              { id: 'u6-1-2', name: '氛围', level: 4 },
            ],
          },
        ],
      },
      {
        id: 'u7',
        name: '节日/活动',
        level: 2,
        children: [
          {
            id: 'u7-1',
            name: '节日',
            level: 3,
            type: 'single',
            children: [
              { id: 'u7-1-1', name: '圣诞节', level: 4 },
              { id: 'u7-1-2', name: '春节', level: 4 },
              { id: 'u7-1-3', name: '情人节', level: 4 },
              { id: 'u7-1-4', name: '圣帕特里克节', level: 4 },
              { id: 'u7-1-5', name: '复活节', level: 4 },
              { id: 'u7-1-6', name: '母亲节', level: 4 },
              { id: 'u7-1-7', name: '独立日', level: 4 },
              { id: 'u7-1-8', name: '周年庆', level: 4 },
              { id: 'u7-1-9', name: '游戏大活', level: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'creative-tags',
    name: '创意标签',
    level: 1,
    children: [
      {
        id: 'c1',
        name: '选择题',
        level: 2,
        children: [
          {
            id: 'c1-content',
            name: '标签内容',
            level: 3,
            children: [
              { id: 'c1-1', name: '手写', level: 4 },
              { id: 'c1-2', name: 'meme', level: 4 },
              { id: 'c1-3', name: '杯子', level: 4 },
              { id: 'c1-4', name: '真人手指卖点', level: 4 },
              { id: 'c1-5', name: '帅哥', level: 4 },
            ],
          },
        ],
      },
    ],
  },
]

const flattenTags = (nodes = []) => nodes.flatMap((node) => {
  const { children, ...tag } = node
  return [
    { ...tag, level: 4, hidden: false },
    ...flattenTags(children || []),
  ]
})

const normalizeTagTree = (nodes) => nodes.map((root) => ({
  ...root,
  level: 1,
  children: (root.children || []).map((group) => ({
    ...group,
    level: 2,
    children: (group.children || []).map((tagGroup) => ({
      ...tagGroup,
      level: 3,
      hidden: Boolean(tagGroup.hidden),
      children: flattenTags(tagGroup.children || []),
    })),
  })),
}))

const tags = ref(normalizeTagTree(initialData))
const searchQuery = ref('')
const editingId = ref(null)
const tempName = ref('')
const pendingDeleteId = ref(null)
const draggingTagId = ref(null)
const expandedIds = ref(new Set(['ab-tags', 'a-seg', 'a-content', 'universal-tags', 'u1', 'u1-1', 'u2', 'u2-1']))
const inputRef = ref(null)
const scrollContainerRef = ref(null)
const autoScrollFrameRef = ref(null)
const autoScrollDeltaRef = ref(0)

const cloneNode = (node) => ({
  ...node,
  children: node.children ? node.children.map(cloneNode) : undefined,
})

const filterNode = (node, query) => {
  if (!query) return cloneNode(node)
  const matched = node.name.toLowerCase().includes(query)
  const children = (node.children || []).map((child) => filterNode(child, query)).filter(Boolean)
  if (matched || children.length > 0) return { ...node, children }
  return null
}

const visibleTags = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return tags.value.map((node) => filterNode(node, query)).filter(Boolean)
})

const countLeafTags = (node) => {
  if (!node.children || node.children.length === 0) return node.level >= 4 ? 1 : 0
  return node.children.reduce((sum, child) => sum + countLeafTags(child), 0)
}

const findNodeAndParent = (nodes, id, parentList = null) => {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (node.id === id) return { node, parentList: parentList || nodes, index }
    if (node.children) {
      const found = findNodeAndParent(node.children, id, node.children)
      if (found) return found
    }
  }
  return null
}

const toggleExpand = (id) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

const startEdit = async (node) => {
  editingId.value = node.id
  tempName.value = node.name
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

const saveEdit = () => {
  if (!editingId.value) return
  const found = findNodeAndParent(tags.value, editingId.value)
  if (found && tempName.value.trim()) {
    found.node.name = tempName.value.trim()
  }
  editingId.value = null
}

const addChild = (parentId) => {
  const found = findNodeAndParent(tags.value, parentId)
  if (!found || found.node.level >= 4) return
  const nextLevel = found.node.level + 1
  const node = {
    id: `tag-${Date.now()}`,
    name: nextLevel === 2 ? '新子分组' : nextLevel === 3 ? '新标签组' : '新标签',
    level: nextLevel,
    type: 'none',
    hidden: false,
    children: nextLevel < 4 ? [] : undefined,
  }
  found.node.children = [...(found.node.children || []), node]
  expandedIds.value = new Set(expandedIds.value).add(parentId)
  startEdit(node)
}

const requestDeleteNode = (id) => {
  pendingDeleteId.value = id
}

const confirmDeleteNode = () => {
  if (!pendingDeleteId.value) return
  const id = pendingDeleteId.value
  const found = findNodeAndParent(tags.value, id)
  if (!found) {
    pendingDeleteId.value = null
    return
  }
  found.parentList.splice(found.index, 1)
  pendingDeleteId.value = null
}

const handleTagDragStart = (node) => {
  if (node.level < 4) return
  draggingTagId.value = node.id
}

const stopDragAutoScroll = () => {
  autoScrollDeltaRef.value = 0
  if (autoScrollFrameRef.value !== null) {
    cancelAnimationFrame(autoScrollFrameRef.value)
    autoScrollFrameRef.value = null
  }
}

const runDragAutoScroll = () => {
  const container = scrollContainerRef.value
  if (!container || !draggingTagId.value || autoScrollDeltaRef.value === 0) {
    stopDragAutoScroll()
    return
  }

  container.scrollBy({ top: autoScrollDeltaRef.value, behavior: 'auto' })
  autoScrollFrameRef.value = requestAnimationFrame(runDragAutoScroll)
}

const handleDragAutoScroll = (event) => {
  if (!draggingTagId.value) return

  const container = scrollContainerRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const edgeSize = 96
  const maxSpeed = 18
  const distanceToTop = event.clientY - rect.top
  const distanceToBottom = rect.bottom - event.clientY
  let nextDelta = 0

  if (distanceToTop < edgeSize) {
    nextDelta = -Math.ceil((1 - Math.max(distanceToTop, 0) / edgeSize) * maxSpeed)
  } else if (distanceToBottom < edgeSize) {
    nextDelta = Math.ceil((1 - Math.max(distanceToBottom, 0) / edgeSize) * maxSpeed)
  }

  autoScrollDeltaRef.value = nextDelta
  if (nextDelta !== 0 && autoScrollFrameRef.value === null) {
    autoScrollFrameRef.value = requestAnimationFrame(runDragAutoScroll)
  } else if (nextDelta === 0) {
    stopDragAutoScroll()
  }
}

const handleTagDragEnd = () => {
  stopDragAutoScroll()
  draggingTagId.value = null
}

const dropTagToGroup = (targetGroupId) => {
  stopDragAutoScroll()
  if (!draggingTagId.value || draggingTagId.value === targetGroupId) return
  const dragged = findNodeAndParent(tags.value, draggingTagId.value)
  const target = findNodeAndParent(tags.value, targetGroupId)
  if (!dragged || !target || dragged.node.level < 4 || target.node.level !== 3) {
    draggingTagId.value = null
    return
  }
  if (dragged.parentList === target.node.children) {
    draggingTagId.value = null
    return
  }
  const [movedNode] = dragged.parentList.splice(dragged.index, 1)
  const { children: _children, ...movedTag } = movedNode
  const normalizedNode = { ...movedTag, level: target.node.level + 1, hidden: false }
  target.node.children = [...(target.node.children || []), normalizedNode]
  expandedIds.value = new Set(expandedIds.value).add(targetGroupId)
  draggingTagId.value = null
}

const toggleHidden = (node) => {
  node.hidden = !node.hidden
}

const getModuleStyle = (name) => {
  if (name.includes('AB')) return 'border-indigo-100 bg-indigo-600'
  if (name.includes('通用')) return 'border-emerald-100 bg-emerald-600'
  return 'border-violet-100 bg-violet-600'
}

const pillTone = (id) => {
  const tones = [
    'border-rose-100 bg-rose-50 text-rose-600',
    'border-amber-100 bg-amber-50 text-amber-700',
    'border-emerald-100 bg-emerald-50 text-emerald-700',
    'border-sky-100 bg-sky-50 text-sky-700',
    'border-indigo-100 bg-indigo-50 text-indigo-700',
    'border-violet-100 bg-violet-50 text-violet-700',
  ]
  const sum = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return tones[sum % tones.length]
}

const visibleTagGroups = (group) => (group.children || []).filter((tagGroup) => !tagGroup.hidden)
const hiddenTagGroups = (group) => (group.children || []).filter((tagGroup) => tagGroup.hidden)

onBeforeUnmount(() => {
  stopDragAutoScroll()
})
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <div class="flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm transition-all">
      <div class="flex min-w-0 items-center gap-4">
        <div class="group relative">
          <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            class="w-64 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-[11px] outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10 md:w-80"
            placeholder="快速定位标签..."
            type="text"
          />
        </div>
      </div>
      <button class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-bold text-white shadow-lg transition-all hover:bg-black" type="button" @click="addChild(tags[0].id)">
        <Plus class="h-3.5 w-3.5" />
        新增顶层分类
      </button>
    </div>

    <div
      ref="scrollContainerRef"
      class="min-h-0 flex-1 overflow-auto pb-10 no-scrollbar"
      @dragover="handleDragAutoScroll"
      @dragleave="stopDragAutoScroll"
      @drop="stopDragAutoScroll"
    >
      <div class="space-y-5">
        <div v-for="root in visibleTags" :key="root.id" :class="`rounded-2xl border bg-white p-3 shadow-sm ${getModuleStyle(root.name).split(' ')[0]}`">
          <div class="mb-3 flex items-center gap-2 px-1">
            <div :class="`h-5 w-1.5 rounded-full shadow-sm ${getModuleStyle(root.name).split(' ')[1]}`" />
            <TagName :node="root" :editing-id="editingId" :temp-name="tempName" @start-edit="startEdit" @update-temp="tempName = $event" @save="saveEdit" @cancel="editingId = null" />
            <span class="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-400">{{ countLeafTags(root) }} 个标签</span>
            <button class="ml-auto inline-flex h-7 items-center gap-1 rounded-lg border border-slate-150 bg-slate-50 px-2 text-[10px] font-black text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600" type="button" @click="addChild(root.id)">
              <Plus class="h-3 w-3" />
              子分组
            </button>
          </div>

          <div class="space-y-3">
            <div v-for="group in root.children || []" :key="group.id" class="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
              <div class="mb-2 flex items-center gap-2">
                <div :class="`h-2 w-2 rounded-full ${getModuleStyle(root.name).split(' ')[1].replace('600', '400')} opacity-80`"></div>
                <TagName :node="group" :editing-id="editingId" :temp-name="tempName" @start-edit="startEdit" @update-temp="tempName = $event" @save="saveEdit" @cancel="editingId = null" />
                <span class="rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-400 ring-1 ring-slate-100">{{ countLeafTags(group) }}</span>
                <button class="ml-auto inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[9px] font-black text-slate-400 hover:bg-white hover:text-emerald-600" type="button" @click="addChild(group.id)">
                  <Plus class="h-3 w-3" />
                  标签组
                </button>
              </div>

              <div class="grid grid-cols-1 gap-2 lg:grid-cols-2 2xl:grid-cols-3">
                <div
                  v-for="tagGroup in visibleTagGroups(group)"
                  :key="tagGroup.id"
                  :class="`group rounded-xl border bg-white p-2.5 shadow-3xs transition-all ${draggingTagId ? 'border-dashed border-primary/40 bg-indigo-50/40 ring-1 ring-primary/10' : 'border-slate-100'}`"
                  @dragover.prevent
                  @drop.prevent="dropTagToGroup(tagGroup.id)"
                >
                  <div class="mb-2 flex items-center gap-1.5">
                    <TagName :node="tagGroup" :editing-id="editingId" :temp-name="tempName" @start-edit="startEdit" @update-temp="tempName = $event" @save="saveEdit" @cancel="editingId = null" />
                    <span v-if="tagGroup.type" :class="`rounded px-1 py-0.5 text-[8px] font-black ${tagGroup.type === 'single' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`">{{ tagGroup.type === 'single' ? '单选' : '多选' }}</span>
                    <span class="rounded bg-slate-50 px-1.5 py-0.5 text-[8px] font-black text-slate-400">{{ countLeafTags(tagGroup) }}</span>
                    <button class="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-300 opacity-0 transition-all hover:bg-slate-50 hover:text-slate-600 group-hover:opacity-100" type="button" title="隐藏标签组" @click="toggleHidden(tagGroup)">
                      <EyeOff class="h-3.5 w-3.5" />
                    </button>
                    <button class="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[9px] font-black text-slate-400 opacity-0 transition-all hover:bg-slate-50 hover:text-primary group-hover:opacity-100" type="button" @click="addChild(tagGroup.id)">
                      <Plus class="h-3 w-3" />
                      标签
                    </button>
                  </div>

                  <div class="flex flex-wrap items-start gap-1.5">
                    <div
                      v-for="tag in tagGroup.children || []"
                      :key="tag.id"
                      draggable="true"
                      :class="`group inline-flex h-7 cursor-grab items-center gap-1.5 rounded-lg border px-2 shadow-3xs transition-all active:cursor-grabbing ${draggingTagId === tag.id ? 'opacity-45 ring-2 ring-slate-300' : ''} ${pillTone(tag.id)}`"
                      @dragstart="handleTagDragStart(tag)"
                      @dragend="handleTagDragEnd"
                    >
                      <span class="font-bold opacity-45">⋮⋮</span>
                      <TagName :node="tag" compact :editing-id="editingId" :temp-name="tempName" @start-edit="startEdit" @update-temp="tempName = $event" @save="saveEdit" @cancel="editingId = null" />
                      <button class="opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500" type="button" @click="requestDeleteNode(tag.id)">
                        <X class="h-3 w-3" />
                      </button>
                    </div>
                    <button class="inline-flex h-7 items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-white px-2 text-[10px] font-black text-slate-400 transition-all hover:border-primary/50 hover:text-primary" type="button" @click="addChild(tagGroup.id)">
                      <Plus class="h-3 w-3" />
                      添加
                    </button>
                  </div>
                </div>
                <button class="flex min-h-[76px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 text-[10px] font-black text-slate-400 transition-all hover:border-primary/50 hover:text-primary" type="button" @click="addChild(group.id)">
                  <Plus class="mr-1 h-3 w-3" />
                  新增标签组
                </button>
              </div>

              <details v-if="hiddenTagGroups(group).length > 0" class="mt-2 rounded-xl border border-dashed border-slate-200 bg-white/70 px-2.5 py-2">
                <summary class="flex cursor-pointer list-none items-center gap-2 text-[10px] font-black text-slate-400 marker:hidden">
                  <EyeOff class="h-3.5 w-3.5" />
                  已隐藏标签组
                  <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">{{ hiddenTagGroups(group).length }}</span>
                  <ChevronDown class="ml-auto h-3.5 w-3.5" />
                </summary>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  <button
                    v-for="hiddenGroup in hiddenTagGroups(group)"
                    :key="hiddenGroup.id"
                    class="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-150 bg-slate-50 px-2 text-[10px] font-black text-slate-500 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    type="button"
                    title="恢复显示"
                    @click="toggleHidden(hiddenGroup)"
                  >
                    <Eye class="h-3 w-3" />
                    {{ hiddenGroup.name }}
                    <span class="rounded bg-white px-1 font-mono text-[8px] text-slate-400">{{ countLeafTags(hiddenGroup) }}</span>
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pendingDeleteId" class="fixed bottom-8 right-8 z-50 w-[320px] rounded-2xl border border-rose-100 bg-white p-4 text-left shadow-2xl ring-1 ring-slate-900/5">
      <div class="flex items-start gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
          <Trash2 class="h-4 w-4" />
        </div>
        <div class="min-w-0">
          <h3 class="text-xs font-black text-slate-900">删除标签</h3>
          <p class="mt-1 text-[10px] font-semibold leading-relaxed text-slate-500">确定删除吗？</p>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button type="button" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 hover:bg-slate-50" @click="pendingDeleteId = null">取消</button>
        <button type="button" class="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-[10px] font-black text-white shadow-sm hover:bg-rose-700" @click="confirmDeleteNode">
          <Check class="h-3.5 w-3.5" />
          确认删除
        </button>
      </div>
    </div>
  </div>
</template>
