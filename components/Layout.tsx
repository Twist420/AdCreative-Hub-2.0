
import React from 'react';
import { MainModule, Page } from '../types';
import { 
  LayoutDashboard, FileVideo, BarChart3, Users, 
  Tags, Database, Settings, ChevronRight,
  ClipboardList, Layers, PieChart, Activity, Calendar, Upload, Palette
} from 'lucide-react';
import ResizableSidebar from './ResizableSidebar';

interface LayoutProps {
  activeModule: MainModule;
  onModuleNavigate: (mod: MainModule) => void;
  currentPage: Page;
  onPageNavigate: (page: Page) => void;
  requirementSubView?: 'coordinated' | 'list' | 'production' | 'upload';
  onRequirementSubViewChange?: (view: 'coordinated' | 'list' | 'production' | 'upload') => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  activeModule, onModuleNavigate, currentPage, onPageNavigate, 
  requirementSubView = 'coordinated', onRequirementSubViewChange,
  children 
}) => {
  
  const analysisNavItems = [
    { id: Page.OVERVIEW, label: '总览看板', icon: LayoutDashboard },
    { id: Page.RECOVERY_DATA, label: '回收数据', icon: Activity },
    { id: Page.CONSUMPTION_DATA, label: '消耗数据', icon: PieChart },
    { id: Page.PERSONNEL, label: '人员效能', icon: Users },
    { id: Page.BENCHMARK, label: 'Benchmark', icon: Layers },
  ];

  const isDataModule = activeModule === MainModule.DATA_ANALYSIS;
  const isRequirementModule = activeModule === MainModule.REQUIREMENT_CENTER;
  const isTagModule = activeModule === MainModule.TAG_MANAGEMENT;
  const isAssetModule = activeModule === MainModule.ASSET_LIBRARY;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* 1. 全局顶层导航栏 */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between gap-3 px-4 lg:px-6 shrink-0 z-30">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <div className="flex shrink-0 items-center gap-2 mr-1 lg:mr-4">
             <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="text-white w-4 h-4" />
             </div>
             <span className="text-xl font-black tracking-tight">AdPulse Pro</span>
          </div>
          
          <nav className="flex min-w-0 items-center h-full overflow-x-auto no-scrollbar">
            <button 
              onClick={() => onModuleNavigate(MainModule.REQUIREMENT_CENTER)}
              className={`h-14 px-3 lg:px-5 xl:px-6 flex shrink-0 items-center gap-2.5 text-sm font-black transition-all border-b-2 ${isRequirementModule ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <ClipboardList className="h-5 w-5" /> 需求中心
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.ASSET_LIBRARY)}
              className={`h-14 px-3 lg:px-5 xl:px-6 flex shrink-0 items-center gap-2.5 text-sm font-black transition-all border-b-2 ${activeModule === MainModule.ASSET_LIBRARY ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Database className="h-5 w-5" /> 资产库
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.ITERATION_RECORD)}
              className={`h-14 px-3 lg:px-5 xl:px-6 flex shrink-0 items-center gap-2.5 text-sm font-black transition-all border-b-2 ${activeModule === MainModule.ITERATION_RECORD ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Activity className="h-5 w-5" /> 迭代记录
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.DATA_ANALYSIS)}
              className={`h-14 px-3 lg:px-5 xl:px-6 flex shrink-0 items-center gap-2.5 text-sm font-black transition-all border-b-2 ${isDataModule ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Database className="h-5 w-5" /> 数据分析
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.TAG_MANAGEMENT)}
              className={`h-14 px-3 lg:px-5 xl:px-6 flex shrink-0 items-center gap-2.5 text-sm font-black transition-all border-b-2 ${isTagModule ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Tags className="h-5 w-5" /> 标签管理
            </button>
            <button 
              onClick={() => onModuleNavigate(MainModule.UI_SPECIFICATION)}
              className={`h-14 px-3 lg:px-5 xl:px-6 flex shrink-0 items-center gap-2.5 text-sm font-black transition-all border-b-2 ${activeModule === MainModule.UI_SPECIFICATION ? 'border-primary bg-white/5 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              <Palette className="h-5 w-5" /> 规范画布
            </button>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:gap-4">
          <button className="p-2 text-slate-400 hover:text-white"><Settings className="w-4 h-4" /></button>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-black leading-none">何思乔</p>
               <p className="text-[9.5px] font-bold text-slate-500">Super User</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">何</div>
          </div>
        </div>
      </header>

      {/* 2. 主内容区域 (带侧边栏) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        {(isDataModule || isRequirementModule) && (
          <ResizableSidebar
            title={isDataModule ? '数据分析' : '需求管理中心'}
            subtitle={isDataModule ? 'Analysis Hub' : 'Requirement Hub'}
            icon={isDataModule ? BarChart3 : ClipboardList}
            storageKey={isDataModule ? 'layout:data-sidebar' : 'layout:requirement-sidebar'}
            defaultWidth={240}
            minWidth={196}
            maxWidth={360}
          >
            {(collapsed) => (
              <>
                {isDataModule && (
                  <nav className="space-y-1">
                    {analysisNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.id;

                      return (
                        <div key={item.id} className="space-y-1">
                          <button
                            onClick={() => onPageNavigate(item.id)}
                            className={`group relative flex w-full items-center rounded-xl text-xs font-black transition-all ${
                              collapsed ? 'h-10 justify-center px-0' : 'justify-between px-3 py-2.5'
                            } ${
                              isActive
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                            title={item.label}
                          >
                            <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                              <Icon className={`h-4 w-4 shrink-0 ${collapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                              {!collapsed && item.label}
                            </div>
                            {collapsed && (
                              <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50 -translate-y-1/2 translate-x-0 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-black text-white opacity-0 shadow-xl ring-1 ring-black/5 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                                {item.label}
                              </span>
                            )}
                            {!collapsed && isActive && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
                          </button>
                        </div>
                      );
                    })}
                  </nav>
                )}

                {isRequirementModule && (
                  <nav className="space-y-1">
                    {[
                      { id: 'coordinated', label: '协同看板', icon: Layers },
                      { id: 'production', label: '制作排期', icon: Calendar },
                      { id: 'list', label: '需求大表', icon: ClipboardList },
                      { id: 'upload', label: '素材上传', icon: Upload },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = requirementSubView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onRequirementSubViewChange?.(item.id as any)}
                          className={`group relative flex w-full items-center rounded-xl text-xs font-bold transition-all ${
                            collapsed ? 'h-10 justify-center px-0' : 'justify-between px-3 py-2'
                          } ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          title={item.label}
                        >
                          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${collapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-slate-450 group-hover:text-slate-600'}`} />
                            {!collapsed && item.label}
                          </div>
                          {collapsed && (
                            <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50 -translate-y-1/2 translate-x-0 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-black text-white opacity-0 shadow-xl ring-1 ring-black/5 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                              {item.label}
                            </span>
                          )}
                          {!collapsed && isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
                        </button>
                      );
                    })}
                  </nav>
                )}
              </>
            )}
          </ResizableSidebar>
        )}

        {/* 页面主视图 */}
        <main className={`flex-1 min-w-0 overflow-y-auto no-scrollbar bg-slate-50 ${
          isAssetModule ? 'p-0' : 'p-4 lg:p-6'
        }`}>
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
