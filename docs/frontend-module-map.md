# 前端模块拆分地图

更新日期：2026-06-25

这份文档用于后续维护大型前端模块。当前约定：单个 `ts` / `tsx` 文件尽量控制在 2000 行以内；超过时优先按页面区域、状态 hook、纯 helper / factory、弹窗组件拆分。

## 目录定位规则

- `components/<PageName>.tsx`
  - 页面入口，只保留页面级状态、动作串联、主要布局和弹窗挂载。

- `components/<page-domain>/`
  - 页面专属模块，例如资产库、创意分析、需求详情、需求中心。
  - 命名优先按职责：`XxxModal.tsx`、`XxxParts.tsx`、`xxxData.ts`、`useXxx.ts`。

- `components/analytics/`
  - 数据分析域的共享控件、字段配置、筛选条、数据模型和指标 helper。

- `components/shared/`
  - 跨页面、跨业务域复用的纯工具或 UI 基础能力。
  - 当前已有 `shared/date/` 和 `shared/requirements/`。

## 全仓当前大文件入口

- `components/AssetLibrary.tsx`：资产库主页面，当前保留页面状态、筛选、主布局和弹窗挂载。
- `components/RequirementDetail.tsx`：需求详情主页面，当前保留详情状态、核心编辑动作和主布局。
- `components/RequirementCenter.tsx`：需求中心主页面，当前保留需求中心页面级编排。
- `components/RequirementScriptWorkbench.tsx`：需求脚本工作台，未超过 2000 行；涉及脚本工作台先读 `docs/requirement-script-workbench-guidelines.md`。

## 数据分析模块

- `components/CreativeAnalysis.tsx`
  - 创意分析主入口：全局筛选、视图模式、Tab 维度编排、方向数据回流复盘和下钻弹窗挂载。

- `components/creative-analysis/CreativeAnalysisParts.tsx`
  - 创意分析图表、表格、分类行、素材明细下钻弹窗，以及方向复盘复用的格式化和状态样式 helper。

- `components/ConsumptionData.tsx`
  - 消耗数据主入口：筛选状态、分页排序状态、表格渲染、素材关联 Set 弹窗挂载。

- `components/RecoveryData.tsx`
  - 回收数据主入口：筛选状态、多选搜索状态、分页排序状态、基准线高亮表格、素材弹窗挂载。

- `components/analytics/ColumnConfigDropdown.tsx`
  - 消耗数据与回收数据共用的字段配置下拉，包含字段显隐、拖拽排序和外部点击关闭。

- `components/analytics/AnalyticsFilters.tsx`
  - 数据分析页共用筛选条、单选下拉、多选搜索、搜索框和分析日期范围选择器。

- `components/analytics/consumptionDataModel.ts`
  - 消耗数据的数据类型、筛选枚举、mock 消耗行构造、字段配置、指标说明和排序取值 helper。

- `components/analytics/recoveryDataModel.ts`
  - 回收数据的数据类型、筛选枚举、mock Set 构造、字段配置、指标说明、指标计算、基准线匹配和高亮 helper。

## 跨页面共享模块

- `components/shared/date/dateRange.ts`
  - UTC 日期范围、月份切换、月历单元和范围判断 helper；当前供数据分析筛选条使用。

- `components/shared/requirements/requirementId.ts`
  - 需求编号解析、主需求编号提取、排期视图需求编号格式化；当前由需求中心和需求详情复用。

## 资产库模块

- `components/AssetLibrary.tsx`
  - 资产库主入口：目录状态、资产筛选、主页面布局、上传/移动/管理弹窗挂载。

- `components/asset-library/assetLibraryData.ts`
  - 资产目录树、资产 facet、初始 mock 资产、目录树 helper、投放表现 mock helper、上传预览常量。

- `components/asset-library/CreateLibraryModal.tsx`
  - 新建微分子资产库弹窗。

- `components/asset-library/AssetMetricParts.tsx`
  - 资产详情中复用的 `DetailRow` / `MetricBox` 小展示组件。

## 需求详情模块

- `components/RequirementDetail.tsx`
  - 需求详情主入口：编辑状态、保存/删除、脚本与成片页签、排期数据派生、弹窗挂载。

- `components/requirement-detail/requirementDetailUtils.tsx`
  - 人员别名、下拉基础组件、命名规则、生产排期 helper、日期 helper、产能空档计算。

- `components/requirement-detail/AvailabilityModal.tsx`
  - 人员排期情况弹窗，包含日历图和甘特图展示。

- `components/requirement-detail/ClipUploadModal.tsx`
  - 成片上传弹窗。

- `components/requirement-detail/SubVersionsModal.tsx`
  - 小版本名称列表和按尺寸复制文件名弹窗。

## 需求中心模块

需求中心更细的页面-模块对应关系见：

- `docs/requirement-center-module-map.md`

## 后续拆分规则

- 页面入口文件只做页面级状态、动作串联和组件挂载。
- 大段派生数据进入 `useXxx` hook。
- 纯对象构造、mock 数据、目录树、配置项进入 data / factory 文件。
- 大段弹窗 JSX 独立成 modal 组件。
- 通用小 UI 组件独立成 `XxxParts.tsx` 或明确业务名组件。
- 拆分后必须运行 `npm run lint`；影响导出、入口或构建时运行 `npm run build`。
