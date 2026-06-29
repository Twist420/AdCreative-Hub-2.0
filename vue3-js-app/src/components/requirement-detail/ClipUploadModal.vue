<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Upload, X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'uploaded'])
const isDragActive = ref(false)

const handleFiles = (files) => {
  if (!files?.length) return
  emit('uploaded', files.length)
  isDragActive.value = false
}

const closeModal = () => {
  isDragActive.value = false
  emit('close')
}

const handleDragLeave = (event) => {
  if (event.currentTarget === event.target) {
    isDragActive.value = false
  }
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeModal()
}

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div class="fixed inset-0 z-[290] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-xs animate-in fade-in duration-200">
    <div class="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h3 class="text-sm font-black text-slate-900">上传成片</h3>
          <p class="mt-1 text-[10px] font-bold text-slate-400">支持拖拽上传，也可以点击选择视频或图片文件。</p>
        </div>
        <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600" type="button" @click="closeModal">
          <X class="h-4.5 w-4.5" />
        </button>
      </div>

      <div class="p-6">
        <label
          :class="`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-8 text-center transition-all ${isDragActive ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50/70 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/60'}`"
          @dragenter.prevent.stop="isDragActive = true"
          @dragover.prevent.stop="isDragActive = true"
          @dragleave.prevent.stop="handleDragLeave"
          @drop.prevent.stop="handleFiles($event.dataTransfer.files)"
        >
          <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-indigo-600 shadow-sm">
            <Upload class="h-7 w-7" />
          </div>
          <div class="text-sm font-black text-slate-800">拖拽成片文件到这里</div>
          <div class="mt-2 text-[11px] font-bold text-slate-400">或点击选择文件，支持视频和图片，多文件上传</div>
          <input
            accept="video/*,image/*"
            class="hidden"
            multiple
            type="file"
            @change="handleFiles($event.target.files); $event.target.value = ''"
          />
        </label>
      </div>
    </div>
  </div>
</template>
