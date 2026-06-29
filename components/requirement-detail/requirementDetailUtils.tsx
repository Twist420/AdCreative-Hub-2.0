import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Requirement, RequirementProdStatus, ProductionTask, PROJECTS, CHANNELS } from '../../types';
import { formatScheduledRequirementId, getRequirementMajorId, parseRequirementVersionId } from '../shared/requirements/requirementId';

export { formatScheduledRequirementId, getRequirementMajorId, parseRequirementVersionId };

export const getInitials = (name: string) => {
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

export const PRODUCER_ALIASES: Record<string, string> = {
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

export const CREATIVE_ALIASES: Record<string, string> = {
  '唐欣怡': 'txy',
  '吉意煊': 'jyx',
  '马嘉良': 'mjl',
  '张欢': 'zh',
  '吴楠': 'wn',
  '宋爽': 'ss',
  '苏雅': 'sy',
  '顺子': 'sz'
};

export const DropdownSelectedCheck = ({ className = '' }: { className?: string }) => (
  <Check className={`h-4 w-4 shrink-0 stroke-[3] text-indigo-500 ${className}`} />
);

export const DropdownCheckbox = ({
  checked,
  className = '',
}: {
  checked: boolean;
  className?: string;
}) => (
  <span
    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
      checked
        ? 'border-indigo-500 bg-indigo-500 text-white'
        : 'border-slate-200 bg-white text-transparent'
    } ${className}`}
  >
    <Check className="h-3 w-3 stroke-[3]" />
  </span>
);

export const CREATIVE_PEOPLE = ['唐欣怡', '吉意煊', '马嘉良'];

export const PERSON_AVATAR_URLS: Record<string, string> = {
  '唐欣怡': '/avatars/tang-xinyi.png',
  '吉意煊': '/avatars/ji-yixuan.png',
  '马嘉良': '/avatars/ma-jialiang.png',
  '张欢': '/avatars/zhang-huan.png',
  '何思乔': '/avatars/he-siqiao.png'
};

export const getPersonAvatarUrl = (name?: string) => {
  const normalizedName = name || 'unknown';
  return (
    PERSON_AVATAR_URLS[normalizedName] ||
    `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(normalizedName)}`
  );
};

export const getAssetTypeLabel = (assetType: Requirement['assetType']) => {
  if (assetType === 'Image') return '图片';
  if (assetType === 'Playable') return '试玩';
  return '视频';
};

export const getFolderFormatName = (req: Requirement) => {
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

export const getSubVersionFormatName = (req: Requirement, subVer: { version: string; name: string }) => {
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

export const getSubVersionSizedFormatName = (
  req: Requirement,
  subVer: { version: string; name: string },
  dimension: string,
) => `${getSubVersionFormatName(req, subVer)}-${dimension.replace(/[^0-9]/g, '')}`;

export const generateFullName = (req: Requirement, versionOverride?: string, nameOverride?: string, testDirOverride?: string[]) => {
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

export const MATERIAL_STAGES = [
  { id: '新', name: '新' },
  { id: '迭', name: '迭' },
  { id: '老', name: '老' }
];

export const BROAD_DIRECTIONS = [
  { id: '大字报', name: '大字报' },
  { id: '原始玩法', name: '原始玩法' },
  { id: '3D玩法', name: '3D玩法' }
];

export const REQUIREMENT_STATUSES = [
  { id: 'Draft', name: '草稿' },
  { id: 'Pending', name: '待审核' },
  { id: 'Approved', name: '审核通过' },
  { id: 'Modification', name: '需求修改' },
];

export const PRODUCTION_STATUSES = [
  { id: 'Unscheduled', name: '未排期' },
  { id: 'Scheduled', name: '已排期' },
  { id: 'InProgress', name: '进行中' },
  { id: 'Completed', name: '已完成' },
];

export const TASK_STATUSES = ['待排期', '已排期', '制作中', '已完成'];
export const PRODUCTION_ROLE_OPTIONS: Array<{
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

export const SCHEDULE_ROLE_PRESETS: Array<{
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

export const getScheduleRolePreset = (role?: string, type?: ProductionTask['type']) => {
  if (role === '视频' || type === 'Composition') return SCHEDULE_ROLE_PRESETS[1];
  if (role === '其他') return SCHEDULE_ROLE_PRESETS[3];
  return (
    SCHEDULE_ROLE_PRESETS.find(preset => preset.role === role || preset.type === type) ||
    SCHEDULE_ROLE_PRESETS[3]
  );
};
export const PRODUCER_GROUPS: Record<string, string[]> = {
  '美宣-平面': ['宋子仪', '吕远林', '王金瑞', '王春华', '李珊姗'],
  '美宣-AI': ['宋爽'],
  '美宣-2D': ['曲冬丽', '张欢', '郭峰', '王佳鸿', '吴楠', '周进易', '邓莉', '蒋天宇', '张雨学', '张澳', '朱奇杰'],
  '美宣-3D': ['刘洋', '孙崇洋', '张永进'],
  '程序': ['李嘉鑫', '肖环宇'],
};
export const PRODUCER_GROUP_LABELS: Record<string, string> = {
  '美宣-平面': '平面',
  '美宣-AI': 'AI',
  '美宣-2D': '合成 / 2D',
  '美宣-3D': '3D',
  '程序': '程序',
};
export const INACTIVE_PRODUCERS = new Set(['王春华', '李珊姗', '宋爽', '周进易', '邓莉', '蒋天宇', '张雨学', '张澳', '朱奇杰']);
export const PRODUCTION_PEOPLE = Object.keys(PRODUCER_ALIASES).map(name => {
  const group = Object.entries(PRODUCER_GROUPS).find(([, members]) => members.includes(name))?.[0] || '其他';
  return {
    id: name,
    name,
    group,
    isActive: !INACTIVE_PRODUCERS.has(name),
  };
});

export const getRecommendedProducerGroups = (task: ProductionTask) => {
  const role = `${task.role || task.type}`;
  if (role.includes('程序') || role.includes('Program')) return ['程序'];
  if (role.includes('模型') || role.includes('地编') || role.includes('3D')) return ['美宣-3D'];
  if (role.includes('AI')) return ['美宣-AI'];
  if (role.includes('平面') || role.includes('Graphic')) return ['美宣-平面', '美宣-AI'];
  return ['美宣-2D'];
};

export const getProducerOptionGroups = (task: ProductionTask) => {
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

export const getProductionTypeByRole = (role: string): ProductionTask['type'] => {
  return PRODUCTION_ROLE_OPTIONS.find(option => option.role === role)?.type || 'Other';
};

export const summarizeProductionStatus = (req: Requirement): RequirementProdStatus => {
  const tasks = req.tasks || [];
  if (tasks.length === 0) return req.prodStatus || 'Unscheduled';
  if (tasks.every(task => task.status === '已完成')) return 'Completed';
  if (tasks.some(task => task.status === '制作中')) return 'InProgress';
  if (req.prodStatus === 'Unscheduled') return 'Unscheduled';
  return 'Scheduled';
};

export const normalizePlannedTaskStatus = (task: ProductionTask): string => {
  if (task.status === '制作中' || task.status === '已完成') return task.status;
  if (task.designer && task.startDate && task.endDate) return '已排期';
  return task.status || '待排期';
};

export const getDifficultyEstimatedHours = (
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

export const deriveRequirementFromTasks = (req: Requirement, tasks: ProductionTask[]): Requirement => {
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

export const LANGUAGES = [
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

export const DIMENSIONS_LIST = [
  { id: '916', name: '9:16' },
  { id: '11', name: '1:1' },
  { id: '169', name: '16:9' }
];

export interface ProductionScheduleContextItem {
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


export const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateValue = (dateStr?: string) => {
  if (!dateStr) return null;
  const time = new Date(`${dateStr}T00:00:00`).getTime();
  return Number.isNaN(time) ? null : time;
};

export const addDaysToDateString = (dateStr: string, days: number) => {
  const base = new Date(`${dateStr}T00:00:00`);
  base.setDate(base.getDate() + days);
  return formatDateInput(base);
};

export interface AvailabilityCalendarDay {
  dayNum: number;
  dateString: string;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
}

export const getAvailabilityMonthWeeks = (year: number, month: number, todayDateString: string) => {
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

export const rangesOverlap = (
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

export const formatShortDateRange = (start?: string, end?: string) => {
  if (!start && !end) return '未定';
  const format = (dateStr?: string) => {
    if (!dateStr) return '';
    const [, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };
  return start === end ? format(start) : `${format(start)}-${format(end)}`;
};

export const getScheduleGapHints = (
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

export const Dropdown = ({ label, value, options, onChange, isMulti = false, className = '' }: {
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

export const InlineInput = ({ label, value, onChange, className = '', placeholder }: {
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

export const openNativeDatePicker = (event: React.MouseEvent<HTMLInputElement>) => {
  (event.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
};
