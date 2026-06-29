<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ChevronsLeft, ChevronsRight, GripVertical } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  defaultWidth: {
    type: Number,
    default: 240,
  },
  storageKey: {
    type: String,
    required: true,
  },
  minWidth: {
    type: Number,
    default: 196,
  },
  maxWidth: {
    type: Number,
    default: 360,
  },
  collapsedWidth: {
    type: Number,
    default: 44,
  },
})

const sidebarRef = ref(null)
const collapsed = ref(false)
const width = ref(props.defaultWidth)
const isDragging = ref(false)
const computedWidth = computed(() => (collapsed.value ? props.collapsedWidth : width.value))

const stopResize = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const handlePointerMove = (event) => {
  if (!isDragging.value) return
  const sidebarLeft = sidebarRef.value?.getBoundingClientRect().left ?? 0
  width.value = Math.min(props.maxWidth, Math.max(props.minWidth, event.clientX - sidebarLeft))
}

const startResize = (event) => {
  if (collapsed.value) return
  event.preventDefault()
  isDragging.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

onMounted(() => {
  const savedWidth = Number(window.localStorage.getItem(`${props.storageKey}:width`))
  const savedCollapsed = window.localStorage.getItem(`${props.storageKey}:collapsed`)

  if (!Number.isNaN(savedWidth) && savedWidth >= props.minWidth && savedWidth <= props.maxWidth) {
    width.value = savedWidth
  }
  if (savedCollapsed !== null) {
    collapsed.value = savedCollapsed === 'true'
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopResize)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', stopResize)
  stopResize()
})

watch(width, (nextWidth) => {
  window.localStorage.setItem(`${props.storageKey}:width`, String(nextWidth))
})

watch(collapsed, (nextCollapsed) => {
  window.localStorage.setItem(`${props.storageKey}:collapsed`, String(nextCollapsed))
})
</script>

<template>
  <aside
    ref="sidebarRef"
    :class="`relative flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
      isDragging ? 'transition-none' : ''
    }`"
    :style="{ width: `${computedWidth}px` }"
  >
    <div :class="`flex h-14 shrink-0 items-center border-b border-slate-100 ${collapsed ? 'justify-center px-0' : 'gap-2 px-3'}`">
      <button
        v-if="collapsed"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
        type="button"
        title="展开侧边栏"
        @click="collapsed = false"
      >
        <ChevronsRight class="h-4 w-4" />
      </button>
      <template v-else>
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <component :is="icon" v-if="icon" class="h-4 w-4" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-xs font-black tracking-tight text-slate-900">{{ title }}</div>
          <div v-if="subtitle" class="mt-0.5 truncate text-[9.5px] font-bold uppercase tracking-widest text-slate-400">{{ subtitle }}</div>
        </div>
        <button
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
          type="button"
          title="收起侧边栏"
          @click="collapsed = true"
        >
          <ChevronsLeft class="h-4 w-4" />
        </button>
      </template>
    </div>

    <div :class="`flex-1 no-scrollbar ${collapsed ? 'overflow-visible px-1.5 py-3' : 'overflow-y-auto p-3'}`">
      <slot :collapsed="collapsed" />
    </div>

    <button
      v-if="!collapsed"
      :class="`absolute -right-1 top-0 z-10 flex h-full w-2 cursor-col-resize items-center justify-center transition-colors ${
        isDragging ? 'bg-indigo-100' : 'hover:bg-indigo-50'
      }`"
      type="button"
      title="拖动调整侧边栏宽度"
      @pointerdown="startResize"
    >
      <GripVertical :class="`h-4 w-4 ${isDragging ? 'text-indigo-500' : 'text-slate-300'}`" />
    </button>
  </aside>
</template>
