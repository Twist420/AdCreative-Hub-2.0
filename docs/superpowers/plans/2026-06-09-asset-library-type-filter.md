# Asset Library Type Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add resource-site-style type tag filtering to the asset library, then reuse the same filter language in requirement asset picking.

**Architecture:** Keep the existing left folder tree as the asset ownership/navigation layer, and add a top horizontal facet bar as the fast browsing/filter layer. The first implementation stays front-end and mock-data driven, but the filter model should be typed so it can later move into service/API queries without changing UI language.

**Tech Stack:** Vite + React + TypeScript, existing `LibraryItem` data model, Tailwind utility classes, lucide-react icons.

---

## Current Context

The platform route map in `docs/requirement-platform-execution-plan.md` says the product is moving toward a complete workflow:

1. Direction creation.
2. Requirement creation and type-based script templates.
3. Review and manual scheduling.
4. Production task progress.
5. Final asset upload.
6. Asset library reuse.
7. Data feedback.

The new asset-library requirement belongs to stage four, but should be implemented earlier because requirement script templates already use asset references. A better asset browsing model will improve both the standalone asset library and the `引用资产` modal in `components/RequirementScriptWorkbench.tsx`.

Current asset library facts:

- Main file: `components/AssetLibrary.tsx`.
- Data type: `LibraryItem` in `types.ts`.
- Mock items already have `type`, `subType`, `tags`, `status`, `createdAt`, `duration`, `citationCount`, and `performance`.
- Existing navigation:
  - Left sidebar folder tree: ownership/category hierarchy.
  - Top search: fuzzy search inside current folder.
  - Sort chips: citation, spend, installs, IR, CPI, updated time, duration.
- Existing gap:
  - There is no resource-site-style horizontal type tag area.
  - Folder category and user-facing content type are mixed together.
  - Requirement asset picker has its own small hard-coded filter chips, so users learn a different filter language there.

## Product Rules

- Left folder tree answers: “这个资产归在哪个库里？”
- Top type tags answer: “我现在想看哪类素材？”
- Search answers: “我知道关键词，直接定位。”
- Sort answers: “这些结果里按什么优先看？”
- Tags and filters must combine, not replace each other.
- The default asset library screen should feel like browsing a resource site: top shows popular types and quick states; list updates immediately.
- Type tags should be visually compact and scan-friendly, using the existing Indigo active state and Slate neutral style from `components/UiSpecification.tsx`.
- Do not add another nested card layer around the toolbar.
- Do not replace the left folder tree in this iteration.

## Proposed Filter Model

Use front-end derived facets first:

```ts
export type AssetTypeFacetId =
  | 'all'
  | 'fragment'
  | 'component'
  | 'ai_hook'
  | 'live_hook'
  | 'gameplay'
  | 'billboard'
  | 'scene'
  | 'ui'
  | 'effect'
  | 'audio'
  | 'character'
  | 'recommended'
  | 'with_data';

export interface AssetTypeFacet {
  id: AssetTypeFacetId;
  label: string;
  group: 'main' | 'fragment' | 'component' | 'status';
  match: (item: LibraryItem) => boolean;
}
```

Initial visible groups:

- Primary: `全部`, `片段`, `组件`.
- Common fragment types: `AI前贴`, `真人前贴`, `玩法`, `大字报`.
- Common component types: `场景`, `UI`, `特效`, `音频`, `人物`.
- Quality states: `推荐`, `有投放数据`.

After user feedback, the filter should behave closer to a resource-site taxonomy rather than a single chip row. The first production UI should include:

- `热门推荐`: 全部资产、推荐资产、有投放数据、高复用、近期上传、AI前贴、真人前贴、玩法展示、大字报、奖励爆点。
- `资源类型`: 视频片段、前贴/Hook、玩法段、剧情段、大字报段、场景/背景、UI/面板、特效/粒子、音效/BGM、人物/形象、3D模型。
- `主题题材`: 奇幻魔法、冰雪极地、火焰恶魔、科技极客、漫画卡通、惊喜反应、奖励反馈、解压爽感、升级成长、强文案吸睛。
- `角色生物`: 男性、女性、公主/王子、法师/巫师、龙/巨龙、恶魔、独角兽、动物形象。
- `玩法机制`: 合成、塔防、三消、Boss战、解锁升级、3D表现、真人实拍、AI生成、全屏文案。
- `场景环境`: 冰原/雪地、城堡、太空/沙、朋克/科技、背景板、面板弹窗、粒子特效。
- `关键词`: 冰雪、神秘、宝箱、金币、弹窗、音乐、ASMR、推荐、停用、数据不足、不推荐。

Follow-up display rule: show all major categories in one vertically scrollable panel instead of paging between categories. Each category should stay visible as a dense row with grouped keywords, so users can scan and scroll like a resource website taxonomy.

The first row should show the most useful chips. Overflow or less common tags can be folded under `更多类型`.

## File Structure

- Modify: `types.ts`
  - Add reusable filter/facet types if they are needed outside `AssetLibrary.tsx`.
  - Keep `LibraryItem` compatible with current mock data.
- Modify: `components/AssetLibrary.tsx`
  - Add facet state.
  - Derive counts from `libraryItems` under the current folder/search context.
  - Render the type tag bar under or within the top toolbar.
  - Combine facet filtering into `filteredItems`.
  - Add empty-state copy that explains the current filter combination.
- Modify: `components/RequirementScriptWorkbench.tsx`
  - Reuse the same visible asset type labels in the asset picker modal.
  - Keep CTA/landing picker separate because CTA is single-select and has a different candidate range.
- Modify: `docs/requirement-platform-execution-plan.md`
  - Add this as an early stage-four task and clarify that asset browsing taxonomy should be shared with requirement references.
- Modify: `docs/requirement-script-workbench-guidelines.md`
  - Add a note that asset reference pickers should use the same type/tag language as the asset library.

## Task 1: Define Asset Facet Helpers

**Files:**
- Modify: `components/AssetLibrary.tsx`

- [ ] **Step 1: Add facet constants near folder constants**

Add a small helper after `FOLDER_TREE`:

```tsx
type AssetFacetGroup = 'main' | 'fragment' | 'component' | 'status';

type AssetFacetId =
  | 'all'
  | 'fragment'
  | 'component'
  | 'ai_hook'
  | 'live_hook'
  | 'gameplay'
  | 'billboard'
  | 'scene'
  | 'ui'
  | 'effect'
  | 'audio'
  | 'character'
  | 'recommended'
  | 'with_data';

interface AssetFacet {
  id: AssetFacetId;
  label: string;
  group: AssetFacetGroup;
  match: (item: LibraryItem) => boolean;
}

const ASSET_FACETS: AssetFacet[] = [
  { id: 'all', label: '全部', group: 'main', match: () => true },
  { id: 'fragment', label: '片段', group: 'main', match: item => item.type === 'Fragment' },
  { id: 'component', label: '组件', group: 'main', match: item => item.type === 'Component' },
  { id: 'ai_hook', label: 'AI前贴', group: 'fragment', match: item => item.subType.includes('AI前贴') },
  { id: 'live_hook', label: '真人前贴', group: 'fragment', match: item => item.subType.includes('真人前贴') },
  { id: 'gameplay', label: '玩法', group: 'fragment', match: item => item.subType.includes('玩法') },
  { id: 'billboard', label: '大字报', group: 'fragment', match: item => item.subType.includes('大字报') },
  { id: 'scene', label: '场景', group: 'component', match: item => item.subType.includes('场景') },
  { id: 'ui', label: 'UI', group: 'component', match: item => item.subType === 'UI' },
  { id: 'effect', label: '特效', group: 'component', match: item => item.subType.includes('特效') },
  { id: 'audio', label: '音频', group: 'component', match: item => item.subType.includes('音效') || item.subType.includes('BGM') },
  { id: 'character', label: '人物', group: 'component', match: item => item.subType.includes('人物') || item.subType.includes('形象') },
  { id: 'recommended', label: '推荐', group: 'status', match: item => item.status === 'Recommended' },
  { id: 'with_data', label: '有数据', group: 'status', match: item => Boolean(item.performance?.length) },
];
```

- [ ] **Step 2: Add state**

Inside `AssetLibrary`, add:

```tsx
const [activeFacetId, setActiveFacetId] = useState<AssetFacetId>('all');
```

- [ ] **Step 3: Add active facet lookup**

Add before `filteredItems`:

```tsx
const activeFacet = ASSET_FACETS.find(facet => facet.id === activeFacetId) || ASSET_FACETS[0];
```

- [ ] **Step 4: Include facet in `filteredItems`**

Update the filter so it first checks folder path, then active facet, then search:

```tsx
const filteredItems = libraryItems.filter(item => {
  const itemPath = getItemPath(item);
  const isInActivePath = isItemInPath(itemPath, currentPath);
  const matchesFacet = activeFacet.match(item);

  if (!isInActivePath || !matchesFacet) return false;

  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query)) ||
      item.subType.toLowerCase().includes(query);
  }

  return true;
});
```

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected: existing TypeScript/lint checks pass.

## Task 2: Render Resource-Site Type Tags

**Files:**
- Modify: `components/AssetLibrary.tsx`

- [ ] **Step 1: Add count helper**

Add before return:

```tsx
const facetCounts = useMemo(() => {
  const scopedItems = libraryItems.filter(item => isItemInPath(getItemPath(item), currentPath));
  return ASSET_FACETS.reduce<Record<AssetFacetId, number>>((acc, facet) => {
    acc[facet.id] = scopedItems.filter(facet.match).length;
    return acc;
  }, {} as Record<AssetFacetId, number>);
}, [libraryItems, currentPath, folderTree]);
```

- [ ] **Step 2: Add compact facet bar under the search/sort toolbar**

Insert below the existing top toolbar and before the scroll body:

```tsx
<div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3">
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
    <span className="shrink-0 text-[10px] font-black text-slate-400">类型筛选:</span>
    {ASSET_FACETS.map(facet => {
      const isActive = activeFacetId === facet.id;
      const count = facetCounts[facet.id] || 0;
      return (
        <button
          key={facet.id}
          type="button"
          onClick={() => setActiveFacetId(facet.id)}
          className={`shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-black transition-all ${
            isActive
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          {facet.label}
          <span className={`ml-1.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{count}</span>
        </button>
      );
    })}
  </div>
</div>
```

- [ ] **Step 3: Prevent toolbar wrapping from becoming too tall**

Keep the top search/sort row at a stable height. If the sort chips wrap awkwardly, move sort into a compact `排序` menu in a later task rather than letting the toolbar grow.

- [ ] **Step 4: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

## Task 3: Improve Empty and Filter Feedback

**Files:**
- Modify: `components/AssetLibrary.tsx`

- [ ] **Step 1: Add active filter summary**

Above the asset grid, show a small line only when a non-default facet or search is active:

```tsx
{(activeFacetId !== 'all' || searchQuery.trim()) && (
  <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
    <p className="text-[11px] font-bold text-slate-500">
      当前查看：<span className="font-black text-slate-800">{activeFacet.label}</span>
      {searchQuery.trim() ? <span> / 搜索 “{searchQuery.trim()}”</span> : null}
    </p>
    <button
      type="button"
      onClick={() => {
        setActiveFacetId('all');
        setSearchQuery('');
      }}
      className="text-[10px] font-black text-indigo-600 hover:text-indigo-700"
    >
      清除筛选
    </button>
  </div>
)}
```

- [ ] **Step 2: Update empty copy**

When `sortedItems.length === 0`, use the active filter label:

```tsx
<p className="text-xs">当前目录下没有符合「{activeFacet.label}」的资产</p>
<p className="mt-1 text-[10px] font-normal text-slate-400">可以清除筛选，或上传素材并补充类型标签。</p>
```

- [ ] **Step 3: Verify visual density**

Open `http://localhost:3000/` and navigate to asset library. Check:

- Top tags do not create a nested card.
- Left folder tree still reads as navigation.
- Results update instantly.
- Empty state explains which filter is active.

## Task 4: Align Requirement Asset Picker Vocabulary

**Files:**
- Modify: `components/RequirementScriptWorkbench.tsx`

- [ ] **Step 1: Replace hard-coded chip names with asset-library language**

Current modal chips include `全部资产`, `A段`, `中间段`, `B段`, `CTA`, `图片`. Replace with:

```tsx
const pickerFilterLabels = assetPickerTarget.mode === 'landing'
  ? ['全部落版', '视频落版']
  : ['全部资产', '片段', '组件', 'AI前贴', '真人前贴', '玩法', '大字报', '场景', 'UI'];
```

- [ ] **Step 2: Keep CTA picker separate**

Do not let `CTA/落版` use the multi-select asset picker behavior. It remains single-select and uses `LANDING_OPTIONS`.

- [ ] **Step 3: Add search/filter behavior only if cheap**

If the modal options are still fixed mock arrays, make chips visual only for this task. Do not overbuild filtering logic unless `ASSET_OPTIONS` already carries `type/subType`.

- [ ] **Step 4: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

## Task 5: Document the Shared Taxonomy Rule

**Files:**
- Modify: `docs/requirement-platform-execution-plan.md`
- Modify: `docs/requirement-script-workbench-guidelines.md`

- [ ] **Step 1: Update execution plan stage four**

Add:

```markdown
- 资产库顶部增加类型标签筛选，左侧目录负责资产归属，顶部标签负责快速浏览。
- 需求脚本里的资产引用弹窗沿用资产库同一套类型语言，避免用户在两个地方学习两套分类。
```

- [ ] **Step 2: Update workbench guidelines**

Add under `需求参考规范`:

```markdown
- 引用资产弹窗的类型筛选语言必须与资产库顶部标签保持一致，例如片段、组件、AI前贴、真人前贴、玩法、大字报、场景和 UI。
```

- [ ] **Step 3: Run docs-only check**

No build is required for docs-only change, but if paired with UI code, run:

```bash
npm run lint
```

## Task 6: Visual QA and Commit

**Files:**
- Verify browser only.
- Commit all modified code/docs.

- [ ] **Step 1: Start local server if needed**

Run:

```bash
npm run dev
```

- [ ] **Step 2: Browser QA**

Check these paths:

- Asset library default root.
- Asset library under `片段`.
- Asset library under `组件`.
- A leaf folder such as `AI前贴`.
- Search query with an active type tag.
- Empty result combination.
- Requirement detail -> `需求脚本` -> `引用资产` modal.

- [ ] **Step 3: Final validation**

Run:

```bash
npm run lint
npm run build
```

- [ ] **Step 4: Commit**

Run:

```bash
git add components/AssetLibrary.tsx components/RequirementScriptWorkbench.tsx docs/requirement-platform-execution-plan.md docs/requirement-script-workbench-guidelines.md
git commit -m "feat: add asset library type filters"
```

## Follow-Up Plan

After this iteration is accepted:

- Promote facet constants into a shared `assetTaxonomy` helper if both asset library and picker need real filtering.
- Add multi-select filters for `类型 + 状态 + 比例 + 渠道 + 是否有投放数据`.
- Add saved views such as `高复用片段`, `近期上传`, `可做CTA`, `低CPI素材`.
- Connect asset library filters to real service/API query parameters.
- When production upload is implemented, require uploaded finished assets to fill `type/subType/tags/version/sourceRequirementId/sourceVersionId`.

## Self-Review

- Spec coverage: The plan covers the new type tag browsing requirement, keeps folder navigation, reuses the taxonomy in requirement references, and updates docs.
- Placeholder scan: No `TBD` or vague implementation-only steps remain.
- Type consistency: `AssetFacetId`, `AssetFacet`, `activeFacetId`, and `facetCounts` are consistently named.
