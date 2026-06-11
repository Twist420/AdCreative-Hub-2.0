# Data Feedback Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first front-end-verifiable data feedback review loop for requirements, versions, finished creatives, and creative directions.

**Architecture:** Keep the asset library separate from finished creative performance. Finished creatives do not automatically enter the asset library; the asset library remains a manually curated repository. Add explicit performance-feedback types and mock data, then surface them in requirement detail, requirement center review entry points, and existing data pages without creating a new disconnected module.

**Tech Stack:** Vite, React, TypeScript, existing mock services in `services/mockData.ts`, existing admin UI patterns in `components/UiSpecification.tsx`.

---

## Product Correction

成片需求不进入资产库。

- `LibraryItem` / 资产库：只承载手动录入、人工治理、可复用引用的资产。
- 成片 / 投放素材：承载需求版本的制作结果、投放表现、复盘结论和后续迭代建议。
- 需求脚本中的 `引用成片` 是复盘与参考来源，不等同于资产库资产。
- 上传成品后可以回写需求/任务/版本状态，但不自动生成 `LibraryItem`。

## Current Context

- `App.tsx` 默认进入 `MainModule.REQUIREMENT_CENTER`。
- `components/RequirementCenter.tsx` 已有四个子视图：`coordinated`、`list`、`production`、`upload`。
- `types.ts` 已有 `Requirement`、`AssetVersionItem`、`CreativeSchedule`、`ProductionTask`、`PerformanceData`、`LibraryItem`。
- `services/mockData.ts` 目前生成方向、需求和数据看板 mock，但缺少“成片表现 -> 需求版本 -> 方向复盘”的显式数据结构。
- `docs/requirement-platform-execution-plan.md` 和 `docs/requirement-platform-roadmap.md` 仍把资产闭环与数据回流放在后续阶段；本计划将优先开发数据回流复盘，并保持资产库手动录入边界。

## Data Model Decision

Add a separate finished-creative feedback model instead of extending `LibraryItem`.

Proposed types:

```ts
export type CreativeFeedbackStatus = 'Learning' | 'Winner' | 'Flat' | 'Failed' | 'Paused';

export interface FinishedCreativePerformance {
  id: string;
  requirementId: string;
  scheduleId?: string;
  version: string;
  versionName: string;
  creativeName: string;
  thumbnail: string;
  channel: string;
  country: string;
  language: string;
  ratio: string;
  launchedAt: string;
  daysRunning: number;
  spent: number;
  impressions: number;
  installs: number;
  paidUsers: number;
  cpm: number;
  cpi: number;
  cpa: number;
  ctr: number;
  cvr: number;
  ir: number;
  roasD7: number;
  status: CreativeFeedbackStatus;
  insight: string;
  nextAction: 'Scale' | 'Iterate' | 'Pause' | 'Observe';
}

export interface RequirementFeedbackSummary {
  requirementId: string;
  totalSpent: number;
  totalInstalls: number;
  bestVersion?: string;
  bestChannel?: string;
  status: CreativeFeedbackStatus;
  insight: string;
  nextAction: 'Scale' | 'Iterate' | 'Pause' | 'Observe';
}

export interface DirectionFeedbackSummary {
  scheduleId: string;
  requirementCount: number;
  launchedCreativeCount: number;
  totalSpent: number;
  totalInstalls: number;
  winnerCount: number;
  failedCount: number;
  avgCpi: number;
  avgCpa: number;
  avgIr: number;
  status: CreativeFeedbackStatus;
  insight: string;
}
```

These are intentionally separate from `LibraryItem`.

---

## File Map

- Modify: `types.ts`
  - Add finished creative performance and feedback summary types.
  - Do not add automatic asset-library conversion fields.

- Modify: `services/mockData.ts`
  - Add `generateFinishedCreativePerformance(requirements: Requirement[]): FinishedCreativePerformance[]`.
  - Add summary helpers for requirement and direction feedback.

- Modify: `components/RequirementDetail.tsx`
  - Add a compact “数据回流” section for the selected requirement.
  - Show version-level performance table/cards and a recommendation summary.

- Modify: `components/RequirementCenter.tsx`
  - Inject generated finished creative performance data.
  - Add data feedback badges to direction cards and requirement rows.
  - Add a review-focused panel in the existing requirement center, likely under the list/detail flow instead of creating a fifth top-level tab.

- Modify: `components/CreativeAnalysis.tsx`
  - Add or align a requirement/direction feedback view using the same mock performance data.
  - Keep existing data page behavior intact.

- Modify: `components/Overview.tsx` or `components/ConsumptionData.tsx`
  - If needed, surface aggregate feedback signals without duplicating the detailed review UI.

- Modify: `docs/requirement-platform-execution-plan.md`
  - Update roadmap wording: finished creatives feed review data, not asset-library auto-ingestion.

- Modify: `docs/requirement-platform-roadmap.md`
  - Update phase order so data feedback review comes before asset ingestion.

---

## Task 1: Add Feedback Types

**Files:**
- Modify: `types.ts`

- [ ] **Step 1: Add new status and summary types near existing performance types**

Add this after `PerformanceData` and before `LibraryItem`:

```ts
export type CreativeFeedbackStatus = 'Learning' | 'Winner' | 'Flat' | 'Failed' | 'Paused';
export type CreativeFeedbackNextAction = 'Scale' | 'Iterate' | 'Pause' | 'Observe';

export interface FinishedCreativePerformance {
  id: string;
  requirementId: string;
  scheduleId?: string;
  version: string;
  versionName: string;
  creativeName: string;
  thumbnail: string;
  channel: string;
  country: string;
  language: string;
  ratio: string;
  launchedAt: string;
  daysRunning: number;
  spent: number;
  impressions: number;
  installs: number;
  paidUsers: number;
  cpm: number;
  cpi: number;
  cpa: number;
  ctr: number;
  cvr: number;
  ir: number;
  roasD7: number;
  status: CreativeFeedbackStatus;
  insight: string;
  nextAction: CreativeFeedbackNextAction;
}

export interface RequirementFeedbackSummary {
  requirementId: string;
  totalSpent: number;
  totalInstalls: number;
  bestVersion?: string;
  bestChannel?: string;
  status: CreativeFeedbackStatus;
  insight: string;
  nextAction: CreativeFeedbackNextAction;
}

export interface DirectionFeedbackSummary {
  scheduleId: string;
  requirementCount: number;
  launchedCreativeCount: number;
  totalSpent: number;
  totalInstalls: number;
  winnerCount: number;
  failedCount: number;
  avgCpi: number;
  avgCpa: number;
  avgIr: number;
  status: CreativeFeedbackStatus;
  insight: string;
}
```

- [ ] **Step 2: Run type check**

Run:

```bash
npm run lint
```

Expected: pass, or fail only on pre-existing unrelated errors. If it fails, capture the exact TypeScript error before continuing.

- [ ] **Step 3: Commit**

```bash
git add types.ts
git commit -m "feat: add creative feedback types"
```

---

## Task 2: Generate Finished Creative Feedback Mock Data

**Files:**
- Modify: `services/mockData.ts`

- [ ] **Step 1: Import the new types**

Update the existing type import list to include:

```ts
FinishedCreativePerformance,
RequirementFeedbackSummary,
DirectionFeedbackSummary,
CreativeFeedbackStatus,
CreativeFeedbackNextAction,
```

- [ ] **Step 2: Add deterministic helper functions**

Add helper functions near the top of `services/mockData.ts`:

```ts
const getFeedbackStatus = (cpi: number, ir: number, roasD7: number): CreativeFeedbackStatus => {
  if (roasD7 >= 0.85 || (cpi <= 3.2 && ir >= 0.18)) return 'Winner';
  if (roasD7 < 0.35 || cpi >= 8) return 'Failed';
  if (roasD7 < 0.55) return 'Flat';
  return 'Learning';
};

const getNextAction = (status: CreativeFeedbackStatus): CreativeFeedbackNextAction => {
  if (status === 'Winner') return 'Scale';
  if (status === 'Failed') return 'Pause';
  if (status === 'Flat') return 'Iterate';
  return 'Observe';
};

const getFeedbackInsight = (status: CreativeFeedbackStatus, versionName: string): string => {
  if (status === 'Winner') return `${versionName} 已出现放量信号，建议优先扩渠道并保留核心表达。`;
  if (status === 'Failed') return `${versionName} 转化效率偏低，建议暂停或回到需求侧重拆卖点。`;
  if (status === 'Flat') return `${versionName} 数据平平，建议小步迭代 hook、节奏或 CTA。`;
  if (status === 'Paused') return `${versionName} 已暂停，保留复盘记录但不继续观察。`;
  return `${versionName} 仍在学习期，先观察消耗和付费回收趋势。`;
};
```

- [ ] **Step 3: Add `generateFinishedCreativePerformance`**

Add this exported function after `generateRequirements`:

```ts
export const generateFinishedCreativePerformance = (
  requirements: Requirement[],
): FinishedCreativePerformance[] => {
  return requirements.flatMap((requirement, requirementIndex) => {
    const versions = requirement.subVersions?.length
      ? requirement.subVersions
      : [{ version: requirement.assetVersion || '01', name: requirement.name, testDirections: requirement.testDirections || [] }];

    return versions.slice(0, 3).map((version, versionIndex) => {
      const spent = 1200 + requirementIndex * 260 + versionIndex * 420;
      const impressions = 48000 + requirementIndex * 3200 + versionIndex * 5400;
      const installs = Math.max(80, Math.round(spent / (2.8 + ((requirementIndex + versionIndex) % 5))));
      const paidUsers = Math.max(4, Math.round(installs * (0.08 + ((requirementIndex + versionIndex) % 4) * 0.035)));
      const cpi = Number((spent / installs).toFixed(2));
      const cpa = Number((spent / paidUsers).toFixed(2));
      const ctr = Number((0.85 + ((requirementIndex + versionIndex) % 6) * 0.18).toFixed(2));
      const cvr = Number((8.5 + ((requirementIndex + versionIndex) % 5) * 1.6).toFixed(2));
      const ir = Number((paidUsers / installs).toFixed(3));
      const cpm = Number(((spent / impressions) * 1000).toFixed(2));
      const roasD7 = Number((0.32 + ((requirementIndex + versionIndex) % 7) * 0.11).toFixed(2));
      const status = getFeedbackStatus(cpi, ir, roasD7);
      const versionName = version.name || `版本 ${version.version}`;

      return {
        id: `fc-${requirement.id}-${version.version}`,
        requirementId: requirement.id,
        scheduleId: requirement.scheduleId,
        version: version.version,
        versionName,
        creativeName: `${requirement.name} / ${versionName}`,
        thumbnail: requirement.previews?.[versionIndex % Math.max(requirement.previews.length, 1)] || `https://picsum.photos/seed/${requirement.id}-${version.version}/320/568`,
        channel: requirement.channels?.[versionIndex % Math.max(requirement.channels.length, 1)] || 'all',
        country: ['US', 'JP', 'KR', 'TW'][versionIndex % 4],
        language: requirement.language || 'EN',
        ratio: requirement.assetType === 'Image' ? '1:1' : '9:16',
        launchedAt: `2026-05-${String(12 + ((requirementIndex + versionIndex) % 15)).padStart(2, '0')}`,
        daysRunning: 2 + ((requirementIndex + versionIndex) % 12),
        spent,
        impressions,
        installs,
        paidUsers,
        cpm,
        cpi,
        cpa,
        ctr,
        cvr,
        ir,
        roasD7,
        status,
        insight: getFeedbackInsight(status, versionName),
        nextAction: getNextAction(status),
      };
    });
  });
};
```

- [ ] **Step 4: Add summary helper exports**

Add:

```ts
export const summarizeRequirementFeedback = (
  performances: FinishedCreativePerformance[],
): RequirementFeedbackSummary[] => {
  const grouped = performances.reduce<Record<string, FinishedCreativePerformance[]>>((acc, item) => {
    acc[item.requirementId] = [...(acc[item.requirementId] || []), item];
    return acc;
  }, {});

  return Object.entries(grouped).map(([requirementId, items]) => {
    const best = [...items].sort((a, b) => b.roasD7 - a.roasD7 || a.cpi - b.cpi)[0];
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
    const totalInstalls = items.reduce((sum, item) => sum + item.installs, 0);

    return {
      requirementId,
      totalSpent,
      totalInstalls,
      bestVersion: best?.version,
      bestChannel: best?.channel,
      status: best?.status || 'Learning',
      insight: best?.insight || '暂无投放数据，等待成片上线后回流。',
      nextAction: best?.nextAction || 'Observe',
    };
  });
};

export const summarizeDirectionFeedback = (
  performances: FinishedCreativePerformance[],
): DirectionFeedbackSummary[] => {
  const grouped = performances.reduce<Record<string, FinishedCreativePerformance[]>>((acc, item) => {
    if (!item.scheduleId) return acc;
    acc[item.scheduleId] = [...(acc[item.scheduleId] || []), item];
    return acc;
  }, {});

  return Object.entries(grouped).map(([scheduleId, items]) => {
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
    const totalInstalls = items.reduce((sum, item) => sum + item.installs, 0);
    const winnerCount = items.filter((item) => item.status === 'Winner').length;
    const failedCount = items.filter((item) => item.status === 'Failed').length;
    const avgCpi = totalInstalls > 0 ? Number((totalSpent / totalInstalls).toFixed(2)) : 0;
    const avgCpa = Number((items.reduce((sum, item) => sum + item.cpa, 0) / items.length).toFixed(2));
    const avgIr = Number((items.reduce((sum, item) => sum + item.ir, 0) / items.length).toFixed(3));
    const status: CreativeFeedbackStatus = winnerCount > 0 ? 'Winner' : failedCount >= Math.ceil(items.length / 2) ? 'Failed' : 'Learning';

    return {
      scheduleId,
      requirementCount: new Set(items.map((item) => item.requirementId)).size,
      launchedCreativeCount: items.length,
      totalSpent,
      totalInstalls,
      winnerCount,
      failedCount,
      avgCpi,
      avgCpa,
      avgIr,
      status,
      insight: status === 'Winner'
        ? '该方向已有可放量版本，建议复盘共性表达并继续扩量。'
        : status === 'Failed'
          ? '该方向多数版本未达标，建议回到方向假设重新拆解。'
          : '该方向仍在观察期，继续积累版本和渠道表现。',
    };
  });
};
```

- [ ] **Step 5: Run type check**

```bash
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add services/mockData.ts
git commit -m "feat: mock creative feedback data"
```

---

## Task 3: Wire Feedback Data Into Requirement Center State

**Files:**
- Modify: `components/RequirementCenter.tsx`

- [ ] **Step 1: Import mock helpers and types**

Add imports from `services/mockData`:

```ts
generateFinishedCreativePerformance,
summarizeRequirementFeedback,
summarizeDirectionFeedback,
```

Add type imports if needed:

```ts
FinishedCreativePerformance,
RequirementFeedbackSummary,
DirectionFeedbackSummary,
```

- [ ] **Step 2: Create memoized feedback data after `requirements` state**

Add:

```ts
const finishedCreativePerformance = useMemo(
  () => generateFinishedCreativePerformance(requirements),
  [requirements],
);

const requirementFeedbackSummaries = useMemo(
  () => summarizeRequirementFeedback(finishedCreativePerformance),
  [finishedCreativePerformance],
);

const directionFeedbackSummaries = useMemo(
  () => summarizeDirectionFeedback(finishedCreativePerformance),
  [finishedCreativePerformance],
);

const requirementFeedbackMap = useMemo(
  () => new Map(requirementFeedbackSummaries.map((item) => [item.requirementId, item])),
  [requirementFeedbackSummaries],
);

const directionFeedbackMap = useMemo(
  () => new Map(directionFeedbackSummaries.map((item) => [item.scheduleId, item])),
  [directionFeedbackSummaries],
);
```

- [ ] **Step 3: Add status style helper**

Add a local helper near existing status style functions:

```ts
const getFeedbackStatusStyle = (status: string) => {
  switch (status) {
    case 'Winner':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Failed':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'Flat':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Paused':
      return 'border-slate-200 bg-slate-100 text-slate-500';
    default:
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  }
};
```

- [ ] **Step 4: Pass requirement-specific feedback into `RequirementDetail`**

When rendering `RequirementDetail`, pass:

```tsx
finishedCreativePerformance={finishedCreativePerformance.filter((item) => item.requirementId === selectedReq.id)}
feedbackSummary={requirementFeedbackMap.get(selectedReq.id)}
```

This requires Task 4 to add props.

- [ ] **Step 5: Run type check**

```bash
npm run lint
```

Expected: may fail until Task 4 props are added. If implementing task-by-task, make Task 4 immediately after this without committing broken code.

---

## Task 4: Add Data Feedback Section To Requirement Detail

**Files:**
- Modify: `components/RequirementDetail.tsx`

- [ ] **Step 1: Import new types**

Add:

```ts
import { FinishedCreativePerformance, RequirementFeedbackSummary } from '../types';
```

If `RequirementDetail.tsx` already imports from `../types`, merge these into the existing import.

- [ ] **Step 2: Extend props**

Add to the props interface:

```ts
finishedCreativePerformance?: FinishedCreativePerformance[];
feedbackSummary?: RequirementFeedbackSummary;
```

- [ ] **Step 3: Add compact format helpers**

Near existing helper functions, add:

```ts
const formatCurrencyCompact = (value: number) =>
  value >= 10000 ? `$${(value / 10000).toFixed(1)}w` : `$${Math.round(value).toLocaleString()}`;

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
```

If the file already has equivalent helpers, reuse those instead of duplicating.

- [ ] **Step 4: Add `renderFeedbackSection`**

Create a section function inside the component:

```tsx
const renderFeedbackSection = () => {
  const rows = finishedCreativePerformance || [];

  return (
    <section className="border-t border-slate-100 px-6 py-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Feedback</p>
          <h3 className="mt-1 text-sm font-black text-slate-900">数据回流复盘</h3>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
            成片表现只回流到需求和版本复盘，不自动进入资产库。
          </p>
        </div>
        {feedbackSummary && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-right">
            <p className="text-[10px] font-black text-indigo-500">建议动作</p>
            <p className="text-sm font-black text-indigo-700">{feedbackSummary.nextAction}</p>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm font-black text-slate-700">暂无成片投放回流</p>
          <p className="mt-1 text-xs font-bold text-slate-400">上传并上线成片后，这里展示版本表现与复盘建议。</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-150 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-3 py-3">版本</th>
                <th className="px-3 py-3">渠道</th>
                <th className="px-3 py-3 text-right">消耗</th>
                <th className="px-3 py-3 text-right">CPI</th>
                <th className="px-3 py-3 text-right">IR</th>
                <th className="px-3 py-3 text-right">D7 ROAS</th>
                <th className="px-3 py-3">结论</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-black text-slate-800">{row.versionName}</td>
                  <td className="px-3 py-3 font-bold text-slate-500">{row.channel}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-700">{formatCurrencyCompact(row.spent)}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-700">${row.cpi.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-700">{formatPercent(row.ir)}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-700">{formatPercent(row.roasD7)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-black ${getFeedbackStatusStyle(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {feedbackSummary && (
        <div className="mt-3 rounded-xl border border-slate-150 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold leading-relaxed text-slate-600">{feedbackSummary.insight}</p>
        </div>
      )}
    </section>
  );
};
```

If `getFeedbackStatusStyle` is not available in this file, define the same helper locally or pass a class from parent. Prefer local helper for lower coupling.

- [ ] **Step 5: Place the section**

Place `{renderFeedbackSection()}` near the lower part of the detail view, after script/version information and before destructive actions.

- [ ] **Step 6: Run type check**

```bash
npm run lint
```

- [ ] **Step 7: Commit Tasks 3 and 4 together**

```bash
git add components/RequirementCenter.tsx components/RequirementDetail.tsx
git commit -m "feat: show requirement data feedback"
```

---

## Task 5: Add Feedback Signals To Direction Cards And Requirement Rows

**Files:**
- Modify: `components/RequirementCenter.tsx`

- [ ] **Step 1: Add direction card feedback badge**

Inside each coordinated direction card, find `const scheduleRiskItems = ...` and add:

```ts
const feedback = directionFeedbackMap.get(s.id);
```

Render a compact badge near existing progress/risk metadata:

```tsx
{feedback && (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-black ${getFeedbackStatusStyle(feedback.status)}`}
    title={feedback.insight}
  >
    数据回流 {feedback.winnerCount}/{feedback.launchedCreativeCount}
  </span>
)}
```

- [ ] **Step 2: Add requirement row feedback chip**

Inside requirement list rows, add:

```ts
const feedback = requirementFeedbackMap.get(req.id);
```

Render near status columns or requirement name:

```tsx
{feedback && (
  <span
    className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-black ${getFeedbackStatusStyle(feedback.status)}`}
    title={feedback.insight}
  >
    {feedback.nextAction}
  </span>
)}
```

- [ ] **Step 3: Add a quick feedback summary strip above the requirement list**

Compute:

```ts
const feedbackOverview = {
  launched: finishedCreativePerformance.length,
  winners: finishedCreativePerformance.filter((item) => item.status === 'Winner').length,
  failed: finishedCreativePerformance.filter((item) => item.status === 'Failed').length,
  totalSpent: finishedCreativePerformance.reduce((sum, item) => sum + item.spent, 0),
};
```

Render a restrained summary strip in the list view header:

```tsx
<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
  <div className="rounded-xl border border-slate-150 bg-white px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">上线成片</p>
    <p className="mt-1 text-xl font-black text-slate-900">{feedbackOverview.launched}</p>
  </div>
  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">放量信号</p>
    <p className="mt-1 text-xl font-black text-emerald-700">{feedbackOverview.winners}</p>
  </div>
  <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">需复盘</p>
    <p className="mt-1 text-xl font-black text-rose-700">{feedbackOverview.failed}</p>
  </div>
  <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">累计消耗</p>
    <p className="mt-1 text-xl font-black text-indigo-700">{formatCurrencyCompact(feedbackOverview.totalSpent)}</p>
  </div>
</div>
```

Use existing currency formatting helpers if available.

- [ ] **Step 4: Run type check**

```bash
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add components/RequirementCenter.tsx
git commit -m "feat: surface data feedback in requirement center"
```

---

## Task 6: Add Review-Oriented Data View Without Replacing Existing Analysis Pages

**Files:**
- Modify: `components/CreativeAnalysis.tsx`
- Optional Modify: `components/Overview.tsx`

- [ ] **Step 1: Decide placement**

Use existing sub-tab behavior if available. If `CreativeAnalysis` has tabs or sections, add a restrained section named `需求复盘` or `方向复盘`. Do not create a landing-style page.

- [ ] **Step 2: Reuse the same mock feedback helpers**

Import:

```ts
generateRequirements,
generateFinishedCreativePerformance,
summarizeDirectionFeedback,
```

Inside the component:

```ts
const feedbackRequirements = useMemo(() => generateRequirements(), []);
const feedbackRows = useMemo(() => generateFinishedCreativePerformance(feedbackRequirements), [feedbackRequirements]);
const directionFeedback = useMemo(() => summarizeDirectionFeedback(feedbackRows), [feedbackRows]);
```

- [ ] **Step 3: Add a compact direction review table**

Render:

```tsx
<section className="rounded-2xl border border-slate-150 bg-white p-5">
  <div className="mb-4 flex items-center justify-between gap-4">
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direction Review</p>
      <h3 className="text-sm font-black text-slate-900">方向数据回流复盘</h3>
    </div>
  </div>
  <div className="overflow-hidden rounded-xl border border-slate-150">
    <table className="w-full text-left text-xs">
      <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
        <tr>
          <th className="px-3 py-3">方向</th>
          <th className="px-3 py-3 text-right">上线成片</th>
          <th className="px-3 py-3 text-right">Winner</th>
          <th className="px-3 py-3 text-right">消耗</th>
          <th className="px-3 py-3 text-right">CPI</th>
          <th className="px-3 py-3">结论</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {directionFeedback.map((row) => (
          <tr key={row.scheduleId}>
            <td className="px-3 py-3 font-black text-slate-800">{row.scheduleId}</td>
            <td className="px-3 py-3 text-right font-bold text-slate-600">{row.launchedCreativeCount}</td>
            <td className="px-3 py-3 text-right font-bold text-emerald-600">{row.winnerCount}</td>
            <td className="px-3 py-3 text-right font-bold text-slate-600">{formatCurrencyCompact(row.totalSpent)}</td>
            <td className="px-3 py-3 text-right font-bold text-slate-600">${row.avgCpi.toFixed(2)}</td>
            <td className="px-3 py-3 text-xs font-bold text-slate-500">{row.insight}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
```

Map `scheduleId` to direction names if the component has schedule data available; otherwise add this mapping in the mock helper later.

- [ ] **Step 4: Run type check**

```bash
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add components/CreativeAnalysis.tsx components/Overview.tsx
git commit -m "feat: add direction feedback review"
```

---

## Task 7: Update Product Docs For New Boundary

**Files:**
- Modify: `docs/requirement-platform-execution-plan.md`
- Modify: `docs/requirement-platform-roadmap.md`
- Modify: `docs/requirement-script-workbench-guidelines.md`

- [ ] **Step 1: Update execution plan**

Replace any wording that implies uploaded finished creatives automatically become asset-library items.

Use this product rule:

```md
- 成片上传后回写需求、版本和制作任务状态，并进入数据回流复盘；不自动进入资产库。
- 资产库保持手动录入和人工治理，用于沉淀可复用资产、组件和片段。
- 需求脚本中的 `引用成片` 是独立参考来源，用于引用近期成片表现和复盘素材，不等同于 `引用资产库`。
```

- [ ] **Step 2: Update roadmap phase order**

Make data feedback review the next priority after production scheduling:

```md
## 第三阶段：数据回流复盘

目标：让成片投放表现回流到需求、版本和方向，支持判断放量、迭代、暂停或继续观察。
```

Move asset-library automation language later and soften it:

```md
## 第四阶段：资产治理

目标：资产库保持手动录入和人工治理，沉淀可复用资产。成片可作为复盘参考，但不自动转为资产。
```

- [ ] **Step 3: Update script workbench guideline**

Under `需求参考规范`, clarify:

```md
- `引用成片` 与 `引用资产库` 保持独立：成片来自已上线或待观察的投放素材，用于复盘和参考；资产库来自手动录入的可复用资产，不由成片自动生成。
```

- [ ] **Step 4: Run type check**

Docs only, but still run:

```bash
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add docs/requirement-platform-execution-plan.md docs/requirement-platform-roadmap.md docs/requirement-script-workbench-guidelines.md
git commit -m "docs: clarify creative feedback and asset boundaries"
```

---

## Task 8: Visual QA And Build Verification

**Files:**
- No source changes unless QA finds layout bugs.

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: TypeScript passes.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Vite build passes.

- [ ] **Step 3: Start local dev server**

```bash
npm run dev
```

Expected: local URL printed by Vite, usually `http://localhost:5173/`.

- [ ] **Step 4: Browser visual checks**

Check:

- Requirement center coordinated board: direction cards show feedback badges without crowding risk/status metadata.
- Requirement center list view: feedback summary strip and row chips fit desktop width.
- Requirement detail modal/page: data feedback section appears after version/script content and before destructive actions.
- Creative analysis page: direction feedback table does not duplicate existing table headers awkwardly.
- Mobile or narrow viewport: table areas scroll horizontally instead of overlapping.

- [ ] **Step 5: Commit QA fixes if needed**

```bash
git add components/RequirementCenter.tsx components/RequirementDetail.tsx components/CreativeAnalysis.tsx
git commit -m "fix: polish data feedback layout"
```

---

## Acceptance Criteria

- 成片不会自动进入资产库，代码和文档都明确这一点。
- 资产库仍然用于手动录入、人工治理、可复用资产引用。
- 需求详情能看到该需求下版本级成片表现。
- 需求大表或方向卡片能看到数据回流状态，例如 Winner、Failed、Learning。
- 数据分析页能从方向维度看到回流复盘，而不是只看独立素材指标。
- `npm run lint` 通过。
- 涉及主要界面后，完成一次本地浏览器视觉检查。

## Risks And Tradeoffs

- `RequirementCenter.tsx` 已经很大，本计划为了快速验证业务闭环仍会继续接入少量逻辑；后续应拆出 feedback hooks 和子组件。
- mock 数据会让复盘链路可见，但真实数据接口接入前，指标口径仍需要产品确认。
- `Winner` / `Failed` 等规则先用前端阈值模拟，不能当作真实投放决策标准。
- 如果直接在多个页面各自生成 mock 数据，可能出现同一需求在不同页面数据不一致；执行时应尽量让同一页面内的数据来自同一组 memoized source。

## Open Questions

- 真实成片数据来源是投放平台导入、BI 表同步，还是先由人工上传 CSV？
- `Winner` 的业务阈值按 CPI、CPA、IR、D7 ROAS 还是按项目/渠道分层？
- 成片复盘是否需要支持人工结论覆盖系统建议？
- 方向复盘是否按自然周、需求周期、投放周期还是自定义日期范围聚合？
- 是否需要在需求详情里提供“基于该成片创建迭代需求”的入口？这应该创建新需求，不应该创建资产。

