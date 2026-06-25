import { Check } from "lucide-react";
import { CHANNELS } from "../../types";
import { PRODUCERS } from "./people";

export const FILTER_ALL = "全部";
export const FILTER_SEPARATOR = "|";

export type ScheduleDerivedRolloverStatus =
  | "进行中"
  | "部分完成"
  | "完全未开始"
  | "全部完成且未投放"
  | "已投放"
  | "已关闭"
  | "暂缓";

export type WeekRangeVisualTone =
  | "current"
  | "future"
  | "past"
  | "pastUnfinished";

export type CoordinatedFlexibleFilterField =
  | "priority"
  | "materialStage"
  | "productionPersonnel"
  | "scenario"
  | "channels"
  | "reqStatus"
  | "productionProgress"
  | "deliveryStatus"
  | "language";

export type CoordinatedFlexibleFilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "isEmpty"
  | "isNotEmpty";

export type CoordinatedFlexibleFilter = {
  id: string;
  field: CoordinatedFlexibleFilterField;
  operator: CoordinatedFlexibleFilterOperator;
  value: string;
};

export const REQUIREMENT_LANGUAGE_OPTIONS = ["en", "de", "fr", "it", "jp", "kr", "tw", "es", "pt"];

export const COORDINATED_FLEXIBLE_FILTER_FIELDS: Array<{
  key: CoordinatedFlexibleFilterField;
  label: string;
  options: string[];
}> = [
  {
    key: "priority",
    label: "优先级",
    options: ["最高", "高", "中", "低"],
  },
  {
    key: "materialStage",
    label: "素材阶段",
    options: ["新", "老", "迭"],
  },
  {
    key: "productionPersonnel",
    label: "制作人员",
    options: PRODUCERS.filter((producer) => producer.status === "在职").map(
      (producer) => producer.name,
    ),
  },
  {
    key: "scenario",
    label: "场景",
    options: ["通投", "本地化", "ASO"],
  },
  {
    key: "channels",
    label: "渠道",
    options: CHANNELS.map((channel) => channel.id),
  },
  {
    key: "reqStatus",
    label: "需求提交状态",
    options: ["草稿", "待审核", "审核通过", "需求修改"],
  },
  {
    key: "productionProgress",
    label: "制作完成进度",
    options: ["完全未开始", "进行中", "部分完成", "已完成"],
  },
  {
    key: "deliveryStatus",
    label: "投放状态",
    options: ["未投放", "投放中", "已暂停"],
  },
  {
    key: "language",
    label: "语言",
    options: REQUIREMENT_LANGUAGE_OPTIONS,
  },
];

export const COORDINATED_FLEXIBLE_FILTER_OPERATORS: Array<{
  key: CoordinatedFlexibleFilterOperator;
  label: string;
}> = [
  { key: "equals", label: "等于" },
  { key: "notEquals", label: "不等于" },
  { key: "contains", label: "包含" },
  { key: "notContains", label: "不包含" },
  { key: "isEmpty", label: "为空" },
  { key: "isNotEmpty", label: "不为空" },
];

export const createCoordinatedFlexibleFilter = (): CoordinatedFlexibleFilter => ({
  id: `condition-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  field: "priority",
  operator: "equals",
  value: "高",
});

export const FILTER_DROPDOWN_PANEL_CLASS =
  "absolute left-0 top-full z-[120] mt-2 w-52 rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10";
export const FILTER_DROPDOWN_ACTIVE_CLASS = "bg-indigo-50 text-indigo-700";
export const FILTER_DROPDOWN_IDLE_CLASS = "text-slate-600 hover:bg-slate-50";
export const FILTER_DROPDOWN_ALL_IDLE_CLASS = "text-slate-500 hover:bg-slate-50";

export const DropdownSelectedCheck = ({ className = "" }: { className?: string }) => (
  <Check className={`h-4 w-4 shrink-0 stroke-[3] text-indigo-500 ${className}`} />
);

export const DropdownCheckbox = ({
  checked,
  className = "",
}: {
  checked: boolean;
  className?: string;
}) => (
  <span
    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
      checked
        ? "border-indigo-500 bg-indigo-500 text-white"
        : "border-slate-200 bg-white text-transparent"
    } ${className}`}
  >
    <Check className="h-3 w-3 stroke-[3]" />
  </span>
);

export const decodeFilterValue = (value: string) =>
  !value || value === FILTER_ALL
    ? []
    : value.split(FILTER_SEPARATOR).filter(Boolean);

export const encodeFilterValue = (values: string[]) => {
  const normalizedValues = Array.from(new Set(values.filter((value) => value && value !== FILTER_ALL)));
  return normalizedValues.length > 0 ? normalizedValues.join(FILTER_SEPARATOR) : FILTER_ALL;
};

export const filterMatches = (filterValue: string, actualValue?: string) => {
  const selectedValues = decodeFilterValue(filterValue);
  return selectedValues.length === 0 || selectedValues.includes(actualValue || "");
};

export const filterIsActive = (filterValue: string) => decodeFilterValue(filterValue).length > 0;
