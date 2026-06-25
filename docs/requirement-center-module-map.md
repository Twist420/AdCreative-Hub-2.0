# 需求中心模块地图

更新日期：2026-06-25

这份文档用于后续维护 `components/RequirementCenter.tsx` 和 `components/requirement-center/` 目录。改需求中心前先查这里，避免把已经拆出的模块重新塞回主页面。

## 入口与编排

- `components/RequirementCenter.tsx`
  - 需求中心主入口，负责页面级状态编排、各子视图切换、弹窗挂载、跨模块动作串联。
  - 不再承载大段展示组件、筛选派生、生产排期派生、周期计算或静态 factory。

- `components/requirement-center/index.ts`
  - 需求中心子模块 barrel export。
  - 新增组件、hook、helper 后优先从这里统一导出，主入口只从 `./requirement-center` 引入。

## 协同看板

- `CoordinatedToolbar.tsx`
  - 顶部周期、多选周期、搜索、筛选、排序、底部日期范围等控制区。
  - 周期点击不能写回底部时间范围；周期展示顺序和默认选中由 `useCoordinatedPlanning.ts` 维护。

- `CoordinatedBoard.tsx`
  - 协同看板主体、方向卡片列表、新增方向入口、方向卡片内操作。
  - 继续拆分时优先按“周列/方向卡/卡片操作区/空态与新增行”拆。

- `useCoordinatedPlanning.ts`
  - 协同看板的周期生成、默认选中、可见排期、灵活筛选和排序。
  - 周期边界、当前周期和筛选关系相关 bug 优先从这里查。

- `useAddWeekModal.ts` 与 `AddWeekModal.tsx`
  - 新增周期弹窗的状态和 UI。

## 需求列表

- `RequirementListView.tsx`
  - 需求列表页展示、列表筛选区、行内状态下拉、需求层级展示入口。

- `RequirementInlineDropdown.tsx`
  - 需求列表与排期详情里复用的行内状态/优先级下拉。
  - 行内下拉视觉或交互变更优先改这里，不要在主页面里写 JSX。

- `useRequirementListFilters.ts`
  - 需求列表筛选配置、筛选展示文案、多选筛选、日期区间、风险排序、层级扁平化。
  - 列表搜索/筛选/排序异常优先查这里。

- `RequirementDetailOverlay.tsx`
  - 需求详情弹窗挂载层。

## 创建与迭代

- `ScheduleSelectorModal.tsx`
  - 新建需求第一步：选择制作类型、选择排期方向或创建未关联需求。

- `CreateLocalizedRequirementDialog.tsx`
  - 本地化需求创建弹窗：来源需求、语言、多来源版本。

- `IterationDirectionSelectorModal.tsx`
  - 从已有需求创建迭代时选择目标方向。

- `requirementFactory.ts`
  - 静态需求草稿、迭代需求、本地化 subVersion、编号索引等 factory。
  - 新增纯对象构造逻辑优先放这里，不要写进主页面。

- `requirementUtils.ts`
  - 需求编号、版本解析、生产任务视图、状态汇总等业务 helper。

- `useRequirementVersioning.ts`
  - 需求版本组、空白草稿判断、送审前清理空白版本。
  - 父子版本层级、子需求继承和空白草稿清理异常优先查这里。

## 生产排期

- `ProductionWorkspace.tsx`
  - 生产排期子页容器，切换甘特/日历/产能。

- `ProductionScheduleHeader.tsx`
  - 生产排期顶部切换、风险入口、人员筛选入口。

- `ProductionGanttView.tsx`
  - 生产甘特视图。

- `ProductionCalendarView.tsx`
  - 生产日历视图。

- `ProductionCapacityView.tsx`
  - 人员产能视图。

- `ProductionRiskModal.tsx`
  - 生产延期风险弹窗。

- `useProductionPlanning.ts`
  - 生产任务派生、人员筛选、风险数据、甘特/日历/产能数据。

## 排期详情与历史表

- `ScheduleDetailModal.tsx`
  - 排期方向详情弹窗，包含方向信息、标签、周期调整、关联需求和 Delivery Set。
  - 继续拆分时优先按“头部概览/方向标签/周期调整/需求列表/Delivery Set 区”拆。

- `LegacyScheduleTable.tsx`
  - 旧排期表视图。

- `useLegacyScheduleGroups.ts`
  - 旧排期表按周期分组、折叠状态和排序。

- `useScheduleInsights.ts`
  - 排期方向的完成度、结转状态、快速完成提醒、Delivery Set 建议。

- `useScheduleActions.ts`
  - 排期方向动作：新增方向、更新排期、方向标签、周期调整、优先级同步、Delivery Set 草稿。
  - 方向卡片按钮、排期详情动作或周期调整异常优先查这里。

## 基础数据与展示 helper

- `filters.tsx`
  - 筛选常量、筛选值编码/解码、自绘下拉基础组件、协同灵活筛选字段。

- `displayHelpers.tsx`
  - 状态、优先级、难度、场景、类型等展示样式和文案。

- `dateUtils.tsx`
  - 日期解析、周/月范围、日期格式化。

- `people.tsx`
  - 制作人员、创意人员、头像展示。

- `channel.tsx`
  - 渠道显示组件和渠道名称 helper。

## 后续拆分规则

- 主入口保持“页面编排层”，新增大段派生数据优先写成 `useXxx` hook。
- 大段 JSX 按页面区域拆成组件；组件名要体现业务区域，不用泛泛的 `Section` / `Panel`。
- 纯对象构造、编号生成和状态汇总放到 factory/helper；不要混进展示组件。
- 触达协同周期逻辑时先看 `useCoordinatedPlanning.ts`，不要在 toolbar 或 board 内重复计算周期。
- 触达生产排期逻辑时先看 `useProductionPlanning.ts`，不要在生产视图组件内重复派生风险或产能。
- 完成拆分后至少跑 `npm run lint`；影响入口、构建或导出关系时同时跑 `npm run build`。
