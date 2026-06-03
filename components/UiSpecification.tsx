import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, Type, LayoutGrid, ToggleLeft, Film, Code, Copy, Check,
  AlertCircle, CheckCircle2, Moon, Sun, Info, Sliders, ExternalLink,
  Smartphone, Monitor, Tablet, Layers, Eye, Smartphone as MobileIcon, Sparkles
} from 'lucide-react';

export const UiSpecificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'layouts' | 'controls' | 'ratios' | 'snippets'>('tokens');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Playground stats for interactive sandboxes
  const [sandboxPrimary, setSandboxPrimary] = useState<'indigo' | 'slate' | 'emerald' | 'rose'>('indigo');
  const [sandboxSize, setSandboxSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [sandboxShadow, setSandboxShadow] = useState<'none' | 'xs' | 'md' | 'xl'>('md');
  const [sandboxIsEditing, setSandboxIsEditing] = useState(false);

  // Custom copy utility
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const colors = {
    brand: [
      { name: 'Primary Core (Indigo)', tailwind: 'bg-indigo-600', textTailwind: 'text-indigo-600', hex: '#4f46e5', desc: '用于主交互、高亮、确定动作、关键跳转' },
      { name: 'Indigo Light (Subtle)', tailwind: 'bg-indigo-50', textTailwind: 'text-indigo-500', hex: '#e0e7ff', desc: '高亮背景、分段输入框激活态底色' },
      { name: 'Brand Slate 950 (Heavy)', tailwind: 'bg-slate-950', textTailwind: 'text-slate-950', hex: '#020617', desc: '最重背景色，如预览器、视频背板遮罩' },
      { name: 'Brand Slate 900 (Header)', tailwind: 'bg-slate-900', textTailwind: 'text-slate-900', hex: '#0f172a', desc: '顶栏背景色，高对比度容器背景' }
    ],
    neutrals: [
      { name: 'Bg Main (Slate 50)', tailwind: 'bg-slate-50', textTailwind: 'text-slate-50', hex: '#f8fafc', desc: '全屏或大区域主画板底色' },
      { name: 'Bg Item (Slate 100)', tailwind: 'bg-slate-100', textTailwind: 'text-slate-100', hex: '#f1f5f9', desc: '小控件槽位、多选包裹底色' },
      { name: 'Border Soft (Slate 150)', tailwind: 'bg-slate-150', textTailwind: 'text-slate-150', hex: '#e2e8f0 (sub)', desc: '常态轻盈分割线与卡片边框' },
      { name: 'Border Standard (Slate 200)', tailwind: 'bg-slate-200', textTailwind: 'text-slate-200', hex: '#e2e8f0', desc: '输入框、页面主表格边框颜色' }
    ],
    states: [
      { name: 'Emerald Strong (Success/Good)', tailwind: 'bg-emerald-500', textTailwind: 'text-emerald-500', hex: '#10b981', desc: '优质评价、通过验收、转化率(IR)优秀、推荐指标' },
      { name: 'Emerald Pastel', tailwind: 'bg-emerald-50', textTailwind: 'text-emerald-700', hex: '#ecfdf5', desc: '成功状态或达标数据的浅色背景' },
      { name: 'Rose Strong (Danger/Failed)', tailwind: 'bg-rose-500', textTailwind: 'text-rose-500', hex: '#f43f5e', desc: '不推荐、未达标、未配置URL、强制删除危险操作' },
      { name: 'Rose Pastel', tailwind: 'bg-rose-50', textTailwind: 'text-rose-700', hex: '#fff1f2', desc: '警告性描述、未选中或废弃状态底层' }
    ]
  };

  const textSpecs = [
    { level: 'H1 Display Title', size: '3xl (30px)', classes: 'font-black tracking-tight text-slate-900', style: '主要用于页面顶部大标题', demo: '深度创意对比分析报表' },
    { level: 'H2 Section Header', size: 'xl (20px)', classes: 'font-black text-slate-900 tracking-tight', style: '模态框或区域划分主标识', demo: '基础物料固定属性群' },
    { level: 'Sub Title', size: 'xs (12px) label', classes: 'font-black text-slate-805 uppercase tracking-wider', style: '卡片辅助二级导航或表格大分类', demo: 'C. 数据类 (Performance Metrics)' },
    { level: 'Metadata Label', size: '[9.5px]/[10px] mono', classes: 'font-mono text-slate-400 font-bold uppercase tracking-widest', style: '微标、数值小标、技术数据时间抬头', demo: '📅 INGRESS DATE: 2026-06-03' },
    { level: 'Body Content', size: 'xs (12px) standard', classes: 'text-slate-500 font-medium text-left leading-relaxed', style: '正文解释段落、使用指南文字', demo: '提供竖屏9:16、横屏16:9以及比例为4:5, 1:1的无缝画布适配器' }
  ];

  const layoutRules = [
    { title: '卡片容器规范 (Grid Cards)', code: 'border border-slate-150/60 bg-white rounded-2xl shadow-3xs p-6 gap-6', desc: '每一个独立板块均通过轻量描边与極细微阴影渲染，背景统一为100%纯白无色偏，使内容清晰浮于Slate-50底色之表' },
    { title: '模态框多栏分割布局 (Layout Columns)', code: 'lg:w-[36%] border-r border-slate-150 vs lg:flex-1 p-6', desc: '弹窗采用精准的36/64黄金分割，左侧固定预览与尺寸规格为一派，右侧承载丰富关联选项及数据详情，且配置overflow-hidden与内嵌no-scrollbar保证双轴平滑独立滚动' },
    { title: '紧凑型尺寸格栅按钮 (Compact Grids)', code: 'grid grid-cols-4 gap-1.5 bg-slate-105 p-1 rounded-lg', desc: '尺寸缩略操作，使用卡槽式的灰色槽位。将多选项均匀分布，减少垂直占用，提升点按效率，突出科技感' }
  ];

  return (
    <div className="space-y-10 pb-40 relative min-h-screen">
      {/* 1. Header Hero Panel */}
      <div className="px-10 py-10 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl text-white border border-slate-850 shadow-md relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute right-[-10%] top-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-600/10 blur-[90px] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-indigo-200 text-xs font-black border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            AdPulse Pro Design System
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">UI 和 交互规范沉淀画布</h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            此页签沉淀了 AdPulse Pro 应用上所有模块采用的视觉主格调、布局法则、交互微动效。
            旨在统一设计共识，确保多维看板系统具备极高的易读性、设计诚实度与视觉流畅感。
          </p>
        </div>
      </div>

      {/* 2. Page Sub Navigations / Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-3xs flex flex-wrap gap-1.5 shrink-0">
        {[
          { id: 'tokens', label: '视觉原子 (Tokens)', icon: Palette },
          { id: 'layouts', label: '空间与栅格 (Layouts)', icon: LayoutGrid },
          { id: 'controls', label: '交互与状态 (Controls)', icon: ToggleLeft },
          { id: 'ratios', label: '媒体尺寸适配 (Media Ratios)', icon: Film },
          { id: 'snippets', label: '代码速查器 (Component Hub)', icon: Code }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Copied notification pop */}
      <AnimatePresence>
        {copiedText && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-10 right-10 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>已成功复制 {copiedText} 代码片段到剪贴板！</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Tab Content Area */}
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* ======================================================== */}
        {/* TAB 1: TOKENS                                            */}
        {/* ======================================================== */}
        {activeTab === 'tokens' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Color Swatch Panel */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-500" />
                    色彩调色盘 (Color Tokens Palette)
                  </h2>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Accent System</span>
                </div>

                <div className="space-y-6">
                  {/* Brand & core */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">🏷️ 品牌主轴 (Brand Actives)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {colors.brand.map((c) => (
                        <div key={c.name} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-4 hover:border-slate-350 transition-all">
                          <div className={`w-14 h-14 rounded-2xl ${c.tailwind} shadow-xs border border-black/10 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800 truncate">{c.name}</span>
                              <span className="font-mono text-[9px] text-slate-450 bg-white border px-1 rounded">{c.hex}</span>
                            </div>
                            <p className="text-[10.5px] text-slate-450 mt-1 leading-normal">{c.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Neutrals */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">🕊️ 中性排版色 (Neutrals & Layout)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {colors.neutrals.map((c) => (
                        <div key={c.name} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-4 hover:border-slate-350 transition-all">
                          <div className={`w-14 h-14 rounded-2xl ${c.tailwind} shadow-xs border border-slate-150/60 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800 truncate">{c.name}</span>
                              <span className="font-mono text-[9px] text-slate-450 bg-white border px-1 rounded">{c.hex}</span>
                            </div>
                            <p className="text-[10.5px] text-slate-450 mt-1 leading-normal">{c.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* States */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">🚦 数据与业务状态色 (Status Badges Indicator)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {colors.states.map((c) => (
                        <div key={c.name} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-4 hover:border-slate-350 transition-all">
                          <div className={`w-14 h-14 rounded-2xl ${c.tailwind} shadow-xs border border-slate-150/60 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-805 truncate">{c.name}</span>
                              <span className="font-mono text-[9px] text-slate-450 bg-white border px-1 rounded">{c.hex}</span>
                            </div>
                            <p className="text-[10.5px] text-slate-450 mt-1 leading-normal">{c.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Typography Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Type className="w-5 h-5 text-indigo-500" />
                    字重与对齐 (Typography)
                  </h2>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Inter + Mono</span>
                </div>

                <div className="space-y-6">
                  {textSpecs.map((spec) => (
                    <div key={spec.level} className="pb-4 border-b border-slate-100 last:border-b-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-605">{spec.level}</span>
                        <code className="text-[8.5px] font-mono text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">{spec.size}</code>
                      </div>
                      <p className={`line-clamp-2 select-all ${spec.classes}`}>{spec.demo}</p>
                      <p className="text-[10px] text-slate-400 font-medium">应用场景: {spec.style}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LAYOUTS                                           */}
        {/* ======================================================== */}
        {activeTab === 'layouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Interactive Bento Sandbox Preview */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-indigo-500" />
                  栅格解构沙盒（Interactive Bento Sandbox）
                </h2>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border text-[10px] font-mono text-slate-450 uppercase">
                  <span>实时模拟</span>
                </div>
              </div>

              {/* Dynamic Controls row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150 text-left font-sans text-xs">
                <div>
                  <label className="font-black text-slate-500 block mb-2">🎈 演示主题配色 (Primary Accents)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['indigo', 'slate', 'emerald', 'rose'] as const).map(color => (
                      <button 
                        key={color} 
                        onClick={() => setSandboxPrimary(color)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          sandboxPrimary === color 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-3xs' 
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-850'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-black text-slate-500 block mb-2">📏 内边距比例 (Sizing Gaps)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['sm', 'md', 'lg'] as const).map(size => (
                      <button 
                        key={size} 
                        onClick={() => setSandboxSize(size)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          sandboxSize === size 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-3xs' 
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-850'
                        }`}
                      >
                        {size === 'sm' ? '紧凑 (p-3)' : size === 'md' ? '标准 (p-6)' : '充沛 (p-8)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-black text-slate-500 block mb-2">🌑 底层投影融合 (Shadow Softness)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['none', 'xs', 'md', 'xl'] as const).map(shadow => (
                      <button 
                        key={shadow} 
                        onClick={() => setSandboxShadow(shadow)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          sandboxShadow === shadow 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-3xs' 
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-850'
                        }`}
                      >
                        {shadow === 'none' ? '无 shadow' : shadow === 'xs' ? '极弱 (3xs)' : shadow === 'md' ? '轻盈 (xs)' : '悬浮 (lg)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sandbox rendering canvas */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center min-h-[220px]">
                <div className={`w-full max-w-lg bg-white border border-slate-200/60 rounded-2xl text-left transition-all duration-300 ${
                  sandboxSize === 'sm' ? 'p-3 gap-3' : sandboxSize === 'md' ? 'p-6 gap-6' : 'p-8 gap-8'
                } ${
                  sandboxShadow === 'none' ? 'shadow-none' : 
                  sandboxShadow === 'xs' ? 'shadow-3xs' : 
                  sandboxShadow === 'md' ? 'shadow-xs' : 'shadow-lg'
                } flex flex-col`}>
                  
                  {/* Card head inside sandbox */}
                  <div className="flex items-center justify-between border-b pb-3.5 border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-6 rounded-full ${
                        sandboxPrimary === 'indigo' ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.35)]' :
                        sandboxPrimary === 'emerald' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]' :
                        sandboxPrimary === 'rose' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.35)]' : 'bg-slate-900'
                      }`} />
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">创意排期进度</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">W20 Schedule</span>
                  </div>

                  {/* Card content inside sandbox */}
                  <div className="space-y-3.5">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      正在展示一组经过组件沉淀机制渲染的模块卡片。你可以调整上方调试台，观察间距、阴影与描边状态的呼吸式渲染变化。
                    </p>
                    
                    {/* Status grid simulation inside sandbox */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-widest">Target ROAS</span>
                        <span className="text-base font-bold font-mono text-slate-800">124.5%</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-widest">CPI Standards</span>
                        <span className="text-base font-bold font-mono text-slate-800">$0.85 USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Copy style tags for sandbox */}
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[9.5px] font-mono text-indigo-605 font-bold">🎯 Preview Active Style Classes:</span>
                    <button 
                      onClick={() => handleCopy(`border border-slate-150/60 bg-white rounded-2xl ${
                        sandboxSize === 'sm' ? 'p-3' : sandboxSize === 'md' ? 'p-6' : 'p-8'
                      } ${
                        sandboxShadow === 'none' ? 'shadow-none' : 
                        sandboxShadow === 'xs' ? 'shadow-3xs' : 
                        sandboxShadow === 'md' ? 'shadow-xs' : 'shadow-lg'
                      }`, 'Sandbox Class')}
                      className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-slate-405 hover:text-slate-800"
                    >
                      <Copy className="w-3 h-3" />
                      复制代码
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Layout code guidelines list */}
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    空间沉淀法案
                  </h2>
                </div>

                <div className="space-y-5">
                  {layoutRules.map((rule) => (
                    <div key={rule.title} className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-150 hover:bg-slate-100/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">{rule.title}</span>
                        <button 
                          onClick={() => handleCopy(rule.code, rule.title)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="复制片段"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-455 leading-relaxed font-medium">{rule.desc}</p>
                      <code className="block select-all text-[8.5px] font-mono text-slate-600 bg-white border p-1.5 rounded break-all leading-normal">{rule.code}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CONTROLS                                          */}
        {/* ======================================================== */}
        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-left animate-in fade-in duration-500">
            {/* Status Pills and Badge components catalog */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  徽章微标与状态（Status Badges & Forms）
                </h2>
                <span className="text-[10px] text-indigo-600 uppercase font-mono font-bold tracking-wider">Semantic Standard</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">📍 推荐等级/指标评估 (Indicator Badges)</h3>
                  
                  <div className="grid grid-cols-2 gap-3.5 font-sans">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between gap-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-800">推荐使用 (Recommended)</span>
                        <span className="text-[9.5px] text-slate-400">数据显著表现良好</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black rounded shadow-3xs flex items-center gap-1 whitespace-nowrap shrink-0">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                        推荐使用
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between gap-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-805">不推荐 (Not Recommended)</span>
                        <span className="text-[9.5px] text-slate-400">单价过高、未达标</span>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black rounded shadow-3xs flex items-center gap-1 whitespace-nowrap shrink-0">
                        不推荐
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between gap-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-805">数据不足 (Insufficient)</span>
                        <span className="text-[9.5px] text-slate-400">投产未满周期</span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black rounded shadow-3xs flex items-center gap-1 whitespace-nowrap shrink-0">
                        数据不足
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between gap-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-805">资产分类 (Category Sub)</span>
                        <span className="text-[9.5px] text-slate-400">微型类型标记符</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-white border border-indigo-200 text-indigo-750 text-[9.5px] font-black rounded shadow-3xs flex items-center gap-1 whitespace-nowrap shrink-0 font-sans">
                        剧情片段-02
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 font-medium">设计备注：微标微动效中，绿灯推荐呼吸效果由 `animate-ping` 与圆圈组合渲染。文字尺寸统一在 9.5px 至 10px。</p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">📝 表单输入常态与编辑态转换机制</h3>
                    <button 
                      onClick={() => setSandboxIsEditing(!sandboxIsEditing)}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 font-black rounded text-[10px] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      模拟点击切换: {sandboxIsEditing ? '编辑中 ✏️' : '只读常态 🔒'}
                    </button>
                  </div>

                  {/* Form toggle simulation block */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Control 1: Text type */}
                      <div>
                        <span className="text-[9.5px] text-slate-400 font-bold block mb-1">🌿 资产名称 (Asset Name)</span>
                        {sandboxIsEditing ? (
                          <div className="space-y-1">
                            <input 
                              type="text" 
                              placeholder="配置新的名称主标题..." 
                              defaultValue="核心趣味战斗-片段01"
                              className="w-full font-sans text-xs font-black text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <p className="text-[9.5px] text-[10px] text-indigo-600">编辑框背景为纯白，描边加厚并赋予 1px 聚焦聚焦高亮框</p>
                          </div>
                        ) : (
                          <div className="font-sans font-bold text-slate-700 bg-slate-100/60 px-2.5 py-1.5 rounded-lg border border-slate-150 text-xs flex items-center justify-between">
                            <span>核心趣味战斗-片段01</span>
                            <span className="text-[7.5px] font-mono font-bold text-slate-400 opacity-80">READONLY</span>
                          </div>
                        )}
                      </div>

                      {/* Control 2: Select/Option List */}
                      <div>
                        <span className="text-[9.5px] text-slate-400 font-bold block mb-1">⏳ 运行周期 (Duration Level)</span>
                        {sandboxIsEditing ? (
                          <select 
                            defaultValue="5"
                            className="w-full font-sans text-xs font-black text-slate-700 bg-white px-2 py-1.5 rounded-lg border border-slate-205 focus:outline-none"
                          >
                            <option value="3">00:03 秒极速短叙事</option>
                            <option value="5">00:05 秒精炼黄金前贴</option>
                            <option value="15">00:15 秒深度玩法讲解</option>
                          </select>
                        ) : (
                          <p className="font-sans font-bold text-slate-700 bg-slate-100/60 px-2.5 py-1.5 rounded-lg border border-slate-150 text-xs">
                            00:05 秒精炼黄金前贴
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Standard Button and Hover Actions Library */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  按钮、操作项与交互反馈（Action Buttons）
                </h2>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Interface Elements</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5">⚔️ 按钮规格 (Button Scales)</h3>
                  
                  <div className="flex flex-wrap gap-3.5 items-center font-sans">
                    {/* Primary Button */}
                    <div className="space-y-1.5 flex flex-col items-center">
                      <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-805 hover:-translate-y-px text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs">
                        主行动点按
                      </button>
                      <span className="font-mono text-[8.5px] text-slate-450 bg-slate-100 px-1 rounded block">Primary</span>
                    </div>

                    {/* Secondary Border Button */}
                    <div className="space-y-1.5 flex flex-col items-center">
                      <button className="px-5 py-2.5 bg-white border border-slate-250 hover:bg-slate-50 hover:text-slate-900 text-slate-600 text-xs font-black rounded-xl transition-all cursor-pointer">
                        次要描边按钮
                      </button>
                      <span className="font-mono text-[8.5px] text-slate-450 bg-slate-100 px-1 rounded block">Secondary</span>
                    </div>

                    {/* Pastel / Accent Button */}
                    <div className="space-y-1.5 flex flex-col items-center">
                      <button className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition-all cursor-pointer border border-indigo-100/50">
                        品牌轻色按钮
                      </button>
                      <span className="font-mono text-[8.5px] text-slate-450 bg-slate-100 px-1 rounded block">Pastel Indigo</span>
                    </div>

                    {/* Danger Alert Button */}
                    <div className="space-y-1.5 flex flex-col items-center">
                      <button className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-xl transition-all cursor-pointer border border-rose-200">
                        危险警告按钮
                      </button>
                      <span className="font-mono text-[8.5px] text-slate-450 bg-slate-100 px-1 rounded block">Alert Trigger</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">🎈 标签动态增加器 (Interactive Tags Array editor)</h3>
                  
                  {/* Tag adder simulated */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                    <p className="text-[11px] text-slate-500 leading-normal">
                      当编辑创意标签、关联素材时，使用 <code>Enter</code> 直接注入新的关联符，卡片内元素可随点随删，具备轻巧气泡边缘。
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {['3D玩法-大招', 'TikTok海外爆款', '高转化ROAS组'].map(t => (
                        <span key={t} className="px-2.5 py-1 bg-white border border-slate-205 rounded text-[9.5px] font-mono font-black text-slate-650 flex items-center gap-1">
                          {t}
                          <button className="text-[10px] text-slate-400 hover:text-rose-500 font-bold ml-1" title="仅供模拟">&times;</button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly
                        value="按下 Enter 快捷键即刻绑定新的参数..."
                        className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-400 font-bold focus:outline-none"
                      />
                      <button className="bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-black cursor-pointer" onClick={() => handleCopy("onKeyDown={(e) => { if (e.key === 'Enter') { ... } }}", "Enter Add logic")}>
                        复制逻辑
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: RATIOS                                            */}
        {/* ======================================================== */}
        {activeTab === 'ratios' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6 text-left animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-500" />
                资源多维媒体比例与背板模糊 (Media Ratio Adapter)
              </h2>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Multi-Grid Layout</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* 9:16 aspect ratio box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">1. 竖屏 9:16 (Max-h: 300px)</span>
                  <code className="text-[8px] font-mono text-indigo-600 bg-indigo-50 p-0.5 rounded">aspect-[9/16]</code>
                </div>
                {/* Simulated frame */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden aspect-[9/16] h-[300px] flex items-center justify-center mx-auto relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 z-[5]" />
                  <div className="text-center z-10 p-3 space-y-1 text-white">
                    <Smartphone className="w-5 h-5 mx-auto text-indigo-400" />
                    <span className="text-[10px] block font-mono font-bold">1080 &times; 1920</span>
                    <span className="text-[8.5px] block text-slate-400 font-medium">TikTok, Shorts 黄金尺寸</span>
                  </div>
                </div>
              </div>

              {/* 16:9 aspect ratio box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">2. 横屏 16:9 (Max-w: full)</span>
                  <code className="text-[8px] font-mono text-indigo-600 bg-indigo-50 p-0.5 rounded">aspect-[16/9]</code>
                </div>
                {/* Simulated frame */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden aspect-[16/9] h-[130px] flex items-center justify-center relative group mt-10 md:mt-20">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 z-[5]" />
                  <div className="text-center z-10 p-3 space-y-1 text-white">
                    <Monitor className="w-5 h-5 mx-auto text-indigo-400" />
                    <span className="text-[10px] block font-mono font-bold">1920 &times; 1080</span>
                    <span className="text-[8.5px] block text-slate-400 font-medium">Youtube 插屏、原生横屏广告</span>
                  </div>
                </div>
              </div>

              {/* 1:1 square ratio box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">3. 方形 1:1</span>
                  <code className="text-[8px] font-mono text-indigo-600 bg-indigo-50 p-0.5 rounded">aspect-square</code>
                </div>
                {/* Simulated frame */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden aspect-square h-[170px] flex items-center justify-center mx-auto relative group mt-6 md:mt-14">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 z-[5]" />
                  <div className="text-center z-10 p-3 space-y-1 text-white">
                    <Tablet className="w-5 h-5 mx-auto text-indigo-400" />
                    <span className="text-[10px] block font-mono font-bold">1000 &times; 1000</span>
                    <span className="text-[8.5px] block text-slate-400 font-medium">Meta 常用多端卡片适配比例</span>
                  </div>
                </div>
              </div>

              {/* 4:5 vertical box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">4. 竖向 4:5</span>
                  <code className="text-[8px] font-mono text-indigo-600 bg-indigo-50 p-0.5 rounded">aspect-[4/5]</code>
                </div>
                {/* Simulated frame */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden aspect-[4/5] h-[200px] flex items-center justify-center mx-auto relative group mt-4 md:mt-10">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 z-[5]" />
                  <div className="text-center z-10 p-3 space-y-1 text-white">
                    <MobileIcon className="w-5 h-5 mx-auto text-indigo-400" />
                    <span className="text-[10px] block font-mono font-bold">1200 &times; 1500</span>
                    <span className="text-[8.5px] block text-slate-400 font-medium">Meta Feed 端高度自适应适配器</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Blurred drop visual effect */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="space-y-3.5">
                <h3 className="text-sm font-black text-slate-900 border-l-4 border-indigo-500 pl-3">🖼️ 双层模糊背景渲染技术 (Blur Dual-Layer Wrapper)</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  我们摒弃了普通的单色背景板，而是利用双层影像叠合：底层采用 <code>scale-155 filter blur-2xl opacity-15 pointer-events-none</code> 形成迷蒙的色彩氤氲，中高阶将正文缩略图贴合底层渲染，完美融合物理视频四周的突兀虚色，营造极致的光影环绕感。
                </p>
                <code className="block select-all text-[9px] font-mono text-slate-600 bg-slate-50 border p-2.5 rounded leading-relaxed">
                  {`{/* Blurred Backdrop wrapper */}
<div className="absolute inset-0 opacity-15 filter blur-2xl scale-155 pointer-events-none select-none">
   <img src={previewUrl} alt="" className="w-full h-full object-cover" />
</div>`}
                </code>
              </div>

              {/* Live Blur Example Container */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden h-[160px] shadow-lg">
                <div className="absolute inset-0 opacity-25 filter blur-2xl scale-155 pointer-events-none select-none">
                  <div className="w-full h-full bg-indigo-600/60" />
                </div>
                <div className="relative z-10 text-center text-white space-y-2">
                  <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black border border-white/10">
                    Live Blurred Backdrop Container Inside Applet
                  </span>
                  <p className="text-[10px] text-slate-350">底层通过渲染紫色块并应用 2xl 高斯模糊实现</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SNIPPETS                                          */}
        {/* ======================================================== */}
        {activeTab === 'snippets' && (
          <div className="space-y-6 text-left animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-3xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-105 pb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-500" />
                  组件及交互逻辑代码速查面板 (Reusable Design Patterns & Code Clips)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase">Copy Hub</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
                {/* Clip 1: Bento Matrix Grid Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-indigo-650 uppercase tracking-wide block">💿 标准极简卡片容器（Full Container Card）</span>
                    <p className="text-[11px] text-slate-500 font-medium">带有极轻描边与 3xs 柔和阴影，自适应宽度并配备 Indigo 强调条装饰。</p>
                  </div>
                  <div className="relative mt-4">
                    <pre className="text-[8.5px] leading-relaxed font-mono text-slate-650 bg-white border p-3 rounded-lg overflow-x-auto select-all max-h-48 whitespace-pre-wrap">
{`<div className="p-6 bg-white border border-slate-150/65 rounded-2xl shadow-3xs text-left">
   <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
      <div className="w-2 h-6 bg-indigo-600 rounded-full" />
      <h3 className="text-sm font-black text-slate-900">卡片标题</h3>
   </div>
   <p className="text-xs text-slate-550">内容本体...</p>
</div>`}
                    </pre>
                    <button 
                      onClick={() => handleCopy(`<div className="p-6 bg-white border border-slate-150/65 rounded-2xl shadow-3xs text-left">
   <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
      <div className="w-2 h-6 bg-indigo-600 rounded-full" />
      <h3 className="text-sm font-black text-slate-900">卡片标题</h3>
   </div>
   <p className="text-xs text-slate-550">内容本体...</p>
</div>`, 'Grid Card')}
                      className="absolute top-2 right-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="复制代码"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Clip 2: Toggle edit mode state controller */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-indigo-650 uppercase tracking-wide block">⚡ 模态框只读/编辑态绑定控制器（Read/Edit Model Toggles）</span>
                    <p className="text-[11px] text-slate-500 font-medium">无冲突输入控制：通过 state 驱动 input 与 span 文本双向动态渲染与绑定。</p>
                  </div>
                  <div className="relative mt-4">
                    <pre className="text-[8.5px] leading-relaxed font-mono text-slate-650 bg-white border p-3 rounded-lg overflow-x-auto select-all max-h-48 whitespace-pre-wrap">
{`{isEditMode ? (
   <input 
      type="text" 
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
   />
) : (
   <span className="text-xs font-black text-slate-805 font-mono">{editValue}</span>
)}`}
                    </pre>
                    <button 
                      onClick={() => handleCopy(`{isEditMode ? (
   <input 
      type="text" 
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
   />
) : (
   <span className="text-xs font-black text-slate-805 font-mono">{editValue}</span>
)}`, 'Read/Edit Toggle State')}
                      className="absolute top-2 right-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="复制代码"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Clip 3: Table Header Column Standard Styling */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-indigo-650 uppercase tracking-wide block">📊 汇总图表表头与对齐标准（Performance Tables）</span>
                    <p className="text-[11px] text-slate-500 font-medium">严谨的报表格线：顶头配置 <code>sticky top-0 bg-slate-900</code> 做高对比度渲染，列头使用 JetBrains Mono 强标小字，右对齐科学指标列。</p>
                  </div>
                  <div className="relative mt-4">
                    <pre className="text-[8.5px] leading-relaxed font-mono text-slate-655 bg-white border p-3 rounded-lg overflow-x-auto select-all max-h-48 whitespace-pre-wrap">
{`<thead className="sticky top-0 bg-slate-900 text-white select-none text-[10.5px]">
   <tr>
       <th className="px-4 py-3.5 text-left font-sans font-black tracking-wider">渠道列表</th>
       <th className="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">SPENT ($)</th>
       <th className="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">IR (%)</th>
       <th className="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">CPI ($)</th>
   </tr>
</thead>`}
                    </pre>
                    <button 
                      onClick={() => handleCopy(`<thead className="sticky top-0 bg-slate-900 text-white select-none text-[10.5px]">
   <tr>
       <th className="px-4 py-3.5 text-left font-sans font-black tracking-wider">渠道列表</th>
       <th className="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">SPENT ($)</th>
       <th className="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">IR (%)</th>
       <th className="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">CPI ($)</th>
   </tr>
</thead>`, 'Performance Table Styles')}
                      className="absolute top-2 right-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="复制代码"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Clip 4: Dual Overlay Popups Backdrop */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-indigo-650 uppercase tracking-wide block">🛡️ 纯净轻量弹窗遮罩规范（Pure Modal Backdrop Overlay）</span>
                    <p className="text-[11px] text-slate-500 font-medium">无重影、高性能：背景使用黑色75%不透明遮罩，并配置极小值的 <code>backdrop-blur-sm</code> 指令，减少浏览器在复杂图表情况下的运算耗损。</p>
                  </div>
                  <div className="relative mt-4">
                    <pre className="text-[8.5px] leading-relaxed font-mono text-slate-655 bg-white border p-3 rounded-lg overflow-x-auto select-all max-h-48 whitespace-pre-wrap">
{`<div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
   <div className="bg-white rounded-[1.25rem] border border-slate-150 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
       {/* 弹窗头部 */}
       {/* 弹窗身体 */}
   </div>
</div>`}
                    </pre>
                    <button 
                      onClick={() => handleCopy(`<div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
   <div className="bg-white rounded-[1.25rem] border border-slate-150 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
       {/* 弹窗头部 */}
       {/* 弹窗身体 */}
   </div>
</div>`, 'Modal Overlay Styles')}
                      className="absolute top-2 right-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="复制代码"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
