<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown, Copy, MoreHorizontal, Pause, Play, Plus, PlusCircle, Search, Trash2, X } from 'lucide-vue-next'
import DeliveryChannelsCell from './DeliveryChannelsCell.vue'
import PersonParts from './PersonParts.vue'
import ProductionSubmitDateDisplay from './ProductionSubmitDateDisplay.vue'
import RequirementInlineDropdown from './RequirementInlineDropdown.vue'
import DateRangePicker from '../DateRangePicker.vue'
import { getSubmitTimeBadge } from './dateUtils'
import { useRequirementListFilters } from './useRequirementListFilters'
import {
  getDeliveryStatusLabel,
  getDeliveryStatusStyle,
  getPriorityStyle,
  getProdStatusStyle,
  getStatusStyle,
} from './styles'

const props = defineProps({
  requirements: {
    type: Array,
    default: () => [],
  },
  todayDateString: {
    type: String,
    default: '2026-06-26',
  },
  getRequirementVersionGroup: {
    type: Function,
    default: (requirement) => [requirement],
  },
  highRiskRequirements: {
    type: Array,
    default: () => [],
  },
  currentSort: {
    type: String,
    default: 'none',
  },
  sortOrder: {
    type: String,
    default: 'desc',
  },
})

const emit = defineEmits(['open-requirement', 'delete-requirement', 'open-create', 'update-requirement', 'open-iteration', 'add-sub-requirement'])

const requirementSource = computed(() => props.requirements)
const openInlineMenuKey = ref(null)
const listRootRef = ref(null)

const {
  searchQuery,
  filters,
  filterConfigs,
  openRequirementFilterKey,
  createdRangeStart,
  createdRangeEnd,
  completedRangeStart,
  completedRangeEnd,
  filteredRequirements,
  hasActiveRequirementQuery,
  getFilterDisplayText,
  getFilterOptionLabel,
  toggleRequirementFilterOption,
  clearRequirementFilter,
  resetRequirementFilters,
  decodeFilterValue,
} = useRequirementListFilters({
  requirements: requirementSource,
  highRiskRequirements: computed(() => props.highRiskRequirements),
  currentSort: computed(() => props.currentSort),
  sortOrder: computed(() => props.sortOrder),
})

const getSubmitDate = (requirement) => requirement.endDate || ''
const getIterationPreviewText = (requirement) => {
  const group = props.getRequirementVersionGroup(requirement)
  return group.length > 1
    ? `将复制 ${group.map((item) => item.id).join('、')}，并按原小版本顺序生成新大版本`
    : '当前大版本只有 1 条需求，将生成 -01 迭代版本'
}
const isParentRequirement = (requirement) => (requirement.level || 0) === 0

const closeOpenMenus = () => {
  openInlineMenuKey.value = null
  openRequirementFilterKey.value = null
}

const handleDocumentClick = (event) => {
  if (!listRootRef.value?.contains(event.target)) closeOpenMenus()
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
  <div ref="listRootRef" class="flex h-full min-h-[720px] flex-col gap-4 overflow-hidden">
    <div class="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="group relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-primary" />
            <input
              v-model="searchQuery"
              class="w-60 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="搜索编号、名称..."
              type="text"
            />
          </div>
        </div>

        <button class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[11px] font-bold text-white transition-all hover:bg-slate-900" type="button" @click="emit('open-create')">
          <Plus class="h-4 w-4" />
          新增需求
        </button>
      </div>

      <div class="border-t border-slate-50 pt-4">
        <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span class="mr-1 shrink-0 text-[11px] font-black text-slate-400">快速过滤:</span>

          <div v-for="config in filterConfigs" :key="config.key" class="relative">
            <button
              type="button"
              :class="`inline-flex h-9 min-w-[152px] items-center justify-between gap-2 rounded-xl border px-3 shadow-3xs transition-all ${
                decodeFilterValue(filters[config.key]).length > 0
                  ? 'border-indigo-200 bg-indigo-50 pr-8 text-indigo-700'
                  : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`"
              @click="openRequirementFilterKey = openRequirementFilterKey === config.key ? null : config.key"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span class="shrink-0 text-[10px] font-black text-slate-400">{{ config.label }}:</span>
                <span class="max-w-[76px] truncate text-[11px] font-black">{{ getFilterDisplayText(filters[config.key]) }}</span>
              </span>
              <ChevronDown v-if="decodeFilterValue(filters[config.key]).length === 0" :class="`h-3.5 w-3.5 shrink-0 transition-transform ${openRequirementFilterKey === config.key ? 'rotate-180' : ''}`" />
            </button>
            <button
              v-if="decodeFilterValue(filters[config.key]).length > 0"
              type="button"
              class="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-lg text-indigo-400 transition-all hover:bg-white/80 hover:text-rose-500"
              @click.stop="clearRequirementFilter(config.key)"
            >
              <X class="h-3 w-3" />
            </button>

            <div v-if="openRequirementFilterKey === config.key" class="absolute left-0 top-full z-[120] mt-2 w-52 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <button
                type="button"
                :class="`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                  decodeFilterValue(filters[config.key]).length === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                }`"
                @click="
                  toggleRequirementFilterOption(config.key, '全部');
                  openRequirementFilterKey = null
                "
              >
                <span>全部</span>
                <Check v-if="decodeFilterValue(filters[config.key]).length === 0" class="h-4 w-4 shrink-0 stroke-[3] text-indigo-500" />
              </button>
              <div class="my-1 h-px bg-slate-100" />
              <button
                v-for="option in config.options.filter((item) => item !== '全部')"
                :key="option"
                type="button"
                :class="`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                  decodeFilterValue(filters[config.key]).includes(option) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`"
                @click="toggleRequirementFilterOption(config.key, option)"
              >
                <span
                  :class="`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                    decodeFilterValue(filters[config.key]).includes(option)
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-200 bg-white text-transparent'
                  }`"
                >
                  <Check class="h-3 w-3 stroke-[3]" />
                </span>
                <span class="truncate">{{ getFilterOptionLabel(option) }}</span>
              </button>
            </div>
          </div>

          <DateRangePicker
            label="提出时间:"
            :start="createdRangeStart"
            :end="createdRangeEnd"
            compact
            class-name="min-w-[260px]"
            @change="
              createdRangeStart = $event.start;
              createdRangeEnd = $event.end
            "
          />

          <DateRangePicker
            label="完成时间:"
            :start="completedRangeStart"
            :end="completedRangeEnd"
            compact
            class-name="min-w-[260px]"
            @change="
              completedRangeStart = $event.start;
              completedRangeEnd = $event.end
            "
          />

          <button class="h-9 rounded-xl border border-transparent px-3 text-[10px] font-black text-slate-400 transition-all hover:border-rose-150 hover:bg-rose-50 hover:text-rose-600" type="button" @click="resetRequirementFilters">
            清除筛选
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div v-if="!hasActiveRequirementQuery" class="flex h-full min-h-[520px] items-center justify-center bg-gradient-to-b from-white to-slate-50/70 p-8">
        <div class="flex w-full max-w-4xl flex-col items-center text-center">
          <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 shadow-sm">
            <PlusCircle class="h-8 w-8 text-indigo-600" />
          </div>
          <h2 class="text-2xl font-black tracking-tight text-slate-900">新建需求</h2>
          <p class="mt-2 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
            先创建新的创意需求；需要查历史需求时，再使用上方搜索或筛选条件展开对应列表。
          </p>
          <div class="mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              class="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-4 rounded-[2rem] bg-indigo-600 px-8 text-base font-black text-white shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 active:translate-y-0 active:shadow-lg"
              @click="emit('open-create', 'Video')"
            >
              <Plus class="h-7 w-7 shrink-0 stroke-[2.2]" />
              创建视频需求
            </button>
            <button
              type="button"
              class="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-4 rounded-[2rem] bg-slate-900 px-8 text-base font-black text-white shadow-xl shadow-slate-900/25 transition-all hover:-translate-y-0.5 hover:bg-slate-805 active:translate-y-0 active:shadow-lg"
              @click="emit('open-create', 'Image')"
            >
              <Plus class="h-7 w-7 shrink-0 stroke-[2.2]" />
              创建图片需求
            </button>
            <button
              type="button"
              class="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-4 rounded-[2rem] bg-emerald-500 px-8 text-base font-black text-white shadow-xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 active:translate-y-0 active:shadow-lg"
              @click="emit('open-create', 'Playable')"
            >
              <Plus class="h-7 w-7 shrink-0 stroke-[2.2]" />
              创建试玩需求
            </button>
          </div>
        </div>
      </div>

      <div v-else class="h-full overflow-auto no-scrollbar">
        <table class="w-full min-w-[1520px] border-collapse text-left">
          <thead class="sticky top-0 z-10 border-b border-slate-100 bg-slate-50">
            <tr class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="w-[150px] whitespace-nowrap px-4 py-3 font-sans">编号</th>
              <th class="w-[120px] whitespace-nowrap px-4 py-3 font-sans">预览</th>
              <th class="w-[220px] whitespace-nowrap px-4 py-3 font-sans">需求名称</th>
              <th class="w-[110px] whitespace-nowrap px-4 py-3 text-center font-sans">优先级</th>
              <th class="w-[120px] whitespace-nowrap px-4 py-3 font-sans">创意人员</th>
              <th class="w-[110px] whitespace-nowrap px-4 py-3 text-center font-sans">制作人员</th>
              <th class="w-[170px] whitespace-nowrap px-4 py-3 text-center font-sans">投放渠道</th>
              <th class="w-[148px] whitespace-nowrap px-4 py-3 text-center font-sans">制作提交</th>
              <th class="w-[130px] whitespace-nowrap px-4 py-3 text-center font-sans">需求状态</th>
              <th class="w-[130px] whitespace-nowrap px-4 py-3 text-center font-sans">制作状态</th>
              <th class="w-[130px] whitespace-nowrap px-4 py-3 text-center font-sans">投放状态</th>
              <th class="w-[80px] whitespace-nowrap px-4 py-3 text-right font-sans">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-[11px]">
            <tr
              v-for="req in filteredRequirements"
              :key="req.id"
              class="group cursor-pointer transition-all hover:bg-slate-50/80"
              @click="emit('open-requirement', req)"
            >
              <td class="relative px-4 py-3 font-mono font-medium text-slate-400 group-hover:text-primary">
                <div v-if="(req.level || 0) > 0" class="absolute left-0 top-1/2 flex -translate-y-1/2 items-center">
                  <div class="ml-2 h-px w-3 bg-slate-200" />
                  <div class="absolute -left-1 bottom-1/2 h-full w-px bg-slate-200" />
                </div>
                <div :class="`flex items-center gap-2 ${(req.level || 0) > 0 ? 'ml-4' : ''}`">
                  <span class="whitespace-nowrap">{{ req.id }}</span>
                  <div class="flex items-center gap-1" @click.stop>
                    <div class="group/iter relative">
                      <button
                        class="rounded-md border border-blue-100 bg-blue-50 p-1 text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100"
                        type="button"
                        title="迭代当前需求"
                        @click="emit('open-iteration', { source: req, mode: 'single' })"
                      >
                        <Copy class="h-3.5 w-3.5" />
                      </button>
                      <div class="pointer-events-none absolute left-0 top-full z-[90] mt-2 hidden w-56 rounded-xl border border-slate-150 bg-white p-3 text-left shadow-xl group-hover/iter:block">
                        <div class="text-[10px] font-black text-slate-800">迭代当前需求</div>
                        <div class="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">先选择方向，生成新大版本的 -01，并引用 {{ req.id }} 的描述和引用信息。</div>
                      </div>
                    </div>
                    <div v-if="isParentRequirement(req)" class="group/iterall relative">
                      <button
                        class="rounded-md border border-slate-200 bg-white p-1 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        type="button"
                        title="迭代全部版本"
                        @click="emit('open-iteration', { source: req, mode: 'all' })"
                      >
                        <Copy class="h-3.5 w-3.5" />
                      </button>
                      <div class="pointer-events-none absolute left-0 top-full z-[90] mt-2 hidden w-64 rounded-xl border border-slate-150 bg-white p-3 text-left shadow-xl group-hover/iterall:block">
                        <div class="text-[10px] font-black text-slate-800">迭代全部版本</div>
                        <div class="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">{{ getIterationPreviewText(req) }}</div>
                      </div>
                    </div>
                    <div class="group/addsub relative">
                      <button
                        class="rounded-md border border-emerald-100 bg-emerald-50 p-1 text-emerald-600 transition-all hover:border-emerald-300 hover:bg-emerald-100"
                        type="button"
                        title="添加子需求"
                        @click="emit('add-sub-requirement', req)"
                      >
                        <Plus class="h-3.5 w-3.5" />
                      </button>
                      <div class="pointer-events-none absolute left-0 top-full z-[90] mt-2 hidden w-56 rounded-xl border border-slate-150 bg-white p-3 text-left shadow-xl group-hover/addsub:block">
                        <div class="text-[10px] font-black text-slate-800">添加子需求</div>
                        <div class="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">有空草稿版本时直接打开；没有则按当前大版本顺序生成下一条子需求。</div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <div v-for="preview in (req.previews || []).slice(0, 2)" :key="preview" class="h-6 w-6 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100">
                    <img :src="preview" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-sans font-bold text-slate-700">
                <span class="block max-w-[200px] truncate" :title="req.name">{{ req.name }}</span>
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex justify-center font-sans">
                  <RequirementInlineDropdown
                    :menu-key="`${req.id}:list:priority`"
                    :value="req.priority"
                    :options="[
                      { value: 'Low', label: '低' },
                      { value: 'Mid', label: '中' },
                      { value: 'High', label: '高' },
                      { value: 'Highest', label: '最高' },
                    ]"
                    :trigger-class="`h-7 min-w-[76px] rounded-lg border border-transparent px-2 text-[10px] font-black ${getPriorityStyle(req.priority)}`"
                    panel-class="w-32"
                    :open-menu-key="openInlineMenuKey"
                    @set-open-menu="openInlineMenuKey = $event"
                    @select="emit('update-requirement', req.id, { priority: $event })"
                  />
                </div>
              </td>
              <td class="px-4 py-3 font-sans">
                <PersonParts :name="req.creativePersonnel" />
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center">
                  <PersonParts mode="stack" :people="req.productionPersonnel" />
                </div>
              </td>
              <td class="px-4 py-3">
                <DeliveryChannelsCell :channels="req.channels || []" />
              </td>
              <td class="px-4 py-3 text-center">
                <ProductionSubmitDateDisplay
                  :date="getSubmitDate(req)"
                  :badge="getSubmitTimeBadge(getSubmitDate(req), todayDateString)"
                />
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex justify-center font-sans">
                  <RequirementInlineDropdown
                    :menu-key="`${req.id}:list:reqStatus`"
                    :value="req.reqStatus"
                    :options="[
                      { value: 'Draft', label: '草稿' },
                      { value: 'Pending', label: '待审核' },
                      { value: 'Approved', label: '审核通过' },
                      { value: 'Modification', label: '需求修改' },
                    ]"
                    :trigger-class="`h-7 min-w-[92px] rounded-full border border-transparent px-2.5 text-[10px] font-bold ${getStatusStyle(req.reqStatus)}`"
                    panel-class="w-36"
                    :open-menu-key="openInlineMenuKey"
                    @set-open-menu="openInlineMenuKey = $event"
                    @select="emit('update-requirement', req.id, { reqStatus: $event })"
                  />
                </div>
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex justify-center font-sans">
                  <RequirementInlineDropdown
                    :menu-key="`${req.id}:list:prodStatus`"
                    :value="req.prodStatus"
                    :options="[
                      { value: 'Unscheduled', label: '未排期' },
                      { value: 'Scheduled', label: '已排期' },
                      { value: 'InProgress', label: '进行中' },
                      { value: 'Completed', label: '已完成' },
                    ]"
                    :trigger-class="`h-7 min-w-[82px] rounded-lg border px-2 text-[10px] font-bold ${getProdStatusStyle(req.prodStatus)}`"
                    panel-class="w-32"
                    :open-menu-key="openInlineMenuKey"
                    @set-open-menu="openInlineMenuKey = $event"
                    @select="emit('update-requirement', req.id, { prodStatus: $event })"
                  />
                </div>
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex justify-center font-sans">
                  <span
                    :class="`inline-flex min-w-[82px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 font-bold ${getDeliveryStatusStyle(req.deliveryStatus)}`"
                    title="投放状态由三方投放数据同步，需求界面不可手动修改"
                  >
                    <Play v-if="req.deliveryStatus === 'Delivering'" class="h-2.5 w-2.5 fill-current" />
                    <Pause v-else class="h-2.5 w-2.5 fill-current" />
                    {{ getDeliveryStatusLabel(req.deliveryStatus) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="group/action relative inline-block font-sans">
                  <button class="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100" type="button">
                    <MoreHorizontal class="h-4 w-4" />
                  </button>
                  <div class="absolute right-0 top-full z-[80] mt-1 hidden w-24 rounded-xl border border-slate-100 bg-white py-1 shadow-xl group-hover/action:block">
                    <button class="flex w-full items-center gap-2 px-3 py-1.5 text-left font-bold text-rose-500 transition-colors hover:bg-rose-50" type="button" @click="emit('delete-requirement', { id: req.id, confirmMessage: '确定删除该需求吗？' })">
                      <Trash2 class="h-3.5 w-3.5" />
                      删除
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
