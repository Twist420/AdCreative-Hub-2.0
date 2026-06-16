

import React, { useState, useEffect } from 'react';
import { generateOverviewData, generateTopMaterials, OverviewMetric, mockKeywordAnalysis } from '../services/mockData';
import { analyzeMaterials } from '../services/geminiService';
import { AdMaterial, KeywordAnalysisData } from '../types';
import { ArrowUpRight, Calendar, Clock, Database, Layers, LoaderCircle, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid } from 'recharts';
import DateRangePicker from './DateRangePicker';

type QuickRange = number | 'month' | 'lastMonth' | 'lastTwoMonths';

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
];

const formatDateAxis = (value: string) => value.slice(5);

const EmptyTooltip = () => null;

const StackedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const rows = payload
    .filter((item: any) => Number(item.value) > 0)
    .slice()
    .reverse();

  return (
    <div className="w-72 rounded-2xl border border-slate-150 bg-white p-4 text-xs shadow-2xl ring-1 ring-slate-900/5">
      <div className="mb-3 text-sm font-black text-slate-900">{label}</div>
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {rows.map((item: any) => (
          <div key={item.dataKey} className="grid grid-cols-[14px_1fr_auto] items-center gap-2">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: item.stroke || item.color }} />
            <span className="min-w-0 truncate font-medium text-slate-600">{item.name}</span>
            <span className="font-mono font-black text-slate-900">{Number(item.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-medium text-slate-500">总计</span>
        <span className="font-mono font-black text-slate-900">
          {rows.reduce((sum: number, item: any) => sum + Number(item.value || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
};

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
  const [launchStart, setLaunchStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // 1st of current month
    return d.toISOString().slice(0, 10);
  });
  const [launchEnd, setLaunchEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  // Spend Period Filters (Trend/Observation) - Date Range
  const [spendStart, setSpendStart] = useState<string>(() => {
     const d = new Date();
     d.setDate(d.getDate() - 30);
     return d.toISOString().slice(0, 10);
  });
  const [spendEnd, setSpendEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  // Channel Filter
  const [channel, setChannel] = useState<string>('all');
  
  const [trendLanguage, setTrendLanguage] = useState<'all' | 'en' | 'localized'>('all');

  const [materials, setMaterials] = useState<AdMaterial[]>([]);
  
  // We need two sets of metrics for the KPI cards (Total vs Localized)
  const [metricsAll, setMetricsAll] = useState<{ [key: string]: OverviewMetric } | null>(null);
  const [metricsLoc, setMetricsLoc] = useState<{ [key: string]: OverviewMetric } | null>(null);
  
  const [analysisData, setAnalysisData] = useState<KeywordAnalysisData>(mockKeywordAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [cpa7Min, setCpa7Min] = useState<number>(0);
  const [cpa7Max, setCpa7Max] = useState<number>(400);
  
  useEffect(() => {
    // Fetch materials (Global context usually implies 'all' for materials list if filter is removed)
    setMaterials(generateTopMaterials(launchStart, launchEnd, channel));
    
    // Fetch KPI Data (Total and Localized)
    setMetricsAll(generateOverviewData(launchStart, launchEnd, spendStart, spendEnd, 'all', channel));
    setMetricsLoc(generateOverviewData(launchStart, launchEnd, spendStart, spendEnd, 'localized', channel));
    
    setAnalysisData(mockKeywordAnalysis);
  }, [launchStart, launchEnd, spendStart, spendEnd, channel]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMaterials(materials);
    setAnalysisData(result);
    setIsAnalyzing(false);
  };

  // Helper for Quick Select (Generic for both filters)
  const setQuickRange = (type: 'launch' | 'spend', days: QuickRange) => {
     const end = new Date();
     let start = new Date();
     
     if (days === 'month') {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
     } else if (days === 'lastMonth') {
        start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        end.setDate(0);
     } else if (days === 'lastTwoMonths') {
        start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
        end.setDate(0);
     } else {
        start.setDate(end.getDate() - days);
     }

     const sStr = start.toISOString().slice(0, 10);
     const eStr = end.toISOString().slice(0, 10);

     if (type === 'launch') {
        setLaunchStart(sStr);
        setLaunchEnd(eStr);
     } else {
        setSpendStart(sStr);
        setSpendEnd(eStr);
     }
  };

  const buildStackedData = (seed: string, daysLimit = 15, scale = 1) => {
    const rng = (() => {
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
    })();
    const baseDate = new Date(spendStart);
    return Array.from({ length: daysLimit }, (_, dayIndex) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayIndex);
      const row: Record<string, number | string> = { date: date.toISOString().slice(0, 10) };
      materialSeries.forEach((key, index) => {
        const peak = Math.exp(-Math.pow(dayIndex - (7 + index * 0.28), 2) / (18 + index * 1.6));
        const wave = 0.82 + Math.sin((dayIndex + index) / (2.6 + index * 0.12)) * 0.18;
        const base = Math.max(0, 520 - index * 46) * scale;
        const value = Math.max(0, base * (0.42 + peak * 0.62) * wave + rng() * 42 * scale - index * 4);
        row[key] = Number(value.toFixed(2));
      });
      return row;
    });
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

  const allLanguageStack = buildStackedData(`all-${spendStart}-${spendEnd}`, 15, 1);
  const englishStack = buildStackedData(`en-${spendStart}-${spendEnd}`, 15, 0.86);
  const channelStacks = [
    { title: 'Applovin Android', data: buildStackedData('apl-android', 15, 0.78) },
    { title: 'Applovin iOS', data: buildStackedData('apl-ios', 15, 0.68) },
    { title: 'Google', data: buildStackedData('google', 15, 0.72) },
  ];
  const cpa7Charts = [
    {
      title: 'AL - Android',
      color: '#6366f1',
      data: [
        { date: '2026-05-19', cpa7: 338 },
        { date: '2026-05-20', cpa7: 346 },
        { date: '2026-05-23', cpa7: 388 },
        { date: '2026-05-27', cpa7: 382 },
        { date: '2026-05-31', cpa7: 352 },
        { date: '2026-06-04', cpa7: 391 },
        { date: '2026-06-06', cpa7: 236 },
        { date: '2026-06-09', cpa7: 351 },
        { date: '2026-06-11', cpa7: 340 },
      ],
    },
    {
      title: 'AL - iOS',
      color: '#ec4899',
      data: [],
    },
    {
      title: 'Google - Android',
      color: '#3b82f6',
      data: [
        { date: '2026-05-17', cpa7: 260 },
        { date: '2026-05-18', cpa7: 345 },
        { date: '2026-05-19', cpa7: 392 },
        { date: '2026-05-20', cpa7: 262 },
        { date: '2026-05-21', cpa7: 388 },
        { date: '2026-05-25', cpa7: 398 },
        { date: '2026-05-29', cpa7: 280 },
        { date: '2026-06-01', cpa7: 377 },
        { date: '2026-06-04', cpa7: 350 },
        { date: '2026-06-08', cpa7: 250 },
        { date: '2026-06-09', cpa7: 371 },
        { date: '2026-06-10', cpa7: 323 },
      ],
    },
  ].map((chart) => ({
    ...chart,
    data: chart.data.filter((item) => item.cpa7 >= cpa7Min && item.cpa7 <= cpa7Max),
  }));

  return (
    <div className="space-y-5 pb-10">
      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:grid-cols-[1fr_1.45fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black tracking-tight text-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <span>发布周期</span>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-1">
              {[
                { label: '本月', val: 'month' },
                { label: '近30天', val: 30 },
                { label: '近90天', val: 90 },
                { label: '上月', val: 'lastMonth' },
                { label: '上2个月', val: 'lastTwoMonths' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setQuickRange('launch', item.val as QuickRange)}
                  className="whitespace-nowrap rounded-md px-2 py-1 text-[9.5px] font-bold text-slate-500 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <DateRangePicker
            start={launchStart}
            end={launchEnd}
            onChange={({ start, end }) => {
              setLaunchStart(start);
              setLaunchEnd(end);
            }}
            buttonClassName="h-[38px]"
          />
        </div>

        <div className="flex flex-col gap-3 border-slate-100 xl:border-l xl:border-r xl:px-5">
          <div className="flex items-center gap-2 text-xs font-black tracking-tight text-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
              <Layers className="h-4 w-4 text-orange-600" />
            </div>
            <span>渠道</span>
          </div>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="h-[38px] w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-black text-slate-700 focus:border-primary focus:ring-primary"
          >
            <option value="all">ALL</option>
            <option value="applovin">Applovin</option>
            <option value="google">Google</option>
            <option value="facebook">Facebook</option>
            <option value="unity">Unity</option>
          </select>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black tracking-tight text-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
              <span>花费周期</span>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-1">
              {[
                { label: '本月', val: 'month' },
                { label: '近30天', val: 30 },
                { label: '近90天', val: 90 },
                { label: '上月', val: 'lastMonth' },
                { label: '上2个月', val: 'lastTwoMonths' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setQuickRange('spend', item.val as QuickRange)}
                  className="whitespace-nowrap rounded-md px-2 py-1 text-[9.5px] font-bold text-slate-500 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <DateRangePicker
            start={spendStart}
            end={spendEnd}
            onChange={({ start, end }) => {
              setSpendStart(start);
              setSpendEnd(end);
            }}
            align="right"
            buttonClassName="h-[38px]"
          />
        </div>
      </div>

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
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="flex items-center text-xl font-black tracking-tight text-slate-900">
              <span className="mr-3 h-6 w-1.5 rounded-full bg-primary"></span>
              消耗数据图表
            </h2>
            <p className="mt-3 flex items-center gap-2 text-xs font-black text-slate-700">
              <span className="h-4 w-1 rounded-full bg-indigo-500"></span>
              Top20 视频素材个案累计堆叠分析
            </p>
          </div>
          <div className="flex rounded-lg border border-slate-150 bg-slate-50 p-1">
            {[
              { id: 'all', label: '全部' },
              { id: 'en', label: '英语' },
              { id: 'localized', label: '本地' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTrendLanguage(opt.id as any)}
                className={`rounded-md px-2.5 py-1 text-[9.5px] font-bold transition-all ${
                  trendLanguage === opt.id ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {[
              { title: '所有语言 Top20', data: allLanguageStack },
              { title: '英语 Top20', data: englishStack },
            ].map((chart) => (
              <div key={chart.title} className="h-[360px] rounded-2xl border border-slate-150 bg-slate-50/80 p-5">
                <h3 className="mb-3 text-center text-sm font-black text-slate-500">{chart.title === '所有语言 Top20' ? '所有语言 (All)' : '英语素材 (EN)'}</h3>
                <ResponsiveContainer width="100%" height="88%">
                  <AreaChart data={chart.data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="#d8dee8" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatDateAxis} axisLine={{ stroke: '#475569' }} tickLine={false} interval={1} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                    <Tooltip content={<StackedTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    {materialSeries.slice(0, 8).map((key, index) => (
                      <Area
                        key={key}
                        type="linear"
                        dataKey={key}
                        stackId="1"
                        stroke={seriesPalette[index]}
                        fill={seriesFillPalette[index]}
                        fillOpacity={0.78}
                        strokeWidth={1.6}
                        isAnimationActive={false}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <p className="mb-4 mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs font-black text-slate-700">
            <span className="h-4 w-1 rounded-full bg-slate-500"></span>
            分渠道 Top20 素材累计堆叠
          </p>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {channelStacks.map((chart) => (
              <div key={chart.title} className="h-64 rounded-xl border border-slate-150 bg-slate-50/80 p-4">
                <h3 className="mb-2 text-center text-xs font-black text-slate-600">{chart.title}</h3>
                <ResponsiveContainer width="100%" height="88%">
                  <AreaChart data={chart.data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#d8dee8" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={formatDateAxis} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<StackedTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    {materialSeries.slice(0, 8).map((key, index) => (
                      <Area
                        key={key}
                        type="linear"
                        dataKey={key}
                        stackId="1"
                        stroke={seriesPalette[index]}
                        fill={seriesFillPalette[index]}
                        fillOpacity={0.78}
                        strokeWidth={1.6}
                        isAnimationActive={false}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="flex items-center text-xl font-black tracking-tight text-slate-900">
            <span className="mr-3 h-6 w-1.5 rounded-full bg-primary"></span>
            CPA7 每日趋势 (Daily CPA7 Trend)
          </h2>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="text-[9.5px] font-bold text-slate-600">CPA7 范围:</span>
            <input value={cpa7Min} onChange={(e) => setCpa7Min(Number(e.target.value))} className="h-7 w-16 rounded-lg border border-slate-200 bg-white text-center text-xs font-bold text-slate-700" type="number" />
            <span className="text-[9.5px] font-medium text-slate-400">~</span>
            <input value={cpa7Max} onChange={(e) => setCpa7Max(Number(e.target.value))} className="h-7 w-16 rounded-lg border border-slate-200 bg-white text-center text-xs font-bold text-slate-700" type="number" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {cpa7Charts.map((chart) => (
            <div key={chart.title} className="h-56">
              <h3 className="mb-2 text-xs font-black text-slate-700">{chart.title}</h3>
              {chart.data.length === 0 ? (
                <div className="flex h-[190px] items-center justify-center border-b border-slate-150 text-[9.5px] font-medium text-slate-400">暂无数据满足筛选区间</div>
              ) : (
                <ResponsiveContainer width="100%" height="88%">
                  <LineChart data={chart.data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={formatDateAxis} axisLine={false} tickLine={false} interval={1} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [`$${value}`, 'CPA7']} />
                    <Line type="linear" dataKey="cpa7" stroke={chart.color} fill={chart.color} strokeWidth={2.2} dot={{ r: 2.4, fill: '#fff', stroke: chart.color }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
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
