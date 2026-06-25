import { Dispatch, SetStateAction, useCallback } from "react";
import {
  CreativeSchedule,
  DeliverySet,
  Requirement,
  RequirementPriority,
} from "../../types";
import {
  filterIsActive,
  filterMatches,
  CoordinatedFlexibleFilter,
} from "./filters";
import { parseDateValue, parseWeekRangeDates, rangesOverlap } from "./dateUtils";
import { getChannelDisplayName } from "./channel";
import { RequirementFilterState } from "./useRequirementListFilters";
import { ScheduleInsight } from "./useScheduleInsights";

type SubView = "coordinated" | "list" | "production" | "upload";

type UseScheduleActionsOptions = {
  schedules: CreativeSchedule[];
  setSchedules: Dispatch<SetStateAction<CreativeSchedule[]>>;
  requirements: Requirement[];
  setRequirements: Dispatch<SetStateAction<Requirement[]>>;
  setDeliverySets: Dispatch<SetStateAction<DeliverySet[]>>;
  filters: RequirementFilterState;
  coordinatedFlexibleFilters: CoordinatedFlexibleFilter[];
  scheduleMatchesFlexibleFilter: (
    schedule: CreativeSchedule,
    condition: CoordinatedFlexibleFilter,
  ) => boolean;
  searchQuery: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  combinedSubView: SubView;
  todayDateString: string;
  allWeekRanges: string[];
  selectedWeekRange: string;
  setSelectedWeekRange: Dispatch<SetStateAction<string>>;
  setSelectedWeekRanges: Dispatch<SetStateAction<string[]>>;
  setDateRangeStart: Dispatch<SetStateAction<string>>;
  setDateRangeEnd: Dispatch<SetStateAction<string>>;
  scheduleInsights: Map<string, ScheduleInsight>;
  scheduleTagInput: string;
  setScheduleTagInput: Dispatch<SetStateAction<string>>;
  cycleAdjustTargetWeekRange: string;
  cycleAdjustRequirementIds: string[];
  setCycleAdjustScheduleId: Dispatch<SetStateAction<string | null>>;
  setCycleAdjustTargetWeekRange: Dispatch<SetStateAction<string>>;
  setCycleAdjustRequirementIds: Dispatch<SetStateAction<string[]>>;
  setIsCycleAdjustWeekPickerOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedScheduleForModal: Dispatch<SetStateAction<CreativeSchedule | null>>;
  setEditingScheduleId: Dispatch<SetStateAction<string | null>>;
  showToast: (message: string) => void;
};

const getWeekRange = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Other";
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const nextMonday = new Date(date.setDate(diff + 7));

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  return `${formatDate(monday)} ~ ${formatDate(nextMonday)}`;
};

export const useScheduleActions = ({
  schedules,
  setSchedules,
  requirements,
  setRequirements,
  setDeliverySets,
  filters,
  coordinatedFlexibleFilters,
  scheduleMatchesFlexibleFilter,
  searchQuery,
  dateRangeStart,
  dateRangeEnd,
  combinedSubView,
  todayDateString,
  allWeekRanges,
  selectedWeekRange,
  setSelectedWeekRange,
  setSelectedWeekRanges,
  setDateRangeStart,
  setDateRangeEnd,
  scheduleInsights,
  scheduleTagInput,
  setScheduleTagInput,
  cycleAdjustTargetWeekRange,
  cycleAdjustRequirementIds,
  setCycleAdjustScheduleId,
  setCycleAdjustTargetWeekRange,
  setCycleAdjustRequirementIds,
  setIsCycleAdjustWeekPickerOpen,
  setSelectedScheduleForModal,
  setEditingScheduleId,
  showToast,
}: UseScheduleActionsOptions) => {
  const isScheduleVisibleInCoordinatedView = useCallback(
    (schedule: CreativeSchedule) => {
      if (
        (dateRangeStart || dateRangeEnd) &&
        !rangesOverlap(
          schedule.requirementStart || parseWeekRangeDates(schedule.weekRange).start,
          schedule.requirementEnd || parseWeekRangeDates(schedule.weekRange).end,
          dateRangeStart,
          dateRangeEnd,
        )
      ) {
        return false;
      }

      if (
        filterIsActive(filters.creativePersonnel) &&
        !filterMatches(filters.creativePersonnel, schedule.owner)
      ) {
        return false;
      }

      if (
        filterIsActive(filters.assetType) &&
        !filterMatches(filters.assetType, schedule.form)
      ) {
        return false;
      }

      if (
        filterIsActive(filters.broadDirection) &&
        !filterMatches(filters.broadDirection, schedule.broadDirection)
      ) {
        return false;
      }

      if (filterIsActive(filters.scheduleRisk)) {
        return false;
      }

      if (
        coordinatedFlexibleFilters.length > 0 &&
        !coordinatedFlexibleFilters.every((condition) =>
          scheduleMatchesFlexibleFilter(schedule, condition),
        )
      ) {
        return false;
      }

      const query = searchQuery.trim().toLowerCase();
      if (query) {
        return (
          schedule.directionName?.toLowerCase().includes(query) ||
          schedule.id.toLowerCase().includes(query)
        );
      }

      return true;
    },
    [
      coordinatedFlexibleFilters,
      dateRangeEnd,
      dateRangeStart,
      filters.assetType,
      filters.broadDirection,
      filters.creativePersonnel,
      filters.scheduleRisk,
      scheduleMatchesFlexibleFilter,
      searchQuery,
    ],
  );

  const addScheduleRow = (weekRange?: string, atTop = false) => {
    const defaultWeek = weekRange || "2026-05-20 ~ 2026-05-27";
    const newSchedule: CreativeSchedule = {
      id: `sched-new-${Date.now()}`,
      weekRange: defaultWeek,
      directionName: "新方向",
      priority: "" as any,
      difficulty: "" as any,
      form: "" as any,
      scenario: "" as any,
      directionType: "" as any,
      validCount: 0,
      totalRequiredCount: 0,
      submittedCount: 0,
      owner: "唐欣怡",
      requirementStart: "",
      requirementEnd: "",
      productionEnd: "",
      directionTags: [],
      broadDirection: "原始玩法",
      materialStage: "新",
    };
    setSchedules(atTop ? [newSchedule, ...schedules] : [...schedules, newSchedule]);
    setEditingScheduleId(newSchedule.id);
    if (
      combinedSubView === "coordinated" &&
      !isScheduleVisibleInCoordinatedView(newSchedule)
    ) {
      showToast("新建方向已创建，但被当前筛选隐藏。清空筛选或调整条件后可查看。");
    }
  };

  const updateSchedule = (id: string, updates: Partial<CreativeSchedule>) => {
    setSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.id === id) {
          const updated = { ...schedule, ...updates };
          if (updates.requirementEnd) {
            updated.weekRange = getWeekRange(updates.requirementEnd);
          }
          return updated;
        }
        return schedule;
      }),
    );
  };

  const addScheduleDirectionTag = (schedule: CreativeSchedule) => {
    const nextTag = scheduleTagInput.trim();
    if (!nextTag) return;

    const currentTags = schedule.directionTags || [];
    if (currentTags.includes(nextTag)) {
      setScheduleTagInput("");
      return;
    }

    updateSchedule(schedule.id, {
      directionTags: [...currentTags, nextTag],
    });
    setScheduleTagInput("");
  };

  const removeScheduleDirectionTag = (schedule: CreativeSchedule, tag: string) => {
    updateSchedule(schedule.id, {
      directionTags: (schedule.directionTags || []).filter((item) => item !== tag),
    });
  };

  const getDefaultCycleAdjustTarget = (schedule: CreativeSchedule) => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now();
    const targetRanges = allWeekRanges
      .filter((range) => range !== schedule.weekRange)
      .map((range) => ({ range, parsed: parseWeekRangeDates(range) }))
      .filter(({ parsed }) => parsed.endTime >= todayTime)
      .sort((a, b) => a.parsed.startTime - b.parsed.startTime);
    return (
      targetRanges[0]?.range ||
      (selectedWeekRange !== schedule.weekRange ? selectedWeekRange : "") ||
      allWeekRanges.find((range) => range !== schedule.weekRange) ||
      schedule.weekRange
    );
  };

  const openCycleAdjustPanel = (schedule: CreativeSchedule) => {
    const candidates = requirements.filter(
      (req) => req.scheduleId === schedule.id && req.prodStatus !== "Completed",
    );
    setCycleAdjustScheduleId(schedule.id);
    setCycleAdjustTargetWeekRange(getDefaultCycleAdjustTarget(schedule));
    setCycleAdjustRequirementIds(candidates.map((req) => req.id));
    setIsCycleAdjustWeekPickerOpen(false);
  };

  const toggleCycleAdjustRequirement = (requirementId: string) => {
    setCycleAdjustRequirementIds((prev) =>
      prev.includes(requirementId)
        ? prev.filter((id) => id !== requirementId)
        : [...prev, requirementId],
    );
  };

  const applyCycleAdjustment = (schedule: CreativeSchedule) => {
    const targetWeekRange = cycleAdjustTargetWeekRange;
    if (!targetWeekRange) {
      showToast("请先选择要调整到的周期范围。");
      return;
    }
    if (targetWeekRange === schedule.weekRange) {
      showToast("目标周期和当前周期一致，无需调整。");
      return;
    }

    const targetDates = parseWeekRangeDates(targetWeekRange);
    const selectedIds = new Set(cycleAdjustRequirementIds);
    const relatedRequirements = requirements.filter(
      (req) => req.scheduleId === schedule.id,
    );
    const selectedRequirements = relatedRequirements.filter(
      (req) => req.prodStatus !== "Completed" && selectedIds.has(req.id),
    );
    const remainingRequirements = relatedRequirements.filter(
      (req) => !selectedIds.has(req.id),
    );
    const shouldMoveSchedule = remainingRequirements.length === 0;

    if (shouldMoveSchedule) {
      const movedSchedule: CreativeSchedule = {
        ...schedule,
        weekRange: targetWeekRange,
        requirementStart: targetDates.start,
        requirementEnd: targetDates.end,
        submissionDeadline: targetDates.end,
        acceptanceDate: targetDates.start,
        rolloverStatus: "None",
        decisionNote: `方向整体调整到 ${targetWeekRange}，未复制方向。`,
      };
      setSchedules((prev) =>
        prev.map((item) => (item.id === schedule.id ? movedSchedule : item)),
      );
      setSelectedScheduleForModal(movedSchedule);
      setSelectedWeekRange(targetWeekRange);
      setSelectedWeekRanges([targetWeekRange]);
      setDateRangeStart(targetDates.start);
      setDateRangeEnd(targetDates.end);
      setCycleAdjustScheduleId(null);
      setIsCycleAdjustWeekPickerOpen(false);
      showToast("方向已整体调整到所选周期。");
      return;
    }

    const inheritedScheduleId = `${schedule.id}-roll-${Date.now()}`;
    const inheritedSchedule: CreativeSchedule = {
      ...schedule,
      id: inheritedScheduleId,
      weekRange: targetWeekRange,
      requirementStart: targetDates.start,
      requirementEnd: targetDates.end,
      submissionDeadline: targetDates.end,
      acceptanceDate: targetDates.start,
      validCount: 0,
      submittedCount: 0,
      totalRequiredCount: selectedRequirements.length,
      inheritedFromScheduleId: schedule.id,
      inheritedToScheduleIds: [],
      inheritanceLabel: `继承自 ${schedule.weekRange}`,
      rolloverStatus: "CarriedOver",
      decisionNote: `调整 ${selectedRequirements.length} 条未完成需求到 ${targetWeekRange}，复用原需求编号。`,
    };

    setSchedules((prev) =>
      prev
        .map((item) =>
          item.id === schedule.id
            ? {
                ...item,
                rolloverStatus: "PartialCompleted" as const,
                inheritedToScheduleIds: [
                  ...(item.inheritedToScheduleIds || []),
                  inheritedScheduleId,
                ],
                decisionNote: `已调整 ${selectedRequirements.length} 条未完成需求到 ${targetWeekRange}`,
              }
            : item,
        )
        .concat(inheritedSchedule),
    );
    setRequirements((prev) =>
      prev.map((req) =>
        selectedIds.has(req.id) && req.scheduleId === schedule.id
          ? {
              ...req,
              scheduleId: inheritedScheduleId,
              currentScheduleId: inheritedScheduleId,
              inheritedFromScheduleId: schedule.id,
              rolloverStatus: "CarriedOver",
            }
          : req,
      ),
    );
    setSelectedScheduleForModal(inheritedSchedule);
    setSelectedWeekRange(targetWeekRange);
    setSelectedWeekRanges([targetWeekRange]);
    setDateRangeStart(targetDates.start);
    setDateRangeEnd(targetDates.end);
    setCycleAdjustScheduleId(null);
    setIsCycleAdjustWeekPickerOpen(false);
    showToast(
      selectedRequirements.length > 0
        ? "已复制继承方向，并调整选中的未完成需求。"
        : "已复制继承方向，原方向下需求保持不变。",
    );
  };

  const updateSchedulePriority = (
    schedule: CreativeSchedule,
    value: RequirementPriority | "Closed",
  ) => {
    if (value === "Closed") {
      updateSchedule(schedule.id, {
        rolloverStatus: "Closed",
        closePermissionRole: "Owner",
        closeReason: "手动将方向优先级调整为关闭。",
      });
      showToast("方向已标记为关闭。");
      return;
    }

    updateSchedule(schedule.id, {
      priority: value,
      rolloverStatus:
        schedule.rolloverStatus === "Closed" ? "None" : schedule.rolloverStatus,
      closeReason: "",
    });
    setRequirements((prev) =>
      prev.map((req) =>
        req.scheduleId === schedule.id
          ? {
              ...req,
              priority: value,
            }
          : req,
      ),
    );
    showToast("方向优先级已同步到方向下需求。");
  };

  const createDeliverySetDraft = (schedule: CreativeSchedule) => {
    const insight = scheduleInsights.get(schedule.id);
    const readyRequirements = insight?.readyRequirements || [];
    if (readyRequirements.length === 0) {
      showToast("当前方向暂无全部完成且未投放的素材。");
      return;
    }
    const groupedByChannel = readyRequirements.reduce<Record<string, Requirement[]>>(
      (acc, req) => {
        const channels = req.channels.length > 0 ? req.channels : ["all"];
        channels.forEach((channel) => {
          acc[channel] = [...(acc[channel] || []), req];
        });
        return acc;
      },
      {},
    );
    const now = new Date().toISOString();
    const drafts = Object.entries(groupedByChannel).map(([channel, reqs]) => ({
      id: `ds-${Date.now()}-${channel}`,
      scheduleId: schedule.id,
      inheritedFromScheduleId: schedule.inheritedFromScheduleId,
      scheduleIds: [
        schedule.id,
        ...(schedule.inheritedFromScheduleId
          ? [schedule.inheritedFromScheduleId]
          : []),
      ],
      requirementIds: reqs.map((req) => req.id),
      status: "Draft" as const,
      channel,
      setName: `${schedule.directionName}-${getChannelDisplayName(channel)}-${reqs.length}条`,
      createdBy: schedule.owner || "唐欣怡",
      createdAt: now,
    }));
    setDeliverySets((prev) => [...drafts, ...prev]);
    setRequirements((prev) =>
      prev.map((req) => {
        const draft = drafts.find((item) => item.requirementIds.includes(req.id));
        return draft ? { ...req, deliverySetId: draft.id } : req;
      }),
    );
    showToast(`已按渠道生成 ${drafts.length} 个 Delivery Set 草稿。`);
  };

  return {
    addScheduleRow,
    updateSchedule,
    addScheduleDirectionTag,
    removeScheduleDirectionTag,
    openCycleAdjustPanel,
    toggleCycleAdjustRequirement,
    applyCycleAdjustment,
    updateSchedulePriority,
    createDeliverySetDraft,
  };
};
