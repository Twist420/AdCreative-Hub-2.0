

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateOverviewData, generateTopMaterials, OverviewMetric, mockKeywordAnalysis } from '../services/mockData';
import { analyzeMaterials } from '../services/geminiService';
import { AdMaterial, KeywordAnalysisData } from '../types';
import { Check, ChevronLeft, ChevronRight, Database, LoaderCircle, Minus, SlidersHorizontal, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid } from 'recharts';
import { AnalyticsDateRangeField, AnalyticsFilterBar, AnalyticsSelectField, getRecentUtcRange } from './AnalyticsFilters';

const seriesPalette = [
  '#475569',
  '#4f46e5',
  '#0ea5e9',
  '#059669',
  '#ca8a04',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#65a30d',
  '#ea580c',
  '#64748b',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#e11d48',
  '#2563eb',
  '#9333ea',
];

const seriesFillPalette = [
  '#e2e8f0',
  '#e0e7ff',
  '#e0f2fe',
  '#d1fae5',
  '#fef3c7',
  '#fee2e2',
  '#ede9fe',
  '#fce7f3',
  '#cffafe',
  '#ecfccb',
  '#ffedd5',
  '#f1f5f9',
  '#ccfbf1',
  '#fed7aa',
  '#ede9fe',
  '#cffafe',
  '#ecfccb',
  '#ffe4e6',
  '#dbeafe',
  '#f3e8ff',
];

const materialSeries = [
  'cp3097-01',
  'cp3325-01',
  'cp3979-02',
  'cp4092-01',
  'cp947-版本二',
  'cp4092-06',
  'cp3711-01',
  'cp3683-01',
  'cp4092-05',
  'cp3616-02',
  'cp2709-02',
  'cp3892-01',
  'cp4108-03',
  'cp3722-04',
  'cp3661-01',
  'cp4120-02',
  'cp3906-03',
  'cp3558-01',
  'cp4187-02',
  'cp4011-04',
];
const topMaterialSeries = materialSeries.slice(0, 20);

type MaterialTypeKey = 'video' | 'playable' | 'image';
type LanguageKey = 'en' | 'de' | 'fr' | 'it' | 'ja' | 'ko' | 'tw' | 'es' | 'pt';
type StackMode = 'normal' | 'percent';

const channelSeries = [
  { key: 'all', label: 'ALL', color: '#475569' },
  { key: 'applovin', label: 'Applovin', color: '#4f46e5' },
  { key: 'facebook', label: 'Facebook', color: '#0ea5e9' },
  { key: 'google', label: 'Google', color: '#059669' },
];

const languageOptions: { key: LanguageKey; label: string; scale: number }[] = [
  { key: 'en', label: 'EN', scale: 1 },
  { key: 'de', label: 'DE', scale: 0.76 },
  { key: 'fr', label: 'FR', scale: 0.72 },
  { key: 'it', label: 'IT', scale: 0.66 },
  { key: 'ja', label: 'JA', scale: 0.82 },
  { key: 'ko', label: 'KO', scale: 0.7 },
  { key: 'tw', label: 'TW', scale: 0.64 },
  { key: 'es', label: 'ES', scale: 0.78 },
  { key: 'pt', label: 'PT', scale: 0.68 },
];

const materialTypeOptions: { key: MaterialTypeKey; label: string; scale: number }[] = [
  { key: 'video', label: '视频', scale: 1 },
  { key: 'playable', label: '试玩', scale: 0.62 },
  { key: 'image', label: '图片', scale: 0.42 },
];

const campaignOptions = [
  { key: 'all', label: 'ALL Campaign' },
  { key: 'camp-merge-042', label: 'Campaign Merge 042' },
  { key: 'camp-playable-118', label: 'Campaign Playable 118' },
  { key: 'camp-local-207', label: 'Campaign Local 207' },
];

const adSetOptions = [
  { key: 'all', label: 'ALL Set' },
  { key: 'set-us-android', label: 'US Android Set' },
  { key: 'set-ios-core', label: 'iOS Core Set' },
  { key: 'set-local-exp', label: 'Local Exp Set' },
];

const formatDateAxis = (value: string) => value.slice(5);

const sharedDateAxisProps = {
  dataKey: 'date',
  tick: { fontSize: 8, fill: '#64748b' },
  tickFormatter: formatDateAxis,
  axisLine: false,
  tickLine: { stroke: '#cbd5e1' },
  interval: 0,
  minTickGap: 0,
  height: 38,
  padding: { left: 0, right: 0 },
} as const;

const EmptyTooltip = () => null;

const createSeededRandom = (seed: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h >>> 0) / 4294967296;
  };
};

const getChartDates = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
  const length = Math.min(15, diff);

  return Array.from({ length }, (_, index) => {
    const date = new Date(startDate);
    const step = length === diff ? index : Math.floor((index / Math.max(length - 1, 1)) * (diff - 1));
    date.setDate(date.getDate() + step);
    return date.toISOString().slice(0, 10);
  });
};

const sumSelectedScales = <T extends string>(selected: T[], options: { key: T; scale: number }[]) =>
  options.filter((option) => selected.includes(option.key)).reduce((sum, option) => sum + option.scale, 0) || 0.01;

const buildStackedData = (
  seed: string,
  dates: string[],
  selectedLanguages: LanguageKey[],
  selectedTypes: MaterialTypeKey[],
  scale = 1,
) => {
  const rng = createSeededRandom(`${seed}-${selectedLanguages.join('-')}-${selectedTypes.join('-')}`);
  const languageScale = sumSelectedScales(selectedLanguages, languageOptions) / languageOptions.reduce((sum, option) => sum + option.scale, 0);
  const typeScale = sumSelectedScales(selectedTypes, materialTypeOptions) / materialTypeOptions.reduce((sum, option) => sum + option.scale, 0);

  return dates.map((date, dayIndex) => {
    const row: Record<string, number | string> = { date };
    materialSeries.forEach((key, index) => {
      const peak = Math.exp(-Math.pow(dayIndex - (6 + index * 0.24), 2) / (18 + index * 1.5));
      const wave = 0.86 + Math.sin((dayIndex + index) / (2.4 + index * 0.12)) * 0.16;
      const base = Math.max(0, 620 - index * 38) * scale;
      const value = Math.max(0, base * (0.46 + peak * 0.58) * wave * languageScale * typeScale + rng() * 34 * scale);
      row[key] = Number(value.toFixed(2));
    });
    return row;
  });
};

const buildTopShareData = (dates: string[], selectedTypes: MaterialTypeKey[]) => {
  const typeScale = sumSelectedScales(selectedTypes, materialTypeOptions) / materialTypeOptions.reduce((sum, option) => sum + option.scale, 0);
  const rng = createSeededRandom(`top-share-${dates.join('-')}-${selectedTypes.join('-')}`);
  return dates.map((date, index) => {
    const wave = Math.sin(index / 2.1) * 1.8;
    return {
      date,
      all: Number((31.5 + wave + rng() * 1.6 + typeScale * 3.2).toFixed(2)),
      applovin: Number((34.8 + wave * 1.2 + rng() * 1.9 + typeScale * 2.8).toFixed(2)),
      facebook: Number((28.4 + wave * 0.9 + rng() * 1.4 + typeScale * 2.5).toFixed(2)),
      google: Number((30.6 + wave * 1.05 + rng() * 1.7 + typeScale * 2.9).toFixed(2)),
    };
  });
};

const buildTypeShareData = (dates: string[], channelKey: string) => {
  const rng = createSeededRandom(`type-share-${channelKey}-${dates.join('-')}`);
  const channelOffset = channelKey === 'applovin' ? -4 : channelKey === 'facebook' ? 5 : channelKey === 'google' ? -1 : 0;
  return dates.map((date, index) => ({
    date,
    video: Number((58 + channelOffset + Math.sin(index / 2.2) * 5 + rng() * 2).toFixed(2)),
    playable: Number((42 - channelOffset - Math.sin(index / 2.2) * 5 + rng() * 2).toFixed(2)),
  }));
};

const buildCpa7MaterialData = (dates: string[], seed: string, scale = 1) => {
  const rng = createSeededRandom(`cpa7-${seed}-${dates.join('-')}`);
  return dates.map((date, dayIndex) => {
    const row: Record<string, number | string> = { date };
    topMaterialSeries.forEach((key, index) => {
      const baseline = (214 + index * 13) * scale;
      const wave = Math.sin((dayIndex + index) / 2.4) * (18 + index * 1.2);
      const value = Math.max(95, baseline + wave + rng() * 28);
      row[key] = Number(value.toFixed(0));
    });
    return row;
  });
};

const formatTooltipValue = (value: number, unit: 'number' | 'percent' | 'currency') => {
  if (unit === 'percent') {
    const percentValue = value <= 1 ? value * 100 : value;
    return `${percentValue.toFixed(2)}%`;
  }
  if (unit === 'currency') {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const UnifiedTooltip = ({
  active,
  payload,
  label,
  unit = 'number',
  nameMap = {},
  coordinate,
  viewBox,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: 'number' | 'percent' | 'currency';
  nameMap?: Record<string, string>;
  coordinate?: { x?: number; y?: number };
  viewBox?: { width?: number };
}) => {
  if (!active || !payload?.length) return null;
  const rows = payload
    .filter((item: any) => item.value !== null && item.value !== undefined && Number(item.value) > 0)
    .slice()
    .reverse();
  const total = rows.reduce((sum: number, item: any) => sum + Number(item.value || 0), 0);
  const chartWidth = Number(viewBox?.width || 0);
  const cursorX = Number(coordinate?.x || 0);
  const cursorY = Number(coordinate?.y || 0);
  const tooltipWidth = 288;
  const canUseOutsidePosition = Boolean(chartWidth && coordinate?.x !== undefined);
  const placeRight = canUseOutsidePosition ? cursorX < chartWidth / 2 : true;
  const translateX = canUseOutsidePosition ? (placeRight ? chartWidth - cursorX + 16 : -cursorX - tooltipWidth - 16) : 0;
  const translateY = canUseOutsidePosition && cursorY ? -cursorY + 8 : 0;

  return (
    <div
      className="w-72 rounded-xl border border-slate-150 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5"
      style={canUseOutsidePosition ? { transform: `translate(${translateX}px, ${translateY}px)` } : undefined}
    >
      <div className="mb-3 text-sm font-black text-slate-900">{label}</div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {rows.map((item: any) => (
          <div key={item.dataKey} className="grid grid-cols-[14px_1fr_auto] items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.stroke || item.fill || item.color }} />
            <span className="min-w-0 truncate font-bold text-slate-600">{nameMap[String(item.dataKey)] || item.name || item.dataKey}</span>
            <span className="font-mono font-black text-slate-900">{formatTooltipValue(Number(item.value), unit)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-medium text-slate-500">总计</span>
        <span className="font-mono font-black text-slate-900">{formatTooltipValue(total, unit)}</span>
      </div>
    </div>
  );
};

const tooltipOutsideChartProps = {
  allowEscapeViewBox: { x: true, y: true },
  position: { x: 8, y: 176 },
  wrapperStyle: { zIndex: 60, pointerEvents: 'none' as const },
} as const;

const SeriesToggleGroup = ({
  options,
  visible,
  onToggle,
}: {
  options: { key: string; label: string; color: string }[];
  visible: string[];
  onToggle: (key: string) => void;
}) => {
  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {options.map((option) => {
        const isActive = visible.includes(option.key);
        return (
          <button
            key={option.key}
            onClick={() => onToggle(option.key)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-black transition-all ${
              isActive ? 'border-slate-200 bg-white text-slate-800 shadow-sm' : 'border-slate-150 bg-slate-100 text-slate-400'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isActive ? option.color : '#cbd5e1' }} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

const PaginatedSeriesToggleGroup = ({
  options,
  visible,
  onToggle,
  pageSize = 7,
}: {
  options: { key: string; label: string; color: string }[];
  visible: string[];
  onToggle: (key: string) => void;
  pageSize?: number;
}) => {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(options.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageOptions = options.slice(safePage * pageSize, safePage * pageSize + pageSize);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setPage((current) => Math.max(0, current - 1))}
        disabled={safePage === 0}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
        aria-label="上一页"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <SeriesToggleGroup
        options={pageOptions}
        visible={visible}
        onToggle={onToggle}
      />
      <button
        onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
        disabled={safePage === pageCount - 1}
        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-slate-400 transition-all hover:border-slate-150 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25"
        aria-label="下一页"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const CheckboxIcon = ({ checked, mixed }: { checked: boolean; mixed?: boolean }) => (
  <span
    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-all ${
      checked || mixed ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-transparent'
    }`}
  >
    {mixed ? <Minus className="h-3 w-3" /> : <Check className="h-3 w-3 stroke-[3]" />}
  </span>
);

const FilterChipGroup = <T extends string>({
  options,
  selected,
  onToggle,
  onSelectAll,
  onClear,
}: {
  options: { key: T; label: string }[];
  selected: T[];
  onToggle: (key: T) => void;
  onSelectAll?: () => void;
  onClear?: () => void;
}) => (
  <div className="space-y-1">
    {onSelectAll && onClear && options.length > 1 && (() => {
      const allSelected = selected.length === options.length;
      const partiallySelected = selected.length > 0 && !allSelected;
      return (
        <button
          onClick={allSelected ? onClear : onSelectAll}
          className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-[11px] font-black text-slate-800 transition-colors hover:bg-slate-50"
        >
          <CheckboxIcon checked={allSelected} mixed={partiallySelected} />
          <span>全选</span>
        </button>
      );
    })()}
    <div className="space-y-1">
      {options.map((option) => {
        const isActive = selected.includes(option.key);
        return (
          <button
            key={option.key}
            onClick={() => onToggle(option.key)}
            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <CheckboxIcon checked={isActive} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const StackModeSwitch = ({ value, onChange }: { value: StackMode; onChange: (value: StackMode) => void }) => (
  <div className="flex rounded-lg border border-slate-150 bg-white p-0.5">
    {[
      { key: 'percent', label: '百分比' },
      { key: 'normal', label: '常规' },
    ].map((option) => (
      <button
        key={option.key}
        onClick={() => onChange(option.key as StackMode)}
        className={`rounded-md px-2 py-0.5 text-[8.5px] font-black transition-all ${
          value === option.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const FilterMenu = ({ children, label = '筛选' }: { children: React.ReactNode; label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-black transition-all ${
          isOpen ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-150 bg-white text-slate-500 hover:text-slate-900'
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {label}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-9 z-30 w-72 rounded-xl border border-slate-150 bg-white p-3 text-left shadow-xl ring-1 ring-slate-900/5">
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <p className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">{title}</p>
    {children}
  </div>
);

const ChartPanel = ({
  title,
  subtitle,
  controls,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <article className="flex h-[390px] min-w-0 flex-col overflow-visible rounded-2xl border border-slate-150 bg-slate-50/80 p-4 shadow-3xs">
    <div className="mb-3 flex min-h-[74px] flex-col gap-2 border-b border-slate-150/70 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black tracking-tight text-slate-800" title={title}>{title}</h3>
          {subtitle && <p className="mt-1 text-[9.5px] font-bold text-slate-400">{subtitle}</p>}
        </div>
        {controls}
      </div>
    </div>
    <div className="h-[168px] shrink-0 overflow-visible">
      {children}
    </div>
    {footer && (
      <div className="mt-3 border-t border-slate-150/70 pt-3">
        {footer}
      </div>
    )}
  </article>
);

const MiniChart = ({ metric, color, type }: { metric: OverviewMetric, color: string, type: 'area' | 'line' | 'bar' }) => {
  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={metric.history}>
          <defs>
            <linearGradient id={`color-${metric.label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip content={<EmptyTooltip />} cursor={{ stroke: color, strokeWidth: 1 }} />
          <Area type="linear" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#color-${metric.label})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metric.history}>
          <Tooltip content={<EmptyTooltip />} cursor={{fill: 'transparent'}} />
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={metric.history}>
        <Tooltip content={<EmptyTooltip />} cursor={{ stroke: color, strokeWidth: 1 }} />
        <Line type="linear" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const Overview: React.FC = () => {
  // Launch Time Filters (Cohort) - Date Range
  const [launchStart, setLaunchStart] = useState<string>('');
  const [launchEnd, setLaunchEnd] = useState<string>('');

  // Spend Period Filters (Trend/Observation) - Date Range
  const [spendStart, setSpendStart] = useState<string>(() => {
     return getRecentUtcRange(30).start;
  });
  const [spendEnd, setSpendEnd] = useState<string>(() => getRecentUtcRange(30).end);

  // Channel Filter
  const [channel, setChannel] = useState<string>('');
  const [campaign, setCampaign] = useState<string>('');
  const [adSet, setAdSet] = useState<string>('');
  
  const [materials, setMaterials] = useState<AdMaterial[]>([]);
  
  // We need two sets of metrics for the KPI cards (Total vs Localized)
  const [metricsAll, setMetricsAll] = useState<{ [key: string]: OverviewMetric } | null>(null);
  const [metricsLoc, setMetricsLoc] = useState<{ [key: string]: OverviewMetric } | null>(null);
  
  const [analysisData, setAnalysisData] = useState<KeywordAnalysisData>(mockKeywordAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [cpa7Min, setCpa7Min] = useState<number>(0);
  const [cpa7Max, setCpa7Max] = useState<number>(400);
  const [selectedTypes, setSelectedTypes] = useState<MaterialTypeKey[]>(materialTypeOptions.map((option) => option.key));
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageKey[]>(languageOptions.map((option) => option.key));
  const [topShareVisible, setTopShareVisible] = useState<string[]>(channelSeries.map((item) => item.key));
  const [stackVisible, setStackVisible] = useState<string[]>(topMaterialSeries);
  const [typeShareChannel, setTypeShareChannel] = useState<string>('all');
  const [typeShareVisible, setTypeShareVisible] = useState<string[]>(['video', 'playable']);
  const [cpa7Visible, setCpa7Visible] = useState<string[]>(topMaterialSeries);
  const [globalStackMode, setGlobalStackMode] = useState<StackMode>('percent');
  const [applovinAndroidStackMode, setApplovinAndroidStackMode] = useState<StackMode>('normal');
  const [applovinIosStackMode, setApplovinIosStackMode] = useState<StackMode>('normal');
  const [googleStackMode, setGoogleStackMode] = useState<StackMode>('normal');
  
  useEffect(() => {
    // Fetch materials (Global context usually implies 'all' for materials list if filter is removed)
    setMaterials(generateTopMaterials(launchStart, launchEnd, channel || 'all'));
    
    // Fetch KPI Data (Total and Localized)
    setMetricsAll(generateOverviewData(launchStart, launchEnd, spendStart, spendEnd, 'all', channel || 'all'));
    setMetricsLoc(generateOverviewData(launchStart, launchEnd, spendStart, spendEnd, 'localized', channel || 'all'));
    
    setAnalysisData(mockKeywordAnalysis);
  }, [launchStart, launchEnd, spendStart, spendEnd, channel]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMaterials(materials);
    setAnalysisData(result);
    setIsAnalyzing(false);
  };

  const overviewKpis = [
    {
      key: 'totalCost',
      label: '总花费',
      value: '$1,042,208.17',
      detail: '全部: $1,042,208.17    本地化: $1,042,208.17',
      color: '#6366f1',
      metric: metricsAll?.totalCost,
    },
    {
      key: 'totalCount',
      label: '上线素材数',
      value: '6,388',
      detail: '全部: 7,320    本地化: 932',
      color: '#60a5fa',
      metric: metricsAll?.totalCount,
    },
    {
      key: 'newCost',
      label: '新素材花费',
      value: '$875,967.30',
      detail: '全部: $1,042,208.17    本地化: $166,240.88',
      color: '#a78bfa',
      metric: metricsAll?.newCost,
    },
    {
      key: 'newCostShare',
      label: '新素材花费占比',
      value: '84.05%',
      detail: '全部: 100.00%    本地化: 15.95%',
      color: '#f472b6',
      metric: metricsAll?.newCostShare,
    },
  ];

  const chartDates = useMemo(() => getChartDates(spendStart, spendEnd), [spendStart, spendEnd]);
  const topShareData = useMemo(() => buildTopShareData(chartDates, selectedTypes), [chartDates, selectedTypes]);
  const typeShareData = useMemo(() => buildTypeShareData(chartDates, typeShareChannel), [chartDates, typeShareChannel]);
  const globalStackData = useMemo(
    () => buildStackedData(`global-${spendStart}-${spendEnd}`, chartDates, selectedLanguages, selectedTypes, 1),
    [chartDates, selectedLanguages, selectedTypes, spendStart, spendEnd],
  );
  const applovinAndroidStack = useMemo(
    () => buildStackedData('applovin-android', chartDates, selectedLanguages, selectedTypes, 0.78),
    [chartDates, selectedLanguages, selectedTypes],
  );
  const applovinIosStack = useMemo(
    () => buildStackedData('applovin-ios', chartDates, selectedLanguages, selectedTypes, 0.68),
    [chartDates, selectedLanguages, selectedTypes],
  );
  const googleStack = useMemo(
    () => buildStackedData('google', chartDates, selectedLanguages, selectedTypes, 0.72),
    [chartDates, selectedLanguages, selectedTypes],
  );
  const materialLegendOptions = topMaterialSeries.map((key, index) => ({
    key,
    label: key,
    color: seriesPalette[index],
  }));
  const toggleListValue = <T extends string>(current: T[], key: T) =>
    current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
  const toggleVisibleValue = (current: string[], key: string) =>
    current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
  const selectedTypePreset =
    selectedTypes.length === materialTypeOptions.length
      ? ''
      : selectedTypes.length === 1
        ? selectedTypes[0]
        : 'custom';
  const handleTopMaterialTypeChange = (value: string) => {
    if (value === '') {
      setSelectedTypes(materialTypeOptions.map((option) => option.key));
      return;
    }
    if (value !== 'custom') setSelectedTypes([value as MaterialTypeKey]);
  };
  const cpa7LegendOptions = topMaterialSeries.map((key, index) => ({
    key,
    label: key,
    color: seriesPalette[index],
  }));
  const cpa7Charts = [
    {
      title: 'Applovin Android Top20素材 CPA7',
      data: buildCpa7MaterialData(chartDates, 'applovin-android', 1),
    },
    {
      title: 'Applovin iOS Top20素材 CPA7',
      data: buildCpa7MaterialData(chartDates, 'applovin-ios', 1.08),
    },
    {
      title: 'Google Top20素材 CPA7',
      data: buildCpa7MaterialData(chartDates, 'google', 0.94),
    },
  ].map((chart) => ({
    ...chart,
    data: chart.data.map((row) => {
      const next: Record<string, number | string | null> = { date: row.date };
      topMaterialSeries.forEach((key) => {
        const value = Number(row[key] || 0);
        next[key] = value >= cpa7Min && value <= cpa7Max ? value : null;
      });
      return next;
    }),
  }));

  return (
    <div className="space-y-5 pb-10">
      <AnalyticsFilterBar>
        <AnalyticsDateRangeField
          mode="launch"
          start={launchStart}
          end={launchEnd}
          onChange={({ start, end }) => {
            setLaunchStart(start);
            setLaunchEnd(end);
          }}
        />
        <AnalyticsDateRangeField
          start={spendStart}
          end={spendEnd}
          onChange={({ start, end }) => {
            setSpendStart(start);
            setSpendEnd(end);
          }}
        />
        <AnalyticsSelectField
          placeholder="Campaign"
          value={campaign}
          onChange={setCampaign}
          options={campaignOptions.filter((option) => option.key !== 'all').map((option) => ({ value: option.key, label: option.label }))}
          className="w-[220px]"
        />
        <AnalyticsSelectField
          placeholder="Set"
          value={adSet}
          onChange={setAdSet}
          options={adSetOptions.filter((option) => option.key !== 'all').map((option) => ({ value: option.key, label: option.label }))}
          className="w-[200px]"
        />
        <AnalyticsSelectField
          placeholder="渠道"
          value={channel}
          onChange={setChannel}
          options={[
            { value: 'applovin', label: 'Applovin' },
            { value: 'google', label: 'Google' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'unity', label: 'Unity' },
          ]}
          className="w-[180px]"
        />
        <AnalyticsSelectField
          placeholder="素材类型"
          value={selectedTypePreset}
          onChange={handleTopMaterialTypeChange}
          options={[
            { value: 'playable', label: '试玩' },
            { value: 'video', label: '视频' },
            { value: 'image', label: '图片' },
          ]}
          className="w-[180px]"
        />
      </AnalyticsFilterBar>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewKpis.map((item) => (
          <div key={item.key} className="relative h-28 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[9.5px] font-black text-slate-500">{item.label}</span>
                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">↗0%</span>
              </div>
              <p className="mt-1 text-xl font-black tracking-tight text-slate-900">{item.value}</p>
              <p className="mt-auto truncate text-[9.5px] font-medium text-slate-500">{item.detail}</p>
            </div>
            {item.metric && (
              <div className="absolute bottom-2 right-2 h-12 w-24 opacity-40">
                <MiniChart metric={item.metric} color={item.color} type={item.key === 'totalCount' ? 'line' : 'area'} />
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="flex items-center text-xl font-black tracking-tight text-slate-900">
              <span className="mr-3 h-6 w-1.5 rounded-full bg-primary"></span>
              消耗数据图表
            </h2>
            <p className="mt-3 flex items-center gap-2 text-xs font-black text-slate-700">
              <span className="h-4 w-1 rounded-full bg-indigo-500"></span>
              Top20 素材花费结构与类型占比
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartPanel
            title="Top20素材花费占全部素材花费占比"
            subtitle="ALL / Applovin / Facebook / Google"
            controls={
              <FilterMenu>
                <FilterBlock title="素材类型">
                  <FilterChipGroup
                    options={materialTypeOptions}
                    selected={selectedTypes}
                    onToggle={(key) => setSelectedTypes((current) => toggleListValue(current, key))}
                    onSelectAll={() => setSelectedTypes(materialTypeOptions.map((option) => option.key))}
                    onClear={() => setSelectedTypes([])}
                  />
                </FilterBlock>
              </FilterMenu>
            }
            footer={
              <SeriesToggleGroup
                options={channelSeries}
                visible={topShareVisible}
                onToggle={(key) => setTopShareVisible((current) => toggleVisibleValue(current, key))}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={topShareData} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis {...sharedDateAxisProps} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  content={<UnifiedTooltip unit="percent" nameMap={Object.fromEntries(channelSeries.map((item) => [item.key, item.label]))} />}
                  {...tooltipOutsideChartProps}
                />
                {channelSeries.filter((item) => topShareVisible.includes(item.key)).map((item) => (
                  <Line key={item.key} type="monotone" dataKey={item.key} stroke={item.color} strokeWidth={2.2} dot={{ r: 2, fill: '#fff', stroke: item.color }} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel
            title="全渠道Top20素材花费比例"
            subtitle="语言：EN / DE / FR / IT / JA / KO / TW / ES / PT"
            controls={
              <FilterMenu>
                <FilterBlock title="堆叠模式">
                  <StackModeSwitch value={globalStackMode} onChange={setGlobalStackMode} />
                </FilterBlock>
                <FilterBlock title="素材类型">
                  <FilterChipGroup
                    options={materialTypeOptions}
                    selected={selectedTypes}
                    onToggle={(key) => setSelectedTypes((current) => toggleListValue(current, key))}
                    onSelectAll={() => setSelectedTypes(materialTypeOptions.map((option) => option.key))}
                    onClear={() => setSelectedTypes([])}
                  />
                </FilterBlock>
                <FilterBlock title="语言">
                  <FilterChipGroup
                    options={languageOptions}
                    selected={selectedLanguages}
                    onToggle={(key) => setSelectedLanguages((current) => toggleListValue(current, key))}
                    onSelectAll={() => setSelectedLanguages(languageOptions.map((option) => option.key))}
                    onClear={() => setSelectedLanguages([])}
                  />
                </FilterBlock>
              </FilterMenu>
            }
            footer={
              <PaginatedSeriesToggleGroup
                options={materialLegendOptions}
                visible={stackVisible}
                onToggle={(key) => setStackVisible((current) => toggleVisibleValue(current, key))}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={globalStackData} stackOffset={globalStackMode === 'percent' ? 'expand' : 'none'} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#d8dee8" strokeDasharray="3 3" vertical={false} />
                <XAxis {...sharedDateAxisProps} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(value) => globalStackMode === 'percent' ? `${Math.round(Number(value) * 100)}%` : `${value}`} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  content={<UnifiedTooltip unit={globalStackMode === 'percent' ? 'percent' : 'number'} />}
                  cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                  {...tooltipOutsideChartProps}
                />
                {topMaterialSeries.filter((key) => stackVisible.includes(key)).map((key) => {
                  const index = topMaterialSeries.indexOf(key);
                  return (
                  <Area key={key} type="linear" dataKey={key} stackId="1" stroke={seriesPalette[index]} fill={seriesFillPalette[index]} fillOpacity={0.82} strokeWidth={1.4} isAnimationActive={false} />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel
            title="试玩和视频花费占比"
            subtitle="渠道通过右侧筛选切换"
            controls={
              <FilterMenu>
                <FilterBlock title="渠道">
                  <FilterChipGroup
                    options={channelSeries}
                    selected={[typeShareChannel]}
                    onToggle={(key) => setTypeShareChannel(key)}
                  />
                </FilterBlock>
              </FilterMenu>
            }
            footer={
              <SeriesToggleGroup
                options={[
                  { key: 'video', label: '视频', color: '#4f46e5' },
                  { key: 'playable', label: '试玩', color: '#a5b4fc' },
                ]}
                visible={typeShareVisible}
                onToggle={(key) => setTypeShareVisible((current) => toggleVisibleValue(current, key))}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeShareData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis {...sharedDateAxisProps} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  content={<UnifiedTooltip unit="percent" nameMap={{ video: '视频', playable: '试玩' }} />}
                  cursor={{ fill: '#e2e8f066' }}
                  {...tooltipOutsideChartProps}
                />
                {typeShareVisible.includes('video') && <Bar dataKey="video" name="视频" fill="#4f46e5" radius={[2, 2, 0, 0]} isAnimationActive={false} />}
                {typeShareVisible.includes('playable') && <Bar dataKey="playable" name="试玩" fill="#a5b4fc" radius={[2, 2, 0, 0]} isAnimationActive={false} />}
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          {[
            { title: 'applovin- Android Top20素材花费', data: applovinAndroidStack, mode: applovinAndroidStackMode, setMode: setApplovinAndroidStackMode },
            { title: 'applovin- iOS Top20素材花费', data: applovinIosStack, mode: applovinIosStackMode, setMode: setApplovinIosStackMode },
            { title: 'google Top20素材花费', data: googleStack, mode: googleStackMode, setMode: setGoogleStackMode },
          ].map((chart) => (
            <ChartPanel
              key={chart.title}
              title={chart.title}
              subtitle="Top20 素材日花费堆叠"
              controls={
                <FilterMenu>
                  <FilterBlock title="堆叠模式">
                    <StackModeSwitch value={chart.mode} onChange={chart.setMode} />
                  </FilterBlock>
                  <FilterBlock title="素材类型">
                    <FilterChipGroup
                      options={materialTypeOptions}
                      selected={selectedTypes}
                      onToggle={(key) => setSelectedTypes((current) => toggleListValue(current, key))}
                      onSelectAll={() => setSelectedTypes(materialTypeOptions.map((option) => option.key))}
                      onClear={() => setSelectedTypes([])}
                    />
                  </FilterBlock>
                  <FilterBlock title="语言">
                    <FilterChipGroup
                      options={languageOptions}
                      selected={selectedLanguages}
                      onToggle={(key) => setSelectedLanguages((current) => toggleListValue(current, key))}
                      onSelectAll={() => setSelectedLanguages(languageOptions.map((option) => option.key))}
                      onClear={() => setSelectedLanguages([])}
                    />
                  </FilterBlock>
                </FilterMenu>
              }
              footer={
                <PaginatedSeriesToggleGroup
                  options={materialLegendOptions}
                  visible={stackVisible}
                  onToggle={(key) => setStackVisible((current) => toggleVisibleValue(current, key))}
                />
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data} stackOffset={chart.mode === 'percent' ? 'expand' : 'none'} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#d8dee8" strokeDasharray="3 3" vertical={false} />
                  <XAxis {...sharedDateAxisProps} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(value) => chart.mode === 'percent' ? `${Math.round(Number(value) * 100)}%` : `${value}`} axisLine={false} tickLine={false} width={42} />
                  <Tooltip
                    content={<UnifiedTooltip unit={chart.mode === 'percent' ? 'percent' : 'number'} />}
                    cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                    {...tooltipOutsideChartProps}
                  />
                  {topMaterialSeries.filter((key) => stackVisible.includes(key)).map((key) => {
                    const index = topMaterialSeries.indexOf(key);
                    return (
                      <Area key={key} type="linear" dataKey={key} stackId="1" stroke={seriesPalette[index]} fill={seriesFillPalette[index]} fillOpacity={0.82} strokeWidth={1.4} isAnimationActive={false} />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="flex items-center text-xl font-black tracking-tight text-slate-900">
            <span className="mr-3 h-6 w-1.5 rounded-full bg-primary"></span>
            Top20 素材 CPA7 折线图
          </h2>
          <FilterMenu>
            <FilterBlock title="CPA7 范围">
              <div className="flex items-center gap-2">
                <input value={cpa7Min} onChange={(e) => setCpa7Min(Number(e.target.value))} className="h-7 w-20 rounded-lg border border-slate-200 bg-white text-center text-xs font-bold text-slate-700" type="number" />
                <span className="text-[9.5px] font-medium text-slate-400">~</span>
                <input value={cpa7Max} onChange={(e) => setCpa7Max(Number(e.target.value))} className="h-7 w-20 rounded-lg border border-slate-200 bg-white text-center text-xs font-bold text-slate-700" type="number" />
              </div>
            </FilterBlock>
          </FilterMenu>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {cpa7Charts.map((chart) => (
            <ChartPanel
              key={chart.title}
              title={chart.title}
              subtitle="按素材编号展示 CPA7 日趋势"
              footer={
                <PaginatedSeriesToggleGroup
                  options={cpa7LegendOptions}
                  visible={cpa7Visible}
                  onToggle={(key) => setCpa7Visible((current) => toggleVisibleValue(current, key))}
                />
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis {...sharedDateAxisProps} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} width={42} />
                  <Tooltip
                    content={<UnifiedTooltip unit="currency" />}
                    {...tooltipOutsideChartProps}
                  />
                  {topMaterialSeries.filter((key) => cpa7Visible.includes(key)).map((key) => {
                    const index = topMaterialSeries.indexOf(key);
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={seriesPalette[index]}
                        strokeWidth={1.9}
                        dot={{ r: 1.8, fill: '#fff', stroke: seriesPalette[index] }}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center justify-end text-xl font-black tracking-tight text-slate-900">
            <span className="mr-auto h-6 w-1.5 rounded-full bg-purple-500"></span>
            头部素材 (Top Performers)
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            {materials.filter((m) => m.isGood).slice(0, 12).map((mat) => (
              <article key={mat.id} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-3xs">
                <div className="relative aspect-[9/16] bg-slate-100">
                  <img src={mat.thumbnail} alt={mat.name} className="h-full w-full object-cover" />
                  <span className="absolute right-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">TOP</span>
                </div>
                <div className="space-y-1.5 p-2">
                  <h3 className="truncate text-[10px] font-black text-slate-800" title={mat.name}>{mat.name}</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-medium text-slate-500">
                    <span>负责人</span><span className="text-right font-bold text-slate-700">{mat.creator}</span>
                    <span>语种</span><span className="text-right font-bold text-slate-700">{mat.language.toLowerCase()}</span>
                    <span>结果</span><span className="text-right font-black text-emerald-600">好</span>
                  </div>
                  <div className="border-t border-slate-100 pt-1 text-[9px] font-medium text-slate-500">
                    <div className="flex justify-between"><span>成功素材花费</span><span className="font-mono text-slate-700">${mat.liveCampCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>成功素材占比</span><span className="font-mono text-slate-700">{mat.liveCampShare.toFixed(2)}%</span></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex min-h-[520px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center text-xl font-black tracking-tight text-slate-900">
              <span className="mr-3 h-6 w-1.5 rounded-full bg-emerald-500"></span>
              关键词分析
            </h2>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400">
            {isAnalyzing ? (
              <>
                <LoaderCircle className="mb-4 h-8 w-8 animate-spin text-slate-300" />
                <p className="text-xs font-medium">正在分析中...</p>
              </>
            ) : (
              <>
                <Database className="mb-4 h-8 w-8 text-slate-200" />
                <p className="max-w-xs text-xs font-medium leading-relaxed">{analysisData.summary}</p>
              </>
            )}
          </div>
          <button
            onClick={handleAiAnalysis}
            disabled={isAnalyzing}
            className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-xs font-black text-sky-500 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh AI Analysis
          </button>
        </section>
      </div>
    </div>
  );
};

export default Overview;
