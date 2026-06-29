<script setup>
import { ref } from 'vue'
import { Calendar, ChevronDown, Gamepad2, Image, Plus, Trash2, Video } from 'lucide-vue-next'
import PersonParts from './PersonParts.vue'
import RequirementInlineDropdown from './RequirementInlineDropdown.vue'
import {
  getDifficultyStyle,
  getDirectionTypeStyle,
  getFormConfig,
  getScenarioStyle,
} from './displayHelpers'
import { getPriorityStyle } from './styles'

defineProps({
  groupedSchedules: { type: Object, default: () => ({}) },
  collapsedWeeks: { type: Object, default: () => ({}) },
  requirements: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'toggle-week',
  'add-schedule',
  'update-schedule',
  'open-requirement',
  'view-requirements',
  'delete-schedule',
])

const formIcons = { Video, Playable: Gamepad2, Image }
const openLegacyMenuKey = ref(null)
const priorityOptions = [
  { value: '', label: '请选择' },
  { value: 'Low', label: '低' },
  { value: 'Mid', label: '中' },
  { value: 'High', label: '高' },
  { value: 'Highest', label: '最高' },
]
const difficultyOptions = [
  { value: '', label: '请选择' },
  { value: 'Senior', label: '高级' },
  { value: 'Junior', label: '初级' },
  { value: 'Test', label: '测试' },
]
const formOptions = [
  { value: '', label: '请选择' },
  { value: 'Video', label: '视频' },
  { value: 'Playable', label: '试玩' },
  { value: 'Image', label: '图片' },
]
const scenarioOptions = [
  { value: '', label: '请选择' },
  { value: 'Standard', label: '通投' },
  { value: 'Localized', label: '本地化' },
  { value: 'ASO', label: 'ASO' },
]
const directionTypeOptions = [
  { value: '', label: '请选择' },
  { value: 'Original-Gameplay', label: '原创-玩法' },
  { value: 'Original-Hook', label: '原创-吸量' },
  { value: 'Original-Master', label: '原创-母版' },
  { value: 'Scaling-Iteration', label: '放量-迭代' },
  { value: 'Scaling-Editing', label: '放量-剪辑' },
  { value: 'Test-Hook', label: '测试-吸量' },
  { value: 'Test-Gameplay', label: '测试-玩法' },
]
const getFormIcon = (form) => formIcons[form] || null
const getScheduleRequirements = (requirements, scheduleId) => requirements.filter((item) => item.scheduleId === scheduleId)
const getProgressWidth = (count, total) => `${((Number(count) || 0) / (Number(total) || 1)) * 100}%`
const openNativeDatePicker = (event) => {
  event.currentTarget?.showPicker?.()
}
const deleteScheduleRow = (row) => {
  emit('delete-schedule', { ...row, confirmMessage: '确定删除此行？' })
}
</script>

<template>
  <div class="hidden">
    <div v-for="[week, weekSchedules] in Object.entries(groupedSchedules)" :key="week" class="mb-6">
      <div class="sticky top-0 z-20 flex cursor-pointer items-center justify-between border-l-4 border-primary bg-primary/5 px-6 py-4 group" @click="emit('toggle-week', week)">
        <div class="flex items-center gap-4">
          <Calendar class="h-5 w-5 text-primary" />
          <input
            :value="week"
            class="w-64 border-none bg-transparent p-0 text-lg font-black text-slate-800 focus:ring-0"
            @click.stop
            @input="weekSchedules.forEach((schedule) => emit('update-schedule', schedule.id, { weekRange: $event.target.value }))"
          />
          <span class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{{ weekSchedules.length }} 个方向</span>
          <button class="ml-4 flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary px-4 py-1.5 text-white shadow-md transition-all hover:bg-slate-900" type="button" @click.stop="emit('add-schedule', week)">
            <Plus class="h-4 w-4" />
            <span class="text-[11px] font-black">添加排期方向</span>
          </button>
        </div>
        <ChevronDown :class="`h-5 w-5 text-slate-400 transition-all ${collapsedWeeks[week] ? '-rotate-90' : ''}`" />
      </div>

      <table v-if="!collapsedWeeks[week]" class="w-full border-collapse text-left">
        <thead class="sticky top-[60px] z-10 border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-sm">
          <tr>
            <th class="w-[200px] px-4 py-4">方向名称</th>
            <th class="px-4 py-4">时间节点</th>
            <th class="px-4 py-4">对应需求</th>
            <th class="px-4 py-4">优先级</th>
            <th class="px-4 py-4">难度</th>
            <th class="px-4 py-4">形式</th>
            <th class="px-4 py-4">场景</th>
            <th class="px-4 py-4">类型</th>
            <th class="px-4 py-4 text-center">排期进度 (提审/总需)</th>
            <th class="px-4 py-4">负责人</th>
            <th class="px-4 py-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 text-[11px]">
          <tr v-for="row in weekSchedules" :key="row.id" class="transition-colors hover:bg-slate-50/50">
            <td class="px-4 py-4">
              <input :value="row.directionName" class="w-full border-none bg-transparent p-0 text-sm font-black text-slate-800 focus:ring-0" @input="emit('update-schedule', row.id, { directionName: $event.target.value })" />
            </td>
            <td class="min-w-[140px] space-y-1 px-4 py-4 text-[10px] text-slate-500">
              <div class="flex items-center gap-2">
                <span class="w-12 font-bold text-slate-400">需求截止:</span>
                <input :value="row.requirementEnd" type="date" class="rounded border border-slate-100 bg-slate-50 px-1 font-mono text-[10px] focus:ring-0" @click="openNativeDatePicker" @input="emit('update-schedule', row.id, { requirementEnd: $event.target.value })" />
              </div>
              <div class="flex items-center gap-2">
                <span class="w-12 font-bold text-slate-400">制作截止:</span>
                <input :value="row.productionEnd" type="date" class="rounded border border-slate-100 bg-slate-50 px-1 font-mono text-[10px] focus:ring-0" @click="openNativeDatePicker" @input="emit('update-schedule', row.id, { productionEnd: $event.target.value })" />
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="flex max-w-[120px] flex-wrap gap-1">
                <button
                  v-for="requirement in requirements.filter((item) => item.scheduleId === row.id).slice(0, 2)"
                  :key="requirement.id"
                  class="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 shadow-sm transition-all hover:bg-primary/10 hover:text-primary"
                  type="button"
                  @click="emit('open-requirement', requirement)"
                >
                  {{ requirement.id.split('-')[0] }}
                </button>
                <button
                  v-if="getScheduleRequirements(requirements, row.id).length > 2"
                  class="rounded border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black text-indigo-500 shadow-sm transition-all hover:bg-indigo-100"
                  type="button"
                  @click="emit('view-requirements', getScheduleRequirements(requirements, row.id))"
                >
                  +{{ getScheduleRequirements(requirements, row.id).length - 2 }}
                </button>
                <span v-if="getScheduleRequirements(requirements, row.id).length === 0" class="text-[10px] italic text-slate-300">未关联</span>
              </div>
            </td>
            <td class="px-4 py-4">
              <RequirementInlineDropdown
                :menu-key="`legacy-${row.id}-priority`"
                :value="row.priority || ''"
                :options="priorityOptions"
                :open-menu-key="openLegacyMenuKey"
                :trigger-class="`rounded px-2 py-1 text-[10px] font-black ${getPriorityStyle(row.priority)}`"
                panel-class="w-32"
                @set-open-menu="openLegacyMenuKey = $event"
                @select="emit('update-schedule', row.id, { priority: $event })"
              />
            </td>
            <td class="px-4 py-4">
              <RequirementInlineDropdown
                :menu-key="`legacy-${row.id}-difficulty`"
                :value="row.difficulty || ''"
                :options="difficultyOptions"
                :open-menu-key="openLegacyMenuKey"
                :trigger-class="`rounded-lg border px-2 py-1 text-[10px] font-bold ${getDifficultyStyle(row.difficulty)}`"
                panel-class="w-32"
                @set-open-menu="openLegacyMenuKey = $event"
                @select="emit('update-schedule', row.id, { difficulty: $event })"
              />
            </td>
            <td class="px-4 py-4">
              <div :class="`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${getFormConfig(row.form).color}`">
                <component :is="getFormIcon(row.form)" v-if="getFormIcon(row.form)" class="h-3 w-3" />
                <RequirementInlineDropdown
                  :menu-key="`legacy-${row.id}-form`"
                  :value="row.form || ''"
                  :options="formOptions"
                  :open-menu-key="openLegacyMenuKey"
                  trigger-class="bg-transparent text-[10px] font-black"
                  panel-class="w-32"
                  @set-open-menu="openLegacyMenuKey = $event"
                  @select="emit('update-schedule', row.id, { form: $event })"
                />
              </div>
            </td>
            <td class="px-4 py-4">
              <RequirementInlineDropdown
                :menu-key="`legacy-${row.id}-scenario`"
                :value="row.scenario || ''"
                :options="scenarioOptions"
                :open-menu-key="openLegacyMenuKey"
                :trigger-class="`rounded-lg px-2 py-1 text-[10px] font-bold ${getScenarioStyle(row.scenario)}`"
                panel-class="w-32"
                @set-open-menu="openLegacyMenuKey = $event"
                @select="emit('update-schedule', row.id, { scenario: $event })"
              />
            </td>
            <td class="px-4 py-4">
              <RequirementInlineDropdown
                :menu-key="`legacy-${row.id}-direction-type`"
                :value="row.directionType || ''"
                :options="directionTypeOptions"
                :open-menu-key="openLegacyMenuKey"
                :trigger-class="`rounded-lg border px-2 py-1 text-[10px] font-bold ${getDirectionTypeStyle(row.directionType)}`"
                panel-class="w-40"
                @set-open-menu="openLegacyMenuKey = $event"
                @select="emit('update-schedule', row.id, { directionType: $event })"
              />
            </td>
            <td class="px-4 py-4 text-center">
              <div class="mx-auto flex w-full max-w-[140px] flex-col gap-2">
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[9px] font-bold">
                    <span class="text-slate-400">总需求数</span>
                    <div class="flex items-center gap-1">
                      <span class="text-slate-900">{{ row.submittedCount || 0 }}</span>
                      <span class="text-slate-300">/</span>
                      <input
                        :value="row.totalRequiredCount || 0"
                        type="number"
                        class="w-8 border-none bg-transparent p-0 text-[10px] font-bold text-slate-400 focus:ring-0"
                        @input="emit('update-schedule', row.id, { totalRequiredCount: Number($event.target.value) || 0 })"
                      />
                    </div>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full bg-primary" :style="{ width: getProgressWidth(row.submittedCount, row.totalRequiredCount) }"></div>
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[9px] font-bold">
                    <span class="text-emerald-500">有效产出</span>
                    <div class="flex items-center gap-1">
                      <input
                        :value="row.validCount || 0"
                        type="number"
                        class="w-8 rounded border border-emerald-100 bg-white px-1 py-0.5 text-[10px] font-black text-emerald-600 focus:ring-1 focus:ring-emerald-200"
                        @input="emit('update-schedule', row.id, { validCount: Number($event.target.value) || 0 })"
                      />
                      <span class="text-slate-300">/</span>
                      <input
                        :value="row.totalRequiredCount || 0"
                        type="number"
                        class="w-8 border-none bg-transparent p-0 text-[10px] font-bold text-slate-400 focus:ring-0"
                        @input="emit('update-schedule', row.id, { totalRequiredCount: Number($event.target.value) || 0 })"
                      />
                    </div>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-emerald-50">
                    <div class="h-full bg-emerald-500" :style="{ width: getProgressWidth(row.validCount, row.totalRequiredCount) }"></div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <PersonParts :name="row.owner || '未指派'" />
            </td>
            <td class="px-4 py-4 text-right">
              <button class="rounded p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600" type="button" @click="deleteScheduleRow(row)">
                <Trash2 class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button
      class="flex w-full cursor-pointer flex-col items-center justify-center border-t-4 border-slate-100 bg-slate-50/30 p-8 text-slate-400 transition-all group hover:bg-slate-50"
      type="button"
      @click="emit('add-schedule')"
    >
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 transition-all group-hover:scale-110 group-hover:rotate-90 group-hover:border-primary group-hover:text-primary">
        <Plus class="h-6 w-6" />
      </div>
      <p class="mt-3 text-xs font-black tracking-tight transition-colors group-hover:text-primary">创建排期周期</p>
    </button>
  </div>
</template>
