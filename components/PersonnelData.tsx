
import React, { useState, useEffect, useMemo } from 'react';
import { generatePersonnelData, generatePersonnelHistory } from '../services/mockData';
import { PersonnelData } from '../types';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';
import { 
  Calendar, TrendingUp, DollarSign, Target, Users, 
  Clock, ChevronDown, ChevronUp, Globe, Award, Zap 
} from 'lucide-react';
import DateRangePicker from './DateRangePicker';

const PersonnelDataPage: React.FC = () => {
  // --- Date & Language Filters ---
  const [launchStart, setLaunchStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); 
    return d.toISOString().slice(0, 10);
  });
  const [launchEnd, setLaunchEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  const [spendStart, setSpendStart] = useState<string>(() => {
     const d = new Date();
     d.setDate(d.getDate() - 30);
     return d.toISOString().slice(0, 10);
  });
  const [spendEnd, setSpendEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  const [language, setLanguage] = useState<'all' | 'en' | 'localized'>('all');
  const [channel, setChannel] = useState<string>('all');

  const [data, setData] = useState<PersonnelData[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [activeTrendMetric, setActiveTrendMetric] = useState<'successCost' | 'successRate' | 'costHigh' | 'successCostShare'>('successCost');
  
  const allNames = ['苏雅', '顺子', '雅萱', '苗雪'];
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    '苏雅': true, '顺子': true, '雅萱': true, '苗雪': true
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof PersonnelData | null, direction: 'asc' | 'desc' }>({ key: 'successCost', direction: 'desc' });

  useEffect(() => {
    setData(generatePersonnelData(launchStart, launchEnd, spendStart, spendEnd, language, channel));
    setHistoryData(generatePersonnelHistory(launchStart, launchEnd, spendStart, spendEnd, language, channel));
  }, [launchStart, launchEnd, spendStart, spendEnd, language, channel]);

  const toggleLineVisibility = (name: string) => {
    setVisibleLines(prev => ({ ...prev, [name]: !prev[name] }));
  };

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

  const formatXAxis = (val: string) => {
    if (!val) return '';
    const d = new Date(val);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const processedData = useMemo(() => {
    if (!data.length) return { summary: null, sortedData: [] };
    let sorted = [...data];
    if (sortConfig.key) {
        sorted.sort((a, b) => {
            const valA = a[sortConfig.key!];
            const valB = b[sortConfig.key!];
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    const totalHighCostCount = data.reduce((acc, curr) => acc + curr.costHigh, 0);
    const totalSuccessCost = data.reduce((acc, curr) => acc + curr.successCost, 0);
    const avgSuccessRate = data.reduce((acc, curr) => acc + curr.successRate, 0) / data.length;
    return { summary: { totalHighCostCount, totalSuccessCost, avgSuccessRate }, sortedData: sorted };
  }, [data, sortConfig]);

  const { summary, sortedData } = processedData;

  const handleSort = (key: keyof PersonnelData) => {
      setSortConfig(prev => ({
          key,
          direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
      }));
  };

  const personColors: Record<string, string> = {
    '苏雅': '#6366f1', 
    '顺子': '#10b981', 
    '雅萱': '#f59e0b', 
    '苗雪': '#f43f5e'  
  };

  const trendMetrics = [
    { key: 'successCost', label: '成功素材花费', unit: '$' },
    { key: 'successCostShare', label: '成功素材花费占比', unit: '%' },
    { key: 'successRate', label: '成功率', unit: '%' },
    { key: 'costHigh', label: 'High Cost 数量', unit: '' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Filters */}
      <div className="px-6 py-5 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col xl:flex-row gap-4 justify-between">
            <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="whitespace-nowrap">投放开始时间</span>
                </div>
                <DateRangePicker
                    start={launchStart}
                    end={launchEnd}
                    onChange={({ start, end }) => {
                        setLaunchStart(start);
                        setLaunchEnd(end);
                    }}
                    compact
                />
            </div>

            <div className="flex flex-col gap-2 xl:border-l border-slate-100 xl:px-4 min-w-[140px]">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Globe className="w-3.5 h-3.5 text-sky-600" />
                    <span className="whitespace-nowrap">语言</span>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-lg w-full">
                    {[{ id: 'all', label: '全部' }, { id: 'en', label: '英语' }, { id: 'localized', label: '本地' }].map((opt) => (
                        <button key={opt.id} onClick={() => setLanguage(opt.id as any)} className={`flex-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${language === opt.id ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-sky-600'}`}>{opt.label}</button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2 min-w-0 xl:border-l border-slate-100 xl:pl-4">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="whitespace-nowrap">花费周期</span>
                </div>
                <DateRangePicker
                    start={spendStart}
                    end={spendEnd}
                    onChange={({ start, end }) => {
                        setSpendStart(start);
                        setSpendEnd(end);
                    }}
                    align="right"
                    compact
                />
            </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><DollarSign className="w-6 h-6" /></div>
                   <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> 活跃</span>
                </div>
                <div className="mt-4">
                   <h4 className="text-slate-400 text-xs font-bold uppercase">成功总花费</h4>
                   <p className="text-2xl font-bold text-slate-800">${(summary?.totalSuccessCost || 0).toLocaleString()}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Target className="w-6 h-6" /></div>
                </div>
                <div className="mt-4">
                   <h4 className="text-slate-400 text-xs font-bold uppercase">素材成功率 (Avg)</h4>
                   <p className="text-2xl font-bold text-slate-800">{(summary?.avgSuccessRate || 0).toFixed(1)}%</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><Zap className="w-6 h-6" /></div>
                </div>
                <div className="mt-4">
                   <h4 className="text-slate-400 text-xs font-bold uppercase">High Cost 总量</h4>
                   <p className="text-2xl font-bold text-slate-800">{summary?.totalHighCostCount || 0}</p>
                </div>
            </div>
         </div>

         <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
               <Award className="w-5 h-5 text-amber-400" />
               <span className="text-sm font-bold">本月表现之星</span>
            </div>
            {sortedData.length > 0 && (
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20">
                    {sortedData[0].name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{sortedData[0].name}</p>
                    <p className="text-xs text-slate-400">效率得分: {sortedData[0].efficiencyScore}</p>
                  </div>
               </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
               <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Top 成功率</span>
                  <span className="text-emerald-400">{(Math.max(...data.map(d => d.successRate))).toFixed(1)}%</span>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Trend Analysis */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-50">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
              人员效能趋势分析
           </h3>
           <div className="flex bg-slate-100 p-1 rounded-xl">
             {trendMetrics.map(metric => (
               <button
                 key={metric.key}
                 onClick={() => setActiveTrendMetric(metric.key as any)}
                 className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTrendMetric === metric.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {metric.label}
               </button>
             ))}
           </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} tickFormatter={formatXAxis} minTickGap={30} />
               <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
               <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
               <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '20px'}} onClick={(e) => toggleLineVisibility(e.dataKey as string)} />
               {allNames.map((person) => (
                 <Line 
                   key={person}
                   type="monotone" 
                   dataKey={`${person}_${activeTrendMetric}`} 
                   name={person}
                   stroke={personColors[person]} 
                   strokeWidth={3} 
                   dot={false}
                   activeDot={{ r: 6 }}
                   strokeOpacity={visibleLines[person] ? 1 : 0.1}
                 />
               ))}
             </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center gap-2">
           <Users className="w-5 h-5 text-primary" />
           <h3 className="text-base font-bold text-slate-800">创意人员绩效明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
              <tr>
                {[{ label: '人员', key: 'name' }, { label: '成功花费', key: 'successCost' }, { label: '成功率', key: 'successRate' }, { label: 'High Cost 数量', key: 'costHigh' }, { label: '花费占比', key: 'successCostShare' }, { label: '效率分', key: 'efficiencyScore' }].map((col) => (
                    <th key={col.key} className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort(col.key as keyof PersonnelData)}>
                        <div className="flex items-center gap-1 uppercase tracking-wider text-[10px]">
                            {col.label}
                            {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                        </div>
                    </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 text-white shadow-sm" style={{ backgroundColor: personColors[row.name] }}>{row.name.charAt(0)}</div>
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">${row.successCost.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{row.successRate}%</td>
                  <td className="px-6 py-4 text-slate-600">{row.costHigh}</td>
                  <td className="px-6 py-4 text-slate-600">{row.successCostShare}%</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{row.efficiencyScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDataPage;
