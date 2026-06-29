<script setup>
import { Copy, X } from 'lucide-vue-next'
import ScriptCtaSelectionSlot from './ScriptCtaSelectionSlot.vue'
import ScriptReferenceResourceBox from './ScriptReferenceResourceBox.vue'

defineProps({
  version: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'duplicate',
  'delete',
  'update',
  'upload-reference',
  'pick-assets',
  'pick-finished',
  'remove-asset',
  'toggle-attachment',
  'pick-landing',
  'clear-landing',
  'update-landing-note',
])
</script>

<template>
  <div class="flex min-h-[460px] w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 bg-slate-50/70 px-3.5 py-3">
      <div class="mb-2.5 flex items-center justify-between gap-3">
        <span class="inline-flex h-8 items-center rounded-xl bg-indigo-600 px-3 text-[11px] font-black text-white shadow-3xs">
          v{{ version.version }}
        </span>
        <div class="flex items-center gap-1.5">
          <button
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-400 shadow-4xs hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            title="复制版本"
            type="button"
            @click="emit('duplicate', version)"
          >
            <Copy class="h-3.5 w-3.5" />
          </button>
          <button
            v-if="index > 0"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-300 shadow-4xs hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
            title="删除版本"
            type="button"
            @click="emit('delete', version.version)"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <label class="block space-y-1">
          <span class="block text-[9px] font-black uppercase tracking-widest text-slate-500">版本名称</span>
          <input
            :disabled="disabled"
            :value="version.name"
            class="h-9 w-full rounded-xl border border-slate-150 bg-white px-3 text-[11px] font-black text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white disabled:bg-slate-50/70"
            placeholder="填写版本名称"
            @input="emit('update', { version: version.version, updates: { name: $event.target.value } })"
          />
        </label>
        <label class="block space-y-1">
          <span class="block text-[9px] font-black uppercase tracking-widest text-slate-500">验证目的</span>
          <input
            :disabled="disabled"
            :value="version.goal"
            class="h-9 w-full rounded-xl border border-slate-150 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white disabled:bg-slate-50/70"
            placeholder="填写这一版要验证的卖点或目标"
            @input="emit('update', { version: version.version, updates: { goal: $event.target.value } })"
          />
        </label>
      </div>
    </div>

    <ScriptReferenceResourceBox
      :asset-ids="version.references"
      :attachments="version.attachments"
      :disabled="disabled"
      compact
      @pick-assets="emit('pick-assets', version.version)"
      @pick-finished="emit('pick-finished', version.version)"
      @remove-asset="emit('remove-asset', { version: version.version, id: $event })"
      @toggle-attachment="emit('toggle-attachment', { version: version.version, id: $event })"
      @upload-reference="emit('upload-reference', version.version)"
    />

    <textarea
      :disabled="disabled"
      :value="version.description"
      class="min-h-[118px] flex-1 resize-none border-t border-slate-100 bg-white px-4 py-3 text-xs font-bold leading-relaxed text-slate-600 outline-none placeholder:text-slate-300 disabled:bg-white"
      :placeholder="disabled ? '' : '请输入描述...'"
      @input="emit('update', { version: version.version, updates: { description: $event.target.value } })"
    />

    <div v-if="!disabled" class="border-t border-slate-100 px-4 py-3">
      <ScriptCtaSelectionSlot
        :description="version.landingNote"
        :selected="version.landingId"
        @clear="emit('clear-landing', version.version)"
        @pick="emit('pick-landing', version.version)"
        @update:description="emit('update-landing-note', { version: version.version, note: $event })"
      />
    </div>
  </div>
</template>
