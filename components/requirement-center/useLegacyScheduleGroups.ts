import { useMemo, useState } from "react";
import { CreativeSchedule, Requirement } from "../../types";
import { filterIsActive } from "./filters";

type UseLegacyScheduleGroupsOptions = {
  schedules: CreativeSchedule[];
  requirements: Requirement[];
  materialStageFilter: string;
};

const PRIORITY_ORDER = { Highest: 0, High: 1, Mid: 2, Low: 3, "": 4 };

export const useLegacyScheduleGroups = ({
  schedules,
  requirements,
  materialStageFilter,
}: UseLegacyScheduleGroupsOptions) => {
  const [collapsedWeeks, setCollapsedWeeks] = useState<Record<string, boolean>>(
    {},
  );
  const [scheduleSearchQuery] = useState("");
  const [scheduleFilters] = useState({
    priority: "全部",
    difficulty: "全部",
    form: "全部",
    scenario: "全部",
    directionType: "全部",
    owner: "全部",
  });

  const groupedSchedules = useMemo(() => {
    const filtered = schedules.filter((schedule) => {
      const matchSearch =
        !scheduleSearchQuery ||
        requirements.some(
          (requirement) =>
            requirement.scheduleId === schedule.id &&
            requirement.id
              .toLowerCase()
              .includes(scheduleSearchQuery.toLowerCase()),
        );

      const matchWeek = !filterIsActive(materialStageFilter) || true;
      const matchPriority =
        scheduleFilters.priority === "全部" ||
        schedule.priority === scheduleFilters.priority;
      const matchDifficulty =
        scheduleFilters.difficulty === "全部" ||
        schedule.difficulty === scheduleFilters.difficulty;
      const matchForm =
        scheduleFilters.form === "全部" || schedule.form === scheduleFilters.form;
      const matchScenario =
        scheduleFilters.scenario === "全部" ||
        schedule.scenario === scheduleFilters.scenario;
      const matchType =
        scheduleFilters.directionType === "全部" ||
        schedule.directionType === scheduleFilters.directionType;
      const matchOwner =
        scheduleFilters.owner === "全部" ||
        schedule.owner === scheduleFilters.owner;

      return (
        matchSearch &&
        matchWeek &&
        matchPriority &&
        matchDifficulty &&
        matchForm &&
        matchScenario &&
        matchType &&
        matchOwner
      );
    });

    const groups: Record<string, CreativeSchedule[]> = {};
    filtered.forEach((schedule) => {
      if (!groups[schedule.weekRange]) groups[schedule.weekRange] = [];
      groups[schedule.weekRange].push(schedule);
    });

    Object.keys(groups).forEach((week) => {
      groups[week].sort((a, b) => {
        const valA = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 99;
        const valB = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 99;
        return valA - valB;
      });
    });

    return Object.keys(groups)
      .sort()
      .reduce<Record<string, CreativeSchedule[]>>((acc, week) => {
        acc[week] = groups[week];
        return acc;
      }, {});
  }, [materialStageFilter, requirements, scheduleFilters, scheduleSearchQuery, schedules]);

  const toggleWeek = (week: string) => {
    setCollapsedWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  };

  return {
    collapsedWeeks,
    groupedSchedules,
    toggleWeek,
  };
};
