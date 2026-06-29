import { AnalysisDimension } from '../../services/mockData'
export { getRecentUtcRange } from '../shared/date/dateRange'

export const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export const formatCurrencyCompact = (value) => {
  if (value >= 10000) return `$${(value / 10000).toFixed(1)}w`
  return `$${Math.round(value).toLocaleString()}`
}

export const formatRatioPercent = (value) => `${(value * 100).toFixed(1)}%`

export const getFeedbackStatusStyle = (status) => {
  switch (status) {
    case 'Winner':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'Failed':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'Flat':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'Paused':
      return 'border-slate-200 bg-slate-100 text-slate-500'
    default:
      return 'border-indigo-200 bg-indigo-50 text-indigo-700'
  }
}

export const getTabDimensions = (tabType) => {
  if (tabType === 'full') {
    return [
      { id: AnalysisDimension.DIRECTION, label: '方向类型' },
      { id: AnalysisDimension.PLOT_3D, label: '3D剧情' },
      { id: AnalysisDimension.GAMEPLAY_TYPE, label: '玩法类型' },
      { id: AnalysisDimension.GAMEPLAY_CORE, label: '玩法内核' },
      { id: AnalysisDimension.STRUCTURE, label: '结构' },
    ]
  }
  if (tabType === 'segment_a') {
    return [
      { id: AnalysisDimension.SECTION_A, label: 'A段类型' },
      { id: AnalysisDimension.VOICEOVER, label: '口播类型' },
      { id: AnalysisDimension.COPYWRITING, label: '文案类型' },
    ]
  }
  if (tabType === 'segment_b') {
    return [
      { id: AnalysisDimension.SECTION_B, label: 'B段类型' },
      { id: AnalysisDimension.GAMEPLAY_CORE, label: '玩法内核' },
      { id: AnalysisDimension.STRUCTURE, label: '结构引用' },
    ]
  }
  return []
}

export const getMetricConfig = (metric) => {
  switch (metric) {
    case 'cost':
      return { title: '总花费', dataKey: 'totalCost', secondaryLabel: '花费占比' }
    case 'avgCost':
      return { title: '平均花费', dataKey: 'avgCost' }
    case 'quantity':
      return { title: '数量', dataKey: 'count', secondaryLabel: '数量占比' }
    default:
      return { title: '总花费', dataKey: 'totalCost', secondaryLabel: '花费占比' }
  }
}

export const formatMetricValue = (metric, value) => {
  if (metric === 'quantity') return Math.round(value || 0).toLocaleString()
  return `$${Math.round(value || 0).toLocaleString()}`
}
