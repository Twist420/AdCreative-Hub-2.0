<script setup>
import { computed, ref } from 'vue'
import { Database, LoaderCircle, SlidersHorizontal, Sparkles } from 'lucide-vue-next'
import DateRangePicker from './DateRangePicker.vue'
import AnalyticsSelect from './analytics/AnalyticsSelect.vue'
import { generateOverviewData, generateTopMaterials, mockKeywordAnalysis } from '../services/mockData'
import { analyzeMaterials as analyzeMaterialsService } from '../services/geminiService'
import { getRecentUtcRange } from './shared/date/dateRange'

const recentRange = getRecentUtcRange(30)
const launchStart = ref('')
const launchEnd = ref('')
const spendStart = ref(recentRange.start)
const spendEnd = ref(recentRange.end)
const channel = ref('')
const campaign = ref('')
const adSet = ref('')
const selectedChartTypes = ref(['video', 'playable', 'image'])
const selectedLanguages = ref(['en', 'de', 'fr', 'it', 'ja', 'ko', 'tw', 'es', 'pt'])
const cpa7Min = ref(0)
const cpa7Max = ref(400)
const topShareVisible = ref(['all', 'applovin', 'facebook', 'google'])
const stackHidden = ref([])
const cpa7Hidden = ref([])
const globalStackMode = ref('percent')
const channelStackModes = ref({
  'applovin-android': 'normal',
  'applovin-ios': 'normal',
  google: 'normal',
})
const stackLegendPage = ref(0)
const cpa7LegendPage = ref(0)
const chartTooltip = ref(null)
const isAnalyzing = ref(false)
const analysisData = ref(mockKeywordAnalysis)

const metricsAll = computed(() =>
  generateOverviewData(launchStart.value, launchEnd.value, spendStart.value, spendEnd.value, 'all', channel.value || 'all'),
)
const metricsLoc = computed(() =>
  generateOverviewData(launchStart.value, launchEnd.value, spendStart.value, spendEnd.value, 'localized', channel.value || 'all'),
)
const materials = computed(() => generateTopMaterials(launchStart.value, launchEnd.value, channel.value || 'all'))

const formatMetric = (metric) => {
  if (!metric) return '-'
  if (metric.format === 'currency') {
    if (metric.value >= 10000) return `$${(metric.value / 10000).toFixed(1)}w`
    return `$${Math.round(metric.value).toLocaleString()}`
  }
  if (metric.format === 'percent') return `${metric.value.toFixed(2)}%`
  return Math.round(metric.value).toLocaleString()
}

const sparklinePoints = (history) => {
  if (!history?.length) return ''
  const values = history.map((item) => item.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values
    .map((value, index) => {
      const x = history.length === 1 ? 0 : (index / (history.length - 1)) * 100
      const y = 42 - ((value - min) / range) * 34
      return `${x},${y}`
    })
    .join(' ')
}

const overviewKpis = computed(() => [
  {
    key: 'totalCost',
    label: '总花费',
    value: '$1,042,208.17',
    detail: '全部: $1,042,208.17 本地化: $1,042,208.17',
    color: '#6366f1',
    metric: metricsAll.value.totalCost,
  },
  {
    key: 'totalCount',
    label: '上线素材数',
    value: '6,388',
    detail: '全部: 7,320 本地化: 932',
    color: '#60a5fa',
    metric: metricsAll.value.totalCount,
  },
  {
    key: 'newCost',
    label: '新素材花费',
    value: '$875,967.30',
    detail: '全部: $1,042,208.17 本地化: $166,240.88',
    color: '#a78bfa',
    metric: metricsAll.value.newCost,
  },
  {
    key: 'newCostShare',
    label: '新素材花费占比',
    value: '84.05%',
    detail: '全部: 100.00% 本地化: 15.95%',
    color: '#f472b6',
    metric: metricsAll.value.newCostShare,
  },
])

const trendRows = computed(() => {
  const dates = metricsAll.value.totalCost.history.map((item) => item.date)
  return dates.slice(-14).map((date, index) => {
    const cost = metricsAll.value.totalCost.history.at(index - 14)?.value || 0
    const newCost = metricsAll.value.newCost.history.at(index - 14)?.value || 0
    const success = metricsAll.value.successCost.history.at(index - 14)?.value || 0
    return { date: date.slice(5), cost, newCost, success }
  })
})

const maxTrendValue = computed(() => Math.max(1, ...trendRows.value.flatMap((row) => [row.cost, row.newCost, row.success])))

const topMaterials = computed(() => materials.value.filter((item) => item.isGood).slice(0, 12))

const chartTypeOptions = [
  { key: 'video', label: '视频', scale: 1 },
  { key: 'playable', label: '试玩', scale: 0.62 },
  { key: 'image', label: '图片', scale: 0.42 },
]

const languageOptions = [
  { key: 'en', label: 'EN', scale: 1 },
  { key: 'de', label: 'DE', scale: 0.76 },
  { key: 'fr', label: 'FR', scale: 0.72 },
  { key: 'it', label: 'IT', scale: 0.66 },
  { key: 'ja', label: 'JA', scale: 0.82 },
  { key: 'ko', label: 'KO', scale: 0.7 },
  { key: 'tw', label: 'TW', scale: 0.64 },
  { key: 'es', label: 'ES', scale: 0.78 },
  { key: 'pt', label: 'PT', scale: 0.68 },
]

const materialSeries = [
  'cp3097-01',
  'cp3325-01',
  'cp3979-02',
  'cp4092-01',
  'cp947-版本二',
  'cp4092-06',
  'cp3711-01',
  'cp3683-01',
  'cp4092-05',
  'cp3616-02',
  'cp2709-02',
  'cp3892-01',
  'cp4108-03',
  'cp3722-04',
  'cp3661-01',
  'cp4120-02',
  'cp3906-03',
  'cp3558-01',
  'cp4187-02',
  'cp4011-04',
]

const seriesPalette = [
  '#475569',
  '#4f46e5',
  '#0ea5e9',
  '#059669',
  '#ca8a04',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#65a30d',
  '#ea580c',
  '#64748b',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#e11d48',
  '#2563eb',
  '#9333ea',
]

const seriesFillPalette = [
  '#e2e8f0',
  '#e0e7ff',
  '#e0f2fe',
  '#d1fae5',
  '#fef3c7',
  '#fee2e2',
  '#ede9fe',
  '#fce7f3',
  '#cffafe',
  '#ecfccb',
  '#ffedd5',
  '#f1f5f9',
  '#ccfbf1',
  '#fed7aa',
  '#ede9fe',
  '#cffafe',
  '#ecfccb',
  '#ffe4e6',
  '#dbeafe',
  '#f3e8ff',
]

const createSeededRandom = (seed) => {
  let hash = 0x811c9dc5
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    return (hash >>> 0) / 4294967296
  }
}

const getChartDates = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1)
  const length = Math.min(15, diff)

  return Array.from({ length }, (_, index) => {
    const date = new Date(startDate)
    const step = length === diff ? index : Math.floor((index / Math.max(length - 1, 1)) * (diff - 1))
    date.setDate(date.getDate() + step)
    return date.toISOString().slice(0, 10)
  })
}

const sumSelectedScale = (selected, options) =>
  options.filter((option) => selected.includes(option.key)).reduce((sum, option) => sum + option.scale, 0) || 0.01

const buildStackedData = (seed, dates, selectedLanguagesForChart, selectedTypesForChart, scale = 1) => {
  const rng = createSeededRandom(`${seed}-${selectedLanguagesForChart.join('-')}-${selectedTypesForChart.join('-')}`)
  const languageRatio = sumSelectedScale(selectedLanguagesForChart, languageOptions) / languageOptions.reduce((sum, option) => sum + option.scale, 0)
  const typeRatio = sumSelectedScale(selectedTypesForChart, chartTypeOptions) / chartTypeOptions.reduce((sum, option) => sum + option.scale, 0)

  return dates.map((date, dayIndex) => {
    const row = { date }
    materialSeries.forEach((key, index) => {
      const peak = Math.exp(-Math.pow(dayIndex - (6 + index * 0.24), 2) / (18 + index * 1.5))
      const wave = 0.86 + Math.sin((dayIndex + index) / (2.4 + index * 0.12)) * 0.16
      const base = Math.max(0, 620 - index * 38) * scale
      const value = Math.max(0, base * (0.46 + peak * 0.58) * wave * languageRatio * typeRatio + rng() * 34 * scale)
      row[key] = Number(value.toFixed(2))
    })
    return row
  })
}

const buildTopShareData = (dates, selectedTypesForChart) => {
  const typeRatio = sumSelectedScale(selectedTypesForChart, chartTypeOptions) / chartTypeOptions.reduce((sum, option) => sum + option.scale, 0)
  const rng = createSeededRandom(`top-share-${dates.join('-')}-${selectedTypesForChart.join('-')}`)
  return dates.map((date, index) => {
    const wave = Math.sin(index / 2.1) * 1.8
    return {
      date,
      all: Number((31.5 + wave + rng() * 1.6 + typeRatio * 3.2).toFixed(2)),
      applovin: Number((34.8 + wave * 1.2 + rng() * 1.9 + typeRatio * 2.8).toFixed(2)),
      facebook: Number((28.4 + wave * 0.9 + rng() * 1.4 + typeRatio * 2.5).toFixed(2)),
      google: Number((30.6 + wave * 1.05 + rng() * 1.7 + typeRatio * 2.9).toFixed(2)),
    }
  })
}

const buildTypeShareData = (dates, channelKey) => {
  const rng = createSeededRandom(`type-share-${channelKey}-${dates.join('-')}`)
  const channelOffset = channelKey === 'applovin' ? -4 : channelKey === 'facebook' ? 5 : channelKey === 'google' ? -1 : 0
  return dates.map((date, index) => ({
    date,
    video: Number((58 + channelOffset + Math.sin(index / 2.2) * 5 + rng() * 2).toFixed(2)),
    playable: Number((42 - channelOffset - Math.sin(index / 2.2) * 5 + rng() * 2).toFixed(2)),
  }))
}

const buildCpa7MaterialData = (dates, seed, scale = 1) => {
  const rng = createSeededRandom(`cpa7-${seed}-${dates.join('-')}`)
  return dates.map((date, dayIndex) => {
    const row = { date }
    materialSeries.forEach((key, index) => {
      const baseline = (214 + index * 6.2) * scale
      const wave = Math.sin((dayIndex + index) / 2.4) * (14 + index * 0.45)
      const value = Math.max(95, Math.min(392, baseline + wave + rng() * 16))
      row[key] = Number(value.toFixed(0))
    })
    return row
  })
}

const chartTypeScale = computed(() => sumSelectedScale(selectedChartTypes.value, chartTypeOptions) / chartTypeOptions.reduce((sum, option) => sum + option.scale, 0))
const languageScale = computed(() => sumSelectedScale(selectedLanguages.value, languageOptions) / languageOptions.reduce((sum, option) => sum + option.scale, 0))

const toggleChartType = (key) => {
  if (selectedChartTypes.value.includes(key) && selectedChartTypes.value.length === 1) return
  selectedChartTypes.value = selectedChartTypes.value.includes(key)
    ? selectedChartTypes.value.filter((item) => item !== key)
    : [...selectedChartTypes.value, key]
}

const toggleLanguage = (key) => {
  if (selectedLanguages.value.includes(key) && selectedLanguages.value.length === 1) return
  selectedLanguages.value = selectedLanguages.value.includes(key)
    ? selectedLanguages.value.filter((item) => item !== key)
    : [...selectedLanguages.value, key]
}

const chartDates = computed(() => getChartDates(spendStart.value, spendEnd.value))
const topShareData = computed(() => buildTopShareData(chartDates.value, selectedChartTypes.value))
const typeShareChannel = ref('all')
const typeShareVisible = ref(['video', 'playable'])
const typeShareData = computed(() => buildTypeShareData(chartDates.value, typeShareChannel.value))
const globalStackData = computed(() =>
  buildStackedData(`global-${spendStart.value}-${spendEnd.value}`, chartDates.value, selectedLanguages.value, selectedChartTypes.value, 1),
)
const channelStackData = computed(() => ({
  'applovin-android': buildStackedData('applovin-android', chartDates.value, selectedLanguages.value, selectedChartTypes.value, 0.78),
  'applovin-ios': buildStackedData('applovin-ios', chartDates.value, selectedLanguages.value, selectedChartTypes.value, 0.68),
  google: buildStackedData('google', chartDates.value, selectedLanguages.value, selectedChartTypes.value, 0.72),
}))
const cpa7ChartConfigs = computed(() => [
  { key: 'applovin-android-cpa7', title: 'Applovin Android Top20素材 CPA7', data: buildCpa7MaterialData(chartDates.value, 'applovin-android', 1) },
  { key: 'applovin-ios-cpa7', title: 'Applovin iOS Top20素材 CPA7', data: buildCpa7MaterialData(chartDates.value, 'applovin-ios', 1.08) },
  { key: 'google-cpa7', title: 'Google Top20素材 CPA7', data: buildCpa7MaterialData(chartDates.value, 'google', 0.94) },
].map((chart) => ({
  ...chart,
  data: chart.data.map((row) => {
    const next = { date: row.date }
    materialSeries.forEach((key) => {
      const value = Number(row[key] || 0)
      next[key] = value >= cpa7Min.value && value <= cpa7Max.value ? value : null
    })
    return next
  }),
})))

const chartRows = computed(() => chartDates.value.map((date, index) => ({
  ...(topShareData.value[index] || {}),
  ...(typeShareData.value[index] || {}),
  date: date.slice(5),
})))

const getStackRows = (scope = 'global') => (scope === 'global' ? globalStackData.value : channelStackData.value[scope] || globalStackData.value)
const stackSeriesFor = (scope = 'global') => materialSeries.map((label, index) => ({
  key: label,
  label,
  color: seriesPalette[index],
  fill: seriesFillPalette[index],
  values: getStackRows(scope).map((row) => Number(row[label] || 0)),
}))

const topSeries = computed(() => materialSeries.map((label, index) => ({
  key: label,
  label,
  color: seriesPalette[index],
  fill: seriesFillPalette[index],
  values: globalStackData.value.map((row) => Number(row[label] || 0)),
  cpa7: cpa7ChartConfigs.value[0].data.map((row) => row[label]),
})))

const topShareSeries = [
  { key: 'all', label: 'ALL', color: '#475569' },
  { key: 'applovin', label: 'Applovin', color: '#4f46e5' },
  { key: 'facebook', label: 'Facebook', color: '#0ea5e9' },
  { key: 'google', label: 'Google', color: '#059669' },
]

const effectiveStackVisible = computed(() => topSeries.value.map((series) => series.key).filter((key) => !stackHidden.value.includes(key)))
const effectiveCpa7Visible = computed(() => topSeries.value.map((series) => series.key).filter((key) => !cpa7Hidden.value.includes(key)))
const visibleStackSeries = computed(() => topSeries.value.filter((series) => effectiveStackVisible.value.includes(series.key)))
const visibleCpa7Series = computed(() => topSeries.value.filter((series) => effectiveCpa7Visible.value.includes(series.key)))
const visibleStackSeriesFor = (scope = 'global') => stackSeriesFor(scope).filter((series) => effectiveStackVisible.value.includes(series.key))
const visibleCpa7SeriesFor = (chart) => materialSeries.map((label, index) => ({
  key: label,
  label,
  color: seriesPalette[index],
  cpa7: chart.data.map((row) => row[label]),
})).filter((series) => effectiveCpa7Visible.value.includes(series.key))
const legendPageSize = 10
const stackLegendPageCount = computed(() => Math.max(1, Math.ceil(topSeries.value.length / legendPageSize)))
const cpa7LegendPageCount = computed(() => Math.max(1, Math.ceil(topSeries.value.length / legendPageSize)))
const paginatedStackSeries = computed(() => topSeries.value.slice(stackLegendPage.value * legendPageSize, stackLegendPage.value * legendPageSize + legendPageSize))
const paginatedCpa7Series = computed(() => topSeries.value.slice(cpa7LegendPage.value * legendPageSize, cpa7LegendPage.value * legendPageSize + legendPageSize))
const channelStackCharts = [
  { key: 'applovin-android', title: 'applovin- Android Top20素材花费', scale: 0.78 },
  { key: 'applovin-ios', title: 'applovin- iOS Top20素材花费', scale: 0.68 },
  { key: 'google', title: 'google Top20素材花费', scale: 0.72 },
]

const toggleValue = (listRef, key) => {
  listRef.value = listRef.value.includes(key) ? listRef.value.filter((item) => item !== key) : [...listRef.value, key]
}

const toggleTopShare = (key) => toggleValue(topShareVisible, key)
const toggleStackSeries = (key) => toggleValue(stackHidden, key)
const toggleCpa7Series = (key) => toggleValue(cpa7Hidden, key)
const toggleTypeShare = (key) => toggleValue(typeShareVisible, key)

const formatChartValue = (value, unit = 'number') => {
  if (unit === 'percent') return `${Number(value).toFixed(2)}%`
  if (unit === 'currency') return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })
}

const getHoverIndex = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
  const index = Math.round((x / Math.max(1, rect.width)) * Math.max(0, chartRows.value.length - 1))
  return { index, x, width: rect.width }
}

const showChartTooltip = (event, scope, unit, rows) => {
  const { index, x, width } = getHoverIndex(event)
  const row = chartRows.value[index]
  if (!row) return
  chartTooltip.value = {
    scope,
    x: Math.min(x + 14, Math.max(14, width - 300)),
    y: 12,
    title: row.date,
    unit,
    rows: rows(row, index).filter((item) => item.value !== undefined && item.value !== null),
  }
}

const showTopShareTooltip = (event) => {
  showChartTooltip(event, 'top-share', 'percent', (row) =>
    topShareSeries
      .filter((series) => topShareVisible.value.includes(series.key))
      .map((series) => ({ label: series.label, value: row[series.key], color: series.color })),
  )
}

const showStackTooltip = (event) => {
  showChartTooltip(event, 'global-stack', globalStackMode.value === 'percent' ? 'percent' : 'number', (_row, index) => {
    const total = Math.max(1, visibleStackSeries.value.reduce((sum, series) => sum + (series.values[index] || 0), 0))
    return visibleStackSeries.value.map((series) => {
      const rawValue = series.values[index] || 0
      return {
        label: series.label,
        value: globalStackMode.value === 'percent' ? (rawValue / total) * 100 : rawValue,
        color: series.color,
      }
    })
  })
}

const showChannelStackTooltip = (event, scope, mode = 'normal') => {
  showChartTooltip(event, scope, mode === 'percent' ? 'percent' : 'number', (_row, index) => {
    const seriesList = visibleStackSeriesFor(scope)
    const total = Math.max(1, seriesList.reduce((sum, series) => sum + (series.values[index] || 0), 0))
    return seriesList.map((series) => {
      const rawValue = series.values[index] || 0
      return {
        label: series.label,
        value: mode === 'percent' ? (rawValue / total) * 100 : rawValue,
        color: series.color,
      }
    })
  })
}

const showTypeShareTooltip = (event) => {
  showChartTooltip(event, 'type-share', 'percent', (row) => [
    { label: '视频', value: row.video, color: '#4f46e5' },
    { label: '试玩', value: row.playable, color: '#a5b4fc' },
  ])
}

const showCpa7Tooltip = (event, scope) => {
  showChartTooltip(event, scope, 'currency', (_row, index) =>
    visibleCpa7Series.value.slice(0, 5).map((series) => ({
      label: series.label,
      value: series.cpa7[index],
      color: series.color,
    })),
  )
}

const hideChartTooltip = () => {
  chartTooltip.value = null
}

const linePoints = (values, height = 100) => {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values.map((value, index) => {
    const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * 100
    const y = height - 8 - ((value - min) / range) * (height - 18)
    return `${x},${y}`
  }).join(' ')
}

const chartX = (index, length) => {
  if (length <= 1) return 8
  return 8 + (index / (length - 1)) * 86
}

const chartY = (value, min, max) => {
  const range = max - min || 1
  return 88 - ((value - min) / range) * 72
}

const linePointsWithDomain = (values, min, max) =>
  values.map((value, index) => `${chartX(index, values.length).toFixed(2)},${chartY(value, min, max).toFixed(2)}`).join(' ')

const topShareDomain = computed(() => {
  return { min: 0, max: 60 }
})

const topShareLinePoints = (key) =>
  linePointsWithDomain(chartRows.value.map((row) => row[key] || 0), topShareDomain.value.min, topShareDomain.value.max)

const stackedMaxTotal = (seriesList, scale = 1) =>
  Math.max(1, ...Array.from({ length: seriesList[0]?.values.length || 0 }, (_row, index) =>
    seriesList.reduce((sum, series) => sum + (series.values[index] || 0) * scale, 0),
  ))

const stackY = (ratio) => 88 - Math.max(0, Math.min(1, ratio)) * 72

const stackedAreaPath = (series, scale = 1, mode = globalStackMode.value, seriesList = visibleStackSeries.value) => {
  const seriesIndex = seriesList.findIndex((item) => item.key === series.key)
  const pointCount = series.values.length
  if (seriesIndex < 0 || !pointCount) return ''
  const maxTotal = stackedMaxTotal(seriesList, scale)
  const upper = Array.from({ length: pointCount }, (_row, rowIndex) => {
    const before = seriesList.slice(0, seriesIndex).reduce((sum, item) => sum + (item.values[rowIndex] || 0) * scale, 0)
    const value = (series.values[rowIndex] || 0) * scale
    const total = mode === 'percent' ? Math.max(1, seriesList.reduce((sum, item) => sum + (item.values[rowIndex] || 0) * scale, 0)) : maxTotal
    const ratio = mode === 'percent' ? (before + value) / total : (before + value) / total
    return [chartX(rowIndex, pointCount), stackY(ratio)]
  })
  const lower = Array.from({ length: pointCount }, (_row, rowIndex) => {
    const before = seriesList.slice(0, seriesIndex).reduce((sum, item) => sum + (item.values[rowIndex] || 0) * scale, 0)
    const total = mode === 'percent' ? Math.max(1, seriesList.reduce((sum, item) => sum + (item.values[rowIndex] || 0) * scale, 0)) : maxTotal
    const ratio = mode === 'percent' ? before / total : before / total
    return [chartX(rowIndex, pointCount), stackY(ratio)]
  }).reverse()
  return [
    `M${upper[0][0].toFixed(2)},${upper[0][1].toFixed(2)}`,
    ...upper.slice(1).map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`),
    ...lower.map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`),
    'Z',
  ].join(' ')
}

const stackedLinePath = (series, scale = 1, mode = globalStackMode.value, seriesList = visibleStackSeries.value) => {
  const seriesIndex = seriesList.findIndex((item) => item.key === series.key)
  const pointCount = series.values.length
  if (seriesIndex < 0 || !pointCount) return ''
  const maxTotal = stackedMaxTotal(seriesList, scale)
  return Array.from({ length: pointCount }, (_row, rowIndex) => {
    const before = seriesList.slice(0, seriesIndex).reduce((sum, item) => sum + (item.values[rowIndex] || 0) * scale, 0)
    const value = (series.values[rowIndex] || 0) * scale
    const total = mode === 'percent' ? Math.max(1, seriesList.reduce((sum, item) => sum + (item.values[rowIndex] || 0) * scale, 0)) : maxTotal
    const ratio = (before + value) / total
    return `${rowIndex === 0 ? 'M' : 'L'}${chartX(rowIndex, pointCount).toFixed(2)},${stackY(ratio).toFixed(2)}`
  }).join(' ')
}

const cpa7Domain = computed(() => {
  const values = visibleCpa7Series.value.flatMap((series) => series.cpa7).filter((value) => value >= cpa7Min.value && value <= cpa7Max.value)
  const min = Math.min(...values, cpa7Min.value)
  const max = Math.max(...values, cpa7Max.value)
  const padding = Math.max(8, (max - min) * 0.08)
  return { min: Math.max(0, min - padding), max: max + padding }
})

const cpa7LineSegments = (series) => {
  const segments = []
  let current = []
  series.cpa7.forEach((value, index) => {
    if (value >= cpa7Min.value && value <= cpa7Max.value) {
      current.push(`${chartX(index, series.cpa7.length).toFixed(2)},${chartY(value, cpa7Domain.value.min, cpa7Domain.value.max).toFixed(2)}`)
    } else if (current.length) {
      segments.push(current.join(' '))
      current = []
    }
  })
  if (current.length) segments.push(current.join(' '))
  return segments
}

const cpa7DomainFor = (chart) => {
  const values = visibleCpa7SeriesFor(chart)
    .flatMap((series) => series.cpa7)
    .filter((value) => value !== null && value !== undefined)
  const min = Math.min(...values, cpa7Min.value)
  const max = Math.max(...values, cpa7Max.value)
  const padding = Math.max(8, (max - min) * 0.08)
  return { min: Math.max(0, min - padding), max: max + padding }
}

const cpa7LineSegmentsFor = (series, chart) => {
  const domain = cpa7DomainFor(chart)
  const segments = []
  let current = []
  series.cpa7.forEach((value, index) => {
    if (value !== null && value !== undefined) {
      current.push(`${chartX(index, series.cpa7.length).toFixed(2)},${chartY(value, domain.min, domain.max).toFixed(2)}`)
    } else if (current.length) {
      segments.push(current.join(' '))
      current = []
    }
  })
  if (current.length) segments.push(current.join(' '))
  return segments
}

const dateAxisRows = computed(() => chartRows.value)
const topShareYAxis = ['60%', '45%', '30%', '15%', '0%']
const percentYAxis = ['100%', '75%', '50%', '25%', '0%']
const typeShareYAxis = ['80%', '60%', '40%', '20%', '0%']

const normalStackYAxis = (scope = 'global') => {
  const maxTotal = stackedMaxTotal(visibleStackSeriesFor(scope))
  const step = Math.max(1, Math.ceil(maxTotal / 4 / 50) * 50)
  return [4, 3, 2, 1, 0].map((level) => String(level * step))
}

const cpa7YAxis = (chart) => {
  const values = visibleCpa7SeriesFor(chart).flatMap((series) => series.cpa7).filter((value) => value !== null && value !== undefined)
  const maxValue = Math.max(cpa7Max.value, ...values)
  const step = Math.max(100, Math.ceil(maxValue / 4 / 50) * 50)
  return [4, 3, 2, 1, 0].map((level) => (level === 0 ? '$0' : String(level * step)))
}

const chartAxisLabels = (type, scope, chart) => {
  if (type === 'top-share') return topShareYAxis
  if (type === 'percent') return percentYAxis
  if (type === 'type-share') return typeShareYAxis
  if (type === 'cpa7') return cpa7YAxis(chart)
  return normalStackYAxis(scope)
}

const channelOptions = [
  { value: 'applovin', label: 'Applovin' },
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'unity', label: 'Unity' },
]

const campaignOptions = [
  { value: 'camp-merge-042', label: 'Campaign Merge 042' },
  { value: 'camp-playable-118', label: 'Campaign Playable 118' },
  { value: 'camp-local-207', label: 'Campaign Local 207' },
]

const adSetOptions = [
  { value: 'set-us-android', label: 'US Android Set' },
  { value: 'set-ios-core', label: 'iOS Core Set' },
  { value: 'set-local-exp', label: 'Local Exp Set' },
]

const materialTypeOptions = [
  { value: 'playable', label: '试玩' },
  { value: 'video', label: '视频' },
  { value: 'image', label: '图片' },
]

const selectedTypePreset = computed(() => {
  if (selectedChartTypes.value.length === chartTypeOptions.length) return ''
  if (selectedChartTypes.value.length === 1) return selectedChartTypes.value[0]
  return 'custom'
})

const handleTopMaterialTypeChange = (value) => {
  if (value === '') {
    selectedChartTypes.value = chartTypeOptions.map((option) => option.key)
    return
  }
  if (value !== 'custom') selectedChartTypes.value = [value]
}

const analyzeMaterials = async () => {
  isAnalyzing.value = true
  try {
    analysisData.value = await analyzeMaterialsService(materials.value)
  } finally {
    isAnalyzing.value = false
  }
}
</script>

<template>
  <div class="space-y-5 pb-10">
    <section class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-2">
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
        <AnalyticsSelect v-model="campaign" :options="campaignOptions" placeholder="Campaign" class-name="w-[220px]" />
        <AnalyticsSelect v-model="adSet" :options="adSetOptions" placeholder="Set" class-name="w-[200px]" />
        <AnalyticsSelect v-model="channel" :options="channelOptions" placeholder="渠道" class-name="w-[180px]" />
        <AnalyticsSelect :model-value="selectedTypePreset" :options="materialTypeOptions" placeholder="素材类型" class-name="w-[180px]" @update:model-value="handleTopMaterialTypeChange" />
      </div>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in overviewKpis" :key="item.key" class="relative h-28 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div class="relative z-10 flex h-full flex-col">
          <div class="flex items-start justify-between gap-3">
            <span class="text-[9.5px] font-black text-slate-500">{{ item.label }}</span>
            <span class="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">↗0%</span>
          </div>
          <p class="mt-1 text-xl font-black tracking-tight text-slate-900">{{ item.value }}</p>
          <p class="mt-auto truncate text-[9.5px] font-medium text-slate-500">{{ item.detail }}</p>
        </div>
        <svg class="absolute bottom-2 right-2 h-12 w-24 opacity-45" viewBox="0 0 100 48" preserveAspectRatio="none">
          <polyline :points="sparklinePoints(item.metric.history)" fill="none" :stroke="item.color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </article>
    </div>

    <section class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="mb-4 border-b border-slate-100 pb-4">
        <div>
          <h2 class="flex items-center text-xl font-black tracking-tight text-slate-900">
            <span class="mr-3 h-6 w-1.5 rounded-full bg-indigo-600"></span>
            消耗数据图表
          </h2>
          <p class="mt-2 flex items-center gap-2 text-xs font-black text-slate-700">
            <span class="h-4 w-1 rounded-full bg-indigo-500"></span>
            Top20 素材花费结构与类型占比
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article class="flex h-[390px] min-w-0 flex-col overflow-visible rounded-2xl border border-slate-150 bg-slate-50/80 p-4 shadow-3xs">
          <div class="mb-3 flex min-h-[74px] flex-col gap-2 border-b border-slate-150/70 pb-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-black tracking-tight text-slate-800">Top20素材花费占全部素材花费占比</h3>
                <p class="mt-1 text-[9.5px] font-bold text-slate-400">ALL / Applovin / Facebook / Google</p>
              </div>
              <button class="flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-black text-slate-500"><SlidersHorizontal class="h-3 w-3" />筛选</button>
            </div>
          </div>
          <div class="relative h-[168px] overflow-visible">
            <div class="absolute left-0 top-0 flex h-[138px] w-7 flex-col justify-between text-[9px] font-bold text-slate-400">
              <span v-for="tick in chartAxisLabels('top-share')" :key="`share-y-${tick}`">{{ tick }}</span>
            </div>
            <div class="ml-8 h-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-[138px] w-full rounded-xl bg-white" @mousemove="showTopShareTooltip" @mouseleave="hideChartTooltip">
                <line v-for="tick in [25, 50, 75]" :key="tick" x1="0" x2="100" :y1="tick" :y2="tick" stroke="#e2e8f0" stroke-dasharray="1.8 1.8" stroke-width="0.28" />
                <polyline
                  v-for="series in topShareSeries.filter((item) => topShareVisible.includes(item.key))"
                  :key="series.key"
                  :points="topShareLinePoints(series.key)"
                  fill="none"
                  :stroke="series.color"
                  stroke-width="1.8"
                />
              </svg>
              <div class="grid text-center text-[8px] font-bold text-slate-400" :style="{ gridTemplateColumns: `repeat(${dateAxisRows.length}, minmax(0, 1fr))` }">
                <span v-for="row in dateAxisRows" :key="`share-axis-${row.date}`">{{ row.date }}</span>
              </div>
            </div>
            <div v-if="chartTooltip?.scope === 'top-share'" class="pointer-events-none absolute z-20 w-64 rounded-xl border border-slate-150 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5" :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }">
              <div class="mb-2 text-sm font-black text-slate-900">{{ chartTooltip.title }}</div>
              <div class="max-h-48 space-y-2 overflow-y-auto pr-1">
                <div v-for="item in chartTooltip.rows" :key="item.label" class="grid grid-cols-[10px_1fr_auto] items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="truncate font-bold text-slate-600">{{ item.label }}</span>
                  <span class="font-mono font-black text-slate-900">{{ formatChartValue(item.value, chartTooltip.unit) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex min-w-0 flex-wrap gap-1.5 border-t border-slate-150/70 pt-3 text-[9.5px] font-black text-slate-500">
            <button
              v-for="series in topShareSeries"
              :key="series.key"
              :class="`inline-flex min-w-[96px] items-center gap-1 rounded-lg px-1.5 py-1 text-left transition-all ${topShareVisible.includes(series.key) ? 'bg-white text-slate-700 shadow-3xs' : 'text-slate-300'}`"
              type="button"
              @click="toggleTopShare(series.key)"
            >
              <i class="h-2 w-2 rounded-full" :style="{ backgroundColor: topShareVisible.includes(series.key) ? series.color : '#cbd5e1' }"></i>{{ series.label }}
            </button>
          </div>
        </article>

        <article class="flex h-[390px] min-w-0 flex-col overflow-visible rounded-2xl border border-slate-150 bg-slate-50/80 p-4 shadow-3xs">
          <div class="mb-3 flex min-h-[74px] flex-col gap-2 border-b border-slate-150/70 pb-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-black tracking-tight text-slate-800">全渠道Top20素材花费比例</h3>
                <p class="text-[9.5px] font-bold text-slate-400">语言：EN / DE / FR / IT / JA / KO / TW / ES / PT</p>
              </div>
              <button class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-150 bg-white px-2.5 text-[10px] font-black text-slate-500 transition-all hover:text-slate-900"><SlidersHorizontal class="h-3.5 w-3.5" />筛选</button>
            </div>
          </div>
          <div class="relative h-[168px] overflow-visible">
            <div class="absolute left-0 top-0 flex h-[138px] w-7 flex-col justify-between text-[9px] font-bold text-slate-400">
              <span v-for="tick in chartAxisLabels(globalStackMode === 'percent' ? 'percent' : 'normal', 'global')" :key="`global-stack-y-${tick}`">{{ tick }}</span>
            </div>
            <div class="ml-8 h-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-[138px] w-full rounded-xl bg-white" @mousemove="showStackTooltip" @mouseleave="hideChartTooltip">
                <line v-for="tick in [25, 50, 75]" :key="`global-stack-grid-${tick}`" x1="0" x2="100" :y1="tick" :y2="tick" stroke="#d8dee8" stroke-dasharray="1.6 1.6" stroke-width="0.28" />
                <path
                  v-for="series in visibleStackSeries"
                  :key="`global-stack-area-${series.key}`"
                  :d="stackedAreaPath(series)"
                  :fill="series.fill"
                  fill-opacity="0.82"
                  :stroke="series.color"
                  stroke-width="0.6"
                />
                <path
                  v-for="series in visibleStackSeries"
                  :key="`global-stack-line-${series.key}`"
                  :d="stackedLinePath(series)"
                  fill="none"
                  :stroke="series.color"
                  stroke-width="0.55"
                />
              </svg>
              <div class="grid text-center text-[8px] font-bold text-slate-400" :style="{ gridTemplateColumns: `repeat(${dateAxisRows.length}, minmax(0, 1fr))` }">
                <span v-for="row in dateAxisRows" :key="`stack-axis-${row.date}`">{{ row.date }}</span>
              </div>
            </div>
            <div v-if="chartTooltip?.scope === 'global-stack'" class="pointer-events-none absolute z-20 w-64 rounded-xl border border-slate-150 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5" :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }">
              <div class="mb-2 text-sm font-black text-slate-900">{{ chartTooltip.title }}</div>
              <div class="max-h-48 space-y-2 overflow-y-auto pr-1">
                <div v-for="item in chartTooltip.rows" :key="item.label" class="grid grid-cols-[10px_1fr_auto] items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="truncate font-bold text-slate-600">{{ item.label }}</span>
                  <span class="font-mono font-black text-slate-900">{{ formatChartValue(item.value, chartTooltip.unit) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex min-h-[86px] items-start gap-1.5 border-t border-slate-150/70 pt-3">
            <button
              type="button"
              class="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="上一页"
              :disabled="stackLegendPage === 0"
              @click="stackLegendPage = Math.max(0, stackLegendPage - 1)"
            >
              ‹
            </button>
            <div class="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-5">
              <button
                v-for="series in paginatedStackSeries"
                :key="series.key"
                :class="`inline-flex min-w-0 items-center rounded-md border px-2 py-1.5 text-left text-[10px] font-black leading-none transition-all ${effectiveStackVisible.includes(series.key) ? 'border-slate-200 bg-white text-slate-700 shadow-sm' : 'border-slate-150 bg-slate-100 text-slate-300'}`"
                type="button"
                @click="toggleStackSeries(series.key)"
                :title="series.label"
              >
                <i class="mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: effectiveStackVisible.includes(series.key) ? series.color : '#cbd5e1' }"></i>
                <span class="min-w-0 truncate">{{ series.label }}</span>
              </button>
            </div>
            <button
              type="button"
              class="ml-auto mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="下一页"
              :disabled="stackLegendPage >= stackLegendPageCount - 1"
              @click="stackLegendPage = Math.min(stackLegendPageCount - 1, stackLegendPage + 1)"
            >
              ›
            </button>
          </div>
        </article>

        <article class="flex h-[390px] min-w-0 flex-col overflow-visible rounded-2xl border border-slate-150 bg-slate-50/80 p-4 shadow-3xs">
          <div class="mb-3 flex min-h-[74px] flex-col gap-2 border-b border-slate-150/70 pb-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-black tracking-tight text-slate-800">试玩和视频花费占比</h3>
                <p class="text-[9.5px] font-bold text-slate-400">渠道通过右侧筛选切换</p>
              </div>
              <button class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-150 bg-white px-2.5 text-[10px] font-black text-slate-500 transition-all hover:text-slate-900"><SlidersHorizontal class="h-3.5 w-3.5" />筛选</button>
            </div>
          </div>
          <div class="relative h-[168px] overflow-visible">
            <div class="absolute left-0 top-0 flex h-[138px] w-7 flex-col justify-between text-[9px] font-bold text-slate-400">
              <span v-for="tick in chartAxisLabels('type-share')" :key="`type-y-${tick}`">{{ tick }}</span>
            </div>
            <div class="ml-8 h-full">
              <div class="flex h-[138px] items-end gap-1 rounded-xl bg-white px-3 py-0" @mousemove="showTypeShareTooltip" @mouseleave="hideChartTooltip">
                <div v-for="row in chartRows" :key="`type-${row.date}`" class="flex h-full min-w-0 flex-1 items-end justify-center gap-0.5">
                  <span v-if="typeShareVisible.includes('video')" class="block w-2 rounded-t-sm bg-indigo-600" :style="{ height: `${Math.max(2, (row.video / 80) * 100)}%` }"></span>
                  <span v-if="typeShareVisible.includes('playable')" class="block w-2 rounded-t-sm bg-indigo-300" :style="{ height: `${Math.max(2, (row.playable / 80) * 100)}%` }"></span>
                </div>
              </div>
              <div class="grid text-center text-[8px] font-bold text-slate-400" :style="{ gridTemplateColumns: `repeat(${dateAxisRows.length}, minmax(0, 1fr))` }">
                <span v-for="row in dateAxisRows" :key="`type-axis-${row.date}`">{{ row.date }}</span>
              </div>
            </div>
            <div v-if="chartTooltip?.scope === 'type-share'" class="pointer-events-none absolute z-20 w-64 rounded-xl border border-slate-150 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5" :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }">
              <div class="mb-2 text-sm font-black text-slate-900">{{ chartTooltip.title }}</div>
              <div class="space-y-2">
                <div v-for="item in chartTooltip.rows" :key="item.label" class="grid grid-cols-[10px_1fr_auto] items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="truncate font-bold text-slate-600">{{ item.label }}</span>
                  <span class="font-mono font-black text-slate-900">{{ formatChartValue(item.value, chartTooltip.unit) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex gap-3 border-t border-slate-150/70 pt-3 text-[10px] font-black text-slate-500">
            <button
              :class="`inline-flex items-center gap-1.5 ${typeShareVisible.includes('video') ? 'text-slate-500' : 'text-slate-300'}`"
              type="button"
              @click="toggleTypeShare('video')"
            >
              <i class="h-2.5 w-2.5 rounded bg-indigo-600"></i>视频
            </button>
            <button
              :class="`inline-flex items-center gap-1.5 ${typeShareVisible.includes('playable') ? 'text-slate-500' : 'text-slate-300'}`"
              type="button"
              @click="toggleTypeShare('playable')"
            >
              <i class="h-2.5 w-2.5 rounded bg-indigo-300"></i>试玩
            </button>
          </div>
        </article>

        <article v-for="chart in channelStackCharts" :key="chart.key" class="flex h-[390px] min-w-0 flex-col overflow-visible rounded-2xl border border-slate-150 bg-slate-50/80 p-4 shadow-3xs">
          <div class="mb-3 flex min-h-[74px] flex-col gap-2 border-b border-slate-150/70 pb-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-black tracking-tight text-slate-800">{{ chart.title }}</h3>
                <p class="text-[9.5px] font-bold text-slate-400">Top20 素材日花费堆叠</p>
              </div>
              <button class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-150 bg-white px-2.5 text-[10px] font-black text-slate-500 transition-all hover:text-slate-900"><SlidersHorizontal class="h-3.5 w-3.5" />筛选</button>
            </div>
          </div>
          <div class="relative h-[168px] overflow-visible">
            <div class="absolute left-0 top-0 flex h-[138px] w-7 flex-col justify-between text-[9px] font-bold text-slate-400">
              <span v-for="tick in chartAxisLabels(channelStackModes[chart.key] === 'percent' ? 'percent' : 'normal', chart.key)" :key="`${chart.key}-y-${tick}`">{{ tick }}</span>
            </div>
            <div class="ml-8 h-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-[138px] w-full rounded-xl bg-white" @mousemove="showChannelStackTooltip($event, chart.key, channelStackModes[chart.key])" @mouseleave="hideChartTooltip">
                <line v-for="tick in [25, 50, 75]" :key="`${chart.key}-grid-${tick}`" x1="0" x2="100" :y1="tick" :y2="tick" stroke="#d8dee8" stroke-dasharray="1.6 1.6" stroke-width="0.28" />
                <path
                  v-for="series in visibleStackSeriesFor(chart.key)"
                  :key="`${chart.key}-area-${series.key}`"
                  :d="stackedAreaPath(series, 1, channelStackModes[chart.key], visibleStackSeriesFor(chart.key))"
                  :fill="series.fill"
                  fill-opacity="0.82"
                  :stroke="series.color"
                  stroke-width="0.6"
                />
                <path
                  v-for="series in visibleStackSeriesFor(chart.key)"
                  :key="`${chart.key}-line-${series.key}`"
                  :d="stackedLinePath(series, 1, channelStackModes[chart.key], visibleStackSeriesFor(chart.key))"
                  fill="none"
                  :stroke="series.color"
                  stroke-width="0.55"
                />
              </svg>
              <div class="grid text-center text-[8px] font-bold text-slate-400" :style="{ gridTemplateColumns: `repeat(${dateAxisRows.length}, minmax(0, 1fr))` }">
                <span v-for="row in dateAxisRows" :key="`${chart.key}-axis-${row.date}`">{{ row.date }}</span>
              </div>
            </div>
            <div v-if="chartTooltip?.scope === chart.key" class="pointer-events-none absolute z-20 w-64 rounded-xl border border-slate-150 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5" :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }">
              <div class="mb-2 text-sm font-black text-slate-900">{{ chartTooltip.title }}</div>
              <div class="max-h-48 space-y-2 overflow-y-auto pr-1">
                <div v-for="item in chartTooltip.rows" :key="item.label" class="grid grid-cols-[10px_1fr_auto] items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="truncate font-bold text-slate-600">{{ item.label }}</span>
                  <span class="font-mono font-black text-slate-900">{{ formatChartValue(item.value, chartTooltip.unit) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex min-h-[86px] items-start gap-1.5 border-t border-slate-150/70 pt-3">
            <button
              type="button"
              class="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="上一页"
              :disabled="stackLegendPage === 0"
              @click="stackLegendPage = Math.max(0, stackLegendPage - 1)"
            >
              ‹
            </button>
            <div class="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-5">
              <button
                v-for="series in paginatedStackSeries"
                :key="`${chart.key}-${series.key}`"
                :class="`inline-flex min-w-0 items-center rounded-md border px-2 py-1.5 text-left text-[10px] font-black leading-none transition-all ${effectiveStackVisible.includes(series.key) ? 'border-slate-200 bg-white text-slate-700 shadow-sm' : 'border-slate-150 bg-slate-100 text-slate-300'}`"
                type="button"
                @click="toggleStackSeries(series.key)"
                :title="series.label"
              >
                <i class="mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: effectiveStackVisible.includes(series.key) ? series.color : '#cbd5e1' }"></i>
                <span class="min-w-0 truncate">{{ series.label }}</span>
              </button>
            </div>
            <button
              type="button"
              class="ml-auto mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="下一页"
              :disabled="stackLegendPage >= stackLegendPageCount - 1"
              @click="stackLegendPage = Math.min(stackLegendPageCount - 1, stackLegendPage + 1)"
            >
              ›
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 class="flex items-center text-xl font-black tracking-tight text-slate-900">
          <span class="mr-3 h-6 w-1.5 rounded-full bg-indigo-600"></span>
          Top20 素材 CPA7 折线图
        </h2>
        <button class="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-150 bg-white px-2.5 text-[10px] font-black text-slate-500 transition-all hover:text-slate-900 lg:self-auto"><SlidersHorizontal class="h-3.5 w-3.5" />筛选</button>
      </div>
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article v-for="chart in cpa7ChartConfigs" :key="chart.key" class="flex h-[390px] min-w-0 flex-col rounded-2xl border border-slate-150 bg-slate-50/80 p-4 shadow-3xs">
          <div class="mb-3 min-h-[74px] border-b border-slate-150/70 pb-3">
            <h3 class="truncate text-sm font-black tracking-tight text-slate-800">{{ chart.title }}</h3>
            <p class="mt-1 text-[9.5px] font-bold text-slate-400">按素材编号展示 CPA7 日趋势</p>
          </div>
          <div class="relative h-[168px] overflow-visible">
            <div class="absolute left-0 top-0 flex h-[138px] w-7 flex-col justify-between text-[9px] font-bold text-slate-400">
              <span v-for="tick in chartAxisLabels('cpa7', null, chart)" :key="`${chart.key}-y-${tick}`">{{ tick }}</span>
            </div>
            <div class="ml-8 h-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-[138px] w-full rounded-xl bg-white" @mousemove="showCpa7Tooltip($event, chart.title)" @mouseleave="hideChartTooltip">
                <line v-for="tick in [25, 50, 75]" :key="`${chart.key}-grid-${tick}`" x1="0" x2="100" :y1="tick" :y2="tick" stroke="#e2e8f0" stroke-dasharray="1.8 1.8" stroke-width="0.28" />
                <template v-for="series in visibleCpa7SeriesFor(chart)" :key="`${chart.key}-${series.key}`">
                  <polyline
                    v-for="(segment, segmentIndex) in cpa7LineSegmentsFor(series, chart)"
                    :key="`${chart.key}-${series.key}-${segmentIndex}`"
                    :points="segment"
                    fill="none"
                    :stroke="series.color"
                    stroke-width="1.4"
                  />
                </template>
              </svg>
              <div class="grid text-center text-[8px] font-bold text-slate-400" :style="{ gridTemplateColumns: `repeat(${dateAxisRows.length}, minmax(0, 1fr))` }">
                <span v-for="row in dateAxisRows" :key="`${chart.key}-axis-${row.date}`">{{ row.date }}</span>
              </div>
            </div>
            <div v-if="chartTooltip?.scope === chart.title" class="pointer-events-none absolute z-20 w-64 rounded-xl border border-slate-150 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5" :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }">
              <div class="mb-2 text-sm font-black text-slate-900">{{ chartTooltip.title }}</div>
              <div class="max-h-48 space-y-2 overflow-y-auto pr-1">
                <div v-for="item in chartTooltip.rows" :key="item.label" class="grid grid-cols-[10px_1fr_auto] items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="truncate font-bold text-slate-600">{{ item.label }}</span>
                  <span class="font-mono font-black text-slate-900">{{ formatChartValue(item.value, chartTooltip.unit) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex min-h-[86px] items-start gap-1.5 border-t border-slate-150/70 pt-3">
            <button
              type="button"
              class="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="上一页"
              :disabled="cpa7LegendPage === 0"
              @click="cpa7LegendPage = Math.max(0, cpa7LegendPage - 1)"
            >
              ‹
            </button>
            <div class="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-5">
              <button
                v-for="series in paginatedCpa7Series"
                :key="series.key"
                :class="`inline-flex min-w-0 items-center rounded-md border px-2 py-1.5 text-left text-[10px] font-black leading-none transition-all ${effectiveCpa7Visible.includes(series.key) ? 'border-slate-200 bg-white text-slate-700 shadow-sm' : 'border-slate-150 bg-slate-100 text-slate-300'}`"
                type="button"
                @click="toggleCpa7Series(series.key)"
                :title="series.label"
              >
                <i class="mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: effectiveCpa7Visible.includes(series.key) ? series.color : '#cbd5e1' }"></i>
                <span class="min-w-0 truncate">{{ series.label }}</span>
              </button>
            </div>
            <button
              type="button"
              class="ml-auto mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="下一页"
              :disabled="cpa7LegendPage >= cpa7LegendPageCount - 1"
              @click="cpa7LegendPage = Math.min(cpa7LegendPageCount - 1, cpa7LegendPage + 1)"
            >
              ›
            </button>
          </div>
        </article>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
      <section class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 class="mb-4 flex items-center justify-end text-xl font-black tracking-tight text-slate-900">
          <span class="mr-auto h-6 w-1.5 rounded-full bg-purple-500"></span>
          头部素材 (Top Performers)
        </h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          <article v-for="mat in topMaterials" :key="mat.id" class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-3xs">
            <div class="relative aspect-[9/16] bg-slate-100">
              <img :src="mat.thumbnail" :alt="mat.name" class="h-full w-full object-cover" />
              <span class="absolute right-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">TOP</span>
            </div>
            <div class="space-y-1.5 p-2">
              <h3 class="truncate text-[10px] font-black text-slate-800" :title="mat.name">{{ mat.name }}</h3>
              <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-medium text-slate-500">
                <span>负责人</span><span class="text-right font-bold text-slate-700">{{ mat.creator }}</span>
                <span>语种</span><span class="text-right font-bold text-slate-700">{{ mat.language.toLowerCase() }}</span>
                <span>结果</span><span class="text-right font-black text-emerald-600">好</span>
              </div>
              <div class="border-t border-slate-100 pt-1 text-[9px] font-medium text-slate-500">
                <div class="flex justify-between"><span>成功素材花费</span><span class="font-mono text-slate-700">${{ mat.liveCampCost.toLocaleString() }}</span></div>
                <div class="flex justify-between"><span>成功素材占比</span><span class="font-mono text-slate-700">{{ mat.liveCampShare.toFixed(2) }}%</span></div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="flex min-h-[520px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center text-xl font-black tracking-tight text-slate-900">
            <span class="mr-3 h-6 w-1.5 rounded-full bg-emerald-500"></span>
            关键词分析
          </h2>
          <Sparkles class="h-4 w-4 text-indigo-400" />
        </div>
        <div class="flex flex-1 flex-col items-center justify-center text-center text-slate-400">
          <template v-if="isAnalyzing">
            <LoaderCircle class="mb-4 h-8 w-8 animate-spin text-slate-300" />
            <p class="text-xs font-medium">正在分析中...</p>
          </template>
          <template v-else>
            <Database class="mb-4 h-8 w-8 text-slate-200" />
            <p class="max-w-xs text-xs font-medium leading-relaxed">{{ analysisData.summary }}</p>
          </template>
        </div>
        <button class="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-xs font-black text-sky-500 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="isAnalyzing" @click="analyzeMaterials">
          Refresh AI Analysis
        </button>
      </section>
    </div>
  </div>
</template>
