import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreativeSchedule, Requirement } from "../../types";
import {
  addDaysToDateString,
  filterIsActive,
  filterMatches,
  getDefaultWeekRanges,
  getScheduledTaskViews,
  parseDateValue,
  parseWeekRangeDates,
  rangesOverlap,
  type CoordinatedFlexibleFilter,
  type CoordinatedFlexibleFilterField,
  type WeekRangeVisualTone,
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

export type CoordinatedSortKey =
  | "priority"
  | "form"
  | "progress"
  | "broadDirection"
  | "scheduleRisk"
  | "none";

export const useCoordinatedPlanning = ({
  schedules,
  requirements,
  todayDateString,
  filters,
  searchQuery,
  defaultDateRangeStart,
  defaultDateRangeEnd,
}: {
  schedules: CreativeSchedule[];
  requirements: Requirement[];
  todayDateString: string;
  filters: RequirementFilters;
  searchQuery: string;
  defaultDateRangeStart: string;
  defaultDateRangeEnd: string;
}) => {
  const allWeekRanges = useMemo(() => {
    const ranges = Array.from(
      new Set(schedules.map((schedule) => schedule.weekRange)),
    ).filter(Boolean);
    return getDefaultWeekRanges(ranges, 24, todayDateString);
  }, [schedules, todayDateString]);

  const weekRanges = useMemo(() => allWeekRanges, [allWeekRanges]);

  const orderedWeekRanges = useMemo(
    () =>
      [...allWeekRanges].sort((a, b) => {
        const aRange = parseWeekRangeDates(a);
        const bRange = parseWeekRangeDates(b);
        return (
          bRange.startTime - aRange.startTime ||
          bRange.endTime - aRange.endTime
        );
      }),
    [allWeekRanges],
  );

  const futureWeekRanges = useMemo(() => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now();
    return orderedWeekRanges.filter(
      (range) => parseWeekRangeDates(range).startTime > todayTime,
    );
  }, [orderedWeekRanges, todayDateString]);

  const currentWeekRange = useMemo(() => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now();
    return (
      orderedWeekRanges.find((range) => {
        const { startTime, endTime } = parseWeekRangeDates(range);
        return todayTime >= startTime && todayTime < endTime;
      }) ||
      futureWeekRanges.at(-1) ||
      orderedWeekRanges[0] ||
      ""
    );
  }, [futureWeekRanges, orderedWeekRanges, todayDateString]);

  const pinnedWeekRanges = useMemo(() => {
    const nearestFutureRanges = [...futureWeekRanges].sort((a, b) => {
      const aRange = parseWeekRangeDates(a);
      const bRange = parseWeekRangeDates(b);
      return (
        aRange.startTime - bRange.startTime ||
        aRange.endTime - bRange.endTime
      );
    });
    return [currentWeekRange, ...nearestFutureRanges.slice(0, 3)]
      .filter((range): range is string => Boolean(range))
      .filter((range, index, ranges) => ranges.indexOf(range) === index)
      .sort((a, b) => {
        const aRange = parseWeekRangeDates(a);
        const bRange = parseWeekRangeDates(b);
        return (
          bRange.startTime - aRange.startTime ||
          bRange.endTime - aRange.endTime
        );
      });
  }, [currentWeekRange, futureWeekRanges]);

  const weekStatusMap = useMemo(() => {
    const statusMap: Record<string, "completed" | "inprogress"> = {};
    allWeekRanges.forEach((weekRange) => {
      const weekSchedules = schedules.filter(
        (schedule) => schedule.weekRange === weekRange,
      );
      if (weekSchedules.length === 0) {
        statusMap[weekRange] = "completed";
        return;
      }
      let hasRequirements = false;
      let allCompleted = true;
      weekSchedules.forEach((schedule) => {
        const scheduleRequirements = requirements.filter(
          (requirement) => requirement.scheduleId === schedule.id,
        );
        if (scheduleRequirements.length > 0) {
          hasRequirements = true;
          if (
            !scheduleRequirements.every(
              (requirement) => requirement.prodStatus === "Completed",
            )
          ) {
            allCompleted = false;
          }
        } else if ((schedule.totalRequiredCount || 0) > 0) {
          allCompleted = false;
        }
      });
      statusMap[weekRange] =
        hasRequirements && allCompleted ? "completed" : "inprogress";
    });
    return statusMap;
  }, [allWeekRanges, schedules, requirements]);

  const weekVisualMap = useMemo(() => {
    const todayTime = parseDateValue(todayDateString) ?? Date.now();
    const visualMap: Record<
      string,
      {
        tone: WeekRangeVisualTone;
        label: string;
        dotClass: string;
        buttonClass: string;
        activeClass: string;
        dropdownActiveClass: string;
      }
    > = {};

    allWeekRanges.forEach((weekRange) => {
      const { startTime, endTime } = parseWeekRangeDates(weekRange);
      const weekSchedules = schedules.filter(
        (schedule) => schedule.weekRange === weekRange,
      );
      const weekScheduleIds = new Set(
        weekSchedules.map((schedule) => schedule.id),
      );
      const weekRequirements = requirements.filter((requirement) =>
        weekScheduleIds.has(requirement.scheduleId),
      );
      const hasUnfinished =
        weekRequirements.some(
          (requirement) => requirement.prodStatus !== "Completed",
        ) ||
        weekSchedules.some((schedule) => {
          const existingCount = requirements.filter(
            (requirement) => requirement.scheduleId === schedule.id,
          ).length;
          return existingCount === 0 && (schedule.totalRequiredCount || 0) > 0;
        });

      let tone: WeekRangeVisualTone = "past";
      if (todayTime >= startTime && todayTime < endTime) {
        tone = "current";
      } else if (startTime > todayTime) {
        tone = "future";
      } else if (hasUnfinished) {
        tone = "pastUnfinished";
      }

      const meta: Record<
        WeekRangeVisualTone,
        {
          label: string;
          dotClass: string;
          buttonClass: string;
          activeClass: string;
          dropdownActiveClass: string;
        }
      > = {
        current: {
          label: "当前周期",
          dotClass: "bg-emerald-500 ring-4 ring-emerald-100",
          buttonClass:
            "bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100",
          activeClass:
            "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/15",
          dropdownActiveClass: "bg-emerald-50 text-emerald-700",
        },
        future: {
          label: "未来周期",
          dotClass: "bg-orange-400 ring-4 ring-orange-100",
          buttonClass:
            "bg-orange-50 text-orange-700 border-orange-150 hover:bg-orange-100",
          activeClass:
            "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/15",
          dropdownActiveClass: "bg-orange-50 text-orange-700",
        },
        past: {
          label: "已完成周期",
          dotClass: "bg-slate-300 ring-4 ring-slate-100",
          buttonClass:
            "bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100",
          activeClass:
            "bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/15",
          dropdownActiveClass: "bg-slate-100 text-slate-600",
        },
        pastUnfinished: {
          label: "历史周期有未完成",
          dotClass: "bg-rose-500 ring-4 ring-rose-100",
          buttonClass:
            "bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100",
          activeClass:
            "bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-600/15",
          dropdownActiveClass: "bg-slate-100 text-slate-600",
        },
      };

      visualMap[weekRange] = { tone, ...meta[tone] };
    });

    return visualMap;
  }, [allWeekRanges, requirements, schedules, todayDateString]);

  const overflowWeekRanges = useMemo(
    () =>
      orderedWeekRanges
        .filter((range) => !pinnedWeekRanges.includes(range))
        .filter((range) => {
          const visual = weekVisualMap[range];
          const hasRealSchedule = schedules.some(
            (schedule) => schedule.weekRange === range,
          );
          return !(
            hasRealSchedule &&
            visual?.tone === "past" &&
            weekStatusMap[range] === "completed"
          );
        }),
    [orderedWeekRanges, pinnedWeekRanges, schedules, weekStatusMap, weekVisualMap],
  );

  const [selectedWeekRange, setSelectedWeekRange] = useState<string>("");
  const [selectedWeekRanges, setSelectedWeekRanges] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState(
    () => defaultDateRangeStart,
  );
  const [dateRangeEnd, setDateRangeEnd] = useState(() => defaultDateRangeEnd);
  const [currentSort, setCurrentSort] = useState<CoordinatedSortKey>("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [coordinatedFlexibleFilters, setCoordinatedFlexibleFilters] = useState<
    CoordinatedFlexibleFilter[]
  >([]);
  const [isFlexibleFilterPanelOpen, setIsFlexibleFilterPanelOpen] =
    useState(false);
  const [openFlexibleFilterMenu, setOpenFlexibleFilterMenu] = useState<
    string | null
  >(null);

  const getScheduleFlexibleFieldValues = useCallback(
    (schedule: CreativeSchedule, field: CoordinatedFlexibleFilterField) => {
      const relatedRequirements = requirements.filter(
        (requirement) => requirement.scheduleId === schedule.id,
      );
      if (field === "priority") {
        const labels: Record<string, string> = {
          Highest: "最高",
          High: "高",
          Mid: "中",
          Low: "低",
        };
        return [labels[schedule.priority || ""] || ""].filter(Boolean);
      }
      if (field === "materialStage") {
        return [schedule.materialStage || ""].filter(Boolean);
      }
      if (field === "productionPersonnel") {
        return Array.from(
          new Set(
            relatedRequirements.flatMap(
              (requirement) => requirement.productionPersonnel || [],
            ),
          ),
        ).filter(Boolean);
      }
      if (field === "scenario") {
        const labels: Record<string, string> = {
          Standard: "通投",
          Localized: "本地化",
          ASO: "ASO",
        };
        return [labels[schedule.scenario || ""] || ""].filter(Boolean);
      }
      if (field === "channels") {
        return Array.from(
          new Set([
            ...(schedule.channels || []),
            ...relatedRequirements.flatMap(
              (requirement) => requirement.channels || [],
            ),
          ]),
        ).filter(Boolean);
      }
      if (field === "reqStatus") {
        const labels: Record<string, string> = {
          Draft: "草稿",
          Pending: "待审核",
          Approved: "审核通过",
          Modification: "需求修改",
        };
        return Array.from(
          new Set(
            relatedRequirements.map(
              (requirement) => labels[requirement.reqStatus] || "",
            ),
          ),
        ).filter(Boolean);
      }
      if (field === "productionProgress") {
        if (relatedRequirements.length === 0) return ["完全未开始"];
        const completed = relatedRequirements.filter(
          (requirement) => requirement.prodStatus === "Completed",
        ).length;
        const inProgress = relatedRequirements.filter(
          (requirement) => requirement.prodStatus === "InProgress",
        ).length;
        if (completed === relatedRequirements.length) return ["已完成"];
        if (completed > 0) return ["部分完成"];
        if (inProgress > 0) return ["进行中"];
        return ["完全未开始"];
      }
      if (field === "deliveryStatus") {
        const labels: Record<string, string> = {
          NotLaunched: "未投放",
          Delivering: "投放中",
          Paused: "已暂停",
        };
        return Array.from(
          new Set(
            relatedRequirements.map(
              (requirement) => labels[requirement.deliveryStatus] || "",
            ),
          ),
        ).filter(Boolean);
      }
      if (field === "language") {
        return Array.from(
          new Set(
            relatedRequirements.map((requirement) => requirement.language || ""),
          ),
        ).filter(Boolean);
      }
      return [];
    },
    [requirements],
  );

  const scheduleMatchesFlexibleFilter = useCallback(
    (schedule: CreativeSchedule, condition: CoordinatedFlexibleFilter) => {
      const actualValues = getScheduleFlexibleFieldValues(
        schedule,
        condition.field,
      );
      const expectedValue = condition.value.trim();
      if (condition.operator === "isEmpty") return actualValues.length === 0;
      if (condition.operator === "isNotEmpty") return actualValues.length > 0;
      if (!expectedValue) return true;
      if (condition.operator === "equals") {
        return actualValues.some((value) => value === expectedValue);
      }
      if (condition.operator === "notEquals") {
        return actualValues.every((value) => value !== expectedValue);
      }
      if (condition.operator === "contains") {
        return actualValues.some((value) => value.includes(expectedValue));
      }
      if (condition.operator === "notContains") {
        return actualValues.every((value) => !value.includes(expectedValue));
      }
      return true;
    },
    [getScheduleFlexibleFieldValues],
  );

  const visibleSchedules = useMemo(() => {
    const hasDateRange = Boolean(dateRangeStart || dateRangeEnd);
    let list = schedules;
    if (selectedWeekRanges.length > 0) {
      list = list.filter((schedule) =>
        selectedWeekRanges.includes(schedule.weekRange),
      );
    }
    if (hasDateRange) {
      list = list.filter((schedule) =>
        rangesOverlap(
          schedule.requirementStart ||
            parseWeekRangeDates(schedule.weekRange).start,
          schedule.requirementEnd || parseWeekRangeDates(schedule.weekRange).end,
          dateRangeStart,
          dateRangeEnd,
        ),
      );
    } else {
      list = list.filter((schedule) => schedule.weekRange === selectedWeekRange);
    }
    if (filterIsActive(filters.creativePersonnel)) {
      list = list.filter((schedule) =>
        filterMatches(filters.creativePersonnel, schedule.owner),
      );
    }
    if (filterIsActive(filters.assetType)) {
      list = list.filter((schedule) =>
        filterMatches(filters.assetType, schedule.form),
      );
    }
    if (filterIsActive(filters.broadDirection)) {
      list = list.filter((schedule) =>
        filterMatches(filters.broadDirection, schedule.broadDirection),
      );
    }
    if (coordinatedFlexibleFilters.length > 0) {
      list = list.filter((schedule) =>
        coordinatedFlexibleFilters.every((condition) =>
          scheduleMatchesFlexibleFilter(schedule, condition),
        ),
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter((schedule) => {
        const matchDirection =
          schedule.directionName?.toLowerCase().includes(query) ||
          schedule.id.toLowerCase().includes(query);
        const associated = requirements.filter(
          (requirement) => requirement.scheduleId === schedule.id,
        );
        const matchRequirement = associated.some(
          (requirement) =>
            requirement.id.toLowerCase().includes(query) ||
            requirement.name.toLowerCase().includes(query),
        );
        return matchDirection || matchRequirement;
      });
    }
    if (currentSort !== "none") {
      list = [...list].sort((a, b) => {
        let comparison = 0;
        if (currentSort === "priority") {
          const priorityOrder = { Highest: 4, High: 3, Mid: 2, Low: 1, "": 0 };
          comparison =
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
        } else if (currentSort === "form") {
          comparison = (a.form || "").localeCompare(b.form || "");
        } else if (currentSort === "progress") {
          const aReqs = requirements.filter(
            (requirement) => requirement.scheduleId === a.id,
          );
          const bReqs = requirements.filter(
            (requirement) => requirement.scheduleId === b.id,
          );
          const aCompleted = aReqs.filter(
            (requirement) => requirement.prodStatus === "Completed",
          ).length;
          const bCompleted = bReqs.filter(
            (requirement) => requirement.prodStatus === "Completed",
          ).length;
          comparison =
            (aReqs.length > 0 ? aCompleted / aReqs.length : 0) -
            (bReqs.length > 0 ? bCompleted / bReqs.length : 0);
        } else if (currentSort === "broadDirection") {
          comparison = (a.broadDirection || "").localeCompare(
            b.broadDirection || "",
          );
        } else if (currentSort === "scheduleRisk") {
          const getScheduleRiskValue = (schedule: CreativeSchedule) => {
            const weekStart = todayDateString;
            const weekEnd = addDaysToDateString(todayDateString, 6);
            return requirements
              .filter(
                (requirement) =>
                  requirement.scheduleId === schedule.id &&
                  (requirement.priority === "Highest" ||
                    requirement.priority === "High") &&
                  requirement.prodStatus !== "Completed",
              )
              .reduce((score, requirement) => {
                const dueDate =
                  schedule.productionEnd ||
                  schedule.submissionDeadline ||
                  schedule.requirementEnd ||
                  requirement.endDate ||
                  "";
                const dueTime = parseDateValue(dueDate);
                const todayTime = parseDateValue(todayDateString);
                const taskViews = getScheduledTaskViews(requirement);
                const lastTaskEnd =
                  taskViews
                    .map((task) => task.endDate)
                    .filter(Boolean)
                    .sort()
                    .at(-1) || "";
                const hasDeadlineOverflow =
                  !!dueDate && !!lastTaskEnd && lastTaskEnd > dueDate;
                const hasNoPlan = taskViews.length === 0;
                const hasUpcomingTask = taskViews.some((task) =>
                  rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd),
                );
                const isDeadlinePassed =
                  dueTime !== null && todayTime !== null && dueTime < todayTime;
                const isDeadlineWithinWeek =
                  dueTime !== null &&
                  todayTime !== null &&
                  dueTime >= todayTime &&
                  dueTime <= (parseDateValue(weekEnd) ?? dueTime);

                if (
                  isDeadlinePassed ||
                  hasDeadlineOverflow ||
                  (hasNoPlan && isDeadlineWithinWeek) ||
                  (!hasUpcomingTask && isDeadlineWithinWeek)
                ) {
                  return score + 100;
                }
                if (hasNoPlan || !hasUpcomingTask) {
                  return score + 10;
                }
                return score;
              }, 0);
          };
          comparison = getScheduleRiskValue(a) - getScheduleRiskValue(b);
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }
    return list;
  }, [
    schedules,
    selectedWeekRange,
    selectedWeekRanges,
    dateRangeStart,
    dateRangeEnd,
    filters,
    coordinatedFlexibleFilters,
    scheduleMatchesFlexibleFilter,
    currentSort,
    sortOrder,
    searchQuery,
    requirements,
    todayDateString,
  ]);

  useEffect(() => {
    if (weekRanges.length > 0) {
      if (!selectedWeekRange || !weekRanges.includes(selectedWeekRange)) {
        setSelectedWeekRange(currentWeekRange);
      }
      setSelectedWeekRanges((prev) => {
        const validSelections = prev.filter((range) =>
          weekRanges.includes(range),
        );
        if (validSelections.length > 0) return validSelections;
        return currentWeekRange ? [currentWeekRange] : [];
      });
    }
  }, [currentWeekRange, weekRanges, selectedWeekRange]);

  const syncDateRangeToWeekSelections = useCallback((ranges: string[]) => {
    const parsedRanges = ranges.map((range) => parseWeekRangeDates(range));
    if (parsedRanges.length === 0) return;
    const orderedStarts = parsedRanges.map((range) => range.start).sort();
    const orderedEnds = parsedRanges.map((range) => range.end).sort();
    setDateRangeStart(orderedStarts[0]);
    setDateRangeEnd(orderedEnds[orderedEnds.length - 1]);
  }, []);

  const toggleSelectedWeekRange = useCallback(
    (range: string) => {
      setSelectedWeekRanges((prev) => {
        const next = prev.includes(range)
          ? prev.filter((item) => item !== range)
          : [...prev, range];
        const nextSelections = next.length > 0 ? next : [range];
        setSelectedWeekRange(
          nextSelections.includes(range) ? range : nextSelections[0],
        );
        syncDateRangeToWeekSelections(nextSelections);
        return nextSelections;
      });
    },
    [syncDateRangeToWeekSelections],
  );

  const resetCoordinatedFilters = useCallback(() => {
    setDateRangeStart(defaultDateRangeStart);
    setDateRangeEnd(defaultDateRangeEnd);
    setSelectedWeekRange(currentWeekRange);
    setSelectedWeekRanges(currentWeekRange ? [currentWeekRange] : []);
    setCurrentSort("none");
    setSortOrder("desc");
    setCoordinatedFlexibleFilters([]);
    setIsFlexibleFilterPanelOpen(false);
    setOpenFlexibleFilterMenu(null);
  }, [currentWeekRange, defaultDateRangeEnd, defaultDateRangeStart]);

  return {
    allWeekRanges,
    pinnedWeekRanges,
    overflowWeekRanges,
    weekVisualMap,
    selectedWeekRange,
    setSelectedWeekRange,
    selectedWeekRanges,
    setSelectedWeekRanges,
    dateRangeStart,
    setDateRangeStart,
    dateRangeEnd,
    setDateRangeEnd,
    currentSort,
    setCurrentSort,
    sortOrder,
    setSortOrder,
    coordinatedFlexibleFilters,
    setCoordinatedFlexibleFilters,
    isFlexibleFilterPanelOpen,
    setIsFlexibleFilterPanelOpen,
    openFlexibleFilterMenu,
    setOpenFlexibleFilterMenu,
    visibleSchedules,
    scheduleMatchesFlexibleFilter,
    toggleSelectedWeekRange,
    resetCoordinatedFilters,
  };
};
