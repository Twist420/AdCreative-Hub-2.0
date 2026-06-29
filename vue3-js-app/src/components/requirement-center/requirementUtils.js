import {
  formatScheduledRequirementId,
  getRequirementMajorId,
  parseRequirementVersionId,
} from '../shared/requirements/requirementId'

export {
  formatScheduledRequirementId,
  getRequirementMajorId,
  parseRequirementVersionId,
}

export const LOCALIZATION_LANGUAGES = [
  { code: 'de', label: '德语' },
  { code: 'fr', label: '法语' },
  { code: 'es', label: '西语' },
  { code: 'pt', label: '葡语' },
  { code: 'it', label: '意语' },
  { code: 'jp', label: '日语' },
  { code: 'kr', label: '韩语' },
  { code: 'th', label: '泰语' },
  { code: 'id', label: '印尼语' },
  { code: 'tr', label: '土耳其语' },
]

export const localizationLanguages = LOCALIZATION_LANGUAGES

export const getRequirementIdPrefix = (assetType) => {
  if (assetType === 'Image') return 'tp'
  if (assetType === 'Playable') return 'sw'
  return 'cp'
}

export const formatRequirementId = (assetType, assetIndex, assetVersion = '01') =>
  `${getRequirementIdPrefix(assetType)}${assetIndex}-${assetVersion}`

export const formatCurrencyCompact = (value) => {
  if (value >= 10000) return `$${(value / 10000).toFixed(1)}w`
  return `$${Math.round(value).toLocaleString()}`
}

export const formatDateCompact = (dateString) => String(dateString || '').replaceAll('-', '')

export const getNextAssetIndexForType = (requirements, assetType) => {
  const prefix = getRequirementIdPrefix(assetType)
  const usedIndexes = requirements
    .filter((requirement) => String(requirement.id || '').startsWith(prefix))
    .map((requirement) => requirement.assetIndex || Number(String(requirement.id || '').match(/\d+/)?.[0]))
    .filter((index) => Number.isFinite(index))
  return usedIndexes.length > 0 ? Math.max(...usedIndexes) + 1 : 3377
}

export const getNextLocalizationAssetIndex = (requirements) => {
  const usedIndexes = requirements
    .map((requirement) => requirement.assetIndex || Number(String(requirement.id || '').match(/\d+/)?.[0]))
    .filter((index) => index >= 8000)
  return usedIndexes.length > 0 ? Math.max(...usedIndexes) + 1 : 8000
}

export const createDefaultProductionTasks = (requirementId, assetType, broadDirection) => {
  const createTask = (idSuffix, type, role, dependencyIds = [], estimatedWorkDays = 1) => ({
    id: `${requirementId}-${idSuffix}`,
    type,
    role,
    status: '待排期',
    designer: '',
    startDate: '',
    endDate: '',
    duration: `${estimatedWorkDays}天`,
    estimatedWorkDays,
    dependencyIds,
  })

  const graphicTask = createTask('graphic', 'Graphic', '平面', [], 1)
  const videoTask = createTask('video', 'Composition', '视频', [graphicTask.id], 2)
  if (assetType === 'Image') return [graphicTask]
  if (assetType === 'Playable') return [graphicTask, videoTask, createTask('program', 'Program', '程序', [graphicTask.id, videoTask.id], 2)]
  if (broadDirection === '3D玩法') {
    const modelTask = createTask('model3d', 'Model3D', '模型', [], 2)
    const sceneTask = createTask('scene3d', 'Scene3D', '地编', [], 2)
    return [modelTask, sceneTask, createTask('video', 'Composition', '视频', [modelTask.id, sceneTask.id], 2)]
  }
  return [graphicTask, videoTask]
}

export const getReqType = (requirement) => {
  const is3D =
    requirement.has3DPlot ||
    requirement.name?.toLowerCase().includes('3d') ||
    requirement.assetType === '3D' ||
    requirement.is3DVideo
  if (requirement.assetType === 'Playable') return 'Playable'
  if (is3D) return '3D'
  if (requirement.assetType === 'Image') return '平面'
  return '视频'
}

export const getRequirementPipeline = (requirement) => {
  const idNum = Number.parseInt(String(requirement.id || '').replace(/\D/g, ''), 10) || 0
  const is3D =
    requirement.has3DPlot ||
    requirement.name?.toLowerCase().includes('3d') ||
    requirement.assetType === '3D' ||
    requirement.is3DVideo

  if (requirement.assetType === 'Playable') {
    const s1 = idNum % 3 === 0 ? 'completed' : idNum % 3 === 1 ? 'inprogress' : 'pending'
    const s2 = idNum % 3 === 0 ? 'inprogress' : 'pending'
    return [
      { name: '平面', status: s1 },
      { name: '视频', status: s2 },
      { name: '程序', status: 'pending' },
    ]
  }

  if (is3D) {
    const s1 = idNum % 2 === 0 ? 'completed' : 'inprogress'
    const s2 = idNum % 4 === 0 ? 'completed' : idNum % 2 === 0 ? 'inprogress' : 'pending'
    const s3 = idNum % 4 === 0 ? 'inprogress' : 'pending'
    return [
      { name: '平面', status: s1 },
      { name: '3D', status: s2 },
      { name: '2D', status: s3 },
    ]
  }

  const s1 = idNum % 2 === 0 ? 'completed' : 'inprogress'
  const s2 = idNum % 2 === 0 ? 'inprogress' : 'pending'
  return [
    { name: '平面', status: s1 },
    { name: '2D视频', status: s2 },
  ]
}

export const summarizeProductionStatus = (requirement) => {
  const tasks = requirement.tasks || []
  if (tasks.length === 0) return requirement.prodStatus || 'Unscheduled'
  if (tasks.every((task) => task.status === '已完成')) return 'Completed'
  if (tasks.some((task) => task.status === '制作中')) return 'InProgress'
  if (requirement.prodStatus === 'Unscheduled') return 'Unscheduled'
  return 'Scheduled'
}

export const getScheduledTaskViews = (requirement) => {
  const taskViews = (requirement.tasks || [])
    .filter((task) => task.designer && task.startDate && task.endDate)
    .map((task) => ({
      id: `${requirement.id}:${task.id}`,
      requirement,
      task,
      displayRequirementId: formatScheduledRequirementId(requirement, task),
      producer: task.designer,
      role: task.role || task.type,
      status: task.status || '已排期',
      startDate: task.startDate,
      endDate: task.endDate,
      estimatedWorkDays: task.estimatedWorkDays || Number.parseFloat(task.duration) || 1,
    }))

  if (taskViews.length > 0) return taskViews
  if (!requirement.startDate || !requirement.endDate) return []

  return (requirement.productionPersonnel || [])
    .filter(Boolean)
    .map((producer) => ({
      id: `${requirement.id}:legacy:${producer}`,
      requirement,
      displayRequirementId: formatScheduledRequirementId(requirement),
      producer,
      role: getReqType(requirement),
      status:
        requirement.prodStatus === 'Completed'
          ? '已完成'
          : requirement.prodStatus === 'InProgress'
            ? '制作中'
            : '已排期',
      startDate: requirement.startDate || '',
      endDate: requirement.endDate || '',
      estimatedWorkDays: Number.parseFloat(requirement.duration || '') || 1,
    }))
}

export const buildStandaloneRequirementDraft = (selectedCreateType, requirements) => {
  const assetIndex = getNextAssetIndexForType(requirements, selectedCreateType)
  const requirementId = formatRequirementId(selectedCreateType, assetIndex, '01')
  return {
    id: requirementId,
    name: `未关联方向需求 - ${requirements.length + 1}`,
    previews: [`https://picsum.photos/270/480?random=${assetIndex}`],
    scheduleId: null,
    duration: '0:30',
    goal: '直接创建，不关联方向',
    template: 'A+B',
    has3DPlot: false,
    direction: '未关联方向',
    owner: '唐欣怡',
    creativePersonnel: '唐欣怡',
    productionPersonnel: ['张欢'],
    materialStage: '新',
    broadDirection: '原始玩法',
    priority: 'Mid',
    reqStatus: 'Pending',
    prodStatus: 'Unscheduled',
    deliveryStatus: 'NotLaunched',
    status: 'Pending',
    rating: 0,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    completedAt: '',
    stageType: 'Original Gameplay',
    language: 'en',
    channels: ['all'],
    testDirections: ['前贴'],
    dimensions: ['9:16'],
    assetType: selectedCreateType,
    assetIndex,
    assetVersion: '01',
    projectName: 'Panthia',
    script: '',
    aTags: [],
    bTags: [],
    difficulty: 'C',
    tasks: createDefaultProductionTasks(requirementId, selectedCreateType, '原始玩法'),
  }
}

export const buildRequirementForSchedule = (schedule, requirements) => {
  const assetIndex = getNextAssetIndexForType(requirements, schedule.form)
  const requirementId = formatRequirementId(schedule.form, assetIndex, '01')
  return {
    id: requirementId,
    name: schedule.scenario === 'Localized' ? `${schedule.directionName} 本地化版本` : `${schedule.directionName} 素材需求`,
    previews: [`https://picsum.photos/270/480?random=${assetIndex}`, `https://picsum.photos/270/480?random=${assetIndex + 100}`],
    scheduleId: schedule.id,
    assetType: schedule.form,
    assetIndex,
    assetVersion: '01',
    creativePersonnel: schedule.owner,
    owner: schedule.owner,
    productionPersonnel: ['张欢'],
    direction: schedule.directionName,
    materialStage: '新',
    broadDirection: schedule.broadDirection || '原始玩法',
    channels: schedule.channels,
    priority: schedule.priority,
    reqStatus: 'Draft',
    prodStatus: 'Scheduled',
    deliveryStatus: 'NotLaunched',
    status: 'Draft',
    rating: 0,
    duration: '0:30',
    goal: schedule.validationGoal || '验证方向表现与转化效果',
    template: schedule.form === 'Video' ? '自由模板' : '单版本需求',
    language: 'en',
    testDirections: ['前贴'],
    dimensions: ['9:16'],
    projectName: 'Panthia',
    script: '',
    aTags: [],
    bTags: [],
    difficulty: 'C',
    startDate: schedule.requirementStart,
    endDate: schedule.submissionDeadline,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    completedAt: '',
    tasks: createDefaultProductionTasks(requirementId, schedule.form, schedule.broadDirection || '原始玩法'),
  }
}

export const buildRequirementIteration = (source, schedule, assetIndex, version = '01') => {
  const assetType = schedule.form || source.assetType
  const broadDirection =
    schedule.broadDirection ||
    (schedule.directionType?.includes('3D')
      ? '3D玩法'
      : schedule.directionName?.includes('大字报')
        ? '大字报'
        : source.broadDirection) ||
    '原始玩法'
  const nextId = formatRequirementId(assetType, assetIndex, version)
  return {
    ...source,
    id: nextId,
    parentId: undefined,
    parentRequirementId: source.id,
    sourceRequirementId: source.id,
    sourceRequirementIds: [source.id],
    scheduleId: schedule.id,
    assetType,
    assetIndex,
    assetVersion: version,
    materialStage: '迭',
    broadDirection,
    creativePersonnel: schedule.owner || source.creativePersonnel,
    owner: schedule.owner || source.owner,
    direction: schedule.directionName || source.direction,
    channels: schedule.channels?.length ? schedule.channels : source.channels,
    priority: schedule.priority || source.priority,
    reqStatus: 'Pending',
    prodStatus: 'Unscheduled',
    deliveryStatus: 'NotLaunched',
    status: 'Pending',
    rating: 0,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    completedAt: '',
    tasks: createDefaultProductionTasks(nextId, assetType, broadDirection),
  }
}

export const buildLocalizationSubVersions = (sources, finishedCreativePerformance = []) =>
  sources.map((source, index) => {
    const rows = finishedCreativePerformance.filter((item) => item.requirementId === source.id)
    return {
      version: String(index + 1).padStart(2, '0'),
      name: source.name,
      testDirections: source.testDirections || [],
      sourceRequirementId: source.id,
      sourceRequirementName: source.name,
      finishedReferenceIds:
        rows.length > 0
          ? rows.map((item) => item.id)
          : [`FIN-${source.assetIndex || source.id}-${source.assetVersion || '01'}`],
    }
  })

export const buildLocalizedRequirements = ({ schedule, sources, languages, requirements, todayDateString, finishedCreativePerformance = [] }) => {
  const primarySource = sources[0] || {}
  const assetType = primarySource.assetType || schedule.form || 'Video'
  const broadDirection = schedule.broadDirection || primarySource.broadDirection || '原始玩法'
  const batchId = `loc-${Date.now()}`
  const subVersions = buildLocalizationSubVersions(sources, finishedCreativePerformance)
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const baseAssetIndex = getNextLocalizationAssetIndex(requirements)

  return languages.flatMap((languageCode, languageIndex) => {
    const languageMeta = localizationLanguages.find((item) => item.code === languageCode) || localizationLanguages[0]
    const assetIndex = baseAssetIndex + languageIndex
    return subVersions.map((subVersion, subVersionIndex) => {
      const source = sources.find((item) => item.id === subVersion.sourceRequirementId) || primarySource
      const assetVersion = String(subVersionIndex + 1).padStart(2, '0')
      const requirementId = formatRequirementId(assetType, assetIndex, assetVersion)
      return {
        ...source,
        id: requirementId,
        parentId: undefined,
        parentRequirementId: undefined,
        sourceRequirementId: source.id,
        sourceRequirementIds: [source.id],
        createMode: 'LocalizedFromExisting',
        localizationBatchId: batchId,
        isLocalization: true,
        scheduleId: schedule.id,
        name: `${formatDateCompact(todayDateString)}${languageMeta.label}本地化-${source.id}`,
        assetType,
        assetIndex,
        assetVersion,
        subVersions: [{ ...subVersion, version: assetVersion }],
        broadDirection,
        materialStage: schedule.materialStage || source.materialStage,
        creativePersonnel: schedule.owner || source.creativePersonnel,
        owner: schedule.owner || source.owner,
        productionPersonnel: ['张欢'],
        language: languageCode,
        localizationLanguage: languageCode,
        localizationLanguageLabel: languageMeta.label,
        channels: schedule.channels?.length ? schedule.channels : source.channels,
        testDirections: subVersion.testDirections || source.testDirections || [],
        dimensions: source.dimensions || ['9:16'],
        previews: source.previews || [],
        direction: schedule.directionName || source.direction,
        goal: schedule.validationGoal || source.goal,
        priority: schedule.priority || source.priority,
        reqStatus: 'Pending',
        prodStatus: 'Unscheduled',
        deliveryStatus: 'NotLaunched',
        status: 'Pending',
        rating: 0,
        createdAt,
        completedAt: '',
        template: assetType === 'Video' ? '自由模板' : source.template,
        script: source.script || '',
        difficulty: 'C',
        startDate: schedule.requirementStart,
        endDate: schedule.submissionDeadline,
        tasks: [],
      }
    })
  })
}
