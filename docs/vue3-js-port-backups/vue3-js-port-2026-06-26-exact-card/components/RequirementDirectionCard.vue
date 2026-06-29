<script setup>
import { computed } from 'vue'
import AdStatusTag from './AdStatusTag.vue'

const props = defineProps({
  schedule: {
    type: Object,
    required: true,
  },
  requirements: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['edit', 'add-requirement', 'open-detail'])

const formLabelMap = {
  Video: '视频',
  Image: '图片',
  Playable: '试玩',
}

const formToneMap = {
  Video: 'rose',
  Image: 'amber',
  Playable: 'indigo',
}

const broadDirectionToneMap = {
  '3D玩法': 'violet',
  '大字报': 'rose',
  '原始玩法': 'neutral',
}

const materialStageToneMap = {
  '新': 'emerald',
  '迭': 'indigo',
  '老': 'neutral',
}

const priorityToneMap = {
  Highest: 'rose',
  High: 'orange',
  Mid: 'amber',
  Low: 'emerald',
}

const priorityLabelMap = {
  Highest: '最高',
  High: '高',
  Mid: '中',
  Low: '低',
}

const scenarioLabelMap = {
  Standard: '通投',
  ASO: 'ASO',
  Localized: '本地化',
}

const scenarioToneMap = {
  Standard: 'neutral',
  ASO: 'amber',
  Localized: 'blue',
}

const cardTitleClass = computed(() => {
  const priority = props.schedule.priority

  if (priority === 'Highest') return 'is-highest'
  if (priority === 'High') return 'is-high'
  if (priority === 'Low') return 'is-low'
  return ''
})

const completedCount = computed(() =>
  props.requirements.filter((item) => item.prodStatus === 'Completed').length,
)

const productionPercent = computed(() => {
  const total = props.requirements.length
  return total > 0 ? Math.round((completedCount.value / total) * 100) : 0
})

const approvedCount = computed(() =>
  props.requirements.filter((item) => item.reqStatus === 'Approved').length,
)

const pendingCount = computed(() =>
  props.requirements.filter(
    (item) => item.reqStatus === 'Pending' || item.reqStatus === 'Modification',
  ).length,
)

const unsubmittedCount = computed(() =>
  Math.max(0, Number(props.schedule.totalRequiredCount || 1) - approvedCount.value - pendingCount.value),
)

const approvedPercent = computed(() => {
  const total = Number(props.schedule.totalRequiredCount || 1)
  return Math.min(100, (approvedCount.value / total) * 100)
})

const pendingPercent = computed(() => {
  const total = Number(props.schedule.totalRequiredCount || 1)
  return Math.min(100 - approvedPercent.value, (pendingCount.value / total) * 100)
})

const submissionReviewPercent = computed(() => {
  const total = Number(props.schedule.totalRequiredCount || 1)
  return Math.min(100, Math.round(((approvedCount.value + pendingCount.value) / total) * 100))
})

const inProgressCount = computed(() =>
  props.requirements.filter((item) => item.prodStatus === 'InProgress').length,
)

const scheduledCount = computed(() =>
  props.requirements.filter((item) => item.prodStatus === 'Scheduled' || !item.prodStatus).length,
)

const completedPercent = computed(() => {
  const total = props.requirements.length
  return total > 0 ? (completedCount.value / total) * 100 : 0
})

const inProgressPercent = computed(() => {
  const total = props.requirements.length
  return total > 0 ? (inProgressCount.value / total) * 100 : 0
})

const visibleRequirements = computed(() => props.requirements.slice(0, 3))

const hiddenRequirementCount = computed(() =>
  Math.max(0, props.requirements.length - visibleRequirements.value.length),
)

const channelText = computed(() => {
  const channels = props.schedule.channels || []
  return channels.length > 0 ? channels[0].toUpperCase() : 'ALL'
})

const openDetail = () => {
  emit('open-detail', props.schedule)
}

const getRequirementBaseId = (id) => String(id || '').split('-')[0]

const getRequirementClass = (req) => {
  if (req.prodStatus === 'Completed') return 'is-completed'
  if (req.prodStatus === 'InProgress') return 'is-progressing'
  return ''
}
</script>

<template>
  <article class="ad-direction-card is-group" @click="openDetail">
    <div class="ad-card-topline">
      <div class="ad-pill-row">
        <AdStatusTag :tone="formToneMap[schedule.form] || 'neutral'" :label="formLabelMap[schedule.form] || '视频'" />
        <AdStatusTag :tone="broadDirectionToneMap[schedule.broadDirection] || 'neutral'" :label="schedule.broadDirection || '原始玩法'" />
        <AdStatusTag :tone="materialStageToneMap[schedule.materialStage] || 'neutral'" :label="`#${schedule.materialStage || '新'}`" />
      </div>

      <div class="ad-pill-row">
        <AdStatusTag :tone="priorityToneMap[schedule.priority] || 'amber'" :label="priorityLabelMap[schedule.priority] || '中'" />
        <button class="ad-action-pill" type="button" @click.stop="emit('edit', schedule)">
          编辑
        </button>
      </div>
    </div>

    <div class="ad-title-box" :class="cardTitleClass">
      <h3 class="ad-card-title" :title="schedule.directionName">
        {{ schedule.directionName || '未命名方向' }}
      </h3>
    </div>

    <div class="ad-goal-box">
      <span class="ad-goal-dot" />
      <p class="ad-goal-text" :title="schedule.validationGoal">
        {{ schedule.validationGoal || '暂无验证假说或检验目标...' }}
      </p>
    </div>

    <div class="ad-meta-grid">
      <div class="ad-meta-item">
        <span class="ad-meta-label">负责:</span>
        <span class="ad-meta-value">{{ schedule.owner || '未指派' }}</span>
      </div>
      <div class="ad-meta-item">
        <span class="ad-meta-label">场景:</span>
        <AdStatusTag :tone="scenarioToneMap[schedule.scenario] || 'neutral'" :label="scenarioLabelMap[schedule.scenario] || '通投'" />
      </div>
      <div class="ad-meta-item is-wide">
        <span class="ad-meta-label">渠道:</span>
        <span class="ad-meta-value" :title="channelText">{{ channelText }}</span>
      </div>
      <div class="ad-meta-item">
        <span class="ad-meta-label">初版:</span>
        <span class="ad-meta-value">{{ schedule.acceptanceDate || '--' }}</span>
      </div>
      <div class="ad-meta-item">
        <span class="ad-meta-label">截止:</span>
        <span class="ad-meta-value">{{ schedule.submissionDeadline || '--' }}</span>
      </div>
    </div>

    <div class="ad-progress-stack">
      <section class="ad-progress-panel">
        <div class="ad-progress-head">
          <span class="ad-progress-label">
            <span class="ad-progress-dot" />
            1. 需求提交进度
            <span class="ad-meta-label">
              有效: <strong>{{ schedule.validCount || 0 }}</strong> | 总: <strong>{{ schedule.totalRequiredCount || 0 }}</strong>
            </span>
          </span>
          <span class="ad-progress-value">{{ submissionReviewPercent }}%</span>
        </div>
        <div class="ad-progress-track is-segmented" :title="`审核通过: ${approvedCount} | 待审核: ${pendingCount} | 未提交: ${unsubmittedCount}`">
          <div v-if="approvedPercent > 0" class="ad-progress-fill is-completed" :style="{ width: `${approvedPercent}%` }" />
          <div v-if="pendingPercent > 0" class="ad-progress-fill is-pending" :style="{ width: `${pendingPercent}%` }" />
        </div>
        <div class="ad-progress-legend">
          <span class="ad-progress-legend-item"><span class="ad-legend-dot" />未提交:{{ unsubmittedCount }}</span>
          <span class="ad-progress-legend-item"><span class="ad-legend-dot is-pending" />待审核:{{ pendingCount }}</span>
          <span class="ad-progress-legend-item"><span class="ad-legend-dot is-approved" />审核通过:{{ approvedCount }}</span>
        </div>
      </section>

      <section class="ad-progress-panel">
        <div class="ad-progress-head">
          <span class="ad-progress-label">
            <span class="ad-progress-dot is-completed" />
            2. 制作完成进度
            <span v-if="schedule.insightStatus" class="ad-insight-pill ad-pill-amber">{{ schedule.insightStatus }}</span>
            <span v-if="schedule.completedNotLaunched" class="ad-insight-pill ad-pill-emerald">可打包 {{ schedule.completedNotLaunched }}</span>
          </span>
          <span class="ad-progress-value">{{ productionPercent }}%</span>
        </div>
        <div class="ad-progress-track is-segmented" :title="`未开始: ${scheduledCount} | 进行中: ${inProgressCount} | 已完成: ${completedCount}`">
          <div v-if="completedPercent > 0" class="ad-progress-fill is-completed" :style="{ width: `${completedPercent}%` }" />
          <div v-if="inProgressPercent > 0" class="ad-progress-fill is-progressing" :style="{ width: `${inProgressPercent}%` }" />
        </div>
        <div class="ad-progress-legend">
          <span class="ad-progress-legend-item"><span class="ad-legend-dot" />未开始:{{ scheduledCount }}</span>
          <span class="ad-progress-legend-item"><span class="ad-legend-dot is-progressing" />进行中:{{ inProgressCount }}</span>
          <span class="ad-progress-legend-item"><span class="ad-legend-dot is-completed" />已完成:{{ completedCount }}</span>
        </div>
      </section>

      <div class="ad-related-strip">
        <div class="ad-related-list" aria-label="关联需求">
          <span
            v-for="req in visibleRequirements"
            :key="req.id"
            class="ad-related-id"
            :class="getRequirementClass(req)"
            :title="`${req.id} (${req.name || '未命名需求'})`"
          >
            {{ getRequirementBaseId(req.id) }}
          </span>
          <span v-if="hiddenRequirementCount > 0" class="ad-related-more">
            +{{ hiddenRequirementCount }}
          </span>
          <span v-if="requirements.length === 0" class="ad-meta-label">暂无关联需求</span>
        </div>

        <button class="ad-primary-button" type="button" @click.stop="emit('add-requirement', schedule.id)">
          新建需求
        </button>
      </div>
    </div>

    <button class="ad-delete-button" type="button" title="删除此方向" @click.stop>
      ×
    </button>
  </article>
</template>
