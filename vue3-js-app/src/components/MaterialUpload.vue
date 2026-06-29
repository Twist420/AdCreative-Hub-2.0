<script setup>
import { computed, ref } from 'vue'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FileVideo,
  Gamepad2,
  History,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-vue-next'

const INITIAL_RECORDS = [
  {
    id: 'rec-1',
    name: 'Battle_Intro_V1_Final.mp4',
    type: 'Video',
    size: '45.2 MB',
    status: 'Success',
    progress: 100,
    timestamp: '2026-05-12 10:20',
  },
  {
    id: 'rec-2',
    name: 'Merge_Tutorial_ASO_Image.png',
    type: 'Image',
    size: '2.4 MB',
    status: 'Failed',
    progress: 0,
    failureReason: '命名错误：未包含渠道后缀',
    timestamp: '2026-05-12 10:15',
  },
  {
    id: 'rec-3',
    name: 'Interactive_Demo_Playable.zip',
    type: 'Playable',
    size: '12.8 MB',
    status: 'Success',
    progress: 100,
    timestamp: '2026-05-12 09:45',
  },
  {
    id: 'rec-4',
    name: 'Big_Asset_Large_Video.mp4',
    type: 'Video',
    size: '512 MB',
    status: 'Failed',
    progress: 0,
    failureReason: '大小超限：超过最大限制 (500MB)',
    timestamp: '2026-05-12 09:30',
  },
]

const tabs = [
  { value: 'Video', label: '视频素材', icon: FileVideo },
  { value: 'Playable', label: '试玩素材', icon: Gamepad2 },
  { value: 'Image', label: '图片素材', icon: ImageIcon },
]

const activeType = ref('Video')
const records = ref([...INITIAL_RECORDS])
const isDragging = ref(false)
const searchQuery = ref('')
const fileInputRef = ref(null)

const inferMaterialType = (file) => {
  if (file.type?.includes('video')) return 'Video'
  if (file.type?.includes('image')) return 'Image'
  if (file.name?.toLowerCase().endsWith('.zip')) return 'Playable'
  return activeType.value
}

const formatFileSize = (size) => `${(size / (1024 * 1024)).toFixed(1)} MB`

const updateRecord = (id, updates) => {
  records.value = records.value.map((record) => (record.id === id ? { ...record, ...updates } : record))
}

const simulateUpload = (files) => {
  const newRecords = files.map((file) => {
    const type = inferMaterialType(file)
    const isTooLarge = file.size > 500 * 1024 * 1024
    const namingFailed = !file.name.includes('_')

    return {
      id: `rec-new-${Math.random().toString(36).slice(2, 11)}`,
      name: file.name,
      type,
      size: formatFileSize(file.size),
      status: isTooLarge || namingFailed ? 'Failed' : 'Pending',
      progress: 0,
      failureReason: isTooLarge
        ? '大小超限：超过最大限制 (500MB)'
        : namingFailed
          ? '命名错误：未按照规范命名 (需包含下划线)'
          : undefined,
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
    }
  })

  records.value = [...newRecords, ...records.value]

  newRecords.forEach((record) => {
    if (record.status !== 'Pending') return
    let progress = 0
    const interval = window.setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        window.clearInterval(interval)
        updateRecord(record.id, { status: 'Success', progress: 100 })
        return
      }
      updateRecord(record.id, { status: 'Uploading', progress: Math.floor(progress) })
    }, 800)
  })
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length > 0) simulateUpload(files)
  event.target.value = ''
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length > 0) simulateUpload(files)
}

const removeRecord = (id) => {
  records.value = records.value.filter((record) => record.id !== id)
}

const filteredRecords = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return records.value.filter((record) => record.type === activeType.value && record.name.toLowerCase().includes(query))
})

const getTypeIcon = (type) => {
  if (type === 'Playable') return Gamepad2
  if (type === 'Image') return ImageIcon
  return FileVideo
}

const getTypeTone = (type) => {
  if (type === 'Playable') return 'bg-amber-50 text-amber-500'
  if (type === 'Image') return 'bg-emerald-50 text-emerald-500'
  return 'bg-indigo-50 text-indigo-500'
}
</script>

<template>
  <div class="flex h-full min-h-[720px] flex-col overflow-hidden bg-slate-50/50">
    <header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Upload class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 class="text-sm font-black text-slate-800">素材上传中心</h1>
          <p class="text-[10px] font-bold text-slate-400">支持批量上传视频、试玩、图片素材</p>
        </div>
      </div>

      <div class="hidden items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-1 md:flex">
        <AlertCircle class="h-3.5 w-3.5 text-amber-500" />
        <span class="text-[10px] font-bold text-amber-700">限制: 500MB以内, 命名规范 [项目]_[语言]_[方向]</span>
      </div>
    </header>

    <div class="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-4 xl:flex-row xl:p-6">
      <div class="flex min-h-[360px] flex-col gap-5 xl:w-1/3">
        <div class="flex shrink-0 rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-black transition-all ${
              activeType === tab.value
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`"
            type="button"
            @click="activeType = tab.value"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </div>

        <div
          :class="`group flex flex-1 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 bg-white shadow-sm hover:border-primary/50 hover:bg-slate-50'
          }`"
          @click="fileInputRef?.click()"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop="handleDrop"
        >
          <input ref="fileInputRef" class="hidden" multiple type="file" @change="handleFileSelect" />
          <div
            :class="`mb-4 flex h-16 w-16 items-center justify-center rounded-3xl transition-all ${
              isDragging
                ? 'scale-110 bg-primary text-white'
                : 'bg-slate-50 text-slate-400 group-hover:scale-105 group-hover:bg-white group-hover:text-primary'
            }`"
          >
            <Upload class="h-8 w-8" />
          </div>
          <h3 class="mb-1 text-sm font-black text-slate-800 group-hover:text-primary">点击或分发文件到此区域上传</h3>
          <p class="text-xs font-bold text-slate-400">支持批量选择，单文件最大 500MB</p>

          <div class="mt-8 flex items-center gap-5">
            <div class="flex flex-col items-center">
              <div class="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <FileVideo class="h-5 w-5" />
              </div>
              <span class="text-[10px] font-bold text-slate-400">MP4 / MOV</span>
            </div>
            <ChevronRight class="mt-2 h-4 w-4 text-slate-300" />
            <div class="flex flex-col items-center">
              <div class="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Gamepad2 class="h-5 w-5" />
              </div>
              <span class="text-[10px] font-bold text-slate-400">ZIP (HTML5)</span>
            </div>
            <ChevronRight class="mt-2 h-4 w-4 text-slate-300" />
            <div class="flex flex-col items-center">
              <div class="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <ImageIcon class="h-5 w-5" />
              </div>
              <span class="text-[10px] font-bold text-slate-400">PNG / JPG</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 p-5">
          <div class="flex items-center gap-3">
            <History class="h-5 w-5 text-slate-400" />
            <h2 class="text-sm font-black text-slate-800">上传记录</h2>
          </div>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              class="w-48 rounded-lg border-none bg-slate-50 py-1.5 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary/20"
              placeholder="搜索素材名称..."
              type="text"
            />
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-auto no-scrollbar">
          <div v-if="filteredRecords.length === 0" class="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
            <FileText class="h-12 w-12" />
            <p class="text-xs font-bold">暂无上传记录</p>
          </div>

          <table v-else class="w-full min-w-[780px] border-collapse text-left">
            <thead class="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th class="px-6 py-4">素材详情</th>
                <th class="px-6 py-4">进度/状态</th>
                <th class="px-6 py-4">上传时间</th>
                <th class="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="record in filteredRecords" :key="record.id" class="group transition-colors hover:bg-slate-50/50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div :class="`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getTypeTone(record.type)}`">
                      <component :is="getTypeIcon(record.type)" class="h-5 w-5" />
                    </div>
                    <div class="min-w-0">
                      <h4 class="mb-0.5 truncate text-xs font-black text-slate-700">{{ record.name }}</h4>
                      <span class="text-[10px] font-bold text-slate-400">{{ record.size }}</span>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div v-if="record.status === 'Uploading' || record.status === 'Pending'" class="flex w-32 flex-col gap-1.5">
                    <div class="flex items-center justify-between text-[10px] font-black">
                      <span class="flex items-center gap-1.5 text-primary">
                        <Loader2 class="h-3 w-3 animate-spin" />
                        上传中...
                      </span>
                      <span class="text-slate-400">{{ record.progress }}%</span>
                    </div>
                    <div class="h-1 overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${record.progress}%` }" />
                    </div>
                  </div>
                  <div v-else-if="record.status === 'Success'" class="flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                    <CheckCircle2 class="h-3.5 w-3.5" />
                    <span class="whitespace-nowrap text-[10px] font-black">上传成功</span>
                  </div>
                  <div v-else class="flex flex-col gap-1">
                    <div class="flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-rose-600">
                      <XCircle class="h-3.5 w-3.5" />
                      <span class="whitespace-nowrap text-[10px] font-black">上传失败</span>
                    </div>
                    <span v-if="record.failureReason" class="ml-1 text-[9px] font-bold italic text-rose-400">{{ record.failureReason }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5 text-slate-400">
                    <Clock class="h-3.5 w-3.5" />
                    <span class="text-[10px] font-bold">{{ record.timestamp }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2 text-slate-400 opacity-0 transition-all group-hover:opacity-100">
                    <button class="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-600" type="button">
                      <MoreHorizontal class="h-4 w-4" />
                    </button>
                    <button class="rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-500" type="button" @click="removeRecord(record.id)">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
