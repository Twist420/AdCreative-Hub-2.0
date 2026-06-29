export const TEMPLATE_CONFIGS = [
  { id: 'same_a', label: '相同A段', desc: '新做片头或A段，批量接已有B段' },
  { id: 'same_b', label: '相同B段', desc: '复用统一B段，批量测试不同A段' },
  { id: 'matrix', label: '自由模板', desc: '按版本自由拼接 A/B/C/D 段' },
]

export const SEGMENT_KINDS = ['A段', '中间段', 'B段', '片头', '玩法段', '大字报', 'CTA', '试玩', '图片']

export const ASSET_OPTIONS = [
  { id: 'FR-AI-01', name: 'AI前贴-冰雪仙子神秘空投', type: 'A段', duration: '00:05', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&h=640&fit=crop' },
  { id: 'FR-LIVE-02', name: '真人前贴-爆奖反应', type: 'A段', duration: '00:04', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop' },
  { id: 'PLAY-CORE-08', name: '玩法段-塔防合成升级展示', type: '中间段', duration: '00:08', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480&h=640&fit=crop' },
  { id: 'BILL-CLASSIC-03', name: '大字报B段-震颤提词', type: 'B段', duration: '00:03', status: 'Insufficient Data', previewUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=480&h=640&fit=crop' },
  { id: 'CTA-REWARD-02', name: 'CTA-宝箱十连抽', type: 'CTA', duration: '00:02', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=640&fit=crop' },
  { id: 'IMG-STORE-06', name: '商店图-主视觉竖版', type: '图片', duration: '-', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=480&h=640&fit=crop' },
]

export const FINISHED_OPTIONS = [
  { id: 'FIN-3683-01', name: '3683口播大字报换山下湖泊背景', type: '成片 / 当前方向', duration: '00:22', status: 'Pending Data', previewUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=480&h=640&fit=crop', directionGroup: '吸量大字报', spent: 18600, createdAt: '2026-06-16', isCurrentDirection: true },
  { id: 'FIN-3684-02', name: '3684口播大字报换蔚蓝海滩背景', type: '成片 / 当前方向', duration: '00:21', status: 'Pending Data', previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=480&h=640&fit=crop', directionGroup: '吸量大字报', spent: 15420, createdAt: '2026-06-15', isCurrentDirection: true },
  { id: 'FIN-3370-01', name: '吸量大字报-爆金币转场成片', type: '成片 / 近期待观察', duration: '00:18', status: 'Insufficient Data', previewUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=640&fit=crop', directionGroup: '吸量大字报', spent: 12880, createdAt: '2026-06-12' },
  { id: 'FIN-3366-03', name: '3D剧情-冰原Boss压迫感成片', type: '成片 / 已初投', duration: '00:26', status: 'Pending Data', previewUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=480&h=640&fit=crop', directionGroup: '3D剧情', spent: 9650, createdAt: '2026-06-10' },
]

export const LANDING_OPTIONS = [
  { id: '9:16', name: '9:16 竖版视频', type: '视频落版', duration: '主规格', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480&h=640&fit=crop' },
  { id: '1:1', name: '1:1 信息流方版', type: '视频落版', duration: '补充', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=480&h=640&fit=crop' },
  { id: '16:9', name: '16:9 横版视频', type: '视频落版', duration: '补充', status: 'Insufficient Data', previewUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=480&h=640&fit=crop' },
  { id: '4:5', name: '4:5 信息流版', type: '视频落版', duration: '补充', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop' },
]

export const ATTACHMENT_OPTIONS = ['参考录屏', '口播音频', '竞品截图', '玩法录屏', 'UI线框', '翻译表']

const pickerMatchTerms = (terms) => (item) => {
  const content = [item.id, item.name, item.type, item.status, item.directionGroup].join(' ').toLowerCase()
  return terms.some((term) => content.includes(String(term).toLowerCase()))
}

export const PICKER_FACETS = [
  { id: 'all', label: '全部资产', group: '热门推荐' },
  { id: 'recommended', label: '推荐资产', group: '热门推荐' },
  { id: 'segment_a', label: '前贴 / A段', group: '资源类型' },
  { id: 'segment_mid', label: '玩法 / 中间段', group: '资源类型' },
  { id: 'segment_b', label: 'B段 / 大字报', group: '资源类型' },
  { id: 'image', label: '图片视觉', group: '资源类型' },
  { id: 'ice', label: '冰雪极地', group: '主题题材' },
  { id: 'live', label: '真人反应', group: '主题题材' },
  { id: 'reward', label: '奖励爆点', group: '主题题材' },
  { id: 'merge', label: '合成升级', group: '玩法机制' },
  { id: 'copy_text', label: '强文案吸睛', group: '玩法机制' },
  { id: 'insufficient', label: '数据不足', group: '关键词状态' },
]

export const ASSET_PICKER_DIRECTORY_TREE = [
  {
    id: 'fragment',
    label: '片段',
    desc: '视频片段体系',
    match: pickerMatchTerms(['A段', 'B段', '中间段', '前贴', '玩法', '大字报', 'CTA']),
    children: [
      {
        id: 'pre_hook',
        label: '前贴',
        desc: '开头吸引片段',
        match: pickerMatchTerms(['A段', '前贴']),
        children: [
          { id: 'ai_pre', label: 'AI前贴', desc: 'AI生成前贴', match: pickerMatchTerms(['AI前贴', 'AI生成', '冰雪仙子']) },
          { id: 'live_pre', label: '真人前贴', desc: '真人反应前贴', match: pickerMatchTerms(['真人前贴', '真人', '爆奖反应']) },
          { id: 'comic_pre', label: '漫画前贴', desc: '漫画风前贴', match: pickerMatchTerms(['漫画', '卡通']) },
          { id: 'gameplay_pre', label: '玩法前贴', desc: '玩法开头片段', match: pickerMatchTerms(['玩法', '塔防', '合成']) },
          { id: 'billboard_pre', label: '大字报前贴', desc: '强文案开头', match: pickerMatchTerms(['大字报', '文字']) },
          { id: 'reward_pre', label: '奖励前贴', desc: '奖励反馈开头', match: pickerMatchTerms(['奖励', '宝箱']) },
          { id: 'decompress_pre', label: '解压前贴', desc: '解压吸引片段', match: pickerMatchTerms(['解压']) },
          { id: 'story_pre', label: '剧情前贴', desc: '剧情开头片段', match: pickerMatchTerms(['剧情']) },
        ],
      },
      { id: 'play_segment', label: '玩法', desc: '核心玩法片段', match: pickerMatchTerms(['中间段', '玩法', '塔防', '合成']) },
      { id: 'billboard_segment', label: '大字报', desc: '结尾或文案片段', match: pickerMatchTerms(['B段', '大字报', '文字']) },
    ],
  },
  {
    id: 'component',
    label: '组件',
    desc: '组件素材体系',
    match: pickerMatchTerms(['图片', '商店图', 'CTA', '场景', '背景', 'UI', '特效', '音效', 'BGM', '形象']),
    children: [
      { id: 'scene_component', label: '场景', desc: '场景和背景', match: pickerMatchTerms(['场景', '背景', '商店图', '图片']) },
      { id: 'merge_component', label: '合成链', desc: '玩法合成链', match: pickerMatchTerms(['合成链', '合成', '升级']) },
      { id: 'ui_component', label: 'UI', desc: '界面与面板', match: pickerMatchTerms(['UI', '面板', '弹窗']) },
      { id: 'fx_component', label: '特效', desc: '粒子和反馈', match: pickerMatchTerms(['特效', '粒子']) },
      { id: 'sfx_component', label: '音效', desc: '音效反馈', match: pickerMatchTerms(['音效']) },
      { id: 'bgm_component', label: 'BGM', desc: '音乐素材', match: pickerMatchTerms(['BGM', '音乐']) },
      { id: 'character_component', label: '人物形象', desc: '角色形象', match: pickerMatchTerms(['人物', '形象', '真人', '仙子']) },
      { id: 'animal_component', label: '动物形象', desc: '动物或怪物形象', match: pickerMatchTerms(['动物', '怪物']) },
    ],
  },
]

const flattenPickerDirectories = (nodes) =>
  nodes.flatMap((node) => [
    { id: node.id, label: node.label, desc: node.desc || '', match: node.match },
    ...(node.children ? flattenPickerDirectories(node.children) : []),
  ])

export const ASSET_PICKER_DIRECTORY_OPTIONS = [
  { id: 'all', label: '全部资产', desc: '所有可引用素材', match: () => true },
  ...flattenPickerDirectories(ASSET_PICKER_DIRECTORY_TREE),
]

export const FINISHED_PICKER_FACETS = [
  { id: 'all', label: '全部成片', group: '成片范围' },
  { id: 'current_direction', label: '当前方向', group: '成片范围' },
  { id: 'recent_pending', label: '近期待观察', group: '成片范围' },
  { id: 'insufficient', label: '数据不足', group: '数据状态' },
  { id: 'billboard', label: '大字报成片', group: '内容类型' },
  { id: 'story_3d', label: '3D剧情成片', group: '内容类型' },
]

export const createVersionDrafts = (subVersions = [], goal = '') => {
  const source = subVersions.length ? subVersions : [{ version: '01', name: '新版本', testDirections: [] }]
  return source.map((item, index) => ({
    version: item.version,
    name: item.name || `版本 ${item.version}`,
    goal: goal || `${item.testDirections?.join(' / ') || '核心卖点'} 验证`,
    references: item.finishedReferenceIds?.length ? item.finishedReferenceIds : index % 2 === 0 ? ['PLAY-CORE-08'] : ['FR-LIVE-02'],
    attachments: index === 0 ? ['参考录屏'] : [],
    description: '',
    copywriting: '',
    landingId: '9:16',
    landingNote: '',
    matrixColumns: ['A段', 'B段'],
    matrixCells: {
      A段: { references: item.finishedReferenceIds || [], inserts: [], attachments: [], description: item.sourceRequirementId ? `自动引用原始需求 ${item.sourceRequirementId} 的成片作为本地化参考。` : '自动引用原始成片作为本地化参考。' },
      B段: { references: [], inserts: [], attachments: [], description: '' },
    },
  }))
}

export const getOptionById = (id) => [...ASSET_OPTIONS, ...FINISHED_OPTIONS, ...LANDING_OPTIONS].find((item) => item.id === id)

export const getReferenceSource = (id) => {
  if (String(id).startsWith('FIN-') || String(id).startsWith('fc-')) return '成片'
  if (ATTACHMENT_OPTIONS.includes(id)) return '附件'
  return '资产库'
}

export const getStatusLabel = (status) => {
  if (status === 'Recommended') return '推荐'
  if (status === 'Insufficient Data') return '数据不足'
  if (status === 'Pending Data') return '待观察'
  return status || '-'
}

export const filterPickerOptions = (options, facet, query) => {
  const normalizedQuery = query.trim().toLowerCase()
  return options.filter((item) => {
    if (facet === 'recommended' && item.status !== 'Recommended') return false
    if (facet === 'current_direction' && !item.isCurrentDirection && !`${item.type}${item.directionGroup}`.includes('当前方向')) return false
    if (facet === 'recent_pending' && !`${item.type}${item.status}`.includes('近期待观察') && item.status !== 'Pending Data') return false
    if (facet === 'insufficient' && item.status !== 'Insufficient Data') return false
    if (facet === 'billboard' && !`${item.name}${item.type}${item.directionGroup}`.includes('大字报') && !`${item.name}${item.type}`.includes('口播')) return false
    if (facet === 'story_3d' && !`${item.name}${item.type}${item.directionGroup}`.includes('3D') && !`${item.name}${item.type}`.includes('剧情')) return false
    if (facet === 'segment_a' && !`${item.name}${item.type}`.includes('A段') && !`${item.name}${item.type}`.includes('前贴')) return false
    if (facet === 'segment_mid' && !`${item.name}${item.type}`.includes('玩法') && !`${item.name}${item.type}`.includes('中间段')) return false
    if (facet === 'segment_b' && !`${item.name}${item.type}`.includes('B段') && !`${item.name}${item.type}`.includes('大字报')) return false
    if (facet === 'image' && !`${item.name}${item.type}`.includes('图片') && !`${item.name}${item.type}`.includes('商店图')) return false
    if (facet === 'ice' && !`${item.name}${item.type}`.includes('冰雪') && !`${item.name}${item.type}`.includes('仙子')) return false
    if (facet === 'live' && !`${item.name}${item.type}`.includes('真人') && !`${item.name}${item.type}`.includes('爆奖') && !`${item.name}${item.type}`.includes('反应')) return false
    if (facet === 'reward' && !`${item.name}${item.type}`.includes('宝箱') && !`${item.name}${item.type}`.includes('奖励')) return false
    if (facet === 'merge' && !`${item.name}${item.type}`.includes('合成') && !`${item.name}${item.type}`.includes('升级') && !`${item.name}${item.type}`.includes('塔防')) return false
    if (facet === 'copy_text' && !`${item.name}${item.type}`.includes('大字报') && !`${item.name}${item.type}`.includes('震颤') && !`${item.name}${item.type}`.includes('提词')) return false
    if (!normalizedQuery) return true
    return [item.id, item.name, item.type, item.status, item.directionGroup].join(' ').toLowerCase().includes(normalizedQuery)
  })
}
