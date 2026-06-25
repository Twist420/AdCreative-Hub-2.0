import type React from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Hash,
  Inbox,
  ListTodo,
  Pause,
  Play,
  Plus,
  Tag,
  Target,
  Trash2,
  X,
} from "lucide-react";
import type {
  CreativeForm,
  CreativeSchedule,
  DeliverySet,
  Requirement,
  RequirementDeliveryStatus,
  RequirementPriority,
  RequirementProdStatus,
  RequirementReqStatus,
} from "../../types";
import { DeliveryChannelsCell, getChannelDisplayName } from "./channel";
import {
  DropdownCheckbox,
  DropdownSelectedCheck,
  FILTER_DROPDOWN_ACTIVE_CLASS,
  FILTER_DROPDOWN_IDLE_CLASS,
} from "./filters";
import { parseDateValue, parseWeekRangeDates, ProductionSubmitDateDisplay, getSubmitTimeBadge } from "./dateUtils";
import { PersonAvatarStack, PersonBadge } from "./people";
import { parseRequirementVersionId } from "./requirementUtils";

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

type ScheduleInsight = {
  status: string;
  statusTone: string;
  suggestion: string;
  completedNotLaunched: number;
};

type WeekVisual = {
  label?: string;
  dotClass?: string;
};

type ScheduleDetailModalProps = {
  selectedScheduleForModal: CreativeSchedule | null;
  schedules: CreativeSchedule[];
  requirements: Requirement[];
  scheduleInsights: Map<string, ScheduleInsight>;
  deliverySets: DeliverySet[];
  cycleAdjustScheduleId: string | null;
  cycleAdjustTargetWeekRange: string;
  cycleAdjustRequirementIds: string[];
  cycleAdjustWeekPickerRef: React.RefObject<HTMLDivElement>;
  isCycleAdjustWeekPickerOpen: boolean;
  todayDateString: string;
  allWeekRanges: string[];
  weekVisualMap: Record<string, WeekVisual>;
  openScheduleInfoMenuKey: string | null;
  scheduleTagInput: string;
  editingScheduleId: string | null;
  setSelectedScheduleForModal: (schedule: CreativeSchedule | null) => void;
  setOpenScheduleInfoMenuKey: React.Dispatch<React.SetStateAction<string | null>>;
  setScheduleTagInput: (value: string) => void;
  setCycleAdjustTargetWeekRange: (value: string) => void;
  setIsCycleAdjustWeekPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCycleAdjustRequirementIds: React.Dispatch<React.SetStateAction<string[]>>;
  setCycleAdjustScheduleId: (value: string | null) => void;
  setSelectedReq: (requirement: Requirement) => void;
  updateSchedule: (id: string, updates: Partial<CreativeSchedule>) => void;
  updateSchedulePriority: (schedule: CreativeSchedule, priority: RequirementPriority) => void;
  addScheduleDirectionTag: (schedule: CreativeSchedule) => void;
  removeScheduleDirectionTag: (schedule: CreativeSchedule, tag: string) => void;
  openCycleAdjustPanel: (schedule: CreativeSchedule) => void;
  applyCycleAdjustment: (schedule: CreativeSchedule) => void;
  createDeliverySetDraft: (schedule: CreativeSchedule) => void;
  handleAddRequirementForDirection: (scheduleId: string) => void;
  toggleCycleAdjustRequirement: (requirementId: string) => void;
  renderRequirementInlineDropdown: RenderRequirementInlineDropdown;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  handleDelete: (id: string, event: React.MouseEvent) => void;
  getPriorityStyle: (priority: RequirementPriority) => string;
  getStatusStyle: (status: RequirementReqStatus) => string;
  getProdStatusStyle: (status: RequirementProdStatus) => string;
  getDeliveryStatusStyle: (status: RequirementDeliveryStatus) => string;
  getDeliveryStatusLabel: (status: RequirementDeliveryStatus) => string;
};

export const ScheduleDetailModal = ({
  selectedScheduleForModal,
  schedules,
  requirements,
  scheduleInsights,
  deliverySets,
  cycleAdjustScheduleId,
  cycleAdjustTargetWeekRange,
  cycleAdjustRequirementIds,
  cycleAdjustWeekPickerRef,
  isCycleAdjustWeekPickerOpen,
  todayDateString,
  allWeekRanges,
  weekVisualMap,
  openScheduleInfoMenuKey,
  scheduleTagInput,
  editingScheduleId,
  setSelectedScheduleForModal,
  setOpenScheduleInfoMenuKey,
  setScheduleTagInput,
  setCycleAdjustTargetWeekRange,
  setIsCycleAdjustWeekPickerOpen,
  setCycleAdjustRequirementIds,
  setCycleAdjustScheduleId,
  setSelectedReq,
  updateSchedule,
  updateSchedulePriority,
  addScheduleDirectionTag,
  removeScheduleDirectionTag,
  openCycleAdjustPanel,
  applyCycleAdjustment,
  createDeliverySetDraft,
  handleAddRequirementForDirection,
  toggleCycleAdjustRequirement,
  renderRequirementInlineDropdown,
  updateRequirement,
  handleDelete,
  getPriorityStyle,
  getStatusStyle,
  getProdStatusStyle,
  getDeliveryStatusStyle,
  getDeliveryStatusLabel,
}: ScheduleDetailModalProps) => {
  if (!selectedScheduleForModal) return null;
          const s =
            schedules.find((item) => item.id === selectedScheduleForModal.id) ||
            selectedScheduleForModal;
          const associatedReqs = requirements
            .filter((r) => r.scheduleId === s.id)
            .sort((a, b) => {
              const aParsed = parseRequirementVersionId(a.id);
              const bParsed = parseRequirementVersionId(b.id);
              const aMajor = aParsed?.majorId || `cp${a.assetIndex}`;
              const bMajor = bParsed?.majorId || `cp${b.assetIndex}`;
              if (aMajor !== bMajor) {
                return b.assetIndex - a.assetIndex;
              }
              return Number(a.assetVersion || 0) - Number(b.assetVersion || 0);
            });
          const modalScheduleInsight = scheduleInsights.get(s.id);
          const modalDeliverySetDrafts = deliverySets.filter((set) =>
            set.scheduleIds.includes(s.id),
          );
          const cycleAdjustCandidates = associatedReqs.filter(
            (req) => req.prodStatus !== "Completed",
          );
          const isCycleAdjustOpen = cycleAdjustScheduleId === s.id;
          const cycleAdjustSelectedIds = new Set(cycleAdjustRequirementIds);
          const cycleAdjustRemainingCount = associatedReqs.filter(
            (req) => !cycleAdjustSelectedIds.has(req.id),
          ).length;
          const cycleAdjustMode = cycleAdjustRemainingCount === 0 ? "move" : "copy";
          const todayTime = parseDateValue(todayDateString) ?? Date.now();
          const cycleAdjustTargetRanges = allWeekRanges.filter((range) => {
            const { endTime } = parseWeekRangeDates(range);
            return range !== s.weekRange && endTime >= todayTime;
          }).sort((a, b) => {
            const aRange = parseWeekRangeDates(a);
            const bRange = parseWeekRangeDates(b);
            return aRange.startTime - bRange.startTime || aRange.endTime - bRange.endTime;
          });

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
              <div className="w-full max-w-7xl h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
                {/* 方向详情头部 */}
                <div className="px-6 py-3 md:px-7 md:py-4 bg-white border-b border-slate-100 flex flex-col gap-2.5 shrink-0 select-none">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-150 rounded-lg text-[10px] font-bold text-slate-500 shadow-3xs">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-700 font-extrabold">{s.id}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-100 rounded-lg text-[10px] font-mono font-bold text-sky-700 shadow-3xs">
                          <Calendar className="w-3 h-3 text-sky-500" />
                          <span>排期周期</span>
                          <span className="text-sky-900 font-black">
                            {s.weekRange || "通用周期"}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(260px,0.48fr)_minmax(360px,1fr)] lg:items-stretch">
                        <div className="flex min-h-[48px] items-center rounded-2xl border border-slate-150 bg-slate-50 px-4 py-2.5">
                          <h2
                            className="min-w-0 text-xl md:text-2xl font-black text-slate-850 tracking-tight break-words leading-tight"
                            title={s.directionName}
                          >
                            {s.directionName || "未命名方向"}
                          </h2>
                        </div>
                        <div className="flex min-h-[48px] items-start gap-2 rounded-2xl border border-slate-150 bg-white px-4 py-2.5 shadow-3xs">
                          <Target className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                          <div className="min-w-0">
                            <div className="text-[10px] font-black text-slate-400">
                              验证目标
                            </div>
                            <p
                              className="mt-0.5 text-xs font-bold leading-relaxed text-slate-700 line-clamp-2"
                              title={s.validationGoal}
                            >
                              {s.validationGoal || "暂无验证目标"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 顶栏操作区域 */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-start">
                      <button
                        onClick={() => setSelectedScheduleForModal(null)}
                        className="p-2.5 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-150 text-slate-500 hover:text-rose-600 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-3xs"
                        title="关闭 [Esc]"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-150 bg-slate-50/70 px-4 py-2.5">
                    <div className="mb-2.5">
                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                        基础信息
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          {
                            key: "form",
                            label: "类型",
                            value: s.form || "Video",
                            display: s.form === "Playable" ? "试玩" : s.form === "Image" ? "图片" : "视频",
                            options: [
                              { value: "Video", label: "视频" },
                              { value: "Image", label: "图片" },
                              { value: "Playable", label: "试玩" },
                            ],
                            onSelect: (value: string) =>
                              updateSchedule(s.id, { form: value as CreativeForm }),
                          },
                          {
                            key: "broadDirection",
                            label: "大方向",
                            value: s.broadDirection || "原始玩法",
                            display: s.broadDirection || "原始玩法",
                            options: [
                              { value: "原始玩法", label: "原始玩法" },
                              { value: "3D玩法", label: "3D玩法" },
                              { value: "大字报", label: "大字报" },
                            ],
                            onSelect: (value: string) =>
                              updateSchedule(s.id, {
                                broadDirection: value as CreativeSchedule["broadDirection"],
                              }),
                          },
                          {
                            key: "materialStage",
                            label: "阶段",
                            value: s.materialStage || "新",
                            display: s.materialStage || "新",
                            options: [
                              { value: "新", label: "新" },
                              { value: "迭", label: "迭" },
                              { value: "老", label: "老" },
                            ],
                            onSelect: (value: string) =>
                              updateSchedule(s.id, {
                                materialStage: value as CreativeSchedule["materialStage"],
                              }),
                          },
                          {
                            key: "priority",
                            label: "优先级",
                            value: s.priority || "Mid",
                            display:
                              s.priority === "Highest"
                                ? "最高"
                                : s.priority === "High"
                                  ? "高"
                                  : s.priority === "Low"
                                    ? "低"
                                    : "中",
                            options: [
                              { value: "Highest", label: "最高" },
                              { value: "High", label: "高" },
                              { value: "Mid", label: "中" },
                              { value: "Low", label: "低" },
                            ],
                            onSelect: (value: string) =>
                              updateSchedulePriority(s, value as RequirementPriority),
                          },
                          {
                            key: "owner",
                            label: "负责人",
                            value: s.owner || "唐欣怡",
                            display: s.owner || "未指派",
                            options: ["唐欣怡", "吉意煊", "马嘉良", "张欢", "吴楠", "宋爽"].map((name) => ({
                              value: name,
                              label: name,
                            })),
                            onSelect: (value: string) => updateSchedule(s.id, { owner: value }),
                          },
                        ].map((item) => {
                          const isOpen = openScheduleInfoMenuKey === item.key;
                          return (
                            <div key={item.key} className="relative">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenScheduleInfoMenuKey((prev) =>
                                    prev === item.key ? null : item.key,
                                  );
                                }}
                                className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-650 shadow-3xs transition-all hover:border-indigo-150 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <span className="text-slate-400">{item.label}</span>
                                <span>{item.display}</span>
                                <ChevronDown
                                  className={`h-3 w-3 shrink-0 text-slate-400 transition-transform ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                              {isOpen && (
                                <div className="absolute left-0 top-full z-[150] mt-2 w-40 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                                  {item.options.map((option) => {
                                    const active = item.value === option.value;
                                    return (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          item.onSelect(option.value);
                                          setOpenScheduleInfoMenuKey(null);
                                        }}
                                        className={`flex h-8 w-full items-center justify-between rounded-xl px-3 text-left text-[11px] font-black transition-all ${
                                          active
                                            ? FILTER_DROPDOWN_ACTIVE_CLASS
                                            : FILTER_DROPDOWN_IDLE_CLASS
                                        }`}
                                      >
                                        <span>{option.label}</span>
                                        {active && <DropdownSelectedCheck />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-slate-150 pt-3">
                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                      <Tag className="h-3.5 w-3.5" />
                      方向标签
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                      {(s.directionTags || []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-indigo-150 bg-indigo-50 px-3 text-xs font-black text-indigo-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeScheduleDirectionTag(s, tag);
                            }}
                            className="-mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                            title={`删除标签 ${tag}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {(s.directionTags || []).length === 0 && (
                        <span className="text-xs font-bold text-slate-400">
                          暂无标签，可添加冰雪、sort、皮肤等方向关键词
                        </span>
                      )}
                      <div className="inline-flex h-8 min-w-[180px] items-center gap-1.5 rounded-full border border-dashed border-slate-250 bg-white px-2.5">
                        <input
                          value={scheduleTagInput}
                          onChange={(event) => setScheduleTagInput(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addScheduleDirectionTag(s);
                            }
                          }}
                          placeholder="添加标签"
                          className="h-full min-w-0 flex-1 bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-350"
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addScheduleDirectionTag(s);
                          }}
                          disabled={!scheduleTagInput.trim()}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-all hover:bg-indigo-100 disabled:bg-slate-50 disabled:text-slate-300"
                          title="添加方向标签"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 主体内置滚动展示区 */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/15 p-3 md:p-4">
                  {modalScheduleInsight && (
                    <div className="mb-3 shrink-0 rounded-2xl border border-slate-150 bg-white p-3 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-black ${modalScheduleInsight.statusTone}`}
                            >
                              {modalScheduleInsight.status}
                            </span>
                            {s.inheritedFromScheduleId && (
                              <span
                                className="inline-flex h-7 items-center rounded-full border border-blue-150 bg-blue-50 px-3 text-xs font-black text-blue-700"
                                title={s.inheritanceLabel || `继承自 ${s.inheritedFromScheduleId}`}
                              >
                                {s.inheritanceLabel || `继承自 ${s.inheritedFromScheduleId}`}
                              </span>
                            )}
                            {s.inheritedToScheduleIds?.length ? (
                              <span className="inline-flex h-7 items-center rounded-full border border-amber-150 bg-amber-50 px-3 text-xs font-black text-amber-700">
                                已结转 {s.inheritedToScheduleIds.length} 个方向
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-xs font-bold text-slate-500">
                            {modalScheduleInsight.suggestion}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openCycleAdjustPanel(s)}
                            className="inline-flex h-8 items-center rounded-xl border border-amber-200 bg-amber-50 px-3 text-[11px] font-black text-amber-800 transition-all hover:bg-amber-100"
                          >
                            调整周期
                          </button>
                          <button
                            type="button"
                            onClick={() => createDeliverySetDraft(s)}
                            disabled={modalScheduleInsight.completedNotLaunched === 0}
                            className="inline-flex h-8 items-center rounded-xl border border-emerald-150 bg-emerald-50 px-3 text-[11px] font-black text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-150 disabled:bg-slate-50 disabled:text-slate-300"
                          >
                            生成 Set 草稿
                          </button>
                        </div>
                      </div>

                      {isCycleAdjustOpen && (
                        <div className="mt-3 rounded-2xl border border-amber-150 bg-amber-50/35 p-3">
                          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-800">
                                调整周期
                              </span>
                              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">
                                {cycleAdjustMode === "move" ? "移动方向" : "复制方向"}
                              </span>
                              <div className="relative" ref={cycleAdjustWeekPickerRef}>
                                <button
                                  type="button"
                                  onClick={() => setIsCycleAdjustWeekPickerOpen((prev) => !prev)}
                                  className="inline-flex h-8 min-w-[250px] items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3 text-[11px] font-black text-amber-700 shadow-sm transition-all hover:border-amber-300"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <span
                                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                        weekVisualMap[cycleAdjustTargetWeekRange]?.dotClass ||
                                        "bg-amber-500 ring-4 ring-amber-100"
                                      }`}
                                    />
                                    <span className="truncate font-mono">
                                      {cycleAdjustTargetWeekRange || "选择目标周期"}
                                    </span>
                                  </span>
                                  <ChevronDown
                                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                                      isCycleAdjustWeekPickerOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                                {isCycleAdjustWeekPickerOpen && (
                                  <div className="absolute left-0 top-full z-[130] mt-2 max-h-72 w-[300px] overflow-auto rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/12">
                                    {cycleAdjustTargetRanges.map((range) => {
                                      const visual = weekVisualMap[range];
                                      const isTarget = cycleAdjustTargetWeekRange === range;
                                      return (
                                        <button
                                          key={range}
                                          type="button"
                                          onClick={() => {
                                            setCycleAdjustTargetWeekRange(range);
                                            setIsCycleAdjustWeekPickerOpen(false);
                                          }}
                                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                                            isTarget
                                              ? "bg-emerald-50 text-emerald-700"
                                              : "text-slate-600 hover:bg-slate-50"
                                          }`}
                                          title={visual?.label}
                                        >
                                          <span className="flex min-w-0 items-center gap-2">
                                            <span
                                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                                visual?.dotClass || "bg-amber-500 ring-4 ring-amber-100"
                                              }`}
                                            />
                                            <span className="truncate font-mono">{range}</span>
                                          </span>
                                          {isTarget && <DropdownSelectedCheck />}
                                        </button>
                                      );
                                    })}
                                    {cycleAdjustTargetRanges.length === 0 && (
                                      <div className="px-3 py-2 text-[11px] font-bold text-slate-400">
                                        暂无可调整的未来周期
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-slate-500">
                                {cycleAdjustMode === "move"
                                  ? "没有需求留在原方向下，确认后整体移动。"
                                  : "仍有需求留在原方向下，确认后复制继承方向。"}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setCycleAdjustScheduleId(null);
                                  setIsCycleAdjustWeekPickerOpen(false);
                                }}
                                className="inline-flex h-8 items-center rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-500 transition-all hover:bg-slate-50"
                              >
                                取消
                              </button>
                              <button
                                type="button"
                                onClick={() => applyCycleAdjustment(s)}
                                disabled={!cycleAdjustTargetWeekRange}
                                className="inline-flex h-8 items-center rounded-xl border border-slate-800 bg-slate-800 px-3 text-[11px] font-black text-white shadow-sm shadow-slate-900/15 transition-all hover:bg-slate-900"
                              >
                                {cycleAdjustMode === "move" ? "移动方向" : "复制方向"}
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col gap-2 border-t border-amber-100 pt-3 md:flex-row md:items-center">
                            <div className="flex shrink-0 items-center justify-between gap-2 md:w-auto">
                              <span className="text-[10px] font-black text-slate-400">
                                跟随调整的未完成需求
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCycleAdjustRequirementIds(
                                    cycleAdjustCandidates.map((req) => req.id),
                                  )
                                }
                                disabled={cycleAdjustCandidates.length === 0}
                                className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 disabled:text-slate-300"
                              >
                                全选未完成
                              </button>
                            </div>
                            <div className="flex flex-1 flex-wrap gap-2">
                              {cycleAdjustCandidates.map((req) => {
                                const checked = cycleAdjustRequirementIds.includes(req.id);
                                return (
                                  <button
                                    key={req.id}
                                    type="button"
                                    onClick={() => toggleCycleAdjustRequirement(req.id)}
                                    className={`inline-flex h-8 items-center gap-2 rounded-xl border px-3 text-[11px] font-black transition-all ${
                                      checked
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-slate-150 bg-white/60 text-slate-500 hover:bg-white"
                                    }`}
                                  >
                                    <DropdownCheckbox
                                      checked={checked}
                                      className="h-3.5 w-3.5"
                                    />
                                    {req.id}
                                  </button>
                                );
                              })}
                              {cycleAdjustCandidates.length === 0 && (
                                <span className="text-[11px] font-bold text-slate-400">
                                  没有未完成需求可重新挂靠；确认后只复制或移动方向本身
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {modalDeliverySetDrafts.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          <span className="text-[10px] font-black text-slate-400">
                            Delivery Set 草稿
                          </span>
                          {modalDeliverySetDrafts.map((set) => (
                            <span
                              key={set.id}
                              className="inline-flex h-7 items-center rounded-full border border-emerald-150 bg-emerald-50 px-3 text-[11px] font-black text-emerald-700"
                              title={`包含：${set.requirementIds.join("、")}`}
                            >
                              {getChannelDisplayName(set.channel)} · {set.requirementIds.length} 条
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 第二部分：关联的所有项 (Requirements List Table) */}
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-150 bg-white shadow-sm">
                    <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
                      <div>
	                        <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
	                          <ListTodo className="w-4 h-4 text-indigo-550" />
	                          方向下需求列表 ({associatedReqs.length})
	                        </h3>
	                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
	                          字段顺序与需求大表保持一致，点击任意行进入需求详情
	                        </p>
                      </div>

                      <button
                        disabled={editingScheduleId === s.id}
                        onClick={() => handleAddRequirementForDirection(s.id)}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-xl px-3.5 text-xs font-black transition-all ${
                          editingScheduleId === s.id
                            ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                            : "cursor-pointer bg-primary text-white shadow-sm shadow-slate-900/15 hover:bg-slate-900 active:scale-95"
                        }`}
                        title={editingScheduleId === s.id ? "保存方向后再新建需求" : "新建需求"}
                      >
	                        <Plus className="w-3.5 h-3.5" /> 新建需求
	                      </button>
                    </div>

                    {associatedReqs.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 px-6">
                        <Inbox className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-xs font-extrabold text-slate-450 mb-4">
                          该方向中目前尚未创建任何需求合约
                        </p>
                        <button
                          disabled={editingScheduleId === s.id}
                          onClick={() => handleAddRequirementForDirection(s.id)}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-black transition-all ${
                            editingScheduleId === s.id
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-primary text-white shadow-sm shadow-slate-900/15 hover:bg-slate-900"
                          }`}
                          title={editingScheduleId === s.id ? "保存方向后再新建需求" : "马上新建并关联该方向"}
                        >
                          <Plus className="w-4 h-4" /> 马上新建并关联该方向
                        </button>
                      </div>
                    ) : (
                      <div className="min-h-0 flex-1 overflow-auto no-scrollbar">
                        <table className="w-full min-w-[1360px] text-left border-collapse text-xs">
                          <thead className="sticky top-0 z-30 bg-white shadow-[0_1px_0_rgba(226,232,240,0.95)]">
                            <tr className="border-b border-slate-100 bg-white text-[10px] font-black uppercase text-slate-400 select-none [&>th]:bg-white">
                                {isCycleAdjustOpen && (
                                  <th className="px-3 py-3.5 pl-8 w-[72px] whitespace-nowrap">
                                    带走
                                  </th>
                                )}
	                              <th className="px-4 py-3.5 pl-8 w-[118px] whitespace-nowrap">编号</th>
	                              <th className="px-3 py-3.5 w-[112px] whitespace-nowrap">预览</th>
	                              <th className="px-4 py-3.5 w-[220px] whitespace-nowrap">需求名称</th>
	                              <th className="px-3 py-3.5 text-center w-[112px] whitespace-nowrap">
	                                优先级
	                              </th>
	                              <th className="px-3 py-3.5 w-[118px] whitespace-nowrap">创意人员</th>
	                              <th className="px-3 py-3.5 text-center w-[128px] whitespace-nowrap">制作人员</th>
	                              <th className="px-3 py-3.5 text-center w-[138px] whitespace-nowrap">投放渠道</th>
	                              <th className="px-3 py-3.5 text-center w-[148px] whitespace-nowrap">制作提交</th>
	                              <th className="px-3 py-3.5 text-center w-[104px] whitespace-nowrap">需求状态</th>
	                              <th className="px-3 py-3.5 text-center w-[112px] whitespace-nowrap">制作状态</th>
	                              <th className="px-3 py-3.5 text-center w-[120px] whitespace-nowrap">
	                                投放状态
	                              </th>
                              <th className="px-3 py-3.5 text-right pr-6 w-[70px] whitespace-nowrap">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {associatedReqs.map((req) => {
                              const submitDate =
                                req.endDate ||
                                s.productionEnd ||
                                s.submissionDeadline ||
                                s.requirementEnd ||
                                "";
                              const submitBadge = getSubmitTimeBadge(submitDate, todayDateString);

                              return (
                              <tr
                                key={req.id}
                                className="hover:bg-indigo-50/15 cursor-pointer transition-all group"
                                onClick={() => setSelectedReq(req)}
                              >
                                {isCycleAdjustOpen && (
                                  <td className="px-3 py-3.5 pl-8 whitespace-nowrap">
                                    {req.prodStatus !== "Completed" ? (
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          toggleCycleAdjustRequirement(req.id);
                                        }}
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                                          cycleAdjustRequirementIds.includes(req.id)
                                            ? "border-emerald-500 bg-emerald-500 text-white"
                                            : "border-slate-200 bg-white text-transparent hover:border-emerald-200 hover:bg-emerald-50"
                                        }`}
                                        title="选择带到目标周期"
                                      >
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                      </button>
                                    ) : (
                                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-[10px] font-black text-slate-300">
                                        -
                                      </span>
                                    )}
                                  </td>
                                )}
                                {/* ID */}
                                <td className="px-4 py-3.5 font-mono font-bold text-slate-400 relative pl-8 whitespace-nowrap">
                                  {req.parentId && (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                                      <div className="w-3.5 h-[1.5px] bg-slate-300"></div>
                                    </div>
                                  )}
                                  <span
                                    className={
                                      req.parentId
                                        ? "ml-4 inline-flex items-center whitespace-nowrap bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[8px] font-bold"
                                        : "inline-flex items-center whitespace-nowrap text-indigo-600"
                                    }
                                  >
                                    {req.id}
                                  </span>
                                </td>

                                {/* Previews */}
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <div className="flex gap-1">
                                    {(req.previews || [])
                                      .slice(0, 3)
                                      .map((p, idx) => (
                                        <div
                                          key={idx}
                                          className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-3xs hover:scale-110 hover:z-10 transition-transform"
                                        >
                                          <img
                                            src={p}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      ))}
                                  </div>
                                </td>

                                {/* Name */}
                                <td className="px-4 py-3.5 font-bold text-slate-800">
                                  <span className="block max-w-[200px] truncate" title={req.name}>
                                    {req.name}
                                  </span>
                                </td>

                                {/* Priority Select */}
                                <td
                                  className="px-3 py-3.5 text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex justify-center">
                                    {renderRequirementInlineDropdown<RequirementPriority>({
                                      menuKey: `${req.id}:priority`,
                                      value: req.priority,
                                      options: [
                                        { value: "Low", label: "低" },
                                        { value: "Mid", label: "中" },
                                        { value: "High", label: "高" },
                                        { value: "Highest", label: "最高" },
                                      ],
                                      onSelect: (value) =>
                                        updateRequirement(req.id, {
                                          priority: value,
                                        }),
                                      triggerClassName: `h-7 w-24 rounded-lg border border-transparent px-2 text-[10px] font-bold hover:border-slate-200 ${getPriorityStyle(req.priority)}`,
                                      panelClassName: "w-32",
                                    })}
                                  </div>
                                </td>

                                {/* Creative Personnel */}
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <PersonBadge
                                    name={req.creativePersonnel}
                                    size="sm"
                                  />
                                </td>

                                {/* Production Personnel */}
                                <td className="px-3 py-3.5">
                                  <div className="mx-auto flex max-w-[112px] flex-wrap justify-center gap-1.5">
                                    <PersonAvatarStack people={req.productionPersonnel} maxVisible={2} />
                                  </div>
                                </td>

                                {/* Delivery Channels */}
                                <td className="px-3 py-3.5">
                                  <DeliveryChannelsCell channels={req.channels} />
                                </td>

                                {/* Production submit time */}
                                <td
                                  className="px-3 py-3.5 text-center"
                                >
                                  <ProductionSubmitDateDisplay
                                    date={submitDate}
                                    badge={submitBadge}
                                  />
                                </td>

                                {/* reqStatus */}
                                <td
                                  className="px-3 py-3.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {renderRequirementInlineDropdown<RequirementReqStatus>({
                                    menuKey: `${req.id}:reqStatus`,
                                    value: req.reqStatus,
                                    options: [
                                      { value: "Draft", label: "草稿" },
                                      { value: "Pending", label: "待审核" },
                                      { value: "Approved", label: "审核通过" },
                                      { value: "Modification", label: "需求修改" },
                                    ],
                                    onSelect: (value) =>
                                      updateRequirement(req.id, {
                                        reqStatus: value,
                                      }),
                                    triggerClassName: `h-7 min-w-[92px] rounded-full border border-transparent px-2.5 text-[10px] font-black ${getStatusStyle(req.reqStatus)}`,
                                    panelClassName: "w-36",
                                  })}
                                </td>

                                {/* prodStatus */}
                                <td
                                  className="px-3 py-3.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {renderRequirementInlineDropdown<RequirementProdStatus>({
                                    menuKey: `${req.id}:prodStatus`,
                                    value: req.prodStatus,
                                    options: [
                                      { value: "Unscheduled", label: "未排期" },
                                      { value: "Scheduled", label: "已排期" },
                                      { value: "InProgress", label: "进行中" },
                                      { value: "Completed", label: "已完成" },
                                    ],
                                    onSelect: (value) =>
                                      updateRequirement(req.id, {
                                        prodStatus: value,
                                      }),
                                    triggerClassName: `h-7 min-w-[82px] rounded-lg border px-2 text-[10px] font-bold tracking-tight ${getProdStatusStyle(req.prodStatus)}`,
                                    panelClassName: "w-32",
                                  })}
                                </td>

                                {/* Delivery Play/Pause */}
                                <td
                                  className="px-3 py-3.5 text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex justify-center">
                                    <span
                                      className={`flex min-w-[76px] items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1 border rounded-xl shadow-3xs font-black text-[10px] ${getDeliveryStatusStyle(req.deliveryStatus)}`}
                                      title="投放状态由三方投放数据同步，需求界面不可手动修改"
                                    >
                                      {req.deliveryStatus === "Delivering" ? (
                                        <>
                                          <Play className="w-2.5 h-2.5 fill-current text-emerald-600" />
                                        </>
	                                      ) : (
	                                        <>
	                                          <Pause className="w-2.5 h-2.5 fill-current text-slate-400" />
	                                        </>
	                                      )}
                                      <span>{getDeliveryStatusLabel(req.deliveryStatus)}</span>
                                    </span>
                                  </div>
                                </td>

                                {/* Deletion */}
                                <td
                                  className="px-3 py-3.5 text-right pr-6"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      if (confirm("确定要删除这行需求合约吗？"))
                                        handleDelete(req.id, e);
                                    }}
                                    className="p-2 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all opacity-40 group-hover:opacity-100"
                                    title="从列表中删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );

};
