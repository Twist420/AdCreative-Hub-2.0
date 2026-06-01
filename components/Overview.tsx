

import React, { useState, useEffect } from 'react';
import { generateOverviewData, generateTopMaterials, OverviewMetric, mockKeywordAnalysis } from '../services/mockData';
import { analyzeMaterials } from '../services/geminiService';
import { AdMaterial, KeywordAnalysisData } from '../types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Play, Calendar, Clock, Globe, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid } from 'recharts';

type MetricKey = 'totalCost' | 'newCost' | 'newCostShare' | 'totalCount' | 'successCount' | 'successCost' | 'successRate';

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
          <Tooltip content={<></>} cursor={{ stroke: color, strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#color-${metric.label})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metric.history}>
          <Tooltip content={<></>} cursor={{fill: 'transparent'}} />
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={metric.history}>
        <Tooltip content={<></>} cursor={{ stroke: color, strokeWidth: 1 }} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
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
  
  // Trend Analysis specific Language Filter
  const [trendLanguage, setTrendLanguage] = useState<'all' | 'en' | 'localized'>('all');

  const [materials, setMaterials] = useState<AdMaterial[]>([]);
  
  // We need two sets of metrics for the KPI cards (Total vs Localized)
  const [metricsAll, setMetricsAll] = useState<{ [key: string]: OverviewMetric } | null>(null);
  const [metricsLoc, setMetricsLoc] = useState<{ [key: string]: OverviewMetric } | null>(null);
  
  // Metrics for the chart (dynamic based on trendLanguage)
  const [chartMetrics, setChartMetrics] = useState<{ [key: string]: OverviewMetric } | null>(null);
  
  const [activeTrendTab, setActiveTrendTab] = useState<MetricKey>('totalCost');
  
  const [analysisData, setAnalysisData] = useState<KeywordAnalysisData>(mockKeywordAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useEffect(() => {
    // Fetch materials (Global context usually implies 'all' for materials list if filter is removed)
    setMaterials(generateTopMaterials(launchStart, launchEnd, channel));
    
    // Fetch KPI Data (Total and Localized)
    setMetricsAll(generateOverviewData(launchStart, launchEnd, spendStart, spendEnd, 'all', channel));
    setMetricsLoc(generateOverviewData(launchStart, launchEnd, spendStart, spendEnd, 'localized', channel));
    
    setAnalysisData(mockKeywordAnalysis);
  }, [launchStart, launchEnd, spendStart, spendEnd, channel]);

  useEffect(() => {
    // Fetch Chart Data based on chart-specific language filter
    setChartMetrics(generateOverviewData(launchStart, launchEnd, spendStart, spendEnd, trendLanguage, channel));
  }, [launchStart, launchEnd, spendStart, spendEnd, channel, trendLanguage]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMaterials(materials);
    setAnalysisData(result);
    setIsAnalyzing(false);
  };

  // Helper for Quick Select (Generic for both filters)
  const setQuickRange = (type: 'launch' | 'spend', days: number | 'month') => {
     const end = new Date();
     let start = new Date();
     
     if (days === 'month') {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
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

  const formatValue = (val: number, type: 'currency' | 'percent' | 'number') => {
    if (type === 'currency') return `$${Math.floor(val).toLocaleString()}`;
    if (type === 'percent') return `${val.toFixed(1)}%`;
    return Math.floor(val).toLocaleString();
  };

  // Helper to format X-Axis ticks based on Spend Range Duration
  const formatXAxis = (val: string) => {
    if (!val) return '';
    const d = new Date(val);
    const s = new Date(spendStart);
    const e = new Date(spendEnd);
    const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24));

    // If long range (>60 days), show Month/Day, otherwise just M/D
    if (diffDays > 60) {
        return `${d.getMonth() + 1}月`;
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Optimize Ticks
  const getAxisTicks = (data: {date: string}[]) => {
     if (!data || data.length === 0) return [];
     
     const s = new Date(spendStart);
     const e = new Date(spendEnd);
     const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24));

     // Less than 14 days, show all or every 2nd
     if (diffDays <= 14) return undefined;
     
     // 30 days, every 5
     if (diffDays <= 31) return data.filter((_, idx) => idx % 5 === 0).map(d => d.date);

     // Long ranges, try to show start of months or every 15 days
     return data.filter((_, idx) => idx % Math.ceil(diffDays / 6) === 0).map(d => d.date);
  };



  const chartData = chartMetrics ? chartMetrics[activeTrendTab].history : [];
  const axisTicks = getAxisTicks(chartData);

  return (
    <div className="space-y-8 pb-12">
      {/* Dual Filter Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        
        {/* 1. Launch Time Filter */}
        <div className="flex flex-col gap-3 min-w-0">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="whitespace-nowrap">投放开始时间</span>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-lg">
                  {[
                      { label: '本月', val: 'month' },
                      { label: '近30天', val: 30 },
                      { label: '近90天', val: 90 }
                  ].map((item) => (
                    <button 
                      key={item.label}
                      onClick={() => setQuickRange('launch', item.val as any)}
                      className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm whitespace-nowrap"
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
           </div>
           
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-full">
                <input 
                    type="date" 
                    value={launchStart}
                    onChange={(e) => setLaunchStart(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none flex-1 min-w-0"
                />
                <span className="text-slate-400 text-xs font-bold px-1">至</span>
                <input 
                    type="date" 
                    value={launchEnd}
                    onChange={(e) => setLaunchEnd(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none flex-1 min-w-0"
                />
           </div>
        </div>

        {/* 2. Channel Filter */}
        <div className="flex flex-col gap-3 xl:border-l border-slate-100 xl:px-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
               <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-orange-600" />
               </div>
               <span>渠道</span>
            </div>
            <div className="relative h-[38px]">
              <select 
                value={channel} 
                onChange={e => setChannel(e.target.value)}
                className="w-full h-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-primary focus:border-primary block px-2.5"
              >
                <option value="all">全部渠道 (All)</option>
                <option value="applovin">AppLovin</option>
                <option value="unity">Unity</option>
                <option value="google">Google Ads</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
        </div>

        {/* 3. Spend Period Filter */}
        <div className="flex flex-col gap-3 xl:border-l border-slate-100 xl:pl-6 min-w-0">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="whitespace-nowrap">花费周期</span>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-lg">
                  {[
                      { label: '本月', val: 'month' },
                      { label: '近30天', val: 30 },
                      { label: '近90天', val: 90 }
                  ].map((item) => (
                    <button 
                      key={item.label}
                      onClick={() => setQuickRange('spend', item.val as any)}
                      className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all text-slate-500 hover:text-emerald-600 hover:bg-white hover:shadow-sm whitespace-nowrap"
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
           </div>
           
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-full">
               <input 
                  type="date" 
                  value={spendStart}
                  onChange={(e) => setSpendStart(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none flex-1 min-w-0"
               />
               <span className="text-slate-400 text-xs font-bold px-1">至</span>
               <input 
                  type="date" 
                  value={spendEnd}
                  onChange={(e) => setSpendEnd(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none flex-1 min-w-0"
               />
           </div>
        </div>

      </div>

      {/* KPI Charts Grid (7 Items) */}
      {metricsAll && metricsLoc && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Helper to render cards */}
          {[
            { key: 'totalCost', color: '#3b82f6', bg: 'text-blue-500', trendColor: 'text-blue-500', showBreakdown: false },
            { key: 'newCost', color: '#6366f1', bg: 'text-indigo-500', trendColor: 'text-indigo-500', showBreakdown: true },
            { key: 'newCostShare', color: '#8b5cf6', bg: 'text-purple-500', trendColor: 'text-purple-500', showBreakdown: true },
            { key: 'totalCount', color: '#64748b', bg: 'text-slate-500', trendColor: 'text-slate-500', showBreakdown: true },
            { key: 'successCount', color: '#10b981', bg: 'text-emerald-500', trendColor: 'text-emerald-500', showBreakdown: true },
            { key: 'successCost', color: '#f59e0b', bg: 'text-amber-500', trendColor: 'text-amber-500', showBreakdown: true },
            { key: 'successRate', color: '#14b8a6', bg: 'text-teal-500', trendColor: 'text-teal-500', showBreakdown: true },
          ].map((item) => {
             const mAll = metricsAll[item.key as MetricKey];
             const mLoc = metricsLoc[item.key as MetricKey];
             
             // Use "All" metrics for the main card display
             const m = mAll;
             
             const isActive = activeTrendTab === item.key;
             const isTotalCost = item.key === 'totalCost';
             
             return (
              <div 
                key={item.key}
                className={`bg-white p-4 rounded-xl shadow-sm border ${isActive ? 'border-sky-500 ring-1 ring-sky-500' : 'border-slate-100'} flex flex-col relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${isTotalCost ? 'md:row-span-2 h-32 md:h-auto' : 'h-32'}`} 
                onClick={() => setActiveTrendTab(item.key as MetricKey)}
              >
                 <div className="flex justify-between items-start z-10">
                    <div>
                        <p className="text-xs text-slate-500 font-bold mb-1">{m.label}</p>
                        <p className={`${isTotalCost ? 'text-3xl mt-2' : 'text-xl'} font-bold text-slate-800`}>{formatValue(m.value, m.format)}</p>
                    </div>
                    <div className={`flex items-center text-xs font-bold ${m.trend >= 0 ? item.trendColor : 'text-slate-400'} bg-slate-50 px-1.5 py-0.5 rounded h-6`}>
                       {m.trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                       {Math.abs(m.trend).toFixed(1)}%
                    </div>
                 </div>
                 
                 {item.showBreakdown && (
                   <div className="z-10 mt-auto pt-2 border-t border-slate-50 flex items-center gap-3 text-[10px] font-medium text-slate-400">
                      <span>全部: <span className="text-slate-600 ml-0.5">{formatValue(mAll.value, m.format)}</span></span>
                      <span>本地化: <span className="text-slate-600 ml-0.5">{formatValue(mLoc.value, m.format)}</span></span>
                   </div>
                 )}

                 {/* Only show chart background if we have space, otherwise it gets too crowded with the new breakdown text */}
                 {!item.showBreakdown && (
                    <div className={`absolute bottom-0 left-0 right-0 ${isTotalCost ? 'h-32 opacity-20' : 'h-14 opacity-50'} group-hover:opacity-100 transition-opacity`}>
                        <MiniChart metric={m} color={item.color} type={m.format === 'percent' ? 'line' : 'area'} />
                    </div>
                 )}
                 {/* For cards with breakdown, show a smaller chart or hidden chart to keep layout clean? 
                     Let's keep it but maybe more subtle or absolute positioned behind */}
                 {item.showBreakdown && (
                    <div className="absolute bottom-0 right-0 w-24 h-12 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
                        <MiniChart metric={m} color={item.color} type={m.format === 'percent' ? 'line' : 'area'} />
                    </div>
                 )}
              </div>
             );
          })}
        </div>
        
        {/* Dedicated Large Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 border-b border-slate-100 pb-4">
             <div className="flex flex-col gap-1 mb-4 md:mb-0">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <span className="w-1.5 h-6 bg-sky-500 rounded-full mr-3"></span>
                    核心指标趋势分析 (Trend Analysis)
                </h2>
                <p className="text-xs text-slate-400 ml-4.5 pl-0.5">Filter by language to see specific trends</p>
             </div>

             <div className="flex items-center gap-4">
                 {/* Integrated Language Filter */}
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                   {[
                     { id: 'all', label: '全部 (All)' },
                     { id: 'en', label: '英语 (EN)' },
                     { id: 'localized', label: '本地 (Loc)' },
                   ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTrendLanguage(opt.id as any)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          trendLanguage === opt.id 
                            ? 'bg-white text-sky-600 shadow-sm' 
                            : 'text-slate-500 hover:text-sky-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                   ))}
                 </div>
                 
                 <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                    {[
                    { key: 'totalCost', label: '素材总花费' },
                    { key: 'newCost', label: '新素材总花费' },
                    { key: 'newCostShare', label: '新素材花费占比' },
                    { key: 'totalCount', label: '素材总量' },
                    { key: 'successCount', label: '素材成功量' },
                    { key: 'successCost', label: '成功素材总花费' },
                    { key: 'successRate', label: '素材成功率' },
                    ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTrendTab(tab.key as MetricKey)}
                        className={`px-3 py-1.5 text-xs font-bold rounded whitespace-nowrap transition-all ${activeTrendTab === tab.key ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab.label}
                    </button>
                    ))}
                 </div>
             </div>
          </div>
          
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorTrendBlue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10} 
                      minTickGap={30}
                      tickFormatter={formatXAxis}
                      ticks={axisTicks}
                      interval={'preserveStartEnd'}
                   />
                   <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     formatter={(value: any) => [formatValue(value, chartMetrics ? chartMetrics[activeTrendTab].format : 'number'), chartMetrics ? chartMetrics[activeTrendTab].label : '']}
                   />
                   <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTrendBlue)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Materials Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                头部素材 (Top Performers)
              </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {materials.filter(m => m.isGood).slice(0, 6).map((mat) => (
               <div key={mat.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
                 {/* 9:16 Aspect Ratio Container */}
                 <div className="aspect-[9/16] bg-slate-200 relative overflow-hidden">
                    <img src={mat.thumbnail} alt={mat.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                       <Play className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-lg transform scale-75 group-hover:scale-100 transition-all" />
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      TOP
                    </div>
                 </div>
                 {/* Compact Detail Section */}
                 <div className="p-2 space-y-1.5 bg-white">
                   <h3 className="text-xs font-bold text-slate-800 truncate" title={mat.name}>{mat.name}</h3>
                   <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-slate-500 leading-tight">
                     
                     <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 scale-90 origin-top-left">负责人</span>
                        <span className="font-medium text-slate-700">{mat.creator}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 scale-90 origin-top-left">语种</span>
                        <span className="font-medium text-slate-700">{mat.language}</span>
                     </div>
                     
                     <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 scale-90 origin-top-left">剧情</span>
                        <span className="font-medium text-slate-700">{mat.isPlot ? '是' : '否'}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 scale-90 origin-top-left">结果</span>
                        <span className="font-bold text-emerald-600">{mat.result}</span>
                     </div>

                     <div className="col-span-2 h-px bg-slate-100 my-0.5"></div>

                     <div className="col-span-2 flex justify-between items-center">
                        <span className="text-[9px] text-slate-400">Live花费</span>
                        <span className="font-mono font-medium text-slate-700">${mat.liveCampCost.toLocaleString()}</span>
                     </div>
                     <div className="col-span-2 flex justify-between items-center">
                        <span className="text-[9px] text-slate-400">Live占比</span>
                        <span className="font-mono font-medium text-slate-700">{mat.liveCampShare}%</span>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Keyword Analysis Section */}
        <div className="lg:col-span-1 flex flex-col h-full">
           <div className="bg-white rounded-2xl p-6 border border-slate-100 h-full shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                   <h2 className="text-lg font-bold text-slate-800">关键词分析</h2>
                </div>
                <div className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">Based on AI Tags</div>
              </div>

              {/* 1. Positive Tags */}
              <div className="mb-6">
                 <h3 className="flex items-center text-sm font-bold text-emerald-600 mb-3">
                   <TrendingUp className="w-4 h-4 mr-2" />
                   优质素材标签 (Positive)
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {analysisData.positiveTags.map((tag, idx) => (
                      <div key={idx} className="flex items-center bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 transition-all hover:shadow-sm hover:scale-105 cursor-default">
                         <span className="text-sm font-medium text-emerald-800 mr-2">{tag.name}</span>
                         <span className="text-xs font-bold text-emerald-600 bg-white/60 px-1.5 rounded">{tag.score}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* 2. Negative Tags */}
              <div className="mb-8">
                 <h3 className="flex items-center text-sm font-bold text-rose-600 mb-3">
                   <TrendingDown className="w-4 h-4 mr-2" />
                   低效素材标签 (Negative)
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {analysisData.negativeTags.map((tag, idx) => (
                      <div key={idx} className="flex items-center bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5 transition-all hover:shadow-sm hover:scale-105 cursor-default">
                         <span className="text-sm font-medium text-rose-800 mr-2">{tag.name}</span>
                         <span className="text-xs font-bold text-rose-600 bg-white/60 px-1.5 rounded">{tag.score}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* 3. Insight Summary */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 relative">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Insight Summary</h4>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   {analysisData.summary}
                 </p>
              </div>

              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleAiAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Refresh AI Analysis'}
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
