<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { CheckCircle2, Clock, Copy, Plus, X } from 'lucide-vue-next'
import AnalyticsSelect from './analytics/AnalyticsSelect.vue'
import { generateBenchmarkData } from '../services/mockData'

const channels = ['All', 'applovin_int', 'Facebook', 'Google', 'TikTok', 'Unity', 'IronSource'].map((value) => ({ value, label: value }))
const platforms = ['Android', 'iOS', '全部'].map((value) => ({ value, label: value }))
const tableHeaders = [
  { label: '渠道' },
  { label: 'Platform' },
  { label: '状态' },
  { label: '生效时间' },
  { label: 'CPI', className: 'text-center' },
  { label: 'CPA7', className: 'text-center' },
  { label: 'ROI7', className: 'text-center' },
  { label: '付费率', className: 'text-center' },
  { label: '付费用户', className: 'text-center' },
  { label: 'ARPPU7', className: 'text-center' },
  { label: '新增(付费)', className: 'text-center' },
  { label: '新增(回收)', className: 'text-center' },
  { label: '修改时间' },
  { label: '操作', className: 'text-right' },
]
const primaryMetricFields = [
  ['cpi', 'CPI (Float)', '0.01'],
  ['cpa7', 'CPA7 (Float)', '0.01'],
  ['roi7', 'ROI7 (%)', '0.1'],
]
const paymentMetricFields = [
  ['payRate', '付费率 (%)', '0.1'],
  ['paidUsers', '付费用户数 (Int)', '1'],
  ['arppu7', 'ARPPU7', '0.01'],
]
const rules = ref(generateBenchmarkData())
const isModalOpen = ref(false)
const editingRule = ref(null)
const formError = ref('')
const statusClock = ref(Date.now())
let statusIntervalId = null

const statusResolvedRules = computed(() => {
  const now = new Date(statusClock.value)
  const groups = rules.value.reduce((result, rule) => {
    const key = `${rule.channel}__${rule.platform}`
    if (!result[key]) result[key] = []
    result[key].push(rule)
    return result
  }, {})
  return rules.value.map((rule) => {
    const activeRule = (groups[`${rule.channel}__${rule.platform}`] || [])
      .filter((item) => new Date(item.effectiveTime.replace(' ', 'T')) <= now)
      .sort((a, b) => new Date(b.effectiveTime.replace(' ', 'T')).getTime() - new Date(a.effectiveTime.replace(' ', 'T')).getTime())[0]
    return { ...rule, status: activeRule && activeRule.id === rule.id ? 'active' : 'expired' }
  })
})

const sortedRules = computed(() =>
  [...statusResolvedRules.value].sort((a, b) => {
    const dateA = new Date((a.modifiedTime || '').replace(' ', 'T')).getTime() || 0
    const dateB = new Date((b.modifiedTime || '').replace(' ', 'T')).getTime() || 0
    return dateB - dateA
  }),
)

const emptyRule = () => ({
  channel: 'All',
  platform: 'Android',
  effectiveTime: '',
  cpi: 0,
  cpa7: 0,
  roi7: 0,
  payRate: 0,
  paidUsers: 0,
  arppu7: 0,
  newUsersPaid: 0,
  newUsersRecovery: 0,
})

const openCreate = () => {
  editingRule.value = emptyRule()
  formError.value = ''
  isModalOpen.value = true
}

const copyRule = (rule) => {
  const { id, status, modifiedTime, ...rest } = rule
  editingRule.value = { ...rest, effectiveTime: '' }
  formError.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingRule.value = null
  formError.value = ''
}

const updateField = (field, value) => {
  editingRule.value = { ...editingRule.value, [field]: value }
}

const numberField = (field, value, integer = false) => {
  if (value === '') {
    updateField(field, '')
    return
  }
  updateField(field, integer ? Number.parseInt(value, 10) : Number.parseFloat(value))
}

const submitRule = () => {
  if (!editingRule.value) return
  const requiredFields = ['channel', 'platform', 'effectiveTime', 'cpi', 'cpa7', 'roi7', 'payRate', 'paidUsers', 'newUsersPaid', 'newUsersRecovery']
  const isAnyEmpty = requiredFields.some((field) => editingRule.value[field] === undefined || editingRule.value[field] === '' || editingRule.value[field] === null || Number.isNaN(editingRule.value[field]))
  if (isAnyEmpty) {
    formError.value = '请填写所有必填字段'
    return
  }
  const effectiveDate = new Date(editingRule.value.effectiveTime.replace(' ', 'T'))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (effectiveDate < today) {
    formError.value = '生效时间必须为今天或今天以后的时间'
    return
  }
  const modifiedTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '-')
  rules.value = [
    ...rules.value,
    {
      ...editingRule.value,
      id: Math.random().toString(36).slice(2, 11),
      status: 'expired',
      modifiedTime,
    },
  ]
  closeModal()
}

onMounted(() => {
  statusIntervalId = window.setInterval(() => {
    statusClock.value = Date.now()
  }, 60000)
})

onBeforeUnmount(() => {
  if (statusIntervalId !== null) {
    window.clearInterval(statusIntervalId)
    statusIntervalId = null
  }
})
</script>

<template>
  <div class="space-y-6 pb-10">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Benchmark 管理</h1>
        <p class="mt-1 text-sm text-slate-500">设置不同渠道的投放基准值与生效规则</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
        @click="openCreate"
      >
        <Plus class="h-4 w-4" />
        新建规则
      </button>
    </div>

    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
              <th
                v-for="head in tableHeaders"
                :key="head.label"
                :class="`whitespace-nowrap px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${head.className || ''}`"
              >
                {{ head.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="rule in sortedRules" :key="rule.id" class="group transition-colors hover:bg-slate-50/50">
              <td class="px-6 py-4"><span class="text-sm font-bold text-slate-900">{{ rule.channel }}</span></td>
              <td class="px-6 py-4"><span class="text-sm font-medium text-slate-600">{{ rule.platform }}</span></td>
              <td class="px-6 py-4">
                <div :class="`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${rule.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`">
                  <CheckCircle2 v-if="rule.status === 'active'" class="h-3 w-3" />
                  <Clock v-else class="h-3 w-3" />
                  {{ rule.status === 'active' ? '生效中' : '已失效' }}
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-xs font-medium text-slate-600">{{ rule.effectiveTime }}</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">${{ rule.cpi.toFixed(2) }}</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">${{ rule.cpa7.toFixed(2) }}</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">{{ rule.roi7 }}%</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">{{ rule.payRate }}%</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">{{ rule.paidUsers }}</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">{{ rule.arppu7 == null ? '$—' : `$${rule.arppu7.toFixed(2)}` }}</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">{{ rule.newUsersPaid }}</td>
              <td class="px-6 py-4 text-center text-xs font-mono text-slate-600">{{ rule.newUsersRecovery }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-[10px] font-medium text-slate-400">{{ rule.modifiedTime }}</td>
              <td class="px-6 py-4 text-right">
                <button type="button" class="rounded-lg p-2 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600" title="复制规则" @click="copyRule(rule)">
                  <Copy class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="isModalOpen && editingRule" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div class="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <h2 class="text-xl font-bold text-slate-900">新建 Benchmark 规则</h2>
          <button type="button" class="text-slate-400 transition-colors hover:text-slate-600" @click="closeModal">
            <X class="h-6 w-6" />
          </button>
        </div>
        <form class="max-h-[calc(90vh-96px)] space-y-6 overflow-y-auto p-8" @submit.prevent="submitRule">
          <p v-if="formError" class="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{{ formError }}</p>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <label class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">渠道</span>
              <AnalyticsSelect :model-value="editingRule.channel" :options="channels" @update:model-value="updateField('channel', $event)" />
            </label>
            <label class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Platform</span>
              <AnalyticsSelect :model-value="editingRule.platform" :options="platforms" @update:model-value="updateField('platform', $event)" />
            </label>
            <label class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">生效时间 (北京时间)</span>
              <input
                type="datetime-local"
                step="3600"
                :value="editingRule.effectiveTime?.replace(' ', 'T')"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                @input="updateField('effectiveTime', $event.target.value.replace('T', ' '))"
              />
            </label>
          </div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <label v-for="field in primaryMetricFields" :key="field[0]" class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ field[1] }}</span>
              <input
                type="number"
                :step="field[2]"
                :value="editingRule[field[0]] ?? ''"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                @input="numberField(field[0], $event.target.value)"
              />
            </label>
          </div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <label v-for="field in paymentMetricFields" :key="field[0]" class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ field[1] }}</span>
              <input
                type="number"
                :step="field[2]"
                :value="editingRule[field[0]] ?? ''"
                :placeholder="field[0] === 'arppu7' ? '可为空' : ''"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                @input="field[0] === 'arppu7' && $event.target.value === '' ? updateField('arppu7', null) : numberField(field[0], $event.target.value, field[0] === 'paidUsers')"
              />
            </label>
          </div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">新增(付费标准)</span>
              <input
                type="number"
                :value="editingRule.newUsersPaid"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                @input="numberField('newUsersPaid', $event.target.value, true)"
              />
            </label>
          </div>
          <div class="grid grid-cols-1 gap-6">
            <label class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">新增用户数 (回收标准)</span>
              <input
                type="number"
                :value="editingRule.newUsersRecovery"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                @input="numberField('newUsersRecovery', $event.target.value, true)"
              />
            </label>
          </div>
          <div class="flex items-center justify-end gap-4 pt-4">
            <button type="button" class="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 transition-all hover:bg-slate-100" @click="closeModal">取消</button>
            <button type="submit" class="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">提交保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
