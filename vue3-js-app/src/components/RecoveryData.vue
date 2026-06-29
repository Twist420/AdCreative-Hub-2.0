<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowUpDown, ChevronLeft, ChevronRight, Play, Settings, X } from 'lucide-vue-next'
import DateRangePicker from './DateRangePicker.vue'
import AnalyticsMultiSearch from './analytics/AnalyticsMultiSearch.vue'
import AnalyticsSelect from './analytics/AnalyticsSelect.vue'
import ColumnConfigDropdown from './analytics/ColumnConfigDropdown.vue'
import { getRecentUtcRange } from './shared/date/dateRange'
import {
  INITIAL_COLUMNS,
  buildMockSets,
  channels,
  getActiveBenchmarkRules,
  getBenchmarkCellClassName,
  getMetrics,
  getSortValue,
  languages,
  metricHelp,
  normalizeBenchmarkChannel,
  normalizeBenchmarkPlatform,
  platforms,
} from './analytics/recoveryDataModel'

const recentRange = getRecentUtcRange(30)
const launchStart = ref('')
const launchEnd = ref('')
const spendStart = ref(recentRange.start)
const spendEnd = ref(recentRange.end)
const selectedChannel = ref('')
const selectedPlatform = ref('')
const selectedLanguage = ref('')
const selectedMaterialType = ref('')
const campaignSearch = ref('')
const setSearch = ref('')
const materialSearch = ref('')
const selectedCampaigns = ref([])
const selectedSets = ref([])
const selectedMaterials = ref([])
const pageSize = ref(50)
const page = ref(1)
const sortKey = ref('spend')
const sortDirection = ref('desc')
const showConfig = ref(false)
const selectedSet = ref(null)
const tooltip = ref(null)
const columns = ref(INITIAL_COLUMNS.map((column) => ({ ...column })))

const allSets = buildMockSets()
const activeBenchmarkRules = getActiveBenchmarkRules()
const visibleColumns = computed(() => columns.value.filter((column) => column.visible))
const channelOptions = computed(() => channels.map((channel) => ({ value: channel, label: channel })))
const platformOptions = computed(() => platforms.map((platform) => ({ value: platform, label: platform })))
const languageOptions = computed(() => languages.map((language) => ({ value: language, label: language })))
const typeOptions = [
  { value: 'video', label: '视频' },
  { value: 'playable', label: '试玩' },
  { value: 'image', label: '图片' },
]
const pageSizeOptions = [20, 50, 100, 200].map((size) => ({ value: size, label: `${size} 行/页` }))
const campaignOptions = computed(() => Array.from(new Set(allSets.map((item) => item.campaign))).map((campaign) => ({ value: campaign, label: campaign })))
const setOptions = computed(() => allSets.map((item) => ({ value: item.setName, label: item.setName })))
const materialOptions = computed(() => Array.from(new Set(allSets.flatMap((item) => item.materials.map((material) => material.name)))).map((materialName) => ({ value: materialName, label: materialName })))

const resolveBenchmarkRule = (channel, platform) => {
  const normalizedChannel = normalizeBenchmarkChannel(channel || 'All')
  const normalizedPlatform = normalizeBenchmarkPlatform(platform)
  return (
    activeBenchmarkRules[`${normalizedChannel}__${normalizedPlatform}`] ||
    activeBenchmarkRules[`${normalizedChannel}__${normalizeBenchmarkPlatform('全部')}`] ||
    activeBenchmarkRules[`${normalizeBenchmarkChannel('All')}__${normalizedPlatform}`] ||
    activeBenchmarkRules[`${normalizeBenchmarkChannel('All')}__${normalizeBenchmarkPlatform('全部')}`]
  )
}

const filteredRows = computed(() => {
  const rows = allSets.filter((item) => {
    if (selectedPlatform.value && item.platform !== selectedPlatform.value) return false
    if (selectedChannel.value && item.channel.toLowerCase() !== selectedChannel.value.toLowerCase()) return false
    if (selectedLanguage.value && item.language !== selectedLanguage.value) return false
    if (selectedMaterialType.value && !item.materials.some((material) => material.type === selectedMaterialType.value)) return false
    if (setSearch.value && !item.setName.toLowerCase().includes(setSearch.value.toLowerCase())) return false
    if (selectedSets.value.length > 0 && !selectedSets.value.includes(item.setName)) return false
    if (campaignSearch.value && !item.campaign.toLowerCase().includes(campaignSearch.value.toLowerCase())) return false
    if (selectedCampaigns.value.length > 0 && !selectedCampaigns.value.includes(item.campaign)) return false
    if (materialSearch.value) {
      const query = materialSearch.value.toLowerCase()
      if (!item.materials.some((material) => {
        const fuzzy = material.name.toLowerCase().includes(query) || material.id.toLowerCase().includes(query)
        const selected = selectedMaterials.value.length === 0 || selectedMaterials.value.includes(material.name)
        return fuzzy && selected
      })) return false
    }
    if (!materialSearch.value && selectedMaterials.value.length > 0) {
      if (!item.materials.some((material) => selectedMaterials.value.includes(material.name))) return false
    }
    return true
  })

  return [...rows].sort((a, b) => {
    const valA = getSortValue(a, sortKey.value)
    const valB = getSortValue(b, sortKey.value)
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / Number(pageSize.value))))
const pagedRows = computed(() => filteredRows.value.slice((page.value - 1) * Number(pageSize.value), page.value * Number(pageSize.value)))

watch([selectedChannel, selectedPlatform, selectedLanguage, selectedMaterialType, campaignSearch, setSearch, materialSearch, selectedCampaigns, selectedSets, selectedMaterials, pageSize], () => {
  page.value = 1
})

const toggleSort = (key) => {
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDirection.value = 'desc'
  }
}

const toggleColumnVisible = (id) => {
  columns.value = columns.value.map((column) => (column.id === id ? { ...column, visible: !column.visible } : column))
}

const moveColumn = (from, to) => {
  const next = [...columns.value]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  columns.value = next
}

const showMetricTooltip = (event, text) => {
  const rect = event.currentTarget.getBoundingClientRect()
  tooltip.value = { left: rect.left + rect.width / 2, top: rect.top - 10, text }
}

const topMaterial = (row) => [...row.materials].sort((a, b) => b.spend - a.spend)[0]

const benchmarkClass = (row, metric, value) => {
  const rule = resolveBenchmarkRule(selectedChannel.value || 'All', row.platform)
  return rule ? getBenchmarkCellClassName(metric, value, rule) : ''
}

const cellText = (columnId, row) => {
  const metrics = getMetrics(row)
  const values = {
    channel: row.channel,
    platform: row.platform,
    campaign: row.campaign,
    setName: row.setName,
    launchTime: row.launchTime,
    direction: row.direction,
    impressions: row.impressions.toLocaleString(),
    clicks: row.clicks.toLocaleString(),
    ctr: `${metrics.ctr.toFixed(2)}%`,
    installs: row.installs.toLocaleString(),
    cvr: `${metrics.cvr.toFixed(2)}%`,
    spend: `$${Math.round(row.spend).toLocaleString()}`,
    cpi: `$${metrics.cpi.toFixed(2)}`,
    cpm: `$${metrics.cpm.toFixed(2)}`,
    ir: `${metrics.ir.toFixed(2)}%`,
    d7PaidUsers: row.d7PaidUsers.toLocaleString(),
    d7PayRate: `${metrics.d7PayRate.toFixed(2)}%`,
    d7Cpa: `$${metrics.d7Cpa.toFixed(2)}`,
    d7TotalRev: `$${row.d7TotalRev.toLocaleString()}`,
    d0Roi: `${metrics.d0Roi.toFixed(2)}%`,
    d7Roi: `${metrics.d7Roi.toFixed(2)}%`,
    d7IapRev: `$${row.d7IapRev.toLocaleString()}`,
    d7IapRoi: `${metrics.d7IapRoi.toFixed(2)}%`,
    d7Ret: `${row.d7Ret.toFixed(1)}%`,
    d7Arppu: `$${metrics.d7Arppu.toFixed(1)}`,
  }
  return values[columnId] ?? ''
}

const metricValue = (columnId, row) => {
  const metrics = getMetrics(row)
  const map = {
    installs: row.installs,
    cpi: metrics.cpi,
    d7PaidUsers: row.d7PaidUsers,
    d7PayRate: metrics.d7PayRate,
    d7Cpa: metrics.d7Cpa,
    d7Roi: metrics.d7Roi,
    d7Arppu: metrics.d7Arppu,
  }
  return map[columnId]
}
</script>

<template>
  <div class="space-y-3 pb-6">
    <section class="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <div class="flex flex-wrap items-center gap-2">
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
        <AnalyticsSelect v-model="selectedChannel" :options="channelOptions" placeholder="渠道" class-name="w-[140px]" />
        <AnalyticsSelect v-model="selectedPlatform" :options="platformOptions" placeholder="Platform" class-name="w-[130px]" />
        <AnalyticsSelect v-model="selectedLanguage" :options="languageOptions" placeholder="语言" class-name="w-[120px]" />
        <AnalyticsMultiSearch v-model="selectedCampaigns" v-model:search-value="campaignSearch" :options="campaignOptions" placeholder="Campaign" class-name="w-[200px]" />
        <AnalyticsMultiSearch v-model="selectedSets" v-model:search-value="setSearch" :options="setOptions" placeholder="Set 名称" class-name="w-[220px]" />
        <AnalyticsSelect v-model="selectedMaterialType" :options="typeOptions" placeholder="素材类型" class-name="w-[130px]" />
        <AnalyticsMultiSearch v-model="selectedMaterials" v-model:search-value="materialSearch" :options="materialOptions" placeholder="素材名称 / ID" class-name="w-[220px]" />
      </div>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <div class="text-xs font-bold text-slate-400">
          共 <span class="font-black text-slate-700">{{ filteredRows.length }}</span> 条回收数据
        </div>
        <div class="flex items-center gap-2">
          <AnalyticsSelect v-model="pageSize" :options="pageSizeOptions" compact class-name="w-[100px]" />
          <div class="relative">
            <button
              type="button"
              data-column-config-trigger="true"
              class="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
              @click="showConfig = !showConfig"
            >
              <Settings class="h-3.5 w-3.5" />
              字段配置
            </button>
            <ColumnConfigDropdown :columns="columns" :open="showConfig" @close="showConfig = false" @toggle="toggleColumnVisible" @drag="moveColumn" />
          </div>
        </div>
      </div>

      <div class="max-h-[calc(100vh-245px)] overflow-auto">
        <table class="w-full min-w-[2800px] table-fixed border-collapse text-left">
          <thead class="sticky top-0 z-20 bg-slate-100 text-[11px] font-black text-slate-600">
            <tr>
              <th v-for="column in visibleColumns" :key="column.id" class="border-b border-r border-slate-200 px-3 py-2 align-middle last:border-r-0">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-1 text-left leading-tight"
                  @click="toggleSort(column.id)"
                  @mouseenter="showMetricTooltip($event, metricHelp[column.id])"
                  @mouseleave="tooltip = null"
                >
                  <span class="whitespace-normal">{{ column.name }}</span>
                  <ArrowUpDown :class="`h-3 w-3 shrink-0 ${sortKey === column.id ? 'text-indigo-500' : 'text-slate-300'}`" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            <tr v-for="row in pagedRows" :key="row.id" class="hover:bg-slate-50">
              <td v-for="column in visibleColumns" :key="column.id" class="truncate border-r border-slate-100 px-3 py-2 last:border-r-0">
                <span v-if="column.id === 'platform'" :class="`rounded border px-2 py-0.5 text-[10px] font-black ${row.platform === 'iOS' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`">
                  {{ row.platform }}
                </span>
                <button v-else-if="column.id === 'setName'" type="button" class="block max-w-[240px] truncate text-left font-black text-indigo-600 hover:underline" :title="row.setName" @click="selectedSet = row">
                  {{ row.setName }}
                </button>
                <div v-else-if="column.id === 'preview' && topMaterial(row)" class="flex items-center gap-2">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img v-if="topMaterial(row).type === 'image'" :src="topMaterial(row).previewUrl" alt="" class="h-full w-full object-cover" />
                    <Play v-else class="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <span class="min-w-0 truncate text-[11px] font-bold text-slate-600">{{ topMaterial(row).id }}</span>
                </div>
                <span
                  v-else-if="metricValue(column.id, row) !== undefined"
                  :class="`block rounded-md px-2 py-1 text-center ${benchmarkClass(row, column.id, metricValue(column.id, row))}`"
                >
                  {{ cellText(column.id, row) }}
                </span>
                <span v-else>{{ cellText(column.id, row) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-slate-100 px-3 py-2">
        <span class="text-xs font-bold text-slate-400">{{ page }} / {{ totalPages }}</span>
        <button type="button" :disabled="page <= 1" class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30" @click="page = Math.max(1, page - 1)">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button type="button" :disabled="page >= totalPages" class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30" @click="page = Math.min(totalPages, page + 1)">
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </section>

    <div
      v-if="tooltip"
      class="pointer-events-none fixed z-[80] max-w-xs -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium leading-relaxed text-white shadow-xl"
      :style="{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }"
    >
      {{ tooltip.text }}
    </div>

    <div v-if="selectedSet" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div class="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 class="max-w-2xl truncate text-sm font-black text-slate-800">{{ selectedSet.setName }}</h3>
            <p class="mt-1 text-xs font-bold text-slate-400">Campaign: {{ selectedSet.campaign }} · 渠道: {{ selectedSet.channel }}</p>
          </div>
          <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="selectedSet = null">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="max-h-[62vh] overflow-auto p-5">
          <table class="w-full table-fixed border-collapse text-left text-xs">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="border border-slate-200 px-3 py-3 font-black">素材名称</th>
                <th class="w-32 border border-slate-200 px-3 py-3 font-black">素材ID</th>
                <th class="w-28 border border-slate-200 px-3 py-3 text-right font-black">花费</th>
                <th class="w-28 border border-slate-200 px-3 py-3 text-right font-black">展示</th>
                <th class="w-24 border border-slate-200 px-3 py-3 text-right font-black">CTR</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="material in [...selectedSet.materials].sort((a, b) => b.spend - a.spend)" :key="material.id" class="hover:bg-slate-50">
                <td class="border border-slate-100 px-3 py-3 font-black text-slate-800">{{ material.name }}</td>
                <td class="border border-slate-100 px-3 py-3 font-mono text-slate-500">{{ material.id }}</td>
                <td class="border border-slate-100 px-3 py-3 text-right font-mono">${{ material.spend.toLocaleString() }}</td>
                <td class="border border-slate-100 px-3 py-3 text-right font-mono">{{ material.impressions.toLocaleString() }}</td>
                <td class="border border-slate-100 px-3 py-3 text-right font-mono">{{ (material.impressions > 0 ? (material.clicks / material.impressions) * 100 : 0).toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
