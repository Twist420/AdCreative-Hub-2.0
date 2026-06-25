import type React from "react";
import {
  Activity,
  AlertCircle,
  Check,
  ChevronDown,
  Filter,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import DateRangePicker from "../DateRangePicker";
import {
  COORDINATED_FLEXIBLE_FILTER_FIELDS,
  COORDINATED_FLEXIBLE_FILTER_OPERATORS,
  createCoordinatedFlexibleFilter,
  decodeFilterValue,
  DropdownCheckbox,
  DropdownSelectedCheck,
  FILTER_ALL,
  FILTER_DROPDOWN_ACTIVE_CLASS,
  FILTER_DROPDOWN_ALL_IDLE_CLASS,
  FILTER_DROPDOWN_IDLE_CLASS,
  FILTER_DROPDOWN_PANEL_CLASS,
  WeekRangeRuleInfo,
  type CoordinatedFlexibleFilter,
  type CoordinatedFlexibleFilterField,
  type CoordinatedFlexibleFilterOperator,
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

type WeekVisual = {
  label?: string;
  activeClass?: string;
  buttonClass?: string;
  dropdownActiveClass?: string;
  dotClass?: string;
};

type CoordinatedSortKey =
  | "priority"
  | "form"
  | "progress"
  | "broadDirection"
  | "scheduleRisk"
  | "none";

type CoordinatedToolbarProps = {
  pinnedWeekRanges: string[];
  overflowWeekRanges: string[];
  selectedWeekRanges: string[];
  weekVisualMap: Record<string, WeekVisual>;
  weekFilterRef: React.RefObject<HTMLDivElement>;
  showWeekFilterDropdown: boolean;
  searchQuery: string;
  coordinatedFilterRef: React.RefObject<HTMLDivElement>;
  coordinatedFlexibleFilters: CoordinatedFlexibleFilter[];
  isFlexibleFilterPanelOpen: boolean;
  openFlexibleFilterMenu: string | null;
  filters: RequirementFilters;
  openCoordinatedFilterKey: string | null;
  dateRangeStart: string;
  dateRangeEnd: string;
  currentSort: CoordinatedSortKey;
  sortOrder: "asc" | "desc";
  visibleScheduleCount: number;
  toggleSelectedWeekRange: (weekRange: string) => void;
  setShowWeekFilterDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  openAddWeekPopup: () => void;
  setSearchQuery: (value: string) => void;
  setIsFlexibleFilterPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenCoordinatedFilterKey: React.Dispatch<React.SetStateAction<string | null>>;
  setOpenFlexibleFilterMenu: React.Dispatch<React.SetStateAction<string | null>>;
  setCoordinatedFlexibleFilters: React.Dispatch<React.SetStateAction<CoordinatedFlexibleFilter[]>>;
  getFilterOptionLabel: (option: string) => string;
  setFilters: React.Dispatch<React.SetStateAction<RequirementFilters>>;
  toggleRequirementFilterOption: (key: string, option: string) => void;
  setDateRangeStart: (value: string) => void;
  setDateRangeEnd: (value: string) => void;
  resetCoordinatedFilters: () => void;
  setCurrentSort: React.Dispatch<React.SetStateAction<CoordinatedSortKey>>;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
};

export const CoordinatedToolbar = ({
  pinnedWeekRanges,
  overflowWeekRanges,
  selectedWeekRanges,
  weekVisualMap,
  weekFilterRef,
  showWeekFilterDropdown,
  searchQuery,
  coordinatedFilterRef,
  coordinatedFlexibleFilters,
  isFlexibleFilterPanelOpen,
  openFlexibleFilterMenu,
  filters,
  openCoordinatedFilterKey,
  dateRangeStart,
  dateRangeEnd,
  currentSort,
  sortOrder,
  visibleScheduleCount,
  toggleSelectedWeekRange,
  setShowWeekFilterDropdown,
  openAddWeekPopup,
  setSearchQuery,
  setIsFlexibleFilterPanelOpen,
  setOpenCoordinatedFilterKey,
  setOpenFlexibleFilterMenu,
  setCoordinatedFlexibleFilters,
  getFilterOptionLabel,
  setFilters,
  toggleRequirementFilterOption,
  setDateRangeStart,
  setDateRangeEnd,
  resetCoordinatedFilters,
  setCurrentSort,
  setSortOrder,
}: CoordinatedToolbarProps) => (
  <>
                {/* 周期切换与全局搜索与过滤 */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 pb-1 max-w-full sm:max-w-[75%] md:max-w-[80%] overflow-visible">
	                      {pinnedWeekRanges.map((w) => {
	                        const isActive = selectedWeekRanges.includes(w);
	                        const visual = weekVisualMap[w];
	                        return (
	                          <button
	                            key={w}
	                            onClick={() => {
	                              toggleSelectedWeekRange(w);
	                            }}
	                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border outline-none shrink-0 flex items-center gap-1.5 ${
                              isActive
                                ? visual?.activeClass || "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15"
                                : visual?.buttonClass || "bg-white text-slate-705 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                            title={visual?.label}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                visual?.dotClass || "bg-amber-500 ring-4 ring-amber-100"
	                              }`}
		                            />
		                            <span className="font-mono">{w}</span>
		                            {isActive && <Check className="h-3.5 w-3.5 shrink-0 stroke-[3]" />}
		                          </button>
	                        );
	                      })}

                      {overflowWeekRanges.length > 0 && (
                        <div className="relative shrink-0" ref={weekFilterRef}>
                          <button
                            type="button"
                            onClick={() =>
                              setShowWeekFilterDropdown((prev) => !prev)
                            }
	                            className={`h-[34px] px-3 rounded-xl text-[11px] font-black transition-all border outline-none flex items-center gap-1.5 ${
	                              overflowWeekRanges.some((range) =>
	                                selectedWeekRanges.includes(range),
	                              )
	                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
	                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <span>更多周期</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500">
                              {overflowWeekRanges.length}
                            </span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                showWeekFilterDropdown ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {showWeekFilterDropdown && (
                            <div className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
	                              {overflowWeekRanges.map((w) => {
	                                const isActive = selectedWeekRanges.includes(w);
	                                const visual = weekVisualMap[w];
	                                return (
                                  <button
                                    key={w}
	                                    type="button"
	                                    onClick={() => {
	                                      toggleSelectedWeekRange(w);
	                                    }}
                                    className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-colors ${
                                      isActive
                                        ? visual?.dropdownActiveClass || "bg-indigo-50 text-indigo-700"
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
	                                      <span className="truncate font-mono">{w}</span>
	                                    </span>
                                    {isActive && <DropdownSelectedCheck />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      <WeekRangeRuleInfo className="h-[34px] w-[34px] border border-slate-150 bg-white shadow-3xs hover:border-indigo-200" />

                      <button
                        onClick={openAddWeekPopup}
                        className="px-2.5 py-1.5 bg-slate-50 border border-dashed border-slate-200 hover:border-slate-400 rounded-xl text-[11px] font-extrabold text-slate-450 hover:text-slate-650 flex items-center gap-1 transition-all shrink-0"
                      >
                        <Plus className="w-3 h-3" /> 新周期
                      </button>
                    </div>

                    <div className="relative group min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="在当前周期搜索需求或方向..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] w-full focus:outline-none focus:ring-2 focus:ring-indigo-100/50 focus:border-indigo-500 transition-all text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                    <div ref={coordinatedFilterRef} className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <Filter className="h-3 w-3 text-indigo-500" />
                          快速筛选
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsFlexibleFilterPanelOpen((prev) => !prev);
                              setOpenCoordinatedFilterKey(null);
                              setOpenFlexibleFilterMenu(null);
                            }}
                            className={`inline-flex h-8 min-w-[128px] items-center justify-between gap-2 rounded-xl border px-3 text-[10px] font-black shadow-3xs transition-all ${
                              coordinatedFlexibleFilters.length > 0
                                ? "border-indigo-150 bg-indigo-50 text-indigo-700"
                                : "border-slate-150 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <span>通用筛选</span>
                            {coordinatedFlexibleFilters.length > 0 && (
                              <span className="rounded-full bg-indigo-100 px-1.5 text-[9px] text-indigo-600">
                                {coordinatedFlexibleFilters.length}
                              </span>
                            )}
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${isFlexibleFilterPanelOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isFlexibleFilterPanelOpen && (
	                            <div className="absolute left-0 top-full z-[130] mt-2 w-[620px] rounded-3xl border border-slate-150 bg-white p-4 shadow-2xl shadow-slate-900/10">
	                              <div className="flex items-center gap-2 text-sm font-black text-slate-850">
	                                <span>设置筛选条件</span>
	                                <AlertCircle className="h-4 w-4 text-slate-400" />
	                              </div>
	                              <div className="mt-4 flex flex-col gap-2">
                                {coordinatedFlexibleFilters.length === 0 && (
                                  <div className="rounded-2xl border border-dashed border-slate-150 bg-slate-50 px-3 py-3 text-[11px] font-bold text-slate-400">
                                    暂无通用条件，可添加优先级、素材阶段、制作人员、场景、渠道、需求提交状态、制作完成进度、投放状态、语言等条件。
                                  </div>
                                )}
                                {coordinatedFlexibleFilters.map((condition) => {
                                  const fieldConfig =
                                    COORDINATED_FLEXIBLE_FILTER_FIELDS.find(
                                      (field) => field.key === condition.field,
                                    ) || COORDINATED_FLEXIBLE_FILTER_FIELDS[0];
                                  const operatorConfig =
                                    COORDINATED_FLEXIBLE_FILTER_OPERATORS.find(
                                      (operator) => operator.key === condition.operator,
                                    ) || COORDINATED_FLEXIBLE_FILTER_OPERATORS[0];
                                  const valueDisabled =
                                    condition.operator === "isEmpty" ||
                                    condition.operator === "isNotEmpty";

                                  const renderFlexibleDropdown = (
                                    menuKey: string,
                                    label: string,
                                    minWidth: string,
                                    options: Array<{ value: string; label: string }>,
                                    onSelect: (value: string) => void,
                                  ) => {
                                    const isOpen = openFlexibleFilterMenu === menuKey;
                                    return (
                                      <div className="relative">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setOpenFlexibleFilterMenu((prev) =>
                                              prev === menuKey ? null : menuKey,
                                            )
                                          }
                                          className={`inline-flex h-8 ${minWidth} items-center justify-between gap-2 rounded-xl border border-slate-150 bg-white px-3 text-[11px] font-black text-slate-700 shadow-3xs transition-all hover:border-indigo-200 ${
                                            isOpen ? "border-indigo-400 text-indigo-700" : ""
                                          }`}
                                        >
                                          <span className="truncate">{label}</span>
                                          <ChevronDown
                                            className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                                              isOpen ? "rotate-180" : ""
                                            }`}
                                          />
                                        </button>
                                        {isOpen && (
                                          <div className="absolute left-0 top-full z-[140] mt-2 w-48 rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                                            {options.map((option) => {
                                              const isSelected = option.label === label;
                                              return (
                                                <button
                                                  key={option.value}
                                                  type="button"
                                                  onClick={() => {
                                                    onSelect(option.value);
                                                    setOpenFlexibleFilterMenu(null);
                                                  }}
                                                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                                                    isSelected
                                                      ? FILTER_DROPDOWN_ACTIVE_CLASS
                                                      : FILTER_DROPDOWN_IDLE_CLASS
                                                  }`}
                                                >
                                                  <span>{option.label}</span>
                                                  {isSelected && <DropdownSelectedCheck />}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  };

                                  return (
                                    <div
                                      key={condition.id}
                                      className="flex min-w-0 items-center gap-2"
                                    >
                                      {renderFlexibleDropdown(
                                        `${condition.id}:field`,
                                        fieldConfig.label,
                                        "min-w-[120px]",
                                        COORDINATED_FLEXIBLE_FILTER_FIELDS.map((field) => ({
                                          value: field.key,
                                          label: field.label,
                                        })),
                                        (value) => {
                                          const nextField = value as CoordinatedFlexibleFilterField;
                                          const nextFieldConfig =
                                            COORDINATED_FLEXIBLE_FILTER_FIELDS.find(
                                              (field) => field.key === nextField,
                                            ) || COORDINATED_FLEXIBLE_FILTER_FIELDS[0];
                                          setCoordinatedFlexibleFilters((prev) =>
                                            prev.map((item) =>
                                              item.id === condition.id
                                                ? {
                                                    ...item,
                                                    field: nextField,
                                                    value: nextFieldConfig.options[0] || "",
                                                  }
                                                : item,
                                            ),
                                          );
                                        },
                                      )}
                                      {renderFlexibleDropdown(
                                        `${condition.id}:operator`,
                                        operatorConfig.label,
                                        "min-w-[104px]",
                                        COORDINATED_FLEXIBLE_FILTER_OPERATORS.map((operator) => ({
                                          value: operator.key,
                                          label: operator.label,
                                        })),
                                        (value) =>
                                          setCoordinatedFlexibleFilters((prev) =>
                                            prev.map((item) =>
                                              item.id === condition.id
                                                ? {
                                                    ...item,
                                                    operator: value as CoordinatedFlexibleFilterOperator,
                                                  }
                                                : item,
                                            ),
                                          ),
                                      )}
                                      <div className="relative min-w-0 flex-1">
                                        <button
                                          type="button"
                                          disabled={valueDisabled}
                                          onClick={() =>
                                            setOpenFlexibleFilterMenu((prev) =>
                                              prev === `${condition.id}:value`
                                                ? null
                                                : `${condition.id}:value`,
                                            )
                                          }
                                          className={`inline-flex h-8 w-full items-center justify-between gap-2 rounded-xl border px-3 text-[11px] font-black shadow-3xs transition-all ${
                                            valueDisabled
                                              ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                                              : "border-slate-150 bg-white text-slate-700 hover:border-indigo-200"
                                          }`}
                                        >
                                          <span className="truncate">
                                            {valueDisabled ? "无需选择值" : condition.value}
                                          </span>
                                          {!valueDisabled && (
                                            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                                          )}
                                        </button>
                                        {openFlexibleFilterMenu === `${condition.id}:value` &&
                                          !valueDisabled && (
                                            <div className="absolute left-0 top-full z-[140] mt-2 w-full rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                                              {fieldConfig.options.map((option) => {
                                                const isSelected = condition.value === option;
                                                return (
                                                  <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                      setCoordinatedFlexibleFilters((prev) =>
                                                        prev.map((item) =>
                                                          item.id === condition.id
                                                            ? { ...item, value: option }
                                                            : item,
                                                        ),
                                                      );
                                                      setOpenFlexibleFilterMenu(null);
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                                                      isSelected
                                                        ? FILTER_DROPDOWN_ACTIVE_CLASS
                                                        : FILTER_DROPDOWN_IDLE_CLASS
                                                    }`}
                                                  >
                                                    <span>{option}</span>
                                                    {isSelected && <DropdownSelectedCheck />}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setCoordinatedFlexibleFilters((prev) =>
                                            prev.filter((item) => item.id !== condition.id),
                                          )
                                        }
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                                        aria-label="删除筛选条件"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
	                              <div className="mt-4 flex items-center justify-start">
	                                <button
	                                  type="button"
	                                  onClick={() =>
                                    setCoordinatedFlexibleFilters((prev) => [
                                      ...prev,
                                      createCoordinatedFlexibleFilter(),
                                    ])
                                  }
                                  className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-[12px] font-black text-slate-700 transition-all hover:bg-slate-50"
                                >
	                                  <Plus className="h-4 w-4" />
	                                  添加条件
	                                </button>
	                              </div>
                            </div>
                          )}
                        </div>

                        {[
                          {
                            key: "assetType",
                            label: "类型",
                            value: filters.assetType,
                            minWidth: "min-w-[128px]",
                            options: [
                              ["全部", "全部类型"],
                              ["Video", "视频"],
                              ["Image", "图片"],
                              ["Playable", "试玩"],
                            ],
                          },
                          {
                            key: "broadDirection",
                            label: "方向",
                            value: filters.broadDirection,
                            minWidth: "min-w-[134px]",
                            options: [
                              ["全部", "全部方向"],
                              ["原始玩法", "原始玩法"],
                              ["3D玩法", "3D玩法"],
                              ["大字报", "大字报"],
                            ],
                          },
                          {
                            key: "creativePersonnel",
                            label: "创意人员",
                            value: filters.creativePersonnel,
                            minWidth: "min-w-[142px]",
                            icon: "user",
                            options: [
                              ["全部", "全部"],
                              ["唐欣怡", "唐欣怡"],
                              ["吉意煊", "吉意煊"],
                              ["马嘉良", "马嘉良"],
                            ],
                          },
                        ].map((item) => (
                          (() => {
                            const selectedValues = decodeFilterValue(item.value);
                            const isActive = selectedValues.length > 0;
                            const isOpen = openCoordinatedFilterKey === item.key;
                            const labelByValue = Object.fromEntries(item.options);
                            const displayText =
                              selectedValues.length === 0
                                ? labelByValue[FILTER_ALL]
                                : selectedValues.length === 1
                                  ? labelByValue[selectedValues[0]] || getFilterOptionLabel(selectedValues[0])
                                  : `${selectedValues.length} 项`;

                            return (
                              <div key={item.key} className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenCoordinatedFilterKey((prev) =>
                                      prev === item.key ? null : item.key,
                                    )
                                  }
                                  className={`inline-flex h-8 ${item.minWidth} items-center justify-between gap-2 rounded-xl border px-2.5 text-[10px] font-black shadow-3xs transition-all ${
                                    isActive
                                      ? "border-indigo-150 bg-indigo-50 pr-7 text-indigo-700"
                                      : "border-slate-150 bg-white text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    {item.icon === "user" && (
                                      <User className="h-3.5 w-3.5 shrink-0 text-slate-350" />
                                    )}
                                    <span className="shrink-0 text-slate-400">{item.label}</span>
                                    <span className="max-w-[70px] truncate text-inherit">
                                      {displayText}
                                    </span>
                                  </span>
                                  {!isActive && (
                                    <ChevronDown
                                      className={`h-3 w-3 shrink-0 transition-transform ${
                                        isOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  )}
                                </button>
                                {isActive && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setFilters((prev) => ({ ...prev, [item.key]: FILTER_ALL }));
                                      if (openCoordinatedFilterKey === item.key) {
                                        setOpenCoordinatedFilterKey(null);
                                      }
                                    }}
                                    className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-lg text-indigo-400 transition-all hover:bg-white/80 hover:text-rose-500"
                                    aria-label={`清除${item.label}筛选`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}

                                {isOpen && (
                                  <div className={FILTER_DROPDOWN_PANEL_CLASS}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        toggleRequirementFilterOption(item.key, FILTER_ALL);
                                        setOpenCoordinatedFilterKey(null);
                                      }}
                                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                                        !isActive
                                          ? FILTER_DROPDOWN_ACTIVE_CLASS
                                          : FILTER_DROPDOWN_ALL_IDLE_CLASS
                                      }`}
                                    >
                                      <span>{labelByValue[FILTER_ALL] || "全部"}</span>
                                      {!isActive && <DropdownSelectedCheck />}
                                    </button>
                                    <div className="my-1 h-px bg-slate-100" />
                                    {item.options
                                      .filter(([value]) => value !== FILTER_ALL)
                                      .map(([value, label]) => {
                                        const checked = selectedValues.includes(value);
                                        return (
                                          <button
                                            key={value}
                                            type="button"
                                            onClick={() => toggleRequirementFilterOption(item.key, value)}
                                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                                              checked
                                                ? FILTER_DROPDOWN_ACTIVE_CLASS
                                                : FILTER_DROPDOWN_IDLE_CLASS
                                            }`}
                                          >
                                            <DropdownCheckbox checked={checked} />
                                            <span className="truncate">{label}</span>
                                          </button>
                                        );
                                      })}
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ))}

	                        <DateRangePicker
	                          label="周期时间"
                          start={dateRangeStart}
                          end={dateRangeEnd}
                          onChange={({ start, end }) => {
                            setDateRangeStart(start);
                            setDateRangeEnd(end);
                          }}
                          compact
                          className="min-w-[260px] flex-1"
                        />

                        <button
                          type="button"
                          onClick={resetCoordinatedFilters}
                          className="inline-flex h-8 items-center rounded-xl border border-slate-150 bg-white px-3 text-[10px] font-black text-slate-400 transition-all hover:border-rose-150 hover:bg-rose-50 hover:text-rose-600"
                        >
                          清空筛选
                        </button>
                      </div>

                      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                        <span className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 text-[10px] font-black text-amber-600">
                          <Activity className="h-3 w-3" />
                          排序
                        </span>
                        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-150 bg-slate-50 p-1">
                          {[
                            { key: "scheduleRisk", label: "风险" },
                            { key: "priority", label: "优先级" },
                            { key: "progress", label: "进度" },
                            { key: "form", label: "类型" },
                          ].map((sortOption) => {
                            const isActive = currentSort === sortOption.key;
                            return (
                              <button
                                key={sortOption.key}
                                type="button"
                                onClick={() => {
                                  if (isActive) {
                                    setSortOrder((prev) =>
                                      prev === "asc" ? "desc" : "asc",
                                    );
                                  } else {
                                    setCurrentSort(sortOption.key as any);
                                    setSortOrder("desc");
                                  }
                                }}
                                className={`h-6 rounded-xl px-2.5 text-[10px] font-black transition-all ${
                                  isActive
                                    ? "bg-white text-indigo-650 shadow-3xs"
                                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                                }`}
                              >
                                {sortOption.label}
                                {isActive && (
                                  <span className="ml-1 text-[9px] text-indigo-400">
                                    {sortOrder === "desc" ? "↓" : "↑"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-slate-400">
                        当前显示 {visibleScheduleCount} 个方向
                      </span>
                    </div>
                  </div>
                </div>
  </>
);
