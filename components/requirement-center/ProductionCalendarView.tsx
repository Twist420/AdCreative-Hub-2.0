import type React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Requirement } from "../../types";
import { DropdownCheckbox, DropdownSelectedCheck } from "./filters";
import type { Producer } from "./people";
import type { CalendarWeek } from "./dateUtils";
import { parseDateValue, rangesOverlap } from "./dateUtils";
import type { ScheduledTaskView } from "./requirementUtils";

export const ProductionCalendarView = ({
  calendarYear,
  calendarMonth,
  calendarWeeks,
  productionTasks,
  selectedProducers,
  isProducerFilterOpen,
  producerFilterRef,
  activeProducers,
  onJumpToday,
  onPrevMonth,
  onNextMonth,
  onToggleProducerFilter,
  onClearProducers,
  onToggleProducer,
  onOpenRequirement,
}: {
  calendarYear: number;
  calendarMonth: number;
  calendarWeeks: CalendarWeek[];
  productionTasks: ScheduledTaskView[];
  selectedProducers: string[];
  isProducerFilterOpen: boolean;
  producerFilterRef: React.RefObject<HTMLDivElement>;
  activeProducers: Producer[];
  onJumpToday: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleProducerFilter: () => void;
  onClearProducers: () => void;
  onToggleProducer: (producerName: string) => void;
  onOpenRequirement: (requirement: Requirement) => void;
}) => (
  <div className="rounded-2xl border border-slate-150 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onJumpToday}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
          今天
        </button>
        <button
          type="button"
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="ml-2 text-sm font-black text-slate-800">
          {calendarYear}年{calendarMonth}月
        </div>
        <div ref={producerFilterRef} className="relative ml-2">
          <button
            type="button"
            onClick={onToggleProducerFilter}
            className={`inline-flex h-8 min-w-[104px] items-center justify-between gap-2 rounded-xl border px-3 text-[10px] font-black shadow-3xs transition-all ${
              selectedProducers.length > 0
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
            }`}
          >
            <span className="truncate">
              {selectedProducers.length === 0
                ? "全部人员"
                : selectedProducers.length === 1
                  ? selectedProducers[0]
                  : `${selectedProducers.length} 人`}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                isProducerFilterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProducerFilterOpen && (
            <div className="absolute left-0 top-full z-[130] mt-2 max-h-72 w-40 overflow-y-auto rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <button
                type="button"
                onClick={onClearProducers}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                  selectedProducers.length === 0
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>全部人员</span>
                {selectedProducers.length === 0 && <DropdownSelectedCheck />}
              </button>
              <div className="my-1 h-px bg-slate-100" />
              {activeProducers.map((producer) => {
                const isSelected = selectedProducers.includes(producer.name);
                return (
                  <button
                    key={producer.name}
                    type="button"
                    onClick={() => onToggleProducer(producer.name)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <DropdownCheckbox checked={isSelected} />
                    <span className="truncate">{producer.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[10px] font-black">
        <span className="rounded-lg px-3 py-1.5 text-slate-400">日</span>
        <span className="rounded-lg px-3 py-1.5 text-slate-400">周</span>
        <span className="rounded-lg bg-white px-3 py-1.5 text-indigo-600 shadow-xs">月</span>
      </div>
    </div>

    <div className="grid grid-cols-7 border-b border-slate-100 text-[10px] font-black text-slate-500">
      {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((weekday) => (
        <div key={weekday} className="px-3 py-2">
          {weekday}
        </div>
      ))}
    </div>

    <div>
      {calendarWeeks.map((week, weekIndex) => {
        const weekStart = week.days[0].dateString;
        const weekEnd = week.days[6].dateString;
        const weekTasks = productionTasks
          .filter((task) => {
            if (selectedProducers.length > 0 && !selectedProducers.includes(task.producer)) return false;
            return rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd);
          })
          .sort((a, b) => {
            const priorityOrder = { Highest: 0, High: 1, Mid: 2, Low: 3, "": 4 };
            return (
              (priorityOrder[a.requirement.priority as keyof typeof priorityOrder] ?? 4) -
                (priorityOrder[b.requirement.priority as keyof typeof priorityOrder] ?? 4) ||
              a.startDate.localeCompare(b.startDate)
            );
          })
          .slice(0, 5);

        return (
          <div key={weekStart} className="relative grid min-h-[168px] grid-cols-7 overflow-visible border-b border-slate-100">
            {week.days.map((day) => {
              const dayTasksCount = productionTasks.filter((task) => {
                if (selectedProducers.length > 0 && !selectedProducers.includes(task.producer)) return false;
                return rangesOverlap(task.startDate, task.endDate, day.dateString, day.dateString);
              }).length;
              return (
                <div
                  key={day.dateString}
                  className={`min-h-[168px] border-r border-slate-100 p-2 ${
                    day.isCurrentMonth ? "bg-white" : "bg-slate-50/60"
                  } ${day.isWeekend ? "bg-slate-50" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-black ${
                        day.isToday
                          ? "bg-indigo-600 text-white"
                          : day.isCurrentMonth
                            ? "text-slate-700"
                            : "text-slate-300"
                      }`}
                    >
                      {day.dayNum === 1 && day.isCurrentMonth ? `${calendarMonth}月1日` : day.dayNum}
                    </span>
                    {dayTasksCount > 0 && (
                      <span className="text-[9px] font-bold text-slate-300">{dayTasksCount} 条</span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pointer-events-none absolute inset-x-0 top-9 z-10">
              {weekTasks.map((task, laneIndex) => {
                const taskStartTime = parseDateValue(task.startDate) || parseDateValue(weekStart) || 0;
                const taskEndTime = parseDateValue(task.endDate) || taskStartTime;
                const weekStartTime = parseDateValue(weekStart) || taskStartTime;
                const weekEndTime = parseDateValue(weekEnd) || taskEndTime;
                const clippedStart = Math.max(taskStartTime, weekStartTime);
                const clippedEnd = Math.min(taskEndTime, weekEndTime);
                const startIndex = Math.max(0, Math.floor((clippedStart - weekStartTime) / 86400000));
                const spanDays = Math.max(1, Math.floor((clippedEnd - clippedStart) / 86400000) + 1);
                const left = (startIndex / 7) * 100;
                const width = (spanDays / 7) * 100;
                const startsInWeek = taskStartTime >= weekStartTime;
                const endsInWeek = taskEndTime <= weekEndTime;
                const tone =
                  task.requirement.priority === "Highest"
                    ? "bg-rose-100 text-rose-700"
                    : task.status === "已完成"
                      ? "bg-slate-100 text-slate-500"
                      : task.role.includes("平面")
                        ? "bg-lime-100 text-lime-800"
                        : "bg-sky-100 text-sky-800";

                return (
                  <button
                    key={`${weekIndex}-${task.id}`}
                    type="button"
                    onClick={() => onOpenRequirement(task.requirement)}
                    className={`pointer-events-auto absolute flex h-6 items-center truncate px-2 text-left text-[10px] font-black shadow-3xs transition-all hover:z-20 hover:ring-2 hover:ring-indigo-100 ${tone} ${
                      startsInWeek ? "rounded-l-md" : "rounded-l-none"
                    } ${endsInWeek ? "rounded-r-md" : "rounded-r-none"}`}
                    style={{
                      left: `calc(${left}% + 8px)`,
                      top: `${laneIndex * 26}px`,
                      width: `calc(${width}% - 16px)`,
                    }}
                    title={`${task.displayRequirementId} / ${task.requirement.name} / ${task.producer}`}
                  >
                    {task.displayRequirementId}
                    <span className="ml-1 font-bold opacity-70">{task.producer}</span>
                    <span className="ml-1 font-bold opacity-70">{task.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
