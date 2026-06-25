import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Requirement } from "../../types";
import {
  decodeFilterValue,
  encodeFilterValue,
  filterIsActive,
  filterMatches,
  FILTER_ALL,
} from "./filters";
import { rangesOverlap } from "./dateUtils";
import { parseRequirementVersionId } from "./requirementUtils";
import { CoordinatedSortKey } from "./useCoordinatedPlanning";

export type RequirementFilterState = {
  materialStage: string;
  broadDirection: string;
  creativePersonnel: string;
  priority: string;
  reqStatus: string;
  prodStatus: string;
  assetType: string;
  scheduleRisk: string;
};

type RequirementRiskItem = {
  req: Requirement;
  severity?: "warning" | "danger" | string;
  daysUntilDue?: number;
};

type UseRequirementListFiltersOptions = {
  requirements: Requirement[];
  highRiskRequirements: RequirementRiskItem[];
  searchQuery: string;
  currentSort: CoordinatedSortKey;
  sortOrder: "asc" | "desc";
  filters: RequirementFilterState;
  setFilters: Dispatch<SetStateAction<RequirementFilterState>>;
};

export const REQUIREMENT_FILTER_CONFIGS = [
  {
    key: "materialStage",
    label: "素材阶段",
    options: ["全部", "新", "老", "迭"],
  },
  {
    key: "broadDirection",
    label: "大方向",
    options: ["全部", "大字报", "原始玩法", "3D玩法"],
  },
  {
    key: "assetType",
    label: "制作类型",
    options: ["全部", "Video", "Image", "Playable"],
  },
  {
    key: "creativePersonnel",
    label: "创意人员",
    options: ["全部", "唐欣怡", "吉意煊", "马嘉良"],
  },
  {
    key: "priority",
    label: "优先级",
    options: ["全部", "Low", "Mid", "High", "Highest"],
  },
  {
    key: "reqStatus",
    label: "需求状态",
    options: ["全部", "Draft", "Pending", "Approved", "Modification"],
  },
  {
    key: "prodStatus",
    label: "制作状态",
    options: ["全部", "Unscheduled", "Scheduled", "InProgress", "Completed"],
  },
];

export const getRequirementFilterOptionLabel = (opt: string) => {
  const optionLabels: Record<string, string> = {
    Video: "视频",
    Image: "图片",
    Playable: "试玩",
    Low: "低",
    Mid: "中",
    High: "高",
    Highest: "最高",
    Draft: "草稿",
    Pending: "待审核",
    Approved: "审核通过",
    Modification: "需求修改",
    Unscheduled: "未排期",
    Scheduled: "已排期",
    InProgress: "进行中",
    Completed: "已完成",
  };
  return optionLabels[opt] || opt;
};

export const getRequirementFilterDisplayText = (value: string) => {
  const selectedValues = decodeFilterValue(value);
  if (selectedValues.length === 0) return FILTER_ALL;
  if (selectedValues.length === 1) {
    return getRequirementFilterOptionLabel(selectedValues[0]);
  }
  return `${selectedValues.length} 项`;
};

export const useRequirementListFilters = ({
  requirements,
  highRiskRequirements,
  searchQuery,
  currentSort,
  sortOrder,
  filters,
  setFilters,
}: UseRequirementListFiltersOptions) => {
  const [createdRangeStart, setCreatedRangeStart] = useState("");
  const [createdRangeEnd, setCreatedRangeEnd] = useState("");
  const [completedRangeStart, setCompletedRangeStart] = useState("");
  const [completedRangeEnd, setCompletedRangeEnd] = useState("");

  const toggleRequirementFilterOption = (key: string, option: string) => {
    setFilters((prev) => {
      if (option === FILTER_ALL) {
        return { ...prev, [key]: FILTER_ALL };
      }
      const currentValues = decodeFilterValue(
        prev[key as keyof RequirementFilterState],
      );
      const nextValues = currentValues.includes(option)
        ? currentValues.filter((value) => value !== option)
        : [...currentValues, option];
      return { ...prev, [key]: encodeFilterValue(nextValues) };
    });
  };

  const filteredRequirements = useMemo(() => {
    const riskMap = new Map(
      highRiskRequirements.map((item) => [item.req.id, item]),
    );

    const list = requirements.filter((r) => {
      const matchSearch =
        !searchQuery ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.localizationBatchId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStage = filterMatches(filters.materialStage, r.materialStage);
      const matchDirection = filterMatches(
        filters.broadDirection,
        r.broadDirection,
      );
      const matchCreative = filterMatches(
        filters.creativePersonnel,
        r.creativePersonnel,
      );
      const matchPriority = filterMatches(filters.priority, r.priority);
      const matchReqStatus = filterMatches(filters.reqStatus, r.reqStatus);
      const matchProdStatus = filterMatches(filters.prodStatus, r.prodStatus);
      const matchAssetType = filterMatches(filters.assetType, r.assetType);
      const requirementRisk = r.isLocalization ? undefined : riskMap.get(r.id);
      const matchScheduleRisk =
        !filterIsActive(filters.scheduleRisk) ||
        (decodeFilterValue(filters.scheduleRisk).includes("有风险") &&
          Boolean(requirementRisk)) ||
        (decodeFilterValue(filters.scheduleRisk).includes("严重风险") &&
          requirementRisk?.severity === "danger");
      const matchCreatedRange =
        rangesOverlap(
          r.createdAt?.slice(0, 10),
          r.createdAt?.slice(0, 10),
          createdRangeStart,
          createdRangeEnd,
        ) ||
        (!createdRangeStart && !createdRangeEnd);
      const matchCompletedRange =
        rangesOverlap(
          r.completedAt?.slice(0, 10),
          r.completedAt?.slice(0, 10),
          completedRangeStart,
          completedRangeEnd,
        ) ||
        (!completedRangeStart && !completedRangeEnd);

      return (
        matchSearch &&
        matchStage &&
        matchDirection &&
        matchCreative &&
        matchPriority &&
        matchReqStatus &&
        matchProdStatus &&
        matchAssetType &&
        matchScheduleRisk &&
        matchCreatedRange &&
        matchCompletedRange
      );
    });

    const getRiskSortValue = (req: Requirement) => {
      const risk = riskMap.get(req.id);
      if (!risk) return 0;
      return risk.severity === "danger" ? 2 : 1;
    };
    const getPrioritySortValue = (req: Requirement) => {
      const priorityOrder = { Highest: 4, High: 3, Mid: 2, Low: 1, "": 0 };
      return priorityOrder[req.priority as keyof typeof priorityOrder] || 0;
    };
    const compareRequirements = (a: Requirement, b: Requirement) => {
      let comparison = 0;

      if (currentSort === "scheduleRisk" || currentSort === "none") {
        comparison = getRiskSortValue(a) - getRiskSortValue(b);
        if (comparison === 0 && currentSort === "scheduleRisk") {
          const aDue = riskMap.get(a.id)?.daysUntilDue ?? 999;
          const bDue = riskMap.get(b.id)?.daysUntilDue ?? 999;
          comparison = bDue - aDue;
        }
      } else if (currentSort === "priority") {
        comparison = getPrioritySortValue(a) - getPrioritySortValue(b);
      } else if (currentSort === "form") {
        comparison = (a.assetType || "").localeCompare(b.assetType || "");
      } else if (currentSort === "progress") {
        const progressOrder = {
          Unscheduled: 0,
          Scheduled: 1,
          InProgress: 2,
          Completed: 3,
        };
        comparison =
          (progressOrder[a.prodStatus as keyof typeof progressOrder] || 0) -
          (progressOrder[b.prodStatus as keyof typeof progressOrder] || 0);
      } else if (currentSort === "broadDirection") {
        comparison = (a.broadDirection || "").localeCompare(
          b.broadDirection || "",
        );
      }

      return sortOrder === "asc" ? comparison : -comparison;
    };
    const sortedList = [...list].sort(compareRequirements);

    const visibleIds = new Set(sortedList.map((r) => r.id));
    const parentByMajorId = new Map<string, string>();
    sortedList.forEach((req) => {
      const parsed = parseRequirementVersionId(req.id);
      if (parsed?.version === 1) {
        parentByMajorId.set(parsed.majorId, req.id);
      }
    });

    const getDisplayParentId = (req: Requirement) => {
      if (req.parentId) return req.parentId;
      const parsed = parseRequirementVersionId(req.id);
      if (!parsed || parsed.version === 1) return undefined;
      const parentId = parentByMajorId.get(parsed.majorId);
      return parentId && parentId !== req.id ? parentId : undefined;
    };

    const roots = sortedList.filter((r) => {
      const displayParentId = getDisplayParentId(r);
      return !displayParentId || !visibleIds.has(displayParentId);
    });
    const result: (Requirement & { level: number })[] = [];
    const visited = new Set<string>();

    const flatten = (req: Requirement, level: number) => {
      if (visited.has(req.id)) return;
      visited.add(req.id);
      result.push({ ...req, level });
      const children = sortedList.filter(
        (child) => getDisplayParentId(child) === req.id,
      );
      children.forEach((child) => flatten(child, level + 1));
    };

    roots.forEach((r) => flatten(r, 0));
    return result;
  }, [
    requirements,
    searchQuery,
    filters,
    highRiskRequirements,
    currentSort,
    sortOrder,
    createdRangeStart,
    createdRangeEnd,
    completedRangeStart,
    completedRangeEnd,
  ]);

  const hasActiveRequirementQuery = useMemo(
    () =>
      Boolean(searchQuery.trim()) ||
      Object.values(filters).some((value) => value !== FILTER_ALL) ||
      Boolean(
        createdRangeStart ||
          createdRangeEnd ||
          completedRangeStart ||
          completedRangeEnd,
      ),
    [
      filters,
      searchQuery,
      createdRangeStart,
      createdRangeEnd,
      completedRangeStart,
      completedRangeEnd,
    ],
  );

  const resetRequirementFilters = () => {
    setCreatedRangeStart("");
    setCreatedRangeEnd("");
    setCompletedRangeStart("");
    setCompletedRangeEnd("");
  };

  return {
    filters,
    setFilters,
    filterConfigs: REQUIREMENT_FILTER_CONFIGS,
    createdRangeStart,
    setCreatedRangeStart,
    createdRangeEnd,
    setCreatedRangeEnd,
    completedRangeStart,
    setCompletedRangeStart,
    completedRangeEnd,
    setCompletedRangeEnd,
    filteredRequirements,
    hasActiveRequirementQuery,
    getFilterOptionLabel: getRequirementFilterOptionLabel,
    getFilterDisplayText: getRequirementFilterDisplayText,
    toggleRequirementFilterOption,
    resetRequirementFilters,
  };
};
