export {
  getDeliveryStatusLabel,
  getDeliveryStatusStyle,
  getPriorityLabel,
  getPriorityStyle,
  getProdStatusLabel,
  getProdStatusStyle,
  getReqStatusLabel,
  getStatusStyle,
} from './styles'

export const getAssetTypeLabel = (assetType) => {
  if (assetType === 'Image') return '图片'
  if (assetType === 'Playable') return '试玩'
  return '视频'
}

export const getDifficultyStyle = (difficulty) => {
  if (difficulty === 'Senior') return 'bg-purple-50 text-purple-600 border-purple-100'
  if (difficulty === 'Junior') return 'bg-blue-50 text-blue-600 border-blue-100'
  if (difficulty === 'Test') return 'bg-amber-50 text-amber-600 border-amber-100'
  return 'bg-slate-50 text-slate-600'
}

export const getFormConfig = (form) => {
  if (form === 'Video') {
    return { icon: 'Video', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
  }
  if (form === 'Playable') {
    return { icon: 'Gamepad2', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  }
  if (form === 'Image') {
    return { icon: 'Image', color: 'bg-orange-50 text-orange-600 border-orange-100' }
  }
  return { icon: null, color: 'bg-slate-50 text-slate-400 border-slate-100' }
}

export const getScenarioStyle = (scenario) => {
  if (scenario === 'Standard') return 'bg-slate-100 text-slate-600'
  if (scenario === 'Localized') return 'bg-sky-50 text-sky-600 border-sky-200'
  if (scenario === 'ASO') return 'bg-pink-50 text-pink-600 border-pink-200'
  return 'bg-slate-50'
}

export const getDirectionTypeStyle = (type = '') => {
  if (type.startsWith('Original')) return 'bg-teal-50 text-teal-700 border-teal-200'
  if (type.startsWith('Scaling')) return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  if (type.startsWith('Test')) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-slate-100 text-slate-600'
}

export const getDifficultyLabel = (difficulty) => {
  if (difficulty === 'Senior') return '高级'
  if (difficulty === 'Junior') return '初级'
  if (difficulty === 'Test') return '测试'
  return difficulty
}

export const getDirectionTypeLabel = (type) => {
  const labels = {
    'Original-Gameplay': '原创-玩法',
    'Original-Hook': '原创-吸量',
    'Original-Master': '原创-母版',
    'Scaling-Iteration': '放量-迭代',
    'Scaling-Editing': '放量-剪辑',
    'Test-Hook': '测试-吸量',
    'Test-Gameplay': '测试-玩法',
  }
  return labels[type] || type
}
