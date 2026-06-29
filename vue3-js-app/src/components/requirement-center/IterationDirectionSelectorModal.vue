<script setup>
import { ChevronRight, Gamepad2, Image as ImageIcon, Inbox, Video, XCircle } from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'
import { getPriorityLabel, getPriorityStyle } from './styles'

const props = defineProps({
  pendingIteration: { type: Object, required: true },
  source: { type: Object, required: true },
  iterationCount: { type: Number, default: 1 },
  selectedCreateType: { type: String, default: 'Video' },
  schedules: { type: Array, default: () => [] },
  requirements: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'create-iteration'])

const formLabel = (type) => (type === 'Image' ? '图片' : type === 'Playable' ? '试玩' : '视频')
const formColor = (type) => {
  if (type === 'Image') return 'border-amber-150 bg-amber-50 text-amber-700'
  if (type === 'Playable') return 'border-indigo-150 bg-indigo-50 text-indigo-700'
  return 'border-rose-150 bg-rose-50 text-rose-700'
}
const formIcon = (type) => {
  if (type === 'Image') return ImageIcon
  if (type === 'Playable') return Gamepad2
  return Video
}
const remainingCount = (schedule) => {
  const associatedReqs = props.requirements.filter((req) => req.scheduleId === schedule.id)
  return Math.max(0, (schedule.totalRequiredCount || 0) - associatedReqs.length)
}
</script>

<template>
  <div class="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md animate-in fade-in duration-200">
    <div class="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-150 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
      <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-8 py-6">
        <div class="min-w-0">
          <h3 class="text-xl font-black leading-tight text-slate-900">选择迭代方向</h3>
          <p class="mt-1 text-xs font-medium text-slate-500">
            {{ pendingIteration.mode === 'all' ? `将迭代 ${iterationCount} 条版本，版本顺序与原需求保持一致。` : '将迭代当前单条需求，并生成新大版本的 -01。' }}
          </p>
        </div>
        <button type="button" class="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600" @click="emit('close')">
          <XCircle class="h-8 w-8" />
        </button>
      </div>

      <div class="border-b border-slate-100 bg-slate-50/50 px-8 py-4">
        <div class="flex flex-wrap items-center gap-2 text-[11px] font-black">
          <span class="rounded-xl bg-white px-3 py-1.5 text-slate-500 shadow-3xs">来源：{{ source.id }}</span>
          <span class="rounded-xl bg-indigo-50 px-3 py-1.5 text-indigo-700">类型：{{ formLabel(source.assetType) }}</span>
          <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-slate-500">父需求字段将指向原需求</span>
        </div>
      </div>

      <div class="flex-1 space-y-4 overflow-y-auto p-8 no-scrollbar">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h4 class="text-sm font-black text-slate-900">选择挂靠方向</h4>
            <p class="mt-1 text-[11px] font-semibold text-slate-400">新版本会跟随方向的制作类型、方向、负责人、优先级和渠道；描述、引用、预览等内容沿用原需求。</p>
          </div>
          <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-500">当前筛选：{{ formLabel(selectedCreateType) }}</span>
        </div>

        <div v-if="schedules.filter((schedule) => schedule.form === selectedCreateType).length === 0" class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
          <Inbox class="h-10 w-10 text-slate-300" />
          <p class="mt-3 text-xs font-black text-slate-500">暂无匹配该制作类型的方向</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            v-for="schedule in schedules.filter((item) => item.form === selectedCreateType)"
            :key="schedule.id"
            type="button"
            class="group relative flex cursor-pointer flex-col gap-4 rounded-3xl border border-slate-150 bg-white p-5 text-left transition-all hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-900/5"
            @click="emit('create-iteration', schedule.id)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="mb-2 flex items-center gap-2">
                  <span :class="`rounded-lg px-2 py-1 text-[10px] font-black shadow-sm ${getPriorityStyle(schedule.priority)}`">{{ getPriorityLabel(schedule.priority) }}</span>
                  <span :class="`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-black ${formColor(schedule.form)}`">
                    <component :is="formIcon(schedule.form)" class="h-3 w-3" />
                    {{ formLabel(schedule.form) }}
                  </span>
                </div>
                <h5 class="truncate text-sm font-black text-slate-900 transition-colors group-hover:text-indigo-700">{{ schedule.directionName }}</h5>
                <p class="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-400">{{ schedule.validationGoal || '暂无验证目标' }}</p>
              </div>
              <ChevronRight class="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-600" />
            </div>

            <div class="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
              <div class="rounded-2xl bg-slate-50 px-3 py-2">
                <div class="text-[9px] font-black text-slate-400">负责人</div>
                <div class="mt-1 truncate text-[11px] font-black text-slate-700"><PersonParts :name="schedule.owner || '未指派'" size="xs" /></div>
              </div>
              <div class="rounded-2xl bg-slate-50 px-3 py-2">
                <div class="text-[9px] font-black text-slate-400">截止</div>
                <div class="mt-1 truncate text-[11px] font-black text-slate-700">{{ schedule.submissionDeadline || schedule.requirementEnd || '--' }}</div>
              </div>
              <div class="rounded-2xl bg-slate-50 px-3 py-2">
                <div class="text-[9px] font-black text-slate-400">渠道</div>
                <div class="mt-1 truncate text-[11px] font-black text-slate-700">{{ schedule.channels?.[0]?.toUpperCase() || 'ALL' }}</div>
              </div>
              <div class="rounded-2xl bg-slate-50 px-3 py-2">
                <div class="text-[9px] font-black text-slate-400">剩余</div>
                <div class="mt-1 truncate text-[11px] font-black text-slate-700">{{ remainingCount(schedule) }}/{{ schedule.totalRequiredCount || 0 }}</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
