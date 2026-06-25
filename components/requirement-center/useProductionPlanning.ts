import { useMemo, useRef, useState } from "react";
import type { CreativeSchedule, Requirement } from "../../types";
import {
  addDaysToDateString,
  getMonthWeeks,
  getScheduledTaskViews,
  parseDateValue,
  rangesOverlap,
} from ".";
import { PRODUCERS, type Producer } from "./people";

export const useProductionPlanning = ({
  requirements,
  schedules,
  todayDateString,
}: {
  requirements: Requirement[];
  schedules: CreativeSchedule[];
  todayDateString: string;
}) => {
  const productionTasks = useMemo(
    () => requirements.flatMap(getScheduledTaskViews),
    [requirements],
  );

  const [selectedProducers, setSelectedProducers] = useState<string[]>([]);
  const [isProductionProducerFilterOpen, setIsProductionProducerFilterOpen] =
    useState(false);
  const productionProducerFilterRef = useRef<HTMLDivElement>(null);
  const [productionView, setProductionView] = useState<
    "capacity" | "calendar" | "gantt"
  >("gantt");
  const [showProductionRiskModal, setShowProductionRiskModal] = useState(false);
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(6);

  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const productionInsights = useMemo(() => {
    const weekStart = todayDateString;
    const weekEnd = addDaysToDateString(todayDateString, 6);
    const upcomingTasks = productionTasks.filter((task) =>
      rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd),
    );
    const activeProducerCount = PRODUCERS.filter(
      (producer) => producer.status === "在职",
    ).length;
    const weeklyCapacity = activeProducerCount * 5;
    const scheduledWorkDays = upcomingTasks.reduce(
      (sum, task) => sum + (task.estimatedWorkDays || 1),
      0,
    );
    const scheduledProducerCount = new Set(
      upcomingTasks.map((task) => task.producer).filter(Boolean),
    ).size;
    const highRiskRequirements = requirements
      .filter(
        (req) =>
          (req.priority === "Highest" || req.priority === "High") &&
          req.prodStatus !== "Completed",
      )
      .map((req) => {
        const schedule = schedules.find((item) => item.id === req.scheduleId);
        const dueDate =
          schedule?.productionEnd ||
          schedule?.submissionDeadline ||
          schedule?.requirementEnd ||
          req.endDate ||
          "";
        const dueTime = parseDateValue(dueDate);
        const todayTime = parseDateValue(todayDateString);
        const taskViews = getScheduledTaskViews(req);
        const hasUpcomingTask = taskViews.some((task) =>
          rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd),
        );
        const lastTaskEnd =
          taskViews
            .map((task) => task.endDate)
            .filter(Boolean)
            .sort()
            .at(-1) || "";
        const hasDeadlineOverflow =
          !!dueDate && !!lastTaskEnd && lastTaskEnd > dueDate;
        const hasNoPlan = taskViews.length === 0;
        const isDeadlinePassed =
          dueTime !== null && todayTime !== null && dueTime < todayTime;
        const isDeadlineWithinWeek =
          dueTime !== null &&
          todayTime !== null &&
          dueTime >= todayTime &&
          dueTime <= (parseDateValue(weekEnd) ?? dueTime);
        const daysUntilDue =
          dueTime !== null && todayTime !== null
            ? Math.ceil((dueTime - todayTime) / 86400000)
            : null;

        let reason = "";
        let severity: "danger" | "warning" = "warning";
        let action = "";

        if (isDeadlinePassed && req.prodStatus !== "Completed") {
          severity = "danger";
          reason = "已过截止";
          action = "立即确认是否延期或压缩排期";
        } else if (hasDeadlineOverflow) {
          severity = "danger";
          reason = "无法按截止完成";
          action = "调整人员或拆分并行岗位";
        } else if (hasNoPlan) {
          severity = isDeadlineWithinWeek ? "danger" : "warning";
          reason = "未排期";
          action = isDeadlineWithinWeek
            ? "今天补排负责人和时间"
            : "补齐负责人、开始和结束时间";
        } else if (!hasUpcomingTask && isDeadlineWithinWeek) {
          severity = "danger";
          reason = "临期无任务";
          action = "优先插入未来7天排期";
        } else if (!hasUpcomingTask) {
          reason = "未来7天无任务";
          action = "确认是否延后或降级处理";
        }

        return {
          req,
          schedule,
          dueDate,
          lastTaskEnd,
          taskCount: taskViews.length,
          daysUntilDue,
          severity,
          reason,
          action,
        };
      })
      .filter((item) => item.reason)
      .sort((a, b) => {
        const severityScore = { danger: 0, warning: 1 };
        const severityDiff =
          severityScore[a.severity] - severityScore[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999);
      });

    return {
      weekStart,
      weekEnd,
      upcomingTaskCount: upcomingTasks.length,
      scheduledWorkDays,
      weeklyCapacity,
      loadRate:
        weeklyCapacity > 0
          ? Math.round((scheduledWorkDays / weeklyCapacity) * 100)
          : 0,
      scheduledProducerCount,
      highRiskRequirements,
    };
  }, [productionTasks, requirements, schedules, todayDateString]);

  const delayedProductionRiskItems = useMemo(
    () =>
      productionInsights.highRiskRequirements
        .map((item) => {
          const dueTime = parseDateValue(item.dueDate);
          const todayTime = parseDateValue(todayDateString);
          const lastTaskEndTime = parseDateValue(item.lastTaskEnd);
          const deadlineDelayDays =
            dueTime !== null && todayTime !== null && dueTime < todayTime
              ? Math.ceil((todayTime - dueTime) / 86400000)
              : 0;
          const scheduleDelayDays =
            dueTime !== null &&
            lastTaskEndTime !== null &&
            lastTaskEndTime > dueTime
              ? Math.ceil((lastTaskEndTime - dueTime) / 86400000)
              : 0;
          return {
            req: item.req,
            delayedDays: Math.max(deadlineDelayDays, scheduleDelayDays),
          };
        })
        .filter((item) => item.delayedDays > 0)
        .sort((a, b) => b.delayedDays - a.delayedDays),
    [productionInsights.highRiskRequirements, todayDateString],
  );

  const activeProducers = useMemo(
    () => PRODUCERS.filter((producer) => producer.status === "在职"),
    [],
  );

  const personnelCapacityGroups = useMemo(() => {
    const weekStart = todayDateString;
    const weekEnd = addDaysToDateString(todayDateString, 6);
    const referenceDays = Array.from({ length: 14 }, (_, index) =>
      addDaysToDateString(todayDateString, index),
    );

    const producerRows = activeProducers.map((producer) => {
      const tasks = productionTasks
        .filter((task) => task.producer === producer.name)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
      const weekTasks = tasks.filter((task) =>
        rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd),
      );
      const weekWorkDays = weekTasks.reduce(
        (sum, task) => sum + (task.estimatedWorkDays || 1),
        0,
      );
      const loadRate = Math.round((weekWorkDays / 5) * 100);
      const nextAvailable =
        referenceDays.find(
          (date) =>
            !tasks.some((task) =>
              rangesOverlap(task.startDate, task.endDate, date, date),
            ),
        ) || addDaysToDateString(todayDateString, 14);

      return {
        producer,
        tasks,
        weekTasks,
        weekWorkDays,
        loadRate,
        nextAvailable,
      };
    });

    return activeProducers.reduce(
      (groups, producer) => {
        const groupRows = producerRows
          .filter((row) => row.producer.group === producer.group)
          .sort(
            (a, b) =>
              a.loadRate - b.loadRate ||
              a.producer.name.localeCompare(b.producer.name),
          );
        groups[producer.group] = groupRows;
        return groups;
      },
      {} as Record<Producer["group"], typeof producerRows>,
    );
  }, [activeProducers, productionTasks, todayDateString]);

  const productionGanttStart = useMemo(
    () => addDaysToDateString(todayDateString, -3),
    [todayDateString],
  );
  const productionGanttEnd = useMemo(
    () => addDaysToDateString(productionGanttStart, 30),
    [productionGanttStart],
  );
  const productionGanttDays = useMemo(
    () =>
      Array.from({ length: 31 }, (_, index) => {
        const dateString = addDaysToDateString(productionGanttStart, index);
        const date = new Date(`${dateString}T00:00:00`);
        const dayOfWeek = date.getDay();
        return {
          dateString,
          day: date.getDate(),
          month: date.getMonth() + 1,
          isToday: dateString === todayDateString,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        };
      }),
    [productionGanttStart, todayDateString],
  );
  const productionGanttRows = useMemo(
    () =>
      activeProducers
        .map((producer) => ({
          producer,
          tasks: productionTasks
            .filter(
              (task) =>
                task.producer === producer.name &&
                rangesOverlap(
                  task.startDate,
                  task.endDate,
                  productionGanttStart,
                  productionGanttEnd,
                ),
            )
            .sort(
              (a, b) =>
                a.startDate.localeCompare(b.startDate) ||
                a.endDate.localeCompare(b.endDate),
            ),
        }))
        .sort(
          (a, b) =>
            b.tasks.length - a.tasks.length ||
            a.producer.name.localeCompare(b.producer.name),
        ),
    [activeProducers, productionTasks, productionGanttEnd, productionGanttStart],
  );
  const productionCalendarWeeks = useMemo(
    () => getMonthWeeks(calendarYear, calendarMonth),
    [calendarMonth, calendarYear],
  );

  return {
    productionTasks,
    selectedProducers,
    setSelectedProducers,
    isProductionProducerFilterOpen,
    setIsProductionProducerFilterOpen,
    productionProducerFilterRef,
    productionView,
    setProductionView,
    showProductionRiskModal,
    setShowProductionRiskModal,
    calendarYear,
    setCalendarYear,
    calendarMonth,
    setCalendarMonth,
    handlePrevMonth,
    handleNextMonth,
    productionInsights,
    delayedProductionRiskItems,
    activeProducers,
    personnelCapacityGroups,
    productionGanttStart,
    productionGanttDays,
    productionGanttRows,
    productionCalendarWeeks,
  };
};
