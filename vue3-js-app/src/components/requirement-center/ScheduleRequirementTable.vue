<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, Inbox, ListTodo, Pause, Play, Plus, Trash2 } from 'lucide-vue-next'
import DeliveryChannelsCell from './DeliveryChannelsCell.vue'
import PersonParts from './PersonParts.vue'
import ProductionSubmitDateDisplay from './ProductionSubmitDateDisplay.vue'
import { getSubmitTimeBadge } from './dateUtils'
import {
  getDeliveryStatusLabel,
  getDeliveryStatusStyle,
  getPriorityLabel,
  getPriorityStyle,
  getProdStatusLabel,
  getProdStatusStyle,
  getReqStatusLabel,
  getStatusStyle,
} from './styles'

const props = defineProps({
  schedule: {
    type: Object,
    required: true,
  },
  requirements: {
    type: Array,
    default: () => [],
  },
  editingScheduleId: {
    type: String,
    default: null,
  },
  isCycleAdjustOpen: {
    type: Boolean,
    default: false,
  },
  cycleAdjustRequirementIds: {
    type: Array,
    default: () => [],
  },
  todayDateString: {
    type: String,
    default: '2026-06-26',
  },
})

const emit = defineEmits([
  'add-requirement',
  'open-requirement',
  'update-requirement',
  'delete-requirement',
  'toggle-cycle-requirement',
])

const openRequirementMenuKey = ref(null)
const tableRootRef = ref(null)

const requirementDropdowns = {
  priority: {
    options: [
      { value: 'Low', label: '低' },
      { value: 'Mid', label: '中' },
      { value: 'High', label: '高' },
      { value: 'Highest', label: '最高' },
    ],
  },
  reqStatus: {
    options: [
      { value: 'Draft', label: '草稿' },
      { value: 'Pending', label: '待审核' },
      { value: 'Approved', label: '审核通过' },
      { value: 'Modification', label: '需求修改' },
    ],
  },
  prodStatus: {
    options: [
      { value: 'Unscheduled', label: '未排期' },
      { value: 'Scheduled', label: '已排期' },
      { value: 'InProgress', label: '进行中' },
      { value: 'Completed', label: '已完成' },
    ],
  },
}

const getSubmitDate = (req) =>
  req.endDate || props.schedule.productionEnd || props.schedule.submissionDeadline || props.schedule.requirementEnd || ''

const updateRequirement = (id, updates) => {
  emit('update-requirement', id, updates)
  openRequirementMenuKey.value = null
}

const deleteRequirement = (id) => {
  emit('delete-requirement', { id })
}

const closeOpenMenus = () => {
  openRequirementMenuKey.value = null
}

const handleDocumentClick = (event) => {
  if (!tableRootRef.value?.contains(event.target)) closeOpenMenus()
}

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') closeOpenMenus()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div ref="tableRootRef" class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-150 bg-white shadow-sm">
    <div class="flex shrink-0 flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
      <div>
        <h3 class="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-850">
          <ListTodo class="h-4 w-4 text-indigo-550" />
          方向下需求列表 ({{ requirements.length }})
        </h3>
        <p class="mt-0.5 text-[10px] font-semibold text-slate-400">字段顺序与需求大表保持一致，点击任意行进入需求详情</p>
      </div>

      <button
        :class="`inline-flex h-8 items-center gap-1.5 rounded-xl px-3.5 text-xs font-black transition-all ${
          editingScheduleId === schedule.id
            ? 'cursor-not-allowed bg-slate-100 text-slate-400 shadow-none'
            : 'cursor-pointer bg-primary text-white shadow-sm shadow-slate-900/15 hover:bg-slate-900 active:scale-95'
        }`"
        type="button"
        :disabled="editingScheduleId === schedule.id"
        :title="editingScheduleId === schedule.id ? '保存方向后再新建需求' : '新建需求'"
        @click="emit('add-requirement', schedule.id)"
      >
        <Plus class="h-3.5 w-3.5" />
        新建需求
      </button>
    </div>

    <div v-if="requirements.length === 0" class="flex flex-col items-center justify-center px-6 py-20 text-center text-slate-400">
      <Inbox class="mb-3 h-10 w-10 text-slate-200" />
      <p class="mb-4 text-xs font-extrabold text-slate-450">该方向中目前尚未创建任何需求合约</p>
      <button
        :class="`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-black transition-all ${
          editingScheduleId === schedule.id
            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
            : 'bg-primary text-white shadow-sm shadow-slate-900/15 hover:bg-slate-900'
        }`"
        type="button"
        :disabled="editingScheduleId === schedule.id"
        :title="editingScheduleId === schedule.id ? '保存方向后再新建需求' : '马上新建并关联该方向'"
        @click="emit('add-requirement', schedule.id)"
      >
        <Plus class="h-4 w-4" />
        马上新建并关联该方向
      </button>
    </div>

    <div v-else class="min-h-0 flex-1 overflow-auto no-scrollbar">
      <table class="w-full min-w-[1360px] border-collapse text-left text-xs">
        <thead class="sticky top-0 z-30 bg-white shadow-[0_1px_0_rgba(226,232,240,0.95)]">
          <tr class="select-none border-b border-slate-100 bg-white text-[10px] font-black uppercase text-slate-400 [&>th]:bg-white">
            <th v-if="isCycleAdjustOpen" class="w-[72px] whitespace-nowrap px-3 py-3.5 pl-8">带走</th>
            <th class="w-[118px] whitespace-nowrap px-4 py-3.5 pl-8">编号</th>
            <th class="w-[112px] whitespace-nowrap px-3 py-3.5">预览</th>
            <th class="w-[220px] whitespace-nowrap px-4 py-3.5">需求名称</th>
            <th class="w-[112px] whitespace-nowrap px-3 py-3.5 text-center">优先级</th>
            <th class="w-[118px] whitespace-nowrap px-3 py-3.5">创意人员</th>
            <th class="w-[128px] whitespace-nowrap px-3 py-3.5 text-center">制作人员</th>
            <th class="w-[138px] whitespace-nowrap px-3 py-3.5 text-center">投放渠道</th>
            <th class="w-[148px] whitespace-nowrap px-3 py-3.5 text-center">制作提交</th>
            <th class="w-[104px] whitespace-nowrap px-3 py-3.5 text-center">需求状态</th>
            <th class="w-[112px] whitespace-nowrap px-3 py-3.5 text-center">制作状态</th>
            <th class="w-[120px] whitespace-nowrap px-3 py-3.5 text-center">投放状态</th>
            <th class="w-[70px] whitespace-nowrap px-3 py-3.5 pr-6 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="req in requirements"
            :key="req.id"
            class="group cursor-pointer transition-all hover:bg-indigo-50/15"
            @click="emit('open-requirement', req)"
          >
            <td v-if="isCycleAdjustOpen" class="whitespace-nowrap px-3 py-3.5 pl-8">
              <button
                v-if="req.prodStatus !== 'Completed'"
                :class="`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                  cycleAdjustRequirementIds.includes(req.id)
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-200 bg-white text-transparent hover:border-emerald-200 hover:bg-emerald-50'
                }`"
                type="button"
                title="选择带到目标周期"
                @click.stop="emit('toggle-cycle-requirement', req.id)"
              >
                <Check class="h-3.5 w-3.5 stroke-[3]" />
              </button>
              <span v-else class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-[10px] font-black text-slate-300">-</span>
            </td>
            <td class="relative whitespace-nowrap px-4 py-3.5 pl-8 font-mono font-bold text-slate-400">
              <div v-if="req.parentId || req.parentRequirementId" class="absolute left-3 top-1/2 flex -translate-y-1/2 items-center">
                <div class="h-[1.5px] w-3.5 bg-slate-300"></div>
              </div>
              <span :class="req.parentId || req.parentRequirementId ? 'ml-4 inline-flex items-center whitespace-nowrap rounded bg-slate-100 px-1 py-0.5 text-[8px] font-bold text-slate-500' : 'inline-flex items-center whitespace-nowrap text-indigo-600'">
                {{ req.id }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-3.5">
              <div class="flex gap-1">
                <div v-for="(preview, index) in (req.previews || []).slice(0, 3)" :key="`${req.id}-${index}`" class="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-3xs transition-transform hover:z-10 hover:scale-110">
                  <img :src="preview" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                </div>
              </div>
            </td>
            <td class="px-4 py-3.5 font-bold text-slate-800">
              <span class="block max-w-[200px] truncate" :title="req.name">{{ req.name }}</span>
            </td>
            <td class="px-3 py-3.5 text-center" @click.stop>
              <div class="relative flex justify-center">
                <button :class="`h-7 w-24 rounded-lg border border-transparent px-2 text-[10px] font-bold hover:border-slate-200 ${getPriorityStyle(req.priority)}`" type="button" @click="openRequirementMenuKey = openRequirementMenuKey === `${req.id}:priority` ? null : `${req.id}:priority`">
                  {{ getPriorityLabel(req.priority) }}
                </button>
                <div v-if="openRequirementMenuKey === `${req.id}:priority`" class="absolute top-full z-[150] mt-2 w-32 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                  <button v-for="option in requirementDropdowns.priority.options" :key="option.value" class="flex h-8 w-full items-center justify-between rounded-xl px-3 text-left text-[11px] font-black text-slate-600 hover:bg-slate-50" type="button" @click="updateRequirement(req.id, { priority: option.value })">
                    {{ option.label }}
                    <Check v-if="req.priority === option.value" class="h-4 w-4 text-indigo-500" />
                  </button>
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-3.5">
              <PersonParts :name="req.creativePersonnel" />
            </td>
            <td class="px-3 py-3.5">
              <div class="mx-auto flex max-w-[112px] flex-wrap justify-center gap-1.5">
                <PersonParts :people="req.productionPersonnel || []" mode="stack" :max-visible="2" />
              </div>
            </td>
            <td class="px-3 py-3.5">
              <DeliveryChannelsCell :channels="req.channels || []" />
            </td>
            <td class="px-3 py-3.5 text-center">
              <ProductionSubmitDateDisplay
                :date="getSubmitDate(req)"
                :badge="getSubmitTimeBadge(getSubmitDate(req), todayDateString)"
              />
            </td>
            <td class="px-3 py-3.5" @click.stop>
              <div class="relative flex justify-center">
                <button :class="`h-7 min-w-[92px] rounded-full border border-transparent px-2.5 text-[10px] font-black ${getStatusStyle(req.reqStatus)}`" type="button" @click="openRequirementMenuKey = openRequirementMenuKey === `${req.id}:reqStatus` ? null : `${req.id}:reqStatus`">
                  {{ getReqStatusLabel(req.reqStatus) }}
                </button>
                <div v-if="openRequirementMenuKey === `${req.id}:reqStatus`" class="absolute top-full z-[150] mt-2 w-36 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                  <button v-for="option in requirementDropdowns.reqStatus.options" :key="option.value" class="flex h-8 w-full items-center justify-between rounded-xl px-3 text-left text-[11px] font-black text-slate-600 hover:bg-slate-50" type="button" @click="updateRequirement(req.id, { reqStatus: option.value })">
                    {{ option.label }}
                    <Check v-if="req.reqStatus === option.value" class="h-4 w-4 text-indigo-500" />
                  </button>
                </div>
              </div>
            </td>
            <td class="px-3 py-3.5" @click.stop>
              <div class="relative flex justify-center">
                <button :class="`h-7 min-w-[82px] rounded-lg border px-2 text-[10px] font-bold tracking-tight ${getProdStatusStyle(req.prodStatus)}`" type="button" @click="openRequirementMenuKey = openRequirementMenuKey === `${req.id}:prodStatus` ? null : `${req.id}:prodStatus`">
                  {{ getProdStatusLabel(req.prodStatus) }}
                </button>
                <div v-if="openRequirementMenuKey === `${req.id}:prodStatus`" class="absolute top-full z-[150] mt-2 w-32 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                  <button v-for="option in requirementDropdowns.prodStatus.options" :key="option.value" class="flex h-8 w-full items-center justify-between rounded-xl px-3 text-left text-[11px] font-black text-slate-600 hover:bg-slate-50" type="button" @click="updateRequirement(req.id, { prodStatus: option.value })">
                    {{ option.label }}
                    <Check v-if="req.prodStatus === option.value" class="h-4 w-4 text-indigo-500" />
                  </button>
                </div>
              </div>
            </td>
            <td class="px-3 py-3.5 text-center">
              <div class="flex justify-center">
                <span
                  :class="`flex min-w-[76px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1 text-[10px] font-black shadow-3xs ${getDeliveryStatusStyle(req.deliveryStatus)}`"
                  title="投放状态由三方投放数据同步，需求界面不可手动修改"
                >
                  <Play v-if="req.deliveryStatus === 'Delivering'" class="h-2.5 w-2.5 fill-current text-emerald-600" />
                  <Pause v-else class="h-2.5 w-2.5 fill-current text-slate-400" />
                  <span>{{ getDeliveryStatusLabel(req.deliveryStatus) }}</span>
                </span>
              </div>
            </td>
            <td class="px-3 py-3.5 pr-6 text-right" @click.stop>
              <button class="rounded-xl border border-transparent p-2 text-slate-350 opacity-40 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" type="button" title="从列表中删除" @click="deleteRequirement(req.id)">
                <Trash2 class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
