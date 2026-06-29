<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '### 1. 叙事结构\n\n### 2. 开头钩子 / 吸量元素\n\n### 3. 用户核心痛点\n\n### 4. 玩法\n\n### 5. 场景和人设化内容说明',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div :class="`h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-3xs ${compact ? 'min-h-[168px]' : 'min-h-[178px]'}`">
    <div class="flex h-10 items-center gap-5 border-b border-slate-100 bg-slate-50/70 px-6 text-sm font-black text-slate-400">
      <span>B</span>
      <span class="italic">I</span>
      <span class="underline">U</span>
      <span class="line-through">S</span>
      <span>A⌄</span>
      <span class="h-5 w-px bg-slate-100" />
      <span>🔗</span>
      <span>•≡</span>
      <span>1≡</span>
      <span>▸</span>
      <span>◂</span>
      <span>⌫</span>
    </div>
    <textarea
      :value="modelValue"
      class="h-[calc(100%-40px)] w-full resize-none px-5 py-4 text-xs font-bold leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
