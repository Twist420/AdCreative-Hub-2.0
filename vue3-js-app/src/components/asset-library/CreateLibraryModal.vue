<script setup>
import { computed, ref, watch } from 'vue'
import { Box, Check, ChevronDown, Layout, Plus, X } from 'lucide-vue-next'
import { getAllFoldersInTree } from './assetLibraryData'

const props = defineProps({
  open: { type: Boolean, default: false },
  folderTree: { type: Array, default: () => [] },
  libraryItems: { type: Array, default: () => [] },
  initialParentPath: { type: Array, default: () => ['片段'] },
})

const emit = defineEmits(['close', 'create'])

const libSystem = ref('Fragment')
const libParentPath = ref(['片段'])
const libName = ref('')
const selectedAssets = ref([])
const assetSearchQuery = ref('')
const parentMenuOpen = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const root = props.initialParentPath?.[0] === '组件' ? 'Component' : 'Fragment'
    libSystem.value = root
    libParentPath.value = props.initialParentPath?.length ? [...props.initialParentPath] : [root === 'Fragment' ? '片段' : '组件']
    libName.value = ''
    selectedAssets.value = []
    assetSearchQuery.value = ''
    parentMenuOpen.value = false
  },
)

const parentFolders = computed(() =>
  getAllFoldersInTree(props.folderTree).filter((folder) =>
    folder.path[0] === (libSystem.value === 'Fragment' ? '片段' : '组件'),
  ),
)

const candidateItems = computed(() => {
  const targetType = libSystem.value === 'Fragment' ? 'Fragment' : 'Component'
  const query = assetSearchQuery.value.trim().toLowerCase()
  return props.libraryItems
    .filter((item) => item.type === targetType)
    .filter((item) => {
      if (!query) return true
      return [item.name, item.id, item.subType, ...(item.tags || [])].join(' ').toLowerCase().includes(query)
    })
})

const switchSystem = (system) => {
  libSystem.value = system
  libParentPath.value = [system === 'Fragment' ? '片段' : '组件']
  selectedAssets.value = []
  parentMenuOpen.value = false
}

const toggleAsset = (id) => {
  selectedAssets.value = selectedAssets.value.includes(id)
    ? selectedAssets.value.filter((item) => item !== id)
    : [...selectedAssets.value, id]
}

const submit = () => {
  const name = libName.value.trim()
  if (!name) return
  emit('create', {
    name,
    system: libSystem.value,
    parentPath: libParentPath.value,
    selectedAssets: selectedAssets.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm" @click.self="emit('close')">
      <section class="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <header class="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <div class="flex items-center gap-2.5">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Plus class="h-4 w-4" />
            </div>
            <div>
              <h3 class="text-xs font-black text-slate-800">新建微分子资产库</h3>
              <p class="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Create Micro-Asset Library</p>
            </div>
          </div>
          <button class="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600" type="button" @click="emit('close')">
            <X class="h-4 w-4" />
          </button>
        </header>

        <div class="max-h-[72vh] flex-1 space-y-4 overflow-y-auto p-6 no-scrollbar">
          <div class="space-y-1.5">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">资产领域系统</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="item in [{ value: 'Fragment', label: '片段 (Fragments)', icon: Layout }, { value: 'Component', label: '组件 (Components)', icon: Box }]"
                :key="item.value"
                :class="`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                  libSystem === item.value ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-150 bg-slate-50 text-slate-600 hover:bg-slate-100/70'
                }`"
                type="button"
                @click="switchSystem(item.value)"
              >
                <component :is="item.icon" :class="`h-4 w-4 shrink-0 ${libSystem === item.value ? 'text-white' : 'text-slate-400'}`" />
                <span class="text-[11px] font-bold">{{ item.label }}</span>
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">上级目录路径</label>
            <div class="relative">
              <button class="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-700" type="button" @click="parentMenuOpen = !parentMenuOpen">
                <span>{{ libParentPath.join(' > ') }}</span>
                <ChevronDown :class="`h-4 w-4 text-slate-400 transition-transform ${parentMenuOpen ? 'rotate-180' : ''}`" />
              </button>
              <div v-if="parentMenuOpen" class="absolute left-0 right-0 top-full z-[270] mt-2 max-h-56 overflow-y-auto rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl no-scrollbar">
                <button
                  v-for="folder in parentFolders"
                  :key="folder.path.join('/')"
                  :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${libParentPath.join('/') === folder.path.join('/') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`"
                  type="button"
                  @click="
                    libParentPath = folder.path;
                    parentMenuOpen = false
                  "
                >
                  <span>{{ folder.path.join(' > ') }}</span>
                  <Check v-if="libParentPath.join('/') === folder.path.join('/')" class="h-4 w-4 text-indigo-500" />
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-3.5 text-left">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">微分子资产库名称 *</label>
              <input v-model="libName" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/15" placeholder="例如: 智能AI解说, 冰原大厅" />
            </div>
            <div class="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5">
              <p class="text-[10px] font-bold leading-relaxed text-indigo-700">
                💡 提示：在此处仅需输入名称即可发起创建。当您新建成功并进入对应页面后，系统会主动引导您首先一键配置该库的专属防冲突前缀及归属标签。
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">选择已有资产导入加入该资产库目录</label>
              <span class="text-[9px] font-bold text-slate-400">已选择 {{ selectedAssets.length }} 项</span>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-150 bg-slate-50/50">
              <div class="border-b border-slate-150 bg-slate-100/50 p-2.5">
                <input v-model="assetSearchQuery" class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400" placeholder="检索可用历史存量资产..." />
              </div>
              <div class="max-h-[160px] space-y-1.5 overflow-y-auto p-2.5 no-scrollbar">
                <label
                  v-for="item in candidateItems"
                  :key="item.id"
                  :class="`flex cursor-pointer items-center justify-between rounded-xl border p-2 text-left transition-all ${
                    selectedAssets.includes(item.id) ? 'border-slate-900 bg-white shadow-sm' : 'border-slate-100 bg-white/40 hover:bg-white'
                  }`"
                >
                  <div class="flex min-w-0 items-center gap-2.5">
                    <span :class="`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${selectedAssets.includes(item.id) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-transparent'}`">
                      <Check class="h-2.5 w-2.5" />
                    </span>
                    <input class="sr-only" type="checkbox" :checked="selectedAssets.includes(item.id)" @change="toggleAsset(item.id)" />
                    <div class="min-w-0">
                      <p class="line-clamp-1 text-[11px] font-black leading-tight text-slate-800">{{ item.name }}</p>
                      <div class="mt-0.5 flex items-center gap-1.5 text-[9px] leading-none text-slate-400">
                        <span>当前归属: {{ item.subType }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-sans text-[9px] font-bold leading-none text-slate-400">
                    引用 {{ item.citationCount }}次
                  </span>
                </label>
                <p v-if="candidateItems.length === 0" class="py-4 text-center text-[10px] font-bold text-slate-400">无历史资产可关联</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4">
          <button class="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50" type="button" @click="emit('close')">取消</button>
          <button class="cursor-pointer rounded-xl bg-slate-900 px-5 py-2 text-[11px] font-black text-white shadow-md transition-all hover:bg-black hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40" type="button" :disabled="!libName.trim()" @click="submit">
            完成并生成资产库
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
