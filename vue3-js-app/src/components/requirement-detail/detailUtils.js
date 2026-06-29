import { formatCalendarDate, parseDateValue } from '../requirement-center/dateUtils'
import { CHANNELS, PROJECTS } from '../../constants'
import {
  formatScheduledRequirementId,
  getRequirementMajorId,
  parseRequirementVersionId,
} from '../shared/requirements/requirementId'

export {
  formatScheduledRequirementId,
  getRequirementMajorId,
  parseDateValue,
  parseRequirementVersionId,
}

export const openNativeDatePicker = (event) => {
  event.currentTarget?.showPicker?.()
}

export const MATERIAL_STAGES = [
  { id: '新', name: '新' },
  { id: '迭', name: '迭' },
  { id: '老', name: '老' },
]

export const BROAD_DIRECTIONS = [
  { id: '大字报', name: '大字报' },
  { id: '原始玩法', name: '原始玩法' },
  { id: '3D玩法', name: '3D玩法' },
]

export const LANGUAGES = [
  { id: 'en', name: 'en（英语）' },
  { id: 'de', name: 'de（德语）' },
  { id: 'fr', name: 'fr（法语）' },
  { id: 'it', name: 'it（意语）' },
  { id: 'jp', name: 'jp（日语）' },
  { id: 'kr', name: 'kr（韩语）' },
  { id: 'tw', name: 'tw（繁中）' },
  { id: 'es', name: 'es（西语）' },
  { id: 'pt', name: 'pt（葡语）' },
]

export const CHANNEL_OPTIONS = CHANNELS

export const DIMENSIONS_LIST = [
  { id: '916', name: '9:16' },
  { id: '11', name: '1:1' },
  { id: '169', name: '16:9' },
]

export const REQUIREMENT_STATUSES = [
  { id: 'Draft', name: '草稿' },
  { id: 'Pending', name: '待审核' },
  { id: 'Approved', name: '审核通过' },
  { id: 'Modification', name: '需求修改' },
]

export const PRODUCTION_STATUSES = [
  { id: 'Unscheduled', name: '未排期' },
  { id: 'Scheduled', name: '已排期' },
  { id: 'InProgress', name: '进行中' },
  { id: 'Completed', name: '已完成' },
]

export const TASK_STATUSES = ['待排期', '已排期', '制作中', '已完成']

export const PRODUCTION_ROLE_OPTIONS = [
  { role: '平面', type: 'Graphic' },
  { role: '合成', type: 'Composition' },
  { role: '视频', type: 'Composition' },
  { role: '程序', type: 'Program' },
  { role: '模型', type: 'Model3D' },
  { role: '地编', type: 'Scene3D' },
  { role: 'AI', type: 'AI' },
  { role: '其它', type: 'Other' },
  { role: '其他', type: 'Other' },
]

export const SCHEDULE_ROLE_PRESETS = [
  { role: '平面', type: 'Graphic', className: 'bg-emerald-500 text-white', accentClassName: 'text-emerald-600' },
  { role: '合成', type: 'Composition', className: 'bg-amber-500 text-white', accentClassName: 'text-amber-600' },
  { role: 'AI', type: 'AI', className: 'bg-rose-500 text-white', accentClassName: 'text-rose-600' },
  { role: '其它', type: 'Other', className: 'bg-violet-500 text-white', accentClassName: 'text-violet-600' },
]

export const PRODUCER_GROUPS = {
  '美宣-平面': ['宋子仪', '吕远林', '王金瑞', '王春华', '李珊姗'],
  '美宣-AI': ['宋爽'],
  '美宣-2D': ['曲冬丽', '张欢', '郭峰', '王佳鸿', '吴楠', '周进易', '邓莉', '蒋天宇', '张雨学', '张澳', '朱奇杰'],
  '美宣-3D': ['刘洋', '孙崇洋', '张永进'],
  程序: ['李嘉鑫', '肖环宇'],
}

export const PRODUCER_GROUP_LABELS = {
  '美宣-平面': '平面',
  '美宣-AI': 'AI',
  '美宣-2D': '合成 / 2D',
  '美宣-3D': '3D',
  程序: '程序',
}

export const INACTIVE_PRODUCERS = new Set(['王春华', '李珊姗', '宋爽', '周进易', '邓莉', '蒋天宇', '张雨学', '张澳', '朱奇杰'])

export const PRODUCER_ALIASES = {
  宋子仪: 'szy',
  吕远林: 'lyl',
  王金瑞: 'wjr',
  王春华: 'wch',
  李珊姗: 'lss',
  宋爽: 'ss',
  曲冬丽: 'qdl',
  张欢: 'zh',
  郭峰: 'gf',
  王佳鸿: 'wjh',
  吴楠: 'wn',
  周进易: 'zjy',
  邓莉: 'dl',
  蒋天宇: 'jty',
  张雨学: 'zyx',
  张澳: 'za',
  朱奇杰: 'zqj',
  刘洋: 'ly',
  孙崇洋: 'scy',
  张永进: 'zyj',
  李嘉鑫: 'ljx',
  肖环宇: 'xhy',
}

export const CREATIVE_ALIASES = {
  唐欣怡: 'txy',
  吉意煊: 'jyx',
  马嘉良: 'mjl',
  张欢: 'zh',
  吴楠: 'wn',
  宋爽: 'ss',
  苏雅: 'sy',
  顺子: 'sz',
}

export const CREATIVE_PEOPLE = ['唐欣怡', '吉意煊', '马嘉良']

export const PERSON_AVATAR_URLS = {
  唐欣怡: '/avatars/tang-xinyi.png',
  吉意煊: '/avatars/ji-yixuan.png',
  马嘉良: '/avatars/ma-jialiang.png',
  张欢: '/avatars/zhang-huan.png',
  何思乔: '/avatars/he-siqiao.png',
}

export const getInitials = (name = '') => {
  const mapping = {
    唐欣怡: 'txy',
    吉意煊: 'jyx',
    马嘉良: 'mjl',
    张欢: 'zh',
    吴楠: 'wn',
    宋爽: 'ss',
    苏雅: 'sy',
    顺子: 'sz',
    ...PRODUCER_ALIASES,
  }
  return mapping[name] || String(name).charAt(0).toLowerCase()
}

export const getPersonAvatarUrl = (name = 'unknown') => {
  return PERSON_AVATAR_URLS[name] || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}`
}

export const getAssetTypeLabel = (assetType) => {
  if (assetType === 'Image') return '图片'
  if (assetType === 'Playable') return '试玩'
  return '视频'
}

export const normalizeDimensionLabel = (dimension) => {
  const value = String(dimension || '').trim()
  const compactMap = {
    916: '9:16',
    169: '16:9',
    11: '1:1',
    45: '4:5',
    54: '5:4',
  }
  return compactMap[value] || value.replace('×', ':').replace('x', ':')
}

export const getDurationLabel = (duration) => {
  const value = duration || '0:30'
  return /秒$/.test(value) ? value : `${value} 秒`
}

export const getFolderFormatName = (req) => {
  const project = (req.projectName || 'panthia').toLowerCase()
  const lang = req.language || 'en'
  const typePrefix = req.assetType === 'Image' ? 'tp' : req.assetType === 'Playable' ? 'sw' : 'cp'
  const assetId = `${typePrefix}${req.assetIndex || ''}`
  const broadDir = req.broadDirection || '大字报'
  const stage = req.materialStage || '迭'
  const creativeInitials = CREATIVE_ALIASES[req.creativePersonnel] || getInitials(req.creativePersonnel) || 'jyx'
  const prodInitials = Array.isArray(req.productionPersonnel) && req.productionPersonnel.length
    ? req.productionPersonnel.map((person) => PRODUCER_ALIASES[person] || getInitials(person)).filter(Boolean).join('_')
    : 'qdl'
  const channels = Array.isArray(req.channels) && req.channels.length
    ? req.channels.map((channel) => (channel === 'all' ? 'all' : channel)).filter(Boolean).join('_')
    : 'apl'
  return `${project}-${lang}-${assetId}-${broadDir}-${stage}-${creativeInitials}-${prodInitials}-${channels}`
}

export const getSubVersionFormatName = (req, subVersion = {}) => {
  const project = (req.projectName || 'panthia').toLowerCase()
  const lang = req.language || 'en'
  const typePrefix = req.assetType === 'Image' ? 'tp' : req.assetType === 'Playable' ? 'sw' : 'cp'
  const assetId = `${typePrefix}${req.assetIndex || ''}`
  const broadDir = req.broadDirection || '大字报'
  const stage = req.materialStage || '迭'
  const version = subVersion.version || req.assetVersion || '01'
  const name = subVersion.name || req.name || '默认创意名称'
  const creativeInitials = CREATIVE_ALIASES[req.creativePersonnel] || getInitials(req.creativePersonnel) || 'jyx'
  const prodInitials = Array.isArray(req.productionPersonnel) && req.productionPersonnel.length
    ? req.productionPersonnel.map((person) => PRODUCER_ALIASES[person] || getInitials(person)).filter(Boolean).join('_')
    : 'qdl'
  const channels = Array.isArray(req.channels) && req.channels.length
    ? req.channels.map((channel) => (channel === 'all' ? 'all' : channel)).filter(Boolean).join('_')
    : 'apl'
  return `${project}-${lang}-${assetId}-${broadDir}-${stage}-${version}-${name}-${creativeInitials}-${prodInitials}-${channels}`
}

export const getSubVersionSizedFormatName = (req, subVersion, dimension) =>
  `${getSubVersionFormatName(req, subVersion)}-${normalizeDimensionLabel(dimension).replace(/[^0-9]/g, '')}`

export const generateFullName = (req, versionOverride, nameOverride, testDirectionOverride) => {
  const project = PROJECTS.find((item) => item.name === req.projectName)?.code || 'pan'
  const typePrefix = req.assetType === 'Image' ? 'tp' : req.assetType === 'Playable' ? 'sw' : 'cp'
  const assetId = `${typePrefix}${req.assetIndex || ''}`
  const stage = req.materialStage
  const broadDirection = req.broadDirection
  const version = versionOverride || req.assetVersion || '01'
  const testDirections = testDirectionOverride || req.testDirections
  const testDirectionText = testDirections && testDirections.length > 0 ? `验证${testDirections.join('_')}` : ''
  const creativeInitials = getInitials(req.creativePersonnel)
  const language = req.language || 'en'
  const channelText = req.channels
    ? req.channels
        .map((channelId) => CHANNELS.find((channel) => channel.id === channelId)?.id || channelId)
        .sort()
        .join('_')
        .slice(0, 15)
    : ''

  return [
    project,
    assetId,
    broadDirection,
    stage,
    version,
    testDirectionText,
    creativeInitials,
    language,
    channelText,
  ]
    .filter(Boolean)
    .join('-')
}

export const getDefaultSubVersions = (req) => {
  if (Array.isArray(req.subVersions) && req.subVersions.length) return req.subVersions
  return [
    { version: '01', name: '3683口播大字报换山下湖泊背景', testDirections: ['前贴'] },
    { version: '02', name: '3684口播大字报换蔚蓝海滩背景', testDirections: ['中贴'] },
    { version: '03', name: '3685口播大字报换繁茂森林背景', testDirections: ['后贴'] },
    { version: '04', name: '3686口播大字报换无垠星空背景', testDirections: ['前贴'] },
    { version: '05', name: '3687口播大字报换皑皑雪山背景', testDirections: ['中贴'] },
  ]
}

export const getScheduleRolePreset = (role, type) => {
  if (role === '视频' || type === 'Composition') return SCHEDULE_ROLE_PRESETS[1]
  if (role === '其他') return SCHEDULE_ROLE_PRESETS[3]
  return SCHEDULE_ROLE_PRESETS.find((preset) => preset.role === role || preset.type === type) || SCHEDULE_ROLE_PRESETS[3]
}

export const getProductionPeople = () =>
  Object.entries(PRODUCER_GROUPS).flatMap(([group, names]) =>
    names.map((name) => ({ id: name, name, group, isActive: !INACTIVE_PRODUCERS.has(name) })),
  )

export const PRODUCTION_PEOPLE = getProductionPeople()

export const getRecommendedProducerGroups = (task = {}) => {
  const role = `${task.role || task.type || ''}`
  if (role.includes('程序') || role.includes('Program')) return ['程序']
  if (role.includes('模型') || role.includes('地编') || role.includes('3D')) return ['美宣-3D']
  if (role.includes('AI')) return ['美宣-AI']
  if (role.includes('平面') || role.includes('Graphic')) return ['美宣-平面', '美宣-AI']
  return ['美宣-2D']
}

export const getProducerOptionGroups = (task = {}) => {
  const recommendedGroups = new Set(getRecommendedProducerGroups(task))
  return Object.keys(PRODUCER_GROUPS)
    .map((group) => ({
      group,
      label: PRODUCER_GROUP_LABELS[group] || group,
      isRecommended: recommendedGroups.has(group),
      people: PRODUCTION_PEOPLE.filter((person) => person.isActive && person.group === group),
    }))
    .filter((group) => group.people.length > 0)
    .sort((a, b) => Number(b.isRecommended) - Number(a.isRecommended))
}

export const getProductionTypeByRole = (role = '') => {
  return PRODUCTION_ROLE_OPTIONS.find((option) => option.role === role)?.type || 'Other'
}

export const getDifficultyEstimatedHours = (task = {}, difficulty = 'C') => {
  const role = `${task.role || task.type || ''}`
  const level = difficulty || 'C'
  const presets = {
    Graphic: { S: 12, A: 8, B: 5, C: 3 },
    Composition: { S: 16, A: 10, B: 6, C: 4 },
    AI: { S: 8, A: 5, B: 3, C: 2 },
    Program: { S: 20, A: 14, B: 8, C: 5 },
    Model3D: { S: 18, A: 12, B: 8, C: 4 },
    Scene3D: { S: 18, A: 12, B: 8, C: 4 },
    Other: { S: 8, A: 5, B: 3, C: 2 },
  }
  if (role.includes('平面')) return presets.Graphic[level] || presets.Graphic.C
  if (role.includes('合成') || role.includes('视频')) return presets.Composition[level] || presets.Composition.C
  if (role.includes('AI')) return presets.AI[level] || presets.AI.C
  if (role.includes('程序')) return presets.Program[level] || presets.Program.C
  if (role.includes('模型')) return presets.Model3D[level] || presets.Model3D.C
  if (role.includes('地编') || role.includes('3D')) return presets.Scene3D[level] || presets.Scene3D.C
  return presets[task.type || 'Other']?.[level] || presets.Other.C
}

export const normalizePlannedTaskStatus = (task) => {
  if (task.status === '制作中' || task.status === '已完成') return task.status
  if (task.designer && task.startDate && task.endDate) return '已排期'
  return task.status || '待排期'
}

export const summarizeProductionStatus = (req) => {
  const tasks = req.tasks || []
  if (!tasks.length) return req.prodStatus || 'Unscheduled'
  if (tasks.every((task) => task.status === '已完成')) return 'Completed'
  if (tasks.some((task) => task.status === '制作中')) return 'InProgress'
  if (req.prodStatus === 'Unscheduled') return 'Unscheduled'
  return 'Scheduled'
}

export const deriveRequirementFromTasks = (req, tasks) => {
  const assignedPeople = Array.from(new Set(tasks.map((task) => task.designer).filter(Boolean)))
  const startDates = tasks.map((task) => task.startDate).filter(Boolean).sort()
  const endDates = tasks.map((task) => task.endDate).filter(Boolean).sort()
  const nextReq = {
    ...req,
    tasks,
    productionPersonnel: assignedPeople.length ? assignedPeople : req.productionPersonnel,
    startDate: startDates[0] || req.startDate,
    endDate: endDates[endDates.length - 1] || req.endDate,
  }
  return {
    ...nextReq,
    prodStatus: summarizeProductionStatus(nextReq),
  }
}

export const formatDateInput = (date) => formatCalendarDate(date)

export const addDaysToDateString = (dateString, days) => {
  const base = new Date(`${dateString}T00:00:00`)
  base.setDate(base.getDate() + days)
  return formatCalendarDate(base)
}

export const getAvailabilityMonthWeeks = (year, month, todayDateString) => {
  const weeks = []
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const dayOfWeek = firstDayOfMonth.getDay()
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const currentDate = new Date(year, month - 1, 1 - startOffset)

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const days = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const dateString = formatDateInput(currentDate)
      const dayOfWeekValue = currentDate.getDay()
      days.push({
        dayNum: currentDate.getDate(),
        dateString,
        isToday: dateString === todayDateString,
        isWeekend: dayOfWeekValue === 0 || dayOfWeekValue === 6,
        isCurrentMonth: currentDate.getMonth() + 1 === month,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push({ days })
  }

  return weeks
}

export const rangesOverlap = (startA, endA, startB, endB) => {
  const aStart = parseDateValue(startA)
  const aEnd = parseDateValue(endA) ?? aStart
  const bStart = parseDateValue(startB)
  const bEnd = parseDateValue(endB) ?? bStart
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false
  return aStart <= bEnd && aEnd >= bStart
}

export const formatShortDateRange = (start, end) => {
  if (!start && !end) return '未定'
  const format = (dateString) => {
    if (!dateString) return ''
    const [, month, day] = dateString.split('-')
    return `${month}/${day}`
  }
  return start === end ? format(start) : `${format(start)}-${format(end)}`
}

export const getScheduleGapHints = (occupiedTasks = [], horizonStart, horizonEnd) => {
  const startTime = parseDateValue(horizonStart)
  const endTime = parseDateValue(horizonEnd)
  if (startTime === null || endTime === null) return []

  const sortedBusyRanges = occupiedTasks
    .map((item) => ({
      start: Math.max(parseDateValue(item.startDate) ?? startTime, startTime),
      end: Math.min(parseDateValue(item.endDate) ?? parseDateValue(item.startDate) ?? startTime, endTime),
    }))
    .filter((range) => range.end >= startTime && range.start <= endTime)
    .sort((a, b) => a.start - b.start)

  const gaps = []
  let cursor = startTime
  sortedBusyRanges.forEach((range) => {
    if (range.start > cursor) {
      const gapStart = new Date(cursor)
      const gapEnd = new Date(range.start - 86400000)
      gaps.push({
        start: formatCalendarDate(gapStart),
        end: formatCalendarDate(gapEnd),
        days: Math.max(1, Math.round((gapEnd.getTime() - gapStart.getTime()) / 86400000) + 1),
      })
    }
    cursor = Math.max(cursor, range.end + 86400000)
  })

  if (cursor <= endTime) {
    const gapStart = new Date(cursor)
    const gapEnd = new Date(endTime)
    gaps.push({
      start: formatCalendarDate(gapStart),
      end: formatCalendarDate(gapEnd),
      days: Math.max(1, Math.round((gapEnd.getTime() - gapStart.getTime()) / 86400000) + 1),
    })
  }

  return gaps
}
