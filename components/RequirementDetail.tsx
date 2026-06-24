
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  X, ChevronDown, Check, Plus, User, 
  Share2, Save, ArrowLeft, ArrowRight, Layers, Trash2,
  Monitor, Play, Globe, UserCircle2, BarChart3, Clock,
  MoreVertical, Copy, RotateCcw, Lightbulb, Zap, Scissors, RefreshCw, FilePlus,
  ChevronLeft, ChevronRight, ChevronUp, CheckCircle2, AlertCircle, XCircle, Star, Search, Info, Edit2, CalendarDays, Upload
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Requirement, RequirementReqStatus, RequirementProdStatus, ScriptSection,
  RequirementStageType, ProductionTask, PROJECTS, CHANNELS
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

const CREATIVE_PEOPLE = ['唐欣怡', '吉意煊', '马嘉良'];

const PERSON_AVATAR_URLS: Record<string, string> = {
  '唐欣怡': '/avatars/tang-xinyi.png',
  '吉意煊': '/avatars/ji-yixuan.png',
  '马嘉良': '/avatars/ma-jialiang.png',
  '张欢': '/avatars/zhang-huan.png',
  '何思乔': '/avatars/he-siqiao.png'
};

const getPersonAvatarUrl = (name?: string) => {
  const normalizedName = name || 'unknown';
  return (
    PERSON_AVATAR_URLS[normalizedName] ||
    `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(normalizedName)}`
  );
};

const getAssetTypeLabel = (assetType: Requirement['assetType']) => {
  if (assetType === 'Image') return '图片';
  if (assetType === 'Playable') return '试玩';
  return '视频';
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

const getSubVersionSizedFormatName = (
  req: Requirement,
  subVer: { version: string; name: string },
  dimension: string,
) => `${getSubVersionFormatName(req, subVer)}-${dimension.replace(/[^0-9]/g, '')}`;

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
  { id: '新', name: '新' },
  { id: '迭', name: '迭' },
  { id: '老', name: '老' }
];

const BROAD_DIRECTIONS = [
  { id: '大字报', name: '大字报' },
  { id: '原始玩法', name: '原始玩法' },
  { id: '3D玩法', name: '3D玩法' }
];

const REQUIREMENT_STATUSES = [
  { id: 'Draft', name: '草稿' },
  { id: 'Pending', name: '待审核' },
  { id: 'Approved', name: '审核通过' },
  { id: 'Modification', name: '需求修改' },
];

const PRODUCTION_STATUSES = [
  { id: 'Unscheduled', name: '未排期' },
  { id: 'Scheduled', name: '已排期' },
  { id: 'InProgress', name: '进行中' },
  { id: 'Completed', name: '已完成' },
];

const TASK_STATUSES = ['待排期', '已排期', '制作中', '已完成'];
const PRODUCTION_ROLE_OPTIONS: Array<{
  role: string;
  type: ProductionTask['type'];
}> = [
  { role: '平面', type: 'Graphic' },
  { role: '合成', type: 'Composition' },
  { role: '视频', type: 'Composition' },
  { role: '程序', type: 'Program' },
  { role: '模型', type: 'Model3D' },
  { role: '地编', type: 'Scene3D' },
  { role: 'AI', type: 'AI' },
  { role: '其它', type: 'Other' },
  { role: '其他', type: 'Other' },
];

const SCHEDULE_ROLE_PRESETS: Array<{
  role: string;
  type: ProductionTask['type'];
  className: string;
  accentClassName: string;
}> = [
  {
    role: '平面',
    type: 'Graphic',
    className: 'bg-emerald-500 text-white',
    accentClassName: 'text-emerald-600',
  },
  {
    role: '合成',
    type: 'Composition',
    className: 'bg-amber-500 text-white',
    accentClassName: 'text-amber-600',
  },
  {
    role: 'AI',
    type: 'AI',
    className: 'bg-rose-500 text-white',
    accentClassName: 'text-rose-600',
  },
  {
    role: '其它',
    type: 'Other',
    className: 'bg-violet-500 text-white',
    accentClassName: 'text-violet-600',
  },
];

const getScheduleRolePreset = (role?: string, type?: ProductionTask['type']) => {
  if (role === '视频' || type === 'Composition') return SCHEDULE_ROLE_PRESETS[1];
  if (role === '其他') return SCHEDULE_ROLE_PRESETS[3];
  return (
    SCHEDULE_ROLE_PRESETS.find(preset => preset.role === role || preset.type === type) ||
    SCHEDULE_ROLE_PRESETS[3]
  );
};
const PRODUCER_GROUPS: Record<string, string[]> = {
  '美宣-平面': ['宋子仪', '吕远林', '王金瑞', '王春华', '李珊姗'],
  '美宣-AI': ['宋爽'],
  '美宣-2D': ['曲冬丽', '张欢', '郭峰', '王佳鸿', '吴楠', '周进易', '邓莉', '蒋天宇', '张雨学', '张澳', '朱奇杰'],
  '美宣-3D': ['刘洋', '孙崇洋', '张永进'],
  '程序': ['李嘉鑫', '肖环宇'],
};
const PRODUCER_GROUP_LABELS: Record<string, string> = {
  '美宣-平面': '平面',
  '美宣-AI': 'AI',
  '美宣-2D': '合成 / 2D',
  '美宣-3D': '3D',
  '程序': '程序',
};
const INACTIVE_PRODUCERS = new Set(['王春华', '李珊姗', '宋爽', '周进易', '邓莉', '蒋天宇', '张雨学', '张澳', '朱奇杰']);
const PRODUCTION_PEOPLE = Object.keys(PRODUCER_ALIASES).map(name => {
  const group = Object.entries(PRODUCER_GROUPS).find(([, members]) => members.includes(name))?.[0] || '其他';
  return {
    id: name,
    name,
    group,
    isActive: !INACTIVE_PRODUCERS.has(name),
  };
});

const getRecommendedProducerGroups = (task: ProductionTask) => {
  const role = `${task.role || task.type}`;
  if (role.includes('程序') || role.includes('Program')) return ['程序'];
  if (role.includes('模型') || role.includes('地编') || role.includes('3D')) return ['美宣-3D'];
  if (role.includes('AI')) return ['美宣-AI'];
  if (role.includes('平面') || role.includes('Graphic')) return ['美宣-平面', '美宣-AI'];
  return ['美宣-2D'];
};

const getProducerOptionGroups = (task: ProductionTask) => {
  const recommendedGroups = new Set(getRecommendedProducerGroups(task));
  return Object.keys(PRODUCER_GROUPS)
    .map(group => ({
      group,
      label: PRODUCER_GROUP_LABELS[group] || group,
      isRecommended: recommendedGroups.has(group),
      people: PRODUCTION_PEOPLE.filter(person => person.isActive && person.group === group),
    }))
    .filter(group => group.people.length > 0)
    .sort((a, b) => Number(b.isRecommended) - Number(a.isRecommended));
};

const getProductionTypeByRole = (role: string): ProductionTask['type'] => {
  return PRODUCTION_ROLE_OPTIONS.find(option => option.role === role)?.type || 'Other';
};

const summarizeProductionStatus = (req: Requirement): RequirementProdStatus => {
  const tasks = req.tasks || [];
  if (tasks.length === 0) return req.prodStatus || 'Unscheduled';
  if (tasks.every(task => task.status === '已完成')) return 'Completed';
  if (tasks.some(task => task.status === '制作中')) return 'InProgress';
  if (req.prodStatus === 'Unscheduled') return 'Unscheduled';
  return 'Scheduled';
};

const normalizePlannedTaskStatus = (task: ProductionTask): string => {
  if (task.status === '制作中' || task.status === '已完成') return task.status;
  if (task.designer && task.startDate && task.endDate) return '已排期';
  return task.status || '待排期';
};

const getDifficultyEstimatedHours = (
  task: Pick<ProductionTask, 'role' | 'type'>,
  difficulty: Requirement['difficulty'] = 'C',
) => {
  const role = `${task.role || task.type || ''}`;
  const level = difficulty || 'C';
  const presets: Record<string, Record<string, number>> = {
    Graphic: { S: 12, A: 8, B: 5, C: 3 },
    Composition: { S: 16, A: 10, B: 6, C: 4 },
    AI: { S: 8, A: 5, B: 3, C: 2 },
    Program: { S: 20, A: 14, B: 8, C: 5 },
    Model3D: { S: 18, A: 12, B: 8, C: 4 },
    Scene3D: { S: 18, A: 12, B: 8, C: 4 },
    Other: { S: 8, A: 5, B: 3, C: 2 },
  };

  if (role.includes('平面')) return presets.Graphic[level] || presets.Graphic.C;
  if (role.includes('合成') || role.includes('视频')) return presets.Composition[level] || presets.Composition.C;
  if (role.includes('AI')) return presets.AI[level] || presets.AI.C;
  if (role.includes('程序')) return presets.Program[level] || presets.Program.C;
  if (role.includes('模型')) return presets.Model3D[level] || presets.Model3D.C;
  if (role.includes('地编') || role.includes('3D')) return presets.Scene3D[level] || presets.Scene3D.C;
  return presets[task.type || 'Other']?.[level] || presets.Other.C;
};

const deriveRequirementFromTasks = (req: Requirement, tasks: ProductionTask[]): Requirement => {
  const assignedPeople = Array.from(new Set(tasks.map(task => task.designer).filter(Boolean)));
  const startDates = tasks.map(task => task.startDate).filter(Boolean).sort();
  const endDates = tasks.map(task => task.endDate).filter(Boolean).sort();
  const nextReq = {
    ...req,
    tasks,
    productionPersonnel: assignedPeople.length > 0 ? assignedPeople : req.productionPersonnel,
    startDate: startDates[0] || req.startDate,
    endDate: endDates[endDates.length - 1] || req.endDate,
  };
  return {
    ...nextReq,
    prodStatus: summarizeProductionStatus(nextReq),
  };
};

const LANGUAGES = [
  { id: 'en', name: 'en（英语）' },
  { id: 'de', name: 'de（德语）' },
  { id: 'fr', name: 'fr（法语）' },
  { id: 'it', name: 'it（意语）' },
  { id: 'jp', name: 'jp（日语）' },
  { id: 'kr', name: 'kr（韩语）' },
  { id: 'tw', name: 'tw（繁中）' },
  { id: 'es', name: 'es（西语）' },
  { id: 'pt', name: 'pt（葡语）' }
];

const DIMENSIONS_LIST = [
  { id: '916', name: '9:16' },
  { id: '11', name: '1:1' },
  { id: '169', name: '16:9' }
];

interface ProductionScheduleContextItem {
  id: string;
  requirementId: string;
  displayRequirementId?: string;
  requirementName: string;
  priority?: string;
  role: string;
  producer: string;
  status: string;
  startDate: string;
  endDate: string;
}

const parseRequirementVersionId = (id: string) => {
  const match = id.match(/^([a-z]+\d+)-(\d{2})(?:$|-)/i);
  if (!match) return null;
  return {
    majorId: match[1],
    version: Number.parseInt(match[2], 10),
  };
};

const getRequirementMajorId = (req: Pick<Requirement, 'id' | 'assetIndex' | 'assetType'>) => {
  const parsed = parseRequirementVersionId(req.id);
  if (parsed) return parsed.majorId;
  const prefix = req.assetType === 'Image' ? 'tp' : req.assetType === 'Playable' ? 'sw' : 'cp';
  return `${prefix}${req.assetIndex}`;
};

const formatScheduledRequirementId = (requirement: Requirement, task?: ProductionTask) => {
  if (task?.version) return requirement.id;
  const subVersions = requirement.subVersions || [];
  if (subVersions.length <= 1) return requirement.id;

  const versionNumbers = subVersions
    .map(item => Number.parseInt(item.version, 10))
    .filter(value => Number.isFinite(value));
  const majorId = getRequirementMajorId(requirement);

  if (versionNumbers.length > 0) {
    return `${majorId}（${Math.min(...versionNumbers)}-${Math.max(...versionNumbers)}）`;
  }

  return `${majorId}（${subVersions.length}个）`;
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (dateStr?: string) => {
  if (!dateStr) return null;
  const time = new Date(`${dateStr}T00:00:00`).getTime();
  return Number.isNaN(time) ? null : time;
};

const addDaysToDateString = (dateStr: string, days: number) => {
  const base = new Date(`${dateStr}T00:00:00`);
  base.setDate(base.getDate() + days);
  return formatDateInput(base);
};

interface AvailabilityCalendarDay {
  dayNum: number;
  dateString: string;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
}

const getAvailabilityMonthWeeks = (year: number, month: number, todayDateString: string) => {
  const weeks: Array<{ days: AvailabilityCalendarDay[] }> = [];
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentDate = new Date(year, month - 1, 1 - startOffset);

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const days: AvailabilityCalendarDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const dateString = formatDateInput(currentDate);
      const dayOfWeekValue = currentDate.getDay();
      days.push({
        dayNum: currentDate.getDate(),
        dateString,
        isToday: dateString === todayDateString,
        isWeekend: dayOfWeekValue === 0 || dayOfWeekValue === 6,
        isCurrentMonth: currentDate.getMonth() + 1 === month,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push({ days });
  }

  return weeks;
};

const rangesOverlap = (
  startA?: string,
  endA?: string,
  startB?: string,
  endB?: string,
) => {
  const aStart = parseDateValue(startA);
  const aEnd = parseDateValue(endA) ?? aStart;
  const bStart = parseDateValue(startB);
  const bEnd = parseDateValue(endB) ?? bStart;
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) {
    return false;
  }
  return aStart <= bEnd && aEnd >= bStart;
};

const formatShortDateRange = (start?: string, end?: string) => {
  if (!start && !end) return '未定';
  const format = (dateStr?: string) => {
    if (!dateStr) return '';
    const [, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };
  return start === end ? format(start) : `${format(start)}-${format(end)}`;
};

const getScheduleGapHints = (
  occupiedTasks: ProductionScheduleContextItem[],
  horizonStart: string,
  horizonEnd: string,
) => {
  const startTime = parseDateValue(horizonStart);
  const endTime = parseDateValue(horizonEnd);
  if (startTime === null || endTime === null) return [];

  const sortedBusyRanges = occupiedTasks
    .map(item => ({
      start: Math.max(parseDateValue(item.startDate) ?? startTime, startTime),
      end: Math.min(parseDateValue(item.endDate) ?? parseDateValue(item.startDate) ?? startTime, endTime),
    }))
    .filter(range => range.end >= startTime && range.start <= endTime)
    .sort((a, b) => a.start - b.start);

  const gaps: Array<{ start: string; end: string; days: number }> = [];
  let cursor = startTime;

  sortedBusyRanges.forEach(range => {
    if (range.start > cursor) {
      const gapStart = new Date(cursor);
      const gapEnd = new Date(range.start - 86400000);
      const days = Math.max(1, Math.round((gapEnd.getTime() - gapStart.getTime()) / 86400000) + 1);
      gaps.push({
        start: formatDateInput(gapStart),
        end: formatDateInput(gapEnd),
        days,
      });
    }
    cursor = Math.max(cursor, range.end + 86400000);
  });

  if (cursor <= endTime) {
    const gapStart = new Date(cursor);
    const gapEnd = new Date(endTime);
    const days = Math.max(1, Math.round((gapEnd.getTime() - gapStart.getTime()) / 86400000) + 1);
    gaps.push({
      start: formatDateInput(gapStart),
      end: formatDateInput(gapEnd),
      days,
    });
  }

  return gaps;
};

const Dropdown = ({ label, value, options, onChange, isMulti = false, className = '' }: {
  label: string,
  value: string | string[],
  options: { id: string, name: string }[],
  onChange: (val: any) => void,
  isMulti?: boolean,
  className?: string
}) => {
  const displayValue = isMulti 
    ? ((value as string[]).length === 0 ? '未选择' : (value as string[]).map(id => options.find(o => o.id === id)?.name || id).join(', '))
    : (options.find(o => o.id === value)?.name || value);

  return (
    <div className={`flex flex-col gap-1.5 relative group ${className}`}>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</span>
      <div className="relative">
        <button className="text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 hover:border-primary/30 transition-all w-full text-left flex items-center justify-between">
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <div className="absolute left-0 right-0 top-[calc(100%-1px)] bg-white border border-slate-100 rounded-xl shadow-xl z-[60] hidden group-hover:block p-2 max-h-48 overflow-y-auto no-scrollbar">
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

const InlineInput = ({ label, value, onChange, className = '', placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-[34px] w-full rounded-xl border border-slate-100 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 hover:border-primary/30 focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10"
    />
  </div>
);

const openNativeDatePicker = (event: React.MouseEvent<HTMLInputElement>) => {
  (event.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
};

interface RequirementDetailProps {
  requirement: Requirement;
  onClose: () => void;
  onChange?: (requirement: Requirement) => void;
  onDelete?: (requirementId: string) => void;
  productionScheduleContext?: ProductionScheduleContextItem[];
  scheduleDeadline?: string;
}

const RequirementDetail: React.FC<RequirementDetailProps> = ({
  requirement: initialReq,
  onClose,
  onChange,
  onDelete,
  productionScheduleContext = [],
  scheduleDeadline = '',
}) => {
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
      subVersions: initialReq.subVersions && initialReq.subVersions.length > 0 
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
  const [isCreativePersonnelMenuOpen, setIsCreativePersonnelMenuOpen] = useState(false);
  const creativePersonnelRef = useRef<HTMLDivElement>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityView, setAvailabilityView] = useState<'calendar' | 'gantt'>('calendar');
  const todayForAvailability = new Date();
  const [availabilityCalendarYear, setAvailabilityCalendarYear] = useState(todayForAvailability.getFullYear());
  const [availabilityCalendarMonth, setAvailabilityCalendarMonth] = useState(todayForAvailability.getMonth() + 1);
  const [availabilityProducerFilter, setAvailabilityProducerFilter] = useState<string[]>([]);
  const [isAvailabilityProducerMenuOpen, setIsAvailabilityProducerMenuOpen] = useState(false);
  const availabilityProducerFilterRef = useRef<HTMLDivElement>(null);
  const [selectedPreviewDimension, setSelectedPreviewDimension] = useState<string>('');
  const [showClipUploadModal, setShowClipUploadModal] = useState(false);
  const [isClipDragActive, setIsClipDragActive] = useState(false);

  const creativePersonnelOptions = useMemo(
    () => Array.from(new Set([currentReq.creativePersonnel, ...CREATIVE_PEOPLE].filter(Boolean))),
    [currentReq.creativePersonnel],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        creativePersonnelRef.current &&
        !creativePersonnelRef.current.contains(event.target as Node)
      ) {
        setIsCreativePersonnelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        availabilityProducerFilterRef.current &&
        !availabilityProducerFilterRef.current.contains(event.target as Node)
      ) {
        setIsAvailabilityProducerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    onChange?.(currentReq);
  }, [currentReq, onChange]);

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

  const handleClipUploadFiles = (files: FileList | File[]) => {
    const fileCount = files.length;
    if (fileCount > 0) {
      setToast({ message: `已添加 ${fileCount} 个成片文件，等待上传配置`, type: 'success' });
      setShowClipUploadModal(false);
      setIsClipDragActive(false);
      setTimeout(() => setToast(null), 1800);
    }
  };

  const subVersions = useMemo(() => {
    if (currentReq.subVersions && currentReq.subVersions.length > 0) {
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

  const [scheduleBySubVersion, setScheduleBySubVersion] = useState(() =>
    Boolean(initialReq.tasks?.some(task => task.version)),
  );

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
    },
    {
      platform: 'Facebook',
      versions: [
        { version: 'V2', dims: [
          { dim: '1:1', status: 'Approved', time: '2026-03-03 16:20' },
          { dim: '4:5', status: 'Approved', time: '2026-03-03 16:20' },
        ]},
        { version: 'V1', dims: [
          { dim: '9:16', status: 'Pending', time: '2026-03-02 17:05' },
        ]}
      ]
    }
  ], []);

  const getVersionSortValue = (version: string) => Number(version.replace(/\D/g, '')) || 0;

  const normalizeDimensionLabel = (dimension: string) => {
    const value = String(dimension || '').trim();
    const compactMap: Record<string, string> = {
      '916': '9:16',
      '169': '16:9',
      '11': '1:1',
      '45': '4:5',
      '54': '5:4',
    };
    return compactMap[value] || value.replace('×', ':').replace('x', ':');
  };

  const getDimensionSortValue = (dimension: string) => {
    const order = ['9:16', '1:1', '16:9', '4:5', '5:4'];
    const index = order.indexOf(dimension);
    return index === -1 ? order.length : index;
  };

  const previewDimensions = useMemo(() => {
    const dimensionSet = new Set<string>();
    (currentReq.dimensions || []).forEach((dimension) => dimensionSet.add(normalizeDimensionLabel(dimension)));
    uploadHistory.forEach((platformGroup) => {
      platformGroup.versions.forEach((versionRecord) => {
        versionRecord.dims.forEach((dimData) => dimensionSet.add(normalizeDimensionLabel(dimData.dim)));
      });
    });
    return Array.from(dimensionSet)
      .filter(Boolean)
      .sort((a, b) => getDimensionSortValue(a) - getDimensionSortValue(b));
  }, [currentReq.dimensions, uploadHistory]);

  useEffect(() => {
    if (!previewDimensions.length) return;
    if (!selectedPreviewDimension || !previewDimensions.includes(selectedPreviewDimension)) {
      setSelectedPreviewDimension(previewDimensions[0]);
    }
  }, [previewDimensions, selectedPreviewDimension]);

  const getPreviewAspectRatio = (dimension: string) => {
    const [width, height] = normalizeDimensionLabel(dimension).split(':').map(Number);
    if (!width || !height) return '9 / 16';
    return `${width} / ${height}`;
  };

  const getPreviewWidthForDimension = (dimension: string) => {
    const [width, height] = normalizeDimensionLabel(dimension).split(':').map(Number);
    if (!width || !height) return 158;
    return Math.max(158, Math.round((280 * width) / height));
  };

  const getDurationLabel = (duration?: string) => {
    const value = duration || '0:30';
    if (/秒$/.test(value)) return value;
    return `${value} 秒`;
  };

  const allVersions = useMemo(() => {
    const versionsSet = new Set<string>();
    uploadHistory.forEach(p => p.versions.forEach(v => versionsSet.add(v.version)));
    return Array.from(versionsSet).sort((a, b) => getVersionSortValue(a) - getVersionSortValue(b));
  }, [uploadHistory]);

  const deliveryRecords = useMemo(() => {
    const versionMap = new Map<string, {
      version: string;
      channelGroups: {
        platform: string;
        sizes: { dim: string; reviewStatus: string; deliveryStatus: string; time: string }[];
      }[];
    }>();

    uploadHistory.forEach((platformGroup) => {
      platformGroup.versions.forEach((versionRecord) => {
        const record = versionMap.get(versionRecord.version) || {
          version: versionRecord.version,
          channelGroups: [],
        };
        record.channelGroups.push({
          platform: platformGroup.platform,
          sizes: versionRecord.dims.map((dimData) => ({
            dim: dimData.dim,
            reviewStatus: dimData.status,
            deliveryStatus:
              dimData.status === 'Approved'
                ? 'Delivering'
                : dimData.status === 'Rejected'
                  ? 'NotLaunched'
                  : 'Waiting',
            time: dimData.time,
          })),
        });
        versionMap.set(versionRecord.version, record);
      });
    });

    return Array.from(versionMap.values()).sort((a, b) => getVersionSortValue(a.version) - getVersionSortValue(b.version));
  }, [uploadHistory]);

  const getReviewStatusText = (status: string) => {
    if (status === 'Approved') return '已通过';
    if (status === 'Rejected') return '未过审';
    return '审核中';
  };

  const getReviewStatusClass = (status: string) => {
    if (status === 'Approved') return 'bg-emerald-500 text-emerald-600';
    if (status === 'Rejected') return 'bg-red-500 text-red-600';
    return 'bg-amber-500 text-amber-600';
  };

  const getDeliveryStatusText = (status: string) => {
    if (status === 'Delivering') return '投放中';
    if (status === 'NotLaunched') return '未投放';
    return '待投放';
  };

  const getDeliveryStatusClass = (status: string) => {
    if (status === 'Delivering') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (status === 'NotLaunched') return 'bg-slate-50 text-slate-400 border-slate-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

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
    onDelete?.(currentReq.id);
      setToast({ message: '需求已成功删除', type: 'deleted' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const updateProductionTask = (
    taskId: string,
    updates: Partial<ProductionTask>,
  ) => {
    const nextTasks = (currentReq.tasks || []).map(task => {
      if (task.id !== taskId) return task;
      const nextTask = {
        ...task,
        ...updates,
      };
      return {
        ...nextTask,
        status: updates.status || normalizePlannedTaskStatus(nextTask),
      };
    });
    setCurrentReq(deriveRequirementFromTasks(currentReq, nextTasks));
  };

  const addProductionTask = (
    version?: { version: string; name: string },
    preset = SCHEDULE_ROLE_PRESETS[3],
  ) => {
    const taskIndex = (currentReq.tasks || []).length + 1;
    const estimatedHours = getDifficultyEstimatedHours(
      { role: preset.role, type: preset.type },
      currentReq.difficulty,
    );
    const nextTask: ProductionTask = {
      id: `${currentReq.id}-custom-${Date.now()}${version ? `-${version.version}` : ''}`,
      type: preset.type,
      role: preset.role || `补充任务 ${taskIndex}`,
      status: '待排期',
      designer: '',
      startDate: '',
      endDate: '',
      duration: `${estimatedHours}H`,
      estimatedWorkDays: estimatedHours,
      dependencyIds: [],
      version: version?.version,
      versionName: version?.name,
    };
    setCurrentReq(deriveRequirementFromTasks(currentReq, [...(currentReq.tasks || []), nextTask]));
  };

  const removeProductionTask = (taskId: string) => {
    const nextTasks = (currentReq.tasks || []).filter(task => task.id !== taskId);
    setCurrentReq(deriveRequirementFromTasks(currentReq, nextTasks));
  };

  const moveProductionTask = (taskId: string, direction: -1 | 1) => {
    setCurrentReq(prev => {
      const tasks = [...(prev.tasks || [])];
      const currentIndex = tasks.findIndex(task => task.id === taskId);
      if (currentIndex < 0) return prev;

      const currentTask = tasks[currentIndex];
      const currentVersion = currentTask.version || '';
      const groupIndexes = tasks
        .map((task, index) => ((task.version || '') === currentVersion ? index : -1))
        .filter(index => index >= 0);
      const groupPosition = groupIndexes.indexOf(currentIndex);
      const targetPosition = groupPosition + direction;
      if (targetPosition < 0 || targetPosition >= groupIndexes.length) return prev;

      const targetIndex = groupIndexes[targetPosition];
      [tasks[currentIndex], tasks[targetIndex]] = [tasks[targetIndex], tasks[currentIndex]];
      return deriveRequirementFromTasks(prev, tasks);
    });
  };

  const handleToggleSubVersionSchedule = (enabled: boolean) => {
    setScheduleBySubVersion(enabled);
    setCurrentReq(prev => {
      const tasks = prev.tasks || [];
      if (enabled) {
        const baseTasks = tasks.some(task => !task.version)
          ? tasks.filter(task => !task.version)
          : tasks.filter(task => task.version === subVersions[0]?.version).map(task => ({
              ...task,
              version: undefined,
              versionName: undefined,
            }));
        const sourceTasks = baseTasks.length > 0 ? baseTasks : tasks;
        const nextTasks = subVersions.flatMap(version =>
          sourceTasks.map(task => ({
            ...task,
            id: `${prev.id}-${version.version}-${task.type}-${task.role || 'task'}`,
            version: version.version,
            versionName: version.name,
          })),
        );
        return deriveRequirementFromTasks(prev, nextTasks);
      }

      const firstVersion = subVersions[0]?.version;
      const sourceTasks = tasks.filter(task => !task.version || task.version === firstVersion);
      const nextTasks = sourceTasks.map(task => ({
        ...task,
        id: task.id.replace(`-${firstVersion}-`, '-'),
        version: undefined,
        versionName: undefined,
      }));
      return deriveRequirementFromTasks(prev, nextTasks);
    });
  };

  const scheduleTaskGroups = useMemo(() => {
    const tasks = currentReq.tasks || [];
    if (!scheduleBySubVersion) {
      return [{
        key: 'major',
        title: '大版本排期',
        subtitle: '默认对整条需求排期，所有小版本共用这组人员和时间。',
        tasks: tasks.filter(task => !task.version),
        version: undefined,
      }];
    }

    return subVersions.map(version => ({
      key: version.version,
      title: `v${version.version}`,
      subtitle: version.name,
      tasks: tasks.filter(task => task.version === version.version),
      version,
    }));
  }, [currentReq.tasks, scheduleBySubVersion, subVersions]);

  const todayDateString = useMemo(() => formatDateInput(new Date()), []);
  const scheduleHorizonEnd = useMemo(
    () => addDaysToDateString(todayDateString, 13),
    [todayDateString],
  );

  const currentRequirementScheduleItems = useMemo(
    () =>
      (currentReq.tasks || [])
        .filter((item) => item.designer && item.startDate && item.endDate)
        .map((item) => ({
          id: `${currentReq.id}:draft:${item.id}`,
          requirementId: currentReq.id,
          displayRequirementId: formatScheduledRequirementId(currentReq, item),
          requirementName: `${currentReq.name}${item.version ? ` / v${item.version}` : ''}`,
          priority: currentReq.priority,
          role: getScheduleRolePreset(item.role, item.type).role,
          producer: item.designer,
          status: item.status || '待排期',
          startDate: item.startDate,
          endDate: item.endDate,
        })),
    [currentReq],
  );

  const getTaskScheduleContext = (task: ProductionTask) => {
    if (!task.designer) {
      return {
        visibleTasks: [] as ProductionScheduleContextItem[],
        conflictingTasks: [] as ProductionScheduleContextItem[],
      };
    }

    const currentTaskContextId = `${currentReq.id}:${task.id}`;
    const visibleTasks = [...productionScheduleContext, ...currentRequirementScheduleItems]
      .filter((item) => {
        if (item.id === currentTaskContextId) return false;
        if (item.id === `${currentReq.id}:draft:${task.id}`) return false;
        if (item.producer !== task.designer) return false;
        return rangesOverlap(
          item.startDate,
          item.endDate,
          todayDateString,
          scheduleHorizonEnd,
        );
      })
      .sort(
        (a, b) =>
          (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0),
      );

    const conflictingTasks =
      task.startDate && task.endDate
        ? visibleTasks.filter((item) =>
            rangesOverlap(item.startDate, item.endDate, task.startDate, task.endDate),
          )
        : [];

    return { visibleTasks, conflictingTasks };
  };

  const getTaskDateWarnings = (
    task: ProductionTask,
    conflictingTasks: ProductionScheduleContextItem[],
  ) => {
    const warnings: Array<{ tone: 'danger' | 'warning'; text: string }> = [];
    const startTime = parseDateValue(task.startDate);
    const endTime = parseDateValue(task.endDate);
    const deadlineTime = parseDateValue(scheduleDeadline);

    if (startTime !== null && endTime !== null && startTime > endTime) {
      warnings.push({ tone: 'danger', text: '开始时间晚于结束时间，请调整日期顺序。' });
    }
    if (deadlineTime !== null && endTime !== null && endTime > deadlineTime) {
      warnings.push({
        tone: 'danger',
        text: `结束时间超过方向制作截止 ${formatShortDateRange(scheduleDeadline, scheduleDeadline)}。`,
      });
    }
    if (task.designer && (!task.startDate || !task.endDate)) {
      warnings.push({
        tone: 'warning',
        text: '已选择负责人，但开始/结束时间还未补齐，保存后仍会视为待排期。',
      });
    }
    if (conflictingTasks.length > 0) {
      const currentReqConflicts = conflictingTasks.filter(item => item.id.startsWith(`${currentReq.id}:draft:`)).length;
      warnings.push({
        tone: currentReqConflicts > 0 ? 'danger' : 'warning',
        text: currentReqConflicts > 0
          ? `与当前需求内 ${currentReqConflicts} 个同人子任务撞期，请调整顺序或拆给其他人。`
          : `与 ${conflictingTasks.length} 个同人任务撞期，建议确认优先级或调整时间。`,
      });
    }

    return warnings;
  };

  const scheduleIssueSummary = useMemo(() => {
    const issues = (currentReq.tasks || []).flatMap((task) => {
      const { conflictingTasks } = getTaskScheduleContext(task);
      return getTaskDateWarnings(task, conflictingTasks).map((warning) => ({
        task,
        ...warning,
      }));
    });
    return {
      issues,
      dangerCount: issues.filter((issue) => issue.tone === 'danger').length,
      warningCount: issues.filter((issue) => issue.tone === 'warning').length,
    };
  }, [currentReq.tasks, currentRequirementScheduleItems, productionScheduleContext, scheduleDeadline, scheduleHorizonEnd, todayDateString]);

  const getRecommendedScheduleSlots = (task: ProductionTask) => {
    const estimatedHours =
      Number(task.estimatedWorkDays) ||
      parseFloat(task.duration || '') ||
      getDifficultyEstimatedHours(task, currentReq.difficulty);
    const requiredDays = Math.max(1, Math.ceil(estimatedHours / 8));
    const recommendedGroups = new Set(getRecommendedProducerGroups(task));
    const candidates = task.designer
      ? PRODUCTION_PEOPLE.filter(person => person.isActive && person.name === task.designer)
      : PRODUCTION_PEOPLE.filter(person => person.isActive && recommendedGroups.has(person.group));
    const fallbackCandidates =
      candidates.length > 0
        ? candidates
        : PRODUCTION_PEOPLE.filter(person => person.isActive);

    return fallbackCandidates
      .map(person => {
        const visibleTasks = [...productionScheduleContext, ...currentRequirementScheduleItems]
          .filter(item => {
            if (item.producer !== person.name) return false;
            if (item.id === `${currentReq.id}:draft:${task.id}`) return false;
            if (item.id === `${currentReq.id}:${task.id}`) return false;
            return rangesOverlap(
              item.startDate,
              item.endDate,
              todayDateString,
              scheduleHorizonEnd,
            );
          })
          .sort((a, b) => (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0));
        const gaps = getScheduleGapHints(
          visibleTasks,
          todayDateString,
          scheduleHorizonEnd,
        ).filter(gap => gap.days >= requiredDays);
        const firstGap = gaps[0];
        const startDate = firstGap?.start || todayDateString;
        const endDate = addDaysToDateString(startDate, requiredDays - 1);
        const busyDays = visibleTasks.reduce((sum, item) => {
          const start = parseDateValue(item.startDate);
          const end = parseDateValue(item.endDate) ?? start;
          if (start === null || end === null) return sum;
          return sum + Math.max(1, Math.round((end - start) / 86400000) + 1);
        }, 0);

        return {
          person,
          startDate,
          endDate,
          hours: estimatedHours,
          requiredDays,
          busyCount: visibleTasks.length,
          busyDays,
          hasGap: Boolean(firstGap),
        };
      })
      .sort((a, b) => {
        if (Number(b.hasGap) !== Number(a.hasGap)) return Number(b.hasGap) - Number(a.hasGap);
        return (
          (parseDateValue(a.startDate) || 0) -
            (parseDateValue(b.startDate) || 0) ||
          a.busyDays - b.busyDays ||
          a.busyCount - b.busyCount
        );
      })
      .slice(0, 3);
  };

  const availabilityRows = useMemo(() => {
    const visibleItems = [...productionScheduleContext, ...currentRequirementScheduleItems]
      .filter(item => rangesOverlap(item.startDate, item.endDate, todayDateString, scheduleHorizonEnd))
      .sort((a, b) => (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0));

    return PRODUCTION_PEOPLE
      .filter(person => person.isActive)
      .map(person => ({
        ...person,
        tasks: visibleItems.filter(item => item.producer === person.name),
      }));
  }, [currentRequirementScheduleItems, productionScheduleContext, scheduleHorizonEnd, todayDateString]);

  const filteredAvailabilityRows = useMemo(
    () =>
      availabilityProducerFilter.length > 0
        ? availabilityRows.filter(person => availabilityProducerFilter.includes(person.name))
        : availabilityRows,
    [availabilityProducerFilter, availabilityRows],
  );

  const filteredAvailabilityTasks = useMemo(
    () =>
      filteredAvailabilityRows.flatMap(person =>
        person.tasks.map(task => ({
          ...task,
          producerGroup: person.group,
        })),
      ),
    [filteredAvailabilityRows],
  );

  const availabilityCalendarWeeks = useMemo(
    () => getAvailabilityMonthWeeks(availabilityCalendarYear, availabilityCalendarMonth, todayDateString),
    [availabilityCalendarMonth, availabilityCalendarYear, todayDateString],
  );

  const availabilityGanttStart = useMemo(
    () => addDaysToDateString(todayDateString, -3),
    [todayDateString],
  );

  const availabilityGanttEnd = useMemo(
    () => addDaysToDateString(availabilityGanttStart, 30),
    [availabilityGanttStart],
  );

  const availabilityGanttDays = useMemo(
    () =>
      Array.from({ length: 31 }, (_, index) => {
        const dateString = addDaysToDateString(availabilityGanttStart, index);
        const date = new Date(`${dateString}T00:00:00`);
        const dayOfWeek = date.getDay();
        return {
          dateString,
          day: date.getDate(),
          month: date.getMonth() + 1,
          isToday: dateString === todayDateString,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        };
      }),
    [availabilityGanttStart, todayDateString],
  );

  const ganttTotalDays = Math.max(
    1,
    ((parseDateValue(availabilityGanttEnd) || 0) - (parseDateValue(availabilityGanttStart) || 0)) / 86400000 + 1,
  );

  const fullName = generateFullName(currentReq);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Area */}
      <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex min-w-0 max-w-[78%] flex-col gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
             <span className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 shadow-3xs">
                {currentReq.projectName}
             </span>
             <span className="px-3 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 text-[10px] font-black shrink-0">
                {getAssetTypeLabel(currentReq.assetType)}
             </span>
             <button
               type="button"
               onClick={() => setShowSubVersionsModal(true)}
               className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-[11px] font-black text-indigo-700 transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer select-none"
               title="点击查看并复制所有小版本名称"
             >
               <span>📂</span>
               <span>{subVersions.length} 个小版本名称查看、复制</span>
             </button>
          </div>
          
          <div className="flex max-w-full items-stretch gap-2">
             <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-slate-50/70 px-3.5 py-2.5">
               <span className="shrink-0 text-[11px] font-black text-slate-400">父文件夹名称：</span>
               <h1 className="min-w-0 truncate font-mono text-base font-black tracking-tight text-slate-800 md:text-lg" title={getFolderFormatName(currentReq)}>
                 {getFolderFormatName(currentReq)}
               </h1>
             </div>
             <button 
               type="button"
               onClick={() => handleCopyText(getFolderFormatName(currentReq))}
               className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-4xs transition-all hover:bg-slate-50 hover:text-indigo-600"
               title="复制父文件夹名称"
             >
               <Copy className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div ref={creativePersonnelRef} className="relative flex min-w-[132px] flex-col items-start">
            <span className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">创意人员</span>
            <button
              type="button"
              onClick={() => setIsCreativePersonnelMenuOpen(prev => !prev)}
              className={`flex min-h-9 w-full items-center gap-2 rounded-2xl border px-2 py-1.5 text-left transition-all ${
                isCreativePersonnelMenuOpen
                  ? 'border-primary/25 bg-primary/5 shadow-3xs'
                  : 'border-transparent bg-transparent hover:border-slate-150 hover:bg-slate-50'
              }`}
            >
              <img
                src={getPersonAvatarUrl(currentReq.creativePersonnel)}
                alt={currentReq.creativePersonnel || '未指派'}
                className="h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover shadow-3xs"
                referrerPolicy="no-referrer"
              />
              <span className="min-w-0 flex-1 truncate text-xs font-black text-slate-700">{currentReq.creativePersonnel}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isCreativePersonnelMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCreativePersonnelMenuOpen && (
              <div className="absolute right-0 top-full z-[90] mt-2 w-40 overflow-hidden rounded-2xl border border-slate-150 bg-white p-1.5 shadow-2xl shadow-slate-900/10">
                {creativePersonnelOptions.map(person => {
                  const isSelected = currentReq.creativePersonnel === person;
                  return (
                    <button
                      key={person}
                      type="button"
                      onClick={() => {
                        setCurrentReq({ ...currentReq, creativePersonnel: person });
                        setIsCreativePersonnelMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all ${
                        isSelected ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={getPersonAvatarUrl(person)}
                        alt={person}
                        className={`h-7 w-7 shrink-0 rounded-full border bg-slate-50 object-cover ${
                          isSelected ? 'border-primary/30 shadow-3xs' : 'border-slate-150'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs font-black">{person}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="w-[1px] h-10 bg-slate-100"></div>

          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Global Config Area */}
      <div className="px-8 py-5 bg-white border-b border-slate-100 shadow-sm shrink-0">
        <div className="flex flex-wrap items-end gap-3">
          <Dropdown 
            label="素材阶段" 
            value={currentReq.materialStage} 
            options={MATERIAL_STAGES} 
            onChange={(val) => setCurrentReq({...currentReq, materialStage: val})} 
            className="w-[104px]"
          />
          <Dropdown 
            label="素材大方向" 
            value={currentReq.broadDirection} 
            options={BROAD_DIRECTIONS} 
            onChange={(val) => {
              const newChannels = val === '大字报' ? ['apl'] : currentReq.channels;
              setCurrentReq({...currentReq, broadDirection: val, channels: newChannels});
            }} 
            className="w-[172px]"
          />
          <Dropdown 
            label="语言" 
            value={currentReq.language} 
            options={LANGUAGES} 
            onChange={(val) => setCurrentReq({...currentReq, language: val})} 
            className="w-[116px]"
          />
          <Dropdown 
            label="投放渠道" 
            value={currentReq.channels} 
            options={CHANNELS} 
            isMulti 
            onChange={(val) => setCurrentReq({...currentReq, channels: val})} 
            className="w-[240px]"
          />
          <Dropdown 
            label="尺寸" 
            value={currentReq.dimensions} 
            options={DIMENSIONS_LIST} 
            isMulti 
            onChange={(val) => setCurrentReq({...currentReq, dimensions: val})} 
            className="w-[164px]"
          />
          <InlineInput
            label="验证方向" 
            value={(currentReq.testDirections || []).join('、')}
            placeholder="输入验证方向"
            onChange={(val) => setCurrentReq({
              ...currentReq,
              testDirections: val
                .split(/[、,，/]/)
                .map(item => item.trim())
                .filter(Boolean),
            })}
            className="w-[260px]"
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
              成片
              {activeTab === 'clip' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('script')}
              className={`pb-3 text-xs font-black transition-all relative ${activeTab === 'script' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              需求脚本
              {activeTab === 'script' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20">
            {activeTab === 'clip' ? (
              <div className="p-6 space-y-8">
                {/* Version Previews */}
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <h3 className="text-xs font-black text-slate-400 tracking-widest">成片预览</h3>
                      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-1">
                        {previewDimensions.map((dimension) => (
                          <button
                            key={dimension}
                            type="button"
                            onClick={() => setSelectedPreviewDimension(dimension)}
                            className={`rounded-xl px-3 py-1.5 text-[10px] font-black transition-all ${
                              selectedPreviewDimension === dimension
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            {dimension}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowClipUploadModal(true)}
                      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 text-[11px] font-black text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-100"
                      title="上传当前需求的成片素材"
                    >
                      <Upload className="h-4 w-4" />
                      上传成片
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {allVersions.map((v) => {
                      const versionNumber = String(getVersionSortValue(v)).padStart(2, '0');
                      const subVersion = subVersions.find((item) => item.version === versionNumber) || {
                        version: versionNumber,
                        name: `版本${getVersionSortValue(v)}`,
                      };
                      const activeDimension = selectedPreviewDimension || previewDimensions[0] || '9:16';
                      const previewName = getSubVersionSizedFormatName(currentReq, subVersion, activeDimension);
                      return (
                        <div
                          key={v}
                          className="flex h-[330px] shrink-0 flex-col gap-2 group"
                          style={{ width: getPreviewWidthForDimension(activeDimension) }}
                        >
                          <div
                            className="h-[280px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-md border border-slate-200"
                          >
                            <img src={currentReq.previews?.[0] || 'https://picsum.photos/270/480'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20">
                              <Play className="w-10 h-10 text-white fill-white" />
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[9px] font-bold rounded uppercase">{v}</div>
                            <div className="absolute bottom-2 right-2 rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-black text-slate-700 backdrop-blur">
                              {getDurationLabel(currentReq.duration)}
                            </div>
                          </div>
                          <p
                            className="h-10 overflow-hidden break-all text-center font-mono text-[9.5px] font-bold leading-5 text-slate-500 line-clamp-2"
                            title={previewName}
                          >
                            {previewName}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
                
                {/* Delivery Records */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 tracking-widest">投放记录</h3>
                  {deliveryRecords.map((record) => (
                    <div key={record.version} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 rounded-full bg-primary"></div>
                          <span className="text-sm font-black text-slate-900">版本 {record.version.replace('V', '')}</span>
                        </div>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black text-slate-400">
                          {record.channelGroups.reduce((sum, channel) => sum + channel.sizes.length, 0)} 条投放尺寸 · {record.channelGroups.length} 个渠道
                        </span>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white">
                        <div className="grid grid-cols-[1.05fr_0.8fr_0.9fr_0.9fr_1.1fr] border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black text-slate-400">
                          <span>投放渠道</span>
                          <span>尺寸</span>
                          <span>审核情况</span>
                          <span>投放情况</span>
                          <span>同步时间</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {record.channelGroups.map((channel) =>
                            channel.sizes.map((sizeItem, sizeIndex) => {
                              const reviewClass = getReviewStatusClass(sizeItem.reviewStatus);
                              const [dotClass, textClass] = reviewClass.split(' ');
                              return (
                                <div
                                  key={`${record.version}-${channel.platform}-${sizeItem.dim}`}
                                  className="grid grid-cols-[1.05fr_0.8fr_0.9fr_0.9fr_1.1fr] items-center px-4 py-3 text-[11px] font-bold"
                                >
                                  <span className="flex items-center gap-2 text-slate-800">
                                    {sizeIndex === 0 ? (
                                      <>
                                        <Globe className="h-3.5 w-3.5 text-primary" />
                                        {channel.platform}
                                      </>
                                    ) : (
                                      <span className="pl-5 text-slate-300">同渠道</span>
                                    )}
                                  </span>
                                  <span className="inline-flex items-center gap-2 text-slate-700">
                                    <Monitor className="h-3.5 w-3.5 text-slate-400" />
                                    {sizeItem.dim}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 ${textClass}`}>
                                    <i className={`h-1.5 w-1.5 rounded-full ${dotClass}`}></i>
                                    {getReviewStatusText(sizeItem.reviewStatus)}
                                  </span>
                                  <span className={`mr-auto rounded-full border px-2 py-1 text-[10px] font-black ${getDeliveryStatusClass(sizeItem.deliveryStatus)}`}>
                                    {getDeliveryStatusText(sizeItem.deliveryStatus)}
                                  </span>
                                  <span className="text-slate-400">{sizeItem.time}</span>
                                </div>
                              );
                            }),
                          )}
                        </div>
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
                <section className="rounded-[28px] border border-slate-150 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">需求难度</h4>
                      <p className="mt-1 text-[10px] font-bold text-slate-400">
                        先确定复杂度，再按岗位拆分制作排期。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAvailabilityModal(true)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-150 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      查看人员排期
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {['S', 'A', 'B', 'C'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setCurrentReq({ ...currentReq, difficulty: d as Requirement['difficulty'] })}
                        className={`h-12 rounded-2xl text-lg font-black transition-all ${
                          currentReq.difficulty === d
                            ? 'bg-primary text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-150'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">子任务</h4>
                      <p className="mt-1 text-[10px] font-bold text-slate-400">
                        点击岗位按钮增加一项排期，再选择状态、负责人、工时和日期。
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={scheduleBySubVersion}
                      onClick={() => handleToggleSubVersionSchedule(!scheduleBySubVersion)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black shadow-3xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                        scheduleBySubVersion
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                          : 'border-slate-150 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-all ${
                          scheduleBySubVersion ? 'bg-primary' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
                            scheduleBySubVersion ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </span>
                      小版本单独排期
                    </button>
                  </div>

                  {scheduleIssueSummary.issues.length > 0 && (
                    <div className="rounded-2xl border border-slate-150 bg-white p-3 shadow-3xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700">
                          <AlertCircle className={`h-3.5 w-3.5 ${scheduleIssueSummary.dangerCount > 0 ? 'text-rose-500' : 'text-amber-500'}`} />
                          <span>排期检查</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">
                            {scheduleIssueSummary.dangerCount} 严重 / {scheduleIssueSummary.warningCount} 提醒
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">
                          保存前建议处理红色问题
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {scheduleIssueSummary.issues.slice(0, 4).map((issue, index) => (
                          <span
                            key={`${issue.task.id}-${issue.text}-${index}`}
                            className={`inline-flex max-w-full items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[9px] font-black ${
                              issue.tone === 'danger'
                                ? 'border-rose-100 bg-rose-50 text-rose-600'
                                : 'border-amber-100 bg-amber-50 text-amber-700'
                            }`}
                            title={issue.text}
                          >
                            <span className="shrink-0">{getScheduleRolePreset(issue.task.role, issue.task.type).role}</span>
                            {issue.task.version && (
                              <span className="shrink-0 text-current/60">v{issue.task.version}</span>
                            )}
                            <span className="truncate">{issue.text}</span>
                          </span>
                        ))}
                        {scheduleIssueSummary.issues.length > 4 && (
                          <span className="rounded-xl bg-slate-100 px-2.5 py-1.5 text-[9px] font-black text-slate-500">
                            +{scheduleIssueSummary.issues.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {scheduleTaskGroups.map(group => (
                    <div
                      key={group.key}
                      className={`rounded-[24px] border p-4 shadow-sm ${
                        scheduleBySubVersion
                          ? 'border-indigo-100 bg-indigo-50/40 shadow-indigo-100/40'
                          : 'border-slate-150 bg-white'
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className={`min-w-0 ${scheduleBySubVersion ? 'border-l-4 border-primary pl-3' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-black text-slate-800">{group.title}</span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400">
                              {group.tasks.length} 项
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-1.5">
                          {SCHEDULE_ROLE_PRESETS.map(preset => (
                            <button
                              key={preset.role}
                              type="button"
                              onClick={() => addProductionTask(group.version, preset)}
                              className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-xl border border-slate-150 bg-white px-2.5 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            >
                              <Plus className={`h-3 w-3 ${preset.accentClassName}`} />
                              {preset.role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {group.tasks.map((task, taskIndex) => {
                          const rolePreset = getScheduleRolePreset(task.role, task.type);
                          const { visibleTasks, conflictingTasks } = getTaskScheduleContext(task);
                          const dateWarnings = getTaskDateWarnings(task, conflictingTasks);
                          const producerOptionGroups = getProducerOptionGroups(task);
                          const gapHints = getScheduleGapHints(
                            visibleTasks,
                            todayDateString,
                            scheduleHorizonEnd,
                          );
                          const recommendedSlots = getRecommendedScheduleSlots(task);

                          return (
                            <div key={task.id} className="rounded-2xl border border-slate-150 bg-slate-50/60 p-3">
                              <div className="grid grid-cols-[88px_minmax(0,1fr)_52px_28px] items-center gap-2">
                                <span className={`flex h-8 items-center justify-center rounded-lg text-[12px] font-black ${rolePreset.className}`}>
                                  {rolePreset.role}
                                </span>

                                <select
                                  value={task.status || '待排期'}
                                  onChange={(event) => updateProductionTask(task.id, { status: event.target.value })}
                                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-600 outline-none transition-all hover:border-indigo-200 focus:border-indigo-400"
                                >
                                  {TASK_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>

                                <div className="flex h-8 items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveProductionTask(task.id, -1)}
                                    disabled={taskIndex === 0}
                                    className="flex h-7 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="上移排期项"
                                  >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveProductionTask(task.id, 1)}
                                    disabled={taskIndex === group.tasks.length - 1}
                                    className="flex h-7 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="下移排期项"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeProductionTask(task.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white transition-all hover:bg-rose-600"
                                  aria-label="删除排期项"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_86px] items-center gap-2">
                                <select
                                  value={task.designer || ''}
                                  onChange={(event) => updateProductionTask(task.id, { designer: event.target.value })}
                                  className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-600 outline-none transition-all hover:border-indigo-200 focus:border-indigo-400"
                                >
                                  <option value="">负责人</option>
                                  {producerOptionGroups.map(group => (
                                    <optgroup
                                      key={group.group}
                                      label={group.isRecommended ? `${group.label}（推荐）` : group.label}
                                    >
                                      {group.people.map(person => (
                                      <option key={person.id} value={person.id}>
                                        {person.name}
                                      </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>

                                <label className="flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={task.estimatedWorkDays ?? (parseFloat(task.duration) || 0.1)}
                                    onChange={(event) => {
                                      const hours = Number(event.target.value) || 0;
                                      updateProductionTask(task.id, {
                                        estimatedWorkDays: hours,
                                        duration: `${hours}H`,
                                      });
                                    }}
                                    className="min-w-0 flex-1 bg-transparent text-right text-[11px] font-bold text-slate-600 outline-none"
                                  />
                                  <span className="ml-1 text-[11px] font-black text-slate-500">H</span>
                                </label>
                              </div>

                              <div className="mt-2 grid grid-cols-[24px_minmax(0,1fr)_18px_minmax(0,1fr)] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                                <CalendarDays className="h-4 w-4 text-slate-350" />
                                <input
                                  type="date"
                                  value={task.startDate || ''}
                                  onClick={openNativeDatePicker}
                                  onChange={(event) => updateProductionTask(task.id, { startDate: event.target.value })}
                                  className="h-7 min-w-0 bg-transparent text-center text-[11px] font-bold text-slate-600 outline-none"
                                />
                                <span className="text-center text-[12px] font-black text-slate-350">~</span>
                                <input
                                  type="date"
                                  value={task.endDate || ''}
                                  onClick={openNativeDatePicker}
                                  onChange={(event) => updateProductionTask(task.id, { endDate: event.target.value })}
                                  className="h-7 min-w-0 bg-transparent text-center text-[11px] font-bold text-slate-600 outline-none"
                                />
                              </div>

                              {recommendedSlots.length > 0 && (
                                <div className="mt-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-2.5">
                                  <div className="mb-2 flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-600">
                                      <Lightbulb className="h-3 w-3" />
                                      {task.designer ? '推荐时间' : '推荐人员与时间'}
                                    </span>
                                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[8px] font-black text-slate-400">
                                      {currentReq.difficulty || 'C'} 级 · {recommendedSlots[0].hours}H
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {recommendedSlots.map(slot => (
                                      <button
                                        key={`${task.id}-${slot.person.name}-${slot.startDate}`}
                                        type="button"
                                        onClick={() =>
                                          updateProductionTask(task.id, {
                                            designer: slot.person.name,
                                            startDate: slot.startDate,
                                            endDate: slot.endDate,
                                            estimatedWorkDays: slot.hours,
                                            duration: `${slot.hours}H`,
                                            status: normalizePlannedTaskStatus({
                                              ...task,
                                              designer: slot.person.name,
                                              startDate: slot.startDate,
                                              endDate: slot.endDate,
                                            }),
                                          })
                                        }
                                        className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-indigo-100 bg-white px-2.5 py-1.5 text-left text-[9px] font-black text-slate-600 transition-all hover:border-indigo-250 hover:bg-indigo-100 hover:text-indigo-700"
                                        title={`采纳 ${slot.person.name} / ${formatShortDateRange(slot.startDate, slot.endDate)} / ${slot.hours}H`}
                                      >
                                        <span className="shrink-0 text-indigo-600">{slot.person.name}</span>
                                        <span className="shrink-0 text-slate-350">·</span>
                                        <span className="shrink-0">{formatShortDateRange(slot.startDate, slot.endDate)}</span>
                                        {!slot.hasGap && (
                                          <span className="shrink-0 rounded bg-amber-50 px-1 text-amber-600">
                                            需确认
                                          </span>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {task.designer && (
                                <div className="mt-2 rounded-2xl border border-slate-150 bg-white p-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-700">
                                      <User className="h-3.5 w-3.5 text-indigo-500" />
                                      <span>{task.designer} · 未来两周占用</span>
                                    </div>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                                        conflictingTasks.length > 0
                                          ? 'bg-amber-50 text-amber-700'
                                          : visibleTasks.length > 0
                                            ? 'bg-slate-100 text-slate-500'
                                            : 'bg-emerald-50 text-emerald-600'
                                      }`}
                                    >
                                      {conflictingTasks.length > 0
                                        ? `${conflictingTasks.length} 个撞期`
                                        : visibleTasks.length > 0
                                          ? `${visibleTasks.length} 个占用`
                                          : '暂无占用'}
                                    </span>
                                  </div>

                                  {visibleTasks.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {visibleTasks.slice(0, 3).map(item => {
                                        const isConflict = conflictingTasks.some(conflict => conflict.id === item.id);
                                        return (
                                          <span
                                            key={item.id}
                                            className={`inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold ${
                                              isConflict
                                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                : 'border-slate-150 bg-slate-50 text-slate-500'
                                            }`}
                                            title={`${item.requirementName} / ${item.role} / ${formatShortDateRange(item.startDate, item.endDate)}`}
                                          >
                                            <span className="shrink-0">{formatShortDateRange(item.startDate, item.endDate)}</span>
                                            <span className="max-w-[120px] truncate">{item.displayRequirementId || item.requirementId}</span>
                                          </span>
                                        );
                                      })}
                                      {visibleTasks.length > 3 && (
                                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-400">
                                          +{visibleTasks.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mt-2 rounded-xl border border-dashed border-emerald-100 bg-emerald-50 px-3 py-2 text-[9px] font-black text-emerald-600">
                                      未来两周暂无其它任务，可优先安排。
                                    </div>
                                  )}

                                  {gapHints.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                                      <span className="text-slate-400">可参考空档:</span>
                                      {gapHints.slice(0, 3).map(gap => (
                                        <span
                                          key={`${gap.start}-${gap.end}`}
                                          className="rounded-lg bg-indigo-50 px-2 py-1 text-indigo-600"
                                        >
                                          {formatShortDateRange(gap.start, gap.end)} · {gap.days}天
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {dateWarnings.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {dateWarnings.map((warning, index) => (
                                    <div
                                      key={`${warning.text}-${index}`}
                                      className={`rounded-xl border px-3 py-2 text-[9px] font-black ${
                                        warning.tone === 'danger'
                                          ? 'border-rose-100 bg-rose-50 text-rose-600'
                                          : 'border-amber-100 bg-amber-50 text-amber-700'
                                      }`}
                                    >
                                      {warning.text}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {group.tasks.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[11px] font-bold text-slate-400">
                            先点击上方岗位按钮，增加一项制作排期。
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
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

      {showAvailabilityModal && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-xs">
          <div className="flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-base font-black text-slate-900">人员排期情况</h3>
                <p className="mt-1 text-[11px] font-bold text-slate-400">
                  查看 {todayDateString} 至 {scheduleHorizonEnd} 的人员闲忙，再决定负责人和时间。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div ref={availabilityProducerFilterRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAvailabilityProducerMenuOpen(prev => !prev)}
                    className={`inline-flex h-9 min-w-[116px] items-center justify-between gap-2 rounded-2xl border px-3 text-[11px] font-black shadow-3xs transition-all ${
                      availabilityProducerFilter.length > 0
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="truncate">
                      {availabilityProducerFilter.length === 0
                        ? '全部人员'
                        : availabilityProducerFilter.length === 1
                          ? availabilityProducerFilter[0]
                          : `${availabilityProducerFilter.length} 人`}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                        isAvailabilityProducerMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isAvailabilityProducerMenuOpen && (
                    <div className="absolute left-0 top-full z-[340] mt-2 max-h-72 w-40 overflow-y-auto rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                      <button
                        type="button"
                        onClick={() => {
                          setAvailabilityProducerFilter([]);
                          setIsAvailabilityProducerMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                          availabilityProducerFilter.length === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>全部人员</span>
                        {availabilityProducerFilter.length === 0 && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <div className="my-1 h-px bg-slate-100" />
                      {availabilityRows.map(person => {
                        const isSelected = availabilityProducerFilter.includes(person.name);
                        return (
                          <button
                            key={person.id}
                            type="button"
                            onClick={() => {
                              setAvailabilityProducerFilter(prev =>
                                prev.includes(person.name)
                                  ? prev.filter(name => name !== person.name)
                                  : [...prev, person.name],
                              );
                            }}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                              isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border text-[9px] ${
                              isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 bg-white text-transparent'
                            }`}>
                              ✓
                            </span>
                            <span className="truncate">{person.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {[
                  { id: 'calendar', label: '日历图' },
                  { id: 'gantt', label: '甘特图' },
                ].map(view => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setAvailabilityView(view.id as 'calendar' | 'gantt')}
                    className={`rounded-2xl px-4 py-2 text-[11px] font-black transition-all ${
                      availabilityView === view.id
                        ? 'bg-primary text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-150'
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="ml-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-slate-50/70 p-6">
              {availabilityView === 'calendar' ? (
                <div className="min-h-full rounded-2xl border border-slate-150 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          setAvailabilityCalendarYear(today.getFullYear());
                          setAvailabilityCalendarMonth(today.getMonth() + 1);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        今天
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (availabilityCalendarMonth === 1) {
                            setAvailabilityCalendarYear(prev => prev - 1);
                            setAvailabilityCalendarMonth(12);
                          } else {
                            setAvailabilityCalendarMonth(prev => prev - 1);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (availabilityCalendarMonth === 12) {
                            setAvailabilityCalendarYear(prev => prev + 1);
                            setAvailabilityCalendarMonth(1);
                          } else {
                            setAvailabilityCalendarMonth(prev => prev + 1);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="ml-2 text-sm font-black text-slate-800">
                        {availabilityCalendarYear}年{availabilityCalendarMonth}月
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[10px] font-black">
                      <span className="rounded-lg px-3 py-1.5 text-slate-400">日</span>
                      <span className="rounded-lg px-3 py-1.5 text-slate-400">周</span>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-indigo-600 shadow-xs">月</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b border-slate-100 text-[10px] font-black text-slate-500">
                    {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(weekday => (
                      <div key={weekday} className="px-3 py-2">
                        {weekday}
                      </div>
                    ))}
                  </div>

                  <div>
                    {availabilityCalendarWeeks.map(week => {
                      const weekStart = week.days[0].dateString;
                      const weekEnd = week.days[6].dateString;
                      const weekTasks = filteredAvailabilityTasks
                        .filter(task => rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd))
                        .sort((a, b) => (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0))
                        .slice(0, 5);

                      return (
                        <div key={weekStart} className="relative grid min-h-[148px] grid-cols-7 overflow-visible border-b border-slate-100">
                          {week.days.map(day => {
                            const dayTasksCount = filteredAvailabilityTasks.filter(task =>
                              rangesOverlap(task.startDate, task.endDate, day.dateString, day.dateString),
                            ).length;
                        return (
                          <div
                            key={day.dateString}
                            className={`min-h-[148px] border-r border-slate-100 p-2 ${
                              day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60'
                            } ${day.isWeekend ? 'bg-slate-50' : ''}`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span
                                className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-black ${
                                  day.isToday
                                    ? 'bg-indigo-600 text-white'
                                    : day.isCurrentMonth
                                      ? 'text-slate-700'
                                      : 'text-slate-300'
                                }`}
                              >
                                {day.dayNum === 1 && day.isCurrentMonth ? `${availabilityCalendarMonth}月1日` : day.dayNum}
                              </span>
                              {dayTasksCount > 0 && (
                                <span className="text-[9px] font-bold text-slate-300">{dayTasksCount} 条</span>
                              )}
                            </div>
                          </div>
                        );
                          })}

                          <div className="pointer-events-none absolute inset-x-0 top-9 z-10">
                            {weekTasks.map((task, laneIndex) => {
                              const taskStartTime = parseDateValue(task.startDate) || parseDateValue(weekStart) || 0;
                              const taskEndTime = parseDateValue(task.endDate) || taskStartTime;
                              const weekStartTime = parseDateValue(weekStart) || taskStartTime;
                              const weekEndTime = parseDateValue(weekEnd) || taskEndTime;
                              const clippedStart = Math.max(taskStartTime, weekStartTime);
                              const clippedEnd = Math.min(taskEndTime, weekEndTime);
                              const startIndex = Math.max(0, Math.floor((clippedStart - weekStartTime) / 86400000));
                              const spanDays = Math.max(1, Math.floor((clippedEnd - clippedStart) / 86400000) + 1);
                              const left = (startIndex / 7) * 100;
                              const width = (spanDays / 7) * 100;
                              const startsInWeek = taskStartTime >= weekStartTime;
                              const endsInWeek = taskEndTime <= weekEndTime;
                              const tone =
                                task.status === '已完成'
                                  ? 'bg-slate-100 text-slate-500'
                                  : task.role.includes('平面')
                                    ? 'bg-lime-100 text-lime-800'
                                    : 'bg-sky-100 text-sky-800';

                              return (
                                <div
                                  key={`${weekStart}-${task.id}`}
                                  className={`absolute flex h-6 items-center truncate px-2 text-left text-[10px] font-black shadow-3xs ${tone} ${
                                    startsInWeek ? 'rounded-l-md' : 'rounded-l-none'
                                  } ${endsInWeek ? 'rounded-r-md' : 'rounded-r-none'}`}
                                  style={{
                                    left: `calc(${left}% + 8px)`,
                                    top: `${laneIndex * 26}px`,
                                    width: `calc(${width}% - 16px)`,
                                  }}
                                  title={`${task.displayRequirementId || task.requirementId} / ${task.requirementName} / ${task.producer}`}
                                >
                                  {task.displayRequirementId || task.requirementId}
                                  <span className="ml-1 font-bold opacity-70">{task.producer}</span>
                                  <span className="ml-1 font-bold opacity-70">{task.role}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="min-h-full overflow-auto rounded-2xl border border-slate-150 bg-white">
                  <div className="flex min-w-max border-b border-slate-100 bg-slate-50/80">
                    <div className="grid w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-black text-slate-400">
                      <div className="flex h-12 items-center border-r border-slate-100 px-3">人员</div>
                      <div className="flex h-12 items-center border-r border-slate-100 px-3">岗位</div>
                      <div className="flex h-12 items-center border-r border-slate-100 px-3">需求编号</div>
                      <div className="flex h-12 items-center px-3">状态</div>
                    </div>
                    <div className="shrink-0" style={{ width: `${availabilityGanttDays.length * 52}px` }}>
                      <div
                        className="grid h-12"
                        style={{ gridTemplateColumns: `repeat(${availabilityGanttDays.length}, 52px)` }}
                      >
                        {availabilityGanttDays.map(day => (
                          <div
                            key={day.dateString}
                            className={`relative flex items-center justify-center border-r border-slate-150 text-[10px] font-black ${
                              day.isToday
                                ? 'text-indigo-600'
                                : day.isWeekend
                                  ? 'bg-slate-100 text-slate-350'
                                  : 'text-slate-400'
                            }`}
                          >
                            {day.day === 1 ? `${day.month}/1` : day.day}
                            {day.isToday && <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-max">
                    {filteredAvailabilityRows.map(person => (
                      <div key={person.id} className="border-b border-slate-100 last:border-b-0 bg-white">
                        <div className="flex h-10 items-center gap-2 border-b border-slate-100 bg-white px-3">
                          <ChevronDown className="h-3.5 w-3.5 text-slate-350" />
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white">
                            {person.name.slice(0, 1)}
                          </span>
                          <span className="text-xs font-black text-slate-800">{person.name}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400">
                            {person.group}
                          </span>
                          <span className="ml-auto text-[9px] font-black text-slate-350">{person.tasks.length} 项</span>
                        </div>

                        {person.tasks.length === 0 ? (
                          <div className="flex">
                            <div className="grid h-11 w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-bold text-slate-350">
                              <div className="flex items-center border-r border-slate-100 px-3">暂无排期</div>
                              <div className="border-r border-slate-100" />
                              <div className="border-r border-slate-100" />
                              <div />
                            </div>
                            <div className="shrink-0" style={{ width: `${availabilityGanttDays.length * 52}px` }}>
                              <div
                                className="grid h-11"
                                style={{ gridTemplateColumns: `repeat(${availabilityGanttDays.length}, 52px)` }}
                              >
                                {availabilityGanttDays.map(day => (
                                  <div
                                    key={`${person.id}-empty-${day.dateString}`}
                                    className={`border-r border-slate-100 ${
                                      day.isWeekend
                                        ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]'
                                        : ''
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          person.tasks.map((task, index) => {
                            const dayWidth = 52;
                            const ganttStartTime = parseDateValue(availabilityGanttStart) || 0;
                            const taskStartTime = parseDateValue(task.startDate) || ganttStartTime;
                            const taskEndTime = parseDateValue(task.endDate) || taskStartTime;
                            const startIndex = Math.max(0, Math.floor((taskStartTime - ganttStartTime) / 86400000));
                            const endIndex = Math.min(
                              availabilityGanttDays.length - 1,
                              Math.floor((taskEndTime - ganttStartTime) / 86400000),
                            );
                            const barLeft = startIndex * dayWidth + 8;
                            const barWidth = Math.max((endIndex - startIndex + 1) * dayWidth - 16, 92);
                            const workDays = Math.max(1, Math.round((taskEndTime - taskStartTime) / 86400000) + 1);
                            const rolePreset = getScheduleRolePreset(task.role);
                            const barClass =
                              task.status === '已完成'
                                ? 'bg-slate-500 text-white'
                                : task.status === '制作中'
                                  ? 'bg-sky-400 text-white'
                                  : 'bg-sky-200 text-sky-900';
                            return (
                              <div key={task.id} className="flex">
                                <div className="grid h-10 w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-bold text-slate-500">
                                  <div className="flex min-w-0 items-center border-r border-slate-100 px-3">
                                    {index === 0 ? (
                                      <span className="truncate text-slate-700">{person.name}</span>
                                    ) : (
                                      <span className="text-slate-250">同人员</span>
                                    )}
                                  </div>
                                  <div className="flex items-center border-r border-slate-100 px-3">
                                    <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black ${rolePreset.className}`}>
                                      {rolePreset.role}
                                    </span>
                                  </div>
                                  <div className="flex items-center border-r border-slate-100 px-3 font-mono text-indigo-600">
                                    {task.displayRequirementId || task.requirementId}
                                  </div>
                                  <div className="flex items-center px-3">
                                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">
                                      {task.status}
                                    </span>
                                  </div>
                                </div>

                                <div className="shrink-0" style={{ width: `${availabilityGanttDays.length * 52}px` }}>
                                  <div
                                    className="relative grid h-10"
                                    style={{ gridTemplateColumns: `repeat(${availabilityGanttDays.length}, 52px)` }}
                                  >
                                    {availabilityGanttDays.map(day => (
                                      <div
                                        key={`${task.id}-${day.dateString}`}
                                        className={`border-r border-slate-100 ${
                                          day.isWeekend
                                            ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]'
                                            : ''
                                        }`}
                                      />
                                    ))}
                                    {availabilityGanttDays.find(day => day.isToday) && (
                                      <div
                                        className="pointer-events-none absolute top-0 h-full w-px bg-indigo-500/80"
                                        style={{
                                          left: `${availabilityGanttDays.findIndex(day => day.isToday) * dayWidth + dayWidth / 2}px`,
                                        }}
                                      />
                                    )}
                                    <div
                                      className={`absolute top-1.5 flex h-7 items-center justify-between gap-2 rounded-md px-2 text-[9px] font-black shadow-sm ${barClass}`}
                                      style={{ left: `${barLeft}px`, width: `${barWidth}px` }}
                                      title={`${task.requirementName} / ${task.startDate} ~ ${task.endDate}`}
                                    >
                                      <span className="truncate">{task.requirementName}</span>
                                      <span className="shrink-0">{workDays} 工作日</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
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

      {showClipUploadModal && (
        <div className="fixed inset-0 z-[290] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-sm font-black text-slate-900">上传成片</h3>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  支持拖拽上传，也可以点击选择视频或图片文件。
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowClipUploadModal(false);
                  setIsClipDragActive(false);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
                title="关闭"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6">
              <label
                className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-8 text-center transition-all ${
                  isClipDragActive
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-slate-50/70 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/60'
                }`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsClipDragActive(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsClipDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.currentTarget === event.target) {
                    setIsClipDragActive(false);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleClipUploadFiles(event.dataTransfer.files);
                }}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-indigo-600 shadow-sm">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-sm font-black text-slate-800">
                  拖拽成片文件到这里
                </div>
                <div className="mt-2 text-[11px] font-bold text-slate-400">
                  或点击选择文件，支持视频和图片，多文件上传
                </div>
                <input
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) {
                      handleClipUploadFiles(event.target.files);
                    }
                    event.currentTarget.value = '';
                  }}
                />
              </label>
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">按版本和尺寸分别复制创意文件名</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubVersionsModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
                title="关闭"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body / Scroll List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {subVersions.map((sub, idx) => {
                const dimensionsForCopy = previewDimensions.length > 0 ? previewDimensions : ['9:16'];
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col gap-3 bg-slate-50 hover:bg-indigo-50/20 border border-slate-150 hover:border-indigo-150 p-4 rounded-2xl transition-all group relative border-l-4 border-l-slate-300 hover:border-l-indigo-500"
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-[9px] font-black rounded-lg uppercase tracking-wide">
                          版本 {Number(sub.version)}
                        </span>
                        <span className="text-[11px] font-black text-slate-600 truncate" title={sub.name}>
                          {sub.name}
                        </span>
                      </div>
                      <div
                        className="mt-2 font-mono text-[10.5px] font-bold text-slate-700 select-all break-all bg-white border border-slate-205 rounded-xl px-3 py-2 shadow-4xs group-hover:border-indigo-100 transition-all cursor-text leading-relaxed"
                        title={getSubVersionFormatName(currentReq, sub)}
                      >
                        {getSubVersionFormatName(currentReq, sub)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {dimensionsForCopy.map((dimension) => {
                        const compactDimension = dimension.replace(/[^0-9]/g, '');
                        const dimensionLabel = dimension.includes(':') ? dimension : dimension.replace(/^(\d+)(\d{2})$/, '$1:$2');
                        const sizedName = getSubVersionSizedFormatName(currentReq, sub, dimension);
                        const isCopied = copiedText === sizedName;
                        return (
                          <button
                            key={`${sub.version}-${dimension}`}
                            type="button"
                            onClick={() => handleCopyText(sizedName)}
                            title={sizedName}
                            className={`h-8 w-auto min-w-[88px] rounded-xl px-3 text-[10px] font-black inline-flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer select-none transition-all border ${
                              isCopied
                                ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                                : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200 hover:border-indigo-100/50 hover:text-indigo-700'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>已复制 {dimensionLabel}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>复制 {dimensionLabel}</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementDetail;
