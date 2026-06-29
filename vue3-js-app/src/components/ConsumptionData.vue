<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowUpDown, ChevronLeft, ChevronRight, Play, Settings, X } from 'lucide-vue-next'
import DateRangePicker from './DateRangePicker.vue'
import AnalyticsSelect from './analytics/AnalyticsSelect.vue'
import ColumnConfigDropdown from './analytics/ColumnConfigDropdown.vue'
import { getRecentUtcRange } from './shared/date/dateRange'
import {
  INITIAL_COLUMNS,
  buildMockSpends,
  channels,
  getSortValue,
  languages,
  metricHelp,
  platforms,
} from './analytics/consumptionDataModel'

const recentRange = getRecentUtcRange(30)
const launchStart = ref('')
const launchEnd = ref('')
const spendStart = ref(recentRange.start)
const spendEnd = ref(recentRange.end)
const selectedChannel = ref('')
const selectedPlatform = ref('')
const selectedLanguage = ref('')
const activeTypeTab = ref('all')
const campaignQuery = ref('')
const setQuery = ref('')
const materialQuery = ref('')
const pageSize = ref(50)
const page = ref(1)
const sortKey = ref('spend')
const sortDirection = ref('desc')
const showConfig = ref(false)
const modalMaterial = ref(null)
const tooltip = ref(null)
const columns = ref(INITIAL_COLUMNS.map((column) => ({ ...column })))

const allSpends = buildMockSpends()
const visibleColumns = computed(() => columns.value.filter((column) => column.visible))
const showLangCol = computed(() => columns.value.find((column) => column.id === 'language')?.visible ?? true)
const showSizeCol = computed(() => columns.value.find((column) => column.id === 'size')?.visible ?? false)

const channelOptions = computed(() => channels.map((channel) => ({ value: channel, label: channel })))
const platformOptions = computed(() => platforms.map((platform) => ({ value: platform, label: platform })))
const languageOptions = computed(() => languages.map((language) => ({ value: language, label: language })))
const typeOptions = [
  { value: 'video', label: '视频' },
  { value: 'playable', label: '试玩' },
  { value: 'image', label: '图片' },
]
const pageSizeOptions = [20, 50, 100, 200].map((size) => ({ value: size, label: `${size} 行/页` }))

const filteredMaterials = computed(() => {
  let rows = allSpends.filter((item) => {
    if (selectedChannel.value && item.channel !== selectedChannel.value) return false
    if (selectedPlatform.value && item.platform !== selectedPlatform.value) return false
    if (selectedLanguage.value && item.language !== selectedLanguage.value) return false
    if (activeTypeTab.value && activeTypeTab.value !== 'all' && item.type !== activeTypeTab.value) return false
    if (campaignQuery.value && !item.associatedSets.some((set) => set.campaign.toLowerCase().includes(campaignQuery.value.toLowerCase()))) return false
    if (setQuery.value && !item.associatedSets.some((set) => set.setName.toLowerCase().includes(setQuery.value.toLowerCase()))) return false
    if (materialQuery.value) {
      const query = materialQuery.value.toLowerCase()
      if (!item.id.toLowerCase().includes(query) && !item.name.toLowerCase().includes(query)) return false
    }
    return true
  })

  if (!showLangCol.value) {
    const grouped = {}
    rows.forEach((item) => {
      if (!grouped[item.contentId]) grouped[item.contentId] = { ...item, associatedSets: [...item.associatedSets] }
      else {
        grouped[item.contentId].spend += item.spend
        grouped[item.contentId].impressions += item.impressions
        grouped[item.contentId].clicks += item.clicks
        grouped[item.contentId].associatedSets.push(...item.associatedSets)
      }
    })
    rows = Object.values(grouped)
  } else if (!showSizeCol.value) {
    const grouped = {}
    rows.forEach((item) => {
      if (!grouped[item.id]) grouped[item.id] = { ...item, associatedSets: [...item.associatedSets] }
      else {
        grouped[item.id].spend += item.spend
        grouped[item.id].impressions += item.impressions
        grouped[item.id].clicks += item.clicks
        grouped[item.id].associatedSets.push(...item.associatedSets)
      }
    })
    rows = Object.values(grouped)
  }

  const totalSpend = rows.reduce((sum, row) => sum + row.spend, 0)
  return [...rows].sort((a, b) => {
    const valA = getSortValue(a, sortKey.value, totalSpend)
    const valB = getSortValue(b, sortKey.value, totalSpend)
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalSpend = computed(() => filteredMaterials.value.reduce((sum, row) => sum + row.spend, 0))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredMaterials.value.length / Number(pageSize.value))))
const pagedMaterials = computed(() => filteredMaterials.value.slice((page.value - 1) * Number(pageSize.value), page.value * Number(pageSize.value)))

watch([selectedChannel, selectedPlatform, selectedLanguage, activeTypeTab, campaignQuery, setQuery, materialQuery, pageSize, showLangCol, showSizeCol], () => {
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

const cellText = (columnId, material) => {
  const pct = totalSpend.value > 0 ? (material.spend / totalSpend.value) * 100 : 0
  const ctr = material.impressions > 0 ? (material.clicks / material.impressions) * 100 : 0
  const map = {
    id: material.id,
    name: material.name,
    contentId: material.contentId,
    firstImpressionTime: material.launchTime,
    spend: `$${Math.round(material.spend).toLocaleString()}`,
    spendRatio: `${pct.toFixed(2)}%`,
    impressions: material.impressions.toLocaleString(),
    clicks: material.clicks.toLocaleString(),
    ctr: `${ctr.toFixed(2)}%`,
    language: material.language,
    size: material.size,
    owner: material.owner,
    designer: material.designer,
  }
  return map[columnId] ?? ''
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
        <input v-model="campaignQuery" class="h-9 w-[170px] rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" placeholder="Campaign" />
        <input v-model="setQuery" class="h-9 w-[170px] rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" placeholder="Set 名称" />
        <AnalyticsSelect v-model="activeTypeTab" :options="typeOptions" placeholder="素材类型" class-name="w-[130px]" />
        <input v-model="materialQuery" class="h-9 w-[190px] rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" placeholder="素材名称 / ID" />
      </div>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <div class="text-xs font-bold text-slate-400">
          共 <span class="font-black text-slate-700">{{ filteredMaterials.length }}</span> 条素材消耗
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
        <table class="w-full min-w-[1500px] table-fixed border-collapse text-left">
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
            <tr v-for="material in pagedMaterials" :key="`${material.id}-${material.contentId}`" class="hover:bg-slate-50">
              <td v-for="column in visibleColumns" :key="column.id" class="truncate border-r border-slate-100 px-3 py-2 last:border-r-0">
                <div v-if="column.id === 'thumbnail'" class="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img :src="material.thumbnail" class="h-full w-full object-cover" alt="" />
                  <div class="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
                    <Play class="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <button v-else-if="column.id === 'sets'" type="button" class="font-black text-indigo-600 hover:text-indigo-800 hover:underline" @click="modalMaterial = material">
                  {{ material.associatedSets.length }} 个 set
                </button>
                <span v-else-if="column.id === 'language'" class="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-600">{{ material.language }}</span>
                <span v-else :class="column.id === 'spend' || column.id === 'spendRatio' ? 'font-mono font-black' : 'font-medium'">{{ cellText(column.id, material) }}</span>
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

    <div v-if="modalMaterial" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div class="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 class="max-w-2xl truncate text-sm font-black text-slate-800">{{ modalMaterial.name }}</h3>
            <p class="mt-1 text-xs font-bold text-slate-400">被 {{ modalMaterial.associatedSets.length }} 个 Set 使用</p>
          </div>
          <button class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="modalMaterial = null">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="max-h-[62vh] overflow-auto px-5 py-4">
          <table class="w-full table-fixed border-collapse text-left text-xs">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="border border-slate-200 px-3 py-3 text-left font-black">Ad Set 名称</th>
                <th class="w-32 border border-slate-200 px-3 py-3 text-center font-black">首次投放</th>
                <th class="w-28 border border-slate-200 px-3 py-3 text-right font-black">Campaign数</th>
                <th class="w-32 border border-slate-200 px-3 py-3 text-right font-black">总消耗</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="set in modalMaterial.associatedSets" :key="set.setName" class="hover:bg-slate-50">
                <td class="border border-slate-100 px-3 py-3">
                  <div class="font-black text-slate-800">{{ set.setName }}</div>
                  <div class="mt-1 text-[11px] font-bold text-slate-400">Campaign: {{ set.campaign }}</div>
                </td>
                <td class="border border-slate-100 px-3 py-3 text-center font-mono text-slate-500">{{ set.firstLaunch }}</td>
                <td class="border border-slate-100 px-3 py-3 text-right font-mono">{{ set.campaignCount }}</td>
                <td class="border border-slate-100 px-3 py-3 text-right font-mono font-black">${{ set.spend.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
