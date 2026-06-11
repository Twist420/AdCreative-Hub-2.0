
import React, { useState, useMemo } from 'react';
import { AnalysisDimension, MaterialDetailRow } from '../types';
import {
  generateCreativeAnalysisData,
  generateMaterialDetails,
  generateRequirements,
  generateSchedules,
  generateFinishedCreativePerformance,
  summarizeDirectionFeedback,
} from '../services/mockData';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Cell, AreaChart, Area, ReferenceLine, Label
} from 'recharts';
import { Calendar, Clock, Globe, Layers, Table as TableIcon, LayoutGrid, Minus, ChevronDown, X, Play, TrendingUp } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const formatCurrencyCompact = (value: number) => {
  if (value >= 10000) return `$${(value / 10000).toFixed(1)}w`;
  return `$${Math.round(value).toLocaleString()}`;
};

const formatRatioPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const getFeedbackStatusStyle = (status: string) => {
  switch (status) {
    case 'Winner':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Failed':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'Flat':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Paused':
      return 'border-slate-200 bg-slate-100 text-slate-500';
    default:
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  }
};

const CustomTooltip = ({ active, payload, label, metricType }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = payload[0].color;
    
    let mainValue = "";
    let secondaryLabel = "";
    let secondaryValue = "";

    if (metricType === 'cost') {
      mainValue = `$${(data.totalCost || 0).toLocaleString()}`;
      secondaryLabel = "花费占比";
      secondaryValue = `${(data.costShare || 0).toFixed(1)}%`;
    } else if (metricType === 'quantity') {
      mainValue = (data.count || 0).toLocaleString();
      secondaryLabel = "数量占比";
      secondaryValue = `${(data.countShare || 0).toFixed(1)}%`;
    } else {
      mainValue = `$${(data.avgCost || 0).toLocaleString()}`;
    }

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-2xl rounded-xl text-[11px] z-[100] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 min-w-[150px] pointer-events-none">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
           <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: color }}></div>
           <p className="font-bold text-slate-800 truncate">{label}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-bold uppercase tracking-tighter">
              {metricType === 'cost' ? '总花费' : metricType === 'quantity' ? '数量' : '平均'}
            </span>
            <span className="font-black text-slate-900">{mainValue}</span>
          </div>
          {secondaryLabel && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-tighter">{secondaryLabel}</span>
              <span className="font-bold text-indigo-600">{secondaryValue}</span>
            </div>
          )}
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-50 flex items-center gap-1.5">
           <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
           <p className="text-[9px] text-slate-400 font-bold italic">点击查看素材明细</p>
        </div>
      </div>
    );
  }
  return null;
};

// --- 素材行组件 (处理独立趋势逻辑) ---
const MaterialRowItem: React.FC<{ mat: any, idx: number, totalCost: number, maxCost: number }> = ({ mat, idx, totalCost, maxCost }) => {
  const trendData = useMemo(() => {
    return [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return {
        date: d.toISOString().slice(5, 10), // MM-DD
        value: Math.floor(mat.cost * (0.3 + Math.random() * 0.7))
      };
    });
  }, [mat.cost, mat.id]);

  return (
    <div className="group bg-white hover:bg-indigo-50/30 py-1.5 px-3 flex items-center gap-4 transition-all duration-150">
      <div className="w-6 flex items-center justify-center shrink-0">
         <span className="text-[13px] font-black text-slate-900 italic">#{idx + 1}</span>
      </div>

      <div className="w-12 aspect-[9/16] bg-slate-100 rounded-lg overflow-hidden relative shadow-xs shrink-0 border border-slate-200/50">
        <img src={mat.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
             <Play className="w-3.5 h-3.5 text-white fill-white" />
        </div>
      </div>

      <div className="w-60 flex flex-col gap-0.5 shrink-0">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter opacity-70">ID: {mat.id}</span>
        <h4 className="text-[10px] font-black text-slate-800 line-clamp-1 leading-tight group-hover:text-primary transition-colors">{mat.title}</h4>
        <div className="flex items-center gap-2 mt-1">
           <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
              <Clock className="w-2.5 h-2.5" /> {mat.date}
           </div>
           <div className="px-1 py-0 bg-slate-100 rounded text-[7px] font-black text-slate-500 border border-slate-200/50">
              {mat.language.toUpperCase()}
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 px-4 min-w-0">
         <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">SPEND</span>
              <span className="text-[12px] font-black text-slate-900 tracking-tight">${mat.cost.toLocaleString()}</span>
            </div>
            <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 rounded">
              {((mat.cost / totalCost) * 100).toFixed(1)}%
            </div>
         </div>
         <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${(mat.cost / maxCost) * 100}%` }}
            ></div>
         </div>
      </div>

      <div className="w-36 h-10 shrink-0 bg-slate-50/50 rounded-lg p-0.5 cursor-crosshair">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '6px', 
                  border: 'none', 
                  padding: '4px 8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                  backgroundColor: '#ffffff' 
                }}
                itemStyle={{ fontSize: '9px', fontWeight: '900', color: '#6366f1', padding: 0 }}
                labelStyle={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', marginBottom: '2px' }}
                cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                formatter={(value: number) => [`$${value}`, '花费']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={1.5} 
                fill="#6366f1" 
                fillOpacity={0.05} 
                dot={false} 
                activeDot={{ r: 3, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={true} 
              />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- 下钻详情弹窗组件 ---
interface DetailModalProps {
  categoryName: string;
  dimensionLabel: string;
  onClose: () => void;
  launchStart: string;
  launchEnd: string;
  spendStart: string;
  spendEnd: string;
  language: string;
  channel: string;
}

const CategoryDetailModal: React.FC<DetailModalProps> = ({ 
  categoryName, dimensionLabel, onClose, launchStart, launchEnd, spendStart, spendEnd, language, channel 
}) => {
  const materials = useMemo(() => {
    const all = generateMaterialDetails(launchStart, launchEnd, spendStart, spendEnd, language, channel);
    return all.sort((a, b) => b.cost - a.cost).slice(0, 20);
  }, [categoryName, launchStart, launchEnd, spendStart, spendEnd, language, channel]);

  const totalCost = useMemo(() => materials.reduce((sum, m) => sum + m.cost, 0), [materials]);
  const maxCost = useMemo(() => (materials.length > 0 ? materials[0].cost : 1), [materials]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-8 bg-slate-900/60 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-5xl h-full max-h-[85vh] bg-white rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-2 duration-300" 
        onClick={e => e.stopPropagation()}
      >
        {/* 弹窗头部 - 提高关闭按钮层级 */}
        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
              <LayoutGrid className="text-white w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">{categoryName}</h2>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">DETAIL VIEW</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                维度: {dimensionLabel}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all relative z-[100] active:scale-95"
            aria-label="关闭视图"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 弹窗内容区 - 极致紧凑 */}
        <div className="flex-1 overflow-y-auto px-8 py-2 no-scrollbar bg-white">
          <div className="grid grid-cols-1 divide-y divide-slate-50">
            {materials.map((mat, idx) => (
              <MaterialRowItem key={mat.id} mat={mat} idx={idx} totalCost={totalCost} maxCost={maxCost} />
            ))}
          </div>
        </div>
        
        {/* 弹窗页脚 - 彻底移除冗余信息 */}
        <div className="h-4 bg-white shrink-0"></div>
      </div>
    </div>
  );
};

interface MiniMetricChartProps {
  data: any[];
  metric: 'cost' | 'avgCost' | 'quantity';
  color: string;
  syncId: string;
  dimensionLabel: string;
  onBarClick: (categoryName: string) => void;
}

const MiniMetricChart: React.FC<MiniMetricChartProps> = ({ data, metric, color, syncId, dimensionLabel, onBarClick }) => {
  const chartConfig = useMemo(() => {
    switch(metric) {
      case 'cost': return { title: '总花费 (Cost)', dataKey: 'totalCost' };
      case 'avgCost': return { title: '平均花费 (Avg)', dataKey: 'avgCost' };
      case 'quantity': return { title: '数量 (Count)', dataKey: 'count' };
    }
  }, [metric]);

  // 计算该维度下的大盘加权平均值
  const overallAvg = useMemo(() => {
    if (metric !== 'avgCost') return null;
    const totalCost = data.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
    return totalCost / (totalCount || 1);
  }, [data, metric]);

  const gradientId = `grad-${metric}-${color.replace('#', '')}`;

  return (
    <div className="flex-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-[340px] flex flex-col relative transition-all duration-300">
      <div className="flex justify-between items-center mb-5 px-1 shrink-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
          <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          {chartConfig.title}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            syncId={syncId} 
            margin={{ top: 35, right: 10, left: 10, bottom: 40 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} 
              interval={0} 
              angle={-45} 
              textAnchor="end"
              height={40}
              stroke="transparent"
            />
            <YAxis 
              tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 700 }} 
              width={40} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              content={<CustomTooltip metricType={metric} />} 
              cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 6 }}
              offset={20}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ zIndex: 100 }}
            />
            
            {/* 仅在平均花费图表中显示大盘平均线，标注仅保留数值，放在线上方最右侧（红框位置） */}
            {metric === 'avgCost' && overallAvg && (
              <ReferenceLine 
                y={overallAvg} 
                stroke="#64748b" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
              >
                <Label 
                  value={`$${overallAvg.toFixed(2)}`} 
                  position="top" 
                  textAnchor="end"
                  fill="#475569" 
                  fontSize={10} 
                  fontWeight={900}
                  offset={15}
                  dx={-5}
                />
              </ReferenceLine>
            )}

            <Bar 
              dataKey={chartConfig.dataKey} 
              fill={`url(#${gradientId})`} 
              radius={[6, 6, 0, 0]} 
              barSize={28}
              isAnimationActive={true}
              onClick={(payload) => {
                if (payload && payload.name) {
                  onBarClick(payload.name);
                }
              }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  className="cursor-pointer transition-all duration-300 hover:opacity-80 active:scale-95"
                  stroke="transparent"
                  strokeWidth={0}
                  fill={`url(#${gradientId})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface AnalysisTableProps {
  data: any[];
  label: string;
  onRowClick: (categoryName: string) => void;
}

const AnalysisTable: React.FC<AnalysisTableProps> = ({ data, label, onRowClick }) => {
  const totals = useMemo(() => {
    const totalCost = data.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
    const avgCost = totalCost / (totalCount || 1);
    return { totalCost, totalCount, avgCost };
  }, [data]);

  const maxCost = Math.max(...data.map(d => d.totalCost || 0));
  const maxCount = Math.max(...data.map(d => d.count || 0));
  const maxAvgDiff = useMemo(() => {
    return Math.max(...data.map(item => Math.abs(item.avgCost - totals.avgCost)), 1);
  }, [data, totals.avgCost]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
      <table className="w-full text-[11px] border-collapse">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="px-5 py-4 text-left border-r border-white/5 font-bold tracking-wider uppercase w-[14%]">{label}</th>
            <th className="px-5 py-4 text-center border-r border-white/5 font-bold tracking-wider uppercase w-[18%]">平均花费</th>
            <th className="px-5 py-4 text-center border-r border-white/5 font-bold tracking-wider uppercase w-[17%]">花费</th>
            <th className="px-5 py-4 text-center border-r border-white/5 font-bold tracking-wider uppercase w-[17%]">花费占比</th>
            <th className="px-5 py-4 text-center border-r border-white/5 font-bold tracking-wider uppercase w-[17%]">计数</th>
            <th className="px-5 py-4 text-center font-bold tracking-wider uppercase w-[17%]">计数占比</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, idx) => {
            const costShare = (item.totalCost / totals.totalCost) * 100;
            const countShare = (item.count / totals.totalCount) * 100;
            const diff = item.avgCost - totals.avgCost;
            const avgBarWidth = (Math.abs(diff) / maxAvgDiff) * 48;
            
            return (
              <tr 
                key={idx} 
                className="hover:bg-indigo-50/40 cursor-pointer transition-colors group/row"
                onClick={() => onRowClick(item.name)}
              >
                <td className="px-5 py-3 font-bold text-slate-800 bg-slate-50/30 border-r border-slate-100 group-hover/row:bg-indigo-50/10">{item.name}</td>
                <td className="px-0 py-3 border-r border-slate-100 relative min-w-[160px]">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 z-0 opacity-80"></div>
                  {diff > 0 ? (
                    <div className="absolute left-1/2 top-2 bottom-2 bg-emerald-100 border-r border-emerald-400/40 rounded-r-sm" style={{ width: `${avgBarWidth}%` }}></div>
                  ) : (
                    <div className="absolute right-1/2 top-2 bottom-2 bg-rose-100 border-l border-rose-400/40 rounded-l-sm" style={{ width: `${avgBarWidth}%` }}></div>
                  )}
                  <div className="relative z-10 flex items-center justify-center pointer-events-none">
                    <span className="font-mono font-black text-slate-900 text-[12px] tracking-tight">{item.avgCost.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-3 py-3 border-r border-slate-100">
                  <div className="relative h-6 flex items-center bg-slate-50 border border-slate-100 rounded overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-indigo-100 border-r border-indigo-200" style={{ width: `${(item.totalCost / maxCost) * 100}%` }}></div>
                    <span className="relative z-10 w-full text-center font-mono font-bold text-slate-700">{item.totalCost.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-3 py-3 border-r border-slate-100">
                   <div className="relative h-6 flex items-center bg-slate-50 border border-slate-100 rounded overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-indigo-50 border-r border-indigo-100" style={{ width: `${costShare}%` }}></div>
                    <span className="relative z-10 w-full text-center font-mono font-bold text-slate-700">{costShare.toFixed(2)}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 border-r border-slate-100">
                  <div className="relative h-6 flex items-center bg-slate-50 border border-slate-100 rounded overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-slate-200 border-r border-slate-300" style={{ width: `${(item.count / maxCount) * 100}%` }}></div>
                    <span className="relative z-10 w-full text-center font-mono font-bold text-slate-700">{item.count}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="relative h-6 flex items-center bg-slate-50 border border-slate-100 rounded overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-slate-100 border-r border-slate-200" style={{ width: `${countShare}%` }}></div>
                    <span className="relative z-10 w-full text-center font-mono font-bold text-slate-700">{countShare.toFixed(2)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-slate-50 border-t border-slate-200">
          <tr className="font-bold text-slate-900">
            <td className="px-5 py-5 text-left bg-slate-100/50 border-r border-slate-200">大盘总计</td>
            <td className="px-5 py-5 text-center border-r border-slate-200">
              <div className="flex items-center justify-center gap-2">
                <Minus className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-mono text-[12px] font-black text-slate-400">{totals.avgCost.toFixed(2)}</span>
              </div>
            </td>
            <td className="px-5 py-5 text-center border-r border-slate-200 font-mono tracking-tight text-slate-500">{totals.totalCost.toFixed(2)}</td>
            <td className="px-5 py-5 text-center border-r border-slate-200 font-mono text-slate-500">100.00%</td>
            <td className="px-5 py-5 text-center border-r border-slate-200 font-mono text-slate-500">{totals.totalCount}</td>
            <td className="px-5 py-5 text-center font-mono text-slate-500">100.00%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

interface CategorizedRowProps {
  dimensionId: AnalysisDimension;
  label: string;
  colorIdx: number;
  launchStart: string;
  launchEnd: string;
  spendStart: string;
  spendEnd: string;
  language: string;
  channel: string;
  viewMode: 'chart' | 'table';
  onExplore: (category: string, dimension: string) => void;
}

const CategorizedRow: React.FC<CategorizedRowProps> = ({ 
  dimensionId, label, colorIdx, launchStart, launchEnd, spendStart, spendEnd, language, channel, viewMode, onExplore
}) => {
  const rowData = useMemo(() => {
    return generateCreativeAnalysisData([dimensionId], launchStart, launchEnd, spendStart, spendEnd, language, channel).data;
  }, [dimensionId, launchStart, launchEnd, spendStart, spendEnd, language, channel]);

  const color = COLORS[colorIdx % COLORS.length];
  const rowSyncId = `sync-${dimensionId}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-sm space-y-8 hover:shadow-lg transition-all duration-500 relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-1.5 h-8 rounded-full transition-all group-hover:scale-y-125 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.1)]" style={{ backgroundColor: color }}></div>
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{label}对比分析</h3>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">Sync ID: {rowSyncId}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {viewMode === 'chart' ? (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch animate-in fade-in duration-500">
            <MiniMetricChart data={rowData} metric="cost" color={color} syncId={rowSyncId} dimensionLabel={label} onBarClick={(cat) => onExplore(cat, label)} />
            <MiniMetricChart data={rowData} metric="avgCost" color={color} syncId={rowSyncId} dimensionLabel={label} onBarClick={(cat) => onExplore(cat, label)} />
            <MiniMetricChart data={rowData} metric="quantity" color={color} syncId={rowSyncId} dimensionLabel={label} onBarClick={(cat) => onExplore(cat, label)} />
          </div>
        ) : (
          <AnalysisTable data={rowData} label={label} onRowClick={(cat) => onExplore(cat, label)} />
        )}
      </div>
    </div>
  );
};

interface CreativeAnalysisProps {
  activeSubTab: 'multi' | 'full' | 'segment_a' | 'segment_b';
}

const CreativeAnalysis: React.FC<CreativeAnalysisProps> = ({ activeSubTab }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [exploreTarget, setExploreTarget] = useState<{ category: string, dimension: string } | null>(null);
  
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
  const feedbackRequirements = useMemo(() => generateRequirements(), []);
  const feedbackSchedules = useMemo(() => generateSchedules(), []);
  const scheduleNameMap = useMemo(
    () => new Map(feedbackSchedules.map((item) => [item.id, item.directionName])),
    [feedbackSchedules],
  );
  const feedbackRows = useMemo(
    () => generateFinishedCreativePerformance(feedbackRequirements),
    [feedbackRequirements],
  );
  const directionFeedback = useMemo(
    () => summarizeDirectionFeedback(feedbackRows),
    [feedbackRows],
  );

  const renderCategorizedAnalysis = (tabType: string) => {
    let tabDims: { id: AnalysisDimension, label: string }[] = [];
    
    if (tabType === 'full') {
      tabDims = [
        { id: AnalysisDimension.DIRECTION, label: '方向类型' },
        { id: AnalysisDimension.PLOT_3D, label: '3D剧情' },
        { id: AnalysisDimension.GAMEPLAY_TYPE, label: '玩法类型' },
        { id: AnalysisDimension.GAMEPLAY_CORE, label: '玩法内核' },
        { id: AnalysisDimension.STRUCTURE, label: '结构' },
      ];
    } else if (tabType === 'segment_a') {
      tabDims = [
        { id: AnalysisDimension.SECTION_A, label: 'A段类型' },
        { id: AnalysisDimension.VOICEOVER, label: '口播类型' },
        { id: AnalysisDimension.COPYWRITING, label: '文案类型' },
      ];
    } else if (tabType === 'segment_b') {
      tabDims = [
        { id: AnalysisDimension.SECTION_B, label: 'B段类型' },
        { id: AnalysisDimension.GAMEPLAY_CORE, label: '玩法内核' },
        { id: AnalysisDimension.STRUCTURE, label: '结构引用' },
      ];
    }

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {tabDims.map((dim, idx) => (
          <CategorizedRow 
            key={dim.id} 
            dimensionId={dim.id} 
            label={dim.label} 
            colorIdx={idx} 
            launchStart={launchStart}
            launchEnd={launchEnd}
            spendStart={spendStart}
            spendEnd={spendEnd}
            language={language}
            channel={channel}
            viewMode={viewMode}
            onExplore={(cat, dimLabel) => setExploreTarget({ category: cat, dimension: dimLabel })}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-40 relative min-h-screen">
      {/* 全局过滤器与视图切换 */}
      <div className="px-10 py-8 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
           <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">深度创意对比分析报表</h2>
           </div>
           
           <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-[1.25rem] border border-slate-200/60 shadow-inner">
             <button 
               onClick={() => setViewMode('chart')}
               className={`flex items-center gap-2.5 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'chart' ? 'bg-primary shadow-xl text-white translate-y-[-1px]' : 'text-slate-500 hover:text-slate-800'}`}
             >
                <LayoutGrid className="w-4 h-4" /> 可视化分析
             </button>
             <button 
               onClick={() => setViewMode('table')}
               className={`flex items-center gap-2.5 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'table' ? 'bg-primary shadow-xl text-white translate-y-[-1px]' : 'text-slate-500 hover:text-slate-800'}`}
             >
                <TableIcon className="w-4 h-4" /> 数据报表
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>素材投产期</span>
                </div>
                <DateRangePicker
                    start={launchStart}
                    end={launchEnd}
                    onChange={({ start, end }) => {
                        setLaunchStart(start);
                        setLaunchEnd(end);
                    }}
                    compact
                    buttonClassName="h-12 rounded-2xl px-5"
                />
            </div>

            <div className="space-y-3 border-l border-slate-100 pl-10">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <Globe className="w-4 h-4 text-sky-500" />
                    <span>分语言包</span>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full">
                    {[{ id: 'all', label: '全部' }, { id: 'en', label: '英语' }, { id: 'localized', label: '本地' }].map((opt) => (
                        <button key={opt.id} onClick={() => setLanguage(opt.id as any)} className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${language === opt.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{opt.label}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 border-l border-slate-100 pl-10">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span>投放渠道</span>
                </div>
                <div className="relative">
                   <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full h-[48px] bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-black rounded-2xl focus:ring-1 focus:ring-primary focus:border-primary block px-5 appearance-none">
                     <option value="all">Global (All Channels)</option>
                     <option value="applovin">AppLovin</option>
                     <option value="unity">Unity</option>
                     <option value="google">Google Ads</option>
                     <option value="facebook">Facebook</option>
                     <option value="tiktok">TikTok</option>
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-3 border-l border-slate-100 pl-10">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>花费统计跨度</span>
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
                    buttonClassName="h-12 rounded-2xl px-5"
                />
            </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direction Review</p>
            <h3 className="text-sm font-black text-slate-900">方向数据回流复盘</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">成片表现回流到需求、版本和方向，用于判断放量、迭代、暂停或继续观察。</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <div className="rounded-2xl border border-slate-150 bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">上线</p>
              <p className="text-sm font-black text-slate-900">{feedbackRows.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Winner</p>
              <p className="text-sm font-black text-emerald-700">{feedbackRows.filter((item) => item.status === 'Winner').length}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-rose-500">复盘</p>
              <p className="text-sm font-black text-rose-700">{feedbackRows.filter((item) => item.status === 'Failed').length}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-150">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-3 py-3">方向</th>
                <th className="px-3 py-3 text-right">上线成片</th>
                <th className="px-3 py-3 text-right">Winner</th>
                <th className="px-3 py-3 text-right">消耗</th>
                <th className="px-3 py-3 text-right">CPI</th>
                <th className="px-3 py-3 text-right">IR</th>
                <th className="px-3 py-3">状态</th>
                <th className="px-3 py-3">结论</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {directionFeedback.slice(0, 8).map((row) => (
                <tr key={row.scheduleId} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-black text-slate-800">{scheduleNameMap.get(row.scheduleId) || row.scheduleId}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-600">{row.launchedCreativeCount}</td>
                  <td className="px-3 py-3 text-right font-bold text-emerald-600">{row.winnerCount}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-600">{formatCurrencyCompact(row.totalSpent)}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-600">${row.avgCpi.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-600">{formatRatioPercent(row.avgIr)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-black ${getFeedbackStatusStyle(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs font-bold text-slate-500">{row.insight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 内容展示区 */}
      <div className="px-2">
        {activeSubTab === 'multi' ? (
          <div className="bg-white rounded-3xl p-32 text-center border border-slate-100 shadow-sm animate-in fade-in duration-300">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10">
               <Layers className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">交叉维矩阵分析升级中</h3>
             <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed font-bold">该模块正在整合实时数据链路，建议先通过左侧侧边栏“全片总览”或“分段深入”查看已同步的维度报表。</p>
          </div>
        ) : renderCategorizedAnalysis(activeSubTab)}
      </div>

      {/* 详情下钻弹窗 - 纯净遮罩，移除所有毛玻璃效果 */}
      {exploreTarget && (
        <CategoryDetailModal 
          categoryName={exploreTarget.category}
          dimensionLabel={exploreTarget.dimension}
          onClose={() => setExploreTarget(null)}
          launchStart={launchStart}
          launchEnd={launchEnd}
          spendStart={spendStart}
          spendEnd={spendEnd}
          language={language}
          channel={channel}
        />
      )}
    </div>
  );
};

export default CreativeAnalysis;
