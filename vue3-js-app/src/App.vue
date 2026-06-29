<script setup>
import { ref } from 'vue'
import Layout from './components/Layout.vue'
import AssetLibrary from './components/AssetLibrary.vue'
import Benchmark from './components/Benchmark.vue'
import ConsumptionData from './components/ConsumptionData.vue'
import CreativeAnalysis from './components/CreativeAnalysis.vue'
import IterationRecord from './components/IterationRecord.vue'
import MaterialDetails from './components/MaterialDetails.vue'
import Overview from './components/Overview.vue'
import RecoveryData from './components/RecoveryData.vue'
import RequirementCenter from './components/RequirementCenter.vue'
import TagManagement from './components/TagManagement.vue'
import UiSpecification from './components/UiSpecification.vue'
import { MainModule, Page } from './constants'

const activeModule = ref(MainModule.REQUIREMENT_CENTER)
const currentPage = ref(Page.OVERVIEW)
const requirementSubView = ref('coordinated')
void CreativeAnalysis
void MaterialDetails
</script>

<template>
  <Layout
    :active-module="activeModule"
    :current-page="currentPage"
    :requirement-sub-view="requirementSubView"
    @module-navigate="activeModule = $event"
    @page-navigate="currentPage = $event"
    @requirement-sub-view-change="requirementSubView = $event"
  >
    <RequirementCenter
      v-if="activeModule === MainModule.REQUIREMENT_CENTER"
      :sub-view="requirementSubView"
      @sub-view-change="requirementSubView = $event"
    />
    <UiSpecification
      v-else-if="activeModule === MainModule.UI_SPECIFICATION"
    />
    <TagManagement
      v-else-if="activeModule === MainModule.TAG_MANAGEMENT"
    />
    <IterationRecord
      v-else-if="activeModule === MainModule.ITERATION_RECORD"
    />
    <AssetLibrary
      v-else-if="activeModule === MainModule.ASSET_LIBRARY"
    />
    <Overview
      v-else-if="activeModule === MainModule.DATA_ANALYSIS && currentPage === Page.OVERVIEW"
    />
    <RecoveryData
      v-else-if="activeModule === MainModule.DATA_ANALYSIS && currentPage === Page.RECOVERY_DATA"
    />
    <ConsumptionData
      v-else-if="activeModule === MainModule.DATA_ANALYSIS && currentPage === Page.CONSUMPTION_DATA"
    />
    <Benchmark
      v-else-if="activeModule === MainModule.DATA_ANALYSIS && currentPage === Page.BENCHMARK"
    />
    <div
      v-else-if="activeModule === MainModule.DATA_ANALYSIS"
      class="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 text-sm font-bold text-slate-400"
    >
      未识别的数据分析页面：{{ currentPage }}
    </div>
  </Layout>
</template>
