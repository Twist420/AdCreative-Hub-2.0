
import React, { useState, useMemo } from 'react';
import { 
  X, ChevronDown, Check, Plus, PlusCircle, Layout, 
  Settings, Image as ImageIcon, Video, FileText, User, 
  Share2, Save, ArrowLeft, ArrowRight, Layers, Trash2,
  Monitor, Play, Globe, UserCircle2, BarChart3, Clock,
  MoreVertical, Copy, RotateCcw, Lightbulb, Zap, Scissors, RefreshCw, FilePlus,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, XCircle, Star, Search, Info, Edit2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Requirement, RequirementReqStatus, ScriptSection, RequirementStageType, 
  ProductionTask, PROJECTS, CHANNELS, TEST_DIRECTIONS 
} from '../types';
import RequirementScriptWorkbench from './RequirementScriptWorkbench';

const getInitials = (name: string) => {
  if (!name) return '';
  const mapping: Record<string, string> = {
    '唐欣怡': 'txy',
    '吉意煊': 'jyx',
    '马嘉良': 'mjl',
    '张欢': 'zh',
    '吴楠': 'wn',
    '宋爽': 'ss',
    '苏雅': 'sy',
    '顺子': 'sz'
  };
  return mapping[name] || name.charAt(0).toLowerCase();
};

const PRODUCER_ALIASES: Record<string, string> = {
  "宋子仪": "szy",
  "吕远林": "lyl",
  "王金瑞": "wjr",
  "王春华": "wch",
  "李珊姗": "lss",
  "宋爽": "ss",
  "曲冬丽": "qdl",
  "张欢": "zh",
  "郭峰": "gf",
  "王佳鸿": "wjh",
  "吴楠": "wn",
  "周进易": "zjy",
  "邓莉": "dl",
  "蒋天宇": "jty",
  "张雨学": "zyx",
  "张澳": "za",
  "朱奇杰": "zqj",
  "刘洋": "ly",
  "孙崇洋": "scy",
  "张永进": "zyj",
  "李嘉鑫": "ljx",
  "肖环宇": "xhy"
};

const CREATIVE_ALIASES: Record<string, string> = {
  '唐欣怡': 'txy',
  '吉意煊': 'jyx',
  '马嘉良': 'mjl',
  '张欢': 'zh',
  '吴楠': 'wn',
  '宋爽': 'ss',
  '苏雅': 'sy',
  '顺子': 'sz'
};

const getFolderFormatName = (req: Requirement) => {
  const project = (req.projectName || 'panthia').toLowerCase();
  const lang = req.language || 'en';
  const typePrefix = req.assetType === 'Video' ? 'cp' : req.assetType === 'Image' ? 'tp' : 'sw';
  const assetId = `${typePrefix}${req.assetIndex || ''}`;
  const broadDir = req.broadDirection || '大字报';
  const stage = req.materialStage || '迭';
  
  const creativeInitials = CREATIVE_ALIASES[req.creativePersonnel] || getInitials(req.creativePersonnel) || 'jyx';
  
  const prodInitials = req.productionPersonnel && req.productionPersonnel.length > 0
    ? req.productionPersonnel.map(p => PRODUCER_ALIASES[p] || getInitials(p)).filter(Boolean).join('_')
    : 'qdl';
    
  const channelsStr = req.channels && req.channels.length > 0
    ? req.channels.map(c => c === 'all' ? 'all' : c).filter(Boolean).join('_')
    : 'apl';

  return `${project}-${lang}-${assetId}-${broadDir}-${stage}-${creativeInitials}-${prodInitials}-${channelsStr}`;
};

const getSubVersionFormatName = (req: Requirement, subVer: { version: string; name: string }) => {
  const project = (req.projectName || 'panthia').toLowerCase();
  const lang = req.language || 'en';
  const typePrefix = req.assetType === 'Video' ? 'cp' : req.assetType === 'Image' ? 'tp' : 'sw';
  const assetId = `${typePrefix}${req.assetIndex || ''}`;
  const broadDir = req.broadDirection || '大字报';
  const stage = req.materialStage || '迭';
  
  const version = subVer.version || '01';
  const subName = subVer.name || '默认创意名称';
  
  const creativeInitials = CREATIVE_ALIASES[req.creativePersonnel] || getInitials(req.creativePersonnel) || 'jyx';
  
  const prodInitials = req.productionPersonnel && req.productionPersonnel.length > 0
    ? req.productionPersonnel.map(p => PRODUCER_ALIASES[p] || getInitials(p)).filter(Boolean).join('_')
    : 'qdl';
    
  const channelsStr = req.channels && req.channels.length > 0
    ? req.channels.map(c => c === 'all' ? 'all' : c).filter(Boolean).join('_')
    : 'apl';

  return `${project}-${lang}-${assetId}-${broadDir}-${stage}-${version}-${subName}-${creativeInitials}-${prodInitials}-${channelsStr}`;
};

const generateFullName = (req: Requirement, versionOverride?: string, nameOverride?: string, testDirOverride?: string[]) => {
  const project = PROJECTS.find(p => p.name === req.projectName)?.code || 'pan';
  const typePrefix = req.assetType === 'Video' ? 'cp' : req.assetType === 'Image' ? 'tp' : 'sw';
  const assetId = `${typePrefix}${req.assetIndex}`;
  const stageAbbr = req.materialStage;
  const broadDir = req.broadDirection;
  const version = versionOverride || req.assetVersion || '01';
  
  const testDirs = testDirOverride || req.testDirections;
  const testDirStr = testDirs && testDirs.length > 0 
    ? `验证${testDirs.join('_')}` 
    : '';
    
  const creativeInitials = getInitials(req.creativePersonnel);
  
  const lang = req.language || 'en';
  
  const channelsAbbr = req.channels
    ? req.channels
      .map(cid => CHANNELS.find(c => c.id === cid)?.id || cid)
      .sort()
      .join('_')
      .slice(0, 15) // Keep it short
    : '';
  
  const parts = [
    project,
    assetId,
    broadDir,
    stageAbbr,
    version,
    testDirStr,
    creativeInitials,
    lang,
    channelsAbbr
  ].filter(Boolean);
  
  return parts.join('-');
};

const MATERIAL_STAGES = [
  { id: '新', name: '新 (Original)' },
  { id: '迭', name: '迭 (Iteration)' },
  { id: '老', name: '老 (Editing)' }
];

const BROAD_DIRECTIONS = [
  { id: '大字报', name: '大字报' },
  { id: '原始玩法', name: '原始玩法' },
  { id: '3D玩法', name: '3D玩法' }
];

const LANGUAGES = [
  { id: 'en', name: 'English (en)' },
  { id: 'zh', name: 'Chinese (zh)' },
  { id: 'jp', name: 'Japanese (jp)' },
  { id: 'kr', name: 'Korean (kr)' }
];

const DIMENSIONS_LIST = [
  { id: '916', name: '9:16' },
  { id: '11', name: '1:1' },
  { id: '169', name: '16:9' }
];

const Dropdown = ({ label, value, options, onChange, isMulti = false }: {
  label: string,
  value: string | string[],
  options: { id: string, name: string }[],
  onChange: (val: any) => void,
  isMulti?: boolean
}) => {
  const displayValue = isMulti 
    ? ((value as string[]).length === 0 ? '未选择' : (value as string[]).map(id => options.find(o => o.id === id)?.name || id).join(', '))
    : (options.find(o => o.id === value)?.name || value);

  return (
    <div className="flex flex-col gap-1.5 relative group">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</span>
      <div className="relative">
        <button className="text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 hover:border-primary/30 transition-all w-full text-left flex items-center justify-between">
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-[60] hidden group-hover:block p-2 max-h-48 overflow-y-auto no-scrollbar">
          {options.map(opt => {
            const isSelected = isMulti ? (value as string[]).includes(opt.id) : value === opt.id;
            return (
              <div 
                key={opt.id}
                onClick={() => {
                  if (isMulti) {
                    const next = isSelected 
                      ? (value as string[]).filter(id => id !== opt.id)
                      : [...(value as string[]), opt.id];
                    onChange(next);
                  } else {
                    onChange(opt.id);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-[10px] font-bold transition-all ${isSelected ? 'bg-primary/5 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200'}`}>
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
                {opt.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface RequirementDetailProps {
  requirement: Requirement;
  onClose: () => void;
}

const RequirementDetail: React.FC<RequirementDetailProps> = ({ requirement: initialReq, onClose }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'clip'>('script');
  const [rightTab, setRightTab] = useState<'iteration' | 'schedule'>('schedule');
  const [currentReq, setCurrentReq] = useState<Requirement>(() => {
    const base: Requirement = {
      ...initialReq,
      projectName: initialReq.projectName || 'Panthia',
      assetType: initialReq.assetType || 'Video',
      assetIndex: initialReq.assetIndex || 3376,
      assetVersion: initialReq.assetVersion || '01',
      creativePersonnel: initialReq.creativePersonnel || '马嘉良',
      productionPersonnel: initialReq.productionPersonnel || ['张欢'],
      language: initialReq.language || 'en',
      channels: initialReq.channels || ['all'],
      testDirections: initialReq.testDirections || ['前贴'],
      dimensions: initialReq.dimensions || ['916'],
      broadDirection: initialReq.broadDirection || '原始玩法',
      materialStage: initialReq.materialStage || '新',
      
      masterVersion: initialReq.masterVersion || '-',
      aTags: initialReq.aTags || [],
      bTags: initialReq.bTags || [],
      difficulty: initialReq.difficulty || 'C',
      tasks: initialReq.tasks || [],
      subVersions: initialReq.subVersions && initialReq.subVersions.length >= 5 
        ? initialReq.subVersions 
        : [
            { version: '01', name: '3683口播大字报换山下湖泊背景', testDirections: ['前贴'] },
            { version: '02', name: '3684口播大字报换蔚蓝海滩背景', testDirections: ['中贴'] },
            { version: '03', name: '3685口播大字报换繁茂森林背景', testDirections: ['后贴'] },
            { version: '04', name: '3686口播大字报换无垠星空背景', testDirections: ['前贴'] },
            { version: '05', name: '3687口播大字报换皑皑雪山背景', testDirections: ['中贴'] }
          ]
    };

    if (!base.script) {
      base.script = '### 1. 叙事结构\n\n### 2. 开头钩子 / 吸量元素\n\n### 3. 用户核心痛点\n\n### 4. 玩法\n\n### 5. 场景和人设化内容说明';
    }

    return base;
  });

  const [isEditingScript, setIsEditingScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'deleted' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubVersionsModal, setShowSubVersionsModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setToast({ message: '📋 已成功复制到剪贴板！', type: 'success' });
      setTimeout(() => {
        setCopiedText(null);
        setToast(null);
      }, 1500);
    }).catch(() => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedText(text);
        setToast({ message: '📋 已成功复制到剪贴板！', type: 'success' });
      } catch (err) {
        console.error('Fallback copy failing', err);
      }
      document.body.removeChild(textArea);
      setTimeout(() => {
        setCopiedText(null);
        setToast(null);
      }, 1500);
    });
  };

  const subVersions = useMemo(() => {
    if (currentReq.subVersions && currentReq.subVersions.length >= 5) {
      return currentReq.subVersions;
    }
    return [
      { version: '01', name: '3683口播大字报换山下湖泊背景', testDirections: ['前贴'] },
      { version: '02', name: '3684口播大字报换蔚蓝海滩背景', testDirections: ['中贴'] },
      { version: '03', name: '3685口播大字报换繁茂森林背景', testDirections: ['后贴'] },
      { version: '04', name: '3686口播大字报换无垠星空背景', testDirections: ['前贴'] },
      { version: '05', name: '3687口播大字报换皑皑雪山背景', testDirections: ['中贴'] }
    ];
  }, [currentReq.subVersions]);

  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    platform: string;
    reason: string;
    time: string;
    version: string;
    dim: string;
  } | null>(null);

  const uploadHistory = useMemo(() => [
    {
      platform: 'Applovin',
      versions: [
        { version: 'V3', dims: [
          { dim: '9:16', status: 'Pending', time: '2026-03-04 10:30' },
          { dim: '1:1', status: 'Pending', time: '2026-03-04 10:30' },
          { dim: '16:9', status: 'Pending', time: '2026-03-04 10:30' },
        ]},
        { version: 'V2', dims: [
          { dim: '9:16', status: 'Approved', time: '2026-03-03 15:45' },
          { dim: '16:9', status: 'Approved', time: '2026-03-03 15:45' },
        ]},
        { version: 'V1', dims: [
          { 
            dim: '9:16', 
            status: 'Rejected', 
            time: '2026-03-02 14:20',
            rejectionDetail: {
              reason: 'Intellectual Property Violation',
              time: '2026-03-02 16:00'
            }
          },
          { dim: '1:1', status: 'Approved', time: '2026-03-02 14:20' },
          { dim: '16:9', status: 'Approved', time: '2026-03-02 14:20' },
        ]},
      ]
    },
    {
      platform: 'Google',
      versions: [
        { version: 'V3', dims: [
          { dim: '9:16', status: 'Pending', time: '2026-03-04 10:30' },
        ]}
      ]
    }
  ], []);

  const allVersions = useMemo(() => {
    const versionsSet = new Set<string>();
    uploadHistory.forEach(p => p.versions.forEach(v => versionsSet.add(v.version)));
    return Array.from(versionsSet).sort().reverse();
  }, [uploadHistory]);

  const handleSave = () => {
    setToast({ message: '✍️ 需求更改已成功保存！', type: 'success' });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const handleExit = () => {
    setToast({ message: '💾 保存成功，正在关闭弹窗...', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    setToast({ message: '🗑️ 需求已被成功删除 (Requirement Deleted)!', type: 'deleted' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const fullName = generateFullName(currentReq);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Area */}
      <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-2 max-w-[75%]">
          <div className="flex items-center gap-3 flex-wrap">
             <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0">
                {currentReq.projectName}
             </span>
             
             <button
               type="button"
               onClick={() => setShowSubVersionsModal(true)}
               className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-[11px] font-black text-indigo-700 transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer select-none"
               title="点击查看所有小版本"
             >
               <span>📂</span>
               <span>{subVersions.length} 个小版本</span>
               <span className="text-[9px] bg-indigo-200/50 text-indigo-800 font-bold px-1 rounded">查看 & 复制</span>
             </button>
          </div>
          
          <div className="flex items-center gap-2 mt-1 max-w-full">
             <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight font-mono select-all break-all" title={getFolderFormatName(currentReq)}>
               {getFolderFormatName(currentReq)}
             </h1>
             <button 
               type="button"
               onClick={() => handleCopyText(getFolderFormatName(currentReq))}
               className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-4xs"
               title="复制父文件夹名称"
             >
               <Copy className="w-3.5 h-3.5" />
             </button>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            <span className="flex items-center gap-1.5"><Layout className="w-3 h-3" /> {currentReq.assetType}</span>
            <span className="flex items-center gap-1.5"><Settings className="w-3 h-3" /> {currentReq.materialStage}阶段</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {currentReq.language}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">创意人员 CREATIVE</span>
            <div className="flex items-center gap-2">
               <span className="text-xs font-black text-slate-700">{currentReq.creativePersonnel}</span>
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] border border-primary/20">
                 {getInitials(currentReq.creativePersonnel).toUpperCase()}
               </div>
            </div>
          </div>
          
          <div className="w-[1px] h-10 bg-slate-100"></div>

          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Global Config Area */}
      <div className="px-8 py-5 bg-white border-b border-slate-100 shadow-sm shrink-0">
        <div className="grid grid-cols-6 gap-6">
          <Dropdown 
            label="素材阶段" 
            value={currentReq.materialStage} 
            options={MATERIAL_STAGES} 
            onChange={(val) => setCurrentReq({...currentReq, materialStage: val})} 
          />
          <Dropdown 
            label="素材大方向" 
            value={currentReq.broadDirection} 
            options={BROAD_DIRECTIONS} 
            onChange={(val) => {
              const newChannels = val === '大字报' ? ['apl'] : currentReq.channels;
              setCurrentReq({...currentReq, broadDirection: val, channels: newChannels});
            }} 
          />
          <Dropdown 
            label="语言" 
            value={currentReq.language} 
            options={LANGUAGES} 
            onChange={(val) => setCurrentReq({...currentReq, language: val})} 
          />
          <Dropdown 
            label="投放渠道" 
            value={currentReq.channels} 
            options={CHANNELS} 
            isMulti 
            onChange={(val) => setCurrentReq({...currentReq, channels: val})} 
          />
          <Dropdown 
            label="尺寸" 
            value={currentReq.dimensions} 
            options={DIMENSIONS_LIST} 
            isMulti 
            onChange={(val) => setCurrentReq({...currentReq, dimensions: val})} 
          />
          <Dropdown 
            label="验证方向" 
            value={currentReq.testDirections} 
            options={TEST_DIRECTIONS.map(d => ({ id: d, name: d }))} 
            isMulti 
            onChange={(val) => setCurrentReq({...currentReq, testDirections: val})} 
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left 2/3 Area */}
        <div className="flex-[2] flex flex-col border-r border-slate-100 overflow-hidden">
          <div className="px-8 pt-4 bg-white border-b border-slate-100 flex items-center gap-8 shrink-0">
            <button 
              onClick={() => setActiveTab('clip')}
              className={`pb-3 text-xs font-black transition-all relative ${activeTab === 'clip' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              成片 (FINISHED)
              {activeTab === 'clip' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('script')}
              className={`pb-3 text-xs font-black transition-all relative ${activeTab === 'script' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              需求脚本 (SCRIPT)
              {activeTab === 'script' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20">
            {activeTab === 'clip' ? (
              <div className="p-6 space-y-8">
                {/* Version Previews */}
                <section className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">成片预览 (VERSIONS)</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {allVersions.map((v) => (
                      <div key={v} className="w-48 shrink-0 space-y-2 group">
                        <div className="aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden relative shadow-md border border-slate-200">
                          <img src={currentReq.previews?.[0] || 'https://picsum.photos/270/480'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20">
                            <Play className="w-10 h-10 text-white fill-white" />
                          </div>
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[9px] font-bold rounded uppercase">{v}</div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 text-center">Version {v.replace('V', '')}</p>
                      </div>
                    ))}
                  </div>
                </section>
                
                {/* Upload Records */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">上传记录 (UPLOAD HISTORY)</h3>
                  {uploadHistory.map((platformGroup) => (
                    <div key={platformGroup.platform} className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black text-slate-800">{platformGroup.platform}</span>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-3 w-32">版本</th>
                              <th className="px-6 py-3 w-32">尺寸</th>
                              <th className="px-6 py-3">过审情况</th>
                              <th className="px-6 py-3">上传时间</th>
                              <th className="px-6 py-3 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-[11px]">
                            {platformGroup.versions.map((v) => (
                              <React.Fragment key={v.version}>
                                {v.dims.map((dimData, dimIdx) => (
                                  <tr key={`${v.version}-${dimData.dim}`} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                      {dimIdx === 0 && (
                                        <div className="flex items-center gap-2">
                                          <div className="w-1 h-4 bg-primary rounded-full"></div>
                                          <span className="font-black text-slate-900 text-xs">Version {v.version.replace('V', '')}</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <Monitor className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-bold text-slate-600">{dimData.dim}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                          dimData.status === 'Approved' ? 'bg-emerald-500' : 
                                          dimData.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                                        }`}></div>
                                        <span className={`font-bold ${
                                          dimData.status === 'Approved' ? 'text-emerald-600' : 
                                          dimData.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'
                                        }`}>
                                          {dimData.status === 'Approved' ? '已通过' : 
                                           dimData.status === 'Rejected' ? '未过审' : '审核中'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-medium">{dimData.time}</td>
                                    <td className="px-6 py-4 text-right">
                                       <button className="text-primary font-black hover:underline">详情</button>
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            ) : (
              <div className="p-6">
                <RequirementScriptWorkbench
                  requirement={currentReq}
                  onRequirementChange={setCurrentReq}
                  subVersions={subVersions}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/10">
          <div className="px-8 pt-4 bg-white border-b border-slate-100 flex items-center gap-8 shrink-0">
            <button 
              onClick={() => setRightTab('iteration')}
              className={`pb-3 text-xs font-black transition-all relative ${rightTab === 'iteration' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              迭代记录
              {rightTab === 'iteration' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
            <button 
              onClick={() => setRightTab('schedule')}
              className={`pb-3 text-xs font-black transition-all relative ${rightTab === 'schedule' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              制作排期
              {rightTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            {rightTab === 'iteration' ? (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><Layers className="w-5 h-5 text-slate-400" /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-700">迭代自: cp3632-01</span>
                    <span className="text-[9px] text-slate-400">原始玩法需求</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">任务难度</span>
                  <div className="flex gap-1">
                    {['S', 'A', 'B', 'C'].map(d => (
                      <button 
                        key={d}
                        onClick={() => setCurrentReq({...currentReq, difficulty: d as any})}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentReq.difficulty === d ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">排期列表</h4>
                  {currentReq.tasks?.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-[10px]">
                      <div className="flex justify-between font-black text-slate-700">
                        <span>{task.type}</span>
                        <span>{task.designer}</span>
                      </div>
                      <div className="text-slate-400 mt-1">{task.startDate} ~ {task.endDate}</div>
                    </div>
                  ))}
                  <button className="w-full py-2 bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-xl text-[10px] font-black hover:bg-slate-100 transition-all">+ 新增排期</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100"><ChevronLeft className="w-5 h-5" /></button>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="px-8 py-3 bg-primary text-white text-xs font-black rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> 保存需求
          </button>
          <button onClick={handleExit} className="px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all">确认并退出</button>
          <button onClick={handleDelete} className="p-3 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Rejection Modal would go here */}
      
      {/* Custom Toast Notification Panel */}
      {toast && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[300] bg-slate-900/95 text-white border border-slate-800/60 rounded-2xl px-5 py-3 shadow-xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] font-extrabold text-slate-100 tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Classy Deletion Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[250] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-150 p-6.5 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col gap-4.5 text-center animate-in zoom-in-95 duration-200 mx-4">
            <div className="w-11 h-11 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-850 mb-1">确定要彻底删除该创意吗？</h3>
              <p className="text-[11px] font-bold text-slate-450 leading-relaxed px-2">该需求与制作进度将被永久删除且无法撤销。</p>
            </div>
            <div className="flex gap-2.5 mt-1">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-250/20 text-slate-600 rounded-xl text-xs font-black transition-all border border-slate-200 shadow-3xs"
              >
                返回
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-rose-500/10"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-versions list Modal */}
      {showSubVersionsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[24px] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-lg shadow-sm">
                  📁
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    小版本名称列表 <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg">{subVersions.length} 个版本</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">点击右侧按钮复制各创意文件名</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allNames = subVersions.map(sub => getSubVersionFormatName(currentReq, sub)).join('\n');
                    navigator.clipboard.writeText(allNames).then(() => {
                      setToast({ message: '📋 已成功一键复制全部 5 个版本！', type: 'success' });
                      setTimeout(() => setToast(null), 1500);
                    });
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black tracking-tight transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer select-none border-none"
                  title="一键复制全部 5 个版本"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>一键复制全部 ({subVersions.length})</span>
                </button>
                <button 
                  onClick={() => setShowSubVersionsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer border-none"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Scroll List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {subVersions.map((sub, idx) => {
                const subVerName = getSubVersionFormatName(currentReq, sub);
                const isCopied = copiedText === subVerName;
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 hover:bg-indigo-50/20 border border-slate-150 hover:border-indigo-150 p-4 rounded-2xl transition-all group relative border-l-4 border-l-slate-300 hover:border-l-indigo-500"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-[9px] font-black rounded-lg uppercase tracking-wide">
                          Version {sub.version}
                        </span>
                        <span className="text-[11px] font-black text-slate-600 truncate" title={sub.name}>
                          {sub.name}
                        </span>
                      </div>
                      <div 
                        className="font-mono text-[10.5px] font-bold text-slate-700 select-all break-all bg-white border border-slate-205 rounded-xl px-3 py-2 shadow-4xs group-hover:border-indigo-100 transition-all cursor-text leading-relaxed" 
                        title={subVerName}
                      >
                        {subVerName}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyText(subVerName)}
                      className={`px-3.5 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer select-none transition-all sm:shrink-0 border self-end sm:self-center h-9 ${
                        isCopied 
                          ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600' 
                          : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200 hover:border-indigo-100/50 hover:text-indigo-700'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制名称</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/50 rounded-b-[24px]">
              <button 
                onClick={() => setShowSubVersionsModal(false)}
                className="px-6 py-2 bg-slate-200/80 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all cursor-pointer border-none shadow-3xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementDetail;
