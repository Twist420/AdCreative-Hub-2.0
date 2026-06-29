<script setup>
import { AlertCircle, XCircle } from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'

defineProps({
  items: { type: Array, default: () => [] },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md animate-in fade-in duration-200">
    <div class="flex max-h-[82vh] min-h-[480px] w-full min-w-[760px] max-w-5xl flex-col overflow-hidden rounded-[24px] border border-slate-150 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 class="text-base font-black text-slate-900">排期延期需求（{{ items.length }}）</h3>
          <p class="mt-0.5 text-[10px] font-bold text-slate-400">仅显示延期需求编号、制作人员和已延期天数。</p>
        </div>
        <button type="button" class="rounded-full p-1.5 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700" title="关闭" @click="emit('close')">
          <XCircle class="h-6 w-6" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto bg-slate-50/70 p-4 no-scrollbar">
        <div v-if="items.length > 0" class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="{ req, delayedDays } in items" :key="req.id" class="rounded-xl border border-rose-100 bg-white px-3 py-2.5 shadow-3xs">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="text-[8.5px] font-black uppercase tracking-widest text-slate-400">延期需求编号</div>
                <div class="mt-0.5 truncate font-mono text-[13px] font-black text-slate-900">{{ req.id }}</div>
                <div class="mt-2 flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1">
                  <span class="shrink-0 text-[8.5px] font-black uppercase tracking-widest text-slate-400">制作</span>
                  <span class="flex min-w-0 flex-wrap items-center gap-1">
                    <PersonParts
                      v-for="person in req.productionPersonnel || []"
                      :key="person"
                      :name="person"
                      size="xs"
                    />
                    <PersonParts v-if="(req.productionPersonnel || []).length === 0" name="-" size="xs" />
                  </span>
                </div>
              </div>
              <div class="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-rose-50 text-center">
                <div class="text-[8.5px] font-black text-rose-400">已延期</div>
                <div class="mt-0.5 text-base font-black leading-none text-rose-600">{{ delayedDays }}天</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
          <AlertCircle class="h-8 w-8 text-slate-300" />
          <p class="mt-3 text-xs font-black text-slate-500">当前没有已延期需求</p>
        </div>
      </div>
    </div>
  </div>
</template>
