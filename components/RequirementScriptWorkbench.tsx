import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Check,
  Copy,
  Folder,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { Requirement, AssetVersionItem } from '../types';

type ScriptTemplate = 'same_a' | 'same_b' | 'matrix';
type SegmentKind = 'A段' | '中间段' | 'B段' | '片头' | '玩法段' | '大字报' | 'CTA' | '试玩' | '图片';

interface VersionDraft {
  version: string;
  name: string;
  goal: string;
  references: string[];
  attachments: string[];
  description: string;
  copywriting: string;
}

interface SegmentDraft {
  id: string;
  kind: SegmentKind;
  title: string;
  duration: string;
  references: string[];
  attachments?: string[];
  description: string;
}

interface SelectableOption {
  id: string;
  name: string;
  type: string;
  duration: string;
  status: string;
  previewUrl: string;
}

interface PickerFacet {
  id: string;
  label: string;
  group: string;
  match: (item: SelectableOption) => boolean;
}

interface PickerDirectory {
  id: string;
  label: string;
  desc: string;
  match: (item: SelectableOption) => boolean;
}

interface PickerDirectoryNode {
  id: string;
  label: string;
  desc?: string;
  match: (item: SelectableOption) => boolean;
  children?: PickerDirectoryNode[];
}

type AssetPickerTarget = {
  mode: 'asset' | 'finished' | 'landing';
  type: 'simple' | 'shared' | 'version' | 'matrix';
  version?: string;
  segmentId?: string;
  field?: 'reference' | 'insert';
};

interface RequirementScriptWorkbenchProps {
  requirement: Requirement;
  onRequirementChange: (requirement: Requirement) => void;
  subVersions: AssetVersionItem[];
}

const TEMPLATE_CONFIGS: Array<{
  id: ScriptTemplate;
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  { id: 'same_a', label: '相同A段', desc: '新做片头或A段，批量接已有B段', icon: Play },
  { id: 'same_b', label: '相同B段', desc: '复用统一B段，批量测试不同A段', icon: Copy },
  { id: 'matrix', label: '自由模板', desc: '按版本自由拼接 A/B/C/D 段', icon: Layers }
];

const ASSET_OPTIONS: SelectableOption[] = [
  { id: 'FR-AI-01', name: 'AI前贴-冰雪仙子神秘空投', type: 'A段', duration: '00:05', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&h=640&fit=crop' },
  { id: 'FR-LIVE-02', name: '真人前贴-爆奖反应', type: 'A段', duration: '00:04', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop' },
  { id: 'PLAY-CORE-08', name: '玩法段-塔防合成升级展示', type: '中间段', duration: '00:08', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480&h=640&fit=crop' },
  { id: 'BILL-CLASSIC-03', name: '大字报B段-震颤提词', type: 'B段', duration: '00:03', status: 'Insufficient Data', previewUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=480&h=640&fit=crop' },
  { id: 'CTA-REWARD-02', name: 'CTA-宝箱十连抽', type: 'CTA', duration: '00:02', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=640&fit=crop' },
  { id: 'IMG-STORE-06', name: '商店图-主视觉竖版', type: '图片', duration: '-', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=480&h=640&fit=crop' }
];

const FINISHED_OPTIONS: SelectableOption[] = [
  { id: 'FIN-3683-01', name: '3683口播大字报换山下湖泊背景', type: '成片 / 当前方向', duration: '00:22', status: 'Pending Data', previewUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=480&h=640&fit=crop' },
  { id: 'FIN-3684-02', name: '3684口播大字报换蔚蓝海滩背景', type: '成片 / 当前方向', duration: '00:21', status: 'Pending Data', previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=480&h=640&fit=crop' },
  { id: 'FIN-3370-01', name: '吸量大字报-爆金币转场成片', type: '成片 / 近期待观察', duration: '00:18', status: 'Insufficient Data', previewUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=480&h=640&fit=crop' },
  { id: 'FIN-3366-03', name: '3D剧情-冰原Boss压迫感成片', type: '成片 / 已初投', duration: '00:26', status: 'Pending Data', previewUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=480&h=640&fit=crop' },
];

const ATTACHMENT_OPTIONS = ['参考录屏', '口播音频', '竞品截图', '玩法录屏', 'UI线框', '翻译表'];
const LANDING_OPTIONS: SelectableOption[] = [
  { id: '9:16', name: '9:16 竖版视频', type: '视频落版', duration: '主规格', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480&h=640&fit=crop' },
  { id: '1:1', name: '1:1 信息流方版', type: '视频落版', duration: '补充', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=480&h=640&fit=crop' },
  { id: '16:9', name: '16:9 横版视频', type: '视频落版', duration: '补充', status: 'Insufficient Data', previewUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=480&h=640&fit=crop' },
  { id: '4:5', name: '4:5 Feed 版', type: '视频落版', duration: '补充', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop' }
];

const pickerMatchTerms = (terms: string[]) => (item: SelectableOption) => {
  const content = [item.id, item.name, item.type, item.status].join(' ').toLowerCase();
  return terms.some(term => content.includes(term.toLowerCase()));
};

const ASSET_PICKER_FACETS: PickerFacet[] = [
  { id: 'all', label: '全部资产', group: '热门推荐', match: () => true },
  { id: 'recommended', label: '推荐资产', group: '热门推荐', match: item => item.status === 'Recommended' },
  { id: 'segment_a', label: '前贴 / A段', group: '资源类型', match: pickerMatchTerms(['A段', '前贴']) },
  { id: 'segment_mid', label: '玩法 / 中间段', group: '资源类型', match: pickerMatchTerms(['中间段', '玩法']) },
  { id: 'segment_b', label: 'B段 / 大字报', group: '资源类型', match: pickerMatchTerms(['B段', '大字报']) },
  { id: 'image', label: '图片视觉', group: '资源类型', match: pickerMatchTerms(['图片', '商店图']) },
  { id: 'ice', label: '冰雪极地', group: '主题题材', match: pickerMatchTerms(['冰雪', '仙子']) },
  { id: 'live', label: '真人反应', group: '主题题材', match: pickerMatchTerms(['真人', '爆奖', '反应']) },
  { id: 'reward', label: '奖励爆点', group: '主题题材', match: pickerMatchTerms(['宝箱', '奖励']) },
  { id: 'merge', label: '合成升级', group: '玩法机制', match: pickerMatchTerms(['合成', '升级', '塔防']) },
  { id: 'copy_text', label: '强文案吸睛', group: '玩法机制', match: pickerMatchTerms(['大字报', '震颤', '提词']) },
  { id: 'insufficient', label: '数据不足', group: '关键词状态', match: item => item.status === 'Insufficient Data' },
];

const FINISHED_PICKER_FACETS: PickerFacet[] = [
  { id: 'all', label: '全部成片', group: '成片范围', match: () => true },
  { id: 'current_direction', label: '当前方向', group: '成片范围', match: pickerMatchTerms(['当前方向']) },
  { id: 'recent_pending', label: '近期待观察', group: '成片范围', match: pickerMatchTerms(['近期待观察', 'Pending Data']) },
  { id: 'insufficient', label: '数据不足', group: '数据状态', match: item => item.status === 'Insufficient Data' },
  { id: 'billboard', label: '大字报成片', group: '内容类型', match: pickerMatchTerms(['大字报', '口播']) },
  { id: 'story_3d', label: '3D剧情成片', group: '内容类型', match: pickerMatchTerms(['3D', '剧情', 'Boss']) },
];

const ASSET_PICKER_DIRECTORIES: PickerDirectory[] = [
  { id: 'all', label: '全部资产', desc: '所有可引用素材', match: () => true },
];

const ASSET_PICKER_DIRECTORY_TREE: PickerDirectoryNode[] = [
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
      { id: 'scene_component', label: '场景', desc: '场景和背景', match: pickerMatchTerms(['场景', '背景', '商店图']) },
      { id: 'merge_component', label: '合成链', desc: '玩法合成链', match: pickerMatchTerms(['合成链', '合成', '升级']) },
      { id: 'ui_component', label: 'UI', desc: '界面与面板', match: pickerMatchTerms(['UI', '面板', '弹窗']) },
      { id: 'fx_component', label: '特效', desc: '粒子和反馈', match: pickerMatchTerms(['特效', '粒子']) },
      { id: 'sfx_component', label: '音效', desc: '音效反馈', match: pickerMatchTerms(['音效']) },
      { id: 'bgm_component', label: 'BGM', desc: '音乐素材', match: pickerMatchTerms(['BGM', '音乐']) },
      { id: 'character_component', label: '人物形象', desc: '角色形象', match: pickerMatchTerms(['人物', '形象', '真人', '仙子']) },
      { id: 'animal_component', label: '动物形象', desc: '动物或怪物形象', match: pickerMatchTerms(['动物', '怪物']) },
    ],
  },
];

const flattenPickerDirectories = (nodes: PickerDirectoryNode[]): PickerDirectory[] => (
  nodes.flatMap(node => [
    { id: node.id, label: node.label, desc: node.desc || '', match: node.match },
    ...(node.children ? flattenPickerDirectories(node.children) : [])
  ])
);

const ASSET_PICKER_DIRECTORY_OPTIONS = [
  ...ASSET_PICKER_DIRECTORIES,
  ...flattenPickerDirectories(ASSET_PICKER_DIRECTORY_TREE)
];

const createVersionDrafts = (subVersions: AssetVersionItem[], goal: string): VersionDraft[] => {
  const source = subVersions.length ? subVersions : [{ version: '01', name: '新版本', testDirections: [] }];
  return source.map((item, index) => ({
    version: item.version,
    name: item.name || `版本 ${item.version}`,
    goal: goal || `${item.testDirections?.join(' / ') || '核心卖点'} 验证`,
    references: index % 2 === 0 ? ['PLAY-CORE-08'] : ['FR-LIVE-02'],
    attachments: index === 0 ? ['参考录屏'] : [],
    description: '',
    copywriting: ''
  }));
};

const getSelectableOption = (id: string, options: SelectableOption[]) => options.find(option => option.id === id);
const getReferenceOption = (id: string) => getSelectableOption(id, ASSET_OPTIONS) || getSelectableOption(id, FINISHED_OPTIONS);
const getReferenceSource = (id: string): 'asset' | 'finished' => (
  getSelectableOption(id, FINISHED_OPTIONS) ? 'finished' : 'asset'
);
const uniqueIds = (ids: string[]) => Array.from(new Set(ids));
const createDefaultMatrixColumns = () => ['A段', 'B段'];
const getNextMatrixColumn = (columns: string[]) => (
  Array.from({ length: 24 }, (_, index) => `${String.fromCharCode(65 + index)}段`)
    .find(column => !columns.includes(column)) || `新增段${columns.length + 1}`
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">{children}</label>
);

const RichTextMock = ({ placeholder, value, onChange, compact = false }: { placeholder: string; value: string; onChange: (value: string) => void; compact?: boolean }) => (
  <div className={`h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-3xs ${compact ? 'min-h-[168px]' : 'min-h-[178px]'}`}>
    <div className="flex h-10 items-center gap-5 border-b border-slate-100 bg-slate-50/70 px-6 text-sm font-black text-slate-400">
      <span>B</span>
      <span className="italic">I</span>
      <span className="underline">U</span>
      <span className="line-through">S</span>
      <span>A⌄</span>
      <span className="h-5 w-px bg-slate-100" />
      <span>🔗</span>
      <span>•≡</span>
      <span>1≡</span>
      <span>▸</span>
      <span>◂</span>
      <span>⌫</span>
    </div>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[calc(100%-40px)] w-full resize-none px-5 py-4 text-xs font-bold leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
      placeholder={placeholder}
    />
  </div>
);

const ReferenceThumb = ({
  id,
  index,
  source,
  onRemove
}: {
  id: string;
  index: number;
  source: 'asset' | 'finished' | 'attachment';
  onRemove: () => void;
}) => {
  const reference = source !== 'attachment' ? getReferenceOption(id) : undefined;
  const title = reference?.name || id;
  const previewUrl = reference?.previewUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=360&h=360&fit=crop';
  const sourceLabel = source === 'asset' ? '资产库' : source === 'finished' ? '成片' : '附件';
  const sourceClassName = source === 'finished' ? 'text-emerald-600' : 'text-indigo-600';

  return (
    <div className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-3xs">
      <img src={previewUrl} alt={title} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-1.5 pb-1.5 pt-5">
        <p className="truncate text-[8px] font-black text-white">{title}</p>
      </div>
      <span className="absolute bottom-1 right-1 rounded-md bg-rose-400 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">
        参考{index}
      </span>
      <span className={`absolute left-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[8px] font-black shadow-sm ${sourceClassName}`}>
        {sourceLabel}
      </span>
      <button type="button" onClick={onRemove} className="absolute right-1 top-1 rounded-full bg-white p-1 text-slate-300 opacity-0 shadow-sm transition-all hover:text-rose-500 group-hover:opacity-100">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

const ReferenceResourceBox = ({
  assetIds,
  attachments = [],
  onPickAssets,
  onPickFinished,
  onUploadReference,
  onRemoveAsset,
  onToggleAttachment,
  disabled = false,
  compact = false,
  hideLabel = false
}: {
  assetIds: string[];
  attachments?: string[];
  onPickAssets: () => void;
  onPickFinished: () => void;
  onUploadReference?: () => void;
  onRemoveAsset: (id: string) => void;
  onToggleAttachment?: (name: string) => void;
  disabled?: boolean;
  compact?: boolean;
  hideLabel?: boolean;
}) => {
  const normalizedAssetIds = uniqueIds(assetIds);
  const references = [
    ...normalizedAssetIds.map(id => ({ id, source: getReferenceSource(id) })),
    ...attachments.map(id => ({ id, source: 'attachment' as const }))
  ];
  const visibleReferences = compact ? references.slice(0, 6) : references;
  const hiddenCount = references.length - visibleReferences.length;

  if (disabled) {
    return (
      <div className={`flex items-center justify-center border border-dashed border-slate-200 bg-[repeating-linear-gradient(135deg,#fafafa_0,#fafafa_8px,#f5f5f5_8px,#f5f5f5_16px)] text-sm font-black text-slate-300 ${compact ? 'min-h-[150px]' : 'min-h-[240px]'}`}>
        不加A段
      </div>
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-dashed border-sky-200 bg-white ${compact ? 'min-h-[168px]' : 'h-full min-h-[260px]'}`}>
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        {hideLabel ? <span /> : <FieldLabel>需求参考</FieldLabel>}
        <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-400">{references.length} 项</span>
      </div>
      <div className={`flex flex-1 px-3 py-3 ${references.length > 0 ? 'items-start' : 'items-center justify-center'}`}>
        {references.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {visibleReferences.map((item, index) => (
              <ReferenceThumb
                key={`${item.source}-${item.id}`}
                id={item.id}
                index={index + 1}
                source={item.source}
                onRemove={() => item.source === 'attachment' ? onToggleAttachment?.(item.id) : onRemoveAsset(item.id)}
              />
            ))}
            {hiddenCount > 0 && (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-indigo-100 bg-indigo-50/40 text-[10px] font-black text-indigo-500">
                +{hiddenCount}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className={`${compact ? 'text-[11px]' : 'text-sm'} font-black text-slate-300`}>拖拽/粘贴上传</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-200">Segment Preview</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50/80 p-3">
        <button type="button" onClick={onUploadReference} className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 hover:border-slate-300 hover:bg-slate-50">
          上传
        </button>
        <button type="button" onClick={onPickAssets} className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] font-black text-indigo-600 hover:bg-indigo-100">
          引用资产库
        </button>
        <button type="button" onClick={onPickFinished} className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-600 hover:bg-emerald-100">
          引用成片
        </button>
      </div>
    </div>
  );
};

const CtaSelectionSlot = ({
  selected,
  onPick,
  onClear,
  description,
  onDescriptionChange,
  hideLabel = false
}: {
  selected?: string;
  onPick: () => void;
  onClear: () => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  hideLabel?: boolean;
}) => {
  const item = selected ? getSelectableOption(selected, LANDING_OPTIONS) : undefined;
  return (
    <div className="space-y-2">
      <div className="flex min-h-[168px] flex-col rounded-xl border border-dashed border-sky-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          {hideLabel ? <span /> : <FieldLabel>CTA / 落版</FieldLabel>}
          <button type="button" onClick={onPick} className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-600 hover:bg-indigo-100">
            {item ? '更换' : '选择'}
          </button>
        </div>
        {item ? (
          <div className="group mt-3 flex flex-1 items-center gap-3">
            <img src={item.previewUrl} alt={item.name} className="h-12 w-10 shrink-0 rounded-lg object-cover shadow-3xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-black text-slate-800">{item.name}</p>
              <p className="mt-1 text-[9px] font-bold text-slate-400">{item.type} / {item.duration}</p>
            </div>
            <button type="button" onClick={onClear} className="rounded-full p-1 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-1 items-center text-[10px] font-black text-slate-300">
            未选择落版
          </div>
        )}
      </div>
      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        className="h-16 w-full resize-none rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-slate-700 outline-none focus:border-indigo-300 focus:bg-white"
        placeholder="补充 CTA / 落版要求..."
      />
    </div>
  );
};

const RequirementScriptWorkbench: React.FC<RequirementScriptWorkbenchProps> = ({
  requirement,
  onRequirementChange,
  subVersions
}) => {
  const [template, setTemplate] = useState<ScriptTemplate>(() => {
    if (requirement.template?.includes('A段')) return 'same_a';
    return 'matrix';
  });
  const [versionDrafts, setVersionDrafts] = useState<VersionDraft[]>(() => createVersionDrafts(subVersions, requirement.goal));
  const [sharedSegment, setSharedSegment] = useState<SegmentDraft>({
    id: 'shared-new',
    kind: 'A段',
    title: '新做核心片段',
    duration: '0-5s',
    references: [],
    attachments: [],
    description: ''
  });
  const [showLegacyScript, setShowLegacyScript] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState<AssetPickerTarget | null>(null);
  const [assetPickerSearch, setAssetPickerSearch] = useState('');
  const [assetPickerFacetId, setAssetPickerFacetId] = useState('all');
  const [assetPickerDirectoryId, setAssetPickerDirectoryId] = useState('all');
  const [expandedPickerDirectoryIds, setExpandedPickerDirectoryIds] = useState<string[]>(['fragment', 'pre_hook', 'component']);
  const [landingByVersion, setLandingByVersion] = useState<Record<string, string>>(() => (
    Object.fromEntries(createVersionDrafts(subVersions, requirement.goal).map(item => [item.version, '9:16']))
  ));
  const [landingNotesByVersion, setLandingNotesByVersion] = useState<Record<string, string>>({});
  const [simpleReferences, setSimpleReferences] = useState<string[]>([]);
  const [simpleAttachments, setSimpleAttachments] = useState<string[]>([]);
  const [matrixColumnsByVersion, setMatrixColumnsByVersion] = useState<Record<string, string[]>>(() => (
    Object.fromEntries(createVersionDrafts(subVersions, requirement.goal).map(item => [item.version, createDefaultMatrixColumns()]))
  ));
  const [matrixCells, setMatrixCells] = useState<Record<string, { references: string[]; inserts: string[]; attachments: string[]; description: string }>>({});

  const getDefaultPickerFacet = (target: AssetPickerTarget | null) => {
    if (!target || target.mode !== 'asset') return 'all';
    if (requirement.assetType === 'Image') return 'scene_component';
    if (requirement.assetType === 'Playable') return 'segment_mid';

    if (target.type === 'shared') {
      return template === 'same_b' ? 'segment_b' : 'segment_a';
    }

    const segment = target.segmentId || '';
    if (segment === 'A段' || segment.startsWith('A')) return 'segment_a';
    if (segment === 'B段' || segment.startsWith('B') || segment.includes('大字报')) return 'segment_b';
    if (segment.includes('玩法') || segment.includes('中间') || segment.startsWith('C') || segment.startsWith('D')) return 'segment_mid';
    return 'all';
  };

  const getDefaultPickerDirectory = (target: AssetPickerTarget | null) => {
    if (!target || target.mode !== 'asset') return 'all';
    if (requirement.assetType === 'Image') return 'image';
    if (requirement.assetType === 'Playable') return 'play_segment';

    if (target.type === 'shared') {
      return template === 'same_b' ? 'billboard_segment' : 'pre_hook';
    }

    const segment = target.segmentId || '';
    if (segment === 'A段' || segment.startsWith('A')) return 'pre_hook';
    if (segment === 'B段' || segment.startsWith('B') || segment.includes('大字报')) return 'billboard_segment';
    if (segment.includes('玩法') || segment.includes('中间') || segment.startsWith('C') || segment.startsWith('D')) return 'play_segment';
    return 'all';
  };

  useEffect(() => {
    if (assetPickerTarget?.mode === 'asset') {
      setAssetPickerSearch('');
      setAssetPickerFacetId(getDefaultPickerFacet(assetPickerTarget));
      setAssetPickerDirectoryId(getDefaultPickerDirectory(assetPickerTarget));
    } else if (assetPickerTarget?.mode === 'finished') {
      setAssetPickerSearch('');
      setAssetPickerFacetId('all');
    }
  }, [assetPickerTarget, requirement.assetType, template]);

  const updateVersion = (version: string, patch: Partial<VersionDraft>) => {
    setVersionDrafts(prev => prev.map(item => item.version === version ? { ...item, ...patch } : item));
    if (patch.name !== undefined) {
      onRequirementChange({
        ...requirement,
        subVersions: (requirement.subVersions || subVersions).map(item => item.version === version ? { ...item, name: patch.name || item.name } : item)
      });
    }
  };

  const addVersion = () => {
    const next = String(Math.max(0, ...versionDrafts.map(item => Number(item.version) || 0)) + 1).padStart(2, '0');
    const nextVersion = {
      version: next,
      name: '',
      goal: '',
      references: [],
      attachments: [],
      description: '',
      copywriting: ''
    };
    setVersionDrafts(prev => [...prev, nextVersion]);
    setMatrixColumnsByVersion(prev => ({ ...prev, [next]: createDefaultMatrixColumns() }));
    onRequirementChange({
      ...requirement,
      subVersions: [...(requirement.subVersions || subVersions), { version: next, name: '', testDirections: requirement.testDirections || [] }]
    });
  };

  const duplicateVersion = (version: VersionDraft) => {
    const next = String(Math.max(0, ...versionDrafts.map(item => Number(item.version) || 0)) + 1).padStart(2, '0');
    const nextVersion: VersionDraft = {
      ...version,
      version: next,
      references: [...version.references],
      attachments: [...version.attachments]
    };
    setVersionDrafts(prev => [...prev, nextVersion]);
    setMatrixColumnsByVersion(prev => ({ ...prev, [next]: [...(prev[version.version] || createDefaultMatrixColumns())] }));
    setLandingByVersion(prev => version.version in prev ? { ...prev, [next]: prev[version.version] } : prev);
    setLandingNotesByVersion(prev => version.version in prev ? { ...prev, [next]: prev[version.version] } : prev);
    setMatrixCells(prev => {
      const nextCells = { ...prev };
      Object.entries(prev).forEach(([key, value]) => {
        const [sourceVersion, ...columnParts] = key.split('-');
        if (sourceVersion === version.version) {
          nextCells[`${next}-${columnParts.join('-')}`] = {
            references: [...value.references],
            inserts: [...value.inserts],
            attachments: [...value.attachments],
            description: value.description
          };
        }
      });
      return nextCells;
    });
    onRequirementChange({
      ...requirement,
      subVersions: [...(requirement.subVersions || subVersions), { version: next, name: version.name, testDirections: requirement.testDirections || [] }]
    });
  };

  const deleteVersion = (version: string) => {
    const nextVersionDrafts = versionDrafts.filter(item => item.version !== version);
    if (nextVersionDrafts.length === versionDrafts.length || nextVersionDrafts.length === 0) return;
    setVersionDrafts(nextVersionDrafts);
    setLandingByVersion(prev => {
      const next = { ...prev };
      delete next[version];
      return next;
    });
    setLandingNotesByVersion(prev => {
      const next = { ...prev };
      delete next[version];
      return next;
    });
    setMatrixCells(prev => (
      Object.fromEntries(Object.entries(prev).filter(([key]) => key.split('-')[0] !== version))
    ));
    setMatrixColumnsByVersion(prev => {
      const next = { ...prev };
      delete next[version];
      return next;
    });
    onRequirementChange({
      ...requirement,
      subVersions: (requirement.subVersions || subVersions).filter(item => item.version !== version)
    });
  };

  const getMatrixCell = (version: string, column: string) => (
    matrixCells[`${version}-${column}`] || { references: [], inserts: [], attachments: [], description: '' }
  );

  const updateMatrixCell = (version: string, column: string, patch: Partial<{ references: string[]; inserts: string[]; attachments: string[]; description: string }>) => {
    const key = `${version}-${column}`;
    const current = getMatrixCell(version, column);
    setMatrixCells(prev => ({ ...prev, [key]: { ...current, ...patch } }));
  };

  const getMatrixColumns = (version: string) => matrixColumnsByVersion[version] || createDefaultMatrixColumns();

  const addMatrixColumn = (version: string, afterIndex: number) => {
    setMatrixColumnsByVersion(prev => {
      const current = prev[version] || createDefaultMatrixColumns();
      const nextColumn = getNextMatrixColumn(current);
      return {
        ...prev,
        [version]: [
          ...current.slice(0, afterIndex + 1),
          nextColumn,
          ...current.slice(afterIndex + 1)
        ]
      };
    });
  };

  const deleteMatrixColumn = (version: string, column: string) => {
    if (column === 'B段') return;
    setMatrixColumnsByVersion(prev => ({
      ...prev,
      [version]: (prev[version] || createDefaultMatrixColumns()).filter(item => item !== column)
    }));
    setMatrixCells(prev => (
      Object.fromEntries(Object.entries(prev).filter(([key]) => {
        const [cellVersion, ...columnParts] = key.split('-');
        return !(cellVersion === version && columnParts.join('-') === column);
      }))
    ));
  };

  const toggleIds = (current: string[], id: string) => (
    current.includes(id) ? current.filter(item => item !== id) : [...current, id]
  );

  const appendMockAttachment = (current: string[]) => {
    const next = ATTACHMENT_OPTIONS.find(item => !current.includes(item)) || `上传参考 ${current.length + 1}`;
    return [...current, next];
  };

  const handlePickAsset = (assetId: string) => {
    if (!assetPickerTarget) return;
    if (assetPickerTarget.type === 'simple') {
      if (assetPickerTarget.version) {
        const version = versionDrafts.find(item => item.version === assetPickerTarget.version);
        updateVersion(assetPickerTarget.version, {
          references: toggleIds(version?.references || [], assetId)
        });
      } else {
        setSimpleReferences(prev => toggleIds(prev, assetId));
      }
    } else if (assetPickerTarget.type === 'shared') {
      setSharedSegment(prev => ({
        ...prev,
        references: toggleIds(prev.references, assetId)
      }));
    } else if (assetPickerTarget.version) {
      if (assetPickerTarget.type === 'matrix' && assetPickerTarget.segmentId) {
        const cell = getMatrixCell(assetPickerTarget.version, assetPickerTarget.segmentId);
        if (assetPickerTarget.field === 'insert') {
          updateMatrixCell(assetPickerTarget.version, assetPickerTarget.segmentId, { inserts: toggleIds(cell.inserts, assetId) });
        } else {
          updateMatrixCell(assetPickerTarget.version, assetPickerTarget.segmentId, { references: toggleIds(cell.references, assetId) });
        }
      } else if (assetPickerTarget.mode === 'landing') {
        setLandingByVersion(prev => ({ ...prev, [assetPickerTarget.version!]: assetId }));
        setAssetPickerTarget(null);
      } else {
        const version = versionDrafts.find(item => item.version === assetPickerTarget.version);
        const current = version?.references || [];
        updateVersion(assetPickerTarget.version, {
          references: toggleIds(current, assetId)
        });
      }
    }
  };

  const getPickerOptions = () => {
    if (assetPickerTarget?.mode === 'landing') return LANDING_OPTIONS;
    const optionPool = assetPickerTarget?.mode === 'finished' ? FINISHED_OPTIONS : ASSET_OPTIONS;
    const facetPool = assetPickerTarget?.mode === 'finished' ? FINISHED_PICKER_FACETS : ASSET_PICKER_FACETS;
    const activeFacet = facetPool.find(item => item.id === assetPickerFacetId) || facetPool[0];
    const activeDirectory = ASSET_PICKER_DIRECTORY_OPTIONS.find(item => item.id === assetPickerDirectoryId) || ASSET_PICKER_DIRECTORY_OPTIONS[0];
    const query = assetPickerSearch.trim().toLowerCase();
    return optionPool.filter(asset => {
      if (assetPickerTarget?.mode === 'asset' && !activeDirectory.match(asset)) return false;
      const matchesFacet = activeFacet.match(asset);
      if (!matchesFacet) return false;
      if (!query) return true;
      return [asset.id, asset.name, asset.type, asset.status].join(' ').toLowerCase().includes(query);
    });
  };

  const getPickerFacetCounts = () => (
    (assetPickerTarget?.mode === 'finished' ? FINISHED_PICKER_FACETS : ASSET_PICKER_FACETS).reduce<Record<string, number>>((acc, facet) => {
      const activeDirectory = ASSET_PICKER_DIRECTORY_OPTIONS.find(item => item.id === assetPickerDirectoryId) || ASSET_PICKER_DIRECTORY_OPTIONS[0];
      const optionPool = assetPickerTarget?.mode === 'finished' ? FINISHED_OPTIONS : ASSET_OPTIONS;
      acc[facet.id] = optionPool.filter(item => (assetPickerTarget?.mode !== 'asset' || activeDirectory.match(item)) && facet.match(item)).length;
      return acc;
    }, {})
  );

  const getPickerDirectoryCounts = () => (
    ASSET_PICKER_DIRECTORY_OPTIONS.reduce<Record<string, number>>((acc, directory) => {
      acc[directory.id] = ASSET_OPTIONS.filter(directory.match).length;
      return acc;
    }, {})
  );

  const getPickerSelectedIds = () => {
    if (!assetPickerTarget) return [];
    if (assetPickerTarget.type === 'simple') {
      if (assetPickerTarget.version) {
        return versionDrafts.find(item => item.version === assetPickerTarget.version)?.references || [];
      }
      return simpleReferences;
    }
    if (assetPickerTarget.type === 'shared') return sharedSegment.references;
    if (!assetPickerTarget.version) return [];
    if (assetPickerTarget.type === 'matrix' && assetPickerTarget.segmentId) {
      const cell = getMatrixCell(assetPickerTarget.version, assetPickerTarget.segmentId);
      return assetPickerTarget.field === 'insert' ? cell.inserts : cell.references;
    }
    if (assetPickerTarget.mode === 'landing') return landingByVersion[assetPickerTarget.version] ? [landingByVersion[assetPickerTarget.version]] : [];
    return versionDrafts.find(item => item.version === assetPickerTarget.version)?.references || [];
  };

  const renderSimpleTemplate = () => {
    const isPlayable = requirement.assetType === 'Playable';
    const descriptionPlaceholder = isPlayable
      ? '描述试玩的核心玩法、交互流程、关键反馈、失败/成功状态和制作注意事项...'
      : '描述图片的画面构图、主体元素、文案重点、风格方向、尺寸适配和制作注意事项...';

    return (
      <section className="space-y-4">
        <div className="space-y-3">
          {versionDrafts.map((version, index) => (
            <div key={version.version} className="overflow-hidden border-t border-slate-200 bg-white pt-4">
              <div className="flex flex-wrap items-end gap-3 px-1 pb-4">
                <span className="shrink-0 rounded-lg bg-indigo-500 px-3 py-1.5 text-[10px] font-black text-white shadow-sm">
                  v{version.version}
                </span>
                <label className="min-w-[240px] flex-1 space-y-1">
                  <FieldLabel>版本名称</FieldLabel>
                  <input
                    value={version.name}
                    onChange={(event) => updateVersion(version.version, { name: event.target.value })}
                    className="w-full rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white"
                    placeholder="填写版本名称"
                  />
                </label>
                <label className="min-w-[240px] flex-1 space-y-1">
                  <FieldLabel>验证目标</FieldLabel>
                  <input
                    value={version.goal}
                    onChange={(event) => updateVersion(version.version, { goal: event.target.value })}
                    className="w-full rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white"
                    placeholder="填写这一版要验证的卖点、画面或交互目标"
                  />
                </label>
                <button type="button" onClick={() => duplicateVersion(version)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" title="复制版本">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {index > 0 && (
                  <button type="button" onClick={() => deleteVersion(version.version)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-300 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500" title="删除版本">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 px-1 pb-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]">
                <ReferenceResourceBox
                  assetIds={version.references}
                  attachments={version.attachments}
                  compact
                  onUploadReference={() => updateVersion(version.version, { attachments: appendMockAttachment(version.attachments) })}
                  onPickAssets={() => setAssetPickerTarget({ mode: 'asset', type: 'simple', version: version.version })}
                  onPickFinished={() => setAssetPickerTarget({ mode: 'finished', type: 'simple', version: version.version })}
                  onRemoveAsset={(id) => updateVersion(version.version, { references: version.references.filter(ref => ref !== id) })}
                  onToggleAttachment={(item) => updateVersion(version.version, { attachments: version.attachments.filter(value => value !== item) })}
                />
                <RichTextMock
                  value={version.description}
                  onChange={(value) => updateVersion(version.version, { description: value })}
                  placeholder={descriptionPlaceholder}
                  compact
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addVersion}
            className="flex min-h-[76px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-xs font-black text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4" />
            新增版本
          </button>
        </div>
      </section>
    );
  };

  const renderSharedRequirement = (segmentLabel: 'A段' | 'B段') => (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-800">{segmentLabel}需求</h4>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.95fr)_minmax(360px,1fr)]">
        <ReferenceResourceBox
          assetIds={sharedSegment.references}
          attachments={sharedSegment.attachments || []}
          onUploadReference={() => setSharedSegment(prev => ({ ...prev, attachments: appendMockAttachment(prev.attachments || []) }))}
          onPickAssets={() => setAssetPickerTarget({ mode: 'asset', type: 'shared' })}
          onPickFinished={() => setAssetPickerTarget({ mode: 'finished', type: 'shared' })}
          onRemoveAsset={(id) => setSharedSegment(prev => ({ ...prev, references: prev.references.filter(ref => ref !== id) }))}
          onToggleAttachment={(item) => setSharedSegment(prev => ({ ...prev, attachments: (prev.attachments || []).filter(value => value !== item) }))}
        />
        <RichTextMock
          value={sharedSegment.description}
          onChange={(value) => setSharedSegment(prev => ({ ...prev, description: value }))}
          placeholder={`请在这里详细输入该${segmentLabel}落的创意脚本内容，包括画面表现、文案重点等...`}
        />
      </div>
    </div>
  );

  const renderVersionSegmentCard = (version: VersionDraft, index: number, disabled = false) => (
    <div key={version.version} className="flex min-h-[420px] w-[270px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-3">
        <span className="shrink-0 rounded-lg bg-indigo-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">v{version.version}</span>
        <input
          value={version.name}
          onChange={(event) => updateVersion(version.version, { name: event.target.value })}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white disabled:bg-slate-50/70"
          placeholder="版本名称"
        />
        <button type="button" onClick={() => duplicateVersion(version)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" title="复制版本">
          <Copy className="h-3.5 w-3.5" />
        </button>
        {index > 0 && (
          <button type="button" onClick={() => deleteVersion(version.version)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-300 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500" title="删除版本">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <ReferenceResourceBox
            assetIds={version.references}
            attachments={version.attachments}
            compact
            disabled={disabled}
            onUploadReference={() => updateVersion(version.version, { attachments: appendMockAttachment(version.attachments) })}
            onPickAssets={() => setAssetPickerTarget({ mode: 'asset', type: 'version', version: version.version })}
            onPickFinished={() => setAssetPickerTarget({ mode: 'finished', type: 'version', version: version.version })}
            onRemoveAsset={(id) => updateVersion(version.version, { references: version.references.filter(ref => ref !== id) })}
            onToggleAttachment={(item) => updateVersion(version.version, { attachments: version.attachments.filter(value => value !== item) })}
          />
      <textarea
        value={version.description}
        onChange={(event) => updateVersion(version.version, { description: event.target.value })}
        disabled={disabled}
        className="min-h-[118px] flex-1 resize-none border-t border-slate-100 bg-white px-4 py-3 text-xs font-bold leading-relaxed text-slate-600 outline-none placeholder:text-slate-300 disabled:bg-white"
        placeholder={disabled ? '' : '请输入描述...'}
      />
      {!disabled && (
        <div className="border-t border-slate-100 px-4 py-3">
          <CtaSelectionSlot
            selected={landingByVersion[version.version]}
            description={landingNotesByVersion[version.version] || ''}
            onDescriptionChange={(value) => setLandingNotesByVersion(prev => ({ ...prev, [version.version]: value }))}
            onPick={() => setAssetPickerTarget({ mode: 'landing', type: 'version', version: version.version })}
            onClear={() => setLandingByVersion(prev => {
              const next = { ...prev };
              delete next[version.version];
              return next;
            })}
          />
        </div>
      )}
    </div>
  );

  const renderAddVersionCard = () => (
    <button
      type="button"
      onClick={addVersion}
      className="flex min-h-[420px] w-[270px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-5xl font-light text-slate-300 transition-all hover:border-indigo-200 hover:text-indigo-400"
    >
      +
    </button>
  );

  const renderSameSegmentTemplate = () => {
    const isSameA = template === 'same_a';
    const topLabel = isSameA ? 'A段' : 'A段';
    const bottomLabel = isSameA ? 'B段需求' : 'B段需求';
    return (
      <section className="space-y-5">
        {isSameA ? (
          <>
            {renderSharedRequirement('A段')}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800">B段需求</h4>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
                {versionDrafts.map((version, index) => renderVersionSegmentCard(version, index))}
                {renderAddVersionCard()}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800">{topLabel}</h4>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
                {versionDrafts.map((version, index) => renderVersionSegmentCard(version, index, index === 0))}
                {renderAddVersionCard()}
              </div>
            </div>
            {renderSharedRequirement(bottomLabel.replace('需求', '') as 'A段' | 'B段')}
          </>
        )}
      </section>
    );
  };

  const renderFreeTemplate = () => (
    <section className="space-y-4">
      <div className="space-y-4">
        {versionDrafts.map((version, index) => (
          <div key={version.version} className="overflow-hidden border-t border-slate-200 bg-white pt-4">
            <div className="flex flex-wrap items-center gap-3 px-1 pb-4">
              <span className="shrink-0 rounded-xl bg-indigo-600 px-3 py-1.5 text-[11px] font-black text-white shadow-3xs">v{version.version}</span>
              <input
                value={version.name}
                onChange={(event) => updateVersion(version.version, { name: event.target.value })}
                className="min-w-[240px] flex-1 rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white"
                placeholder="填写版本名称"
              />
              <button type="button" onClick={() => duplicateVersion(version)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600" title="复制版本">
                <Copy className="h-4 w-4" />
              </button>
              {index > 0 && (
                <button type="button" onClick={() => deleteVersion(version.version)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-300 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500" title="删除版本">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto px-1 pb-4 no-scrollbar">
              <button
                type="button"
                onClick={() => addMatrixColumn(version.version, -1)}
                className="mt-24 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-indigo-200 bg-white text-indigo-500 transition-all hover:border-indigo-300 hover:bg-indigo-50"
                title="在最前面增加段落"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              {getMatrixColumns(version.version).map((column, index) => {
                const cell = getMatrixCell(version.version, column);
                return (
                  <React.Fragment key={`${version.version}-${column}`}>
                    <div className="w-[280px] shrink-0 space-y-2">
                      <div className="flex h-6 items-center justify-between">
                        <FieldLabel>{column}</FieldLabel>
                        {column !== 'B段' && (
                          <button type="button" onClick={() => deleteMatrixColumn(version.version, column)} className="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500" title="删除段落">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <ReferenceResourceBox
                        assetIds={uniqueIds([...cell.references, ...cell.inserts])}
                        attachments={cell.attachments}
                        compact
                        hideLabel
                        onUploadReference={() => updateMatrixCell(version.version, column, { attachments: appendMockAttachment(cell.attachments) })}
                        onPickAssets={() => setAssetPickerTarget({ mode: 'asset', type: 'matrix', version: version.version, segmentId: column, field: 'reference' })}
                        onPickFinished={() => setAssetPickerTarget({ mode: 'finished', type: 'matrix', version: version.version, segmentId: column, field: 'reference' })}
                        onRemoveAsset={(id) => updateMatrixCell(version.version, column, {
                          references: cell.references.filter(ref => ref !== id),
                          inserts: cell.inserts.filter(ref => ref !== id)
                        })}
                        onToggleAttachment={(item) => updateMatrixCell(version.version, column, { attachments: cell.attachments.filter(value => value !== item) })}
                      />
                      <textarea
                        value={cell.description}
                        onChange={(event) => updateMatrixCell(version.version, column, { description: event.target.value })}
                        className="h-16 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold leading-relaxed text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300"
                        placeholder="添加描述..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addMatrixColumn(version.version, index)}
                      className="mt-24 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-indigo-200 bg-white text-indigo-500 transition-all hover:border-indigo-300 hover:bg-indigo-50"
                      title="在这里增加段落"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </React.Fragment>
                );
              })}
              <div className="w-[280px] shrink-0 space-y-2">
                <div className="flex h-6 items-center justify-between">
                  <FieldLabel>CTA / 落版</FieldLabel>
                </div>
                <CtaSelectionSlot
                  selected={landingByVersion[version.version]}
                  description={landingNotesByVersion[version.version] || ''}
                  hideLabel
                  onDescriptionChange={(value) => setLandingNotesByVersion(prev => ({ ...prev, [version.version]: value }))}
                  onPick={() => setAssetPickerTarget({ mode: 'landing', type: 'version', version: version.version })}
                  onClear={() => setLandingByVersion(prev => {
                    const next = { ...prev };
                    delete next[version.version];
                    return next;
                  })}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addVersion}
          className="flex min-h-[76px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-xs font-black text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-500"
        >
          <Plus className="h-4 w-4" />
          新增版本
        </button>
      </div>
    </section>
  );

  const togglePickerDirectoryExpanded = (id: string) => {
    setExpandedPickerDirectoryIds(prev => (
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    ));
  };

  const renderPickerDirectoryNode = (node: PickerDirectoryNode, depth = 0): React.ReactNode => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expandedPickerDirectoryIds.includes(node.id);
    const isActive = assetPickerDirectoryId === node.id;
    const count = getPickerDirectoryCounts()[node.id] || 0;

    return (
      <div key={node.id} className="space-y-1">
        <div className={`flex items-center gap-1 ${depth > 0 ? 'pl-4' : ''}`}>
          <button
            type="button"
            onClick={() => hasChildren ? togglePickerDirectoryExpanded(node.id) : setAssetPickerDirectoryId(node.id)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
              hasChildren ? 'text-slate-400 hover:bg-white hover:text-slate-700' : 'text-slate-250'
            }`}
            title={hasChildren ? (isExpanded ? '收起目录' : '展开目录') : '选择目录'}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-slate-250" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setAssetPickerDirectoryId(node.id)}
            className={`min-w-0 flex-1 rounded-xl px-2.5 py-2 text-left transition-all ${
              isActive
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-black">{node.label}</span>
              <span className={`rounded-lg px-1.5 py-0.5 text-[9px] font-black ${isActive ? 'bg-indigo-50 text-indigo-500' : 'bg-white text-slate-300'}`}>
                {count}
              </span>
            </span>
            {node.desc && <span className="mt-0.5 block truncate text-[9px] font-bold text-slate-400">{node.desc}</span>}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map(child => renderPickerDirectoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {requirement.assetType === 'Video' ? (
        <>
          <section className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-400">布局模式：</span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_CONFIGS.map(item => {
                const active = template === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTemplate(item.id)}
                    className={`rounded-full border px-5 py-2 text-xs font-black transition-all ${
                      active ? 'border-indigo-500 bg-indigo-500 text-white shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          {(template === 'same_a' || template === 'same_b') ? renderSameSegmentTemplate() : (
            <section className="space-y-5">
              {renderFreeTemplate()}
              <div className="border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setShowLegacyScript(!showLegacyScript)} className="flex w-full items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-800">补充说明 / 原脚本文本</span>
                  </div>
                  <ArrowRight className={`h-4 w-4 text-slate-400 transition-transform ${showLegacyScript ? 'rotate-90' : ''}`} />
                </button>
                {showLegacyScript && (
                  <textarea
                    className="mt-4 h-40 w-full resize-none rounded-2xl border border-slate-150 bg-slate-50 px-4 py-3 text-xs font-bold leading-relaxed text-slate-700 outline-none focus:border-indigo-300 focus:bg-white"
                    value={requirement.script || ''}
                    onChange={(event) => onRequirementChange({ ...requirement, script: event.target.value })}
                    placeholder="可在这里保留无法结构化表达的补充脚本说明..."
                  />
                )}
              </div>
            </section>
          )}
        </>
      ) : renderSimpleTemplate()}
      {assetPickerTarget && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm">
          <div className={`flex h-[88vh] w-full flex-col overflow-hidden rounded-3xl border border-slate-150 bg-white shadow-2xl ${
            assetPickerTarget.mode === 'landing' ? 'max-w-5xl' : 'max-w-[1440px]'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {assetPickerTarget.mode === 'landing'
                    ? '选择 CTA / 落版'
                    : assetPickerTarget.mode === 'finished'
                      ? '引用成片'
                      : '引用资产库'}
                </h3>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  {assetPickerTarget.mode === 'landing'
                    ? 'CTA/落版为单选，选择新项会替换当前结果。'
                    : assetPickerTarget.mode === 'finished'
                      ? '成片引用可多选，适合选择最近提交但还没有明确数据结论的成片。'
                      : '资产库引用可多选，适合选择已经验证并沉淀的素材。'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-600">
                  已选 {getPickerSelectedIds().length}
                </span>
                <button type="button" onClick={() => setAssetPickerTarget(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className={`grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden ${
              assetPickerTarget.mode === 'landing'
                ? 'lg:grid-cols-[280px_minmax(0,1fr)]'
                : assetPickerTarget.mode === 'finished'
                  ? 'lg:grid-cols-[280px_minmax(0,1fr)]'
                  : 'lg:grid-cols-[220px_280px_minmax(0,1fr)]'
            }`}>
              {assetPickerTarget.mode === 'asset' && (
                <aside className="border-r border-slate-100 bg-slate-50/80 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">资产目录</p>
                    <button
                      type="button"
                      onClick={() => setAssetPickerDirectoryId('all')}
                      className={`rounded-lg px-2 py-1 text-[9px] font-black ${
                        assetPickerDirectoryId === 'all' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      全部 {getPickerDirectoryCounts().all || 0}
                    </button>
                  </div>
                  <div className="max-h-[66vh] space-y-1 overflow-y-auto pr-1 no-scrollbar">
                    {ASSET_PICKER_DIRECTORY_TREE.map(node => renderPickerDirectoryNode(node))}
                  </div>
                </aside>
              )}
              <aside className="border-r border-slate-100 bg-slate-50 p-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    value={assetPickerSearch}
                    onChange={(event) => setAssetPickerSearch(event.target.value)}
                    className="w-full rounded-2xl border border-slate-150 bg-white py-2.5 pl-9 pr-3 text-xs font-bold outline-none"
                    placeholder="搜索资产名称 / 标签"
                  />
                </div>
                {assetPickerTarget.mode === 'landing' ? (
                  <div className="mt-4 space-y-2">
                    {['全部落版', '视频落版'].map((item, index) => (
                      <button key={item} type="button" className={`w-full rounded-xl px-3 py-2 text-left text-xs font-black ${index === 0 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-white'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 max-h-[58vh] space-y-4 overflow-y-auto pr-1 no-scrollbar">
                    {Array.from(new Set((assetPickerTarget.mode === 'finished' ? FINISHED_PICKER_FACETS : ASSET_PICKER_FACETS).map(facet => facet.group))).map(group => (
                      <div key={group}>
                        <p className={`mb-2 text-[10px] font-black ${assetPickerTarget.mode === 'finished' ? 'text-emerald-600' : 'text-indigo-600'}`}>{group}</p>
                        <div className="flex flex-wrap gap-2">
                          {(assetPickerTarget.mode === 'finished' ? FINISHED_PICKER_FACETS : ASSET_PICKER_FACETS).filter(facet => facet.group === group).map(facet => {
                            const isActive = assetPickerFacetId === facet.id;
                            const count = getPickerFacetCounts()[facet.id] || 0;
                            return (
                              <button
                                key={facet.id}
                                type="button"
                                onClick={() => setAssetPickerFacetId(facet.id)}
                                className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-black transition-all ${
                                  isActive
                                    ? assetPickerTarget.mode === 'finished'
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                      : 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                    : assetPickerTarget.mode === 'finished'
                                      ? 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
                                      : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                                }`}
                              >
                                {facet.label}
                                <span className={`ml-1 ${isActive ? (assetPickerTarget.mode === 'finished' ? 'text-emerald-400' : 'text-indigo-400') : 'text-slate-300'}`}>{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </aside>
              <div className="overflow-y-auto p-5 no-scrollbar">
                {assetPickerTarget.mode !== 'landing' && (
                  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-[10px] font-black text-slate-400">当前范围</span>
                    {assetPickerTarget.mode === 'asset' && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-100">
                        {ASSET_PICKER_DIRECTORY_OPTIONS.find(item => item.id === assetPickerDirectoryId)?.label || '全部资产'}
                      </span>
                    )}
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black ring-1 ${
                      assetPickerTarget.mode === 'finished'
                        ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                        : 'bg-indigo-50 text-indigo-600 ring-indigo-100'
                    }`}>
                      {(assetPickerTarget.mode === 'finished' ? FINISHED_PICKER_FACETS : ASSET_PICKER_FACETS).find(item => item.id === assetPickerFacetId)?.label || '全部资产'}
                    </span>
                    {assetPickerSearch.trim() && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-100">
                        搜索 {assetPickerSearch.trim()}
                      </span>
                    )}
                  </div>
                )}
                {getPickerOptions().length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                    <p className="text-xs font-black text-slate-400">没有符合条件的资产</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-300">可以清除搜索词，或切换其它分类标签。</p>
                  </div>
                ) : (
                <div className={`grid gap-4 ${
                  assetPickerTarget.mode === 'landing'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                }`}>
                  {getPickerOptions().map(asset => {
                    const selected = getPickerSelectedIds().includes(asset.id);
                    return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handlePickAsset(asset.id)}
                      className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-3xs transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md ${
                        selected ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-slate-150'
                      }`}
                    >
                      <div className="relative aspect-video bg-slate-100">
                        <img src={asset.previewUrl} alt={asset.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play className="h-8 w-8 fill-white text-white drop-shadow" />
                        </div>
                        <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-[9px] font-black text-white backdrop-blur">{asset.type}</span>
                        {selected && (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="line-clamp-2 text-xs font-black text-slate-800">{asset.name}</h4>
                          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-black ${asset.status === 'Recommended' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{asset.status}</span>
                        </div>
                        <p className="mt-2 text-[10px] font-bold text-slate-400">{asset.id} / {asset.duration}</p>
                      </div>
                    </button>
                  );})}
                </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <p className="text-[10px] font-bold text-slate-400">
                {assetPickerTarget.mode === 'landing' ? '选择后会自动替换当前 CTA/落版。' : '再次点击已选资产可以取消选择。'}
              </p>
              <button type="button" onClick={() => setAssetPickerTarget(null)} className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-black">
                {assetPickerTarget.mode === 'landing' ? '取消' : '完成选择'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementScriptWorkbench;
