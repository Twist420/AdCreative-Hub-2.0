<script setup>
import { computed } from 'vue'
import { getInitial, getPersonAvatarUrl } from './people'

const props = defineProps({
  name: {
    type: String,
    default: '未指派',
  },
  people: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'badge',
  },
  size: {
    type: String,
    default: 'sm',
  },
  maxVisible: {
    type: Number,
    default: 4,
  },
  muted: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: '',
  },
})

const normalizedPeople = computed(() => props.people.filter(Boolean))
const firstPerson = computed(() => normalizedPeople.value[0] || '')
const badgeAvatarClass = computed(() => (props.size === 'xs' ? 'h-5 w-5' : props.size === 'md' ? 'h-8 w-8' : 'h-6 w-6'))
const badgeInitialTextClass = computed(() => (props.size === 'xs' ? 'text-[9px]' : props.size === 'md' ? 'text-xs' : 'text-[10px]'))
const badgeTextClass = computed(() => (props.size === 'xs' ? 'text-[10px]' : props.size === 'md' ? 'text-sm' : 'text-xs'))
const stackAvatarClass = computed(() => (props.size === 'md' ? 'h-8 w-8' : 'h-7 w-7'))
const visiblePeople = computed(() => normalizedPeople.value.slice(0, props.maxVisible))
</script>

<template>
  <span v-if="mode === 'badge'" :class="`inline-flex min-w-0 items-center gap-1.5 ${className}`">
    <img
      v-if="getPersonAvatarUrl(name || '未指派')"
      :alt="name || '未指派'"
      :class="`${badgeAvatarClass} shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover`"
      :src="getPersonAvatarUrl(name || '未指派')"
      referrerpolicy="no-referrer"
    />
    <span
      v-else
      :class="`inline-flex ${badgeAvatarClass} shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 ${badgeInitialTextClass} font-black text-slate-500`"
    >
      {{ getInitial(name) }}
    </span>
    <span :class="`truncate font-extrabold ${muted ? 'text-slate-500' : 'text-slate-705'} ${badgeTextClass}`" :title="name || '未指派'">{{ name || '未指派' }}</span>
  </span>
  <span v-else-if="normalizedPeople.length === 1" :class="`group/person relative inline-flex min-w-0 items-center justify-center gap-1.5 ${className}`">
    <img
      :alt="firstPerson"
      :class="`${stackAvatarClass} shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover shadow-3xs`"
      :src="getPersonAvatarUrl(firstPerson)"
      referrerpolicy="no-referrer"
    />
    <span class="max-w-[56px] truncate text-[10px] font-extrabold text-slate-600">
      {{ firstPerson }}
    </span>
    <span class="pointer-events-none absolute bottom-full left-1/2 z-[260] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-xl group-hover/person:block">
      {{ firstPerson }}
    </span>
  </span>
  <div v-else :class="`group/person relative flex items-center justify-center -space-x-2 ${className}`">
    <template v-for="person in visiblePeople" :key="person">
      <img
        v-if="getPersonAvatarUrl(person)"
        :alt="person"
        :class="`${stackAvatarClass} rounded-full border-2 border-white bg-slate-50 object-cover shadow-3xs`"
        :src="getPersonAvatarUrl(person)"
        :title="person"
        referrerpolicy="no-referrer"
      />
      <span
        v-else
        :class="`inline-flex ${stackAvatarClass} items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-black text-slate-500 shadow-3xs`"
        :title="person"
      >
        {{ getInitial(person) }}
      </span>
    </template>
    <span
      v-if="normalizedPeople.length > visiblePeople.length"
      :class="`inline-flex ${stackAvatarClass} items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-black text-slate-500 shadow-3xs`"
    >
      +{{ normalizedPeople.length - visiblePeople.length }}
    </span>
    <span v-if="normalizedPeople.length === 0" class="text-[10px] font-black text-slate-300">-</span>
    <span
      v-else
      class="pointer-events-none absolute bottom-full left-1/2 z-[260] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-xl group-hover/person:block"
    >
      {{ normalizedPeople.join('、') }}
    </span>
  </div>
</template>
