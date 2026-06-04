import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
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

const ATTACHMENT_OPTIONS = ['参考录屏', '口播音频', '竞品截图', '玩法录屏', 'UI线框', '翻译表'];
const LANDING_OPTIONS: SelectableOption[] = [
  { id: '9:16', name: '9:16 竖版视频', type: '视频落版', duration: '主规格', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480&h=640&fit=crop' },
  { id: '1:1', name: '1:1 信息流方版', type: '视频落版', duration: '补充', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=480&h=640&fit=crop' },
  { id: '16:9', name: '16:9 横版视频', type: '视频落版', duration: '补充', status: 'Insufficient Data', previewUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=480&h=640&fit=crop' },
  { id: '4:5', name: '4:5 Feed 版', type: '视频落版', duration: '补充', status: 'Recommended', previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop' }
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
const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">{children}</label>
);

const RichTextMock = ({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) => (
  <div className="h-full min-h-[178px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-3xs">
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
  source: 'asset' | 'attachment';
  onRemove: () => void;
}) => {
  const asset = source === 'asset' ? getSelectableOption(id, ASSET_OPTIONS) : undefined;
  const title = asset?.name || id;
  const previewUrl = asset?.previewUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=360&h=360&fit=crop';

  return (
    <div className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-3xs">
      <img src={previewUrl} alt={title} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-1.5 pb-1.5 pt-5">
        <p className="truncate text-[8px] font-black text-white">{title}</p>
      </div>
      <span className="absolute bottom-1 right-1 rounded-md bg-rose-400 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">
        参考{index}
      </span>
      <span className="absolute left-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[8px] font-black text-indigo-600 shadow-sm">
        {source === 'asset' ? '资产库' : '附件'}
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
  onUploadReference?: () => void;
  onRemoveAsset: (id: string) => void;
  onToggleAttachment?: (name: string) => void;
  disabled?: boolean;
  compact?: boolean;
  hideLabel?: boolean;
}) => {
  const normalizedAssetIds = uniqueIds(assetIds);
  const references = [
    ...normalizedAssetIds.map(id => ({ id, source: 'asset' as const })),
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
                onRemove={() => item.source === 'asset' ? onRemoveAsset(item.id) : onToggleAttachment?.(item.id)}
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
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/80 p-3">
        <button type="button" onClick={onUploadReference} className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 hover:border-slate-300 hover:bg-slate-50">
          上传
        </button>
        <button type="button" onClick={onPickAssets} className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] font-black text-indigo-600 hover:bg-indigo-100">
          引用资产
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
  const [assetPickerTarget, setAssetPickerTarget] = useState<{ mode: 'asset' | 'landing'; type: 'shared' | 'version' | 'matrix'; version?: string; segmentId?: string; field?: 'reference' | 'insert' } | null>(null);
  const [landingByVersion, setLandingByVersion] = useState<Record<string, string>>(() => (
    Object.fromEntries(createVersionDrafts(subVersions, requirement.goal).map(item => [item.version, '9:16']))
  ));
  const [landingNotesByVersion, setLandingNotesByVersion] = useState<Record<string, string>>({});
  const [matrixColumns, setMatrixColumns] = useState<string[]>(['A段', 'B段']);
  const [matrixCells, setMatrixCells] = useState<Record<string, { references: string[]; inserts: string[]; attachments: string[]; description: string }>>({});

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

  const addMatrixColumn = (afterIndex: number) => {
    const nextColumn = Array.from({ length: 24 }, (_, index) => `${String.fromCharCode(65 + index)}段`)
      .find(column => !matrixColumns.includes(column)) || `新增段${matrixColumns.length + 1}`;
    setMatrixColumns(prev => [
      ...prev.slice(0, afterIndex + 1),
      nextColumn,
      ...prev.slice(afterIndex + 1)
    ]);
  };

  const deleteMatrixColumn = (column: string) => {
    if (column === 'B段') return;
    setMatrixColumns(prev => prev.filter(item => item !== column));
    setMatrixCells(prev => (
      Object.fromEntries(Object.entries(prev).filter(([key]) => key.split('-').slice(1).join('-') !== column))
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
    if (assetPickerTarget.type === 'shared') {
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

  const getPickerOptions = () => assetPickerTarget?.mode === 'landing' ? LANDING_OPTIONS : ASSET_OPTIONS;

  const getPickerSelectedIds = () => {
    if (!assetPickerTarget) return [];
    if (assetPickerTarget.type === 'shared') return sharedSegment.references;
    if (!assetPickerTarget.version) return [];
    if (assetPickerTarget.type === 'matrix' && assetPickerTarget.segmentId) {
      const cell = getMatrixCell(assetPickerTarget.version, assetPickerTarget.segmentId);
      return assetPickerTarget.field === 'insert' ? cell.inserts : cell.references;
    }
    if (assetPickerTarget.mode === 'landing') return landingByVersion[assetPickerTarget.version] ? [landingByVersion[assetPickerTarget.version]] : [];
    return versionDrafts.find(item => item.version === assetPickerTarget.version)?.references || [];
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
              {matrixColumns.map((column, index) => {
                const cell = getMatrixCell(version.version, column);
                return (
                  <React.Fragment key={`${version.version}-${column}`}>
                    <div className="w-[280px] shrink-0 space-y-2">
                      <div className="flex h-6 items-center justify-between">
                        <FieldLabel>{column}</FieldLabel>
                        {column !== 'B段' && (
                          <button type="button" onClick={() => deleteMatrixColumn(column)} className="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500" title="删除段落">
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
                      onClick={() => addMatrixColumn(index)}
                      className="mt-6 flex h-[168px] w-10 shrink-0 items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 text-indigo-500 transition-all hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <Plus className="h-4 w-4" />
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

  return (
    <div className="space-y-5">
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
      {assetPickerTarget && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/40 p-6 backdrop-blur-sm">
          <div className="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-150 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {assetPickerTarget.mode === 'landing'
                    ? '选择 CTA / 落版'
                    : '引用资产'}
                </h3>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  {assetPickerTarget.mode === 'landing'
                    ? 'CTA/落版为单选，选择新项会替换当前结果。'
                    : '资产引用可多选，选择结果会统一显示在“需求参考”模块。'}
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
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="border-r border-slate-100 bg-slate-50 p-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input className="w-full rounded-2xl border border-slate-150 bg-white py-2.5 pl-9 pr-3 text-xs font-bold outline-none" placeholder="搜索资产名称 / 标签" />
                </div>
                <div className="mt-4 space-y-2">
                  {(assetPickerTarget.mode === 'landing' ? ['全部落版', '视频落版'] : ['全部资产', 'A段', '中间段', 'B段', 'CTA', '图片']).map((item, index) => (
                    <button key={item} type="button" className={`w-full rounded-xl px-3 py-2 text-left text-xs font-black ${index === 0 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-white'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </aside>
              <div className="overflow-y-auto p-5 no-scrollbar">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
