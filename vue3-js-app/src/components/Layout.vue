<script setup>
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  ClipboardList,
  Database,
  LayoutDashboard,
  Layers,
  Palette,
  PieChart,
  Settings,
  Tags,
  Upload,
} from 'lucide-vue-next'
import ResizableSidebar from './ResizableSidebar.vue'
import { MainModule, Page } from '../constants'

defineProps({
  activeModule: {
    type: String,
    required: true,
  },
  currentPage: {
    type: String,
    required: true,
  },
  requirementSubView: {
    type: String,
    default: 'coordinated',
  },
})

const emit = defineEmits(['module-navigate', 'page-navigate', 'requirement-sub-view-change'])

const analysisNavItems = [
  { id: Page.OVERVIEW, label: '总览看板', icon: LayoutDashboard },
  { id: Page.RECOVERY_DATA, label: '回收数据', icon: Activity },
  { id: Page.CONSUMPTION_DATA, label: '消耗数据', icon: PieChart },
  { id: Page.BENCHMARK, label: 'Benchmark', icon: Layers },
]

const requirementNavItems = [
  { id: 'coordinated', label: '协同看板', icon: Layers },
  { id: 'production', label: '制作排期', icon: Calendar },
  { id: 'list', label: '需求大表', icon: ClipboardList },
  { id: 'upload', label: '素材上传', icon: Upload },
]
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <header class="z-30 flex h-14 shrink-0 items-center justify-between gap-3 bg-slate-900 px-4 text-white lg:px-6">
      <div class="flex min-w-0 items-center gap-4 lg:gap-8">
        <div class="mr-1 flex shrink-0 items-center gap-2 lg:mr-4">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <BarChart3 class="h-4 w-4 text-white" />
          </div>
          <span class="text-xl font-black tracking-tight">AdPulse Pro</span>
        </div>

        <nav class="flex h-full min-w-0 items-center overflow-x-auto no-scrollbar">
          <button
            v-for="item in [
              { id: MainModule.REQUIREMENT_CENTER, label: '需求中心', icon: ClipboardList },
              { id: MainModule.ASSET_LIBRARY, label: '资产库', icon: Database },
              { id: MainModule.ITERATION_RECORD, label: '迭代记录', icon: Activity },
              { id: MainModule.DATA_ANALYSIS, label: '数据分析', icon: Database },
              { id: MainModule.TAG_MANAGEMENT, label: '标签管理', icon: Tags },
              { id: MainModule.UI_SPECIFICATION, label: '规范画布', icon: Palette },
            ]"
            :key="item.id"
            :class="`flex h-14 shrink-0 items-center gap-2.5 border-b-2 px-3 text-sm font-black transition-all lg:px-5 xl:px-6 ${
              activeModule === item.id
                ? 'border-primary bg-white/5 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`"
            type="button"
            @click="emit('module-navigate', item.id)"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </button>
        </nav>
      </div>

      <div class="flex shrink-0 items-center gap-3 lg:gap-4">
        <button class="p-2 text-slate-400 hover:text-white" type="button">
          <Settings class="h-4 w-4" />
        </button>
        <div class="h-6 w-px bg-slate-700" />
        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="text-xs font-black leading-none">何思乔</p>
            <p class="text-[9.5px] font-bold text-slate-500">Super User</p>
          </div>
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">何</div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <ResizableSidebar
        v-if="activeModule === MainModule.DATA_ANALYSIS || activeModule === MainModule.REQUIREMENT_CENTER"
        :title="activeModule === MainModule.DATA_ANALYSIS ? '数据分析' : '需求管理中心'"
        :subtitle="activeModule === MainModule.DATA_ANALYSIS ? 'Analysis Hub' : 'Requirement Hub'"
        :icon="activeModule === MainModule.DATA_ANALYSIS ? BarChart3 : ClipboardList"
        :storage-key="activeModule === MainModule.DATA_ANALYSIS ? 'layout:data-sidebar' : 'layout:requirement-sidebar'"
        :default-width="240"
        :min-width="196"
        :max-width="360"
      >
        <template #default="{ collapsed }">
          <nav v-if="activeModule === MainModule.DATA_ANALYSIS" class="space-y-1">
            <button
              v-for="item in analysisNavItems"
              :key="item.id"
              :class="`group relative flex w-full items-center rounded-xl text-xs font-black transition-all ${
                collapsed ? 'h-10 justify-center px-0' : 'justify-between px-3 py-2.5'
              } ${
                currentPage === item.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`"
              :title="item.label"
              type="button"
              @click="emit('page-navigate', item.id)"
            >
              <div :class="`flex items-center ${collapsed ? 'justify-center' : ''}`">
                <component :is="item.icon" :class="`h-4 w-4 shrink-0 ${collapsed ? '' : 'mr-3'} ${currentPage === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`" />
                <span v-if="!collapsed">{{ item.label }}</span>
              </div>
              <span
                v-if="collapsed"
                class="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50 -translate-y-1/2 translate-x-0 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-black text-white opacity-0 shadow-xl ring-1 ring-black/5 transition-all group-hover:translate-x-1 group-hover:opacity-100"
              >
                {{ item.label }}
              </span>
              <ChevronRight v-if="!collapsed && currentPage === item.id" class="h-3.5 w-3.5 opacity-50" />
            </button>
          </nav>

          <nav v-if="activeModule === MainModule.REQUIREMENT_CENTER" class="space-y-1">
            <button
              v-for="item in requirementNavItems"
              :key="item.id"
              :class="`group relative flex w-full items-center rounded-xl text-xs font-bold transition-all ${
                collapsed ? 'h-10 justify-center px-0' : 'justify-between px-3 py-2'
              } ${
                requirementSubView === item.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`"
              :title="item.label"
              type="button"
              @click="emit('requirement-sub-view-change', item.id)"
            >
              <div :class="`flex items-center ${collapsed ? 'justify-center' : ''}`">
                <component :is="item.icon" :class="`h-3.5 w-3.5 shrink-0 ${collapsed ? '' : 'mr-3'} ${requirementSubView === item.id ? 'text-white' : 'text-slate-450 group-hover:text-slate-600'}`" />
                <span v-if="!collapsed">{{ item.label }}</span>
              </div>
              <span
                v-if="collapsed"
                class="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50 -translate-y-1/2 translate-x-0 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-black text-white opacity-0 shadow-xl ring-1 ring-black/5 transition-all group-hover:translate-x-1 group-hover:opacity-100"
              >
                {{ item.label }}
              </span>
              <ChevronRight v-if="!collapsed && requirementSubView === item.id" class="h-3 w-3 opacity-50" />
            </button>
          </nav>
        </template>
      </ResizableSidebar>

      <main :class="`min-w-0 flex-1 overflow-y-auto bg-slate-50 no-scrollbar ${activeModule === MainModule.ASSET_LIBRARY ? 'p-0' : 'p-4 lg:p-6'}`">
        <slot />
      </main>
    </div>
  </div>
</template>
