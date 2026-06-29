<script setup>
import { computed, ref } from 'vue'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code,
  Copy,
  Eye,
  Film,
  LayoutGrid,
  Layers,
  Monitor,
  Palette,
  Smartphone,
  Sparkles,
  Sliders,
  Tablet,
  ToggleLeft,
  Type,
} from 'lucide-vue-next'

const activeTab = ref('tokens')
const copiedText = ref('')
const sandboxPrimary = ref('indigo')
const sandboxSize = ref('md')
const sandboxShadow = ref('md')
const sandboxIsEditing = ref(false)
const sandboxDuration = ref('5')

const tabs = [
  { id: 'tokens', label: '视觉原子 (Tokens)', icon: Palette },
  { id: 'layouts', label: '空间与栅格 (Layouts)', icon: LayoutGrid },
  { id: 'controls', label: '交互与状态 (Controls)', icon: ToggleLeft },
  { id: 'ratios', label: '媒体尺寸适配 (Media Ratios)', icon: Film },
  { id: 'snippets', label: '代码速查器 (Component Hub)', icon: Code },
]

const colors = {
  brand: [
    { name: 'Primary Core (Indigo)', className: 'bg-indigo-600', hex: '#4f46e5', desc: '用于主交互、高亮、确定动作、关键跳转' },
    { name: 'Indigo Light (Subtle)', className: 'bg-indigo-50', hex: '#e0e7ff', desc: '高亮背景、分段输入框激活态底色' },
    { name: 'Brand Slate 950 (Heavy)', className: 'bg-slate-950', hex: '#020617', desc: '最重背景色，如预览器、视频背板遮罩' },
    { name: 'Brand Slate 900 (Header)', className: 'bg-slate-900', hex: '#0f172a', desc: '顶栏背景色，高对比度容器背景' },
  ],
  neutrals: [
    { name: 'Bg Main (Slate 50)', className: 'bg-slate-50', hex: '#f8fafc', desc: '全屏或大区域主画板底色' },
    { name: 'Bg Item (Slate 100)', className: 'bg-slate-100', hex: '#f1f5f9', desc: '小控件槽位、多选包裹底色' },
    { name: 'Border Soft (Slate 150)', className: 'bg-slate-150', hex: '#e2e8f0 (sub)', desc: '常态轻盈分割线与卡片边框' },
    { name: 'Border Standard (Slate 200)', className: 'bg-slate-200', hex: '#e2e8f0', desc: '输入框、页面主表格边框颜色' },
  ],
  states: [
    { name: 'Emerald Strong (Success/Good)', className: 'bg-emerald-500', hex: '#10b981', desc: '优质评价、通过验收、转化率(IR)优秀、推荐指标' },
    { name: 'Emerald Pastel', className: 'bg-emerald-50', hex: '#ecfdf5', desc: '成功状态或达标数据的浅色背景' },
    { name: 'Rose Strong (Danger/Failed)', className: 'bg-rose-500', hex: '#f43f5e', desc: '不推荐、未达标、未配置URL、强制删除危险操作' },
    { name: 'Rose Pastel', className: 'bg-rose-50', hex: '#fff1f2', desc: '警告性描述、未选中或废弃状态底层' },
  ],
}

const textSpecs = [
  { level: 'H1 Display Title', size: '3xl (30px)', classes: 'font-black tracking-tight text-slate-900', demo: '深度创意对比分析报表', style: '主要用于页面顶部大标题' },
  { level: 'H2 Section Header', size: 'xl (20px)', classes: 'font-black text-slate-900 tracking-tight', demo: '基础物料固定属性群', style: '模态框或区域划分主标识' },
  { level: 'Sub Title', size: 'xs (12px) label', classes: 'font-black text-slate-805 uppercase tracking-wider', demo: 'C. 数据类 (Performance Metrics)', style: '卡片辅助二级导航或表格大分类' },
  { level: 'Metadata Label', size: '[9.5px]/[10px] mono', classes: 'font-mono text-slate-400 font-bold uppercase tracking-widest', demo: 'INGRESS DATE: 2026-06-03', style: '微标、数值小标、技术数据时间抬头' },
  { level: 'Body Content', size: 'xs (12px) standard', classes: 'text-slate-500 font-medium text-left leading-relaxed', demo: '提供竖屏9:16、横屏16:9以及比例为4:5, 1:1的无缝画布适配器', style: '正文解释段落、使用指南文字' },
]

const layoutRules = [
  { title: '卡片容器规范 (Grid Cards)', code: 'border border-slate-150/60 bg-white rounded-2xl shadow-3xs p-6 gap-6', desc: '每一个独立板块均通过轻量描边与極细微阴影渲染，背景统一为100%纯白无色偏，使内容清晰浮于Slate-50底色之表' },
  { title: '模态框多栏分割布局 (Layout Columns)', code: 'lg:w-[36%] border-r border-slate-150 vs lg:flex-1 p-6', desc: '弹窗采用精准的36/64黄金分割，左侧固定预览与尺寸规格为一派，右侧承载丰富关联选项及数据详情，且配置overflow-hidden与内嵌no-scrollbar保证双轴平滑独立滚动' },
  { title: '紧凑型尺寸格栅按钮 (Compact Grids)', code: 'grid grid-cols-4 gap-1.5 bg-slate-105 p-1 rounded-lg', desc: '尺寸缩略操作，使用卡槽式的灰色槽位。将多选项均匀分布，减少垂直占用，提升点按效率，突出科技感' },
]

const colorGroupLabels = {
  brand: '🏷️ 品牌主轴 (Brand Actives)',
  neutrals: '🕊️ 中性排版色 (Neutrals & Layout)',
  states: '🚦 数据与业务状态色 (Status Badges Indicator)',
}

const ratioCards = [
  { icon: Smartphone, title: '1. 竖屏 9:16 (Max-h: 300px)', ratio: 'aspect-[9/16]', desc: 'TikTok, Shorts 黄金尺寸' },
  { icon: Monitor, title: '2. 横屏 16:9 (Max-w: full)', ratio: 'aspect-[16/9]', desc: 'Youtube 插屏、原生横屏广告' },
  { icon: Tablet, title: '3. 方形 1:1', ratio: 'aspect-square', desc: 'Meta 常用多端卡片适配比例' },
  { icon: Smartphone, title: '4. 竖向 4:5', ratio: 'aspect-[4/5]', desc: 'Meta Feed 端高度自适应适配器' },
]

const snippets = [
  {
    title: '💿 标准极简卡片容器（Full Container Card）',
    eyebrow: 'Grid Card',
    desc: '带有极轻描边与 3xs 柔和阴影，自适应宽度并配备 Indigo 强调条装饰。',
    code: `<div class="p-6 bg-white border border-slate-150/65 rounded-2xl shadow-3xs text-left">
  <div class="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
    <div class="w-2 h-6 bg-indigo-600 rounded-full" />
    <h3 class="text-sm font-black text-slate-900">卡片标题</h3>
  </div>
  <p class="text-xs text-slate-550">内容本体...</p>
</div>`,
  },
  {
    title: '⚡ 模态框只读/编辑态绑定控制器（Read/Edit Model Toggles）',
    eyebrow: 'Read/Edit Toggle State',
    desc: '无冲突输入控制：通过 state 驱动 input 与 span 文本双向动态渲染与绑定。',
    code: `<template>
  <input
    v-if="isEditMode"
    v-model="editValue"
    type="text"
    class="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
  />
  <span v-else class="text-xs font-black text-slate-800 font-mono">{{ editValue }}</span>
</template>`,
  },
  {
    title: '📊 汇总图表表头与对齐标准（Performance Tables）',
    eyebrow: 'Performance Table Styles',
    desc: '严谨的报表格线：顶头配置 sticky top-0 bg-slate-900 做高对比度渲染，列头使用 JetBrains Mono 强标小字，右对齐科学指标列。',
    code: `<thead class="sticky top-0 bg-slate-900 text-white select-none text-[10.5px]">
  <tr>
    <th class="px-4 py-3.5 text-left font-sans font-black tracking-wider">渠道列表</th>
    <th class="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">SPENT ($)</th>
    <th class="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">IR (%)</th>
    <th class="px-4 py-3.5 text-right font-mono font-bold tracking-widest uppercase">CPI ($)</th>
  </tr>
</thead>`,
  },
  {
    title: '🛡️ 纯净轻量弹窗遮罩规范（Pure Modal Backdrop Overlay）',
    eyebrow: 'Modal Overlay Styles',
    desc: '无重影、高性能：背景使用黑色75%不透明遮罩，并配置极小值的 backdrop-blur-sm 指令，减少浏览器在复杂图表情况下的运算耗损。',
    code: `<div class="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
  <div class="bg-white rounded-[1.25rem] border border-slate-150 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
    <!-- 弹窗头部 -->
    <!-- 弹窗身体 -->
  </div>
</div>`,
  },
]
const enterAddLogic = "onKeyDown={(e) => { if (e.key === 'Enter') { ... } }}"

const sandboxClass = computed(() => {
  const padding = { sm: 'p-3 gap-3', md: 'p-6 gap-6', lg: 'p-8 gap-8' }[sandboxSize.value]
  const shadow = { none: 'shadow-none', xs: 'shadow-3xs', md: 'shadow-xs', xl: 'shadow-lg' }[sandboxShadow.value]
  return `${padding} ${shadow}`
})
const sandboxCopyClass = computed(() => `border border-slate-150/60 bg-white rounded-2xl ${sandboxClass.value}`)
const accentClass = computed(() => ({
  indigo: 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.35)]',
  slate: 'bg-slate-900',
  emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]',
  rose: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.35)]',
}[sandboxPrimary.value]))

const copyText = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedText.value = label
    window.setTimeout(() => {
      copiedText.value = ''
    }, 1800)
  } catch {
    copiedText.value = '复制失败'
  }
}
</script>

<template>
  <div class="relative min-h-screen space-y-10 pb-40">
    <section class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950 px-10 py-10 text-white shadow-md">
      <div class="pointer-events-none absolute right-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[120px]"></div>
      <div class="pointer-events-none absolute bottom-[-10%] left-[-5%] h-[300px] w-[300px] rounded-full bg-emerald-600/10 blur-[90px]"></div>
      <div class="relative z-10 space-y-4">
        <div class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-indigo-200 backdrop-blur-md">
          <Sparkles class="h-3.5 w-3.5 text-indigo-300" />
          AdPulse Pro Design System
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">UI 和 交互规范沉淀画布</h1>
        <p class="max-w-2xl text-sm leading-relaxed text-slate-400">
          此页签沉淀了 AdPulse Pro 应用上所有模块采用的视觉主格调、布局法则、交互微动效。
          旨在统一设计共识，确保多维看板系统具备极高的易读性、设计诚实度与视觉流畅感。
        </p>
      </div>
    </section>

    <nav class="flex shrink-0 flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-3xs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="`flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="h-4 w-4 shrink-0" />
        {{ tab.label }}
      </button>
    </nav>

    <div v-if="copiedText" class="fixed bottom-10 right-10 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3.5 text-xs font-bold text-white shadow-xl">
      <Check class="h-4 w-4 text-emerald-400" />
      <span>已成功复制 {{ copiedText }} 代码片段到剪贴板！</span>
    </div>

    <section v-if="activeTab === 'tokens'" class="grid grid-cols-1 gap-8 xl:grid-cols-3">
      <div class="space-y-6 xl:col-span-2">
        <article class="space-y-6 rounded-3xl border border-slate-150 bg-white p-6 text-left shadow-3xs">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><Palette class="h-5 w-5 text-indigo-500" />色彩调色盘 (Color Tokens Palette)</h2>
            <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Accent System</span>
          </div>
          <div v-for="(group, groupName) in colors" :key="groupName" class="space-y-3">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">{{ colorGroupLabels[groupName] }}</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div v-for="color in group" :key="color.name" class="flex items-center gap-4 rounded-xl border border-slate-150 bg-slate-50 p-3.5 transition-all hover:border-slate-300">
                <div :class="`h-14 w-14 shrink-0 rounded-2xl border border-black/10 shadow-xs ${color.className}`"></div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-3">
                    <span class="truncate text-xs font-black text-slate-800">{{ color.name }}</span>
                    <span class="rounded border bg-white px-1 font-mono text-[9px] text-slate-500">{{ color.hex }}</span>
                  </div>
                  <p class="mt-1 text-[10.5px] leading-normal text-slate-500">{{ color.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
      <article class="space-y-6 rounded-3xl border border-slate-150 bg-white p-6 text-left shadow-3xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><Type class="h-5 w-5 text-indigo-500" />字重与对齐 (Typography)</h2>
          <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Inter + Mono</span>
        </div>
        <div class="space-y-6">
          <div v-for="spec in textSpecs" :key="spec.level" class="space-y-2 border-b border-slate-100 pb-4 last:border-b-0">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-indigo-600">{{ spec.level }}</span>
              <code class="rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[8.5px] text-rose-500">{{ spec.size }}</code>
            </div>
            <p :class="spec.classes">{{ spec.demo }}</p>
            <p class="text-[10px] font-medium text-slate-400">应用场景: {{ spec.style }}</p>
          </div>
        </div>
      </article>
    </section>

    <section v-else-if="activeTab === 'layouts'" class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <article class="space-y-6 rounded-3xl border border-slate-150 bg-white p-6 text-left shadow-3xs lg:col-span-2">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><LayoutGrid class="h-5 w-5 text-indigo-500" />栅格解构沙盒（Interactive Bento Sandbox）</h2>
          <div class="flex items-center gap-1 rounded-lg border bg-slate-50 px-2 py-1 font-mono text-[10px] uppercase text-slate-400">
            <span>实时模拟</span>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs sm:grid-cols-3">
          <div>
            <label class="mb-2 block font-black text-slate-500">🎈 演示主题配色 (Primary Accents)</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="value in ['indigo', 'slate', 'emerald', 'rose']"
                :key="value"
                type="button"
                :class="`rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${sandboxPrimary === value ? 'border-slate-900 bg-slate-900 text-white shadow-3xs' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'}`"
                @click="sandboxPrimary = value"
              >
                {{ value }}
              </button>
            </div>
          </div>
          <div>
            <label class="mb-2 block font-black text-slate-500">📏 内边距比例 (Sizing Gaps)</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="option in [{ key: 'sm', label: '紧凑 (p-3)' }, { key: 'md', label: '标准 (p-6)' }, { key: 'lg', label: '充沛 (p-8)' }]"
                :key="option.key"
                type="button"
                :class="`rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${sandboxSize === option.key ? 'border-slate-900 bg-slate-900 text-white shadow-3xs' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'}`"
                @click="sandboxSize = option.key"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <div>
            <label class="mb-2 block font-black text-slate-500">🌑 底层投影融合 (Shadow Softness)</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="option in [{ key: 'none', label: '无 shadow' }, { key: 'xs', label: '极弱 (3xs)' }, { key: 'md', label: '轻盈 (xs)' }, { key: 'xl', label: '悬浮 (lg)' }]"
                :key="option.key"
                type="button"
                :class="`rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${sandboxShadow === option.key ? 'border-slate-900 bg-slate-900 text-white shadow-3xs' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'}`"
                @click="sandboxShadow = option.key"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
          <div :class="`flex w-full max-w-lg flex-col rounded-2xl border border-slate-200/60 bg-white text-left transition-all ${sandboxClass}`">
            <div class="flex items-center justify-between border-b border-slate-50 pb-3.5">
              <div class="flex items-center gap-2">
                <span :class="`h-6 w-2.5 rounded-full ${accentClass}`"></span>
                <h3 class="text-sm font-black tracking-tight text-slate-900">创意排期进度</h3>
              </div>
              <span class="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">W20 Schedule</span>
            </div>
            <p class="text-xs font-medium leading-relaxed text-slate-500">正在展示一组经过组件沉淀机制渲染的模块卡片。你可以调整上方调试台，观察间距、阴影与描边状态的呼吸式渲染变化。</p>
            <div class="grid grid-cols-2 gap-2.5">
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-3"><span class="font-mono text-[8.5px] font-bold uppercase tracking-widest text-slate-400">Target ROAS</span><p class="font-mono text-base font-bold text-slate-800">124.5%</p></div>
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-3"><span class="font-mono text-[8.5px] font-bold uppercase tracking-widest text-slate-400">CPI Standards</span><p class="font-mono text-base font-bold text-slate-800">$0.85</p></div>
            </div>
            <div class="flex items-center justify-between border-t border-slate-50 pt-3">
              <span class="font-mono text-[9.5px] font-bold text-indigo-600">Preview Active Style Classes:</span>
              <button type="button" class="inline-flex items-center gap-1 text-[9.5px] font-semibold text-slate-400 hover:text-slate-800" @click="copyText(sandboxCopyClass, 'Sandbox Class')">
                <Copy class="h-3 w-3" />
                复制代码
              </button>
            </div>
          </div>
        </div>
      </article>
      <article class="space-y-5 rounded-3xl border border-slate-150 bg-white p-6 text-left shadow-3xs">
        <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><Layers class="h-5 w-5 text-indigo-500" />空间沉淀法案</h2>
        <div v-for="rule in layoutRules" :key="rule.title" class="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-slate-800">{{ rule.title }}</span>
            <button type="button" class="rounded p-1 text-slate-400 hover:text-indigo-600" title="复制片段" @click="copyText(rule.code, rule.title)"><Copy class="h-3.5 w-3.5" /></button>
          </div>
          <p class="text-[10.5px] font-medium leading-relaxed text-slate-500">{{ rule.desc }}</p>
          <code class="block select-all break-all rounded border bg-white p-1.5 font-mono text-[8.5px] leading-normal text-slate-600">{{ rule.code }}</code>
        </div>
      </article>
    </section>

    <section v-else-if="activeTab === 'controls'" class="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <article class="space-y-6 rounded-3xl border border-slate-150 bg-white p-6 text-left shadow-3xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><Sliders class="h-5 w-5 text-indigo-500" />徽章微标与状态（Status Badges & Forms）</h2>
          <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600">Semantic Standard</span>
        </div>
        <div class="space-y-6">
          <div>
            <h3 class="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">📍 推荐等级/指标评估 (Indicator Badges)</h3>
            <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <div class="flex items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-800">推荐使用 (Recommended)</span>
                  <span class="text-[9.5px] text-slate-400">数据显著表现良好</span>
                </div>
                <span class="flex shrink-0 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700"><CheckCircle2 class="h-3 w-3" />推荐使用</span>
              </div>
              <div class="flex items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-800">不推荐 (Not Recommended)</span>
                  <span class="text-[9.5px] text-slate-400">单价过高、未达标</span>
                </div>
                <span class="flex shrink-0 items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700"><AlertCircle class="h-3 w-3" />不推荐</span>
              </div>
              <div class="flex items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-800">数据不足 (Insufficient)</span>
                  <span class="text-[9.5px] text-slate-400">投产未满周期</span>
                </div>
                <span class="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">数据不足</span>
              </div>
              <div class="flex items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-800">资产分类 (Category Sub)</span>
                  <span class="text-[9.5px] text-slate-400">微型类型标记符</span>
                </div>
                <span class="rounded border border-indigo-200 bg-white px-2.5 py-0.5 font-sans text-[9.5px] font-black text-indigo-700 shadow-3xs">剧情片段-02</span>
              </div>
            </div>
            <p class="mt-2 text-[10px] font-medium text-slate-400">设计备注：微标微动效中，绿灯推荐呼吸效果由 `animate-ping` 与圆圈组合渲染。文字尺寸统一在 9.5px 至 10px。</p>
          </div>
        </div>
      </article>
      <article class="space-y-6 rounded-3xl border border-slate-150 bg-white p-6 text-left shadow-3xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><Eye class="h-5 w-5 text-indigo-500" />按钮、操作项与交互反馈（Action Buttons）</h2>
          <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Interface Elements</span>
        </div>
        <div class="space-y-6">
          <div>
            <h3 class="mb-3.5 text-xs font-black uppercase tracking-widest text-slate-400">⚔️ 按钮规格 (Button Scales)</h3>
            <div class="flex flex-wrap items-center gap-3.5">
              <div class="flex flex-col items-center gap-1.5"><button class="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-xs transition-all hover:-translate-y-px hover:bg-slate-800">主行动点按</button><span class="rounded bg-slate-100 px-1 font-mono text-[8.5px] text-slate-500">Primary</span></div>
              <div class="flex flex-col items-center gap-1.5"><button class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900">次要描边按钮</button><span class="rounded bg-slate-100 px-1 font-mono text-[8.5px] text-slate-500">Secondary</span></div>
              <div class="flex flex-col items-center gap-1.5"><button class="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-2.5 text-xs font-black text-indigo-700 transition-all hover:bg-indigo-100">品牌轻色按钮</button><span class="rounded bg-slate-100 px-1 font-mono text-[8.5px] text-slate-500">Pastel Indigo</span></div>
              <div class="flex flex-col items-center gap-1.5"><button class="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-black text-rose-600 transition-all hover:bg-rose-100">危险警告按钮</button><span class="rounded bg-slate-100 px-1 font-mono text-[8.5px] text-slate-500">Alert Trigger</span></div>
            </div>
          </div>
          <div class="space-y-4 border-t border-slate-100 pt-5">
            <div class="flex items-center justify-between">
              <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-400">📝 表单输入常态与编辑态转换机制</h3>
              <button type="button" class="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-700" @click="sandboxIsEditing = !sandboxIsEditing">模拟点击切换: {{ sandboxIsEditing ? '编辑中 ✏️' : '只读常态 🔒' }}</button>
            </div>
            <div class="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1 block text-[9.5px] font-bold text-slate-400">🌿 资产名称 (Asset Name)</label>
                  <div v-if="sandboxIsEditing" class="space-y-1">
                    <input class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500" value="核心趣味战斗-片段01" placeholder="配置新的名称主标题..." />
                    <p class="text-[9.5px] text-indigo-600">编辑框背景为纯白，描边加厚并赋予 1px 聚焦聚焦高亮框</p>
                  </div>
                  <div v-else class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-100/60 px-2.5 py-1.5 text-xs font-bold text-slate-700"><span>核心趣味战斗-片段01</span><span class="font-mono text-[7.5px] text-slate-400">READONLY</span></div>
                </div>
                <div>
                  <label class="mb-1 block text-[9.5px] font-bold text-slate-400">⏳ 运行周期 (Duration Level)</label>
                  <div v-if="sandboxIsEditing" class="flex gap-1.5 rounded-lg border border-slate-200 bg-white p-1">
                    <button v-for="option in [{ value: '3', label: '00:03 秒极速短叙事' }, { value: '5', label: '00:05 秒精炼黄金前贴' }, { value: '15', label: '00:15 秒深度玩法讲解' }]" :key="option.value" type="button" :class="`flex-1 rounded-md px-2 py-1 text-[10px] font-black ${sandboxDuration === option.value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`" @click="sandboxDuration = option.value">{{ option.label }}</button>
                  </div>
                  <p v-else class="rounded-lg border border-slate-100 bg-slate-100/60 px-2.5 py-1.5 text-xs font-bold text-slate-700">00:05 秒精炼黄金前贴</p>
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-3 border-t border-slate-100 pt-5">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">🎈 标签动态增加器 (Interactive Tags Array editor)</h3>
            <div class="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p class="text-[11px] font-medium leading-normal text-slate-500">当编辑创意标签、关联素材时，使用 <code>Enter</code> 直接注入新的关联符，卡片内元素可随点随删，具备轻巧气泡边缘。</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="tag in ['3D玩法-大招', 'TikTok海外爆款', '高转化ROAS组']" :key="tag" class="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 font-mono text-[9.5px] font-black text-slate-700">{{ tag }}<button class="ml-1 font-bold text-slate-400 hover:text-rose-500" title="仅供模拟">&times;</button></span>
              </div>
              <div class="flex gap-2">
                <input readonly value="按下 Enter 快捷键即刻绑定新的参数..." class="flex-1 rounded border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-400 outline-none" />
                <button class="rounded bg-slate-900 px-3 py-1 text-[10px] font-black text-white" @click="copyText(enterAddLogic, 'Enter Add logic')">复制逻辑</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section v-else-if="activeTab === 'ratios'" class="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-3xs">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><Film class="h-5 w-5 text-indigo-500" />资源多维媒体比例与背板模糊 (Media Ratio Adapter)</h2>
        <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Multi-Grid Layout</span>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
        <article v-for="ratio in ratioCards" :key="ratio.title" class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-slate-800">{{ ratio.title }}</span>
            <code class="rounded bg-indigo-50 p-0.5 font-mono text-[8px] text-indigo-600">{{ ratio.ratio }}</code>
          </div>
          <div :class="`relative mx-auto flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 ${ratio.ratio} ${ratio.ratio === 'aspect-[9/16]' ? 'h-[300px]' : ratio.ratio === 'aspect-video' ? 'mt-20 h-[130px]' : ratio.ratio === 'aspect-square' ? 'mt-14 h-[170px]' : 'mt-10 h-[200px]'}`">
            <div class="absolute inset-0 z-[5] bg-gradient-to-t from-black/85 via-black/10 to-black/30"></div>
            <div class="z-10 space-y-1 p-3 text-center text-white">
              <component :is="ratio.icon" class="mx-auto h-5 w-5 text-indigo-400" />
              <span class="block font-mono text-[10px] font-bold">{{ ratio.title.includes('9:16') ? '1080 x 1920' : ratio.title.includes('16:9') ? '1920 x 1080' : ratio.title.includes('1:1') ? '1000 x 1000' : '1200 x 1500' }}</span>
              <span class="block text-[8.5px] font-medium text-slate-400">{{ ratio.desc }}</span>
            </div>
          </div>
        </article>
      </div>
      <div class="grid grid-cols-1 items-center gap-6 border-t border-slate-100 pt-6 lg:grid-cols-2">
        <div class="space-y-3.5">
          <h3 class="border-l-4 border-indigo-500 pl-3 text-sm font-black text-slate-900">🖼️ 双层模糊背景渲染技术 (Blur Dual-Layer Wrapper)</h3>
          <p class="text-xs font-semibold leading-relaxed text-slate-500">
            我们摒弃了普通的单色背景板，而是利用双层影像叠合：底层采用 <code>scale-155 filter blur-2xl opacity-15 pointer-events-none</code> 形成迷蒙的色彩氤氲，中高阶将正文缩略图贴合底层渲染，完美融合物理视频四周的突兀虚色，营造极致的光影环绕感。
          </p>
          <code class="block select-all rounded border bg-slate-50 p-2.5 font-mono text-[9px] leading-relaxed text-slate-600">
            &lt;div class="absolute inset-0 opacity-15 filter blur-2xl scale-155"&gt;...&lt;/div&gt;
          </code>
        </div>
        <div class="relative flex h-[160px] items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-lg">
          <div class="absolute inset-0 scale-150 bg-indigo-600/60 opacity-25 blur-2xl"></div>
          <div class="relative z-10 space-y-2 text-center text-white">
            <span class="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-black backdrop-blur-md">Live Blurred Backdrop Container</span>
            <p class="text-[10px] text-slate-300">底层通过渲染紫色块并应用 2xl 高斯模糊实现</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="space-y-6 text-left">
      <div class="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-3xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="flex items-center gap-2 text-xl font-black text-slate-900"><Code class="h-5 w-5 text-indigo-500" />组件及交互逻辑代码速查面板 (Reusable Design Patterns & Code Clips)</h2>
          <span class="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Copy Hub</span>
        </div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article v-for="snippet in snippets" :key="snippet.title" class="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div class="space-y-2">
              <span class="block text-[11px] font-black uppercase tracking-wide text-indigo-600">💿 {{ snippet.title }}</span>
              <p class="text-[11px] font-medium text-slate-500">{{ snippet.desc }}</p>
            </div>
            <div class="relative mt-4">
              <pre class="max-h-48 select-all overflow-x-auto whitespace-pre-wrap rounded-lg border bg-white p-3 font-mono text-[8.5px] leading-relaxed text-slate-700"><code>{{ snippet.code }}</code></pre>
              <button
                type="button"
                class="absolute right-2 top-2 rounded border border-slate-200 bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title="复制代码"
                @click="copyText(snippet.code, snippet.eyebrow)"
              >
                <Copy class="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
