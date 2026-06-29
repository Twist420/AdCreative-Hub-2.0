import { Dispatch, RefObject, SetStateAction } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DropdownCheckbox, DropdownSelectedCheck, getScheduleRolePreset, parseDateValue, rangesOverlap } from './requirementDetailUtils';

type AvailabilityModalProps = {
  showAvailabilityModal: boolean;
  todayDateString: string;
  scheduleHorizonEnd: string;
  availabilityProducerFilterRef: RefObject<HTMLDivElement>;
  availabilityProducerFilter: string[];
  setAvailabilityProducerFilter: Dispatch<SetStateAction<string[]>>;
  isAvailabilityProducerMenuOpen: boolean;
  setIsAvailabilityProducerMenuOpen: Dispatch<SetStateAction<boolean>>;
  availabilityRows: any[];
  availabilityView: 'calendar' | 'gantt';
  setAvailabilityView: Dispatch<SetStateAction<'calendar' | 'gantt'>>;
  setShowAvailabilityModal: Dispatch<SetStateAction<boolean>>;
  availabilityCalendarYear: number;
  setAvailabilityCalendarYear: Dispatch<SetStateAction<number>>;
  availabilityCalendarMonth: number;
  setAvailabilityCalendarMonth: Dispatch<SetStateAction<number>>;
  availabilityCalendarWeeks: any[];
  filteredAvailabilityTasks: any[];
  filteredAvailabilityRows: any[];
  availabilityGanttDays: any[];
  availabilityGanttStart: string;
};

export const AvailabilityModal = ({
  showAvailabilityModal,
  todayDateString,
  scheduleHorizonEnd,
  availabilityProducerFilterRef,
  availabilityProducerFilter,
  setAvailabilityProducerFilter,
  isAvailabilityProducerMenuOpen,
  setIsAvailabilityProducerMenuOpen,
  availabilityRows,
  availabilityView,
  setAvailabilityView,
  setShowAvailabilityModal,
  availabilityCalendarYear,
  setAvailabilityCalendarYear,
  availabilityCalendarMonth,
  setAvailabilityCalendarMonth,
  availabilityCalendarWeeks,
  filteredAvailabilityTasks,
  filteredAvailabilityRows,
  availabilityGanttDays,
  availabilityGanttStart,
}: AvailabilityModalProps) => {
  if (!showAvailabilityModal) return null;

  return (
        <div className="fixed inset-0 z-[320] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-xs">
          <div className="flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-base font-black text-slate-900">人员排期情况</h3>
                <p className="mt-1 text-[11px] font-bold text-slate-400">
                  查看 {todayDateString} 至 {scheduleHorizonEnd} 的人员闲忙，再决定负责人和时间。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div ref={availabilityProducerFilterRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAvailabilityProducerMenuOpen(prev => !prev)}
                    className={`inline-flex h-9 min-w-[116px] items-center justify-between gap-2 rounded-2xl border px-3 text-[11px] font-black shadow-3xs transition-all ${
                      availabilityProducerFilter.length > 0
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="truncate">
                      {availabilityProducerFilter.length === 0
                        ? '全部人员'
                        : availabilityProducerFilter.length === 1
                          ? availabilityProducerFilter[0]
                          : `${availabilityProducerFilter.length} 人`}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                        isAvailabilityProducerMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isAvailabilityProducerMenuOpen && (
                    <div className="absolute left-0 top-full z-[340] mt-2 max-h-72 w-40 overflow-y-auto rounded-3xl border border-slate-150 bg-white p-2 shadow-2xl shadow-slate-900/10">
                      <button
                        type="button"
                        onClick={() => {
                          setAvailabilityProducerFilter([]);
                          setIsAvailabilityProducerMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                          availabilityProducerFilter.length === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>全部人员</span>
                        {availabilityProducerFilter.length === 0 && <DropdownSelectedCheck />}
                      </button>
                      <div className="my-1 h-px bg-slate-100" />
                      {availabilityRows.map(person => {
                        const isSelected = availabilityProducerFilter.includes(person.name);
                        return (
                          <button
                            key={person.id}
                            type="button"
                            onClick={() => {
                              setAvailabilityProducerFilter(prev =>
                                prev.includes(person.name)
                                  ? prev.filter(name => name !== person.name)
                                  : [...prev, person.name],
                              );
                            }}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-all ${
                              isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <DropdownCheckbox checked={isSelected} />
                            <span className="truncate">{person.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {[
                  { id: 'calendar', label: '日历图' },
                  { id: 'gantt', label: '甘特图' },
                ].map(view => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setAvailabilityView(view.id as 'calendar' | 'gantt')}
                    className={`rounded-2xl px-4 py-2 text-[11px] font-black transition-all ${
                      availabilityView === view.id
                        ? 'bg-primary text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-150'
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="ml-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-slate-50/70 p-6">
              {availabilityView === 'calendar' ? (
                <div className="min-h-full rounded-2xl border border-slate-150 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          setAvailabilityCalendarYear(today.getFullYear());
                          setAvailabilityCalendarMonth(today.getMonth() + 1);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        今天
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (availabilityCalendarMonth === 1) {
                            setAvailabilityCalendarYear(prev => prev - 1);
                            setAvailabilityCalendarMonth(12);
                          } else {
                            setAvailabilityCalendarMonth(prev => prev - 1);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (availabilityCalendarMonth === 12) {
                            setAvailabilityCalendarYear(prev => prev + 1);
                            setAvailabilityCalendarMonth(1);
                          } else {
                            setAvailabilityCalendarMonth(prev => prev + 1);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="ml-2 text-sm font-black text-slate-800">
                        {availabilityCalendarYear}年{availabilityCalendarMonth}月
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[10px] font-black">
                      <span className="rounded-lg px-3 py-1.5 text-slate-400">日</span>
                      <span className="rounded-lg px-3 py-1.5 text-slate-400">周</span>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-indigo-600 shadow-xs">月</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b border-slate-100 text-[10px] font-black text-slate-500">
                    {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(weekday => (
                      <div key={weekday} className="px-3 py-2">
                        {weekday}
                      </div>
                    ))}
                  </div>

                  <div>
                    {availabilityCalendarWeeks.map(week => {
                      const weekStart = week.days[0].dateString;
                      const weekEnd = week.days[6].dateString;
                      const weekTasks = filteredAvailabilityTasks
                        .filter(task => rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd))
                        .sort((a, b) => (parseDateValue(a.startDate) || 0) - (parseDateValue(b.startDate) || 0))
                        .slice(0, 5);

                      return (
                        <div key={weekStart} className="relative grid min-h-[148px] grid-cols-7 overflow-visible border-b border-slate-100">
                          {week.days.map(day => {
                            const dayTasksCount = filteredAvailabilityTasks.filter(task =>
                              rangesOverlap(task.startDate, task.endDate, day.dateString, day.dateString),
                            ).length;
                        return (
                          <div
                            key={day.dateString}
                            className={`min-h-[148px] border-r border-slate-100 p-2 ${
                              day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60'
                            } ${day.isWeekend ? 'bg-slate-50' : ''}`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span
                                className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-black ${
                                  day.isToday
                                    ? 'bg-indigo-600 text-white'
                                    : day.isCurrentMonth
                                      ? 'text-slate-700'
                                      : 'text-slate-300'
                                }`}
                              >
                                {day.dayNum === 1 && day.isCurrentMonth ? `${availabilityCalendarMonth}月1日` : day.dayNum}
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
                                task.status === '已完成'
                                  ? 'bg-slate-100 text-slate-500'
                                  : task.role.includes('平面')
                                    ? 'bg-lime-100 text-lime-800'
                                    : 'bg-sky-100 text-sky-800';

                              return (
                                <div
                                  key={`${weekStart}-${task.id}`}
                                  className={`absolute flex h-6 items-center truncate px-2 text-left text-[10px] font-black shadow-3xs ${tone} ${
                                    startsInWeek ? 'rounded-l-md' : 'rounded-l-none'
                                  } ${endsInWeek ? 'rounded-r-md' : 'rounded-r-none'}`}
                                  style={{
                                    left: `calc(${left}% + 8px)`,
                                    top: `${laneIndex * 26}px`,
                                    width: `calc(${width}% - 16px)`,
                                  }}
                                  title={`${task.displayRequirementId || task.requirementId} / ${task.requirementName} / ${task.producer}`}
                                >
                                  {task.displayRequirementId || task.requirementId}
                                  <span className="ml-1 font-bold opacity-70">{task.producer}</span>
                                  <span className="ml-1 font-bold opacity-70">{task.role}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="min-h-full overflow-auto rounded-2xl border border-slate-150 bg-white">
                  <div className="flex min-w-max border-b border-slate-100 bg-slate-50/80">
                    <div className="grid w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-black text-slate-400">
                      <div className="flex h-12 items-center border-r border-slate-100 px-3">人员</div>
                      <div className="flex h-12 items-center border-r border-slate-100 px-3">岗位</div>
                      <div className="flex h-12 items-center border-r border-slate-100 px-3">需求编号</div>
                      <div className="flex h-12 items-center px-3">状态</div>
                    </div>
                    <div className="shrink-0" style={{ width: `${availabilityGanttDays.length * 52}px` }}>
                      <div
                        className="grid h-12"
                        style={{ gridTemplateColumns: `repeat(${availabilityGanttDays.length}, 52px)` }}
                      >
                        {availabilityGanttDays.map(day => (
                          <div
                            key={day.dateString}
                            className={`relative flex items-center justify-center border-r border-slate-150 text-[10px] font-black ${
                              day.isToday
                                ? 'text-indigo-600'
                                : day.isWeekend
                                  ? 'bg-slate-100 text-slate-350'
                                  : 'text-slate-400'
                            }`}
                          >
                            {day.day === 1 ? `${day.month}/1` : day.day}
                            {day.isToday && <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-max">
                    {filteredAvailabilityRows.map(person => (
                      <div key={person.id} className="border-b border-slate-100 last:border-b-0 bg-white">
                        <div className="flex h-10 items-center gap-2 border-b border-slate-100 bg-white px-3">
                          <ChevronDown className="h-3.5 w-3.5 text-slate-350" />
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white">
                            {person.name.slice(0, 1)}
                          </span>
                          <span className="text-xs font-black text-slate-800">{person.name}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-400">
                            {person.group}
                          </span>
                          <span className="ml-auto text-[9px] font-black text-slate-350">{person.tasks.length} 项</span>
                        </div>

                        {person.tasks.length === 0 ? (
                          <div className="flex">
                            <div className="grid h-11 w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-bold text-slate-350">
                              <div className="flex items-center border-r border-slate-100 px-3">暂无排期</div>
                              <div className="border-r border-slate-100" />
                              <div className="border-r border-slate-100" />
                              <div />
                            </div>
                            <div className="shrink-0" style={{ width: `${availabilityGanttDays.length * 52}px` }}>
                              <div
                                className="grid h-11"
                                style={{ gridTemplateColumns: `repeat(${availabilityGanttDays.length}, 52px)` }}
                              >
                                {availabilityGanttDays.map(day => (
                                  <div
                                    key={`${person.id}-empty-${day.dateString}`}
                                    className={`border-r border-slate-100 ${
                                      day.isWeekend
                                        ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]'
                                        : ''
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          person.tasks.map((task, index) => {
                            const dayWidth = 52;
                            const ganttStartTime = parseDateValue(availabilityGanttStart) || 0;
                            const taskStartTime = parseDateValue(task.startDate) || ganttStartTime;
                            const taskEndTime = parseDateValue(task.endDate) || taskStartTime;
                            const startIndex = Math.max(0, Math.floor((taskStartTime - ganttStartTime) / 86400000));
                            const endIndex = Math.min(
                              availabilityGanttDays.length - 1,
                              Math.floor((taskEndTime - ganttStartTime) / 86400000),
                            );
                            const barLeft = startIndex * dayWidth + 8;
                            const barWidth = Math.max((endIndex - startIndex + 1) * dayWidth - 16, 92);
                            const workDays = Math.max(1, Math.round((taskEndTime - taskStartTime) / 86400000) + 1);
                            const rolePreset = getScheduleRolePreset(task.role);
                            const barClass =
                              task.status === '已完成'
                                ? 'bg-slate-500 text-white'
                                : task.status === '制作中'
                                  ? 'bg-sky-400 text-white'
                                  : 'bg-sky-200 text-sky-900';
                            return (
                              <div key={task.id} className="flex">
                                <div className="grid h-10 w-[360px] shrink-0 grid-cols-[132px_72px_86px_70px] border-r border-slate-150 text-[10px] font-bold text-slate-500">
                                  <div className="flex min-w-0 items-center border-r border-slate-100 px-3">
                                    {index === 0 ? (
                                      <span className="truncate text-slate-700">{person.name}</span>
                                    ) : (
                                      <span className="text-slate-250">同人员</span>
                                    )}
                                  </div>
                                  <div className="flex items-center border-r border-slate-100 px-3">
                                    <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black ${rolePreset.className}`}>
                                      {rolePreset.role}
                                    </span>
                                  </div>
                                  <div className="flex items-center border-r border-slate-100 px-3 font-mono text-indigo-600">
                                    {task.displayRequirementId || task.requirementId}
                                  </div>
                                  <div className="flex items-center px-3">
                                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">
                                      {task.status}
                                    </span>
                                  </div>
                                </div>

                                <div className="shrink-0" style={{ width: `${availabilityGanttDays.length * 52}px` }}>
                                  <div
                                    className="relative grid h-10"
                                    style={{ gridTemplateColumns: `repeat(${availabilityGanttDays.length}, 52px)` }}
                                  >
                                    {availabilityGanttDays.map(day => (
                                      <div
                                        key={`${task.id}-${day.dateString}`}
                                        className={`border-r border-slate-100 ${
                                          day.isWeekend
                                            ? 'bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_4px,#eef2f7_4px,#eef2f7_6px)]'
                                            : ''
                                        }`}
                                      />
                                    ))}
                                    {availabilityGanttDays.find(day => day.isToday) && (
                                      <div
                                        className="pointer-events-none absolute top-0 h-full w-px bg-indigo-500/80"
                                        style={{
                                          left: `${availabilityGanttDays.findIndex(day => day.isToday) * dayWidth + dayWidth / 2}px`,
                                        }}
                                      />
                                    )}
                                    <div
                                      className={`absolute top-1.5 flex h-7 items-center justify-between gap-2 rounded-md px-2 text-[9px] font-black shadow-sm ${barClass}`}
                                      style={{ left: `${barLeft}px`, width: `${barWidth}px` }}
                                      title={`${task.requirementName} / ${task.startDate} ~ ${task.endDate}`}
                                    >
                                      <span className="truncate">{task.requirementName}</span>
                                      <span className="shrink-0">{workDays} 工作日</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  );
};
