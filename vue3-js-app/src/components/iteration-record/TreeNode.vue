<script setup>
import { Play, Plus } from 'lucide-vue-next'

defineOptions({ name: 'TreeNode' })

defineProps({
  node: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-node', 'play-video'])

const typeLabel = {
  root: '根节点',
  category: '分类',
  master: '母版',
  direction: '方向',
  point: '验证点',
  module: '模块',
  iteration: '迭代',
}

const nodeTone = (type) => {
  if (type === 'root') return 'bg-slate-900 text-white border-slate-900'
  if (type === 'master') return 'bg-white border-indigo-150 text-slate-900 shadow-lg shadow-indigo-100/40'
  if (type === 'direction') return 'bg-white border-amber-150 text-slate-800'
  if (type === 'point') return 'bg-white border-emerald-150 text-slate-800'
  if (type === 'module') return 'bg-white border-rose-150 text-slate-800'
  return 'bg-white border-slate-200 text-slate-800'
}
</script>

<template>
  <div class="flex items-start gap-8">
    <div :class="`relative w-[220px] shrink-0 rounded-xl border p-3 ${nodeTone(node.type)}`">
      <button
        :class="`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
          node.type === 'root' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-indigo-50'
        }`"
        type="button"
        @click.stop="emit('add-node', node.id)"
      >
        <Plus class="h-3.5 w-3.5" />
      </button>

      <div class="pr-8 text-xs font-black">{{ node.name }}</div>
      <div :class="`mt-1 text-[9px] font-black ${node.type === 'root' ? 'text-white/55' : 'text-slate-400'}`">
        {{ typeLabel[node.type] || node.type }}
      </div>

      <button
        v-if="node.previewUrl"
        class="relative mt-3 block h-[100px] w-full overflow-hidden rounded-lg bg-slate-100"
        type="button"
        @click="emit('play-video', { name: node.name, id: node.id })"
      >
        <img :src="node.previewUrl" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
        <span class="absolute inset-0 flex items-center justify-center bg-black/20">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white">
            <Play class="h-4 w-4 fill-white" />
          </span>
        </span>
      </button>

      <div v-if="node.videos?.length" class="mt-3 space-y-1">
        <button
          v-for="(video, index) in node.videos"
          :key="`${node.id}-${video}`"
          :class="`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[10px] font-bold transition-all ${
            node.type === 'root' ? 'text-white/80 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
          }`"
          type="button"
          @click="emit('play-video', { name: video, id: `${node.id}-${index}` })"
        >
          <Play class="h-3 w-3 fill-current" />
          {{ video }}
        </button>
      </div>
    </div>

    <div v-if="node.children?.length" class="flex flex-col gap-4 border-l border-slate-300/70 pl-8">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @add-node="emit('add-node', $event)"
        @play-video="emit('play-video', $event)"
      />
    </div>
  </div>
</template>
