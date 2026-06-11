import React, { useState, useEffect } from 'react';
import { 
  Layout as LayoutIcon, Eye, Edit3, X, PlayCircle, 
  Monitor, Link as LinkIcon, Box, Tag, BarChart2, ClipboardList,
  Check, ArrowUpRight, ExternalLink, FileText
} from 'lucide-react';
import { LibraryItem, PerformanceData } from '../types';

// Helper function mock performance
const getEffectivePerformanceMock = (item: LibraryItem): PerformanceData[] => {
  const base = item.performance && item.performance.length > 0 ? item.performance : [];
  const channels = ['Applovin', 'Facebook', 'Google'];
  
  let seed = 0;
  for (let i = 0; i < item.id.length; i++) {
    seed += item.id.charCodeAt(i);
  }

  return channels.map((channel, idx) => {
    const existing = base.find(p => p.channel.toLowerCase() === channel.toLowerCase());
    if (existing) return existing;

    const scaleMultiplier = ((seed % 10) + 3) / 8;
    const spent = Math.round((12000 + (seed * (idx + 1) * 31) % 35000) * scaleMultiplier);
    const installs = Math.round((3500 + (seed * (idx + 2) * 23) % 12000) * scaleMultiplier);
    const ir = +(0.15 + ((seed + idx * 7) % 35) / 100).toFixed(3);
    const cpi = +(1.1 + ((seed * 3 + idx * 13) % 38) / 10).toFixed(2);
    
    return {
      channel,
      spent,
      installs,
      paidUsers: Math.round(installs * 0.08),
      ir,
      cpi,
      cpm: +(10.5 + ((seed + idx) % 20)).toFixed(1),
      cpa: +(15.0 + ((seed * 2 + idx) % 45)).toFixed(1)
    };
  });
};

const getAssetUsageSlotsForDetail = (item: LibraryItem): string[] => {
  const content = [item.type, item.subType, item.name, ...item.tags, item.sourceFileUrl].join(' ').toLowerCase();
  const slots = new Set<string>();

  if (item.type === 'Fragment') {
    if (content.includes('前贴') || content.includes('hook') || content.includes('ai生成') || content.includes('真人')) slots.add('A段');
    if (content.includes('玩法') || content.includes('中间') || content.includes('合成') || content.includes('塔防')) slots.add('中间段');
    if (content.includes('大字报') || content.includes('文字') || content.includes('奖励') || content.includes('宝箱')) slots.add('B段');
    if (content.includes('cta') || content.includes('落版') || content.includes('宝箱') || content.includes('奖励')) slots.add('CTA');
  }

  if (item.type === 'Component') {
    if (content.includes('场景') || content.includes('背景')) slots.add('背景');
    if (content.includes('ui') || content.includes('面板') || content.includes('弹窗')) slots.add('UI组件');
    if (content.includes('特效') || content.includes('粒子')) slots.add('特效');
    if (content.includes('音效') || content.includes('bgm') || content.includes('音乐')) slots.add('音效');
    if (content.includes('人物') || content.includes('形象') || content.includes('角色') || content.includes('动物')) slots.add('角色');
  }

  if (content.includes('图片') || item.sourceFileUrl?.match(/\.(png|jpe?g|webp)$/i)) slots.add('图片');
  if (slots.size === 0) slots.add(item.type === 'Component' ? '组件素材' : '视频片段');
  return Array.from(slots);
};

const getStableHash = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
};

const getRelationPerformanceMetrics = (
  performance: PerformanceData[],
  relationKey: string,
  index: number,
  totalRows: number
) => {
  const totalSpent = performance.reduce((sum, item) => sum + (item.spent || 0), 0);
  const totalImpressions = performance.reduce((sum, item) => {
    if (!item.spent || !item.cpm) return sum;
    return sum + (item.spent / item.cpm) * 1000;
  }, 0);
  const safeRowCount = Math.max(totalRows, 1);
  const hash = getStableHash(`${relationKey}-${index}`);
  const share = (0.82 + (hash % 36) / 100) / safeRowCount;
  const spent = Math.round(totalSpent * share);
  const avgCpm = totalSpent > 0 && totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 18;
  const impressions = avgCpm > 0 ? (spent / avgCpm) * 1000 : 0;
  const ctr = 0.02 + (hash % 21) / 1000;
  const clicks = Math.round(impressions * ctr);

  return {
    spent,
    clicks,
    ctr
  };
};

const getRequirementRelationMeta = (requirementId: string, index: number) => {
  const hash = getStableHash(requirementId);
  const scenes = ['新烧树（花园）+奖励大字报（老）', '冰雪仙子神秘空投', '玩法段-塔防合成升级展示', '真人前贴-爆奖反应'];
  const dates = ['2026-05-11', '2026-05-18', '2026-05-26'];
  const daysRunning = 5 + ((hash + index) % 18);

  return {
    title: scenes[(hash + index) % scenes.length],
    launchDate: dates[(hash + index) % dates.length],
    daysRunning
  };
};

const getRequirementPerformanceSummary = (
  performance: PerformanceData[],
  requirements: string[]
) => {
  const rows = requirements.map((requirementId, index) =>
    getRelationPerformanceMetrics(performance, requirementId, index, Math.max(requirements.length, 1))
  );
  const spent = rows.reduce((sum, row) => sum + row.spent, 0);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const ctr = spent > 0
    ? rows.reduce((sum, row) => sum + row.ctr * row.spent, 0) / spent
    : 0;

  return {
    spent,
    clicks,
    ctr
  };
};

interface DetailModalProps {
  selectedDetailItem: LibraryItem;
  onClose: () => void;
  onSave: (updatedItem: LibraryItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  selectedDetailItem,
  onClose,
  onSave
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'relations'>('overview');
  
  // Aspect ratio state inside detail modal
  const [selectedRatio, setSelectedRatio] = useState<'9:16' | '1:1' | '16:9' | '4:5'>('9:16');

  // Form states matching exactly all requested fields
  const [editFormId, setEditFormId] = useState('');
  const [editFormName, setEditFormName] = useState('');
  const [editFormType, setEditFormType] = useState<'Fragment' | 'Component'>('Fragment');
  const [editFormSubType, setEditFormSubType] = useState('');
  const [editFormTheme, setEditFormTheme] = useState('');
  const [editFormTags, setEditFormTags] = useState<string[]>([]);
  const [editFormStatus, setEditFormStatus] = useState<LibraryItem['status']>('Insufficient Data');
  const [editFormDuration, setEditFormDuration] = useState('');
  const [editFormSourceFileUrl, setEditFormSourceFileUrl] = useState('');
  const [editFormParentComponent, setEditFormParentComponent] = useState('');
  const [editFormRelatedAssets, setEditFormRelatedAssets] = useState<string[]>([]);
  const [editFormRelatedRequirements, setEditFormRelatedRequirements] = useState<string[]>([]);
  const [editFormRelatedComponents, setEditFormRelatedComponents] = useState<string[]>([]);
  const [editFormPerformance, setEditFormPerformance] = useState<PerformanceData[]>([]);
  const [editCitationCount, setEditCitationCount] = useState<number>(0);
  const [editCreatedAt, setEditCreatedAt] = useState<string>('');

  // Custom interactive sub-states for adding tags or relations
  const [newTagInput, setNewTagInput] = useState('');
  const [newAssetInput, setNewAssetInput] = useState('');
  const [newRequirementInput, setNewRequirementInput] = useState('');
  const [newCompInput, setNewCompInput] = useState('');
  const detailUsageSlots = getAssetUsageSlotsForDetail({
    ...selectedDetailItem,
    name: editFormName,
    type: editFormType,
    subType: editFormSubType,
    tags: editFormTags,
    sourceFileUrl: editFormSourceFileUrl
  });
  const requirementPerformanceSummary = getRequirementPerformanceSummary(editFormPerformance, editFormRelatedRequirements);

  // Initialize form when item changes
  useEffect(() => {
    if (selectedDetailItem) {
      setEditFormId(selectedDetailItem.id || 'hook-ai-01-v1');
      setEditFormName(selectedDetailItem.name || '');
      setEditFormType(selectedDetailItem.type || 'Fragment');
      setEditFormSubType(selectedDetailItem.subType || '');
      setEditFormTheme(selectedDetailItem.theme || '魔幻/冰雪');
      setEditFormTags([...(selectedDetailItem.tags || [])]);
      setEditFormStatus(selectedDetailItem.status || 'Insufficient Data');
      setEditFormDuration(selectedDetailItem.duration || '00:05');
      setEditFormSourceFileUrl(selectedDetailItem.sourceFileUrl || '');
      setEditFormParentComponent(selectedDetailItem.parentComponent || '剧情片段-02');
      setEditFormRelatedAssets(selectedDetailItem.relatedAssets || ['material-ai-bg-01', 'material-voice-05']);
      setEditFormRelatedRequirements(selectedDetailItem.relatedRequirements || ['cp4116-10', 'cp4116-09', 'cp4116-08', 'cp4116-07']);
      setEditFormRelatedComponents(selectedDetailItem.relatedComponents || ['comp-login-panel', 'comp-particle-emitter']);
      setEditFormPerformance(getEffectivePerformanceMock(selectedDetailItem));
      setEditCitationCount(selectedDetailItem.citationCount || 0);
      setEditCreatedAt(selectedDetailItem.createdAt || '2026-05-18 14:20');
      setIsEditMode(false); // Default to reading mode on open
      setDetailTab('overview');
    }
  }, [selectedDetailItem]);

  const handleSaveModalForm = () => {
    const updated: LibraryItem = {
      ...selectedDetailItem,
      id: editFormId.trim(),
      name: editFormName.trim(),
      type: editFormType,
      subType: editFormSubType.trim(),
      theme: editFormTheme.trim(),
      tags: editFormTags,
      status: editFormStatus,
      duration: editFormDuration.trim(),
      sourceFileUrl: editFormSourceFileUrl.trim(),
      parentComponent: editFormParentComponent.trim(),
      relatedAssets: editFormRelatedAssets,
      relatedRequirements: editFormRelatedRequirements,
      relatedComponents: editFormRelatedComponents,
      performance: editFormPerformance,
      citationCount: editCitationCount,
      createdAt: editCreatedAt
    };
    onSave(updated);
    setIsEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[92vh] max-h-[92vh] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden font-sans">
        
        {/* ----------------- Modal Header Bar ----------------- */}
        <div className="h-20 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 select-none bg-white">
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-sm font-black text-slate-800 flex items-center gap-1.5 leading-tight">
                <LayoutIcon className="w-4 h-4 text-indigo-605" />
                {isEditMode ? '资产信息编辑' : '资产信息详情'}
              </span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-black text-[10.5px]">
                  {isEditMode ? (
                    <span className="flex items-center gap-1">
                      <select
                        value={editFormType}
                        onChange={(e) => setEditFormType(e.target.value as any)}
                        className="text-[10px] font-bold bg-white text-slate-750 px-1 py-px border border-slate-200 focus:outline-none rounded"
                      >
                        <option value="Fragment">片段</option>
                        <option value="Component">组件</option>
                      </select>
                      <input
                        type="text"
                        placeholder="子类型"
                        value={editFormSubType}
                        onChange={(e) => setEditFormSubType(e.target.value)}
                        className="w-16 text-[10px] bg-white border border-slate-200 px-1 py-px text-indigo-700 focus:outline-none font-bold rounded"
                      />
                    </span>
                  ) : (
                    `${editFormType === 'Fragment' ? '片段' : '组件'} • ${editFormSubType || '无'}`
                  )}
                </span>
                <span className="text-slate-355">|</span>
                <span className="font-mono text-[10.5px] font-bold text-slate-450">
                  {isEditMode ? (
                    <span className="flex items-center gap-1">
                      ID:
                      <input
                        type="text"
                        placeholder="资产ID"
                        value={editFormId}
                        onChange={(e) => setEditFormId(e.target.value)}
                        className="w-28 text-[10px] font-mono bg-white border border-slate-200 px-1 py-px focus:outline-none text-slate-800 rounded"
                      />
                    </span>
                  ) : (
                    `ID: ${editFormId}`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Action Button Panel */}
          <div className="flex items-center gap-2">
            
            {/* 物料状态放在右上角 */}
            <div className="mr-2">
              {isEditMode ? (
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 px-1">状态:</span>
                  <select
                    value={editFormStatus}
                    onChange={(e) => setEditFormStatus(e.target.value as any)}
                    className="text-[10px] font-black px-1.5 py-0.5 bg-white text-slate-705 border border-slate-200 rounded focus:outline-none"
                  >
                    <option value="Insufficient Data">数据不足</option>
                    <option value="Recommended">推荐</option>
                    <option value="Not Recommended">不推荐</option>
                    <option value="Disabled">停用</option>
                  </select>
                </div>
              ) : (
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 border ${
                  editFormStatus === 'Recommended' ? 'bg-emerald-55/70 border-emerald-250 text-emerald-700' :
                  editFormStatus === 'Insufficient Data' ? 'bg-slate-50/70 border-slate-200 text-slate-600' :
                  editFormStatus === 'Not Recommended' ? 'bg-amber-55/70 border-amber-250 text-amber-700' :
                  'bg-rose-55/70 border-rose-250 text-rose-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    editFormStatus === 'Recommended' ? 'bg-emerald-500 animate-pulse' :
                    editFormStatus === 'Insufficient Data' ? 'bg-slate-400' :
                    editFormStatus === 'Not Recommended' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  {editFormStatus === 'Recommended' ? '推荐' :
                   editFormStatus === 'Insufficient Data' ? '数据不足' :
                   editFormStatus === 'Not Recommended' ? '不推荐' : '已停用'}
                </span>
              )}
            </div>

            <div className={`flex rounded-xl p-1 border shadow-3xs ${
              isEditMode ? 'bg-indigo-50 border-indigo-150' : 'bg-emerald-50 border-emerald-150'
            }`}>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isEditMode
                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                <Eye className={`w-3.5 h-3.5 ${!isEditMode ? 'text-emerald-600' : 'text-slate-400'}`} />
                阅读
              </button>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isEditMode
                    ? 'bg-indigo-650 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'text-slate-500 hover:bg-white/70 hover:text-indigo-650'
                }`}
              >
                <Edit3 className={`w-3.5 h-3.5 ${isEditMode ? 'text-white' : 'text-slate-400'}`} />
                编辑
              </button>
            </div>
            
            <span className="w-px h-6 bg-slate-200 mx-1"></span>

            {/* Heavy X Close button */}
            <button 
              onClick={onClose}
              className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-transparent hover:border-rose-105"
              title="关闭"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ----------------- Modal Body Split into Columns ----------------- */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Fixed attributes & Resource Preview (36%)   */}
          {/* ======================================================== */}
          <div className="lg:w-[36%] border-r border-slate-150 bg-slate-50/60 flex flex-col overflow-y-auto no-scrollbar p-6 gap-4 shrink-0">
            
            {/* 1. 资源预览 Media Stage forced to 9:16 aspect ratio */}
            <div className="bg-slate-950 rounded-2xl border border-slate-850 flex flex-col items-center justify-center relative overflow-hidden aspect-[9/16] w-full max-h-[500px] shadow-md shrink-0">
               {/* Blurred Backdrop wrapper */}
               <div className="absolute inset-0 opacity-15 filter blur-2xl scale-155 pointer-events-none select-none">
                  <img src={selectedDetailItem.previewUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>

               {/* Stage viewport */}
               <div className="relative w-full h-full flex items-center justify-center z-10 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center max-h-full max-w-full">
                     {editFormSourceFileUrl?.endsWith('.mp4') || editFormSourceFileUrl?.endsWith('.mov') || editFormDuration ? (
                        <video 
                           src={editFormSourceFileUrl} 
                           controls 
                           className="w-full h-full object-cover select-none"
                           key={editFormSourceFileUrl}
                        />
                     ) : (
                        <img 
                           src={selectedDetailItem.previewUrl} 
                           alt="" 
                           className="w-full h-full object-cover select-none"
                           referrerPolicy="no-referrer"
                        />
                     )}
                  </div>
               </div>

               {/* Bottom-left duration overlay */}
               <div className="absolute bottom-3 left-3 z-[15] bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-mono text-white flex items-center gap-1 border border-white/10 shadow-lg">
                  <span>⏳</span>
                  {isEditMode ? (
                     <input 
                        type="text" 
                        placeholder="时长" 
                        value={editFormDuration}
                        onChange={(e) => setEditFormDuration(e.target.value)}
                        className="w-12 bg-transparent text-white text-center border-none text-[11.5px] p-0 focus:outline-none focus:ring-0 font-mono font-black"
                     />
                  ) : (
                     <span className="font-bold">{editFormDuration || '00:05'}</span>
                  )}
               </div>
            </div>

            {/* 2. Compact Sizes buttons with no title/description */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0 shadow-3xs">
               <div className="grid grid-cols-4 gap-1.5 bg-slate-105 p-1 rounded-lg">
                  {(['9:16', '1:1', '16:9', '4:5'] as const).map(ratio => {
                     const isSelected = selectedRatio === ratio;
                     return (
                        <button
                           key={ratio}
                           type="button"
                           onClick={() => setSelectedRatio(ratio)}
                           className={`py-1.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                              isSelected 
                                 ? 'bg-slate-900 text-white shadow-xs' 
                                 : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50'
                           }`}
                        >
                           {ratio}
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* 3. Ingress time (入库时间) below preview & compact details */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-left space-y-3 shadow-3xs shrink-0">
               <div className="text-[11px] text-slate-505 font-bold flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 border border-slate-150 rounded-lg">
                  <span className="font-black text-slate-500">📅 入库时间:</span>
                  {isEditMode ? (
                     <input 
                        type="text" 
                        value={editCreatedAt}
                        onChange={(e) => setEditCreatedAt(e.target.value)}
                        className="flex-1 bg-white border border-slate-250 rounded px-1.5 py-px text-[11px] text-slate-800 font-mono focus:outline-none"
                     />
                  ) : (
                     <span className="text-slate-800 font-mono font-bold">{editCreatedAt}</span>
                  )}
               </div>

               <div>
                  <span className="text-[9.5px] text-slate-400 font-bold block mb-1">🔗 源文件地址</span>
                  {isEditMode ? (
                     <input 
                        type="text" 
                        placeholder="请输入 cdn 物理地址 URL..." 
                        value={editFormSourceFileUrl}
                        onChange={(e) => setEditFormSourceFileUrl(e.target.value)}
                        className="w-full font-mono text-[10px] font-medium text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                     />
                  ) : (
                     <a 
                        href={editFormSourceFileUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => { if (!editFormSourceFileUrl) { e.preventDefault(); alert("暂未配置有效物理存储路径！"); } }}
                        className="font-mono font-bold text-indigo-605 hover:text-indigo-850 hover:underline bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-[10.5px] truncate flex items-center justify-between gap-1"
                     >
                        <span className="truncate flex items-center gap-1">
                           <LinkIcon className="w-3 h-3 text-indigo-400 shrink-0" />
                           {editFormSourceFileUrl || '未配置物理存储路径(物理隔离)'}
                        </span>
                        {editFormSourceFileUrl && <ExternalLink className="w-2.5 h-2.5 shrink-0" />}
                     </a>
                  )}
               </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Name, Tags, Data and Relations (64%)      */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 bg-white text-left font-sans flex flex-col justify-between">
             
             <div className="space-y-6">
                <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200 w-fit">
                   {[
                      { key: 'overview' as const, label: '资产概览' },
                      { key: 'relations' as const, label: '关联需求' }
                   ].map(tab => (
                      <button
                         key={tab.key}
                         type="button"
                         onClick={() => setDetailTab(tab.key)}
                         className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            detailTab === tab.key
                               ? 'bg-white text-slate-900 shadow-sm'
                               : 'text-slate-500 hover:text-slate-800'
                         }`}
                      >
                         {tab.label}
                      </button>
                   ))}
                </div>
                
                {/* A. 名称及主题 */}
                <div className={`${detailTab === 'overview' ? 'space-y-3 pb-3 border-b border-slate-100' : 'hidden'}`}>
                   <div className="flex items-start gap-4">

                      
                      <div className="flex-1 min-w-0">
                         {isEditMode ? (
                            <div className="space-y-1">
                               <label className="text-[9.5px] font-black text-indigo-650 uppercase tracking-widest block">资产名称</label>
                               <input 
                                  type="text" 
                                  placeholder="请输入资产标题..." 
                                  value={editFormName} 
                                  onChange={(e) => setEditFormName(e.target.value)}
                                  className="w-full max-w-xl px-3 py-1.5 bg-white text-slate-900 border border-indigo-200 text-sm font-black rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                               />
                            </div>
                         ) : (
                            <div>
                               <span className="text-[9px] bg-indigo-50 text-indigo-650 font-black px-1.5 py-0.5 rounded tracking-wide uppercase font-mono">Verified Active Asset</span>
                               <h2 className="text-xl font-black text-slate-900 tracking-tight select-text mt-0.5">
                                  {editFormName}
                               </h2>
                            </div>
                         )}

                         {/* 主题字段主题类 */}
                         <div className="mt-2 text-xs font-semibold text-slate-600 flex items-center gap-1.5 select-text">
                            <span className="text-indigo-650 font-bold">主题:</span>
                            {isEditMode ? (
                               <input 
                                  type="text" 
                                  placeholder="例: 冰雪/精灵/奖励" 
                                  value={editFormTheme} 
                                  onChange={(e) => setEditFormTheme(e.target.value)}
                                  className="px-2 py-0.5 bg-white border border-slate-205 rounded text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                               />
                            ) : (
                               <span className="text-slate-800 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                  {editFormTheme || '魔幻冰雪 / 传统消除'}
                               </span>
                            )}
                         </div>

                         <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-[10px] font-black text-slate-400">适用位置</span>
                            {detailUsageSlots.map(slot => (
                               <span key={slot} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600 ring-1 ring-indigo-100">
                                  {slot}
                               </span>
                            ))}
                            <span className="text-[10px] font-bold text-slate-400">用于提需求时判断可引用段落</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* B. 标签类 (Editable Tag lists with nice presets toggles) */}
                <div className={detailTab === 'overview' ? 'space-y-3' : 'hidden'}>
                   <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 text-slate-450 border-b border-slate-100 pb-1.5">
                      <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                      创意标签分拣面板
                   </h3>

                   <div className="flex flex-wrap gap-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 text-left">
                      {editFormTags.map(tag => (
                         <span key={tag} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-3xs">
                            <span className="text-slate-400">#</span>
                            <span>{tag}</span>
                            {isEditMode && (
                               <button 
                                  type="button" 
                                  onClick={() => setEditFormTags(prev => prev.filter(t => t !== tag))}
                                  className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
                               >
                                  &times;
                               </button>
                            )}
                         </span>
                      ))}
                      {editFormTags.length === 0 && <span className="text-xs text-slate-400 py-0.5">暂无任何标签物料标签</span>}
                   </div>

                   {/* Tags inline selector in edit mode */}
                   {isEditMode && (
                      <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2 text-left">
                         <div className="flex gap-1.5">
                            <input 
                               type="text" 
                               placeholder="自定义新标签回车或点击添加..." 
                               value={newTagInput}
                               onChange={(e) => setNewTagInput(e.target.value)}
                               onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newTagInput.trim()) {
                                     e.preventDefault();
                                     const t = newTagInput.trim();
                                     if (!editFormTags.includes(t)) setEditFormTags(prev => [...prev, t]);
                                     setNewTagInput('');
                                  }
                                }}
                               className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-205 rounded-lg focus:outline-none"
                            />
                            <button
                               type="button"
                               onClick={() => {
                                  if (newTagInput.trim()) {
                                     const t = newTagInput.trim();
                                     if (!editFormTags.includes(t)) setEditFormTags(prev => [...prev, t]);
                                     setNewTagInput('');
                                  }
                               }}
                               className="px-3 py-1 bg-indigo-650 text-white rounded-lg text-xs font-black shadow-3xs hover:bg-indigo-700 text-center cursor-pointer"
                            >
                               添加
                            </button>
                         </div>
                         {/* Quick Click additions */}
                         <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-450 uppercase block">🎯 快捷点击添加/移除多选：</span>
                            <div className="flex flex-wrap gap-1">
                               {['仙子', '冰雪', '奖励', '消除', '惊艳', '搞笑', '萌妹', '真机实测'].map(p => {
                                  const active = editFormTags.includes(p);
                                  return (
                                     <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                           if (active) setEditFormTags(prev => prev.filter(t => t !== p));
                                           else setEditFormTags(prev => [...prev, p]);
                                        }}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                                           active ? 'bg-indigo-600 text-white border-indigo-550' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                     >
                                        # {p}
                                     </button>
                                  );
                               })}
                            </div>
                         </div>
                      </div>
                   )}
                </div>

                {/* C. 数据类 */}
                <div className={detailTab === 'overview' ? 'space-y-3' : 'hidden'}>
                   <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5 text-slate-455 border-b border-slate-100 pb-1.5">
                      <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      核心获客数据统计指标
                   </h3>


                   {/* Custom Channels table performance */}
                   <div className="border border-slate-150 rounded-xl overflow-hidden shadow-3xs mt-2.5">
                      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between font-bold text-slate-600 text-[10.5px]">
                         <span>📊 渠道详细核心统计详情表</span>
                         <span className="text-[9px] text-slate-400 font-mono font-medium">Standard Ads API</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                         <table className="w-full text-[11px] text-left min-w-[580px] border-collapse font-mono">
                            <thead>
                               <tr className="bg-slate-50/40 text-slate-450 border-b border-slate-100">
                                  <th className="p-2.5 font-bold">投放渠道</th>
                                  <th className="p-2.5 text-right font-bold">花费 ($)</th>
                                  <th className="p-2.5 text-right font-bold">安装量</th>
                                  <th className="p-2.5 text-right font-bold">付费用户</th>
                                  <th className="p-2.5 text-right font-bold">IR (%)</th>
                                  <th className="p-2.5 text-right font-bold">CPI</th>
                                  <th className="p-2.5 text-right font-bold">CPM</th>
                                  <th className="p-2.5 text-right font-bold">CPA</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {editFormPerformance.map((p, pidx) => (
                                  <tr key={p.channel} className="hover:bg-slate-50/20 transition-all">
                                     <td className="p-2.5 font-sans font-black uppercase text-slate-800 text-[10px] flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                           p.channel.toLowerCase() === 'applovin' ? 'bg-blue-500' :
                                           p.channel.toLowerCase() === 'facebook' ? 'bg-indigo-650' : 'bg-red-500'
                                        }`}></span>
                                        {p.channel}
                                     </td>
                                     <td className="p-2 text-right">
                                        {isEditMode ? (
                                           <input 
                                              type="number" 
                                              value={p.spent}
                                              onChange={(e) => {
                                                 const val = parseInt(e.target.value) || 0;
                                                 setEditFormPerformance(prev => prev.map((item, idx) => idx === pidx ? { ...item, spent: val } : item));
                                              }}
                                              className="w-16 text-right border border-slate-200 rounded px-1"
                                           />
                                        ) : (
                                           <span className="font-bold text-slate-905">${p.spent?.toLocaleString()}</span>
                                        )}
                                     </td>
                                     <td className="p-2 text-right">
                                        {isEditMode ? (
                                           <input 
                                              type="number" 
                                              value={p.installs}
                                              onChange={(e) => {
                                                 const val = parseInt(e.target.value) || 0;
                                                 setEditFormPerformance(prev => prev.map((item, idx) => idx === pidx ? { ...item, installs: val } : item));
                                              }}
                                              className="w-16 text-right border border-slate-200 rounded px-1"
                                           />
                                        ) : (
                                           <span className="text-slate-700">{p.installs?.toLocaleString()}</span>
                                        )}
                                     </td>
                                     <td className="p-2 text-right">
                                        {isEditMode ? (
                                           <input 
                                              type="number" 
                                              value={p.paidUsers}
                                              onChange={(e) => {
                                                 const val = parseInt(e.target.value) || 0;
                                                 setEditFormPerformance(prev => prev.map((item, idx) => idx === pidx ? { ...item, paidUsers: val } : item));
                                              }}
                                              className="w-14 text-right border border-slate-200 rounded px-1"
                                           />
                                        ) : (
                                           <span className="text-slate-550">{p.paidUsers?.toLocaleString()}</span>
                                        )}
                                     </td>
                                     <td className="p-2 text-right">
                                        {isEditMode ? (
                                           <input 
                                              type="number" 
                                              step="0.01"
                                              value={p.ir}
                                              onChange={(e) => {
                                                 const val = parseFloat(e.target.value) || 0;
                                                 setEditFormPerformance(prev => prev.map((item, idx) => idx === pidx ? { ...item, ir: val } : item));
                                              }}
                                              className="w-12 text-right border border-slate-200 rounded px-1"
                                           />
                                        ) : (
                                           <span className="text-slate-800">{(p.ir * 100).toFixed(1)}%</span>
                                        )}
                                     </td>
                                     <td className="p-1 px-2.5 text-right text-indigo-650 font-bold">
                                        {isEditMode ? (
                                           <input 
                                              type="number" 
                                              step="0.1"
                                              value={p.cpi}
                                              onChange={(e) => {
                                                 const val = parseFloat(e.target.value) || 0;
                                                 setEditFormPerformance(prev => prev.map((item, idx) => idx === pidx ? { ...item, cpi: val } : item));
                                              }}
                                              className="w-12 text-right border border-slate-200 rounded px-1"
                                           />
                                        ) : (
                                           <span>${p.cpi}</span>
                                        )}
                                     </td>
                                     <td className="p-1 px-2.5 text-right font-bold text-slate-500">
                                        {isEditMode ? (
                                           <input 
                                              type="number" 
                                              step="0.1"
                                              value={p.cpm}
                                              onChange={(e) => {
                                                 const val = parseFloat(e.target.value) || 0;
                                                 setEditFormPerformance(prev => prev.map((item, idx) => idx === pidx ? { ...item, cpm: val } : item));
                                              }}
                                              className="w-12 text-right border border-slate-200 rounded px-1"
                                           />
                                        ) : (
                                           <span>${p.cpm}</span>
                                        )}
                                     </td>
                                     <td className="p-1 px-2.5 text-right font-bold text-indigo-900 border-none">
                                        {isEditMode ? (
                                           <input 
                                              type="number" 
                                              step="0.1"
                                              value={p.cpa}
                                              onChange={(e) => {
                                                 const val = parseFloat(e.target.value) || 0;
                                                 setEditFormPerformance(prev => prev.map((item, idx) => idx === pidx ? { ...item, cpa: val } : item));
                                              }}
                                              className="w-12 text-right border border-slate-200 rounded px-1"
                                           />
                                        ) : (
                                           <span>${p.cpa}</span>
                                        )}
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>

                {/* D. 资产结构关系 */}
                <div className={detailTab === 'overview' ? 'space-y-3' : 'hidden'}>
                   <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 text-slate-450 border-b border-slate-100 pb-1.5">
                      <ClipboardList className="w-4 h-4 text-indigo-550 shrink-0" />
                      资产结构关系
                   </h3>

                   <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white shadow-3xs">
                      <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                         <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-450">
                            <tr>
                               <th className="px-4 py-3">关系类型</th>
                               <th className="px-4 py-3">关联对象</th>
                               <th className="px-4 py-3">用途说明</th>
                               <th className="px-4 py-3 text-right">操作</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {editFormRelatedAssets.map(asset => (
                               <tr key={`overview-asset-${asset}`} className="hover:bg-slate-50/60">
                                  <td className="px-4 py-3">
                                     <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-650 ring-1 ring-blue-100">关联素材</span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[11px] font-black text-slate-800">{asset}</td>
                                  <td className="px-4 py-3 text-slate-500">当前资产的来源、引用或组合素材。</td>
                                  <td className="px-4 py-3 text-right">
                                     {isEditMode ? (
                                        <button
                                           type="button"
                                           onClick={() => setEditFormRelatedAssets(prev => prev.filter(a => a !== asset))}
                                           className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                           title="移除关联素材"
                                        >
                                           <X className="h-3.5 w-3.5" />
                                        </button>
                                     ) : (
                                        <span className="text-[10px] font-bold text-slate-300">-</span>
                                     )}
                                  </td>
                               </tr>
                            ))}
                            <tr className="hover:bg-slate-50/60">
                               <td className="px-4 py-3">
                                  <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-650 ring-1 ring-indigo-100">父组件</span>
                               </td>
                               <td className="px-4 py-3">
                                  {isEditMode ? (
                                     <input
                                        type="text"
                                        placeholder="请输入父组件名称..."
                                        value={editFormParentComponent}
                                        onChange={(e) => setEditFormParentComponent(e.target.value)}
                                        className="w-full rounded-lg border border-slate-205 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                     />
                                  ) : (
                                     <span className="font-mono text-[11px] font-black text-slate-800">{editFormParentComponent || '暂无父组件'}</span>
                                  )}
                               </td>
                               <td className="px-4 py-3 text-slate-500">当前资产所属的父级组件、片段组或迭代来源。</td>
                               <td className="px-4 py-3 text-right">
                                  {isEditMode && editFormParentComponent ? (
                                     <button
                                        type="button"
                                        onClick={() => setEditFormParentComponent('')}
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                        title="清空父组件"
                                     >
                                        <X className="h-3.5 w-3.5" />
                                     </button>
                                  ) : (
                                     <span className="text-[10px] font-bold text-slate-300">-</span>
                                  )}
                               </td>
                            </tr>
                            {editFormRelatedComponents.map(comp => (
                               <tr key={`overview-component-${comp}`} className="hover:bg-slate-50/60">
                                  <td className="px-4 py-3">
                                     <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-650 ring-1 ring-emerald-100">关联组件</span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[11px] font-black text-slate-800">{comp}</td>
                                  <td className="px-4 py-3 text-slate-500">与当前资产存在组合、嵌套或复用关系。</td>
                                  <td className="px-4 py-3 text-right">
                                     {isEditMode ? (
                                        <button
                                           type="button"
                                           onClick={() => setEditFormRelatedComponents(prev => prev.filter(c => c !== comp))}
                                           className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                           title="移除关联组件"
                                        >
                                           <X className="h-3.5 w-3.5" />
                                        </button>
                                     ) : (
                                        <span className="text-[10px] font-bold text-slate-300">-</span>
                                     )}
                                  </td>
                               </tr>
                            ))}
                            {editFormRelatedAssets.length === 0 && !editFormParentComponent && editFormRelatedComponents.length === 0 && (
                               <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-xs font-bold text-slate-400">
                                     暂无资产结构关系
                                  </td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>

                   {isEditMode && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                         <input
                            type="text"
                            placeholder="新增关联素材 ID，回车添加"
                            value={newAssetInput}
                            onChange={(e) => setNewAssetInput(e.target.value)}
                            onKeyDown={(e) => {
                               if (e.key === 'Enter' && newAssetInput.trim()) {
                                  e.preventDefault();
                                  const v = newAssetInput.trim();
                                  if (!editFormRelatedAssets.includes(v)) setEditFormRelatedAssets(prev => [...prev, v]);
                                  setNewAssetInput('');
                               }
                            }}
                            className="rounded-lg border border-slate-205 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                         />
                         <input
                            type="text"
                            placeholder="新增关联组件 ID，回车添加"
                            value={newCompInput}
                            onChange={(e) => setNewCompInput(e.target.value)}
                            onKeyDown={(e) => {
                               if (e.key === 'Enter' && newCompInput.trim()) {
                                  e.preventDefault();
                                  const v = newCompInput.trim();
                                  if (!editFormRelatedComponents.includes(v)) setEditFormRelatedComponents(prev => [...prev, v]);
                                  setNewCompInput('');
                               }
                            }}
                            className="rounded-lg border border-slate-205 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                         />
                      </div>
                   )}
                </div>

                 {/* E. 关联需求 */}
                 <div className={detailTab === 'relations' ? 'space-y-4' : 'hidden'}>
                    <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 text-slate-450 border-b border-slate-100 pb-1.5">
                       <ClipboardList className="w-4 h-4 text-indigo-550 shrink-0" />
                       关联需求投放表现
                    </h3>

                    <div className="space-y-2.5">
                       <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-black text-slate-805">关联创意需求</span>
                             <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-500">
                                {editFormRelatedRequirements.length}
                             </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">按最近引用需求展示</span>
                       </div>

                       <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-150 bg-slate-50/70 px-3 py-2">
                          <span className="text-[10px] font-black text-slate-400">投放汇总</span>
                          <span className="rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-black text-slate-700 ring-1 ring-slate-150">
                             需求 {editFormRelatedRequirements.length}
                          </span>
                          <span className="rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-black text-slate-700 ring-1 ring-slate-150">
                             点击 {requirementPerformanceSummary.clicks.toLocaleString()}
                          </span>
                          <span className="rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-black text-slate-700 ring-1 ring-slate-150">
                             消耗 ${requirementPerformanceSummary.spent.toLocaleString()}
                          </span>
                          <span className="rounded-lg bg-indigo-50 px-2 py-1 font-mono text-[10px] font-black text-indigo-650 ring-1 ring-indigo-100">
                             平均 CTR {(requirementPerformanceSummary.ctr * 100).toFixed(2)}%
                          </span>
                       </div>

                       <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white shadow-3xs">
                          <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-xs">
                             <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-450">
                                <tr>
                                   <th className="w-[300px] px-4 py-3 whitespace-nowrap">需求</th>
                                   <th className="w-[120px] px-4 py-3 text-right whitespace-nowrap">点击</th>
                                   <th className="w-[130px] px-4 py-3 text-right whitespace-nowrap">消耗</th>
                                   <th className="w-[100px] px-4 py-3 text-right whitespace-nowrap">CTR</th>
                                   <th className="w-[130px] px-4 py-3 text-right whitespace-nowrap">投放日期</th>
                                   <th className="w-[110px] px-4 py-3 text-right whitespace-nowrap">消耗周期</th>
                                   <th className="w-[70px] px-4 py-3 text-right whitespace-nowrap">操作</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                {editFormRelatedRequirements.map((requirementId, requirementIndex) => {
                                   const meta = getRequirementRelationMeta(requirementId, requirementIndex);
                                   const metrics = getRelationPerformanceMetrics(
                                      editFormPerformance,
                                      requirementId,
                                      requirementIndex,
                                      Math.max(editFormRelatedRequirements.length, 1)
                                   );
                                   return (
                                      <tr key={`requirement-${requirementId}`} className="hover:bg-slate-50/70">
                                         <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3 min-w-0">
                                               <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-150 bg-slate-50 text-slate-400">
                                                  <FileText className="h-4 w-4" />
                                               </span>
                                               <div className="min-w-0">
                                                  <div className="truncate text-xs font-black text-slate-800">{meta.title}</div>
                                                  <div className="mt-0.5 font-mono text-[11px] font-bold text-slate-500">{requirementId}</div>
                                               </div>
                                            </div>
                                         </td>
                                         <td className="px-4 py-3 text-right font-mono text-[11px] font-black text-slate-700 whitespace-nowrap">
                                            {metrics.clicks.toLocaleString()}
                                         </td>
                                         <td className="px-4 py-3 text-right font-mono text-[11px] font-black text-slate-700 whitespace-nowrap">
                                            ${metrics.spent.toLocaleString()}
                                         </td>
                                         <td className="px-4 py-3 text-right font-mono text-[11px] font-black text-indigo-650 whitespace-nowrap">
                                            {(metrics.ctr * 100).toFixed(2)}%
                                         </td>
                                         <td className="px-4 py-3 text-right font-mono text-[11px] font-bold text-slate-500 whitespace-nowrap">{meta.launchDate}</td>
                                         <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <span className="inline-flex rounded-lg bg-slate-50 px-2 py-1 font-mono text-[10px] font-black text-slate-600 ring-1 ring-slate-150">
                                               {meta.daysRunning} 天
                                            </span>
                                         </td>
                                         <td className="px-4 py-3 text-right whitespace-nowrap">
                                            {isEditMode ? (
                                               <button
                                                  type="button"
                                                  onClick={() => setEditFormRelatedRequirements(prev => prev.filter(req => req !== requirementId))}
                                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                                  title="移除关联需求"
                                               >
                                                  <X className="h-3.5 w-3.5" />
                                               </button>
                                            ) : (
                                               <span className="text-[10px] font-bold text-slate-300">-</span>
                                            )}
                                         </td>
                                      </tr>
                                   );
                                })}
                                {editFormRelatedRequirements.length === 0 && (
                                   <tr>
                                      <td colSpan={7} className="px-4 py-8 text-center text-xs font-bold text-slate-400">
                                         暂无关联创意需求
                                      </td>
                                   </tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    {isEditMode && (
                       <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                          <input
                             type="text"
                             placeholder="新增关联需求 ID，回车添加"
                             value={newRequirementInput}
                             onChange={(e) => setNewRequirementInput(e.target.value)}
                             onKeyDown={(e) => {
                                if (e.key === 'Enter' && newRequirementInput.trim()) {
                                   e.preventDefault();
                                   const v = newRequirementInput.trim();
                                   if (!editFormRelatedRequirements.includes(v)) setEditFormRelatedRequirements(prev => [...prev, v]);
                                   setNewRequirementInput('');
                                }
                             }}
                             className="w-full rounded-lg border border-slate-205 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                       </div>
                    )}
                 </div>
             </div>

             {/* Locked dynamic edit toolbar */}
             {isEditMode && (
                <div className="sticky bottom-0 bg-white border-t border-slate-200 z-10 py-4 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl mt-4">
                   <span className="text-[11px] text-slate-400 font-bold mr-auto">正在进行物料卡片修改。请点击保存更新：</span>
                   <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-lg transition-all cursor-pointer"
                   >
                      放弃修改
                   </button>
                   <button
                      type="button"
                      onClick={handleSaveModalForm}
                      className="px-4.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-all shadow-md flex items-center gap-1 cursor-pointer"
                   >
                      <Check className="w-3.5 h-3.5" />
                      保存并应用更改
                   </button>
                </div>
             )}

          </div>

        </div>

      </div>
    </div>
  );
};
