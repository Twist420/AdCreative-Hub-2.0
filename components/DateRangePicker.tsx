import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DateRangePickerProps {
  label?: string;
  start: string;
  end: string;
  onChange: (range: { start: string; end: string }) => void;
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
  compact?: boolean;
  placeholder?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const startOfWeek = (date: Date) => addDays(date, -date.getDay());

const monthTitle = (date: Date) =>
  date.toLocaleString("en-US", { month: "short", year: "numeric" });

const getMonthCells = (monthDate: Date) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = startOfWeek(firstDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      value: toDateString(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
};

const getPresetRange = (id: string) => {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (id) {
    case "today":
      return { start: toDateString(end), end: toDateString(end) };
    case "yesterday": {
      const day = addDays(end, -1);
      return { start: toDateString(day), end: toDateString(day) };
    }
    case "this-week":
      return { start: toDateString(startOfWeek(end)), end: toDateString(end) };
    case "last-week": {
      const lastWeekEnd = addDays(startOfWeek(end), -1);
      const lastWeekStart = addDays(lastWeekEnd, -6);
      return { start: toDateString(lastWeekStart), end: toDateString(lastWeekEnd) };
    }
    case "this-month":
      return {
        start: toDateString(new Date(end.getFullYear(), end.getMonth(), 1)),
        end: toDateString(end),
      };
    case "last-month": {
      const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      const finish = new Date(end.getFullYear(), end.getMonth(), 0);
      return { start: toDateString(start), end: toDateString(finish) };
    }
    case "last-7":
      return { start: toDateString(addDays(end, -6)), end: toDateString(end) };
    case "last-30":
      return { start: toDateString(addDays(end, -29)), end: toDateString(end) };
    default:
      return { start: "", end: "" };
  }
};

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this-week", label: "This week" },
  { id: "last-week", label: "Last week" },
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "last-7", label: "Last 7 days" },
  { id: "last-30", label: "Last 30 days" },
];

const isBetween = (value: string, start: string, end: string) =>
  Boolean(start && end && value >= start && value <= end);

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  start,
  end,
  onChange,
  className = "",
  buttonClassName = "",
  align = "left",
  compact = false,
  placeholder = "选择时间范围",
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [viewMonth, setViewMonth] = useState(() => parseDate(start) || new Date());
  const popoverWidth = compact
    ? "w-[min(650px,calc(100vw-32px))]"
    : "w-[min(820px,calc(100vw-32px))]";
  const sideColumn = compact ? "md:grid-cols-[136px_1fr]" : "md:grid-cols-[180px_1fr]";
  const panelMaxHeight = compact ? "max-h-[500px]" : "max-h-[620px]";
  const monthHeaderHeight = compact ? "h-11" : "h-14";
  const dayCellHeight = compact ? "h-7 text-xs" : "h-9 text-sm";

  useEffect(() => {
    setDraftStart(start);
    setDraftEnd(end);
  }, [start, end]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const summary = useMemo(() => {
    if (!start && !end) return placeholder;
    return `${start || "不限"} ~ ${end || "不限"}`;
  }, [end, placeholder, start]);

  const rangeLabel = useMemo(() => {
    if (!draftStart && !draftEnd) return "Select date range";
    return `${draftStart || "不限"} - ${draftEnd || "不限"}`;
  }, [draftEnd, draftStart]);

  const months = useMemo(
    () => [viewMonth, addMonths(viewMonth, 1)],
    [viewMonth],
  );

  const handleDayClick = (value: string) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(value);
      setDraftEnd("");
      onChange({ start: value, end: "" });
      return;
    }

    const nextStart = value < draftStart ? value : draftStart;
    const nextEnd = value < draftStart ? draftStart : value;
    setDraftStart(nextStart);
    setDraftEnd(nextEnd);
    onChange({ start: nextStart, end: nextEnd });
  };

  const applyPreset = (id: string) => {
    const range = getPresetRange(id);
    setDraftStart(range.start);
    setDraftEnd(range.end);
    setViewMonth(parseDate(range.start) || new Date());
    onChange(range);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex w-full min-w-0 items-center gap-2 rounded-xl border px-3 text-left font-black shadow-3xs transition-all ${
          compact ? "h-9 text-[10px]" : "h-11 text-xs"
        } ${
          start || end
            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
            : "border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
        } ${buttonClassName}`}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        {label && (
          <span className="shrink-0 text-[10px] font-black text-slate-400">
            {label}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate whitespace-nowrap text-slate-700">
          {summary}
        </span>
      </button>

      {open && (
        <div
          className={`absolute top-full z-[120] mt-2 ${popoverWidth} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className={`flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-100 ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
            <div className="flex min-w-0 items-center gap-3">
              <span className={`${compact ? "text-[10px]" : "text-xs"} font-black uppercase tracking-wide text-slate-400`}>
                UTC
              </span>
              <span className={`${compact ? "text-xs" : "text-sm"} truncate font-black text-slate-900`}>
                {rangeLabel}
              </span>
            </div>
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
          </div>

          <div className={`grid ${panelMaxHeight} grid-cols-1 overflow-y-auto ${sideColumn}`}>
            <div className={`${compact ? "space-y-1.5 p-2" : "space-y-2 p-3"} border-b border-slate-100 bg-white md:border-b-0 md:border-r`}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`${compact ? "h-7 rounded-lg text-[10px]" : "h-9 rounded-xl text-xs"} w-full bg-slate-100 px-3 text-center font-bold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {months.map((month, monthIndex) => (
                  <div
                    key={`${month.getFullYear()}-${month.getMonth()}`}
                    className={monthIndex === 0 ? "border-b border-slate-100 md:border-b-0 md:border-r" : ""}
                  >
                    <div className={`flex ${monthHeaderHeight} items-center justify-between border-b border-slate-100 ${compact ? "px-3" : "px-5"}`}>
                      {monthIndex === 0 ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewMonth(addMonths(viewMonth, -12))}
                            className={`${compact ? "p-1" : "p-1.5"} rounded-lg text-slate-500 hover:bg-slate-100`}
                          >
                            <ChevronsLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                            className={`${compact ? "p-1" : "p-1.5"} rounded-lg text-slate-500 hover:bg-slate-100`}
                          >
                            <ChevronLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                          </button>
                        </div>
                      ) : (
                        <div />
                      )}

                      <span className={`${compact ? "text-sm" : "text-base"} font-black text-slate-900`}>
                        {monthTitle(month)}
                      </span>

                      {monthIndex === 1 ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                            className={`${compact ? "p-1" : "p-1.5"} rounded-lg text-slate-500 hover:bg-slate-100`}
                          >
                            <ChevronRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMonth(addMonths(viewMonth, 12))}
                            className={`${compact ? "p-1" : "p-1.5"} rounded-lg text-slate-500 hover:bg-slate-100`}
                          >
                            <ChevronsRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                          </button>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>

                    <div className={`grid grid-cols-7 gap-y-1 text-center ${compact ? "px-3 pt-3" : "px-4 pt-4"}`}>
                      {WEEKDAYS.map((day) => (
                        <div key={day} className={`${compact ? "pb-1.5 text-[10px]" : "pb-2 text-[11px]"} font-bold text-slate-500`}>
                          {day}
                        </div>
                      ))}
                      {getMonthCells(month).map((cell) => {
                        const isBoundary = cell.value === draftStart || cell.value === draftEnd;
                        const isSelectedRange = isBetween(cell.value, draftStart, draftEnd);
                        return (
                          <button
                            key={cell.value}
                            type="button"
                            onClick={() => handleDayClick(cell.value)}
                            className={`${dayCellHeight} font-bold transition-all ${
                              isBoundary
                                ? "rounded-full bg-slate-950 text-white shadow-sm"
                                : isSelectedRange
                                  ? "bg-indigo-50 text-indigo-700"
                                  : cell.inMonth
                                    ? "text-slate-800 hover:rounded-full hover:bg-slate-100"
                                    : "text-slate-300 hover:rounded-full hover:bg-slate-50"
                            }`}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`flex items-center justify-end gap-2 border-t border-slate-100 ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
                <button
                  type="button"
                  onClick={() => {
                    setDraftStart("");
                    setDraftEnd("");
                    onChange({ start: "", end: "" });
                  }}
                  className={`${compact ? "h-8 rounded-lg px-3 text-[10px]" : "h-9 rounded-xl px-4 text-xs"} border border-slate-150 bg-white font-black text-slate-500 transition-all hover:border-rose-150 hover:bg-rose-50 hover:text-rose-600`}
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`${compact ? "h-8 rounded-lg px-4 text-[10px]" : "h-9 rounded-xl px-5 text-xs"} bg-slate-950 font-black text-white shadow-sm transition-all hover:bg-slate-800`}
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
