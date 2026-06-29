<script setup>
import PersonParts from './PersonParts.vue'

defineProps({
  groups: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['select-producer'])
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
    <div
      v-for="[group, rows] in Object.entries(groups)"
      :key="group"
      class="rounded-2xl border border-slate-150 bg-slate-50/70 p-3"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <div class="text-xs font-black text-slate-900">{{ group }}</div>
          <div class="mt-0.5 text-[9px] font-black text-slate-400">
            {{ rows.length }} 人 · {{ rows.reduce((sum, row) => sum + row.weekTasks.length, 0) }} 个未来任务
          </div>
        </div>
        <span
          :class="`rounded-full px-2.5 py-1 text-[9px] font-black ${
            Math.round(rows.reduce((sum, row) => sum + row.loadRate, 0) / Math.max(rows.length, 1)) > 100
              ? 'bg-rose-50 text-rose-600'
              : Math.round(rows.reduce((sum, row) => sum + row.loadRate, 0) / Math.max(rows.length, 1)) > 80
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-600'
          }`"
        >
          均值 {{ Math.round(rows.reduce((sum, row) => sum + row.loadRate, 0) / Math.max(rows.length, 1)) }}%
        </span>
      </div>

      <div class="space-y-2">
        <button
          v-for="row in rows"
          :key="row.producer.name"
          type="button"
          class="w-full rounded-xl border border-white bg-white p-3 text-left shadow-3xs transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm"
          @click="emit('select-producer', row.producer.name)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <PersonParts :name="row.producer.name" size="xs" class-name="rounded-xl bg-white px-1.5 py-0.5" />
                <div class="min-w-0">
                  <div class="mt-0.5 truncate text-[9px] font-bold text-slate-400">最近空档 {{ row.nextAvailable }}</div>
                </div>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <div :class="`text-xs font-black ${row.loadRate > 100 ? 'text-rose-600' : row.loadRate > 80 ? 'text-amber-600' : 'text-emerald-600'}`">
                {{ row.loadRate }}%
              </div>
              <div class="mt-0.5 text-[9px] font-bold text-slate-400">{{ row.weekTasks.length }} 任务</div>
            </div>
          </div>

          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              :class="`h-full rounded-full ${row.loadRate > 100 ? 'bg-rose-500' : row.loadRate > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`"
              :style="{ width: `${Math.min(row.loadRate, 100)}%` }"
            />
          </div>

          <div class="mt-2 flex min-h-5 flex-wrap gap-1">
            <span v-if="row.weekTasks.length === 0" class="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600">
              本周可用
            </span>
            <template v-else>
              <span
                v-for="task in row.weekTasks.slice(0, 3)"
                :key="task.id"
                class="max-w-full truncate rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500"
              >
                {{ task.role }} · {{ task.displayRequirementId }}
              </span>
              <span v-if="row.weekTasks.length > 3" class="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-400">
                +{{ row.weekTasks.length - 3 }}
              </span>
            </template>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
