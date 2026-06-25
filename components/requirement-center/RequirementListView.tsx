import type React from "react";
import {
  ChevronDown,
  Copy,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import DateRangePicker from "../DateRangePicker";
import type {
  CreativeForm,
  Requirement,
  RequirementDeliveryStatus,
  RequirementPriority,
  RequirementProdStatus,
  RequirementReqStatus,
} from "../../types";
import {
  DeliveryChannelsCell,
  DropdownCheckbox,
  DropdownSelectedCheck,
  FILTER_ALL,
  FILTER_DROPDOWN_PANEL_CLASS,
  PersonAvatarStack,
  PersonBadge,
  ProductionSubmitDateDisplay,
  getSubmitTimeBadge,
} from ".";

type RequirementFilters = {
  materialStage: string;
  broadDirection: string;
  creativePersonnel: string;
  priority: string;
  reqStatus: string;
  prodStatus: string;
  assetType: string;
  scheduleRisk: string;
};

type FilterConfig = {
  key: string;
  label: string;
  options: string[];
};

type InlineDropdownArgs<T extends string> = {
  menuKey: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onSelect: (value: T) => void;
  triggerClassName: string;
  panelClassName?: string;
};

type RenderRequirementInlineDropdown = <T extends string>(
  args: InlineDropdownArgs<T>,
) => React.ReactNode;

export const RequirementListView = ({
  searchQuery,
  filters,
  filterConfigs,
  openRequirementFilterKey,
  createdRangeStart,
  createdRangeEnd,
  completedRangeStart,
  completedRangeEnd,
  requirementFilterRef,
  hasActiveRequirementQuery,
  filteredRequirements,
  todayDateString,
  onSearchQueryChange,
  onOpenCreate,
  onOpenCreateType,
  onOpenRequirementFilter,
  onClearRequirementFilter,
  onToggleRequirementFilterOption,
  onCreatedRangeChange,
  onCompletedRangeChange,
  onResetFilters,
  getFilterDisplayText,
  getFilterOptionLabel,
  getRequirementVersionGroup,
  onOpenIterationDirectionSelector,
  onAddSubRequirement,
  renderRequirementInlineDropdown,
  updateRequirement,
  getPriorityStyle,
  getStatusStyle,
  getProdStatusStyle,
  getDeliveryStatusStyle,
  getDeliveryStatusLabel,
  onOpenRequirement,
  onDeleteRequirement,
}: {
  searchQuery: string;
  filters: RequirementFilters;
  filterConfigs: FilterConfig[];
  openRequirementFilterKey: string | null;
  createdRangeStart: string;
  createdRangeEnd: string;
  completedRangeStart: string;
  completedRangeEnd: string;
  requirementFilterRef: React.RefObject<HTMLDivElement>;
  hasActiveRequirementQuery: boolean;
  filteredRequirements: Requirement[];
  todayDateString: string;
  onSearchQueryChange: (value: string) => void;
  onOpenCreate: () => void;
  onOpenCreateType: (type: CreativeForm) => void;
  onOpenRequirementFilter: (key: string) => void;
  onClearRequirementFilter: (key: string) => void;
  onToggleRequirementFilterOption: (key: string, option: string) => void;
  onCreatedRangeChange: (range: { start: string; end: string }) => void;
  onCompletedRangeChange: (range: { start: string; end: string }) => void;
  onResetFilters: () => void;
  getFilterDisplayText: (value: string) => string;
  getFilterOptionLabel: (option: string) => string;
  getRequirementVersionGroup: (source: Requirement) => Requirement[];
  onOpenIterationDirectionSelector: (
    source: Requirement,
    mode: "single" | "all",
    event: React.MouseEvent,
  ) => void;
  onAddSubRequirement: (parent: Requirement, event: React.MouseEvent) => void;
  renderRequirementInlineDropdown: RenderRequirementInlineDropdown;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  getPriorityStyle: (priority: RequirementPriority) => string;
  getStatusStyle: (status: RequirementReqStatus) => string;
  getProdStatusStyle: (status: RequirementProdStatus) => string;
  getDeliveryStatusStyle: (status: RequirementDeliveryStatus) => string;
  getDeliveryStatusLabel: (status: RequirementDeliveryStatus) => string;
  onOpenRequirement: (requirement: Requirement) => void;
  onDeleteRequirement: (id: string, event: React.MouseEvent) => void;
}) => (
  <>
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
            <input
              type="text"
              placeholder="搜索编号、名称..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 bg-primary text-white text-[11px] font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 新增需求
          </button>
        </div>
      </div>

      <div className="border-t border-slate-50 pt-4">
        <div ref={requirementFilterRef} className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="mr-1 shrink-0 text-[11px] font-black text-slate-400">
            快速过滤:
          </span>

          {filterConfigs.map((config) => {
            const currentValue = filters[config.key as keyof RequirementFilters];
            const selectedValues =
              !currentValue || currentValue === FILTER_ALL
                ? []
                : currentValue.split("|").filter(Boolean);
            const isActive = selectedValues.length > 0;
            const isOpen = openRequirementFilterKey === config.key;

            return (
              <div key={config.key} className="relative">
                <button
                  type="button"
                  onClick={() => onOpenRequirementFilter(config.key)}
                  className={`inline-flex h-9 min-w-[152px] items-center justify-between gap-2 rounded-xl border px-3 shadow-3xs transition-all ${
                    isActive
                      ? "border-indigo-200 bg-indigo-50 pr-8 text-indigo-700"
                      : "border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-[10px] font-black text-slate-400">
                      {config.label}:
                    </span>
                    <span className="max-w-[76px] truncate text-[11px] font-black">
                      {getFilterDisplayText(currentValue)}
                    </span>
                  </span>
                  {!isActive && (
                    <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  )}
                </button>
                {isActive && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClearRequirementFilter(config.key);
                    }}
                    className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-lg text-indigo-400 transition-all hover:bg-white/80 hover:text-rose-500"
                    aria-label={`清除${config.label}筛选`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}

                {isOpen && (
                  <div className={FILTER_DROPDOWN_PANEL_CLASS}>
                    <button
                      type="button"
                      onClick={() => onToggleRequirementFilterOption(config.key, FILTER_ALL)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                        !isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span>全部</span>
                      {!isActive && <DropdownSelectedCheck />}
                    </button>
                    <div className="my-1 h-px bg-slate-100" />
                    {config.options.filter((opt) => opt !== FILTER_ALL).map((opt) => {
                      const checked = selectedValues.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onToggleRequirementFilterOption(config.key, opt)}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                            checked ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <DropdownCheckbox checked={checked} />
                          <span className="truncate">{getFilterOptionLabel(opt)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <DateRangePicker
            label="提出时间:"
            start={createdRangeStart}
            end={createdRangeEnd}
            onChange={onCreatedRangeChange}
            compact
            className="min-w-[260px]"
          />

          <DateRangePicker
            label="完成时间:"
            start={completedRangeStart}
            end={completedRangeEnd}
            onChange={onCompletedRangeChange}
            compact
            className="min-w-[260px]"
          />

          <button
            type="button"
            onClick={onResetFilters}
            className="h-9 rounded-xl border border-transparent px-3 text-[10px] font-black text-slate-400 transition-all hover:border-rose-150 hover:bg-rose-50 hover:text-rose-600"
          >
            清除筛选
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm">
      {!hasActiveRequirementQuery ? (
        <div className="h-full min-h-[520px] flex items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50/70">
          <div className="w-full max-w-4xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm mb-5">
              <PlusCircle className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              新建需求
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500 leading-relaxed max-w-md">
              先创建新的创意需求；需要查历史需求时，再使用上方搜索或筛选条件展开对应列表。
            </p>

            <div className="mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  type: "Video" as CreativeForm,
                  label: "创建视频需求",
                  className:
                    "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25",
                },
                {
                  type: "Image" as CreativeForm,
                  label: "创建图片需求",
                  className:
                    "bg-slate-900 hover:bg-slate-805 shadow-slate-900/25",
                },
                {
                  type: "Playable" as CreativeForm,
                  label: "创建试玩需求",
                  className:
                    "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25",
                },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onOpenCreateType(item.type)}
                  className={`inline-flex h-16 w-full cursor-pointer items-center justify-center gap-4 rounded-[2rem] px-8 text-base font-black text-white shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg ${item.className}`}
                >
                  <Plus className="h-7 w-7 shrink-0 stroke-[2.2]" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-auto no-scrollbar">
          <table className="w-full min-w-[1520px] text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                <th className="px-4 py-3 font-sans whitespace-nowrap w-[150px]">编号</th>
                <th className="px-4 py-3 font-sans whitespace-nowrap w-[120px]">预览</th>
                <th className="px-4 py-3 font-sans whitespace-nowrap w-[220px]">需求名称</th>
                <th className="px-4 py-3 text-center font-sans whitespace-nowrap w-[110px]">优先级</th>
                <th className="px-4 py-3 font-sans whitespace-nowrap w-[120px]">创意人员</th>
                <th className="px-4 py-3 text-center font-sans whitespace-nowrap w-[110px]">制作人员</th>
                <th className="px-4 py-3 text-center font-sans whitespace-nowrap w-[170px]">投放渠道</th>
                <th className="px-4 py-3 text-center font-sans whitespace-nowrap w-[148px]">制作提交</th>
                <th className="px-4 py-3 text-center font-sans whitespace-nowrap w-[130px]">需求状态</th>
                <th className="px-4 py-3 text-center font-sans whitespace-nowrap w-[130px]">制作状态</th>
                <th className="px-4 py-3 text-center font-sans whitespace-nowrap w-[130px]">投放状态</th>
                <th className="px-4 py-3 text-right font-sans whitespace-nowrap w-[80px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px]">
              {filteredRequirements.map((req) => {
                const requirementLevel = (req as Requirement & { level?: number }).level ?? 0;
                const isParentRequirement = requirementLevel === 0;
                const iterationGroup = getRequirementVersionGroup(req);
                const iterationPreviewText =
                  iterationGroup.length > 1
                    ? `将复制 ${iterationGroup.map((item) => item.id).join("、")}，并按原小版本顺序生成新大版本`
                    : "当前大版本只有 1 条需求，将生成 -01 迭代版本";
                const submitDate = req.endDate || "";
                const submitBadge = getSubmitTimeBadge(submitDate, todayDateString);

                return (
                  <tr
                    key={req.id}
                    onClick={() => onOpenRequirement(req)}
                    className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <td className="px-4 py-3 text-slate-400 font-medium group-hover:text-primary relative font-mono">
                      {requirementLevel > 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                          <div className="w-3 h-[1px] bg-slate-200 ml-2" />
                          <div className="w-[1px] h-full bg-slate-200 absolute -left-1 bottom-1/2" />
                        </div>
                      )}
                      <div className={`flex items-center gap-2 ${requirementLevel > 0 ? "ml-4" : ""}`}>
                        <span className="whitespace-nowrap">{req.id}</span>
                        <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                          <div className="group/iter relative">
                            <button
                              type="button"
                              onClick={(event) =>
                                onOpenIterationDirectionSelector(req, "single", event)
                              }
                              className="rounded-md border border-blue-100 bg-blue-50 p-1 text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100"
                              title="迭代当前需求"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <div className="pointer-events-none absolute left-0 top-full z-[90] mt-2 hidden w-56 rounded-xl border border-slate-150 bg-white p-3 text-left shadow-xl group-hover/iter:block">
                              <div className="text-[10px] font-black text-slate-800">迭代当前需求</div>
                              <div className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">
                                先选择方向，生成新大版本的 -01，并引用 {req.id} 的描述和引用信息。
                              </div>
                            </div>
                          </div>
                          {isParentRequirement && (
                            <div className="group/iterall relative">
                              <button
                                type="button"
                                onClick={(event) =>
                                  onOpenIterationDirectionSelector(req, "all", event)
                                }
                                className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                                title="迭代全部版本"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <div className="pointer-events-none absolute left-0 top-full z-[90] mt-2 hidden w-64 rounded-xl border border-slate-150 bg-white p-3 text-left shadow-xl group-hover/iterall:block">
                                <div className="text-[10px] font-black text-slate-800">迭代全部版本</div>
                                <div className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">
                                  {iterationPreviewText}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="group/addsub relative">
                            <button
                              type="button"
                              onClick={(event) => onAddSubRequirement(req, event)}
                              className="rounded-md border border-emerald-100 bg-emerald-50 p-1 text-emerald-600 transition-all hover:border-emerald-300 hover:bg-emerald-100"
                              title="添加子需求"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <div className="pointer-events-none absolute left-0 top-full z-[90] mt-2 hidden w-56 rounded-xl border border-slate-150 bg-white p-3 text-left shadow-xl group-hover/addsub:block">
                              <div className="text-[10px] font-black text-slate-800">添加子需求</div>
                              <div className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400">
                                有空草稿版本时直接打开；没有则按当前大版本顺序生成下一条子需求。
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(req.previews || []).slice(0, 2).map((preview, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded bg-slate-100 overflow-hidden border border-slate-200 shrink-0"
                          >
                            <img
                              src={preview}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-bold font-sans">
                      <span className="block max-w-[200px] truncate" title={req.name}>
                        {req.name}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-center font-sans">
                        {renderRequirementInlineDropdown<RequirementPriority>({
                          menuKey: `${req.id}:list:priority`,
                          value: req.priority,
                          options: [
                            { value: "Low", label: "低" },
                            { value: "Mid", label: "中" },
                            { value: "High", label: "高" },
                            { value: "Highest", label: "最高" },
                          ],
                          onSelect: (value) => updateRequirement(req.id, { priority: value }),
                          triggerClassName: `h-7 min-w-[76px] rounded-lg border border-transparent px-2 text-[10px] font-black ${getPriorityStyle(req.priority)}`,
                          panelClassName: "w-32",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <PersonBadge name={req.creativePersonnel} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <PersonAvatarStack people={req.productionPersonnel} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DeliveryChannelsCell channels={req.channels} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ProductionSubmitDateDisplay date={submitDate} badge={submitBadge} />
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-center font-sans">
                        {renderRequirementInlineDropdown<RequirementReqStatus>({
                          menuKey: `${req.id}:list:reqStatus`,
                          value: req.reqStatus,
                          options: [
                            { value: "Draft", label: "草稿" },
                            { value: "Pending", label: "待审核" },
                            { value: "Approved", label: "审核通过" },
                            { value: "Modification", label: "需求修改" },
                          ],
                          onSelect: (value) => updateRequirement(req.id, { reqStatus: value }),
                          triggerClassName: `h-7 min-w-[92px] rounded-full border border-transparent px-2.5 text-[10px] font-bold ${getStatusStyle(req.reqStatus)}`,
                          panelClassName: "w-36",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-center font-sans">
                        {renderRequirementInlineDropdown<RequirementProdStatus>({
                          menuKey: `${req.id}:list:prodStatus`,
                          value: req.prodStatus,
                          options: [
                            { value: "Unscheduled", label: "未排期" },
                            { value: "Scheduled", label: "已排期" },
                            { value: "InProgress", label: "进行中" },
                            { value: "Completed", label: "已完成" },
                          ],
                          onSelect: (value) => updateRequirement(req.id, { prodStatus: value }),
                          triggerClassName: `h-7 min-w-[82px] rounded-lg border px-2 text-[10px] font-bold ${getProdStatusStyle(req.prodStatus)}`,
                          panelClassName: "w-32",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-center font-sans">
                        <span
                          className={`inline-flex min-w-[82px] items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg border font-bold ${getDeliveryStatusStyle(req.deliveryStatus)}`}
                          title="投放状态由三方投放数据同步，需求界面不可手动修改"
                        >
                          {req.deliveryStatus === "Delivering" ? (
                            <Play className="w-2.5 h-2.5 fill-current" />
                          ) : (
                            <Pause className="w-2.5 h-2.5 fill-current" />
                          )}
                          {getDeliveryStatusLabel(req.deliveryStatus)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="relative group/action inline-block font-sans">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-slate-100 rounded-xl shadow-xl z-[80] py-1 hidden group-hover/action:block">
                          <button
                            onClick={(event) => onDeleteRequirement(req.id, event)}
                            className="w-full px-3 py-1.5 text-left text-rose-500 hover:bg-rose-50 flex items-center gap-2 font-bold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> 删除
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
);
