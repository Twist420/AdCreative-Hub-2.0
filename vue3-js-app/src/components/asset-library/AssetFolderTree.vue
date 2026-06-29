<script setup>
import { computed, ref, watch } from 'vue'
import AssetFolderTreeBranch from './AssetFolderTreeBranch.vue'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  currentPath: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-path', 'create-child', 'manage-path'])

const expandedFolders = ref({
  片段: true,
  组件: true,
  '片段/前贴': true,
})

watch(
  () => props.currentPath,
  (path) => {
    const next = { ...expandedFolders.value }
    path.reduce((acc, part) => {
      const current = [...acc, part]
      next[current.join('/')] = true
      return current
    }, [])
    expandedFolders.value = next
  },
  { immediate: true },
)

const isSamePath = (a, b) => a.length === b.length && a.every((item, index) => item === b[index])

const toggleExpanded = (path) => {
  const key = path.join('/')
  expandedFolders.value = { ...expandedFolders.value, [key]: !expandedFolders.value[key] }
}

const renderNodes = computed(() => props.nodes)
</script>

<template>
  <div class="space-y-1">
    <template v-for="node in renderNodes" :key="node.name">
      <AssetFolderTreeBranch
        :node="node"
        :path="[node.name]"
        :current-path="currentPath"
        :expanded-folders="expandedFolders"
        :is-same-path="isSamePath"
        @toggle="toggleExpanded"
        @select-path="emit('select-path', $event)"
        @create-child="emit('create-child', $event)"
        @manage-path="emit('manage-path', $event)"
      />
    </template>
  </div>
</template>
