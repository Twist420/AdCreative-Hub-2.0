<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronDown, ChevronUp, Filter, Plus, Search, Settings, Trash2 } from 'lucide-vue-next'
import DateRangePicker from './DateRangePicker.vue'
import AnalyticsSelect from './analytics/AnalyticsSelect.vue'
import { generateMaterialDetails } from '../services/mockData'
import { getRecentUtcRange } from './creative-analysis/creativeAnalysisParts'

const recentRange = getRecentUtcRange(30)
const launchStart = ref('')
const launchEnd = ref('')
const spendStart = ref(recentRange.start)
const spendEnd = ref(recentRange.end)
const language = ref('all')
const channel = ref('')
const rawData = ref([])
const searchQuery = ref('')
const visibleColumns = ref(new Set())
const showColConfig = ref(false)
const showFilterConfig = ref(false)
const filters = ref([])
const sortConfig = ref({ key: null, direction: null })
const colConfigRef = ref(null)
const filterConfigRef = ref(null)

const allHeaders = [
  { key: 'date', label: '时间', width: 'w-24', isNum: false },
  { key: 'thumbnail', label: '素材预览', width: 'w-16', isNum: false },
  { key: 'title', label: '素材内容标题', width: 'min-w-[200px] flex-1', isNum: false },
  { key: 'direction', label: '方向', width: 'w-24', isNum: false },
  { key: 'language', label: '语言', width: 'w-16', isNum: false },
  { key: 'owner', label: '创意负责人', width: 'w-24', isNum: false },
  { key: 'cost', label: '花费', width: 'w-20', isNum: true },
  { key: 'costRatio', label: '花费占比', width: 'w-20', isNum: true },
  { key: 'cpm', label: 'CPM', width: 'w-16', isNum: true },
  { key: 'cpi', label: 'CPI', width: 'w-16', isNum: true },
  { key: 'ctr', label: 'CTR', width: 'w-16', isNum: true },
  { key: 'cvr', label: 'CVR', width: 'w-16', isNum: true },
  { key: 'roas', label: 'D0/D7 ROAS', width: 'w-24', isNum: true },
  { key: 'installs', label: '安装数', width: 'w-20', isNum: true },
  { key: 'payingUsers', label: '付费用户数量', width: 'w-24', isNum: true },
  { key: 'diffHighestCost', label: '偏差值(Top)', width: 'w-24', isNum: true },
  { key: 'diffAvgCost', label: '偏差值(Avg)', width: 'w-24', isNum: true },
]

visibleColumns.value = new Set(allHeaders.map((header) => header.key))

const fieldOptions = allHeaders
  .filter((header) => header.key !== 'thumbnail')
  .map((header) => ({ value: header.key, label: header.label }))
const operatorOptions = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '=', label: '=' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
]
const languageOptions = [
  { value: 'en', label: '英语' },
  { value: 'localized', label: '本地' },
]
const channelOptions = [
  { value: 'applovin', label: 'AppLovin' },
  { value: 'unity', label: 'Unity' },
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
]

const refreshData = () => {
  rawData.value = generateMaterialDetails(
    launchStart.value,
    launchEnd.value,
    spendStart.value,
    spendEnd.value,
    language.value,
    channel.value || 'all',
  )
}

watch([launchStart, launchEnd, spendStart, spendEnd, language, channel], refreshData, { immediate: true })

const toggleColumn = (key) => {
  const next = new Set(visibleColumns.value)
  if (next.has(key)) {
    if (next.size > 1) next.delete(key)
  } else next.add(key)
  visibleColumns.value = next
}

const handleSort = (key) => {
  let direction = 'asc'
  if (sortConfig.value.key === key) {
    if (sortConfig.value.direction === 'asc') direction = 'desc'
    else if (sortConfig.value.direction === 'desc') direction = null
  }
  sortConfig.value = { key: direction ? key : null, direction }
}

const addFilter = () => {
  filters.value = [
    ...filters.value,
    {
      id: Math.random().toString(36).slice(2, 11),
      field: 'cvr',
      operator: '>',
      value: '',
    },
  ]
}

const removeFilter = (id) => {
  filters.value = filters.value.filter((filter) => filter.id !== id)
}

const updateFilter = (id, updates) => {
  filters.value = filters.value.map((filter) => (filter.id === id ? { ...filter, ...updates } : filter))
}

const processedData = computed(() => {
  let result = [...rawData.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((row) => (
      row.title.toLowerCase().includes(query)
      || row.owner.toLowerCase().includes(query)
      || row.id.toLowerCase().includes(query)
      || row.direction.toLowerCase().includes(query)
    ))
  }

  if (filters.value.length > 0) {
    result = result.filter((row) => filters.value.every((filter) => {
      const column = allHeaders.find((header) => header.key === filter.field)
      const isNumericField = column?.isNum
      let value = row[filter.field]
      let filterValue = filter.value

      if (isNumericField) {
        value = Number(value)
        filterValue = Number(filter.value)
        if (Number.isNaN(filterValue)) return true
      } else {
        value = String(value).toLowerCase()
        filterValue = String(filter.value).toLowerCase()
      }

      if (filter.operator === '>') return value > filterValue
      if (filter.operator === '<') return value < filterValue
      if (filter.operator === '=') return isNumericField ? value === filterValue : String(value).includes(String(filterValue))
      if (filter.operator === '>=') return value >= filterValue
      if (filter.operator === '<=') return value <= filterValue
      return true
    }))
  }

  if (sortConfig.value.key && sortConfig.value.direction) {
    result.sort((a, b) => {
      const valueA = a[sortConfig.value.key]
      const valueB = b[sortConfig.value.key]
      if (valueA < valueB) return sortConfig.value.direction === 'asc' ? -1 : 1
      if (valueA > valueB) return sortConfig.value.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const visibleHeaders = computed(() => allHeaders.filter((header) => visibleColumns.value.has(header.key)))

const closeFloatingPanels = (event) => {
  if (colConfigRef.value && !colConfigRef.value.contains(event.target)) showColConfig.value = false
  if (filterConfigRef.value && !filterConfigRef.value.contains(event.target)) showFilterConfig.value = false
}

const closeOnEscape = (event) => {
  if (event.key === 'Escape') {
    showColConfig.value = false
    showFilterConfig.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', closeFloatingPanels)
  document.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeFloatingPanels)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div class="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
    <div class="z-20 space-y-4 border-b border-slate-100 bg-white px-6 py-4">
      <div class="flex flex-wrap items-center gap-2">
        <DateRangePicker
          mode="launch"
          :start="launchStart"
          :end="launchEnd"
          compact
          class-name="min-w-[240px]"
          @change="
            launchStart = $event.start;
            launchEnd = $event.end
          "
        />
        <DateRangePicker
          mode="spend"
          :start="spendStart"
          :end="spendEnd"
          compact
          class-name="min-w-[240px]"
          @change="
            spendStart = $event.start;
            spendEnd = $event.end
          "
        />
        <AnalyticsSelect v-model="language" :options="languageOptions" placeholder="语言" class-name="w-[180px]" />
        <AnalyticsSelect v-model="channel" :options="channelOptions" placeholder="渠道" class-name="w-[180px]" />
      </div>

      <div class="flex items-center justify-between pt-2">
        <div class="group relative mr-4 w-full max-w-md">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-indigo-600" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search materials by title, ID or owner..."
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex items-center gap-3">
          <div ref="colConfigRef" class="relative">
            <button
              type="button"
              :class="`flex items-center rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                showColConfig ? 'border-slate-300 bg-slate-100 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`"
              @click="showColConfig = !showColConfig"
            >
              <Settings class="mr-2 h-3.5 w-3.5" />
              字段配置
            </button>
            <div v-if="showColConfig" class="absolute right-0 top-full z-50 mt-2 max-h-96 w-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
              <div class="mb-1 px-2 py-1 text-xs font-semibold text-slate-400">显示列</div>
              <label
                v-for="column in allHeaders"
                :key="column.key"
                class="flex cursor-pointer items-center rounded px-2 py-1.5 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  :checked="visibleColumns.has(column.key)"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  @change="toggleColumn(column.key)"
                />
                <span class="ml-2 text-sm text-slate-700">{{ column.label }}</span>
              </label>
            </div>
          </div>

          <div ref="filterConfigRef" class="relative">
            <button
              type="button"
              :class="`flex items-center rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                showFilterConfig || filters.length > 0 ? 'border-slate-300 bg-slate-100 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`"
              @click="showFilterConfig = !showFilterConfig"
            >
              <Filter class="mr-2 h-3.5 w-3.5" />
              筛选
              <span v-if="filters.length > 0" class="ml-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">{{ filters.length }}</span>
            </button>

            <div v-if="showFilterConfig" class="absolute right-0 top-full z-50 mt-2 w-[450px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800">设置筛选条件</h3>
                <button type="button" class="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500" @click="addFilter">
                  <Plus class="mr-1 h-3 w-3" />
                  添加条件
                </button>
              </div>

              <p v-if="filters.length === 0" class="py-4 text-center text-xs text-slate-400">暂无筛选条件，点击右上角添加</p>
              <div v-else class="space-y-3">
                <div v-for="filter in filters" :key="filter.id" class="flex items-center gap-2">
                  <AnalyticsSelect
                    :model-value="filter.field"
                    :options="fieldOptions"
                    compact
                    class-name="w-36"
                    @update:model-value="updateFilter(filter.id, { field: $event })"
                  />
                  <AnalyticsSelect
                    :model-value="filter.operator"
                    :options="operatorOptions"
                    compact
                    class-name="w-20"
                    @update:model-value="updateFilter(filter.id, { operator: $event })"
                  />
                  <input
                    :value="filter.value"
                    type="text"
                    class="w-24 flex-1 rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                    placeholder="Value"
                    @input="updateFilter(filter.id, { value: $event.target.value })"
                  />
                  <button type="button" class="p-1 text-slate-400 hover:text-rose-500" @click="removeFilter(filter.id)">
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <table class="w-full border-collapse text-left">
        <thead class="sticky top-0 z-10 bg-slate-50 shadow-sm">
          <tr>
            <th
              v-for="header in visibleHeaders"
              :key="header.key"
              :class="`border-b border-r border-slate-200 px-3 py-3 text-xs font-semibold text-slate-500 last:border-r-0 hover:bg-slate-100 ${header.width} ${
                header.isNum ? 'text-right' : 'text-left'
              } cursor-pointer select-none whitespace-normal transition-colors`"
              @click="handleSort(header.key)"
            >
              <div :class="`group flex h-full items-center gap-1 ${header.isNum ? 'justify-end' : 'justify-start'}`">
                <span>{{ header.label }}</span>
                <div class="ml-1 flex w-3 flex-col">
                  <ChevronUp v-if="sortConfig.key === header.key && sortConfig.direction === 'asc'" class="h-3 w-3 text-indigo-600" />
                  <ChevronDown v-else-if="sortConfig.key === header.key && sortConfig.direction === 'desc'" class="h-3 w-3 text-indigo-600" />
                  <div v-else class="-space-y-1 opacity-0 group-hover:opacity-40">
                    <ChevronUp class="h-2.5 w-2.5" />
                    <ChevronDown class="h-2.5 w-2.5" />
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="row in processedData" :key="row.id" class="group transition-colors hover:bg-slate-50">
            <td
              v-for="header in visibleHeaders"
              :key="`${row.id}-${header.key}`"
              :class="`border-r border-slate-100 px-3 py-2 text-xs text-slate-600 last:border-r-0 ${header.isNum ? 'text-right' : 'text-left'} ${
                header.key === 'title' ? 'break-all' : 'whitespace-nowrap'
              }`"
            >
              <div v-if="header.key === 'thumbnail'" class="relative z-0 mx-auto h-12 w-8 cursor-pointer overflow-hidden rounded bg-slate-200 shadow-sm transition-transform hover:z-50 hover:scale-150">
                <img :src="row.thumbnail" alt="" class="h-full w-full object-cover" />
              </div>
              <span v-else-if="header.key === 'cost'" class="font-medium text-slate-700">${{ row.cost }}</span>
              <span v-else>{{ row[header.key] }}</span>
            </td>
          </tr>
          <tr v-if="processedData.length === 0">
            <td :colspan="visibleHeaders.length" class="px-6 py-12 text-center text-sm text-slate-400">
              没有找到符合条件的数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3 text-xs text-slate-500">
      <div>共 {{ processedData.length }} 条数据</div>
      <div class="flex gap-2">
        <button type="button" disabled class="cursor-not-allowed rounded bg-slate-100 px-3 py-1 text-slate-400">上一页</button>
        <button type="button" class="rounded border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50">下一页</button>
      </div>
    </div>
  </div>
</template>
