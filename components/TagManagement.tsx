
import React, { useState } from 'react';
import { Video, Image, Gamepad2, ChevronRight, Hash } from 'lucide-react';
import VideoTagManager from './VideoTagManager';

type TagTab = 'video' | 'image' | 'playable';

const TagManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TagTab>('video');

  const tabs = [
    { id: 'video', label: '视频标签库', icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'image', label: '图片标签库', icon: Image, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'playable', label: '试玩标签库', icon: Gamepad2, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="flex h-full gap-6">
      {/* 标签模块专属侧边栏 */}
      <aside className="w-56 shrink-0 flex flex-col gap-2">
        <div className="px-2 py-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">库分类 (Assets)</h2>
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TagTab)}
                  className={`flex items-center justify-between px-3 py-3 rounded-2xl transition-all group ${
                    isActive 
                      ? 'bg-white shadow-sm ring-1 ring-slate-200 text-slate-900' 
                      : 'text-slate-500 hover:bg-slate-200/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${isActive ? tab.bg : 'bg-slate-100'}`}>
                      <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} />
                    </div>
                    <span className="text-sm font-bold">{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-slate-300" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto px-4 py-6 bg-indigo-600 rounded-3xl m-2 text-white">
           <Hash className="w-6 h-6 mb-2 opacity-50" />
           <p className="text-xs font-bold mb-1">标签标准化</p>
           <p className="text-[10px] opacity-70 leading-relaxed">统一的标签体系有助于跨部门协作和AI精准建模。</p>
        </div>
      </aside>

      {/* 模块内容区 */}
      <div className="flex-1 min-w-0">
        {activeTab === 'video' ? (
          <VideoTagManager />
        ) : (
          <div className="h-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              {activeTab === 'image' ? <Image className="w-10 h-10 text-slate-300" /> : <Gamepad2 className="w-10 h-10 text-slate-300" />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-slate-400 text-sm max-w-sm">
              该功能正在建设中。我们正在整理图片和试玩的标签结构，不久后将上线管理功能。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManagement;
