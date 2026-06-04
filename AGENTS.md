# 项目协作规范

## 项目定位

这是广告创意与需求管理平台，当前技术栈是 Vite + React + TypeScript。后续开发优先保持现有结构和交互风格，不做无关的大范围重构。

## 常用命令

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 类型检查：`npm run lint`
- 生产构建：`npm run build`

## 开发约定

- 修改前先阅读相关组件、类型和 mock/service 数据，沿用已有命名与组件组织方式。
- 新功能优先补齐 `types.ts` 中的数据结构，再接入页面组件和服务层。
- UI 保持偏业务后台风格：信息密度适中、状态清楚、操作路径短。
- UI 相关开发必须先参考 `components/UiSpecification.tsx` 中的“规范画布”，按其中的视觉原子、空间栅格、控件状态、媒体比例和组件代码模式实现。
- 涉及需求详情的“需求脚本”工作台时，必须先阅读 `docs/requirement-script-workbench-guidelines.md`，保持视频模板页签、需求参考、CTA/落版和版本信息的统一产品规则。
- 不把密钥、真实客户数据、投放账号数据提交进仓库；本地密钥放在 `.env.local`。
- 不提交 `node_modules`、`dist`、`.npm-cache`、`.DS_Store`。
- 对用户已有改动只协作不回滚，除非用户明确要求。

## 验收标准

- 代码变更后至少运行 `npm run lint`。
- 涉及构建、路由、依赖、入口文件或全局样式时，同时运行 `npm run build`。
- 涉及主要界面时，启动本地服务并在浏览器中做一次可视化检查。

## 需求沉淀

已有对话、需求纪要、产品决策可以放在 `docs/` 目录。建议格式：

- 背景
- 已确认需求
- 未决问题
- 页面或模块影响
- 验收口径

## 当前迁移说明

项目从 `/Users/fourteen/Documents/Codex/AdCreative-Hub-2.0` 导入到当前仓库。原目录未删除，可作为短期备份来源。
