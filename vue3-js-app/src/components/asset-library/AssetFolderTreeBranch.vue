<script setup>
import { computed, ref } from 'vue'
import { Check, ChevronDown, ChevronRight, Folder, MoreHorizontal, Plus, X } from 'lucide-vue-next'

defineOptions({ name: 'AssetFolderTreeBranch' })

const props = defineProps({
  node: { type: Object, required: true },
  path: { type: Array, required: true },
  currentPath: { type: Array, required: true },
  expandedFolders: { type: Object, required: true },
  isSamePath: { type: Function, required: true },
})

const emit = defineEmits(['toggle', 'select-path', 'create-child', 'manage-path'])

const isAddingHere = ref(false)
const inlineNewName = ref('')

const hasChildren = computed(() => Array.isArray(props.node.children) && props.node.children.length > 0)
const isExpanded = computed(() => Boolean(props.expandedFolders[props.path.join('/')]))
const isActive = computed(() => props.isSamePath(props.currentPath, props.path))

const cancelInlineCreate = () => {
  isAddingHere.value = false
  inlineNewName.value = ''
}

const submitInlineCreate = () => {
  const name = inlineNewName.value.trim()
  if (!name) {
    cancelInlineCreate()
    return
  }
  emit('create-child', { parentPath: props.path, name })
  cancelInlineCreate()
}
</script>

<template>
  <div>
    <div
      :class="`group flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-black transition-all ${
        isActive
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`"
    >
      <button
        v-if="hasChildren"
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg transition-all hover:bg-white/15"
        type="button"
        @click.stop="emit('toggle', path)"
      >
        <ChevronDown v-if="isExpanded" class="h-3.5 w-3.5" />
        <ChevronRight v-else class="h-3.5 w-3.5" />
      </button>
      <span v-else class="h-5 w-5 shrink-0" />

      <button
        class="flex min-w-0 flex-1 items-center gap-2 text-left"
        type="button"
        @click="emit('select-path', path)"
      >
        <Folder :class="`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`" />
        <span class="truncate">{{ node.name }}</span>
      </button>

      <button
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg opacity-0 transition-all hover:bg-white/15 group-hover:opacity-100"
        type="button"
        title="新建子资产库"
        @click.stop="isAddingHere = true"
      >
        <Plus class="h-3 w-3" />
      </button>
      <button
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg opacity-0 transition-all hover:bg-white/15 group-hover:opacity-100"
        type="button"
        title="资产库属性信息与安全配置"
        @click.stop="emit('manage-path', path)"
      >
        <MoreHorizontal class="h-3 w-3" />
      </button>
    </div>

    <div v-if="(hasChildren && isExpanded) || isAddingHere" class="ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2">
      <AssetFolderTreeBranch
        v-for="child in hasChildren && isExpanded ? node.children : []"
        :key="child.name"
        :node="child"
        :path="[...path, child.name]"
        :current-path="currentPath"
        :expanded-folders="expandedFolders"
        :is-same-path="isSamePath"
        @toggle="emit('toggle', $event)"
        @select-path="emit('select-path', $event)"
        @create-child="emit('create-child', $event)"
        @manage-path="emit('manage-path', $event)"
      />

      <div
        v-if="isAddingHere"
        class="mr-1 flex items-center gap-1.5 rounded-lg border border-slate-200/50 bg-slate-100 px-3 py-1.5"
        @click.stop
      >
        <Folder class="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <input
          v-model="inlineNewName"
          autofocus
          class="w-full border-0 bg-transparent p-0 text-[10.5px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          placeholder="子分类名称"
          type="text"
          @keydown.enter.prevent="submitInlineCreate"
          @keydown.esc.prevent="cancelInlineCreate"
        />
        <button
          class="rounded p-0.5 text-emerald-600 transition-colors hover:bg-white"
          title="确认"
          type="button"
          @click="submitInlineCreate"
        >
          <Check class="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          class="rounded p-0.5 text-rose-500 transition-colors hover:bg-white"
          title="取消"
          type="button"
          @click="cancelInlineCreate"
        >
          <X class="h-3.5 w-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  </div>
</template>
