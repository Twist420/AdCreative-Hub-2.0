<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Layers, Save, Trash2, X } from 'lucide-vue-next'
import ClipUploadModal from '../requirement-detail/ClipUploadModal.vue'
import RequirementClipPanel from '../requirement-detail/RequirementClipPanel.vue'
import RequirementSchedulePanel from '../requirement-detail/RequirementSchedulePanel.vue'
import RequirementScriptWorkbench from '../requirement-detail/RequirementScriptWorkbench.vue'
import SubVersionsModal from '../requirement-detail/SubVersionsModal.vue'
import {
  BROAD_DIRECTIONS,
  CHANNEL_OPTIONS,
  CREATIVE_PEOPLE,
  DIMENSIONS_LIST,
  getAssetTypeLabel,
  getDefaultSubVersions,
  getFolderFormatName,
  getPersonAvatarUrl,
  LANGUAGES,
  MATERIAL_STAGES,
  normalizeDimensionLabel,
} from '../requirement-detail/detailUtils'

const props = defineProps({
  requirement: {
    type: Object,
    required: true,
  },
  schedule: {
    type: Object,
    default: null,
  },
  productionScheduleContext: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'delete', 'update'])

const activeTab = ref('script')
const rightTab = ref('schedule')
const copiedText = ref('')
const toastMessage = ref('')
const creativeMenuOpen = ref(false)
const configMenuOpen = ref('')
const detailRootRef = ref(null)
const showSubVersionsModal = ref(false)
const showClipUploadModal = ref(false)
const showDeleteConfirm = ref(false)

const subVersions = computed(() => getDefaultSubVersions(props.requirement))
const folderName = computed(() => getFolderFormatName(props.requirement))
const creativeOptions = computed(() => Array.from(new Set([props.requirement.creativePersonnel, ...CREATIVE_PEOPLE].filter(Boolean))))
const previewDimensions = computed(() => Array.from(new Set((props.requirement.dimensions || ['916']).map(normalizeDimensionLabel))))

const showToast = (message) => {
  toastMessage.value = message
  window.setTimeout(() => {
    if (toastMessage.value === message) toastMessage.value = ''
  }, 1600)
}

const updateRequirement = (nextRequirementOrUpdates) => {
  if (nextRequirementOrUpdates?.id) {
    emit('update', nextRequirementOrUpdates)
    return
  }
  emit('update', { ...props.requirement, ...nextRequirementOrUpdates })
}

const saveRequirement = () => {
  emit('update', props.requirement)
  showToast('✍️ 需求更改已成功保存！')
}

const saveAndClose = () => {
  emit('update', props.requirement)
  showToast('💾 保存成功，正在关闭弹窗...')
  window.setTimeout(() => emit('close'), 1000)
}

const confirmDelete = () => {
  showDeleteConfirm.value = false
  showToast('需求已成功删除')
  window.setTimeout(() => {
    emit('delete', { id: props.requirement.id, skipConfirm: true })
    emit('close')
  }, 1200)
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedText.value = text
    showToast('📋 已成功复制到剪贴板！')
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      copiedText.value = text
      showToast('📋 已成功复制到剪贴板！')
    } catch {
      showToast('当前浏览器不支持自动复制')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

const updateMultiValue = (key, value) => {
  const currentValues = Array.isArray(props.requirement[key]) ? props.requirement[key] : []
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value]
  updateRequirement({ [key]: nextValues })
}

const updateBroadDirection = (value) => {
  updateRequirement({
    broadDirection: value,
    channels: value === '大字报' ? ['apl'] : props.requirement.channels,
  })
}

const getOptionName = (options, id) => options.find((option) => option.id === id)?.name || id

const getDropdownDisplay = (value, options, isMulti = false) => {
  if (!isMulti) return getOptionName(options, value) || value || '未选择'
  const values = Array.isArray(value) ? value : []
  if (values.length === 0) return '未选择'
  return values.map((id) => getOptionName(options, id)).join(', ')
}

const selectDropdownOption = (key, optionId, isMulti = false) => {
  if (!isMulti) {
    if (key === 'broadDirection') updateBroadDirection(optionId)
    else updateRequirement({ [key]: optionId })
    configMenuOpen.value = ''
    return
  }
  updateMultiValue(key, optionId)
}

const closeOpenMenus = () => {
  creativeMenuOpen.value = false
  configMenuOpen.value = ''
}

const handleDocumentClick = (event) => {
  if (!detailRootRef.value?.contains(event.target)) closeOpenMenus()
}

const handleDocumentKeydown = (event) => {
  if (event.key !== 'Escape') return
  if (showDeleteConfirm.value) {
    showDeleteConfirm.value = false
    return
  }
  closeOpenMenus()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <div class="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div ref="detailRootRef" class="flex h-full w-full flex-col overflow-hidden bg-white animate-in fade-in zoom-in-95 duration-200">
      <div v-if="toastMessage" class="absolute left-1/2 top-5 z-[300] flex -translate-x-1/2 animate-in items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/95 px-5 py-3 text-white shadow-xl backdrop-blur-md fade-in slide-in-from-top-4 duration-200">
        <span class="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
        <span class="text-[11px] font-extrabold tracking-wide text-slate-100">{{ toastMessage }}</span>
      </div>

      <header class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-8 py-5">
        <div class="flex min-w-0 max-w-[78%] flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="shrink-0 rounded-xl bg-slate-900 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
              {{ requirement.projectName || 'Panthia' }}
            </span>
            <span class="shrink-0 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-700">
              {{ getAssetTypeLabel(requirement.assetType) }}
            </span>
            <button class="flex cursor-pointer select-none items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-black text-indigo-700 shadow-sm transition-all hover:bg-indigo-100" type="button" title="点击查看并复制所有小版本名称" @click="showSubVersionsModal = true">
              <span>📂</span>
              <span>{{ subVersions.length }} 个小版本名称查看、复制</span>
            </button>
          </div>

          <div class="flex max-w-full items-stretch gap-2">
            <div class="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-slate-50/70 px-3.5 py-2.5">
              <span class="shrink-0 text-[11px] font-black text-slate-400">父文件夹名称：</span>
              <h1 class="min-w-0 truncate font-mono text-base font-black tracking-tight text-slate-800 md:text-lg" :title="folderName">
                {{ folderName }}
              </h1>
            </div>
            <button class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600" type="button" title="复制父文件夹名称" @click="copyText(folderName)">
              <Copy class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="relative flex min-w-[132px] flex-col items-start">
            <span class="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">创意人员</span>
            <button
              :class="`flex min-h-9 w-full items-center gap-2 rounded-2xl border px-2 py-1.5 text-left transition-all ${creativeMenuOpen ? 'border-indigo-200 bg-indigo-50 shadow-sm' : 'border-transparent bg-transparent hover:border-slate-150 hover:bg-slate-50'}`"
              type="button"
              @click="creativeMenuOpen = !creativeMenuOpen"
            >
              <img :src="getPersonAvatarUrl(requirement.creativePersonnel)" :alt="requirement.creativePersonnel || '未指派'" class="h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover shadow-sm" referrerpolicy="no-referrer" />
              <span class="min-w-0 flex-1 truncate text-xs font-black text-slate-700">{{ requirement.creativePersonnel || '未指派' }}</span>
              <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${creativeMenuOpen ? 'rotate-180' : ''}`" />
            </button>

            <div v-if="creativeMenuOpen" class="absolute right-0 top-full z-[90] mt-2 w-40 overflow-hidden rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <button
                v-for="person in creativeOptions"
                :key="person"
                :class="`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all ${requirement.creativePersonnel === person ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`"
                type="button"
                @click="updateRequirement({ creativePersonnel: person }); creativeMenuOpen = false"
              >
                <img :src="getPersonAvatarUrl(person)" :alt="person" class="h-7 w-7 shrink-0 rounded-full border border-slate-150 bg-slate-50 object-cover" referrerpolicy="no-referrer" />
                <span class="min-w-0 flex-1 truncate text-xs font-black">{{ person }}</span>
                <Check v-if="requirement.creativePersonnel === person" class="h-4 w-4 text-indigo-500" />
              </button>
            </div>
          </div>

          <div class="h-10 w-px bg-slate-100"></div>
          <button class="rounded-2xl p-2.5 text-slate-400 transition-all hover:bg-slate-50" type="button" @click="emit('close')">
            <X class="h-6 w-6" />
          </button>
        </div>
      </header>

      <section class="shrink-0 border-b border-slate-100 bg-white px-8 py-5 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <div
            v-for="config in [
              { key: 'materialStage', label: '素材阶段', value: requirement.materialStage || '新', options: MATERIAL_STAGES, className: 'w-[104px]' },
              { key: 'broadDirection', label: '素材大方向', value: requirement.broadDirection || '原始玩法', options: BROAD_DIRECTIONS, className: 'w-[172px]' },
              { key: 'language', label: '语言', value: requirement.language || 'en', options: LANGUAGES, className: 'w-[116px]' },
              { key: 'channels', label: '投放渠道', value: requirement.channels || [], options: CHANNEL_OPTIONS, className: 'w-[240px]', isMulti: true },
              { key: 'dimensions', label: '尺寸', value: requirement.dimensions || [], options: DIMENSIONS_LIST, className: 'w-[164px]', isMulti: true },
            ]"
            :key="config.key"
            :class="`relative flex flex-col gap-1.5 ${config.className}`"
          >
            <span class="pl-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{{ config.label }}</span>
            <button
              class="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-[11px] font-bold text-slate-700 transition-all hover:border-indigo-200"
              type="button"
              @click.stop="configMenuOpen = configMenuOpen === config.key ? '' : config.key"
            >
              <span class="truncate">{{ getDropdownDisplay(config.value, config.options, config.isMulti) }}</span>
              <ChevronDown :class="`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${configMenuOpen === config.key ? 'rotate-180' : ''}`" />
            </button>
            <div v-if="configMenuOpen === config.key" class="absolute left-0 right-0 top-full z-[90] mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 shadow-xl no-scrollbar">
              <button
                v-for="item in config.options"
                :key="item.id"
                :class="`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold transition-all ${
                  config.isMulti
                    ? (Array.isArray(config.value) && config.value.includes(item.id) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50')
                    : (config.value === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50')
                }`"
                type="button"
                @click.stop="selectDropdownOption(config.key, item.id, config.isMulti)"
              >
                <span
                  :class="`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-all ${
                    config.isMulti
                      ? (Array.isArray(config.value) && config.value.includes(item.id) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 bg-white text-transparent')
                      : (config.value === item.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 bg-white text-transparent')
                  }`"
                >
                  <Check class="h-2.5 w-2.5" />
                </span>
                <span class="truncate">{{ item.name }}</span>
              </button>
            </div>
          </div>
          <label class="flex w-[260px] flex-col gap-1.5">
            <span class="pl-1 text-[10px] font-black uppercase tracking-widest text-slate-400">验证方向</span>
            <input :value="(requirement.testDirections || []).join('、')" class="h-[34px] rounded-xl border border-slate-100 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 outline-none" placeholder="输入验证方向" @input="updateRequirement({ testDirections: $event.target.value.split(/[、,，/]/).map((item) => item.trim()).filter(Boolean) })" />
          </label>
        </div>
      </section>

      <main class="flex min-h-0 flex-1 overflow-hidden">
        <section class="flex flex-[2] flex-col overflow-hidden border-r border-slate-100">
          <div class="flex shrink-0 items-center gap-8 border-b border-slate-100 bg-white px-8 pt-4">
            <button :class="`relative pb-3 text-xs font-black transition-all ${activeTab === 'clip' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`" type="button" @click="activeTab = 'clip'">
              成片
              <span v-if="activeTab === 'clip'" class="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-indigo-600"></span>
            </button>
            <button :class="`relative pb-3 text-xs font-black transition-all ${activeTab === 'script' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`" type="button" @click="activeTab = 'script'">
              需求脚本
              <span v-if="activeTab === 'script'" class="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-indigo-600"></span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto bg-slate-50/20 no-scrollbar">
            <RequirementClipPanel v-if="activeTab === 'clip'" :requirement="requirement" :sub-versions="subVersions" @open-upload="showClipUploadModal = true" @toast="showToast" />
            <div v-else class="p-6">
              <RequirementScriptWorkbench :requirement="requirement" :sub-versions="subVersions" @update="updateRequirement" @toast="showToast" />
            </div>
          </div>
        </section>

        <section class="flex flex-1 flex-col overflow-hidden bg-slate-50/10">
          <div class="flex shrink-0 items-center gap-8 border-b border-slate-100 bg-white px-8 pt-4">
            <button :class="`relative pb-3 text-xs font-black transition-all ${rightTab === 'iteration' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`" type="button" @click="rightTab = 'iteration'">
              迭代记录
              <span v-if="rightTab === 'iteration'" class="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-indigo-600"></span>
            </button>
            <button :class="`relative pb-3 text-xs font-black transition-all ${rightTab === 'schedule' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`" type="button" @click="rightTab = 'schedule'">
              制作排期
              <span v-if="rightTab === 'schedule'" class="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-indigo-600"></span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div v-if="rightTab === 'iteration'" class="space-y-6">
              <div class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Layers class="h-5 w-5 text-slate-400" />
                </div>
                <div class="min-w-0">
                  <span class="block truncate text-[11px] font-black text-slate-700">迭代自: cp3632-01</span>
                  <span class="text-[9px] text-slate-400">{{ schedule?.directionName || requirement.broadDirection || '原始玩法需求' }}</span>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm">
                <div class="mb-3 text-xs font-black text-slate-850">版本来源</div>
                <div class="grid gap-2">
                  <div v-for="subVersion in subVersions" :key="subVersion.version" class="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div class="min-w-0">
                      <div class="font-mono text-[11px] font-black text-indigo-600">v{{ subVersion.version }}</div>
                      <div class="truncate text-[11px] font-bold text-slate-600">{{ subVersion.name }}</div>
                    </div>
                    <span class="shrink-0 rounded-lg bg-white px-2 py-1 text-[9px] font-black text-slate-400">
                      {{ (subVersion.testDirections || requirement.testDirections || []).join(' / ') || '未标记' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-150 bg-white p-5 shadow-sm">
                <div class="mb-3 text-xs font-black text-slate-850">当前修改记录</div>
                <div class="space-y-3">
                  <div class="flex gap-3">
                    <div class="mt-1 h-2 w-2 rounded-full bg-indigo-500"></div>
                    <div>
                      <div class="text-[11px] font-black text-slate-700">需求配置已同步</div>
                      <div class="mt-1 text-[10px] font-bold text-slate-400">素材阶段、方向、语言、渠道、尺寸和验证方向会直接写回当前需求。</div>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <div class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <div class="text-[11px] font-black text-slate-700">制作排期已关联</div>
                      <div class="mt-1 text-[10px] font-bold text-slate-400">右侧排期调整会同步制作人员、起止日期和制作状态。</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <RequirementSchedulePanel
              v-else
              :requirement="requirement"
              :sub-versions="subVersions"
              :production-schedule-context="productionScheduleContext"
              :schedule-deadline="schedule?.productionEnd || schedule?.submissionDeadline || schedule?.requirementEnd || requirement.endDate || ''"
              @update="updateRequirement"
              @toast="showToast"
            />
          </div>
        </section>
      </main>

      <footer class="z-50 flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-10 py-6">
        <div class="flex items-center gap-4">
          <button class="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600" type="button" title="上一条需求">
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button class="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600" type="button" title="下一条需求">
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>

        <div class="flex items-center gap-4">
          <button class="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3 text-xs font-black text-white transition-all hover:bg-indigo-700" type="button" @click="saveRequirement">
            <Save class="h-4 w-4" />
            保存需求
          </button>
          <button class="rounded-2xl bg-slate-900 px-8 py-3 text-xs font-black text-white transition-all hover:bg-black" type="button" @click="saveAndClose">
            确认并退出
          </button>
          <button class="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-rose-500 transition-all hover:bg-rose-100" type="button" title="删除需求" @click="showDeleteConfirm = true">
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
      </footer>

      <SubVersionsModal
        v-if="showSubVersionsModal"
        :copied-text="copiedText"
        :preview-dimensions="previewDimensions"
        :requirement="requirement"
        :sub-versions="subVersions"
        @close="showSubVersionsModal = false"
        @copy="copyText"
      />

      <ClipUploadModal
        v-if="showClipUploadModal"
        @close="showClipUploadModal = false"
        @uploaded="(count) => { showClipUploadModal = false; showToast(`已添加 ${count} 个成片文件，等待上传配置`) }"
      />

      <div v-if="showDeleteConfirm" class="absolute inset-0 z-[250] flex animate-in items-center justify-center bg-slate-950/40 backdrop-blur-xs fade-in duration-200">
        <div class="mx-4 flex w-full max-w-sm animate-in flex-col gap-4.5 rounded-3xl border border-slate-150 bg-white p-6.5 text-center shadow-2xl zoom-in-95 duration-200">
          <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
            <Trash2 class="h-5 w-5" />
          </div>
          <div>
            <h3 class="mb-1 text-sm font-black text-slate-850">确定要彻底删除该创意吗？</h3>
            <p class="px-2 text-[11px] font-bold leading-relaxed text-slate-450">该需求与制作进度将被永久删除且无法撤销。</p>
          </div>
          <div class="mt-1 flex gap-2.5">
            <button class="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-black text-slate-600 shadow-3xs transition-all hover:bg-slate-250/20" type="button" @click="showDeleteConfirm = false">
              返回
            </button>
            <button class="flex-1 rounded-xl bg-rose-500 py-2.5 text-xs font-black text-white shadow-md shadow-rose-500/10 transition-all hover:bg-rose-600" type="button" @click="confirmDelete">
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
