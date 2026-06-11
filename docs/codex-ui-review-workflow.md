# Codex UI Review 工作流复盘

## 背景

这份文档沉淀的是 Codex 自己做网页 / UI 验收时的流程，不是业务开发流程。

最近一次数据回流复盘开发后，验证阶段出现过几个问题：

- 直接用系统 Chrome / Playwright 启动 headless 浏览器时，容易遇到沙箱权限、CDP 端口或浏览器二进制问题。
- 截图、完整页面输出、长日志和大段 DOM 都会消耗较多 token。
- 用户只是需要确认页面可用，不一定需要每次都做全量截图式 QA。

后续应优先用更省 token、更稳定的方式做检查。

## 推荐优先级

### 1. 首选：Codex 内部浏览器 / in-app Browser

如果可用，优先使用 Codex 内部浏览器打开本地地址，例如：

```text
http://localhost:3001/
```

或局域网地址：

```text
http://10.4.20.33:3001/
```

优点：

- 不依赖系统 Chrome GUI。
- 不需要额外启动 Playwright 浏览器二进制。
- 更适合做交互点击、页面观察、截图和控制台检查。
- 通常比自己写脚本连 CDP 更省 token。

使用策略：

- 只检查关键路径，不全站漫游。
- 每个主要页面最多截一张图。
- 如果能通过可见文本和状态判断，不额外截图。
- 不把截图内容详细转述，只记录“看到了什么问题 / 没看到什么问题”。

### 2. 次选：本地服务连通 + 静态验证

当内部浏览器工具不可用时，先做低成本验证：

```bash
npm run lint
npm run build
npm run dev -- --host 0.0.0.0
```

再验证页面是否返回：

```bash
curl -I http://127.0.0.1:3001/
```

如果沙箱不能访问本地端口，再按权限规则升级一次。

优点：

- token 消耗低。
- 能确认代码、构建和 dev server 基本正常。
- 适合非视觉密集型改动。

缺点：

- 不能替代真实 UI 视觉检查。
- 不能发现按钮挤压、弹窗遮挡、表格横向溢出等问题。

### 3. 谨慎使用：系统 Chrome headless 截图

只有在内部浏览器不可用、但确实需要截图时，才使用：

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --screenshot=/private/tmp/<name>.png \
  --window-size=1440,1000 \
  http://127.0.0.1:3001/
```

注意：

- 这通常需要更高权限。
- 只能截首屏或指定 URL，不适合复杂点击路径。
- 不要一次生成很多截图。
- 截图后只查看必要图片，不把图片内容长篇描述出来。

### 4. 尽量避免：Playwright 自拉浏览器 / CDP 复杂脚本

除非项目已有完整 Playwright 环境，否则不优先走这条路。

原因：

- 可能缺浏览器二进制。
- 可能被沙箱拦截系统 Chrome 进程。
- `connectOverCDP` 可能被本地网络权限拦截。
- 调试日志很长，token 消耗高。
- 为了验证一个页面写复杂脚本，性价比低。

如果必须用 Playwright：

- 只做 1-2 个关键路径。
- 限制输出为 JSON 摘要：页面是否打开、关键文案是否存在、console error 数量。
- 不输出完整 DOM。
- 不输出完整浏览器启动日志，除非错误本身需要定位。

## 最省 token 的 Review 顺序

后续 UI 改动后，Codex 应按这个顺序自检：

1. `npm run lint`
2. 必要时 `npm run build`
3. 启动 `npm run dev -- --host 0.0.0.0`
4. 用内部浏览器打开页面
5. 检查 1-3 条关键路径
6. 只记录结果，不长篇描述页面
7. 如内部浏览器不可用，退回 `curl -I` + 一张 headless Chrome 截图
8. 如果截图 QA 做不了，明确说“代码验证通过，但截图级 QA 未完成”

## Token 控制规则

为了避免昨天那样 token 用太多，后续 review 要控制这些点：

- 不用 `rg` 打超大范围结果；搜索时加明确关键词和文件范围。
- 不整段读取几千行大组件；只读目标函数、import、props、return 附近。
- 不反复贴 `git diff` 大段内容；用 `git diff --stat` 和定点 diff。
- 不连续截图很多页面；只截关键页。
- 不转述截图全部内容，只说异常点和验收结论。
- 不为截图安装新浏览器依赖，除非用户明确需要。
- 不在最终回复里贴长日志；只写命令结果是否通过。

## 当前推荐口径

以后我做 UI review 时，优先说清楚三层验收：

1. 代码验收：`npm run lint` / `npm run build`
2. 页面连通：dev server 地址和 HTTP 返回
3. 视觉验收：内部浏览器或截图看到的关键页面

如果第三层因为工具限制没完成，不能把它说成已完成。

## 这次 Chrome 问题的具体教训

这次尝试过：

- Playwright 包能 import，但缺默认浏览器二进制。
- 系统 Chrome headless 可以截首屏。
- Playwright 启动系统 Chrome / 连接 CDP 遇到权限限制。
- 最后可用的是系统 Chrome 的单次 headless screenshot，但它不适合复杂点击路径。

因此后续如果要省 token 且减少失败路径：

- 能用 Codex 内部浏览器，就不用系统 Chrome。
- 能用一张截图说明问题，就不跑 Playwright 点击脚本。
- 能用 `lint/build` 确认的，就不强行做浏览器自动化。

