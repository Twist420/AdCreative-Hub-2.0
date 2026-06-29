
import React, { useState, useMemo } from 'react';
import { AnalysisDimension } from '../types';
import {
  generateRequirements,
  generateSchedules,
  generateFinishedCreativePerformance,
  summarizeDirectionFeedback,
} from '../services/mockData';
import { Layers, Table as TableIcon, LayoutGrid } from 'lucide-react';
import { AnalyticsDateRangeField, AnalyticsFilterBar, AnalyticsSelectField, getRecentUtcRange } from './analytics/AnalyticsFilters';
import { CategoryDetailModal, CategorizedRow, formatCurrencyCompact, formatRatioPercent, getFeedbackStatusStyle } from './creative-analysis/CreativeAnalysisParts';

interface CreativeAnalysisProps {
  activeSubTab: 'multi' | 'full' | 'segment_a' | 'segment_b';
}

const CreativeAnalysis: React.FC<CreativeAnalysisProps> = ({ activeSubTab }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [exploreTarget, setExploreTarget] = useState<{ category: string, dimension: string } | null>(null);
  
  const [launchStart, setLaunchStart] = useState<string>('');
  const [launchEnd, setLaunchEnd] = useState<string>('');

  const [spendStart, setSpendStart] = useState<string>(() => {
     return getRecentUtcRange(30).start;
  });
  const [spendEnd, setSpendEnd] = useState<string>(() => getRecentUtcRange(30).end);
  
  const [language, setLanguage] = useState<'all' | 'en' | 'localized'>('all');
  const [channel, setChannel] = useState<string>('');
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
            channel={channel || 'all'}
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
            placeholder="语言"
            value={language === 'all' ? '' : language}
            onChange={(value) => setLanguage((value || 'all') as 'all' | 'en' | 'localized')}
            options={[
              { value: 'en', label: '英语' },
              { value: 'localized', label: '本地' },
            ]}
            className="w-[180px]"
          />
          <AnalyticsSelectField
            placeholder="渠道"
            value={channel}
            onChange={setChannel}
            options={[
              { value: 'applovin', label: 'AppLovin' },
              { value: 'unity', label: 'Unity' },
              { value: 'google', label: 'Google Ads' },
              { value: 'facebook', label: 'Facebook' },
              { value: 'tiktok', label: 'TikTok' },
            ]}
            className="w-[180px]"
          />
        </AnalyticsFilterBar>
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
          channel={channel || 'all'}
        />
      )}
    </div>
  );
};

export default CreativeAnalysis;
