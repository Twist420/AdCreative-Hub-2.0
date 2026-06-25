import { ChevronDown } from "lucide-react";
import type { Requirement } from "../../types";
import type { Producer } from "./people";
import { parseDateValue } from "./dateUtils";
import type { ScheduledTaskView } from "./requirementUtils";

type GanttDay = {
  dateString: string;
  day: number;
  month: number;
  isToday: boolean;
  isWeekend: boolean;
};

type GanttRow = {
  producer: Producer;
  tasks: ScheduledTaskView[];
};

export const ProductionGanttView = ({
  ganttStart,
  days,
  rows,
  selectedProducers,
  onSelectProducer,
  onOpenRequirement,
}: {
  ganttStart: string;
  days: GanttDay[];
  rows: GanttRow[];
  selectedProducers: string[];
  onSelectProducer: (producerName: string) => void;
  onOpenRequirement: (requirement: Requirement) => void;
}) => (
  <div className="overflow-auto rounded-2xl border border-slate-150 bg-white">
    <div className="flex min-w-max border-b border-slate-100 bg-slate-50/80">
      <div className="grid w-[520px] shrink-0 grid-cols-[40px_220px_88px_80px_92px] border-r border-slate-150 text-[10px] font-black text-slate-400">
        <div className="flex h-12 items-center justify-center border-r border-slate-100">#</div>
        <div className="flex h-12 items-center border-r border-slate-100 px-3">需求方向 / 名称</div>
        <div className="flex h-12 items-center border-r border-slate-100 px-3">需求编号</div>
        <div className="flex h-12 items-center border-r border-slate-100 px-3">制作类型</div>
        <div className="flex h-12 items-center px-3">优先级</div>
      </div>
      <div className="shrink-0" style={{ width: `${days.length * 52}px` }}>
        <div
          className="grid h-12"
          style={{ gridTemplateColumns: `repeat(${days.length}, 52px)` }}
        >
          {days.map((day) => (
            <div
              key={day.dateString}
              className={`relative flex items-center justify-center border-r border-slate-150 text-[10px] font-black ${
                day.isToday
                  ? "text-indigo-600"
                  : day.isWeekend
                    ? "bg-slate-100 text-slate-350"
                    : "text-slate-400"
              }`}
            >
              {day.day === 1 ? `${day.month}/1` : day.day}
              {day.isToday && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="max-h-[560px] min-w-max">
      {rows
        .filter(({ producer }) => selectedProducers.length === 0 || selectedProducers.includes(producer.name))
        .map(({ producer, tasks }) => {
          const visibleTasks = tasks.length > 0 ? tasks : [];
          return (
            <div
              key={producer.name}
              className={`border-b border-slate-100 last:border-b-0 ${
                selectedProducers.includes(producer.name) ? "bg-indigo-50/40" : "bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectProducer(producer.name)}
                className="flex h-10 w-full items-center gap-2 border-b border-slate-100 bg-white px-3 text-left transition-all hover:bg-slate-50"
              >
                <ChevronDown className="h-3.5 w-3.5 text-slate-350" />
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white">
                  {producer.name.slice(0, 1)}
                </span>
                <span className="text-xs font-black text-slate-800">{producer.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400">
                  {producer.group}
                </span>
                <span className="ml-auto text-[9px] font-black text-slate-350">
                  {visibleTasks.length} 项
                </span>
              </button>

              {visibleTasks.length === 0 ? (
                <div className="flex">
                  <div className="grid h-11 w-[520px] shrink-0 grid-cols-[40px_220px_88px_80px_92px] border-r border-slate-150 text-[10px] font-bold text-slate-350">
                    <div className="border-r border-slate-100" />
                    <div className="flex items-center border-r border-slate-100 px-3">暂无排期</div>
                    <div className="border-r border-slate-100" />
                    <div className="border-r border-slate-100" />
                    <div />
                  </div>
                  <div className="shrink-0" style={{ width: `${days.length * 52}px` }}>
                    <div
                      className="grid h-11"
                      style={{ gridTemplateColumns: `repeat(${days.length}, 52px)` }}
                    >
                      {days.map((day) => (
                        <div
                          key={`${producer.name}-empty-${day.dateString}`}
                          className={`border-r border-slate-100 ${
                            day.isWeekend
                              ? "bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]"
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                visibleTasks.map((task, index) => {
                  const dayWidth = 52;
                  const ganttStartTime = parseDateValue(ganttStart) || 0;
                  const taskStartTime = parseDateValue(task.startDate) || ganttStartTime;
                  const taskEndTime = parseDateValue(task.endDate) || taskStartTime;
                  const startIndex = Math.max(
                    0,
                    Math.floor((taskStartTime - ganttStartTime) / 86400000),
                  );
                  const endIndex = Math.min(
                    days.length - 1,
                    Math.floor((taskEndTime - ganttStartTime) / 86400000),
                  );
                  const barLeft = startIndex * dayWidth + 8;
                  const barWidth = Math.max((endIndex - startIndex + 1) * dayWidth - 16, 92);
                  const workDays = Math.max(
                    1,
                    Math.round((taskEndTime - taskStartTime) / 86400000) + 1,
                  );
                  const priorityClass =
                    task.requirement.priority === "Highest"
                      ? "bg-rose-500 text-white"
                      : task.requirement.priority === "High"
                        ? "bg-orange-400 text-white"
                        : task.requirement.priority === "Low"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-indigo-100 text-indigo-700";
                  const barClass =
                    task.status === "已完成"
                      ? "bg-slate-500 text-white"
                      : task.status === "制作中"
                        ? "bg-sky-400 text-white"
                        : "bg-sky-200 text-sky-900";

                  return (
                    <div key={task.id} className="flex">
                      <div className="grid h-10 w-[520px] shrink-0 grid-cols-[40px_220px_88px_80px_92px] border-r border-slate-150 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center justify-center border-r border-slate-100 text-slate-350">{index + 1}</div>
                        <div className="flex min-w-0 items-center border-r border-slate-100 px-3">
                          <span className="truncate" title={task.requirement.name}>{task.requirement.name}</span>
                        </div>
                        <div className="flex items-center border-r border-slate-100 px-3 font-mono text-indigo-600">{task.displayRequirementId}</div>
                        <div className="flex items-center border-r border-slate-100 px-3">
                          <span className="rounded-lg bg-cyan-100 px-2 py-0.5 text-[9px] font-black text-cyan-700">
                            {task.role}
                          </span>
                        </div>
                        <div className="flex items-center px-3">
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black ${priorityClass}`}>
                            {task.requirement.priority === "Highest"
                              ? "最高"
                              : task.requirement.priority === "High"
                                ? "高"
                                : task.requirement.priority === "Low"
                                  ? "低"
                                  : "中"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0" style={{ width: `${days.length * 52}px` }}>
                        <div
                          className="relative grid h-10"
                          style={{ gridTemplateColumns: `repeat(${days.length}, 52px)` }}
                        >
                          {days.map((day) => (
                            <div
                              key={`${task.id}-${day.dateString}`}
                              className={`border-r border-slate-100 ${
                                day.isWeekend
                                  ? "bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]"
                                  : ""
                              }`}
                            />
                          ))}
                          {days.find((day) => day.isToday) && (
                            <div
                              className="pointer-events-none absolute top-0 h-full w-px bg-indigo-500/80"
                              style={{ left: `${days.findIndex((day) => day.isToday) * dayWidth + dayWidth / 2}px` }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenRequirement(task.requirement)}
                            className={`absolute top-1.5 flex h-7 items-center justify-between gap-2 rounded-md px-2 text-[9px] font-black shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${barClass}`}
                            style={{ left: `${barLeft}px`, width: `${barWidth}px` }}
                            title={`${task.requirement.name} / ${task.startDate} ~ ${task.endDate}`}
                          >
                            <span className="truncate">{task.requirement.name}</span>
                            <span className="shrink-0">{workDays} 工作日</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
    </div>
  </div>
);
