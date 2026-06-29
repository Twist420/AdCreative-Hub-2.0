# Vue 3 + JS 样式迁移小样

这个目录是给外部 Vue 3 + JavaScript 项目试接的第一版对照小样。目标不是重写当前 React 项目，而是先把协同看板方向卡片的现有信息结构和视觉规则翻译成 Vue 3 可直接复制的代码。

## 文件说明

- `styles/ad-platform-tokens.css`：颜色、圆角、阴影、字体等设计 token。
- `styles/ad-platform-components.css`：卡片、标签、进度条、筛选下拉等语义 class。
- `components/AdStatusTag.vue`：状态/属性标签组件。
- `components/RequirementDirectionCard.vue`：协同看板方向卡片对照小样，字段顺序和进度条结构按当前 React 页面还原。
- `components/CoordinatedDirectionCardExact.vue`：更严格的原代码迁移版本，保留原 React 卡片的 Tailwind class 和 DOM 层级，只把 JSX/TSX 写法换成 Vue 3 + JS。
- `components/CoordinatedFilterDropdown.vue`：自绘筛选下拉小样，避免原生 `select` 破坏视觉。
- `preview.html`：静态视觉预览，不需要启动 Vue 项目即可查看卡片质感。

## 原样迁移要求

如果目标是“视觉完全不变”，优先使用 `CoordinatedDirectionCardExact.vue` 这条路径，而不是重新抽 CSS。

他们的 Vue 项目需要保持：

- Tailwind CSS，并迁移当前项目里的自定义色阶/主题配置。
- `lucide-vue-next`，对应当前项目的 `lucide-react` 图标。
- 当前卡片的字段结构和状态枚举，不要用组件库卡片或组件库下拉替换。

## 完全原样接入方式

使用 `CoordinatedDirectionCardExact.vue`，并在 Vue 项目中保持 Tailwind 与图标依赖：

```bash
npm install lucide-vue-next
```

```vue
<script setup>
import CoordinatedDirectionCardExact from '@/components/CoordinatedDirectionCardExact.vue'

const scheduleInsight = {
  status: '进行中',
  statusTone: 'border-indigo-150 bg-indigo-50 text-indigo-700',
  suggestion: '已有需求进入制作中',
  completedNotLaunched: 0,
}
</script>

<template>
  <CoordinatedDirectionCardExact
    :schedule="schedule"
    :requirements="requirements"
    :schedule-insight="scheduleInsight"
    @edit="handleEdit"
    @delete="handleDelete"
    @add-requirement="handleAddRequirement"
    @open-detail="handleOpenDetail"
  />
</template>
```

## 便携小样接入方式

如果他们暂时没有 Tailwind，可以用 `RequirementDirectionCard.vue` + 普通 CSS 小样，但这条路不是完全原样迁移。

在 Vue 入口样式里引入：

```js
import '@/styles/ad-platform-components.css'
```

在页面中使用：

```vue
<script setup>
import RequirementDirectionCard from '@/components/RequirementDirectionCard.vue'
import CoordinatedFilterDropdown from '@/components/CoordinatedFilterDropdown.vue'

const schedule = {
  id: 'schedule-001',
  weekRange: '2026-06-22 ~ 2026-06-29',
  directionName: '前 3 秒强钩子玩法验证',
  priority: 'High',
  form: 'Video',
  scenario: 'Standard',
  validCount: 7,
  totalRequiredCount: 10,
  owner: '唐欣怡',
  validationGoal: '验证高反差开场是否提升首帧停留',
  broadDirection: '原始玩法',
  materialStage: '新',
  channels: ['apl', 'fb'],
}

const requirements = [
  { id: 'REQ-1001', prodStatus: 'Completed' },
  { id: 'REQ-1002', prodStatus: 'InProgress' },
  { id: 'REQ-1003', prodStatus: 'Scheduled' },
  { id: 'REQ-1004', prodStatus: 'Scheduled' },
]
</script>

<template>
  <main class="ad-vue-sample">
    <CoordinatedFilterDropdown
      label="类型"
      model-value="Video"
      :options="[
        { value: '全部', label: '全部类型' },
        { value: 'Video', label: '视频' },
        { value: 'Image', label: '图片' },
        { value: 'Playable', label: '试玩' },
      ]"
    />

    <RequirementDirectionCard
      :schedule="schedule"
      :requirements="requirements"
      @edit="handleEdit"
      @add-requirement="handleAddRequirement"
      @open-detail="handleOpenDetail"
    />
  </main>
</template>
```

## 迁移原则

1. 要完全不变，使用 `CoordinatedDirectionCardExact.vue`，不要重写 CSS。
2. 便携小样才使用语义 class，不要把它当作 100% 视觉基准。
3. 卡片高度、顶部标签、目标框、属性网格、双进度条、最多展示 3 个关联需求和 `+N` 收纳规则应保持不变。
4. 后续迁移更多区域时，先补组件，不要只按截图临摹 CSS。
