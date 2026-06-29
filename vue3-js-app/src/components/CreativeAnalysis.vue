<script setup>
import { computed, ref } from 'vue'
import { Clock, LayoutGrid, Layers, Minus, Play, Table as TableIcon, X } from 'lucide-vue-next'
import DateRangePicker from './DateRangePicker.vue'
import AnalyticsSelect from './analytics/AnalyticsSelect.vue'
import {
  generateCreativeAnalysisData,
  generateFinishedCreativePerformance,
  generateMaterialDetails,
  generateRequirements,
  generateSchedules,
  summarizeDirectionFeedback,
} from '../services/mockData'
import {
  COLORS,
  formatCurrencyCompact,
  formatMetricValue,
  formatRatioPercent,
  getFeedbackStatusStyle,
  getMetricConfig,
  getRecentUtcRange,
  getTabDimensions,
} from './creative-analysis/creativeAnalysisParts'

const props = defineProps({
  activeSubTab: {
    type: String,
    default: 'full',
  },
})

const viewMode = ref('chart')
const exploreTarget = ref(null)
const chartHover = ref(null)
const launchStart = ref('')
const launchEnd = ref('')
const recentRange = getRecentUtcRange(30)
const spendStart = ref(recentRange.start)
const spendEnd = ref(recentRange.end)
const language = ref('all')
const channel = ref('')

const feedbackRequirements = computed(() => generateRequirements())
const feedbackSchedules = computed(() => generateSchedules())
const scheduleNameMap = computed(() => new Map(feedbackSchedules.value.map((item) => [item.id, item.directionName])))
const feedbackRows = computed(() => generateFinishedCreativePerformance(feedbackRequirements.value))
const directionFeedback = computed(() => summarizeDirectionFeedback(feedbackRows.value))
const tabDimensions = computed(() => getTabDimensions(props.activeSubTab))

const languageOptions = [
  { value: 'en', label: '英语' },
  { value: 'localized', label: '本地' },
]

const channelOptions = [
  { value: 'applovin', label: 'AppLovin' },
  { value: 'unity', label: 'Unity' },
  { value: 'google', label: 'Google Ads' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
]

const getRowData = (dimensionId) =>
  generateCreativeAnalysisData(
    [dimensionId],
    launchStart.value,
    launchEnd.value,
    spendStart.value,
    spendEnd.value,
    language.value,
    channel.value || 'all',
  ).data

const getMaxMetricValue = (data, metric) => {
  const key = getMetricConfig(metric).dataKey
  return Math.max(1, ...data.map((item) => item[key] || 0))
}

const getOverallAvg = (data) => {
  const totals = getTotals(data)
  return totals.totalCost / (totals.totalCount || 1)
}

const getMetricShare = (metric, item) => {
  if (metric === 'cost') return `${(item.costShare || 0).toFixed(1)}%`
  if (metric === 'quantity') return `${(item.countShare || 0).toFixed(1)}%`
  return ''
}

const getTooltipLabel = (metric) => {
  if (metric === 'cost') return '总花费'
  if (metric === 'quantity') return '数量'
  return '平均'
}

const getTooltipSecondaryLabel = (metric) => {
  if (metric === 'cost') return '花费占比'
  if (metric === 'quantity') return '数量占比'
  return ''
}

const getAvgLineStyle = (data) => {
  const maxValue = getMaxMetricValue(data, 'avgCost')
  const overallAvg = getOverallAvg(data)
  const bottomPct = Math.min(92, Math.max(12, (overallAvg / maxValue) * 100))
  return { bottom: `${bottomPct}%` }
}

const getTrendData = (mat) => {
  const seed = String(mat.id || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return [6, 5, 4, 3, 2, 1, 0].map((daysAgo, index) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    const wave = ((seed + index * 17) % 70) / 100
    return {
      date: d.toISOString().slice(5, 10),
      value: Math.floor(mat.cost * (0.3 + wave)),
    }
  })
}

const getTrendPath = (mat) => {
  const points = getTrendData(mat)
  const maxValue = Math.max(1, ...points.map((item) => item.value))
  return points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * 136
      const y = 36 - (point.value / maxValue) * 30
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

const getTotals = (data) => {
  const totalCost = data.reduce((sum, item) => sum + (item.totalCost || 0), 0)
  const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0)
  const avgCost = totalCost / (totalCount || 1)
  return { totalCost, totalCount, avgCost }
}

const detailMaterials = computed(() => {
  if (!exploreTarget.value) return []
  return generateMaterialDetails(
    launchStart.value,
    launchEnd.value,
    spendStart.value,
    spendEnd.value,
    language.value,
    channel.value || 'all',
  ).sort((a, b) => b.cost - a.cost).slice(0, 20)
})

const detailTotalCost = computed(() => detailMaterials.value.reduce((sum, item) => sum + item.cost, 0))
const detailMaxCost = computed(() => detailMaterials.value.length > 0 ? detailMaterials.value[0].cost : 1)
</script>

<template>
  <div class="relative min-h-screen space-y-10 pb-40">
    <!-- 全局过滤器与视图切换 -->
    <div class="flex flex-col gap-8 rounded-3xl border border-slate-100 bg-white px-10 py-8 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-50 pb-6">
        <div class="flex items-center gap-4">
          <div class="h-8 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
          <h2 class="text-xl font-black tracking-tight text-slate-900">深度创意对比分析报表</h2>
        </div>

        <div class="flex items-center gap-1.5 rounded-[1.25rem] border border-slate-200/60 bg-slate-100 p-1.5 shadow-inner">
          <button
            :class="`flex items-center gap-2.5 rounded-xl px-8 py-2.5 text-xs font-black transition-all ${viewMode === 'chart' ? 'translate-y-[-1px] bg-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'}`"
            type="button"
            @click="viewMode = 'chart'"
          >
            <LayoutGrid class="h-4 w-4" />
            可视化分析
          </button>
          <button
            :class="`flex items-center gap-2.5 rounded-xl px-8 py-2.5 text-xs font-black transition-all ${viewMode === 'table' ? 'translate-y-[-1px] bg-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'}`"
            type="button"
            @click="viewMode = 'table'"
          >
            <TableIcon class="h-4 w-4" />
            数据报表
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
        <DateRangePicker
          mode="launch"
          :start="launchStart"
          :end="launchEnd"
          compact
          class-name="min-w-[250px]"
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
          class-name="min-w-[250px]"
          @change="
            spendStart = $event.start;
            spendEnd = $event.end
          "
        />
        <AnalyticsSelect
          :model-value="language === 'all' ? '' : language"
          :options="languageOptions"
          placeholder="语言"
          class-name="w-[180px]"
          @update:model-value="language = $event || 'all'"
        />
        <AnalyticsSelect
          v-model="channel"
          :options="channelOptions"
          placeholder="渠道"
          class-name="w-[180px]"
        />
      </div>
    </div>

    <section class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Direction Review</p>
          <h3 class="text-sm font-black text-slate-900">方向数据回流复盘</h3>
          <p class="mt-1 text-xs font-bold text-slate-400">成片表现回流到需求、版本和方向，用于判断放量、迭代、暂停或继续观察。</p>
        </div>
        <div class="grid grid-cols-3 gap-2 text-right">
          <div class="rounded-2xl border border-slate-150 bg-slate-50 px-3 py-2">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">上线</p>
            <p class="text-sm font-black text-slate-900">{{ feedbackRows.length }}</p>
          </div>
          <div class="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
            <p class="text-[9px] font-black uppercase tracking-widest text-emerald-500">Winner</p>
            <p class="text-sm font-black text-emerald-700">{{ feedbackRows.filter((item) => item.status === 'Winner').length }}</p>
          </div>
          <div class="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2">
            <p class="text-[9px] font-black uppercase tracking-widest text-rose-500">复盘</p>
            <p class="text-sm font-black text-rose-700">{{ feedbackRows.filter((item) => item.status === 'Failed').length }}</p>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-150">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
            <tr>
              <th class="px-3 py-3">方向</th>
              <th class="px-3 py-3 text-right">上线成片</th>
              <th class="px-3 py-3 text-right">Winner</th>
              <th class="px-3 py-3 text-right">消耗</th>
              <th class="px-3 py-3 text-right">CPI</th>
              <th class="px-3 py-3 text-right">IR</th>
              <th class="px-3 py-3">状态</th>
              <th class="px-3 py-3">结论</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in directionFeedback.slice(0, 8)" :key="row.scheduleId" class="hover:bg-slate-50">
              <td class="px-3 py-3 font-black text-slate-800">{{ scheduleNameMap.get(row.scheduleId) || row.scheduleId }}</td>
              <td class="px-3 py-3 text-right font-bold text-slate-600">{{ row.launchedCreativeCount }}</td>
              <td class="px-3 py-3 text-right font-bold text-emerald-600">{{ row.winnerCount }}</td>
              <td class="px-3 py-3 text-right font-bold text-slate-600">{{ formatCurrencyCompact(row.totalSpent) }}</td>
              <td class="px-3 py-3 text-right font-bold text-slate-600">${{ row.avgCpi.toFixed(2) }}</td>
              <td class="px-3 py-3 text-right font-bold text-slate-600">{{ formatRatioPercent(row.avgIr) }}</td>
              <td class="px-3 py-3">
                <span :class="`inline-flex rounded-full border px-2 py-1 text-[10px] font-black ${getFeedbackStatusStyle(row.status)}`">{{ row.status }}</span>
              </td>
              <td class="px-3 py-3 text-xs font-bold text-slate-500">{{ row.insight }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="px-2">
      <div v-if="activeSubTab === 'multi'" class="rounded-3xl border border-slate-100 bg-white p-32 text-center shadow-sm">
        <div class="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50">
          <Layers class="h-10 w-10 text-slate-200" />
        </div>
        <h3 class="mb-4 text-2xl font-black tracking-tight text-slate-900">交叉维矩阵分析升级中</h3>
        <p class="mx-auto max-w-lg text-sm font-bold leading-relaxed text-slate-400">该模块正在整合实时数据链路，建议先通过左侧侧边栏“全片总览”或“分段深入”查看已同步的维度报表。</p>
      </div>

      <div v-else class="space-y-10">
        <section
          v-for="(dimension, dimensionIndex) in tabDimensions"
          :key="dimension.id"
          class="group relative space-y-8 rounded-3xl border border-slate-100 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-lg"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-5">
              <div class="h-8 w-1.5 rounded-full transition-all group-hover:scale-y-125" :style="{ backgroundColor: COLORS[dimensionIndex % COLORS.length] }"></div>
              <div class="flex flex-col">
                <h3 class="text-lg font-black tracking-tight text-slate-900">{{ dimension.label }}对比分析</h3>
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">Sync ID: sync-{{ dimension.id }}</span>
              </div>
            </div>
          </div>

          <div v-if="viewMode === 'chart'" class="flex flex-col items-stretch gap-6 lg:flex-row">
            <div
              v-for="metric in ['cost', 'avgCost', 'quantity']"
              :key="`${dimension.id}-${metric}`"
              class="relative flex h-[340px] flex-1 flex-col rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div class="mb-5 flex shrink-0 items-center justify-between px-1">
                <span class="flex items-center gap-2 text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">
                  <i class="h-3 w-1.5 rounded-full" :style="{ backgroundColor: COLORS[dimensionIndex % COLORS.length] }"></i>
                  {{ getMetricConfig(metric).title }}
                </span>
              </div>
              <div class="relative flex min-h-0 flex-1 items-end gap-3 border-b border-slate-100 px-2 pb-10">
                <div class="pointer-events-none absolute inset-x-2 bottom-10 top-0">
                  <div class="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100"></div>
                  <div class="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-100"></div>
                  <div class="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100"></div>
                  <div
                    v-if="metric === 'avgCost'"
                    class="absolute inset-x-0 border-t border-dashed border-slate-500/80"
                    :style="getAvgLineStyle(getRowData(dimension.id))"
                  >
                    <span class="absolute right-0 -top-5 rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-600 shadow-sm">
                      ${{ getOverallAvg(getRowData(dimension.id)).toFixed(2) }}
                    </span>
                  </div>
                </div>
                <button
                  v-for="item in getRowData(dimension.id)"
                  :key="`${dimension.id}-${metric}-${item.name}`"
                  class="group/bar relative flex min-w-0 flex-1 flex-col items-center justify-end gap-2 rounded-lg transition-all hover:bg-slate-50"
                  type="button"
                  @mouseenter="chartHover = { metric, name: item.name, color: COLORS[dimensionIndex % COLORS.length], value: formatMetricValue(metric, item[getMetricConfig(metric).dataKey]), secondary: getMetricShare(metric, item) }"
                  @mouseleave="chartHover = null"
                  @click="exploreTarget = { category: item.name, dimension: dimension.label }"
                >
                  <div
                    v-if="chartHover && chartHover.metric === metric && chartHover.name === item.name"
                    class="pointer-events-none absolute bottom-[250px] z-[100] min-w-[150px] rounded-xl border border-slate-200 bg-white p-3 text-[11px] shadow-2xl ring-1 ring-black/5"
                  >
                    <div class="mb-2 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                      <div class="h-3 w-1.5 rounded-full" :style="{ backgroundColor: chartHover.color }"></div>
                      <p class="truncate font-bold text-slate-800">{{ chartHover.name }}</p>
                    </div>
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between gap-4">
                        <span class="font-bold uppercase tracking-tighter text-slate-400">{{ getTooltipLabel(metric) }}</span>
                        <span class="font-black text-slate-900">{{ chartHover.value }}</span>
                      </div>
                      <div v-if="getTooltipSecondaryLabel(metric)" class="flex items-center justify-between gap-4 border-t border-slate-50 pt-1">
                        <span class="font-bold uppercase tracking-tighter text-slate-400">{{ getTooltipSecondaryLabel(metric) }}</span>
                        <span class="font-bold text-indigo-600">{{ chartHover.secondary }}</span>
                      </div>
                    </div>
                    <div class="mt-2 flex items-center gap-1.5 border-t border-slate-50 pt-1.5">
                      <div class="h-1 w-1 rounded-full bg-indigo-400"></div>
                      <p class="text-[9px] font-bold italic text-slate-400">点击查看素材明细</p>
                    </div>
                  </div>
                  <span
                    class="relative z-10 w-full max-w-8 rounded-t-md transition-all group-hover/bar:opacity-80 group-active/bar:scale-95"
                    :style="{
                      height: `${Math.max(8, ((item[getMetricConfig(metric).dataKey] || 0) / getMaxMetricValue(getRowData(dimension.id), metric)) * 210)}px`,
                      background: `linear-gradient(180deg, ${COLORS[dimensionIndex % COLORS.length]}E6, ${COLORS[dimensionIndex % COLORS.length]}80)`,
                    }"
                  ></span>
                  <span class="h-8 max-w-[70px] origin-top-right rotate-[-45deg] truncate text-[9px] font-bold text-slate-400">{{ item.name }}</span>
                  <span class="text-[9px] font-bold italic text-slate-400 opacity-0 transition-opacity group-hover/bar:opacity-100">点击查看素材明细</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full border-collapse text-[11px]">
              <thead class="bg-slate-900 text-white">
                <tr>
                  <th class="w-[14%] border-r border-white/5 px-5 py-4 text-left font-bold uppercase tracking-wider">{{ dimension.label }}</th>
                  <th class="w-[18%] border-r border-white/5 px-5 py-4 text-center font-bold uppercase tracking-wider">平均花费</th>
                  <th class="w-[17%] border-r border-white/5 px-5 py-4 text-center font-bold uppercase tracking-wider">花费</th>
                  <th class="w-[17%] border-r border-white/5 px-5 py-4 text-center font-bold uppercase tracking-wider">花费占比</th>
                  <th class="w-[17%] border-r border-white/5 px-5 py-4 text-center font-bold uppercase tracking-wider">计数</th>
                  <th class="w-[17%] px-5 py-4 text-center font-bold uppercase tracking-wider">计数占比</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="item in getRowData(dimension.id)"
                  :key="`${dimension.id}-row-${item.name}`"
                  class="cursor-pointer transition-colors hover:bg-indigo-50/40"
                  @click="exploreTarget = { category: item.name, dimension: dimension.label }"
                >
                  <td class="border-r border-slate-100 bg-slate-50/30 px-5 py-3 font-bold text-slate-800">{{ item.name }}</td>
                  <td class="relative min-w-[160px] border-r border-slate-100 px-0 py-3">
                    <div class="absolute bottom-0 left-1/2 top-0 z-0 w-px bg-slate-200 opacity-80"></div>
                    <div
                      :class="`absolute bottom-2 top-2 ${item.avgCost - getTotals(getRowData(dimension.id)).avgCost > 0 ? 'left-1/2 rounded-r-sm border-r border-emerald-400/40 bg-emerald-100' : 'right-1/2 rounded-l-sm border-l border-rose-400/40 bg-rose-100'}`"
                      :style="{ width: `${Math.min(48, (Math.abs(item.avgCost - getTotals(getRowData(dimension.id)).avgCost) / Math.max(...getRowData(dimension.id).map((row) => Math.abs(row.avgCost - getTotals(getRowData(dimension.id)).avgCost)), 1)) * 48)}%` }"
                    ></div>
                    <div class="pointer-events-none relative z-10 flex items-center justify-center">
                      <span class="font-mono text-[12px] font-black tracking-tight text-slate-900">{{ item.avgCost.toFixed(2) }}</span>
                    </div>
                  </td>
                  <td class="border-r border-slate-100 px-3 py-3">
                    <div class="relative flex h-6 items-center overflow-hidden rounded border border-slate-100 bg-slate-50">
                      <div class="absolute inset-y-0 left-0 border-r border-indigo-200 bg-indigo-100" :style="{ width: `${(item.totalCost / Math.max(...getRowData(dimension.id).map((row) => row.totalCost || 0), 1)) * 100}%` }"></div>
                      <span class="relative z-10 w-full text-center font-mono font-bold text-slate-700">{{ item.totalCost.toFixed(2) }}</span>
                    </div>
                  </td>
                  <td class="border-r border-slate-100 px-3 py-3">
                    <div class="relative flex h-6 items-center overflow-hidden rounded border border-slate-100 bg-slate-50">
                      <div class="absolute inset-y-0 left-0 border-r border-indigo-100 bg-indigo-50" :style="{ width: `${((item.totalCost / getTotals(getRowData(dimension.id)).totalCost) * 100) || 0}%` }"></div>
                      <span class="relative z-10 w-full text-center font-mono font-bold text-slate-700">{{ ((item.totalCost / getTotals(getRowData(dimension.id)).totalCost) * 100).toFixed(2) }}%</span>
                    </div>
                  </td>
                  <td class="border-r border-slate-100 px-3 py-3">
                    <div class="relative flex h-6 items-center overflow-hidden rounded border border-slate-100 bg-slate-50">
                      <div class="absolute inset-y-0 left-0 border-r border-slate-300 bg-slate-200" :style="{ width: `${(item.count / Math.max(...getRowData(dimension.id).map((row) => row.count || 0), 1)) * 100}%` }"></div>
                      <span class="relative z-10 w-full text-center font-mono font-bold text-slate-700">{{ item.count }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3">
                    <div class="relative flex h-6 items-center overflow-hidden rounded border border-slate-100 bg-slate-50">
                      <div class="absolute inset-y-0 left-0 border-r border-slate-200 bg-slate-100" :style="{ width: `${((item.count / getTotals(getRowData(dimension.id)).totalCount) * 100) || 0}%` }"></div>
                      <span class="relative z-10 w-full text-center font-mono font-bold text-slate-700">{{ ((item.count / getTotals(getRowData(dimension.id)).totalCount) * 100).toFixed(2) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="border-t border-slate-200 bg-slate-50">
                <tr class="font-bold text-slate-900">
                  <td class="border-r border-slate-200 bg-slate-100/50 px-5 py-5 text-left">大盘总计</td>
                  <td class="border-r border-slate-200 px-5 py-5 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <Minus class="h-3.5 w-3.5 text-slate-300" />
                      <span class="font-mono text-[12px] font-black text-slate-400">{{ getTotals(getRowData(dimension.id)).avgCost.toFixed(2) }}</span>
                    </div>
                  </td>
                  <td class="border-r border-slate-200 px-5 py-5 text-center font-mono tracking-tight text-slate-500">{{ getTotals(getRowData(dimension.id)).totalCost.toFixed(2) }}</td>
                  <td class="border-r border-slate-200 px-5 py-5 text-center font-mono text-slate-500">100.00%</td>
                  <td class="border-r border-slate-200 px-5 py-5 text-center font-mono text-slate-500">{{ getTotals(getRowData(dimension.id)).totalCount }}</td>
                  <td class="px-5 py-5 text-center font-mono text-slate-500">100.00%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>

    <div v-if="exploreTarget" class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-8" @click="exploreTarget = null">
      <div class="flex h-full max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl" @click.stop>
        <!-- 弹窗头部 - 提高关闭按钮层级 -->
        <div class="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-8 py-4">
          <div class="flex items-center gap-4">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 shadow-sm">
              <LayoutGrid class="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-black tracking-tight text-slate-900">{{ exploreTarget.category }}</h2>
                <span class="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">DETAIL VIEW</span>
              </div>
              <p class="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">维度: {{ exploreTarget.dimension }}</p>
            </div>
          </div>
          <button aria-label="关闭视图" class="relative z-[100] rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95" type="button" @click="exploreTarget = null">
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- 弹窗内容区 - 极致紧凑 -->
        <div class="flex-1 overflow-y-auto bg-white px-8 py-2 no-scrollbar">
          <div class="grid grid-cols-1 divide-y divide-slate-50">
            <div v-for="(mat, idx) in detailMaterials" :key="mat.id" class="group flex items-center gap-4 bg-white px-3 py-1.5 transition-all duration-150 hover:bg-indigo-50/30">
              <div class="flex w-6 shrink-0 items-center justify-center">
                <span class="text-[13px] font-black italic text-slate-900">#{{ idx + 1 }}</span>
              </div>
              <div class="relative aspect-[9/16] w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200/50 bg-slate-100 shadow-xs">
                <img :src="mat.thumbnail" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
                  <Play class="h-3.5 w-3.5 fill-white text-white" />
                </div>
              </div>
              <div class="flex w-60 shrink-0 flex-col gap-0.5">
                <span class="text-[8px] font-black uppercase tracking-tighter text-slate-400 opacity-70">ID: {{ mat.id }}</span>
                <h4 class="line-clamp-1 text-[10px] font-black leading-tight text-slate-800 transition-colors group-hover:text-primary">{{ mat.title }}</h4>
                <div class="mt-1 flex items-center gap-2">
                  <div class="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                    <Clock class="h-2.5 w-2.5" />
                    {{ mat.date }}
                  </div>
                  <div class="rounded border border-slate-200/50 bg-slate-100 px-1 py-0 text-[7px] font-black text-slate-500">{{ mat.language.toUpperCase() }}</div>
                </div>
              </div>
              <div class="flex min-w-0 flex-1 flex-col gap-1.5 px-4">
                <div class="flex items-end justify-between">
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-[8px] font-black uppercase tracking-widest text-slate-300">SPEND</span>
                    <span class="text-[12px] font-black tracking-tight text-slate-900">${{ mat.cost.toLocaleString() }}</span>
                  </div>
                  <div class="rounded bg-indigo-50 px-1.5 text-[10px] font-black text-indigo-600">{{ ((mat.cost / detailTotalCost) * 100).toFixed(1) }}%</div>
                </div>
                <div class="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div class="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all duration-500" :style="{ width: `${(mat.cost / detailMaxCost) * 100}%` }"></div>
                </div>
              </div>
              <div class="h-10 w-36 shrink-0 cursor-crosshair rounded-lg bg-slate-50/50 p-0.5">
                <svg viewBox="0 0 136 40" class="h-full w-full overflow-visible">
                  <path :d="getTrendPath(mat)" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path :d="`${getTrendPath(mat)} L136,40 L0,40 Z`" fill="#6366f1" opacity="0.05" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗页脚 - 彻底移除冗余信息 -->
        <div class="h-4 shrink-0 bg-white"></div>
      </div>
    </div>
  </div>
</template>
