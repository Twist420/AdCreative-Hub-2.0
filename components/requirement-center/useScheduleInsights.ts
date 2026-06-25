import { useMemo } from "react";
import { CreativeSchedule, DeliverySet, Requirement } from "../../types";
import { addDaysToDateString, parseDateValue } from "./dateUtils";
import { getScheduledTaskViews } from "./requirementUtils";
import { ScheduleDerivedRolloverStatus } from "./filters";

export type ScheduleInsight = {
  status: ScheduleDerivedRolloverStatus;
  statusTone: string;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  launched: number;
  completedNotLaunched: number;
  quickCompleting: number;
  readyRequirements: Requirement[];
  quickRequirementIds: string[];
  draftSetCount: number;
  suggestion: string;
  isInherited: boolean;
  isLegacy: boolean;
};

type UseScheduleInsightsOptions = {
  schedules: CreativeSchedule[];
  requirements: Requirement[];
  deliverySets: DeliverySet[];
  todayDateString: string;
};

export const useScheduleInsights = ({
  schedules,
  requirements,
  deliverySets,
  todayDateString,
}: UseScheduleInsightsOptions) =>
  useMemo(() => {
    const todayTime = parseDateValue(todayDateString) ?? 0;
    const quickThresholdTime =
      parseDateValue(addDaysToDateString(todayDateString, 1)) ?? todayTime;
    const insights = new Map<string, ScheduleInsight>();

    schedules.forEach((schedule) => {
      const relatedRequirements = requirements.filter(
        (req) => req.scheduleId === schedule.id,
      );
      const completedRequirements = relatedRequirements.filter(
        (req) => req.prodStatus === "Completed",
      );
      const completedNotLaunchedRequirements = completedRequirements.filter(
        (req) => req.deliveryStatus === "NotLaunched" && !req.deliverySetId,
      );
      const inProgressRequirements = relatedRequirements.filter(
        (req) => req.prodStatus === "InProgress",
      );
      const notStartedRequirements = relatedRequirements.filter(
        (req) =>
          req.prodStatus === "Unscheduled" ||
          req.prodStatus === "Scheduled" ||
          !req.prodStatus,
      );
      const launchedRequirements = relatedRequirements.filter(
        (req) => req.deliveryStatus === "Delivering",
      );
      const quickRequirementIds = relatedRequirements
        .filter((req) => req.prodStatus !== "Completed")
        .filter((req) => {
          const taskEnds = getScheduledTaskViews(req)
            .map((task) => task.endDate)
            .filter(Boolean)
            .sort();
          const dueDate =
            taskEnds.at(-1) ||
            req.endDate ||
            schedule.productionEnd ||
            schedule.submissionDeadline ||
            schedule.requirementEnd ||
            "";
          const dueTime = parseDateValue(dueDate);
          return (
            dueTime !== null &&
            dueTime >= todayTime &&
            dueTime <= quickThresholdTime
          );
        })
        .map((req) => req.id);
      const draftSetCount = deliverySets.filter(
        (set) => set.scheduleIds.includes(schedule.id) && set.status === "Draft",
      ).length;

      let status: ScheduleDerivedRolloverStatus = "进行中";
      if (schedule.rolloverStatus === "Closed") {
        status = "已关闭";
      } else if (schedule.rolloverStatus === "Deferred") {
        status = "暂缓";
      } else if (
        relatedRequirements.length > 0 &&
        completedRequirements.length === relatedRequirements.length &&
        completedNotLaunchedRequirements.length === relatedRequirements.length
      ) {
        status = "全部完成且未投放";
      } else if (
        relatedRequirements.length === 0 ||
        notStartedRequirements.length === relatedRequirements.length
      ) {
        status = "完全未开始";
      } else if (
        completedRequirements.length > 0 ||
        schedule.rolloverStatus === "PartialCompleted" ||
        schedule.inheritedToScheduleIds?.length
      ) {
        status = "部分完成";
      } else if (launchedRequirements.length > 0) {
        status = "已投放";
      }

      const statusTone =
        status === "全部完成且未投放"
          ? "bg-emerald-50 border-emerald-150 text-emerald-700"
          : status === "部分完成"
            ? "bg-amber-50 border-amber-150 text-amber-700"
            : status === "完全未开始"
              ? "bg-slate-50 border-slate-150 text-slate-600"
              : status === "已关闭"
                ? "bg-rose-50 border-rose-150 text-rose-600"
                : status === "暂缓"
                  ? "bg-violet-50 border-violet-150 text-violet-700"
                  : status === "已投放"
                    ? "bg-blue-50 border-blue-150 text-blue-700"
                    : "bg-indigo-50 border-indigo-150 text-indigo-700";

      const suggestion =
        status === "全部完成且未投放"
          ? `可生成 ${completedNotLaunchedRequirements.length} 条素材的投放 Set`
          : quickRequirementIds.length > 0
            ? `${quickRequirementIds.length} 条预计 1 天内完成，可考虑等待`
            : status === "部分完成"
              ? "需要确认关闭、暂缓或调整未完成素材周期"
              : status === "完全未开始"
                ? "可关闭、暂缓或挪入下周期"
                : status === "已关闭"
                  ? schedule.closeReason || "已关闭，默认不进入待办"
                  : status === "暂缓"
                    ? schedule.decisionNote || "暂缓推进，保留观察"
                    : "继续推进当前方向";

      insights.set(schedule.id, {
        status,
        statusTone,
        total: relatedRequirements.length,
        completed: completedRequirements.length,
        inProgress: inProgressRequirements.length,
        notStarted: notStartedRequirements.length,
        launched: launchedRequirements.length,
        completedNotLaunched: completedNotLaunchedRequirements.length,
        quickCompleting: quickRequirementIds.length,
        readyRequirements: completedNotLaunchedRequirements,
        quickRequirementIds,
        draftSetCount,
        suggestion,
        isInherited: Boolean(schedule.inheritedFromScheduleId),
        isLegacy: Boolean(
          schedule.inheritedFromScheduleId ||
            schedule.inheritedToScheduleIds?.length,
        ),
      });
    });

    return insights;
  }, [deliverySets, requirements, schedules, todayDateString]);
