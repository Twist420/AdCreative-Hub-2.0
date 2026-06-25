import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CalendarWeek } from "./dateUtils";
import { getDateRangeDays, parseDateValue } from "./dateUtils";

export const AddWeekModal = ({
  todayDateString,
  calendarYear,
  calendarMonth,
  calendarWeeks,
  newWeekStart,
  newWeekEnd,
  newWeekRange,
  onClose,
  onJumpToday,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  onConfirm,
}: {
  todayDateString: string;
  calendarYear: number;
  calendarMonth: number;
  calendarWeeks: CalendarWeek[];
  newWeekStart: string;
  newWeekEnd: string;
  newWeekRange: string;
  onClose: () => void;
  onJumpToday: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (dateString: string) => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden flex flex-col p-6 gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">创建排期周期</h3>
          <p className="text-[11px] font-bold text-slate-400 mt-1">
            点击开始日期，再点击结束日期。
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-[11px] font-black text-slate-500">今天</span>
          <span className="font-mono text-xs font-black text-indigo-700">
            {todayDateString}
          </span>
        </div>
        <button
          onClick={onJumpToday}
          className="px-2.5 py-1 rounded-lg bg-white text-[10px] font-black text-indigo-600 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
        >
          回到今天
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onPrevMonth}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-black text-slate-800">
            {calendarYear} 年 {calendarMonth} 月
          </div>
          <button
            onClick={onNextMonth}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-1">
          {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarWeeks.flatMap((week) =>
            week.days.map((day) => {
              const dateString = day.dateString;
              const dayTime = parseDateValue(dateString) ?? 0;
              const startTime = parseDateValue(newWeekStart);
              const endTime = parseDateValue(newWeekEnd);
              const isStart = dateString === newWeekStart;
              const isEnd = dateString === newWeekEnd;
              const isInRange =
                startTime !== null &&
                endTime !== null &&
                dayTime >= startTime &&
                dayTime <= endTime;
              const isSelected = isStart || isEnd;

              return (
                <button
                  key={dateString}
                  onClick={() => onSelectDay(dateString)}
                  title={day.isToday ? `今天 ${dateString}` : dateString}
                  className={`relative h-9 rounded-xl text-[11px] font-black transition-all border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15"
                      : isInRange
                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                        : day.isToday
                          ? "bg-white text-indigo-700 border-indigo-300 ring-2 ring-indigo-100"
                          : day.isCurrentMonth
                            ? "bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                            : "bg-transparent text-slate-300 border-transparent hover:bg-white/70"
                  }`}
                >
                  {day.dayNum}
                  {day.isToday && !isSelected && (
                    <span className="absolute left-1/2 bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            已选时间范围
          </div>
          <div className="text-xs font-black text-slate-800 mt-1 font-mono">
            {newWeekRange || "请选择开始与结束日期"}
          </div>
        </div>
        {newWeekStart && newWeekEnd && (
          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-black shrink-0">
            {getDateRangeDays(newWeekStart, newWeekEnd)} 天
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          disabled={!newWeekStart || !newWeekEnd}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          确认创建
        </button>
      </div>
    </div>
  </div>
);
