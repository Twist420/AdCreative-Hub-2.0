<script setup>
import { computed, ref, watch } from 'vue'
import { Globe, Monitor, Play, Upload } from 'lucide-vue-next'
import { getDurationLabel, getSubVersionSizedFormatName, normalizeDimensionLabel } from './detailUtils'

const props = defineProps({
  requirement: {
    type: Object,
    required: true,
  },
  subVersions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['toast', 'open-upload'])

const uploadHistory = [
  {
    platform: 'Applovin',
    versions: [
      { version: 'V3', dims: [{ dim: '9:16', status: 'Pending', time: '2026-03-04 10:30' }, { dim: '1:1', status: 'Pending', time: '2026-03-04 10:30' }, { dim: '16:9', status: 'Pending', time: '2026-03-04 10:30' }] },
      { version: 'V2', dims: [{ dim: '9:16', status: 'Approved', time: '2026-03-03 15:45' }, { dim: '16:9', status: 'Approved', time: '2026-03-03 15:45' }] },
      {
        version: 'V1',
        dims: [
          {
            dim: '9:16',
            status: 'Rejected',
            time: '2026-03-02 14:20',
            rejectionDetail: {
              reason: 'Intellectual Property Violation',
              time: '2026-03-02 16:00',
            },
          },
          { dim: '1:1', status: 'Approved', time: '2026-03-02 14:20' },
          { dim: '16:9', status: 'Approved', time: '2026-03-02 14:20' },
        ],
      },
    ],
  },
  {
    platform: 'Google',
    versions: [{ version: 'V3', dims: [{ dim: '9:16', status: 'Pending', time: '2026-03-04 10:30' }] }],
  },
  {
    platform: 'Facebook',
    versions: [
      { version: 'V2', dims: [{ dim: '1:1', status: 'Approved', time: '2026-03-03 16:20' }, { dim: '4:5', status: 'Approved', time: '2026-03-03 16:20' }] },
      { version: 'V1', dims: [{ dim: '9:16', status: 'Pending', time: '2026-03-02 17:05' }] },
    ],
  },
]

const getVersionSortValue = (version) => Number(String(version || '').replace(/\D/g, '')) || 0
const getDimensionSortValue = (dimension) => {
  const order = ['9:16', '1:1', '16:9', '4:5', '5:4']
  const index = order.indexOf(dimension)
  return index === -1 ? order.length : index
}

const previewDimensions = computed(() => {
  const set = new Set((props.requirement.dimensions || []).map(normalizeDimensionLabel))
  uploadHistory.forEach((group) => group.versions.forEach((version) => version.dims.forEach((dim) => set.add(normalizeDimensionLabel(dim.dim)))))
  return Array.from(set).filter(Boolean).sort((a, b) => getDimensionSortValue(a) - getDimensionSortValue(b))
})

const selectedDimension = ref(previewDimensions.value[0] || '9:16')

watch(previewDimensions, (dimensions) => {
  if (dimensions.length && !dimensions.includes(selectedDimension.value)) {
    selectedDimension.value = dimensions[0]
  }
})

const allVersions = computed(() => {
  const versions = new Set()
  uploadHistory.forEach((group) => group.versions.forEach((version) => versions.add(version.version)))
  return Array.from(versions).sort((a, b) => getVersionSortValue(a) - getVersionSortValue(b))
})

const getPreviewName = (version) => {
  const versionNumber = String(getVersionSortValue(version)).padStart(2, '0')
  const subVersion = props.subVersions.find((item) => item.version === versionNumber) || {
    version: versionNumber,
    name: `版本${getVersionSortValue(version)}`,
  }
  return getSubVersionSizedFormatName(props.requirement, subVersion, selectedDimension.value)
}

const deliveryRecords = computed(() => {
  const versionMap = new Map()
  uploadHistory.forEach((platformGroup) => {
    platformGroup.versions.forEach((versionRecord) => {
      const record = versionMap.get(versionRecord.version) || { version: versionRecord.version, channelGroups: [] }
      record.channelGroups.push({
        platform: platformGroup.platform,
        sizes: versionRecord.dims.map((dimData) => ({
          dim: dimData.dim,
          reviewStatus: dimData.status,
          deliveryStatus: dimData.status === 'Approved' ? 'Delivering' : dimData.status === 'Rejected' ? 'NotLaunched' : 'Waiting',
          time: dimData.time,
        })),
      })
      versionMap.set(versionRecord.version, record)
    })
  })
  return Array.from(versionMap.values()).sort((a, b) => getVersionSortValue(a.version) - getVersionSortValue(b.version))
})

const getPreviewWidth = (dimension) => {
  const [width, height] = normalizeDimensionLabel(dimension).split(':').map(Number)
  if (!width || !height) return 158
  return Math.max(158, Math.round((280 * width) / height))
}

const getReviewText = (status) => (status === 'Approved' ? '已通过' : status === 'Rejected' ? '未过审' : '审核中')
const getReviewClass = (status) => {
  if (status === 'Approved') return 'bg-emerald-500 text-emerald-600'
  if (status === 'Rejected') return 'bg-red-500 text-red-600'
  return 'bg-amber-500 text-amber-600'
}
const getDeliveryText = (status) => (status === 'Delivering' ? '投放中' : '未投放')
const getDeliveryClass = (status) => {
  if (status === 'Delivering') return 'border-indigo-100 bg-indigo-50 text-indigo-600'
  if (status === 'NotLaunched') return 'border-slate-100 bg-slate-50 text-slate-400'
  return 'border-amber-100 bg-amber-50 text-amber-600'
}
</script>

<template>
  <div class="space-y-8 p-6">
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <h3 class="text-xs font-black tracking-widest text-slate-400">成片预览</h3>
          <div class="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-1">
            <button
              v-for="dimension in previewDimensions"
              :key="dimension"
              :class="`rounded-xl px-3 py-1.5 text-[10px] font-black transition-all ${selectedDimension === dimension ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`"
              type="button"
              @click="selectedDimension = dimension"
            >
              {{ dimension }}
            </button>
          </div>
        </div>
        <button class="inline-flex h-9 items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 text-[11px] font-black text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-100" type="button" title="上传当前需求的成片素材" @click="emit('open-upload')">
          <Upload class="h-4 w-4" />
          上传成片
        </button>
      </div>
      <div class="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        <div v-for="version in allVersions" :key="version" class="group flex h-[330px] shrink-0 flex-col gap-2" :style="{ width: `${getPreviewWidth(selectedDimension)}px` }">
          <div class="relative h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
            <img :src="(requirement.previews || [])[0] || 'https://picsum.photos/270/480'" class="h-full w-full object-cover opacity-80 transition-all group-hover:opacity-100" referrerpolicy="no-referrer" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-all group-hover:opacity-100">
              <Play class="h-10 w-10 fill-white text-white" />
            </div>
            <div class="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur">{{ version }}</div>
            <div class="absolute bottom-2 right-2 rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-black text-slate-700 backdrop-blur">{{ getDurationLabel(requirement.duration) }}</div>
          </div>
          <p class="line-clamp-2 h-10 overflow-hidden break-all text-center font-mono text-[9.5px] font-bold leading-5 text-slate-500">
            {{ getPreviewName(version) }}
          </p>
        </div>
      </div>
    </section>

    <section class="space-y-6">
      <h3 class="text-xs font-black tracking-widest text-slate-400">投放记录</h3>
      <div v-for="record in deliveryRecords" :key="record.version" class="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="h-5 w-1 rounded-full bg-indigo-600"></div>
            <span class="text-sm font-black text-slate-900">版本 {{ record.version.replace('V', '') }}</span>
          </div>
          <span class="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black text-slate-400">
            {{ record.channelGroups.reduce((sum, channel) => sum + channel.sizes.length, 0) }} 条投放尺寸 · {{ record.channelGroups.length }} 个渠道
          </span>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white">
          <div class="grid grid-cols-[1.05fr_0.8fr_0.9fr_0.9fr_1.1fr] border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black text-slate-400">
            <span>投放渠道</span>
            <span>尺寸</span>
            <span>审核情况</span>
            <span>投放情况</span>
            <span>同步时间</span>
          </div>
          <div class="divide-y divide-slate-50">
            <template v-for="channel in record.channelGroups" :key="`${record.version}-${channel.platform}`">
              <div v-for="(sizeItem, sizeIndex) in channel.sizes" :key="`${record.version}-${channel.platform}-${sizeItem.dim}`" class="grid grid-cols-[1.05fr_0.8fr_0.9fr_0.9fr_1.1fr] items-center px-4 py-3 text-[11px] font-bold">
                <span class="flex items-center gap-2 text-slate-800">
                  <template v-if="sizeIndex === 0">
                    <Globe class="h-3.5 w-3.5 text-indigo-600" />
                    {{ channel.platform }}
                  </template>
                  <span v-else class="pl-5 text-slate-300">同渠道</span>
                </span>
                <span class="inline-flex items-center gap-2 text-slate-700">
                  <Monitor class="h-3.5 w-3.5 text-slate-400" />
                  {{ sizeItem.dim }}
                </span>
                <span :class="`inline-flex items-center gap-1.5 ${getReviewClass(sizeItem.reviewStatus).split(' ')[1]}`">
                  <i :class="`h-1.5 w-1.5 rounded-full ${getReviewClass(sizeItem.reviewStatus).split(' ')[0]}`"></i>
                  {{ getReviewText(sizeItem.reviewStatus) }}
                </span>
                <span :class="`mr-auto rounded-full border px-2 py-1 text-[10px] font-black ${getDeliveryClass(sizeItem.deliveryStatus)}`">
                  {{ getDeliveryText(sizeItem.deliveryStatus) }}
                </span>
                <span class="text-slate-400">{{ sizeItem.time }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
