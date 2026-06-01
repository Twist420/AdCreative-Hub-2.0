
import React from 'react';
import { MainModule, Page } from '../types';
import { 
  LayoutDashboard, FileVideo, BarChart3, Users, 
  Tags, Database, Settings, LogOut, ChevronRight,
  ClipboardList, Layers, PieChart, Activity, Calendar, Upload
} from 'lucide-react';

interface LayoutProps {
  activeModule: MainModule;
  onModuleNavigate: (mod: MainModule) => void;
  currentPage: Page;
  onPageNavigate: (page: Page) => void;
  creativeSubTab: 'multi' | 'full' | 'segment_a' | 'segment_b';
  onCreativeSubTabChange: (tab: 'multi' | 'full' | 'segment_a' | 'segment_b') => void;
  requirementSubView?: 'coordinated' | 'list' | 'schedules' | 'upload';
  onRequirementSubViewChange?: (view: 'coordinated' | 'list' | 'schedules' | 'upload') => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  activeModule, onModuleNavigate, currentPage, onPageNavigate, 
  creativeSubTab, onCreativeSubTabChange, 
  requirementSubView = 'coordinated', onRequirementSubViewChange,
  children 
}) => {
  
  const analysisNavItems = [
    { id: Page.OVERVIEW, label: '总览看板', icon: LayoutDashboard },
    { id: Page.DETAILS, label: '素材明细', icon: FileVideo },
    { id: Page.CREATIVE_ANALYSIS, label: '维度分析', icon: BarChart3 },
    { id: Page.PERSONNEL, label: '人员效能', icon: Users },
    { id: Page.BENCHMARK, label: 'Benchmark', icon: Activity },
  ];

  const creativeSubTabs = [
    { id: 'multi', label: '交叉多维', icon: Layers },
    { id: 'full', label: '全片总览', icon: BarChart3 },
    { id: 'segment_a', label: 'A段深入', icon: PieChart },
    { id: 'segment_b', label: 'B段深入', icon: Activity },
  ];

  const isDataModule = activeModule === MainModule.DATA_ANALYSIS;
  const isRequirementModule = activeModule === MainModule.REQUIREMENT_CENTER;
  const isTagModule = activeModule === MainModule.TAG_MANAGEMENT;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* 1. 全局顶层导航栏 */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 mr-4">
             <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="text-white w-4 h-4" />
             </div>
             <span className="text-lg font-bold tracking-tight">AdPulse Pro</span>
          </div>
          
          <nav className="flex items-center h-full">
            <button 
              onClick={() => onModuleNavigate(MainModule.REQUIREMENT_CENTER)}
              className={`h-14 px-6 flex items-center gap-2 text-sm font-bold transition-all border-b-2 ${isRequirementModule ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <ClipboardList className="w-4 h-4" /> 需求中心
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.ASSET_LIBRARY)}
              className={`h-14 px-6 flex items-center gap-2 text-sm font-bold transition-all border-b-2 ${activeModule === MainModule.ASSET_LIBRARY ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Database className="w-4 h-4" /> 资产库
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.ITERATION_RECORD)}
              className={`h-14 px-6 flex items-center gap-2 text-sm font-bold transition-all border-b-2 ${activeModule === MainModule.ITERATION_RECORD ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Activity className="w-4 h-4" /> 迭代记录
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.DATA_ANALYSIS)}
              className={`h-14 px-6 flex items-center gap-2 text-sm font-bold transition-all border-b-2 ${isDataModule ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Database className="w-4 h-4" /> 数据分析
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.TAG_MANAGEMENT)}
              className={`h-14 px-6 flex items-center gap-2 text-sm font-bold transition-all border-b-2 ${isTagModule ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Tags className="w-4 h-4" /> 标签管理
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white"><Settings className="w-4 h-4" /></button>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-bold leading-none">何思乔</p>
               <p className="text-[10px] text-slate-500">Super User</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">何</div>
          </div>
        </div>
      </header>

      {/* 2. 主内容区域 (带侧边栏) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        {(isDataModule || isRequirementModule) && (
          <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
            <div className="p-4 flex-1">
               {isDataModule && (
                 <>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Analysis Hub</p>
                   <nav className="space-y-1">
                     {analysisNavItems.map((item) => {
                       const Icon = item.icon;
                       const isActive = currentPage === item.id;
                       const isCreativePage = item.id === Page.CREATIVE_ANALYSIS;
                       
                       return (
                         <div key={item.id} className="space-y-1">
                            <button
                              onClick={() => onPageNavigate(item.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                                isActive 
                                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center">
                                <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                {item.label}
                              </div>
                              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                            </button>
                            
                            {/* 维度分析下的子菜单 */}
                            {isCreativePage && isActive && (
                               <div className="ml-4 pl-3 border-l border-slate-100 flex flex-col gap-1 py-1 animate-in slide-in-from-top-2 duration-300">
                                  {creativeSubTabs.map((sub) => {
                                     const SubIcon = sub.icon;
                                     const isSubActive = creativeSubTab === sub.id;
                                     return (
                                        <button
                                          key={sub.id}
                                          onClick={() => onCreativeSubTabChange(sub.id as any)}
                                          className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                            isSubActive 
                                              ? 'text-primary bg-indigo-50' 
                                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                          }`}
                                        >
                                           <SubIcon className={`w-3.5 h-3.5 mr-2.5 ${isSubActive ? 'text-primary' : 'text-slate-300'}`} />
                                           {sub.label}
                                        </button>
                                     );
                                  })}
                               </div>
                            )}
                         </div>
                       );
                     })}
                   </nav>
                 </>
               )}

               {isRequirementModule && (
                 <>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">需求管理中心</p>
                   <nav className="space-y-1">
                     {[
                       { id: 'coordinated', label: '协同看板', icon: Layers },
                       { id: 'schedules', label: '创意排期', icon: Calendar },
                       { id: 'list', label: '需求大表', icon: ClipboardList },
                       { id: 'upload', label: '素材上传', icon: Upload }
                     ].map((item) => {
                       const Icon = item.icon;
                       const isActive = requirementSubView === item.id;
                       return (
                         <button
                           key={item.id}
                           onClick={() => onRequirementSubViewChange?.(item.id as any)}
                           className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all group ${
                             isActive 
                               ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                               : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                           }`}
                         >
                           <div className="flex items-center">
                             <Icon className={`w-3.5 h-3.5 mr-3 ${isActive ? 'text-white' : 'text-slate-450 group-hover:text-slate-600'}`} />
                             {item.label}
                           </div>
                           {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                         </button>
                       );
                     })}
                   </nav>
                 </>
               )}
            </div>
            <div className="mt-auto p-4 border-t border-slate-100">
               <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                  <LogOut className="w-4 h-4" /> 退出系统
               </button>
            </div>
          </aside>
        )}

        {/* 页面主视图 */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 p-6">
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
