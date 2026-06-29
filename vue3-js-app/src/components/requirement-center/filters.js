export const FILTER_ALL = '全部'
export const FILTER_SEPARATOR = '|'

import { producers } from './people'
import { CHANNELS } from '../../constants'

export const REQUIREMENT_LANGUAGE_OPTIONS = ['en', 'de', 'fr', 'it', 'jp', 'kr', 'tw', 'es', 'pt']

export const CHANNEL_OPTIONS = CHANNELS.map((channel) => channel.id)

export const COORDINATED_FLEXIBLE_FILTER_FIELDS = [
  {
    key: 'priority',
    label: '优先级',
    options: ['最高', '高', '中', '低'],
  },
  {
    key: 'materialStage',
    label: '素材阶段',
    options: ['新', '老', '迭'],
  },
  {
    key: 'productionPersonnel',
    label: '制作人员',
    options: producers.filter((producer) => producer.status === '在职').map((producer) => producer.name),
  },
  {
    key: 'scenario',
    label: '场景',
    options: ['通投', '本地化', 'ASO'],
  },
  {
    key: 'channels',
    label: '渠道',
    options: CHANNEL_OPTIONS,
  },
  {
    key: 'reqStatus',
    label: '需求提交状态',
    options: ['草稿', '待审核', '审核通过', '需求修改'],
  },
  {
    key: 'productionProgress',
    label: '制作完成进度',
    options: ['完全未开始', '进行中', '部分完成', '已完成'],
  },
  {
    key: 'deliveryStatus',
    label: '投放状态',
    options: ['未投放', '投放中', '已暂停'],
  },
  {
    key: 'language',
    label: '语言',
    options: REQUIREMENT_LANGUAGE_OPTIONS,
  },
]

export const COORDINATED_FLEXIBLE_FILTER_OPERATORS = [
  { key: 'equals', label: '等于' },
  { key: 'notEquals', label: '不等于' },
  { key: 'contains', label: '包含' },
  { key: 'notContains', label: '不包含' },
  { key: 'isEmpty', label: '为空' },
  { key: 'isNotEmpty', label: '不为空' },
]

export const createCoordinatedFlexibleFilter = () => ({
  id: `condition-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  field: 'priority',
  operator: 'equals',
  value: '高',
})

export const FILTER_DROPDOWN_PANEL_CLASS =
  'absolute left-0 top-full z-[120] mt-2 w-52 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10'
export const FILTER_DROPDOWN_ACTIVE_CLASS = 'bg-indigo-50 text-indigo-700'
export const FILTER_DROPDOWN_IDLE_CLASS = 'text-slate-600 hover:bg-slate-50'
export const FILTER_DROPDOWN_ALL_IDLE_CLASS = 'text-slate-500 hover:bg-slate-50'

export const decodeFilterValue = (value) =>
  !value || value === FILTER_ALL ? [] : String(value).split(FILTER_SEPARATOR).filter(Boolean)

export const encodeFilterValue = (values) => {
  const normalized = Array.from(new Set(values.filter((value) => value && value !== FILTER_ALL)))
  return normalized.length > 0 ? normalized.join(FILTER_SEPARATOR) : FILTER_ALL
}

export const filterMatches = (filterValue, actualValue) => {
  const selectedValues = decodeFilterValue(filterValue)
  return selectedValues.length === 0 || selectedValues.includes(actualValue || '')
}

export const filterIsActive = (filterValue) => decodeFilterValue(filterValue).length > 0
