<script setup>
import { ChevronRight, Gamepad2, Image as ImageIcon, Plus, Video, XCircle } from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'
import { getFormConfig } from './displayHelpers'
import { getPriorityLabel, getPriorityStyle } from './styles'

const props = defineProps({
  selectedCreateType: {
    type: String,
    default: 'Video',
  },
  schedules: {
    type: Array,
    default: () => [],
  },
  requirements: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select-create-type', 'close', 'select-schedule', 'create-standalone'])

const formTabs = [
  { type: 'Video', label: '视频', desc: '进入视频脚本模板', icon: Video },
  { type: 'Image', label: '图片', desc: '进入图片需求模板', icon: ImageIcon },
  { type: 'Playable', label: '试玩', desc: '进入试玩需求模板', icon: Gamepad2 },
]

const formLabel = (type) => (type === 'Image' ? '图片' : type === 'Playable' ? '试玩' : '视频')
const formIcon = (type) => (type === 'Image' ? ImageIcon : type === 'Playable' ? Gamepad2 : Video)
const formColor = (type) => getFormConfig(type).color

const remainingCount = (schedule) => {
  const related = props.requirements.filter((requirement) => requirement.scheduleId === schedule.id)
  return Math.max(0, (schedule.totalRequiredCount || 0) - related.length)
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md animate-in fade-in duration-300">
    <div class="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between border-b border-slate-100 px-8 py-6">
        <div>
          <h3 class="text-xl font-black leading-tight text-slate-900">创建需求</h3>
          <p class="mt-1 text-xs font-medium text-slate-500">
            先按制作类型筛选方向，再选择要挂靠的方向；创建后的需求类型会跟随方向规定。
          </p>
        </div>
        <button class="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600" type="button" @click="emit('close')">
          <XCircle class="h-8 w-8" />
        </button>
      </div>

      <div class="border-b border-slate-100 bg-slate-50/40 px-8 pb-4 pt-6">
        <div class="flex items-center gap-3">
          <span class="shrink-0 text-[11px] font-black uppercase tracking-widest text-slate-400">制作类型</span>
          <button
            v-for="item in formTabs"
            :key="item.type"
            :class="`min-w-0 flex-1 rounded-2xl border px-4 py-3 text-left transition-all ${
              selectedCreateType === item.type
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40'
            }`"
            type="button"
            @click="emit('select-create-type', item.type)"
          >
            <div class="flex items-center gap-3">
              <div :class="`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selectedCreateType === item.type ? 'bg-white/15' : 'bg-slate-50'}`">
                <component :is="item.icon" :class="`h-4.5 w-4.5 ${selectedCreateType === item.type ? 'text-white' : 'text-indigo-600'}`" />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-black">{{ item.label }}</div>
                <div :class="`mt-0.5 text-[10px] font-semibold ${selectedCreateType === item.type ? 'text-indigo-100' : 'text-slate-400'}`">
                  {{ item.desc }}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div class="flex-1 space-y-4 overflow-y-auto p-8 no-scrollbar">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-black text-slate-900">选择挂靠方向</h4>
            <p class="mt-1 text-[11px] font-semibold text-slate-400">只展示创建时需要判断的关键信息：方向、优先级、负责人、截止和剩余容量。</p>
          </div>
          <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-500">
            筛选方向类型：{{ formLabel(selectedCreateType) }}
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            v-for="schedule in schedules.filter((item) => item.form === selectedCreateType)"
            :key="schedule.id"
            class="group relative flex cursor-pointer flex-col gap-4 rounded-3xl border border-slate-150 bg-white p-5 text-left transition-all hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-900/5"
            type="button"
            @click="emit('select-schedule', schedule.id)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="mb-2 flex items-center gap-2">
                  <span :class="`rounded-lg px-2 py-1 text-[10px] font-black shadow-sm ${getPriorityStyle(schedule.priority)}`">
                    {{ getPriorityLabel(schedule.priority) }}
                  </span>
                  <span :class="`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-black ${formColor(schedule.form)}`">
                    <component :is="formIcon(schedule.form)" class="h-3 w-3" />
                    方向类型 {{ formLabel(schedule.form) }}
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
                <div class="mt-1 truncate text-[11px] font-black text-slate-700">
                  <PersonParts :name="schedule.owner || '未指派'" size="xs" />
                </div>
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

        <button
          class="group flex cursor-pointer items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-all hover:border-primary/50 hover:bg-white"
          type="button"
          @click="emit('create-standalone')"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-slate-350 transition-all group-hover:scale-110 group-hover:border-primary group-hover:text-primary">
            <Plus class="h-6 w-6 text-slate-400 group-hover:text-primary" />
          </div>
          <div>
            <p class="text-xs font-extrabold uppercase tracking-tight text-slate-800 transition-colors group-hover:text-primary">不关联，直接创建空模版</p>
            <p class="mt-1 text-[10px] text-slate-400">使用当前制作类型：{{ formLabel(selectedCreateType) }}</p>
          </div>
        </button>
      </div>

      <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-4">
        <p class="text-[10px] font-extrabold uppercase text-slate-400">提示: 双击需求号可快捷绑定关联至所选的创意方向</p>
        <button class="px-6 py-2 text-xs font-black text-slate-400 transition-colors hover:text-slate-600" type="button" @click="emit('close')">
          取消
        </button>
      </div>
    </div>
  </div>
</template>
