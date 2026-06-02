import React, { useState, useEffect } from 'react';
import { 
  Layout as LayoutIcon, Eye, Edit3, Star, Share2, X, PlayCircle, 
  Monitor, Link as LinkIcon, Box, Tag, BarChart2, ClipboardList,
  Check, ArrowUpRight, ExternalLink
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
  const [editFormRelatedComponents, setEditFormRelatedComponents] = useState<string[]>([]);
  const [editFormPerformance, setEditFormPerformance] = useState<PerformanceData[]>([]);
  const [editCitationCount, setEditCitationCount] = useState<number>(0);
  const [editCreatedAt, setEditCreatedAt] = useState<string>('');

  // Custom interactive sub-states for adding tags or relations
  const [newTagInput, setNewTagInput] = useState('');
  const [newAssetInput, setNewAssetInput] = useState('');
  const [newCompInput, setNewCompInput] = useState('');

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
      setEditFormRelatedComponents(selectedDetailItem.relatedComponents || ['comp-login-panel', 'comp-particle-emitter']);
      setEditFormPerformance(getEffectivePerformanceMock(selectedDetailItem));
      setEditCitationCount(selectedDetailItem.citationCount || 0);
      setEditCreatedAt(selectedDetailItem.createdAt || '2026-05-18 14:20');
      setIsEditMode(false); // Default to reading mode on open
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
        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 select-none bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <LayoutIcon className="w-4 h-4 text-indigo-600" />
              {isEditMode ? '资产信息编辑面板' : '资产信息详情卡'}
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex bg-slate-105 p-0.5 rounded-lg border border-slate-200/50">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className={`px-3 py-1 rounded-md text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                  !isEditMode 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                阅读模式
              </button>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className={`px-3 py-1 rounded-md text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                  isEditMode 
                    ? 'bg-white text-indigo-650 shadow-sm' 
                    : 'text-slate-500 hover:text-indigo-650'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                编辑模式
              </button>
            </div>
          </div>

          {/* Top Right Action Button Panel */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert("已将此资产加入创意收藏夹")}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-605 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-3xs"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>收 藏</span>
            </button>
            <button 
              onClick={() => alert("专属查看及编辑链接复制成功！可以发送到其他工作端直接访问。")}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-605 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-3xs"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>分 享</span>
            </button>
            
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
          <div className="lg:w-[36%] border-r border-slate-150 bg-slate-50/60 flex flex-col overflow-y-auto no-scrollbar p-6 gap-5 shrink-0">
            
            {/* Stage title */}
            <div className="flex items-center justify-between shrink-0">
               <span className="px-3 py-1 bg-white border border-indigo-200 text-indigo-750 text-[10px] font-black rounded-md shadow-3xs flex items-center gap-1">
                  <PlayCircle className="w-3 h-3 text-indigo-500 animate-pulse" />
                  资源预览 (Format Context Stage)
               </span>
               <span className="text-[10px] text-slate-450 font-mono">
                  Ratio: {selectedRatio}
               </span>
            </div>

            {/* 1. 资源预览 Media Stage */}
            <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 flex flex-col items-center justify-center relative overflow-hidden h-[300px] shadow-sm shrink-0">
               {/* Blurred Backdrop wrapper */}
               <div className="absolute inset-0 opacity-10 filter blur-2xl scale-155 pointer-events-none select-none">
                  <img src={selectedDetailItem.previewUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>

               {/* Stage viewport */}
               <div className="relative w-full h-full flex items-center justify-center z-10 overflow-hidden">
                  <div className={`shadow-xl border border-white/10 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-all duration-300 max-h-full max-w-full ${
                     selectedRatio === '16:9' ? 'aspect-[16/9] w-full' :
                     selectedRatio === '9:16' ? 'aspect-[9/16] h-full shadow-[0_0_20px_rgba(0,0,0,0.5)]' :
                     selectedRatio === '1:1' ? 'aspect-square h-[220px]' :
                     'aspect-[4/5] h-[220px]'
                  }`}>
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
            </div>

            {/* 2. 已有尺寸 (Existing Sizes) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2 shrink-0 shadow-3xs text-left">
               <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">📏 已有选择规格尺寸 (Existing Sizes)</span>
               <div className="grid grid-cols-4 gap-1 bg-slate-105 p-1 rounded-lg">
                  {(['9:16', '1:1', '16:9', '4:5'] as const).map(ratio => {
                     const isSelected = selectedRatio === ratio;
                     return (
                        <button
                           key={ratio}
                           type="button"
                           onClick={() => setSelectedRatio(ratio)}
                           className={`py-1 text-[10px] font-black rounded transition-all cursor-pointer ${
                              isSelected 
                                 ? 'bg-slate-900 text-white shadow-xs' 
                                 : 'text-slate-550 hover:text-slate-900'
                           }`}
                        >
                           {ratio}
                        </button>
                     );
                  })}
               </div>
               <p className="text-[9px] text-slate-400 text-center font-medium leading-normal pt-1">提供竖屏9:16、横屏16:9以及比例为4:5, 1:1的无缝画布适配器</p>
            </div>

            {/* 3. 左侧主要固定属性 (Fixed Properties on the left) */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-205 space-y-3.5 text-left font-sans shadow-2xs shrink-0">
               <h3 className="text-[10px] font-black text-indigo-805 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-2">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  基础物料固定属性群
               </h3>
               
               <div className="space-y-3">
                  {/* 时长 */}
                  <div>
                     <span className="text-[9px] text-slate-400 font-bold block mb-1">⏳ 时长 (Duration)</span>
                     {isEditMode ? (
                        <input 
                           type="text" 
                           placeholder="例: 00:05" 
                           value={editFormDuration}
                           onChange={(e) => setEditFormDuration(e.target.value)}
                           className="w-full font-mono text-[11px] font-bold text-indigo-650 bg-indigo-50/40 px-2.5 py-1.5 rounded-lg border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                     ) : (
                        <p className="font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-[11px]">
                           {editFormDuration || '00:05 秒视频'}
                        </p>
                     )}
                  </div>

                  {/* 资产类型 */}
                  <div>
                     <span className="text-[9px] text-slate-400 font-bold block mb-1">📁 资产类型 (Category & subType)</span>
                     {isEditMode ? (
                        <div className="grid grid-cols-2 gap-1.5">
                           <select
                              value={editFormType}
                              onChange={(e) => setEditFormType(e.target.value as any)}
                              className="text-[11px] font-bold text-slate-705 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-205 focus:outline-none"
                           >
                              <option value="Fragment">片段</option>
                              <option value="Component">组件</option>
                           </select>
                           <input 
                              type="text" 
                              placeholder="例: AI前贴" 
                              value={editFormSubType}
                              onChange={(e) => setEditFormSubType(e.target.value)}
                              className="font-bold text-slate-700 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-205 focus:outline-none text-[11px]"
                           />
                        </div>
                     ) : (
                        <div className="font-sans font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-[11px]">
                           {editFormType === 'Fragment' ? '片段 (Fragment)' : '组件 (Component)'} • <span className="text-indigo-650">{editFormSubType || '无'}</span>
                        </div>
                     )}
                  </div>

                  {/* 资产ID */}
                  <div>
                     <span className="text-[9.5px] text-slate-400 font-bold block mb-1">🆔 资产 ID 主键 (Code Prefix)</span>
                     {isEditMode ? (
                        <div className="space-y-1">
                           <input 
                              type="text" 
                              placeholder="例: hook-ai-01-v1" 
                              value={editFormId}
                              onChange={(e) => setEditFormId(e.target.value)}
                              className="w-full font-mono text-[11px] font-black text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                           />
                           <span className="text-[8.5px] text-slate-450 block font-medium leading-none">类型前缀+编号+版本号 (例: hook-ai-01-v1)</span>
                        </div>
                     ) : (
                        <p className="font-mono font-black text-slate-800 bg-slate-100/60 px-2.5 py-1.5 rounded-lg border border-slate-150 text-[11px] select-all">
                           {editFormId}
                        </p>
                     )}
                  </div>

                  {/* 源文件地址 */}
                  <div>
                     <span className="text-[9px] text-slate-400 font-bold block mb-1">🔗 源文件物理地址 (Source Code File URL)</span>
                     {isEditMode ? (
                        <input 
                           type="text" 
                           placeholder="请输入原始资源 cdn 地址..." 
                           value={editFormSourceFileUrl}
                           onChange={(e) => setEditFormSourceFileUrl(e.target.value)}
                           className="w-full font-mono text-[10px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                        />
                     ) : (
                        <a 
                           href={editFormSourceFileUrl || '#'} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           onClick={(e) => { if (!editFormSourceFileUrl) { e.preventDefault(); alert("暂未指定有效源文件物理地址！"); } }}
                           className="font-mono font-bold text-indigo-600 hover:text-indigo-850 hover:underline bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-[10px] truncate flex items-center justify-between gap-1"
                        >
                           <span className="truncate flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-indigo-400 shrink-0" />
                              {editFormSourceFileUrl || '未配置物理存储路径(物理隔离)'}
                           </span>
                           {editFormSourceFileUrl && <ExternalLink className="w-2.5 h-2.5 shrink-0" />}
                        </a>
                     )}
                  </div>

                  {/* 父组件 */}
                  <div>
                     <span className="text-[9px] text-slate-400 font-bold block mb-1">⛓️ 父组件 (Parent Node Block)</span>
                     {isEditMode ? (
                        <input 
                           type="text" 
                           placeholder="例: 剧情片段-02" 
                           value={editFormParentComponent}
                           onChange={(e) => setEditFormParentComponent(e.target.value)}
                           className="w-full font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px]"
                        />
                     ) : (
                        <p className="font-sans font-bold text-slate-655 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-105 flex items-center gap-1 text-[11px]">
                           <Box className="w-3 h-3 text-indigo-400 shrink-0" />
                           {editFormParentComponent || '暂无挂载父组件'}
                        </p>
                     )}
                  </div>
               </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Name, Tags, Data and Relations (64%)      */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 bg-white text-left font-sans flex flex-col justify-between">
             
             <div className="space-y-6">
                
                {/* A. 名称及主题 (Name and Theme Field group) */}
                <div className="space-y-3 pb-3 border-b border-slate-100">
                   <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-150 shadow-sm shrink-0 bg-slate-50">
                         <img src={selectedDetailItem.previewUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         {isEditMode ? (
                            <div className="space-y-1">
                               <label className="text-[9.5px] font-black text-indigo-650 uppercase tracking-widest block">资产名称 (Asset Display Name)</label>
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
                            <span className="text-indigo-650 font-bold">主题 / Theme Category:</span>
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
                      </div>
                   </div>
                </div>

                {/* B. 标签类 (Editable Tag lists with nice presets toggles) */}
                <div className="space-y-3">
                   <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 text-slate-450 border-b border-slate-100 pb-1.5">
                      <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                      创意标签分拣面板 (Custom Multi-select Tags)
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

                {/* C. 数据类 (Ad metrics / Ad Channel Performance breakdown) */}
                <div className="space-y-3">
                   <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5 text-slate-455 border-b border-slate-100 pb-1.5">
                      <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      核心获客数据统计指标 (Performance Statistics Data)
                   </h3>

                   {/* Custom bento matrix blocks */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Quotation count */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                         <div>
                            <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">🔗 被引用次数 (Citation Count)</span>
                            <div className="mt-1">
                               {isEditMode ? (
                                  <input 
                                     type="number" 
                                     value={editCitationCount}
                                     onChange={(e) => setEditCitationCount(parseInt(e.target.value) || 0)}
                                     className="w-full font-mono text-[11px] font-bold px-2 py-1 bg-white border border-slate-200 rounded"
                                  />
                               ) : (
                                  <span className="text-sm font-black text-slate-805 font-mono">{editCitationCount} 次</span>
                               )}
                            </div>
                         </div>
                         <span className="text-[9px] text-slate-400 mt-2 block">下游衍生模版已被累计应用引用笔数</span>
                      </div>

                      {/* Status select map */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                         <div>
                            <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">🟢 物料当前状态 (Asset Status)</span>
                            <div className="mt-1">
                               {isEditMode ? (
                                  <select
                                     value={editFormStatus}
                                     onChange={(e) => setEditFormStatus(e.target.value as any)}
                                     className="w-full text-xs font-black px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                                  >
                                     <option value="Insufficient Data">数据不足</option>
                                     <option value="Recommended">推荐</option>
                                     <option value="Not Recommended">不推荐</option>
                                     <option value="Disabled">停用</option>
                                  </select>
                               ) : (
                                  <div className="flex items-center gap-1.5">
                                     <span className={`w-2 h-2 rounded-full ${
                                        editFormStatus === 'Recommended' ? 'bg-emerald-500 animate-pulse' :
                                        editFormStatus === 'Insufficient Data' ? 'bg-slate-400' :
                                        editFormStatus === 'Not Recommended' ? 'bg-amber-500' : 'bg-rose-500'
                                     }`}></span>
                                     <span className="text-xs font-black text-slate-700">
                                        {editFormStatus === 'Recommended' ? '推荐 (Highly High ROI)' :
                                         editFormStatus === 'Insufficient Data' ? '数据不足 (Insufficient)' :
                                         editFormStatus === 'Not Recommended' ? '不推荐 (Low Performance)' : '已停用'}
                                     </span>
                                  </div>
                               )}
                            </div>
                         </div>
                         <span className="text-[9px] text-slate-400 mt-2 block">系统自动化投放过滤器策略规则状态</span>
                      </div>

                      {/* Created Time */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 flex flex-col justify-between">
                         <div>
                            <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">📅 物料入库时间 (Created Date)</span>
                            <div className="mt-1 select-all font-mono font-bold text-slate-700 text-xs">
                               {isEditMode ? (
                                  <input 
                                     type="text" 
                                     value={editCreatedAt}
                                     onChange={(e) => setEditCreatedAt(e.target.value)}
                                     className="w-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-205 rounded font-mono"
                                  />
                               ) : (
                                  <p>{editCreatedAt}</p>
                               )}
                            </div>
                         </div>
                         <span className="text-[9px] text-slate-400 mt-2 block">最初上传物料至研发管理中心时间戳</span>
                      </div>

                   </div>

                   {/* Custom Channels table performance */}
                   <div className="border border-slate-150 rounded-xl overflow-hidden shadow-3xs mt-2.5">
                      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between font-bold text-slate-600 text-[10.5px]">
                         <span>📊 渠道详细核心统计详情表 (Spent, Installs, Paid Users, IR, CPI/CPM, CPA)</span>
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

                {/* D. 关联类 (关联素材、关联组件、父组件) */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 text-slate-450 border-b border-slate-100 pb-1.5">
                      <ClipboardList className="w-4 h-4 text-indigo-505 shrink-0" />
                      关联素材及其组件树关联映射 (Resource Bindings)
                   </h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. 关联素材 */}
                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2 select-text text-left">
                         <span className="text-[10px] font-black text-slate-455 uppercase tracking-wide block">💿 关联素材 (Related Materials)</span>
                         <div className="flex flex-wrap gap-1">
                            {editFormRelatedAssets.map(asset => (
                               <span key={asset} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-mono font-bold text-slate-650 flex items-center gap-1">
                                  {asset}
                                  {isEditMode && (
                                     <button 
                                        type="button"
                                        onClick={() => setEditFormRelatedAssets(prev => prev.filter(a => a !== asset))}
                                        className="text-[9px] hover:text-rose-500 font-bold"
                                     >
                                        &times;
                                     </button>
                                  )}
                               </span>
                            ))}
                            {editFormRelatedAssets.length === 0 && <span className="text-[10px] text-slate-400">暂无关联素材</span>}
                         </div>
                         {isEditMode && (
                            <div className="flex gap-1.5 mt-2">
                               <input 
                                  type="text" 
                                  placeholder="自定义新关联素材标识 + Enter" 
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
                                  className="flex-1 px-2.5 py-1 text-[10px] bg-white border border-slate-205 rounded font-sans"
                               />
                            </div>
                         )}
                      </div>

                      {/* 2. 关联组件 */}
                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2 select-text text-left">
                         <span className="text-[10px] font-black text-slate-455 uppercase tracking-wide block">🧩 关联组件 (Related Components Reference)</span>
                         <div className="flex flex-wrap gap-1">
                            {editFormRelatedComponents.map(comp => (
                               <span key={comp} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-mono font-bold text-slate-655 flex items-center gap-1">
                                  {comp}
                                  {isEditMode && (
                                     <button 
                                        type="button"
                                        onClick={() => setEditFormRelatedComponents(prev => prev.filter(c => c !== comp))}
                                        className="text-[9px] hover:text-rose-500 font-bold"
                                     >
                                        &times;
                                     </button>
                                  )}
                               </span>
                            ))}
                            {editFormRelatedComponents.length === 0 && <span className="text-[10px] text-slate-400">暂无关联组件</span>}
                         </div>
                         {isEditMode && (
                            <div className="flex gap-1.5 mt-2">
                               <input 
                                  type="text" 
                                  placeholder="新相关绑定组件 + Enter" 
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
                                  className="flex-1 px-2.5 py-1 text-[10px] bg-white border border-slate-205 rounded font-sans"
                               />
                            </div>
                         )}
                      </div>
                   </div>
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
